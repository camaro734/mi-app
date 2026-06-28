import SwiftUI

/// Notas y tareas capturadas por voz/texto. Accesible desde el asesor o el Watch.
struct NotesView: View {
    @EnvironmentObject var store: AssistantStore
    @State private var draft = ""

    var body: some View {
        List {
            Section {
                HStack {
                    TextField("Captura rápida…", text: $draft)
                    Button("Añadir") {
                        let text = draft
                        draft = ""
                        Task { await store.addDictatedNote(text) }
                    }
                    .disabled(draft.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            ForEach(store.notes) { note in
                HStack {
                    Image(systemName: note.done ? "checkmark.circle.fill" : icon(note.kind))
                        .foregroundStyle(note.done ? .green : .indigo)
                        .onTapGesture { store.toggleNote(note) }
                    Text(note.text).strikethrough(note.done)
                        .foregroundStyle(note.done ? .secondary : .primary)
                }
            }
        }
        .navigationTitle("Notas")
    }

    private func icon(_ kind: QuickNote.Kind) -> String {
        switch kind {
        case .note: return "note.text"
        case .task: return "checklist"
        case .reminder: return "bell"
        case .idea: return "lightbulb"
        }
    }
}
