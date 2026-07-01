import SwiftUI

struct GuidedRepairView: View {
    @EnvironmentObject var store: SessionStore
    @State private var submitting = false

    var body: some View {
        ProScreen {
            if let result = store.diagnoseResult, !result.steps.isEmpty {
                let steps = result.steps
                let step = steps[store.currentStepIndex]
                let progress = Double(store.currentStepIndex + 1) / Double(steps.count)

                VStack(spacing: 0) {
                    VStack(spacing: Theme.Space.md) {
                        HStack {
                            Text("Step \(store.currentStepIndex + 1) of \(steps.count)")
                                .font(Theme.Font.caption)
                                .foregroundStyle(Theme.Color.labelTertiary)
                            Spacer()
                            StepDots(total: steps.count, current: store.currentStepIndex)
                        }
                        ProgressView(value: progress).tint(Theme.Color.accent)
                    }
                    .padding(Theme.Space.lg)

                    ScrollView {
                        VStack(alignment: .leading, spacing: Theme.Space.lg) {
                            Text(step.title).font(Theme.Font.title1)
                            Text(step.instruction).font(Theme.Font.body)
                            ProCard {
                                Text("Rationale").font(Theme.Font.caption).foregroundStyle(Theme.Color.labelTertiary)
                                Text(step.why).font(Theme.Font.subheadline).padding(.top, Theme.Space.xs)
                            }
                            if !step.stop_if.isEmpty {
                                ProCard {
                                    Text("Stop if").font(Theme.Font.caption).foregroundStyle(Theme.Color.danger)
                                    ForEach(step.stop_if, id: \.self) { s in
                                        Text(s).font(Theme.Font.subheadline)
                                    }
                                }
                            }
                            Button("View citations") {
                                store.navigateScan(.stepDetail(step.step_number))
                            }
                            .font(Theme.Font.subheadline)
                            .foregroundStyle(Theme.Color.accent)
                        }
                        .padding(Theme.Space.lg)
                    }

                    VStack(spacing: Theme.Space.sm) {
                        HStack(spacing: Theme.Space.sm) {
                            ProButton(title: "Didn't work", style: .ghost) { feedback(.didnt_work, step: step, isLast: store.currentStepIndex == steps.count - 1) }
                            ProButton(title: "Skip", style: .ghost) { feedback(.skip, step: step, isLast: store.currentStepIndex == steps.count - 1) }
                        }
                        HStack(spacing: Theme.Space.sm) {
                            ProButton(title: "Stop", style: .destructive) { feedback(.stop, step: step, isLast: true) }
                            ProButton(title: store.currentStepIndex == steps.count - 1 ? "Finish" : "Done", isLoading: submitting) {
                                feedback(.done, step: step, isLast: store.currentStepIndex == steps.count - 1)
                            }
                        }
                    }
                    .padding(Theme.Space.lg)
                }
            } else {
                EmptyStateView(icon: "wrench", title: "No steps", message: "No guided repair for this session.")
            }
        }
        .navigationTitle("Guided repair")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func feedback(_ result: FeedbackResult, step: RepairStep, isLast: Bool) {
        submitting = true
        Task {
            try? await APIClient.shared.submitFeedback(sessionId: store.diagnoseResult?.session_id ?? "", stepNumber: step.step_number, result: result)
            submitting = false
            if result == .stop || isLast {
                store.scanPath = NavigationPath()
                store.navigateScan(.diagnosisHub)
            } else {
                store.currentStepIndex += 1
            }
        }
    }
}
