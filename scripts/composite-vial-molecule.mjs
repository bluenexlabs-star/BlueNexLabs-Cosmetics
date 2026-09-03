import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(".");
const SEED = path.join(ROOT, "prisma/seed-data.json");
const MARK_SVG = path.join(ROOT, "public/images/bluenex-mark.svg");
const PRODUCTS_DIR = path.join(ROOT, "public/images/products");
const ORIGINALS_DIR = path.join(PRODUCTS_DIR, "_originals");

const SKIP_CUBE = new Set(["hospira-bacteriostatic-water-30ml"]);

const ORIGINAL_BY_SLUG = {
  "melanotan-i": "Melanotan+I.jpg",
  "adamax-10mg": "Adamax.jpg",
  "hospira-bacteriostatic-water-30ml": "Hospire_BAC_Water_30ml.jpg",
  "retatrutide-30mg": "Retatrutide-10mg-COA+Certified-Canada+(PEPTIDES).png",
  "tirzepatide-10mg": "Tirzepatide-10mg-COA+Certified-Canada+(PEPTIDES).png",
  "cagrilintide-5mg": "Cagrilintide-5mg-COA+Certified-Canada+(PEPTIDES).png",
  "semaglutide-20mg": "Semaglutide-20mg-COA+Certified-Canada+(PEPTIDES).png",
  "klow-80mg": "KLOW-80mg-COA+Certified-Canada+(PEPTIDES).png",
  "glow70": "GLOW-70mg-COA+Certified-Canada+(PEPTIDES).png",
  "mots-c-10mg-canada": "MOTSC_10mg_COA+Certified_Canada.png",
  "nad-500mg-canada": "NAD+_500mg_COA+Certified_Canada+(PEPTIDES).png",
  "ghk-cu-50mg": "GHK-Cu-50mg-COA+Certified-Canada+(PEPTIDES).png",
  "cjc-1259-no-dac-ipamorelin-5mg-5mg":
    "CJC1295Iparmorelin_5mg_5mg_COA+Certified_Canada+(PEPTIDES).png",
  "bpc-157-tb-500-5mg5mg": "BCP157_TB500_10mg_COA+Certified-Canada+(PEPTIDES).png",
  "bpc-157-tb-500-10mg10mg": "BCP_TB500_COA+Certified_Canada+(PEPTIDES).png",
  "bcp-157-10mg": "BCP157_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "ss-31-50mg": "SS-31_50mg_COA+Certified_Canada+(PEPTIDES).png",
  "tesamorelin-10mg-canada": "Tesamorelin_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "sermorelin-10mg": "sermorelin_10mg_COACertified_Canada+(PEPTIDES).png",
  "ipamorelin-10mg": "ipamorelin_10mg_COACertified_Canada+(PEPTIDES).png",
  "semax-10mg": "semax_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "selank-10mg": "selank_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "tb-500-10mg": "TB500_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "kpv-10mg": "KPV_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "delta-sleep-inducing-peptide-10mg": "DSIP_10mg_COACertified_Canada+(PEPTIDES).png",
  "kisspeptin-10mg-canada-peptide": "kisspeptin_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "glutathione-1500mg": "glutathione_600mg_COA+Certified_Canada+(PEPTIDES).png",
  melanotan: "MelanotanII_10mg_COACertified_Canada+(PEPTIDES).png",
  "b12-vitamin-canada": "B-12_10ml_Vitamin_B12_Canada.jpg",
  "l-carnitine-600mg": "L-Carnitine_600mg_Canada+(PEPTIDES).png",
  "epithalon-10mg-canada": "Epithalon_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "oxytocin-5mg": "oxytocin_5mg_COACertified_Canada+(PEPTIDES).png",
  "pt-141": "PT-141_10mg_COACertified_Canada+(PEPTIDES).png",
  "ll37-5mg": "LL-37_5mg_COA+Certified_Canada+(PEPTIDES).png",
  "aicar-50mg": "AICAR_50mg_COA+Certified_Canada+(PEPTIDES).png",
  "snap-8-10mg": "SNAP8_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "pinealon-10mg": "pinealon_10mg_COA+Certified_Canada+(PEPTIDES).png",
  "bac-water-3ml": "BAC+Water_3ml_Canada.jpg",
};

function classify(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const isBlue = b > 80 && b > r + 20 && b > g + 8 && sat > 0.22 && r < 190 && max < 230;
  const isGreyFacet =
    r > 145 &&
    g > 155 &&
    b > 170 &&
    sat < 0.22 &&
    sat > 0.03 &&
    b >= r - 5 &&
    b >= g &&
    max < 225 &&
    min > 130;
  return { isBlue, isGreyFacet, hit: isBlue || isGreyFacet };
}

function isCubeGrow(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (min > 236 && sat < 0.04) return false;
  if (min < 70 && sat < 0.2) return false;
  const core = classify(r, g, b);
  if (core.hit) return true;
  const coolGrey =
    min > 150 &&
    max < 240 &&
    sat < 0.2 &&
    b >= r - 4 &&
    b >= g - 2 &&
    (b > r + 2 || sat > 0.025);
  const midBlue = b > 70 && b > r + 10 && sat > 0.12 && max < 235;
  return coolGrey || midBlue;
}

function isCubeRemnant(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (classify(r, g, b).hit || isCubeGrow(r, g, b)) return true;
  if (b > 55 && b > r + 8 && sat > 0.1 && min < 220 && max < 235) return true;
  return b > 40 && b > r + 15 && b > g + 8 && sat > 0.18 && max < 210 && min < 170;
}

function findCube(data, w, h) {
  const mask = new Uint8Array(w * h);
  const y0 = Math.floor(h * 0.12);
  const y1 = Math.floor(h * 0.62);
  const x0 = Math.floor(w * 0.22);
  const x1 = Math.floor(w * 0.78);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      const c = classify(data[i], data[i + 1], data[i + 2]);
      if (c.hit) mask[y * w + x] = c.isGreyFacet ? 2 : 1;
    }
  }

  const seen = new Uint8Array(w * h);
  const comps = [];
  const stack = [];
  const neigh = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const idx = y * w + x;
      if (!mask[idx] || seen[idx]) continue;
      stack.push(idx);
      seen[idx] = 1;
      let minX = x,
        minY = y,
        maxX = x,
        maxY = y,
        count = 0,
        grey = 0,
        blue = 0;
      while (stack.length) {
        const p = stack.pop();
        const px = p % w;
        const py = (p - px) / w;
        count++;
        if (mask[p] === 2) grey++;
        else blue++;
        if (px < minX) minX = px;
        if (py < minY) minY = py;
        if (px > maxX) maxX = px;
        if (py > maxY) maxY = py;
        for (const [dx, dy] of neigh) {
          const nx = px + dx;
          const ny = py + dy;
          if (nx < x0 || nx >= x1 || ny < y0 || ny >= y1) continue;
          const nidx = ny * w + nx;
          if (mask[nidx] && !seen[nidx]) {
            seen[nidx] = 1;
            stack.push(nidx);
          }
        }
      }
      const bw = maxX - minX + 1;
      const bh = maxY - minY + 1;
      comps.push({
        minX,
        minY,
        maxX,
        maxY,
        bw,
        bh,
        count,
        grey,
        blue,
        aspect: bw / bh,
      });
    }
  }

  const cubeish = comps.filter((c) => {
    const aspectOk = c.aspect >= 1.05 && c.aspect <= 1.35;
    const sizeOk = c.bw >= 18 && c.bh >= 18 && c.bw < w * 0.35 && c.bh < h * 0.18;
    const mixOk = c.blue > 80 && c.count > 80 && c.count < 12000;
    return aspectOk && sizeOk && mixOk;
  });
  cubeish.sort((a, b) => a.minY - b.minY || b.count - a.count);
  return { cube: cubeish[0] || null, mask };
}

function growCube(data, w, h, cube) {
  const padX = Math.round(cube.bw * 0.75);
  const padYTop = Math.round(cube.bh * 0.7);
  const padYBot = Math.round(cube.bh * 0.45);
  const x0 = Math.max(0, cube.minX - padX);
  const x1 = Math.min(w - 1, cube.maxX + padX);
  const y0 = Math.max(0, cube.minY - padYTop);
  const y1 = Math.min(h - 1, cube.maxY + padYBot);
  const textFloor = cube.maxY + Math.max(8, Math.round(cube.bh * 0.28));

  let minX = cube.minX;
  let minY = cube.minY;
  let maxX = cube.maxX;
  let maxY = cube.maxY;
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * w + x) * 4;
      if (!isCubeGrow(data[i], data[i + 1], data[i + 2])) continue;
      if (y > textFloor) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    bw: maxX - minX + 1,
    bh: maxY - minY + 1,
  };
}

function isLabelTone(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return min > 188 && sat < 0.14 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20;
}

function isWordmarkPixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  const isDark = min < 90 && sat < 0.4;
  const isBlueText = b > 90 && b > r + 20 && sat > 0.3 && r < 170 && min < 160;
  return isDark || isBlueText;
}

function medianColor(samples) {
  if (!samples.length) return [244, 244, 246];
  const channel = (idx) => {
    const vals = samples.map((s) => s[idx]).sort((a, b) => a - b);
    return vals[Math.floor(vals.length / 2)];
  };
  return [channel(0), channel(1), channel(2)];
}

function findWordmark(data, w, h, cube) {
  const yStart = cube ? cube.maxY + 1 : Math.floor(h * 0.42);
  const yEnd = Math.min(h - 1, yStart + Math.floor(h * 0.2));
  const x0 = Math.floor(w * 0.22);
  const x1 = Math.floor(w * 0.78);

  for (let y = yStart; y < yEnd; y++) {
    let hits = 0;
    let blue = 0;
    let minX = w;
    let maxX = 0;
    for (let x = x0; x < x1; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (!isWordmarkPixel(r, g, b)) continue;
      hits++;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const sat = max === 0 ? 0 : (max - min) / max;
      if (b > 90 && b > r + 20 && sat > 0.3) blue++;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
    if (hits < 16 || (blue < 3 && hits < 26)) continue;

    let top = y;
    let bottom = y;
    let wmMinX = minX;
    let wmMaxX = maxX;
    const rowH = Math.max(10, Math.round(h * 0.045));
    for (let yy = Math.max(0, y - 2); yy < Math.min(h - 1, y + rowH); yy++) {
      let rowHits = 0;
      for (let x = Math.floor(w * 0.18); x < Math.floor(w * 0.82); x++) {
        const i = (yy * w + x) * 4;
        if (!isWordmarkPixel(data[i], data[i + 1], data[i + 2])) continue;
        rowHits++;
        if (x < wmMinX) wmMinX = x;
        if (x > wmMaxX) wmMaxX = x;
      }
      if (rowHits < 8) {
        if (yy > y + 3) break;
        continue;
      }
      if (yy < top) top = yy;
      bottom = yy;
    }
    return {
      top,
      bottom,
      minX: wmMinX,
      maxX: wmMaxX,
      width: wmMaxX - wmMinX + 1,
    };
  }
  return null;
}

function findLabelBand(data, w, h, cube, wordmark) {
  const midY = cube
    ? Math.round((cube.minY + cube.maxY) / 2)
    : wordmark
      ? Math.max(8, wordmark.top - 28)
      : Math.floor(h * 0.42);

  const runs = [];
  let runStart = -1;
  for (let x = 0; x <= w; x++) {
    const ok =
      x < w &&
      isLabelTone(data[(midY * w + x) * 4], data[(midY * w + x) * 4 + 1], data[(midY * w + x) * 4 + 2]);
    if (ok) {
      if (runStart < 0) runStart = x;
    } else if (runStart >= 0) {
      runs.push({ x0: runStart, x1: x - 1 });
      runStart = -1;
    }
  }
  const center = w / 2;
  runs.sort((a, b) => {
    const aMid = Math.abs((a.x0 + a.x1) / 2 - center);
    const bMid = Math.abs((b.x0 + b.x1) / 2 - center);
    const aW = a.x1 - a.x0;
    const bW = b.x1 - b.x0;
    return bW - aW || aMid - bMid;
  });
  const best = runs[0] || {
    x0: Math.floor(w * 0.32),
    x1: Math.floor(w * 0.68),
  };

  let top = cube ? cube.minY : midY;
  for (let y = top; y > Math.floor(h * 0.06); y--) {
    let white = 0;
    for (let x = best.x0; x <= best.x1; x++) {
      const i = (y * w + x) * 4;
      if (
        isLabelTone(data[i], data[i + 1], data[i + 2]) ||
        classify(data[i], data[i + 1], data[i + 2]).hit
      ) {
        white++;
      }
    }
    if (white < (best.x1 - best.x0 + 1) * 0.42) break;
    top = y;
  }

  return {
    left: best.x0,
    right: best.x1,
    top,
    width: best.x1 - best.x0 + 1,
  };
}

function sampleLabelFill(data, w, h, cube, wordmarkY) {
  const samples = [];
  const cy = Math.round((cube.minY + cube.maxY) / 2);
  const zones = [
    [cube.minX - 22, cy],
    [cube.maxX + 22, cy],
    [Math.round((cube.minX + cube.maxX) / 2), cube.minY - 16],
    [cube.minX - 14, cube.maxY + 8],
    [cube.maxX + 14, cube.maxY + 8],
  ];
  for (const [zx, zy] of zones) {
    for (let dy = -10; dy <= 10; dy++) {
      for (let dx = -8; dx <= 8; dx++) {
        const x = zx + dx;
        const y = zy + dy;
        if (x < 0 || y < 0 || x >= w || y >= h) continue;
        if (wordmarkY != null && y >= wordmarkY - 1) continue;
        const i = (y * w + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        if (r > 228 && g > 228 && b > 228 && Math.abs(r - g) < 12 && Math.abs(g - b) < 12) {
          samples.push([r, g, b]);
        }
      }
    }
  }
  if (!samples.length) return [250, 250, 250];
  samples.sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  return samples[Math.floor(samples.length * 0.72)];
}

function isCubeInk(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (min > 234 && sat < 0.06) return false;
  if (classify(r, g, b).hit) return true;
  if (min > 165 && max < 232 && sat < 0.14) return true;
  if (b > 70 && b > r + 20 && sat > 0.2 && r < 160 && max < 230) return true;
  return false;
}

function isGreyCubeFacet(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (min > 140 && max < 235 && sat < 0.18 && b >= r - 6 && b >= g - 4) return true;
  if (min > 168 && max < 242 && Math.abs(r - g) < 22 && b >= g - 2 && sat < 0.14) return true;
  return false;
}

function isCubeCoverPixel(r, g, b) {
  return isCubeRemnant(r, g, b) || isGreyCubeFacet(r, g, b);
}

function expandCubePixels(data, w, h, core, wordmarkY) {
  const x0 = Math.max(0, core.minX - 90);
  const x1 = Math.min(w - 1, core.maxX + 90);
  const y0 = Math.max(0, core.minY - 50);
  const y1 = Math.min(
    h - 1,
    wordmarkY != null ? wordmarkY - 3 : core.maxY + 50,
  );
  const seen = new Uint8Array(w * h);
  const stack = [];
  const neigh = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];
  for (let y = core.minY; y <= core.maxY; y++) {
    for (let x = core.minX; x <= core.maxX; x++) {
      const i = (y * w + x) * 4;
      if (!isCubeCoverPixel(data[i], data[i + 1], data[i + 2])) continue;
      const idx = y * w + x;
      if (seen[idx]) continue;
      seen[idx] = 1;
      stack.push(idx);
    }
  }
  let minX = core.minX;
  let minY = core.minY;
  let maxX = core.maxX;
  let maxY = core.maxY;
  while (stack.length) {
    const p = stack.pop();
    const px = p % w;
    const py = (p - px) / w;
    if (px < minX) minX = px;
    if (py < minY) minY = py;
    if (px > maxX) maxX = px;
    if (py > maxY) maxY = py;
    for (const [dx, dy] of neigh) {
      const nx = px + dx;
      const ny = py + dy;
      if (nx < x0 || nx > x1 || ny < y0 || ny > y1) continue;
      const nidx = ny * w + nx;
      if (seen[nidx]) continue;
      const i = nidx * 4;
      if (!isCubeCoverPixel(data[i], data[i + 1], data[i + 2])) continue;
      seen[nidx] = 1;
      stack.push(nidx);
    }
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    bw: maxX - minX + 1,
    bh: maxY - minY + 1,
    core,
  };
}

function isPaperPixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return min > 175 && sat < 0.1 && Math.abs(r - g) < 16 && Math.abs(g - b) < 16;
}

/** Median paper color from the thin ring immediately around the cube — not a bright #fff. */
function samplePaperAroundCube(data, w, h, cube, wordmarkY) {
  const samples = [];
  const ring = 6;
  const x0 = Math.max(0, cube.minX - ring);
  const x1 = Math.min(w - 1, cube.maxX + ring);
  const y0 = Math.max(0, cube.minY - ring);
  const y1 = Math.min(h - 1, wordmarkY != null ? wordmarkY - 3 : cube.maxY + ring);
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const inCube =
        x >= cube.minX && x <= cube.maxX && y >= cube.minY && y <= cube.maxY;
      if (inCube) continue;
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isCubeInk(r, g, b)) continue;
      if (!isPaperPixel(r, g, b)) continue;
      samples.push([r, g, b]);
    }
  }
  if (!samples.length) return [239, 239, 239];
  return medianColor(samples);
}

function neighborPaper(data, w, h, x, y, cube, paper) {
  const tries = [
    [cube.minX - 2, y],
    [cube.maxX + 2, y],
    [cube.minX - 3, y],
    [cube.maxX + 3, y],
    [x, cube.minY - 2],
    [x, cube.maxY + 2],
  ];
  for (const [sx, sy] of tries) {
    if (sx < 0 || sy < 0 || sx >= w || sy >= h) continue;
    const i = (sy * w + sx) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isCubeInk(r, g, b) || !isPaperPixel(r, g, b)) continue;
    const bright = (r + g + b) / 3 - (paper[0] + paper[1] + paper[2]) / 3;
    if (bright > 4) continue;
    return [
      Math.round(paper[0] * 0.7 + r * 0.3),
      Math.round(paper[1] * 0.7 + g * 0.3),
      Math.round(paper[2] * 0.7 + b * 0.3),
    ];
  }
  return paper;
}

/** Tight cube cover only — paper-matched, no oval flood. */
function coverCube(data, w, h, cube, wordmarkY) {
  const pad = 3;
  const x0 = Math.max(0, cube.minX - pad);
  const x1 = Math.min(w - 1, cube.maxX + pad);
  const y0 = Math.max(0, cube.minY - pad);
  const y1 = Math.min(
    h - 1,
    wordmarkY != null ? Math.min(wordmarkY - 2, cube.maxY + pad) : cube.maxY + pad,
  );
  const paper = samplePaperAroundCube(data, w, h, cube, wordmarkY);
  const bw = x1 - x0 + 1;
  const bh = y1 - y0 + 1;
  const mask = new Uint8Array(bw * bh);

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (wordmarkY != null && y >= wordmarkY - 1) continue;
      const i = (y * w + x) * 4;
      if (!isCubeCoverPixel(data[i], data[i + 1], data[i + 2])) continue;
      mask[(y - y0) * bw + (x - x0)] = 1;
    }
  }

  const dilate = 2;
  const grown = new Uint8Array(mask);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      if (!mask[y * bw + x]) continue;
      for (let dy = -dilate; dy <= dilate; dy++) {
        for (let dx = -dilate; dx <= dilate; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= bw || ny >= bh) continue;
          grown[ny * bw + nx] = 1;
        }
      }
    }
  }

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!grown[(y - y0) * bw + (x - x0)]) continue;
      if (wordmarkY != null && y >= wordmarkY - 1) continue;
      const i = (y * w + x) * 4;
      const dest = neighborPaper(data, w, h, x, y, cube, paper);
      data[i] = dest[0];
      data[i + 1] = dest[1];
      data[i + 2] = dest[2];
      data[i + 3] = 255;
    }
  }
  return paper;
}

function resolveOriginal(slug) {
  const mapped = ORIGINAL_BY_SLUG[slug];
  if (mapped) {
    const p = path.join(ORIGINALS_DIR, mapped);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function tightMarkPng() {
  const svg = fs.readFileSync(MARK_SVG);
  const rendered = await sharp(svg, { density: 512 })
    .resize(900, 900, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp(rendered).trim({ threshold: 8 }).png().toBuffer();
}

const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;
const RUN_ALL = process.argv.includes("--all");
if (!ONLY && !RUN_ALL) {
  console.error(
    "Pass --only <slug> for a proof, or --all to apply the approved KLOW method to the catalog.",
  );
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(SEED, "utf8"));
const markPng = await tightMarkPng();
const markMeta = await sharp(markPng).metadata();
const markAspect = (markMeta.width || 1) / (markMeta.height || 1);

const updated = [];
const skipped = [];

for (const product of data.products) {
  if (ONLY && product.slug !== ONLY) continue;
  const srcPath = resolveOriginal(product.slug);
  const outName = `${product.slug}.png`;
  const outPath = path.join(PRODUCTS_DIR, outName);
  const localUrl = `/images/products/${outName}`;

  if (!srcPath) {
    skipped.push({ slug: product.slug, reason: "missing original backup" });
    continue;
  }

  if (SKIP_CUBE.has(product.slug)) {
    await sharp(srcPath).png({ compressionLevel: 9 }).toFile(outPath);
    product.imageUrl = localUrl;
    skipped.push({
      slug: product.slug,
      reason: "no cube — copied as-is from _originals",
      localUrl,
    });
    continue;
  }

  const { data: pixels, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const found = findCube(pixels, w, h);
  const cube = found.cube
    ? expandCubePixels(pixels, w, h, found.cube, Math.floor(h * 0.57))
    : null;

  if (!cube) {
    await sharp(srcPath).png({ compressionLevel: 9 }).toFile(outPath);
    product.imageUrl = localUrl;
    skipped.push({
      slug: product.slug,
      reason: "no cube detected — copied as-is",
      localUrl,
    });
    continue;
  }

  let wordmark = findWordmark(pixels, w, h, cube);
  const label = findLabelBand(pixels, w, h, cube, wordmark);
  if (!wordmark || wordmark.width < cube.bw * 1.2) {
    const cx0 = Math.round((cube.minX + cube.maxX) / 2);
    const estimated = Math.max(Math.round(cube.bw * 2.15), Math.round(label.width * 0.88));
    wordmark = {
      top: wordmark?.top ?? cube.maxY + Math.max(6, Math.round(cube.bh * 0.16)),
      bottom: (wordmark?.bottom ?? cube.maxY) + 12,
      minX: Math.round(cx0 - estimated / 2),
      maxX: Math.round(cx0 + estimated / 2),
      width: estimated,
    };
  }
  const wordmarkY = wordmark.top;

  const paper = coverCube(pixels, w, h, cube, wordmarkY);

  const covered = await sharp(pixels, {
    raw: { width: w, height: h, channels: 4 },
  })
    .png()
    .toBuffer();

  const core = cube.core || cube;
  const gap = Math.max(5, Math.round(cube.bh * 0.06));
  const slotTop = cube.minY;
  const slotBot = wordmarkY - gap;
  const slotH = Math.max(16, slotBot - slotTop);
  const printed = Math.round(Math.min(cube.bw, cube.bh) * 0.72);
  let targetH = Math.round(printed * 1.05);
  let targetW = Math.round(targetH * markAspect);
  if (targetH > slotH) {
    targetH = slotH;
    targetW = Math.round(targetH * markAspect);
  }

  const rawIcon = await sharp(markPng)
    .resize(targetW, targetH, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 3; i < rawIcon.data.length; i += 4) {
    rawIcon.data[i] = Math.round(rawIcon.data[i] * 0.94);
  }
  const icon = await sharp(rawIcon.data, {
    raw: { width: rawIcon.info.width, height: rawIcon.info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const cx = Math.round(cube.minX + cube.bw / 2);
  const cy = Math.round(cube.minY + cube.bh / 2);
  let left = Math.round(cx - targetW / 2);
  let top = Math.round(cy - targetH / 2);
  if (top < slotTop) top = slotTop;
  if (top + targetH > slotBot) top = slotBot - targetH;

  await sharp(covered)
    .composite([{ input: icon, left: Math.max(0, left), top: Math.max(0, top) }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  product.imageUrl = localUrl;
  updated.push({
    slug: product.slug,
    cube: `${cube.minX},${cube.minY} ${cube.bw}x${cube.bh}`,
    core: `${core.minX},${core.minY} ${core.bw}x${core.bh}`,
    icon: `${targetW}x${targetH} @${left},${top}`,
    wordmark: wordmark ? `${wordmark.width}w @${wordmark.top}` : "none",
    paper: paper ? paper.join(",") : "",
    labelW: label.width,
    localUrl,
  });
}

const mappingPath = path.join(PRODUCTS_DIR, "_url-map.json");
const urlMap = {};
for (const product of data.products) {
  if (product.imageUrl && product.imageUrl.startsWith("/images/products/")) {
    urlMap[product.slug] = product.imageUrl;
  }
}
fs.writeFileSync(mappingPath, JSON.stringify({ updated, skipped, urlMap }, null, 2));
console.log("UPDATED", updated.length);
for (const u of updated) {
  console.log(" ", u.slug, u.cube, "icon", u.icon, "wordmark", u.wordmark, "label", u.labelW);
}
console.log("SKIPPED", skipped.length);
for (const s of skipped) console.log(" ", s.slug, s.reason);
