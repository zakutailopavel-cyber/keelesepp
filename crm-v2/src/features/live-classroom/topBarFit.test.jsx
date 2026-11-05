import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { FOLD_START, foldReducer, groupRoomFoldSteps, liveRoomFoldSteps, useTopBarFit } from './topBarFit.js';

const measure = (state, overflow, extra = {}) => foldReducer(state, { type: 'measure', overflow, width: 900, max: 5, key: 'k', content: '', ...extra });

describe('foldReducer', () => {
  const start = { ...FOLD_START, key: 'k' };

  it('folds one step per overflowing measure, never past the last step', () => {
    let state = start;
    for (let i = 0; i < 8; i += 1) state = measure(state, true);
    expect(state.count).toBe(5);
    expect(measure(state, false)).toBe(state);
  });

  it('a wider bar unfolds step by step while it fits; a failed unfold is remembered at that width', () => {
    let state = { ...start, count: 3, width: 800 };
    state = foldReducer(state, { type: 'resize', width: 1000 });
    expect(state).toMatchObject({ count: 2, expanding: true, width: 1000 });
    state = measure(state, false, { width: 1000 });
    expect(state.count).toBe(1);
    state = measure(state, true, { width: 1000 });
    expect(state).toMatchObject({ count: 2, expanding: false, blockedAt: 1000 });
    // the same width again or a smaller one: no new attempt (no flicker)
    expect(foldReducer(state, { type: 'resize', width: 1000 })).toBe(state);
    expect(foldReducer(state, { type: 'resize', width: 990 }).count).toBe(2);
    // wider than the failed width: try again
    expect(foldReducer({ ...state, width: 990 }, { type: 'resize', width: 1010 })).toMatchObject({ count: 1, expanding: true });
  });

  it('starts over for another set of steps and tries to unfold when the buttons change', () => {
    const state = { ...start, count: 3, blockedAt: 900 };
    expect(measure(state, true, { key: 'other' })).toMatchObject({ count: 0, key: 'other' });
    expect(measure(state, false, { content: 'call' })).toMatchObject({ count: 2, expanding: true, blockedAt: 0, content: 'call' });
  });
});

describe('fold orders', () => {
  it('drop words first, then the least used buttons; the call itself never folds', () => {
    expect(liveRoomFoldSteps({ teacher: false })).toEqual(['labels', 'people', 'words', 'history', 'chat', 'tasks']);
    expect(liveRoomFoldSteps({ teacher: false, guest: true })).toEqual(['labels', 'people', 'history', 'tasks']);
    expect(liveRoomFoldSteps({ teacher: true })).toEqual(['labels', 'people', 'materials', 'words', 'poll', 'timer', 'history', 'chat', 'tasks', 'plan', 'norec']);
    expect(groupRoomFoldSteps({ teacher: true })[0]).toBe('labels');
    expect(groupRoomFoldSteps({ closed: true })).toEqual(['history']);
  });
});

// jsdom has no layout: the bar's width is faked from the number of visible buttons (each 100 px)
function Bar({ steps }) {
  const ref = useRef(null);
  const fold = useTopBarFit(ref, steps);
  return <header ref={ref} data-testid="bar">
    <div className="lr-top__group">{steps.filter((name) => !fold.has(name)).map((name) => <button key={name} type="button">{name}</button>)}</div>
    <p data-testid="folded">{[...fold].join(',')}</p>
  </header>;
}

describe('useTopBarFit', () => {
  const saved = ['scrollWidth', 'clientWidth'].map((name) => [name, Object.getOwnPropertyDescriptor(globalThis.HTMLElement.prototype, name) || Object.getOwnPropertyDescriptor(globalThis.Element.prototype, name)]);
  let width = 1000;
  afterEach(() => { saved.forEach(([name, descriptor]) => { if (descriptor) Object.defineProperty(globalThis.HTMLElement.prototype, name, descriptor); else delete globalThis.HTMLElement.prototype[name]; }); });
  const fake = () => {
    Object.defineProperty(globalThis.HTMLElement.prototype, 'scrollWidth', { configurable: true, get() { return this.dataset?.testid === 'bar' ? this.querySelectorAll('button').length * 100 : 0; } });
    Object.defineProperty(globalThis.HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return this.dataset?.testid === 'bar' ? width : 0; } });
  };

  it('folds the lowest-priority buttons until the bar fits, before the browser paints', () => {
    fake();
    width = 350;
    render(<Bar steps={['a', 'b', 'c', 'd', 'e']} />);
    expect(screen.getByTestId('folded')).toHaveTextContent('a,b');
    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual(['c', 'd', 'e']);
  });

  it('nothing folds when everything fits', () => {
    fake();
    width = 1000;
    render(<Bar steps={['a', 'b', 'c']} />);
    expect(screen.getByTestId('folded')).toHaveTextContent('');
    act(() => { fireEvent(globalThis, new globalThis.Event('resize')); });
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});
