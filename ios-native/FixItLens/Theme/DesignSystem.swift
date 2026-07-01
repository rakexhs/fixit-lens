import SwiftUI

// Professional design tokens — restrained neutrals, single accent, SF Pro hierarchy.
enum Theme {
    enum Color {
        static let bg = SwiftUI.Color(red: 0.04, green: 0.04, blue: 0.042)
        static let bgElevated = SwiftUI.Color(red: 0.08, green: 0.08, blue: 0.085)
        static let surface = SwiftUI.Color(red: 0.11, green: 0.11, blue: 0.118)
        static let surfaceHover = SwiftUI.Color(red: 0.14, green: 0.14, blue: 0.15)
        static let separator = SwiftUI.Color.white.opacity(0.06)
        static let border = SwiftUI.Color.white.opacity(0.1)

        static let label = SwiftUI.Color(red: 0.96, green: 0.96, blue: 0.97)
        static let labelSecondary = SwiftUI.Color(red: 0.63, green: 0.63, blue: 0.65)
        static let labelTertiary = SwiftUI.Color(red: 0.43, green: 0.43, blue: 0.45)

        static let accent = SwiftUI.Color(red: 0.04, green: 0.52, blue: 1.0) // iOS blue
        static let accentMuted = SwiftUI.Color(red: 0.04, green: 0.52, blue: 1.0).opacity(0.15)

        static let success = SwiftUI.Color(red: 0.19, green: 0.82, blue: 0.35)
        static let warning = SwiftUI.Color(red: 1.0, green: 0.62, blue: 0.04)
        static let danger = SwiftUI.Color(red: 1.0, green: 0.27, blue: 0.23)

        static func risk(_ level: Int) -> SwiftUI.Color {
            switch level {
            case 0: return labelSecondary
            case 1: return success.opacity(0.9)
            case 2: return warning
            default: return danger
            }
        }
    }

    enum Font {
        static let largeTitle = SwiftUI.Font.system(size: 34, weight: .bold)
        static let title1 = SwiftUI.Font.system(size: 28, weight: .bold)
        static let title2 = SwiftUI.Font.system(size: 22, weight: .semibold)
        static let title3 = SwiftUI.Font.system(size: 20, weight: .semibold)
        static let headline = SwiftUI.Font.system(size: 17, weight: .semibold)
        static let body = SwiftUI.Font.system(size: 17, weight: .regular)
        static let callout = SwiftUI.Font.system(size: 16, weight: .regular)
        static let subheadline = SwiftUI.Font.system(size: 15, weight: .regular)
        static let footnote = SwiftUI.Font.system(size: 13, weight: .regular)
        static let caption = SwiftUI.Font.system(size: 12, weight: .medium)
        static let caption2 = SwiftUI.Font.system(size: 11, weight: .regular)
        static let mono = SwiftUI.Font.system(size: 12, weight: .medium, design: .monospaced)
    }

    enum Space {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 24
        static let xxxl: CGFloat = 32
    }

    enum Radius {
        static let sm: CGFloat = 8
        static let md: CGFloat = 10
        static let lg: CGFloat = 12
        static let xl: CGFloat = 16
    }
}

// Backward-compat alias while migrating views
typealias FL = Theme

struct AppBackground: View {
    var body: some View {
        Theme.Color.bg.ignoresSafeArea()
    }
}

struct ProScreen<Content: View>: View {
    @ViewBuilder let content: () -> Content

    var body: some View {
        ZStack {
            AppBackground()
            content()
        }
    }
}

func titleCase(_ s: String) -> String {
    s.replacingOccurrences(of: "_", with: " ").capitalized
}

func riskLabel(_ level: Int) -> String {
    switch level {
    case 0: return "Safe"
    case 1: return "Low risk"
    case 2: return "Moderate"
    default: return "High risk"
    }
}

func formatDate(_ iso: String) -> String {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    if let d = f.date(from: iso) ?? ISO8601DateFormatter().date(from: iso) {
        let out = DateFormatter()
        out.dateStyle = .medium
        out.timeStyle = .short
        return out.string(from: d)
    }
    return iso
}

func deviceIcon(_ category: String?) -> String {
    switch category {
    case "router": return "wifi.router"
    case "laptop": return "laptopcomputer"
    case "dishwasher", "washing_machine": return "washer"
    case "dangerous": return "exclamationmark.triangle"
    default: return "cube"
    }
}
