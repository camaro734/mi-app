import Foundation

/// Utilidades para dejar legible el texto del correo: decodifica cabeceras
/// RFC 2047 (=?utf-8?B?...?=) y cuerpos en quoted-printable o base64.
/// Es "best effort": el correo real es muy variado y lo iremos afinando.
enum MIMEDecoder {

    // MARK: - Cabeceras (Subject, From…)

    static func decodeHeader(_ raw: String) -> String {
        let pattern = #"=\?([^?]+)\?([BbQq])\?([^?]*)\?="#
        guard let re = try? NSRegularExpression(pattern: pattern) else { return raw }
        let ns = raw as NSString
        let matches = re.matches(in: raw, range: NSRange(location: 0, length: ns.length))
        guard !matches.isEmpty else { return raw }

        var out = ""
        var idx = 0
        for m in matches {
            if m.range.location > idx {
                out += ns.substring(with: NSRange(location: idx, length: m.range.location - idx))
            }
            let charset = ns.substring(with: m.range(at: 1))
            let enc = ns.substring(with: m.range(at: 2)).uppercased()
            let text = ns.substring(with: m.range(at: 3))
            out += enc == "B"
                ? (decodeBase64(text, charset: charset) ?? text)
                : decodeQ(text, charset: charset, header: true)
            idx = m.range.location + m.range.length
        }
        if idx < ns.length {
            out += ns.substring(with: NSRange(location: idx, length: ns.length - idx))
        }
        return out.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    // MARK: - Cuerpos

    /// Intenta dejar el cuerpo legible detectando su codificación.
    static func bestEffortText(_ raw: String) -> String {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return "" }

        // ¿base64? (solo caracteres base64 y longitud apreciable)
        let compact = trimmed.replacingOccurrences(of: "\r\n", with: "")
                             .replacingOccurrences(of: "\n", with: "")
        if compact.count > 16,
           compact.range(of: #"^[A-Za-z0-9+/=\s]+$"#, options: .regularExpression) != nil,
           compact.count % 4 == 0,
           let decoded = decodeBase64(compact, charset: "utf-8"),
           looksLikeText(decoded) {
            return decoded
        }

        // ¿quoted-printable? (=XX o = al final de línea)
        if trimmed.range(of: #"=[0-9A-Fa-f]{2}"#, options: .regularExpression) != nil
            || trimmed.contains("=\r\n") || trimmed.contains("=\n") {
            return decodeQ(trimmed, charset: "utf-8", header: false)
        }

        return trimmed
    }

    private static func looksLikeText(_ s: String) -> Bool {
        guard !s.isEmpty else { return false }
        let printable = s.unicodeScalars.filter { $0.value >= 32 || $0 == "\n" || $0 == "\r" || $0 == "\t" }
        return Double(printable.count) / Double(s.unicodeScalars.count) > 0.8
    }

    // MARK: - Codificaciones

    private static func decodeBase64(_ text: String, charset: String) -> String? {
        let clean = text.replacingOccurrences(of: "\r\n", with: "")
                        .replacingOccurrences(of: "\n", with: "")
                        .replacingOccurrences(of: " ", with: "")
        guard let data = Data(base64Encoded: clean, options: .ignoreUnknownCharacters) else { return nil }
        return String(data: data, encoding: encoding(for: charset))
            ?? String(data: data, encoding: .utf8)
            ?? String(data: data, encoding: .isoLatin1)
    }

    private static func decodeQ(_ text: String, charset: String, header: Bool) -> String {
        var bytes = [UInt8]()
        let chars = Array(text)
        var i = 0
        while i < chars.count {
            let c = chars[i]
            if c == "=" && i + 2 < chars.count,
               let hi = chars[i + 1].hexDigitValue, let lo = chars[i + 2].hexDigitValue {
                bytes.append(UInt8(hi * 16 + lo)); i += 3
            } else if c == "=" && i + 1 < chars.count && (chars[i + 1] == "\r" || chars[i + 1] == "\n") {
                // "soft line break": se omite
                i += (i + 2 < chars.count && chars[i + 1] == "\r" && chars[i + 2] == "\n") ? 3 : 2
            } else if c == "_" && header {
                bytes.append(0x20); i += 1   // en cabeceras Q, '_' es espacio
            } else {
                bytes.append(contentsOf: Array(String(c).utf8)); i += 1
            }
        }
        let data = Data(bytes)
        return String(data: data, encoding: encoding(for: charset))
            ?? String(data: data, encoding: .utf8)
            ?? String(data: data, encoding: .isoLatin1)
            ?? text
    }

    private static func encoding(for charset: String) -> String.Encoding {
        switch charset.lowercased() {
        case "utf-8", "utf8": return .utf8
        case "iso-8859-1", "latin1", "iso8859-1": return .isoLatin1
        case "windows-1252", "cp1252": return .windowsCP1252
        case "us-ascii", "ascii": return .ascii
        default: return .utf8
        }
    }
}
