import { describe, expect, it } from 'vitest';
import {
  buildTopicTest, buildTopics, cycleProgress, gradeTopicTest, levelHasWords, nextCycleCards, readLearned, saveLearned, topicStates, wordsToAdd,
} from './topicModel.js';

const w = (et, ru = `${et}-ru`) => ({ et, ru, ex: `${et} näide` });
const level = {
  key: 'A2',
  modules: [
    { key: 'A2|1', label: '1. Mina', lessons: [{ id: 'a2-001' }, { id: 'a2-002' }] },
    { key: 'A2|2', label: '2. Kodu', lessons: [{ id: 'a2-003' }] },
    { key: 'A2|3', label: '3. Linn', lessons: [{ id: 'a2-004' }] },
    { key: 'A2|4', label: '4. Tühi', lessons: [{ id: 'a2-005' }] },
  ],
};
const byLesson = {
  'a2-001': [w('nimi'), w('vanus'), w('Nimi')],
  'a2-002': [w('pere'), w('ema'), w('isa')],
  'a2-003': [w('kodu'), w('tuba'), w('köök'), w('nimi'), w('aken')],
  'a2-004': [w('tänav'), w('buss'), w('pood'), w('park'), w('kool'), w('linn')],
  'a2-005': [w('pere'), w('üks')],
};
const own = (ids, extra = []) => [...ids.map((id) => ({ id, word: 'x' })), ...extra];

describe('vocabulary topics', () => {
  it('groups the lesson words by module, dedupes by word and drops tiny topics', () => {
    const topics = buildTopics(level, byLesson, 's1');
    expect(topics.map((topic) => topic.title)).toEqual(['1. Mina', '2. Kodu', '3. Linn']);
    expect(topics[0].words.map((word) => word.et)).toEqual(['nimi', 'vanus', 'pere', 'ema', 'isa']);
    expect(topics[0].words[2].id).toBe('lw_s1_a2-002_0');
    // „nimi” is already in topic 1
    expect(topics[1].words.map((word) => word.et)).toEqual(['kodu', 'tuba', 'köök', 'aken']);
    expect(topics[1].words[3].id).toBe('lw_s1_a2-003_4');
    expect(levelHasWords(level)).toBe(true);
    expect(levelHasWords({ modules: [{ lessons: [{ id: 'b1-003' }] }] })).toBe(false);
  });

  it('opens the first topic, locks the rest and passes a topic when all its words are mine', () => {
    const topics = buildTopics(level, byLesson, 's1');
    expect(topicStates(topics, []).map((topic) => topic.state)).toEqual(['open', 'locked', 'locked']);
    const first = topics[0].words.map((word) => word.id);
    expect(topicStates(topics, own(first.slice(1))).map((topic) => topic.state)).toEqual(['open', 'locked', 'locked']);
    expect(topicStates(topics, own(first)).map((topic) => topic.state)).toEqual(['passed', 'open', 'locked']);
    // a word I already have (same spelling) counts and is not added again
    const withOwn = own(first.slice(1), [{ id: 'mine', word: 'Nimi' }]);
    expect(topicStates(topics, withOwn)[0].state).toBe('passed');
    expect(wordsToAdd(topics[1], [{ id: 'mine', word: 'Tuba' }]).map((item) => item.word)).toEqual(['kodu', 'köök', 'aken']);
    expect(wordsToAdd(topics[1], [])[0]).toEqual({ id: 'lw_s1_a2-003_0', word: 'kodu', translation: 'kodu-ru', example: 'kodu näide' });
  });

  it('runs the cycle in portions until every word is learned once', () => {
    const topic = { key: 't', words: Array.from({ length: 23 }, (_, i) => ({ id: `w${i}`, et: `s${i}`, ru: `r${i}` })) };
    expect(nextCycleCards(topic, []).length).toBe(10);
    expect(nextCycleCards(topic, Array.from({ length: 10 }, (_, i) => `w${i}`)).length).toBe(13);
    const almost = Array.from({ length: 21 }, (_, i) => `w${i}`);
    const last = nextCycleCards(topic, almost);
    expect(last.length).toBe(4);
    expect(last.slice(0, 2).map((card) => card.id)).toEqual(['w21', 'w22']);
    expect(cycleProgress(topic, almost)).toEqual({ learned: 21, total: 23, done: false });
    expect(cycleProgress(topic, [...almost, 'w21', 'w22', 'other']).done).toBe(true);
  });

  it('builds a 14-word mixed test and passes it at 80 %', () => {
    const topic = { key: 't', words: Array.from({ length: 30 }, (_, i) => ({ id: `w${i}`, et: `sõna${i}`, ru: `слово${i}` })) };
    const test = buildTopicTest(topic);
    expect(test.total).toBe(14);
    expect(test.match.cards).toHaveLength(4);
    expect(new Set(test.questions.map((question) => question.kind))).toEqual(new Set(['choice', 'write']));
    const right = {};
    test.match.cards.forEach((card) => { right[card.id] = card.back; });
    test.questions.forEach((question) => { right[question.id] = question.answer; });
    expect(gradeTopicTest(test, right)).toMatchObject({ score: 14, percent: 100, passed: true, missed: [] });
    const [first, second, third] = test.questions;
    const twoWrong = { ...right, [first.id]: 'vale', [second.id]: 'vale' };
    expect(gradeTopicTest(test, twoWrong)).toMatchObject({ score: 12, passed: true });
    const threeWrong = { ...twoWrong, [third.id]: 'vale' };
    const failed = gradeTopicTest(test, threeWrong);
    expect(failed).toMatchObject({ score: 11, percent: 79, passed: false });
    expect(failed.missed.map((card) => card.id)).toEqual([first.id, second.id, third.id]);
  });

  it('keeps the learned words on the device and survives a blocked storage', () => {
    const data = new Map();
    const storage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
    saveLearned('s1', 'A2|1', ['a', 'b', 'a'], storage);
    expect(readLearned('s1', 'A2|1', storage)).toEqual(['a', 'b']);
    const blocked = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); } };
    expect(readLearned('s1', 'A2|1', blocked)).toEqual([]);
    expect(() => saveLearned('s1', 'A2|1', ['a'], blocked)).not.toThrow();
  });
});
