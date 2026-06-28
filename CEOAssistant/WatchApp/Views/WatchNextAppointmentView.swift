import SwiftUI

/// Muestra la próxima cita leyendo el calendario directamente en el Watch.
struct WatchNextAppointmentView: View {
    @State private var appointment: Appointment?
    @State private var loaded = false
    private let calendar = CalendarService()

    var body: some View {
        VStack(spacing: 10) {
            if let a = appointment {
                Text(a.title).font(.headline).multilineTextAlignment(.center)
                Text(a.startDate, style: .time).font(.title3.bold()).foregroundStyle(.indigo)
                if a.minutesUntilStart < 240 {
                    Text("en \(a.minutesUntilStart) min").font(.caption)
                        .foregroundStyle(.secondary)
                } else {
                    Text(a.startDate, style: .date).font(.caption)
                        .foregroundStyle(.secondary)
                }
                if let loc = a.location {
                    Label(loc, systemImage: "mappin").font(.caption2)
                        .foregroundStyle(.secondary)
                }
            } else if loaded {
                Image(systemName: "calendar.badge.checkmark")
                    .font(.largeTitle).foregroundStyle(.green)
                Text("Sin citas próximas").font(.headline)
            } else {
                ProgressView()
            }
        }
        .padding()
        .navigationTitle("Próxima")
        .task {
            if await calendar.requestAccess() {
                appointment = calendar.nextAppointment()
            }
            loaded = true
        }
    }
}
