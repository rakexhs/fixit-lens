from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.db import repository
from app.db.database import get_db
from app.schemas import Diagnosis, FeedbackRequest, SafetyAssessment, SessionDetail, SessionSummary, Source, Step

router = APIRouter()


def _to_summary(session) -> SessionSummary:
    return SessionSummary(
        session_id=session.id,
        created_at=session.created_at.isoformat(),
        device_category=session.device_category,
        brand=session.brand,
        model=session.model,
        likely_issue=session.likely_issue,
        risk_level=session.risk_level,
        blocked=session.blocked,
        provider_used=session.provider_used,
    )


@router.get("/api/sessions", response_model=list[SessionSummary])
def list_sessions(db: DBSession = Depends(get_db)) -> list[SessionSummary]:
    sessions = repository.list_sessions(db)
    return [_to_summary(s) for s in sessions]


@router.delete("/api/sessions")
def delete_all_sessions(db: DBSession = Depends(get_db)) -> dict:
    deleted = repository.delete_all_sessions(db)
    return {"status": "ok", "deleted": deleted}


@router.get("/api/sessions/{session_id}", response_model=SessionDetail)
def get_session_detail(session_id: str, db: DBSession = Depends(get_db)) -> SessionDetail:
    session = repository.get_session(db, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    latest_ocr = session.ocr_results[-1] if session.ocr_results else None
    latest_answer = session.generated_answers[-1] if session.generated_answers else None
    feedback_rows = repository.list_feedback_for_session(db, session_id)

    diagnosis = None
    safety = None
    steps: list[Step] = []
    sources: list[Source] = []
    if latest_answer:
        answer = latest_answer.answer_json
        diagnosis = Diagnosis(**answer["diagnosis"])
        safety = SafetyAssessment(**answer["safety"])
        steps = [Step(**s) for s in answer.get("steps", [])]
        sources = [Source(**s) for s in answer.get("sources", [])]

    return SessionDetail(
        **_to_summary(session).model_dump(),
        ocr_text=latest_ocr.text if latest_ocr else None,
        diagnosis=diagnosis,
        safety=safety,
        steps=steps,
        sources=sources,
        feedback=[
            FeedbackRequest(
                session_id=f.session_id, step_number=f.step_number, result=f.result, comment=f.comment
            )
            for f in feedback_rows
        ],
    )
