import { describe, expect, it } from 'vitest';
import { petNeeds } from './petCare.js';
import { dailySurprise, growthNews, isBackAfterAbsence, leftInWork, moodLabel, nextReward, petLevel, playedToday, surpriseLines, thanksLine } from './petLoop.js';
import { petProgress } from './petModel.js';

describe('moodLabel', () => {
  it('glad after today\'s learning, proud of a great week, else calm; never sad and never a need to fix (owner 2026-11-09)', () => {
    expect(moodLabel({ mood: 'calm', done: true }).et).toBe('rõõmus');
    expect(moodLabel({ mood: 'proud' }).et).toBe('uhke');
    expect(moodLabel({ mood: 'calm' })).toMatchObject({ key: 'calm', et: 'rahulik', ru: 'спокоен' });
    expect(moodLabel({}).et).toBe('rahulik');
  });
});

const NOW = new Date('2026-11-02T12:00:00').getTime();
const today = '2026-11-02';
const ago = (days) => new Date(NOW - days * 86400000).toISOString();
const word = (id, extra = {}) => ({ id, word: id, translation: `t-${id}`, box: 1, reviews: 2, dueAt: ago(1), reviewedAt: ago(4), ...extra });

describe('the pet only rewards (owner 2026-11-09 „Täna”)', () => {
  it('thanks after each step of „Täna” and at the end, in the language being learned with the Russian hint', () => {
    expect(thanksLine('words').text).toBe('Aitäh! Sõnad on korratud.');
    expect(thanksLine('sentences').text).toBe('Tubli! Laused tulevad juba paremini.');
    expect(thanksLine('homework').text).toBe('Tubli! Ülesanne on tehtud.');
    expect(thanksLine('finished')).toMatchObject({ text: 'Aitäh! Täna on kõik tehtud. Olen sinu üle uhke!', hint: 'Спасибо! Сегодня всё сделано. Я тобой горжусь!' });
    expect(thanksLine('finished', 'en').text).toBe('Thank you! Everything is done today. I am proud of you!');
    expect(thanksLine('something-else').text).toBe('Täna on mul kõik hästi. Aitäh!');
  });

  it('knows when it was played with today (Lemmik, any device)', () => {
    expect(playedToday({ pet: { playedAt: ago(0) }, today })).toBe(true);
    expect(playedToday({ pet: { playedAt: ago(1) }, today })).toBe(false);
    expect(playedToday({ pet: null, today })).toBe(false);
  });

  it('care needs still come from the same data (Lemmik)', () => {
    const words = [word('a'), word('b'), word('c')];
    expect(petNeeds({ words, now: NOW }).food).toBe(0);
    expect(petNeeds({ words: words.map((w) => ({ ...w, reviewedAt: ago(0) })), now: NOW }).food).toBe(100);
  });

  it('practice XP of „Täna” counts in the one level (capped per day elsewhere)', () => {
    expect(petProgress({ practiceXp: 25, now: NOW }).xp).toBe(25);
    expect(petLevel(petProgress({ practiceXp: 25, now: NOW }).xp)).toBe(3);
    expect(petProgress({ practiceXp: -5, now: NOW }).xp).toBe(0);
  });
});

describe('the reward in sight', () => {
  it('says what is left in plain learning', () => {
    expect(leftInWork(4)).toBe('veel 2 õpitud sõna');
    expect(leftInWork(10)).toBe('veel 1 tund või ülesanne');
    expect(leftInWork(25)).toBe('veel 3 tundi või ülesannet');
  });

  it('is the cheapest item not yet his', () => {
    const reward = nextReward({ progress: petProgress({ lessons: [], now: NOW }), pet: {} });
    expect(reward).toMatchObject({ kind: 'item', ready: false, name: 'Taevas' });
    expect(reward.text).toBe('veel 3 tundi või ülesannet → Taevas');
  });

  it('counts stars already spent and what he owns', () => {
    const lessons = Array.from({ length: 5 }, (_, i) => ({ date: ago(10 + i * 2).slice(0, 10), status: 'Toimunud' }));
    const progress = petProgress({ lessons, now: NOW }); // 50 XP, 10 stars
    expect(nextReward({ progress, pet: { owned: ['bg-sky'], spentStars: 5 } })).toMatchObject({ name: 'Lill', ready: false });
    expect(nextReward({ progress, pet: {} })).toMatchObject({ name: 'Taevas', ready: true, text: 'Taevas on valmis!' });
  });

  it('a nearer art stage wins over a far item', () => {
    const progress = { xp: 98, stars: 19, stage: 1, stageXp: 98, stageSize: 100, nextItem: 'sall' };
    expect(nextReward({ progress, pet: { owned: ['bg-sky', 'flower', 'cap', 'bow', 'round'], spentStars: 19 } }).text).toBe('veel 1 õpitud sõna → sall');
  });

  it('with one lesson a week the pet still moves every week, and something new comes at least every few weeks', () => {
    const levels = [];
    const rewards = [];
    for (let weeks = 1; weeks <= 8; weeks += 1) {
      const lessons = Array.from({ length: weeks }, (_, i) => ({ date: ago(i * 7 + 1).slice(0, 10), status: 'Toimunud' }));
      const progress = petProgress({ lessons, now: NOW });
      levels.push(petLevel(progress.xp));
      rewards.push(progress.stars);
    }
    levels.slice(1).forEach((level, i) => expect(level).toBeGreaterThan(levels[i]));
    expect(rewards[2]).toBeGreaterThanOrEqual(5); // the first item after three lessons
  });

  it('a missed day never takes growth away', () => {
    const run = Array.from({ length: 5 }, (_, i) => ({ date: ago(i + 1).slice(0, 10), status: 'Toimunud' }));
    const during = petProgress({ lessons: run, now: NOW });
    const later = petProgress({ lessons: run, now: NOW + 20 * 86400000 });
    expect(later.streak).toBe(0);
    expect(later.xp).toBe(during.xp);
    expect(later.bestStreak).toBe(5);
  });
});

describe('one-time news', () => {
  const progress = { stage: 1, xp: 30 };
  it('a first look shows no old news', () => {
    expect(growthNews({ progress, seen: null, name: 'Okki' }).news).toBeNull();
  });
  it('tells a new level once, and a stage or a reward before it', () => {
    const first = growthNews({ progress: { ...progress, xp: 40 }, seen: { stage: 1, level: 4, ready: '' }, name: 'Okki' });
    expect(first.news.text).toBe('Okki jõudis 5. tasemele!');
    expect(growthNews({ progress: { ...progress, xp: 40 }, seen: first.seen, name: 'Okki' }).news).toBeNull();
    expect(growthNews({ progress: { stage: 2, xp: 100 }, seen: { stage: 1, level: 4 }, name: 'Okki' }).news.key).toBe('stage');
    const reward = { ready: true, item: { id: 'cap' }, name: 'Nokamüts' };
    expect(growthNews({ progress: { ...progress, xp: 40 }, reward, seen: { stage: 1, level: 4, ready: '' }, name: 'Okki' }).news.text).toBe('Uus asi on sinu: Nokamüts!');
  });
  it('does not repeat when a level was already shown on a higher number (a word was forgotten)', () => {
    expect(growthNews({ progress: { stage: 1, xp: 30 }, seen: { stage: 1, level: 9 }, name: 'Okki' }).news).toBeNull();
  });
});

describe('welcome back', () => {
  it('only after days away, counting real learning too', () => {
    expect(isBackAfterAbsence({ lastSeenAt: NOW - 5 * 86400000, now: NOW })).toBe(true);
    expect(isBackAfterAbsence({ lastSeenAt: NOW - 86400000, now: NOW })).toBe(false);
    expect(isBackAfterAbsence({ lastSeenAt: NOW - 5 * 86400000, lastActivity: NOW - 86400000, now: NOW })).toBe(false);
    expect(isBackAfterAbsence({ now: NOW })).toBe(false);
  });
});

describe('the daily surprise', () => {
  const words = [word('koer', { box: 3, reviewedAt: ago(2) }), word('kass', { reviewedAt: ago(3), example: 'Mul on kass.' })];
  it('comes only from his data and is the same all day', () => {
    const progress = petProgress({ words, now: NOW });
    const lines = surpriseLines({ words, progress, now: NOW });
    expect(lines.map((line) => line.key)).toEqual(expect.arrayContaining(['learned', 'week', 'example']));
    expect(lines.find((line) => line.key === 'learned').text).toBe('Sõna „koer” on sul nüüd selgeks õpitud.');
    const one = dailySurprise({ today, words, progress, now: NOW });
    expect(dailySurprise({ today, words, progress, now: NOW })).toEqual(one);
  });
  it('nothing to say means nothing shown, no filler', () => {
    expect(dailySurprise({ today, words: [], progress: {}, now: NOW })).toBeNull();
  });
  it('changes over the days when there is more than one thing to say', () => {
    const progress = petProgress({ words, now: NOW });
    const keys = new Set(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'].map((day) => dailySurprise({ today: day, words, progress, now: NOW }).key));
    expect(keys.size).toBeGreaterThan(1);
  });
});
