import SwiftUI

@main
struct CEOAssistantWatchApp: App {
    var body: some Scene {
        WindowGroup {
            WatchRootView()
        }
    }
}

/// Raíz del Watch: navegación vertical entre las acciones principales del CEO
/// en la muñeca — grabar, dictar, asesor y próxima cita.
struct WatchRootView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink {
                    WatchRecordView()
                } label: { Label("Grabar reunión", systemImage: "mic.fill") }

                NavigationLink {
                    WatchAdvisorView()
                } label: { Label("Preguntar a Atlas", systemImage: "brain.head.profile") }

                NavigationLink {
                    WatchDictateView()
                } label: { Label("Dictar nota", systemImage: "square.and.pencil") }

                NavigationLink {
                    WatchNextAppointmentView()
                } label: { Label("Próxima cita", systemImage: "calendar") }
            }
            .navigationTitle("Atlas")
        }
    }
}
