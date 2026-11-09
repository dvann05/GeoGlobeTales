const fs = require("node:fs");
const path = require("node:path");

const url =
  "https://eoimages.gsfc.nasa.gov/images/imagerecords/74000/74218/world.topo.bathy.200412.3x5400x2700.jpg"\;

const output = path.resolve(
  __dirname,
  "../public/images/earth/earth-blue-marble.jpg"
);

async function main() {
  if (fs.existsSync(output) && fs.statSync(output).size > 100000) {
    console.log("[EARTH] NASA Blue Marble sudah tersedia.");
    return;
  }

  fs.mkdirSync(path.dirname(output), { recursive: true });

  console.log("[EARTH] Mengunduh tekstur NASA Blue Marble...");

  const response = await fetch(url, {
    headers: { "User-Agent": "GeoGlobeTales/1.0" },
  });

  if (!response.ok) {
    throw new Error(`Download NASA gagal: HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (
    buffer.length < 100000 ||
    buffer[0] !== 0xff ||
    buffer[1] !== 0xd8
  ) {
    throw new Error("File tekstur bukan JPEG yang valid.");
  }

  fs.writeFileSync(output, buffer);

  console.log(
    `[EARTH] Tekstur berhasil disimpan: ${(buffer.length / 1048576).toFixed(2)} MB`
  );
}

main().catch((error) => {
  console.error("[EARTH ERROR]", error.message);
  process.exit(1);
});
