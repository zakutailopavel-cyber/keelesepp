import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { BLOCKS, checkDocument, createBlock, scoreDocument } from './registry.js';
import Sheet from './Sheet.jsx';
import { SPLITTABLE, canSplit, itemCount } from './pageSplit.js';
import { DocWorksheetSubmissionPreview } from '../DocWorksheetPlayer.jsx';
import { rightAnswers } from './liveLesson.js';
import {
  CASES, EXPECTED, answerRight, answerWrong, byText, doc, inputKeys, make, mount, mountPart, ownAnswers, reviewShows, values,
  crosswordCells,
} from '../../../test/blockAnswerCases.jsx';

// Every answerable block, end to end, the way people use it: the student answers through the sheet (typing, clicking,
// selecting), the answers are scored, the teacher sees them with ✓ / ✗ in review, print stays blank, and a task split
// over two pages writes its second part to the right answer keys. The answering cases live in test/blockAnswerCases.jsx.

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

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
    const cells = () => crosswordCells(h.card(), block, 0);
    fireEvent.change(cells()[1], { target: { value: '' } });
    expect(cells().map((c) => c.value)).toEqual(['k', '', 'o', 'l']);
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
