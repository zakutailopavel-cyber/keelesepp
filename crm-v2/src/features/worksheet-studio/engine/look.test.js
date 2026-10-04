import { dropRun, moveRun, runBounds, withLook } from './look.js';

const ids = (blocks) => blocks.map((block) => `${block.id}${block.joined ? '+' : ''}`).join(' ');
const sheet = () => [{ id: 'a' }, { id: 'b' }, { id: 'c', joined: true }, { id: 'd' }, { id: 'e', joined: true }];

describe('block look and joined groups', () => {
  it('keeps only chosen look values', () => {
    expect(withLook({ id: 'x' }, { frame: 'bold', icon: '' })).toEqual({ id: 'x', look: { frame: 'bold' } });
    expect(withLook({ id: 'x', look: { frame: 'bold' } }, { frame: '' })).toEqual({ id: 'x' });
  });

  it('finds the group of a block', () => {
    expect(runBounds(sheet(), 2)).toEqual([1, 2]);
    expect(runBounds(sheet(), 0)).toEqual([0, 0]);
    expect(runBounds(sheet(), 3)).toEqual([3, 4]);
  });

  it('moves a whole group past the neighbouring group', () => {
    expect(ids(moveRun(sheet(), 'c', 1))).toBe('a d e+ b c+');
    expect(ids(moveRun(sheet(), 'b', -1))).toBe('b c+ a d e+');
    expect(ids(moveRun(sheet(), 'a', -1))).toBe('a b c+ d e+');
    expect(ids(moveRun(sheet(), 'e', 1))).toBe('a b c+ d e+');
  });

  it('drags a group before the target group', () => {
    expect(ids(dropRun(sheet(), 'd', 'c'))).toBe('a d e+ b c+');
    expect(ids(dropRun(sheet(), 'b', 'c'))).toBe('a b c+ d e+');
  });
});
