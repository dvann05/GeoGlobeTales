const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const metadataFile = path.join(
  root,
  "public/audio/narration/narration.json",
);

function fail(message) {
  console.error("\n[GEOGLOBETALES ASSET ERROR]");
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(metadataFile)) {
  fail(
    "Metadata narasi tidak ditemukan. Jalankan workflow Generate Indonesian Narration terlebih dahulu.",
  );
}

let metadata;

try {
  metadata = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
} catch {
  fail("File metadata narasi bukan JSON yang valid.");
}

if (!metadata.audioPath) {
  fail("audioPath tidak ditemukan di metadata narasi.");
}

const audioFile = path.resolve(
  root,
  "public",
  metadata.audioPath.replace(/^\/+/, ""),
);

if (!audioFile.startsWith(path.join(root, "public") + path.sep)) {
  fail("Lokasi audio berada di luar folder public.");
}

if (!fs.existsSync(audioFile)) {
  fail(`File WAV narasi tidak ditemukan: ${audioFile}`);
}

if (fs.statSync(audioFile).size === 0) {
  fail("File WAV narasi kosong.");
}

if (
  !Number.isFinite(metadata.durationSeconds) ||
  metadata.durationSeconds < 20
) {
  fail(
    `Durasi narasi ${metadata.durationSeconds}s. Minimal 20 detik diperlukan untuk video tester.`,
  );
}

if (!Array.isArray(metadata.subtitles) || metadata.subtitles.length === 0) {
  fail("Subtitle narasi belum tersedia.");
}

for (const cue of metadata.subtitles) {
  if (
    !cue.text ||
    !Number.isFinite(cue.startSeconds) ||
    !Number.isFinite(cue.endSeconds) ||
    cue.startSeconds < 0 ||
    cue.endSeconds <= cue.startSeconds
  ) {
    fail(`Cue subtitle tidak valid: ${JSON.stringify(cue)}`);
  }
}

console.log("[GEOGLOBETALES] Asset narasi valid.");
console.log(`[GEOGLOBETALES] Durasi: ${metadata.durationSeconds}s`);
console.log(`[GEOGLOBETALES] Subtitle: ${metadata.subtitles.length} cue`);
console.log(`[GEOGLOBETALES] Audio: ${metadata.audioPath}`);
