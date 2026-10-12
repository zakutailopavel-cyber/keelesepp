import { canSplit, packPages, shiftKey, sliceBlock } from './pageSplit.js';

// a row of n items, each `step` mm tall, under a head of `head` mm
const listRow = (n, { head = 20, step = 10, tail = 4 } = {}) => {
  const items = Array.from({ length: n }, (_, i) => ({ top: head + i * step, bottom: head + (i + 1) * step }));
  return { h: head + n * step + tail, split: { head, tail, items } };
};

describe('page split', () => {
  it('continues a long list on the next page instead of leaving the page half empty', () => {
    // page 100 mm: a 30 mm row, then a 20 + 10×10 + 4 = 124 mm list
    const { pages } = packPages([{ h: 30 }, listRow(10)], { firstCap: 100, nextCap: 100 });
    // 70 mm left: head 20 + 4 items 40 + tail 4 = 64 fits, 5 items = 74 does not
    expect(pages).toEqual([[0, { row: 1, from: 0, to: 4 }], [{ row: 1, from: 4, to: 10 }]]);
  });

  it('keeps at least two items on each side and moves a short list whole', () => {
    // 35 mm left: only 1 item would fit → no split, the list moves to the next page
    expect(packPages([{ h: 65 }, listRow(6)], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1]]);
    // a list of 3 items is never split
    expect(packPages([{ h: 70 }, listRow(3)], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1]]);
    // 9 items of 9 mm (105 mm) on a 100 mm page: 7 stay, 2 continue
    expect(packPages([listRow(9, { step: 9 })], { firstCap: 100, nextCap: 100 }).pages).toEqual([[{ row: 0, from: 0, to: 7 }], [{ row: 0, from: 7, to: 9 }]]);
    // 9 items when only the last one does not fit: 8 + 1 is not allowed, so 7 + 2
    expect(packPages([listRow(9, { step: 8.7 })], { firstCap: 100, nextCap: 100 }).pages[1]).toEqual([{ row: 0, from: 7, to: 9 }]);
  });

  it('splits a list longer than a page into several parts and leaves other rows alone', () => {
    const { pages, tall } = packPages([listRow(25)], { firstCap: 100, nextCap: 100 });
    expect(pages.map((p) => p.map((e) => (typeof e === 'number' ? `${e}` : `${e.from}-${e.to}`)))).toEqual([['0-7'], ['7-14'], ['14-21'], ['21-25']]);
    expect(tall).toEqual([]);
    // an unsplittable tall row still makes a tall page
    expect(packPages([{ h: 150 }], { firstCap: 100, nextCap: 100 }).tall).toEqual([true]);
  });

  it('slices the items and shifts the answer keys of a part', () => {
    const gaps = { id: 'g', type: 'gaps', data: { sentences: 'a [1]\nb [2]\n\nc [3]\nd [4]', bank: 'x' } };
    expect(sliceBlock(gaps, 2, 4)).toEqual({ block: { ...gaps, data: { sentences: 'c [3]\nd [4]', bank: 'x' } }, start: 2 });
    const choice = { id: 'c', type: 'choice', data: { questions: [1, 2, 3, 4, 5].map((q) => ({ q })) } };
    expect(sliceBlock(choice, 3, 5).block.data.questions).toEqual([{ q: 4 }, { q: 5 }]);
    expect([shiftKey('0', 3), shiftKey('1.2', 3), shiftKey('text', 3), shiftKey('2', 0)]).toEqual(['3', '4.2', 'text', '2']);
    expect(canSplit(choice)).toBe(true);
    expect(canSplit({ ...choice, opts: { cols: 2 } })).toBe(false);
    expect(canSplit({ ...choice, minHeightMm: 80 })).toBe(false);
    expect(canSplit({ id: 'r', type: 'reading', data: {} })).toBe(false);
    expect(canSplit(choice, 'edit')).toBe(false);
  });

  it('splits a reading after its paragraphs and questions, and a letter only on paper', () => {
    const reading = { id: 'r', type: 'reading', data: { passageTitle: 'T', passage: 'p1\n\np2\n\np3', questions: 'q1 [a]\nq2 [b]\nq3 [c]' } };
    expect(canSplit(reading)).toBe(true);
    expect(sliceBlock(reading, 0, 2)).toMatchObject({ block: { data: { passageTitle: 'T', passage: 'p1\n\np2', questions: '' } }, start: 0 });
    // paragraph 3 and questions 1–3; then only questions 2–3, whose answers are keys 1 and 2
    expect(sliceBlock(reading, 2, 6)).toMatchObject({ block: { data: { passageTitle: '', passage: 'p3', questions: 'q1 [a]\nq2 [b]\nq3 [c]' } }, start: 0 });
    expect(sliceBlock(reading, 4, 6)).toMatchObject({ block: { data: { passage: '', questions: 'q2 [b]\nq3 [c]' } }, start: 1 });
    const letter = { id: 'l', type: 'guidedletter', data: { opening: 'Tere', closing: 'Lugupidamisega', lines: 12 } };
    expect(canSplit(letter, 'print')).toBe(true);
    expect(canSplit(letter, 'interactive')).toBe(false);
    expect(sliceBlock(letter, 0, 5).block.data).toMatchObject({ lines: 5, opening: 'Tere', closing: '' });
    expect(sliceBlock(letter, 5, 12).block.data).toMatchObject({ lines: 7, opening: '', closing: 'Lugupidamisega' });
  });
});
