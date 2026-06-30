import Foundation

/// Servicio de correo de alto nivel: configura los clientes IMAP/SMTP a partir
/// de los ajustes del usuario, lee la bandeja, aprende el estilo de los enviados
/// y envía (solo tras aprobación explícita en la UI).
final class MailService {

    struct Config {
        var host: String
        var imapPort: UInt16
        var smtpPort: UInt16
        var user: String          // dirección de correo completa
        var password: String
        var fromName: String
        var fromAddress: String { user }
    }

    static var isConfigured: Bool {
        guard let c = config else { return false }
        return !c.host.isEmpty && !c.user.isEmpty && !c.password.isEmpty
    }

    static var config: Config? {
        let d = UserDefaults.standard
        let host = d.string(forKey: AppConfig.Keys.mailHost) ?? ""
        let user = d.string(forKey: AppConfig.Keys.mailUser) ?? ""
        let pass = SecureStore.get(.mailPassword) ?? ""
        let name = d.string(forKey: AppConfig.Keys.mailFromName) ?? ""
        let imap = UInt16(d.integer(forKey: AppConfig.Keys.mailIMAPPort))
        let smtp = UInt16(d.integer(forKey: AppConfig.Keys.mailSMTPPort))
        return Config(host: host,
                      imapPort: imap == 0 ? 993 : imap,
                      smtpPort: smtp == 0 ? 465 : smtp,
                      user: user, password: pass,
                      fromName: name.isEmpty ? user : name)
    }

    private var cfg: Config {
        Self.config ?? Config(host: "", imapPort: 993, smtpPort: 465,
                              user: "", password: "", fromName: "")
    }

    // MARK: - Lectura

    func fetchInbox(count: Int = 15) async throws -> [EmailMessage] {
        let c = cfg
        let imap = IMAPClient(host: c.host, port: c.imapPort)
        try await imap.connect()
        try await imap.login(user: c.user, password: c.password)
        let raw = try await imap.fetchRecent(count: count, mailbox: "INBOX")
        await imap.logout()
        return raw.map {
            EmailMessage(id: $0.uid, from: $0.from, to: $0.to,
                         subject: $0.subject.isEmpty ? "(sin asunto)" : $0.subject,
                         dateText: $0.date, body: $0.body, summary: nil)
        }
    }

    /// Cuerpos de correos ENVIADOS para que la IA aprenda el estilo del usuario.
    func fetchSentSamples(count: Int = 8) async throws -> [String] {
        let c = cfg
        let imap = IMAPClient(host: c.host, port: c.imapPort)
        try await imap.connect()
        try await imap.login(user: c.user, password: c.password)
        defer { Task { await imap.logout() } }
        for folder in ["INBOX.Sent", "Sent", "Sent Items",
                       "INBOX.Sent Items", "INBOX.Sent Messages", "INBOX.Enviados", "Enviados"] {
            if let raw = try? await imap.fetchRecent(count: count, mailbox: folder), !raw.isEmpty {
                return raw.map { $0.body }
                    .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                    .filter { $0.count > 20 }
            }
        }
        return []
    }

    // MARK: - Envío (solo tras aprobación del usuario)

    func send(to: [String], subject: String, body: String,
              inReplyTo: String? = nil, references: String? = nil) async throws {
        let c = cfg
        let smtp = SMTPClient(host: c.host, port: c.smtpPort)
        try await smtp.connect()
        try await smtp.login(user: c.user, password: c.password)
        try await smtp.sendMessage(fromAddress: c.fromAddress, fromName: c.fromName,
                                   to: to, subject: subject, body: body,
                                   inReplyTo: inReplyTo, references: references)
        await smtp.quit()
    }
}
