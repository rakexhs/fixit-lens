from dataclasses import dataclass

from app.rag.bm25 import BM25Index
from app.rag.vector_tfidf import TfidfIndex

BM25_WEIGHT = 0.5
TFIDF_WEIGHT = 0.5

ERROR_CODE_BOOST = 0.6
BRAND_MODEL_BOOST = 0.25
CATEGORY_BOOST = 0.15
SAFETY_BOOST = 0.5
UPLOADED_BOOST = 0.35


@dataclass
class RetrievedChunk:
    chunk: dict
    score: float
    why_matched: str


def _normalize(values: list[float]) -> list[float]:
    if not values:
        return []
    lo, hi = min(values), max(values)
    if hi - lo < 1e-9:
        return [0.0 for _ in values]
    return [(v - lo) / (hi - lo) for v in values]


class HybridRetriever:
    def __init__(self, chunks: list[dict]):
        self.chunks = chunks
        documents = [self._doc_text(c) for c in chunks]
        self._bm25 = BM25Index(documents)
        self._tfidf = TfidfIndex(documents)

    @staticmethod
    def _doc_text(chunk: dict) -> str:
        return f"{chunk.get('title', '')} {chunk.get('section', '')} {chunk.get('text', '')}"

    def search(
        self,
        query: str,
        category: str | None = None,
        brand: str | None = None,
        model: str | None = None,
        error_code: str | None = None,
        prefer_safety: bool = False,
        top_k: int = 5,
    ) -> list[RetrievedChunk]:
        if not self.chunks or not query.strip():
            return []

        bm25_scores = _normalize(self._bm25.scores(query))
        tfidf_scores = _normalize(self._tfidf.scores(query))

        results: list[RetrievedChunk] = []
        for idx, chunk in enumerate(self.chunks):
            base = BM25_WEIGHT * bm25_scores[idx] + TFIDF_WEIGHT * tfidf_scores[idx]
            reasons: list[str] = []
            if bm25_scores[idx] > 0.4:
                reasons.append("keyword match")
            if tfidf_scores[idx] > 0.4:
                reasons.append("semantic similarity")

            boost = 0.0
            chunk_error_codes = [c.upper() for c in (chunk.get("error_codes_json") or [])]
            if error_code and error_code.upper() in chunk_error_codes:
                boost += ERROR_CODE_BOOST
                reasons.append(f"exact error code {error_code.upper()}")

            if brand and chunk.get("brand") and brand.lower() == str(chunk["brand"]).lower():
                boost += BRAND_MODEL_BOOST
                reasons.append("brand match")
            if model and chunk.get("model") and model.lower() in str(chunk["model"]).lower():
                boost += BRAND_MODEL_BOOST
                reasons.append("model match")
            if category and chunk.get("category") and category.lower() == str(chunk["category"]).lower():
                boost += CATEGORY_BOOST
                reasons.append("category match")
            if prefer_safety and chunk.get("is_safety"):
                boost += SAFETY_BOOST
                reasons.append("safety-relevant source")
            if chunk.get("is_uploaded"):
                boost += UPLOADED_BOOST
                reasons.append("user-uploaded manual (priority source)")

            score = base + boost
            if score <= 0:
                continue
            results.append(
                RetrievedChunk(
                    chunk=chunk,
                    score=round(score, 4),
                    why_matched="; ".join(reasons) if reasons else "general relevance",
                )
            )

        results.sort(key=lambda r: r.score, reverse=True)
        return results[:top_k]
