import SwiftUI
import UIKit

/// Pestaña "Mensajes": agrupa Correo y WhatsApp en dos sub-pestañas.
struct MessagesHubView: View {
    @EnvironmentObject var store: AssistantStore
    @State private var segment = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("", selection: $segment) {
                    Text("Correo").tag(0)
                    Text("WhatsApp").tag(1)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                .padding(.top, 8)

                if segment == 0 { MailInbox() } else { WhatsAppList() }
            }
            .navigationTitle("Mensajes")
            .toolbar {
                if store.mailBusy || store.waBusy {
                    ProgressView()
                } else {
                    Button {
                        Task { segment == 0 ? await store.loadInbox() : await store.loadWhatsApp() }
                    } label: { Image(systemName: "arrow.clockwise") }
                }
            }
        }
    }
}

// MARK: - WhatsApp

struct WhatsAppList: View {
    @EnvironmentObject var store: AssistantStore

    var body: some View {
        Group {
            if !store.nexusConnected {
                ContentUnavailableView("Conecta con Nexus",
                    systemImage: "link",
                    description: Text("Inicia sesión en Nexus (Ajustes) para ver tu WhatsApp aquí."))
            } else {
                List {
                    if let s = store.waStatus {
                        Text(s).font(.caption).foregroundStyle(.secondary)
                    }
                    ForEach(store.waChats) { chat in
                        NavigationLink { WhatsAppChatView(chat: chat) } label: { WhatsAppRow(chat: chat) }
                    }
                }
                .refreshable { await store.loadWhatsApp() }
            }
        }
        .task { if store.nexusConnected && store.waChats.isEmpty { await store.loadWhatsApp() } }
    }
}

struct WhatsAppRow: View {
    let chat: WhatsAppChat
    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack {
                Label(chat.name, systemImage: chat.isGroup ? "person.3.fill" : "person.crop.circle.fill")
                    .font(.subheadline.bold()).lineLimit(1)
                Spacer()
                Text(chat.lastDate, format: .dateTime.day().month().hour().minute())
                    .font(.caption2).foregroundStyle(.secondary)
            }
            Text(chat.lastText).font(.caption).foregroundStyle(.secondary).lineLimit(2)
        }
        .padding(.vertical, 2)
    }
}

struct WhatsAppChatView: View {
    @EnvironmentObject var store: AssistantStore
    let chat: WhatsAppChat

    @State private var messages: [WhatsAppMessage] = []
    @State private var summary: String?
    @State private var instructions = ""
    @State private var draft = ""
    @State private var showCompose = false
    @State private var loading = true
    @State private var copied = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                if loading {
                    HStack { ProgressView(); Text("Cargando conversación…").font(.caption).foregroundStyle(.secondary) }
                }

                if let s = summary {
                    VStack(alignment: .leading, spacing: 4) {
                        Label("Resumen", systemImage: "sparkles").font(.caption.bold()).foregroundStyle(.indigo)
                        Text(s).font(.callout)
                    }
                    .padding(10)
                    .background(Color.indigo.opacity(0.08), in: RoundedRectangle(cornerRadius: 10))
                }

                ForEach(messages) { m in
                    HStack {
                        if m.fromMe { Spacer(minLength: 36) }
                        Text(m.text)
                            .font(.callout)
                            .padding(8)
                            .background(m.fromMe ? Color.green.opacity(0.18) : Color(.secondarySystemBackground),
                                        in: RoundedRectangle(cornerRadius: 12))
                        if !m.fromMe { Spacer(minLength: 36) }
                    }
                }

                Divider()
                composeArea
            }
            .padding()
        }
        .navigationTitle(chat.name)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            messages = await store.whatsappConversation(for: chat)
            loading = false
            summary = await store.summarizeWhatsApp(chat: chat, messages: messages)
        }
    }

    private var composeArea: some View {
        VStack(alignment: .leading, spacing: 10) {
            if showCompose {
                TextField("¿Algo concreto que deba decir? (opcional)", text: $instructions, axis: .vertical)
                    .textFieldStyle(.roundedBorder).lineLimit(1...3)
                Button {
                    Task { draft = await store.draftWhatsAppReply(chat: chat, messages: messages, instructions: instructions.isEmpty ? nil : instructions) ?? draft }
                } label: { Label("Regenerar con mi estilo", systemImage: "arrow.triangle.2.circlepath").font(.caption) }

                if store.waBusy && draft.isEmpty {
                    HStack { ProgressView(); Text("Redactando como tú…").font(.caption).foregroundStyle(.secondary) }
                }
                TextEditor(text: $draft)
                    .frame(minHeight: 140)
                    .padding(6)
                    .overlay(RoundedRectangle(cornerRadius: 8).stroke(.quaternary))

                Button {
                    UIPasteboard.general.string = draft
                    copied = true
                } label: {
                    Label(copied ? "¡Copiado!" : "Copiar para pegar en WhatsApp", systemImage: "doc.on.doc")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty)
                Text("Tú lo envías desde WhatsApp — el asistente solo lee y redacta.")
                    .font(.caption2).foregroundStyle(.secondary)
            } else {
                Button {
                    showCompose = true
                    Task { draft = await store.draftWhatsAppReply(chat: chat, messages: messages, instructions: nil) ?? "" }
                } label: {
                    Label("Redactar respuesta como yo", systemImage: "pencil.and.outline")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .disabled(loading)
            }
        }
    }
}
