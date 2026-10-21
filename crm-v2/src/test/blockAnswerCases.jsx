import { useState } from 'react';
import { expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { BLOCKS, createBlock } from '../features/worksheet-studio/engine/registry.js';
import Sheet, { SheetCard } from '../features/worksheet-studio/engine/Sheet.jsx';
import { sampleDocument } from '../features/worksheet-studio/engine/sample.js';
import { picmatchOrder } from '../features/worksheet-studio/engine/blocks/picture.jsx';
import { crosswordLayout } from '../features/worksheet-studio/engine/crosswordLayout.js';

// How the learner answers every answerable block through the sheet (typing, clicking, selecting) and what the teacher
// must see afterwards. Shared by the block round trip (engine/blocksRoundtrip.test.jsx) and the student flow tests
// (homework/studentWorksheetFlow.test.jsx).

// a new answerable block must be added here (and get a case below) — a missing one fails the first test
export const EXPECTED = [
  'gaps', 'choice', 'truefalse', 'match', 'pictures', 'clock', 'cloze', 'formtext', 'insertion', 'picmatch', 'scenelabel', 'profiles', 'picrows',
  'dialogue', 'reading', 'listening', 'table', 'categorize', 'wordorder', 'writing', 'wordforms', 'errorfix',
  'transformation', 'dictation', 'translation', 'crossword', 'planning', 'guidedletter', 'rubric', 'diagram',
];

export const doc = (blocks) => ({ ...sampleDocument(), blocks });
export const optionList = (s) => String(s || '').split('\n').map((o) => o.trim()).filter(Boolean).map((o) => ({ text: o.replace(/^\*/, '').trim(), correct: o.startsWith('*') }));
export const fields = (card) => [...card.querySelectorAll('input:not([type="checkbox"]), textarea')];
export const values = (card) => fields(card).map((f) => f.value);
export const ownAnswers = (answers, id) => Object.fromEntries(Object.entries(answers).filter(([k]) => k.startsWith(`${id}:`)).map(([k, v]) => [k.slice(id.length + 1), v]));
export const byText = (els, text) => els.find((el) => el.textContent.trim() === text);

// ---------- what each block is answered with ----------
// data: richer than the default where needed; right(block) → key → the right answer typed by the learner (text blocks);
// drive: clicks / selects for the non-text blocks; review: what the teacher must see.
export const CASES = {
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
    // in front of each lettered answer the student picks the number of its question
    drive: (card, block, { wrong = false } = {}) => {
      [...card().querySelectorAll('.ws-match ul li')].forEach((li, k) => {
        if (wrong && k > 0) return;
        const text = li.textContent.replace(/^[–\d\s]*[A-Z]\.\s*/, '').trim();
        const right = String(block.data.pairs.findIndex((p) => p.right === text) + 1);
        fireEvent.change(li.querySelector('select'), { target: { value: wrong ? (right === '1' ? '2' : '1') : right } });
      });
    },
    review: (card, block, answers) => expect([...card.querySelectorAll('.ws-letterbox')].map((x) => x.textContent)).toEqual(block.data.pairs.map((_, k) => answers[`r${k}`])),
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
  // forms in a text: capitals and punctuation are accepted like in the gaps
  formtext: { right: () => ({ 0: 'Kolisime', 1: 'raamatute', 2: 'kesklinnas.' }) },
  insertion: {
    drive: (card, block, { wrong = false } = {}) => {
      [...card().querySelectorAll('select.ws-cloze-sel')].forEach((sel, gi) => {
        if (wrong && gi > 0) return;
        // the value of a sentence is its place in the source: gap n is sentence n, the extra ones come last
        fireEvent.change(sel, { target: { value: String(wrong ? gi + 1 : gi) } });
      });
    },
    // the teacher sees the letter the learner chose in each gap, marked
    review: (card) => {
      const shown = [...card.querySelectorAll('.ws-cloze-gap')];
      expect(shown).toHaveLength(2);
      shown.forEach((g) => expect(g.textContent).toMatch(/\([12]\) [A-C]/));
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
    data: { sentences: 'Mari ärkab kell [seitse|7].\nTa joob [kohvi].\nSiis ta [läheb] tööle.\nTööl on ta [kaheksa|8] tundi.' },
    right: () => ({ '0.0': '7', '1.0': 'kohvi', '2.0': 'läheb', '3.0': '8' }),
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
          if (wrong && ci !== 0) return;
          fireEvent.change(crosswordCells(card(), block, i)[ci], { target: { value: wrong ? 'x' : ci === 0 ? ch.toUpperCase() : ch } });
        });
      });
    },
    review: (card, block) => block.data.rows.forEach((row, i) => expect(crosswordCells(card, block, i).map((x) => x.textContent || x.value).join('').toLowerCase()).toBe(row.answer)),
  },
  planning: { right: () => (key) => `Plaan ${key}` },
  guidedletter: { right: () => ({ text: 'Lugupeetud esindaja, kirjutan teile pargi pärast.' }) },
  rubric: {
    drive: (card) => [...card().querySelectorAll('.ws-rubric input[type="checkbox"]')].forEach((_, i) => fireEvent.click(card().querySelectorAll('.ws-rubric input[type="checkbox"]')[i])),
    review: (card) => expect([...card.querySelectorAll('.ws-rubric input')].every((x) => x.checked)).toBe(true),
  },
  diagram: { right: (b) => (key) => { const hit = BLOCKS.diagram.answers(b.data).find((a) => a.key === key); return hit ? hit.accept[hit.accept.length - 1] : undefined; } },
};

export const make = (type, variant) => {
  const b = createBlock(variant ? `${type}:${variant}` : type);
  return { ...b, data: { ...b.data, ...(CASES[type].data || {}) } };
};
// the input keys of a block: what the learner fills in
export const inputKeys = (b) => {
  const def = BLOCKS[b.type];
  return typeof def.answerKeys === 'function' ? def.answerKeys(b.data) : def.score(b.data, () => undefined, b).map((i) => i.key);
};

export function mount(block) {
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
export function mountPart(block, part) {
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
export function typeAnswers(h, block, right) {
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

export const answerRight = (h, block, opts) => {
  const c = CASES[block.type];
  if (c.drive) { c.drive(h.card, block, opts); return Object.keys(ownAnswers(h.store.answers, block.id)); }
  return typeAnswers(h, block, c.right(block));
};
export const answerWrong = (h, block) => {
  const c = CASES[block.type];
  if (c.drive) c.drive(h.card, block, { wrong: true });
  else fireEvent.change(fields(h.card())[0], { target: { value: 'xyzzy' } });
};

export function reviewShows(card, block, answers) {
  const c = CASES[block.type];
  if (c.review) { c.review(card, block, answers); return; }
  const shown = values(card);
  Object.values(answers).forEach((v) => expect(shown, `${block.type}: the teacher sees „${v}”`).toContain(v));
}

// the cells of row i on the crossword grid (inputs while answering, letters in review)
export function crosswordCells(root, block, i) {
  const word = crosswordLayout(block.data.rows).words.find((w) => w.i === i);
  return Array.from({ length: word.length }, (_, k) => {
    const x = word.dir === 'across' ? word.x + k : word.x;
    const y = word.dir === 'down' ? word.y + k : word.y;
    return root.querySelector(`input[data-cell="${x},${y}"]`) || [...root.querySelectorAll('.ws-cw-cell')].find((c) => c.style.gridColumn === String(x + 1) && c.style.gridRow === String(y + 1))?.querySelector('b');
  });
}

