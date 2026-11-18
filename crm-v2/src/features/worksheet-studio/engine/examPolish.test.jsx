import { act, fireEvent, render } from '@testing-library/react';
import Sheet, { SheetCard } from './Sheet.jsx';
import { BLOCKS, answerProgress, checkDocument } from './registry.js';
import { keepsWithNext, onScreenContinuous } from './examMode.js';
import { packPages } from './pageSplit.js';
import { rubricShare } from './blocks/harno.jsx';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

// E-exam polish (docs/E_EXAM_ENGINE.md §1, §2): a continuous screen page, numbered 2.5 rows, endings dragged from a bank
const part = { id: 'p', type: 'exampart', data: { title: 'III osa', skill: 'R', minutes: 95 } };
const chart = { id: 'c', type: 'chart', data: { title: 'Kuidas jõuad kooli?', kind: 'pie', unit: '%', rows: 'Bussiga | 60\nJala | 40' } };
const writing = { id: 'w', type: 'examwriting', data: { title: '2. ülesanne', genre: 'kokkuvote', situation: 'Kirjuta.' } };
const ads = (opts, layout) => ({
  id: 'r25', type: 'adsmatch', data: {
    title: '2.5. Lõpeta laused.', ...(layout ? { layout } : {}),
    ads: [{ title: '', text: 'sest pilet on kallis.' }, { title: '', text: 'kui sajab.' }, { title: '', text: 'et ma ei jõua.' }],
    situations: [{ text: 'Sõidan rattaga, …', answer: 'A' }, { text: 'Võtan bussi, …', answer: 'B' }, { text: 'Ma olen nii väsinud, …', answer: 'C' }],
  }, ...(opts ? { opts } : {}),
});
const doc = (blocks, exam = 'E9') => ({ schema: 'keelesepp.worksheet/2', id: 'd', meta: { title: 'Proov', level: 'B1', goals: {}, ...(exam ? { exam } : {}) }, blocks });

describe('an exam sheet on screen is one continuous page; print keeps A4 pages', () => {
  it('onScreenContinuous: only an exam sheet, only in the player and the teacher check', () => {
    expect(onScreenContinuous(doc([part]), 'interactive')).toBe(true);
    expect(onScreenContinuous(doc([part]), 'review')).toBe(true);
    expect(onScreenContinuous(doc([part]), 'print')).toBe(false);
    expect(onScreenContinuous(doc([part]), 'edit')).toBe(false);
    expect(onScreenContinuous(doc([part], ''), 'interactive')).toBe(false);
  });

  it('draws one page with one footer and no measuring layer; a lesson sheet and print are paged as before', () => {
    const { container, unmount } = render(<Sheet doc={doc([part, chart, writing])} mode="interactive" />);
    expect(container.querySelectorAll('.ws-page')).toHaveLength(1);
    expect(container.querySelector('.ws-page.is-continuous.is-tall')).not.toBeNull();
    expect(container.querySelectorAll('.ws-ftr')).toHaveLength(1);
    expect(container.querySelector('.ws-measure')).toBeNull();
    unmount();
    for (const [d, mode] of [[doc([part, chart, writing], ''), 'interactive'], [doc([part, chart, writing]), 'print']]) {
      const view = render(<Sheet doc={d} mode={mode} />);
      expect(view.container.querySelector('.ws-page.is-continuous')).toBeNull();
      expect(view.container.querySelector('.ws-measure')).not.toBeNull();
      view.unmount();
    }
  });

  it('printing from the player redraws the A4 pages, and after printing the screen is continuous again', () => {
    const { container } = render(<Sheet doc={doc([part, chart, writing])} mode="interactive" />);
    act(() => { globalThis.dispatchEvent(new globalThis.Event('beforeprint')); });
    expect(container.querySelector('.ws-page.is-continuous')).toBeNull();
    expect(container.querySelector('.ws-measure')).not.toBeNull();
    act(() => { globalThis.dispatchEvent(new globalThis.Event('afterprint')); });
    expect(container.querySelector('.ws-page.is-continuous')).not.toBeNull();
  });

  it('on paper a chart of an exam sheet starts on the same page as the task after it', () => {
    const d = doc([part, chart, writing]);
    expect(keepsWithNext(d, [chart], [writing])).toBe(true);
    expect(keepsWithNext(d, [chart], undefined)).toBe(false);
    expect(keepsWithNext(doc([chart, writing], ''), [chart], [writing])).toBe(false);
    expect(keepsWithNext(doc([chart], ''), [{ type: 'wordstrip' }], [writing])).toBe(true);
    // page of 100 mm: the part header (40) and the chart (40) fit, the writing (50) does not → the chart goes along
    const rows = [{ h: 40 }, { h: 40, keepWithNext: true }, { h: 50 }];
    expect(packPages(rows, { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1, 2]]);
    expect(packPages(rows.map((r) => ({ h: r.h })), { firstCap: 100, nextCap: 100 }).pages).toEqual([[0, 1], [2]]);
  });
});

const cardOf = (block, answers, exam = true) => {
  const ctx = (id) => ({
    interactive: true, flow: false, review: false, exam, focus: {}, setFocus: () => {},
    get: (k) => answers[`${id}:${k}`], set: (k, v) => { answers[`${id}:${k}`] = v; }, state: () => undefined,
  });
  const view = render(<div className="ws-root mode-interactive"><SheetCard block={block} num={1} mode="interactive" ctx={ctx} /></div>);
  return { ...view, redraw: () => view.rerender(<div className="ws-root mode-interactive"><SheetCard block={block} num={1} mode="interactive" ctx={ctx} /></div>) };
};

describe('2.5 sentence endings (adsmatch)', () => {
  it('numbers the rows on an exam sheet: 0 for the example, then 1…n; a lesson sheet stays without numbers', () => {
    const { container } = cardOf(ads({ example: true }), {});
    expect([...container.querySelectorAll('.ws-ads-num')].map((b) => b.textContent)).toEqual(['0.', '1.', '2.']);
    expect(container.querySelector('.ws-ads-sit li').className).toBe('is-example');
    const lesson = cardOf(ads(), {}, false);
    expect(lesson.container.querySelector('.ws-ads-num')).toBeNull();
    expect(lesson.container.querySelector('.ws-ads-sit li').className).toBe('');
  });

  it('layout chips: tap an ending, then the gap; the answer is the ending\'s letter, scored as before; item 0 is fixed', () => {
    const answers = {};
    const { container, redraw } = cardOf(ads({ example: true }, 'chips'), answers);
    expect(container.querySelector('.ws-ads-grid')).toBeNull();
    expect([...container.querySelectorAll('.ws-ads-num')].map((b) => b.textContent)).toEqual(['0.', '1.', '2.']);
    // the beginning reads into the gap: its „…” is dropped
    expect(container.querySelector('.ws-ads-ends li .ws-ads-text').textContent).toMatch(/^Sõidan rattaga,\s+0?sest pilet on kallis\.$/);
    const gap = (n) => container.querySelector(`[data-drop-gap="${n}"]`);
    const chip = (text) => [...container.querySelectorAll('button.ws-dropchip')].find((b) => b.textContent === text);
    expect(gap(0).disabled).toBe(true);
    expect(chip('sest pilet on kallis.').disabled).toBe(true);
    fireEvent.click(chip('et ma ei jõua.'));
    fireEvent.click(gap(1));
    expect(answers).toEqual({ 'r25:1': 'C' });
    redraw();
    expect(gap(1).textContent).toMatch(/et ma ei jõua\./);
    fireEvent.keyDown(gap(1), { key: 'Delete' });
    expect(answers['r25:1']).toBe('');
    const d = doc([ads({ example: true }, 'chips')]);
    expect(checkDocument(d, { 'r25:1': 'B', 'r25:2': 'A' }).score).toMatchObject({ correct: 1, total: 2 });
  });
});

describe('the e-exam rubric shows the exam\'s own target', () => {
  it('E9W / E9S: 60 % like the part header; every other scale keeps the course\'s 80 %', () => {
    expect(rubricShare('E9W')).toBe(0.6);
    expect(rubricShare('E9S')).toBe(0.6);
    expect(rubricShare('W2')).toBe(0.8);
    expect(rubricShare(undefined)).toBe(0.8);
    const block = { id: 'rb', type: 'examrubric', data: { title: 'Hindamine', scale: 'E9W', criteria: [{ name: 'Sisu', max: 5 }, { name: 'Keel', max: 5 }] } };
    const { container } = cardOf(block, {});
    expect(container.querySelector('.ws-examrubric-total').textContent).toMatch(/vähemalt 6 \(60 %\)/);
  });
});

describe('exam rubric points are the teacher\'s', () => {
  const block = { id: 'rb', type: 'examrubric', data: { title: 'Hindamine', scale: 'E9W', criteria: [{ name: 'Sisu', max: 5 }, { name: 'Keel', max: 5 }] } };
  const sheet = (role) => render(<Sheet doc={doc([block], '')} mode="interactive" answers={{ 'rb:0': 4 }} setAnswer={() => {}} transcripts={role ? { role } : null} />);
  it('a learner (exam or lesson sheet) sees the criteria and the scale read-only, with the given points', () => {
    for (const role of ['student', null]) {
      const { container, unmount } = sheet(role);
      expect(container.querySelectorAll('.ws-page .ws-examrubric button')).toHaveLength(0);
      expect(container.querySelectorAll('.ws-page .ws-examrubric .ws-pt')).toHaveLength(12);
      expect(container.querySelector('.ws-page .ws-examrubric .ws-pt.on').textContent).toBe('4');
      unmount();
    }
  });
  it('staff click the points', () => {
    const { container } = sheet('staff');
    expect(container.querySelectorAll('.ws-page .ws-examrubric button.ws-pt')).toHaveLength(12);
  });
});

describe('the learner\'s „n/N vastust” leaves out the teacher\'s rubric points', () => {
  it('a writing task with an exam rubric is all answered once the text is written', () => {
    const rb = { id: 'rb', type: 'examrubric', data: { title: 'Hindamine', scale: 'E9W', criteria: [{ name: 'Sisu', max: 5 }, { name: 'Keel', max: 5 }] } };
    const w = { id: 'w', type: 'examwriting', data: { title: '1. ülesanne', situation: 'Kirjuta.' } };
    const d = doc([w, rb]);
    const keys = BLOCKS.examwriting.answerKeys(w.data);
    expect(answerProgress(d, Object.fromEntries(keys.map((k) => [`w:${k}`, 'Tere, Kris! Käisin muuseumiööl.'])))).toEqual({ answered: keys.length, total: keys.length });
  });
});
