import Foundation
import AVFoundation

/// Grabadora de audio reutilizable en iOS y watchOS. Graba a m4a (AAC), formato
/// compacto y compatible con Whisper y Apple Speech.
///
/// Sigue grabando con la pantalla apagada / app en segundo plano (requiere el
/// modo de fondo "audio" en Info.plist) y, si el sistema interrumpe la sesión
/// (una llamada, un aviso…), la **reanuda** automáticamente al terminar la
/// interrupción para no perder el resto de la reunión.
final class AudioRecorder: NSObject, ObservableObject {
    @Published var isRecording = false
    @Published var elapsed: TimeInterval = 0

    private var recorder: AVAudioRecorder?
    private var timer: Timer?
    private(set) var currentFileURL: URL?

    override init() {
        super.init()
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(handleInterruption(_:)),
                       name: AVAudioSession.interruptionNotification, object: nil)
        nc.addObserver(self, selector: #selector(handleMediaReset(_:)),
                       name: AVAudioSession.mediaServicesWereResetNotification, object: nil)
    }

    deinit { NotificationCenter.default.removeObserver(self) }

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
        try configureSession()

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
        startTimer()
        return url
    }

    /// Detiene la grabación y devuelve (url, duración real grabada).
    @discardableResult
    func stop() -> (url: URL?, duration: TimeInterval) {
        // `currentTime` es la duración REAL grabada (el cronómetro se congela en
        // segundo plano, así que no sirve para la duración).
        let duration = recorder?.currentTime ?? elapsed
        recorder?.stop()
        timer?.invalidate()
        timer = nil
        isRecording = false
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        let url = currentFileURL
        recorder = nil
        return (url, duration)
    }

    // MARK: - Sesión e interrupciones

    private func configureSession() throws {
        let session = AVAudioSession.sharedInstance()
        // `.defaultToSpeaker` solo existe en iOS; en watchOS se omite.
        #if os(iOS)
        let options: AVAudioSession.CategoryOptions = [.duckOthers, .defaultToSpeaker, .allowBluetooth]
        #else
        let options: AVAudioSession.CategoryOptions = [.duckOthers]
        #endif
        try session.setCategory(.playAndRecord, mode: .default, options: options)
        try session.setActive(true)
    }

    private func startTimer() {
        timer?.invalidate()
        // En `.common` para que siga actualizando aunque haya scroll u otras
        // interacciones; la duración real se toma igualmente de `currentTime`.
        let t = Timer(timeInterval: 1, repeats: true) { [weak self] _ in
            guard let self, let rec = self.recorder, rec.isRecording else { return }
            self.elapsed = rec.currentTime
        }
        RunLoop.main.add(t, forMode: .common)
        timer = t
    }

    /// El sistema interrumpió la sesión (llamada, alarma, otra app de audio…).
    /// Al terminar, reactivamos y reanudamos para no perder el resto.
    @objc private func handleInterruption(_ note: Notification) {
        guard let info = note.userInfo,
              let raw = info[AVAudioSessionInterruptionTypeKey] as? UInt,
              let type = AVAudioSession.InterruptionType(rawValue: raw) else { return }

        switch type {
        case .began:
            // El sistema ya ha pausado la grabación automáticamente.
            break
        case .ended:
            let shouldResume: Bool
            if let optRaw = info[AVAudioSessionInterruptionOptionKey] as? UInt {
                shouldResume = AVAudioSession.InterruptionOptions(rawValue: optRaw).contains(.shouldResume)
            } else {
                shouldResume = true
            }
            guard isRecording, shouldResume else { return }
            try? AVAudioSession.sharedInstance().setActive(true)
            recorder?.record()   // reanuda en el mismo fichero
        @unknown default:
            break
        }
    }

    /// Si el servidor de audio se reinicia, reactivamos la sesión.
    @objc private func handleMediaReset(_ note: Notification) {
        guard isRecording else { return }
        try? configureSession()
        recorder?.record()
    }
}
