"""Build interactive dorm-tour scenes from real FPT photos.

Branching tour (per approved idea):
  corridor (Scene 3): wide hallway composite -> user picks room 101-104
  room     (Scene 4): shared 6-person interior, scrubbed per room number

Source mapping (staging order = user send order):
  fpt4 = photo 1 (campus overview)   -> corridor backdrop base
  fpt5 = photo 2                      -> corridor left doors
  fpt6 = photo 3 (new)                -> corridor right doors
  fpt7 = photo 4 (new)                -> room interior wide
  fpt8 = kitchen (portrait)           -> room detail: shared kitchen corner

Output: public/assets/dorm-tour/
  corridor.jpg          1280x720 hallway composite (warm grade)
  room-wide.jpg         1280x720 6-person room wide
  room-bed.jpg          1280x720 bed close crop (dolly-in on room-wide)
  room-desk.jpg         1280x720 desk crop
  room-bath.jpg         1280x720 bath crop (from fpt7 detail)
  room-kitchen.jpg      1280x720 kitchen (fpt8 landscape crop)
"""
import pathlib
from PIL import Image, ImageEnhance

STAGE = pathlib.Path(
    "D:/download/FER202_Group4_DoomManagement-main/FER202_Group4_DoomManagement-main/staging-fpt-ktx"
)
OUT = pathlib.Path(
    "D:/download/FER202_Group4_DoomManagement-main/FER202_Group4_DoomManagement-main"
    "/public/assets/dorm-tour"
)
W, H = 1280, 720


def grade(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Color(img).enhance(1.08)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Brightness(img).enhance(0.97)
    r, g, b = img.split()
    r = r.point(lambda v: min(255, int(v * 1.03)))
    b = b.point(lambda v: int(v * 0.97))
    return Image.merge("RGB", (r, g, b))


def cover(im: Image.Image, w: int, h: int) -> Image.Image:
    sc = max(w / im.width, h / im.height)
    im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    l = (im.width - w) // 2
    t = (im.height - h) // 2
    return im.crop((l, t, l + w, t + h))


def load(name: str) -> Image.Image:
    return grade(Image.open(STAGE / name).convert("RGB"))


OUT.mkdir(parents=True, exist_ok=True)

p4 = load("fpt4.jpg")
p5 = load("fpt5.jpg")
p6 = load("fpt6.jpg")
p7 = load("fpt7.jpg")
p8 = load("fpt8.jpg")

# Corridor: wide base (fpt4) with door wings blended from fpt5/fpt6.
# Monotonic look: same vanishing center, no hard cuts.
base = cover(p4, W, H)
left = cover(p5, W // 2, H).crop((0, 0, W // 3, H)).resize((W // 3, H), Image.LANCZOS)
right = cover(p6, W // 2, H).crop((W // 6, 0, W // 2, H)).resize((W // 3, H), Image.LANCZOS)
corridor = base.copy()
corridor.paste(left, (0, 0))
corridor.paste(right, (W - W // 3, 0))
# soft blend seams (24px gradient)
for x in range(24):
    a = x / 24
    for y in range(H):
        for sx in (W // 3, W - W // 3):
            px = sx + (x if sx < W // 2 else -x)
            if 0 <= px < W:
                w0 = base.getpixel((px, y))
                w1 = corridor.getpixel((px, y))
                corridor.putpixel((px, y), tuple(round(w0[c] * (1 - a) + w1[c] * a) for c in range(3)))
corridor.save(OUT / "corridor.jpg", quality=82)

# Room wide: fpt7 interior, full cover
room_wide = cover(p7, W, H)
room_wide.save(OUT / "room-wide.jpg", quality=82)

# Detail crops = dolly-in windows on room-wide (monotonic zoom, same anchor)
def dolly(im: Image.Image, z: float, cx: float = 0.5, cy: float = 0.5) -> Image.Image:
    cw, ch = round(W / z), round(H / z)
    # sample from a 1920x1080 upscale for headroom
    big = im.resize((1920, 1080), Image.LANCZOS)
    l = round((big.width - cw * 1.5) * cx)
    t = round((big.height - ch * 1.5) * cy)
    l = max(0, min(big.width - round(cw * 1.5), l))
    t = max(0, min(big.height - round(ch * 1.5), t))
    return big.crop((l, t, l + round(cw * 1.5), t + round(ch * 1.5))).resize((W, H), Image.LANCZOS)

dolly(room_wide, 1.6, 0.3, 0.6).save(OUT / "room-bed.jpg", quality=82)
dolly(room_wide, 1.6, 0.7, 0.5).save(OUT / "room-desk.jpg", quality=82)
dolly(room_wide, 1.8, 0.5, 0.7).save(OUT / "room-bath.jpg", quality=82)

# Kitchen: portrait fpt8 -> landscape center crop (keeps stove/counter band)
kw = p8.width
kh = round(kw * 9 / 16)
kt = max(0, (p8.height - kh) // 2 - 60)
kitchen = p8.crop((0, kt, kw, kt + kh)).resize((W, H), Image.LANCZOS)
kitchen.save(OUT / "room-kitchen.jpg", quality=82)

for p in sorted(OUT.glob("*.jpg")):
    print(p.name, p.stat().st_size)
