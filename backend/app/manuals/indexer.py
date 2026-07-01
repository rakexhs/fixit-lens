from app.rag.hybrid import HybridRetriever


class ManualIndex:
    """In-memory hybrid (BM25 + TF-IDF) index over manual chunks.

    Chunks are the source of truth in SQLite; this index is rebuilt from
    the current chunk set whenever manuals are seeded or uploaded.
    """

    def __init__(self, chunks: list[dict] | None = None):
        self._chunks: list[dict] = []
        self._retriever: HybridRetriever | None = None
        if chunks:
            self.rebuild(chunks)

    def rebuild(self, chunks: list[dict]) -> None:
        self._chunks = chunks
        self._retriever = HybridRetriever(chunks)

    def add_chunks(self, chunks: list[dict]) -> None:
        existing_ids = {c["id"] for c in self._chunks}
        merged = [c for c in self._chunks if c["id"] not in existing_ids] + chunks
        # de-dupe by id, keeping the newest version
        by_id: dict[str, dict] = {}
        for c in self._chunks + chunks:
            by_id[c["id"]] = c
        self.rebuild(list(by_id.values()))

    @property
    def retriever(self) -> HybridRetriever:
        if self._retriever is None:
            self._retriever = HybridRetriever([])
        return self._retriever

    @property
    def chunk_ids(self) -> set[str]:
        return {c["id"] for c in self._chunks}

    def __len__(self) -> int:
        return len(self._chunks)


_GLOBAL_INDEX = ManualIndex()


def get_global_index() -> ManualIndex:
    return _GLOBAL_INDEX


def rebuild_global_index_from_db(db) -> int:
    from app.db.repository import list_manual_chunks

    rows = list_manual_chunks(db)
    chunks = [
        {
            "id": row.id,
            "manual_id": row.manual_id,
            "title": row.title,
            "section": row.section,
            "page": row.page,
            "text": row.text,
            "category": row.category,
            "brand": row.brand,
            "model": row.model,
            "error_codes_json": row.error_codes_json,
            "is_safety": row.is_safety,
            "is_uploaded": row.is_uploaded,
        }
        for row in rows
    ]
    _GLOBAL_INDEX.rebuild(chunks)
    return len(chunks)
