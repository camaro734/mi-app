import Foundation
import AVFoundation

/// Grabadora de audio reutilizable en iOS y watchOS. Graba a m4a (AAC), formato
/// compacto y compatible con Whisper y Apple Speech.
final class AudioRecorder: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var elapsed: TimeInterval = 0

    private var recorder: AVAudioRecorder?
    private var timer: Timer?
    private(set) var currentFileURL: URL?

    /// Carpeta de grabaciones dentro del contenedor de la app.
    static var recordingsDirectory: URL {
        let base = FileManager.default.urls(for: .documentDirectory,
                                            in: .userDomainMask)[0]
        let dir = base.appendingPathComponent("Recordings", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir,
                                                 withIntermediateDirectories: true)
        return dir
    }

    func requestPermission() async -> Bool {
        await withCheckedContinuation { cont in
            AVAudioApplication.requestRecordPermission { cont.resume(returning: $0) }
        }
    }

    @discardableResult
    func start() throws -> URL {
        let session = AVAudioSession.sharedInstance()
        // `.defaultToSpeaker` solo existe en iOS; en watchOS se omite.
        #if os(iOS)
        let options: AVAudioSession.CategoryOptions = [.duckOthers, .defaultToSpeaker]
        #else
        let options: AVAudioSession.CategoryOptions = [.duckOthers]
        #endif
        try session.setCategory(.playAndRecord, mode: .default, options: options)
        try session.setActive(true)

        let fileName = "rec-\(UUID().uuidString).m4a"
        let url = Self.recordingsDirectory.appendingPathComponent(fileName)
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            // 44.1 kHz: tasa nativa fiable también en el micro del Apple Watch
            // (a 16 kHz algunas veces grababa en silencio).
            AVSampleRateKey: 44_100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue
        ]
        let rec = try AVAudioRecorder(url: url, settings: settings)
        rec.isMeteringEnabled = true
        rec.prepareToRecord()
        guard rec.record() else {
            throw NSError(domain: "AudioRecorder", code: 1,
                          userInfo: [NSLocalizedDescriptionKey: "No se pudo iniciar el micrófono."])
        }

        recorder = rec
        currentFileURL = url
        isRecording = true
        elapsed = 0
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            self?.elapsed += 1
        }
        return url
    }

    /// Detiene la grabación y devuelve (url, duración).
    @discardableResult
    func stop() -> (url: URL?, duration: TimeInterval) {
        let duration = elapsed
        recorder?.stop()
        timer?.invalidate()
        timer = nil
        isRecording = false
        try? AVAudioSession.sharedInstance().setActive(false)
        let url = currentFileURL
        recorder = nil
        return (url, duration)
    }
}
