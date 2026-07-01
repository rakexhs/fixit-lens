from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session as DBSession

from app.db.database import get_db
from app.diagnosis.orchestrator import diagnose
from app.schemas import (
    Diagnosis,
    DiagnoseMetrics,
    DiagnoseRequest,
    DiagnoseResponse,
    SafetyAssessment,
    Source,
    Step,
)

router = APIRouter()


@router.post("/api/diagnose", response_model=DiagnoseResponse)
def diagnose_route(payload: DiagnoseRequest, db: DBSession = Depends(get_db)) -> DiagnoseResponse:
    if not any(
        [
            payload.session_id,
            payload.user_text,
            payload.device_category,
            payload.brand,
            payload.model,
            payload.error_code,
            payload.symptom,
        ]
    ):
        raise HTTPException(status_code=400, detail="Provide at least a session_id, user_text, or device details.")

    try:
        result = diagnose(
            db,
            session_id=payload.session_id,
            user_text=payload.user_text,
            device_category=payload.device_category,
            brand=payload.brand,
            model=payload.model,
            error_code=payload.error_code,
            symptom=payload.symptom,
        )
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Could not generate a diagnosis for this input.") from exc

    return DiagnoseResponse(
        session_id=result.session_id,
        diagnosis=Diagnosis(**result.diagnosis),
        safety=SafetyAssessment(**result.safety),
        steps=[Step(**s) for s in result.steps],
        clarifying_question=result.clarifying_question,
        sources=[Source(**s) for s in result.sources],
        metrics=DiagnoseMetrics(**result.metrics),
    )
