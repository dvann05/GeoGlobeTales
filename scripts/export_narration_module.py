import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
filename = sys.argv[1] if len(sys.argv) > 1 else "narration"

source = root / "public/audio/narration" / f"{filename}.json"
target = root / "src/projects/generated/narration.ts"

if not source.exists():
    raise FileNotFoundError(f"Metadata tidak ditemukan: {source}")

metadata = json.loads(source.read_text(encoding="utf-8"))

target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(
    "export const generatedNarration = "
    + json.dumps(metadata, ensure_ascii=False, indent=2)
    + " as const;\n",
    encoding="utf-8",
)

print(f"Module dibuat: {target}")
