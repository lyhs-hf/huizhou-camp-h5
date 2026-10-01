import fs from "node:fs/promises";
import sharp from "sharp";
const manifest = JSON.parse(
  await fs.readFile(process.argv[2] ?? "docs/asset-sources.local.json", "utf8"),
);
const report = [];
for (const item of manifest) {
  const metadata = await sharp(item.path).metadata();
  const dest = "public/assets/" + item.dest + ".webp";
  const maxWidth =
    item.dest.startsWith("hero") || item.dest.startsWith("mountain")
      ? 860
      : 780;
  await sharp(item.path)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 84, alphaQuality: 90 })
    .toFile(dest);
  report.push({
    key: item.key,
    path: dest,
    width: metadata.width,
    height: metadata.height,
    alpha: metadata.hasAlpha,
    bytes: (await fs.stat(dest)).size,
  });
}
await fs.writeFile("docs/ASSET_SIZES.json", JSON.stringify(report, null, 2));
console.log(report);
