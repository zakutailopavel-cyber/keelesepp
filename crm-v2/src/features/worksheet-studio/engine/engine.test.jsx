import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { BLOCKS, createBlock, numberTasks, scoreDocument } from './registry.js';
import { convertLegacyWorksheet } from './legacy.js';
import { clockAccept } from './blocks/tasks.jsx';
import Sheet from './Sheet.jsx';
import { sampleDocument as seedDocument } from './sample.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const doc = (blocks) => ({ ...seedDocument(), blocks });
const answer = (b, map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [`${b.id}:${k}`, v]));

describe('block registry', () => {
  it('every block type can be created and rendered in edit, interactive and print modes', () => {
    expect(Object.keys(BLOCKS)).toHaveLength(33);
    for (const type of Object.keys(BLOCKS)) {
      const b = createBlock(type);
      for (const mode of ['edit', 'interactive', 'print']) {
        const { unmount, container } = render(<Sheet doc={doc([b])} mode={mode} />);
        expect(container.querySelector(`[data-block="${b.id}"]`), `${type}/${mode}`).not.toBeNull();
        unmount();
      }
    }
  });

  it('renders error-correction prompts as readable text, not struck-through answers', () => {
    const block = createBlock('errorfix');
    const { container } = render(<Sheet doc={doc([block])} mode="print" />);
    expect(container.querySelector('.ws-fix__prompt')).toHaveTextContent('Ma lähen koolis.');
    expect(container.querySelector('.ws-fix s')).toBeNull();
  });

  it('scores the new automatically checked language tasks', () => {
    for (const type of ['wordforms', 'errorfix', 'dictation', 'crossword']) {
      const block = createBlock(type);
      const values = type === 'wordforms' ? { 0: 'koera', 1: 'õpin' }
        : type === 'errorfix' ? { 0: 'Ma lähen kooli.', 1: 'Ta õpib eesti keelt.' }
          : type === 'dictation' ? { 0: 'Hommikul lähen ma tööle.', 1: 'Õhtul loen raamatut.' }
            : { 0: 'kool', 1: 'õpetaja' };
      expect(scoreDocument(doc([block]), answer(block, values)).perBlock[block.id].every((item) => item.ok), type).toBe(true);
    }
  });

  it('numbers only task blocks, in order', () => {
    const blocks = [createBlock('text'), createBlock('gaps'), createBlock('image'), createBlock('choice')];
    const n = numberTasks(blocks);
    expect([n[blocks[0].id], n[blocks[1].id], n[blocks[2].id], n[blocks[3].id]]).toEqual([null, 1, null, 2]);
  });

  it('print mode never shows learner answers', () => {
    const b = createBlock('gaps');
    const { container } = render(<Sheet doc={doc([b])} mode="print" answers={answer(b, { '0.0': 'hommikul' })} />);
    expect([...container.querySelectorAll('.ws-page input')].every((i) => i.value === '')).toBe(true);
  });
});

describe('scoring', () => {
  it('gaps accept any listed variant, case-insensitive', () => {
    const b = { ...createBlock('gaps'), data: { ...createBlock('gaps').data, sentences: 'Ma ärkan [tavaliselt|hommikul] kell 7.' } };
    expect(scoreDocument(doc([b]), answer(b, { '0.0': 'Hommikul' })).perBlock[b.id]).toEqual([{ key: '0.0', ok: true }]);
    expect(scoreDocument(doc([b]), answer(b, { '0.0': 'õhtul' })).perBlock[b.id][0].ok).toBe(false);
  });

  it('choice supports single and multiple correct options', () => {
    const b = { ...createBlock('choice'), data: { title: '', questions: [{ q: 'a', options: '*x\ny' }, { q: 'b', options: '*x\ny\n*z' }] } };
    const r = scoreDocument(doc([b]), answer(b, { 0: 0, 1: [2, 0] })).perBlock[b.id];
    expect(r.map((x) => x.ok)).toEqual([true, true]);
  });

  it('true/false, match, word order, table, categorize and dialogue score deterministically', () => {
    const tf = createBlock('truefalse');
    expect(scoreDocument(doc([tf]), answer(tf, { 0: 'false', 1: 'true' })).perBlock[tf.id].every((x) => x.ok)).toBe(true);

    const m = createBlock('match');
    // default pairs: 3 items, right column rotated by 2 -> [evening(1)? ...]; find correct letters from the rendered order
    const right = [...m.data.pairs.slice(2), ...m.data.pairs.slice(0, 2)];
    const ans = Object.fromEntries(m.data.pairs.map((p, i) => [i, String.fromCharCode(65 + right.indexOf(p))]));
    expect(scoreDocument(doc([m]), answer(m, ans)).perBlock[m.id].every((x) => x.ok)).toBe(true);

    const wo = createBlock('wordorder');
    expect(scoreDocument(doc([wo]), answer(wo, { 0: 'ma ärkan tavaliselt kell seitse', 1: 'õhtul ma vaatan filmi.' })).perBlock[wo.id].every((x) => x.ok)).toBe(true);

    const t = createBlock('table');
    expect(scoreDocument(doc([t]), answer(t, { '0.1': 'maja', '0.2': 'maja', '1.1': 'kooli', '1.2': 'kooli' })).perBlock[t.id].every((x) => x.ok)).toBe(true);

    const c = createBlock('categorize');
    // alphabetical word order: lähen magama(1), söön hommikusööki(0), vaatan filmi(1), ärkan(0)
    expect(scoreDocument(doc([c]), answer(c, { w0: '1', w1: '0', w2: '1', w3: '0' })).perBlock[c.id].every((x) => x.ok)).toBe(true);

    const d = createBlock('dialogue');
    expect(scoreDocument(doc([d]), answer(d, { '0.0': 'ärkad', '1.0': 'tavaliselt' })).perBlock[d.id].every((x) => x.ok)).toBe(true);
  });

  it('clock accepts digits and Estonian words', () => {
    expect(clockAccept('07:00')).toEqual(expect.arrayContaining(['7.00', 'seitse', 'kell on seitse']));
    expect(clockAccept('06:30')).toEqual(expect.arrayContaining(['pool seitse']));
    const b = createBlock('clock');
    const r = scoreDocument(doc([b]), answer(b, { 0: 'Kell on seitse', 1: 'pool üheksa', 2: '12.00' })).perBlock[b.id];
    expect(r.map((x) => x.ok)).toEqual([true, true, true]);
  });

  it('aggregates results per lesson goal', () => {
    const s = seedDocument();
    const clock = s.blocks.find((b) => b.type === 'clock');
    const res = scoreDocument(s, answer(clock, { 0: 'seitse' }));
    expect(res.perGoal.g_time).toEqual({ ok: 1, total: 6 });
  });
});

describe('legacy worksheetData adapter', () => {
  it('converts every v1 block type into renderable v2 blocks', () => {
    const v1 = {
      meta: { title: 'Vana leht', level: 'B1', topic: 'Pere' },
      blocks: [
        { type: 'text', content: 'Tere' },
        { type: 'fill', text: 'Ma [elan] Tallinnas.' },
        { type: 'choice', questions: [{ q: 'Kes?', opts: ['ema', 'isa'], correct: 1 }] },
        { type: 'reading', passage: 'Lugu', questions: [{ q: 'Mis?', opts: ['a', 'b'], correct: 0 }] },
        { type: 'true_false', statements: [{ text: 'Jah', correct: true }] },
        { type: 'multi_select', questions: [{ q: 'Vali', opts: ['a', 'b', 'c'], correct: [0, 2] }] },
        { type: 'match', pairs: [{ l: 'ema', r: 'mother' }] },
        { type: 'connect', pairs: [{ l: 'isa', r: 'father' }] },
        { type: 'dialogue', lines: [{ speaker: 'Mari', text: 'Tere!' }, { speaker: 'Jaan', text: 'Tere [Mari]!' }] },
        { type: 'writing', task: 'Kirjuta perest.', lines: 5 },
        { type: 'order', sentence: 'Ma elan Tallinnas' },
        { type: 'table', headers: ['a', 'b'], rows: 2, cellData: { '0,0': 'x' } },
        { type: 'dictation', audioUrl: 'https://x/a.mp3', sentences: [{ text: 'Tere hommikust' }] },
        { type: 'voice_recording', prompt: 'Räägi' },
        { type: 'mystery' },
      ],
    };
    const d = convertLegacyWorksheet(v1);
    expect(d.meta).toMatchObject({ title: 'Vana leht', level: 'B1', module: 'Pere' });
    expect(d.blocks.every((b) => BLOCKS[b.type])).toBe(true);
    expect(d.blocks.find((b) => b.type === 'choice').data.questions[0].options).toBe('ema\n*isa');
    expect(d.blocks.find((b) => b.type === 'dialogue').data).toMatchObject({ speakerA: 'Mari', speakerB: 'Jaan' });
    const { container } = render(<Sheet doc={d} mode="print" />);
    expect(container.querySelectorAll('.ws-page .ws-card').length).toBe(d.blocks.length);
  });
});
