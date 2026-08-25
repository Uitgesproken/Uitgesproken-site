import math
from PIL import Image, ImageDraw, ImageFont

BG = (139, 0, 0)          # #8B0000
CREAM = (251, 234, 217)   # #FBEAD9
FONT_PATH = "scripts/assets_font.ttf"
SHEAR = math.tan(math.radians(10))


def load_font(size):
    font = ImageFont.truetype(FONT_PATH, size)
    font.set_variation_by_axes([96, 800, 100])
    return font


def oblique_text_layer(text, font, fill, pad=40):
    dummy = Image.new("RGBA", (10, 10))
    d = ImageDraw.Draw(dummy)
    bbox = d.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]

    layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.text((pad - bbox[0], pad - bbox[1]), text, font=font, fill=fill)

    # Shear horizontally (positive-x lean, like italic) around vertical center.
    sheared = layer.transform(
        (layer.width + int(layer.height * SHEAR), layer.height),
        Image.AFFINE,
        (1, -SHEAR, layer.height * SHEAR, 0, 1, 0),
        resample=Image.BICUBIC,
    )
    return sheared.crop(sheared.getbbox())


def rounded_mask(size, radius):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    d.rounded_rectangle((0, 0, size, size), radius=radius, fill=255)
    return mask


def make_favicon():
    size = 512
    canvas = Image.new("RGBA", (size, size), BG + (255,))
    font = load_font(340)
    glyph = oblique_text_layer("U", font, CREAM)
    x = (size - glyph.width) // 2
    y = (size - glyph.height) // 2 - 10
    canvas.alpha_composite(glyph, (x, y))
    canvas.putalpha(rounded_mask(size, radius=110))

    canvas.save("favicon.png")
    for s in (16, 32, 48, 180, 192, 512):
        resized = canvas.resize((s, s), Image.LANCZOS)
        if s == 180:
            resized.save("apple-touch-icon.png")
        if s == 192:
            resized.save("icon-192.png")
        if s == 512:
            resized.save("icon-512.png")

    canvas.resize((16, 16), Image.LANCZOS).save("favicon-16.png")
    canvas.resize((32, 32), Image.LANCZOS).save("favicon-32.png")
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    canvas.save("favicon.ico", sizes=ico_sizes)


def make_og_image():
    w, h = 1200, 630
    canvas = Image.new("RGB", (w, h), BG)
    draw = ImageDraw.Draw(canvas)

    logo_font = load_font(150)
    logo = oblique_text_layer("Uitgesproken", logo_font, CREAM)
    lx = (w - logo.width) // 2
    ly = 190
    canvas.paste(logo, (lx, ly), logo)

    tagline_font = ImageFont.truetype(
        "C:/Windows/Fonts/segoeui.ttf", 34
    )
    tagline = "De Nederlandse app om elkaar écht beter te leren kennen"
    bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) / 2, ly + logo.height + 40), tagline, font=tagline_font, fill=(251, 234, 217, 210))

    canvas.save("og-image.png")


if __name__ == "__main__":
    make_favicon()
    make_og_image()
    print("done")
