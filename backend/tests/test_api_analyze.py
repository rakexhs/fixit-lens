from app.config import get_settings

DEMO_IMAGES_DIR = get_settings().demo_images_dir


def test_analyze_image_router_scenario(client):
    with open(DEMO_IMAGES_DIR / "tp_link_ax55_red_led.png", "rb") as f:
        response = client.post(
            "/api/analyze/image",
            files={"image": ("tp_link_ax55_red_led.png", f, "image/png")},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["image_quality"]["usable"] is True
    assert body["detected_device"]["category"] == "router"
    assert body["detected_device"]["brand"] == "TP-Link"
    assert body["provider_used"] == "mock"


def test_analyze_blurry_image_flags_unusable(client):
    with open(DEMO_IMAGES_DIR / "blurry_router.png", "rb") as f:
        response = client.post(
            "/api/analyze/image",
            files={"image": ("blurry_router.png", f, "image/png")},
        )
    assert response.status_code == 200
    body = response.json()
    assert body["image_quality"]["usable"] is False
    assert len(body["image_quality"]["issues"]) > 0


def test_analyze_rejects_unsupported_content_type(client):
    response = client.post(
        "/api/analyze/image",
        files={"image": ("note.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 400
