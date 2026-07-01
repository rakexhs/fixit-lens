from app.manuals.parser import ParsedManual, slugify


def chunk_manual(manual: ParsedManual, is_uploaded: bool = False) -> list[dict]:
    chunks: list[dict] = []
    for position, section in enumerate(manual.sections):
        chunk_id = f"{manual.manual_id}#{slugify(section.heading)}"
        chunks.append(
            {
                "id": chunk_id,
                "manual_id": manual.manual_id,
                "title": manual.title,
                "section": section.heading,
                "page": None,
                "text": section.text,
                "category": manual.category,
                "brand": manual.brand,
                "model": manual.model,
                "error_codes_json": manual.error_codes,
                "is_safety": manual.is_safety or "safety" in section.heading.lower(),
                "is_uploaded": is_uploaded,
                "position": position,
            }
        )
    return chunks
