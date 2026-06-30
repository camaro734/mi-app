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
            HomeBriefingView(selection: $selection)
                .tabItem { Label("Hoy", systemImage: "sun.max.fill") }.tag(0)
            MessagesHubView()
                .tabItem { Label("Mensajes", systemImage: "message.fill") }.tag(1)
            AdvisorView()
                .tabItem { Label("Asesor", systemImage: "brain.head.profile") }.tag(2)
            RecordingsView()
                .tabItem { Label("Reuniones", systemImage: "waveform") }.tag(3)
            CompanyHubView()
                .tabItem { Label("Empresa", systemImage: "building.2.fill") }.tag(4)
        }
        .tint(.indigo)
        // Reacciona a los atajos de Siri que abren la app en una pantalla.
        .onChange(of: router.pendingAction) { action in
            switch action {
            case .record: selection = 3
            case .advisor: selection = 2
            case .briefing: selection = 0
            case .none: break
            }
            router.pendingAction = nil
        }
    }
}
