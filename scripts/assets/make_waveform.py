"""Precompute a waveform envelope for the scrolling bar display.

    python scripts/assets/make_waveform.py public/library/vo/vo.podcast.demo-01.wav

Writes src/data/podcast-demo-waveform.generated.json:
    { "fps": 30, "peaks": [0.12, 0.44, ...] }   # one RMS value per frame

Why precompute: decoding the SAPI wav inside headless Chrome yields ~1e-7
amplitude (duration is right, samples are not), so FFT visualisation shows a flat
line. An envelope computed from the same file in Python avoids the decoder
entirely and is deterministic across renders.
"""

import json
import sys
import wave

import numpy as np


def load_audio(path: str) -> tuple[np.ndarray, int]:
    """Mono float32 samples + sample rate. WAV via stdlib, anything else via av."""
    try:
        with wave.open(path, "rb") as w:
            sr = w.getframerate()
            ch = w.getnchannels()
            raw = w.readframes(w.getnframes())
    except (wave.Error, EOFError):
        import av  # installed as a faster-whisper dependency

        container = av.open(path)
        stream = container.streams.audio[0]
        resampler = av.AudioResampler(format="fltp", layout="mono", rate=44100)
        chunks = []
        for frame in container.decode(stream):
            for out in resampler.resample(frame):
                chunks.append(out.to_ndarray().reshape(-1))
        data = np.concatenate(chunks) if chunks else np.zeros(1, np.float32)
        return data.astype(np.float32), 44100

    data = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0
    if ch > 1:
        data = data.reshape(-1, ch).mean(axis=1)
    return data, sr


def main(wav_path: str, out_path: str, fps: int = 30) -> None:
    data, sr = load_audio(wav_path)

    duration = data.shape[0] / sr
    n_frames = int(round(duration * fps))
    step = sr / fps

    peaks = []
    for i in range(n_frames):
        a = int(i * step)
        b = min(data.shape[0], int((i + 1) * step))
        chunk = data[a:b] if b > a else data[a : a + 1]
        peaks.append(float(np.sqrt(np.mean(chunk**2))))

    arr = np.array(peaks, dtype=np.float32)
    norm = float(np.percentile(arr, 95)) or 1.0
    arr = np.clip(arr / norm, 0, 1) ** 0.7

    payload = {"fps": fps, "peaks": [round(float(v), 4) for v in arr]}
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"))

    print(f"wrote {out_path}: {n_frames} frames, {duration:.2f}s, norm={norm:.4f}")


if __name__ == "__main__":
    src = sys.argv[1] if len(sys.argv) > 1 else "public/library/vo/vo.podcast.demo-01.wav"
    dst = (
        sys.argv[2]
        if len(sys.argv) > 2
        else "src/data/podcast-demo-waveform.generated.json"
    )
    main(src, dst)
