import Foundation
import UIKit

@MainActor
final class APIClient {
    static let shared = APIClient()
    private let session: URLSession
    private let timeout: TimeInterval = 30

    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = timeout
        session = URLSession(configuration: config)
    }

    private func baseURL() throws -> URL {
        let raw = AppSettings.shared.apiBaseURL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let url = URL(string: raw) else { throw APIError.invalidURL }
        return url
    }

    private func request<T: Decodable>(_ path: String, method: String = "GET", body: Data? = nil, contentType: String? = nil) async throws -> T {
        let url = try baseURL().appendingPathComponent(path.trimmingCharacters(in: CharacterSet(charactersIn: "/")))
        var req = URLRequest(url: url)
        req.httpMethod = method
        if let body {
            req.httpBody = body
            req.setValue(contentType ?? "application/json", forHTTPHeaderField: "Content-Type")
        }
        do {
            let (data, response) = try await session.data(for: req)
            guard let http = response as? HTTPURLResponse else {
                throw APIError.network("No response from server.")
            }
            if http.statusCode >= 400 {
                if let err = try? JSONDecoder().decode(APIErrorResponse.self, from: data) {
                    throw APIError.server(err.detail)
                }
                throw APIError.server("Request failed (\(http.statusCode)).")
            }
            do {
                return try JSONDecoder().decode(T.self, from: data)
            } catch {
                throw APIError.decoding
            }
        } catch let e as APIError {
            throw e
        } catch {
            throw APIError.network("Could not reach FixIt Lens backend. Check Account → Backend connection and ensure the backend is running.")
        }
    }

    func health() async throws -> HealthResponse {
        try await request("/health")
    }

    func analyzeImage(_ imageData: Data, filename: String = "capture.jpg", userHint: String? = nil) async throws -> AnalyzeImageResponse {
        let boundary = UUID().uuidString
        var body = Data()
        func append(_ s: String) { body.append(Data(s.utf8)) }

        append("--\(boundary)\r\n")
        append("Content-Disposition: form-data; name=\"image\"; filename=\"\(filename)\"\r\n")
        append("Content-Type: image/jpeg\r\n\r\n")
        body.append(imageData)
        append("\r\n")
        if let hint = userHint, !hint.isEmpty {
            append("--\(boundary)\r\n")
            append("Content-Disposition: form-data; name=\"user_hint\"\r\n\r\n")
            append("\(hint)\r\n")
        }
        append("--\(boundary)--\r\n")

        let url = try baseURL().appendingPathComponent("api/analyze/image")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        req.httpBody = body

        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse, http.statusCode < 400 else {
            if let err = try? JSONDecoder().decode(APIErrorResponse.self, from: data) {
                throw APIError.server(err.detail)
            }
            throw APIError.server("Image analysis failed.")
        }
        return try JSONDecoder().decode(AnalyzeImageResponse.self, from: data)
    }

    func diagnose(_ payload: DiagnoseRequest) async throws -> DiagnoseResponse {
        let body = try JSONEncoder().encode(payload)
        return try await request("/api/diagnose", method: "POST", body: body)
    }

    func listSessions() async throws -> [SessionSummary] {
        try await request("/api/sessions")
    }

    func deleteAllSessions() async throws {
        let _: StatusResponse = try await request("/api/sessions", method: "DELETE")
    }

    func getSession(_ id: String) async throws -> SessionDetail {
        try await request("/api/sessions/\(id)")
    }

    func submitFeedback(sessionId: String, stepNumber: Int?, result: FeedbackResult) async throws {
        let payload = FeedbackRequest(session_id: sessionId, step_number: stepNumber, result: result.rawValue, comment: nil)
        let body = try JSONEncoder().encode(payload)
        let _: StatusResponse = try await request("/api/feedback", method: "POST", body: body)
    }

    func getMetrics() async throws -> MetricsResponse {
        try await request("/api/metrics")
    }

    func uploadManual(text: String, title: String?, category: String?, brand: String?, model: String?) async throws -> ManualUploadResponse {
        let boundary = UUID().uuidString
        var body = Data()
        func append(_ s: String) { body.append(Data(s.utf8)) }
        func field(_ name: String, _ value: String) {
            append("--\(boundary)\r\n")
            append("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n")
            append("\(value)\r\n")
        }
        field("text", text)
        if let title { field("title", title) }
        if let category { field("category", category) }
        if let brand { field("brand", brand) }
        if let model { field("model", model) }
        append("--\(boundary)--\r\n")

        let url = try baseURL().appendingPathComponent("api/manuals/upload")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        req.httpBody = body

        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse, http.statusCode < 400 else {
            if let err = try? JSONDecoder().decode(APIErrorResponse.self, from: data) {
                throw APIError.server(err.detail)
            }
            throw APIError.server("Manual upload failed.")
        }
        return try JSONDecoder().decode(ManualUploadResponse.self, from: data)
    }
}

struct StatusResponse: Codable {
    let status: String
}
