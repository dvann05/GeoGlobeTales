const fs = require("fs");
const path = require("path");

const URL =
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74218/world.topo.bathy.200412.3x5400x2700.jpg";

const OUTPUT = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "earth",
  "earth-blue-marble.jpg"
);

async function main() {
  console.log("[Earth Assets] Downloading NASA Earth texture...");

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  const response = await fetch(URL);

  if (!response.ok) {
    throw new Error(`NASA download failed: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (
    buffer.length < 100000 ||
    buffer[0] !== 0xff ||
    buffer[1] !== 0xd8 ||
    buffer[2] !== 0xff
  ) {
    throw new Error("Downloaded file is not a valid JPEG image.");
  }

  fs.writeFileSync(OUTPUT, buffer);

  console.log("[Earth Assets] Download complete.");
  console.log(`[Earth Assets] Saved: ${OUTPUT}`);
  console.log(`[Earth Assets] Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch((error) => {
  console.error("[Earth Assets] ERROR:", error.message);
  process.exit(1);
});
