import SwiftUI
import MessageUI

/// Lista de reuniones grabadas, con grabación desde el iPhone y envío del
/// resumen por correo.
struct RecordingsView: View {
    @EnvironmentObject var store: AssistantStore
    @StateObject private var recorder = AudioRecorder()
    @State private var mailRecording: Recording?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    RecordButton(recorder: recorder, onFinish: handleFinish)
                }
                Section("Historial") {
                    if store.recordings.isEmpty {
                        ContentUnavailableView("Sin reuniones",
                            systemImage: "waveform",
                            description: Text("Graba tu primera reunión para verla aquí."))
                    }
                    ForEach(store.recordings) { rec in
                        NavigationLink {
                            RecordingDetailView(recording: rec) { mailRecording = rec }
                        } label: {
                            RecordingRow(recording: rec)
                        }
                    }
                    .onDelete { idx in
                        idx.map { store.recordings[$0] }.forEach(store.deleteRecording)
                    }
                }
            }
            .navigationTitle("Reuniones")
            .sheet(item: $mailRecording) { rec in
                MailComposeView(
                    subject: EmailService.subject(for: rec),
                    body: EmailService.plainBody(for: rec),
                    recipients: [UserDefaults.standard.string(forKey: AppConfig.Keys.userEmail) ?? ""])
            }
        }
    }

    private func handleFinish(url: URL?, duration: TimeInterval) {
        guard let url else { return }
        let rec = Recording(duration: duration,
                            audioFileName: url.lastPathComponent,
                            status: .transcribing)
        Task { await store.process(recording: rec, audioURL: url) }
    }
}

struct RecordButton: View {
    @ObservedObject var recorder: AudioRecorder
    let onFinish: (URL?, TimeInterval) -> Void

    var body: some View {
        VStack(spacing: 12) {
            Button {
                if recorder.isRecording {
                    let r = recorder.stop()
                    onFinish(r.url, r.duration)
                } else {
                    Task {
                        guard await recorder.requestPermission() else { return }
                        try? recorder.start()
                    }
                }
            } label: {
                ZStack {
                    Circle()
                        .fill(recorder.isRecording ? Color.red : Color.indigo)
                        .frame(width: 84, height: 84)
                    Image(systemName: recorder.isRecording ? "stop.fill" : "mic.fill")
                        .font(.system(size: 32)).foregroundStyle(.white)
                }
            }
            .buttonStyle(.plain)
            Text(recorder.isRecording
                 ? EmailService.formatDuration(recorder.elapsed)
                 : "Pulsa para grabar")
                .font(.headline.monospacedDigit())
                .foregroundStyle(recorder.isRecording ? .red : .secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 8)
    }
}

struct RecordingRow: View {
    let recording: Recording
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(recording.title).font(.headline).lineLimit(1)
                Text(recording.createdAt, format: .dateTime.day().month().hour().minute())
                    .font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
            StatusBadge(status: recording.status)
        }
    }
}

struct StatusBadge: View {
    let status: Recording.Status
    var body: some View {
        Text(label).font(.caption2.bold())
            .padding(.horizontal, 8).padding(.vertical, 4)
            .background(color.opacity(0.15), in: Capsule())
            .foregroundStyle(color)
    }
    private var label: String {
        switch status {
        case .recording: return "Grabando"
        case .pendingTransfer: return "Pendiente"
        case .transcribing: return "Transcribiendo"
        case .summarizing: return "Resumiendo"
        case .summarized: return "Listo"
        case .emailed: return "Enviado"
        case .failed: return "Error"
        }
    }
    private var color: Color {
        switch status {
        case .summarized, .emailed: return .green
        case .failed: return .red
        case .recording: return .red
        default: return .orange
        }
    }
}
