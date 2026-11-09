import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import SentenceBuilder from './SentenceBuilder.jsx';
import { dropResult, dropsAfter } from './tileDrop.js';
import { checkItem } from './engine/items.js';

// jsdom has no layout: tiles get boxes by their place — the sentence on row y 10, the bank on row y 210, 100 px apart.
const box = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} });
function layout(el) {
  if (el.classList?.contains('pr-builder__line')) return box(0, 0, 1000, 60);
  if (el.classList?.contains('pr-builder__bank')) return box(0, 200, 1000, 60);
  // the drag overlay starts where the dragged tile is
  if (el.classList?.contains('pr-tile--overlay')) return layout(document.querySelector('.pr-builder .pr-tile.is-dragging') || document.body);
  if (el.classList?.contains('pr-tile')) {
    const parent = el.parentElement;
    const k = [...parent.children].indexOf(el);
    return box(10 + k * 100, parent.classList.contains('pr-builder__line') ? 10 : 210, 80, 40);
  }
  return box(0, 0, 0, 0);
}

let restore;
beforeEach(() => {
  const original = window.Element.prototype.getBoundingClientRect;
  window.Element.prototype.getBoundingClientRect = function rect() { return layout(this); };
  restore = () => { window.Element.prototype.getBoundingClientRect = original; };
});
afterEach(() => restore());

const TILES = ['Ma', 'tulen', 'koju', 'täna'];
function Harness({ initial = [], onValue = () => {}, disabled = false }) {
  const [value, setValue] = useState(initial);
  return <SentenceBuilder tiles={TILES} value={value} disabled={disabled} onChange={(next) => { setValue(next); onValue(next); }} />;
}
const line = () => screen.getByRole('group', { name: 'Sinu lause' });
const bank = () => screen.getByRole('group', { name: 'Sõnad' });
const lineWords = () => within(line()).queryAllByRole('button').map((b) => b.textContent);
const tick = (ms = 0) => act(() => new Promise((resolve) => { window.setTimeout(resolve, ms); }));
const centreOf = (el) => { const r = el.getBoundingClientRect(); return { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }; };

async function mouseDrag(from, to, { dx = 0 } = {}) {
  const start = centreOf(from);
  fireEvent.mouseDown(from, { ...start, button: 0 });
  fireEvent.mouseMove(document, { clientX: start.clientX + 10, clientY: start.clientY });
  await tick();
  const end = { clientX: to.clientX + dx, clientY: to.clientY };
  fireEvent.mouseMove(document, end);
  await tick();
  fireEvent.mouseUp(document, end);
  await tick(60); // dnd-kit swallows clicks for 50 ms after a pointer drag (the mouseup's own click)
}

describe('SentenceBuilder — tap (unchanged)', () => {
  it('a tap puts a bank tile at the end; a tap on a sentence tile takes it back; Backspace removes the last', () => {
    render(<Harness />);
    fireEvent.click(within(bank()).getByRole('button', { name: 'tulen' }));
    fireEvent.click(within(bank()).getByRole('button', { name: 'Ma' }));
    expect(lineWords()).toEqual(['tulen', 'Ma']);
    fireEvent.click(within(line()).getByRole('button', { name: 'tulen — võta tagasi' }));
    expect(lineWords()).toEqual(['Ma']);
    fireEvent.keyDown(line(), { key: 'Backspace' });
    expect(lineWords()).toEqual([]);
  });

  it('Enter on a sentence tile is still a tap (not a drag)', () => {
    render(<Harness initial={[0, 1]} />);
    const tile = within(line()).getByRole('button', { name: 'Ma — võta tagasi' });
    // a keyboard Enter on a <button> is a click in the browser; dnd-kit must not take Enter as a start key
    expect(fireEvent.keyDown(tile, { key: 'Enter', code: 'Enter' })).toBe(true);
    fireEvent.click(tile);
    expect(lineWords()).toEqual(['tulen']);
  });
});

describe('SentenceBuilder — drag with the mouse', () => {
  it('drags a bank tile into the sentence before or after the tile it is dropped on', async () => {
    const onValue = vi.fn();
    render(<Harness initial={[0, 2]} onValue={onValue} />);
    const koju = within(line()).getByRole('button', { name: 'koju — võta tagasi' });
    // „tulen” dropped on the left half of „koju” → between „Ma” and „koju”
    await mouseDrag(within(bank()).getByRole('button', { name: 'tulen' }), centreOf(koju), { dx: -30 });
    expect(lineWords()).toEqual(['Ma', 'tulen', 'koju']);
    // „täna” dropped on the right half of the last tile → at the end
    const last = within(line()).getByRole('button', { name: 'koju — võta tagasi' });
    await mouseDrag(within(bank()).getByRole('button', { name: 'täna' }), centreOf(last), { dx: 30 });
    expect(lineWords()).toEqual(['Ma', 'tulen', 'koju', 'täna']);
    expect(onValue).toHaveBeenCalledTimes(2);
  });

  it('drops on the empty sentence line, reorders within it and drags a tile back to the bank', async () => {
    render(<Harness />);
    await mouseDrag(within(bank()).getByRole('button', { name: 'koju' }), { clientX: 500, clientY: 30 });
    expect(lineWords()).toEqual(['koju']);
    fireEvent.click(within(bank()).getByRole('button', { name: 'Ma' }));
    fireEvent.click(within(bank()).getByRole('button', { name: 'tulen' }));
    expect(lineWords()).toEqual(['koju', 'Ma', 'tulen']);
    // reorder: „koju” onto „tulen” → last
    await mouseDrag(within(line()).getByRole('button', { name: 'koju — võta tagasi' }), centreOf(within(line()).getByRole('button', { name: 'tulen — võta tagasi' })));
    expect(lineWords()).toEqual(['Ma', 'tulen', 'koju']);
    // back to the bank
    await mouseDrag(within(line()).getByRole('button', { name: 'Ma — võta tagasi' }), { clientX: 500, clientY: 230 });
    expect(lineWords()).toEqual(['tulen', 'koju']);
    // no tap fired by the drags: the bank still offers „Ma” and „täna”
    expect(within(bank()).getByRole('button', { name: 'Ma' })).toBeEnabled();
  });

  it('does nothing while disabled (after the check)', async () => {
    const onValue = vi.fn();
    render(<Harness initial={[0]} disabled onValue={onValue} />);
    await mouseDrag(within(bank()).getByRole('button', { name: 'tulen', hidden: true }), { clientX: 500, clientY: 30 });
    expect(onValue).not.toHaveBeenCalled();
  });
});

describe('SentenceBuilder — keyboard sorting', () => {
  it('Space picks a sentence tile up, arrows move it, Space puts it down; announcements are Estonian', async () => {
    render(<Harness initial={[0, 1, 2]} />);
    const ma = within(line()).getByRole('button', { name: 'Ma — võta tagasi' });
    ma.focus();
    fireEvent.keyDown(ma, { key: ' ', code: 'Space' });
    await tick();
    expect(document.body.textContent).toContain('Võtsid sõna „Ma”, see on kohal 1 / 3.');
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
    await tick();
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
    await tick();
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    await tick();
    expect(lineWords()).toEqual(['tulen', 'koju', 'Ma']);
    expect(document.body.textContent).toContain('Sõna „Ma” pandi lausesse.');
  });

  it('Escape cancels a keyboard drag', async () => {
    render(<Harness initial={[0, 1, 2]} />);
    const ma = within(line()).getByRole('button', { name: 'Ma — võta tagasi' });
    ma.focus();
    fireEvent.keyDown(ma, { key: ' ', code: 'Space' });
    await tick();
    fireEvent.keyDown(document, { key: 'ArrowRight', code: 'ArrowRight' });
    await tick();
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    await tick();
    expect(lineWords()).toEqual(['Ma', 'tulen', 'koju']);
    expect(document.body.textContent).toContain('Lohistamine katkestati.');
  });
});

describe('drop rules (pure)', () => {
  it('inserts, moves and removes by the drop target', () => {
    expect(dropResult([0, 2], 'bank-1', 'line-2', false)).toEqual([0, 1, 2]);
    expect(dropResult([0, 2], 'bank-1', 'line-2', true)).toEqual([0, 2, 1]);
    expect(dropResult([0, 2], 'bank-1', 'line', true)).toEqual([0, 2, 1]);
    expect(dropResult([0, 2], 'bank-2', 'line', true)).toBeNull(); // already used
    expect(dropResult([0, 1, 2], 'line-0', 'line-2', false)).toEqual([1, 2, 0]);
    expect(dropResult([0, 1, 2], 'line-1', 'bank', false)).toEqual([0, 2]);
    expect(dropResult([0, 1], 'line-0', 'line-0', false)).toBeNull();
    expect(dropResult([0, 1], 'line-0', null, false)).toBeNull();
  });
  it('before / after: the same row by x, another row by y', () => {
    expect(dropsAfter(box(0, 0, 80, 40), box(100, 0, 80, 40))).toBe(false);
    expect(dropsAfter(box(150, 0, 80, 40), box(100, 0, 80, 40))).toBe(true);
    expect(dropsAfter(box(0, 60, 80, 40), box(100, 0, 80, 40))).toBe(true);
  });
  it('the answer check is unchanged: the tiles in sentence order are checked', () => {
    const item = { type: 'build', tiles: ['Ma', 'tulen', 'koju'], orders: [['Ma', 'tulen', 'koju']], answers: ['Ma tulen koju.'] };
    expect(checkItem(item, { tiles: [0, 1, 2].map((i) => TILES[i]) }).verdict).toBe('correct');
    expect(checkItem(item, { tiles: [1, 0, 2].map((i) => TILES[i]) }).verdict).toBe('wrong');
  });
});
