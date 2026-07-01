import Foundation
import Combine

@MainActor
final class AppSettings: ObservableObject {
    static let shared = AppSettings()

    private let baseURLKey = "fixit_lens_api_base_url"
    private let onboardingKey = "fixit_lens_onboarding_done"

    @Published var apiBaseURL: String {
        didSet { UserDefaults.standard.set(apiBaseURL, forKey: baseURLKey) }
    }

    @Published var hasCompletedOnboarding: Bool {
        didSet { UserDefaults.standard.set(hasCompletedOnboarding, forKey: onboardingKey) }
    }

    /// Used only on first launch before the user saves a custom URL.
    static let simulatorDefaultBaseURL = "http://127.0.0.1:8000"

    private init() {
        let stored = UserDefaults.standard.string(forKey: baseURLKey)
        apiBaseURL = Self.normalizeBaseURL(stored ?? Self.simulatorDefaultBaseURL)
        hasCompletedOnboarding = UserDefaults.standard.bool(forKey: onboardingKey)
    }

    @discardableResult
    func updateBaseURL(_ raw: String) -> String? {
        let trimmed = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return "Enter a backend URL." }
        let normalized = Self.normalizeBaseURL(trimmed)
        guard URL(string: normalized) != nil else { return "Invalid URL format." }
        apiBaseURL = normalized
        return nil
    }

    static func normalizeBaseURL(_ raw: String) -> String {
        var value = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        while value.hasSuffix("/") { value.removeLast() }
        return value
    }
}
