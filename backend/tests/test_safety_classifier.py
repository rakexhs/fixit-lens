import pytest

from app.safety.policy import REFUSAL_MESSAGE, evaluate_safety


@pytest.mark.parametrize(
    "text",
    [
        "my microwave capacitor is sparking",
        "trying to discharge a CRT tv myself",
        "I smell gas near my gas stove valve",
        "need to recharge refrigerant in my AC",
        "want to rewire my breaker panel myself",
        "my battery is swollen and bulging out of the case",
        "there is an exposed wire hanging from my dryer",
        "burning smell and sparks from my outlet",
        "water near the outlet in my flooded basement",
        "want to repair my cpap medical device myself",
        "want to bleed my car's brake line myself",
    ],
)
def test_high_risk_cases_are_blocked(text):
    decision = evaluate_safety(text)
    assert decision.blocked is True
    assert decision.risk_level == 3
    assert decision.professional_required is True
    assert REFUSAL_MESSAGE in decision.warnings


@pytest.mark.parametrize(
    "text",
    [
        "restart my router to fix the internet",
        "check the cable connection on my router",
        "clean the dishwasher filter myself",
        "clean the laptop vents with compressed air",
    ],
)
def test_safe_and_low_risk_actions_are_allowed(text):
    decision = evaluate_safety(text)
    assert decision.blocked is False
    assert decision.risk_level in (0, 1)


def test_moderate_risk_is_not_blocked_but_warned():
    decision = evaluate_safety("open the back cover of my laptop to replace the internal fan")
    assert decision.blocked is False
    assert decision.risk_level == 2
    assert len(decision.warnings) >= 1
