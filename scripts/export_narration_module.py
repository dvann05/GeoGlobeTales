import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "public" / "audio" / "narration"
MODULE_FILE = ROOT / "src" / "projects" / "generated" / "narration.ts"
CANONICAL_METADATA = OUTPUT_DIR / "narration.json"


def main():
    filename = sys.argv[1] if len(sys.argv) > 1 else "narration"

    safe_name = re.sub(r"[^a-zA-Z0-9_-]", "-", filename).strip("-")
    if not safe_name or safe_name != filename:
        raise ValueError("Nama file narasi tidak valid.")

    source = OUTPUT_DIR / f"{safe_name}.json"

    if not source.is_file():
        raise FileNotFoundError(f"Metadata tidak ditemukan: {source}")

    metadata = json.loads(source.read_text(encoding="utf-8"))

    required = [
        "provider",
        "language",
        "voiceId",
        "text",
        "audioPath",
        "format",
        "durationSeconds",
        "alignment",
        "subtitles",
    ]

    missing = [key for key in required if key not in metadata]
    if missing:
        raise ValueError(f"Metadata kehilangan field: {', '.join(missing)}")

    if not isinstance(metadata["text"], str) or not metadata["text"].strip():
        raise ValueError("Teks narasi kosong.")

    if not isinstance(metadata["subtitles"], list) or not metadata["subtitles"]:
        raise ValueError("Subtitle narasi belum tersedia.")

    audio_path = metadata["audioPath"].replace("\\", "/").lstrip("/")
    resolved_audio = (ROOT / "public" / audio_path).resolve()
    public_root = (ROOT / "public").resolve()

    if not resolved_audio.is_relative_to(public_root):
        raise ValueError("Lokasi audio berada di luar folder public.")

    if not resolved_audio.is_file() or resolved_audio.stat().st_size == 0:
        raise FileNotFoundError(f"File audio tidak valid: {resolved_audio}")

    metadata["audioPath"] = audio_path

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    MODULE_FILE.parent.mkdir(parents=True, exist_ok=True)

    serialized = json.dumps(metadata, ensure_ascii=False, indent=2)

    CANONICAL_METADATA.write_text(
        serialized + "\n",
        encoding="utf-8",
    )

    MODULE_FILE.write_text(
        'import type { GeneratedNarration } from "../../engine/audio/NarrationBridge";\n\n'
        "export const generatedNarration: GeneratedNarration = "
        + serialized
        + ";\n",
        encoding="utf-8",
    )

    print(f"Metadata aktif: {CANONICAL_METADATA}")
    print(f"Modul TypeScript: {MODULE_FILE}")
    print(f"Audio: {resolved_audio}")
    print("Ekspor narasi berhasil.")


if __name__ == "__main__":
    main()
