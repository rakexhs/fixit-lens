import SwiftUI

// MARK: - Repairs tab

struct RepairsListView: View {
    @EnvironmentObject var store: SessionStore
    @State private var sessions: [SessionSummary] = []
    @State private var loading = true

    var body: some View {
        ProScreen {
            VStack(spacing: 0) {
                NavHeader(title: "Repairs", subtitle: "Your past scans", large: true)

                if loading && sessions.isEmpty {
                    Spacer()
                    ProgressView()
                    Spacer()
                } else if sessions.isEmpty {
                    EmptyStateView(
                        icon: "clock",
                        title: "No scans yet",
                        message: "When you scan something, it will show up here with a simple summary.",
                        actionTitle: "Start scanning",
                        action: { store.selectedTab = .scan }
                    )
                } else {
                    List(sessions) { s in
                        Button {
                            store.navigateRepairs(.sessionDetail(s.session_id))
                        } label: {
                            repairRow(s)
                        }
                        .listRowBackground(Theme.Color.bg)
                        .listRowSeparatorTint(Theme.Color.separator)
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                }
            }
        }
        .task(id: store.repairsRefreshToken) { await load() }
        .refreshable { await load() }
    }

    private func repairRow(_ s: SessionSummary) -> some View {
        HStack(spacing: Theme.Space.md) {
            Image(systemName: deviceIcon(s.device_category))
                .foregroundStyle(Theme.Color.accent)
                .frame(width: 36, height: 36)
                .background(Theme.Color.accentMuted)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            VStack(alignment: .leading, spacing: 4) {
                Text(friendlyTitle(s))
                    .font(Theme.Font.headline)
                    .foregroundStyle(Theme.Color.label)
                    .lineLimit(2)
                Text(friendlySubtitle(s))
                    .font(Theme.Font.caption)
                    .foregroundStyle(Theme.Color.labelTertiary)
            }
            Spacer()
            Text(friendlyStatus(s))
                .font(Theme.Font.caption)
                .foregroundStyle(s.blocked ? Theme.Color.danger : Theme.Color.labelSecondary)
        }
        .padding(.vertical, Theme.Space.xs)
    }

    private func friendlyTitle(_ s: SessionSummary) -> String {
        if let issue = s.likely_issue,
           !issue.isEmpty,
           !issue.lowercased().contains("unable"),
           issue != "Unknown" {
            return issue
        }
        if let brand = s.brand, let model = s.model, !brand.isEmpty {
            return "\(brand) \(model)"
        }
        if let brand = s.brand, !brand.isEmpty { return brand }
        return friendlyCategory(s.device_category)
    }

    private func friendlySubtitle(_ s: SessionSummary) -> String {
        formatDate(s.created_at)
    }

    private func friendlyStatus(_ s: SessionSummary) -> String {
        if s.blocked { return "Pro needed" }
        return "Ready"
    }

    private func friendlyCategory(_ raw: String?) -> String {
        switch raw?.lowercased() {
        case "router": return "Router"
        case "dishwasher": return "Dishwasher"
        case "washing_machine": return "Washing machine"
        case "laptop": return "Laptop"
        case "appliance", "electronics": return "Device"
        case "general": return "General item"
        case "dangerous": return "High-risk item"
        default: return "Scan"
        }
    }

    private func load() async {
        loading = true
        sessions = (try? await APIClient.shared.listSessions()) ?? []
        loading = false
    }
}

struct SessionDetailView: View {
    @EnvironmentObject var store: SessionStore
    let sessionId: String
    @State private var detail: SessionDetail?
    @State private var loading = true

    var body: some View {
        ProScreen {
            if loading {
                ProgressView().frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let d = detail {
                ScrollView {
                    VStack(alignment: .leading, spacing: Theme.Space.lg) {
                        Text(d.likely_issue ?? "Your scan")
                            .font(Theme.Font.title2)
                        if d.blocked {
                            ProCard {
                                Label("A professional should handle this", systemImage: "exclamationmark.shield")
                                    .font(Theme.Font.subheadline)
                                    .foregroundStyle(Theme.Color.danger)
                            }
                        }
                        if !d.steps.isEmpty {
                            ProCard {
                                Text("What to try").font(Theme.Font.headline)
                                ForEach(d.steps.prefix(5)) { step in
                                    Text("\(step.step_number). \(step.title)")
                                        .font(Theme.Font.subheadline)
                                        .foregroundStyle(Theme.Color.labelSecondary)
                                        .padding(.top, Theme.Space.xs)
                                }
                            }
                        } else {
                            ProCard {
                                Text("No steps saved for this scan.")
                                    .font(Theme.Font.subheadline)
                                    .foregroundStyle(Theme.Color.labelSecondary)
                            }
                        }
                        ProButton(title: "Open full diagnosis", style: .secondary) {
                            store.diagnoseResult = DiagnoseResponse(
                                session_id: d.session_id,
                                diagnosis: d.diagnosis ?? Diagnosis(likely_issue: d.likely_issue ?? "", confidence: 0, reasoning_summary: ""),
                                safety: d.safety ?? SafetyAssessment(risk_level: d.risk_level ?? 0, label: "", warnings: [], blocked: d.blocked, professional_required: d.blocked),
                                steps: d.steps,
                                clarifying_question: nil,
                                sources: d.sources,
                                metrics: DiagnoseMetrics(retrieval_latency_ms: 0, generation_latency_ms: 0, total_latency_ms: 0, citation_coverage: 1, provider_used: d.provider_used ?? "")
                            )
                            store.openDiagnosis()
                        }
                    }
                    .padding(Theme.Space.lg)
                }
            }
        }
        .navigationTitle("Session")
        .navigationBarTitleDisplayMode(.inline)
        .task { await load() }
    }

    private func load() async {
        loading = true
        detail = try? await APIClient.shared.getSession(sessionId)
        loading = false
    }
}

// MARK: - Library tab

struct LibraryHomeView: View {
    @EnvironmentObject var store: SessionStore

    private let seeded: [(String, String)] = [
        ("TP-Link Archer AX55", "Router · WAN troubleshooting"),
        ("Bosch Dishwasher E24", "Appliance · Drain error"),
        ("LG Washer OE", "Appliance · Drain error"),
        ("Lenovo Fan Noise", "Laptop · Cooling"),
        ("MacBook Overheating", "Laptop · Thermal"),
        ("High-risk repairs", "Safety reference")
    ]

    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "Library", subtitle: "Manuals & sources", large: true)
                    ProButton(title: "Upload manual", icon: "square.and.arrow.up", style: .secondary) {
                        store.navigateLibrary(.manualUpload)
                    }
                    .padding(.horizontal, Theme.Space.lg)

                    ProSection(title: "Built-in manuals") {
                        ForEach(seeded, id: \.0) { item in
                            ProListRow(icon: "doc.text", title: item.0, subtitle: item.1, showChevron: false)
                            if item.0 != seeded.last?.0 { Divider().padding(.leading, 52) }
                        }
                    }
                    .padding(.horizontal, Theme.Space.lg)

                    ProButton(title: "Browse citations", icon: "link", style: .ghost) {
                        store.navigateLibrary(.citations)
                    }
                    .padding(.horizontal, Theme.Space.lg)
                }
                .padding(.bottom, Theme.Space.xxxl)
            }
        }
    }
}

struct ManualUploadView: View {
    @State private var title = ""
    @State private var text = ""
    @State private var uploading = false
    @State private var message: String?

    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "Upload manual", subtitle: "Becomes a priority source")
                    TextField("Title", text: $title)
                        .textFieldStyle(.plain)
                        .padding(Theme.Space.md)
                        .background(Theme.Color.surface)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.md))
                    TextEditor(text: $text)
                        .frame(minHeight: 200)
                        .scrollContentBackground(.hidden)
                        .padding(Theme.Space.md)
                        .background(Theme.Color.surface)
                        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.md))
                    ProButton(title: "Index manual", isLoading: uploading) {
                        Task { await upload() }
                    }
                    if let message {
                        Text(message).font(Theme.Font.footnote).foregroundStyle(Theme.Color.labelSecondary)
                    }
                }
                .padding(Theme.Space.lg)
            }
        }
        .navigationTitle("Upload")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func upload() async {
        uploading = true
        defer { uploading = false }
        do {
            let r = try await APIClient.shared.uploadManual(text: text, title: title.isEmpty ? nil : title, category: nil, brand: nil, model: nil)
            message = "Indexed \(r.chunks_indexed) sections."
            text = ""
        } catch {
            message = error.localizedDescription
        }
    }
}

struct SourceDetailView: View {
    @EnvironmentObject var store: SessionStore

    var body: some View {
        ProScreen {
            if let source = store.selectedSource {
                ScrollView {
                    VStack(alignment: .leading, spacing: Theme.Space.lg) {
                        Text(source.title).font(Theme.Font.title2)
                        Text("\(source.section) · score \(String(format: "%.2f", source.score))")
                            .font(Theme.Font.footnote)
                            .foregroundStyle(Theme.Color.labelSecondary)
                        ProCard {
                            Text(source.snippet).font(Theme.Font.body)
                        }
                        Text(source.why_matched)
                            .font(Theme.Font.subheadline)
                            .foregroundStyle(Theme.Color.labelTertiary)
                        Text(source.id).font(Theme.Font.mono).foregroundStyle(Theme.Color.labelTertiary)
                    }
                    .padding(Theme.Space.lg)
                }
            }
        }
        .navigationTitle("Source")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct CitationExplorerView: View {
    @EnvironmentObject var store: SessionStore

    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.md) {
                    NavHeader(title: "Citations", subtitle: "Every step must cite a source")
                    if let sources = store.diagnoseResult?.sources, !sources.isEmpty {
                        ForEach(sources) { s in
                            ProCard(padding: Theme.Space.md) {
                                Text(s.title).font(Theme.Font.headline)
                                Text(s.id).font(Theme.Font.mono).foregroundStyle(Theme.Color.labelTertiary)
                            }
                        }
                    } else {
                        EmptyStateView(icon: "link", title: "No citations", message: "Run a diagnosis to see cited manual excerpts.")
                    }
                }
                .padding(Theme.Space.lg)
            }
        }
        .navigationTitle("Citations")
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - Insights tab

struct InsightsHomeView: View {
    @State private var metrics: MetricsResponse?
    @EnvironmentObject var store: SessionStore

    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "Insights", subtitle: "System performance", large: true)
                    if let m = metrics {
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.Space.md) {
                            MetricTile(label: "Sessions", value: "\(m.total_sessions)")
                            MetricTile(label: "Avg latency", value: "\(Int(m.average_latency_ms))ms")
                            MetricTile(label: "Citations", value: "\(Int(m.citation_coverage * 100))%")
                            MetricTile(label: "Safety blocks", value: "\(m.safety_blocks)")
                        }
                        .padding(.horizontal, Theme.Space.lg)
                        ProCard {
                            Text("Provider usage").font(Theme.Font.caption).foregroundStyle(Theme.Color.labelTertiary)
                            ForEach(m.provider_usage.sorted(by: { $0.key < $1.key }), id: \.key) { k, v in
                                HStack {
                                    Text(k).font(Theme.Font.subheadline)
                                    Spacer()
                                    Text("\(v)").font(Theme.Font.footnote).monospacedDigit()
                                }
                            }
                        }
                        .padding(.horizontal, Theme.Space.lg)
                    } else {
                        ProgressView().frame(maxWidth: .infinity).padding(.top, 60)
                    }
                    ProButton(title: "Backend status", icon: "server.rack", style: .secondary) {
                        store.navigateInsights(.backendStatus)
                    }
                    .padding(.horizontal, Theme.Space.lg)
                }
                .padding(.bottom, Theme.Space.xxxl)
            }
        }
        .task {
            metrics = try? await APIClient.shared.getMetrics()
        }
    }
}

struct BackendStatusView: View {
    @EnvironmentObject var settings: AppSettings
    @State private var isEditing = false
    @State private var draftURL = ""
    @State private var saveError: String?
    @State private var health: HealthResponse?
    @State private var status = "Not tested yet"
    @State private var ok = false

    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "Backend", subtitle: "Connection & version")
                    ProSection(title: "API URL") {
                        if isEditing {
                            VStack(alignment: .leading, spacing: Theme.Space.sm) {
                                TextField("http://192.168.1.12:8000", text: $draftURL)
                                    .textInputAutocapitalization(.never)
                                    .autocorrectionDisabled()
                                    .keyboardType(.URL)
                                    .font(Theme.Font.body)
                                    .padding(Theme.Space.md)
                                Text("Simulator: http://127.0.0.1:8000. iPhone: your Mac Wi‑Fi IP with make backend-lan running.")
                                    .font(Theme.Font.footnote)
                                    .foregroundStyle(Theme.Color.labelSecondary)
                                    .padding(.horizontal, Theme.Space.md)
                                if let saveError {
                                    Text(saveError)
                                        .font(Theme.Font.footnote)
                                        .foregroundStyle(Theme.Color.danger)
                                        .padding(.horizontal, Theme.Space.md)
                                }
                            }
                            .padding(.bottom, Theme.Space.sm)
                        } else {
                            ProListRow(icon: "link", title: settings.apiBaseURL, showChevron: false)
                        }
                    }
                    ProSection(title: "Health") {
                        ProListRow(icon: ok ? "checkmark.circle.fill" : "xmark.circle", title: status, showChevron: false)
                        if let h = health {
                            ProListRow(icon: "number", title: "Version \(h.version)", showChevron: false)
                        }
                    }
                    if isEditing {
                        ProButton(title: "Save", icon: "checkmark", style: .primary) {
                            saveURL()
                        }
                        ProButton(title: "Cancel", style: .secondary) {
                            cancelEdit()
                        }
                    } else {
                        ProButton(title: "Edit URL", icon: "pencil", style: .primary) {
                            beginEdit()
                        }
                        ProButton(title: "Test connection", style: .secondary) {
                            Task { await test() }
                        }
                    }
                }
                .padding(Theme.Space.lg)
            }
        }
        .navigationTitle("Backend")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func beginEdit() {
        draftURL = settings.apiBaseURL
        saveError = nil
        isEditing = true
    }

    private func cancelEdit() {
        draftURL = settings.apiBaseURL
        saveError = nil
        isEditing = false
    }

    private func saveURL() {
        if let error = settings.updateBaseURL(draftURL) {
            saveError = error
            return
        }
        draftURL = settings.apiBaseURL
        saveError = nil
        isEditing = false
        status = "URL saved"
        ok = false
        health = nil
    }

    private func test() async {
        status = "Checking…"
        do {
            health = try await APIClient.shared.health()
            status = "Connected"
            ok = true
        } catch {
            status = error.localizedDescription
            ok = false
        }
    }
}

// MARK: - Account tab

struct AccountHomeView: View {
    @EnvironmentObject var store: SessionStore

    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "Account", subtitle: "Settings & privacy", large: true)
                    ProSection(title: "App") {
                        Button { store.navigateAccount(.backendStatus) } label: {
                            ProListRow(icon: "server.rack", title: "Backend connection")
                        }
                        Divider().padding(.leading, 52)
                        Button { store.navigateAccount(.safetyCenter) } label: {
                            ProListRow(icon: "shield", title: "Safety center")
                        }
                        Divider().padding(.leading, 52)
                        Button { store.navigateAccount(.privacy) } label: {
                            ProListRow(icon: "hand.raised", title: "Privacy & data")
                        }
                        Divider().padding(.leading, 52)
                        Button { store.navigateAccount(.about) } label: {
                            ProListRow(icon: "info.circle", title: "About FixIt Lens")
                        }
                    }
                    .padding(.horizontal, Theme.Space.lg)

                    ProButton(title: "Clear all history", style: .destructive) {
                        Task { await store.clearAllHistory() }
                    }
                    .padding(.horizontal, Theme.Space.lg)
                }
                .padding(.bottom, Theme.Space.xxxl)
            }
        }
    }
}

struct SafetyCenterView: View {
    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "Safety center", subtitle: "What we help with — and refuse")
                    ProCard {
                        Text("FixIt Lens only provides troubleshooting supported by retrieved manuals. Every procedural step requires a valid citation.")
                            .font(Theme.Font.body)
                    }
                    ProSection(title: "We refuse") {
                        ForEach(["Microwave capacitor discharge", "Gas appliance repair", "Mains wiring", "Swollen battery", "CRT discharge", "Vehicle brakes/airbags"], id: \.self) { item in
                            ProListRow(icon: "xmark.circle", title: item, showChevron: false)
                            if item != "Vehicle brakes/airbags" { Divider().padding(.leading, 52) }
                        }
                    }
                    ProSection(title: "Risk levels") {
                        ProListRow(icon: "0.circle", title: "Safe — external checks", showChevron: false)
                        Divider().padding(.leading, 52)
                        ProListRow(icon: "2.circle", title: "Moderate — warnings required", showChevron: false)
                        Divider().padding(.leading, 52)
                        ProListRow(icon: "3.circle", title: "High — professional required", showChevron: false)
                    }
                }
                .padding(Theme.Space.lg)
            }
        }
        .navigationTitle("Safety")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct PrivacyView: View {
    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "Privacy", subtitle: "Your data")
                    ProCard {
                        Text("Photos and text you submit are sent only to your configured backend. API keys are never stored on this device.")
                            .font(Theme.Font.body)
                            .foregroundStyle(Theme.Color.labelSecondary)
                    }
                    Text("You can delete all scan history from Account → Clear all history.")
                        .font(Theme.Font.subheadline)
                        .foregroundStyle(Theme.Color.labelTertiary)
                }
                .padding(Theme.Space.lg)
            }
        }
        .navigationTitle("Privacy")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AboutView: View {
    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "FixIt Lens", subtitle: "Version 1.0.0")
                    ProCard {
                        Text("Camera-guided repair assistant with cited, safety-checked troubleshooting. Not a substitute for a qualified technician.")
                            .font(Theme.Font.body)
                            .foregroundStyle(Theme.Color.labelSecondary)
                    }
                }
                .padding(Theme.Space.lg)
            }
        }
        .navigationTitle("About")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct AskIssueView: View {
    @EnvironmentObject var store: SessionStore
    @State private var category: String?
    @State private var brand = ""
    @State private var model = ""
    @State private var errorCode = ""
    @State private var symptom = ""

    private let categories = ["router", "dishwasher", "washing_machine", "laptop", "other"]

    var body: some View {
        ProScreen {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.Space.lg) {
                    NavHeader(title: "Describe issue", subtitle: "Without a photo")
                    Picker("Category", selection: Binding(get: { category ?? "" }, set: { category = $0.isEmpty ? nil : $0 })) {
                        Text("Select…").tag("")
                        ForEach(categories, id: \.self) { Text(titleCase($0)).tag($0) }
                    }
                    .pickerStyle(.menu)
                    formField("Brand", $brand)
                    formField("Model", $model)
                    formField("Error code", $errorCode)
                    formField("Symptom", $symptom)
                    ProButton(title: "Analyze", icon: "sparkles") {
                        store.pendingDiagnoseRequest = DiagnoseRequest(
                            user_text: symptom,
                            device_category: category == "other" ? nil : category,
                            brand: brand.isEmpty ? nil : brand,
                            model: model.isEmpty ? nil : model,
                            error_code: errorCode.isEmpty ? nil : errorCode,
                            symptom: symptom.isEmpty ? nil : symptom
                        )
                        store.navigateScan(.analyze(mode: .text))
                    }
                }
                .padding(Theme.Space.lg)
            }
        }
        .navigationTitle("Type details")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func formField(_ label: String, _ text: Binding<String>) -> some View {
        VStack(alignment: .leading, spacing: Theme.Space.xs) {
            Text(label).font(Theme.Font.caption).foregroundStyle(Theme.Color.labelTertiary)
            TextField(label, text: text)
                .padding(Theme.Space.md)
                .background(Theme.Color.surface)
                .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.md))
        }
    }
}
