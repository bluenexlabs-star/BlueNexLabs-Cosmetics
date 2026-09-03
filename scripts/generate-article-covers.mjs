/**
 * Generate article cover vial photos from the shared BlueNex label template.
 * Reuses template, TEXT_ZONE, and typography from generate-product-vials.mjs.
 *
 * Usage:
 *   node scripts/generate-article-covers.mjs
 *   node scripts/generate-article-covers.mjs --backup-only
 */
import fs from "node:fs";
import path from "node:path";
import {
  parseProductLabel,
  renderProductVial,
  verifyLayout,
} from "./generate-product-vials.mjs";

const ROOT = path.resolve(".");
const SEED = path.join(ROOT, "prisma/seed-data.json");
const ARTICLES_DIR = path.join(ROOT, "public/images/articles");
const ORIGINALS_DIR = path.join(ARTICLES_DIR, "_originals");

/** Article slug → related product slug (seed-data.json). Optional label overrides. */
const ARTICLE_COVER_MAP = [
  {
    slug: "melanotan-research-overview",
    productSlug: "melanotan-i",
    labelOverride: { name: "Melanotan I", variants: [] },
  },
  {
    slug: "why-does-tesamorelin-gel",
    productSlug: "tesamorelin-10mg-canada",
  },
  {
    slug: "glp-1-peptide-research-2026",
    productSlug: "retatrutide-30mg",
    labelOverride: { name: "Retatrutide", variants: [] },
  },
  {
    slug: "ghk-cu-peptide-in-canada-what-it-is-how-it-works-and-why-it-s-studied-for-skin-a",
    productSlug: "ghk-cu-50mg",
  },
  {
    slug: "bacteriostatic-water-canada",
    productSlug: "bac-water-3ml",
  },
];

function backupArticlePngs(slugs) {
  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
  const backedUp = [];
  const skipped = [];

  for (const slug of slugs) {
    const src = path.join(ARTICLES_DIR, `${slug}.png`);
    if (!fs.existsSync(src)) continue;
    const dest = path.join(ORIGINALS_DIR, `${slug}.png`);
    if (fs.existsSync(dest)) {
      skipped.push(slug);
      continue;
    }
    fs.copyFileSync(src, dest);
    backedUp.push(slug);
  }

  return { backedUp, skipped };
}

function resolveLabelProduct(entry, productsBySlug) {
  const base = productsBySlug.get(entry.productSlug);
  if (!base && !entry.labelOverride) {
    throw new Error(`Missing product slug: ${entry.productSlug}`);
  }
  const merged = {
    ...(base || {}),
    ...(entry.labelOverride || {}),
    slug: entry.slug,
  };
  if (entry.labelOverride?.name) {
    merged.name = entry.labelOverride.name;
  }
  if (entry.labelOverride?.variants) {
    merged.variants = entry.labelOverride.variants;
  }
  return merged;
}

async function main() {
  const backupOnly = process.argv.includes("--backup-only");
  const slugs = ARTICLE_COVER_MAP.map((e) => e.slug);

  const { backedUp, skipped } = backupArticlePngs(slugs);
  console.log(`Backed up ${backedUp.length} article PNG(s) to _originals/`);
  if (skipped.length) {
    console.log(
      `Skipped ${skipped.length} existing backup(s): ${skipped.join(", ")}`,
    );
  }

  if (backupOnly) return;

  const data = JSON.parse(fs.readFileSync(SEED, "utf8"));
  const productsBySlug = new Map(data.products.map((p) => [p.slug, p]));
  const results = [];

  for (const entry of ARTICLE_COVER_MAP) {
    const product = resolveLabelProduct(entry, productsBySlug);
    const { nameLines, dose } = parseProductLabel(product);
    const rendered = await renderProductVial(product);
    const check = verifyLayout(rendered.layout, rendered.textZone);

    if (!check.ok) {
      console.error(
        `  FAIL ${entry.slug}: text y=${check.textTop}–${check.textBottom} outside blank band`,
      );
      process.exit(1);
    }

    const outPath = path.join(ARTICLES_DIR, `${entry.slug}.png`);
    fs.writeFileSync(outPath, rendered.buffer);

    results.push({
      slug: entry.slug,
      productSlug: entry.productSlug,
      nameLines,
      dose,
      labelText: dose
        ? `${nameLines.join(" ")} ${dose}`
        : nameLines.join(" "),
      fontSize: rendered.layout.fontSize,
      out: outPath,
    });
  }

  const mapPath = path.join(ARTICLES_DIR, "_cover-generator-map.json");
  fs.writeFileSync(
    mapPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  );

  console.log(`Generated ${results.length} article cover(s)`);
  for (const r of results) {
    console.log(
      `  ${r.slug}: ${r.nameLines.join(" / ")}${r.dose ? ` | ${r.dose}` : ""} @ ${r.fontSize}px`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
