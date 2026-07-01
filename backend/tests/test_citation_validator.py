from app.rag.citation_validator import validate_steps


def test_valid_citations_are_kept():
    steps = [
        {"step_number": 1, "citation_ids": ["chunk-a"]},
        {"step_number": 2, "citation_ids": ["chunk-b", "chunk-a"]},
    ]
    result = validate_steps(steps, {"chunk-a", "chunk-b"})
    assert len(result.valid_steps) == 2
    assert result.citation_coverage == 1.0
    assert result.dropped_step_numbers == []


def test_uncited_step_is_rejected():
    steps = [
        {"step_number": 1, "citation_ids": ["chunk-a"]},
        {"step_number": 2, "citation_ids": []},
    ]
    result = validate_steps(steps, {"chunk-a"})
    assert len(result.valid_steps) == 1
    assert result.dropped_step_numbers == [2]
    assert result.citation_coverage == 0.5


def test_step_citing_unknown_chunk_is_rejected():
    steps = [{"step_number": 1, "citation_ids": ["chunk-does-not-exist"]}]
    result = validate_steps(steps, {"chunk-a"})
    assert result.valid_steps == []
    assert result.citation_coverage == 0.0


def test_no_steps_has_full_coverage():
    result = validate_steps([], {"chunk-a"})
    assert result.valid_steps == []
    assert result.citation_coverage == 1.0


def test_valid_steps_are_renumbered_sequentially():
    steps = [
        {"step_number": 5, "citation_ids": ["chunk-a"]},
        {"step_number": 2, "citation_ids": []},
        {"step_number": 9, "citation_ids": ["chunk-a"]},
    ]
    result = validate_steps(steps, {"chunk-a"})
    assert [s["step_number"] for s in result.valid_steps] == [1, 2]
