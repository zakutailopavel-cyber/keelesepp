import { describe, expect, it } from 'vitest';
import { DAILY_XP_CAP, countsAsLearnDay, LEARN_DAYS, dayNumber, learnStreak, newerPractice, nextPracticeToday, readLocalPractice, todayOf, writeLocalPractice, xpOf } from './progress.js';

const date = '2026-11-09';

describe('practice XP', () => {
  it('counts only right answers of real items, never other kinds', () => {
    expect(xpOf({ kind: 'words', reviewed: 12, correct: 9 })).toBe(9);
    expect(xpOf({ kind: 'words', reviewed: 3, correct: 9 })).toBe(3);
    expect(xpOf({ kind: 'grammar', items: 10, correct: 7 })).toBe(7);
    expect(xpOf({ kind: 'sentences', items: 4, correct: 8 })).toBe(4);
    expect(xpOf({ kind: 'homework', correct: 10 })).toBe(0);
    expect(xpOf({ kind: 'words', correct: -5 })).toBe(0);
    expect(xpOf({})).toBe(0);
  });

  it('a day gives at most DAILY_XP_CAP and the total grows by exactly what the day gained', () => {
    let practice = {};
    for (let i = 0; i < 10; i += 1) practice = nextPracticeToday(practice, { date, xp: 9 });
    expect(practice.today.xp).toBe(DAILY_XP_CAP);
    expect(practice.xp).toBe(DAILY_XP_CAP);
    const tomorrow = nextPracticeToday(practice, { date: '2026-11-10', xp: 5 });
    expect(tomorrow.today).toMatchObject({ date: '2026-11-10', xp: 5, done: [] });
    expect(tomorrow.xp).toBe(DAILY_XP_CAP + 5);
  });

  it('a stored map of another day counts as empty; unknown keys are dropped', () => {
    expect(todayOf({ today: { date: '2026-11-08', done: ['words'], xp: 12 } }, date)).toEqual({ date, day: dayNumber(date), done: [], xp: 0 });
    expect(todayOf({ today: { date, done: ['words', 'hack'], xp: 999 } }, date)).toMatchObject({ done: ['words'], xp: DAILY_XP_CAP });
  });
});

describe('steps and streak', () => {
  it('ticks a step once and adds the day to learnDays; XP alone does not make a learning day', () => {
    const onlyXp = nextPracticeToday({}, { date, xp: 3 });
    expect(onlyXp.learnDays).toEqual([]);
    const once = nextPracticeToday(onlyXp, { date, done: ['words'] });
    const twice = nextPracticeToday(once, { date, done: ['words', 'sentences'] });
    expect(twice.today.done).toEqual(['words', 'sentences']);
    expect(twice.learnDays).toEqual([date]);
    expect(nextPracticeToday({}, { date, done: ['nope'] }).today.done).toEqual([]);
  });

  it('keeps the old „Minu vead” keys and at most LEARN_DAYS days', () => {
    const days = Array.from({ length: 70 }, (_, i) => new Date(Date.UTC(2026, 6, 1 + i)).toISOString().slice(0, 10));
    const next = nextPracticeToday({ errorsDate: '2026-11-01', errorsPct: 80, days: ['2026-11-01'], learnDays: days }, { date, done: ['words'] });
    expect(next).toMatchObject({ errorsDate: '2026-11-01', errorsPct: 80, days: ['2026-11-01'] });
    expect(next.learnDays).toHaveLength(LEARN_DAYS);
    expect(next.learnDays.at(-1)).toBe(date);
  });

  it('the streak counts days in a row ending today or yesterday', () => {
    expect(learnStreak(['2026-11-07', '2026-11-08', '2026-11-09'], date)).toBe(3);
    expect(learnStreak(['2026-11-07', '2026-11-08'], date)).toBe(2);
    expect(learnStreak(['2026-11-06', '2026-11-08'], date)).toBe(1);
    expect(learnStreak(['2026-11-01'], date)).toBe(0);
    expect(learnStreak([], date)).toBe(0);
  });

  it('day number is the UTC day of the date (the rules compare it with the server time)', () => {
    expect(dayNumber('1970-01-02')).toBe(1);
    expect(dayNumber('nope')).toBe(0);
  });
});

describe('browser copy', () => {
  it('stores and merges with the account copy: more done wins', () => {
    const store = new Map();
    const storage = { getItem: (k) => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) };
    const local = nextPracticeToday({}, { date, done: ['words', 'sentences'], xp: 6 });
    writeLocalPractice('u', local, storage);
    expect(readLocalPractice('u', storage).today.done).toEqual(['words', 'sentences']);
    const remote = nextPracticeToday({ errorsPct: 50 }, { date, done: ['words'], xp: 2 });
    const merged = newerPractice(remote, readLocalPractice('u', storage));
    expect(merged.today.done).toEqual(['words', 'sentences']);
    expect(merged.errorsPct).toBe(50);
    expect(readLocalPractice('x', { getItem: () => { throw new Error('private'); } })).toEqual({});
  });
});

describe('any finished practice keeps the day streak (Fable U2)', () => {
  it('counts every finished kind, but not an empty word or sentence round', () => {
    ['worksheet', 'exercise', 'lesson', 'homework', 'pet', 'monologue'].forEach((kind) => expect(countsAsLearnDay({ kind })).toBe(true));
    expect(countsAsLearnDay({ kind: 'words', reviewed: 4, correct: 0 })).toBe(true);
    expect(countsAsLearnDay({ kind: 'grammar', items: 6, correct: 0 })).toBe(true);
    expect(countsAsLearnDay({ kind: 'words', reviewed: 0, correct: 0 })).toBe(false);
    expect(countsAsLearnDay({ kind: 'sentences', items: 0 })).toBe(false);
    expect(countsAsLearnDay({})).toBe(false);
  });

  it('a learned day without a step or XP is in learnDays; the steps and XP stay as they were', () => {
    const before = { xp: 40, today: { date, day: dayNumber(date), done: ['words'], xp: 12 }, learnDays: ['2026-11-08'] };
    const next = nextPracticeToday(before, { date, learned: true });
    expect(next.learnDays).toEqual(['2026-11-08', date]);
    expect(next.today).toEqual(before.today);
    expect(next.xp).toBe(40);
  });

  it('several sources on the same day are one day', () => {
    let practice = {};
    practice = nextPracticeToday(practice, { date, learned: true }); // a worksheet
    practice = nextPracticeToday(practice, { date, learned: true }); // a pet game
    practice = nextPracticeToday(practice, { date, xp: 5, learned: true }); // a word round
    practice = nextPracticeToday(practice, { date, done: ['sentences'] }); // a „Harjuta” step
    expect(practice.learnDays).toEqual([date]);
    expect(practice.xp).toBe(5);
    expect(learnStreak(practice.learnDays, date)).toBe(1);
  });

  it('different sources on following days make a streak; a gap day breaks it', () => {
    let practice = {};
    practice = nextPracticeToday(practice, { date: '2026-11-05', learned: true }); // worksheet
    practice = nextPracticeToday(practice, { date: '2026-11-07', learned: true }); // pet game
    practice = nextPracticeToday(practice, { date: '2026-11-08', done: ['words'] }); // Harjuta
    practice = nextPracticeToday(practice, { date, learned: true }); // homework „Tehtud”
    expect(practice.learnDays).toEqual(['2026-11-05', '2026-11-07', '2026-11-08', date]);
    expect(learnStreak(practice.learnDays, date)).toBe(3);
    expect(learnStreak(practice.learnDays, '2026-11-10')).toBe(3); // not lost before the day is over
    expect(learnStreak(practice.learnDays, '2026-11-11')).toBe(0);
  });

  it('XP alone without a finished round does not add a day (learned is what counts)', () => {
    expect(nextPracticeToday({}, { date, xp: 3 }).learnDays).toEqual([]);
  });
});
