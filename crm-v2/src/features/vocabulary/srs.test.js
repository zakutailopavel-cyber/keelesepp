import {
  boxFor, buildQueue, formatInterval, fromLegacy, newSide, nextReviewAt, pickNext, previewIntervals, rateInSession, ratingPatch,
  retrievability, reverseOpen, schedule, sessionStats, startSession, wordSrs, intervalDays,
} from './srs.js';

const now = new Date('2026-11-09T10:00:00Z');
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const later = (date, msec) => new Date(date.getTime() + msec);
const away = (side, from) => Date.parse(side.due) - from.getTime();
const word = (id, extra = {}) => ({ id, word: id, translation: `${id}-ru`, createdAt: '2026-10-01T10:00:00Z', box: 0, reviews: 0, ...extra });

describe('FSRS-lite: one side', () => {
  it('a new word goes through the learning steps 1 min → 10 min, then days', () => {
    const intervals = previewIntervals(newSide(), now);
    expect(intervals.again).toBe(1 * MIN);
    expect(intervals.hard).toBe(5.5 * MIN);
    expect(intervals.good).toBe(10 * MIN);
    expect(intervals.easy).toBeGreaterThanOrEqual(10 * DAY);
    const step1 = schedule(newSide(), 'good', now);
    expect(step1).toMatchObject({ state: 'learning', step: 1, reps: 1, intro: '2026-11-09' });
    const graduated = schedule(step1, 'good', later(now, 10 * MIN));
    expect(graduated.state).toBe('review');
    expect(away(graduated, later(now, 10 * MIN))).toBe(3 * DAY); // first graduation is capped at 3 days
  });

  it('„Uuesti” inside the steps starts them over, „Raske” repeats the step a bit longer', () => {
    const step1 = schedule(newSide(), 'good', now);
    const again = schedule(step1, 'again', now);
    expect(again).toMatchObject({ state: 'learning', step: 0 });
    expect(away(again, now)).toBe(1 * MIN);
    const hard = schedule(step1, 'hard', now);
    expect(hard).toMatchObject({ state: 'learning', step: 1 });
    expect(away(hard, now)).toBe(15 * MIN);
  });

  it('review intervals grow with „Hea” and keep the order Raske < Hea < Lihtne', () => {
    let side = schedule(schedule(newSide(), 'good', now), 'good', now);
    let previous = 0;
    for (let i = 0; i < 3; i += 1) {
      const at = new Date(Date.parse(side.due));
      const preview = previewIntervals(side, at);
      expect(preview.hard).toBeLessThan(preview.good);
      expect(preview.good).toBeLessThan(preview.easy);
      expect(preview.good).toBeGreaterThan(previous);
      previous = preview.good;
      side = schedule(side, 'good', at);
    }
    expect(previous).toBeGreaterThan(30 * DAY);
  });

  it('a lapse: relearning 10 min, lower stability, one more lapse, then back to days', () => {
    let side = schedule(schedule(newSide(), 'good', now), 'good', now);
    side = schedule(side, 'good', new Date(Date.parse(side.due)));
    const before = side.s;
    const at = new Date(Date.parse(side.due));
    const lapsed = schedule(side, 'again', at);
    expect(lapsed).toMatchObject({ state: 'relearning', step: 0, lapses: 1 });
    expect(lapsed.s).toBeLessThan(before);
    expect(lapsed.d).toBeGreaterThan(side.d);
    expect(away(lapsed, at)).toBe(10 * MIN);
    const back = schedule(lapsed, 'good', later(at, 10 * MIN));
    expect(back.state).toBe('review');
    expect(away(back, later(at, 10 * MIN))).toBeGreaterThanOrEqual(DAY);
  });

  it('the memory model: R is 90 % when the interval is up, intervals stay within a year', () => {
    expect(retrievability(0, 5)).toBe(1);
    expect(retrievability(intervalDays(5), 5)).toBeCloseTo(0.9, 2);
    expect(intervalDays(100000)).toBe(365);
    expect(intervalDays(0.01)).toBe(1);
    expect(() => schedule(newSide(), 'maybe', now)).toThrow();
  });

  it('formats intervals for the buttons', () => {
    expect([30 * 1000, 10 * MIN, 3 * 60 * MIN, 4 * DAY, 60 * DAY, 400 * DAY].map(formatInterval)).toEqual(['<1 min', '10 min', '3 h', '4 p', '2 k', '1,1 a']);
  });
});

describe('storage and migration from the Leitner boxes', () => {
  it('a never-practised word is new; a forgotten one relearns; a boxed one is in review with the box days', () => {
    expect(fromLegacy(word('a'))).toEqual(newSide());
    expect(fromLegacy(word('b', { box: 0, reviews: 2, dueAt: '2026-11-01T00:00:00Z' }), now)).toMatchObject({ state: 'relearning', lapses: 1, reps: 2, due: '2026-11-01T00:00:00.000Z' });
    const boxed = fromLegacy(word('c', { box: 3, reviews: 4, dueAt: '2026-11-12T00:00:00Z', reviewedAt: '2026-11-05T00:00:00Z' }), now);
    expect(boxed).toMatchObject({ state: 'review', s: 7, reps: 4, last: '2026-11-05T00:00:00Z', due: '2026-11-12T00:00:00.000Z' });
    expect(boxFor(boxed)).toBe(3);
    expect(reverseOpen({ r: boxed })).toBe(true);
    expect(reverseOpen({ r: newSide() })).toBe(false);
  });

  it('never loses progress: a migrated box-5 word answered „Hea” keeps a long interval', () => {
    const old = word('d', { box: 5, reviews: 9, dueAt: '2026-11-09T09:00:00Z', reviewedAt: '2026-10-10T09:00:00Z' });
    const patch = ratingPatch(old, 'r', 'good', now);
    expect(patch.srs.r.state).toBe('review');
    expect(Date.parse(patch.srs.r.due) - now.getTime()).toBeGreaterThan(30 * DAY);
    expect(patch).toMatchObject({ box: 5, reviews: 10, reviewedAt: now.toISOString() });
    expect(patch.srs.p).toBeUndefined(); // production not started yet: not written
  });

  it('the patch keeps the other side and writes the old summary fields', () => {
    const w = word('e', { srs: { v: 1, r: { state: 'review', s: 10, d: 5, due: '2026-11-20T00:00:00.000Z', last: '2026-11-08T00:00:00.000Z', reps: 3 } }, reviews: 3, box: 3 });
    const patch = ratingPatch(w, 'p', 'again', now);
    expect(patch.srs.r).toMatchObject({ state: 'review', s: 10 });
    expect(patch.srs.p).toMatchObject({ state: 'learning', step: 0 });
    expect(patch.dueAt).toBe(later(now, MIN).toISOString()); // the earliest due of both sides
    expect(patch.box).toBe(3);
    expect(Object.keys(patch).sort()).toEqual(['box', 'dueAt', 'reviewedAt', 'reviews', 'srs']);
  });

  it('reads a stored map as it is and fills what is missing', () => {
    const srs = wordSrs(word('f', { box: 4, reviews: 3, srs: { r: { state: 'learning', s: 1, d: 5, due: 'x', step: 1, reps: 1.6 } } }), now);
    expect(srs.r).toMatchObject({ state: 'learning', step: 1, reps: 2, lapses: 0, intro: '' });
    expect(srs.p).toEqual(newSide());
  });
});

describe('„Täna kordamiseks”: the daily queue', () => {
  it('learning first, then the most overdue reviews, then new words up to the daily cap', () => {
    const words = [
      word('late', { box: 2, reviews: 3, dueAt: '2026-11-08T00:00:00Z' }),
      word('early', { box: 2, reviews: 3, dueAt: '2026-11-01T00:00:00Z' }),
      word('step', { srs: { r: { state: 'learning', s: 3, d: 5, due: '2026-11-09T09:59:00.000Z', step: 1, reps: 1, intro: '2026-11-09' } } }),
      word('future', { box: 3, reviews: 3, dueAt: '2026-12-01T00:00:00Z' }),
      ...Array.from({ length: 15 }, (_, i) => word(`n${String(i).padStart(2, '0')}`, { createdAt: `2026-10-${String(i + 1).padStart(2, '0')}T00:00:00Z` })),
    ];
    const queue = buildQueue(words, { now });
    const keys = queue.items.map((item) => item.key);
    expect(keys.slice(0, 3)).toEqual(['step:r', 'early:r', 'late:r']);
    // early, late, future are past learning → their reverse side is open and new
    expect(queue.due).toBe(3);
    expect(queue.introducedToday).toBe(1); // „step” started today
    expect(queue.fresh).toBe(9);
    expect(queue.newLeft).toBe(9);
    expect(keys.filter((key) => key.endsWith(':p')).length).toBeGreaterThan(0);
    expect(queue.nextDue).toBe('2026-12-01T00:00:00.000Z');
  });

  it('own sentences only one way and two a day; empty words are skipped; a custom cap', () => {
    const words = [
      ...['s1', 's2', 's3'].map((id) => word(id, { translation: 'Sinu lause: x', box: 1, reviews: 1, dueAt: '2026-11-01T00:00:00Z' })),
      word('blank', { translation: '' }),
      word('a'), word('b'), word('c'),
    ];
    const queue = buildQueue(words, { now, newPerDay: 2 });
    expect(queue.items.map((item) => item.key)).toEqual(['s1:r', 's2:r', 'a:r', 'b:r']);
  });

  it('the cap counts what was started today', () => {
    const started = Array.from({ length: 10 }, (_, i) => word(`t${i}`, { srs: { r: { state: 'review', s: 3, d: 5, due: '2026-11-12T00:00:00.000Z', reps: 2, intro: '2026-11-09' } } }));
    const queue = buildQueue([...started, word('new')], { now });
    expect(queue).toMatchObject({ introducedToday: 10, newLeft: 0, fresh: 0 });
    expect(queue.items).toHaveLength(0);
    expect(nextReviewAt(started, now)).toBe('2026-11-12T00:00:00.000Z');
  });
});

describe('one session', () => {
  const items = ['a', 'b', 'c'].map((id) => ({ key: `${id}:r`, side: null }));

  it('an „Uuesti” card comes back later in the session; a graduated one leaves it', () => {
    let session = startSession(items, now);
    expect(session.current).toBe(0);
    let result = rateInSession(session, 'again', now); // a: 1 min
    session = result.session;
    expect(result.side.state).toBe('learning');
    expect(session.queue.map((item) => item.key)).toEqual(['b:r', 'c:r', 'a:r']);
    expect(session.queue[session.current].key).toBe('b:r');
    session = rateInSession(session, 'easy', now).session; // b leaves
    expect(session.finished.map((item) => item.key)).toEqual(['b:r']);
    session = rateInSession(session, 'good', now).session; // c: 10 min
    // nothing is due yet: learn ahead, the earliest (a) first
    expect(session.queue[session.current].key).toBe('a:r');
    session = rateInSession(session, 'good', later(now, MIN)).session; // a: 10 min
    session = rateInSession(session, 'good', later(now, 11 * MIN)).session; // c graduates
    session = rateInSession(session, 'good', later(now, 12 * MIN)).session; // a graduates
    expect(session.current).toBe(-1);
    const stats = sessionStats(session, later(now, 12 * MIN));
    expect(stats).toMatchObject({ cards: 3, reviewed: 6, correct: 5, firstTry: 3, correctFirst: 2, percent: 67, learned: 3, minutes: 12 });
    expect(stats.nextDue).toBeTruthy();
  });

  it('does not show the same card twice in a row while another is waiting', () => {
    const queue = [{ key: 'a', showAt: 0 }, { key: 'b', showAt: now.getTime() + 5 * MIN }];
    expect(pickNext(queue, now, 'a')).toBe(0); // b is not due, a is the only ready one
    expect(pickNext([{ key: 'a', showAt: 0 }, { key: 'b', showAt: 0 }], now, 'a')).toBe(1);
    expect(pickNext([], now)).toBe(-1);
  });
});
