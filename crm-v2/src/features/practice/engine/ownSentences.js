// The learner's own wrong sentences as practice items (owner 2026-11-09 „Täna”: „my mistakes” had two sources and two
// drills). Both sources merge here, one sentence once:
//   words   „Sinu lause” cards in studentWords (the teacher saves them after a lesson: word = right, translation =
//           „Sinu lause: <what he said>”) — these are on the SRS, so an answer here moves their schedule (wordId)
//   lesson  pairs { said, corrected } of his recorded lessons (pets.lessonStats → practice), the pet's old „Paranda”
// Each becomes a „Paranda viga” item (transform + fix): his sentence is shown, he builds the right one from its words
// (typed when it is long). Nothing invented: the right sentence is the teacher's / the model's correction. Pure.
import { createSeededRandom } from '../../worksheet-generator/engine/seed.js';
import { normalizeAnswer } from './compare.js';
import { tilesOf } from './items.js';

export const OWN_PREFIX = 'Sinu lause:';
export const OWN_MAX = 3;
const TILE_MAX = 10;
const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const time = (value) => Date.parse(value || '') || 0;

// [{ said, corrected, wordId?, word?, source }] — „Sinu lause” cards first (due first), then lesson pairs; one sentence once
export function ownSentencePairs({ words = [], stats = [], now = Date.now() } = {}) {
  const seen = new Set();
  const out = [];
  const add = (pair) => {
    const key = normalizeAnswer(pair.corrected);
    if (!pair.said || !pair.corrected || !key || seen.has(key) || normalizeAnswer(pair.said) === key) return;
    seen.add(key);
    out.push(pair);
  };
  const due = (word) => !Number.isFinite(Date.parse(word?.dueAt || '')) || Date.parse(word.dueAt) <= now;
  words
    .filter((word) => clean(word?.translation).startsWith(OWN_PREFIX) && clean(word?.word))
    .sort((a, b) => Number(due(b)) - Number(due(a)) || time(a.dueAt) - time(b.dueAt))
    .forEach((word) => add({ said: clean(clean(word.translation).slice(OWN_PREFIX.length)), corrected: clean(word.word), wordId: word.id, word, source: 'words' }));
  stats.flatMap((stat) => stat?.practice || []).forEach((pair) => add({ said: clean(pair?.said), corrected: clean(pair?.corrected), source: 'lesson' }));
  return out;
}

function mixed(tiles, random) {
  if (tiles.length < 2) return [...tiles];
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const out = [...tiles];
    for (let i = out.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.join(' ') !== tiles.join(' ')) return out;
  }
  return [...tiles].reverse();
}

/** Practice items („Paranda viga”) from ownSentencePairs: at most `max`, deterministic for a seed. */
export function ownSentenceItems(pairs = [], { max = OWN_MAX, seed = 'own' } = {}) {
  const random = createSeededRandom(`own|${seed}`);
  return pairs.slice(0, max).map((pair, index) => {
    const tiles = tilesOf(pair.corrected);
    const byTiles = tiles.length >= 2 && tiles.length <= TILE_MAX;
    return {
      id: `own/${pair.wordId || index}`,
      type: 'transform', fix: true, own: true, source: pair.source, wordId: pair.wordId || '',
      from: pair.said, cue: '', answers: [pair.corrected], sentence: pair.corrected,
      orders: byTiles ? [tiles] : [], input: byTiles ? 'tiles' : 'type', shown: byTiles ? mixed(tiles, random) : undefined,
      grammar: [], level: '', moduleId: '', phase: '',
      explain: { et: 'See on sinu lause tunnist. Nii on õige.', ru: 'Это твоя фраза с урока. Так правильно.', en: 'This is your sentence from the lesson. This is how to say it.' },
    };
  });
}
