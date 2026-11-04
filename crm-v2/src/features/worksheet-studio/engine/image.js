/* global Image, File */
import { ASPECTS } from './schema.js';

// Photo intake: any upload is downscaled and recompressed so worksheets stay light,
// then shown in a fixed-aspect slot with object-fit: cover and an author-chosen focal point.
// A photo becomes JPEG; a picture with transparency stays PNG and an SVG drawing is kept as it is (prepareImageFile).

// A JPEG Blob of any picture, downscaled (homework photos, the student board; the constructor uses prepareImageFile).
export async function fileToJpegBlob(file, maxSide = 1600, quality = 0.86) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Pilti ei saanud avada.'));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) throw new Error('Pilti ei saanud teisendada.');
    return { blob, width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const objectPosition = (img) => `${img?.focus?.x ?? 50}% ${img?.focus?.y ?? 50}%`;

// Cuts a rectangle (in % of the image) out of an original worksheet image and returns it as a File,
// so it goes through the normal photo intake. Needs the image host to allow CORS (see WORKSHEET_STUDIO_V1.md).
export async function cropToFile(url, rect, name = 'valjaloige') {
  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Originaalpilti ei saanud laadida (failihoidla ei luba väljalõikeid). Salvesta foto ja lisa see failina.'));
    i.src = url;
  });
  const sx = Math.round((rect.x / 100) * img.naturalWidth);
  const sy = Math.round((rect.y / 100) * img.naturalHeight);
  const sw = Math.max(1, Math.round((rect.w / 100) * img.naturalWidth));
  const sh = Math.max(1, Math.round((rect.h / 100) * img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  canvas.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  let blob;
  try {
    blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  } catch {
    throw new Error('Brauser ei luba sellest pildist välja lõigata (failihoidla CORS). Salvesta foto ja lisa see failina.');
  }
  if (!blob) throw new Error('Väljalõiget ei saanud teha.');
  return { file: new File([blob], `${name}.png`, { type: 'image/png' }), ratio: sw / sh };
}

export function nearestAspect(ratio, aspects) {
  return Object.entries(aspects).reduce((best, [key, value]) => (Math.abs(value - ratio) < Math.abs(aspects[best] - ratio) ? key : best), Object.keys(aspects)[0]);
}

// ---- the slot's shape: a named aspect, or „orig” = the picture's own shape (after a free crop) ----
export const ORIGINAL_ASPECT = 'orig';
export function aspectRatioOf(aspect, img) {
  if (aspect === ORIGINAL_ASPECT) return img?.width > 0 && img?.height > 0 ? img.width / img.height : 4 / 3;
  return ASPECTS[aspect] || 4 / 3;
}

// The picture's text for screen readers: „Alt-tekst”, else the caption (without the sheet's markup), else nothing.
export function altText(data = {}) {
  const alt = String(data.alt || '').trim();
  if (alt) return alt;
  return String(data.caption || '').replace(/\*\*?([^*]+)\*\*?/g, '$1').replace(/\s+/g, ' ').trim();
}

// ---- crop and rotate (pure math; a rectangle is in fractions 0–1 of the rotated picture) ----
export const CROP_RATIOS = [['free', 'Vaba', 0], ...Object.entries(ASPECTS).map(([key, value]) => [key, key, value])];
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, value));
export const normRotation = (deg) => (((Math.round(Number(deg) / 90) * 90) % 360) + 360) % 360;
export function rotatedSize(width, height, rotation = 0) {
  return normRotation(rotation) % 180 ? { width: height, height: width } : { width, height };
}

// the biggest centred rectangle of `ratio` (width / height in pixels) in a W × H picture; ratio 0 = the whole picture
export function fitCrop(ratio, W, H) {
  if (!ratio || !W || !H) return { x: 0, y: 0, w: 1, h: 1 };
  let w = 1;
  let h = 1;
  if (W / H > ratio) w = (ratio * H) / W;
  else h = W / (ratio * H);
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

export function moveCrop(rect, dx, dy) {
  return { ...rect, x: clamp(rect.x + dx, 0, 1 - rect.w), y: clamp(rect.y + dy, 0, 1 - rect.h) };
}

// drag a corner (nw, ne, sw, se) by dx, dy (fractions); the opposite corner stays; a fixed ratio keeps its shape
export function resizeCrop(rect, handle, dx, dy, { ratio = 0, W = 1, H = 1, min = 0.05 } = {}) {
  const left = handle.includes('w');
  const top = handle.includes('n');
  const ax = left ? rect.x + rect.w : rect.x; // the anchor: the opposite corner
  const ay = top ? rect.y + rect.h : rect.y;
  const maxW = left ? ax : 1 - ax;
  const maxH = top ? ay : 1 - ay;
  let w = clamp(rect.w + (left ? -dx : dx), min, maxW);
  let h = clamp(rect.h + (top ? -dy : dy), min, maxH);
  if (ratio) {
    const k = (ratio * H) / W; // w = k · h in fractions
    // the axis dragged more decides the size
    if (Math.abs(dx) * W >= Math.abs(dy) * H) h = w / k;
    else w = k * h;
    if (h > maxH) { h = maxH; w = k * h; }
    if (w > maxW) { w = maxW; h = w / k; }
  }
  return { x: left ? ax - w : ax, y: top ? ay - h : ay, w, h };
}

// the rectangle in whole pixels of the W × H (rotated) picture, inside it, at least 1 px
export function cropPixels(rect, W, H) {
  const sx = clamp(Math.round(rect.x * W), 0, W - 1);
  const sy = clamp(Math.round(rect.y * H), 0, H - 1);
  const sw = clamp(Math.round(rect.w * W), 1, W - sx);
  const sh = clamp(Math.round(rect.h * H), 1, H - sy);
  return { sx, sy, sw, sh };
}

// the slot's aspect after a crop: a fixed ratio → its key; free → „orig”
export const aspectOfCrop = (ratioKey) => (ASPECTS[ratioKey] ? ratioKey : ORIGINAL_ASPECT);

function loadImage(src, cors = false) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    if (cors) i.crossOrigin = 'anonymous';
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error('Pilti ei saanud avada.'));
    i.src = src;
  });
}

// any pixel not fully opaque?
function hasAlpha(canvas) {
  const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4) if (data[i] < 255) return true;
  return false;
}
const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality));
const ALPHA_TYPES = /^image\/(png|webp|gif|avif)$/;

// Upload intake: SVG as it is; a raster picture downscaled to ≤ maxSide; JPEG unless it has transparency (then PNG;
// a PNG that needs no downscaling is uploaded unchanged). → { blob, type, ext, width, height }
export async function prepareImageFile(file, maxSide = 1600, quality = 0.86) {
  const type = String(file?.type || '');
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const nw = img.naturalWidth || 0;
    const nh = img.naturalHeight || 0;
    if (type === 'image/svg+xml') return { blob: file, type, ext: 'svg', width: nw, height: nh };
    const scale = Math.min(1, maxSide / Math.max(nw, nh, 1));
    const w = Math.max(1, Math.round(nw * scale));
    const h = Math.max(1, Math.round(nh * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    if (ALPHA_TYPES.test(type) && hasAlpha(canvas)) {
      if (type === 'image/png' && scale === 1) return { blob: file, type, ext: 'png', width: w, height: h };
      const png = await toBlob(canvas, 'image/png');
      if (!png) throw new Error('Pilti ei saanud teisendada.');
      return { blob: png, type: 'image/png', ext: 'png', width: w, height: h };
    }
    const jpeg = await toBlob(canvas, 'image/jpeg', quality);
    if (!jpeg) throw new Error('Pilti ei saanud teisendada.');
    return { blob: jpeg, type: 'image/jpeg', ext: 'jpg', width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Turns and cuts a picture already on the sheet and returns a new File for the normal intake (prepareImageFile).
// The picture's host must allow CORS (Storage: storage.cors.json); an SVG drawing becomes PNG.
export async function editImage(src, { rotation = 0, crop = { x: 0, y: 0, w: 1, h: 1 } } = {}, name = 'pilt') {
  let img;
  try {
    img = await loadImage(src, true);
  } catch {
    throw new Error('Pilti ei saanud laadida (failihoidla ei luba seda muuta). Salvesta pilt arvutisse ja lisa see uuesti.');
  }
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  const rot = normRotation(rotation);
  const { width: W, height: H } = rotatedSize(nw, nh, rot);
  const { sx, sy, sw, sh } = cropPixels(crop, W, H);
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext('2d');
  ctx.translate(-sx, -sy);
  if (rot === 90) { ctx.translate(nh, 0); ctx.rotate(Math.PI / 2); }
  else if (rot === 180) { ctx.translate(nw, nh); ctx.rotate(Math.PI); }
  else if (rot === 270) { ctx.translate(0, nw); ctx.rotate(-Math.PI / 2); }
  ctx.drawImage(img, 0, 0, nw, nh);
  try {
    const alpha = hasAlpha(canvas);
    const blob = await toBlob(canvas, alpha ? 'image/png' : 'image/jpeg', 0.92);
    if (!blob) throw new Error('empty');
    return new File([blob], `${name}.${alpha ? 'png' : 'jpg'}`, { type: alpha ? 'image/png' : 'image/jpeg' });
  } catch {
    throw new Error('Brauser ei luba seda pilti muuta (failihoidla CORS). Salvesta pilt arvutisse ja lisa see uuesti.');
  }
}
