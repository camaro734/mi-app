import SwiftUI

/// Asesor en la muñeca: dicta una pregunta y el iPhone responde con Claude.
struct WatchAdvisorView: View {
    @State private var question = ""
    @State private var answer: String?
    @State private var loading = false

    var body: some View {
        ScrollView {
            VStack(spacing: 12) {
                // El campo de texto en watchOS abre dictado/scribble automáticamente.
                TextField("Pregunta a Atlas…", text: $question)
                    .onSubmit(ask)

                Button(action: ask) {
                    Label("Preguntar", systemImage: "paperplane.fill")
                }
                .disabled(question.trimmingCharacters(in: .whitespaces).isEmpty || loading)

                if loading {
                    ProgressView().padding(.top, 4)
                }
                if let answer {
                    Text(answer)
                        .font(.footnote)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(10)
                        .background(Color.indigo.opacity(0.15),
                                    in: RoundedRectangle(cornerRadius: 12))
                }
            }
            .padding(.horizontal, 4)
        }
        .navigationTitle("Asesor")
    }

    private func ask() {
        let q = question.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !q.isEmpty else { return }
        loading = true
        answer = nil
        Task {
            let reply = await WatchConnectivityManager.shared.requestAdvice(q)
            await MainActor.run {
                answer = reply
                loading = false
            }
        }
    }
}
