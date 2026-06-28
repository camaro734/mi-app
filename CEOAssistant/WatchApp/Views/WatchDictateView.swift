import SwiftUI

/// Dicta una nota/tarea rápida; el iPhone la limpia y clasifica con la IA.
struct WatchDictateView: View {
    @State private var text = ""
    @State private var sent = false

    var body: some View {
        VStack(spacing: 12) {
            if sent {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 40)).foregroundStyle(.green)
                Text("Nota guardada").font(.headline)
            } else {
                TextField("Dicta tu nota…", text: $text)
                    .onSubmit(send)
                Button(action: send) {
                    Label("Guardar", systemImage: "tray.and.arrow.down.fill")
                }
                .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
            }
        }
        .padding(.horizontal, 4)
        .navigationTitle("Dictar")
    }

    private func send() {
        let t = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !t.isEmpty else { return }
        WatchConnectivityManager.shared.sendMessage(["dictation": t])
        withAnimation { sent = true }
    }
}
