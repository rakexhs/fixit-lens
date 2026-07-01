from app.config import get_settings
from app.diagnosis.orchestrator import analyze_image, diagnose

DEMO_IMAGES_DIR = get_settings().demo_images_dir


def _read(filename: str) -> bytes:
    return (DEMO_IMAGES_DIR / filename).read_bytes()


def test_router_scenario_produces_cited_safe_steps(db_session):
    image_bytes = _read("tp_link_ax55_red_led.png")
    analyzed = analyze_image(db_session, image_bytes, "tp_link_ax55_red_led.png", None)
    assert analyzed.usable is True
    assert analyzed.device_category == "router"

    result = diagnose(
        db_session,
        session_id=analyzed.session_id,
        device_category=analyzed.device_category,
        brand=analyzed.brand,
        model=analyzed.model,
        error_code=analyzed.error_code,
        symptom=analyzed.symptom,
    )
    assert result.safety["blocked"] is False
    assert len(result.steps) > 0
    for step in result.steps:
        assert len(step["citation_ids"]) > 0


def test_microwave_scenario_is_blocked_with_no_steps(db_session):
    image_bytes = _read("microwave_capacitor_warning.png")
    analyzed = analyze_image(db_session, image_bytes, "microwave_capacitor_warning.png", None)
    assert analyzed.device_category == "dangerous"

    result = diagnose(
        db_session,
        session_id=analyzed.session_id,
        device_category=analyzed.device_category,
        brand=analyzed.brand,
        model=analyzed.model,
        error_code=analyzed.error_code,
        symptom=analyzed.symptom,
    )
    assert result.safety["blocked"] is True
    assert result.safety["risk_level"] == 3
    assert result.steps == []


def test_blurry_image_requests_retake_without_diagnosis(db_session):
    image_bytes = _read("blurry_router.png")
    analyzed = analyze_image(db_session, image_bytes, "blurry_router.png", None)
    assert analyzed.usable is False
    assert len(analyzed.issues) > 0
    assert analyzed.device_category == "unknown"
