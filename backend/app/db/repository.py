from sqlalchemy import func, select
from sqlalchemy.orm import Session as DBSession

from app.db.models import (
    CapturedImage,
    FeedbackEvent,
    GeneratedAnswerRow,
    ManualChunk,
    MetricsEvent,
    OCRResultRow,
    RepairSession,
    RetrievalResult,
)


def create_session(db: DBSession, **kwargs) -> RepairSession:
    session = RepairSession(**kwargs)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session(db: DBSession, session_id: str) -> RepairSession | None:
    return db.get(RepairSession, session_id)


def update_session(db: DBSession, session_id: str, **kwargs) -> RepairSession | None:
    session = db.get(RepairSession, session_id)
    if session is None:
        return None
    for key, value in kwargs.items():
        setattr(session, key, value)
    db.commit()
    db.refresh(session)
    return session


def list_sessions(db: DBSession, limit: int = 50) -> list[RepairSession]:
    stmt = select(RepairSession).order_by(RepairSession.created_at.desc()).limit(limit)
    return list(db.scalars(stmt))


def add_captured_image(db: DBSession, **kwargs) -> CapturedImage:
    row = CapturedImage(**kwargs)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def add_ocr_result(db: DBSession, **kwargs) -> OCRResultRow:
    row = OCRResultRow(**kwargs)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def add_retrieval_result(db: DBSession, **kwargs) -> RetrievalResult:
    row = RetrievalResult(**kwargs)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def add_generated_answer(db: DBSession, **kwargs) -> GeneratedAnswerRow:
    row = GeneratedAnswerRow(**kwargs)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def add_feedback(db: DBSession, **kwargs) -> FeedbackEvent:
    row = FeedbackEvent(**kwargs)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_feedback_for_session(db: DBSession, session_id: str) -> list[FeedbackEvent]:
    stmt = select(FeedbackEvent).where(FeedbackEvent.session_id == session_id)
    return list(db.scalars(stmt))


def add_metrics_event(db: DBSession, **kwargs) -> MetricsEvent:
    row = MetricsEvent(**kwargs)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def get_metrics_summary(db: DBSession) -> dict:
    total_sessions = db.scalar(select(func.count(RepairSession.id))) or 0
    avg_latency = db.scalar(select(func.avg(RepairSession.total_latency_ms))) or 0.0
    avg_citation_coverage = db.scalar(select(func.avg(RepairSession.citation_coverage))) or 0.0
    safety_blocks = db.scalar(select(func.count(RepairSession.id)).where(RepairSession.blocked.is_(True))) or 0
    retrieval_count = db.scalar(select(func.count(RetrievalResult.id))) or 0

    provider_usage: dict[str, int] = {}
    rows = db.execute(
        select(RepairSession.provider_used, func.count(RepairSession.id)).group_by(RepairSession.provider_used)
    ).all()
    for provider, count in rows:
        provider_usage[provider or "unknown"] = count

    return {
        "total_sessions": total_sessions,
        "average_latency_ms": float(avg_latency),
        "citation_coverage": float(avg_citation_coverage),
        "safety_blocks": safety_blocks,
        "retrieval_count": retrieval_count,
        "provider_usage": provider_usage,
    }


def bulk_upsert_manual_chunks(db: DBSession, chunks: list[dict]) -> int:
    count = 0
    for chunk in chunks:
        existing = db.get(ManualChunk, chunk["id"])
        if existing:
            for key, value in chunk.items():
                setattr(existing, key, value)
        else:
            db.add(ManualChunk(**chunk))
        count += 1
    db.commit()
    return count


def list_manual_chunks(db: DBSession) -> list[ManualChunk]:
    return list(db.scalars(select(ManualChunk)))


def get_manual_chunks_by_ids(db: DBSession, ids: list[str]) -> list[ManualChunk]:
    if not ids:
        return []
    stmt = select(ManualChunk).where(ManualChunk.id.in_(ids))
    return list(db.scalars(stmt))
