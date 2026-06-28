import Foundation

/// Construye el cuerpo del correo con el resumen de una reunión. El envío real
/// puede hacerse de dos formas (ver `README`):
///   1) MFMailComposeViewController en iOS (el usuario confirma con un toque).
///   2) Un backend propio (Backend/) que envía vía SMTP/SendGrid sin interacción.
struct EmailService {

    /// Asunto sugerido para el correo del resumen.
    static func subject(for recording: Recording) -> String {
        let title = recording.summary?.headline.isEmpty == false
            ? recording.summary!.headline
            : recording.title
        return "Resumen reunión · \(title)"
    }

    /// Cuerpo en texto plano (legible en cualquier cliente).
    static func plainBody(for recording: Recording) -> String {
        guard let s = recording.summary else {
            return recording.transcript ?? "Sin contenido."
        }
        var lines: [String] = []
        let df = DateFormatter()
        df.dateStyle = .long
        df.timeStyle = .short

        lines.append("RESUMEN DE REUNIÓN")
        lines.append(df.string(from: recording.createdAt))
        lines.append("Duración: \(Self.formatDuration(recording.duration))")
        lines.append("")
        lines.append("➤ \(s.headline)")
        lines.append("")
        lines.append(s.summary)
        lines.append("")

        if !s.keyDecisions.isEmpty {
            lines.append("DECISIONES")
            s.keyDecisions.forEach { lines.append("• \($0)") }
            lines.append("")
        }
        if !s.actionItems.isEmpty {
            lines.append("ACCIONES")
            for a in s.actionItems {
                var l = "• \(a.task)"
                if let o = a.owner { l += " — \(o)" }
                if let d = a.dueDate { l += " (\(d))" }
                lines.append(l)
            }
            lines.append("")
        }
        if !s.risks.isEmpty {
            lines.append("RIESGOS / ALERTAS")
            s.risks.forEach { lines.append("⚠︎ \($0)") }
            lines.append("")
        }
        if !s.followUps.isEmpty {
            lines.append("SEGUIMIENTOS")
            s.followUps.forEach { lines.append("→ \($0)") }
            lines.append("")
        }
        lines.append("Tono: \(s.sentiment)")
        lines.append("")
        lines.append("—")
        lines.append("Generado por Atlas, tu asistente ejecutivo.")
        return lines.joined(separator: "\n")
    }

    static func formatDuration(_ t: TimeInterval) -> String {
        let m = Int(t) / 60, s = Int(t) % 60
        return String(format: "%d:%02d", m, s)
    }
}
