import AppIntents
import SwiftUI

// MARK: - Enrutador para acciones que abren la app

/// Permite que un intent "abra la app en X pantalla". La UI lo observa.
@MainActor
final class AtlasIntentRouter: ObservableObject {
    static let shared = AtlasIntentRouter()
    enum Action: Equatable { case record, briefing, advisor }
    @Published var pendingAction: Action?
    private init() {}
}

// MARK: - Preguntar a Atlas (responde por voz, sin abrir la app)

struct AskAtlasIntent: AppIntent {
    static var title: LocalizedStringResource = "Preguntar a Atlas"
    static var description = IntentDescription(
        "Haz una consulta de negocio a tu asesor Atlas y escucha la respuesta.")

    @Parameter(title: "Pregunta")
    var question: String

    static var parameterSummary: some ParameterSummary {
        Summary("Preguntar a Atlas: \(\.$question)")
    }

    func perform() async throws -> some IntentResult & ProvidesDialog & ReturnsValue<String> {
        let ai = ClaudeAIService(apiKeyProvider: { SecureStore.get(.anthropicAPIKey) })
        let answer = try await ai.reply(to: [AdviceMessage(role: .user, content: question)])
        return .result(value: answer, dialog: "\(answer)")
    }
}

// MARK: - Resumir la última reunión (responde por voz)

struct SummarizeLastMeetingIntent: AppIntent {
    static var title: LocalizedStringResource = "Resumir mi última reunión"
    static var description = IntentDescription(
        "Te dice el resumen de la última reunión que has grabado.")

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let recordings = AssistantStore.loadSnapshotRecordings()
        guard let last = recordings.first(where: { $0.summary != nil }),
              let s = last.summary, !s.headline.isEmpty else {
            return .result(dialog: "Aún no tienes ninguna reunión resumida.")
        }
        var spoken = "\(s.headline). \(s.summary)"
        if !s.actionItems.isEmpty {
            let tasks = s.actionItems.prefix(3).map { $0.task }.joined(separator: "; ")
            spoken += " Acciones pendientes: \(tasks)."
        }
        return .result(dialog: "\(spoken)")
    }
}

// MARK: - Grabar una reunión (abre la app y empieza a grabar)

struct RecordMeetingIntent: AppIntent {
    static var title: LocalizedStringResource = "Grabar una reunión"
    static var description = IntentDescription("Abre Atlas listo para grabar.")
    static var openAppWhenRun = true

    @MainActor
    func perform() async throws -> some IntentResult {
        AtlasIntentRouter.shared.pendingAction = .record
        return .result()
    }
}

// MARK: - Briefing de hoy (abre la app en la pantalla Hoy)

struct DailyBriefingIntent: AppIntent {
    static var title: LocalizedStringResource = "Mi briefing de hoy"
    static var description = IntentDescription("Abre tu resumen del día en Atlas.")
    static var openAppWhenRun = true

    @MainActor
    func perform() async throws -> some IntentResult {
        AtlasIntentRouter.shared.pendingAction = .briefing
        return .result()
    }
}

// MARK: - Frases para Siri y la app Atajos

struct AtlasShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AskAtlasIntent(),
            phrases: [
                "Pregunta a \(.applicationName)",
                "Consulta a \(.applicationName)"
            ],
            shortTitle: "Preguntar a Atlas",
            systemImageName: "brain.head.profile")

        AppShortcut(
            intent: SummarizeLastMeetingIntent(),
            phrases: [
                "Resume mi última reunión con \(.applicationName)",
                "\(.applicationName) resume mi reunión"
            ],
            shortTitle: "Resumir reunión",
            systemImageName: "waveform")

        AppShortcut(
            intent: RecordMeetingIntent(),
            phrases: [
                "Graba una reunión con \(.applicationName)",
                "Empieza a grabar con \(.applicationName)"
            ],
            shortTitle: "Grabar reunión",
            systemImageName: "mic.fill")

        AppShortcut(
            intent: DailyBriefingIntent(),
            phrases: [
                "Dame mi briefing con \(.applicationName)",
                "\(.applicationName) qué tengo hoy"
            ],
            shortTitle: "Briefing de hoy",
            systemImageName: "sun.max.fill")
    }
}
