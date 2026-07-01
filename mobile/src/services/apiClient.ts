import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import { getApiBaseUrlOverride } from './storage';
import type {
  AnalyzeImageResponse,
  DiagnoseRequestPayload,
  DiagnoseResponse,
  FeedbackPayload,
  HealthResponse,
  ManualUploadResponse,
  MetricsResponse,
  SessionDetail,
  SessionSummary,
} from './types';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function resolveBaseUrl(): Promise<string> {
  const override = await getApiBaseUrlOverride();
  return override && override.trim().length > 0 ? override.trim() : API_BASE_URL;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = await resolveBaseUrl();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}${path}`, { ...init, signal: controller.signal });
    if (!response.ok) {
      let detail = `Request failed with status ${response.status}`;
      try {
        const body = await response.json();
        if (body?.detail) detail = body.detail;
      } catch {
        // ignore non-JSON error bodies
      }
      throw new ApiError(detail, response.status);
    }
    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ApiError('The request timed out. Check that the backend is running and reachable.');
    }
    throw new ApiError('Could not reach the FixIt Lens backend. Check your connection and API URL in Settings.');
  } finally {
    clearTimeout(timeout);
  }
}

export async function getHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health');
}

export async function analyzeImage(
  imageUri: string,
  filename: string,
  mimeType: string,
  userHint?: string
): Promise<AnalyzeImageResponse> {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    name: filename,
    type: mimeType,
  } as unknown as Blob);
  if (userHint) formData.append('user_hint', userHint);

  return request<AnalyzeImageResponse>('/api/analyze/image', {
    method: 'POST',
    body: formData,
  });
}

export async function diagnose(payload: DiagnoseRequestPayload): Promise<DiagnoseResponse> {
  return request<DiagnoseResponse>('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function uploadManualText(
  text: string,
  title?: string,
  category?: string,
  brand?: string,
  model?: string
): Promise<ManualUploadResponse> {
  const formData = new FormData();
  formData.append('text', text);
  if (title) formData.append('title', title);
  if (category) formData.append('category', category);
  if (brand) formData.append('brand', brand);
  if (model) formData.append('model', model);

  return request<ManualUploadResponse>('/api/manuals/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function listSessions(): Promise<SessionSummary[]> {
  return request<SessionSummary[]>('/api/sessions');
}

export async function getSession(sessionId: string): Promise<SessionDetail> {
  return request<SessionDetail>(`/api/sessions/${sessionId}`);
}

export async function submitFeedback(payload: FeedbackPayload): Promise<{ status: string }> {
  return request<{ status: string }>('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function getMetrics(): Promise<MetricsResponse> {
  return request<MetricsResponse>('/api/metrics');
}
