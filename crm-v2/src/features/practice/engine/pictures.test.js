import { describe, expect, it } from 'vitest';
import A2_WORDS from '../../worksheet-generator/art/words/a2.js';
import { SAME_PICTURE as STRIP_SAME_PICTURE } from '../../worksheet-generator/art/wordStrips.js';
import { checkItem, fullSentence, inputOf, TYPE_LABELS } from './items.js';
import { buildLesson, pictureItems, PICTURE_MAX } from './lesson.js';
import { PICTURE_WORDS, SAME_PICTURE, distractorsOf, pictureItem, pictureOf, pictureWordsFor } from './pictures.js';
import { createSeededRandom } from '../../worksheet-generator/engine/seed.js';

const entry = (word) => ({ ...pictureOf(word), meaning: '', wordId: '' });

describe('picture words', () => {
  it('are the A2 word art; a picture drawn twice keeps one word only (same list as the word strips)', () => {
    expect(SAME_PICTURE).toEqual(STRIP_SAME_PICTURE);
    expect(PICTURE_WORDS.length).toBe(A2_WORDS.length - Object.keys(SAME_PICTURE).length);
    expect(PICTURE_WORDS.some((pic) => pic.id === 'luhike')).toBe(false);
    expect(pictureOf('Palavik')).toMatchObject({ word: 'palavik', src: '/textbook-art/words/a2/palavik.webp', topic: 'a2-041' });
    expect(pictureOf('retsept')).toBeNull();
  });

  it('come from his own words (meaning = his translation, the card is moved) and from his module lessons', () => {
    const found = pictureWordsFor({
      words: [{ id: 'w1', word: 'palavik', translation: 'температура' }, { id: 'w2', word: 'retsept', translation: 'рецепт' }],
      lessonIds: ['a2-026'],
      meanings: { leib: 'хлеб' },
    });
    expect(found[0]).toMatchObject({ word: 'palavik', meaning: 'температура', wordId: 'w1' });
    expect(found.find((pic) => pic.word === 'leib')).toMatchObject({ meaning: 'хлеб', wordId: '' });
    expect(found.filter((pic) => pic.topic === 'a2-026')).toHaveLength(16);
    expect(found.some((pic) => pic.word === 'retsept')).toBe(false);
    expect(pictureWordsFor({ words: [{ word: 'retsept' }], lessonIds: ['b1b2-001'] })).toEqual([]);
  });

  it('wrong options are other pictures of the same topic first', () => {
    const wrong = distractorsOf(entry('leib'), createSeededRandom('x'));
    expect(wrong).toHaveLength(3);
    expect(wrong.every((pic) => pic.topic === 'a2-026' && pic.word !== 'leib')).toBe(true);
  });
});

describe('picture items', () => {
  it('„Mis on pildil?”: the picture and 4 words, the right one among them; deterministic', () => {
    const item = pictureItem(entry('leib'), { seed: 's' });
    expect(item).toMatchObject({ type: 'picture', input: 'options', word: 'leib', answers: ['leib'], picture: { src: '/textbook-art/words/a2/leib.webp' } });
    expect(item.options).toHaveLength(4);
    expect(new Set(item.options).size).toBe(4);
    expect(item.options).toContain('leib');
    expect(inputOf(item)).toBe('options');
    expect(checkItem(item, { option: 'leib' }).verdict).toBe('correct');
    expect(checkItem(item, { option: item.options.find((o) => o !== 'leib') })).toMatchObject({ verdict: 'wrong', expected: 'leib' });
    expect(pictureItem(entry('leib'), { seed: 's' })).toEqual(item);
    expect(fullSentence(item)).toBe('leib');
    expect(TYPE_LABELS.picture.et).toBe('Mis on pildil?');
  });

  it('typed on a harder step: no options, õ/ä/ö/ü left out is „almost”', () => {
    const item = pictureItem(entry('köök'), { input: 'type' });
    expect(item.options).toEqual([]);
    expect(inputOf(item)).toBe('type');
    expect(checkItem(item, { text: 'Köök' }).verdict).toBe('correct');
    expect(checkItem(item, { text: 'kook' }).verdict).toBe('almost');
    expect(checkItem(item, { text: 'tuba' }).verdict).toBe('wrong');
  });

  it('„Kuula ja vali pilt”: 4 pictures, graded by the word picked', () => {
    const item = pictureItem(entry('kohv'), { kind: 'hear', input: 'type' });
    expect(item.type).toBe('hear');
    expect(item.input).toBe('options');
    expect(item.choices).toHaveLength(4);
    expect(item.choices.map((pic) => pic.word)).toEqual(item.options);
    expect(item.choices.every((pic) => pic.src.startsWith('/textbook-art/words/a2/'))).toBe(true);
    expect(TYPE_LABELS.hear.et).toBe('Kuula ja vali pilt');
    expect(checkItem(item, { option: 'kohv' }).verdict).toBe('correct');
  });

  it('the lesson\'s picture items: pick, hear (only with a recording), typed; recent words left out', () => {
    const pics = ['leib', 'piim', 'kala', 'supp'].map(entry);
    const heard = pictureItems(pics, { listenable: () => true, seed: 1 });
    expect(heard.map((it) => [it.type, it.input])).toEqual([['picture', 'options'], ['hear', 'options'], ['picture', 'type']]);
    const silent = pictureItems(pics, { listenable: () => false, seed: 1 });
    expect(silent.map((it) => it.type)).toEqual(['picture', 'picture', 'picture']);
    expect(pictureItems(pics, { recent: new Set(['leib', 'piim', 'kala']) }).map((it) => it.word)).toEqual(['supp']);
    expect(pictureItems([])).toEqual([]);
  });
});

describe('a lesson with pictures', () => {
  const pool = Array.from({ length: 12 }, (_, i) => ({
    id: `p${i}`, type: i % 2 ? 'form' : 'connector', level: 'A2', moduleId: 'm1', moduleIndex: 0, lessonId: 'a2-026', phase: 'practice', grammar: ['forms'],
    before: `Lause ${i} algus`, after: 'lõpp.', answers: [`vorm${i}`], options: [`vorm${i}`, 'muu'],
  }));
  const pics = pictureWordsFor({ lessonIds: ['a2-026'] });

  it('mixes up to three picture items into the lesson, easiest first, never three of one type in a row', () => {
    const lesson = buildLesson({ pool, level: 'A2', moduleId: 'm1', size: 10, pictures: pics, canListen: (it) => it.type === 'hear', seed: 'k' });
    expect(lesson.items).toHaveLength(10);
    const picture = lesson.items.filter((it) => it.type === 'picture' || it.type === 'hear');
    expect(picture).toHaveLength(PICTURE_MAX);
    expect(lesson.items[0].type).toBe('picture');
    expect(lesson.types).toEqual(expect.arrayContaining(['picture', 'hear']));
    lesson.items.forEach((it, i) => { if (i > 1) expect(it.type === lesson.items[i - 1].type && it.type === lesson.items[i - 2].type).toBe(false); });
    expect(buildLesson({ pool, level: 'A2', moduleId: 'm1', size: 10, pictures: pics, canListen: (it) => it.type === 'hear', seed: 'k' })).toEqual(lesson);
  });

  it('without pictures the lesson is the same as before', () => {
    const plain = buildLesson({ pool, level: 'A2', moduleId: 'm1', size: 10, seed: 'k' });
    expect(plain.items.some((it) => it.type === 'picture' || it.type === 'hear')).toBe(false);
    expect(plain.items).toHaveLength(10);
    expect(buildLesson({ pool, level: 'A2', moduleId: 'm1', size: 10, pictures: [], seed: 'k' })).toEqual(plain);
  });

  it('pictures alone still make a short lesson', () => {
    const only = buildLesson({ pool: [], pictures: pics, seed: 'k' });
    expect(only.items).toHaveLength(3);
    expect(only.short).toBe(true);
  });
});
