import SwiftUI

/// Ajustes: identidad, claves de IA, motor de transcripción y correo destino.
struct SettingsView: View {
    @AppStorage(AppConfig.Keys.userName) private var userName = ""
    @AppStorage(AppConfig.Keys.userEmail) private var userEmail = ""
    @AppStorage(AppConfig.Keys.autoEmailSummaries) private var autoEmail = false
    @AppStorage(AppConfig.Keys.transcriptionEngine) private var engineRaw =
        TranscriptionEngine.appleOnDevice.rawValue

    @State private var anthropicKey = SecureStore.get(.anthropicAPIKey) ?? ""
    @State private var openAIKey = SecureStore.get(.openAIAPIKey) ?? ""
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
}
