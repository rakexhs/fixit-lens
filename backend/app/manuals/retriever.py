from app.manuals.indexer import ManualIndex
from app.rag.hybrid import RetrievedChunk


def build_query_text(
    user_text: str | None,
    device_category: str | None,
    brand: str | None,
    model: str | None,
    error_code: str | None,
    symptom: str | None,
) -> str:
    parts = [p for p in [user_text, device_category, brand, model, error_code, symptom] if p]
    return " ".join(parts).strip()


def retrieve_chunks(
    index: ManualIndex,
    query: str,
    category: str | None = None,
    brand: str | None = None,
    model: str | None = None,
    error_code: str | None = None,
    prefer_safety: bool = False,
    top_k: int = 5,
) -> list[RetrievedChunk]:
    return index.retriever.search(
        query=query,
        category=category,
        brand=brand,
        model=model,
        error_code=error_code,
        prefer_safety=prefer_safety,
        top_k=top_k,
    )
