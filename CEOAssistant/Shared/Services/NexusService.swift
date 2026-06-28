import Foundation

/// Cliente del ERP **Nexus** (finance-agent, https://cmgnexus.es).
///
/// Se autentica con el usuario/contraseña de Nexus contra el login móvil
/// (`POST /api/v1/auth/login`), guarda el token en el Keychain y lee datos de
/// solo lectura: la agenda de citas (`GET /api/v1/citas`) y los partes de
/// trabajo (`GET /api/v1/work-orders`). Si el token caduca, lo refresca solo.
///
/// La contraseña **nunca** se guarda: solo se conservan los tokens cifrados.
final class NexusService {

    // MARK: - Configuración

    /// URL base del ERP. Se puede cambiar en Ajustes (por defecto, producción).
    static var baseURL: String {
        let stored = UserDefaults.standard.string(forKey: AppConfig.Keys.nexusBaseURL)
        let raw = (stored?.isEmpty == false ? stored! : "https://cmgnexus.es")
        return raw.hasSuffix("/") ? String(raw.dropLast()) : raw
    }

    /// ¿Hay sesión iniciada en Nexus? (existe un token guardado)
    static var isLoggedIn: Bool {
        SecureStore.get(.nexusAccessToken)?.isEmpty == false
    }

    private let session: URLSession
    init(session: URLSession = .shared) { self.session = session }

    // MARK: - Autenticación

    /// Inicia sesión con usuario y contraseña de Nexus. Guarda los tokens.
    func login(username: String, password: String) async throws {
        let url = try endpoint("/api/v1/auth/login")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(
            withJSONObject: ["username": username, "password": password])

        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else {
            throw NexusError.network("Sin respuesta del servidor.")
        }
        guard (200...299).contains(http.statusCode) else {
            if http.statusCode == 401 { throw NexusError.badCredentials }
            throw NexusError.badResponse(http.statusCode, bodyText(data))
        }
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
              let access = json["access_token"] as? String else {
            throw NexusError.decoding("Respuesta de login inesperada.")
        }
        SecureStore.set(access, for: .nexusAccessToken)
        if let refresh = json["refresh_token"] as? String {
            SecureStore.set(refresh, for: .nexusRefreshToken)
        }
        UserDefaults.standard.set(username, forKey: AppConfig.Keys.nexusUsername)
    }

    /// Cierra la sesión: borra los tokens guardados.
    static func logout() {
        SecureStore.delete(.nexusAccessToken)
        SecureStore.delete(.nexusRefreshToken)
    }

    /// Pide un nuevo access token usando el refresh token. Devuelve el nuevo
    /// token o lanza si no es posible (hay que volver a iniciar sesión).
    @discardableResult
    private func refreshAccessToken() async throws -> String {
        guard let refresh = SecureStore.get(.nexusRefreshToken), !refresh.isEmpty else {
            throw NexusError.sessionExpired
        }
        let url = try endpoint("/api/v1/auth/refresh")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONSerialization.data(
            withJSONObject: ["refresh_token": refresh])

        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse,
              (200...299).contains(http.statusCode),
              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
              let access = json["access_token"] as? String else {
            throw NexusError.sessionExpired
        }
        SecureStore.set(access, for: .nexusAccessToken)
        return access
    }

    // MARK: - Lectura de datos

    /// Próximas citas/agenda desde ahora hasta dentro de `dias` días.
    func upcomingAppointments(dias: Int = 7) async throws -> [Appointment] {
        let payload: [String: Any] = try await getJSON("/api/v1/citas?dias=\(dias)")
        let items = payload["items"] as? [[String: Any]] ?? []
        return items.compactMap(Self.appointment(from:))
    }

    /// Partes de trabajo activos (no incluye citas). Devuelve los datos en bruto
    /// para que la capa superior los muestre como prefiera.
    func workOrders(limit: Int = 50) async throws -> [[String: Any]] {
        let payload: [String: Any] = try await getJSON("/api/v1/work-orders?limit=\(limit)")
        return payload["items"] as? [[String: Any]] ?? []
    }

    // MARK: - HTTP con token (refresca y reintenta una vez si caduca)

    private func getJSON(_ path: String, retrying: Bool = true) async throws -> [String: Any] {
        guard let token = SecureStore.get(.nexusAccessToken), !token.isEmpty else {
            throw NexusError.notLoggedIn
        }
        let url = try endpoint(path)
        var req = URLRequest(url: url)
        req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else {
            throw NexusError.network("Sin respuesta del servidor.")
        }
        if http.statusCode == 401 && retrying {
            // Token caducado: refrescar y reintentar una sola vez.
            _ = try await refreshAccessToken()
            return try await getJSON(path, retrying: false)
        }
        guard (200...299).contains(http.statusCode) else {
            throw NexusError.badResponse(http.statusCode, bodyText(data))
        }
        guard let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] else {
            throw NexusError.decoding("Respuesta inesperada de \(path).")
        }
        return json
    }

    // MARK: - Mapeo de una cita de Nexus → Appointment

    private static func appointment(from c: [String: Any]) -> Appointment? {
        guard let startStr = c["start"] as? String,
              let start = parseDate(startStr) else { return nil }
        let end = (c["end"] as? String).flatMap(parseDate) ?? start.addingTimeInterval(2 * 3600)

        let id: String
        if let n = c["id"] as? Int { id = "nexus-\(n)" }
        else if let s = c["orderNumber"] as? String { id = "nexus-\(s)" }
        else { id = "nexus-\(UUID().uuidString)" }

        // Notas: juntamos lo útil para el asesor/briefing.
        var noteParts: [String] = []
        if let s = c["serviceType"] as? String, !s.isEmpty { noteParts.append(s) }
        if let d = c["description"] as? String, !d.isEmpty { noteParts.append(d) }
        if let v = c["vehicle"] as? String, !v.isEmpty { noteParts.append("Vehículo: \(v)") }
        if let p = c["customerPhone"] as? String, !p.isEmpty { noteParts.append("Tel: \(p)") }
        if let st = c["status"] as? String, !st.isEmpty { noteParts.append("Estado: \(st)") }

        let attendees = (c["assignedTo"] as? String).map { [$0] } ?? []

        return Appointment(
            id: id,
            title: (c["title"] as? String) ?? (c["customerName"] as? String) ?? "Cita",
            startDate: start,
            endDate: end,
            location: c["location"] as? String,
            notes: noteParts.isEmpty ? nil : noteParts.joined(separator: " · "),
            attendees: attendees
        )
    }

    // MARK: - Utilidades

    private func endpoint(_ path: String) throws -> URL {
        guard let url = URL(string: Self.baseURL + path) else {
            throw NexusError.network("URL de Nexus no válida.")
        }
        return url
    }

    private func bodyText(_ data: Data) -> String {
        String(data: data, encoding: .utf8) ?? ""
    }

    /// Parsea fechas ISO con o sin zona horaria (el ERP puede devolver ambas).
    private static func parseDate(_ s: String) -> Date? {
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let d = iso.date(from: s) { return d }
        iso.formatOptions = [.withInternetDateTime]
        if let d = iso.date(from: s) { return d }
        // Sin zona horaria: "2026-06-28T10:00:00" → se interpreta como hora local.
        let df = DateFormatter()
        df.locale = Locale(identifier: "en_US_POSIX")
        df.timeZone = .current
        for fmt in ["yyyy-MM-dd'T'HH:mm:ss", "yyyy-MM-dd'T'HH:mm"] {
            df.dateFormat = fmt
            if let d = df.date(from: s) { return d }
        }
        return nil
    }
}

/// Errores del cliente de Nexus, con mensajes claros para mostrar al usuario.
enum NexusError: LocalizedError {
    case notLoggedIn
    case badCredentials
    case sessionExpired
    case network(String)
    case badResponse(Int, String)
    case decoding(String)

    var errorDescription: String? {
        switch self {
        case .notLoggedIn:    return "No has iniciado sesión en Nexus."
        case .badCredentials: return "Usuario o contraseña de Nexus incorrectos."
        case .sessionExpired: return "La sesión de Nexus caducó. Vuelve a iniciar sesión."
        case .network(let m): return m
        case .badResponse(let code, _): return "Nexus respondió con un error (\(code))."
        case .decoding(let m): return m
        }
    }
}
