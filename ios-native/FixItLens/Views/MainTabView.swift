import SwiftUI

@ViewBuilder
func routeDestination(_ route: AppRoute) -> some View {
    switch route {
    case .preview: ImagePreviewView()
    case .analyze(let mode): AnalyzeProgressView(mode: mode)
    case .diagnosisHub: DiagnosisHubView()
    case .guidedRepair: GuidedRepairView()
    case .stepDetail(let n): StepDetailView(stepNumber: n)
    case .askIssue: AskIssueView()
    case .sessionDetail(let id): SessionDetailView(sessionId: id)
    case .sourceDetail: SourceDetailView()
    case .manualUpload: ManualUploadView()
    case .safetyCenter: SafetyCenterView()
    case .citations: CitationExplorerView()
    case .backendStatus: BackendStatusView()
    case .privacy: PrivacyView()
    case .about: AboutView()
    case .professionalHandoff: ProfessionalHandoffView()
    }
}

struct MainTabView: View {
    @EnvironmentObject var store: SessionStore

    var body: some View {
        TabView(selection: $store.selectedTab) {
            ScanTabRoot()
                .tabItem { Label(AppTab.scan.title, systemImage: AppTab.scan.icon) }
                .tag(AppTab.scan)

            RepairsTabRoot()
                .tabItem { Label(AppTab.repairs.title, systemImage: AppTab.repairs.icon) }
                .tag(AppTab.repairs)

            LibraryTabRoot()
                .tabItem { Label(AppTab.library.title, systemImage: AppTab.library.icon) }
                .tag(AppTab.library)

            InsightsTabRoot()
                .tabItem { Label(AppTab.insights.title, systemImage: AppTab.insights.icon) }
                .tag(AppTab.insights)

            AccountTabRoot()
                .tabItem { Label(AppTab.account.title, systemImage: AppTab.account.icon) }
                .tag(AppTab.account)
        }
        .tint(Theme.Color.accent)
    }
}

struct ScanTabRoot: View {
    @EnvironmentObject var store: SessionStore
    var body: some View {
        NavigationStack(path: $store.scanPath) {
            CameraHomeView()
                .navigationDestination(for: AppRoute.self) { routeDestination($0) }
        }
    }
}

struct RepairsTabRoot: View {
    @EnvironmentObject var store: SessionStore
    var body: some View {
        NavigationStack(path: $store.repairsPath) {
            RepairsListView()
                .navigationDestination(for: AppRoute.self) { routeDestination($0) }
        }
    }
}

struct LibraryTabRoot: View {
    @EnvironmentObject var store: SessionStore
    var body: some View {
        NavigationStack(path: $store.libraryPath) {
            LibraryHomeView()
                .navigationDestination(for: AppRoute.self) { routeDestination($0) }
        }
    }
}

struct InsightsTabRoot: View {
    @EnvironmentObject var store: SessionStore
    var body: some View {
        NavigationStack(path: $store.insightsPath) {
            InsightsHomeView()
                .navigationDestination(for: AppRoute.self) { routeDestination($0) }
        }
    }
}

struct AccountTabRoot: View {
    @EnvironmentObject var store: SessionStore
    var body: some View {
        NavigationStack(path: $store.accountPath) {
            AccountHomeView()
                .navigationDestination(for: AppRoute.self) { routeDestination($0) }
        }
    }
}

struct RootView: View {
    @EnvironmentObject var settings: AppSettings

    var body: some View {
        Group {
            if settings.hasCompletedOnboarding {
                MainTabView()
            } else {
                OnboardingView()
            }
        }
    }
}
