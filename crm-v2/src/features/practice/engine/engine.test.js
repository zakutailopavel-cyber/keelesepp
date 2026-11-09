import { describe, expect, it } from 'vitest';
import { compareAnswer, compareOrder, foldLetters, normalizeAnswer } from './compare.js';
import { checkItem, fullSentence, inputOf, ordersOf, tilesOf } from './items.js';
import { detectGrammar, isConnector, plannedGrammar } from './grammar.js';
import { advance, createSession, currentItem, progressOf, submitAnswer, summaryOf } from './session.js';

describe('compareAnswer — tolerant compare', () => {
  it('ignores case, punctuation, quotes and spaces', () => {
    expect(compareAnswer('  anna PEAB iga päev sõnu kordama ', ['Anna peab iga päev sõnu kordama.']).verdict).toBe('correct');
    expect(compareAnswer('Ema küsib, kas sa tuled', ['Ema küsib, kas sa tuled?']).verdict).toBe('correct');
    expect(normalizeAnswer('„Tere!” — ütles ta.')).toBe('tere ütles ta');
  });
  it('õ/ä/ö/ü typed as o/a/o/u is almost, with the missing letters', () => {
    const r = compareAnswer('Ma tulen tana koju.', ['Ma tulen täna koju.']);
    expect(r.verdict).toBe('almost');
    expect(r.letters).toEqual(['ä']);
    expect(compareAnswer('voi', ['või']).verdict).toBe('almost');
    expect(foldLetters('õäöüšž')).toBe('oaousz');
  });
  it('a wrong ending is wrong, not a typo', () => {
    expect(compareAnswer('koolis', ['kooli']).verdict).toBe('wrong');
    expect(compareAnswer('', ['kooli']).verdict).toBe('wrong');
  });
  it('accepts every listed answer', () => {
    const accepts = ['Meie uue maja lähedal ei ole bussipeatust.', 'Meie uue maja lähedal pole bussipeatust.'];
    expect(compareAnswer('meie uue maja lähedal pole bussipeatust', accepts)).toMatchObject({ verdict: 'correct', expected: accepts[1] });
  });
});

describe('word tiles — multiple valid orders', () => {
  it('splits words without punctuation; a „ | ” line keeps its chunks', () => {
    expect(tilesOf('Kuna päeval pole aega, õpib Anna õhtul.')).toEqual(['Kuna', 'päeval', 'pole', 'aega', 'õpib', 'Anna', 'õhtul']);
    expect(tilesOf('Eile | ärkas | Sofia | kell | pool kaheksa')).toEqual(['Eile', 'ärkas', 'Sofia', 'kell', 'pool kaheksa']);
  });
  it('orders are the answers with the same tiles; other wordings are not orders', () => {
    const orders = ordersOf(['Mia sõidab kooli jalgrattaga.', 'Mia sõidab jalgrattaga kooli.', 'Mia läheb jalgrattaga kooli.']);
    expect(orders).toHaveLength(2);
    expect(compareOrder(['Mia', 'sõidab', 'jalgrattaga', 'kooli'], orders).verdict).toBe('correct');
    expect(compareOrder(['Mia', 'sõidab', 'kooli', 'jalgrattaga'], orders).verdict).toBe('correct');
    expect(compareOrder(['Mia', 'jalgrattaga', 'sõidab', 'kooli'], orders).verdict).toBe('wrong');
  });
});

describe('checkItem', () => {
  const build = { type: 'build', tiles: ['Kuna', 'päeval', 'pole', 'aega', 'õpib', 'Anna', 'õhtul'], orders: [['Kuna', 'päeval', 'pole', 'aega', 'õpib', 'Anna', 'õhtul']], answers: ['Kuna päeval pole aega, õpib Anna õhtul.'] };
  it('build: the V2 order is right, the English order wrong', () => {
    expect(checkItem(build, { tiles: build.tiles }).verdict).toBe('correct');
    expect(checkItem(build, { tiles: ['Kuna', 'päeval', 'pole', 'aega', 'Anna', 'õpib', 'õhtul'] })).toMatchObject({ verdict: 'wrong', expected: 'Kuna päeval pole aega, õpib Anna õhtul.' });
  });
  it('transform: typed by default, built from tiles when asked', () => {
    const tr = { type: 'transform', from: 'Ma tahan kursust tööajal teha.', answers: ['Ma tahaksin kursust tööajal teha.', 'Ma tahaksin teha kursust tööajal.'], orders: ordersOf(['Ma tahaksin kursust tööajal teha.', 'Ma tahaksin teha kursust tööajal.']) };
    expect(inputOf(tr)).toBe('type');
    expect(checkItem(tr, { text: 'ma tahaksin teha kursust tööajal' }).verdict).toBe('correct');
    const tiles = { ...tr, input: 'tiles' };
    expect(inputOf(tiles)).toBe('tiles');
    expect(checkItem(tiles, { tiles: ['Ma', 'tahaksin', 'teha', 'kursust', 'tööajal'] }).verdict).toBe('correct');
  });
  it('form: options or typed; the sentence with its answer', () => {
    const form = { type: 'form', before: 'Markus puudus kolmest', after: '.', base: 'tund', answers: ['tunnist'], options: null };
    expect(inputOf(form)).toBe('type');
    expect(checkItem(form, { text: 'Tunnist' }).verdict).toBe('correct');
    expect(fullSentence(form)).toBe('Markus puudus kolmest tunnist.');
    const choice = { ...form, options: ['tunnist', 'tundi', 'tunnile'] };
    expect(inputOf(choice)).toBe('options');
    expect(checkItem(choice, { option: 'tundi' }).verdict).toBe('wrong');
  });
});

describe('grammar points', () => {
  it('reads the point from the task’s own words', () => {
    expect(detectGrammar('Kirjuta sulgudes olev tegusõna ma- või da-vormis')).toContain('infinitives');
    expect(detectGrammar('Ühenda kaks lauset antud sõnaga (sest, kuna, seepärast)')).toContain('connectors');
    expect(detectGrammar('Muuda lause kaudseks kõneks: Ema küsib, kas …')).toContain('quotative');
    expect(detectGrammar('Pane sõnad õigesse järjekorda')).toContain('word-order');
  });
  it('knows linking words and the plan of a lesson', () => {
    expect(isConnector('Seepärast')).toBe(true);
    expect(isConnector('kooli')).toBe(false);
    expect(plannedGrammar('b1', 'a2b1-037')).toContain('infinitives');
    expect(plannedGrammar('b1', 'a2b1-038')).toContain('connectors');
  });
});

describe('session — Duolingo-style retry', () => {
  const items = [
    { id: 'a', type: 'form', answers: ['kooli'], grammar: ['locatives'] },
    { id: 'b', type: 'form', answers: ['täna'], grammar: ['tenses'] },
    { id: 'c', type: 'build', tiles: ['Ma', 'tulen'], orders: [['Ma', 'tulen']], answers: ['Ma tulen.'], grammar: ['word-order'] },
  ];
  it('wrong items come back once at the end; almost is not counted correct and not retried', () => {
    let s = createSession(items);
    s = submitAnswer(s, { text: 'koolis' }).session; s = advance(s);
    s = submitAnswer(s, { text: 'tana' }).session; s = advance(s);
    s = submitAnswer(s, { tiles: ['Ma', 'tulen'] }).session;
    expect(progressOf(s)).toBeCloseTo(2 / 3);
    s = advance(s);
    expect(s.phase).toBe('retry');
    expect(currentItem(s).id).toBe('a');
    s = submitAnswer(s, { text: 'kooli' }).session; s = advance(s);
    expect(s.phase).toBe('done');
    const sum = summaryOf(s, { minutes: 2.34 });
    expect(sum).toMatchObject({ total: 3, correct: 1, almost: 1, wrong: 1, retried: 1, fixed: 1, minutes: 2.3, missed: ['locatives'] });
    expect(sum.grammarPoints).toEqual(['locatives', 'tenses', 'word-order']);
    expect(sum.kind).toBe('grammar');
  });
});
