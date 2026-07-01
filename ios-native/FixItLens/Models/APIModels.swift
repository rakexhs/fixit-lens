import Foundation

struct HealthResponse: Codable {
    let status: String
    let version: String
}

struct ImageQuality: Codable {
    let usable: Bool
    let score: Double
    let issues: [String]
}

struct OCRResult: Codable {
    let text: String
    let tokens: [String]
    let confidence: Double
}

struct DetectedDevice: Codable {
    let category: String
    let brand: String?
    let model: String?
    let confidence: Double
}

struct DetectedProblem: Codable {
    let type: String
    let error_code: String?
    let symptom: String?
    let confidence: Double
}

struct AnalyzeImageResponse: Codable {
    let session_id: String
    let image_quality: ImageQuality
    let ocr: OCRResult
    let detected_device: DetectedDevice
    let detected_problem: DetectedProblem
    let provider_used: String
}

struct DiagnoseRequest: Codable {
    var session_id: String?
    var user_text: String?
    var device_category: String?
    var brand: String?
    var model: String?
    var error_code: String?
    var symptom: String?
}

struct Diagnosis: Codable {
    let likely_issue: String
    let confidence: Double
    let reasoning_summary: String
}

struct SafetyAssessment: Codable {
    let risk_level: Int
    let label: String
    let warnings: [String]
    let blocked: Bool
    let professional_required: Bool
}

struct RepairStep: Codable, Identifiable {
    var id: Int { step_number }
    let step_number: Int
    let title: String
    let instruction: String
    let why: String
    let tools: [String]
    let citation_ids: [String]
    let stop_if: [String]
}

struct Source: Codable, Identifiable {
    let id: String
    let title: String
    let section: String
    let page: String?
    let snippet: String
    let score: Double
    let why_matched: String
}

struct DiagnoseMetrics: Codable {
    let retrieval_latency_ms: Double
    let generation_latency_ms: Double
    let total_latency_ms: Double
    let citation_coverage: Double
    let provider_used: String
}

struct DiagnoseResponse: Codable {
    let session_id: String
    let diagnosis: Diagnosis
    let safety: SafetyAssessment
    let steps: [RepairStep]
    let clarifying_question: String?
    let sources: [Source]
    let metrics: DiagnoseMetrics
}

struct SessionSummary: Codable, Identifiable {
    var id: String { session_id }
    let session_id: String
    let created_at: String
    let device_category: String?
    let brand: String?
    let model: String?
    let likely_issue: String?
    let risk_level: Int?
    let blocked: Bool
    let provider_used: String?
}

struct SessionDetail: Codable {
    let session_id: String
    let created_at: String
    let device_category: String?
    let brand: String?
    let model: String?
    let likely_issue: String?
    let risk_level: Int?
    let blocked: Bool
    let provider_used: String?
    let ocr_text: String?
    let diagnosis: Diagnosis?
    let safety: SafetyAssessment?
    let steps: [RepairStep]
    let sources: [Source]
}

enum FeedbackResult: String, Codable {
    case done, didnt_work, skip, stop
}

struct FeedbackRequest: Codable {
    let session_id: String
    let step_number: Int?
    let result: String
    let comment: String?
}

struct ManualUploadResponse: Codable {
    let manual_id: String
    let chunks_indexed: Int
    let status: String
}

struct MetricsResponse: Codable {
    let total_sessions: Int
    let average_latency_ms: Double
    let citation_coverage: Double
    let safety_blocks: Int
    let retrieval_count: Int
    let provider_usage: [String: Int]
}

struct APIErrorResponse: Codable {
    let detail: String
}

enum APIError: LocalizedError {
    case invalidURL
    case server(String)
    case decoding
    case network(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid API URL."
        case .server(let msg): return msg
        case .decoding: return "Could not read the server response."
        case .network(let msg): return msg
        }
    }
}
