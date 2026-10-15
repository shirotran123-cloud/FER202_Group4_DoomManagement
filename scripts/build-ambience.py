"""Synthesize morning-campus ambience: birdsong chirps + soft wind bed.

No network needed (Wikimedia rate-limits this IP).
Output: public/assets/dorm-cinematic/campus-morning.ogg (Opus, ~30s loop)
        + campus-morning.mp3 fallback.
"""
import math
import random
import struct
import subprocess
import wave
import pathlib

import imageio_ffmpeg

OUT = pathlib.Path(
    "D:/download/FER202_Group4_DoomManagement-main/FER202_Group4_DoomManagement-main"
    "/public/assets/dorm-cinematic"
)
SR = 22050
SECS = 30
N = SR * SECS
random.seed(7)

buf = [0.0] * N

# Wind bed: slow-modulated filtered noise (two drifting sine LFOs)
for i in range(N):
    t = i / SR
    lfo = 0.5 + 0.5 * math.sin(2 * math.pi * 0.07 * t) * math.sin(2 * math.pi * 0.043 * t + 1)
    buf[i] += (random.random() * 2 - 1) * 0.03 * lfo

# Bird chirps: random phrases of 2-5 descending FM blips at 2-5kHz
pos = 0
while pos < N - SR:
    pos += random.randint(SR // 3, SR * 2)
    nblips = random.randint(2, 5)
    base = random.uniform(2800, 4200)
    for b in range(nblips):
        dur = random.uniform(0.06, 0.14)
        m = int(dur * SR)
        f0 = base * random.uniform(0.9, 1.1)
        f1 = f0 * random.uniform(0.7, 0.85)
        start = pos + b * (m + random.randint(0, SR // 20))
        if start + m >= N:
            break
        amp = random.uniform(0.08, 0.16)
        for j in range(m):
            f = f0 + (f1 - f0) * (j / m)
            env = math.sin(math.pi * j / m)  # smooth in/out
            buf[start + j] += amp * env * math.sin(2 * math.pi * f * (j / SR))

peak = max(1e-6, max(abs(v) for v in buf))
buf = [v / peak * 0.85 for v in buf]

wav = OUT / "_amb.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(v * 32767)) for v in buf))

ff = imageio_ffmpeg.get_ffmpeg_exe()
for name, args in (
    ("campus-morning.ogg", ["-c:a", "libopus", "-b:a", "64k"]),
    ("campus-morning.mp3", ["-c:a", "libmp3lame", "-b:a", "96k"]),
):
    subprocess.run([ff, "-y", "-i", str(wav), *args, str(OUT / name)],
                   check=True, capture_output=True)
wav.unlink()
for n in ("campus-morning.ogg", "campus-morning.mp3"):
    print(n, (OUT / n).stat().st_size)
