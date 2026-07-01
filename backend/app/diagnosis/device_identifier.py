import re

BRAND_ALIASES: dict[str, str] = {
    "tp-link": "TP-Link",
    "tp link": "TP-Link",
    "tplink": "TP-Link",
    "archer": "TP-Link",
    "netgear": "Netgear",
    "nighthawk": "Netgear",
    "bosch": "Bosch",
    "lg": "LG",
    "lenovo": "Lenovo",
    "thinkpad": "Lenovo",
    "ideapad": "Lenovo",
    "apple": "Apple",
    "macbook": "Apple",
}

MODEL_PATTERNS: list[tuple[str, str]] = [
    (r"archer\s*ax55", "Archer AX55"),
    (r"nighthawk", "Nighthawk"),
    (r"e24|series\s*(300|500|800)", "Series 300/500/800"),
    (r"\boe1?\b|front\s*load", "Front Load Series"),
    (r"thinkpad|ideapad", "ThinkPad/IdeaPad Series"),
    (r"macbook\s*pro", "MacBook Pro"),
    (r"macbook\s*air", "MacBook Air"),
    (r"macbook", "MacBook"),
]

CATEGORY_KEYWORDS: dict[str, list[str]] = {
    "router": ["router", "modem", "wifi", "wi-fi", "wan", "internet light", "archer", "nighthawk"],
    "dishwasher": ["dishwasher", "e24", "drain error"],
    "washing_machine": ["washing machine", "washer", "front load", "oe error", "oe1"],
    "laptop": ["laptop", "notebook", "macbook", "thinkpad", "ideapad", "fan noise", "overheating"],
    "dangerous": [
        "microwave", "capacitor", "crt", "gas line", "gas leak", "refrigerant", "mains wiring",
        "swollen battery", "exposed wire", "burning smell", "sparks", "pacemaker", "airbag",
        "brake line", "steering",
    ],
}


def identify_category(text: str) -> tuple[str, float]:
    blob = (text or "").lower()
    best_category = "unknown"
    best_score = 0
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in blob)
        if score > best_score:
            best_score = score
            best_category = category

    if best_score == 0:
        return "unknown", 0.0
    confidence = min(0.55 + 0.15 * best_score, 0.97)
    return best_category, round(confidence, 2)


def identify_brand(text: str) -> tuple[str | None, float]:
    blob = (text or "").lower()
    for alias, brand in BRAND_ALIASES.items():
        if alias in blob:
            return brand, 0.9
    return None, 0.0


def identify_model(text: str) -> tuple[str | None, float]:
    blob = (text or "").lower()
    for pattern, model in MODEL_PATTERNS:
        if re.search(pattern, blob):
            return model, 0.85
    return None, 0.0
