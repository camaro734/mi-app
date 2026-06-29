import SwiftUI
import WidgetKit

@main
struct CEOAssistantWatchApp: App {
    init() {
        // Activa la sesión con el iPhone ya al arrancar, para que esté lista
        // antes de grabar y no se pierda la primera transferencia de audio.
        WatchConnectivityManager.shared.activate()
        // Refresca las complicaciones de la esfera.
        WidgetCenter.shared.reloadAllTimelines()
    }

    var body: some Scene {
        WindowGroup {
            WatchRootView()
        }
    }
}

/// Raíz del Watch: navegación vertical entre las acciones principales del CEO
/// en la muñeca — grabar, dictar, asesor y próxima cita.
struct WatchRootView: View {
    @State private var showRecord = false

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
        // Al tocar la complicación de la esfera (atlas://record) se abre esta
        // hoja directamente en grabar y empieza a grabar sola.
        .onOpenURL { url in
            if url.scheme == "atlas" { showRecord = true }
        }
        .sheet(isPresented: $showRecord) {
            NavigationStack {
                WatchRecordView(autoStart: true)
            }
        }
    }
}
