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
    @StateObject private var router = AtlasIntentRouter.shared
    @State private var selection = 0

    var body: some View {
        TabView(selection: $selection) {
            HomeBriefingView()
                .tabItem { Label("Hoy", systemImage: "sun.max.fill") }.tag(0)
            MailView()
                .tabItem { Label("Correo", systemImage: "envelope.fill") }.tag(1)
            AdvisorView()
                .tabItem { Label("Asesor", systemImage: "brain.head.profile") }.tag(2)
            CompanyHubView()
                .tabItem { Label("Empresa", systemImage: "building.2.fill") }.tag(3)
            RecordingsView()
                .tabItem { Label("Reuniones", systemImage: "waveform") }.tag(4)
            SettingsView()
                .tabItem { Label("Ajustes", systemImage: "gearshape.fill") }.tag(5)
        }
        .tint(.indigo)
        // Reacciona a los atajos de Siri que abren la app en una pantalla.
        .onChange(of: router.pendingAction) { action in
            switch action {
            case .record: selection = 4
            case .advisor: selection = 2
            case .briefing: selection = 0
            case .none: break
            }
            router.pendingAction = nil
        }
    }
}
