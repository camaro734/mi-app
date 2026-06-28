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
    private let nexus = NexusService()
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
            #if canImport(Speech)
            return AppleSpeechTranscriber()
            #else
            // En watchOS no existe el framework Speech: la transcripción la hace
            // el iPhone. Como salvaguarda usamos Whisper si se invocara aquí.
            return WhisperTranscriber(apiKeyProvider: { SecureStore.get(.openAIAPIKey) })
            #endif
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
        let context = await companyContextForAdvisor()
        do {
            let answer = try await ai.reply(to: conversation, context: context)
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
        // 1) Si hay sesión en Nexus (ERP), la agenda REAL de la empresa viene de
        //    ahí Y SOLO de ahí: no caemos al calendario del iPhone (eso ocultaría
        //    un error y daría la impresión de que "usa el calendario del móvil").
        if NexusService.isLoggedIn {
            do {
                appointments = try await nexus.upcomingAppointments(dias: 7)
                scheduleAppointmentReminders(appointments)
                statusMessage = nil
            } catch {
                appointments = []
                statusMessage = "Nexus: \(error.localizedDescription)"
            }
            return
        }
        // 2) Sin sesión en Nexus: calendario local del dispositivo (EventKit).
        guard await calendar.requestAccess() else {
            if appointments.isEmpty { statusMessage = "Sin permiso de calendario." }
            return
        }
        appointments = calendar.upcomingAppointments(days: 7)
        scheduleAppointmentReminders(appointments)
    }

    private func scheduleAppointmentReminders(_ appts: [Appointment]) {
        for appt in appts.prefix(10) where appt.isUpcoming {
            NotificationManager.shared.scheduleAppointmentReminder(appt)
        }
    }

    var nextAppointment: Appointment? {
        appointments.first { $0.isUpcoming }
    }

    // MARK: - Nexus (ERP)

    /// ¿Hay sesión activa con el ERP Nexus? La UI lo observa.
    @Published var nexusConnected = NexusService.isLoggedIn

    /// Inicia sesión en Nexus y refresca la agenda. Devuelve si tuvo éxito.
    func connectNexus(username: String, password: String) async -> Bool {
        do {
            try await nexus.login(username: username, password: password)
            nexusConnected = true
            statusMessage = "Conectado a Nexus."
            await refreshCalendar()
            return true
        } catch {
            statusMessage = error.localizedDescription
            nexusConnected = false
            return false
        }
    }

    /// Cierra la sesión de Nexus y vuelve al calendario del dispositivo.
    func disconnectNexus() {
        NexusService.logout()
        nexusConnected = false
        Task { await refreshCalendar() }
    }

    /// Diagnóstico legible de la conexión con Nexus (para Ajustes).
    func testNexus() async -> String {
        guard NexusService.isLoggedIn else {
            return "❌ No hay sesión guardada en Nexus (falta el token). Vuelve a conectar abajo."
        }
        do {
            let citas = try await nexus.upcomingAppointments(dias: 7)
            let partes = (try? await nexus.workOrders(limit: 50))?.count ?? 0
            return "✅ Conexión OK.\nCitas próximas (7 días): \(citas.count)\nPartes activos: \(partes)\nURL: \(NexusService.baseURL)"
        } catch {
            return "⚠️ Conectado, pero al leer las citas: \(error.localizedDescription)\nURL: \(NexusService.baseURL)"
        }
    }

    /// Contexto en vivo (citas + partes de Nexus) que se añade al prompt del
    /// Asesor para que pueda responder con datos reales de la empresa.
    private func companyContextForAdvisor() async -> String? {
        guard NexusService.isLoggedIn else { return nil }
        var blocks: [String] = []

        // Próximas citas (refresca para tenerlas al día).
        await refreshCalendar()
        let df = DateFormatter()
        df.locale = Locale(identifier: "es_ES")
        df.dateFormat = "EEE d MMM HH:mm"
        if appointments.isEmpty {
            blocks.append("## Próximas citas (7 días)\nNo hay citas registradas en los próximos 7 días.")
        } else {
            let lines = appointments.prefix(15).map { a -> String in
                var l = "- \(df.string(from: a.startDate)): \(a.title)"
                if let loc = a.location, !loc.isEmpty { l += " · \(loc)" }
                if let n = a.notes, !n.isEmpty { l += " · \(n)" }
                return l
            }
            blocks.append("## Próximas citas (7 días)\n" + lines.joined(separator: "\n"))
        }

        // Partes de trabajo activos (no incluye citas).
        if let partes = try? await nexus.workOrders(limit: 30), !partes.isEmpty {
            let lines = partes.prefix(20).map { p -> String in
                let num = p["order_number"] as? String ?? "—"
                let cli = p["customer_name"] as? String ?? ""
                let est = p["status"] as? String ?? ""
                return "- \(num) · \(cli) · \(est)"
            }
            blocks.append("## Partes de trabajo activos (\(partes.count))\n" + lines.joined(separator: "\n"))
        }

        return blocks.isEmpty ? nil : blocks.joined(separator: "\n\n")
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

    /// Lectura ligera del historial desde disco, sin inicializar el store
    /// completo. La usan los App Intents (Siri/Atajos).
    static func loadSnapshotRecordings() -> [Recording] {
        let url = FileManager.default
            .urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("assistant-store.json")
        guard let data = try? Data(contentsOf: url),
              let snap = try? JSONDecoder().decode(Snapshot.self, from: data) else {
            return []
        }
        return snap.recordings
    }
}
