import re

from rank_bm25 import BM25Okapi

TOKEN_RE = re.compile(r"[a-z0-9]+")


def tokenize(text: str) -> list[str]:
    return TOKEN_RE.findall(text.lower())


class BM25Index:
    def __init__(self, documents: list[str]):
        self._tokenized = [tokenize(doc) for doc in documents]
        self._bm25 = BM25Okapi(self._tokenized) if self._tokenized else None

    def scores(self, query: str) -> list[float]:
        if self._bm25 is None:
            return []
        return list(self._bm25.get_scores(tokenize(query)))
