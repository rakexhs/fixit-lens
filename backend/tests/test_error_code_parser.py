import pytest

from app.diagnosis.error_code_parser import detect_led_or_symptom_phrase, normalize_error_code


@pytest.mark.parametrize(
    "text,expected",
    [
        ("Display shows E24", "E24"),
        ("error code E:24 on the panel", "E24"),
        ("the machine flashes OE", "OE"),
        ("OE1 error on LG washer", "OE"),
        ("no error code visible here", None),
    ],
)
def test_normalize_error_code(text, expected):
    assert normalize_error_code(text) == expected


def test_detect_red_internet_led():
    phrase = detect_led_or_symptom_phrase("The router shows a red internet light")
    assert phrase == "red internet light, no internet connection"


def test_detect_fan_noise_symptom():
    phrase = detect_led_or_symptom_phrase("Laptop has loud fan noise and gets hot")
    assert phrase == "loud fan noise"


def test_detect_no_symptom_returns_none():
    assert detect_led_or_symptom_phrase("everything seems fine") is None
