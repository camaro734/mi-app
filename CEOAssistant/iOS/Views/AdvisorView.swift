import SwiftUI

/// Chat de asesoría de CEO con Atlas. Entrada por texto o dictado de voz.
struct AdvisorView: View {
    @EnvironmentObject var store: AssistantStore
    @State private var input = ""
    @FocusState private var focused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            if store.conversation.isEmpty { suggestions }
                            ForEach(store.conversation) { msg in
                                MessageBubble(message: msg).id(msg.id)
                            }
                            if store.isBusy {
                                HStack { ProgressView(); Text("Atlas está pensando…") }
                                    .foregroundStyle(.secondary).font(.caption)
                            }
                        }
                        .padding()
                    }
                    .onChange(of: store.conversation.count) { _ in
                        if let last = store.conversation.last {
                            withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                        }
                    }
                }
                inputBar
            }
            .navigationTitle("Asesor")
        }
    }

    private var suggestions: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Pregúntame, por ejemplo:").font(.headline)
            ForEach(store.nexusConnected
                    ? ["¿Qué citas tengo esta semana?",
                       "¿Cuántos partes de trabajo tengo abiertos?",
                       "¿Cuál es mi próxima cita y dónde es?",
                       "Resume mi agenda de los próximos días"]
                    : ["¿Cómo priorizo mis inversiones este trimestre?",
                       "Tengo un cliente que paga tarde, ¿qué hago?",
                       "Ayúdame a preparar la reunión con el banco",
                       "¿Qué KPIs debería vigilar esta semana?"], id: \.self) { s in
                Button { send(s) } label: {
                    Text(s).frame(maxWidth: .infinity, alignment: .leading)
                        .padding(10)
                        .background(Color.indigo.opacity(0.1),
                                    in: RoundedRectangle(cornerRadius: 10))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.bottom, 8)
    }

    private var inputBar: some View {
        HStack(spacing: 8) {
            TextField("Escribe tu consulta…", text: $input, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .focused($focused)
                .lineLimit(1...4)
            Button { send(input) } label: {
                Image(systemName: "arrow.up.circle.fill").font(.title)
            }
            .disabled(input.trimmingCharacters(in: .whitespaces).isEmpty || store.isBusy)
        }
        .padding()
        .background(.bar)
    }

    private func send(_ text: String) {
        let q = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty else { return }
        input = ""
        focused = false
        Task { await store.ask(q) }
    }
}

struct MessageBubble: View {
    let message: AdviceMessage
    private var isUser: Bool { message.role == .user }

    var body: some View {
        HStack {
            if isUser { Spacer(minLength: 40) }
            Text(message.content)
                .padding(12)
                .background(isUser ? Color.indigo : Color(.secondarySystemBackground),
                            in: RoundedRectangle(cornerRadius: 16))
                .foregroundStyle(isUser ? .white : .primary)
                .textSelection(.enabled)
            if !isUser { Spacer(minLength: 40) }
        }
    }
}
