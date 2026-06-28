import SwiftUI
import MessageUI

/// Envoltorio de `MFMailComposeViewController` para enviar el resumen por correo
/// con un toque de confirmación del usuario (no requiere backend).
struct MailComposeView: UIViewControllerRepresentable {
    let subject: String
    let body: String
    let recipients: [String]
    @Environment(\.dismiss) private var dismiss

    func makeUIViewController(context: Context) -> UIViewController {
        guard MFMailComposeViewController.canSendMail() else {
            // Si no hay cuenta de correo configurada, mostramos un aviso simple.
            let vc = UIViewController()
            DispatchQueue.main.async {
                let alert = UIAlertController(
                    title: "Sin cuenta de correo",
                    message: "Configura una cuenta en la app Mail para enviar resúmenes, o usa el backend automático.",
                    preferredStyle: .alert)
                alert.addAction(.init(title: "OK", style: .default) { _ in dismiss() })
                vc.present(alert, animated: true)
            }
            return vc
        }
        let mail = MFMailComposeViewController()
        mail.mailComposeDelegate = context.coordinator
        mail.setSubject(subject)
        mail.setMessageBody(body, isHTML: false)
        mail.setToRecipients(recipients.filter { !$0.isEmpty })
        return mail
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(dismiss: dismiss) }

    final class Coordinator: NSObject, MFMailComposeViewControllerDelegate {
        let dismiss: DismissAction
        init(dismiss: DismissAction) { self.dismiss = dismiss }
        func mailComposeController(_ controller: MFMailComposeViewController,
                                   didFinishWith result: MFMailComposeResult,
                                   error: Error?) {
            dismiss()
        }
    }
}
