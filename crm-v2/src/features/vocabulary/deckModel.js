// Study decks (owner, 2026-10-10: „Sõnavara → Õppimine”, Quizlet-like modes for the student at home).
// A card is { id, front, back, hint }: front is the Estonian word or phrase, back its translation or meaning.
// Decks come from the student's own words (`studentWords`) or from the published sheets of a course lesson:
// the vocabulary list („sõna — перевод”) and the matching tasks (word ↔ meaning) of Avasta / Harjuta / Kasuta.
import { publishedWorksheetDoc } from '../library/libraryModel.js';

const clean = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const SEPARATOR = /\s[—–-]\s/;

// „kõigepealt — сначала, seejärel — затем, kuna — так как, хотя” → pairs; a piece without a separator belongs to
// the previous translation (it was a comma inside it)
export function vocabPairs(words) {
  const pieces = Array.isArray(words) ? words.map(clean) : String(words || '').split(/,\s+/).map(clean);
  const pairs = [];
  for (const piece of pieces.filter(Boolean)) {
    const match = piece.split(SEPARATOR);
    if (match.length >= 2) pairs.push([clean(match[0]), clean(match.slice(1).join(' — '))]);
    else if (pairs.length) pairs[pairs.length - 1][1] = `${pairs[pairs.length - 1][1]}, ${piece}`;
  }
  return pairs.filter(([front, back]) => front && back);
}

export function cardsFromDoc(doc) {
  const cards = [];
  for (const block of doc?.blocks || []) {
    const data = block?.data || {};
    if (block?.type === 'vocab') vocabPairs(data.words).forEach(([front, back]) => cards.push({ front, back }));
    if (block?.type === 'match') (data.pairs || []).forEach((pair) => cards.push({ front: clean(pair?.left), back: clean(pair?.right) }));
  }
  return cards.filter((card) => card.front && card.back && card.front.length <= 160 && card.back.length <= 240);
}

const key = (value) => clean(value).toLocaleLowerCase('et');

// one card per word; the published version of each phase sheet (a draft-only sheet is not shown to students)
export function deckFromSheets(records = [], prefix = 'lesson') {
  const seen = new Set();
  const cards = [];
  for (const record of records) {
    const doc = publishedWorksheetDoc(record);
    if (!doc) continue;
    for (const card of cardsFromDoc(doc)) {
      if (seen.has(key(card.front))) continue;
      seen.add(key(card.front));
      cards.push({ ...card, id: `${prefix}:${cards.length}` });
    }
  }
  return cards;
}

export function deckFromWords(words = []) {
  return words
    .filter((word) => clean(word.word) && clean(word.translation || word.example))
    .map((word) => ({ id: word.id, front: clean(word.word), back: clean(word.translation || word.example), hint: clean(word.forms || ''), word }));
}

// direction: 'front' asks the Estonian word (shows the meaning), 'back' asks the meaning
export function prompt(card, direction) {
  return direction === 'back' ? { ask: card.front, answer: card.back } : { ask: card.back, answer: card.front };
}

export function shuffle(items, random = Math.random) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [list[index], list[other]] = [list[other], list[index]];
  }
  return list;
}

const normalize = (value) => key(value).replace(/[.,!?;:«»„“”"'()…]/g, '').replace(/\s+/g, ' ').trim();

function distance(left, right) {
  if (Math.abs(left.length - right.length) > 1) return 2;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const above = previous[j];
      previous[j] = Math.min(previous[j] + 1, previous[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[right.length];
}

// 'right' | 'almost' (one letter off in a longer word: counted, the right spelling is shown) | 'wrong'.
// Several accepted answers may be written with „/” or „;” („kodu / maja”). Õ, ä, ö, ü are letters of their own.
export function checkAnswer(given, expected) {
  const answer = normalize(given);
  if (!answer) return 'wrong';
  const options = String(expected || '').split(/\s*[/;]\s*/).map(normalize).filter(Boolean);
  if (options.includes(answer)) return 'right';
  if (options.some((option) => option.length >= 5 && distance(answer, option) <= 1)) return 'almost';
  return 'wrong';
}

// four choices: the right one and three others from the deck (never the same text twice)
export function choices(card, deck, direction, random = Math.random) {
  const right = prompt(card, direction).answer;
  const others = shuffle(deck.filter((item) => item.id !== card.id).map((item) => prompt(item, direction).answer)
    .filter((value, index, list) => key(value) !== key(right) && list.findIndex((other) => key(other) === key(value)) === index), random);
  return shuffle([right, ...others.slice(0, 3)], random);
}

// „Õpi”: every card is first asked with choices, then written; a card is learned after one right choice and one
// right written answer. A wrong answer sends it back one step and to the end of the round.
export function startLearn(deck) {
  return { queue: deck.map((card) => card.id), level: Object.fromEntries(deck.map((card) => [card.id, 0])), answered: 0, mistakes: 0 };
}

export function learnStep(state, cardId, correct) {
  const level = { ...state.level, [cardId]: correct ? Math.min(2, state.level[cardId] + 1) : Math.max(0, state.level[cardId] - 1) };
  const rest = state.queue.filter((id) => id !== cardId);
  const queue = level[cardId] >= 2 ? rest : [...rest, cardId];
  return { queue, level, answered: state.answered + 1, mistakes: state.mistakes + (correct ? 0 : 1) };
}

export const learnedCount = (state) => Object.values(state.level).filter((value) => value >= 2).length;

// „Test”: up to `size` questions of mixed kinds over a shuffled deck
export function buildTest(deck, { size = 10, direction = 'back', random = Math.random } = {}) {
  const kinds = ['choice', 'write', 'truefalse'];
  return shuffle(deck, random).slice(0, size).map((card, index) => {
    const kind = deck.length < 4 && kinds[index % 3] === 'choice' ? 'write' : kinds[index % 3];
    if (kind === 'truefalse') {
      const others = deck.filter((item) => item.id !== card.id);
      const truth = !others.length || random() < 0.5;
      const shown = truth ? card : others[Math.floor(random() * others.length)];
      return { card, kind, shownAnswer: prompt(shown, direction).answer, truth: truth || key(prompt(shown, direction).answer) === key(prompt(card, direction).answer) };
    }
    return { card, kind, options: kind === 'choice' ? choices(card, deck, direction, random) : [] };
  });
}
