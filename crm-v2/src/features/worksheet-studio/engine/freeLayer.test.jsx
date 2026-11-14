// „Vaba kiht” (Õpik phase 3, 2026-11-13): free pictures, shapes and text boxes on an A4 page — model, schema check,
// drawing on the pages (print / edit / phone column) and dragging. Sheets without `doc.free` draw as before.
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';
import Sheet from './Sheet.jsx';
import { sampleDocument } from './sample.js';
import { MAX_ITEMS, PAGE_W, flowItems, freeItemsOf, freeProblem, itemsOnPage, lineGeom, moveEnd, moveItem, newFreeItem, normalizeFreeItem, resizeItem, restack, textStyle } from './freeLayer.js';
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

describe('lines and arrows (2026-11-13)', () => {
  const line = (patch) => ({ id: 'l1', kind: 'line', page: 0, x: 10, y: 20, x2: 70, y2: 100, z: 1, color: 'ink', stroke: 1, heads: 'end', ...patch });

  it('model: ends stay on the page; a move keeps the length; an end moves alone; the phone leaves lines out', () => {
    expect(newFreeItem('line', 0, [], { heads: 'end' })).toMatchObject({ kind: 'line', heads: 'end', color: 'ink', x2: 190 });
    expect(normalizeFreeItem(line({ x: -5, x2: 999, color: 'gold', heads: 'x' }))).toMatchObject({ x: 0, x2: PAGE_W, color: 'ink', heads: 'none' });
    expect(lineGeom(line({ x: 0, y: 0, x2: 30, y2: 40 }))).toEqual({ length: 50, angle: expect.closeTo(53.13, 1) });
    expect(moveItem(normalizeFreeItem(line({})), -50, 0)).toMatchObject({ x: 0, x2: 60, y: 20, y2: 100 });
    expect(moveEnd(normalizeFreeItem(line({})), 'end', 5, -10)).toMatchObject({ x: 10, y: 20, x2: 75, y2: 90 });
    expect(moveEnd(normalizeFreeItem(line({})), 'start', -50, 0)).toMatchObject({ x: 0, x2: 70 });
    expect(flowItems([normalizeFreeItem(line({}))])).toEqual([]);
  });

  it('schema: a line needs both ends and known colour / heads', () => {
    expect(freeProblem({ free: [line({})] })).toBe('');
    expect(freeProblem({ free: [line({ x2: undefined })] })).toMatch(/asukoht/);
    expect(freeProblem({ free: [line({ color: 'gold' })] })).toMatch(/värv/);
    expect(freeProblem({ free: [line({ heads: 'three' })] })).toMatch(/otsad/);
  });

  it('draws as a turned strip with an arrow head; both heads; dashed', () => {
    const { container, rerender } = render(<Sheet doc={docWith([line({ x: 0, y: 0, x2: 30, y2: 40 })])} mode="print" />);
    const node = container.querySelector('[data-free="l1"]');
    expect(node.style.width).toBe('50mm');
    expect(node.style.transform).toMatch(/^rotate\(53\.1/);
    expect(node.querySelectorAll('polygon')).toHaveLength(1);
    rerender(<Sheet doc={docWith([line({ heads: 'both', dash: true })])} mode="print" />);
    expect(container.querySelectorAll('[data-free="l1"] polygon')).toHaveLength(2);
    expect(container.querySelector('[data-free="l1"] line').getAttribute('stroke-dasharray')).toBe('3 2');
    expect(container.querySelector('.ws-free-end')).toBeNull();
  });

  it('edit: dragging an end moves only that end; dragging the line moves both', () => {
    const onChange = vi.fn();
    const { container } = render(<Sheet doc={docWith([line({})])} mode="edit" freeEdit={{ selectedId: 'l1', onSelect: () => {}, onChange }} />);
    container.querySelector('.ws-page').getBoundingClientRect = () => ({ left: 0, top: 0, width: 540, height: 760, right: 540, bottom: 760 });
    const end = container.querySelector('.ws-free-end.is-end');
    fireEvent.pointerDown(end, { clientX: 0, clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(end, { clientX: 20, clientY: -20, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith('l1', expect.objectContaining({ x: 10, y: 20, x2: 80, y2: 90 }));
    const body = container.querySelector('[data-free="l1"]');
    fireEvent.pointerDown(body, { clientX: 0, clientY: 0, pointerId: 2 });
    fireEvent.pointerUp(body, { clientX: 10, clientY: 10, pointerId: 2 });
    expect(onChange).toHaveBeenLastCalledWith('l1', expect.objectContaining({ x: 15, y: 25, x2: 75, y2: 105 }));
  });
});

describe('text box letters (2026-11-14)', () => {
  it('font, alignment and colour: safe defaults, inline look, schema check', () => {
    const plain = normalizeFreeItem(item({ kind: 'text', text: 'A', font: 'comic', align: 'justify', color: 'pink' }));
    expect(plain).toMatchObject({ font: 'body', align: undefined, color: 'auto' });
    expect(textStyle({ ...plain, size: 14, bold: false })).toEqual({ fontSize: '14pt', fontWeight: 400 });
    expect(textStyle({ size: 20, bold: true, font: 'hand', align: 'center', color: 'red' })).toEqual({ fontSize: '20pt', fontWeight: 800, fontFamily: 'var(--font-hand)', textAlign: 'center', color: '#c0392b' });
    expect(freeProblem({ free: [item({ kind: 'text', text: 'A', font: 'head', align: 'right', color: 'white' })] })).toBe('');
    expect(freeProblem({ free: [item({ kind: 'text', text: 'A', font: 'comic' })] })).toMatch(/kiri/);
    expect(freeProblem({ free: [item({ kind: 'text', text: 'A', color: 'pink' })] })).toMatch(/värv/);
    expect(freeProblem({ free: [item({ kind: 'text', text: 'A', align: 'justify' })] })).toMatch(/joondus/);
    expect(freeProblem({ free: [{ id: 'l', kind: 'line', x: 1, y: 1, x2: 9, y2: 9, color: 'white' }] })).toMatch(/Joone värv/);
  });

  it('draws the chosen letters on the page and in the phone column', () => {
    const free = [item({ kind: 'text', text: 'Tere!', size: 16, font: 'head', align: 'right', color: 'green' })];
    const { container } = render(<Sheet doc={docWith(free)} mode="print" />);
    const text = container.querySelector('.ws-page .ws-free-text');
    expect(text.style.fontFamily).toBe('var(--font-head)');
    expect(text.style.textAlign).toBe('right');
    expect(text.style.color).toBe('rgb(38, 119, 67)');
  });
});
