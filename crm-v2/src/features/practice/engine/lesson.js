// Lesson builder: a short practice lesson of 8–12 items (docs/PRACTICE_ENGINE.md „Lesson”). Pure and deterministic for
// a seed.
//
//   focus      the chosen module and / or grammar point (about 70 % of the items)
//   spaced     earlier grammar of the same level (about 30 %): points the learner got wrong first, then older modules
//   mix        2–3 item types, never three of one type in a row
//   order      easy → hard (difficultyOf); a transformation is built from tiles in the first half, typed later
//   no dupes   one sentence once per lesson
import { createSeededRandom } from '../../worksheet-generator/engine/seed.js';
import { normalizeAnswer } from './compare.js';
import { fullSentence, tilesOf } from './items.js';

export const LESSON_MIN = 8;
export const LESSON_MAX = 12;
export const LESSON_SIZE = 10;
const SPACED_SHARE = 0.3;
const LISTEN_MAX = 2;
const LISTEN_TILES = 10;

const BASE = { connector: 1, form: 1.6, build: 2, listen: 2.8, transform: 3 };
// easy → hard: type and input, sentence length, lesson phase (Avasta < Harjuta < Kasuta), error correction
export function difficultyOf(item, input = item.input) {
  let d = BASE[item.type] ?? 2;
  if (item.type === 'form' && item.options?.length) d -= 0.6;
  if (item.type === 'transform' && input === 'tiles') d -= 0.8;
  const words = tilesOf(fullSentence(item)).length;
  if (words > 8) d += 0.4;
  if (words > 13) d += 0.6;
  d += { discover: 0, practice: 0.2, transfer: 0.4 }[item.phase] || 0;
  if (item.fix) d += 0.2;
  return Math.round(d * 100) / 100;
}

export const sentenceKey = (item) => normalizeAnswer(fullSentence(item));

function shuffle(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// tiles in a mixed order that is not already the answer
function mixTiles(tiles, random) {
  if (tiles.length < 2) return [...tiles];
  for (let i = 0; i < 6; i += 1) {
    const mixed = shuffle(tiles, random);
    if (mixed.join(' ') !== tiles.join(' ')) return mixed;
  }
  return [...tiles].reverse();
}

// never three items of one type in a row; keeps the easy → hard order as far as possible
export function spreadTypes(items) {
  const out = [...items];
  for (let i = 2; i < out.length; i += 1) {
    if (out[i].type === out[i - 1].type && out[i].type === out[i - 2].type) {
      const j = out.findIndex((x, k) => k > i && x.type !== out[i].type);
      if (j > 0) out.splice(i, 0, out.splice(j, 1)[0]);
    }
  }
  return out;
}

const weakPoints = (history) => {
  const wrong = history?.wrong || {};
  return Object.keys(wrong).sort((a, b) => wrong[b] - wrong[a]);
};

// pool: extracted items (extract.js). history (optional, phase 3 stores it): { wrong: { grammarId: n }, recent: [sentenceKey] }
export function buildLesson({ pool = [], level = '', moduleId = '', grammarFocus = '', studentHistory = {}, size = LESSON_SIZE, canListen = false, seed = 'lesson' } = {}) {
  const random = createSeededRandom(`${seed}|${level}|${moduleId}|${grammarFocus}`);
  const target = Math.max(LESSON_MIN, Math.min(LESSON_MAX, size));
  const recent = new Set(studentHistory?.recent || []);
  const all = pool.filter((it) => (!level || it.level === level) && !recent.has(sentenceKey(it)));
  const moduleIndex = moduleId ? all.find((it) => it.moduleId === moduleId)?.moduleIndex ?? Infinity : Infinity;

  const isFocus = (it) => (!moduleId || it.moduleId === moduleId) && (!grammarFocus || it.grammar.includes(grammarFocus));
  let focus = all.filter(isFocus);
  // a grammar point the module barely has: take it from the whole level up to this module
  if (grammarFocus && moduleId && focus.length < LESSON_MIN) {
    focus = all.filter((it) => it.grammar.includes(grammarFocus) && it.moduleIndex <= moduleIndex);
  }
  const focusIds = new Set(focus.map((it) => it.id));
  const focusPoints = new Set(grammarFocus ? [grammarFocus] : focus.flatMap((it) => it.grammar));
  const weak = weakPoints(studentHistory);
  const spacedPool = all.filter((it) => !focusIds.has(it.id) && it.moduleIndex < moduleIndex && it.grammar.length && !it.grammar.some((g) => focusPoints.has(g)));
  // the learner's weak points first, then the older modules (the further back, the later in the list)
  const spacedRank = (it) => {
    const w = weak.findIndex((g) => it.grammar.includes(g));
    return (w >= 0 ? w : weak.length + 10) * 1000 + (moduleIndex === Infinity ? 0 : moduleIndex - it.moduleIndex);
  };
  const spacedSorted = shuffle(spacedPool, random).sort((a, b) => spacedRank(a) - spacedRank(b));

  const used = new Set();
  const take = (it) => {
    const key = sentenceKey(it);
    if (!key || used.has(key)) return false;
    used.add(key);
    return true;
  };

  // 2–3 types: the ones the focus has most of
  const byType = new Map();
  shuffle(focus, random).forEach((it) => byType.set(it.type, [...(byType.get(it.type) || []), it]));
  const types = [...byType.keys()].sort((a, b) => byType.get(b).length - byType.get(a).length).slice(0, 3);
  const spacedWanted = spacedSorted.length ? Math.round(target * SPACED_SHARE) : 0;
  const focusWanted = target - spacedWanted;

  const chosen = [];
  let round = 0;
  while (chosen.length < focusWanted && types.some((t) => byType.get(t).length)) {
    const list = byType.get(types[round % types.length]);
    round += 1;
    while (list.length) {
      const it = list.shift();
      if (take(it)) { chosen.push({ ...it, spaced: false }); break; }
    }
  }
  for (const it of spacedSorted) {
    if (chosen.length >= target) break;
    if (chosen.filter((x) => x.spaced).length >= spacedWanted && chosen.length >= focusWanted) break;
    if (take(it)) chosen.push({ ...it, spaced: true });
  }
  // still short: more of the focus (any type), then more spaced
  for (const it of [...shuffle(focus, random), ...spacedSorted]) {
    if (chosen.length >= target) break;
    if (take(it)) chosen.push({ ...it, spaced: !focusIds.has(it.id) });
  }

  // how each item is answered: transformations alternate tiles / typed (tiles first = easier), a few builds are heard
  let transforms = 0;
  let listens = 0;
  const shaped = chosen.map((it) => {
    let next = { ...it };
    if (it.type === 'transform') {
      next.input = it.orders?.length && transforms % 2 === 0 ? 'tiles' : 'type';
      transforms += 1;
    }
    if (canListen && it.type === 'build' && listens < LISTEN_MAX && (it.tiles || []).length <= LISTEN_TILES && random() < 0.5) {
      next = { ...next, type: 'listen' };
      listens += 1;
    }
    const tiles = next.type === 'transform' ? next.orders?.[0] : next.tiles;
    if (tiles) next.shown = mixTiles(tiles, random);
    next.difficulty = difficultyOf(next);
    return next;
  });

  const ordered = spreadTypes(shaped.map((it, i) => ({ it, i })).sort((a, b) => a.it.difficulty - b.it.difficulty || a.i - b.i).map((x) => x.it));
  return {
    items: ordered,
    types: [...new Set(ordered.map((it) => it.type))],
    focusCount: ordered.filter((it) => !it.spaced).length,
    spacedCount: ordered.filter((it) => it.spaced).length,
    short: ordered.length < LESSON_MIN,
  };
}
