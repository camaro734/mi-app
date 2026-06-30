import SwiftUI

/// Bandeja de correo (vista interna, sin barra de navegación propia: la pone el
/// contenedor "Mensajes"). Lista de correos con resumen de IA; al abrir uno se
/// genera una respuesta con tu estilo y se envía SOLO tras confirmarla.
struct MailInbox: View {
    @EnvironmentObject var store: AssistantStore

    var body: some View {
        Group {
            if !store.mailConnected {
                ContentUnavailableView("Conecta tu correo",
                    systemImage: "envelope.badge",
                    description: Text("Añade tu cuenta de correo en Ajustes para leer y responder desde Atlas."))
            } else {
                List {
                    if let s = store.mailStatus {
                        Text(s).font(.caption).foregroundStyle(.secondary)
                    }
                    if store.emails.isEmpty && !store.mailBusy {
                        ContentUnavailableView("Bandeja vacía",
                            systemImage: "tray",
                            description: Text("Desliza hacia abajo para actualizar."))
                    }
                    ForEach(store.emails) { email in
                        NavigationLink { MailDetailView(email: email) } label: { MailRow(email: email) }
                    }
                }
                .refreshable { await store.loadInbox() }
            }
        }
        .task { if store.mailConnected && store.emails.isEmpty { await store.loadInbox() } }
    }
}

struct MailRow: View {
    let email: EmailMessage
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack {
                Text(email.fromName).font(.subheadline.bold()).lineLimit(1)
                Spacer()
                Text(email.dateText).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
            }
            Text(email.subject).font(.subheadline).lineLimit(1)
            if let s = email.summary {
                Text(s).font(.caption).foregroundStyle(.secondary).lineLimit(2)
            } else {
                Label("Resumiendo…", systemImage: "sparkles")
                    .font(.caption2).foregroundStyle(.tertiary)
            }
        }
        .padding(.vertical, 2)
    }
}

struct MailDetailView: View {
    @EnvironmentObject var store: AssistantStore
    let email: EmailMessage

    @State private var instructions = ""
    @State private var draft = ""
    @State private var showCompose = false
    @State private var confirmSend = false
    @State private var sent = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text(email.subject).font(.title3.bold())
                Text("De: \(email.from)").font(.caption).foregroundStyle(.secondary)
                if !email.dateText.isEmpty {
                    Text(email.dateText).font(.caption2).foregroundStyle(.secondary)
                }

                if let s = email.summary {
                    VStack(alignment: .leading, spacing: 4) {
                        Label("Resumen", systemImage: "sparkles").font(.caption.bold()).foregroundStyle(.indigo)
                        Text(s).font(.callout)
                    }
                    .padding(10)
                    .background(Color.indigo.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
                }

                Divider()
                Text(email.body.isEmpty ? "(Sin texto)" : email.body)
                    .font(.callout).textSelection(.enabled)
                Divider()

                if sent {
                    Label("Respuesta enviada", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(.green).font(.headline)
                } else if showCompose {
                    composeArea
                } else {
                    Button {
                        showCompose = true
                        Task { draft = await store.draftReply(for: email, instructions: nil) ?? "" }
                    } label: {
                        Label("Responder como yo", systemImage: "arrowshape.turn.up.left.fill")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
            }
            .padding()
        }
        .navigationTitle("Correo")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var composeArea: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("¿Algo concreto que deba decir? (opcional)")
                .font(.caption).foregroundStyle(.secondary)
            TextField("p. ej. acepta y propón el martes a las 10", text: $instructions, axis: .vertical)
                .textFieldStyle(.roundedBorder).lineLimit(1...3)

            Button {
                Task { draft = await store.draftReply(for: email, instructions: instructions.isEmpty ? nil : instructions) ?? draft }
            } label: {
                Label("Regenerar con el estilo", systemImage: "arrow.triangle.2.circlepath").font(.caption)
            }

            if store.mailBusy && draft.isEmpty {
                HStack { ProgressView(); Text("Redactando como tú…").font(.caption).foregroundStyle(.secondary) }
            }

            Text("Borrador — revísalo y edítalo antes de enviar")
                .font(.caption).foregroundStyle(.secondary)
            TextEditor(text: $draft)
                .frame(minHeight: 200)
                .padding(6)
                .overlay(RoundedRectangle(cornerRadius: 8).stroke(.quaternary))

            Button { confirmSend = true } label: {
                Label("Enviar a \(email.fromAddress)", systemImage: "paperplane.fill")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty || store.mailBusy)
        }
        .confirmationDialog("¿Enviar esta respuesta?", isPresented: $confirmSend, titleVisibility: .visible) {
            Button("Enviar a \(email.fromAddress)") {
                Task { sent = await store.sendReply(to: email, body: draft) }
            }
            Button("Cancelar", role: .cancel) {}
        } message: {
            Text("Se enviará desde tu cuenta de correo en tu nombre. Revisa el texto antes de confirmar.")
        }
    }
}
