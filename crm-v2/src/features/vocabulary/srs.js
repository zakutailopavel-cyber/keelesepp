// Spaced repetition for the student's words (2026-11-09, docs/VOCABULARY_SRS.md). Pure functions, no Firebase, no React.
//
// Algorithm: „FSRS-lite” — the FSRS-4.5 memory model with its published default weights (stability S in days,
// difficulty D 1–10, retrievability R = (1 + 19/81 · t/S)^-0.5, next interval = the day R falls to 90 %), the FSRS-5
// short-term formula for answers inside the learning steps, Anki-style learning steps (new: 1 min → 10 min; a lapse:
// 10 min) and four answers: Uuesti / Raske / Hea / Lihtne. No fuzz, so the same answers always give the same dates.
//
// Every word has two directions, each with its own state: `r` = recognition (et → meaning), `p` = production
// (meaning → et). `p` opens once `r` has left the learning steps. The state lives on the word's own `studentWords` doc
// in one map `srs: { v: 1, r: Side, p: Side }`; the old Leitner fields (box, dueAt, reviewedAt, reviews) are still
// written as a summary, so the pet, the word growth and the teacher reports keep working. A word without `srs` is
// migrated lazily from its Leitner box the first time it is answered (nothing is lost, nothing is written up front).
import { localDate } from '../../utils/localDate.js';

export const SRS_VERSION = 1;
export const RATINGS = Object.freeze(['again', 'hard', 'good', 'easy']);
export const RATING_LABELS = Object.freeze({ again: 'Uuesti', hard: 'Raske', good: 'Hea', easy: 'Lihtne' });
export const DIRECTIONS = Object.freeze(['r', 'p']);
export const DAILY_NEW = 10; // new words (directions) a day, default
export const DESIRED_RETENTION = 0.9;
export const MAX_INTERVAL_DAYS = 365;
export const LEARNING_STEPS_MIN = Object.freeze([1, 10]);
export const RELEARNING_STEPS_MIN = Object.freeze([10]);
export const LEARN_AHEAD_MIN = 20;
export const FIRST_GOOD_MAX_DAYS = 3; // a card due within this window comes back in the same session
// FSRS-4.5 default weights (open-spaced-repetition), and FSRS-5's two short-term weights
export const W = Object.freeze([0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755]);
const W_SHORT = Object.freeze([0.5034, 0.6567]);
const DECAY = -0.5;
const FACTOR = 19 / 81;
const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;
// the Leitner days of the old cards (wordsModel.BOX_DAYS), for the migration and the summary box
const BOX_DAYS = [0, 1, 3, 7, 14, 30];

const grade = (rating) => RATINGS.indexOf(rating) + 1;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, digits = 4) => Math.round(value * 10 ** digits) / 10 ** digits;
const ms = (value) => { const time = Date.parse(value || ''); return Number.isFinite(time) ? time : NaN; };
const toDate = (now) => (now instanceof Date ? now : new Date(now ?? Date.now()));
const int = (value) => (Number.isFinite(Number(value)) ? Math.max(0, Math.round(Number(value))) : 0);
const STATES = ['new', 'learning', 'review', 'relearning'];

export function newSide() {
  return { state: 'new', s: 0, d: 0, due: '', last: '', reps: 0, lapses: 0, step: 0, intro: '' };
}

// a side as stored (or partly stored) → a full, valid side
export function normalizeSide(side) {
  if (!side || typeof side !== 'object') return newSide();
  const state = STATES.includes(side.state) ? side.state : 'new';
  return {
    state,
    s: Number.isFinite(Number(side.s)) ? Math.max(0, Number(side.s)) : 0,
    d: Number.isFinite(Number(side.d)) ? clamp(Number(side.d), 0, 10) : 0,
    due: typeof side.due === 'string' ? side.due : '',
    last: typeof side.last === 'string' ? side.last : '',
    reps: int(side.reps),
    lapses: int(side.lapses),
    step: int(side.step),
    intro: typeof side.intro === 'string' ? side.intro.slice(0, 10) : '',
  };
}

// ── FSRS formulas ──
export const retrievability = (elapsedDays, stability) => (stability > 0 ? (1 + (FACTOR * Math.max(0, elapsedDays)) / stability) ** DECAY : 0);
export function intervalDays(stability, retention = DESIRED_RETENTION) {
  // rounded to 8 digits first: the float error made S = 2.5 (exactly 2.5 days at 90 %) round down to 2
  const days = round((stability / FACTOR) * (retention ** (1 / DECAY) - 1), 8);
  return clamp(Math.round(days), 1, MAX_INTERVAL_DAYS);
}
const initialDifficulty = (g) => clamp(W[4] - (g - 3) * W[5], 1, 10);
// FSRS-4.5: mean reversion towards D0(3) = w4 (D0(4) is FSRS-5's target, which belongs to FSRS-5's own weights)
const nextDifficulty = (d, g) => clamp(W[7] * initialDifficulty(3) + (1 - W[7]) * (d - W[6] * (g - 3)), 1, 10);
const recallStability = (d, s, r, g) => s * (1 + Math.exp(W[8]) * (11 - d) * s ** -W[9] * (Math.exp(W[10] * (1 - r)) - 1)
  * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1));
const forgetStability = (d, s, r) => Math.min(s, W[11] * d ** -W[12] * ((s + 1) ** W[13] - 1) * Math.exp(W[14] * (1 - r)));
const shortTermStability = (s, g) => Math.max(0.1, s * Math.exp(W_SHORT[0] * (g - 3 + W_SHORT[1])));

const inMinutes = (now, minutes) => new Date(now.getTime() + minutes * MINUTE).toISOString();
const inDays = (now, days) => new Date(now.getTime() + days * DAY).toISOString();

/**
 * One answer → the side's next state. `rating`: 'again' | 'hard' | 'good' | 'easy'.
 * Returns a new side; `due` is an ISO time (minutes away inside the learning steps, days away after them).
 */
export function schedule(side, rating, now = new Date()) {
  const g = grade(rating);
  if (g < 1) throw new Error(`Unknown rating: ${rating}`);
  const at = toDate(now);
  const card = normalizeSide(side);
  const next = { ...card, reps: card.reps + 1, last: at.toISOString(), intro: card.intro || localDate(at) };

  if (card.state === 'new') {
    next.s = round(W[g - 1]);
    next.d = round(initialDifficulty(g));
    if (g === 4) return graduate(next, at, intervalDays(next.s));
    next.state = 'learning';
    next.step = g === 3 ? 1 : 0;
    next.due = inMinutes(at, g === 1 ? LEARNING_STEPS_MIN[0] : g === 2 ? (LEARNING_STEPS_MIN[0] + LEARNING_STEPS_MIN[1]) / 2 : LEARNING_STEPS_MIN[1]);
    if (next.step >= LEARNING_STEPS_MIN.length) return graduate(next, at, intervalDays(next.s));
    return next;
  }

  if (card.state === 'learning' || card.state === 'relearning') {
    const steps = card.state === 'learning' ? LEARNING_STEPS_MIN : RELEARNING_STEPS_MIN;
    next.s = round(shortTermStability(card.s || W[2], g));
    next.d = round(nextDifficulty(card.d || initialDifficulty(3), g));
    if (g === 1) { next.step = 0; next.due = inMinutes(at, steps[0]); return next; }
    if (g === 2) { next.step = Math.min(card.step, steps.length - 1); next.due = inMinutes(at, steps[next.step] * 1.5); return next; }
    const good = intervalDays(next.s);
    // „Lihtne” always lands at least a day later than „Hea” would have
    if (g === 4) return graduate(next, at, Math.max(good, intervalDays(shortTermStability(card.s || W[2], 3)) + 1));
    next.step = card.step + 1;
    // a word met for the first time comes back within FIRST_GOOD_MAX_DAYS, whatever the model says (beginners forget fast)
    if (next.step >= steps.length) return graduate(next, at, card.state === 'learning' ? Math.min(good, FIRST_GOOD_MAX_DAYS) : good);
    next.due = inMinutes(at, steps[next.step]);
    return next;
  }

  // review
  const lastTime = ms(card.last);
  const elapsed = Number.isFinite(lastTime) ? (at.getTime() - lastTime) / DAY : 0;
  const s = card.s || W[2];
  const d = card.d || initialDifficulty(3);
  const r = retrievability(elapsed, s);
  next.d = round(nextDifficulty(d, g));
  if (g === 1) {
    next.state = 'relearning';
    next.step = 0;
    next.lapses = card.lapses + 1;
    next.s = round(Math.max(0.1, forgetStability(d, s, r)));
    next.due = inMinutes(at, RELEARNING_STEPS_MIN[0]);
    return next;
  }
  const [hard, good, easy] = [2, 3, 4].map((value) => recallStability(d, s, r, value));
  let hardDays = intervalDays(hard);
  let goodDays = intervalDays(good);
  let easyDays = intervalDays(easy);
  hardDays = Math.min(hardDays, goodDays);
  goodDays = Math.max(goodDays, hardDays + 1);
  easyDays = Math.max(easyDays, goodDays + 1);
  next.s = round(g === 2 ? hard : g === 3 ? good : easy);
  return graduate(next, at, clamp(g === 2 ? hardDays : g === 3 ? goodDays : easyDays, 1, MAX_INTERVAL_DAYS));
}

function graduate(next, at, days) {
  return { ...next, state: 'review', step: 0, due: inDays(at, days) };
}

// what each of the four buttons would do now: { again: ms, hard: ms, good: ms, easy: ms }
export function previewIntervals(side, now = new Date()) {
  const at = toDate(now);
  return Object.fromEntries(RATINGS.map((rating) => [rating, ms(schedule(side, rating, at).due) - at.getTime()]));
}

// „<1 min”, „10 min”, „3 h”, „4 p” (päeva), „2 k” (kuud), „1,2 a”
export function formatInterval(milliseconds) {
  const minutes = Math.max(0, milliseconds) / MINUTE;
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} h`;
  const days = hours / 24;
  if (days < 31) return `${Math.round(days)} p`;
  if (days < 365) return `${Math.round(days / 30)} k`;
  return `${(days / 365).toFixed(1).replace('.', ',')} a`;
}

// ── storage on the word doc ──

// the old Leitner fields → the recognition side (box 0 + answered = forgotten, relearning; box ≥ 1 = review with the
// box's days as stability). Production was never asked separately, so it starts new.
export function fromLegacy(word = {}, now = new Date()) {
  const reviews = int(word.reviews);
  const box = Number.isInteger(word.box) ? clamp(word.box, 0, 5) : 0;
  if (!reviews && !box) return newSide();
  const at = toDate(now);
  const due = Number.isFinite(ms(word.dueAt)) ? new Date(ms(word.dueAt)).toISOString() : at.toISOString();
  const intro = String(word.createdAt || word.reviewedAt || '').slice(0, 10);
  if (!box) {
    return { ...newSide(), state: 'relearning', s: round(W[0]), d: 7, due, last: word.reviewedAt || '', reps: reviews, lapses: 1, step: 0, intro };
  }
  const s = BOX_DAYS[box];
  const last = word.reviewedAt || new Date(ms(due) - s * DAY).toISOString();
  return { ...newSide(), state: 'review', s, d: round(clamp(6.5 - box, 1, 10)), due, last, reps: reviews, lapses: 0, step: 0, intro };
}

// the word's two sides, migrated when the word has no `srs` yet
export function wordSrs(word = {}, now = new Date()) {
  const stored = word.srs && typeof word.srs === 'object' ? word.srs : null;
  return {
    v: SRS_VERSION,
    r: stored?.r ? normalizeSide(stored.r) : fromLegacy(word, now),
    p: stored?.p ? normalizeSide(stored.p) : newSide(),
  };
}

// production opens once recognition has left the first learning steps
export const reverseOpen = (srs) => ['review', 'relearning'].includes(srs?.r?.state);

export function boxFor(side) {
  if (!side || side.state !== 'review') return 0;
  let box = 1;
  BOX_DAYS.forEach((days, index) => { if (index && side.s >= days) box = index; });
  return box;
}

/**
 * The write for one answer: the new `srs` map plus the old summary fields.
 * `nextSide` may be given (the session already scheduled it); otherwise it is scheduled from `rating`.
 */
export function ratingPatch(word, direction, rating, now = new Date(), nextSide = null) {
  const at = toDate(now);
  const dir = DIRECTIONS.includes(direction) ? direction : 'r';
  const srs = wordSrs(word, at);
  const side = nextSide ? normalizeSide(nextSide) : schedule(srs[dir], rating, at);
  const next = { v: SRS_VERSION, r: srs.r, p: srs.p, [dir]: side };
  const started = DIRECTIONS.map((key) => next[key]).filter((item) => item.state !== 'new' && item.due);
  const dueAt = started.map((item) => item.due).sort()[0] || at.toISOString();
  const stored = { v: SRS_VERSION, r: next.r };
  if (next.p.state !== 'new') stored.p = next.p;
  return {
    srs: stored,
    box: boxFor(next.r),
    dueAt,
    reviewedAt: at.toISOString(),
    reviews: int(word.reviews) + 1,
  };
}

// ── the daily queue („Täna kordamiseks”) ──
const SENTENCE = 'Sinu lause:';
export const isSentence = (word) => String(word?.translation || '').startsWith(SENTENCE);
const hasText = (word) => String(word?.word || '').trim() && String(word?.translation || word?.example || '').trim();
const time = (value) => ms(value) || 0;

/**
 * Today's queue: everything due (learning steps first, then the most overdue reviews), then new directions up to the
 * daily cap (minus those already started today). Own corrected sentences are asked one way only, at most `sentences`.
 * Returns { items: [{ key, word, dir, side, kind }], due, fresh, introducedToday, newLeft, nextDue }.
 */
export function buildQueue(words = [], { now = Date.now(), newPerDay = DAILY_NEW, sentences = 2, maxReviews = 200 } = {}) {
  const at = toDate(now);
  const today = localDate(at);
  const due = [];
  const fresh = [];
  let introducedToday = 0;
  let sentenceCount = 0;
  let nextDue = '';
  for (const word of words) {
    if (!word?.id || !hasText(word)) continue;
    const srs = wordSrs(word, at);
    const sentence = isSentence(word);
    for (const dir of sentence ? ['r'] : DIRECTIONS) {
      const side = srs[dir];
      if (side.state !== 'new' && side.intro === today) introducedToday += 1;
      if (dir === 'p' && !reverseOpen(srs)) continue;
      const item = { key: `${word.id}:${dir}`, word, dir, side };
      if (side.state === 'new') { fresh.push({ ...item, kind: 'new' }); continue; }
      if (time(side.due) <= at.getTime()) {
        if (sentence) { if (sentenceCount >= sentences) continue; sentenceCount += 1; }
        due.push({ ...item, kind: side.state === 'review' ? 'review' : 'learning' });
      } else if (!nextDue || side.due < nextDue) nextDue = side.due;
    }
  }
  due.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'learning' ? -1 : 1) || time(a.side.due) - time(b.side.due));
  fresh.sort((a, b) => time(a.word.createdAt) - time(b.word.createdAt) || (a.dir === b.dir ? 0 : a.dir === 'r' ? -1 : 1));
  const newLeft = Math.max(0, newPerDay - introducedToday);
  const taken = fresh.slice(0, newLeft);
  const reviews = due.slice(0, maxReviews);
  return { items: [...reviews, ...taken], due: reviews.length, fresh: taken.length, introducedToday, newLeft, waiting: fresh.length, nextDue };
}

// the earliest time something will be due after now (for „Järgmine kordamine”)
export function nextReviewAt(words = [], now = Date.now()) {
  const at = toDate(now);
  let next = '';
  for (const word of words) {
    const srs = wordSrs(word, at);
    for (const dir of DIRECTIONS) {
      const side = srs[dir];
      if (side.state === 'new' || !side.due || time(side.due) <= at.getTime()) continue;
      if (!next || side.due < next) next = side.due;
    }
  }
  return next;
}

// ── one study session (pure; the flashcards keep it in React state) ──

/** items: [{ key, side?, ... }] — a missing side starts new (course words: practice only, kept in memory). */
export function startSession(items = [], now = Date.now()) {
  return {
    startedAt: toDate(now).toISOString(),
    queue: items.map((item, index) => ({ ...item, side: normalizeSide(item.side), showAt: 0, order: index, startState: normalizeSide(item.side).state })),
    current: items.length ? 0 : -1,
    answers: [],
    finished: [],
    total: items.length,
    lastKey: '',
  };
}

// the next card: the first one whose time has come; if none has, the earliest learning card (learning ahead)
export function pickNext(queue = [], now = Date.now(), lastKey = '') {
  if (!queue.length) return -1;
  const at = toDate(now).getTime();
  const ready = queue.map((item, index) => ({ item, index })).filter(({ item }) => item.showAt <= at);
  const pool = ready.length ? ready : queue.map((item, index) => ({ item, index })).sort((a, b) => a.item.showAt - b.item.showAt);
  const choice = pool.find(({ item }) => item.key !== lastKey) || pool[0];
  return choice.index;
}

export function rateInSession(session, rating, now = Date.now()) {
  const at = toDate(now);
  const index = session.current;
  const item = session.queue[index];
  if (!item) return { session, item: null, side: null };
  const side = schedule(item.side, rating, at);
  const firstTry = !session.answers.some((answer) => answer.key === item.key);
  const answers = [...session.answers, { key: item.key, rating, firstTry, at: at.toISOString() }];
  const rest = session.queue.filter((_, position) => position !== index);
  const comesBack = ms(side.due) - at.getTime() <= LEARN_AHEAD_MIN * MINUTE;
  const queue = comesBack ? [...rest, { ...item, side, showAt: ms(side.due) }] : rest;
  const finished = comesBack ? session.finished : [...session.finished, { ...item, side }];
  const next = { ...session, queue, answers, finished, lastKey: item.key };
  next.current = pickNext(queue, at, item.key);
  return { session: next, item, side };
}

export function sessionStats(session, now = Date.now()) {
  const first = session.answers.filter((answer) => answer.firstTry);
  const correctFirst = first.filter((answer) => answer.rating !== 'again').length;
  const learned = session.finished.filter((item) => item.startState === 'new').length;
  const nextDue = session.finished.map((item) => item.side.due).filter(Boolean).sort()[0] || '';
  const minutes = Math.max(0, (toDate(now).getTime() - ms(session.startedAt)) / MINUTE);
  return {
    cards: session.total,
    reviewed: session.answers.length,
    correct: session.answers.filter((answer) => answer.rating !== 'again').length,
    firstTry: first.length,
    correctFirst,
    percent: first.length ? Math.round((correctFirst / first.length) * 100) : 0,
    learned,
    nextDue,
    minutes: round(minutes, 1),
  };
}
