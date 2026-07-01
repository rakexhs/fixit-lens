from app.generation.schema_validator import validate_answer_json

VALID_ANSWER = {
    "device_summary": {"category": "router", "brand": "TP-Link", "model": "AX55", "confidence": 0.9},
    "diagnosis": {"likely_issue": "No internet", "confidence": 0.8, "reasoning_summary": "Matched manual"},
    "safety": {"risk_level": 0, "label": "Safe", "warnings": [], "blocked": False, "professional_required": False},
    "steps": [
        {
            "step_number": 1,
            "title": "Check cable",
            "instruction": "Check the WAN cable",
            "why": "Loose cables are common",
            "tools": [],
            "citation_ids": ["chunk-1"],
            "stop_if": [],
        }
    ],
    "clarifying_question": None,
    "sources": [{"id": "chunk-1", "title": "Router manual", "section": "Step 1", "page": None}],
}


def test_valid_answer_passes_schema():
    answer, errors = validate_answer_json(VALID_ANSWER)
    assert errors == []
    assert answer is not None
    assert answer.diagnosis.likely_issue == "No internet"


def test_missing_required_field_is_rejected():
    broken = {k: v for k, v in VALID_ANSWER.items() if k != "safety"}
    answer, errors = validate_answer_json(broken)
    assert answer is None
    assert len(errors) > 0


def test_wrong_type_is_rejected():
    broken = {**VALID_ANSWER, "diagnosis": {**VALID_ANSWER["diagnosis"], "confidence": "not-a-number"}}
    answer, errors = validate_answer_json(broken)
    assert answer is None
    assert len(errors) > 0
