import re
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session as DBSession

from app.db import repository
from app.db.database import get_db
from app.manuals.loader import load_manual_chunks_from_text
from app.manuals.indexer import get_global_index
from app.schemas import ManualUploadResponse

router = APIRouter()

TEXT_EXTENSIONS = (".md", ".txt", ".markdown")
SLUG_RE = re.compile(r"[^a-z0-9]+")


@router.post("/api/manuals/upload", response_model=ManualUploadResponse)
async def upload_manual(
    file: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
    title: str | None = Form(default=None),
    category: str | None = Form(default=None),
    brand: str | None = Form(default=None),
    model: str | None = Form(default=None),
    db: DBSession = Depends(get_db),
) -> ManualUploadResponse:
    body_text = text

    if file is not None:
        if not file.filename.lower().endswith(TEXT_EXTENSIONS):
            raise HTTPException(
                status_code=400,
                detail="Only plain text or markdown manual files (.txt, .md) are supported right now.",
            )
        raw = await file.read()
        try:
            body_text = raw.decode("utf-8")
        except UnicodeDecodeError as exc:
            raise HTTPException(status_code=400, detail="Could not read the uploaded file as UTF-8 text.") from exc

    if not body_text or not body_text.strip():
        raise HTTPException(status_code=400, detail="Provide manual text or upload a .txt/.md file.")

    manual_title = title or (file.filename if file else "Uploaded Manual")
    manual_id = f"uploaded-{SLUG_RE.sub('-', manual_title.lower()).strip('-')}-{uuid.uuid4().hex[:8]}"

    front_matter = (
        "---\n"
        f"title: {manual_title}\n"
        f"category: {category or 'unknown'}\n"
        f"brand: {brand or 'null'}\n"
        f"model: {model or 'null'}\n"
        "error_codes: []\n"
        "---\n\n"
    )
    full_text = front_matter + body_text

    chunks = load_manual_chunks_from_text(manual_id, full_text, is_uploaded=True)
    if not chunks:
        raise HTTPException(status_code=400, detail="No usable content found in the uploaded manual.")

    repository.bulk_upsert_manual_chunks(db, chunks)
    get_global_index().add_chunks(chunks)

    return ManualUploadResponse(manual_id=manual_id, chunks_indexed=len(chunks), status="indexed")
