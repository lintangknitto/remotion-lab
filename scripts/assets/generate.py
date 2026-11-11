"""Generate the starter asset library for remotion-lab.

Everything here is synthesized from scratch (numpy + Pillow), so it is
license-free and tweakable: change a parameter, re-run, and every pack that
references the file id picks up the new version.

    python scripts/assets/generate.py            # all
    python scripts/assets/generate.py --only sfx # one section

Layout follows the id convention <type>.<sub>.<name>-<nn>.<ext> so that
scripts/scan-library.mjs can derive `id` straight from the filename.
"""

from __future__ import annotations

import argparse
import math
import struct
import wave
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
LIB = ROOT / "public" / "library"
SR = 44100
RNG = np.random.default_rng(20261111)


# ---------------------------------------------------------------- helpers ---
def _dir(rel: str) -> Path:
    p = LIB / rel
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_png(rgb: np.ndarray, alpha: np.ndarray | None, rel: str) -> None:
    h, w = rgb.shape[:2]
    rgb = np.clip(rgb, 0, 255).astype(np.uint8)
    if alpha is None:
        arr = rgb
        mode = "RGB"
    else:
        a = np.clip(alpha, 0, 255).astype(np.uint8)
        arr = np.dstack([rgb, a])
        mode = "RGBA"
    path = _dir(str(Path(rel).parent)) / Path(rel).name
    Image.fromarray(np.ascontiguousarray(arr)).save(path, optimize=True)
    print(f"  {path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB")


def fbm(h: int, w: int, octaves: int = 4, seed: int = 0) -> np.ndarray:
    """Cheap fractal noise in 0..1."""
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32)
    amp, total = 1.0, 0.0
    for o in range(octaves):
        n = rng.random((max(2, h >> (octaves - o - 1)), max(2, w >> (octaves - o - 1))))
        img = Image.fromarray((n * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
        out += np.asarray(img, np.float32) / 255 * amp
        total += amp
        amp *= 0.5
    return out / total


def radial(h: int, w: int, cx: float, cy: float, r: float) -> np.ndarray:
    y, x = np.mgrid[0:h, 0:w]
    d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2) / r
    return np.clip(1 - d, 0, 1)


def hann(n: int) -> np.ndarray:
    return np.hanning(n).astype(np.float32)


def save_wav(x: np.ndarray, rel: str, peak: float = 0.85) -> None:
    x = np.nan_to_num(np.asarray(x, np.float32))
    m = float(np.max(np.abs(x))) or 1.0
    x = x / m * peak
    data = (x * 32767).astype("<i2").tobytes()
    path = _dir(str(Path(rel).parent)) / Path(rel).name
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data)
    print(f"  {path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB")


def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(seconds * SR)) / SR


def onepole_lp(x: np.ndarray, cutoff: float) -> np.ndarray:
    a = math.exp(-2 * math.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(x.shape[0]):
        acc = (1 - a) * float(x[i]) + a * acc
        y[i] = acc
    return y


def sweep(f0: float, f1: float, n: int, curve: float = 1.0) -> np.ndarray:
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** ((t / t[-1]) ** curve if t[-1] > 0 else 0)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


# --------------------------------------------------------------- textures ---
def textures() -> None:
    S = 1024
    print("textures")

    # 1. film grain: grey noise, constant alpha, meant for mix-blend-mode: overlay
    G = 512
    n = np.clip(RNG.normal(0.5, 0.16, (G, G)), 0, 1)
    g = np.asarray(Image.fromarray((n * 255).astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(0.7)), np.float32)
    save_png(np.dstack([g, g, g]), np.full((G, G), 150), "textures/texture.noise.film-4k.png")

    # 2. digital noise: per-pixel RGB static
    D = 512
    rgb = RNG.integers(0, 255, (D, D, 3)).astype(np.float32)
    save_png(rgb, np.full((D, D), 85), "textures/texture.noise.digital-01.png")

    # 3. VHS scanlines
    y = np.arange(S)[:, None].repeat(S, 1)
    band = np.where(y % 3 == 0, 105, 26).astype(np.float32)
    band += RNG.normal(0, 12, (S, S))
    save_png(np.zeros((S, S, 3)), band, "textures/texture.vhs.scanline-01.png")

    # 4. VHS tracking: horizontal tearing bands
    rows = np.zeros((S, 1), np.float32)
    i = 0
    while i < S:
        h = int(RNG.integers(4, 26))
        rows[i:i + h] = RNG.uniform(18, 95)
        i += h
    track = np.repeat(rows, S, axis=1)
    track = np.asarray(Image.fromarray(track.astype(np.uint8)).filter(
        ImageFilter.GaussianBlur(0.4)), np.float32)
    save_png(np.full((S, S, 3), 255), track, "textures/texture.vhs.tracking-01.png")

    # 5. paper fiber (opaque)
    base = fbm(S, S, 5, seed=3)
    warm = np.array([245, 241, 232], np.float32)
    rgb = np.clip(warm[None, None, :] * (0.9 + base[..., None] * 0.16), 0, 255)
    save_png(rgb, None, "textures/texture.paper.fiber-01.png")

    # 6. halftone dots
    step = 16
    yy, xx = np.mgrid[0:S, 0:S]
    field = fbm(S, S, 3, seed=11)
    cx = (xx % step) - step / 2
    cy = (yy % step) - step / 2
    r = 2.8 + field * 5.0
    alpha = np.clip((r - np.sqrt(cx ** 2 + cy ** 2)) * 255, 0, 255)
    save_png(np.zeros((S, S, 3)), alpha, "textures/texture.halftone.dots-01.png")

    # 7. blueprint grid
    lines = ((yy % 64 == 0) | (xx % 64 == 0)).astype(np.float32) * 120
    lines += ((yy % 256 == 0) | (xx % 256 == 0)).astype(np.float32) * 100
    wide = np.maximum.reduce([lines, np.roll(lines, 1, 0), np.roll(lines, 1, 1)])
    save_png(np.full((S, S, 3), 150), np.clip(wide, 0, 255), "textures/texture.grid.blueprint-01.png")

    # 8. dust + scratches
    img = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(img)
    for _ in range(70):
        x = int(RNG.integers(0, S))
        y0 = int(RNG.integers(0, S))
        d.line([(x, y0), (x + int(RNG.integers(-2, 2)), y0 + int(RNG.integers(40, 420)))],
               fill=int(RNG.integers(70, 190)), width=1)
    for _ in range(900):
        x, y = int(RNG.integers(0, S)), int(RNG.integers(0, S))
        d.point((x, y), fill=int(RNG.integers(90, 220)))
    dust = np.asarray(img.filter(ImageFilter.GaussianBlur(0.3)), np.float32)
    save_png(np.full((S, S, 3), 255), dust, "textures/texture.dust.scratches-01.png")

    # 9. soft bokeh
    b = np.zeros((S, S), np.float32)
    for _ in range(26):
        cx, cy = RNG.uniform(0, S, 2)
        r = RNG.uniform(30, 130)
        b = np.maximum(b, radial(S, S, cx, cy, r) ** 1.6 * RNG.uniform(0.5, 1.0))
    save_png(np.full((S, S, 3), 255), np.clip(b * 255, 0, 255),
             "textures/texture.bokeh.soft-01.png")

    # 10. vignette
    v = radial(S, S, S / 2, S / 2, S * 0.72)
    save_png(np.zeros((S, S, 3)), np.clip((1 - v) ** 1.6 * 235, 0, 255),
             "textures/texture.vignette.soft-01.png")


# ----------------------------------------------------------------- images ---
def _mesh(w: int, h: int, colors: list, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    base = np.array(colors[0], np.float32) * 0.45
    out = np.ones((h, w, 3), np.float32) * base
    weight = np.full((h, w), 0.45, np.float32)
    for c in colors:
        cx, cy = rng.uniform(0, w), rng.uniform(0, h)
        r = rng.uniform(min(w, h) * 0.5, min(w, h) * 1.2)
        g = radial(h, w, cx, cy, r) ** 1.4
        out += g[..., None] * np.array(c, np.float32)
        weight += g
    out = out / np.maximum(weight[..., None], 1e-4)
    shade = fbm(h, w, 4, seed=seed + 1)[..., None]
    return np.clip(out * (0.94 + shade * 0.12), 0, 255)


def images() -> None:
    W, H = 1920, 1080
    print("images")

    save_png(_mesh(W, H, [(68, 44, 160), (124, 92, 255), (20, 18, 40)], 1),
             None, "images/image.gradient.mesh-01.png")
    save_png(_mesh(W, H, [(8, 60, 92), (34, 211, 238), (6, 12, 30)], 2),
             None, "images/image.gradient.mesh-02.png")
    save_png(_mesh(W, H, [(120, 30, 20), (255, 122, 89), (40, 14, 16)], 3),
             None, "images/image.gradient.mesh-03.png")
    save_png(_mesh(W, H, [(10, 12, 24), (22, 26, 48), (4, 5, 12)], 4),
             None, "images/image.gradient.dark-01.png")

    # light leaks: directional warm/cool wash with noise breakup
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    for name, col, seed in (
        ("image.lightleak.warm-01.png", (255, 150, 70), 21),
        ("image.lightleak.cool-01.png", (80, 190, 255), 22),
    ):
        d = np.clip((x / W) * 0.85 + (1 - y / H) * 0.35, 0, 1) ** 2.6
        leak = d * (0.55 + fbm(H, W, 4, seed=seed) * 0.75)
        alpha = np.clip(leak * 255, 0, 255)
        rgb = np.broadcast_to(np.array(col, np.float32), (H, W, 3)).copy()
        rgb *= np.clip(0.55 + leak[..., None] * 0.7, 0, 1.15)
        save_png(rgb, alpha, f"images/{name}")

    # anamorphic flare
    glow = np.exp(-((y - H * 0.52) ** 2) / (2 * (H * 0.012) ** 2))
    tail = np.exp(-((x - W * 0.5) ** 2) / (2 * (W * 0.42) ** 2))
    core = np.exp(-((y - H * 0.52) ** 2) / (2 * (H * 0.0035) ** 2)) * np.exp(
        -((x - W * 0.5) ** 2) / (2 * (W * 0.12) ** 2))
    a = np.clip((glow * tail * 0.75 + core) * 255, 0, 255)
    save_png(np.full((H, W, 3), 255), a, "images/image.flare.anamorphic-01.png")

    # bokeh party: coloured out-of-focus dots
    b = np.zeros((H, W), np.float32)
    c = np.zeros((H, W, 3), np.float32)
    for _ in range(40):
        cx, cy = RNG.uniform(0, W), RNG.uniform(0, H)
        r = RNG.uniform(40, 170)
        g = radial(H, W, cx, cy, r) ** 2.0
        col = np.array([RNG.uniform(120, 255), RNG.uniform(120, 255), RNG.uniform(180, 255)])
        b += g
        c += g[..., None] * col
    b = np.clip(b, 0, 1)
    c = c / np.maximum(b[..., None], 1e-4)
    save_png(np.clip(c, 0, 255), np.clip(b * 210, 0, 255), "images/image.bokeh.party-01.png")

    # confetti
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    palette = [(124, 92, 255), (34, 211, 238), (255, 122, 89), (255, 203, 107), (123, 216, 143)]
    for _ in range(220):
        cx, cy = RNG.uniform(0, W), RNG.uniform(0, H)
        w_, h_ = RNG.uniform(6, 18), RNG.uniform(10, 26)
        ang = RNG.uniform(0, math.pi)
        pts = []
        for dx, dy in ((-w_ / 2, -h_ / 2), (w_ / 2, -h_ / 2), (w_ / 2, h_ / 2), (-w_ / 2, h_ / 2)):
            pts.append((cx + dx * math.cos(ang) - dy * math.sin(ang),
                        cy + dx * math.sin(ang) + dy * math.cos(ang)))
        d.polygon(pts, fill=palette[int(RNG.integers(0, len(palette)))] + (int(RNG.integers(140, 230)),))
    img.save(_dir("images") / "image.confetti.burst-01.png", optimize=True)
    print(f"  public/library/images/image.confetti.burst-01.png  "
          f"{(img.size[0], img.size[1])}")

    # paper card (opaque, 1200x800)
    pw, ph = 1200, 800
    fiber = fbm(ph, pw, 5, seed=31)
    base = np.array([247, 244, 237], np.float32)
    rgb = np.clip(base[None, None, :] * (0.93 + fiber[..., None] * 0.11), 0, 255)
    save_png(rgb, None, "images/image.paper.card-01.png")


# -------------------------------------------------------------------- sfx ---
def sfx() -> None:
    print("sfx")

    # heavy impact: pitch-diving body + lowpassed noise crack
    n = int(0.9 * SR)
    t = t_axis(0.9)
    body = sweep(140, 38, n) * np.exp(-t * 7.5)
    crack = onepole_lp(RNG.standard_normal(n).astype(np.float32), 2600) * np.exp(-t * 30) * 1.6
    save_wav(np.tanh((body + crack) * 1.4), "sfx/sfx.impact.heavy-01.wav")

    # double boom
    n = int(1.2 * SR)
    t = t_axis(1.2)
    a = sweep(120, 32, n) * np.exp(-t * 8)
    b = np.zeros(n, np.float32)
    off = int(0.09 * SR)
    b[off:] = (sweep(90, 30, n - off) * np.exp(-t[: n - off] * 9)) * 0.6
    save_wav(np.tanh((a + b) * 1.5), "sfx/sfx.impact.heavy-02.wav")

    # soft thud
    n = int(0.4 * SR)
    t = t_axis(0.4)
    x = sweep(95, 45, n) * np.exp(-t * 16) + onepole_lp(
        RNG.standard_normal(n).astype(np.float32), 700) * np.exp(-t * 40) * 0.7
    save_wav(x, "sfx/sfx.impact.soft-01.wav")

    # metallic hit (FM)
    n = int(0.7 * SR)
    t = t_axis(0.7)
    idx = 3.2 * np.exp(-t * 9)
    mod = np.sin(2 * np.pi * 620 * 2.71 * t) * idx
    x = np.sin(2 * np.pi * 220 * t + mod) * np.exp(-t * 5.5)
    x += onepole_lp(RNG.standard_normal(n).astype(np.float32), 5000) * np.exp(-t * 26) * 0.5
    save_wav(x, "sfx/sfx.impact.metal-01.wav")

    # cinematic boom with long tail
    n = int(1.6 * SR)
    t = t_axis(1.6)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 26 * np.exp(-t * 4)) / SR) * np.exp(-t * 2.6)
    tail = onepole_lp(RNG.standard_normal(n).astype(np.float32), 320) * np.exp(-t * 3.4) * 0.4
    save_wav(np.tanh((sub + tail) * 1.2), "sfx/sfx.boom.cinematic-01.wav")

    # whooshes: noise whose brightness rises then falls
    for name, dur, lo, hi in (
        ("sfx.whoosh.fast-01.wav", 0.45, 500, 9000),
        ("sfx.whoosh.slow-01.wav", 1.25, 260, 5000),
        ("sfx.swoosh.card-01.wav", 0.6, 320, 6500),
    ):
        n = int(dur * SR)
        t = t_axis(dur)
        noise = RNG.standard_normal(n).astype(np.float32)
        dark = onepole_lp(noise, lo)
        bright = noise - onepole_lp(noise, hi)
        s = np.sin(np.pi * (t / dur)) ** 1.4
        env = np.sin(np.pi * (t / dur)) ** 2.2
        save_wav((dark * (1 - s) + bright * s) * env * (1.6 if dur < 0.8 else 2.2), f"sfx/{name}")

    # glitch: sample-hold + bitcrush
    n = int(0.5 * SR)
    t = t_axis(0.5)
    src = np.sin(2 * np.pi * 440 * t) * 0.6 + RNG.standard_normal(n).astype(np.float32) * 0.5
    blocks = RNG.integers(60, 900, 40)
    hold = np.concatenate([np.full(b, src[i]) for i, b in enumerate(blocks)])[:n]
    if hold.shape[0] < n:
        hold = np.pad(hold, (0, n - hold.shape[0]), mode="edge")
    x = np.round(hold * 6) / 6
    gate = (RNG.random(n // 120 + 1).repeat(120)[:n] > 0.35).astype(np.float32)
    save_wav(x * gate, "sfx/sfx.glitch.digital-01.wav")

    n = int(0.6 * SR)
    t = t_axis(0.6)
    x = np.sin(2 * np.pi * np.cumsum(np.where(np.arange(n) % 2200 < 1100, 900, 180)) / SR)
    x = np.round(x * 4) / 4
    x *= (np.arange(n) % 2200 < 1900)
    save_wav(x * 0.8, "sfx/sfx.glitch.digital-02.wav")

    # tape stop
    n = int(0.9 * SR)
    t = t_axis(0.9)
    f = 240 * np.exp(-t * 4.2) + 18
    f *= 1 + 0.02 * np.sin(2 * np.pi * 7 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    save_wav(x, "sfx/sfx.tape.stop-01.wav")

    # riser
    n = int(2.5 * SR)
    t = t_axis(2.5)
    rise = sweep(70, 1400, n, curve=1.6) * 0.55
    air = onepole_lp(RNG.standard_normal(n).astype(np.float32), 6000) * 0.35
    env = (t / 2.5) ** 2.4
    save_wav((rise + air) * env, "sfx/sfx.riser.tension-01.wav")

    # sub drop
    n = int(1.1 * SR)
    t = t_axis(1.1)
    x = sweep(72, 24, n, curve=0.5) * np.exp(-t * 2.2)
    save_wav(np.tanh(x * 1.8), "sfx/sfx.drop.sub-01.wav")

    # UI clicks
    for name, f, dur, amp in (
        ("sfx.click.ui-01.wav", 1200, 0.045, 1.0),
        ("sfx.click.ui-02.wav", 760, 0.055, 0.8),
    ):
        n = int(dur * SR)
        t = t_axis(dur)
        x = np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * amp
        x[:6] += 0.6
        save_wav(x, f"sfx/{name}")

    # notification pop
    n = int(0.18 * SR)
    t = t_axis(0.18)
    x = sweep(520, 940, n, curve=0.7) * np.exp(-t * 24)
    save_wav(x, "sfx/sfx.pop.notify-01.wav")

    # typewriter loop (12 clicks)
    beat = 0.12
    total = beat * 12 + 0.3
    x = np.zeros(int(total * SR), np.float32)
    for i in range(12):
        n = int(0.02 * SR)
        tt = t_axis(0.02)
        c = np.sin(2 * np.pi * RNG.uniform(1400, 2100) * tt) * np.exp(-tt * 160) * RNG.uniform(0.5, 1.0)
        c[:4] += 0.8
        s = int(i * beat * SR)
        x[s:s + n] += c
    save_wav(x, "sfx/sfx.typewriter.loop-01.wav")

    # camera shutter
    x = np.zeros(int(0.28 * SR), np.float32)
    for off, amp in ((0.0, 1.0), (0.075, 0.55)):
        n = int(0.05 * SR)
        tt = t_axis(0.05)
        c = RNG.standard_normal(n).astype(np.float32) * np.exp(-tt * 120) * amp
        c = onepole_lp(c, 7000)
        c[:4] += 0.9 * amp
        s = int(off * SR)
        x[s:s + n] += c
    save_wav(x, "sfx/sfx.camera.shutter-01.wav")

    # static hiss (loopable)
    n = int(2.0 * SR)
    x = onepole_lp(RNG.standard_normal(n).astype(np.float32), 5200) * 0.5
    fade = int(0.05 * SR)
    x[:fade] *= np.linspace(0, 1, fade)
    x[-fade:] *= np.linspace(1, 0, fade)
    save_wav(x, "sfx/sfx.static.hiss-01.wav", peak=0.35)

    # heartbeat
    n = int(1.1 * SR)
    x = np.zeros(n, np.float32)
    for off, amp in ((0.0, 1.0), (0.19, 0.72)):
        m = int(0.22 * SR)
        tt = t_axis(0.22)
        thump = np.sin(2 * np.pi * 56 * tt) * np.exp(-tt * 22) * amp
        s = int(off * SR)
        x[s:s + m] += thump[: max(0, min(m, n - s))]
    save_wav(x, "sfx/sfx.heartbeat-01.wav")

    # coin reward
    n = int(0.5 * SR)
    x = np.zeros(n, np.float32)
    for i, (f, off) in enumerate(((1318, 0.0), (1760, 0.075))):
        m = int(0.3 * SR)
        tt = t_axis(0.3)
        c = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 18) * 0.7
        s = int(off * SR)
        x[s:s + m] += c[: max(0, min(m, n - s))]
    save_wav(x, "sfx/sfx.coin.reward-01.wav")

    # UI swipe
    n = int(0.2 * SR)
    t = t_axis(0.2)
    x = sweep(380, 1500, n, curve=0.8) * 0.5
    x += onepole_lp(RNG.standard_normal(n).astype(np.float32), 4000) * 0.25
    save_wav(x * np.exp(-t * 10), "sfx/sfx.swipe.ui-01.wav")


# ------------------------------------------------------------------ music ---
def _note(f: float, dur: float, amp: float = 0.2, attack: float = 0.01,
          release: float = 0.25, detune: float = 0.0, bright: float = 0.3) -> np.ndarray:
    n = max(1, int(dur * SR))
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + bright * np.sin(4 * np.pi * f * t) + bright * 0.4 * np.sin(
        6 * np.pi * f * t)
    if detune:
        x += 0.45 * np.sin(2 * np.pi * f * (1 + detune) * t)
    env = np.ones(n, np.float32)
    a = min(n, int(attack * SR))
    r = min(n, int(release * SR))
    if a:
        env[:a] = np.linspace(0, 1, a)
    if r:
        env[-r:] *= np.linspace(1, 0, r)
    return (x * env * amp).astype(np.float32)


def _place(buf: np.ndarray, x: np.ndarray, at: float) -> None:
    s = int(at * SR)
    e = min(buf.shape[0], s + x.shape[0])
    if e > s:
        buf[s:e] += x[: e - s]


def _kick(amp: float = 0.8) -> np.ndarray:
    n = int(0.32 * SR)
    t = np.arange(n) / SR
    f = 120 * np.exp(-t * 18) + 46
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * amp).astype(np.float32)


def _clap() -> np.ndarray:
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    x = RNG.standard_normal(n).astype(np.float32)
    x = onepole_lp(x, 3800)
    return (x * np.exp(-t * 26) * 0.5).astype(np.float32)


def music() -> None:
    print("music")

    # corporate: Am - F - C - G, 100 BPM, 4 bars (~9.6s)
    bar = 2.4
    prog = [(220.00, [220.0, 261.63, 329.63]), (174.61, [174.61, 220.0, 261.63]),
            (261.63, [261.63, 329.63, 392.0]), (196.00, [196.0, 246.94, 293.66])]
    total = bar * 4
    buf = np.zeros(int(total * SR), np.float32)
    for i, (root, chord) in enumerate(prog):
        at = i * bar
        for f in chord:
            _place(buf, _note(f, bar * 0.98, 0.10, attack=0.25, release=0.7, detune=0.004), at)
        for k in range(8):
            _place(buf, _note(root * 2 * (1 if k % 2 == 0 else 1.5), 0.3, 0.055,
                              attack=0.005, release=0.28, bright=0.15), at + k * (bar / 8))
    save_wav(buf, "music/music.bed.corporate-01.wav", peak=0.7)

    # uplift: C - G - Am - F, 120 BPM
    bar = 2.0
    prog = [(261.63, [261.63, 329.63, 392.0]), (196.0, [196.0, 246.94, 293.66]),
            (220.0, [220.0, 261.63, 329.63]), (174.61, [174.61, 220.0, 261.63])]
    total = bar * 4
    buf = np.zeros(int(total * SR), np.float32)
    for i, (root, chord) in enumerate(prog):
        at = i * bar
        for f in chord:
            _place(buf, _note(f, bar * 0.9, 0.085, attack=0.08, release=0.4, detune=0.003), at)
        for k in range(4):
            _place(buf, _kick(0.55), at + k * (bar / 4))
        for k in range(16):
            _place(buf, _note(root * 4 * (1 if k % 4 else 0.5), 0.12, 0.03,
                              attack=0.002, release=0.1, bright=0.6), at + k * (bar / 16))
    save_wav(buf, "music/music.bed.uplift-01.wav", peak=0.72)

    # tension: drones + minor 2nd cluster, slow swell
    total = 12.0
    buf = np.zeros(int(total * SR), np.float32)
    for f, a in ((55.0, 0.22), (82.41, 0.12), (110.0, 0.1), (116.54, 0.055)):
        _place(buf, _note(f, total, a, attack=2.5, release=2.5, bright=0.15), 0)
    n = buf.shape[0]
    t = np.arange(n) / SR
    buf *= (0.55 + 0.45 * np.sin(2 * np.pi * t / 12 - 1.5)) ** 1.5
    save_wav(buf, "music/music.bed.tension-01.wav", peak=0.6)

    # lofi: Fmaj7 - Em7 - Dm7 - C at 80 BPM + vinyl noise
    bar = 3.0
    prog = [[174.61, 220.0, 261.63, 329.63], [164.81, 196.0, 246.94, 293.66],
            [146.83, 174.61, 220.0, 261.63], [130.81, 164.81, 196.0, 261.63]]
    total = bar * 4
    buf = np.zeros(int(total * SR), np.float32)
    for i, chord in enumerate(prog):
        at = i * bar
        for f in chord:
            _place(buf, _note(f, bar * 0.95, 0.075, attack=0.18, release=0.6, bright=0.2), at)
        _place(buf, _note(chord[0] / 2, bar * 0.9, 0.1, attack=0.05, release=0.5, bright=0.1),
               at + bar * 0.25)
    n = buf.shape[0]
    vinyl = onepole_lp(RNG.standard_normal(n).astype(np.float32), 3200)
    crackle = (RNG.random(n) > 0.9993).astype(np.float32) * RNG.standard_normal(n).astype(np.float32)
    buf += vinyl * 0.045 + crackle * 0.25
    save_wav(buf, "music/music.bed.lofi-01.wav", peak=0.65)

    # emotional: Am - Em - F - C, soft pad + piano-ish top line
    bar = 3.0
    prog = [[220.0, 261.63, 329.63], [164.81, 196.0, 246.94],
            [174.61, 220.0, 261.63], [261.63, 329.63, 392.0]]
    total = bar * 4
    buf = np.zeros(int(total * SR), np.float32)
    for i, chord in enumerate(prog):
        at = i * bar
        for f in chord:
            _place(buf, _note(f, bar * 0.98, 0.07, attack=0.5, release=0.9, detune=0.006), at)
        for k, f in enumerate([chord[2], chord[1], chord[2] * 1.5]):
            _place(buf, _note(f, 0.7, 0.06, attack=0.01, release=0.6, bright=0.5),
                   at + 0.4 + k * 0.7)
    save_wav(buf, "music/music.bed.emotional-01.wav", peak=0.62)

    # punchy remix bed for jedag-jedug: 128 BPM, 8s, kick + clap + bass
    beat = 60 / 128
    total = beat * 16
    buf = np.zeros(int(total * SR), np.float32)
    for i in range(16):
        at = i * beat
        _place(buf, _kick(0.95), at)
        if i % 4 in (1, 3):
            _place(buf, _clap(), at)
        _place(buf, _note(55.0 * (1 if i % 8 < 4 else 1.5), beat * 0.5, 0.22,
                          attack=0.004, release=0.2, bright=0.55), at + beat * 0.5)
        for k in range(2):
            _place(buf, _note(440 * (1, 1.5)[k], 0.09, 0.035, attack=0.002,
                              release=0.08, bright=0.8), at + k * beat * 0.5)
    save_wav(np.tanh(buf * 1.3), "music/music.remix.punchy-01.wav", peak=0.8)


# --------------------------------------------------------------- captions ---
def captions() -> None:
    """Graphics that sit behind/around subtitle words.

    These are decorations, not text: the component renders the words, the
    pack supplies the highlight/box/bubble behind the active word.
    """
    W, H = 900, 260
    print("captions")

    def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
        img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        return img, ImageDraw.Draw(img)

    def save(img: Image.Image, rel: str) -> None:
        path = _dir(str(Path(rel).parent)) / Path(rel).name
        img.save(path, optimize=True)
        print(f"  {path.relative_to(ROOT)}  {path.stat().st_size // 1024} KB")

    # 1. yellow pill highlight
    img, d = canvas()
    d.rounded_rectangle([10, 34, W - 10, H - 34], radius=96, fill=(255, 214, 64, 232))
    save(img, "images/image.caption.pill-01.png")

    # 2. dark box with a hairline border
    img, d = canvas()
    d.rounded_rectangle([8, 24, W - 8, H - 24], radius=30, fill=(12, 16, 28, 238),
                        outline=(255, 255, 255, 46), width=3)
    save(img, "images/image.caption.box-01.png")

    # 3. brush underline (hand-drawn feel: wobble + soft blur)
    img, d = canvas()
    pts = [(40, 168), (200, 138), (360, 176), (520, 140), (690, 172), (858, 146)]
    for off, alpha in ((0, 255), (6, 120)):
        d.line([(x, y + off) for x, y in pts], fill=(124, 92, 255, alpha), width=22, joint="curve")
    img = img.filter(ImageFilter.GaussianBlur(1.1))
    save(img, "images/image.caption.underline-01.png")

    # 4. speech bubble with tail
    img, d = canvas()
    d.rounded_rectangle([24, 26, W - 24, H - 84], radius=44, fill=(250, 250, 255, 240),
                        outline=(20, 24, 40, 40), width=3)
    d.polygon([(210, H - 88), (286, H - 88), (238, H - 10)], fill=(250, 250, 255, 240))
    save(img, "images/image.caption.bubble-01.png")

    # 5. rough marker stroke (skewed parallelogram)
    img, d = canvas()
    d.polygon([(30, 176), (250, 96), (872, 104), (640, 196)], fill=(255, 122, 89, 210))
    img = img.rotate(-1.2, resample=Image.BICUBIC)
    img = img.filter(ImageFilter.GaussianBlur(0.8))
    save(img, "images/image.caption.stroke-01.png")

    # 6. curved arrow with head
    img, d = canvas()
    d.arc([120, 40, 780, 300], start=200, end=340, fill=(255, 255, 255, 235), width=14)
    d.polygon([(120, 150), (196, 128), (152, 214)], fill=(255, 255, 255, 235))
    save(img, "images/image.caption.arrow-01.png")


SECTIONS = {"textures": textures, "images": images, "sfx": sfx, "music": music, "captions": captions}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", choices=list(SECTIONS), default=None)
    args = ap.parse_args()
    targets = [args.only] if args.only else list(SECTIONS)
    for name in targets:
        SECTIONS[name]()
    print("done")


if __name__ == "__main__":
    main()
