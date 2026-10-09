import { dropAt, dropSide, insertAt } from './look.js';

const ids = (blocks) => blocks.map((block) => block.id);
const list = [{ id: 'a' }, { id: 'b' }, { id: 'c', joined: true }, { id: 'd' }];

describe('drop with a side', () => {
  it('moves before or after the target group, joined groups stay together', () => {
    expect(ids(dropAt(list, 'd', 'a', 'before'))).toEqual(['d', 'a', 'b', 'c']);
    expect(ids(dropAt(list, 'a', 'b', 'after'))).toEqual(['b', 'c', 'a', 'd']);
    expect(ids(dropAt(list, 'a', 'c', 'right'))).toEqual(['b', 'c', 'a', 'd']);
    expect(ids(dropAt(list, 'b', 'd', 'after'))).toEqual(['a', 'd', 'b', 'c']);
    expect(dropAt(list, 'b', 'c', 'after')).toBe(list);
  });

  it('inserts a new block before / after a group or at the end', () => {
    expect(ids(insertAt(list, [{ id: 'n' }], 'b', 'after'))).toEqual(['a', 'b', 'c', 'n', 'd']);
    expect(ids(insertAt(list, [{ id: 'n' }], 'c', 'left'))).toEqual(['a', 'n', 'b', 'c', 'd']);
    expect(ids(insertAt(list, [{ id: 'n' }], null))).toEqual(['a', 'b', 'c', 'd', 'n']);
  });

  it('reads the side from the pointer: edges of a narrow card mean beside it', () => {
    expect(dropSide({ x: 10, y: 50, width: 400, height: 200 })).toBe('left');
    expect(dropSide({ x: 390, y: 50, width: 400, height: 200 })).toBe('right');
    expect(dropSide({ x: 10, y: 50, width: 400, height: 200 }, true)).toBe('before');
    expect(dropSide({ x: 200, y: 150, width: 400, height: 200 })).toBe('after');
  });
});
