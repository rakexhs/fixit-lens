#!/usr/bin/env python3
"""Generate FixIt Lens iOS app icon — dark, iOS blue accent, viewfinder motif."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ICON_DIR = ROOT / "FixItLens" / "Resources" / "Assets.xcassets" / "AppIcon.appiconset"
ICON_PATH = ICON_DIR / "AppIcon-1024.png"

# Match Theme.DesignSystem — iOS blue on near-black
BG_TOP = (10, 10, 11)
BG_BOTTOM = (18, 18, 20)
ACCENT = (10, 133, 255)
ACCENT_SOFT = (10, 133, 255, 90)
WHITE = (255, 255, 255, 220)


def _lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def draw_icon(size: int = 1024) -> Image.Image:
    img = Image.new("RGB", (size, size))
    draw = ImageDraw.Draw(img)

    for y in range(size):
        t = y / max(size - 1, 1)
        row_color = (
            _lerp(BG_TOP[0], BG_BOTTOM[0], t),
            _lerp(BG_TOP[1], BG_BOTTOM[1], t),
            _lerp(BG_TOP[2], BG_BOTTOM[2], t),
        )
        draw.line([(0, y), (size, y)], fill=row_color)

    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    cx, cy = size // 2, size // 2
    for radius, alpha in [(size * 0.42, 28), (size * 0.28, 48), (size * 0.16, 70)]:
        gdraw.ellipse(
            (cx - radius, cy - radius, cx + radius, cy + radius),
            fill=(ACCENT[0], ACCENT[1], ACCENT[2], alpha),
        )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=size * 0.055))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)

    pad = size * 0.22
    frame = (pad, pad, size - pad, size - pad)
    radius = size * 0.11
    stroke = max(3, size // 80)

    draw.rounded_rectangle(frame, radius=radius, outline=ACCENT, width=stroke)

    bracket = size * 0.09
    thick = max(4, size // 72)
    corners = [
        (frame[0], frame[1] + bracket, frame[0], frame[1], frame[0] + bracket, frame[1]),
        (frame[2] - bracket, frame[1], frame[2], frame[1], frame[2], frame[1] + bracket),
        (frame[0], frame[3] - bracket, frame[0], frame[3], frame[0] + bracket, frame[3]),
        (frame[2] - bracket, frame[3], frame[2], frame[3], frame[2], frame[3] - bracket),
    ]
    for x1, y1, x2, y2, x3, y3 in corners:
        draw.line((x1, y1, x2, y2), fill=ACCENT, width=thick)
        draw.line((x2, y2, x3, y3), fill=ACCENT, width=thick)

    ring_r = size * 0.085
    draw.ellipse(
        (cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r),
        outline=ACCENT,
        width=max(3, size // 100),
    )
    dot_r = size * 0.028
    draw.ellipse(
        (cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r),
        fill=ACCENT,
    )

    spark_r = size * 0.018
    sx, sy = cx + size * 0.19, cy - size * 0.17
    draw.ellipse((sx - spark_r, sy - spark_r, sx + spark_r, sy + spark_r), fill=(200, 225, 255))

    return img


def write_contents_json() -> None:
    contents = """{
  "images" : [
    {
      "filename" : "AppIcon-1024.png",
      "idiom" : "universal",
      "platform" : "ios",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
"""
    (ICON_DIR / "Contents.json").write_text(contents)


def main() -> None:
    ICON_DIR.mkdir(parents=True, exist_ok=True)
    icon = draw_icon(1024)
    icon.save(ICON_PATH, format="PNG", optimize=True)
    write_contents_json()
    print(f"Wrote {ICON_PATH}")


if __name__ == "__main__":
    main()
