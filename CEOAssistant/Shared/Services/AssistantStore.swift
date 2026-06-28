import Foundation
import SwiftUI

/// Estado central de la app y orquestador de los servicios. La UI (iOS y Watch)
/// observa este objeto. Persiste en disco como JSON simple.
@MainActor
final class AssistantStore: ObservableObject {

    // MARK: Estado publicado
    @Published var recordings: [Recording] = []
    @Published var appointments: [Appointment] = []
    @Published var conversation: [AdviceMessage] = []
    @Published var notes: [QuickNote] = []
    @Published var todayBriefing: DailyBriefing?
    @Published var statusMessage: String?
    @Published var isBusy = false

    // MARK: Servicios
    private let ai: AIService
    private let calendar = CalendarService()
    private lazy var transcriber: TranscriptionService = makeTranscriber()

    init(ai: AIService? = nil) {
        self.ai = ai ?? ClaudeAIService(
            apiKeyProvider: { SecureStore.get(.anthropicAPIKey) })
        load()
        wireWatchConnectivity()
    }

    private func makeTranscriber() -> TranscriptionService {
        let raw = UserDefaults.standard.string(forKey: AppConfig.Keys.transcriptionEngine)
        let engine = TranscriptionEngine(rawValue: raw ?? "") ?? .appleOnDevice
        switch engine {
        case .appleOnDevice:
            return AppleSpeechTranscriber()
        case .whisperOpenAI:
            return WhisperTranscriber(apiKeyProvider: { SecureStore.get(.openAIAPIKey) })
        }
    }

    // MARK: - Pipeline de grabación → transcripción → resumen → correo

    /// Procesa una grabación completa. Pensado para ejecutarse en el iPhone.
    func process(recording: Recording, audioURL: URL) async {
        var rec = recording
        upsert(rec)
        do {
            // 1) Transcribir
            setStatus(rec, .transcribing, "Transcribiendo…")
            let transcript = try await transcriber.transcribe(fileURL: audioURL)
            rec.transcript = transcript
            rec.status = .transcribing
            upsert(rec)

            // 2) Resumir con la IA
            setStatus(rec, .summarizing, "Resumiendo con IA…")
            let raw = try await ai.complete(
                system: nil, user: Prompts.meetingSummary(transcript: transcript))
            let summary = try ai.decodeJSON(MeetingSummary.self, from: raw)
            rec.summary = summary
            if rec.title == "Reunión sin título", !summary.headline.isEmpty {
                rec.title = summary.headline
            }
            rec.status = .summarized
            upsert(rec)

            // 3) Correo (auto o manual según ajuste)
            statusMessage = "Resumen listo."
        } catch {
            rec.status = .failed
            upsert(rec)
            statusMessage = "Error: \(error.localizedDescription)"
        }
    }

    private func setStatus(_ rec: Recording, _ status: Recording.Status, _ msg: String) {
        var r = rec; r.status = status; upsert(r); statusMessage = msg
    }

    func upsert(_ recording: Recording) {
        if let i = recordings.firstIndex(where: { $0.id == recording.id }) {
            recordings[i] = recording
        } else {
            recordings.insert(recording, at: 0)
        }
        save()
    }

    func deleteRecording(_ recording: Recording) {
        recordings.removeAll { $0.id == recording.id }
        if let name = recording.audioFileName {
            try? FileManager.default.removeItem(
                at: AudioRecorder.recordingsDirectory.appendingPathComponent(name))
        }
        save()
    }

    // MARK: - Asesor de CEO

    func ask(_ question: String) async {
        let userMsg = AdviceMessage(role: .user, content: question)
        conversation.append(userMsg)
        isBusy = true
        defer { isBusy = false }
        do {
            let answer = try await ai.reply(to: conversation)
            conversation.append(AdviceMessage(role: .assistant, content: answer))
        } catch {
            conversation.append(AdviceMessage(
                role: .assistant,
                content: "No he podido responder: \(error.localizedDescription)"))
        }
        save()
    }

    /// Respuesta puntual para el Watch (no se añade al historial del chat).
    func replyForWatch(_ messages: [AdviceMessage]) async throws -> String {
        try await ai.reply(to: messages)
    }

    // MARK: - Calendario

    func refreshCalendar() async {
        guard await calendar.requestAccess() else {
            statusMessage = "Sin permiso de calendario."
            return
        }
        let appts = calendar.upcomingAppointments(days: 7)
        appointments = appts
        // Programa avisos para las próximas citas.
        for appt in appts.prefix(10) where appt.isUpcoming {
            NotificationManager.shared.scheduleAppointmentReminder(appt)
        }
    }

    var nextAppointment: Appointment? {
        appointments.first { $0.isUpcoming }
    }

    // MARK: - Briefing diario

    func generateBriefing() async {
        isBusy = true
        defer { isBusy = false }
        await refreshCalendar()

        let df = DateFormatter()
        df.dateFormat = "EEEE d 'de' MMMM"
        df.locale = Locale(identifier: "es_ES")
        let dateText = df.string(from: Date())

        let apptText = appointments.prefix(6).map { a -> String in
            let t = DateFormatter.localizedString(from: a.startDate,
                                                  dateStyle: .none, timeStyle: .short)
            return "\(t) — \(a.title)"
        }.joined(separator: "\n")

        let openActions = recordings
            .compactMap { $0.summary?.actionItems }
            .flatMap { $0 }
            .prefix(8)
            .map { "• \($0.task)" }
            .joined(separator: "\n")

        do {
            let raw = try await ai.complete(
                system: Prompts.ceoAdvisorSystem,
                user: Prompts.dailyBriefing(dateText: dateText,
                                            appointments: apptText,
                                            openActions: openActions))
            struct BriefingPayload: Codable {
                var greeting: String
                var agendaSummary: String
                var priorities: [String]
                var openActionItems: [String]
                var marketOrStrategicNote: String?
            }
            let p = try ai.decodeJSON(BriefingPayload.self, from: raw)
            todayBriefing = DailyBriefing(
                date: Date(), greeting: p.greeting, agendaSummary: p.agendaSummary,
                priorities: p.priorities, openActionItems: p.openActionItems,
                marketOrStrategicNote: p.marketOrStrategicNote)
        } catch {
            statusMessage = "No se pudo generar el briefing: \(error.localizedDescription)"
        }
    }

    // MARK: - Notas / tareas dictadas

    func addDictatedNote(_ dictation: String) async {
        do {
            let raw = try await ai.complete(
                system: nil, user: Prompts.classifyNote(dictation: dictation))
            struct NotePayload: Codable { var kind: String; var text: String }
            let p = try ai.decodeJSON(NotePayload.self, from: raw)
            let kind = QuickNote.Kind(rawValue: p.kind) ?? .note
            notes.insert(QuickNote(kind: kind, text: p.text), at: 0)
        } catch {
            // Si falla la IA, guardamos el texto crudo.
            notes.insert(QuickNote(text: dictation), at: 0)
        }
        save()
    }

    func toggleNote(_ note: QuickNote) {
        if let i = notes.firstIndex(where: { $0.id == note.id }) {
            notes[i].done.toggle()
            save()
        }
    }

    // MARK: - WatchConnectivity (lado iPhone)

    private func wireWatchConnectivity() {
        #if os(iOS)
        WatchConnectivityManager.shared.onReceiveAudio = { [weak self] url, meta in
            guard let self else { return }
            Task { @MainActor in
                let title = meta["title"] as? String ?? "Reunión sin título"
                let duration = meta["duration"] as? TimeInterval ?? 0
                let rec = Recording(title: title, duration: duration,
                                    audioFileName: url.lastPathComponent,
                                    status: .transcribing)
                await self.process(recording: rec, audioURL: url)
            }
        }
        WatchConnectivityManager.shared.onReceiveMessage = { [weak self] msg in
            guard let self, let dictation = msg["dictation"] as? String else { return }
            Task { @MainActor in await self.addDictatedNote(dictation) }
        }
        // El Watch pregunta; el iPhone responde con la IA (tiene la API key).
        WatchConnectivityManager.shared.onAdviceRequest = { [weak self] question in
            guard let self else { return "Asistente no disponible." }
            do {
                let msgs = [AdviceMessage(role: .user, content: question)]
                return try await self.replyForWatch(msgs)
            } catch {
                return "No he podido responder: \(error.localizedDescription)"
            }
        }
        #endif
    }

    // MARK: - Persistencia (JSON en Documents)

    private struct Snapshot: Codable {
        var recordings: [Recording]
        var conversation: [AdviceMessage]
        var notes: [QuickNote]
    }

    private var storeURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("assistant-store.json")
    }

    func save() {
        let snap = Snapshot(recordings: recordings,
                            conversation: conversation, notes: notes)
        if let data = try? JSONEncoder().encode(snap) {
            try? data.write(to: storeURL, options: .atomic)
        }
    }

    func load() {
        guard let data = try? Data(contentsOf: storeURL),
              let snap = try? JSONDecoder().decode(Snapshot.self, from: data) else {
            return
        }
        recordings = snap.recordings
        conversation = snap.conversation
        notes = snap.notes
    }
}
