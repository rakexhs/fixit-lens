#!/usr/bin/env python3
"""Generate premium FixIt Lens app icon and splash assets."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"


def _rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (8, 9, 13, 255))
    draw = ImageDraw.Draw(img)

    # Soft radial glow
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    cx, cy = size // 2, size // 2
    for r, alpha in [(size * 0.46, 42), (size * 0.34, 64), (size * 0.22, 90)]:
        gdraw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(34, 211, 238, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=size * 0.06))
    img = Image.alpha_composite(img, glow)

    draw = ImageDraw.Draw(img)
    pad = size * 0.14
    frame = (pad, pad, size - pad, size - pad)
    draw.rounded_rectangle(frame, radius=size * 0.18, outline=(34, 211, 238, 220), width=max(2, size // 64))

    # Corner brackets
    b = size * 0.1
    t = max(3, size // 48)
    corners = [
        (frame[0], frame[1], frame[0] + b, frame[1]),
        (frame[0], frame[1], frame[0], frame[1] + b),
        (frame[2] - b, frame[1], frame[2], frame[1]),
        (frame[2], frame[1], frame[2], frame[1] + b),
        (frame[0], frame[3], frame[0] + b, frame[3]),
        (frame[0], frame[3] - b, frame[0], frame[3]),
        (frame[2] - b, frame[3], frame[2], frame[3]),
        (frame[2], frame[3] - b, frame[2], frame[3]),
    ]
    for x1, y1, x2, y2 in corners:
        draw.line((x1, y1, x2, y2), fill=(109, 94, 246, 255), width=t)

    # Lens ring
    ring_r = size * 0.17
    draw.ellipse(
        (cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r),
        outline=(34, 211, 238, 255),
        width=max(3, size // 42),
    )
    draw.ellipse(
        (cx - ring_r * 0.42, cy - ring_r * 0.42, cx + ring_r * 0.42, cy + ring_r * 0.42),
        fill=(34, 211, 238, 210),
    )

    mask = _rounded_mask(size, int(size * 0.22))
    img.putalpha(mask)
    return img


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    icon = draw_icon(1024)
    icon.save(ASSETS / "icon.png")

    splash = Image.new("RGBA", (1284, 2778), (11, 12, 16, 255))
    mark = draw_icon(420)
    splash.paste(mark, ((1284 - 420) // 2, 760), mark)
    splash.save(ASSETS / "splash-icon.png")
    print(f"Wrote {ASSETS / 'icon.png'} and {ASSETS / 'splash-icon.png'}")


if __name__ == "__main__":
    main()
