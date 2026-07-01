import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class TfidfIndex:
    def __init__(self, documents: list[str]):
        self._documents = documents
        if documents:
            self._vectorizer = TfidfVectorizer(stop_words="english")
            self._matrix = self._vectorizer.fit_transform(documents)
        else:
            self._vectorizer = None
            self._matrix = None

    def scores(self, query: str) -> list[float]:
        if self._vectorizer is None or self._matrix is None:
            return []
        query_vec = self._vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self._matrix)[0]
        return list(np.asarray(sims, dtype=float))
