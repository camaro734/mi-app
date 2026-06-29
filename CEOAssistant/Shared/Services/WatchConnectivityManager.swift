import Foundation
import WatchConnectivity

/// Puente entre el Apple Watch y el iPhone. El Watch graba y transfiere el
/// fichero de audio al iPhone, que hace la transcripción/resumen pesados.
/// También sincroniza mensajes ligeros (notas, estado).
final class WatchConnectivityManager: NSObject, ObservableObject {
    static let shared = WatchConnectivityManager()

    /// Se llama en el iPhone cuando llega un audio del Watch.
    var onReceiveAudio: ((URL, [String: Any]) -> Void)?
    /// Se llama cuando llega un mensaje ligero (p. ej. una nota dictada).
    var onReceiveMessage: (([String: Any]) -> Void)?
    /// Se llama en el iPhone cuando el Watch pide una respuesta de IA. Debe
    /// devolver el texto de respuesta de forma asíncrona.
    var onAdviceRequest: ((String) async -> String)?

    @Published var isReachable = false

    /// Audios pendientes de enviar mientras la sesión termina de activarse.
    private var pendingAudio: [(URL, [String: Any])] = []

    private override init() {
        super.init()
        guard WCSession.isSupported() else { return }
        WCSession.default.delegate = self
        WCSession.default.activate()
    }

    /// Fuerza la activación (llámalo al arrancar la app del Watch para que la
    /// sesión esté lista antes de grabar y no se pierda el primer envío).
    func activate() {
        guard WCSession.isSupported() else { return }
        if WCSession.default.activationState != .activated {
            WCSession.default.activate()
        }
    }

    // MARK: Envío

    /// Transfiere un fichero de audio (desde el Watch) con metadatos. Si la
    /// sesión aún no está activa, lo encola y lo manda al activarse (antes se
    /// perdía el primer envío porque la activación es asíncrona).
    func sendAudio(fileURL: URL, metadata: [String: Any]) {
        let session = WCSession.default
        if session.activationState == .activated {
            session.transferFile(fileURL, metadata: metadata)
        } else {
            pendingAudio.append((fileURL, metadata))
            session.activate()
        }
    }

    /// Envía los audios que quedaron pendientes por la activación.
    private func flushPendingAudio() {
        guard WCSession.default.activationState == .activated, !pendingAudio.isEmpty else { return }
        let queued = pendingAudio
        pendingAudio.removeAll()
        for (url, meta) in queued {
            WCSession.default.transferFile(url, metadata: meta)
        }
    }

    /// Desde el Watch: pregunta al asesor (la respuesta la calcula el iPhone).
    func requestAdvice(_ question: String) async -> String {
        await withCheckedContinuation { cont in
            let session = WCSession.default
            guard session.activationState == .activated, session.isReachable else {
                cont.resume(returning: "Acerca el iPhone para usar el asesor.")
                return
            }
            session.sendMessage(["advice": question]) { reply in
                cont.resume(returning: reply["answer"] as? String ?? "Sin respuesta.")
            } errorHandler: { error in
                cont.resume(returning: "Error: \(error.localizedDescription)")
            }
        }
    }

    /// Envía un mensaje ligero. Si no hay alcance, lo encola en el contexto.
    func sendMessage(_ payload: [String: Any]) {
        let session = WCSession.default
        guard session.activationState == .activated else { return }
        if session.isReachable {
            session.sendMessage(payload, replyHandler: nil) { _ in
                try? session.updateApplicationContext(payload)
            }
        } else {
            try? session.updateApplicationContext(payload)
        }
    }
}

extension WatchConnectivityManager: WCSessionDelegate {
    func session(_ session: WCSession,
                 activationDidCompleteWith state: WCSessionActivationState,
                 error: Error?) {
        DispatchQueue.main.async {
            self.isReachable = session.isReachable
            self.flushPendingAudio()
        }
    }

    #if os(iOS)
    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }
    #endif

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async { self.isReachable = session.isReachable }
    }

    func session(_ session: WCSession, didReceive file: WCSessionFile) {
        // Copia el fichero a un sitio permanente antes de que el SO lo borre.
        let dest = AudioRecorder.recordingsDirectory
            .appendingPathComponent(file.fileURL.lastPathComponent)
        try? FileManager.default.removeItem(at: dest)
        try? FileManager.default.copyItem(at: file.fileURL, to: dest)
        let metadata = file.metadata ?? [:]
        DispatchQueue.main.async { self.onReceiveAudio?(dest, metadata) }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        DispatchQueue.main.async { self.onReceiveMessage?(message) }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any],
                 replyHandler: @escaping ([String: Any]) -> Void) {
        if let question = message["advice"] as? String, let handler = onAdviceRequest {
            Task {
                let answer = await handler(question)
                replyHandler(["answer": answer])
            }
        } else {
            DispatchQueue.main.async { self.onReceiveMessage?(message) }
            replyHandler([:])
        }
    }

    func session(_ session: WCSession,
                 didReceiveApplicationContext applicationContext: [String: Any]) {
        DispatchQueue.main.async { self.onReceiveMessage?(applicationContext) }
    }
}
