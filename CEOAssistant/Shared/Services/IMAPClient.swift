import Foundation
import Network

/// Garantiza que una continuación se reanude una sola vez (los handlers de
/// NWConnection pueden llamarse varias veces).
final class ResumeOnce {
    private var done = false
    private let lock = NSLock()
    func run(_ block: () -> Void) {
        lock.lock(); let should = !done; if should { done = true }; lock.unlock()
        if should { block() }
    }
}

/// Cliente IMAP mínimo (sobre TLS) para LEER correo: login, seleccionar una
/// carpeta y traer los mensajes recientes (cabeceras + texto). Pensado para
/// servidores tipo Dovecot/cPanel como mail.cmghidraulica.com.
///
/// No es un cliente IMAP completo: implementa solo lo que Atlas necesita para
/// resumir la bandeja y aprender el estilo de los enviados. Toda la operación
/// es de solo lectura.
actor IMAPClient {

    struct RawMessage {
        var uid: String
        var from: String
        var to: String
        var subject: String
        var date: String
        var body: String
    }

    enum IMAPError: LocalizedError {
        case connection(String)
        case server(String)
        case notConnected
        var errorDescription: String? {
            switch self {
            case .connection(let m): return "No se pudo conectar al correo: \(m)"
            case .server(let m): return "El servidor de correo respondió: \(m)"
            case .notConnected: return "Sin conexión con el correo."
            }
        }
    }

    private let host: String
    private let port: UInt16
    private var connection: NWConnection?
    private var inbuf = Data()
    private var tagN = 0

    init(host: String, port: UInt16 = 993) {
        self.host = host
        self.port = port
    }

    // MARK: - Conexión

    func connect() async throws {
        let tls = NWProtocolTLS.Options()
        let params = NWParameters(tls: tls)
        let conn = NWConnection(
            host: NWEndpoint.Host(host),
            port: NWEndpoint.Port(rawValue: port)!,
            using: params)
        connection = conn

        let once = ResumeOnce()
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            conn.stateUpdateHandler = { state in
                switch state {
                case .ready: once.run { cont.resume() }
                case .failed(let e): once.run { cont.resume(throwing: IMAPError.connection(e.localizedDescription)) }
                case .waiting(let e): once.run { cont.resume(throwing: IMAPError.connection(e.localizedDescription)) }
                default: break
                }
            }
            conn.start(queue: .global(qos: .userInitiated))
        }
        // Saludo del servidor (* OK ...)
        _ = try await readUntilTagged(tag: nil)
    }

    func login(user: String, password: String) async throws {
        _ = try await command("LOGIN \(quoted(user)) \(quoted(password))")
    }

    /// Selecciona una carpeta y devuelve el número de mensajes (EXISTS).
    @discardableResult
    func select(_ mailbox: String) async throws -> Int {
        let lines = try await command("SELECT \(quoted(mailbox))")
        for l in lines {
            // p. ej.  "* 1234 EXISTS"
            let parts = l.split(separator: " ")
            if parts.count >= 3, parts[0] == "*", parts[2].uppercased() == "EXISTS",
               let n = Int(parts[1]) {
                return n
            }
        }
        return 0
    }

    /// Trae los últimos `count` mensajes de la carpeta seleccionada.
    func fetchRecent(count: Int, mailbox: String = "INBOX") async throws -> [RawMessage] {
        let total = try await select(mailbox)
        guard total > 0 else { return [] }
        let first = max(1, total - count + 1)
        // Cabeceras + cuerpo de texto, sin marcar como leído (.PEEK).
        let lines = try await command(
            "FETCH \(first):\(total) (UID BODY.PEEK[HEADER.FIELDS (FROM TO SUBJECT DATE)] BODY.PEEK[1])")
        let msgs = parseFetch(lines)
        return msgs.reversed()   // más recientes primero
    }

    func logout() async {
        _ = try? await command("LOGOUT")
        connection?.cancel()
        connection = nil
    }

    // MARK: - Núcleo de comandos / lectura con literales

    private func nextTag() -> String { tagN += 1; return "A\(tagN)" }

    @discardableResult
    private func command(_ cmd: String) async throws -> [String] {
        guard let conn = connection else { throw IMAPError.notConnected }
        let tag = nextTag()
        let data = Data("\(tag) \(cmd)\r\n".utf8)
        try await send(conn, data)
        return try await readUntilTagged(tag: tag)
    }

    private func send(_ conn: NWConnection, _ data: Data) async throws {
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Void, Error>) in
            conn.send(content: data, completion: .contentProcessed { error in
                if let error { cont.resume(throwing: IMAPError.connection(error.localizedDescription)) }
                else { cont.resume() }
            })
        }
    }

    private func receive(_ conn: NWConnection) async throws -> Data {
        try await withCheckedThrowingContinuation { (cont: CheckedContinuation<Data, Error>) in
            conn.receive(minimumIncompleteLength: 1, maximumLength: 65536) { data, _, isComplete, error in
                if let error { cont.resume(throwing: IMAPError.connection(error.localizedDescription)); return }
                if let data, !data.isEmpty { cont.resume(returning: data); return }
                if isComplete { cont.resume(returning: Data()) ; return }
                cont.resume(returning: Data())
            }
        }
    }

    /// Lee respuesta completa respetando literales {N}. Si `tag` es nil, lee solo
    /// una línea (saludo). Devuelve las líneas de texto (los literales se anexan
    /// a la línea que los introduce, separados por \n para poder parsearlos).
    private func readUntilTagged(tag: String?) async throws -> [String] {
        guard let conn = connection else { throw IMAPError.notConnected }
        var lines: [String] = []

        while true {
            // Asegura tener al menos una línea completa en el buffer.
            while !inbuf.contains(0x0A) {
                let chunk = try await receive(conn)
                if chunk.isEmpty { break }
                inbuf.append(chunk)
            }
            guard let nl = inbuf.firstIndex(of: 0x0A) else { break }
            var lineData = inbuf.subdata(in: inbuf.startIndex..<nl)
            inbuf.removeSubrange(inbuf.startIndex...nl)
            if lineData.last == 0x0D { lineData.removeLast() }
            var line = String(decoding: lineData, as: UTF8.self)

            // ¿Termina la línea anunciando un literal {N}?
            if let lit = literalLength(in: line) {
                var literal = Data()
                while literal.count < lit {
                    if inbuf.isEmpty {
                        let chunk = try await receive(conn)
                        if chunk.isEmpty { break }
                        inbuf.append(chunk)
                    }
                    let take = min(lit - literal.count, inbuf.count)
                    literal.append(inbuf.prefix(take))
                    inbuf.removeFirst(take)
                }
                let literalText = String(decoding: literal, as: UTF8.self)
                line += "\n" + literalText
                lines.append(line)
                continue
            }

            lines.append(line)

            if let tag {
                if line.hasPrefix("\(tag) ") {
                    let upper = line.uppercased()
                    if upper.contains("\(tag) OK") { return lines }
                    if upper.contains("\(tag) NO") || upper.contains("\(tag) BAD") {
                        throw IMAPError.server(line)
                    }
                }
            } else {
                // Solo saludo: una línea basta.
                return lines
            }
        }
        if tag != nil { throw IMAPError.connection("Conexión cerrada por el servidor.") }
        return lines
    }

    /// Devuelve N si la línea acaba en "{N}" (literal IMAP).
    private func literalLength(in line: String) -> Int? {
        guard line.hasSuffix("}"), let open = line.lastIndex(of: "{") else { return nil }
        let numStr = line[line.index(after: open)..<line.index(before: line.endIndex)]
        return Int(numStr)
    }

    private func quoted(_ s: String) -> String {
        "\"" + s.replacingOccurrences(of: "\\", with: "\\\\")
                .replacingOccurrences(of: "\"", with: "\\\"") + "\""
    }

    // MARK: - Parseo de FETCH

    private func parseFetch(_ lines: [String]) -> [RawMessage] {
        var result: [RawMessage] = []
        var current: RawMessage?

        func flush() { if let c = current { result.append(c) }; current = nil }

        for raw in lines {
            // Una respuesta de mensaje empieza por "* <n> FETCH (".
            if raw.range(of: #"^\* \d+ FETCH "#, options: .regularExpression) != nil {
                flush()
                current = RawMessage(uid: "", from: "", to: "", subject: "", date: "", body: "")
                if let uid = firstMatch(in: raw, pattern: #"UID (\d+)"#) { current?.uid = uid }
            }
            guard current != nil else { continue }

            // Las cabeceras y el cuerpo vienen como literal tras "\n".
            if let nl = raw.firstIndex(of: "\n") {
                let header = String(raw[..<nl])
                let payload = String(raw[raw.index(after: nl)...])
                if header.uppercased().contains("HEADER.FIELDS") {
                    applyHeaders(payload, to: &current!)
                } else if header.contains("BODY[1]") || header.uppercased().contains("BODY[TEXT]") {
                    current?.body = MIMEDecoder.bestEffortText(payload)
                }
            }
        }
        flush()
        return result
    }

    private func applyHeaders(_ text: String, to msg: inout RawMessage) {
        for line in text.split(separator: "\r\n", omittingEmptySubsequences: true)
                        .flatMap({ $0.split(separator: "\n") }) {
            let l = String(line)
            if let v = headerValue(l, "From") { msg.from = MIMEDecoder.decodeHeader(v) }
            else if let v = headerValue(l, "To") { msg.to = MIMEDecoder.decodeHeader(v) }
            else if let v = headerValue(l, "Subject") { msg.subject = MIMEDecoder.decodeHeader(v) }
            else if let v = headerValue(l, "Date") { msg.date = v }
        }
    }

    private func headerValue(_ line: String, _ key: String) -> String? {
        let prefix = key + ":"
        guard line.lowercased().hasPrefix(prefix.lowercased()) else { return nil }
        return line.dropFirst(prefix.count).trimmingCharacters(in: .whitespaces)
    }

    private func firstMatch(in s: String, pattern: String) -> String? {
        guard let re = try? NSRegularExpression(pattern: pattern),
              let m = re.firstMatch(in: s, range: NSRange(s.startIndex..., in: s)),
              m.numberOfRanges > 1, let r = Range(m.range(at: 1), in: s) else { return nil }
        return String(s[r])
    }
}
