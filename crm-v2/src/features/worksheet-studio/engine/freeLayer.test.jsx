// „Vaba kiht” (Õpik phase 3, 2026-11-13): free pictures, shapes and text boxes on an A4 page — model, schema check,
// drawing on the pages (print / edit / phone column) and dragging. Sheets without `doc.free` draw as before.
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';
import Sheet from './Sheet.jsx';
import { sampleDocument } from './sample.js';
import { MAX_ITEMS, PAGE_W, flowItems, freeItemsOf, freeProblem, itemsOnPage, moveItem, newFreeItem, normalizeFreeItem, resizeItem, restack } from './freeLayer.js';
import { validateWorksheetDoc } from '../../../services/firebase/worksheetDocs.js';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
vi.mock('../../../services/firebase/storageClient.js', () => ({}));

const img = { src: 'https://example.invalid/anna.webp', width: 1600, height: 1200 };
const item = (patch) => ({ id: patch.id || 'f1', kind: 'shape', page: 0, x: 10, y: 20, w: 40, h: 30, z: 1, shape: 'circle', fill: 'lime', border: 'none', ...patch });
const docWith = (free) => ({ ...sampleDocument(), blocks: [{ id: 'txt', type: 'text', data: { text: 'Üks lõik.' } }], ...(free === undefined ? {} : { free }) });

describe('freeLayer model', () => {
  it('a new item sits on the page above the others; stored values are made safe', () => {
    const items = [item({ z: 4 })];
    const fresh = newFreeItem('text', 2, items);
    expect(fresh).toMatchObject({ kind: 'text', page: 2, z: 5, locked: false, text: 'Kirjuta siia' });
    expect(normalizeFreeItem({ id: 'x', kind: 'star' })).toBeNull();
    const safe = normalizeFreeItem({ id: 'x', kind: 'shape', x: 9999, y: -999, w: 1, h: 50, shape: 'hex', fill: 'gold', rotate: 400 });
    expect(safe).toMatchObject({ w: 6, shape: 'rect', fill: 'none', rotate: 180, x: PAGE_W - 3, y: -25 });
    expect(freeItemsOf({ free: [item({}), { kind: 'nope' }] })).toHaveLength(1);
    expect(freeItemsOf({})).toEqual([]);
  });

  it('pages: an item of a missing page stands on the last; layers bottom first; the phone keeps pictures and text', () => {
    const items = [item({ id: 'a', page: 0, z: 2 }), item({ id: 'b', page: 0, z: 1 }), item({ id: 'c', page: 5 })];
    expect(itemsOnPage(items, 0, 2).map((i) => i.id)).toEqual(['b', 'a']);
    expect(itemsOnPage(items, 1, 2).map((i) => i.id)).toEqual(['c']);
    const flow = flowItems([item({ id: 's' }), item({ id: 't2', kind: 'text', page: 1, y: 5 }), item({ id: 't1', kind: 'text', page: 0, y: 50 }), item({ id: 'i0', kind: 'image', img: null }), item({ id: 'i1', kind: 'image', img, page: 1, y: 1 })]);
    expect(flow.map((i) => i.id)).toEqual(['t1', 'i1', 't2']);
  });

  it('move keeps half of it on the page; resize keeps proportions for pictures; layers restack', () => {
    expect(moveItem(item({}), -100, 5)).toMatchObject({ x: -20, y: 25 });
    expect(resizeItem(item({ w: 40, h: 30 }), 40, 0, true)).toMatchObject({ w: 80, h: 60 });
    expect(resizeItem(item({ w: 40, h: 30 }), 10, -100)).toMatchObject({ w: 50, h: 6 });
    const items = [item({ id: 'a', z: 1 }), item({ id: 'b', z: 2 }), item({ id: 'c', z: 3 })];
    const z = (list) => Object.fromEntries(list.map((i) => [i.id, i.z]));
    expect(z(restack(items, 'a', 'top'))).toEqual({ a: 3, b: 1, c: 2 });
    expect(z(restack(items, 'c', 'down'))).toEqual({ a: 1, b: 3, c: 2 });
    expect(z(restack(items, 'b', 'bottom'))).toEqual({ a: 2, b: 1, c: 3 });
  });

  it('schema check: old sheets and valid layers pass; bad ones are refused', () => {
    expect(validateWorksheetDoc(docWith())).toBe(true);
    expect(validateWorksheetDoc(docWith([item({}), item({ id: 'f2', kind: 'text', text: 'Tere' })]))).toBe(true);
    expect(freeProblem({ free: null })).toBe('');
    expect(freeProblem({ free: {} })).toMatch(/vigane/);
    expect(freeProblem({ free: [item({}), item({})] })).toMatch(/oma tunnus/);
    expect(freeProblem({ free: [item({ kind: 'video' })] })).toMatch(/liik/);
    expect(freeProblem({ free: [item({ fill: 'gold' })] })).toMatch(/värv/);
    expect(freeProblem({ free: [item({ x: 'a' })] })).toMatch(/asukoht/);
    expect(freeProblem({ free: Array.from({ length: MAX_ITEMS + 1 }, (_, i) => item({ id: `f${i}` })) })).toMatch(/kuni 40/);
    expect(() => validateWorksheetDoc(docWith([item({ shape: 'star' })]))).toThrow(/kujund/);
  });
});

describe('drawing and editing on the page', () => {
  it('a sheet without a layer draws no layer', () => {
    const { container } = render(<Sheet doc={docWith()} mode="print" />);
    expect(container.querySelector('.ws-free')).toBeNull();
  });

  it('print: items stand in mm on their page, in layer order, with their look; no tools, no pointer', () => {
    const free = [item({ id: 'top', z: 3, kind: 'text', text: 'Tere!', size: 18, bold: true, fill: 'cream', shape: 'rounded', rotate: -5 }), item({ id: 'low', z: 1, kind: 'image', img, shape: 'circle', border: 'ink' })];
    const { container } = render(<Sheet doc={docWith(free)} mode="print" />);
    const nodes = [...container.querySelectorAll('.ws-page .ws-free [data-free]')];
    expect(nodes.map((n) => n.dataset.free)).toEqual(['low', 'top']);
    expect(nodes[1].style.left).toBe('10mm');
    expect(nodes[1].style.width).toBe('40mm');
    expect(nodes[1].style.transform).toBe('rotate(-5deg)');
    expect(nodes[1].className).toContain('fill-cream');
    expect(nodes[1].textContent).toBe('Tere!');
    expect(nodes[0].className).toMatch(/shape-circle .*border-ink/);
    expect(nodes[0].querySelector('img').getAttribute('src')).toBe(img.src);
    expect(container.querySelector('.ws-free-size')).toBeNull();
    expect(nodes[0].getAttribute('role')).toBeNull();
  });

  it('edit: a tap selects; dragging moves it by mm of the page; the corner resizes; a locked one only selects', () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    const free = [item({ id: 'f1' })];
    const { container, rerender } = render(<Sheet doc={docWith(free)} mode="edit" freeEdit={{ selectedId: 'f1', onSelect, onChange }} />);
    const page = container.querySelector('.ws-page');
    page.getBoundingClientRect = () => ({ left: 0, top: 0, width: 540, height: 760, right: 540, bottom: 760 });
    const node = container.querySelector('[data-free="f1"]');
    fireEvent.pointerDown(node, { clientX: 100, clientY: 100, pointerId: 1 });
    expect(onSelect).toHaveBeenCalledWith('f1');
    fireEvent.pointerMove(node, { clientX: 120, clientY: 140, pointerId: 1 });
    expect(node.style.left).toBe('20mm');
    fireEvent.pointerUp(node, { clientX: 120, clientY: 140, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith('f1', expect.objectContaining({ x: 20, y: 40 }));
    const size = container.querySelector('.ws-free-size');
    fireEvent.pointerDown(size, { clientX: 0, clientY: 0, pointerId: 2 });
    fireEvent.pointerUp(size, { clientX: 20, clientY: 20, pointerId: 2 });
    expect(onChange).toHaveBeenLastCalledWith('f1', expect.objectContaining({ w: 50, h: 37.5 }));
    onChange.mockClear();
    rerender(<Sheet doc={docWith([item({ id: 'f1', locked: true })])} mode="edit" freeEdit={{ selectedId: 'f1', onSelect, onChange }} />);
    const locked = container.querySelector('[data-free="f1"]');
    fireEvent.pointerDown(locked, { clientX: 100, clientY: 100, pointerId: 3 });
    fireEvent.pointerUp(locked, { clientX: 160, clientY: 160, pointerId: 3 });
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector('.ws-free-size')).toBeNull();
  });

  it('the phone column: pictures and text boxes after the blocks, shapes left out', () => {
    const free = [item({ id: 's' }), item({ id: 't', kind: 'text', text: 'Mõtle!' }), item({ id: 'i', kind: 'image', img })];
    const { container } = render(<Sheet doc={docWith(free)} mode="interactive" flow />);
    const items = [...container.querySelectorAll('.ws-free-flow > div')];
    expect(items.map((n) => n.className.split(' ')[1])).toEqual(['is-text', 'is-image']);
    expect(container.querySelector('.ws-free')).toBeNull();
  });
});
