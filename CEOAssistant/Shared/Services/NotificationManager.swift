import Foundation
import UserNotifications

/// Avisos locales: recordatorios de citas próximas y del briefing matinal.
final class NotificationManager {
    static let shared = NotificationManager()
    private init() {}

    func requestAuthorization() async -> Bool {
        (try? await UNUserNotificationCenter.current()
            .requestAuthorization(options: [.alert, .sound, .badge])) ?? false
    }

    /// Programa un aviso `minutesBefore` antes de una cita.
    func scheduleAppointmentReminder(_ appointment: Appointment,
                                     minutesBefore: Int = 15) {
        let fireDate = appointment.startDate
            .addingTimeInterval(TimeInterval(-minutesBefore * 60))
        guard fireDate > Date() else { return }

        let content = UNMutableNotificationContent()
        content.title = "Próxima cita en \(minutesBefore) min"
        content.body = appointment.title +
            (appointment.location.map { " · \($0)" } ?? "")
        content.sound = .default

        let comps = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute], from: fireDate)
        let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: false)
        let request = UNNotificationRequest(
            identifier: "appt-\(appointment.id)", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    /// Programa el briefing diario a una hora fija (por defecto 8:00).
    func scheduleDailyBriefing(hour: Int = 8, minute: Int = 0) {
        let content = UNMutableNotificationContent()
        content.title = "Tu briefing de hoy"
        content.body = "Atlas ya tiene preparado tu resumen del día."
        content.sound = .default

        var comps = DateComponents()
        comps.hour = hour
        comps.minute = minute
        let trigger = UNCalendarNotificationTrigger(dateMatching: comps, repeats: true)
        let request = UNNotificationRequest(
            identifier: "daily-briefing", content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    func cancelAll() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
}
