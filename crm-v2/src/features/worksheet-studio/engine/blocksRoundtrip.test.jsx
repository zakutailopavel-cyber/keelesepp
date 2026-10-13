import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { BLOCKS, checkDocument, createBlock, scoreDocument } from './registry.js';
import Sheet, { SheetCard } from './Sheet.jsx';
import { sampleDocument } from './sample.js';
import { SPLITTABLE, canSplit, itemCount } from './pageSplit.js';
import { picmatchOrder } from './blocks/picture.jsx';
import { DocWorksheetSubmissionPreview } from '../DocWorksheetPlayer.jsx';
import { rightAnswers } from './liveLesson.js';

// Every answerable block, end to end, the way people use it: the student answers through the sheet (typing, clicking,
// selecting), the answers are scored, the teacher sees them with ✓ / ✗ in review, print stays blank, and a task split
// over two pages writes its second part to the right answer keys.

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

// a new answerable block must be added here (and get a case below) — a missing one fails the first test
const EXPECTED = [
  'gaps', 'choice', 'truefalse', 'match', 'pictures', 'clock', 'cloze', 'picmatch', 'scenelabel', 'profiles', 'picrows',
  'dialogue', 'reading', 'listening', 'table', 'categorize', 'wordorder', 'writing', 'wordforms', 'errorfix',
  'transformation', 'dictation', 'translation', 'crossword', 'planning', 'guidedletter', 'rubric', 'diagram',
];

const doc = (blocks) => ({ ...sampleDocument(), blocks });
const optionList = (s) => String(s || '').split('\n').map((o) => o.trim()).filter(Boolean).map((o) => ({ text: o.replace(/^\*/, '').trim(), correct: o.startsWith('*') }));
const fields = (card) => [...card.querySelectorAll('input:not([type="checkbox"]), textarea')];
const values = (card) => fields(card).map((f) => f.value);
const ownAnswers = (answers, id) => Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith(`${id}:`)).map(([k, v]) => [k.slice(id.length + 1), v]));
const byText = (els, text) => els.find((el) => el.textContent.trim() === text);

// ---------- what each block is answered with ----------
// data: richer than the default where needed; right(block) → key → the right answer typed by the learner (text blocks);
// drive: clicks / selects for the non-text blocks; review: what the teacher must see.
const CASES = {
  gaps: {
    data: { bank: 'hommikul, päeval, õhtul, loen, kirjutan', sentences: 'Ma ärkan [hommikul|varakult] kell 7.\nMa söön lõunat [päeval].\nÕhtul ma [loen] ja [kirjutan].\nMa lähen magama [õhtul].' },
    // an alternative, capitals, punctuation and spaces are all accepted
    right: () => ({ '0.0': 'VARAKULT', '1.0': 'päeval.', '2.0': 'loen', '2.1': 'kirjutan', '3.0': ' Õhtul ' }),
  },
  choice: {
    data: { questions: [
      { q: 'Mis kell sa ärkad?', options: '*kell seitse\nkell kakskümmend\nõhtul' },
      { q: 'Mis sobib? (kaks vastust)', options: 'laud\n*hommikul\n*õhtul' },
      { q: 'Kus sa elad?', options: 'Tallinnale\n*Tallinnas\nTallinnasse' },
      { q: 'Kes sa oled?', options: 'õpetajat\n*õpetaja' },
    ] },
    drive: (card, block, { start = 0, wrong = false } = {}) => {
      const lis = () => [...card().querySelectorAll('.ws-choice > li')];
      lis().forEach((_, i) => {
        const o = optionList(block.data.questions[start + i].options);
        const texts = wrong ? (i === 0 ? [o.find((x) => !x.correct).text] : []) : o.filter((x) => x.correct).map((x) => x.text);
        texts.forEach((t) => fireEvent.click(byText([...lis()[i].querySelectorAll('.ws-opt')], t)));
      });
    },
    review: (card, block) => {
      const on = [...card.querySelectorAll('.ws-opt.on')];
      const correct = block.data.questions.flatMap((q) => optionList(q.options).filter((x) => x.correct).map((x) => x.text));
      expect(on.map((b) => b.textContent.trim()).sort()).toEqual([...correct].sort());
    },
  },
  truefalse: {
    data: { statements: [{ text: 'Päeval on pime.', answer: 'false' }, { text: 'Hommikul ma ärkan.', answer: 'true' }, { text: 'Öösel ma magan.', answer: 'true' }, { text: 'Talvel on palav.', answer: 'false' }] },
    drive: (card, block, { start = 0, wrong = false } = {}) => {
      [...card().querySelectorAll('.ws-tf-row')].forEach((row, i) => {
        if (wrong && i > 0) return;
        const yes = block.data.statements[start + i].answer === 'true';
        fireEvent.click(row.querySelector(`[aria-label="${yes !== wrong ? 'Õige' : 'Vale'}"]`));
      });
    },
    review: (card, block) => expect(card.querySelectorAll('.ws-tfbox.on')).toHaveLength(block.data.statements.length),
  },
  match: {
    drive: (card, block, { wrong = false } = {}) => {
      const letters = Object.fromEntries([...card().querySelectorAll('.ws-match ul li')].map((li) => [li.textContent.slice(3).trim(), li.querySelector('b').textContent[0]]));
      [...card().querySelectorAll('.ws-match select')].forEach((sel, i) => {
        if (wrong && i > 0) return;
        const right = letters[block.data.pairs[i].right];
        fireEvent.change(sel, { target: { value: wrong ? Object.values(letters).find((l) => l !== right) : right } });
      });
    },
    review: (card, block, answers) => expect([...card.querySelectorAll('.ws-letterbox')].map((x) => x.textContent)).toEqual(block.data.pairs.map((_, i) => answers[`${i}`])),
  },
  pictures: {
    data: { items: [{ img: null, caption: 'Söön.', answer: '2' }, { img: null, caption: 'Ärkan.', answer: '1' }, { img: null, caption: 'Lähen tööle.', answer: '3' }] },
    right: () => ({ 0: '2', 1: '1', 2: '3' }),
  },
  clock: { right: () => ({ 0: 'Kell on seitse.', 1: 'pool üheksa', 2: '12.00' }) },
  cloze: {
    drive: (card, block, { wrong = false } = {}) => {
      [...card().querySelectorAll('select.ws-cloze-sel')].forEach((sel, gi) => {
        if (wrong && gi > 0) return;
        const opt = [...sel.querySelectorAll('option')].filter((o) => o.value !== '');
        // the right option is written first in the source: its value is 0
        const pick = wrong ? opt.find((o) => o.value !== '0') : opt.find((o) => o.value === '0');
        fireEvent.change(sel, { target: { value: pick.value } });
      });
    },
    review: (card) => {
      const shown = [...card.querySelectorAll('.ws-cloze-gap')];
      expect(shown.map((g) => g.textContent)).toEqual([expect.stringContaining('alustasin'), expect.stringContaining('tutvustas'), expect.stringContaining('meeldib')]);
    },
  },
  picmatch: {
    right: (b) => (key) => 'abcdefgh'[picmatchOrder(b.data.items, b.id).indexOf(Number(key))],
  },
  scenelabel: {
    data: { pins: [{ x: 30, y: 30, answer: 'pööning' }, { x: 70, y: 45, answer: 'vannituba' }, { x: 30, y: 65, answer: 'köök|kook' }, { x: 70, y: 85, answer: 'garaaž' }] },
    right: () => ({ 0: 'pööning', 1: 'Vannituba', 2: 'kook', 3: 'garaaž' }),
  },
  profiles: { right: () => (key) => (/^\d\.\d\.0$/.test(key) ? 'on' : undefined) },
  picrows: {
    data: { rows: [{ img: null, text: 'Anna ostis kümme vihmavarju.', question: 'Miks?' }, { img: null, text: 'Markus ootab.', question: 'Keda?' }, { img: null, text: 'Uks on lahti.', question: 'Miks?' }] },
    right: () => (key) => `Minu vastus ${key}`,
  },
  dialogue: {
    data: { lines: [{ who: 'A', text: 'Tere! Mis kell sa [ärkad]?' }, { who: 'B', text: 'Ma ärkan [tavaliselt|harilikult] kell seitse.' }, { who: 'A', text: 'Ja millal sa [lähed] tööle?' }] },
    right: () => ({ '0.0': 'ärkad', '1.0': 'harilikult', '2.0': 'lähed' }),
  },
  reading: {
    data: { passage: 'Mari ärkab kell seitse.\n\nÕhtul ta loeb raamatut.', questions: 'Mis kell Mari ärkab? [kell seitse|7]\nMida Mari õhtul teeb? [loeb raamatut|loeb]\nMis sulle meeldib?\nKes on Mari?  [naine|tüdruk]' },
    right: () => ({ 0: 'Kell seitse.', 1: 'Ta loeb raamatut', 2: 'Mulle meeldib lugeda.', 3: 'tüdruk' }),
  },
  listening: {
    data: { sentences: 'Mari ärkab kell [seitse|7].\nTa joob [kohvi].\nSiis ta [läheb] tööle.' },
    right: () => ({ '0.0': '7', '1.0': 'kohvi', '2.0': 'läheb' }),
  },
  table: {
    data: { headers: 'Nimetav, Omastav, Osastav', rows: 'maja | [maja] | [maja]\nkool | [kooli] | [kooli]\nlaud | laua | [lauda/lauad]\nsõber | sõbra | Ma näen [sõpra].' },
    right: () => ({ '0.1': 'maja', '0.2': 'maja', '1.1': 'kooli', '1.2': 'kooli', '2.2': 'lauad', '3.2.0': 'sõpra' }),
  },
  categorize: {
    data: { groups: [{ name: 'Hommikul', words: 'ärkan, söön putru' }, { name: 'Päeval', words: 'töötan' }, { name: 'Õhtul', words: 'vaatan filmi, lähen magama' }] },
    drive: (card, block, { wrong = false } = {}) => {
      const groupOf = Object.fromEntries(block.data.groups.flatMap((g) => g.words.split(',').map((w) => [w.trim(), g.name])));
      const words = [...card().querySelectorAll('.ws-cat > .ws-bank .ws-bank-w')].map((w) => w.textContent);
      words.forEach((w, i) => {
        if (wrong && i > 0) return;
        fireEvent.click([...card().querySelectorAll('.ws-cat > .ws-bank .ws-bank-w')][i]);
        const target = wrong ? block.data.groups.find((g) => g.name !== groupOf[w]).name : groupOf[w];
        fireEvent.click([...card().querySelectorAll('.ws-cat-g')].find((g) => g.querySelector('b').textContent === target));
      });
    },
    review: (card) => expect(card.querySelectorAll('.ws-cat-item')).toHaveLength(5),
  },
  wordorder: {
    data: { sentences: 'Ma ärkan tavaliselt kell seitse.\nÕhtul ma vaatan filmi.\nMa joon hommikul kohvi.\nTa elab Tallinnas.' },
    right: (b) => (key) => b.data.sentences.split('\n')[Number(key)]?.toLowerCase().replace('.', ''),
  },
  writing: {
    right: () => ({ text: 'Hommikul ma ärkan vara. Päeval ma töötan kontoris. Õhtul ma vaatan filmi. Tavaliselt ma söön kodus. Enne tööd ma joon kohvi. Pärast tööd ma jalutan.' }),
    marks: false, // judged by the counters (sentences, keywords), not by ✓ / ✗ on a field
  },
  wordforms: {
    data: { rows: [{ base: 'koer', prompt: 'omastav', answer: 'koera' }, { base: 'õppima', prompt: 'ma-vorm', answer: 'õpin' }, { base: 'maja', prompt: 'osastav', answer: 'maja' }, { base: 'kool', prompt: 'sisseütlev', answer: 'kooli, koolisse' }] },
    right: () => ({ 0: 'Koera', 1: 'õpin', 2: 'maja', 3: 'koolisse' }),
  },
  errorfix: {
    data: { rows: [{ wrong: 'Ma lähen koolis.', answer: 'Ma lähen kooli.' }, { wrong: 'Ta õppib eesti keel.', answer: 'Ta õpib eesti keelt.' }, { wrong: 'Ma ei lähe homme tööle, sest ma olen haige', answer: 'Ma ei lähe homme tööle, sest olen haige. | Homme ma ei lähe tööle, sest olen haige.' }, { wrong: 'Mul on kaks koer.', answer: 'Mul on kaks koera.' }] },
    right: () => ({ 0: 'Ma lähen kooli', 1: 'Ta õpib eesti keelt.', 2: 'Homme ma ei lähe tööle, sest olen haige', 3: 'mul on kaks koera.' }),
  },
  transformation: {
    data: { rows: [{ from: 'Ma lähen täna tööle.', prompt: 'Eitav.', answer: 'Ma ei lähe täna tööle.' }, { from: 'Mari elab Tallinnas.', prompt: 'Alusta sõnaga „Tallinnas”.', answer: 'Tallinnas elab Mari.' }, { from: 'Ma loen raamatut.', prompt: 'Minevik.', answer: 'Ma lugesin raamatut.' }, { from: 'Ta tuleb.', prompt: 'Eitav.', answer: 'Ta ei tule.; Tema ei tule.' }] },
    right: () => ({ 0: 'Ma ei lähe täna tööle.', 1: 'Tallinnas elab Mari', 2: 'Ma lugesin raamatut.', 3: 'Tema ei tule' }),
  },
  dictation: {
    data: { sentences: 'Hommikul lähen ma tööle.\nÕhtul loen raamatut.\nMa elan Tartus.' },
    right: () => ({ 0: 'Hommikul lähen ma tööle.', 1: 'õhtul loen raamatut', 2: 'Ma elan Tartus.' }),
  },
  translation: {
    data: { rows: [{ source: 'Я живу в Таллине.', hint: '' }, { source: 'Сегодня тепло.', hint: '' }, { source: 'Я учусь.', hint: '' }, { source: 'Он дома.', hint: '' }] },
    right: () => (key) => `Tõlge ${key}`,
  },
  crossword: {
    data: { rows: [{ clue: 'Koht, kus õpitakse', answer: 'kool' }, { clue: 'Inimene, kes õpetab', answer: 'õpetaja' }, { clue: 'Raamat, millest õpitakse', answer: 'õpik' }] },
    drive: (card, block, { wrong = false } = {}) => {
      block.data.rows.forEach((row, i) => {
        if (wrong && i > 0) return;
        [...row.answer].forEach((ch, ci) => {
          const cell = card().querySelectorAll('.ws-crossword > li')[i].querySelectorAll('input')[ci];
          if (wrong && ci !== 0) return;
          fireEvent.change(cell, { target: { value: wrong ? 'x' : ci === 0 ? ch.toUpperCase() : ch } });
        });
      });
    },
    review: (card, block) => block.data.rows.forEach((row, i) => expect([...card.querySelectorAll('.ws-crossword > li')[i].querySelectorAll('input')].map((x) => x.value).join('').toLowerCase()).toBe(row.answer)),
  },
  planning: { right: () => (key) => `Plaan ${key}` },
  guidedletter: { right: () => ({ text: 'Lugupeetud esindaja, kirjutan teile pargi pärast.' }) },
  rubric: {
    drive: (card) => [...card().querySelectorAll('.ws-rubric input[type="checkbox"]')].forEach((_, i) => fireEvent.click(card().querySelectorAll('.ws-rubric input[type="checkbox"]')[i])),
    review: (card) => expect([...card.querySelectorAll('.ws-rubric input')].every((x) => x.checked)).toBe(true),
  },
  diagram: { right: (b) => (key) => { const hit = BLOCKS.diagram.answers(b.data).find((a) => a.key === key); return hit ? hit.accept[hit.accept.length - 1] : undefined; } },
};

const make = (type, variant) => {
  const b = createBlock(variant ? `${type}:${variant}` : type);
  return { ...b, data: { ...b.data, ...(CASES[type].data || {}) } };
};
// the input keys of a block: what the learner fills in
const inputKeys = (b) => {
  const def = BLOCKS[b.type];
  return typeof def.answerKeys === 'function' ? def.answerKeys(b.data) : def.score(b.data, () => undefined, b).map((i) => i.key);
};

function mount(block) {
  const store = { answers: {} };
  const d = doc([block]);
  function Student() {
    const [answers, setAnswers] = useState({});
    const setAnswer = (k, v) => setAnswers((a) => { const next = { ...a, [k]: v }; store.answers = next; return next; });
    return <Sheet doc={d} mode="interactive" answers={answers} setAnswer={setAnswer} />;
  }
  const utils = render(<Student />);
  return { ...utils, store, doc: d, card: () => utils.container.querySelector(`.ws-page [data-block="${block.id}"]`) };
}

// a part of a split task, drawn the way the page draws it (Card with `part`); the answers go to the whole block
function mountPart(block, part) {
  const store = { answers: {} };
  function Student() {
    const [answers, setAnswers] = useState({});
    const set = (key, v) => setAnswers((a) => { const next = { ...a, [key]: v }; store.answers = next; return next; });
    const ctx = (id) => ({ interactive: true, review: false, get: (k) => answers[`${id}:${k}`], set: (k, v) => set(`${id}:${k}`, v), state: () => undefined, focus: {}, setFocus: () => {} });
    return <div className="ws-root"><div className="ws-page"><SheetCard block={block} num={1} mode="interactive" ctx={ctx} part={part} /></div></div>;
  }
  const utils = render(<Student />);
  return { ...utils, store, card: () => utils.container.querySelector(`.ws-page [data-block="${block.id}"]`) };
}

// Types into every field of the card: first a probe tells which answer key the field writes (one field = one key, no
// two fields on the same key), then the right answer for that key.
function typeAnswers(h, block, right) {
  const seen = [];
  const n = fields(h.card()).length;
  for (let i = 0; i < n; i += 1) {
    const before = ownAnswers(h.store.answers, block.id);
    fireEvent.change(fields(h.card())[i], { target: { value: 'Q9' } });
    const after = ownAnswers(h.store.answers, block.id);
    const changed = Object.keys(after).filter((k) => after[k] !== before[k]);
    expect(changed, `${block.type}: field ${i} writes one key`).toHaveLength(1);
    const key = changed[0];
    expect(seen, `${block.type}: two fields write key ${key}`).not.toContain(key);
    seen.push(key);
    const value = typeof right === 'function' ? right(key) : right[key];
    expect(value, `${block.type}: a right answer for key ${key}`).toBeDefined();
    fireEvent.change(fields(h.card())[i], { target: { value } });
  }
  return seen;
}

const answerRight = (h, block, opts) => {
  const c = CASES[block.type];
  if (c.drive) { c.drive(h.card, block, opts); return Object.keys(ownAnswers(h.store.answers, block.id)); }
  return typeAnswers(h, block, c.right(block));
};
const answerWrong = (h, block) => {
  const c = CASES[block.type];
  if (c.drive) c.drive(h.card, block, { wrong: true });
  else fireEvent.change(fields(h.card())[0], { target: { value: 'xyzzy' } });
};

function reviewShows(card, block, answers) {
  const c = CASES[block.type];
  if (c.review) { c.review(card, block, answers); return; }
  const shown = values(card);
  Object.values(answers).forEach((v) => expect(shown, `${block.type}: the teacher sees „${v}”`).toContain(v));
}

const printIsBlank = (card, type) => {
  expect(values(card).every((v) => v === ''), `${type}: print fields empty`).toBe(true);
  expect([...card.querySelectorAll('input[type="checkbox"]')].some((x) => x.checked), `${type}: print boxes empty`).toBe(false);
  expect(card.querySelectorAll('.on, .is-ok, .is-bad, .placed, .ws-cat-item, .ws-tags, select'), `${type}: print shows no answer`).toHaveLength(0);
  expect([...card.querySelectorAll('.ws-letterbox')].every((x) => (x.value ?? x.textContent) === '' || x.textContent === ''), `${type}: print letters empty`).toBe(true);
};

const collected = { blocks: [], answers: {} };
const RUNS = [
  ...EXPECTED.filter((t) => t !== 'diagram').map((t) => [t, null]),
  ...BLOCKS.diagram.variants.map((v) => ['diagram', v.variant]),
];

describe('every answerable block, student → score → teacher → print', () => {
  it('the list of answerable blocks is complete', () => {
    const answerable = Object.values(BLOCKS).filter((d) => d.score || d.answerKeys).map((d) => d.type);
    expect([...answerable].sort()).toEqual([...EXPECTED].sort());
    EXPECTED.forEach((t) => expect(CASES[t], `a case for ${t}`).toBeDefined());
  });

  it.each(RUNS)('%s %s', (type, variant) => {
    const block = make(type, variant);
    const def = BLOCKS[type];
    const h = mount(block);
    const keys = answerRight(h, block);
    // every field the block asks for was answered through the sheet
    inputKeys(block).forEach((k) => expect(keys, `${type}: key ${k} answered`).toContain(k));
    const right = { ...h.store.answers };
    const marks = def.score && CASES[type].marks !== false;

    if (def.score) {
      const items = scoreDocument(h.doc, right).perBlock[block.id];
      expect(items.length, `${type}: scored items`).toBeGreaterThan(0);
      expect(items.filter((i) => !i.ok).map((i) => i.key), `${type}: all right`).toEqual([]);
      // „Näita vastuseid” in the live lesson and the teacher's error list name the right answer of every item
      if (marks) {
        if (def.answers) expect(def.answers(block.data, block).map((a) => a.key), `${type}: answers keys = scored keys`).toEqual(items.map((i) => i.key));
        expect(rightAnswers(block), `${type}: right answers listed`).toHaveLength(items.length);
      }
    }

    // teacher review: the answers and ✓ marks
    const ok = checkDocument(h.doc, right);
    if (def.score) expect(ok.score.pct, `${type}: 100 %`).toBe(100);
    const r1 = render(<Sheet doc={h.doc} mode="review" answers={right} results={ok.results} />);
    const reviewCard = r1.container.querySelector(`.ws-page [data-block="${block.id}"]`);
    reviewShows(reviewCard, block, ownAnswers(right, block.id));
    if (marks) {
      expect(reviewCard.querySelectorAll('.is-ok').length, `${type}: ✓ marks`).toBeGreaterThan(0);
      expect(reviewCard.querySelectorAll('.is-bad'), `${type}: no ✗`).toHaveLength(0);
    }
    r1.unmount();

    // a wrong answer: under 100 % and a ✗ for the teacher
    if (def.score) {
      answerWrong(h, block);
      const bad = checkDocument(h.doc, h.store.answers);
      expect(bad.score.pct, `${type}: wrong answer scored`).toBeLessThan(100);
      if (marks) {
        const r2 = render(<Sheet doc={h.doc} mode="review" answers={h.store.answers} results={bad.results} />);
        expect(r2.container.querySelectorAll(`.ws-page [data-block="${block.id}"] .is-bad`).length, `${type}: ✗ mark`).toBeGreaterThan(0);
        r2.unmount();
      }
    }

    // print: blank, whatever was answered
    const r3 = render(<Sheet doc={h.doc} mode="print" answers={right} results={ok.results} />);
    printIsBlank(r3.container.querySelector(`.ws-page [data-block="${block.id}"]`), type);
    r3.unmount();
    h.unmount();

    collected.blocks.push(block);
    Object.assign(collected.answers, right);
  });

  it('the homework review dialog shows every block with the student answers and marks', () => {
    const d = doc(collected.blocks);
    const { container } = render(<DocWorksheetSubmissionPreview worksheetDoc={d} answers={collected.answers} />);
    collected.blocks.forEach((block) => {
      const card = container.querySelector(`.ws-page [data-block="${block.id}"]`);
      expect(card, block.type).not.toBeNull();
      reviewShows(card, block, ownAnswers(collected.answers, block.id));
      if (BLOCKS[block.type].score && CASES[block.type].marks !== false) expect(card.querySelectorAll('.is-bad'), block.type).toHaveLength(0);
    });
    expect(container.querySelectorAll('.ws-page .is-ok').length).toBeGreaterThan(collected.blocks.length);
  });
});

describe('a task split over two pages', () => {
  const splittable = Object.keys(SPLITTABLE).filter((t) => !SPLITTABLE[t].printOnly);
  it.each(splittable)('%s: the second part writes the answers of its own items', (type) => {
    const block = make(type);
    expect(canSplit(block, 'interactive'), `${type} fixture can split`).toBe(true);
    const n = itemCount(block);
    // a reading: the second paragraph and the questions from the second one on
    const from = type === 'reading' ? 3 : 2;
    const start = type === 'reading' ? 1 : 2;
    const h = mountPart(block, { from, to: n });
    const keys = answerRight(h, block, { start });
    expect(keys.length).toBeGreaterThan(0);
    keys.forEach((k) => expect(Number(String(k).split('.')[0]), `${type}: key ${k} belongs to the second part`).toBeGreaterThanOrEqual(start));
    // an open task (translation): the keys are enough, the teacher judges the answers
    if (!BLOCKS[type].score) { h.unmount(); return; }
    const items = scoreDocument(doc([block]), h.store.answers).perBlock[block.id];
    const inPart = items.filter((i) => Number(String(i.key).split('.')[0]) >= start);
    expect(inPart.length).toBeGreaterThan(0);
    expect(inPart.filter((i) => !i.ok).map((i) => i.key), `${type}: second-part answers score right`).toEqual([]);
    h.unmount();
  });

  it('choice: a question keeps its option order when it moves to the next page', () => {
    const block = make('choice');
    const whole = mount(block);
    const order = (card, i) => [...card.querySelectorAll('.ws-choice > li')[i].querySelectorAll('.ws-opt')].map((b) => b.textContent);
    const first = order(whole.card(), 3);
    whole.unmount();
    const part = mountPart(block, { from: 2, to: 4 });
    expect(order(part.card(), 1)).toEqual(first);
  });
});

describe('details found while checking the blocks', () => {
  it('gaps: a bank word goes to the first empty gap', () => {
    const block = make('gaps');
    const h = mount(block);
    fireEvent.click(byText([...h.card().querySelectorAll('.ws-bank-w')], 'päeval'));
    expect(h.store.answers[`${block.id}:0.0`]).toBe('päeval');
  });

  it('crossword: clearing one cell keeps the other letters in their cells', () => {
    const block = make('crossword');
    const h = mount(block);
    CASES.crossword.drive(h.card, block);
    const cells = () => [...h.card().querySelectorAll('.ws-crossword > li')[0].querySelectorAll('input')];
    fireEvent.change(cells()[1], { target: { value: '' } });
    expect(cells().map((c) => c.value)).toEqual(['K', '', 'o', 'l']);
    fireEvent.change(cells()[1], { target: { value: 'o' } });
    expect(scoreDocument(h.doc, h.store.answers).perBlock[block.id][0].ok).toBe(true);
  });

  it('cloze: the teacher sees the chosen word, the first option (value 0) included, with its mark', () => {
    const block = make('cloze');
    const answers = { [`${block.id}:0`]: 0, [`${block.id}:1`]: 1 };
    const { results } = checkDocument(doc([block]), answers);
    const { container } = render(<Sheet doc={doc([block])} mode="review" answers={answers} results={results} />);
    const gaps = [...container.querySelectorAll(`.ws-page [data-block="${block.id}"] .ws-cloze-gap`)];
    expect(gaps[0]).toHaveTextContent('alustasin');
    expect(gaps[0]).toHaveClass('is-ok');
    expect(gaps[1]).toHaveTextContent('tutvustab');
    expect(gaps[1]).toHaveClass('is-bad');
    expect(gaps[2]).toHaveTextContent('________');
  });

  it('choice: several right options are compared as numbers (option 11 after option 3)', () => {
    const block = { ...createBlock('choice'), data: { questions: [{ q: 'Vali kaks.', options: 'a\nb\n*c\nd\ne\nf\ng\nh\ni\nj\n*k' }] } };
    expect(scoreDocument(doc([block]), { [`${block.id}:0`]: [10, 2] }).perBlock[block.id][0].ok).toBe(true);
  });

  it('a solved example („Näide”) is shown on paper and never scored', () => {
    for (const type of ['gaps', 'choice', 'truefalse', 'wordforms', 'errorfix', 'dialogue']) {
      const block = { ...make(type), opts: { example: true } };
      const { container, unmount } = render(<Sheet doc={doc([block])} mode="print" />);
      const card = container.querySelector(`.ws-page [data-block="${block.id}"]`);
      expect(values(card).some(Boolean) || card.querySelectorAll('.on').length > 0, `${type}: example shown`).toBe(true);
      unmount();
      const keys = scoreDocument(doc([block]), {}).perBlock[block.id].map((i) => i.key);
      expect(keys.some((k) => String(k).split('.')[0] === '0'), `${type}: example not scored`).toBe(false);
    }
  });
});
