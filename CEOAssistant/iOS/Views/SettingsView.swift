import SwiftUI

/// Ajustes: identidad, claves de IA, motor de transcripción y correo destino.
struct SettingsView: View {
    @EnvironmentObject var store: AssistantStore
    @AppStorage(AppConfig.Keys.userName) private var userName = ""
    @AppStorage(AppConfig.Keys.userEmail) private var userEmail = ""
    @AppStorage(AppConfig.Keys.autoEmailSummaries) private var autoEmail = false
    @AppStorage(AppConfig.Keys.transcriptionEngine) private var engineRaw =
        TranscriptionEngine.appleOnDevice.rawValue
    @AppStorage(AppConfig.Keys.nexusUsername) private var nexusUsername = ""
    @AppStorage(AppConfig.Keys.nexusBaseURL) private var nexusURL = "https://cmgnexus.es"

    @State private var anthropicKey = SecureStore.get(.anthropicAPIKey) ?? ""
    @State private var openAIKey = SecureStore.get(.openAIAPIKey) ?? ""
    @State private var nexusPassword = ""
    @State private var nexusConnecting = false
    @State private var nexusTestResult: String?
    @State private var nexusTesting = false
    @State private var savedFlash = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Tú") {
                    TextField("Nombre", text: $userName)
                    TextField("Correo para los resúmenes", text: $userEmail)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                }

                Section {
                    SecureField("Anthropic API key (Claude)", text: $anthropicKey)
                    if engineRaw == TranscriptionEngine.whisperOpenAI.rawValue {
                        SecureField("OpenAI API key (Whisper)", text: $openAIKey)
                    }
                } header: {
                    Text("Claves de IA")
                } footer: {
                    Text("Las claves se guardan cifradas en el Keychain del dispositivo, nunca en la nube.")
                }

                Section {
                    if store.nexusConnected {
                        Label("Conectado a Nexus", systemImage: "checkmark.seal.fill")
                            .foregroundStyle(.green)
                        if !nexusUsername.isEmpty {
                            LabeledContent("Usuario", value: nexusUsername)
                        }
                        Button {
                            nexusTesting = true
                            nexusTestResult = nil
                            Task {
                                let r = await store.testNexus()
                                nexusTestResult = r
                                nexusTesting = false
                            }
                        } label: {
                            HStack {
                                Text("Probar conexión")
                                if nexusTesting { Spacer(); ProgressView() }
                            }
                        }
                        .disabled(nexusTesting)
                        if let r = nexusTestResult {
                            Text(r).font(.caption).foregroundStyle(.secondary)
                        }
                        Button("Cerrar sesión en Nexus", role: .destructive) {
                            store.disconnectNexus()
                            nexusPassword = ""
                            nexusTestResult = nil
                        }
                    } else {
                        TextField("Usuario de Nexus", text: $nexusUsername)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                        SecureField("Contraseña de Nexus", text: $nexusPassword)
                        Button {
                            connectNexus()
                        } label: {
                            HStack {
                                Text("Conectar con Nexus")
                                if nexusConnecting {
                                    Spacer(); ProgressView()
                                }
                            }
                        }
                        .disabled(nexusUsername.isEmpty || nexusPassword.isEmpty || nexusConnecting)
                    }
                } header: {
                    Text("Nexus (ERP de la empresa)")
                } footer: {
                    Text("Inicia sesión con tu usuario de Nexus para que Atlas use la agenda real de citas de la empresa. Solo se guarda un token cifrado, nunca tu contraseña.")
                }

                Section("Transcripción") {
                    Picker("Motor", selection: $engineRaw) {
                        ForEach(TranscriptionEngine.allCases) { e in
                            Text(e.label).tag(e.rawValue)
                        }
                    }
                }

                Section("Correo") {
                    Toggle("Enviar resúmenes automáticamente", isOn: $autoEmail)
                }

                Section {
                    Button("Guardar cambios") { save() }
                    if savedFlash {
                        Label("Guardado", systemImage: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                    }
                }

                Section {
                    Link("Obtener una API key de Anthropic",
                         destination: URL(string: "https://console.anthropic.com/")!)
                } footer: {
                    Text("Atlas · Asistente ejecutivo · v\(appVersion)")
                }
            }
            .navigationTitle("Ajustes")
        }
    }

    private var appVersion: String {
        Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
    }

    private func save() {
        SecureStore.set(anthropicKey.trimmingCharacters(in: .whitespaces), for: .anthropicAPIKey)
        SecureStore.set(openAIKey.trimmingCharacters(in: .whitespaces), for: .openAIAPIKey)
        withAnimation { savedFlash = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation { savedFlash = false }
        }
    }

    private func connectNexus() {
        nexusConnecting = true
        Task {
            let ok = await store.connectNexus(
                username: nexusUsername.trimmingCharacters(in: .whitespaces),
                password: nexusPassword)
            nexusConnecting = false
            if ok { nexusPassword = "" }
        }
    }
}
