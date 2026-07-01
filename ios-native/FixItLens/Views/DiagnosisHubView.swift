import SwiftUI

struct DiagnosisHubView: View {
    @EnvironmentObject var store: SessionStore
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ProScreen {
            if let result = store.diagnoseResult {
                VStack(spacing: 0) {
                    diagnosisHeader(result)
                    Picker("Section", selection: $store.diagnosisTab) {
                        ForEach(DiagnosisTab.allCases, id: \.self) { tab in
                            Text(tab.rawValue).tag(tab)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, Theme.Space.lg)
                    .padding(.bottom, Theme.Space.md)

                    ScrollView(showsIndicators: false) {
                        switch store.diagnosisTab {
                        case .overview: overviewTab(result)
                        case .steps: stepsTab(result)
                        case .sources: sourcesTab(result)
                        case .safety: safetyTab(result)
                        }
                    }
                }
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .principal) {
                        Text("Diagnosis").font(Theme.Font.headline)
                    }
                }
            } else {
                EmptyStateView(
                    icon: "doc.text",
                    title: "No diagnosis",
                    message: "Run a scan or enter device details to see results here."
                )
            }
        }
    }

    private func diagnosisHeader(_ result: DiagnoseResponse) -> some View {
        let device = store.analyzeResult?.detected_device
        let line = device?.brand.map { "\($0)\(device?.model.map { " \($0)" } ?? "")" } ?? titleCase(device?.category ?? "Device")

        return VStack(alignment: .leading, spacing: Theme.Space.md) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: Theme.Space.xs) {
                    Text(line)
                        .font(Theme.Font.caption)
                        .foregroundStyle(Theme.Color.labelTertiary)
                    Text(result.diagnosis.likely_issue)
                        .font(Theme.Font.title2)
                        .foregroundStyle(Theme.Color.label)
                    HStack(spacing: Theme.Space.sm) {
                        ConfidenceChip(confidence: result.diagnosis.confidence)
                        SafetyBadge(riskLevel: result.safety.risk_level, blocked: result.safety.blocked)
                    }
                }
                SeverityRing(level: result.safety.risk_level)
            }
            if result.safety.blocked {
                ProButton(title: "Why we can't guide this repair", icon: "hand.raised", style: .secondary) {
                    store.navigateScan(.professionalHandoff)
                }
            } else if !result.steps.isEmpty {
                ProButton(title: "Start guided repair", icon: "play.fill") {
                    store.currentStepIndex = 0
                    store.navigateScan(.guidedRepair)
                }
            }
        }
        .padding(Theme.Space.lg)
    }

    private func overviewTab(_ result: DiagnoseResponse) -> some View {
        VStack(alignment: .leading, spacing: Theme.Space.md) {
            ProCard {
                Text("Analysis")
                    .font(Theme.Font.caption)
                    .foregroundStyle(Theme.Color.labelTertiary)
                Text(result.diagnosis.reasoning_summary)
                    .font(Theme.Font.body)
                    .foregroundStyle(Theme.Color.label)
                    .padding(.top, Theme.Space.sm)
            }
            if let ocr = store.analyzeResult?.ocr.text, !ocr.isEmpty {
                ProCard {
                    Text("Detected text")
                        .font(Theme.Font.caption)
                        .foregroundStyle(Theme.Color.labelTertiary)
                    Text(ocr)
                        .font(Theme.Font.mono)
                        .foregroundStyle(Theme.Color.labelSecondary)
                        .padding(.top, Theme.Space.sm)
                }
            }
            if let q = result.clarifying_question {
                ProCard {
                    Text("Clarification needed")
                        .font(Theme.Font.caption)
                        .foregroundStyle(Theme.Color.labelTertiary)
                    Text(q).font(Theme.Font.body).padding(.top, Theme.Space.sm)
                }
            }
            metricsCard(result)
        }
        .padding(.horizontal, Theme.Space.lg)
        .padding(.bottom, Theme.Space.xxxl)
    }

    private func stepsTab(_ result: DiagnoseResponse) -> some View {
        VStack(spacing: Theme.Space.sm) {
            if result.steps.isEmpty {
                EmptyStateView(icon: "list.bullet", title: "No steps", message: result.safety.blocked ? "This repair requires a professional." : "No procedural steps were generated.")
            } else {
                ForEach(result.steps) { step in
                    Button {
                        store.navigateScan(.stepDetail(step.step_number))
                    } label: {
                        ProListRow(
                            icon: "\(step.step_number).circle",
                            title: step.title,
                            subtitle: step.instruction,
                            value: nil,
                            showChevron: true
                        )
                    }
                    .buttonStyle(.plain)
                    Divider().padding(.leading, 52)
                }
            }
        }
        .padding(.horizontal, Theme.Space.lg)
        .padding(.bottom, Theme.Space.xxxl)
    }

    private func sourcesTab(_ result: DiagnoseResponse) -> some View {
        VStack(spacing: Theme.Space.sm) {
            ForEach(result.sources) { source in
                Button {
                    store.selectedSourceId = source.id
                    store.navigateScan(.sourceDetail)
                } label: {
                    ProCard(padding: Theme.Space.md) {
                        Text(source.title).font(Theme.Font.headline)
                        Text(source.section).font(Theme.Font.footnote).foregroundStyle(Theme.Color.labelSecondary)
                        Text(source.snippet)
                            .font(Theme.Font.subheadline)
                            .foregroundStyle(Theme.Color.labelSecondary)
                            .lineLimit(2)
                            .padding(.top, Theme.Space.xs)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, Theme.Space.lg)
        .padding(.bottom, Theme.Space.xxxl)
    }

    private func safetyTab(_ result: DiagnoseResponse) -> some View {
        VStack(alignment: .leading, spacing: Theme.Space.md) {
            ProCard {
                Text(result.safety.label)
                    .font(Theme.Font.headline)
                if result.safety.warnings.isEmpty && !result.safety.blocked {
                    Text("No additional warnings for this repair.")
                        .font(Theme.Font.subheadline)
                        .foregroundStyle(Theme.Color.labelSecondary)
                } else {
                    ForEach(result.safety.warnings, id: \.self) { w in
                        Text("• \(w)")
                            .font(Theme.Font.subheadline)
                            .foregroundStyle(Theme.Color.labelSecondary)
                    }
                }
            }
            ProButton(title: "Safety policy", icon: "shield", style: .ghost) {
                store.navigateScan(.safetyCenter)
            }
        }
        .padding(.horizontal, Theme.Space.lg)
        .padding(.bottom, Theme.Space.xxxl)
    }

    private func metricsCard(_ result: DiagnoseResponse) -> some View {
        ProCard {
            Text("Pipeline")
                .font(Theme.Font.caption)
                .foregroundStyle(Theme.Color.labelTertiary)
            HStack {
                metricItem("Provider", result.metrics.provider_used)
                metricItem("Latency", "\(Int(result.metrics.total_latency_ms))ms")
                metricItem("Citations", "\(Int(result.metrics.citation_coverage * 100))%")
            }
            .padding(.top, Theme.Space.sm)
        }
    }

    private func metricItem(_ label: String, _ value: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label).font(Theme.Font.caption2).foregroundStyle(Theme.Color.labelTertiary)
            Text(value).font(Theme.Font.footnote).foregroundStyle(Theme.Color.label)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct StepDetailView: View {
    @EnvironmentObject var store: SessionStore
    let stepNumber: Int

    var body: some View {
        ProScreen {
            if let step = store.diagnoseResult?.steps.first(where: { $0.step_number == stepNumber }) {
                ScrollView {
                    VStack(alignment: .leading, spacing: Theme.Space.lg) {
                        Text("Step \(step.step_number)")
                            .font(Theme.Font.caption)
                            .foregroundStyle(Theme.Color.labelTertiary)
                        Text(step.title).font(Theme.Font.title2)
                        Text(step.instruction).font(Theme.Font.body)
                        ProCard {
                            Text("Why").font(Theme.Font.caption).foregroundStyle(Theme.Color.labelTertiary)
                            Text(step.why).font(Theme.Font.subheadline).padding(.top, Theme.Space.xs)
                        }
                        if !step.tools.isEmpty {
                            Text("Tools").font(Theme.Font.caption).foregroundStyle(Theme.Color.labelTertiary)
                            FlowLayout {
                                ForEach(step.tools, id: \.self) { t in
                                    Text(t)
                                        .font(Theme.Font.footnote)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 6)
                                        .background(Theme.Color.surfaceHover)
                                        .clipShape(RoundedRectangle(cornerRadius: 6))
                                }
                            }
                        }
                        if !step.citation_ids.isEmpty {
                            Text("Citations").font(Theme.Font.caption).foregroundStyle(Theme.Color.labelTertiary)
                            Text(step.citation_ids.joined(separator: "\n"))
                                .font(Theme.Font.mono)
                                .foregroundStyle(Theme.Color.labelSecondary)
                        }
                    }
                    .padding(Theme.Space.lg)
                }
            }
        }
        .navigationTitle("Step detail")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ProfessionalHandoffView: View {
    @EnvironmentObject var store: SessionStore

    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    Image(systemName: "hand.raised.fill")
                        .font(.system(size: 44, weight: .light))
                        .foregroundStyle(Theme.Color.danger)
                    Text("Professional repair required")
                        .font(Theme.Font.title1)
                    Text("FixIt Lens identified a high-risk situation. We won't provide step-by-step repair instructions that could cause injury or property damage.")
                        .font(Theme.Font.body)
                        .foregroundStyle(Theme.Color.labelSecondary)
                    if let warnings = store.diagnoseResult?.safety.warnings {
                        ProCard {
                            ForEach(warnings, id: \.self) { w in
                                Text(w).font(Theme.Font.subheadline)
                            }
                        }
                    }
                    ProButton(title: "View safety policy", style: .secondary) {
                        store.navigateScan(.safetyCenter)
                    }
                }
                .padding(Theme.Space.lg)
            }
        }
        .navigationTitle("Safety")
        .navigationBarTitleDisplayMode(.inline)
    }
}
