from dataclasses import dataclass, field
from functools import lru_cache

import yaml

from app.config import get_settings

LEVEL0_KEYWORDS = [
    "restart", "reboot", "power cycle", "unplug", "plug back in", "plug it back in",
    "check the cable", "check cable", "reseat cable", "check error code",
    "read the manual", "factory reset",
]
LEVEL1_KEYWORDS = [
    "clean the filter", "clean filter", "clean the vents", "clean vents",
    "check the drain hose", "check drain hose", "check air gap", "compressed air",
]


@dataclass
class SafetyRules:
    blocked_categories: list[dict] = field(default_factory=list)
    high_risk_keywords: list[str] = field(default_factory=list)
    moderate_risk_keywords: list[str] = field(default_factory=list)
    allowed_safe_actions: list[str] = field(default_factory=list)
    required_warning_phrases: dict = field(default_factory=dict)
    professional_required_conditions: list[str] = field(default_factory=list)


@lru_cache
def load_safety_rules() -> SafetyRules:
    settings = get_settings()
    with open(settings.safety_rules_path, encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}
    return SafetyRules(
        blocked_categories=raw.get("blocked_categories", []),
        high_risk_keywords=[k.lower() for k in raw.get("high_risk_keywords", [])],
        moderate_risk_keywords=[k.lower() for k in raw.get("moderate_risk_keywords", [])],
        allowed_safe_actions=[k.lower() for k in raw.get("allowed_safe_actions", [])],
        required_warning_phrases=raw.get("required_warning_phrases", {}),
        professional_required_conditions=raw.get("professional_required_conditions", []),
    )


@dataclass
class RiskClassification:
    risk_level: int
    label: str
    matched_category_id: str | None
    matched_keywords: list[str]


def classify_risk(text: str) -> RiskClassification:
    rules = load_safety_rules()
    blob = (text or "").lower()

    for category in rules.blocked_categories:
        for kw in category.get("keywords", []):
            if kw.lower() in blob:
                return RiskClassification(
                    risk_level=3,
                    label=category["label"],
                    matched_category_id=category["id"],
                    matched_keywords=[kw],
                )

    matched_high = [kw for kw in rules.high_risk_keywords if kw in blob]
    if matched_high:
        return RiskClassification(
            risk_level=3,
            label="High risk - professional required",
            matched_category_id=None,
            matched_keywords=matched_high,
        )

    matched_moderate = [kw for kw in rules.moderate_risk_keywords if kw in blob]
    if matched_moderate:
        return RiskClassification(
            risk_level=2,
            label="Moderate risk - internal access required",
            matched_category_id=None,
            matched_keywords=matched_moderate,
        )

    matched_level1 = [kw for kw in LEVEL1_KEYWORDS if kw in blob]
    if matched_level1:
        return RiskClassification(
            risk_level=1,
            label="Low risk - safe external action",
            matched_category_id=None,
            matched_keywords=matched_level1,
        )

    matched_level0 = [kw for kw in LEVEL0_KEYWORDS if kw in blob]
    return RiskClassification(
        risk_level=0,
        label="Safe - basic external troubleshooting",
        matched_category_id=None,
        matched_keywords=matched_level0,
    )
