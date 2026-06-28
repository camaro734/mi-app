import Foundation
import EventKit

/// Acceso al calendario del dispositivo vía EventKit: próximas citas, avisos y
/// creación de eventos a partir de las acciones de una reunión.
final class CalendarService {
    private let store = EKEventStore()

    /// Pide permiso de calendario (API de iOS 17 con fallback).
    func requestAccess() async -> Bool {
        if #available(iOS 17.0, watchOS 10.0, *) {
            return (try? await store.requestFullAccessToEvents()) ?? false
        } else {
            return await withCheckedContinuation { cont in
                store.requestAccess(to: .event) { granted, _ in
                    cont.resume(returning: granted)
                }
            }
        }
    }

    /// Devuelve las citas entre ahora y `days` días.
    func upcomingAppointments(days: Int = 7) -> [Appointment] {
        let start = Date()
        guard let end = Calendar.current.date(byAdding: .day, value: days, to: start) else {
            return []
        }
        let predicate = store.predicateForEvents(withStart: start, end: end, calendars: nil)
        return store.events(matching: predicate)
            .sorted { $0.startDate < $1.startDate }
            .map { event in
                Appointment(
                    id: event.eventIdentifier ?? UUID().uuidString,
                    title: event.title ?? "(sin título)",
                    startDate: event.startDate,
                    endDate: event.endDate,
                    location: event.location,
                    notes: event.notes,
                    attendees: event.attendees?.compactMap { $0.name } ?? []
                )
            }
    }

    /// La siguiente cita futura, si existe.
    func nextAppointment() -> Appointment? {
        upcomingAppointments(days: 30).first { $0.isUpcoming }
    }

    /// Crea un evento (p. ej. seguimiento de una reunión).
    @discardableResult
    func createEvent(title: String, start: Date, durationMinutes: Int = 30,
                     notes: String? = nil) throws -> String {
        let event = EKEvent(eventStore: store)
        event.title = title
        event.startDate = start
        event.endDate = Calendar.current.date(byAdding: .minute,
                                              value: durationMinutes, to: start)
        event.notes = notes
        event.calendar = store.defaultCalendarForNewEvents
        // Aviso 15 minutos antes.
        event.addAlarm(EKAlarm(relativeOffset: -15 * 60))
        try store.save(event, span: .thisEvent)
        return event.eventIdentifier ?? ""
    }
}
