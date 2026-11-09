// One practice lesson as it runs (docs/PRACTICE_ENGINE.md „Session”): the items in order, then — Duolingo style — one
// more round of the items answered wrong. Pure, immutable: every step returns a new session.
import { checkItem } from './items.js';

export function createSession(items = []) {
  return { items, queue: items.map((_, i) => i), pos: 0, phase: items.length ? 'main' : 'done', retry: [], log: [] };
}

export const currentItem = (s) => (s.phase === 'done' ? null : s.items[s.queue[s.pos]] || null);
export const isRetry = (s) => s.phase === 'retry';

// steps done out of all steps (the retry round adds its items to the total when it starts)
export function progressOf(s) {
  const total = s.items.length + (s.phase === 'retry' ? s.queue.length : 0);
  const done = s.phase === 'done' ? total : (s.phase === 'retry' ? s.items.length : 0) + s.pos;
  return total ? done / total : 1;
}

// grade the answer to the current item; a wrong first answer comes back in the retry round
export function submitAnswer(s, response) {
  const index = s.queue[s.pos];
  const item = s.items[index];
  if (!item) return { session: s, feedback: null };
  const feedback = checkItem(item, response);
  const entry = { index, id: item.id, phase: s.phase, verdict: feedback.verdict };
  const retry = s.phase === 'main' && feedback.verdict === 'wrong' ? [...s.retry, index] : s.retry;
  return { session: { ...s, retry, log: [...s.log, entry] }, feedback };
}

export function advance(s) {
  if (s.phase === 'done') return s;
  if (s.pos + 1 < s.queue.length) return { ...s, pos: s.pos + 1 };
  if (s.phase === 'main' && s.retry.length) return { ...s, phase: 'retry', queue: [...s.retry], pos: 0 };
  return { ...s, phase: 'done', pos: 0 };
}

const SENTENCE_TYPES = new Set(['build', 'listen', 'transform']);

// the lesson's result. correct = right on the first try; almost = right words without õ/ä/ö/ü (not counted as correct)
export function summaryOf(s, { minutes = 0 } = {}) {
  const first = s.log.filter((e) => e.phase === 'main');
  const again = s.log.filter((e) => e.phase === 'retry');
  const grammarPoints = [...new Set(s.items.flatMap((it) => it.grammar || []))];
  const sentenceShare = s.items.filter((it) => SENTENCE_TYPES.has(it.type)).length / (s.items.length || 1);
  // the points with a wrong first answer (phase 3 keeps them for spaced review)
  const missed = [...new Set(first.filter((e) => e.verdict === 'wrong').flatMap((e) => s.items[e.index]?.grammar || []))];
  return {
    kind: sentenceShare > 0.5 ? 'sentences' : 'grammar',
    total: s.items.length,
    correct: first.filter((e) => e.verdict === 'correct').length,
    almost: first.filter((e) => e.verdict === 'almost').length,
    wrong: first.filter((e) => e.verdict === 'wrong').length,
    retried: again.length,
    fixed: again.filter((e) => e.verdict !== 'wrong').length,
    grammarPoints,
    missed,
    minutes: Math.max(0, Math.round(minutes * 10) / 10),
  };
}
