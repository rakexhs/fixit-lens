from sqlalchemy.orm import Session as DBSession

from app.db.repository import add_metrics_event


def log_event(
    db: DBSession,
    event_type: str,
    session_id: str | None = None,
    latency_ms: float = 0.0,
    provider_used: str | None = None,
    citation_coverage: float | None = None,
    safety_blocked: bool = False,
) -> None:
    add_metrics_event(
        db,
        session_id=session_id,
        event_type=event_type,
        latency_ms=latency_ms,
        provider_used=provider_used,
        citation_coverage=citation_coverage,
        safety_blocked=safety_blocked,
    )
