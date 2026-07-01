"""Generate synthetic demo images with Pillow for the FixIt Lens demo scenarios.

These are not real product photos; they are simple rendered panels/labels with
embedded text so the deterministic mock vision provider (and human demo viewers)
can recognize the scenario without any network calls.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
OUTPUT_DIR = BACKEND_DIR / "data" / "demo_images"

WIDTH, HEIGHT = 900, 620


def _font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/SFNSMono.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def _base_canvas(bg=(24, 26, 32)) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (WIDTH, HEIGHT), color=bg)
    draw = ImageDraw.Draw(img)
    return img, draw


def make_tp_link_ax55_red_led() -> Image.Image:
    img, draw = _base_canvas((30, 32, 38))
    draw.rounded_rectangle([80, 120, 820, 480], radius=24, outline=(90, 95, 105), width=4)
    draw.text((110, 150), "TP-Link Archer AX55", font=_font(46), fill=(230, 230, 235))
    draw.text((110, 220), "Wireless Router", font=_font(26), fill=(160, 165, 175))

    labels = [("Power", (70, 220, 90)), ("Internet", (220, 40, 40)), ("Wi-Fi", (70, 220, 90)), ("LAN", (70, 220, 90))]
    x = 130
    for label, color in labels:
        draw.ellipse([x, 320, x + 36, 356], fill=color)
        draw.text((x - 10, 365), label, font=_font(20), fill=(200, 200, 205))
        x += 180

    draw.text((110, 430), "Status: NO INTERNET CONNECTION (WAN)", font=_font(24), fill=(230, 90, 90))
    return img


def make_bosch_dishwasher_e24() -> Image.Image:
    img, draw = _base_canvas((235, 236, 240))
    draw.rectangle([60, 60, 840, 560], outline=(60, 60, 65), width=6)
    draw.text((100, 100), "BOSCH", font=_font(52), fill=(20, 20, 25))
    draw.text((100, 170), "Series 6 Dishwasher", font=_font(28), fill=(70, 70, 75))
    draw.rounded_rectangle([100, 260, 700, 380], radius=12, fill=(15, 15, 18))
    draw.text((140, 295), "E24", font=_font(64), fill=(255, 60, 60))
    draw.text((100, 420), "DRAIN ERROR - CHECK FILTER", font=_font(28), fill=(180, 30, 30))
    return img


def make_lg_washer_oe() -> Image.Image:
    img, draw = _base_canvas((245, 245, 248))
    draw.rectangle([60, 60, 840, 560], outline=(70, 70, 75), width=6)
    draw.text((100, 100), "LG", font=_font(60), fill=(165, 20, 20))
    draw.text((100, 180), "Front Load Washer", font=_font(28), fill=(70, 70, 75))
    draw.rounded_rectangle([100, 270, 700, 390], radius=12, fill=(10, 10, 12))
    draw.text((140, 300), "OE", font=_font(70), fill=(255, 200, 40))
    draw.text((100, 430), "DRAIN ERROR - CHECK FILTER/HOSE", font=_font(26), fill=(160, 100, 10))
    return img


def make_laptop_fan_noise() -> Image.Image:
    img, draw = _base_canvas((40, 42, 48))
    draw.rounded_rectangle([90, 110, 810, 500], radius=18, outline=(120, 122, 130), width=5)
    draw.text((120, 140), "Lenovo ThinkPad", font=_font(42), fill=(220, 220, 225))
    draw.text((120, 200), "Bottom Vent Panel", font=_font(24), fill=(150, 152, 160))
    for i in range(10):
        y = 260 + i * 18
        draw.rectangle([140, y, 620, y + 8], fill=(90, 93, 100))
    draw.ellipse([650, 300, 760, 410], outline=(200, 200, 60), width=4)
    draw.text((120, 440), "Loud continuous fan noise + hot chassis", font=_font(24), fill=(230, 190, 90))
    return img


def make_microwave_capacitor_warning() -> Image.Image:
    img, draw = _base_canvas((250, 200, 20))
    stripe_h = 40
    for i, y in enumerate(range(0, HEIGHT, stripe_h)):
        color = (20, 20, 20) if i % 2 == 0 else (250, 200, 20)
        draw.rectangle([0, y, WIDTH, y + stripe_h], fill=color)
    draw.rounded_rectangle([80, 140, 820, 480], radius=10, fill=(20, 20, 20))
    draw.text((120, 170), "CAUTION", font=_font(56), fill=(255, 60, 40))
    draw.text((120, 250), "HIGH VOLTAGE CAPACITOR", font=_font(34), fill=(255, 220, 40))
    draw.text((120, 310), "DO NOT OPEN", font=_font(34), fill=(255, 220, 40))
    draw.text((120, 360), "RISK OF ELECTRIC SHOCK", font=_font(28), fill=(255, 220, 40))
    return img


def make_blurry_router(sharp_image: Image.Image) -> Image.Image:
    return sharp_image.filter(ImageFilter.GaussianBlur(radius=14))


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    tp_link = make_tp_link_ax55_red_led()
    tp_link.save(OUTPUT_DIR / "tp_link_ax55_red_led.png")

    make_bosch_dishwasher_e24().save(OUTPUT_DIR / "bosch_dishwasher_e24.png")
    make_lg_washer_oe().save(OUTPUT_DIR / "lg_washer_oe.png")
    make_laptop_fan_noise().save(OUTPUT_DIR / "laptop_fan_noise.png")
    make_microwave_capacitor_warning().save(OUTPUT_DIR / "microwave_capacitor_warning.png")
    make_blurry_router(tp_link).save(OUTPUT_DIR / "blurry_router.png")

    generated = sorted(p.name for p in OUTPUT_DIR.glob("*.png"))
    print(f"Generated {len(generated)} demo images in {OUTPUT_DIR}:")
    for name in generated:
        print(f"  - {name}")


if __name__ == "__main__":
    sys.exit(main())
