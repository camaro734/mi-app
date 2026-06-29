import SwiftUI

/// Graba una reunión desde el Watch y la transfiere al iPhone para procesarla.
struct WatchRecordView: View {
    /// Si es true (al abrir desde la complicación de la esfera), empieza a
    /// grabar automáticamente para que sea un solo toque.
    var autoStart: Bool = false

    @StateObject private var recorder = AudioRecorder()
    @State private var transferred = false
    @State private var didAutoStart = false

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
        .task {
            // Abierto desde la complicación de la esfera: empieza a grabar solo.
            if autoStart && !didAutoStart && !recorder.isRecording && !transferred {
                didAutoStart = true
                startRecording()
            }
        }
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
            startRecording()
        }
    }

    private func startRecording() {
        Task {
            guard await recorder.requestPermission() else { return }
            try? recorder.start()
        }
    }
}
