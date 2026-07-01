import SwiftUI

struct AnalyzeProgressView: View {
    @EnvironmentObject var store: SessionStore
    let mode: AnalyzeMode

    @State private var phase: Phase = .loading
    @State private var message = ""

    enum Phase { case loading, error }

    var body: some View {
        ProScreen {
            switch phase {
            case .loading:
                VStack(spacing: Theme.Space.xxl) {
                    ProgressView().scaleEffect(1.2).tint(Theme.Color.accent)
                    Text("Analyzing")
                        .font(Theme.Font.title2)
                    LoadingTimeline()
                        .padding(.horizontal, Theme.Space.xxxl)
                }
            case .error:
                EmptyStateView(icon: "exclamationmark.triangle", title: "Something went wrong", message: message, actionTitle: "Try again", action: { Task { await run() } })
            }
        }
        .navigationBarBackButtonHidden(phase == .loading)
        .task { await run() }
    }

    private func run() async {
        phase = .loading
        do {
            if mode == .image {
                guard let image = store.capturedImage,
                      let data = ImageProcessing.uploadData(from: image) else {
                    throw APIError.network("No image to analyze. Go back and take a photo.")
                }
                let analyze = try await APIClient.shared.analyzeImage(data)
                store.analyzeResult = analyze
                store.imageQualityIssues = analyze.image_quality.issues

                let diagnose = try await APIClient.shared.diagnose(DiagnoseRequest(
                    session_id: analyze.session_id,
                    device_category: analyze.detected_device.category,
                    brand: analyze.detected_device.brand,
                    model: analyze.detected_device.model,
                    error_code: analyze.detected_problem.error_code,
                    symptom: analyze.detected_problem.symptom
                ))
                store.diagnoseResult = diagnose
            } else {
                guard let req = store.pendingDiagnoseRequest else { throw APIError.network("Enter device details.") }
                store.diagnoseResult = try await APIClient.shared.diagnose(req)
            }
            store.currentStepIndex = 0
            store.diagnosisTab = .overview
            while !store.scanPath.isEmpty { store.scanPath.removeLast() }
            store.navigateScan(.diagnosisHub)
            store.repairsRefreshToken += 1
        } catch {
            message = friendlyError(error)
            phase = .error
        }
    }

    private func friendlyError(_ error: Error) -> String {
        let raw = error.localizedDescription
        if raw.contains("Unsupported image") {
            return "That photo format was not accepted. Try again or use Crop to frame the subject."
        }
        if raw.contains("Could not reach") {
            return raw
        }
        return "We could not analyze this photo. Check your internet and backend connection, then try again."
    }
}
