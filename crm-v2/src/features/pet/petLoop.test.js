import { describe, expect, it } from 'vitest';
import { petNeeds } from './petCare.js';
import { dailySurprise, growthNews, isBackAfterAbsence, leftInWork, moodLabel, nextReward, petLevel, petRequest, requestDoneToday, requestWords, surpriseLines, thanksLine } from './petLoop.js';
import { petProgress } from './petModel.js';

describe('moodLabel', () => {
  it('glad after today\'s request, proud of a great week, the low need it asks for, else calm; never sad', () => {
    const request = { need: 'food' };
    expect(moodLabel({ mood: 'calm', request, needs: { food: 10 }, done: true }).et).toBe('rõõmus');
    expect(moodLabel({ mood: 'proud', request, needs: { food: 10 } }).et).toBe('uhke');
    expect(moodLabel({ mood: 'calm', request, needs: { food: 10 } })).toMatchObject({ key: 'food', et: 'näljane', ru: 'голодный' });
    expect(moodLabel({ mood: 'calm', request: { need: 'joy' }, needs: { joy: 5 } }).et).toBe('igavleb');
    expect(moodLabel({ mood: 'calm', request, needs: { food: 80 } }).et).toBe('rahulik');
    expect(moodLabel({}).et).toBe('rahulik');
  });
});

const NOW = new Date('2026-11-02T12:00:00').getTime();
const today = '2026-11-02';
const ago = (days) => new Date(NOW - days * 86400000).toISOString();
const word = (id, extra = {}) => ({ id, word: id, translation: `t-${id}`, box: 1, reviews: 2, dueAt: ago(1), reviewedAt: ago(4), ...extra });
const needs = (extra = {}) => ({ food: 100, energy: 100, joy: 100, dueWords: 0, openHomework: 0, canPlay: false, canWordGame: false, ...extra });
const said = { practice: [{ said: 'Ma lähen kodus.', corrected: 'Ma lähen koju.' }] };

describe('the one request', () => {
  it('comes from the lowest need and names his own word', () => {
    const request = petRequest({ needs: needs({ food: 10, joy: 60, dueWords: 3, canWordGame: true }), words: [word('koer'), word('kass'), word('maja')], now: NOW });
    expect(request).toMatchObject({ need: 'food', kind: 'feed', button: 'Kordame 3 sõna' });
    expect(request.text).toMatch(/Mul on kõht tühi\. Kas mäletad sõna „(koer|kass|maja)”\?/);
    expect(request.hint).toMatch(/Я проголодался/);
  });

  it('asks for play when joy is the lowest, using his own sentence from a lesson when there is one', () => {
    const request = petRequest({ needs: needs({ food: 90, joy: 5, dueWords: 3, canWordGame: true }), words: [word('koer')], stats: [said], now: NOW });
    expect(request).toMatchObject({ need: 'joy', kind: 'fix' });
    expect(request.text).toBe('Mäletan, tunnis ütlesid „Ma lähen kodus.”. Parandame koos?');
    expect(petRequest({ needs: needs({ joy: 5, canWordGame: true }), now: NOW })).toMatchObject({ kind: 'game', text: 'Mul on igav. Mängime sinu sõnadega?' });
  });

  it('a need that is fine is asked for softly; a topic game when there are no words', () => {
    expect(petRequest({ needs: needs({ joy: 70, canWordGame: true }), now: NOW }).text).toBe('Mängime sinu sõnadega?');
    expect(petRequest({ needs: needs(), topics: [{ id: 'x', title: 'Minu pere' }], now: NOW })).toMatchObject({ kind: 'topic', text: 'Mängime teemal „Minu pere”?' });
  });

  it('homework is asked for only when nothing can be done here; with nothing at all there is no request', () => {
    expect(petRequest({ needs: needs({ energy: 0, openHomework: 1, joy: 80, canWordGame: true }), now: NOW }).kind).toBe('game');
    expect(petRequest({ needs: needs({ energy: 0, openHomework: 1 }), now: NOW })).toMatchObject({ kind: 'homework', to: '/homework' });
    expect(petRequest({ needs: needs(), now: NOW })).toBeNull();
  });

  it('speaks the language being learned, with the Russian hint', () => {
    const request = petRequest({ needs: needs({ joy: 5, canWordGame: true }), lang: 'en', now: NOW });
    expect(request).toMatchObject({ lang: 'en', text: "I'm bored. Shall we play with your words?", hint: 'Мне скучно. Поиграем с твоими словами?' });
  });

  it('his own corrected sentences come first in a feeding', () => {
    const cards = requestWords([word('a'), word('b'), word('c'), word('Ma lähen koju.', { translation: 'Sinu lause: x', box: 0 })], NOW);
    expect(cards).toHaveLength(3);
    expect(cards[0].word).toBe('Ma lähen koju.');
  });

  it('never asks twice a day: done by playing on any device or by repeating three words anywhere', () => {
    expect(requestDoneToday({ pet: { playedAt: ago(0) }, today })).toBe(true);
    expect(requestDoneToday({ pet: { playedAt: ago(1) }, today })).toBe(false);
    expect(requestDoneToday({ pet: {}, words: [word('a', { reviewedAt: ago(0) }), word('b', { reviewedAt: ago(0) }), word('c', { reviewedAt: ago(0) })], today })).toBe(true);
    expect(requestDoneToday({ pet: {}, words: [word('a', { reviewedAt: ago(0) })], today })).toBe(false);
  });

  it('after a feeding or a game the need is up at once (from the same data)', () => {
    const words = [word('a'), word('b'), word('c')];
    expect(petNeeds({ words, now: NOW }).food).toBe(0);
    expect(petNeeds({ words: words.map((w) => ({ ...w, reviewedAt: ago(0) })), now: NOW }).food).toBe(100);
    expect(petNeeds({ words: words.map((w) => ({ ...w, dueAt: ago(-3) })), now: NOW }).joy).toBe(0);
    expect(petNeeds({ words: words.map((w) => ({ ...w, dueAt: ago(-3) })), playedAt: ago(0), now: NOW }).joy).toBe(100);
    expect(thanksLine('feed').text).toBe('Aitäh! Nüüd on kõht täis.');
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
