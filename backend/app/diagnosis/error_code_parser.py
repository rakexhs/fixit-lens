import re

KNOWN_CODES = ["E24", "OE", "OE1"]

_E_CODE_RE = re.compile(r"\bE[\s:.-]?(\d{1,3})\b", re.IGNORECASE)
_OE_CODE_RE = re.compile(r"\bOE\s*1?\b", re.IGNORECASE)

LED_SYMPTOM_PATTERNS: list[tuple[str, str]] = [
    (r"\bred\s+internet\b", "red internet light, no internet connection"),
    (r"\bred\s+(led|light)\b", "red LED / status light"),
    (r"\bamber\s+(internet|led|light)\b", "amber internet light, degraded connection"),
    (r"\bblinking\s+red\b", "blinking red light"),
    (r"\bno\s+internet\b", "no internet connection"),
    (r"\bfan\s+noise\b", "loud fan noise"),
    (r"\boverheat", "overheating"),
    (r"\bswollen\s+battery|\bbulging\s+battery|\bbattery\s+swelling\b", "swollen battery"),
]


def normalize_error_code(text: str) -> str | None:
    if not text:
        return None
    blob = text.upper()

    if _OE_CODE_RE.search(blob):
        return "OE"

    match = _E_CODE_RE.search(blob)
    if match:
        return f"E{match.group(1)}"

    for code in KNOWN_CODES:
        if code in blob:
            return code

    return None


def detect_led_or_symptom_phrase(text: str) -> str | None:
    if not text:
        return None
    blob = text.lower()
    for pattern, phrase in LED_SYMPTOM_PATTERNS:
        if re.search(pattern, blob):
            return phrase
    return None
