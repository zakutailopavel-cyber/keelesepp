/* global TextEncoder */
// A small QR code encoder (byte mode, error correction level M, versions 1–40) for the printed sheet: a video block
// prints a QR code of its link instead of the player. No library: the app has no QR dependency and this is ~150 lines.
// Follows ISO/IEC 18004 (structure after Project Nayuki's reference implementation). `qrMatrix(text)` → rows of
// booleans (true = dark module), without the quiet zone.

const ECC_PER_BLOCK_M = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28];
const BLOCKS_M = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49];
const ECL_M_BITS = 0; // format bits of level M

function rawModules(ver) {
  let result = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const align = Math.floor(ver / 7) + 2;
    result -= (25 * align - 10) * align - 55;
    if (ver >= 7) result -= 36;
  }
  return result;
}
const dataCodewords = (ver) => Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK_M[ver] * BLOCKS_M[ver];

// ---- Reed–Solomon over GF(256), polynomial 0x11D ----
function mul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}
function divisor(degree) {
  const result = new Array(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = mul(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = mul(root, 0x02);
  }
  return result;
}
function remainder(data, div) {
  const result = div.map(() => 0);
  for (const b of data) {
    const factor = b ^ result.shift();
    result.push(0);
    div.forEach((coef, i) => { result[i] ^= mul(coef, factor); });
  }
  return result;
}

function utf8(text) {
  return [...new TextEncoder().encode(String(text))];
}

// data + error correction codewords, interleaved
function codewords(bytes, ver) {
  const charBits = ver <= 9 ? 8 : 16;
  const bits = [];
  const put = (value, len) => { for (let i = len - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1); };
  put(4, 4); // byte mode
  put(bytes.length, charBits);
  bytes.forEach((b) => put(b, 8));
  const capacity = dataCodewords(ver) * 8;
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((acc, bit) => (acc << 1) | bit, 0));

  const numBlocks = BLOCKS_M[ver];
  const eccLen = ECC_PER_BLOCK_M[ver];
  const raw = Math.floor(rawModules(ver) / 8);
  const shortBlocks = numBlocks - (raw % numBlocks);
  const shortLen = Math.floor(raw / numBlocks);
  const div = divisor(eccLen);
  const blocks = [];
  for (let i = 0, k = 0; i < numBlocks; i += 1) {
    const dat = data.slice(k, k + shortLen - eccLen + (i < shortBlocks ? 0 : 1));
    k += dat.length;
    const ecc = remainder(dat, div);
    if (i < shortBlocks) dat.push(0);
    blocks.push([...dat, ...ecc]);
  }
  const result = [];
  for (let i = 0; i < blocks[0].length; i += 1) {
    blocks.forEach((block, j) => { if (i !== shortLen - eccLen || j >= shortBlocks) result.push(block[i]); });
  }
  return result;
}

function alignmentPositions(ver) {
  if (ver === 1) return [];
  const num = Math.floor(ver / 7) + 2;
  const step = ver === 32 ? 26 : Math.ceil((ver * 4 + 4) / (num * 2 - 2)) * 2;
  const result = [6];
  for (let pos = ver * 4 + 10; result.length < num; pos -= step) result.splice(1, 0, pos);
  return result;
}

function build(ver, words, mask) {
  const size = ver * 4 + 17;
  const modules = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, dark) => { modules[y][x] = dark; fn[y][x] = true; };

  for (let i = 0; i < size; i += 1) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const finder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy += 1) for (let dx = -4; dx <= 4; dx += 1) {
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      const x = cx + dx; const y = cy + dy;
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
    }
  };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  const align = alignmentPositions(ver);
  align.forEach((ay, i) => align.forEach((ax, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === align.length - 1) || (i === align.length - 1 && j === 0)) return;
    for (let dy = -2; dy <= 2; dy += 1) for (let dx = -2; dx <= 2; dx += 1) set(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));

  const drawFormat = (m) => {
    const data = (ECL_M_BITS << 3) | m;
    let rem = data;
    for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    const bit = (i) => ((bits >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i += 1) set(8, i, bit(i));
    set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
    for (let i = 9; i < 15; i += 1) set(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i += 1) set(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i += 1) set(8, size - 15 + i, bit(i));
    set(8, size - 8, true);
  };
  drawFormat(0); // reserve
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (ver << 12) | rem;
    for (let i = 0; i < 18; i += 1) {
      const dark = ((bits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, dark); set(b, a, dark);
    }
  }

  // zigzag data placement
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vert : vert;
        if (!fn[y][x] && i < words.length * 8) {
          modules[y][x] = ((words[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i += 1;
        }
      }
    }
  }

  const MASKS = [
    (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
    (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ];
  for (let y = 0; y < size; y += 1) for (let x = 0; x < size; x += 1) if (!fn[y][x] && MASKS[mask](x, y)) modules[y][x] = !modules[y][x];
  drawFormat(mask);
  return modules;
}

// penalty score (ISO 18004 §7.8.3) — the mask with the lowest one is used
function penalty(m) {
  const size = m.length;
  let score = 0;
  const runs = (line) => {
    let s = 0;
    let run = 1;
    for (let i = 1; i <= line.length; i += 1) {
      if (i < line.length && line[i] === line[i - 1]) run += 1;
      else { if (run >= 5) s += run - 2; run = 1; }
    }
    const str = line.map((d) => (d ? '1' : '0')).join('');
    for (const pattern of ['10111010000', '00001011101']) {
      for (let at = str.indexOf(pattern); at >= 0; at = str.indexOf(pattern, at + 1)) s += 40;
    }
    return s;
  };
  for (let y = 0; y < size; y += 1) score += runs(m[y]);
  for (let x = 0; x < size; x += 1) score += runs(m.map((row) => row[x]));
  for (let y = 0; y < size - 1; y += 1) for (let x = 0; x < size - 1; x += 1) {
    const c = m[y][x];
    if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
  }
  const dark = m.reduce((acc, row) => acc + row.filter(Boolean).length, 0);
  const total = size * size;
  score += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;
  return score;
}

export function qrVersionFor(text) {
  const len = utf8(text).length;
  for (let ver = 1; ver <= 40; ver += 1) {
    const need = 4 + (ver <= 9 ? 8 : 16) + len * 8;
    if (need <= dataCodewords(ver) * 8) return ver;
  }
  return 0;
}

// `mask` (0–7) only for tests; normally the best mask is chosen
export function qrMatrix(text, { mask = -1 } = {}) {
  const ver = qrVersionFor(text);
  if (!ver) throw new Error('Link on QR-koodi jaoks liiga pikk.');
  const words = codewords(utf8(text), ver);
  if (mask >= 0) return build(ver, words, mask);
  let best = null;
  let bestScore = Infinity;
  for (let m = 0; m < 8; m += 1) {
    const matrix = build(ver, words, m);
    const s = penalty(matrix);
    if (s < bestScore) { best = matrix; bestScore = s; }
  }
  return best;
}

// one SVG path of the dark modules (1 unit = 1 module), with a 2-module quiet zone
export function qrPath(matrix) {
  const parts = [];
  matrix.forEach((row, y) => row.forEach((dark, x) => { if (dark) parts.push(`M${x + 2} ${y + 2}h1v1h-1z`); }));
  return parts.join('');
}
