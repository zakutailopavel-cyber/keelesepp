import { describe, expect, it } from 'vitest';
import { groupSheetTabs } from './sheetTabs.js';

const sheet = (id, roomKey, openedAt, title = id) => ({ id, roomKey, openedAt, title });
const past = [
  sheet('a1', 'inv-old1', '2026-10-20T15:00:00.000Z', 'Avasta'),
  sheet('a2', 'inv-old1', '2026-10-20T15:20:00.000Z', 'Harjuta'),
  sheet('b1', 'inv-old2', '2026-10-27T15:00:00.000Z', 'Kasuta'),
  sheet('c1', 'inv-now', '2026-11-04T15:00:00.000Z', 'Täna'),
];

describe('student sheet tabs: latest lesson vs older', () => {
  it('this room\'s sheets are the tabs; older rooms go to the dropdown, newest lesson first', () => {
    const result = groupSheetTabs({ roomSheets: [{ id: 'c1' }], pastSheets: past, roomKey: 'inv-now' });
    expect([...result.latest]).toEqual(['c1']);
    expect(result.older.map((group) => group.key)).toEqual(['inv-old2', 'inv-old1']);
    expect(result.older[1].sheets.map((item) => item.id)).toEqual(['a2', 'a1']);
    expect(result.older[0].label).toBe('27.10.2026');
    expect([...result.hidden].sort()).toEqual(['a1', 'a2', 'b1']);
  });

  it('a sheet of this room known only from the past list (not yet in the panel) is still a tab', () => {
    const result = groupSheetTabs({ roomSheets: [], pastSheets: past, roomKey: 'inv-now' });
    expect([...result.latest]).toEqual(['c1']);
  });

  it('a room without sheets yet keeps the most recent lesson day on the tabs', () => {
    const result = groupSheetTabs({ roomSheets: [], pastSheets: past.slice(0, 3), roomKey: 'inv-new' });
    expect([...result.latest]).toEqual(['b1']);
    expect(result.older.map((group) => group.key)).toEqual(['inv-old1']);
    expect([...result.hidden].sort()).toEqual(['a1', 'a2']);
  });

  it('an older sheet the student opened stays a tab (not hidden) until closed', () => {
    const result = groupSheetTabs({ roomSheets: [{ id: 'c1' }], pastSheets: past, roomKey: 'inv-now', opened: new Set(['a1']) });
    expect(result.hidden.has('a1')).toBe(false);
    expect(result.hidden.has('a2')).toBe(true);
    // it is still listed under its lesson
    expect(result.older.find((group) => group.key === 'inv-old1').sheets.some((item) => item.id === 'a1')).toBe(true);
  });

  it('two lessons on the same day get the time in their label', () => {
    const result = groupSheetTabs({ roomSheets: [{ id: 'x' }], roomKey: 'now', pastSheets: [
      sheet('m1', 'r1', '2026-10-20T08:00:00.000Z'), sheet('m2', 'r2', '2026-10-20T14:00:00.000Z'),
    ] });
    expect(result.older).toHaveLength(2);
    expect(result.older[0].label).toMatch(/^20\.10\.2026 · \d\d:\d\d$/);
  });

  it('nothing at all: no tabs to hide', () => {
    const result = groupSheetTabs({});
    expect(result.latest.size).toBe(0);
    expect(result.older).toEqual([]);
    expect(result.hidden.size).toBe(0);
  });
});
