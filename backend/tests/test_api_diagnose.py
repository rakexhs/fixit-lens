def test_diagnose_router_case_returns_cited_steps(client):
    response = client.post(
        "/api/diagnose",
        json={
            "device_category": "router",
            "brand": "TP-Link",
            "model": "AX55",
            "symptom": "red internet light",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["safety"]["blocked"] is False
    assert len(body["steps"]) > 0
    for step in body["steps"]:
        assert len(step["citation_ids"]) > 0
    assert body["metrics"]["citation_coverage"] == 1.0


def test_diagnose_dangerous_case_is_blocked(client):
    response = client.post(
        "/api/diagnose",
        json={"device_category": "dangerous", "user_text": "microwave capacitor sparking"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["safety"]["blocked"] is True
    assert body["safety"]["professional_required"] is True
    assert body["steps"] == []


def test_diagnose_requires_some_input(client):
    response = client.post("/api/diagnose", json={})
    assert response.status_code == 400


def test_diagnose_e24_error_code_matches_bosch_manual(client):
    response = client.post(
        "/api/diagnose",
        json={"device_category": "dishwasher", "brand": "Bosch", "error_code": "E24"},
    )
    assert response.status_code == 200
    body = response.json()
    assert any("bosch" in s["title"].lower() for s in body["sources"])
