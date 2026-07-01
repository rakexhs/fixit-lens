import SwiftUI

@main
struct FixItLensApp: App {
    @StateObject private var store = SessionStore()
    @StateObject private var settings = AppSettings.shared

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .environmentObject(settings)
                .preferredColorScheme(.dark)
        }
    }
}
