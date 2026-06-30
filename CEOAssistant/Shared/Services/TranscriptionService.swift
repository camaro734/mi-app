import Foundation
import AVFoundation
#if canImport(Speech)
import Speech
#endif

protocol TranscriptionService {
    /// Transcribe un fichero de audio a texto.
    func transcribe(fileURL: URL) async throws -> String
}

enum TranscriptionError: LocalizedError {
    case notAuthorized
    case noSpeechDetected
    case engineUnavailable(String)
    var errorDescription: String? {
        switch self {
        case .notAuthorized: return "Permiso de reconocimiento de voz denegado."
        case .noSpeechDetected: return "No se detectó voz en la grabación."
        case .engineUnavailable(let m): return m
        }
    }
}

// MARK: - Transcripción en el dispositivo (Apple Speech)

#if canImport(Speech)
/// Usa el framework Speech de Apple. Privado y sin coste, ideal para reuniones
/// confidenciales. Requiere las claves de uso en Info.plist.
/// Disponible solo en plataformas con el framework Speech (iOS), no en watchOS.
final class AppleSpeechTranscriber: TranscriptionService {
    private let locale: Locale
    /// SFSpeechRecognizer falla con audios largos (~1 min): se devuelve "sin voz".
    /// Por eso troceamos las reuniones en segmentos por debajo de ese límite.
    private let segmentSeconds: Double = 45

    init(locale: Locale = Locale(identifier: "es-ES")) { self.locale = locale }

    func transcribe(fileURL: URL) async throws -> String {
        try await requestAuthorization()

        let asset = AVURLAsset(url: fileURL)
        let total = (try? await asset.load(.duration).seconds) ?? 0

        // Audio corto: una sola pasada.
        if total <= segmentSeconds + 5 {
            let text = try await recognize(url: fileURL)
            if text.isEmpty { throw TranscriptionError.noSpeechDetected }
            return text
        }

        // Audio largo (reunión): trocear y transcribir por partes, en orden.
        var pieces: [String] = []
        var start = 0.0
        while start < total - 0.3 {
            let end = min(start + segmentSeconds, total)
            let segment = try await exportSegment(asset: asset, from: start, to: end)
            let text = (try? await recognize(url: segment)) ?? ""
            try? FileManager.default.removeItem(at: segment)
            if !text.isEmpty { pieces.append(text) }
            start = end
        }

        let full = pieces.joined(separator: " ").trimmingCharacters(in: .whitespacesAndNewlines)
        if full.isEmpty { throw TranscriptionError.noSpeechDetected }
        return full
    }

    /// Reconoce un fichero de audio corto (≤ ~1 min). Devuelve "" si no hay voz.
    private func recognize(url: URL) async throws -> String {
        guard let recognizer = SFSpeechRecognizer(locale: locale),
              recognizer.isAvailable else {
            throw TranscriptionError.engineUnavailable("Reconocedor no disponible para \(locale.identifier).")
        }
        let request = SFSpeechURLRecognitionRequest(url: url)
        request.requiresOnDeviceRecognition = recognizer.supportsOnDeviceRecognition
        request.shouldReportPartialResults = false

        return try await withCheckedThrowingContinuation { continuation in
            var resumed = false
            recognizer.recognitionTask(with: request) { result, error in
                if resumed { return }
                if let error {
                    resumed = true
                    continuation.resume(throwing: error)
                    return
                }
                guard let result, result.isFinal else { return }
                resumed = true
                continuation.resume(returning: result.bestTranscription.formattedString)
            }
        }
    }

    /// Exporta un trozo [start, end] del audio a un m4a temporal (sin recodificar).
    private func exportSegment(asset: AVURLAsset, from start: Double, to end: Double) async throws -> URL {
        let out = AudioRecorder.recordingsDirectory
            .appendingPathComponent("seg-\(UUID().uuidString).m4a")
        try? FileManager.default.removeItem(at: out)

        guard let export = AVAssetExportSession(asset: asset,
                                                presetName: AVAssetExportPresetPassthrough) else {
            throw TranscriptionError.engineUnavailable("No se pudo preparar el audio para trocear.")
        }
        export.outputURL = out
        export.outputFileType = .m4a
        export.timeRange = CMTimeRange(
            start: CMTime(seconds: start, preferredTimescale: 600),
            end: CMTime(seconds: end, preferredTimescale: 600))

        await withCheckedContinuation { cont in
            export.exportAsynchronously { cont.resume() }
        }
        guard export.status == .completed else {
            throw TranscriptionError.engineUnavailable(
                export.error?.localizedDescription ?? "Error al trocear el audio.")
        }
        return out
    }

    private func requestAuthorization() async throws {
        let status = await withCheckedContinuation { cont in
            SFSpeechRecognizer.requestAuthorization { cont.resume(returning: $0) }
        }
        guard status == .authorized else { throw TranscriptionError.notAuthorized }
    }
}
#endif

// MARK: - Transcripción con Whisper (OpenAI)

/// Sube el audio al endpoint de transcripciones de OpenAI. Útil cuando se quiere
/// máxima precisión o idiomas mezclados. Requiere clave de OpenAI.
final class WhisperTranscriber: TranscriptionService {
    private let apiKeyProvider: () -> String?
    private let session: URLSession
    private let endpoint = URL(string: "https://api.openai.com/v1/audio/transcriptions")!

    init(apiKeyProvider: @escaping () -> String?, session: URLSession = .shared) {
        self.apiKeyProvider = apiKeyProvider
        self.session = session
    }

    func transcribe(fileURL: URL) async throws -> String {
        guard let key = apiKeyProvider(), !key.isEmpty else {
            throw AIError.missingAPIKey
        }
        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
        request.setValue("multipart/form-data; boundary=\(boundary)",
                         forHTTPHeaderField: "Content-Type")

        let audioData = try Data(contentsOf: fileURL)
        var body = Data()
        func append(_ s: String) { body.append(s.data(using: .utf8)!) }

        append("--\(boundary)\r\n")
        append("Content-Disposition: form-data; name=\"model\"\r\n\r\n")
        append("\(AppConfig.whisperModel)\r\n")

        append("--\(boundary)\r\n")
        append("Content-Disposition: form-data; name=\"language\"\r\n\r\n")
        append("es\r\n")

        append("--\(boundary)\r\n")
        append("Content-Disposition: form-data; name=\"file\"; filename=\"\(fileURL.lastPathComponent)\"\r\n")
        append("Content-Type: audio/m4a\r\n\r\n")
        body.append(audioData)
        append("\r\n--\(boundary)--\r\n")
        request.httpBody = body

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse,
              (200...299).contains(http.statusCode) else {
            let code = (response as? HTTPURLResponse)?.statusCode ?? -1
            throw AIError.badResponse(code, String(data: data, encoding: .utf8) ?? "")
        }
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let text = json["text"] as? String else {
            throw AIError.decoding("respuesta de Whisper inesperada")
        }
        return text.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}
