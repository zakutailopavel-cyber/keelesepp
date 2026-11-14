// „Vaba kiht” (Õpik phase 3, 2026-11-13): free pictures, shapes and text boxes on an A4 page — model, schema check,
// drawing on the pages (print / edit / phone column) and dragging. Sheets without `doc.free` draw as before.
import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';
import Sheet from './Sheet.jsx';
import { sampleDocument } from './sample.js';
import { MAX_ITEMS, PAGE_W, cropStyle, panFocus, flowItems, freeItemsOf, freeProblem, itemsOnPage, lineGeom, moveEnd, moveItem, newFreeItem, normalizeFreeItem, alignMany, itemsInFrame, moveMany, placeOnPage, resizeItem, restack, restackMany, snapItem, spreadMany, textStyle } from './freeLayer.js';
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
    expect(() => validateWorksheetDoc(docWith([item({ shape: 'hexagon' })]))).toThrow(/kujund/);
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

describe('snapping while dragging (2026-11-14)', () => {
  it('jumps onto the page middle, margins and other items; far away nothing changes', () => {
    const near = snapItem(item({ x: 113.6, y: 50, w: 40, h: 30 }));
    expect(near.item.x).toBe(115);
    expect(near.guides).toEqual([{ axis: 'x', at: 135 }]);
    const other = item({ id: 'o', x: 200, y: 100, w: 30, h: 30 });
    const top = snapItem(item({ x: 20, y: 101.5, w: 40, h: 20 }), [other]);
    expect(top.item.y).toBe(100);
    expect(top.guides).toEqual([{ axis: 'y', at: 100 }]);
    const margin = snapItem(item({ x: 10.2, y: 60, w: 40, h: 20 }));
    expect(margin.item.x).toBe(9);
    const far = item({ x: 40, y: 60, w: 40, h: 20 });
    expect(snapItem(far, [other])).toEqual({ item: far, guides: [] });
    const line = snapItem({ id: 'l', kind: 'line', x: 136, y: 50, x2: 180, y2: 80 });
    expect(line.item).toMatchObject({ x: 135, x2: 179 });
  });

  it('a drag shows a guide while it snaps, stores the snapped place and leaves no guide; Alt drags freely', () => {
    const onChange = vi.fn();
    const free = [item({ id: 'f1', x: 10, y: 20, w: 40, h: 30 })];
    const { container } = render(<Sheet doc={docWith(free)} mode="edit" freeEdit={{ selectedId: 'f1', onSelect: vi.fn(), onChange }} />);
    container.querySelector('.ws-page').getBoundingClientRect = () => ({ left: 0, top: 0, width: 540, height: 760, right: 540, bottom: 760 });
    const node = container.querySelector('[data-free="f1"]');
    fireEvent.pointerDown(node, { clientX: 0, clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(node, { clientX: 207, clientY: 0, pointerId: 1 });
    expect(container.querySelector('.ws-free-guide.is-x').style.left).toBe('135mm');
    expect(node.style.left).toBe('115mm');
    fireEvent.pointerUp(node, { clientX: 207, clientY: 0, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith('f1', expect.objectContaining({ x: 115, y: 20 }));
    expect(container.querySelector('.ws-free-guide')).toBeNull();
    fireEvent.pointerDown(node, { clientX: 0, clientY: 0, pointerId: 2 });
    fireEvent.pointerUp(node, { clientX: 207, clientY: 0, pointerId: 2, altKey: true });
    expect(onChange).toHaveBeenLastCalledWith('f1', expect.objectContaining({ x: 113.5 }));
  });
});

describe('place on the page, see-through, shadow (2026-11-14)', () => {
  it('one tap puts a box or a line at the middle or a margin', () => {
    const box = item({ x: 30, y: 40, w: 40, h: 20 });
    expect(placeOnPage(box, 'centerX')).toEqual({ x: 115, y: 40 });
    expect(placeOnPage(box, 'right')).toEqual({ x: 221, y: 40 });
    expect(placeOnPage(box, 'top')).toEqual({ x: 30, y: 11 });
    expect(placeOnPage(box, 'bottom')).toEqual({ x: 30, y: 352.9 });
    expect(placeOnPage({ id: 'l', kind: 'line', x: 100, y: 50, x2: 40, y2: 50 }, 'left')).toEqual({ x: 69, y: 50, x2: 9, y2: 50 });
  });

  it('opacity and shadow: safe values, drawn on the item, checked before save', () => {
    expect(normalizeFreeItem(item({ opacity: 0.05 })).opacity).toBe(0.2);
    expect(normalizeFreeItem(item({})).opacity).toBe(1);
    expect(freeProblem({ free: [item({ opacity: 2 })] })).toMatch(/Läbipaistvus/);
    expect(freeProblem({ free: [item({ opacity: 0.6, shadow: true })] })).toBe('');
    const { container } = render(<Sheet doc={docWith([item({ id: 's', opacity: 0.6, shadow: true }), item({ id: 'p' })])} mode="print" />);
    const shaded = container.querySelector('[data-free="s"]');
    expect(shaded.style.opacity).toBe('0.6');
    expect(shaded.style.filter).toContain('drop-shadow');
    expect(container.querySelector('[data-free="p"]').style.opacity).toBe('');
  });
});

describe('several items at once (2026-11-14)', () => {
  const a = item({ id: 'a', x: 10, y: 10, w: 20, h: 20, z: 1 });
  const b = item({ id: 'b', x: 50, y: 30, w: 40, h: 10, z: 2 });
  const c = item({ id: 'c', x: 150, y: 60, w: 20, h: 30, z: 3 });
  const l = { id: 'l', kind: 'line', x: 100, y: 100, x2: 120, y2: 80, z: 4 };
  const lock = item({ id: 'k', x: 200, y: 5, w: 10, h: 10, z: 5, locked: true });
  const all = [a, b, c, l, lock];
  const byId = (list) => Object.fromEntries(list.map((it) => [it.id, it]));

  it('moves the chosen ones together; a locked one stays', () => {
    const moved = byId(moveMany(all, ['a', 'l', 'k'], 5, -2));
    expect(moved.a).toMatchObject({ x: 15, y: 8 });
    expect(moved.l).toMatchObject({ x: 105, y: 98, x2: 125, y2: 78 });
    expect(moved.k).toMatchObject({ x: 200, y: 5 });
    expect(moved.b).toBe(b);
  });

  it('aligns to the common box: left edges, middles, bottoms; lines by their box', () => {
    expect(byId(alignMany(all, ['a', 'b', 'c'], 'left'))).toMatchObject({ a: { x: 10 }, b: { x: 10 }, c: { x: 10 } });
    expect(byId(alignMany(all, ['a', 'b', 'c'], 'centerY'))).toMatchObject({ a: { y: 40 }, b: { y: 45 }, c: { y: 35 } });
    expect(byId(alignMany(all, ['a', 'l'], 'bottom'))).toMatchObject({ a: { y: 80 }, l: { y: 100, y2: 80 } });
    expect(byId(alignMany(all, ['a', 'k'], 'right')).k).toMatchObject({ x: 200 });
    expect(alignMany(all, ['a'], 'left')).toBe(all);
  });

  it('equal gaps: the first and last stay, the middle one moves', () => {
    const spread = byId(spreadMany(all, ['a', 'b', 'c'], 'x'));
    expect(spread.a.x).toBe(10);
    expect(spread.c.x).toBe(150);
    expect(spread.b.x).toBe(70); // span 10…170 = 160, filled 80, two gaps of 40: a ends 30 → b starts 70
  });

  it('layers: the group goes to the top keeping its own order', () => {
    const z = byId(restackMany(all, ['a', 'b'], 'top'));
    expect(z.a.z).toBeLessThan(z.b.z);
    expect(z.a.z).toBeGreaterThan(z.k.z);
  });

  it('on the page: Shift + tap adds; dragging one moves the group as one change', () => {
    const onSelect = vi.fn();
    const onMoveMany = vi.fn();
    const onChange = vi.fn();
    const { container } = render(<Sheet doc={docWith([a, b, c])} mode="edit" freeEdit={{ selectedId: 'a', selectedIds: ['a', 'b'], onSelect, onChange, onMoveMany }} />);
    container.querySelector('.ws-page').getBoundingClientRect = () => ({ left: 0, top: 0, width: 540, height: 760, right: 540, bottom: 760 });
    const node = (id) => container.querySelector(`[data-free="${id}"]`);
    expect(node('a').querySelector('.ws-free-size')).toBeNull();
    fireEvent.pointerDown(node('c'), { clientX: 0, clientY: 0, pointerId: 1, shiftKey: true });
    expect(onSelect).toHaveBeenLastCalledWith('c', true);
    fireEvent.pointerDown(node('a'), { clientX: 0, clientY: 0, pointerId: 2 });
    fireEvent.pointerMove(node('a'), { clientX: 30, clientY: 20, pointerId: 2 });
    expect(node('b').style.translate).toBe('15mm 10mm');
    fireEvent.pointerUp(node('a'), { clientX: 30, clientY: 20, pointerId: 2 });
    expect(onMoveMany).toHaveBeenCalledWith(15, 10);
    expect(onChange).not.toHaveBeenCalled();
    expect(node('b').style.translate).toBe('');
    fireEvent.pointerDown(node('b'), { clientX: 0, clientY: 0, pointerId: 3 });
    fireEvent.pointerUp(node('b'), { clientX: 0, clientY: 0, pointerId: 3 });
    expect(onSelect).toHaveBeenLastCalledWith('b');
  });
});

it('a selection frame catches the items of its page it touches (2026-11-14)', () => {
  const list = [item({ id: 'a', x: 10, y: 10, w: 20, h: 20 }), item({ id: 'b', x: 100, y: 100, w: 20, h: 20 }), item({ id: 'p2', page: 1, x: 10, y: 10, w: 20, h: 20 }),
    { id: 'l', kind: 'line', page: 0, x: 50, y: 60, x2: 90, y2: 40, z: 1 }];
  expect(itemsInFrame(list, 0, 2, { x0: 35, y0: 70, x1: 0, y1: 0 })).toEqual(['a']);
  expect(itemsInFrame(list, 0, 2, { x0: 25, y0: 25, x1: 60, y1: 50 }).sort()).toEqual(['a', 'l']);
  expect(itemsInFrame(list, 1, 2, { x0: 0, y0: 0, x1: 50, y1: 50 })).toEqual(['p2']);
  expect(itemsInFrame(list, 0, 1, { x0: 0, y0: 0, x1: 45, y1: 45 }).sort()).toEqual(['a', 'p2']); // page 2 is gone: its items stand on the last
});

describe('copy to other pages and the clipboard (2026-11-14)', () => {
  it('copies keep place and look on the target page, on top, unlocked, with new ids', async () => {
    const { copyToPages } = await import('./freeLayer.js');
    const list = [item({ id: 'a', x: 10, y: 20, z: 1, locked: true }), item({ id: 'b', page: 1, x: 50, y: 60, z: 2 })];
    const one = copyToPages(list, ['a'], 2, 3);
    expect(one.items).toHaveLength(3);
    expect(one.items[2]).toMatchObject({ page: 2, x: 10, y: 20, z: 3, locked: false, fill: 'lime' });
    expect(one.ids).toEqual([one.items[2].id]);
    expect(one.items[2].id).not.toBe('a');
    const all = copyToPages(list, ['a', 'b'], 'all', 3);
    expect(all.items.slice(2).map((it) => it.page).sort()).toEqual([0, 1, 2, 2]);
    const full = copyToPages(Array.from({ length: 39 }, (_, i) => item({ id: `i${i}` })), ['i0'], 'all', 4);
    expect(full.ids).toHaveLength(1);
    expect(full.full).toBe(true);
  });

  it('the clipboard leaves out ids / page / layer; a paste lands on the page, shifted if the same things stand there', async () => {
    const { clipOf, pasteClip } = await import('./freeLayer.js');
    const list = [item({ id: 'a', x: 10, y: 20, z: 1 }), item({ id: 'b', x: 80, y: 20, z: 2, locked: true })];
    const clip = clipOf(list, ['a', 'b']);
    expect(clip[0]).not.toHaveProperty('id');
    expect(clip[1]).not.toHaveProperty('locked');
    const here = pasteClip(list, clip, 0);
    expect(here.items.slice(2)).toEqual([expect.objectContaining({ x: 16, y: 26, page: 0, z: 3 }), expect.objectContaining({ x: 86, y: 26, z: 4, locked: false })]);
    const other = pasteClip([], clip, 1);
    expect(other.items).toEqual([expect.objectContaining({ x: 10, y: 20, page: 1 }), expect.objectContaining({ x: 80, page: 1 })]);
    expect(pasteClip([], [{ kind: 'bogus' }], 0).ids).toEqual([]);
  });
});

describe('drawn shapes (2026-11-14)', () => {
  it('bubble, star, burst, ribbon: kept for shapes and text boxes, not for pictures; the tail is checked', () => {
    expect(normalizeFreeItem(item({ kind: 'text', text: 'Tere', shape: 'bubble', tail: 'tr' }))).toMatchObject({ shape: 'bubble', tail: 'tr' });
    expect(normalizeFreeItem(item({ kind: 'text', text: 'Tere', shape: 'bubble', tail: 'up' })).tail).toBe('bl');
    expect(normalizeFreeItem(item({ kind: 'image', img, shape: 'star' })).shape).toBe('rect');
    expect(freeProblem({ free: [item({ shape: 'burst', fill: 'white' })] })).toBe('');
    expect(freeProblem({ free: [item({ shape: 'bubble', tail: 'up' })] })).toMatch(/saba/);
  });

  it('draws the outline as SVG in the fill and frame colours; the text sits in the bubble body', () => {
    const free = [item({ id: 'b', kind: 'text', text: 'Tere!', shape: 'bubble', tail: 'br', fill: 'white', border: 'ink' }), item({ id: 's', shape: 'star', fill: 'lime' })];
    const { container } = render(<Sheet doc={docWith(free)} mode="print" />);
    const bubble = container.querySelector('[data-free="b"]');
    expect(bubble.className).toContain('is-drawn');
    expect(bubble.querySelector('svg.ws-free-art g').getAttribute('transform')).toBe('translate(100 0) scale(-1 1)');
    expect(bubble.querySelector('path').style.fill).toBe('rgb(255, 255, 255)');
    expect(bubble.querySelector('path').style.stroke).toBe('rgb(17, 24, 39)');
    expect(bubble.querySelector('.ws-free-body.tail-br .ws-free-text').textContent).toBe('Tere!');
    expect(container.querySelector('[data-free="s"] polygon').getAttribute('points').split(' ')).toHaveLength(10);
  });
});

describe('cropping a picture (2026-11-14)', () => {
  const photo = (patch) => item({ id: 'p', kind: 'image', img: { ...img, focus: { x: 30, y: 40 } }, shape: 'rect', ...patch });

  it('zoom 1…4 around the focus point; a pan moves the focus, slower when zoomed; the file stays whole', () => {
    expect(cropStyle(photo({ zoom: 2 }))).toEqual({ objectPosition: '30% 40%', transformOrigin: '30% 40%', transform: 'scale(2)' });
    expect(cropStyle(photo({}))).toEqual({ objectPosition: '30% 40%', transformOrigin: '30% 40%' });
    expect(normalizeFreeItem(photo({ zoom: 9 })).zoom).toBe(4);
    expect(panFocus(photo({ zoom: 2 }), 20, -10).img).toEqual({ ...img, focus: { x: 20, y: 45 } });
    expect(panFocus(photo({}), 90, 0).img.focus.x).toBe(0);
    expect(freeProblem({ free: [photo({ zoom: 0.5 })] })).toMatch(/suurendus/);
    expect(freeProblem({ free: [photo({ zoom: 2.5 })] })).toBe('');
  });

  it('a double click starts cropping: a drag pans the photo (one change), + zooms, „Valmis” ends; the frame does not move', () => {
    const onChange = vi.fn();
    const { container } = render(<Sheet doc={docWith([photo({ zoom: 2 })])} mode="edit" freeEdit={{ selectedId: 'p', onSelect: vi.fn(), onChange }} />);
    const node = container.querySelector('[data-free="p"]');
    node.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 150, right: 200, bottom: 150 });
    expect(node.querySelector('.ws-free-crop img').style.transform).toBe('scale(2)');
    fireEvent.doubleClick(node);
    expect(node.className).toContain('is-cropping');
    expect(node.querySelector('.ws-free-size')).toBeNull();
    fireEvent.pointerDown(node, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(node, { clientX: 140, clientY: 100, pointerId: 1 });
    expect(node.querySelector('.ws-free-crop img').style.objectPosition).toBe('20% 40%');
    fireEvent.pointerUp(node, { clientX: 140, clientY: 100, pointerId: 1 });
    expect(onChange).toHaveBeenLastCalledWith('p', expect.objectContaining({ x: 10, y: 20, img: expect.objectContaining({ focus: { x: 20, y: 40 } }) }));
    fireEvent.click(node.querySelector('[aria-label="Suurenda"]'));
    expect(onChange).toHaveBeenLastCalledWith('p', expect.objectContaining({ zoom: 2.25 }));
    fireEvent.click(node.querySelector('.ws-free-croptools .is-done'));
    expect(node.className).not.toContain('is-cropping');
  });
});

it('„Teksti taha”: items with behind go to a back layer under the blocks; the constructor can lift it (2026-11-14)', () => {
  const free = [item({ id: 'back', behind: true, fill: 'sky' }), item({ id: 'front' })];
  expect(normalizeFreeItem(free[0]).behind).toBe(true);
  expect(normalizeFreeItem(free[1]).behind).toBe(false);
  const { container, rerender } = render(<Sheet doc={docWith(free)} mode="print" />);
  expect(container.querySelector('.ws-free.is-behind [data-free="back"]')).not.toBeNull();
  expect(container.querySelector('.ws-free:not(.is-behind) [data-free="front"]')).not.toBeNull();
  rerender(<Sheet doc={docWith(free)} mode="edit" freeEdit={{ selectedId: null, backFront: true, onSelect: vi.fn(), onChange: vi.fn() }} />);
  expect(container.querySelector('.ws-free.is-behind').className).toContain('is-lifted');
});

it('ready layouts: every layout makes valid items on the page, on top; too many → nothing (2026-11-14)', async () => {
  const { PRESET_KEYS, presetItems } = await import('./freeLayer.js');
  for (const key of PRESET_KEYS) {
    const made = presetItems(key, 1, [item({ id: 'old', z: 7 })]);
    expect(made.length).toBeGreaterThan(0);
    expect(made.every((it) => it.page === 1 && it.z > 7)).toBe(true);
    expect(freeProblem({ free: made })).toBe('');
  }
  expect(presetItems('words', 0, []).filter((it) => it.kind === 'image')).toHaveLength(6);
  expect(presetItems('panel', 0, [])[0].behind).toBe(true);
  expect(presetItems('words', 0, Array.from({ length: 35 }, (_, i) => item({ id: `i${i}` })))).toEqual([]);
  expect(presetItems('nope', 0, [])).toEqual([]);
});
