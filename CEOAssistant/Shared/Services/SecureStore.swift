import Foundation
import Security

/// Almacén seguro de credenciales (API keys) en el Keychain.
/// Nunca guardes claves en UserDefaults ni en el código fuente.
enum SecureStore {
    enum Key: String {
        case anthropicAPIKey = "com.cmghidraulica.ceoassistant.anthropicKey"
        case openAIAPIKey = "com.cmghidraulica.ceoassistant.openAIKey"
        // Tokens de sesión del ERP Nexus (nunca se guarda la contraseña).
        case nexusAccessToken = "com.cmghidraulica.ceoassistant.nexusAccess"
        case nexusRefreshToken = "com.cmghidraulica.ceoassistant.nexusRefresh"
    }

    @discardableResult
    static func set(_ value: String, for key: Key) -> Bool {
        let data = Data(value.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue
        ]
        SecItemDelete(query as CFDictionary)

        var attributes = query
        attributes[kSecValueData as String] = data
        attributes[kSecAttrAccessible as String] =
            kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        return SecItemAdd(attributes as CFDictionary, nil) == errSecSuccess
    }

    static func get(_ key: Key) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    @discardableResult
    static func delete(_ key: Key) -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key.rawValue
        ]
        return SecItemDelete(query as CFDictionary) == errSecSuccess
    }
}
