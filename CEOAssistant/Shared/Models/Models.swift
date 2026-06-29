import Foundation

// MARK: - Grabación de reunión

/// Una grabación capturada en el Watch o el iPhone y su ciclo de vida hasta
/// convertirse en un resumen enviado por correo.
struct Recording: Identifiable, Codable, Hashable {
    enum Status: String, Codable {
        case recording          // en curso
        case pendingTransfer    // grabada en el Watch, esperando enviar al iPhone
        case transcribing       // transcribiendo audio
        case summarizing        // generando resumen con la IA
        case summarized         // resumen listo
        case emailed            // resumen enviado por correo
        case failed
    }

    let id: UUID
    var title: String
    var createdAt: Date
    var duration: TimeInterval
    /// Ruta local del fichero de audio (m4a). Puede ser nil si ya se descartó.
    var audioFileName: String?
    var transcript: String?
    var summary: MeetingSummary?
    var status: Status
    /// Si el procesado falló, el motivo concreto (para mostrarlo en la app).
    var errorText: String? = nil

    init(id: UUID = UUID(),
         title: String = "Reunión sin título",
         createdAt: Date = Date(),
         duration: TimeInterval = 0,
         audioFileName: String? = nil,
         transcript: String? = nil,
         summary: MeetingSummary? = nil,
         status: Status = .recording) {
        self.id = id
        self.title = title
        self.createdAt = createdAt
        self.duration = duration
        self.audioFileName = audioFileName
        self.transcript = transcript
        self.summary = summary
        self.status = status
    }
}

// MARK: - Resumen estructurado de la reunión

/// Resultado que la IA devuelve para cada reunión. Pensado para asesoría de CEO:
/// no sólo un resumen, sino decisiones, riesgos y acciones.
struct MeetingSummary: Codable, Hashable {
    var headline: String                 // una línea con la idea principal
    var summary: String                  // párrafo de resumen ejecutivo
    var keyDecisions: [String]           // decisiones tomadas
    var actionItems: [ActionItem]        // tareas con responsable y fecha
    var risks: [String]                  // riesgos / banderas rojas detectadas
    var followUps: [String]              // seguimientos sugeridos
    var sentiment: String                // tono general de la reunión

    static let empty = MeetingSummary(
        headline: "", summary: "", keyDecisions: [],
        actionItems: [], risks: [], followUps: [], sentiment: ""
    )

    init(headline: String, summary: String, keyDecisions: [String],
         actionItems: [ActionItem], risks: [String], followUps: [String],
         sentiment: String) {
        self.headline = headline; self.summary = summary
        self.keyDecisions = keyDecisions; self.actionItems = actionItems
        self.risks = risks; self.followUps = followUps; self.sentiment = sentiment
    }

    // Tolerante: si la IA omite un campo, usamos un valor vacío en vez de fallar.
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        headline = (try? c.decode(String.self, forKey: .headline)) ?? ""
        summary = (try? c.decode(String.self, forKey: .summary)) ?? ""
        keyDecisions = (try? c.decode([String].self, forKey: .keyDecisions)) ?? []
        actionItems = (try? c.decode([ActionItem].self, forKey: .actionItems)) ?? []
        risks = (try? c.decode([String].self, forKey: .risks)) ?? []
        followUps = (try? c.decode([String].self, forKey: .followUps)) ?? []
        sentiment = (try? c.decode(String.self, forKey: .sentiment)) ?? ""
    }
}

struct ActionItem: Codable, Hashable, Identifiable {
    var id: UUID = UUID()
    var task: String
    var owner: String?
    var dueDate: String?   // texto libre ("viernes", "antes de fin de mes")

    // La IA devuelve el JSON sin "id"; lo generamos al decodificar para que
    // SwiftUI tenga una identidad estable sin exigir el campo a la IA.
    enum CodingKeys: String, CodingKey { case task, owner, dueDate }

    init(task: String, owner: String? = nil, dueDate: String? = nil) {
        self.task = task; self.owner = owner; self.dueDate = dueDate
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        self.id = UUID()
        self.task = try c.decode(String.self, forKey: .task)
        self.owner = try c.decodeIfPresent(String.self, forKey: .owner)
        self.dueDate = try c.decodeIfPresent(String.self, forKey: .dueDate)
    }
}

// MARK: - Calendario

struct Appointment: Identifiable, Codable, Hashable {
    let id: String          // identificador del evento de EventKit
    var title: String
    var startDate: Date
    var endDate: Date
    var location: String?
    var notes: String?
    var attendees: [String]

    var isUpcoming: Bool { startDate > Date() }
    var minutesUntilStart: Int {
        max(0, Int(startDate.timeIntervalSinceNow / 60))
    }
}

// MARK: - Nexus (ERP): partes de trabajo y KPIs

/// Un parte de trabajo del taller (work order) de `/api/v1/work-orders`.
struct NexusWorkOrder: Identifiable, Codable, Hashable {
    let id: Int
    var orderNumber: String?
    var status: String?
    var priority: String?
    var customerName: String?
    var vehiclePlate: String?
    var workDescription: String?
    var total: Double?

    enum CodingKeys: String, CodingKey {
        case id
        case orderNumber = "order_number"
        case status, priority
        case customerName = "customer_name"
        case vehiclePlate = "vehicle_plate"
        case workDescription = "work_description"
        case total
    }
}

struct NexusWorkOrdersResponse: Codable {
    let items: [NexusWorkOrder]
}

/// KPIs financieros de la empresa (`/api/v1/kpis`).
struct NexusKPIs: Codable, Hashable {
    let anio: Int
    let ventas: Double
    let compras: Double
    let nominas: Double
    let beneficio: Double
    let margenPct: Double
    let crecimientoPct: Double
    let ventasAnterior: Double
    let porCobrar: Double
    let porPagar: Double

    enum CodingKeys: String, CodingKey {
        case anio, ventas, compras, nominas, beneficio
        case margenPct = "margen_pct"
        case crecimientoPct = "crecimiento_pct"
        case ventasAnterior = "ventas_anterior"
        case porCobrar = "por_cobrar"
        case porPagar = "por_pagar"
    }
}

// MARK: - Asesor de CEO (chat)

struct AdviceMessage: Identifiable, Codable, Hashable {
    enum Role: String, Codable { case user, assistant }
    let id: UUID
    var role: Role
    var content: String
    var createdAt: Date

    init(id: UUID = UUID(), role: Role, content: String, createdAt: Date = Date()) {
        self.id = id
        self.role = role
        self.content = content
        self.createdAt = createdAt
    }
}

// MARK: - Notas / tareas dictadas

struct QuickNote: Identifiable, Codable, Hashable {
    enum Kind: String, Codable, CaseIterable {
        case note, task, reminder, idea
    }
    let id: UUID
    var kind: Kind
    var text: String
    var createdAt: Date
    var done: Bool

    init(id: UUID = UUID(), kind: Kind = .note, text: String,
         createdAt: Date = Date(), done: Bool = false) {
        self.id = id
        self.kind = kind
        self.text = text
        self.createdAt = createdAt
        self.done = done
    }
}

// MARK: - Briefing diario

struct DailyBriefing: Codable, Hashable {
    var date: Date
    var greeting: String
    var agendaSummary: String          // resumen de las citas del día
    var priorities: [String]           // 3 prioridades del día
    var openActionItems: [String]      // acciones pendientes de reuniones previas
    var marketOrStrategicNote: String? // apunte estratégico opcional
}
