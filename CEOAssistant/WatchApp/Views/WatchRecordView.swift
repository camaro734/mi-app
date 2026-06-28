import SwiftUI

/// Graba una reunión desde el Watch y la transfiere al iPhone para procesarla.
struct WatchRecordView: View {
    @StateObject private var recorder = AudioRecorder()
    @State private var transferred = false

    var body: some View {
        VStack(spacing: 14) {
            if transferred {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 44)).foregroundStyle(.green)
                Text("Enviado al iPhone").font(.headline)
                Text("Atlas la está resumiendo.")
                    .font(.caption).foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            } else {
                Text(recorder.isRecording
                     ? EmailService.formatDuration(recorder.elapsed)
                     : "Toca para grabar")
                    .font(.title3.monospacedDigit().bold())
                    .foregroundStyle(recorder.isRecording ? .red : .primary)

                Button(action: toggle) {
                    ZStack {
                        Circle()
                            .fill(recorder.isRecording ? Color.red : Color.indigo)
                            .frame(width: 76, height: 76)
                        Image(systemName: recorder.isRecording ? "stop.fill" : "mic.fill")
                            .font(.system(size: 28)).foregroundStyle(.white)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .navigationTitle("Grabar")
    }

    private func toggle() {
        if recorder.isRecording {
            let r = recorder.stop()
            if let url = r.url {
                WatchConnectivityManager.shared.sendAudio(
                    fileURL: url,
                    metadata: ["title": "Reunión \(Date().formatted(date: .abbreviated, time: .shortened))",
                               "duration": r.duration])
                withAnimation { transferred = true }
            }
        } else {
            Task {
                guard await recorder.requestPermission() else { return }
                try? recorder.start()
            }
        }
    }
}
