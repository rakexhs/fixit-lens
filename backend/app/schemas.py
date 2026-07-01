from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

RiskLevel = Literal[0, 1, 2, 3]


class ImageQuality(BaseModel):
    usable: bool
    score: float
    issues: list[str] = Field(default_factory=list)


class OCRResult(BaseModel):
    text: str = ""
    tokens: list[str] = Field(default_factory=list)
    confidence: float = 0.0


class DetectedDevice(BaseModel):
    category: str = "unknown"
    brand: str | None = None
    model: str | None = None
    confidence: float = 0.0


class DetectedProblem(BaseModel):
    type: str = "unknown"
    error_code: str | None = None
    symptom: str | None = None
    confidence: float = 0.0


class AnalyzeImageResponse(BaseModel):
    session_id: str
    image_quality: ImageQuality
    ocr: OCRResult
    detected_device: DetectedDevice
    detected_problem: DetectedProblem
    provider_used: str


class DiagnoseRequest(BaseModel):
    session_id: str | None = None
    user_text: str | None = None
    device_category: str | None = None
    brand: str | None = None
    model: str | None = None
    error_code: str | None = None
    symptom: str | None = None


class DeviceSummary(BaseModel):
    category: str = "unknown"
    brand: str | None = None
    model: str | None = None
    confidence: float = 0.0


class Diagnosis(BaseModel):
    likely_issue: str
    confidence: float
    reasoning_summary: str


class SafetyAssessment(BaseModel):
    risk_level: int
    label: str
    warnings: list[str] = Field(default_factory=list)
    blocked: bool
    professional_required: bool


class Step(BaseModel):
    step_number: int
    title: str
    instruction: str
    why: str
    tools: list[str] = Field(default_factory=list)
    citation_ids: list[str] = Field(default_factory=list)
    stop_if: list[str] = Field(default_factory=list)


class Source(BaseModel):
    id: str
    title: str
    section: str
    page: str | None = None
    snippet: str = ""
    score: float = 0.0
    why_matched: str = ""


class GeneratedAnswer(BaseModel):
    device_summary: DeviceSummary
    diagnosis: Diagnosis
    safety: SafetyAssessment
    steps: list[Step] = Field(default_factory=list)
    clarifying_question: str | None = None
    sources: list[Source] = Field(default_factory=list)


class DiagnoseMetrics(BaseModel):
    retrieval_latency_ms: float
    generation_latency_ms: float
    total_latency_ms: float
    citation_coverage: float
    provider_used: str


class DiagnoseResponse(BaseModel):
    session_id: str
    diagnosis: Diagnosis
    safety: SafetyAssessment
    steps: list[Step]
    clarifying_question: str | None
    sources: list[Source]
    metrics: DiagnoseMetrics


class ManualUploadResponse(BaseModel):
    manual_id: str
    chunks_indexed: int
    status: str


class FeedbackRequest(BaseModel):
    session_id: str
    step_number: int | None = None
    result: Literal["done", "didnt_work", "skip", "stop"]
    comment: str | None = None


class FeedbackResponse(BaseModel):
    status: str


class SessionSummary(BaseModel):
    session_id: str
    created_at: str
    device_category: str | None = None
    brand: str | None = None
    model: str | None = None
    likely_issue: str | None = None
    risk_level: int | None = None
    blocked: bool = False
    provider_used: str | None = None


class SessionDetail(SessionSummary):
    ocr_text: str | None = None
    diagnosis: Diagnosis | None = None
    safety: SafetyAssessment | None = None
    steps: list[Step] = Field(default_factory=list)
    sources: list[Source] = Field(default_factory=list)
    feedback: list[FeedbackRequest] = Field(default_factory=list)


class MetricsResponse(BaseModel):
    total_sessions: int
    average_latency_ms: float
    citation_coverage: float
    safety_blocks: int
    retrieval_count: int
    provider_usage: dict[str, int]


class HealthResponse(BaseModel):
    status: str
    version: str
