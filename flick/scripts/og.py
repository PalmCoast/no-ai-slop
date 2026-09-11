"""One-off 1200x630 Open Graph cards for X. Run: python3 scripts/og.py"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "public"
W, H = 1200, 630
BG = (12, 11, 10)
INK = (244, 239, 230)
GOLD = (255, 213, 106)
AMBER = (255, 90, 31)
MUTED = (163, 154, 142)

SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def draw_bulbs(draw: ImageDraw.ImageDraw, y: int = 72) -> None:
    n = 22
    gap = 44
    start = (W - (n - 1) * gap) // 2
    for i in range(n):
        x = start + i * gap
        on = i % 3 != 2
        r = 8
        color = GOLD if on else (58, 42, 18)
        draw.ellipse((x - r, y - r, x + r, y + r), fill=color)


def card(path: Path, title: str, tag: str, sub: str) -> None:
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.ImageDraw(img)
    draw.rectangle((36, 36, W - 36, H - 36), outline=(90, 58, 18), width=4)
    draw.rectangle((48, 48, W - 48, H - 48), outline=(42, 28, 10), width=2)
    draw_bulbs(draw)
    title_font = font(SANS, 168)
    tag_font = font(SANS, 42)
    sub_font = font(SANS, 28)
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, 168), title, font=title_font, fill=INK)
    tb = draw.textbbox((0, 0), tag, font=tag_font)
    draw.text(((W - (tb[2] - tb[0])) / 2, 360), tag, font=tag_font, fill=GOLD)
    sb = draw.textbbox((0, 0), sub, font=sub_font)
    draw.text(((W - (sb[2] - sb[0])) / 2, 430), sub, font=sub_font, fill=MUTED)
    draw.text((64, H - 88), "useflick.netlify.app", font=font(SANS, 22), fill=AMBER)
    img.save(path, "PNG", optimize=True)
    print("wrote", path, path.stat().st_size)


def main() -> None:
    ROOT.mkdir(exist_ok=True)
    card(
        ROOT / "og.png",
        "FLICK",
        "SKIP THE MEETING.",
        "Watch is free. Publish is the gate.",
    )
    card(
        ROOT / "og-pricing.png",
        "LIGHTS",
        "PAY TO PUBLISH. NEVER TO WATCH.",
        "Street $0   ·   Lights $19/mo   ·   Marquee $99",
    )


if __name__ == "__main__":
    main()
