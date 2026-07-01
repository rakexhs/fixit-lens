import re

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session as DBSession

from app.config import get_settings
from app.db.database import get_db
from app.diagnosis.orchestrator import analyze_image
from app.schemas import AnalyzeImageResponse, DetectedDevice, DetectedProblem, ImageQuality, OCRResult

router = APIRouter()

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg", "application/octet-stream"}
UNSAFE_FILENAME_RE = re.compile(r"[^A-Za-z0-9_.\-]")


def _detect_content_type(filename: str, image_bytes: bytes, declared: str | None) -> str | None:
    if declared in {"image/jpeg", "image/png", "image/webp"}:
        return declared
    if image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        return "image/png"
    if image_bytes[:2] == b"\xff\xd8":
        return "image/jpeg"
    if len(image_bytes) >= 12 and image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"WEBP":
        return "image/webp"
    lower = filename.lower()
    if lower.endswith(".png"):
        return "image/png"
    if lower.endswith((".jpg", ".jpeg")):
        return "image/jpeg"
    if lower.endswith(".webp"):
        return "image/webp"
    # Phone uploads sometimes omit MIME type; accept valid image bytes.
    try:
        from PIL import Image
        from io import BytesIO

        Image.open(BytesIO(image_bytes)).verify()
        return "image/jpeg"
    except Exception:
        return None


def _sanitize_filename(filename: str | None) -> str:
    if not filename:
        return "upload.jpg"
    base = filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1]
    return UNSAFE_FILENAME_RE.sub("_", base)[:120] or "upload.jpg"


@router.post("/api/analyze/image", response_model=AnalyzeImageResponse)
async def analyze_image_route(
    image: UploadFile = File(...),
    user_hint: str | None = Form(default=None),
    mode: str | None = Form(default=None),
    db: DBSession = Depends(get_db),
) -> AnalyzeImageResponse:
    settings = get_settings()

    image_bytes = await image.read()
    filename = _sanitize_filename(image.filename)
    content_type = _detect_content_type(filename, image_bytes, image.content_type)
    if content_type is None:
        raise HTTPException(status_code=400, detail="Unsupported image type. Please upload a JPEG, PNG, or WEBP image.")
    max_bytes = settings.max_image_mb * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(status_code=413, detail=f"Image exceeds the {settings.max_image_mb}MB size limit.")
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    try:
        result = analyze_image(db, image_bytes, filename, user_hint)
    except Exception as exc:
        raise HTTPException(status_code=422, detail="Could not process this image. Please try a different photo.") from exc

    return AnalyzeImageResponse(
        session_id=result.session_id,
        image_quality=ImageQuality(usable=result.usable, score=result.quality_score, issues=result.issues),
        ocr=OCRResult(text=result.ocr_text, tokens=result.ocr_tokens, confidence=result.ocr_confidence),
        detected_device=DetectedDevice(
            category=result.device_category,
            brand=result.brand,
            model=result.model,
            confidence=result.device_confidence,
        ),
        detected_problem=DetectedProblem(
            type=result.problem_type,
            error_code=result.error_code,
            symptom=result.symptom,
            confidence=result.problem_confidence,
        ),
        provider_used=result.provider_used,
    )
