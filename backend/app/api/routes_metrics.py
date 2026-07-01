from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session as DBSession

from app.db import repository
from app.db.database import get_db
from app.evals.run_evals import run_evaluation_suite
from app.schemas import MetricsResponse

router = APIRouter()


@router.get("/api/metrics", response_model=MetricsResponse)
def get_metrics(db: DBSession = Depends(get_db)) -> MetricsResponse:
    summary = repository.get_metrics_summary(db)
    return MetricsResponse(**summary)


@router.post("/api/evals/run")
def run_evals() -> dict:
    return run_evaluation_suite()
