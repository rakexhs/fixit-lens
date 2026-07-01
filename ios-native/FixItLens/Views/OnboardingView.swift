import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var settings: AppSettings
    @State private var page = 0

    private let pages: [(icon: String, title: String, body: String)] = [
        ("viewfinder", "Scan anything", "Point your camera at a device label, error code, or warning light."),
        ("doc.text.magnifyingglass", "Cited answers only", "Every repair step is grounded in retrieved manual excerpts — never guesswork."),
        ("shield.checkered", "Safety first", "High-risk repairs are blocked. We tell you when to call a professional.")
    ]

    var body: some View {
        ProScreen {
            VStack(spacing: 0) {
                TabView(selection: $page) {
                    ForEach(Array(pages.enumerated()), id: \.offset) { i, p in
                        VStack(spacing: Theme.Space.xxl) {
                            Spacer()
                            Image(systemName: p.icon)
                                .font(.system(size: 56, weight: .light))
                                .foregroundStyle(Theme.Color.accent)
                            VStack(spacing: Theme.Space.md) {
                                Text(p.title)
                                    .font(Theme.Font.title1)
                                    .foregroundStyle(Theme.Color.label)
                                Text(p.body)
                                    .font(Theme.Font.body)
                                    .foregroundStyle(Theme.Color.labelSecondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal, Theme.Space.xxxl)
                            }
                            Spacer()
                        }
                        .tag(i)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))

                VStack(spacing: Theme.Space.md) {
                    ProButton(title: page < pages.count - 1 ? "Continue" : "Get started", action: {
                        if page < pages.count - 1 {
                            withAnimation { page += 1 }
                        } else {
                            settings.hasCompletedOnboarding = true
                        }
                    })
                    if page < pages.count - 1 {
                        Button("Skip") { settings.hasCompletedOnboarding = true }
                            .font(Theme.Font.subheadline)
                            .foregroundStyle(Theme.Color.labelTertiary)
                    }
                }
                .padding(Theme.Space.lg)
            }
        }
    }
}
