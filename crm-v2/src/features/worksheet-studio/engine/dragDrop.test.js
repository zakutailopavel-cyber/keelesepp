import { dropAction, hintFor } from './dragIds.js';
import { dropSide } from './look.js';

const over = { kind: 'block', id: 'b2', full: false, rect: { left: 100, top: 100, width: 400, height: 200 } };

describe('drag & drop on the sheet', () => {
  it('lights the side of the card under the pointer, never the dragged card itself', () => {
    expect(hintFor({ active: { kind: 'new', type: 'gaps' }, over, pointer: { x: 300, y: 120 }, dropSide })).toEqual({ id: 'b2', side: 'before' });
    expect(hintFor({ active: { kind: 'block', id: 'b1' }, over, pointer: { x: 490, y: 200 }, dropSide })).toEqual({ id: 'b2', side: 'right' });
    expect(hintFor({ active: { kind: 'block', id: 'b2' }, over, pointer: { x: 300, y: 120 }, dropSide })).toBeNull();
    expect(hintFor({ active: { kind: 'new', type: 'gaps' }, over: null, pointer: { x: 0, y: 0 }, dropSide })).toBeNull();
  });

  it('a drop adds a new block, moves a block or does nothing', () => {
    const hint = { id: 'b2', side: 'after' };
    expect(dropAction({ active: { kind: 'new', type: 'gaps' }, hint })).toEqual({ op: 'new', type: 'gaps', toId: 'b2', side: 'after' });
    expect(dropAction({ active: { kind: 'block', id: 'b1' }, hint })).toEqual({ op: 'move', fromId: 'b1', toId: 'b2', side: 'after' });
    expect(dropAction({ active: { kind: 'block', id: 'b2' }, hint })).toBeNull();
    expect(dropAction({ active: { kind: 'new', type: 'text' }, overKind: 'end', hint: null })).toEqual({ op: 'new', type: 'text', toId: null, side: 'after' });
    expect(dropAction({ active: { kind: 'block', id: 'b1' }, hint: null })).toBeNull();
  });
});
