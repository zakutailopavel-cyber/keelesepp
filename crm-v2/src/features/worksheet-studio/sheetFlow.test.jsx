import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DocWorksheetPlayer from './DocWorksheetPlayer.jsx';
import WorksheetPlayer from '../homework/WorksheetPlayer.jsx';
import Sheet from './engine/Sheet.jsx';
import { BLOCKS, checkDocument, createBlock } from './engine/registry.js';
import { visualAnswerKey } from '../homework/worksheetPlayer.js';
import { CASES, EXPECTED, answerRight, doc, make, mount } from '../../test/blockAnswerCases.jsx';
import { FLOW_QUERY, SheetFlowContext, revealDelta, revealField } from './sheetFlow.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };

const asPhone = (matches = true) => {
  const queries = [];
  globalThis.matchMedia = (query) => { queries.push(query); return { matches, media: query, addEventListener() {}, removeEventListener() {} }; };
  return queries;
};
afterEach(() => { delete globalThis.matchMedia; vi.useRealTimers(); });

const sheet = () => {
  const gaps = { ...createBlock('gaps'), id: 'g1', data: { title: 'Täida', bank: 'hommikul, õhtul', sentences: 'Ma ärkan [hommikul].\nMa magan [õhtul].' } };
  const tf = { ...createBlock('truefalse'), id: 't1' };
  return doc([gaps, tf]);
};
const repo = (over = {}) => ({ saveWorksheetDraft: vi.fn(async () => {}), submitWorksheet: vi.fn(async () => {}), saveSelfAssessment: vi.fn(async () => {}), ...over });

describe('where the column is used', () => {
  it('a phone gets the column: one page, nothing measured, no zoom; a large screen keeps A4', () => {
    asPhone(true);
    const { container, unmount } = render(<DocWorksheetPlayer assignment={{ id: 'a', worksheetDoc: sheet(), answers: {} }} repository={repo()} onClose={() => {}} />);
    expect(document.querySelector('.ws-root.is-flow')).not.toBeNull();
    expect(document.querySelectorAll('.ws-page')).toHaveLength(1);
    expect(document.querySelector('.ws-measure')).toBeNull();
    expect(document.querySelector('.st-zoom').getAttribute('style') || '').not.toContain('zoom');
    expect(document.querySelector('.ws-doc-player').classList.contains('ws-narrow')).toBe(true);
    unmount();
    expect(container.innerHTML).toBe('');
    asPhone(false);
    render(<DocWorksheetPlayer assignment={{ id: 'a', worksheetDoc: sheet(), answers: {} }} repository={repo()} onClose={() => {}} />);
    expect(document.querySelector('.ws-root.is-flow')).toBeNull();
    expect(document.querySelector('.ws-measure')).not.toBeNull();
  });

  it('asks the screen with the phone and tablet query', () => {
    const queries = asPhone(true);
    render(<DocWorksheetPlayer assignment={{ id: 'a', worksheetDoc: sheet(), answers: {} }} repository={repo()} onClose={() => {}} />);
    expect(queries).toContain(FLOW_QUERY);
  });

  it('on the Live Classroom board the host decides, never the screen: the drawings lie on the A4 page', () => {
    asPhone(true);
    const assignment = { id: 'a', worksheetDoc: sheet(), answers: {} };
    const { unmount } = render(<DocWorksheetPlayer assignment={assignment} repository={repo()} inline board />);
    expect(document.querySelector('.ws-root.is-flow')).toBeNull();
    unmount();
    render(<SheetFlowContext.Provider value><DocWorksheetPlayer assignment={assignment} repository={repo()} inline board /></SheetFlowContext.Provider>);
    expect(document.querySelector('.ws-root.is-flow')).not.toBeNull();
  });

  it('the live lesson still works in the column: the task the teacher points at is marked and scrolled to, closed tasks stay closed', async () => {
    asPhone(true);
    let push;
    const scroll = vi.fn();
    globalThis.HTMLElement.prototype.scrollIntoView = scroll;
    const repository = repo({ subscribeWorksheetAssignment: (_id, onNext) => { push = onNext; return () => {}; } });
    const blocks = sheet();
    render(<SheetFlowContext.Provider value><DocWorksheetPlayer assignment={{ id: 'a', worksheetDoc: blocks, answers: {} }} repository={repository} inline board /></SheetFlowContext.Provider>);
    act(() => push({ liveFocus: { blockId: 't1' }, answers: {} }));
    await waitFor(() => expect(scroll).toHaveBeenCalled());
    expect(document.querySelector('[data-block="t1"]').className).toContain('focused');
    act(() => push({ liveStep: { on: true, open: ['g1'] }, answers: {} }));
    await waitFor(() => expect(document.querySelector('[data-block="t1"]')).toBeNull());
    expect(document.querySelector('[data-block="g1"]')).not.toBeNull();
    delete globalThis.HTMLElement.prototype.scrollIntoView;
  });
});

describe('the progress line and the save state', () => {
  it('shows „n/m”, saving, saved', async () => {
    asPhone(true);
    const repository = repo();
    render(<DocWorksheetPlayer assignment={{ id: 'a', worksheetDoc: sheet(), answers: {} }} repository={repository} onClose={() => {}} />);
    expect(document.querySelector('.ws-flow-bar b').textContent).toMatch(/^0\/\d+$/);
    fireEvent.change(document.querySelectorAll('.ws-gapline')[0], { target: { value: 'hommikul' } });
    expect(document.querySelector('.ws-flow-bar b').textContent).toMatch(/^1\//);
    expect(document.querySelector('.ws-flow-save').textContent).toBe('Salvestan…');
    await waitFor(() => expect(document.querySelector('.ws-flow-save').textContent).toMatch(/^Salvestatud/));
    expect(repository.saveWorksheetDraft.mock.calls.at(-1)[0].answers).toMatchObject({ 'g1:0.0': 'hommikul' });
  });

  it('a failed autosave is told, not swallowed, and is tried again', async () => {
    asPhone(true);
    vi.useFakeTimers();
    const saveWorksheetDraft = vi.fn().mockRejectedValueOnce(new Error('võrk')).mockResolvedValue();
    render(<DocWorksheetPlayer assignment={{ id: 'a', worksheetDoc: sheet(), answers: {} }} repository={repo({ saveWorksheetDraft })} onClose={() => {}} />);
    fireEvent.change(document.querySelectorAll('.ws-gapline')[0], { target: { value: 'x' } });
    await act(async () => { await vi.advanceTimersByTimeAsync(700); });
    expect(screen.getByRole('alert').textContent).toMatch(/salvestunud|Võrku/);
    await act(async () => { await vi.advanceTimersByTimeAsync(5100); });
    await act(async () => { await vi.advanceTimersByTimeAsync(700); });
    expect(saveWorksheetDraft).toHaveBeenCalledTimes(2);
    expect(document.querySelector('.ws-flow-save').textContent).toMatch(/^Salvestatud/);
  });

  it('answers already in progress open in the column under their old keys', () => {
    asPhone(true);
    render(<DocWorksheetPlayer assignment={{ id: 'a', worksheetDoc: sheet(), answers: { 'g1:1.0': 'õhtul', 't1:0': 'false' } }} repository={repo()} onClose={() => {}} />);
    expect(document.querySelectorAll('.ws-gapline')[1].value).toBe('õhtul');
    expect(document.querySelectorAll('.ws-tfbox')[1].className).toContain('on');
  });
});

// the column is another drawing of the same fields: for every answerable block the same typing gives the same answers,
// the same keys and the same marks
describe('the same answers as on A4', () => {
  const inColumn = (block) => {
    const store = { answers: {} };
    function Host() {
      const [answers, setAnswers] = useState({});
      return <Sheet flow doc={doc([block])} mode="interactive" answers={answers} setAnswer={(key, value) => setAnswers((a) => { store.answers = { ...a, [key]: value }; return store.answers; })} />;
    }
    const view = render(<Host />);
    return { ...view, store, block, card: () => view.container.querySelector(`[data-block="${block.id}"]`), rerender: view.rerender };
  };
  EXPECTED.forEach((type) => {
    if (type === 'diagram') return;
    it(type, () => {
      const block = make(type);
      const a4 = mount(block);
      answerRight(a4, block);
      const a4Answers = { ...a4.store.answers };
      a4.unmount();
      const column = inColumn(block);
      answerRight(column, block);
      expect(column.store.answers).toEqual(a4Answers);
      expect(checkDocument(doc([block]), column.store.answers).score).toEqual(checkDocument(doc([block]), a4Answers).score);
      column.unmount();
    });
  });
  it('covers every answerable block with a case', () => {
    expect(EXPECTED.filter((type) => !CASES[type] && BLOCKS[type])).toEqual([]);
  });
});

describe('tap instead of typing', () => {
  it('word order: a tapped word goes to the end of the answer, tapped again it leaves', () => {
    const block = { ...createBlock('wordorder'), id: 'w1', data: { title: 'T', sentences: 'Ma elan Tartus.' } };
    const store = { answers: {} };
    function Host() { const [a, setA] = useState({}); return <Sheet flow doc={doc([block])} mode="interactive" answers={a} setAnswer={(k, v) => setA((c) => { store.answers = { ...c, [k]: v }; return store.answers; })} />; }
    render(<Host />);
    const chip = (word) => screen.getByRole('button', { name: word });
    fireEvent.click(chip('Ma')); fireEvent.click(chip('elan')); fireEvent.click(chip('Tartus'));
    expect(store.answers['w1:0']).toBe('Ma elan Tartus');
    expect(checkDocument(doc([block]), store.answers).results['w1:0']).toBe('ok');
    fireEvent.click(chip('elan'));
    expect(store.answers['w1:0']).toBe('Ma Tartus');
  });

  it('on A4 the word chips stay plain text', () => {
    const block = { ...createBlock('wordorder'), id: 'w1', data: { title: 'T', sentences: 'Ma elan.' } };
    render(<Sheet doc={doc([block])} mode="interactive" answers={{}} setAnswer={() => {}} />);
    expect(document.querySelector('.ws-page button.ws-chip')).toBeNull();
    expect(document.querySelector('.ws-page span.ws-chip')).not.toBeNull();
  });

  it('match: the phone\'s option says what the number means; its value stays the number', () => {
    const block = { ...createBlock('match'), id: 'm1', data: { title: 'T', pairs: [{ left: '*hommik*', right: 'утро' }, { left: 'õhtu', right: 'вечер' }, { left: 'öö', right: 'ночь' }] } };
    render(<Sheet flow doc={doc([block])} mode="interactive" answers={{}} setAnswer={() => {}} />);
    const option = document.querySelector('.ws-page select option[value="1"]');
    expect(option.getAttribute('label')).toBe('1. hommik');
    expect(option.textContent).toBe('1');
  });
});

describe('the marks of a block', () => {
  it('what is written on them stays readable under the task; arrows and rings are left out', () => {
    const block = { ...createBlock('text'), id: 'x', marks: [{ id: '1', kind: 'arrow', x1: 1, y1: 1, x2: 2, y2: 2 }, { id: '2', kind: 'note', x: 1, y: 1, w: 10, text: 'Pane tähele' }, { id: '3', kind: 'circle', x: 1, y: 1, w: 5, h: 5 }] };
    render(<Sheet flow doc={doc([block])} mode="interactive" answers={{}} />);
    expect(document.querySelector('.ws-marks')).toBeNull();
    expect([...document.querySelectorAll('.ws-marks-flow li')].map((li) => li.textContent)).toEqual(['Pane tähele']);
  });
});

describe('tracing on a phone', () => {
  it('shows a window of the line and goes on with a button; the A4 line stays whole', () => {
    const block = { ...createBlock('tracing'), id: 'tr', data: { title: 'T', rows: [{ text: 'A', repeat: 12 }] } };
    const { unmount } = render(<Sheet doc={doc([block])} mode="interactive" answers={{}} setAnswer={() => {}} />);
    expect(document.querySelector('.ws-page .ws-trace').getAttribute('viewBox')).toBe('0 0 1000 120');
    unmount();
    render(<Sheet flow doc={doc([block])} mode="interactive" answers={{}} setAnswer={() => {}} />);
    expect(document.querySelector('.ws-page .ws-trace').getAttribute('viewBox')).toBe('0 0 360 120');
    fireEvent.click(screen.getByRole('button', { name: /Edasi/ }));
    expect(document.querySelector('.ws-page .ws-trace').getAttribute('viewBox')).toBe('360 0 360 120');
  });
});

describe('fields on a scanned page', () => {
  const files = [{ name: 'p.png', url: 'https://example.invalid/p.png', interactiveOverlay: { version: 1, elements: [
    { id: 'short', type: 'input', label: 'Lünk', x: .1, y: .2, w: .3, h: .04, correctAnswer: 'Tere' },
    { id: 'pick', type: 'choice', x: .1, y: .5, w: .3, h: .05, options: ['A', 'B'], correctAnswer: 'B' },
    { id: 'tick', type: 'checkbox', label: 'Valmis', x: .6, y: .5, w: .05, h: .05, correctAnswer: 'true' },
    { id: 'word', type: 'word', text: 'linn', translation: 'город', x: .2, y: .7, w: .1, h: .03 },
  ] } }];
  const elements = files[0].interactiveOverlay.elements;

  it('a phone gets a numbered list with the same answer keys, the score is the old one', async () => {
    asPhone(true);
    const saved = { [visualAnswerKey(0, elements[1])]: 'B' };
    const repository = repo();
    render(<WorksheetPlayer assignment={{ id: 'a', files, answers: saved, worksheetData: { blocks: [] } }} repository={repository} onClose={() => {}} />);
    expect(document.querySelector('.visual-worksheet-layer')).toBeNull();
    expect(document.querySelectorAll('.visual-list-dot')).toHaveLength(3);
    expect(screen.getByRole('combobox').value).toBe('B');
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Tere' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'linn' }));
    expect(screen.getByText('город')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Esita/ }));
    await waitFor(() => expect(repository.submitWorksheet).toHaveBeenCalled());
    const sent = repository.submitWorksheet.mock.calls[0][0];
    expect(sent.answers).toEqual({ [visualAnswerKey(0, elements[0])]: 'Tere', [visualAnswerKey(0, elements[1])]: 'B', [visualAnswerKey(0, elements[2])]: true });
    expect(sent.score).toEqual({ correct: 3, total: 3, pct: 100 });
  });

  it('a large screen keeps the fields on the page', () => {
    asPhone(false);
    render(<WorksheetPlayer assignment={{ id: 'a', files, answers: {}, worksheetData: { blocks: [] } }} repository={repo()} onClose={() => {}} />);
    expect(document.querySelector('.visual-worksheet-layer')).not.toBeNull();
  });
});

describe('the keyboard must not hide the field', () => {
  const area = { top: 100, bottom: 400 };
  it('a field in the free part is left alone', () => { expect(revealDelta({ top: 200, bottom: 244 }, area)).toBe(0); });
  it('a field behind the keyboard is brought to the middle', () => { expect(revealDelta({ top: 600, bottom: 644 }, area)).toBe(600 + 22 - (144 + 392) / 2); });
  it('a field under the sticky line comes down', () => { expect(revealDelta({ top: 110, bottom: 154 }, area)).toBeLessThan(0); });
  it('a text taller than the free part shows its top', () => { expect(revealDelta({ top: 500, bottom: 1200 }, area)).toBe(500 - 144); });

  it('scrolls the sheet by the visual viewport', () => {
    const scroller = document.createElement('div');
    scroller.style.overflowY = 'auto';
    const field = document.createElement('input');
    scroller.append(field);
    document.body.append(scroller);
    Object.defineProperty(scroller, 'scrollHeight', { value: 2000 });
    Object.defineProperty(scroller, 'clientHeight', { value: 700 });
    scroller.getBoundingClientRect = () => ({ top: 0, bottom: 700 });
    field.getBoundingClientRect = () => ({ top: 600, bottom: 644 });
    scroller.scrollBy = vi.fn();
    const delta = revealField(field, { offsetTop: 0, height: 400 });
    expect(delta).toBeGreaterThan(0);
    expect(scroller.scrollBy).toHaveBeenCalledWith({ top: delta });
    scroller.remove();
  });
});
