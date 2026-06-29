import SwiftUI
import WidgetKit

/// Enrutador compartido: cuando se toca la complicación "Grabar reunión" de la
/// esfera, se pone `showRecord = true` y la app abre la grabación al instante.
final class WatchRouter: ObservableObject {
    static let shared = WatchRouter()
    @Published var showRecord = false

    /// Procesa una URL entrante (atlas://record) venga por donde venga.
    func handle(url: URL?) {
        guard let url, url.scheme == "atlas" else { return }
        showRecord = true
    }
}

/// Segundo camino: en watchOS el toque de una complicación puede llegar como
/// "user activity" al delegado en vez de por `onOpenURL`. Cubrimos ambos.
final class WatchAppDelegate: NSObject, WKApplicationDelegate {
    func handle(_ userActivity: NSUserActivity) {
        WatchRouter.shared.handle(url: userActivity.webpageURL)
    }
}

@main
struct CEOAssistantWatchApp: App {
    @WKApplicationDelegateAdaptor(WatchAppDelegate.self) private var delegate
    @StateObject private var router = WatchRouter.shared

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
                .environmentObject(router)
                // Camino 1: la URL de la complicación llega por onOpenURL.
                .onOpenURL { router.handle(url: $0) }
                // La grabación se abre como hoja directa, ya grabando.
                .sheet(isPresented: $router.showRecord) {
                    NavigationStack { WatchRecordView(autoStart: true) }
                }
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
