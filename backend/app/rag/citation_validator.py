from dataclasses import dataclass


@dataclass
class CitationValidationResult:
    valid_steps: list[dict]
    dropped_step_numbers: list[int]
    citation_coverage: float


def validate_steps(steps: list[dict], valid_chunk_ids: set[str]) -> CitationValidationResult:
    """Keep only steps whose citation_ids are non-empty and all present in valid_chunk_ids."""
    valid_steps: list[dict] = []
    dropped: list[int] = []

    for step in steps:
        citation_ids = step.get("citation_ids") or []
        has_valid_citations = bool(citation_ids) and all(cid in valid_chunk_ids for cid in citation_ids)
        if has_valid_citations:
            valid_steps.append(step)
        else:
            dropped.append(step.get("step_number", -1))

    total = len(steps)
    coverage = (len(valid_steps) / total) if total else 1.0

    for idx, step in enumerate(valid_steps, start=1):
        step["step_number"] = idx

    return CitationValidationResult(
        valid_steps=valid_steps,
        dropped_step_numbers=dropped,
        citation_coverage=round(coverage, 4),
    )
