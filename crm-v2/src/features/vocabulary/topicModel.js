// „Sõnavara → Teemad” (owner, 2026-10-13): all words of the student's course at once, grouped by topic (course
// module). A topic opens after the previous one is passed: first the repetition cycle („Kordamine”: every word
// learned once in „Õpi”), then a short mixed test („Kinnita teadmisi”, ≥ 80 %). A passed topic's words go to
// „Minu sõnad” (studentWords, fixed ids lw_<student>_<lesson>_<n>) and are reviewed there with the Leitner boxes.
// The unlock is enforced in the app only (the rules let a student create own words with box 0 anyway).
import { checkAnswer, choices, prompt, shuffle } from './deckModel.js';
import { hasLessonWords, lessonWordId } from './lessonWords.js';

export const MIN_TOPIC_WORDS = 4;
export const CYCLE_CHUNK = 10;
export const TEST_SIZE = 14;
export const MATCH_PAIRS = 4;
export const PASS_RATE = 0.8;

const key = (value) => String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase('et');

// a level has topics when its lessons are course lessons with a word list
export const levelHasWords = (level) => (level?.modules || []).some((module) => module.lessons.some((lesson) => hasLessonWords(lesson.id)));

// [{ key, title, lessonIds, words: [{ id, et, ru, ex }] }] in curriculum order. A word is taken once per level: inside a
// topic and from the earlier topics (so „Minu sõnad” gets no duplicates); a topic with too few words is left out.
export function buildTopics(level, wordsByLesson = {}, studentId = '') {
  const seen = new Set();
  return (level?.modules || []).map((module) => {
    const words = [];
    for (const lesson of module.lessons) {
      (wordsByLesson[lesson.id] || []).forEach((word, index) => {
        if (!word?.et || !word?.ru || seen.has(key(word.et))) return;
        seen.add(key(word.et));
        words.push({ id: lessonWordId(studentId, lesson.id, index), et: word.et, ru: word.ru, ex: word.ex || '' });
      });
    }
    return { key: module.key, title: module.label, lessonIds: module.lessons.map((lesson) => lesson.id), words };
  }).filter((topic) => topic.words.length >= MIN_TOPIC_WORDS);
}

// a topic word is in „Minu sõnad” under its fixed id — or the student already has the same word (it is not added twice)
function ownIndex(studentWords = []) {
  return { ids: new Set(studentWords.map((word) => word.id)), words: new Set(studentWords.map((word) => key(word.word))) };
}
const present = (word, index) => index.ids.has(word.id) || index.words.has(key(word.et));

export function topicPassed(topic, studentWords = [], index = ownIndex(studentWords)) {
  return topic.words.every((word) => present(word, index));
}

// state: 'passed' | 'open' (the first topic not passed) | 'locked'
export function topicStates(topics = [], studentWords = []) {
  const index = ownIndex(studentWords);
  let opened = false;
  return topics.map((topic) => {
    if (topicPassed(topic, studentWords, index)) return { ...topic, state: 'passed' };
    if (opened) return { ...topic, state: 'locked' };
    opened = true;
    return { ...topic, state: 'open' };
  });
}

// the words a passed test writes into „Minu sõnad”
export function wordsToAdd(topic, studentWords = []) {
  const index = ownIndex(studentWords);
  return topic.words.filter((word) => !present(word, index))
    .map((word) => ({ id: word.id, word: word.et, translation: word.ru, example: word.ex }));
}

export const topicCards = (topic) => topic.words.map((word) => ({ id: word.id, front: word.et, back: word.ru, hint: '' }));

// the repetition cycle: the learned word ids (kept on the device) against the topic
export function cycleProgress(topic, learnedIds = []) {
  const learned = new Set(learnedIds);
  const count = topic.words.filter((word) => learned.has(word.id)).length;
  return { learned: count, total: topic.words.length, done: topic.words.length > 0 && count === topic.words.length };
}

// the next portion of the cycle: words not learned yet, CYCLE_CHUNK at a time (a module has ~100 words);
// a short rest is joined to the previous portion so „Õpi” always has four cards for its choices
export function nextCycleCards(topic, learnedIds = [], size = CYCLE_CHUNK) {
  const learned = new Set(learnedIds);
  const rest = topicCards(topic).filter((card) => !learned.has(card.id));
  if (rest.length >= MIN_TOPIC_WORDS) return rest.slice(0, rest.length - size < MIN_TOPIC_WORDS ? rest.length : size);
  // the last one to three words: learn them with a few learned ones (the choices need four cards)
  const fill = topicCards(topic).filter((card) => learned.has(card.id)).slice(0, MIN_TOPIC_WORDS - rest.length);
  return [...rest, ...fill];
}

// „Kinnita teadmisi”: TEST_SIZE words — a block of MATCH_PAIRS pairs to match, then meaning choices and written words
// (the meaning is shown, the Estonian word is written). Every word is one point.
export function buildTopicTest(topic, { size = TEST_SIZE, random = Math.random } = {}) {
  const deck = topicCards(topic);
  const picked = shuffle(deck, random).slice(0, Math.min(size, deck.length));
  const pairs = picked.length >= MATCH_PAIRS * 2 ? picked.slice(0, MATCH_PAIRS) : [];
  const rest = picked.slice(pairs.length);
  const questions = rest.map((card, index) => (index % 2 === 0 && deck.length >= MIN_TOPIC_WORDS
    ? { id: card.id, kind: 'choice', card, ask: card.front, answer: card.back, options: choices(card, deck, 'back', random) }
    : { id: card.id, kind: 'write', card, ask: card.back, answer: card.front }));
  const match = pairs.length ? { kind: 'match', cards: pairs, options: shuffle(pairs.map((card) => prompt(card, 'back').answer), random) } : null;
  return { match, questions, total: picked.length };
}

// answers: { [cardId]: value } (a match answer is the chosen meaning for the card)
export function gradeTopicTest(test, answers = {}) {
  const missed = [];
  let score = 0;
  for (const card of test.match?.cards || []) {
    if (answers[card.id] && key(answers[card.id]) === key(card.back)) score += 1; else missed.push(card);
  }
  for (const question of test.questions) {
    const given = answers[question.id];
    const right = question.kind === 'choice' ? key(given) === key(question.answer) : checkAnswer(given, question.answer) !== 'wrong';
    if (right) score += 1; else missed.push(question.card);
  }
  const rate = test.total ? score / test.total : 0;
  return { score, total: test.total, percent: Math.round(rate * 100), passed: test.total > 0 && rate >= PASS_RATE, missed };
}

// the learned word ids of a topic on this device (localStorage may be missing or blocked: then the cycle starts anew)
const storageKey = (studentId, topicKey) => `keelesepp.vocabTopics.${studentId}.${topicKey}`;
export function readLearned(studentId, topicKey, storage = globalThis.localStorage) {
  try {
    const value = JSON.parse(storage?.getItem(storageKey(studentId, topicKey)) || '[]');
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
  } catch { return []; }
}
export function saveLearned(studentId, topicKey, ids = [], storage = globalThis.localStorage) {
  try { storage?.setItem(storageKey(studentId, topicKey), JSON.stringify([...new Set(ids)])); } catch { /* the session still works */ }
}
