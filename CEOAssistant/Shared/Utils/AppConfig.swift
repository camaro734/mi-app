import Foundation

/// Configuración global de la app. Los valores sensibles (API key, correo) se
/// guardan en Keychain / UserDefaults, no aquí.
enum AppConfig {
    /// Modelo de IA por defecto. Claude Opus 4.8 por capacidad de razonamiento.
    /// Alternativas: "claude-sonnet-4-6" (más rápido/barato).
    static let defaultModel = "claude-opus-4-8"

    /// Modelo de Whisper si se usa transcripción por OpenAI (opcional).
    static let whisperModel = "whisper-1"

    /// Claves de UserDefaults.
    enum Keys {
        static let userEmail = "config.userEmail"
        static let userName = "config.userName"
        static let transcriptionEngine = "config.transcriptionEngine"
        static let autoEmailSummaries = "config.autoEmailSummaries"
        static let aiModel = "config.aiModel"
    }
}

/// Dónde se transcribe el audio.
enum TranscriptionEngine: String, CaseIterable, Identifiable {
    case appleOnDevice   // Speech framework, en el dispositivo, sin coste ni nube
    case whisperOpenAI   // API de Whisper (requiere clave de OpenAI)
    var id: String { rawValue }
    var label: String {
        switch self {
        case .appleOnDevice: return "Apple (en el dispositivo)"
        case .whisperOpenAI: return "Whisper (OpenAI)"
        }
    }
}
