// „Täna kordamiseks” (owner 2026-10-23 „Päeva 5 minutit”; since 2026-11-09 on the spaced repetition queue, srs.js):
// one button, no choosing. Everything due today (learning steps first, then the most overdue reviews), then new words
// up to the daily cap, at most two of the student's own corrected sentences. Every answer moves the word's schedule
// (studentWordsService.rate), so tomorrow's queue follows today's answers.
import { deckFromWords } from './deckModel.js';
import { buildQueue, DAILY_NEW } from './srs.js';
import { localDate } from '../../utils/localDate.js';

export { DAILY_NEW };
export const DAILY_SENTENCES = 2;
export const DAILY_SIZE = 10;
const FEED_NEW = 3;
const SENTENCE = 'Sinu lause:';
const time = (value) => Date.parse(value || '') || 0;
const isSentence = (word) => String(word?.translation || '').startsWith(SENTENCE);

// A short pick of about `size` words by the summary fields (box / dueAt / reviews, which every answer still writes):
// the ones being forgotten first, then the most overdue, then a few never practised, at most two own sentences.
// Used where a handful of words is enough (the pet's feeding, petLoop.js); the study queue itself is buildQueue.
export function dailyWords(words = [], { now = Date.now(), size = DAILY_SIZE } = {}) {
  const due = (word) => !Number.isFinite(Date.parse(word?.dueAt || '')) || Date.parse(word.dueAt) <= now;
  const forgotten = words.filter((word) => !isSentence(word) && (word.box || 0) === 0 && (word.reviews || 0) > 0)
    .sort((a, b) => time(a.reviewedAt) - time(b.reviewedAt));
  const overdue = words.filter((word) => !isSentence(word) && (word.reviews || 0) > 0 && (word.box || 0) > 0 && due(word))
    .sort((a, b) => time(a.dueAt) - time(b.dueAt));
  const fresh = words.filter((word) => !isSentence(word) && !(word.reviews > 0)).sort((a, b) => time(a.createdAt) - time(b.createdAt));
  const sentences = words.filter((word) => isSentence(word) && due(word)).sort((a, b) => time(a.dueAt) - time(b.dueAt));
  const picked = [];
  const take = (list, max) => { for (const word of list) { if (picked.length >= size || max <= 0) break; if (!picked.includes(word)) { picked.push(word); max -= 1; } } };
  take(sentences, DAILY_SENTENCES);
  take(forgotten, size);
  take(overdue, size);
  take(fresh, FEED_NEW);
  return picked;
}

// the queue items as flashcard cards (each with its own direction)
export function queueCards(items = []) {
  const byId = new Map(deckFromWords(items.map((item) => item.word)).map((card) => [card.id, card]));
  return items.map((item) => ({ ...byId.get(item.word.id), key: item.key, dir: item.dir, side: item.side, kind: item.kind })).filter((card) => card.id);
}

// what the student sees before he starts, and whether today's queue is done
export function dailyPlan(words = [], { now = Date.now(), newPerDay = DAILY_NEW, today = localDate(new Date(now)) } = {}) {
  const queue = buildQueue(words, { now, newPerDay, sentences: DAILY_SENTENCES });
  const picked = [...new Map(queue.items.map((item) => [item.word.id, item.word])).values()];
  const reviewedToday = words.filter((word) => localDate(new Date(Date.parse(word.reviewedAt || '') || 0)) === today && word.reviewedAt).length;
  return {
    items: queue.items,
    cards: queueCards(queue.items),
    words: picked,
    deck: deckFromWords(picked),
    count: queue.items.length,
    due: queue.due,
    fresh: queue.fresh,
    forgotten: queue.items.filter((item) => item.side.state === 'relearning').length,
    waiting: queue.waiting,
    newLeft: queue.newLeft,
    nextDue: queue.nextDue,
    reviewedToday,
    // „today's words are done” for the home page steps (todayPath / nextStep): five answered today — or all of today's
    // queue when it is shorter — as since 2026-10-23
    done: Math.min(5, queue.items.length + reviewedToday) > 0 && reviewedToday >= Math.min(5, queue.items.length + reviewedToday),
  };
}
