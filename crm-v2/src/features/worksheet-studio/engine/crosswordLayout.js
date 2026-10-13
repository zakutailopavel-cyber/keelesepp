// A real crossword grid from the block's rows ({ clue, answer }): words cross where they share a letter, a word that
// cannot cross anything lies on its own line below. Deterministic, so the teacher, the student and the print show the
// same grid. Each row keeps its own answer key (String(i)); a cell shared by two words writes both answers.
import { norm, splitList } from './schema.js';

// the letters of an answer as they go into the cells (the first variant; spaces and hyphens are not cells)
export const crosswordWord = (answer) => [...String(splitList(answer)[0] ?? answer ?? '').toLocaleLowerCase('et').replace(/[\s\-–'’.]/g, '')];
export const crosswordClean = (value) => norm(value).replace(/[\s\-–'’.]/g, '');

const key = (x, y) => `${x},${y}`;

function fits(grid, letters, x, y, dir) {
  const [dx, dy] = dir === 'across' ? [1, 0] : [0, 1];
  const at = (cx, cy) => grid.get(key(cx, cy));
  // nothing touches the word's ends
  if (at(x - dx, y - dy) || at(x + dx * letters.length, y + dy * letters.length)) return -1;
  let crossings = 0;
  for (let k = 0; k < letters.length; k += 1) {
    const cx = x + dx * k;
    const cy = y + dy * k;
    const cell = at(cx, cy);
    if (cell) {
      if (cell.letter !== letters[k] || cell.dirs.has(dir)) return -1;
      crossings += 1;
    } else if (at(cx + dy, cy + dx) || at(cx - dy, cy - dx)) {
      return -1; // a new letter may not lie alongside another word
    }
  }
  return crossings;
}

function put(grid, letters, x, y, dir, i) {
  const [dx, dy] = dir === 'across' ? [1, 0] : [0, 1];
  letters.forEach((letter, k) => {
    const id = key(x + dx * k, y + dy * k);
    const cell = grid.get(id) || { letter, dirs: new Set(), refs: [] };
    cell.dirs.add(dir);
    cell.refs.push({ i, k });
    grid.set(id, cell);
  });
}

function box(grid) {
  const xs = [];
  const ys = [];
  for (const id of grid.keys()) { const [x, y] = id.split(',').map(Number); xs.push(x); ys.push(y); }
  return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
}

export function crosswordLayout(rows = []) {
  const words = (rows || []).map((row, i) => ({ i, letters: crosswordWord(row?.answer) })).filter((w) => w.letters.length);
  const grid = new Map();
  const placed = [];
  // long words first: they give the most letters to cross
  let queue = [...words].sort((a, b) => b.letters.length - a.letters.length || a.i - b.i);
  // a word that crosses nothing yet waits until the others are placed: lying alone too early it blocks their crossings
  const crossing = (word) => {
    let best = null;
    for (const other of placed) {
      const dir = other.dir === 'across' ? 'down' : 'across';
      const [odx, ody] = other.dir === 'across' ? [1, 0] : [0, 1];
      for (let ok = 0; ok < other.length; ok += 1) {
        const ox = other.x + odx * ok;
        const oy = other.y + ody * ok;
        const letter = grid.get(key(ox, oy)).letter;
        word.letters.forEach((ch, k) => {
          if (ch !== letter) return;
          const x = dir === 'across' ? ox - k : ox;
          const y = dir === 'down' ? oy - k : oy;
          const crossings = fits(grid, word.letters, x, y, dir);
          if (crossings < 1) return;
          // the smallest grid wins, then more crossings
          const trial = box(grid);
          const [dx, dy] = dir === 'across' ? [1, 0] : [0, 1];
          const w = Math.max(trial.x2, x + dx * (word.letters.length - 1)) - Math.min(trial.x1, x) + 1;
          const h = Math.max(trial.y2, y + dy * (word.letters.length - 1)) - Math.min(trial.y1, y) + 1;
          const score = Math.max(w, h) * 100 + w * h - crossings * 10;
          if (!best || score < best.score) best = { x, y, dir, score };
        });
      }
    }
    return best;
  };
  const place = (word, at) => {
    put(grid, word.letters, at.x, at.y, at.dir, word.i);
    placed.push({ i: word.i, x: at.x, y: at.y, dir: at.dir, length: word.letters.length });
  };
  while (queue.length) {
    const waiting = [];
    for (const word of queue) {
      if (!placed.length) { place(word, { x: 0, y: 0, dir: 'across' }); continue; }
      const best = crossing(word);
      if (best) place(word, best); else waiting.push(word);
    }
    if (waiting.length === queue.length) {
      // nothing more crosses: the first waiting word lies on its own line below, the rest try again
      const b = box(grid);
      place(waiting[0], { x: b.x1, y: b.y2 + 2, dir: 'across' });
      waiting.shift();
    }
    queue = waiting;
  }
  if (!placed.length) return { width: 0, height: 0, cells: [], words: [] };
  const b = box(grid);
  // numbers in reading order, one per start cell
  const starts = [...new Set(placed.map((p) => key(p.x, p.y)))]
    .map((id) => id.split(',').map(Number))
    .sort((a, c) => a[1] - c[1] || a[0] - c[0]);
  const numberOf = new Map(starts.map(([x, y], n) => [key(x, y), n + 1]));
  const cells = [...grid.entries()].map(([id, cell]) => {
    const [x, y] = id.split(',').map(Number);
    return { x: x - b.x1, y: y - b.y1, letter: cell.letter, refs: cell.refs, number: numberOf.get(id) || 0 };
  }).sort((a, c) => a.y - c.y || a.x - c.x);
  const out = placed.map((p) => ({ ...p, x: p.x - b.x1, y: p.y - b.y1, number: numberOf.get(key(p.x, p.y)) }))
    .sort((a, c) => a.number - c.number || (a.dir === 'across' ? -1 : 1));
  return { width: b.x2 - b.x1 + 1, height: b.y2 - b.y1 + 1, cells, words: out };
}

// the answer of row i after a letter is typed at its k-th cell
export function withLetter(current, length, k, letter) {
  const chars = [...String(current || '').padEnd(length, ' ')].slice(0, Math.max(length, k + 1));
  chars[k] = letter || ' ';
  return chars.join('').trimEnd();
}
