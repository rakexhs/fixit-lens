import SwiftUI

struct GradientBackground: View {
    var body: some View { AppBackground() }
}

// MARK: - Cards & lists

struct ProCard<Content: View>: View {
    var padding: CGFloat = Theme.Space.lg
    @ViewBuilder let content: () -> Content

    var body: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.Color.surface)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                    .stroke(Theme.Color.separator, lineWidth: 0.5)
            )
    }
}

typealias GlassCard = ProCard

struct ProListRow: View {
    let icon: String
    let title: String
    var subtitle: String? = nil
    var value: String? = nil
    var showChevron = true

    var body: some View {
        HStack(spacing: Theme.Space.md) {
            Image(systemName: icon)
                .font(.system(size: 17))
                .foregroundStyle(Theme.Color.accent)
                .frame(width: 28)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(Theme.Font.body)
                    .foregroundStyle(Theme.Color.label)
                if let subtitle {
                    Text(subtitle)
                        .font(Theme.Font.footnote)
                        .foregroundStyle(Theme.Color.labelSecondary)
                }
            }
            Spacer()
            if let value {
                Text(value)
                    .font(Theme.Font.footnote)
                    .foregroundStyle(Theme.Color.labelTertiary)
            }
            if showChevron {
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.Color.labelTertiary)
            }
        }
        .padding(.horizontal, Theme.Space.lg)
        .padding(.vertical, Theme.Space.md + 2)
    }
}

struct ProSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.sm) {
            Text(title.uppercased())
                .font(Theme.Font.caption)
                .foregroundStyle(Theme.Color.labelTertiary)
                .padding(.horizontal, Theme.Space.lg)
            VStack(spacing: 0) {
                content()
            }
            .background(Theme.Color.surface)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                    .stroke(Theme.Color.separator, lineWidth: 0.5)
            )
        }
    }
}

struct MetricTile: View {
    let label: String
    let value: String
    var footnote: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.xs) {
            Text(label)
                .font(Theme.Font.caption)
                .foregroundStyle(Theme.Color.labelTertiary)
            Text(value)
                .font(.system(size: 24, weight: .semibold, design: .rounded))
                .foregroundStyle(Theme.Color.label)
                .monospacedDigit()
            if let footnote {
                Text(footnote)
                    .font(Theme.Font.caption2)
                    .foregroundStyle(Theme.Color.labelSecondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Space.lg)
        .background(Theme.Color.surface)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                .stroke(Theme.Color.separator, lineWidth: 0.5)
        )
    }
}

// MARK: - Buttons

struct ProButton: View {
    let title: String
    var icon: String? = nil
    var style: Style = .primary
    var isLoading = false
    var disabled = false
    let action: () -> Void

    enum Style { case primary, secondary, ghost, destructive }

    var body: some View {
        Button(action: action) {
            HStack(spacing: Theme.Space.sm) {
                if isLoading {
                    ProgressView().tint(style == .primary || style == .destructive ? .white : Theme.Color.label)
                } else if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .medium))
                }
                Text(title)
                    .font(Theme.Font.headline)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .foregroundStyle(foreground)
            .background(background)
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
                    .stroke(borderColor, lineWidth: style == .ghost || style == .secondary ? 0.5 : 0)
            )
        }
        .buttonStyle(ProPressStyle())
        .disabled(disabled || isLoading)
        .opacity(disabled ? 0.4 : 1)
    }

    private var foreground: Color {
        switch style {
        case .primary, .destructive: return .white
        case .secondary, .ghost: return Theme.Color.label
        }
    }

    private var background: Color {
        switch style {
        case .primary: return Theme.Color.accent
        case .destructive: return Theme.Color.danger
        case .secondary: return Theme.Color.surfaceHover
        case .ghost: return .clear
        }
    }

    private var borderColor: Color {
        style == .ghost || style == .secondary ? Theme.Color.border : .clear
    }
}

typealias PrimaryButton = ProButton

struct ProPressStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .opacity(configuration.isPressed ? 0.82 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

typealias ScaleButtonStyle = ProPressStyle

// MARK: - Status & data

struct SafetyBadge: View {
    let riskLevel: Int
    let blocked: Bool
    var compact = false

    var body: some View {
        let color = blocked ? Theme.Color.danger : Theme.Color.risk(riskLevel)
        let label = blocked ? "Pro required" : riskLabel(riskLevel)
        Text(label)
            .font(.system(size: compact ? 11 : 12, weight: .semibold))
            .foregroundStyle(color)
            .padding(.horizontal, compact ? 8 : 10)
            .padding(.vertical, compact ? 4 : 5)
            .background(color.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
    }
}

struct ConfidenceChip: View {
    let confidence: Double

    var body: some View {
        Text("\(Int(confidence * 100))%")
            .font(.system(size: 13, weight: .semibold, design: .rounded))
            .monospacedDigit()
            .foregroundStyle(Theme.Color.label)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Theme.Color.surfaceHover)
            .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
    }
}

struct SeverityRing: View {
    let level: Int

    var body: some View {
        let color = Theme.Color.risk(level)
        ZStack {
            Circle().stroke(Theme.Color.separator, lineWidth: 3).frame(width: 48, height: 48)
            Circle()
                .trim(from: 0, to: min(1, Double(level + 1) / 4))
                .stroke(color, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                .frame(width: 48, height: 48)
                .rotationEffect(.degrees(-90))
            Text("\(level)")
                .font(.system(size: 16, weight: .semibold, design: .rounded))
                .foregroundStyle(color)
        }
    }
}

struct StepDots: View {
    let total: Int
    let current: Int

    var body: some View {
        HStack(spacing: 5) {
            ForEach(0..<total, id: \.self) { i in
                RoundedRectangle(cornerRadius: 2, style: .continuous)
                    .fill(i == current ? Theme.Color.accent : Theme.Color.separator)
                    .frame(width: i == current ? 20 : 6, height: 4)
            }
        }
    }
}

struct NavHeader: View {
    let title: String
    var subtitle: String? = nil
    var large = false

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.xs) {
            Text(title)
                .font(large ? Theme.Font.largeTitle : Theme.Font.title2)
                .foregroundStyle(Theme.Color.label)
            if let subtitle {
                Text(subtitle)
                    .font(Theme.Font.subheadline)
                    .foregroundStyle(Theme.Color.labelSecondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, Theme.Space.lg)
        .padding(.top, Theme.Space.sm)
        .padding(.bottom, Theme.Space.md)
    }
}

typealias AppHeader = NavHeader

struct EmptyStateView: View {
    let icon: String
    let title: String
    let message: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil

    var body: some View {
        VStack(spacing: Theme.Space.lg) {
            Image(systemName: icon)
                .font(.system(size: 40, weight: .light))
                .foregroundStyle(Theme.Color.labelTertiary)
            Text(title)
                .font(Theme.Font.title3)
                .foregroundStyle(Theme.Color.label)
            Text(message)
                .font(Theme.Font.subheadline)
                .foregroundStyle(Theme.Color.labelSecondary)
                .multilineTextAlignment(.center)
            if let actionTitle, let action {
                ProButton(title: actionTitle, style: .secondary, action: action)
                    .padding(.horizontal, Theme.Space.xxxl)
            }
        }
        .padding(Theme.Space.xl)
    }
}

struct LoadingTimeline: View {
    @State private var activeIndex = 0
    private let steps = [
        "Extracting visible text",
        "Identifying device",
        "Searching manuals",
        "Running safety checks",
        "Building guided steps"
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Space.md) {
            ForEach(Array(steps.enumerated()), id: \.offset) { i, step in
                HStack(spacing: Theme.Space.md) {
                    Image(systemName: i < activeIndex ? "checkmark.circle.fill" : (i == activeIndex ? "circle.dotted" : "circle"))
                        .font(.system(size: 18))
                        .foregroundStyle(i <= activeIndex ? Theme.Color.accent : Theme.Color.labelTertiary)
                        .frame(width: 24)
                    Text(step)
                        .font(Theme.Font.subheadline)
                        .foregroundStyle(i <= activeIndex ? Theme.Color.label : Theme.Color.labelTertiary)
                }
            }
        }
        .onAppear {
            Timer.scheduledTimer(withTimeInterval: 0.85, repeats: true) { t in
                if activeIndex < steps.count - 1 {
                    withAnimation(.easeOut(duration: 0.2)) { activeIndex += 1 }
                } else { t.invalidate() }
            }
        }
    }
}

struct FlowLayout: Layout {
    var spacing: CGFloat = 8
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        arrange(proposal: proposal, subviews: subviews).size
    }
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let r = arrange(proposal: proposal, subviews: subviews)
        for (i, pos) in r.positions.enumerated() {
            subviews[i].place(at: CGPoint(x: bounds.minX + pos.x, y: bounds.minY + pos.y), proposal: .unspecified)
        }
    }
    private func arrange(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxW = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, rowH: CGFloat = 0
        var positions: [CGPoint] = []
        for sub in subviews {
            let size = sub.sizeThatFits(.unspecified)
            if x + size.width > maxW && x > 0 { x = 0; y += rowH + spacing; rowH = 0 }
            positions.append(CGPoint(x: x, y: y))
            rowH = max(rowH, size.height)
            x += size.width + spacing
        }
        return (CGSize(width: maxW, height: y + rowH), positions)
    }
}
