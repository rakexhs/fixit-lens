from dataclasses import dataclass, field


@dataclass
class DemoScenario:
    key: str
    filename_keywords: list[str]
    ocr_text: str
    category: str
    brand: str | None
    model: str | None
    problem_type: str
    error_code: str | None
    symptom: str
    device_confidence: float = 0.94
    problem_confidence: float = 0.9


DEMO_SCENARIOS: list[DemoScenario] = [
    DemoScenario(
        key="tp_link_ax55_red_led",
        filename_keywords=["tp_link_ax55_red_led", "tp-link", "ax55"],
        ocr_text="TP-Link Archer AX55  Internet [RED]  Power [GREEN]  Wi-Fi [GREEN]",
        category="router",
        brand="TP-Link",
        model="Archer AX55",
        problem_type="no_internet_connection",
        error_code=None,
        symptom="red internet light, no internet connection",
    ),
    DemoScenario(
        key="bosch_dishwasher_e24",
        filename_keywords=["bosch_dishwasher_e24", "bosch"],
        ocr_text="BOSCH  SERIE 6  ERROR E24",
        category="dishwasher",
        brand="Bosch",
        model="Series 300/500/800",
        problem_type="drain_error",
        error_code="E24",
        symptom="E24 drain error displayed",
    ),
    DemoScenario(
        key="lg_washer_oe",
        filename_keywords=["lg_washer_oe", "lg washer", "oe"],
        ocr_text="LG  FRONT LOAD  OE",
        category="washing_machine",
        brand="LG",
        model="Front Load Series",
        problem_type="drain_error",
        error_code="OE",
        symptom="OE drain error displayed",
    ),
    DemoScenario(
        key="laptop_fan_noise",
        filename_keywords=["laptop_fan_noise", "fan_noise", "fan noise"],
        ocr_text="ThinkPad",
        category="laptop",
        brand="Lenovo",
        model="ThinkPad/IdeaPad Series",
        problem_type="overheating_fan_noise",
        error_code=None,
        symptom="loud continuous fan noise and hot chassis",
    ),
    DemoScenario(
        key="microwave_capacitor_warning",
        filename_keywords=["microwave_capacitor_warning", "microwave", "capacitor"],
        ocr_text="CAUTION: HIGH VOLTAGE CAPACITOR - DO NOT OPEN - RISK OF ELECTRIC SHOCK",
        category="dangerous",
        brand=None,
        model=None,
        problem_type="high_voltage_capacitor",
        error_code=None,
        symptom="exposed microwave capacitor warning label, internal high voltage risk",
        device_confidence=0.9,
        problem_confidence=0.95,
    ),
    DemoScenario(
        key="blurry_router",
        filename_keywords=["blurry_router", "blurry"],
        ocr_text="",
        category="unknown",
        brand=None,
        model=None,
        problem_type="unknown",
        error_code=None,
        symptom="",
        device_confidence=0.0,
        problem_confidence=0.0,
    ),
]

_BY_KEY = {scenario.key: scenario for scenario in DEMO_SCENARIOS}


def detect_demo_scenario(filename: str | None) -> DemoScenario | None:
    if not filename:
        return None
    name = filename.lower()
    for scenario in DEMO_SCENARIOS:
        if any(kw in name for kw in scenario.filename_keywords):
            return scenario
    return None


def get_scenario(key: str) -> DemoScenario | None:
    return _BY_KEY.get(key)
