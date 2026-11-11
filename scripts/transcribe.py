"""Transcribe audio/video into word-timed JSON with faster-whisper.

    python scripts/transcribe.py public/library/vo/vo.podcast.demo-01.wav \
        --out src/data/podcast-demo.transcribed.json --model base.en

Output shape matches what PodcastClip expects:

    {
      "text": "...",
      "durationMs": 15297,
      "language": "en",
      "model": "base.en",
      "words": [{"text": "Okay,", "startMs": 151, "endMs": 1426}, ...]
    }

Model weights are cached in .cache/whisper (gitignored), so the first run
downloads ~145 MB for base.en and later runs are offline.
"""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("media", help="audio or video file")
    ap.add_argument("--out", required=True, help="where to write the JSON")
    ap.add_argument("--model", default="base.en", help="tiny.en | base.en | small.en | ...")
    ap.add_argument("--cache", default=".cache/whisper")
    ap.add_argument("--language", default=None, help="force a language, e.g. id")
    ap.add_argument("--prompt", default=None, help="domain words to bias spelling")
    args = ap.parse_args()

    from faster_whisper import WhisperModel

    try:
        model = WhisperModel(
            args.model,
            device="cpu",
            compute_type="int8",
            download_root=args.cache,
        )
    except Exception as exc:  # network / missing weights
        raise SystemExit(
            f"Gagal memuat model '{args.model}': {exc}\n"
            f"Bobot diunduh dari HuggingFace ke '{args.cache}'.\n"
            "Coba lagi (unduhan melanjutkan), atau pakai model lebih kecil:\n"
            "  --model tiny.en\n"
            "Kalau HuggingFace diblokir, set HF_ENDPOINT ke mirror yang bisa diakses."
        )

    segments, info = model.transcribe(
        args.media,
        word_timestamps=True,
        vad_filter=True,
        language=args.language,
        initial_prompt=args.prompt,
    )

    words: list[dict] = []
    for segment in segments:
        for w in segment.words or []:
            text = w.word.strip()
            if not text:
                continue
            start = int(round(w.start * 1000))
            end = int(round(w.end * 1000))
            words.append({"text": text, "startMs": start, "endMs": max(end, start + 80)})

    if not words:
        raise SystemExit("tidak ada kata yang tertranskripsi")

    duration_ms = int(round(float(info.duration) * 1000))
    payload = {
        "text": " ".join(w["text"] for w in words),
        "durationMs": duration_ms,
        "language": info.language,
        "languageProbability": round(float(getattr(info, "language_probability", 0.0)), 3),
        "model": args.model,
        "words": words,
    }

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    print(
        f"{len(words)} kata, {duration_ms / 1000:.2f}s, "
        f"bahasa={info.language} ({payload['languageProbability']}) -> {out}"
    )


if __name__ == "__main__":
    main()
