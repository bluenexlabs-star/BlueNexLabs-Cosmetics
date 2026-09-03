/**
 * Compare BlueNex catalog: original Squarespace shop vs seed-data.json vs local PNGs.
 *
 * Usage: node scripts/audit-catalog.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(".");
const SEED_PATH = path.join(ROOT, "prisma/seed-data.json");
const PRODUCTS_DIR = path.join(ROOT, "public/images/products");
const ORIGINAL_SHOP = "https://www.bluenexlabs.com/shop-peptides";

async function fetchOriginalSlugs() {
  const res = await fetch(ORIGINAL_SHOP);
  if (!res.ok) throw new Error(`Failed to fetch ${ORIGINAL_SHOP}: ${res.status}`);
  const html = await res.text();
  const slugs = [
    ...new Set(
      [...html.matchAll(/\/shop-peptides\/p\/([a-z0-9-]+)/gi)].map((m) => m[1]),
    ),
  ].sort();
  return slugs;
}

function seedSlugs() {
  const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  return seed.products.map((p) => p.slug).sort();
}

function pngSlugs() {
  return fs
    .readdirSync(PRODUCTS_DIR)
    .filter((f) => f.endsWith(".png") && !f.startsWith("_"))
    .map((f) => f.replace(/\.png$/, ""))
    .sort();
}

function diff(label, a, b) {
  const setB = new Set(b);
  const missing = a.filter((x) => !setB.has(x));
  const extra = b.filter((x) => !new Set(a).has(x));
  if (missing.length) console.log(`\n${label} missing (${missing.length}):`);
  missing.forEach((s) => console.log(`  - ${s}`));
  if (extra.length) console.log(`\n${label} extra (${extra.length}):`);
  extra.forEach((s) => console.log(`  + ${s}`));
  return { missing, extra };
}

async function main() {
  const [original, seed, pngs] = await Promise.all([
    fetchOriginalSlugs(),
    Promise.resolve(seedSlugs()),
    Promise.resolve(pngSlugs()),
  ]);

  console.log(`Original shop: ${original.length} products`);
  console.log(`seed-data.json: ${seed.length} products`);
  console.log(`product PNGs:   ${pngs.length} files`);

  diff("In original but not seed", original, seed);
  diff("In seed but not original", seed, original);
  diff("In seed but no PNG", seed, pngs);
  diff("PNG but not in seed", pngs, seed);

  const ok =
    original.length === seed.length &&
    original.every((s) => seed.includes(s)) &&
    seed.every((s) => pngs.includes(s));

  console.log(ok ? "\nCatalog audit: PASS" : "\nCatalog audit: ACTION NEEDED");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
