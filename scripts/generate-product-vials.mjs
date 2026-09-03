/**
 * Generate product vial photos from the shared BlueNex label template.
 *
 * Usage:
 *   node scripts/generate-product-vials.mjs --only klow-80mg,bpc-157-tb-500-5mg5mg
 *   node scripts/generate-product-vials.mjs --all
 *   node scripts/generate-product-vials.mjs --backup-only
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(".");
const SEED = path.join(ROOT, "prisma/seed-data.json");
const TEMPLATE = path.join(
  ROOT,
  "public/images/products/_template/vial-label-base.jpg",
);
const PRODUCTS_DIR = path.join(ROOT, "public/images/products");
const ORIGINALS_DIR = path.join(PRODUCTS_DIR, "_originals");

/**
 * Manually measured from vial-label-base.jpg (682×1024) by visual crop inspection.
 * Do NOT use row-dark scanning — cap/glass shadows at y~280–400 mimic ink.
 *
 * Layout on label:
 *   y~470–550  BlueNex lockup (molecule + name)
 *   y~560–650  tagline "Peptides you can trust"
 *   y~660–740  BLANK — product name + dose go here
 *   y~750+     disclaimer "For Research Purposes Only"
 */
const TEXT_ZONE = {
  left: 228,
  right: 454,
  top: 658,
  bottom: 735,
  centerX: 342,
  taglineBottom: 650,
  disclaimerTop: 745,
};

const FONT = "Arial, Helvetica, sans-serif";
const TEXT_COLOR = "#1a1a1a";
const LINE_HEIGHT = 1.15;

function measureTextZone() {
  return { ...TEXT_ZONE };
}

export function verifyLayout(layout, zone) {
  const lastLineY = layout.firstLineY + (layout.lines.length - 1) * layout.lineHeightPx;
  const textTop = layout.firstLineY - layout.fontSize * 0.55;
  const textBottom = lastLineY + layout.fontSize * 0.55;
  const ok =
    textTop >= zone.taglineBottom + 4 &&
    textBottom <= zone.disclaimerTop - 4;

  return {
    ok,
    textTop: Math.round(textTop),
    textBottom: Math.round(textBottom),
    taglineEnd: zone.taglineBottom,
    disclaimerStart: zone.disclaimerTop,
    firstLineY: Math.round(layout.firstLineY),
    lastLineY: Math.round(lastLineY),
  };
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function zoneMetrics(zone = TEXT_ZONE) {
  const width = zone.right - zone.left + 1;
  const height = zone.bottom - zone.top + 1;
  const centerX = zone.centerX;
  const centerY = zone.top + height / 2;
  return { width, height, centerX, centerY };
}

/** Numeric sort key for variant labels like "10mg", "20mg", "3mL". */
function parseDoseSortValue(label) {
  const match = label.trim().match(/(\d+(?:\.\d+)?)\s*(?:mg|ml|mcg|iu)?/i);
  if (!match) return Number.POSITIVE_INFINITY;
  return parseFloat(match[1]);
}

/** When a SKU has several vial sizes, use the smallest for the photo label. */
export function smallestVariantLabel(variants) {
  if (!variants?.length) return "";
  if (variants.length === 1) return variants[0].label.trim();

  return [...variants]
    .sort(
      (a, b) =>
        parseDoseSortValue(a.label) - parseDoseSortValue(b.label) ||
        a.label.localeCompare(b.label),
    )[0]
    .label.trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when a variant label is a real dose (10mg, 3mL), not a SKU fragment (157, 500). */
function looksLikeDoseLabel(label) {
  const text = label.trim();
  if (!text) return false;
  if (/^\d+\s*vial/i.test(text)) return false;
  if (/\d+\s*mg\s*\/\s*\d+\s*mg/i.test(text)) return true;
  return /\d+(?:\.\d+)?\s*(mg|ml|mcg|iu)\b/i.test(text);
}

function looksLikeDoseText(text) {
  return looksLikeDoseLabel(text) || /^\d+(?:,\d+)*(?:\.\d+)?\s*(mg|ml|mcg|iu)$/i.test(text.trim());
}

function stripMarketingSuffix(name) {
  return name
    .trim()
    .replace(/\s*-\s*Research Grade (?:Peptide|Compound)\s*$/i, "")
    .replace(/\s*-\s*Research Peptides\s*$/i, "")
    .replace(/\s*-\s*Research Compound\s*$/i, "")
    .replace(/\s+Peptide\s*$/i, "")
    .trim();
}

function smallestDoseFromList(fragment) {
  const parts = fragment.split(/\s*\/\s*/).filter(Boolean);
  if (parts.length <= 1) return formatDose(fragment);
  const sorted = [...parts].sort(
    (a, b) => parseDoseSortValue(a) - parseDoseSortValue(b),
  );
  return formatDose(sorted[0]);
}

function extractDoseFromName(name) {
  let work = stripMarketingSuffix(name);

  const parenEnd = work.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parenEnd && looksLikeDoseText(parenEnd[2])) {
    return formatDose(parenEnd[2]);
  }

  const multiMg = work.match(
    /(\d+(?:\.\d+)?\s*mg(?:\s*\/\s*\d+(?:\.\d+)?\s*mg)+)\s*$/i,
  );
  if (multiMg) return smallestDoseFromList(multiMg[1]);

  const combo = work.match(/(\d+\s*mg\s*\/\s*\d+\s*mg)\s*$/i);
  if (combo) return formatDose(combo[1]);

  const mcg = work.match(/([\d,]+(?:\.\d+)?\s*mcg)\s*$/i);
  if (mcg) return formatDose(mcg[1].replace(/,/g, ""));

  const single = work.match(/(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|iu))\s*$/i);
  if (single) return formatDose(single[1]);

  return "";
}

function cleanProductName(name, variants = []) {
  let cleaned = name.trim();

  const parenEnd = cleaned.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parenEnd) {
    if (looksLikeDoseText(parenEnd[2])) {
      cleaned = parenEnd[1].trim();
    } else {
      cleaned = cleaned.replace(/\s*\([^)]+\)\s*$/, "").trim();
    }
  }

  cleaned = stripMarketingSuffix(cleaned);

  cleaned = cleaned
    .replace(/\s+\d+(?:\.\d+)?\s*mg(?:\s*\/\s*\d+(?:\.\d+)?\s*mg)+\s*$/i, "")
    .trim();
  cleaned = cleaned.replace(/\s+\d+\s*mg\s*\/\s*\d+\s*mg\s*$/i, "").trim();
  cleaned = cleaned
    .replace(/\s+\d+(?:,\d+)*(?:\.\d+)?\s*(?:mg|ml|mcg|iu)\s*$/i, "")
    .trim();

  for (const variant of variants) {
    const label = variant.label?.trim();
    if (!label || !looksLikeDoseLabel(label)) continue;
    const pattern = escapeRegExp(label).replace(/\s+/g, "\\s*");
    cleaned = cleaned.replace(new RegExp(`\\s*${pattern}\\s*`, "gi"), " ").trim();
  }

  cleaned = cleaned.replace(/\s+/g, " ").trim();
  cleaned = cleaned.replace(/\s*-\s*$/g, "").trim();
  return cleaned;
}

function extractDoseFromSlug(slug) {
  if (!slug) return "";

  const comboTight = slug.match(/(\d+(?:\.\d+)?)mg(\d+(?:\.\d+)?)mg(?:$|-)/i);
  if (comboTight) {
    return formatDose(`${comboTight[1]}mg/${comboTight[2]}mg`);
  }

  const comboDash = slug.match(/-(\d+(?:\.\d+)?)mg-(\d+(?:\.\d+)?)mg(?:$|-)/i);
  if (comboDash) {
    return formatDose(`${comboDash[1]}mg/${comboDash[2]}mg`);
  }

  const single = slug.match(/-(\d+(?:\.\d+)?)(mg|ml|mcg)(?:$|-|[a-z])/i);
  if (single) {
    return formatDose(`${single[1]}${single[2]}`);
  }

  return "";
}

function doseVariants(variants = []) {
  return variants.filter((variant) => looksLikeDoseLabel(variant.label?.trim() ?? ""));
}

function resolveDose(product) {
  const variants = doseVariants(product.variants);

  if (variants.length > 1) {
    return formatDose(smallestVariantLabel(variants));
  }

  const slugDose = extractDoseFromSlug(product.slug);
  if (slugDose.includes("/")) {
    return slugDose;
  }

  const smallest = smallestVariantLabel(product.variants);
  if (looksLikeDoseLabel(smallest)) {
    return formatDose(smallest);
  }

  if (slugDose) {
    return slugDose;
  }

  return extractDoseFromName(product.name);
}

/** Split a product title into display name lines (max 3) and a dose line. */
export function parseProductLabel(product) {
  const dose = resolveDose(product);
  const name = cleanProductName(product.name, product.variants);
  return { nameLines: wrapName(name), dose };
}

function formatDose(raw) {
  if (!raw) return "";
  const normalized = raw.replace(/\s*\/\s*/g, "/").trim();
  if (!normalized) return "";
  if (normalized.includes("/")) {
    return `(${normalized.toUpperCase()})`;
  }
  return normalized
    .replace(/(\d+(?:,\d+)?(?:\.\d+)?)\s*(mg|ml|mcg|iu)\b/gi, "$1$2")
    .replace(/,/g, "")
    .toUpperCase();
}

function wrapName(name) {
  const upper = name.toUpperCase().trim();
  if (upper.includes(" / ")) {
    const parts = upper
      .split(/\s+\/\s+/)
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length > 0 && parts.length <= 3) return parts;
  }
  if (upper.length <= 18) return [upper];

  const tokens = upper.split(/(\s+|\+)/).filter((t) => t.trim());
  const lines = [];
  let current = "";

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    const candidate = current ? `${current}${token === "+" ? " +" : ` ${trimmed}`}` : trimmed;
    if (candidate.length <= 20) {
      current = candidate.replace(/\s+/g, " ").replace(/\s*\+\s*/g, " + ").trim();
      continue;
    }
    if (current) lines.push(current);
    current = trimmed;
    if (lines.length >= 2) break;
  }
  if (current) lines.push(current);

  if (lines.length > 3) return lines.slice(0, 3);
  return lines.length ? lines : [upper];
}

function estimateLineWidth(text, fontSize) {
  const avg = 0.56;
  return text.length * fontSize * avg;
}

function layoutText(nameLines, dose, zone = TEXT_ZONE) {
  const { width, height, centerY } = zoneMetrics(zone);
  const lines = [...nameLines];
  if (dose) lines.push(dose);

  const maxChars = Math.max(...lines.map((l) => l.length), 1);
  let fontSize = Math.min(32, Math.floor((width / (maxChars * 0.56)) * 0.95));
  fontSize = Math.max(14, fontSize);

  for (let attempt = 0; attempt < 12; attempt++) {
    const lineHeightPx = fontSize * LINE_HEIGHT;
    const blockHeight = (lines.length - 1) * lineHeightPx + fontSize;
    const widest = Math.max(...lines.map((l) => estimateLineWidth(l, fontSize)));
    if (blockHeight <= height * 0.9 && widest <= width * 0.96) break;
    fontSize -= 2;
    if (fontSize < 12) break;
  }

  const lineHeightPx = fontSize * LINE_HEIGHT;
  const blockHeight = (lines.length - 1) * lineHeightPx + fontSize;
  const firstLineY = centerY - blockHeight / 2 + fontSize / 2;

  return { lines, fontSize, lineHeightPx, firstLineY, zone };
}

function buildLabelSvg(nameLines, dose, zone = TEXT_ZONE) {
  const { centerX } = zoneMetrics(zone);
  const { lines, fontSize, lineHeightPx, firstLineY } = layoutText(
    nameLines,
    dose,
    zone,
  );

  const textNodes = lines
    .map((line, index) => {
      const y = firstLineY + index * lineHeightPx;
      const weight = index < nameLines.length ? 700 : 600;
      return `<text x="${centerX}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-size="${fontSize}" font-weight="${weight}" fill="${TEXT_COLOR}" letter-spacing="0.02em">${escapeXml(line)}</text>`;
    })
    .join("\n  ");

  return Buffer.from(
    `<svg width="682" height="1024" viewBox="0 0 682 1024" xmlns="http://www.w3.org/2000/svg">
  ${textNodes}
</svg>`,
  );
}

export async function renderProductVial(product, templatePath = TEMPLATE) {
  const zone = measureTextZone();
  const { nameLines, dose } = parseProductLabel(product);
  const overlaySvg = buildLabelSvg(nameLines, dose, zone);
  const layout = layoutText(nameLines, dose, zone);

  const meta = await sharp(templatePath).metadata();
  const overlayPng = await sharp(overlaySvg)
    .resize(meta.width, meta.height)
    .png()
    .toBuffer();

  const png = await sharp(templatePath)
    .composite([{ input: overlayPng, top: 0, left: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return {
    buffer: png,
    nameLines,
    dose,
    layout,
    textZone: zone,
  };
}

function backupCurrentPngs() {
  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
  const backedUp = [];
  const skipped = [];

  for (const entry of fs.readdirSync(PRODUCTS_DIR)) {
    if (!entry.endsWith(".png")) continue;
    const src = path.join(PRODUCTS_DIR, entry);
    const dest = path.join(ORIGINALS_DIR, entry);
    if (fs.existsSync(dest)) {
      skipped.push(entry);
      continue;
    }
    fs.copyFileSync(src, dest);
    backedUp.push(entry);
  }

  return { backedUp, skipped };
}

function parseArgs(argv) {
  const onlyIdx = argv.indexOf("--only");
  const only =
    onlyIdx >= 0 ? argv[onlyIdx + 1].split(",").map((s) => s.trim()) : null;
  const all = argv.includes("--all");
  const backupOnly = argv.includes("--backup-only");
  return { only, all, backupOnly };
}

async function main() {
  const { only, all, backupOnly } = parseArgs(process.argv);

  if (!fs.existsSync(TEMPLATE)) {
    console.error("Missing template:", TEMPLATE);
    process.exit(1);
  }

  const { backedUp, skipped } = backupCurrentPngs();
  console.log(`Backed up ${backedUp.length} PNG(s) to _originals/`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} existing backup(s) (not overwritten)`);
  }

  if (backupOnly) return;

  if (!only && !all) {
    console.error(
      "Pass --only <slug>[,<slug>...] for proof images, or --all for the full catalog.",
    );
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(SEED, "utf8"));
  const results = [];

  for (const product of data.products) {
    if (only && !only.includes(product.slug)) continue;

    const outPath = path.join(PRODUCTS_DIR, `${product.slug}.png`);
    const rendered = await renderProductVial(product);
    const check = verifyLayout(rendered.layout, rendered.textZone);
    if (!check.ok) {
      console.error(
        `  FAIL ${product.slug}: text y=${check.textTop}–${check.textBottom} outside blank band (tagline end y${check.taglineEnd}, disclaimer start y${check.disclaimerStart}, zone y${rendered.textZone.top}–${rendered.textZone.bottom})`,
      );
      process.exit(1);
    }

    fs.writeFileSync(outPath, rendered.buffer);

    results.push({
      slug: product.slug,
      name: product.name,
      nameLines: rendered.nameLines,
      dose: rendered.dose,
      fontSize: rendered.layout.fontSize,
      lines: rendered.layout.lines,
      textZone: rendered.textZone,
      out: outPath,
    });
  }

  const mapPath = path.join(PRODUCTS_DIR, "_vial-generator-map.json");
  fs.writeFileSync(
    mapPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  );

  console.log(`Generated ${results.length} product image(s)`);
  if (results[0]?.textZone) {
    const z = results[0].textZone;
    console.log(
      `Text zone: x ${z.left}–${z.right}, y ${z.top}–${z.bottom}, centerX ${z.centerX} (tagline end y${z.taglineBottom}, disclaimer start y${z.disclaimerTop})`,
    );
  }
  for (const r of results) {
    console.log(
      `  ${r.slug}: ${r.nameLines.join(" / ")}${r.dose ? ` | ${r.dose}` : ""} @ ${r.fontSize}px`,
    );
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
