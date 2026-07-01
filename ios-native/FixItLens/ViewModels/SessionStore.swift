import Foundation
import Combine

enum AppTab: Int, CaseIterable {
    case scan, repairs, library, insights, account

    var title: String {
        switch self {
        case .scan: return "Scan"
        case .repairs: return "Repairs"
        case .library: return "Library"
        case .insights: return "Insights"
        case .account: return "Account"
        }
    }

    var icon: String {
        switch self {
        case .scan: return "viewfinder"
        case .repairs: return "wrench.and.screwdriver"
        case .library: return "books.vertical"
        case .insights: return "chart.bar"
        case .account: return "person.crop.circle"
        }
    }
}

enum AppRoute: Hashable {
    case preview
    case analyze(mode: AnalyzeMode)
    case diagnosisHub
    case guidedRepair
    case stepDetail(Int)
    case askIssue
    case sessionDetail(String)
    case sourceDetail
    case manualUpload
    case safetyCenter
    case citations
    case backendStatus
    case privacy
    case about
    case professionalHandoff
}

enum AnalyzeMode: Hashable {
    case image
    case text
}

enum DiagnosisTab: String, CaseIterable {
    case overview = "Overview"
    case steps = "Steps"
    case sources = "Sources"
    case safety = "Safety"
}

@MainActor
final class SessionStore: ObservableObject {
    @Published var selectedTab: AppTab = .scan
    @Published var scanPath = NavigationPath()
    @Published var repairsPath = NavigationPath()
    @Published var libraryPath = NavigationPath()
    @Published var insightsPath = NavigationPath()
    @Published var accountPath = NavigationPath()

    @Published var capturedImage: UIImage?
    @Published var analyzeResult: AnalyzeImageResponse?
    @Published var diagnoseResult: DiagnoseResponse?
    @Published var pendingDiagnoseRequest: DiagnoseRequest?
    @Published var currentStepIndex = 0
    @Published var diagnosisTab: DiagnosisTab = .overview
    @Published var selectedSourceId: String?
    @Published var imageQualityIssues: [String] = []
    @Published var repairsRefreshToken = 0

    func resetSession() {
        capturedImage = nil
        analyzeResult = nil
        diagnoseResult = nil
        pendingDiagnoseRequest = nil
        currentStepIndex = 0
        diagnosisTab = .overview
        selectedSourceId = nil
        imageQualityIssues = []
        scanPath = NavigationPath()
    }

    func clearAllHistory() async {
        resetSession()
        repairsPath = NavigationPath()
        _ = try? await APIClient.shared.deleteAllSessions()
        repairsRefreshToken += 1
    }

    func navigateScan(_ route: AppRoute) {
        scanPath.append(route)
    }

    func navigateRepairs(_ route: AppRoute) {
        repairsPath.append(route)
    }

    func navigateLibrary(_ route: AppRoute) {
        libraryPath.append(route)
    }

    func navigateInsights(_ route: AppRoute) {
        insightsPath.append(route)
    }

    func navigateAccount(_ route: AppRoute) {
        accountPath.append(route)
    }

    func openDiagnosis() {
        selectedTab = .scan
        scanPath = NavigationPath()
        scanPath.append(AppRoute.diagnosisHub)
    }

    var selectedSource: Source? {
        guard let id = selectedSourceId else { return nil }
        return diagnoseResult?.sources.first { $0.id == id }
    }
}

import SwiftUI
import UIKit
