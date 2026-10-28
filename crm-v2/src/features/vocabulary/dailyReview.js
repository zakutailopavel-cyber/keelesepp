// „Päeva 5 minutit” (owner 2026-10-23, docs/LEARNER_PROFILE.md step 1): one button, about ten cards, no choosing. The
// words the student is forgetting come first (asked again and not known), then the ones due by their Leitner box (the
// longest waiting first), then a few he has never practised, and at most two of his own corrected sentences.
// The cards move in their boxes as in any session (wordsModel.review), so tomorrow's set follows today's answers.
import { deckFromWords } from './deckModel.js';
import { isDue } from './wordsModel.js';
import { localDate } from '../../utils/localDate.js';

export const DAILY_SIZE = 10;
export const DAILY_NEW = 3;
export const DAILY_SENTENCES = 2;
const SENTENCE = 'Sinu lause:';

const time = (value) => Date.parse(value || '') || 0;
const isSentence = (word) => String(word?.translation || '').startsWith(SENTENCE);

export function dailyWords(words = [], { now = Date.now(), size = DAILY_SIZE } = {}) {
  const forgotten = words.filter((word) => !isSentence(word) && (word.box || 0) === 0 && (word.reviews || 0) > 0)
    .sort((a, b) => time(a.reviewedAt) - time(b.reviewedAt));
  const due = words.filter((word) => !isSentence(word) && (word.reviews || 0) > 0 && (word.box || 0) > 0 && isDue(word, now))
    .sort((a, b) => time(a.dueAt) - time(b.dueAt));
  const fresh = words.filter((word) => !isSentence(word) && !(word.reviews > 0)).sort((a, b) => time(a.createdAt) - time(b.createdAt));
  const sentences = words.filter((word) => isSentence(word) && isDue(word, now)).sort((a, b) => time(a.dueAt) - time(b.dueAt));
  const picked = [];
  const take = (list, max) => { for (const word of list) { if (picked.length >= size || max <= 0) break; if (!picked.includes(word)) { picked.push(word); max -= 1; } } };
  take(sentences, DAILY_SENTENCES);
  take(forgotten, size);
  take(due, size);
  take(fresh, DAILY_NEW);
  return picked;
}

// what the student sees before he starts, and whether today's five minutes are done
export function dailyPlan(words = [], { now = Date.now(), today = localDate(new Date(now)) } = {}) {
  const picked = dailyWords(words, { now });
  const forgotten = picked.filter((word) => (word.box || 0) === 0 && word.reviews > 0 && !isSentence(word)).length;
  const fresh = picked.filter((word) => !(word.reviews > 0)).length;
  const reviewedToday = words.filter((word) => String(word.reviewedAt || '').slice(0, 10) === today).length;
  const goal = Math.min(5, picked.length + reviewedToday);
  return { words: picked, deck: deckFromWords(picked), count: picked.length, forgotten, fresh, reviewedToday, done: goal > 0 && reviewedToday >= goal };
}
