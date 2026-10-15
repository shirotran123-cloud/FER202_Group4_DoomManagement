"""Build dolly scrub sequence + mp4 clip from 4 real FPT dorm photos.

Style follows the Gemini reference video: monotonic dolly-in (zoom toward
center anchor), warm grade, 1280x720, 96 scrub frames + 20s 24fps mp4
(5s per image, all 4 images).

Input : staging-fpt-ktx/fpt1, fpt4, fpt5, fpt6
Output: public/assets/dorm-cinematic/scrub-fpt/frame-001..096.jpg
        public/assets/dorm-cinematic/dorm-dolly-fpt.mp4
        public/assets/dorm-cinematic/dorm-keyframe-fpt-{1..4}.jpg (gallery/cards)
"""
import pathlib

import imageio_ffmpeg
import imageio.v3 as iio
from PIL import Image, ImageEnhance

STAGE = pathlib.Path(
    "D:/download/FER202_Group4_DoomManagement-main/FER202_Group4_DoomManagement-main/staging-fpt-ktx"
)
OUT = pathlib.Path(
    "D:/download/FER202_Group4_DoomManagement-main/FER202_Group4_DoomManagement-main"
    "/public/assets/dorm-cinematic"
)
SEQ = OUT / "scrub-fpt"
W, H = 1280, 720
N = 96
FPS = 24
SECS = 10

SRC = [STAGE / "fpt1.jpg", STAGE / "fpt4.jpg", STAGE / "fpt5.jpg", STAGE / "fpt6.jpg"]
for s in SRC:
    assert s.exists(), f"missing {s}"

SEQ.mkdir(parents=True, exist_ok=True)
for p in SEQ.glob("frame-*.jpg"):
    p.unlink()

# Warm cinematic grade matching the Gemini night clip (subtle: photos are daytime)
def grade(img: Image.Image) -> Image.Image:
    img = ImageEnhance.Color(img).enhance(1.08)
    img = ImageEnhance.Contrast(img).enhance(1.05)
    img = ImageEnhance.Brightness(img).enhance(0.97)
    r, g, b = img.split()
    r = r.point(lambda v: min(255, int(v * 1.03)))
    b = b.point(lambda v: int(v * 0.97))
    return Image.merge("RGB", (r, g, b))

# Cover-fit each source to 16:9 world, larger than output for dolly headroom
WORLD_W, WORLD_H = 1920, 1080
worlds = []
for s in SRC:
    im = Image.open(s).convert("RGB")
    sc = max(WORLD_W / im.width, WORLD_H / im.height)
    im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    l = (im.width - WORLD_W) // 2
    t = (im.height - WORLD_H) // 2
    worlds.append(grade(im.crop((l, t, l + WORLD_W, t + WORLD_H))))

# 4 segments x 24 frames (sum 96), dolly-in 1.0 -> 1.25 centered,
# crossfade 8 frames at segment joints (no hard cuts)
SEGLENS = [24, 24, 24, 24]
frames: list[Image.Image] = []
bounds: list[int] = []
acc = 0
for si, world in enumerate(worlds):
    seglen = SEGLENS[si]
    for k in range(seglen):
        z = 1.0 + 0.25 * (k / max(seglen - 1, 1))
        cw, ch = round(WORLD_W / z), round(WORLD_H / z)
        l = (WORLD_W - cw) // 2
        t = (WORLD_H - ch) // 2
        crop = world.crop((l, t, l + cw, t + ch)).resize((W, H), Image.LANCZOS)
        frames.append(crop)
    acc += seglen
    bounds.append(acc)

# crossfade joints (skip segment starts: bounds[:-1])
FADE = 8
for joint in bounds[:-1]:
    for f in range(FADE):
        a = f / FADE
        frames[joint + f] = Image.blend(frames[joint + f - FADE], frames[joint + f], a)

for n, fr in enumerate(frames, 1):
    fr.save(SEQ / f"frame-{n:03d}.jpg", quality=80)
print("frames:", len(frames), "->", SEQ)

# keyframes for gallery/cards: sharp representative frames (mid-segment)
for i, idx in enumerate((12, 36, 60, 84), 1):
    frames[idx - 1].save(OUT / f"dorm-keyframe-fpt-{i}.jpg", quality=85)
print("keyframes written")

# mp4 clip: 5s per image x 4 images = 20s @24fps (480 frames).
# Each of the 96 scrub frames held 5 ticks -> full sequence, all 4 images.
import numpy as np

clip_frames = []
for fr in frames:
    for _ in range(5):
        clip_frames.append(np.asarray(fr))
SECS = len(clip_frames) // FPS
ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
out_mp4 = str(OUT / "dorm-dolly-fpt.mp4")
iio.imwrite(out_mp4, clip_frames, fps=FPS, codec="libx264", quality=8,
            ffmpeg_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart"])
print("clip ->", out_mp4)
