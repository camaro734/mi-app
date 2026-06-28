import Foundation
import Speech

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

/// Usa el framework Speech de Apple. Privado y sin coste, ideal para reuniones
/// confidenciales. Requiere las claves de uso en Info.plist.
final class AppleSpeechTranscriber: TranscriptionService {
    private let locale: Locale
    init(locale: Locale = Locale(identifier: "es-ES")) { self.locale = locale }

    func transcribe(fileURL: URL) async throws -> String {
        try await requestAuthorization()
        guard let recognizer = SFSpeechRecognizer(locale: locale),
              recognizer.isAvailable else {
            throw TranscriptionError.engineUnavailable("Reconocedor no disponible para \(locale.identifier).")
        }
        recognizer.supportsOnDeviceRecognition = true

        let request = SFSpeechURLRecognitionRequest(url: fileURL)
        request.requiresOnDeviceRecognition = true
        request.shouldReportPartialResults = false

        return try await withCheckedThrowingContinuation { continuation in
            recognizer.recognitionTask(with: request) { result, error in
                if let error {
                    continuation.resume(throwing: error)
                    return
                }
                guard let result, result.isFinal else { return }
                let text = result.bestTranscription.formattedString
                if text.isEmpty {
                    continuation.resume(throwing: TranscriptionError.noSpeechDetected)
                } else {
                    continuation.resume(returning: text)
                }
            }
        }
    }

    private func requestAuthorization() async throws {
        let status = await withCheckedContinuation { cont in
            SFSpeechRecognizer.requestAuthorization { cont.resume(returning: $0) }
        }
        guard status == .authorized else { throw TranscriptionError.notAuthorized }
    }
}

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
