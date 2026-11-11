import sharp from "sharp";

const src = "public/logo.png";

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
let minX = w;
let minY = h;
let maxX = 0;
let maxY = 0;

for (let y = 0; y < h; y += 1) {
  for (let x = 0; x < w; x += 1) {
    if (data[(y * w + x) * 4 + 3] > 8) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
}

const bw = maxX - minX + 1;
const bh = maxY - minY + 1;
// Between tight crop and old padded logo
const left = minX;
const top = minY;
const width = bw;
const height = bh;

// Tight crop of the mark only, then scale smaller inside a full-size white disc
const cropped = await sharp(src)
  .extract({ left, top, width, height })
  .png()
  .toBuffer();

const MARK_RATIO = 0.62; // logo size vs circle diameter

async function make(size, out) {
  const circle = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#ffffff"/>
    </svg>`
  );
  const markSize = Math.max(1, Math.round(size * MARK_RATIO));
  const mark = await sharp(cropped)
    .resize(markSize, markSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  await sharp(circle)
    .composite([{ input: mark, gravity: "centre", blend: "over" }])
    .png()
    .toFile(out);
}

await make(16, "public/favicon-16.png");
await make(32, "public/favicon-32.png");
await make(180, "public/apple-touch-icon.png");
await make(192, "public/icon-192.png");
await make(512, "public/icon-512.png");
await make(32, "src/app/icon.png");
await make(180, "src/app/apple-icon.png");

console.log("favicons updated");
