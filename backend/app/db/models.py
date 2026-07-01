import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


def _uuid() -> str:
    return uuid.uuid4().hex


def _now() -> datetime:
    return datetime.now(timezone.utc)


class RepairSession(Base):
    __tablename__ = "repair_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
    device_category: Mapped[str | None] = mapped_column(String, nullable=True)
    brand: Mapped[str | None] = mapped_column(String, nullable=True)
    model: Mapped[str | None] = mapped_column(String, nullable=True)
    error_code: Mapped[str | None] = mapped_column(String, nullable=True)
    symptom: Mapped[str | None] = mapped_column(Text, nullable=True)
    device_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    likely_issue: Mapped[str | None] = mapped_column(Text, nullable=True)
    diagnosis_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    reasoning_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    risk_level: Mapped[int] = mapped_column(Integer, default=0)
    safety_label: Mapped[str | None] = mapped_column(String, nullable=True)
    blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    professional_required: Mapped[bool] = mapped_column(Boolean, default=False)
    warnings_json: Mapped[list] = mapped_column(JSON, default=list)
    clarifying_question: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider_used: Mapped[str | None] = mapped_column(String, nullable=True)
    total_latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    citation_coverage: Mapped[float] = mapped_column(Float, default=0.0)

    captured_images: Mapped[list["CapturedImage"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    ocr_results: Mapped[list["OCRResultRow"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    retrieval_results: Mapped[list["RetrievalResult"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    generated_answers: Mapped[list["GeneratedAnswerRow"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    feedback_events: Mapped[list["FeedbackEvent"]] = relationship(back_populates="session", cascade="all, delete-orphan")


class CapturedImage(Base):
    __tablename__ = "captured_images"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String, ForeignKey("repair_sessions.id"))
    filename: Mapped[str] = mapped_column(String)
    quality_score: Mapped[float] = mapped_column(Float, default=0.0)
    usable: Mapped[bool] = mapped_column(Boolean, default=True)
    issues_json: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    session: Mapped["RepairSession"] = relationship(back_populates="captured_images")


class OCRResultRow(Base):
    __tablename__ = "ocr_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String, ForeignKey("repair_sessions.id"))
    text: Mapped[str] = mapped_column(Text, default="")
    tokens_json: Mapped[list] = mapped_column(JSON, default=list)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    provider_used: Mapped[str] = mapped_column(String, default="mock")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    session: Mapped["RepairSession"] = relationship(back_populates="ocr_results")


class ManualChunk(Base):
    __tablename__ = "manual_chunks"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    manual_id: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    section: Mapped[str] = mapped_column(String, default="")
    page: Mapped[str | None] = mapped_column(String, nullable=True)
    text: Mapped[str] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    brand: Mapped[str | None] = mapped_column(String, nullable=True)
    model: Mapped[str | None] = mapped_column(String, nullable=True)
    error_codes_json: Mapped[list] = mapped_column(JSON, default=list)
    is_safety: Mapped[bool] = mapped_column(Boolean, default=False)
    is_uploaded: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)


class RetrievalResult(Base):
    __tablename__ = "retrieval_results"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String, ForeignKey("repair_sessions.id"))
    query: Mapped[str] = mapped_column(Text)
    chunk_ids_json: Mapped[list] = mapped_column(JSON, default=list)
    scores_json: Mapped[dict] = mapped_column(JSON, default=dict)
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    session: Mapped["RepairSession"] = relationship(back_populates="retrieval_results")


class GeneratedAnswerRow(Base):
    __tablename__ = "generated_answers"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String, ForeignKey("repair_sessions.id"))
    answer_json: Mapped[dict] = mapped_column(JSON, default=dict)
    provider_used: Mapped[str] = mapped_column(String, default="mock")
    generation_latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    citation_coverage: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    session: Mapped["RepairSession"] = relationship(back_populates="generated_answers")


class FeedbackEvent(Base):
    __tablename__ = "feedback_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    session_id: Mapped[str] = mapped_column(String, ForeignKey("repair_sessions.id"))
    step_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    result: Mapped[str] = mapped_column(String)
    comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)

    session: Mapped["RepairSession"] = relationship(back_populates="feedback_events")


class MetricsEvent(Base):
    __tablename__ = "metrics_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_uuid)
    session_id: Mapped[str | None] = mapped_column(String, nullable=True)
    event_type: Mapped[str] = mapped_column(String)
    latency_ms: Mapped[float] = mapped_column(Float, default=0.0)
    provider_used: Mapped[str | None] = mapped_column(String, nullable=True)
    citation_coverage: Mapped[float | None] = mapped_column(Float, nullable=True)
    safety_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=_now)
