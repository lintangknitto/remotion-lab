"""Re-encode a mono 22.05k WAV (SAPI output) to 44.1k stereo PCM.

Chrome's decode path is happiest with the standard 44.1k stereo layout; the
waveform came out empty for the SAPI file before this step.

    python scripts/assets/polish_wav.py public/library/vo/vo.podcast.demo-01.wav
"""

import sys
import wave

import numpy as np


def main(path: str) -> None:
    with wave.open(path, "rb") as w:
        sr = w.getframerate()
        ch = w.getnchannels()
        frames = w.readframes(w.getnframes())

    data = np.frombuffer(frames, dtype="<i2").astype(np.float32) / 32768.0
    if ch > 1:
        data = data.reshape(-1, ch).mean(axis=1)

    if sr != 44100:
        n_out = int(round(data.shape[0] * 44100 / sr))
        x_old = np.linspace(0, 1, data.shape[0], endpoint=False)
        x_new = np.linspace(0, 1, n_out, endpoint=False)
        data = np.interp(x_new, x_old, data).astype(np.float32)

    stereo = np.repeat(data[:, None], 2, axis=1)
    pcm = np.clip(stereo * 32767, -32768, 32767).astype("<i2")

    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(44100)
        w.writeframes(pcm.tobytes())

    print(f"rewrote {path}: 44100 Hz stereo, {data.shape[0] / 44100:.2f}s")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "public/library/vo/vo.podcast.demo-01.wav")
