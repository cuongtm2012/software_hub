/**
 * Generate branded OG image 1200×630 for social / AI previews.
 * Usage: npx tsx scripts/generate-og-image.ts
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

const WIDTH = 1200;
const HEIGHT = 630;
const OUT = path.resolve("client/public/og-default.png");

async function main() {
  const logoPath = path.resolve("client/public/software-hub-logo.png");

  const subtitleSvg = Buffer.from(`
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <text x="600" y="420" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" fill="#e2e8f0">
        Khóa học IT · Phần mềm miễn phí · Marketplace số
      </text>
      <text x="600" y="470" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#ffcc00">
        swhubco.com
      </text>
    </svg>
  `);

  const background = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 0, g: 52, b: 102, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const logo = await sharp(logoPath).resize(520, 200, { fit: "inside" }).png().toBuffer();

  await sharp(background)
    .composite([
      { input: logo, gravity: "north", top: 120, left: 0 },
      { input: subtitleSvg, top: 0, left: 0 },
    ])
    .png()
    .toFile(OUT);

  console.log("Wrote", OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
