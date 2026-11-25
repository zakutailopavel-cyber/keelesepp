import { keepsWithNext } from './examMode.js';
import { canShrink, canSplit, canStack, packPages, shiftKey, sliceBlock } from './pageSplit.js';

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

  it('fills a free page bottom of 10 % or more (35 mm floor)', () => {
    // page 400 mm: a 350 mm row leaves 50 mm (12.5 %): a list starts there; 30 mm is not worth it
    expect(packPages([{ h: 350 }, listRow(10)], { firstCap: 400, nextCap: 400 }).pages[0]).toEqual([0, { row: 1, from: 0, to: 2 }]);
    expect(packPages([{ h: 370 }, listRow(10)], { firstCap: 400, nextCap: 400 }).pages).toEqual([[0], [1]]);
  });

  it('a type may keep one item on each side (split.min)', () => {
    const row = listRow(3, { step: 15 });
    row.split.min = 1;
    // 40 mm left: head 20 + one line 15 + tail 4 = 39 fits
    expect(packPages([{ h: 60 }, row], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0, { row: 1, from: 0, to: 1 }], [{ row: 1, from: 1, to: 3 }]]);
  });

  it('stacks side by side tasks when their row does not fit and the page has room', () => {
    // 60 mm left; the pair is 70 mm high side by side; alone over the whole width they are 40 and 50 mm
    const pair = { h: 70, stack: [{ h: 40 }, { h: 50 }] };
    expect(packPages([{ h: 40 }, pair], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0, { row: 1, member: 0 }], [{ row: 1, member: 1 }]]);
    // the pair fits: it stays side by side
    expect(packPages([{ h: 20 }, pair], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0, 1]]);
    // too little room (25 mm): the pair moves whole
    expect(packPages([{ h: 75 }, pair], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1]]);
    // the first task does not fit the room and does not split: the pair moves whole
    expect(packPages([{ h: 55 }, { h: 70, stack: [{ h: 50 }, { h: 30 }] }], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1]]);
    // the first task is a list: its first part fills the room, the rest and the second task follow
    const list = listRow(10);
    const out = packPages([{ h: 40 }, { h: 130, stack: [list, { h: 6 }] }], { firstCap: 100, nextCap: 100 }).pages;
    expect(out).toEqual([[0, { row: 1, member: 0, from: 0, to: 3 }], [{ row: 1, member: 0, from: 3, to: 10 }, { row: 1, member: 1 }]]);
  });

  it('stacks only list tasks, never while editing, never a picture or a tip', () => {
    const gaps = { id: 'a', type: 'gaps', data: {} };
    const choice = { id: 'b', type: 'choice', data: {} };
    expect(canStack([gaps, choice])).toBe(true);
    expect(canStack([gaps, choice], 'edit')).toBe(false);
    expect(canStack([gaps])).toBe(false);
    expect(canStack([{ id: 'i', type: 'image', data: {} }, { id: 't', type: 'tip', data: {} }])).toBe(false);
    expect(canStack([gaps, { id: 's', type: 'speaking', data: { img: { src: 'x' } } }])).toBe(false);
    expect(canStack([gaps, { ...choice, joined: true }])).toBe(false);
  });

  it('draws a picture smaller when its row misses the page by a little', () => {
    // 60 mm left; the picture row is 70 mm, its photo 60 mm: at 5/6 of the width it is 60 mm high
    const pic = { h: 70, shrink: { photo: 60, others: 30 } };
    expect(packPages([{ h: 40 }, pic, { h: 20 }], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0, { row: 1, scale: 0.833 }], [2]]);
    // more than 30 % smaller: it moves on whole
    expect(packPages([{ h: 40 }, { h: 90, shrink: { photo: 60, others: 30 } }], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1]]);
    // the tip beside it is taller than the room: it moves on whole
    expect(packPages([{ h: 40 }, { h: 70, shrink: { photo: 60, others: 65 } }], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1]]);
    // a fresh page never shrinks a picture
    expect(packPages([{ h: 70, shrink: { photo: 60, others: 30 } }], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0]]);
    const image = { id: 'i', type: 'image', data: {} };
    expect(canShrink([image, { id: 't', type: 'tip', data: {} }])).toBe(true);
    expect(canShrink([image], 'edit')).toBe(false);
    expect(canShrink([image, { ...image, id: 'j' }])).toBe(false);
  });

  it('lets one tall item (a question with options, a paragraph) stand as a part', () => {
    // items of 30 mm: 74 mm left holds head 20 + one item 30 + tail 4 = 54, two would be 84
    const big = listRow(6, { step: 30 });
    expect(packPages([{ h: 26 }, big], { firstCap: 100, nextCap: 100 }).pages[0]).toEqual([0, { row: 1, from: 0, to: 1 }]);
    // small items (10 mm) still keep two on each side
    expect(packPages([{ h: 65 }, listRow(6)], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1]]);
    expect(canSplit({ id: 'c', type: 'choice', data: { questions: [{ q: 1 }, { q: 2 }] } })).toBe(true);
  });

  it('keeps a picture on the page of the task under it', () => {
    const image = { id: 'i', type: 'image', data: {} };
    const tip = { id: 't', type: 'tip', data: {} };
    const speaking = { id: 's', type: 'speaking', data: {} };
    expect(keepsWithNext({ meta: {} }, [image, tip], [speaking])).toBe(true);
    expect(keepsWithNext({ meta: {} }, [image], [speaking])).toBe(true);
    expect(keepsWithNext({ meta: {} }, [image, tip], [image])).toBe(false);
    expect(keepsWithNext({ meta: {} }, [tip], [speaking])).toBe(false);
    expect(keepsWithNext({ meta: {} }, [image, speaking], [speaking])).toBe(false);
    expect(keepsWithNext({ meta: {} }, [image], undefined)).toBe(false);
    // 60 mm left: a smaller picture (60) would fit, but its task (25) would start the next page → both move (60 + 25 do not fit)
    const pic = { h: 70, shrink: { photo: 60, others: 30 }, keepWithNext: true };
    expect(packPages([{ h: 40 }, pic, { h: 25 }], { firstCap: 100, nextCap: 100 }).pages).toEqual([[0], [1, 2]]);
    // the task's first part fits under the picture: both stay
    expect(packPages([{ h: 10 }, { h: 30, keepWithNext: true }, listRow(10)], { firstCap: 100, nextCap: 100 }).pages[0]).toEqual([0, 1, { row: 2, from: 0, to: 3 }]);
  });
});
