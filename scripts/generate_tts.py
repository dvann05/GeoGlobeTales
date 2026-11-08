import argparse
import json
import re
import wave
from pathlib import Path

from g2p_id.scripts.tts import tts as synthesize


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "audio" / "narration"


def split_sentences(text: str):
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    return [part.strip() for part in parts if part.strip()]


def get_duration(path: Path) -> float:
    with wave.open(str(path), "rb") as audio:
        return audio.getnframes() / audio.getframerate()


def make_subtitles(text: str, duration: float):
    sentences = split_sentences(text)

    if not sentences:
        return []

    total_weight = sum(max(1, len(sentence)) for sentence in sentences)
    current_time = 0.0
    cues = []

    for index, sentence in enumerate(sentences):
        weight = max(1, len(sentence))
        segment_duration = duration * weight / total_weight
        end_time = (
            duration
            if index == len(sentences) - 1
            else current_time + segment_duration
        )

        cues.append({
            "id": f"subtitle-{index + 1}",
            "text": sentence,
            "startSeconds": round(current_time, 3),
            "endSeconds": round(end_time, 3),
        })

        current_time = end_time

    return cues


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", required=True)
    parser.add_argument(
        "--speaker",
        choices=["ardi", "wibowo", "gadis"],
        default="ardi",
    )
    parser.add_argument("--filename", default="narration")
    args = parser.parse_args()

    safe_name = re.sub(r"[^a-zA-Z0-9_-]", "-", args.filename).strip("-")
    if not safe_name:
        raise ValueError("Nama file tidak valid.")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    audio_path = OUTPUT_DIR / f"{safe_name}.wav"
    metadata_path = OUTPUT_DIR / f"{safe_name}.json"

    print(f"Membuat narasi dengan suara: {args.speaker}")

    result = synthesize(
        args.text,
        speaker=args.speaker,
        output_file=str(audio_path),
    )

    if result not in (None, 0):
        raise RuntimeError(f"TTS gagal dengan kode: {result}")

    if not audio_path.exists() or audio_path.stat().st_size == 0:
        raise RuntimeError("File audio tidak berhasil dibuat.")

    duration = get_duration(audio_path)

    metadata = {
        "provider": "tts-indonesia-gratis",
        "language": "id-ID",
        "voiceId": args.speaker,
        "text": args.text,
        "audioPath": f"audio/narration/{safe_name}.wav",
        "format": "wav",
        "durationSeconds": round(duration, 3),
        "alignment": "estimated",
        "subtitles": make_subtitles(args.text, duration),
    }

    metadata_path.write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Audio: {audio_path}")
    print(f"Metadata: {metadata_path}")
    print(f"Durasi: {duration:.2f} detik")


if __name__ == "__main__":
    main()
