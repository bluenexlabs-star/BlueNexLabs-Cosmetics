import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(".");
const SEED = path.join(ROOT, "prisma/seed-data.json");
const MARK_SVG = path.join(ROOT, "public/images/bluenex-mark.svg");
const PRODUCT_ORIGINALS = path.join(ROOT, "public/images/products/_originals");
const ARTICLES_DIR = path.join(ROOT, "public/images/articles");
const ORIGINALS_DIR = path.join(ARTICLES_DIR, "_originals");

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

function findCube(data, w, h, relaxed = false) {
  const mask = new Uint8Array(w * h);
  const y0 = Math.floor(h * (relaxed ? 0.06 : 0.12));
  const y1 = Math.floor(h * (relaxed ? 0.78 : 0.62));
  const x0 = Math.floor(w * (relaxed ? 0.12 : 0.22));
  const x1 = Math.floor(w * (relaxed ? 0.88 : 0.78));
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
    const aspectOk = relaxed
      ? c.aspect >= 0.85 && c.aspect <= 1.55
      : c.aspect >= 1.05 && c.aspect <= 1.35;
    const sizeOk = relaxed
      ? c.bw >= 14 && c.bh >= 14 && c.bw < w * 0.55 && c.bh < h * 0.32
      : c.bw >= 18 && c.bh >= 18 && c.bw < w * 0.35 && c.bh < h * 0.18;
    const mixOk = relaxed
      ? c.blue > 40 && c.count > 40 && c.count < 20000
      : c.blue > 80 && c.count > 80 && c.count < 12000;
    return aspectOk && sizeOk && mixOk;
  });
  cubeish.sort((a, b) => a.minY - b.minY || b.count - a.count);
  return { cube: cubeish[0] || null, mask };
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

  // Dilate so faint wireframe edges next to cube ink are included,
  // without flooding a visible paper rectangle over the label.
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

async function tightMarkPng() {
  const svg = fs.readFileSync(MARK_SVG);
  const rendered = await sharp(svg, { density: 512 })
    .resize(900, 900, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp(rendered).trim({ threshold: 8 }).png().toBuffer();
}

function urlFilename(url) {
  try {
    const name = decodeURIComponent(new URL(url).pathname.split("/").pop() || "");
    return name.replace(/[/\\?%*:|"<>]/g, "_");
  } catch {
    return "";
  }
}

function findProductOriginal(filename) {
  if (!filename || !fs.existsSync(PRODUCT_ORIGINALS)) return null;
  const exact = path.join(PRODUCT_ORIGINALS, filename);
  if (fs.existsSync(exact)) return exact;
  const decoded = filename.replace(/\+/g, " ");
  const files = fs.readdirSync(PRODUCT_ORIGINALS);
  const match = files.find(
    (f) => f === filename || f.replace(/\+/g, " ") === decoded || f === decoded,
  );
  return match ? path.join(PRODUCT_ORIGINALS, match) : null;
}

async function download(url, dest) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return dest;
}

async function detectCube(srcPath) {
  const { data: pixels, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  let found = findCube(pixels, w, h, false);
  if (!found.cube) found = findCube(pixels, w, h, true);
  const cube = found.cube
    ? expandCubePixels(pixels, w, h, found.cube, Math.floor(h * 0.57))
    : null;
  return { pixels, w, h, cube };
}

async function compositeCover(srcPath, outPath, markPng, markAspect) {
  const { pixels, w, h, cube } = await detectCube(srcPath);
  if (!cube) return { cube: null };

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

  return {
    cube,
    core,
    icon: `${targetW}x${targetH} @${left},${top}`,
    wordmark: `${wordmark.width}w @${wordmark.top}`,
    paper,
    labelW: label.width,
  };
}

function safeOriginalName(slug, filename) {
  const ext = path.extname(filename || "") || ".jpg";
  const base = (filename || slug)
    .replace(ext, "")
    .replace(/[^a-zA-Z0-9._+-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return `${slug}__${base || "cover"}${ext}`;
}

fs.mkdirSync(ORIGINALS_DIR, { recursive: true });

const data = JSON.parse(fs.readFileSync(SEED, "utf8"));
const markPng = await tightMarkPng();
await sharp(markPng)
  .resize(512, 512, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toFile(path.join(ROOT, "public/images/bluenex-mark.png"));
const markMeta = await sharp(markPng).metadata();
const markAspect = (markMeta.width || 1) / (markMeta.height || 1);

const CUBE_VIAL_SLUGS = new Set([
  "melanotan-research-overview",
  "why-does-tesamorelin-gel",
  "glp-1-peptide-research-2026",
  "ghk-cu-peptide-in-canada-what-it-is-how-it-works-and-why-it-s-studied-for-skin-a",
  "bacteriostatic-water-canada",
]);

const updated = [];
const skipped = [];
const failed = [];
let seedChanged = false;

for (const post of data.posts) {
  if (!CUBE_VIAL_SLUGS.has(post.slug)) {
    skipped.push({ slug: post.slug, reason: "not a cube-logo vial cover" });
    continue;
  }
  const url = post.coverImageUrl;
  const existingOriginal = fs
    .readdirSync(ORIGINALS_DIR)
    .find((f) => f.startsWith(`${post.slug}__`));
  const filename = url && typeof url === "string" ? urlFilename(url) : "";
  const originalName = existingOriginal || safeOriginalName(post.slug, filename);
  const originalPath = path.join(ORIGINALS_DIR, originalName);

  if (!fs.existsSync(originalPath)) {
    const productOrig = findProductOriginal(filename);
    try {
      if (productOrig) {
        fs.copyFileSync(productOrig, originalPath);
      } else if (url && typeof url === "string" && url.startsWith("http")) {
        await download(url, originalPath);
      } else {
        skipped.push({ slug: post.slug, reason: "no original backup to re-composite" });
        continue;
      }
    } catch (err) {
      failed.push({ slug: post.slug, reason: String(err.message || err), url });
      continue;
    }
  }

  const outName = `${post.slug}.png`;
  const outPath = path.join(ARTICLES_DIR, outName);
  const localUrl = `/images/articles/${outName}`;

  try {
    const result = await compositeCover(originalPath, outPath, markPng, markAspect);
    if (!result.cube) {
      skipped.push({
        slug: post.slug,
        reason: "no cube detected",
        original: originalName,
        filename,
      });
      continue;
    }
    if (post.coverImageUrl !== localUrl) {
      post.coverImageUrl = localUrl;
      seedChanged = true;
    }
    updated.push({
      slug: post.slug,
      file: localUrl,
      original: `public/images/articles/_originals/${originalName}`,
      filename,
      cube: `${result.cube.minX},${result.cube.minY} ${result.cube.bw}x${result.cube.bh}`,
      icon: result.icon,
      wordmark: result.wordmark,
      paper: result.paper ? result.paper.join(",") : "",
    });
  } catch (err) {
    failed.push({ slug: post.slug, reason: String(err.message || err), url });
  }
}

if (seedChanged) {
  fs.writeFileSync(SEED, `${JSON.stringify(data, null, 2)}\n`);
}
const reportPath = path.join(ARTICLES_DIR, "_url-map.json");
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      kept: updated.map((u) => ({ slug: u.slug, coverImageUrl: u.file })),
      updated,
      skipped,
      failed,
    },
    null,
    2,
  ),
);

console.log("UPDATED", updated.length);
for (const u of updated) {
  console.log(" ", u.slug, u.file, u.cube, "icon", u.icon);
}
console.log("SKIPPED", skipped.length);
for (const s of skipped) console.log(" ", s.slug, s.reason);
console.log("FAILED", failed.length);
for (const f of failed) console.log(" ", f.slug, f.reason);
