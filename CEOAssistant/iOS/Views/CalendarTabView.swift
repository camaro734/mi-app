import SwiftUI

/// Agenda: próximas citas de los próximos 7 días, agrupadas por día.
struct CalendarTabView: View {
    @EnvironmentObject var store: AssistantStore

    private var grouped: [(day: Date, items: [Appointment])] {
        let cal = Calendar.current
        let dict = Dictionary(grouping: store.appointments) {
            cal.startOfDay(for: $0.startDate)
        }
        return dict.keys.sorted().map { ($0, dict[$0]!.sorted { $0.startDate < $1.startDate }) }
    }

    var body: some View {
        NavigationStack {
            List {
                if store.appointments.isEmpty {
                    ContentUnavailableView("Sin citas próximas",
                        systemImage: "calendar",
                        description: Text(store.nexusConnected
                            ? "No hay citas en los próximos 7 días en Nexus. Desliza hacia abajo para actualizar."
                            : "Conéctate a Nexus en Ajustes para ver la agenda real de la empresa."))
                }
                ForEach(grouped, id: \.day) { group in
                    Section(group.day.formatted(.dateTime.weekday(.wide).day().month())) {
                        ForEach(group.items) { appt in
                            AppointmentRow(appointment: appt)
                        }
                    }
                }
            }
            .navigationTitle("Agenda")
            .refreshable { await store.refreshCalendar() }
            .toolbar {
                Button { Task { await store.refreshCalendar() } } label: {
                    Image(systemName: "arrow.clockwise")
                }
            }
            .task { await store.refreshCalendar() }
        }
    }
}

struct AppointmentRow: View {
    let appointment: Appointment
    var body: some View {
        HStack(spacing: 12) {
            VStack {
                Text(appointment.startDate, style: .time).font(.subheadline.bold())
                Text(appointment.endDate, style: .time).font(.caption2)
                    .foregroundStyle(.secondary)
            }
            .frame(width: 56)
            Rectangle().fill(Color.indigo).frame(width: 3).cornerRadius(2)
            VStack(alignment: .leading, spacing: 2) {
                Text(appointment.title).font(.headline)
                if let loc = appointment.location {
                    Label(loc, systemImage: "mappin").font(.caption)
                        .foregroundStyle(.secondary)
                }
                if !appointment.attendees.isEmpty {
                    Text(appointment.attendees.joined(separator: ", "))
                        .font(.caption2).foregroundStyle(.secondary).lineLimit(1)
                }
            }
            Spacer()
        }
        .padding(.vertical, 4)
    }
}
