export interface ImageQuality {
  usable: boolean;
  score: number;
  issues: string[];
}

export interface OCRResult {
  text: string;
  tokens: string[];
  confidence: number;
}

export interface DetectedDevice {
  category: string;
  brand: string | null;
  model: string | null;
  confidence: number;
}

export interface DetectedProblem {
  type: string;
  error_code: string | null;
  symptom: string | null;
  confidence: number;
}

export interface AnalyzeImageResponse {
  session_id: string;
  image_quality: ImageQuality;
  ocr: OCRResult;
  detected_device: DetectedDevice;
  detected_problem: DetectedProblem;
  provider_used: string;
}

export interface DiagnoseRequestPayload {
  session_id?: string | null;
  user_text?: string | null;
  device_category?: string | null;
  brand?: string | null;
  model?: string | null;
  error_code?: string | null;
  symptom?: string | null;
}

export interface Diagnosis {
  likely_issue: string;
  confidence: number;
  reasoning_summary: string;
}

export interface SafetyAssessment {
  risk_level: 0 | 1 | 2 | 3;
  label: string;
  warnings: string[];
  blocked: boolean;
  professional_required: boolean;
}

export interface Step {
  step_number: number;
  title: string;
  instruction: string;
  why: string;
  tools: string[];
  citation_ids: string[];
  stop_if: string[];
}

export interface Source {
  id: string;
  title: string;
  section: string;
  page: string | null;
  snippet: string;
  score: number;
  why_matched: string;
}

export interface DiagnoseMetrics {
  retrieval_latency_ms: number;
  generation_latency_ms: number;
  total_latency_ms: number;
  citation_coverage: number;
  provider_used: string;
}

export interface DiagnoseResponse {
  session_id: string;
  diagnosis: Diagnosis;
  safety: SafetyAssessment;
  steps: Step[];
  clarifying_question: string | null;
  sources: Source[];
  metrics: DiagnoseMetrics;
}

export interface SessionSummary {
  session_id: string;
  created_at: string;
  device_category: string | null;
  brand: string | null;
  model: string | null;
  likely_issue: string | null;
  risk_level: number | null;
  blocked: boolean;
  provider_used: string | null;
}

export interface SessionDetail extends SessionSummary {
  ocr_text: string | null;
  diagnosis: Diagnosis | null;
  safety: SafetyAssessment | null;
  steps: Step[];
  sources: Source[];
  feedback: FeedbackPayload[];
}

export type FeedbackResult = 'done' | 'didnt_work' | 'skip' | 'stop';

export interface FeedbackPayload {
  session_id: string;
  step_number?: number | null;
  result: FeedbackResult;
  comment?: string | null;
}

export interface MetricsResponse {
  total_sessions: number;
  average_latency_ms: number;
  citation_coverage: number;
  safety_blocks: number;
  retrieval_count: number;
  provider_usage: Record<string, number>;
}

export interface HealthResponse {
  status: string;
  version: string;
}

export interface ManualUploadResponse {
  manual_id: string;
  chunks_indexed: number;
  status: string;
}
