import SwiftUI

/// Detalle de una reunión: resumen ejecutivo, acciones, riesgos y transcripción.
struct RecordingDetailView: View {
    let recording: Recording
    var onEmail: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if let s = recording.summary {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(s.headline).font(.title3.bold())
                        Text(s.summary).foregroundStyle(.secondary)
                    }

                    if !s.keyDecisions.isEmpty {
                        block("Decisiones", systemImage: "checkmark.seal.fill", .green) {
                            ForEach(s.keyDecisions, id: \.self) { bullet($0) }
                        }
                    }
                    if !s.actionItems.isEmpty {
                        block("Acciones", systemImage: "list.bullet.clipboard", .indigo) {
                            ForEach(s.actionItems) { a in
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("• \(a.task)")
                                    if a.owner != nil || a.dueDate != nil {
                                        Text([a.owner, a.dueDate].compactMap { $0 }
                                            .joined(separator: " · "))
                                            .font(.caption).foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                    if !s.risks.isEmpty {
                        block("Riesgos", systemImage: "exclamationmark.triangle.fill", .orange) {
                            ForEach(s.risks, id: \.self) { bullet($0) }
                        }
                    }
                    if !s.followUps.isEmpty {
                        block("Seguimientos", systemImage: "arrow.turn.up.right", .blue) {
                            ForEach(s.followUps, id: \.self) { bullet($0) }
                        }
                    }
                } else if recording.status == .failed {
                    ContentUnavailableView("No se pudo procesar",
                        systemImage: "exclamationmark.triangle",
                        description: Text(recording.errorText ?? "Revisa la API key o la conexión e inténtalo de nuevo."))
                } else {
                    ProgressView("Procesando…").frame(maxWidth: .infinity)
                }

                if let t = recording.transcript {
                    DisclosureGroup("Transcripción completa") {
                        Text(t).font(.callout).foregroundStyle(.secondary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
            }
            .padding()
        }
        .navigationTitle(recording.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            Button {
                onEmail()
            } label: { Image(systemName: "envelope.fill") }
                .disabled(recording.summary == nil)
        }
    }

    @ViewBuilder
    private func block<Content: View>(_ title: String, systemImage: String,
                                      _ color: Color,
                                      @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Label(title, systemImage: systemImage).font(.headline).foregroundStyle(color)
            content()
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(color.opacity(0.08), in: RoundedRectangle(cornerRadius: 12))
    }

    private func bullet(_ text: String) -> some View {
        Text("• \(text)").frame(maxWidth: .infinity, alignment: .leading)
    }
}
