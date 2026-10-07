"""Bake AgentHive-themed hero, Open Graph card, and icons."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "static"
HERO_SRC = Path("/opt/cursor/artifacts/assets/aipricing-hero.jpg")
INTER = Path("/usr/share/fonts/truetype/macos/Inter-SemiBold.ttf")
INTER_MED = Path("/usr/share/fonts/truetype/macos/Inter-Medium.ttf")
MONO = Path("/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf")

GOLD = (228, 184, 74, 255)
CREAM = (246, 237, 216, 255)
INK = (5, 4, 3, 255)


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def hex_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), INK)
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2
    r = size * 0.42

    def poly(radius, fill, outline, width):
        pts = []
        for i in range(6):
            import math
            ang = math.radians(-90 + i * 60)
            pts.append((cx + radius * math.cos(ang), cy + radius * math.sin(ang)))
        draw.polygon(pts, fill=fill, outline=outline)
        if width and outline:
            draw.line(pts + [pts[0]], fill=outline, width=width)

    poly(r, None, GOLD, max(2, size // 28))
    poly(r * 0.48, GOLD, None, 0)
    return img


def hero() -> None:
    image = Image.open(HERO_SRC).convert("RGB")
    image = image.resize((1600, 900), Image.Resampling.LANCZOS)
    image.save(STATIC / "hero.jpg", quality=82, optimize=True)


def og() -> None:
    base = Image.open(HERO_SRC).convert("RGB")
    # Center-crop to 1200x630, bias toward the honeycomb on the right.
    scale = max(1200 / base.width, 630 / base.height)
    resized = base.resize((round(base.width * scale), round(base.height * scale)), Image.Resampling.LANCZOS)
    left = max(0, resized.width - 1200)
    top = max(0, (resized.height - 630) // 2)
    card = resized.crop((left, top, left + 1200, top + 630)).convert("RGBA")
    shade = Image.new("RGBA", card.size, (0, 0, 0, 0))
    mask = ImageDraw.Draw(shade)
    for x in range(780):
        alpha = int(210 * (1 - x / 780))
        mask.line([(x, 0), (x, 630)], fill=(5, 4, 3, alpha))
    card = Image.alpha_composite(card, shade)
    draw = ImageDraw.Draw(card)
    draw.text((56, 150), "AI PRICING CALCULATORS", font=font(INTER_MED, 22), fill=GOLD)
    draw.text((56, 190), "Know the API bill", font=font(INTER, 68), fill=CREAM)
    draw.text((56, 268), "before you buy the desk.", font=font(INTER, 68), fill=CREAM)
    chips = [("GPT-5.6 Sol", "$4 / $20"), ("Claude Fable 5", "$10 / $50"), ("Flash-Lite", "$0.25 / $1.50")]
    x = 56
    for label, price in chips:
        w = 210
        draw.rounded_rectangle((x, 390, x + w, 470), radius=16, outline=GOLD, width=2)
        draw.text((x + 16, 404), label, font=font(INTER_MED, 18), fill=CREAM)
        draw.text((x + 16, 430), price, font=font(MONO, 22), fill=GOLD)
        x += w + 16
    draw.text((56, 540), "AgentHive Inc  ·  aipricingcalculators.com", font=font(INTER_MED, 22), fill=GOLD)
    card.convert("RGB").save(STATIC / "og.png", optimize=True)


def main() -> None:
    STATIC.mkdir(parents=True, exist_ok=True)
    hero()
    og()
    hex_icon(32).save(STATIC / "favicon-32.png")
    hex_icon(180).save(STATIC / "apple-touch-icon.png")
    print("graphics written")


if __name__ == "__main__":
    main()
