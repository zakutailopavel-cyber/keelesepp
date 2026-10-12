import { render } from '@testing-library/react';
import { createBlock, scoreDocument } from '../registry.js';
import Sheet from '../Sheet.jsx';
import { sampleDocument } from '../sample.js';
import { picmatchOrder } from './picture.jsx';

globalThis.ResizeObserver = globalThis.ResizeObserver || class { observe() {} disconnect() {} };
const doc = (blocks, meta = {}) => { const d = sampleDocument(); return { ...d, meta: { ...d.meta, ...meta }, blocks }; };
const answer = (b, map) => Object.fromEntries(Object.entries(map).map(([k, v]) => [`${b.id}:${k}`, v]));
const ok = (d, answers, id) => scoreDocument(d, answers).perBlock[id].map((i) => i.ok);

describe('picture tasks', () => {
  it('words ↔ lettered pictures: the pictures are mixed and the right letter follows its picture', () => {
    const b = createBlock('picmatch');
    const { container } = render(<Sheet doc={doc([b])} mode="print" />);
    const letters = [...container.querySelectorAll('.ws-root > .ws-page .ws-pic-letter')].map((x) => x.textContent);
    expect(letters).toEqual(['A', 'B', 'C', 'D']);
    const order = picmatchOrder(b.data.items, b.id);
    // word i's picture stands at position order.indexOf(i)
    const right = Object.fromEntries(b.data.items.map((_, i) => [i, 'ABCD'[order.indexOf(i)]]));
    expect(ok(doc([b]), answer(b, right), b.id)).toEqual([true, true, true, true]);
    expect(ok(doc([b]), answer(b, { 0: 'Z' }), b.id)[0]).toBe(false);
  });

  it('labels on a picture, character cards and picture rows are scored or left to the teacher', () => {
    const scene = createBlock('scenelabel');
    expect(ok(doc([scene]), answer(scene, { 0: 'Pööning', 1: 'köök' }), scene.id).slice(0, 2)).toEqual([true, false]);
    const cards = createBlock('profiles');
    expect(ok(doc([cards]), answer(cards, { '0.0.0': 'on', '0.1.0': 'oli' }), cards.id).slice(0, 2)).toEqual([true, false]);
    const rows = createBlock('picrows');
    const { container } = render(<Sheet doc={doc([scene, cards, rows])} mode="print" />);
    expect(container.querySelectorAll('.ws-root > .ws-page .ws-pin')).toHaveLength(4);
    expect(container.querySelectorAll('.ws-root > .ws-page .ws-profile')).toHaveLength(3);
    expect(container.querySelectorAll('.ws-root > .ws-page .ws-picrow')).toHaveLength(2);
  });

  it('a compact sheet carries its density class', () => {
    const { container } = render(<Sheet doc={doc([createBlock('gaps')], { density: 'compact' })} mode="print" />);
    expect(container.querySelector('.ws-root')).toHaveClass('density-compact');
  });
});
