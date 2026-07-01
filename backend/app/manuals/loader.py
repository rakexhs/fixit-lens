from pathlib import Path

from app.manuals.chunker import chunk_manual
from app.manuals.parser import parse_manual_file, parse_manual_text


def load_manual_chunks_from_dir(manuals_dir: Path) -> list[dict]:
    chunks: list[dict] = []
    for path in sorted(manuals_dir.glob("*.md")):
        manual = parse_manual_file(path)
        chunks.extend(chunk_manual(manual, is_uploaded=False))
    return chunks


def load_manual_chunks_from_text(manual_id: str, text: str, is_uploaded: bool = True) -> list[dict]:
    manual = parse_manual_text(manual_id, text)
    return chunk_manual(manual, is_uploaded=is_uploaded)
