import Foundation

/// Abstracción del motor de IA para poder cambiar de proveedor sin tocar la UI.
protocol AIService {
    /// Conversación de asesoría. `context` opcional se añade al prompt del
    /// sistema (p. ej. datos en vivo del ERP: citas y partes reales).
    func reply(to messages: [AdviceMessage], context: String?) async throws -> String
    /// Texto -> texto crudo (usado para resúmenes/briefings que devuelven JSON).
    func complete(system: String?, user: String) async throws -> String
}

extension AIService {
    /// Versión sin contexto extra (compatibilidad con llamadas existentes).
    func reply(to messages: [AdviceMessage]) async throws -> String {
        try await reply(to: messages, context: nil)
    }
}

enum AIError: LocalizedError {
    case missingAPIKey
    case badResponse(Int, String)
    case decoding(String)

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "Falta la API key. Configúrala en Ajustes."
        case .badResponse(let code, let body):
            return "La IA respondió con error \(code): \(body)"
        case .decoding(let detail):
            return "No se pudo interpretar la respuesta de la IA: \(detail)"
        }
    }
}

// MARK: - Implementación con la API de Claude (Anthropic)

/// Cliente de la API de Messages de Anthropic.
/// Modelo por defecto: Claude Opus 4.8 (claude-opus-4-8) por su razonamiento,
/// ideal para asesoría ejecutiva. Cambiable en `AppConfig`.
final class ClaudeAIService: AIService {

    private let apiKeyProvider: () -> String?
    private let model: String
    private let session: URLSession
    private let endpoint = URL(string: "https://api.anthropic.com/v1/messages")!

    init(apiKeyProvider: @escaping () -> String?,
         model: String = AppConfig.defaultModel,
         session: URLSession = .shared) {
        self.apiKeyProvider = apiKeyProvider
        self.model = model
        self.session = session
    }

    func reply(to messages: [AdviceMessage], context: String?) async throws -> String {
        let payloadMessages = messages.map {
            ["role": $0.role.rawValue, "content": $0.content]
        }
        var system = Prompts.ceoAdvisorSystem
        if let context, !context.isEmpty {
            system += """


            # Datos en vivo de la empresa (ERP Nexus)
            \(context)

            Usa estos datos REALES cuando el CEO pregunte por su agenda, sus citas \
            o sus partes de trabajo. No inventes nada que no esté aquí; si falta un \
            dato, dilo en una frase.
            """
        }
        return try await send(system: system,
                              messages: payloadMessages,
                              maxTokens: 1024)
    }

    func complete(system: String?, user: String) async throws -> String {
        try await send(system: system,
                       messages: [["role": "user", "content": user]],
                       maxTokens: 1500)
    }

    // MARK: Red

    private func send(system: String?,
                      messages: [[String: String]],
                      maxTokens: Int) async throws -> String {
        guard let key = apiKeyProvider(), !key.isEmpty else {
            throw AIError.missingAPIKey
        }

        var body: [String: Any] = [
            "model": model,
            "max_tokens": maxTokens,
            "messages": messages
        ]
        if let system { body["system"] = system }

        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(key, forHTTPHeaderField: "x-api-key")
        request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw AIError.badResponse(-1, "Respuesta sin código HTTP")
        }
        guard (200...299).contains(http.statusCode) else {
            let bodyText = String(data: data, encoding: .utf8) ?? ""
            throw AIError.badResponse(http.statusCode, bodyText)
        }

        // Estructura de respuesta: { content: [ { type: "text", text: "..." } ] }
        guard
            let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
            let content = json["content"] as? [[String: Any]]
        else {
            throw AIError.decoding("formato inesperado")
        }
        let text = content
            .compactMap { $0["text"] as? String }
            .joined()
        return text.trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

// MARK: - Helpers de decodificación de JSON devuelto por la IA

extension AIService {
    /// Decodifica el JSON que la IA devuelve, tolerando que venga envuelto en
    /// vallas de código (```json ... ```).
    func decodeJSON<T: Decodable>(_ type: T.Type, from raw: String) throws -> T {
        let cleaned = raw
            .replacingOccurrences(of: "```json", with: "")
            .replacingOccurrences(of: "```", with: "")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        guard let data = cleaned.data(using: .utf8) else {
            throw AIError.decoding("texto no convertible a datos")
        }
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            throw AIError.decoding(error.localizedDescription)
        }
    }
}
