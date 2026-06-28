import WidgetKit
import SwiftUI

// MARK: - Datos de la complicación

struct NextAppointmentEntry: TimelineEntry {
    let date: Date
    let title: String
    let start: Date?
}

struct NextAppointmentProvider: TimelineProvider {
    func placeholder(in context: Context) -> NextAppointmentEntry {
        NextAppointmentEntry(date: Date(), title: "Reunión", start: Date().addingTimeInterval(3600))
    }

    func getSnapshot(in context: Context,
                     completion: @escaping (NextAppointmentEntry) -> Void) {
        completion(loadEntry())
    }

    func getTimeline(in context: Context,
                     completion: @escaping (Timeline<NextAppointmentEntry>) -> Void) {
        let entry = loadEntry()
        // Refresca cada ~15 minutos.
        let refresh = Calendar.current.date(byAdding: .minute, value: 15, to: Date())
            ?? Date().addingTimeInterval(900)
        completion(Timeline(entries: [entry], policy: .after(refresh)))
    }

    private func loadEntry() -> NextAppointmentEntry {
        // Lee el calendario directamente; si no hay acceso, devuelve vacío.
        if let a = CalendarService().nextAppointment() {
            return NextAppointmentEntry(date: Date(), title: a.title, start: a.startDate)
        }
        return NextAppointmentEntry(date: Date(), title: "Sin citas", start: nil)
    }
}

// MARK: - Vista de la complicación (varias familias de esfera)

struct AtlasComplicationView: View {
    @Environment(\.widgetFamily) var family
    let entry: NextAppointmentEntry

    var body: some View {
        switch family {
        case .accessoryInline:
            Label(inlineText, systemImage: "calendar")

        case .accessoryCircular:
            ZStack {
                AccessoryWidgetBackground()
                VStack(spacing: 0) {
                    Image(systemName: "calendar")
                        .font(.system(size: 12))
                    if let start = entry.start {
                        Text(start, style: .time)
                            .font(.system(size: 11, weight: .semibold))
                            .minimumScaleFactor(0.6)
                    } else {
                        Image(systemName: "mic.fill").font(.system(size: 11))
                    }
                }
            }

        case .accessoryCorner:
            Image(systemName: "brain.head.profile")
                .font(.title3)
                .widgetLabel(inlineText)

        default: // .accessoryRectangular
            VStack(alignment: .leading, spacing: 2) {
                Label("Próxima cita", systemImage: "calendar")
                    .font(.caption2).foregroundStyle(.secondary)
                Text(entry.title).font(.headline).lineLimit(1)
                if let start = entry.start {
                    Text(start, style: .time).font(.caption)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }

    private var inlineText: String {
        guard let start = entry.start else { return "Atlas" }
        let t = start.formatted(date: .omitted, time: .shortened)
        return "\(t) · \(entry.title)"
    }
}

// MARK: - Definición de la complicación

struct NextAppointmentComplication: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "AtlasNextAppointment",
                            provider: NextAppointmentProvider()) { entry in
            AtlasComplicationView(entry: entry)
        }
        .configurationDisplayName("Próxima cita")
        .description("Tu siguiente cita de un vistazo en la esfera.")
        .supportedFamilies([
            .accessoryInline, .accessoryCircular,
            .accessoryRectangular, .accessoryCorner
        ])
    }
}

@main
struct AtlasComplications: WidgetBundle {
    var body: some Widget {
        NextAppointmentComplication()
    }
}
