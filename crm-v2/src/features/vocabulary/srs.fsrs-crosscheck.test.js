// Cross-check of srs.js against the reference implementation ts-fsrs v5 (devDependency only, never shipped).
// ts-fsrs v5 implements FSRS-6; we give it our FSRS-4.5 weights + FSRS-5's two short-term weights, decay 0.5 and no
// fuzz, so the shared formulas must agree. The intended differences are listed in docs/VOCABULARY_SRS.md
// („Cross-check with ts-fsrs”) and asserted one by one at the end of this file.
import { describe, expect, it } from 'vitest';
import { fsrs, Rating, State } from 'ts-fsrs';
import { FIRST_GOOD_MAX_DAYS, intervalDays, LEARNING_STEPS_MIN, MAX_INTERVAL_DAYS, newSide, RATINGS, RELEARNING_STEPS_MIN, retrievability, schedule, W } from './srs.js';

const W_SHORT = [0.5034, 0.6567]; // srs.js W_SHORT (FSRS-5 w17, w18)
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const START = new Date('2026-01-05T08:00:00Z');

const reference = fsrs({
  w: [...W, ...W_SHORT, 0, 0.5], // w19 = 0 (no S^-w19 term in FSRS-5), w20 = decay 0.5 (FSRS-4.5/5 curve)
  request_retention: 0.9,
  maximum_interval: MAX_INTERVAL_DAYS,
  enable_fuzz: false,
  enable_short_term: true,
  learning_steps: LEARNING_STEPS_MIN.map((m) => `${m}m`),
  relearning_steps: RELEARNING_STEPS_MIN.map((m) => `${m}m`),
});
// ts-fsrs clamps w19 to ≥ 0.01 while short-term is on; FSRS-5 has no such term, so it is set back to 0 here
reference.parameters.w[19] = 0;

const GRADE = { again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy };
const TO_STATE = { new: State.New, learning: State.Learning, review: State.Review, relearning: State.Relearning };
const FROM_STATE = Object.fromEntries(Object.entries(TO_STATE).map(([k, v]) => [v, k]));
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// FSRS-4.5 difficulty, written from the published formulas (ts-fsrs v5 has FSRS-6 difficulty, see the docs)
const D0 = (g) => clamp(W[4] - (g - 3) * W[5], 1, 10);
const nextD = (d, g) => clamp(W[7] * D0(3) + (1 - W[7]) * (d - W[6] * (g - 3)), 1, 10);
const shortTerm = (s, g) => s * Math.exp(W_SHORT[0] * (g - 3 + W_SHORT[1])); // FSRS-5, no mask
const close = (actual, expected, tol = 1e-4) => {
  if (Math.abs(actual - expected) > tol + 1e-6 * Math.abs(expected)) throw new Error(`${actual} ≠ ${expected}`);
};

// our side → a ts-fsrs card with the same memory state (so each step is compared on equal inputs)
const toCard = (side, at) => ({
  due: side.due ? new Date(side.due) : at,
  stability: side.s,
  difficulty: side.d,
  elapsed_days: 0,
  scheduled_days: 0,
  reps: side.reps,
  lapses: side.lapses,
  learning_steps: side.step,
  state: TO_STATE[side.state],
  last_review: side.last ? new Date(side.last) : undefined,
});

// What srs.js should give for one answer: ts-fsrs's result with the documented differences applied.
function expected(side, rating, at) {
  const g = GRADE[rating];
  const ts = reference.next(toCard(side, at), at, g).card;
  const inSteps = side.state === 'learning' || side.state === 'relearning';
  const learning = side.state === 'learning' || side.state === 'new';
  let s = ts.stability;
  if (inSteps && rating === 'hard') s = shortTerm(side.s, 2); // (1) FSRS-5: „Raske” may lower S on the same day
  if (inSteps && rating === 'again') s = Math.max(0.1, s); // (6) floor 0.1
  if (side.state === 'review' && rating === 'again') {
    // (2) FSRS-4.5 post-lapse cap: min(S, S_f), not S / e^(w17·w18)
    const r = retrievability((at.getTime() - Date.parse(side.last)) / DAY, side.s);
    s = Math.max(0.1, Math.min(side.s, reference.next_forget_stability(side.d, side.s, r)));
  }
  let due = ts.due.getTime();
  const tsDays = Math.round((due - at.getTime()) / DAY);
  if (learning && rating === 'hard') { // (3) „Raske” in the steps: Anki's 5.5 min when new, else the step × 1.5
    due = at.getTime() + (side.state === 'new' ? (LEARNING_STEPS_MIN[0] + LEARNING_STEPS_MIN[1]) / 2 : LEARNING_STEPS_MIN[side.step] * 1.5) * MIN;
  }
  if (side.state === 'learning' && rating === 'good' && ts.state === State.Review) { // (4) first graduation ≤ 3 days
    due = at.getTime() + Math.min(tsDays, FIRST_GOOD_MAX_DAYS) * DAY;
  }
  if (inSteps && rating === 'easy') { // (5) „Lihtne” at least a day after what „Hea” would give
    due = at.getTime() + Math.max(tsDays, intervalDays(Math.max(0.1, shortTerm(side.s, 3))) + 1) * DAY;
  }
  if (side.state === 'review' && rating !== 'again') due = at.getTime() + Math.min(tsDays, MAX_INTERVAL_DAYS) * DAY; // (7)
  const d = side.state === 'new' ? D0(g) : nextD(side.d, g);
  return { state: FROM_STATE[ts.state], s, d, due, lapses: ts.lapses, reps: ts.reps };
}

// small deterministic PRNG
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rand, weighted) => {
  const total = weighted.reduce((sum, [, w]) => sum + w, 0);
  let x = rand() * total;
  for (const [value, w] of weighted) { x -= w; if (x < 0) return value; }
  return weighted[weighted.length - 1][0];
};

describe('srs.js vs ts-fsrs v5 — parameters', () => {
  it('ts-fsrs runs with exactly our weights, decay 0.5 and interval modifier 1 (R = 90 % at S days)', () => {
    expect(reference.parameters.w.slice(0, 19)).toEqual([...W, ...W_SHORT]);
    expect(reference.parameters.w[19]).toBe(0);
    expect(reference.parameters.w[20]).toBe(0.5);
    expect(reference.interval_modifier).toBeCloseTo(1, 7);
  });
});

describe('srs.js vs ts-fsrs v5 — formulas', () => {
  const STABILITIES = [0.1, 0.4872, 1, 2.5, 3.7145, 7, 13.8206, 30, 90, 240, 700];
  const DIFFICULTIES = [1, 2.5, 5.1618, 7.6, 10];
  const ELAPSED = [1, 2, 5, 13, 40, 120, 400];

  it('forgetting curve and interval', () => {
    for (const s of STABILITIES) {
      for (const t of [0, ...ELAPSED, 0.25]) close(retrievability(t, s), reference.forgetting_curve(t, s), 1e-7);
      expect(intervalDays(s)).toBe(reference.next_interval(s, 0));
    }
  });

  it('initial stability and difficulty of a new card', () => {
    RATINGS.forEach((rating, k) => {
      const side = schedule(newSide(), rating, START);
      close(side.s, reference.init_stability(k + 1));
      close(side.d, D0(k + 1));
    });
  });

  it('recall and forget stability in review, for every grade, stability, difficulty and gap', () => {
    let checked = 0;
    for (const s of STABILITIES) for (const d of DIFFICULTIES) for (const t of ELAPSED) {
      const last = START.toISOString();
      const at = new Date(START.getTime() + t * DAY);
      const side = { ...newSide(), state: 'review', s, d, last, due: last, reps: 3 };
      const r = reference.forgetting_curve(t, s);
      for (const rating of ['hard', 'good', 'easy']) {
        close(schedule(side, rating, at).s, Math.min(36500, reference.next_recall_stability(d, s, r, GRADE[rating])), 1e-4 + 5e-5 * s);
        checked += 1;
      }
      close(schedule(side, 'again', at).s, Math.max(0.1, Math.min(s, reference.next_forget_stability(d, s, r))));
      close(schedule(side, 'good', at).d, nextD(d, 3));
      checked += 1;
    }
    expect(checked).toBe(STABILITIES.length * DIFFICULTIES.length * ELAPSED.length * 4);
  });

  it('same-day (learning step) stability for Uuesti / Hea / Lihtne', () => {
    for (const s of STABILITIES) {
      const side = { ...newSide(), state: 'learning', s, d: 5, step: 0, last: START.toISOString(), due: START.toISOString(), reps: 1 };
      for (const rating of ['again', 'good', 'easy']) {
        close(schedule(side, rating, START).s, Math.max(0.1, reference.next_short_term_stability(s, GRADE[rating])));
      }
    }
  });
});

describe('srs.js vs ts-fsrs v5 — rating sequences', () => {
  // new → learning → review → relearning, lapses, on-time reviews, late reviews and long gaps (up to ~1,5 years)
  const GAPS = [[0, 5], [1, 2], [3, 1], [10, 1], [60, 1], [200, 1], [500, 0.5]];
  const RATING_MIX = [['again', 2], ['hard', 1.5], ['good', 5], ['easy', 1.5]];

  it('400 random sequences: state, interval, stability, difficulty, reps and lapses agree at every answer', () => {
    const rand = mulberry32(20261109);
    const seen = { new: 0, learning: 0, review: 0, relearning: 0, lapses: 0, longGaps: 0 };
    let answers = 0;
    for (let n = 0; n < 400; n += 1) {
      let side = newSide();
      let at = new Date(START.getTime() + n * 7 * DAY);
      const length = 4 + Math.floor(rand() * 14);
      for (let step = 0; step < length; step += 1) {
        const rating = pick(rand, RATING_MIX);
        if (side.state === 'review') {
          const gap = pick(rand, GAPS);
          if (gap >= 60) seen.longGaps += 1;
          at = new Date(Date.parse(side.due) + gap * DAY);
        } else if (side.state !== 'new') at = new Date(side.due);
        seen[side.state] += 1;
        const want = expected(side, rating, at);
        const got = schedule(side, rating, at);
        const where = `sequence ${n}, answer ${step} (${side.state} → ${rating})`;
        expect(got.state, where).toBe(want.state);
        expect(Date.parse(got.due) - at.getTime(), where).toBe(want.due - at.getTime());
        expect(got.reps, where).toBe(want.reps);
        expect(got.lapses, where).toBe(want.lapses);
        try {
          close(got.s, want.s, 1e-4 + 5e-5 * want.s);
          close(got.d, want.d);
        } catch (error) { throw new Error(`${where}: ${error.message}`); }
        if (got.lapses > side.lapses) seen.lapses += 1;
        side = got;
        answers += 1;
      }
    }
    expect(answers).toBeGreaterThan(3000);
    expect(seen.relearning).toBeGreaterThan(100);
    expect(seen.lapses).toBeGreaterThan(100);
    expect(seen.longGaps).toBeGreaterThan(50);
  });
});

describe('intended differences from ts-fsrs v5 (docs/VOCABULARY_SRS.md)', () => {
  const at = START;
  const learning = { ...newSide(), state: 'learning', s: 3.7145, d: 5.1618, step: 1, last: at.toISOString(), due: at.toISOString(), reps: 1 };
  const ts = (side, rating, when = at) => reference.next(toCard(side, when), when, GRADE[rating]).card;

  it('(1) „Raske” in the steps lowers S by the FSRS-5 formula; ts-fsrs (FSRS-6) never lowers it', () => {
    expect(schedule(learning, 'hard', at).s).toBeLessThan(learning.s);
    expect(ts(learning, 'hard').stability).toBeCloseTo(learning.s, 6);
  });

  it('(2) post-lapse S is capped at S (FSRS-4.5), not S / e^(w17·w18)', () => {
    const side = { ...newSide(), state: 'review', s: 0.6, d: 1, last: at.toISOString(), due: at.toISOString(), reps: 4 };
    const later = new Date(at.getTime() + 40 * DAY);
    expect(schedule(side, 'again', later).s).toBeCloseTo(0.6, 4);
    expect(ts(side, 'again', later).stability).toBeLessThan(0.6);
  });

  it('(3) „Raske” in the steps: 5.5 min for a new card, then the current step × 1.5 (ts-fsrs: 6 min always)', () => {
    expect(Date.parse(schedule(newSide(), 'hard', at).due) - at.getTime()).toBe(5.5 * MIN);
    expect(Date.parse(schedule(learning, 'hard', at).due) - at.getTime()).toBe(15 * MIN);
    expect(ts(learning, 'hard').due.getTime() - at.getTime()).toBe(6 * MIN);
  });

  it('(4) the first graduation with „Hea” is at most 3 days', () => {
    expect(Date.parse(schedule(learning, 'good', at).due) - at.getTime()).toBe(FIRST_GOOD_MAX_DAYS * DAY);
    expect(ts(learning, 'good').scheduled_days).toBeGreaterThan(FIRST_GOOD_MAX_DAYS);
  });

  it('(8) difficulty follows FSRS-4.5 (linear D0, mean reversion to D0(3)), ts-fsrs v5 has FSRS-6 difficulty', () => {
    expect(schedule(newSide(), 'again', at).d).toBeCloseTo(D0(1), 4);
    expect(reference.next(toCard(newSide(), at), at, Rating.Again).card.difficulty).not.toBeCloseTo(D0(1), 1);
  });

  it('(9) a learning step answered on a later day still uses the same-day formula (ts-fsrs: the long-term one)', () => {
    const late = new Date(at.getTime() + 2 * DAY);
    expect(schedule(learning, 'good', late).s).toBeCloseTo(shortTerm(learning.s, 3), 4);
    expect(ts(learning, 'good', late).stability).not.toBeCloseTo(shortTerm(learning.s, 3), 2);
  });

  it('(7) review intervals stay ≤ 365 days even when „Hea” / „Lihtne” are pushed one day past „Raske”', () => {
    const side = { ...newSide(), state: 'review', s: 600, d: 1, last: at.toISOString(), due: at.toISOString(), reps: 9 };
    const later = new Date(at.getTime() + 400 * DAY);
    for (const rating of ['hard', 'good', 'easy']) expect(Date.parse(schedule(side, rating, later).due) - later.getTime()).toBeLessThanOrEqual(365 * DAY);
    expect(ts(side, 'easy', later).scheduled_days).toBeGreaterThan(365);
  });
});

describe('fixed bugs', () => {
  it('a half-day stability rounds up like ts-fsrs (S = 2.5 → 3 days, was 2 by float error)', () => {
    expect(intervalDays(2.5)).toBe(3);
    expect(intervalDays(0.5)).toBe(1);
    expect(intervalDays(6.5)).toBe(7);
  });

  it('FSRS-4.5 mean reversion: difficulty drifts back towards D0(3) = w4, not D0(4)', () => {
    // a card at D = w4 answered „Hea” keeps D = w4 exactly (D0(4) would pull it down every review)
    const side = { ...newSide(), state: 'review', s: 10, d: W[4], last: START.toISOString(), due: START.toISOString(), reps: 3 };
    expect(schedule(side, 'good', new Date(START.getTime() + 10 * DAY)).d).toBeCloseTo(W[4], 4);
  });
});
