import math


def recall_at_k(relevant_ids: set[str], retrieved_ids: list[str], k: int) -> float:
    if not relevant_ids:
        return 1.0
    top_k = set(retrieved_ids[:k])
    hit = len(relevant_ids & top_k)
    return hit / len(relevant_ids)


def mrr(relevant_ids: set[str], retrieved_ids: list[str]) -> float:
    for idx, chunk_id in enumerate(retrieved_ids, start=1):
        if chunk_id in relevant_ids:
            return 1.0 / idx
    return 0.0


def ndcg_at_k(relevant_ids: set[str], retrieved_ids: list[str], k: int) -> float:
    dcg = 0.0
    for idx, chunk_id in enumerate(retrieved_ids[:k], start=1):
        rel = 1.0 if chunk_id in relevant_ids else 0.0
        dcg += rel / math.log2(idx + 1)

    ideal_hits = min(len(relevant_ids), k)
    idcg = sum(1.0 / math.log2(idx + 1) for idx in range(1, ideal_hits + 1))
    if idcg == 0:
        return 0.0
    return dcg / idcg


def average(values: list[float]) -> float:
    return sum(values) / len(values) if values else 0.0


def percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    idx = min(int(round(pct / 100 * (len(ordered) - 1))), len(ordered) - 1)
    return ordered[idx]
