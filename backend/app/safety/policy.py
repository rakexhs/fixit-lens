from dataclasses import dataclass

from app.safety.classifier import RiskClassification, classify_risk, load_safety_rules

REFUSAL_MESSAGE = (
    "I can help identify what may be wrong, but I cannot provide step-by-step instructions "
    "for this repair because it may involve high-voltage, gas, fire, or injury risk. "
    "Please contact a qualified technician."
)


@dataclass
class SafetyDecision:
    risk_level: int
    label: str
    blocked: bool
    professional_required: bool
    warnings: list[str]
    matched_category_id: str | None


def _build_warnings(classification: RiskClassification) -> list[str]:
    rules = load_safety_rules()
    phrases = rules.required_warning_phrases
    warnings: list[str] = []

    if classification.risk_level >= 3:
        if phrases.get("professional_required"):
            warnings.append(phrases["professional_required"])
        warnings.append(REFUSAL_MESSAGE)
    elif classification.risk_level == 2:
        if phrases.get("moderate_risk"):
            warnings.append(phrases["moderate_risk"])
    else:
        water_keywords = ("water", "drain", "electric", "outlet")
        if any(k in kw for kw in classification.matched_keywords for k in water_keywords):
            if phrases.get("water_electricity"):
                warnings.append(phrases["water_electricity"])

    return warnings


def evaluate_safety(text: str) -> SafetyDecision:
    classification = classify_risk(text)
    warnings = _build_warnings(classification)
    blocked = classification.risk_level >= 3
    professional_required = blocked

    return SafetyDecision(
        risk_level=classification.risk_level,
        label=classification.label,
        blocked=blocked,
        professional_required=professional_required,
        warnings=warnings,
        matched_category_id=classification.matched_category_id,
    )
