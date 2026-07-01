from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.db import repository
from app.db.database import get_db
from app.schemas import FeedbackRequest, FeedbackResponse

router = APIRouter()


@router.post("/api/feedback", response_model=FeedbackResponse)
def submit_feedback(payload: FeedbackRequest, db: DBSession = Depends(get_db)) -> FeedbackResponse:
    session = repository.get_session(db, payload.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found.")

    repository.add_feedback(
        db,
        session_id=payload.session_id,
        step_number=payload.step_number,
        result=payload.result,
        comment=payload.comment,
    )
    return FeedbackResponse(status="recorded")
