from dataclasses import dataclass

from app.diagnosis.error_code_parser import detect_led_or_symptom_phrase, normalize_error_code

PROBLEM_TYPE_BY_ERROR_CODE = {
    "E24": "drain_error",
    "OE": "drain_error",
}


@dataclass
class ProblemClassification:
    problem_type: str
    error_code: str | None
    symptom: str
    confidence: float


def classify_problem(text: str, category: str, existing_error_code: str | None = None) -> ProblemClassification:
    error_code = existing_error_code or normalize_error_code(text)
    symptom = detect_led_or_symptom_phrase(text) or ""

    if error_code and error_code in PROBLEM_TYPE_BY_ERROR_CODE:
        return ProblemClassification(
            problem_type=PROBLEM_TYPE_BY_ERROR_CODE[error_code],
            error_code=error_code,
            symptom=symptom or f"{error_code} error code displayed",
            confidence=0.92,
        )

    if category == "router" and ("internet" in text.lower() or "wan" in text.lower() or symptom):
        return ProblemClassification(
            problem_type="no_internet_connection",
            error_code=error_code,
            symptom=symptom or "no internet connection",
            confidence=0.85,
        )

    if category == "laptop" and ("fan" in text.lower() or "overheat" in text.lower() or "hot" in text.lower()):
        return ProblemClassification(
            problem_type="overheating_fan_noise",
            error_code=error_code,
            symptom=symptom or "overheating / fan noise",
            confidence=0.82,
        )

    if category == "dangerous":
        return ProblemClassification(
            problem_type="high_risk_symptom",
            error_code=error_code,
            symptom=symptom or text.strip()[:200],
            confidence=0.9,
        )

    if symptom or error_code:
        return ProblemClassification(
            problem_type="general_malfunction",
            error_code=error_code,
            symptom=symptom or "",
            confidence=0.55,
        )

    return ProblemClassification(problem_type="unknown", error_code=None, symptom="", confidence=0.0)
