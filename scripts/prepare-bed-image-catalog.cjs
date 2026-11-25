"use strict";
/* eslint @typescript-eslint/no-require-imports: off */

// Optimize only matched source pairs, then regenerate a deterministic image
// manifest and build-time catalogue. Incomplete batches remain unselectable.
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve("public/assets/bed-catalog-variants");
const indexFile = path.resolve("lib/generated-bed-image-index.json");
const manifestFile = path.join(root, "IMAGE-MANIFEST.csv");
const categories = [
  ["bunk-beds", "Bunk Beds", "bunk"],
  ["double-beds", "Double Beds", "double"],
  ["kids-beds", "Kids’ Beds", "kids"],
  ["king-beds", "King Beds", "king"],
  ["queen-beds", "Queen Beds", "queen"],
  ["triple-beds", "Triple Beds", "triple"],
];
const finishes = ["matte-black", "white", "graphite-grey", "antique-bronze", "deep-navy"];
const csv = (value) => `"${String(value).replaceAll('"', '""')}"`;

async function main() {
  const rows = [];
  const pairs = [];
  let optimized = 0;

  for (const [folder, categoryName, prefix] of categories) {
    const dir = path.join(root, folder);
    const files = fs.readdirSync(dir).filter((file) => file.endsWith(".png"));
    const pngSet = new Set(files);
    const stems = new Set(files.map((file) => file.replace(/-(frame|dressed)\.png$/, "")));
    for (const stem of stems) {
      const framePng = `${stem}-frame.png`;
      const dressedPng = `${stem}-dressed.png`;
      if (!pngSet.has(framePng) || !pngSet.has(dressedPng)) continue;
      for (const file of [framePng, dressedPng]) {
        const source = path.join(dir, file);
        const target = path.join(dir, file.slice(0, -4) + ".webp");
        if (!fs.existsSync(target)) {
          await sharp(source).webp({ quality: 88, effort: 6, smartSubsample: true }).toFile(target);
          const [src, out] = await Promise.all([sharp(source).metadata(), sharp(target).metadata()]);
          if (src.width !== out.width || src.height !== out.height) throw new Error(`Dimension mismatch: ${file}`);
          optimized++;
        }
      }
    }

    const webps = fs.readdirSync(dir).filter((file) => file.endsWith(".webp"));
    const webpSet = new Set(webps);
    const webpStems = new Set(webps.map((file) => file.replace(/-(frame|dressed)\.webp$/, "")));
    for (const stem of [...webpStems].sort()) {
      const frameName = `${stem}-frame.webp`;
      const dressedName = `${stem}-dressed.webp`;
      if (!webpSet.has(frameName) || !webpSet.has(dressedName)) continue;
      const match = stem.match(new RegExp(`^${prefix}-(design-\\d+)-(.+)-(${finishes.join("|")})$`));
      if (!match) throw new Error(`Unexpected catalog filename: ${folder}/${stem}`);
      const [, design, imageSize, finish] = match;
      const [frameMeta, dressedMeta] = await Promise.all([
        sharp(path.join(dir, frameName)).metadata(),
        sharp(path.join(dir, dressedName)).metadata(),
      ]);
      if (!frameMeta.width || frameMeta.width !== dressedMeta.width || frameMeta.height !== dressedMeta.height) {
        throw new Error(`Frame/dressed dimensions differ: ${folder}/${stem}`);
      }
      const base = `/assets/bed-catalog-variants/${folder}/${stem}`;
      const pair = {
        category: folder, categoryName, design, imageSize, finish,
        frame: `${base}-frame.webp`, dressed: `${base}-dressed.webp`,
        width: frameMeta.width, height: frameMeta.height,
      };
      pairs.push(pair);
      for (const [view, filename, meta] of [["frame", frameName, frameMeta], ["dressed", dressedName, dressedMeta]]) {
        rows.push([
          `${folder}/${filename}`, categoryName, design, imageSize, view, finish,
          "WebP", `${meta.width}x${meta.height}`, "OpenAI-generated concept; optimized from matched PNG", "Generated concept; commercial product match unverified", "Concept imagery; matched frame/dressed pair",
        ]);
      }
    }
  }

  // Keep historical root-level concept imagery documented, but out of the
  // category catalog because it has no audited category/size mapping.
  for (const file of fs.readdirSync(root).filter((name) => /\.(webp|png)$/.test(name)).sort()) {
    const meta = await sharp(path.join(root, file)).metadata();
    rows.push([file, "Legacy / Unassigned", "unassigned", "unassigned", /-frame\./.test(file) ? "frame" : "dressed", "unassigned", path.extname(file).slice(1).toUpperCase(), `${meta.width}x${meta.height}`, "Earlier generated concept", "Generated concept; commercial product match unverified", "Legacy concept; excluded from category catalog"]);
  }

  const manifestHeader = ["filename", "category", "design", "size", "view", "color", "format", "dimensions", "source", "license", "status"];
  fs.writeFileSync(manifestFile, [manifestHeader, ...rows].map((row) => row.map(csv).join(",")).join("\n") + "\n");
  fs.writeFileSync(indexFile, JSON.stringify({ generatedAtBuild: true, pairs }, null, 2) + "\n");
  console.log(`Catalog ready: ${pairs.length} matched pairs, ${optimized} new WebP images, ${rows.length} manifest records.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
