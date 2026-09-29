import { rowsOf, snapSpan, spanOf, withHeight, withSpan } from './layout.js';

const b = (id, extra) => ({ id, ...extra });

describe('free block size', () => {
  it('reads old half/full documents', () => {
    expect(spanOf({ width: 'half' })).toBe(6);
    expect(spanOf({ width: 'full' })).toBe(12);
    expect(spanOf({ width: 'half', span: 4 })).toBe(4);
  });

  it('packs blocks into rows of 12 columns', () => {
    const rows = rowsOf([b('a', { span: 4 }), b('b', { span: 4 }), b('c', { span: 4 }), b('d', { span: 3 }), b('e', { span: 9 }), b('f', { span: 8 }), b('g', { span: 6 })]);
    expect(rows.map((row) => row.map((x) => x.id).join(''))).toEqual(['abc', 'de', 'f', 'g']);
    expect(rowsOf([b('h', { width: 'half' }), b('i', { width: 'half' }), b('j', { width: 'full' })]).map((row) => row.length)).toEqual([2, 1]);
  });

  it('snaps a dragged width to the nearest preset and keeps width in step', () => {
    expect(snapSpan(5.2)).toBe(6);
    expect(snapSpan(3.4)).toBe(3);
    expect(snapSpan(10.7)).toBe(12);
    expect(withSpan({ id: 'x', width: 'half' }, 12)).toMatchObject({ span: 12, width: 'full' });
    expect(withSpan({ id: 'x', width: 'full' }, 4)).toMatchObject({ span: 4, width: 'half' });
  });

  it('sets or clears a fixed height within limits', () => {
    expect(withHeight({ id: 'x' }, 55)).toMatchObject({ minHeightMm: 55 });
    expect(withHeight({ id: 'x' }, 5).minHeightMm).toBe(20);
    expect(withHeight({ id: 'x', minHeightMm: 80 }, 0)).toEqual({ id: 'x' });
  });
});
