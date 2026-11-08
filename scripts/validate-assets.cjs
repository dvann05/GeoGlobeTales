const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");

const metadataFile = path.join(
  publicDir,
  "audio/narration/narration.json",
);

const generatedModule = path.join(
  root,
  "src/projects/generated/narration.ts",
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
  metadata = JSON.parse(
    fs.readFileSync(metadataFile, "utf8"),
  );
} catch {
  fail("Metadata narasi bukan JSON yang valid.");
}

if (!metadata.audioPath || !metadata.text) {
  fail("Metadata harus memiliki audioPath dan teks narasi.");
}

const audioFile = path.resolve(
  publicDir,
  metadata.audioPath.replace(/^\/+/, ""),
);

if (!audioFile.startsWith(publicDir + path.sep)) {
  fail("Lokasi audio berada di luar folder public.");
}

if (!fs.existsSync(audioFile)) {
  fail(`File audio tidak ditemukan: ${metadata.audioPath}`);
}

if (fs.statSync(audioFile).size === 0) {
  fail("File audio kosong.");
}

if (
  !Number.isFinite(metadata.durationSeconds) ||
  metadata.durationSeconds < 20
) {
  fail(
    `Durasi narasi ${metadata.durationSeconds}s. Minimal 20 detik diperlukan untuk video tester.`,
  );
}

if (
  !Array.isArray(metadata.subtitles) ||
  metadata.subtitles.length === 0
) {
  fail("Subtitle narasi belum tersedia.");
}

for (const cue of metadata.subtitles) {
  if (
    !cue.id ||
    !cue.text ||
    !Number.isFinite(cue.startSeconds) ||
    !Number.isFinite(cue.endSeconds) ||
    cue.startSeconds < 0 ||
    cue.endSeconds <= cue.startSeconds ||
    cue.endSeconds > metadata.durationSeconds + 0.05
  ) {
    fail(`Cue subtitle tidak valid: ${JSON.stringify(cue)}`);
  }
}

if (!fs.existsSync(generatedModule)) {
  fail("Modul generated narration belum dibuat.");
}

const moduleSource = fs.readFileSync(
  generatedModule,
  "utf8",
);

if (
  /generatedNarration\s*:\s*GeneratedNarration\s*\|\s*null\s*=\s*null/.test(
    moduleSource,
  ) ||
  /generatedNarration\s*=\s*null/.test(moduleSource)
) {
  fail(
    "generatedNarration masih null. Jalankan workflow Generate Indonesian Narration dan ekspor modulnya.",
  );
}

if (
  !moduleSource.includes(JSON.stringify(metadata.audioPath)) ||
  !moduleSource.includes(JSON.stringify(metadata.text))
) {
  fail(
    "Modul TypeScript tidak sesuai dengan metadata audio. Jalankan ulang workflow Generate Indonesian Narration.",
  );
}

console.log("\n[GEOGLOBETALES] Semua aset narasi valid.");
console.log(`[GEOGLOBETALES] Durasi: ${metadata.durationSeconds}s`);
console.log(`[GEOGLOBETALES] Subtitle: ${metadata.subtitles.length} cue`);
console.log(`[GEOGLOBETALES] Audio: ${metadata.audioPath}`);
console.log("[GEOGLOBETALES] Modul narasi sudah terhubung.");
