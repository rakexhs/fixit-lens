from fastapi import APIRouter

from app.schemas import HealthResponse

router = APIRouter()

APP_VERSION = "0.1.0"


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", version=APP_VERSION)
