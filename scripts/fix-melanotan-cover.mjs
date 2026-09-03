/**
 * One-off fix for melanotan-research-overview article cover.
 * Uses core cube bbox for placement; clamps cube cover to label bounds.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(".");
const MARK_SVG = path.join(ROOT, "public/images/bluenex-mark.svg");
const ORIGINAL = path.join(
  ROOT,
  "public/images/articles/_originals/melanotan-research-overview__Melanotan+I.jpg",
);
const OUT = path.join(ROOT, "public/images/articles/melanotan-research-overview.png");

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
  return cubeish[0] || null;
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
  const yStart = cube.maxY + 1;
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

/** Label bounds anchored on cube column — avoids picking the wrong half-label on MT-I. */
function findLabelBounds(data, w, h, cube) {
  const cx = Math.round((cube.minX + cube.maxX) / 2);

  let top = cube.minY;
  for (let y = cube.minY; y > Math.floor(h * 0.06); y--) {
    const i = (y * w + cx) * 4;
    if (!isLabelTone(data[i], data[i + 1], data[i + 2])) break;
    top = y;
  }

  let bottom = cube.maxY;
  for (let y = cube.maxY; y < h - 4; y++) {
    const i = (y * w + cx) * 4;
    if (!isLabelTone(data[i], data[i + 1], data[i + 2])) break;
    bottom = y;
  }

  const scanYs = [
    Math.round((cube.minY + cube.maxY) / 2),
    cube.minY,
    cube.maxY,
    Math.min(h - 1, cube.maxY + 12),
  ];
  let left = cube.minX;
  let right = cube.maxX;
  for (const scanY of scanYs) {
    const runs = [];
    let runStart = -1;
    for (let x = 0; x <= w; x++) {
      const ok =
        x < w &&
        isLabelTone(
          data[(scanY * w + x) * 4],
          data[(scanY * w + x) * 4 + 1],
          data[(scanY * w + x) * 4 + 2],
        );
      if (ok) {
        if (runStart < 0) runStart = x;
      } else if (runStart >= 0) {
        runs.push({ x0: runStart, x1: x - 1 });
        runStart = -1;
      }
    }
    const containing = runs.filter((r) => r.x0 <= cx && r.x1 >= cx);
    const pick = containing.length
      ? containing.reduce((a, b) => (b.x1 - b.x0 > a.x1 - a.x0 ? b : a))
      : runs.reduce(
          (a, b) =>
            Math.abs((b.x0 + b.x1) / 2 - cx) < Math.abs((a.x0 + a.x1) / 2 - cx) ? b : a,
          runs[0] || { x0: cube.minX, x1: cube.maxX },
        );
    if (pick.x0 < left) left = pick.x0;
    if (pick.x1 > right) right = pick.x1;
  }

  return { left, right, top, bottom, cx };
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

function isCubeRemnant(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  if (isCubeInk(r, g, b) || isCubeGrow(r, g, b)) return true;
  if (b > 55 && b > r + 8 && sat > 0.1 && min < 220 && max < 235) return true;
  return b > 40 && b > r + 15 && b > g + 8 && sat > 0.18 && max < 210 && min < 170;
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

function isPaperPixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sat = max === 0 ? 0 : (max - min) / max;
  return min > 175 && sat < 0.1 && Math.abs(r - g) < 16 && Math.abs(g - b) < 16;
}

function samplePaperAroundCube(data, w, h, cube, wordmarkY, label) {
  const samples = [];
  const cy = Math.round((cube.minY + cube.maxY) / 2);
  for (let y = cy - 10; y <= cy + 10; y++) {
    for (let x = cube.minX - 24; x <= cube.minX - 8; x++) {
      if (x < label.left || y < label.top) continue;
      if (x >= w || y >= h || x < 0 || y < 0) continue;
      if (wordmarkY != null && y >= wordmarkY - 1) continue;
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isCubeInk(r, g, b)) continue;
      if (Math.min(r, g, b) < 232) continue;
      if (!isPaperPixel(r, g, b)) continue;
      samples.push([r, g, b]);
    }
  }
  if (!samples.length) return [252, 252, 252];
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

function coverCube(data, w, h, cube, wordmarkY, label) {
  const pad = 3;
  const x0 = Math.max(label.left, cube.minX - pad);
  const x1 = Math.min(label.right, cube.maxX + pad);
  const y0 = Math.max(label.top, cube.minY - pad);
  const y1 = Math.min(
    label.bottom,
    wordmarkY != null ? Math.min(wordmarkY - 2, cube.maxY + pad) : cube.maxY + pad,
  );
  const paper = samplePaperAroundCube(data, w, h, cube, wordmarkY, label);
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

  const dilate = 3;
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

  // Ensure full cube ink removal inside the tight cover box only.
  const boxX0 = Math.max(label.left, cube.minX - pad);
  const boxX1 = Math.min(label.right, cube.maxX + pad);
  const boxY0 = Math.max(label.top, cube.minY - pad);
  const boxY1 = Math.min(
    label.bottom,
    wordmarkY != null ? Math.min(wordmarkY - 2, cube.maxY + pad) : cube.maxY + pad,
  );
  for (let y = boxY0; y <= boxY1; y++) {
    for (let x = boxX0; x <= boxX1; x++) {
      const i = (y * w + x) * 4;
      if (isCubeCoverPixel(data[i], data[i + 1], data[i + 2])) {
        grown[(y - y0) * bw + (x - x0)] = 1;
      }
    }
  }

  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      if (!grown[(y - y0) * bw + (x - x0)]) continue;
      if (wordmarkY != null && y >= wordmarkY - 1) continue;
      const i = (y * w + x) * 4;
      data[i] = paper[0];
      data[i + 1] = paper[1];
      data[i + 2] = paper[2];
      data[i + 3] = 255;
    }
  }
  return paper;
}

async function tightMarkPng() {
  const svg = fs.readFileSync(MARK_SVG);
  const rendered = await sharp(svg, { density: 512 })
    .resize(900, 900, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp(rendered).trim({ threshold: 8 }).png().toBuffer();
}

const { data: pixels, info } = await sharp(ORIGINAL)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;

const coreCube = findCube(pixels, w, h);
if (!coreCube) {
  console.error("No cube detected");
  process.exit(1);
}

const before = {
  cube: `${coreCube.minX},${coreCube.minY} ${coreCube.bw}x${coreCube.bh}`,
  center: `${Math.round(coreCube.minX + coreCube.bw / 2)},${Math.round(coreCube.minY + coreCube.bh / 2)}`,
};

const label = findLabelBounds(pixels, w, h, coreCube);
const wordmark = findWordmark(pixels, w, h, coreCube);
const wordmarkY = wordmark?.top ?? coreCube.maxY + Math.round(coreCube.bh * 0.2);

const paper = coverCube(pixels, w, h, coreCube, wordmarkY, label);

const covered = await sharp(pixels, {
  raw: { width: w, height: h, channels: 4 },
})
  .png()
  .toBuffer();

const markPng = await tightMarkPng();
const markMeta = await sharp(markPng).metadata();
const markAspect = (markMeta.width || 1) / (markMeta.height || 1);

const gap = Math.max(5, Math.round(coreCube.bh * 0.06));
const slotTop = Math.max(label.top, coreCube.minY);
const slotBot = wordmarkY - gap;
const slotH = Math.max(16, slotBot - slotTop);
const printed = Math.round(Math.min(coreCube.bw, coreCube.bh) * 0.92);
let targetH = printed;
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

const cx = Math.round(coreCube.minX + coreCube.bw / 2);
const cy = Math.round(coreCube.minY + coreCube.bh / 2);
let left = Math.round(cx - targetW / 2);
let top = Math.round(cy - targetH / 2);
if (top < slotTop) top = slotTop;
if (top + targetH > slotBot) top = slotBot - targetH;
left = Math.max(label.left, Math.min(left, label.right - targetW));

await sharp(covered)
  .composite([{ input: icon, left: Math.max(0, left), top: Math.max(label.top, top) }])
  .png({ compressionLevel: 9 })
  .toFile(OUT);

const after = {
  cube: before.cube,
  center: before.center,
  label: `${label.left},${label.top} ${label.right - label.left + 1}x${label.bottom - label.top + 1}`,
  icon: `${targetW}x${targetH} @${left},${top}`,
  wordmarkY,
  paper: paper.join(","),
};

console.log("BEFORE cube bbox:", before.cube, "center", before.center);
console.log("AFTER  placement:", after.icon, "wordmarkY", after.wordmarkY, "paper", after.paper);
console.log("Label bounds:", after.label);
console.log("Written:", OUT);
