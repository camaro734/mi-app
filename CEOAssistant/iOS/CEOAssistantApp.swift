import SwiftUI

@main
struct CEOAssistantApp: App {
    @StateObject private var store = AssistantStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .task {
                    _ = await NotificationManager.shared.requestAuthorization()
                    NotificationManager.shared.scheduleDailyBriefing()
                    await store.refreshCalendar()
                }
        }
    }
}

struct ContentView: View {
    @EnvironmentObject var store: AssistantStore

    var body: some View {
        TabView {
            HomeBriefingView()
                .tabItem { Label("Hoy", systemImage: "sun.max.fill") }
            RecordingsView()
                .tabItem { Label("Reuniones", systemImage: "waveform") }
            AdvisorView()
                .tabItem { Label("Asesor", systemImage: "brain.head.profile") }
            CalendarTabView()
                .tabItem { Label("Agenda", systemImage: "calendar") }
            SettingsView()
                .tabItem { Label("Ajustes", systemImage: "gearshape.fill") }
        }
        .tint(.indigo)
    }
}
