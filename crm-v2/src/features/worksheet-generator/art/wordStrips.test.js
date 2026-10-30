import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { COURSE_MODULES, moduleSheets } from '../admin/course/registry.js';
import { rowsOf } from '../../worksheet-studio/engine/layout.js';
import { isFinalShapeTask } from '../../worksheet-studio/didactics/taskCatalogue.js';
import { blockMinutes, sheetMinutes } from '../../worksheet-studio/didactics/timeEstimate.js';
import { ALL_WORDS, SAME_PICTURE, STRIP_WORDS, answerText, visibleText, wordForms, wordsInText, withWordStrips } from './wordStrips.js';

const WORDS = ['kala', 'supp', 'salat', 'kohv', 'piim', 'liha', 'leib', 'tass', 'klaas', 'hind', 'kilo', 'liiter', 'turg', 'pank'].map((word) => ({ id: word, word, src: `/w/${word}.webp`, alt: `Pilt: ${word}`, lessonIds: ['x-1'] }));
const reading = (id, passage) => ({ id, type: 'reading', width: 'full', data: { title: 't', instruction: 'i', passage, questions: '' } });
const speaking = (id, questions) => ({ id, type: 'speaking', width: 'full', data: { title: 't', instruction: 'i', questions } });
const gaps = (id, sentences) => ({ id, type: 'gaps', width: 'full', data: { title: 't', instruction: 'i', sentences } });
const docOf = (blocks, meta = {}) => ({ schema: 'keelesepp.worksheet/2', meta, blocks });
const build = (blocks, meta) => withWordStrips(docOf(blocks, meta), 'x-1', 'practice', WORDS);
const strips = (doc) => doc.blocks.filter((block) => block.type === 'wordstrip');
const words = (strip) => strip.data.items.map((item) => item.word);
// a long sheet: every task has its own words
const FOOD = [
  gaps('g0', 'See on [tekst].'),
  reading('r1', 'Ma söön kala ja supp on hea.'),
  speaking('s1', 'Mis on salat?\nKas sa jood kohvi?'),
  reading('r2', 'Piima ja liha ostame.'),
  speaking('s2', 'Kus on leib?\nKus on tass?'),
  reading('r3', 'Üks klaas ja hind on hea.'),
  speaking('s3', 'Mis on kilo?\nMis on liiter?'),
  reading('r4', 'Kus on turg ja kus on pank?'),
];

describe('word forms', () => {
  const entry = (word) => ({ id: word, word, lessonIds: [] });
  const hit = (text, word) => wordsInText(text, [entry(word)]).length === 1;
  it('finds inflected forms', () => {
    expect(hit('Ma ostan kala.', 'kala')).toBe(true);
    expect(hit('Me sõime kalaga.', 'kala')).toBe(true);
    expect(hit('Tema elab siin.', 'elama')).toBe(true);
    expect(hit('Ma räägin eesti keelt.', 'rääkima')).toBe(true);
    expect(hit('Sul on palavikku.', 'palavik')).toBe(true);
    expect(hit('Tänan abi eest, küsimused on selged. Üks küsimuse vorm.', 'küsimus')).toBe(true);
    expect(hit('Mul on sinu nime vaja.', 'nimi')).toBe(true);
    expect(wordForms(entry('õpilane')).has('õpilast')).toBe(true);
    expect(hit('Saada e-postiga.', 'e-post')).toBe(true);
  });
  it('does not hit other words that begin the same way', () => {
    expect(hit('Me läheme kohvikusse.', 'kohv')).toBe(false);
    expect(hit('Ta läks raamatukogusse.', 'raamat')).toBe(false);
    expect(hit('Tal on hobune.', 'hobi')).toBe(false);
    expect(hit('Üks kilomeeter.', 'kilo')).toBe(false);
    expect(hit('Sa pead minema.', 'pea')).toBe(false);
    expect(hit('See on selge.', 'selg')).toBe(false);
    expect(hit('Oskar on 8 aastat vana.', 'vana')).toBe(false);
    expect(hit('Kui vana ta on?', 'vana')).toBe(false);
    expect(hit('Kuidas sinu päev läheb?', 'minema')).toBe(false);
  });
  it('skips names inside a sentence and needs context for a homonym', () => {
    expect(hit('Me elame aadressil Pikk tänav 5.', 'pikk')).toBe(false);
    expect(hit('Pikk mees tuli.', 'pikk')).toBe(true);
    expect(hit('Tee on kitsas.', 'tee')).toBe(false);
    expect(hit('Ma joon kohvi või tee.', 'tee')).toBe(true);
    expect(hit('Maksan kaardiga.', 'kaart')).toBe(false);
  });
});

describe('what counts as visible', () => {
  it('drops answer keys, options, hidden fields; a closed task\'s instruction and every title', () => {
    expect(visibleText(gaps('g', 'Ma ostan [kala] poest.'))).not.toMatch(/kala/);
    expect(visibleText({ id: 'c', type: 'cloze', data: { passage: 'Mul on {*supp|kala}.' } })).not.toMatch(/supp|kala/);
    expect(visibleText({ id: 'i', type: 'insertion', data: { passage: 'Algus [[ta ostab kala]] lõpp.', extra: 'supp' } })).not.toMatch(/kala|supp/);
    expect(visibleText({ id: 'l', type: 'listening', data: { sentences: 'Ta sööb [kala].', transcript: 'Ta sööb kala ja suppi.' } })).not.toMatch(/kala|suppi/);
    expect(visibleText({ id: 'x', type: 'choice', data: { title: 'kala', instruction: 'kala', questions: [{ q: 'Mis see on?', options: '*kala\nsupp' }] } })).not.toMatch(/kala|supp/);
    expect(visibleText({ id: 'w', type: 'writing', data: { title: 'kala', instruction: 'Kirjuta kalast.', teacher: 'supp' } })).toMatch(/kalast/);
  });
  it('collects what the learner must find', () => {
    expect(answerText(gaps('g', 'Ma ostan [kala] poest.'))).toMatch(/kala/);
    expect(answerText({ id: 'c', type: 'cloze', data: { passage: 'Mul on {*supp|kala}.' } })).toMatch(/supp/);
    expect(answerText({ id: 'c', type: 'cloze', data: { passage: 'Mul on {*supp|kala}.' } })).not.toMatch(/kala/);
    expect(answerText({ id: 'x', type: 'choice', data: { questions: [{ q: 'Q', options: '*kala\nsupp' }] } })).toMatch(/kala/);
    expect(answerText({ id: 'm', type: 'match', data: { pairs: [{ left: 'kala', right: 'рыба' }] } })).toMatch(/kala/);
    expect(answerText({ id: 'cw', type: 'crossword', data: { rows: [{ clue: 'q', answer: 'supp' }] } })).toMatch(/supp/);
  });
});

describe('withWordStrips', () => {
  it('puts strips directly before the tasks that use the words, with stable ids and no number or answers', () => {
    const doc = build(FOOD);
    expect(strips(doc).map((strip) => strip.id)).toEqual(['wordstrip_x-1_practice_1', 'wordstrip_x-1_practice_2', 'wordstrip_x-1_practice_3']);
    expect(strips(doc)[0]).toMatchObject({ type: 'wordstrip', span: 12, width: 'full', data: { artFor: 'words' } });
    expect(strips(doc)[0].data.items[0]).toMatchObject({ word: expect.any(String), alt: expect.stringContaining('Pilt:'), img: { src: expect.stringContaining('/w/') } });
    expect(JSON.stringify(build(FOOD))).toBe(JSON.stringify(doc));
    expect(withWordStrips(doc, 'x-1', 'practice', WORDS)).toBe(doc);
    expect(doc.blocks.filter((block) => block.type !== 'wordstrip').map((block) => block.id)).toEqual(FOOD.map((block) => block.id));
  });

  it('shows each word once, spreads the strips, keeps two tasks between them, at most three', () => {
    const doc = build(FOOD);
    const all = strips(doc).flatMap(words);
    expect(new Set(all).size).toBe(all.length);
    expect(strips(doc)).toHaveLength(3);
    const taskIndex = (strip) => doc.blocks.slice(0, doc.blocks.indexOf(strip)).filter(isFinalShapeTask).length;
    const orders = strips(doc).map(taskIndex);
    orders.slice(1).forEach((order, i) => expect(order - orders[i]).toBeGreaterThanOrEqual(2));
    expect(orders[orders.length - 1] - orders[0]).toBeGreaterThanOrEqual(4);
    strips(doc).forEach((strip) => { expect(strip.data.items.length).toBeGreaterThanOrEqual(STRIP_WORDS.min); expect(strip.data.items.length).toBeLessThanOrEqual(STRIP_WORDS.max); });
  });

  it('never shows a word that is only an answer, or that is asked next to the strip or below it', () => {
    const doc = build([
      gaps('g0', 'See on [tekst].'),
      gaps('g1', 'Ma ostan [kala] ja [supp].'),
      reading('r1', 'Kala on hea, supp on hea, salat ja kohv ja piim ja leib on head.'),
      gaps('g2', 'Mul on [salat].'),
    ]);
    const all = strips(doc).flatMap(words);
    expect(all).toEqual(expect.arrayContaining(['kohv', 'piim', 'leib']));
    ['kala', 'supp', 'salat'].forEach((word) => expect(all).not.toContain(word));
  });

  it('never on exam or diagnostic sheets', () => {
    expect(build(FOOD, { assessment: true }).blocks).toHaveLength(FOOD.length);
    expect(build(FOOD, { diagnostic: true }).blocks).toHaveLength(FOOD.length);
    const header = { id: 'part', type: 'exampart', width: 'full', data: { skill: 'R' } };
    expect(build([header, ...FOOD]).blocks).toHaveLength(FOOD.length + 1);
  });

  it('never splits a hint from its task, a picture from its card, a plan from its speech or a half-width row, and never opens the sheet', () => {
    const hint = { id: 'n', type: 'notice', width: 'half', span: 12, data: { title: 'Märka', lines: 'x' } };
    const task = reading('r', 'Kala ja supp ja salat ja kohv.');
    const withHint = build([gaps('g0', 'See on [tekst].'), hint, task]);
    expect(withHint.blocks.map((block) => block.id).join()).toMatch(/^g0,wordstrip_[^,]+,n,r$/);

    const art = [{ id: 'a', type: 'image', span: 8, data: { artId: 'pic' } }, { id: 'c', type: 'notice', span: 4, data: { artFor: 'pic', title: 'Vaata pilti' } }];
    const afterArt = build([gaps('g0', 'See on [tekst].'), ...art, task]);
    expect(strips(afterArt)).toHaveLength(0);

    const plan = { id: 'p', type: 'planning', width: 'full', data: { prompts: 'x' } };
    expect(strips(build([gaps('g0', 'See on [tekst].'), plan, speaking('s', 'Kala, supp, salat, kohv?')]))).toHaveLength(0);

    const half = { ...reading('h1', 'See on tekst.'), width: 'half', span: 6 };
    const halfTask = { ...reading('h2', 'Kala ja supp ja salat.'), width: 'half', span: 6 };
    expect(strips(build([gaps('g0', 'See on [tekst].'), half, halfTask]))).toHaveLength(0);

    expect(strips(build([task]))).toHaveLength(0);
  });

  it('no strip for a meaning task, whose words it would solve', () => {
    const match = { id: 'm', type: 'match', width: 'full', data: { pairs: [{ left: 'kala', right: 'a' }, { left: 'supp', right: 'b' }, { left: 'salat', right: 'c' }] } };
    expect(strips(build([gaps('g0', 'See on [tekst].'), match]))).toHaveLength(0);
  });

  it('a task with two words is filled up from the sheet; with nothing to fill it gets no strip', () => {
    const doc = build([gaps('g0', 'See on [tekst].'), reading('r', 'Kala ja supp.'), gaps('g1', 'See on [tekst].'), reading('r2', 'Hea salat.')]);
    expect(words(strips(doc)[0])).toEqual(['kala', 'supp', 'salat']);
    expect(strips(build([gaps('g0', 'See on [tekst].'), reading('r', 'Kala ja supp.')]))).toHaveLength(0);
  });

  it('does not show one picture twice', () => {
    const twins = [...WORDS, { id: 'pikk', word: 'pikk', src: '/w/p.webp', alt: 'p', lessonIds: ['x-1'] }, { id: 'luhike', word: 'lühike', src: '/w/l.webp', alt: 'l', lessonIds: ['x-1'] }];
    const doc = withWordStrips(docOf([gaps('g0', 'See on [tekst].'), reading('r', 'Pikk mees ja lühike naine, kala ja supp.')]), 'x-1', 'practice', twins);
    expect(words(strips(doc)[0])).toEqual(['pikk', 'kala', 'supp']);
  });

  it('takes no time and is not a task', () => {
    const block = strips(build(FOOD))[0];
    expect(blockMinutes(block)).toBe(0);
    expect(isFinalShapeTask(block)).toBe(false);
  });
});

describe('word pictures', () => {
  const md5 = (entry) => createHash('md5').update(readFileSync(`${globalThis.process.cwd()}/public${entry.src}`)).digest('hex');
  it('SAME_PICTURE lists exactly the pictures that are the same file', () => {
    const byHash = new Map();
    ALL_WORDS.forEach((entry) => byHash.set(md5(entry), [...(byHash.get(md5(entry)) || []), entry.id]));
    const same = [...byHash.values()].filter((ids) => ids.length > 1).map((ids) => [...ids].sort());
    expect(same.sort()).toEqual(Object.entries(SAME_PICTURE).map((pair) => [...pair].sort()).sort());
  });
});

describe('the A2 sheets', () => {
  const sheets = COURSE_MODULES.filter((mod) => String(mod.MODULE.id).startsWith('a2')).flatMap((mod) => Object.entries(moduleSheets(mod)).flatMap(([id, phases]) => Object.entries(phases).map(([phase, doc]) => ({ id, phase, doc }))));
  const withStrips = sheets.filter(({ doc }) => strips(doc).length);
  it('get strips', () => {
    expect(withStrips.length).toBeGreaterThan(60);
  });
  it('keep every placement rule on the real content', () => {
    for (const { id, phase, doc } of withStrips) {
      const where = `${id} ${phase}`;
      expect(doc.meta.assessment, where).toBeFalsy();
      expect(doc.blocks.some((block) => block.type === 'exampart'), where).toBe(false);
      expect(strips(doc).length, where).toBeLessThanOrEqual(3);
      const all = strips(doc).flatMap((strip) => strip.data.items.map((item) => item.id));
      expect(new Set(all).size, where).toBe(all.length);
      const rowStarts = new Set(rowsOf(doc.blocks).map((row) => row[0].id));
      const tasks = doc.blocks.filter(isFinalShapeTask);
      strips(doc).forEach((strip, n) => {
        expect(strip.id, where).toBe(`wordstrip_${id}_${phase}_${n + 1}`);
        expect(rowStarts.has(strip.id), where).toBe(true);
        expect(strip.data.items.length, where).toBeGreaterThanOrEqual(3);
        strip.data.items.forEach((item) => expect(existsSync(`${globalThis.process.cwd()}/public${item.img.src}`), item.img.src).toBe(true));
        const at = doc.blocks.indexOf(strip);
        expect(at, where).toBeGreaterThan(0);
        expect(doc.blocks[at - 1].data?.artId || doc.blocks[at - 1].data?.artFor, where).toBeFalsy();
        // nothing on the strip is asked by the task above it or anywhere below it
        const before = doc.blocks.slice(0, at).filter(isFinalShapeTask);
        const from = before.length ? doc.blocks.indexOf(before[before.length - 1]) : 0;
        const asked = doc.blocks.slice(from).filter((block) => block.type !== 'wordstrip').map(answerText).join(' ');
        const entries = strip.data.items.map((item) => ALL_WORDS.find((entry) => entry.id === item.id));
        expect(wordsInText(asked.replace(/[A-ZÕÄÖÜŠŽ]/g, (c) => c.toLowerCase()), entries).map((entry) => entry.word), where).toEqual([]);
      });
      const orders = strips(doc).map((strip) => doc.blocks.slice(0, doc.blocks.indexOf(strip)).filter(isFinalShapeTask).length);
      orders.slice(1).forEach((order, i) => expect(order - orders[i], where).toBeGreaterThanOrEqual(2));
      expect(tasks.length, where).toBeGreaterThan(0);
    }
  });
  it('take the same minutes with and without strips', () => {
    for (const { doc } of withStrips) {
      expect(sheetMinutes(doc)).toBe(sheetMinutes({ ...doc, blocks: doc.blocks.filter((block) => block.type !== 'wordstrip') }));
    }
  });
});
