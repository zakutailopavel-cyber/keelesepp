import {
  STORAGE_KEY, clampRect, fitWidth, fromAnchored, loadLayout, rightInset, saveLayout, snapRect, stripHeight, toAnchored, validLayout,
} from './floatingLayout.js';

const bounds = { w: 1000, h: 600 };
const h43 = (w) => Math.round(w * 0.75);

describe('floatingLayout: clamp and snap', () => {
  it('keeps a window inside the board whatever the drag', () => {
    expect(clampRect({ x: -50, y: -20, w: 200, h: 150 }, bounds)).toMatchObject({ x: 8, y: 8 });
    expect(clampRect({ x: 950, y: 590, w: 200, h: 150 }, bounds)).toMatchObject({ x: 792, y: 442 });
    expect(clampRect({ x: 300, y: 200, w: 200, h: 150 }, bounds)).toMatchObject({ x: 300, y: 200 });
  });

  it('a window larger than the board stays at the margin', () => {
    expect(clampRect({ x: 100, y: 100, w: 1200, h: 700 }, bounds)).toMatchObject({ x: 8, y: 8 });
  });

  it('snaps to an edge and to a corner near it, not in the middle', () => {
    expect(snapRect({ x: 20, y: 300, w: 200, h: 150 }, bounds)).toMatchObject({ x: 8, y: 300 });
    expect(snapRect({ x: 780, y: 430, w: 200, h: 150 }, bounds)).toMatchObject({ x: 792, y: 442 });
    expect(snapRect({ x: 400, y: 200, w: 200, h: 150 }, bounds)).toMatchObject({ x: 400, y: 200 });
  });

  it('fits the width to the board with the aspect kept and a minimum', () => {
    expect(fitWidth(2000, h43, bounds)).toBeLessThanOrEqual(984);
    expect(h43(fitWidth(2000, h43, bounds))).toBeLessThanOrEqual(584);
    expect(fitWidth(10, h43, bounds, { minWidth: 96 })).toBe(96);
    expect(fitWidth(300, h43, bounds)).toBe(300);
  });
});

describe('floatingLayout: anchored layout', () => {
  it('remembers the nearer corner and keeps it when the board changes size', () => {
    const layout = toAnchored({ x: 772, y: 20, w: 220, h: 165 }, bounds);
    expect(layout).toEqual({ ax: 'right', ay: 'top', dx: 8, dy: 20, w: 220, min: false });
    // the screen turns (narrower): still 8 px from the right edge
    expect(fromAnchored(layout, { w: 700, h: 900 }, h43)).toMatchObject({ x: 472, y: 20, w: 220, h: 165 });
    const bottomLeft = toAnchored({ x: 10, y: 400, w: 200, h: 150 }, bounds, { min: true });
    expect(bottomLeft).toEqual({ ax: 'left', ay: 'bottom', dx: 10, dy: 50, w: 200, min: true });
    expect(fromAnchored(bottomLeft, { w: 1000, h: 800 }, h43)).toMatchObject({ x: 10, y: 600 });
  });

  it('accepts only a sensible remembered layout', () => {
    expect(validLayout({ ax: 'right', ay: 'top', dx: 8, dy: 9, w: 200 })).toEqual({ ax: 'right', ay: 'top', dx: 8, dy: 9, w: 200, min: false });
    expect(validLayout({ ax: 'middle', ay: 'top', dx: 8, dy: 9, w: 200 })).toBeNull();
    expect(validLayout({ ax: 'left', ay: 'top', dx: 'x', dy: 9, w: 200 })).toBeNull();
    expect(validLayout({ ax: 'left', ay: 'top', dx: 1, dy: 9, w: 5 })).toBeNull();
    expect(validLayout(null)).toBeNull();
  });

  it('saves and loads per window id, and survives a broken or missing storage', () => {
    const data = {};
    const storage = { getItem: (key) => data[key] ?? null, setItem: (key, value) => { data[key] = value; } };
    const layout = { ax: 'left', ay: 'bottom', dx: 10, dy: 12, w: 180, min: true };
    expect(saveLayout('room-remote', layout, storage)).toBe(true);
    expect(loadLayout('room-remote', storage)).toEqual(layout);
    expect(loadLayout('room-self', storage)).toBeNull();
    data[STORAGE_KEY] = '{broken';
    expect(loadLayout('room-remote', storage)).toBeNull();
    const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    expect(loadLayout('room-remote', throwing)).toBeNull();
    expect(saveLayout('room-remote', layout, throwing)).toBe(false);
    expect(loadLayout('room-remote', undefined)).toBeNull();
  });
});

describe('floatingLayout: board inset and group strip', () => {
  it('keeps room on the right only for a shown window at the right edge', () => {
    expect(rightInset([{ ax: 'right', dx: 14, w: 220, min: false }, { ax: 'right', dx: 14, w: 132, min: false }], 1200)).toBe(246);
    expect(rightInset([{ ax: 'right', dx: 14, w: 220, min: true }], 1200)).toBe(0);
    expect(rightInset([{ ax: 'left', dx: 14, w: 220, min: false }], 1200)).toBe(0);
    expect(rightInset([{ ax: 'right', dx: 14, w: 800, min: false }], 1200)).toBe(0);
  });

  it('a strip is as tall as its tiles: a column grows with them, a row shares the width', () => {
    expect(stripHeight(3, false)(160)).toBe(312);
    expect(stripHeight(3, true)(612)).toBe(125);
    expect(stripHeight(0, false)(160)).toBe(100);
  });
});
