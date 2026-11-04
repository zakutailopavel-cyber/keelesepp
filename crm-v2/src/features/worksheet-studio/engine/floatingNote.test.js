import { anchorVisible, pickNote, pillSpot, placeFloating } from './floatingNote.js';

const screen = { left: 0, top: 0, right: 1200, bottom: 800 };
const rect = (left, top, w, h) => ({ left, top, right: left + w, bottom: top + h });
const size = { w: 360, h: 200 };

describe('a task note floats next to its task, never over it', () => {
  it('goes to the right of the task when there is room, level with its top', () => {
    const spot = placeFloating({ anchor: rect(100, 150, 400, 300), size, bounds: screen });
    expect(spot).toMatchObject({ side: 'right', left: 510, top: 150, width: 360, maxHeight: null });
  });

  it('goes to the left when the right side has no room (the task in the right column)', () => {
    const spot = placeFloating({ anchor: rect(700, 150, 450, 300), size, bounds: screen });
    expect(spot).toMatchObject({ side: 'left', left: 700 - 10 - 360, top: 150 });
  });

  it('is kept on screen when the task starts above or ends below it', () => {
    expect(placeFloating({ anchor: rect(100, -400, 400, 900), size, bounds: screen }).top).toBe(8);
    expect(placeFloating({ anchor: rect(100, 700, 400, 300), size, bounds: screen }).top).toBe(800 - 8 - 200);
  });

  it('goes under (then over) a task as wide as the screen', () => {
    expect(placeFloating({ anchor: rect(10, 50, 1180, 300), size, bounds: screen })).toMatchObject({ side: 'below', top: 360 });
    expect(placeFloating({ anchor: rect(10, 450, 1180, 300), size, bounds: screen })).toMatchObject({ side: 'above', top: 450 - 10 - 200 });
  });

  it('never covers the field being typed in: another side is taken', () => {
    const anchor = rect(10, 50, 1180, 300);
    const field = rect(100, 380, 200, 40); // a field of the next task, right under this one
    const spot = placeFloating({ anchor, size, bounds: screen, avoid: field });
    expect(spot.side).not.toBe('below');
    expect(spot.top + 200 <= field.top || spot.top >= field.bottom || spot.left >= field.right || spot.left + spot.width <= field.left).toBe(true);
  });

  it('on a phone the task fills the screen: the note docks at the edge away from the field being typed in', () => {
    const phone = { left: 0, top: 0, right: 375, bottom: 700 };
    const anchor = rect(8, -100, 359, 1000);
    const low = placeFloating({ anchor, size: { w: 360, h: 260 }, bounds: phone, avoid: rect(40, 520, 120, 44) });
    expect(low.side).toBe('dock-top');
    expect(low.top).toBe(8);
    const high = placeFloating({ anchor, size: { w: 360, h: 260 }, bounds: phone, avoid: rect(40, 120, 120, 44) });
    expect(high.side).toBe('dock-bottom');
    expect(high.top + Math.min(260, high.maxHeight || 260)).toBe(692);
    expect(low.width).toBe(375 - 16);
  });

  it('a note taller than the room is limited and scrolls inside', () => {
    const spot = placeFloating({ anchor: rect(100, 150, 400, 300), size: { w: 360, h: 2000 }, bounds: screen });
    expect(spot.side).toBe('right');
    expect(spot.maxHeight).toBe(800 - 16);
  });

  it('several notes: the one opened, typed in or pointed at wins, else the task nearest the middle; closed or unseen never', () => {
    const group = new Map([
      ['a', { visible: true, closed: false, rank: 3, distance: 300 }],
      ['b', { visible: true, closed: false, rank: 3, distance: 20 }],
      ['c', { visible: false, closed: false, rank: 0, distance: 0 }],
    ]);
    expect(pickNote(group)).toBe('b');
    group.set('a', { visible: true, closed: false, rank: 1, distance: 300 });
    expect(pickNote(group)).toBe('a');
    group.set('a', { visible: true, closed: true, rank: 0, distance: 300 });
    expect(pickNote(group)).toBe('b');
    expect(pickNote(new Map())).toBe('');
  });

  it('the button of a waiting note sits on its task corner, kept on screen; out of sight hides the note', () => {
    expect(pillSpot(rect(100, 300, 400, 200), screen)).toEqual({ top: 278, right: 492 });
    expect(pillSpot(rect(100, -500, 400, 200), screen).top).toBe(8);
    expect(anchorVisible(rect(100, 300, 400, 200), screen)).toBe(true);
    expect(anchorVisible(rect(100, 900, 400, 200), screen)).toBe(false);
    expect(anchorVisible(rect(0, 0, 0, 0), screen)).toBe(false);
  });
});
