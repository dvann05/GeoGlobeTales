const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const metadataFile = path.join(
  publicDir,
  "audio",
  "narration",
  "narration.json",
);
const generatedModule = path.join(
  root,
  "src",
  "projects",
  "generated",
  "narration.ts",
);

function fail(message) {
  console.error("\n[GEOGLOBETALES ASSET ERROR]");
  console.error(message);
  process.exit(1);
}

if (!fs.existsSync(metadataFile)) {
  fail("Metadata narasi tidak ditemukan. Jalankan workflow Generate Indonesian Narration.");
}

let metadata;

try {
  metadata = JSON.parse(fs.readFileSync(metadataFile, "utf8"));
} catch {
  fail("Metadata narasi bukan JSON yang valid.");
}

if (
  typeof metadata.audioPath !== "string" ||
  !metadata.audioPath.trim() ||
  typeof metadata.text !== "string" ||
  !metadata.text.trim()
) {
  fail("Metadata harus memiliki audioPath dan teks narasi.");
}

if (
  !Number.isFinite(metadata.durationSeconds) ||
  metadata.durationSeconds < 20
) {
  fail(`Durasi narasi ${metadata.durationSeconds}s. Minimal 20 detik diperlukan.`);
}

const audioPath = metadata.audioPath.replace(/^\/+/, "");
const audioFile = path.resolve(publicDir, audioPath);
const relativeAudio = path.relative(publicDir, audioFile);

if (
  relativeAudio.startsWith("..") ||
  path.isAbsolute(relativeAudio)
) {
  fail("Lokasi audio berada di luar folder public.");
}

if (!fs.existsSync(audioFile)) {
  fail(`File audio tidak ditemukan: ${metadata.audioPath}`);
}

if (!fs.statSync(audioFile).isFile() || fs.statSync(audioFile).size === 0) {
  fail("File audio kosong atau bukan file biasa.");
}

if (!Array.isArray(metadata.subtitles) || metadata.subtitles.length === 0) {
  fail("Subtitle narasi belum tersedia.");
}

const cueIds = new Set();
const cues = [...metadata.subtitles].sort(
  (a, b) => a.startSeconds - b.startSeconds,
);

for (let i = 0; i < cues.length; i++) {
  const cue = cues[i];

  if (
    typeof cue.id !== "string" ||
    !cue.id.trim() ||
    cueIds.has(cue.id) ||
    typeof cue.text !== "string" ||
    !cue.text.trim() ||
    !Number.isFinite(cue.startSeconds) ||
    !Number.isFinite(cue.endSeconds) ||
    cue.startSeconds < 0 ||
    cue.endSeconds <= cue.startSeconds ||
    cue.endSeconds > metadata.durationSeconds + 0.05
  ) {
    fail(`Cue subtitle tidak valid: ${JSON.stringify(cue)}`);
  }

  cueIds.add(cue.id);

  if (
    i > 0 &&
    cue.startSeconds < cues[i - 1].endSeconds - 0.05
  ) {
    fail(`Subtitle bertumpuk: ${cues[i - 1].id} dan ${cue.id}`);
  }
}

if (!fs.existsSync(generatedModule)) {
  fail("Modul generated narration belum dibuat.");
}

const moduleSource = fs.readFileSync(generatedModule, "utf8");

if (
  /generatedNarration\s*=\s*null/.test(moduleSource) ||
  !moduleSource.includes(JSON.stringify(metadata.audioPath)) ||
  !moduleSource.includes(JSON.stringify(metadata.text))
) {
  fail("Modul TypeScript tidak sesuai dengan metadata audio. Jalankan ulang ekspor narasi.");
}

console.log("\n[GEOGLOBETALES] Semua aset narasi valid.");
console.log(`[GEOGLOBETALES] Durasi: ${metadata.durationSeconds}s`);
console.log(`[GEOGLOBETALES] Subtitle: ${metadata.subtitles.length} cue`);
console.log(`[GEOGLOBETALES] Audio: ${metadata.audioPath}`);
console.log("[GEOGLOBETALES] Modul narasi sudah terhubung.");
