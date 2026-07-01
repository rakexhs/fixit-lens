from pathlib import Path

from app.config import get_settings
from app.image.quality import assess_image_quality

DEMO_IMAGES_DIR = get_settings().demo_images_dir


def test_sharp_image_is_usable():
    image_bytes = (DEMO_IMAGES_DIR / "tp_link_ax55_red_led.png").read_bytes()
    result = assess_image_quality(image_bytes)
    assert result.usable is True
    assert result.score > 0.5
    assert result.issues == []


def test_blurry_image_is_flagged_with_warning():
    image_bytes = (DEMO_IMAGES_DIR / "blurry_router.png").read_bytes()
    result = assess_image_quality(image_bytes)
    assert any("blurry" in issue.lower() for issue in result.issues)


def test_quality_result_reports_dimensions():
    image_bytes = (DEMO_IMAGES_DIR / "bosch_dishwasher_e24.png").read_bytes()
    result = assess_image_quality(image_bytes)
    assert result.width > 0
    assert result.height > 0
