// Picture items of the practice engine (docs/PRACTICE_ENGINE.md „Picture items”). The pictures are the A2 word
// illustrations (worksheet-generator/art/words/a2.js, docs/TEXTBOOK_ART_BIBLE.md §10) — nothing is drawn or invented
// here. Pure and deterministic for a seed.
//
//   picture  „Mis on pildil?”     a word picture; pick the word of 4 (or type it on a harder step)
//   hear     „Kuula ja vali pilt” the word is heard (stored Neurokõne file only); pick its picture of 4
//
// Wrong options are other word pictures of the same topic (the art's lesson group = one A2 module) first, then of the
// other topics. A word with no picture gets no item; a learner whose module and words have no picture gets none.
import A2_WORDS from '../../worksheet-generator/art/words/a2.js';
import { createSeededRandom } from '../../worksheet-generator/engine/seed.js';
import { normalizeAnswer } from './compare.js';

export const PICTURE_TYPES = ['picture', 'hear'];
export const PICTURE_OPTIONS = 4;
// the same image under two words (art/wordStrips.js SAME_PICTURE): the second word never gets an item or an option,
// or one picture would stand for two answers
export const SAME_PICTURE = Object.freeze({ luhike: 'pikk', bussipeatus: 'peatus' });

// Look-alike pictures (checked by eye on all 156, 2026-11-25): the same object drawn twice (köha / nohu are both tissue
// boxes), opposites drawn with the same object (odav / kallis price tags), one scene type for several words (a calendar,
// a girl at a desk, a form). Two pictures of one group never stand in the same item. Ids = art/words/a2.js ids; when a
// picture is redrawn so it no longer looks like the others, take it out of its group.
export const CONFUSABLE = Object.freeze([
  ['koha', 'nohu'],
  ['odav', 'kallis', 'hind', 'allahindlus', 'soodustus'],
  ['sunniaeg', 'kuupaev', 'nadal', 'broneering', 'kellaaeg', 'kinnitama', 'muutma', 'aeg'],
  ['tass', 'kohv', 'tee'],
  ['piim', 'liiter', 'klaas'],
  ['avaldus', 'vorm', 'taitma', 'allkiri', 'esitama'],
  ['nimi', 'isikukood'],
  ['aadress', 'elukoht', 'elama'],
  ['minema', 'tulema', 'elama', 'sissepaas', 'valjapaas'],
  ['kaart', 'marsruut', 'asuma'],
  ['apteek', 'polikliinik'],
  ['ema', 'ode', 'sober', 'abikaasa', 'vanem', 'isa', 'vend', 'tutvuma'],
  ['oppima', 'opilane', 'kordama', 'alustama', 'lopetama', 'tootama'],
  ['hommik', 'arkama', 'paev'],
  ['puhkama', 'magama', 'rahulik', 'vasimus'],
  ['jalutama', 'jalutamine', 'paev', 'kohtuma', 'nadalavahetus', 'liikuma', 'aktiivne'],
  ['ohtu', 'lugemine', 'raamat'],
  ['tuba', 'diivan'],
  ['tool', 'teenus'],
  ['riided', 'osakond'],
  ['tagastus', 'vahetus', 'tellima', 'maksma'],
  ['sobima', 'proovima'],
  ['koogivili', 'turg'],
  ['kino', 'kutsuma'],
  ['kontsert', 'uritus'],
  ['pikk', 'mootma'],
  ['valutama', 'koht', 'selg'],
  ['pea', 'palavik', 'kurk'],
  ['teenindaja', 'vastuvott'],
]);
const LOOK_ALIKE = new Map();
CONFUSABLE.forEach((group) => group.forEach((id) => {
  const set = LOOK_ALIKE.get(id) || new Set();
  group.forEach((other) => { if (other !== id) set.add(other); });
  LOOK_ALIKE.set(id, set);
}));
export const looksAlike = (a, b) => a === b || SAME_PICTURE[a] === b || SAME_PICTURE[b] === a || Boolean(LOOK_ALIKE.get(a)?.has(b));

const topicOf = (entry) => String(entry.lessonIds?.[0] || '');

export const PICTURE_WORDS = Object.freeze(A2_WORDS
  .filter((entry) => entry?.word && entry.src && !SAME_PICTURE[entry.id])
  .map((entry) => Object.freeze({ id: entry.id, word: entry.word, src: entry.src, lessonIds: entry.lessonIds || [], topic: topicOf(entry) })));

const byWord = new Map(PICTURE_WORDS.map((entry) => [normalizeAnswer(entry.word), entry]));
export const pictureOf = (word) => byWord.get(normalizeAnswer(word)) || null;

/**
 * The words that can be practised with a picture → [{ id, word, src, topic, lessonIds, meaning, wordId }]:
 *   1) the learner's own words („Minu sõnad”: { id, word, translation }) that have a picture — the answer moves that card;
 *   2) the picture words of the lessons given (his current module), with the meaning from `meanings` ({ word: 'имя' }).
 */
export function pictureWordsFor({ words = [], lessonIds = [], meanings = {} } = {}) {
  const out = new Map();
  words.forEach((own) => {
    const entry = pictureOf(own?.word);
    if (entry && !out.has(entry.id)) out.set(entry.id, { ...entry, meaning: String(own.translation || meanings[entry.word] || ''), wordId: own.id || '' });
  });
  const lessons = new Set(lessonIds);
  PICTURE_WORDS.forEach((entry) => {
    if (!out.has(entry.id) && entry.lessonIds.some((id) => lessons.has(id))) out.set(entry.id, { ...entry, meaning: String(meanings[entry.word] || ''), wordId: '' });
  });
  return [...out.values()];
}

function shuffle(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// 3 other pictures: the same topic first, then the rest; never the answer's own picture or word, and no two pictures of
// the item that look alike (CONFUSABLE)
export function distractorsOf(entry, random, count = PICTURE_OPTIONS - 1) {
  const key = normalizeAnswer(entry.word);
  const others = PICTURE_WORDS.filter((other) => other.id !== entry.id && normalizeAnswer(other.word) !== key);
  const same = shuffle(others.filter((other) => other.topic === entry.topic), random);
  const rest = shuffle(others.filter((other) => other.topic !== entry.topic), random);
  const picked = [];
  for (const other of [...same, ...rest]) {
    if (picked.length >= count) break;
    if ([entry, ...picked].every((shown) => !looksAlike(shown.id, other.id))) picked.push(other);
  }
  return picked;
}

/**
 * One picture item. kind 'picture' | 'hear'; input 'options' | 'type' (typing only for 'picture').
 * `choices` are the 4 pictures ({ word, src }) in their shown order; `options` the same words (what is graded).
 */
export function pictureItem(entry, { kind = 'picture', input = 'options', seed = 'pictures' } = {}) {
  const random = createSeededRandom(`${seed}|${kind}|${entry.id}`);
  const typed = kind === 'picture' && input === 'type';
  const choices = typed ? [] : shuffle([entry, ...distractorsOf(entry, random)], random).map((pic) => ({ word: pic.word, src: pic.src }));
  return {
    id: `pic/${entry.id}/${kind}${typed ? '-typed' : ''}`,
    type: kind,
    input: typed ? 'type' : 'options',
    word: entry.word,
    picture: { src: entry.src },
    meaning: entry.meaning || '',
    wordId: entry.wordId || '',
    answers: [entry.word],
    options: choices.map((pic) => pic.word),
    choices,
    grammar: [],
    level: 'A2',
    phase: 'discover',
    lessonId: entry.lessonIds?.[0] || '',
    moduleId: '',
    topic: entry.topic,
  };
}
