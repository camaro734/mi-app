import Foundation
import Network

/// Cliente SMTP mínimo (sobre TLS implícito, puerto 465) para ENVIAR correo.
/// Solo se usa cuando el usuario aprueba explícitamente el envío de un borrador.
actor SMTPClient {

    enum SMTPError: LocalizedError {
        case connection(String)
        case server(String)
        case notConnected
        var errorDescription: String? {
            switch self {
            case .connection(let m): return "No se pudo conectar para enviar: \(m)"
            case .server(let m): return "El servidor de envío respondió: \(m)"
            case .notConnected: return "Sin conexión de envío."
            }
        }
    }

    private let host: String
    private let port: UInt16
    private var connection: NWConnection?
    private var inbuf = Data()

    init(host: String, port: UInt16 = 465) {
        self.host = host
        self.port = port
    }

    func connect() async throws {
        let params = NWParameters(tls: NWProtocolTLS.Options())
        let conn = NWConnection(host: .init(host), port: .init(rawValue: port)!, using: params)
        connection = conn
        let once = ResumeOnce()
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            conn.stateUpdateHandler = { st in
                switch st {
                case .ready: once.run { cont.resume() }
                case .failed(let e): once.run { cont.resume(throwing: SMTPError.connection(e.localizedDescription)) }
                case .waiting(let e): once.run { cont.resume(throwing: SMTPError.connection(e.localizedDescription)) }
                default: break
                }
            }
            conn.start(queue: .global(qos: .userInitiated))
        }
        try await expect(220)
    }

    func login(user: String, password: String) async throws {
        try await write("EHLO atlas.local\r\n"); try await expect(250)
        try await write("AUTH LOGIN\r\n"); try await expect(334)
        try await write(Data(user.utf8).base64EncodedString() + "\r\n"); try await expect(334)
        try await write(Data(password.utf8).base64EncodedString() + "\r\n"); try await expect(235)
    }

    /// Envía un correo de texto (UTF-8). `to` y opcionalmente cabeceras de hilo.
    func sendMessage(fromAddress: String, fromName: String,
                     to: [String], subject: String, body: String,
                     inReplyTo: String? = nil, references: String? = nil) async throws {
        try await write("MAIL FROM:<\(fromAddress)>\r\n"); try await expect(250)
        for rcpt in to {
            try await write("RCPT TO:<\(rcpt)>\r\n"); try await expect(250)
        }
        try await write("DATA\r\n"); try await expect(354)

        let message = buildMessage(fromAddress: fromAddress, fromName: fromName,
                                   to: to, subject: subject, body: body,
                                   inReplyTo: inReplyTo, references: references)
        try await write(message + "\r\n.\r\n")
        try await expect(250)
    }

    func quit() async {
        try? await write("QUIT\r\n")
        connection?.cancel()
        connection = nil
    }

    // MARK: - Construcción del mensaje

    private func buildMessage(fromAddress: String, fromName: String,
                              to: [String], subject: String, body: String,
                              inReplyTo: String?, references: String?) -> String {
        let date = smtpDate()
        let msgId = "<\(UUID().uuidString)@\(fromAddress.split(separator: "@").last.map(String.init) ?? "local")>"
        let encSubject = "=?UTF-8?B?\(Data(subject.utf8).base64EncodedString())?="
        let encName = "=?UTF-8?B?\(Data(fromName.utf8).base64EncodedString())?="
        // Cuerpo en base64 (evita problemas con acentos y con el punto final).
        let b64Body = Data(body.utf8).base64EncodedString(options: [.lineLength76Characters, .endLineWithCarriageReturn])

        var headers = [
            "From: \(encName) <\(fromAddress)>",
            "To: \(to.joined(separator: ", "))",
            "Subject: \(encSubject)",
            "Date: \(date)",
            "Message-ID: \(msgId)",
            "MIME-Version: 1.0",
            "Content-Type: text/plain; charset=UTF-8",
            "Content-Transfer-Encoding: base64",
        ]
        if let inReplyTo { headers.append("In-Reply-To: \(inReplyTo)") }
        if let references { headers.append("References: \(references)") }

        return headers.joined(separator: "\r\n") + "\r\n\r\n" + b64Body
    }

    private func smtpDate() -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US_POSIX")
        f.dateFormat = "EEE, dd MMM yyyy HH:mm:ss Z"
        return f.string(from: Date())
    }

    // MARK: - E/S y respuestas

    private func write(_ s: String) async throws { try await write(Data(s.utf8)) }

    private func write(_ data: Data) async throws {
        guard let conn = connection else { throw SMTPError.notConnected }
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            conn.send(content: data, completion: .contentProcessed { e in
                if let e { cont.resume(throwing: SMTPError.connection(e.localizedDescription)) }
                else { cont.resume() }
            })
        }
    }

    /// Lee una respuesta SMTP completa y comprueba que el código sea el esperado.
    private func expect(_ code: Int) async throws {
        guard let conn = connection else { throw SMTPError.notConnected }
        while true {
            // ¿Tenemos ya una línea final ("NNN " seguido de fin de línea)?
            if let line = completeResponseLine() {
                let codeStr = String(line.prefix(3))
                guard Int(codeStr) == code else { throw SMTPError.server(line) }
                return
            }
            let chunk = try await receive(conn)
            if chunk.isEmpty { throw SMTPError.connection("Conexión cerrada.") }
            inbuf.append(chunk)
        }
    }

    /// Devuelve la última línea final del buffer (código + espacio), o nil.
    private func completeResponseLine() -> String? {
        guard let text = String(data: inbuf, encoding: .utf8) else { return nil }
        let lines = text.components(separatedBy: "\r\n").filter { !$0.isEmpty }
        // Una respuesta final tiene la forma "NNN texto" (4º carácter = espacio).
        if let last = lines.last, last.count >= 4 {
            let idx = last.index(last.startIndex, offsetBy: 3)
            if last[idx] == " " { inbuf.removeAll(); return last }
        }
        return nil
    }

    private func receive(_ conn: NWConnection) async throws -> Data {
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Data, Error>) in
            conn.receive(minimumIncompleteLength: 1, maximumLength: 65536) { data, _, complete, error in
                if let error { cont.resume(throwing: SMTPError.connection(error.localizedDescription)); return }
                cont.resume(returning: data ?? Data())
            }
        }
    }
}
