import { availabilityAt, bandsOn, paintSlot, windowProblem } from './availabilityModel.js';

const monday = '2026-10-05';
const windows = { slots: [
  { id: 'a', kind: 'free', day: 'Mon', start: '14:00', end: '18:00' },
  { id: 'b', kind: 'busy', day: 'Mon', start: '18:00', end: '20:00' },
  { id: 'c', kind: 'busy', date: '2026-10-12', start: '15:00', end: '16:00' },
] };

describe('teacher windows', () => {
  it('says free inside green, busy when touching red, open where nothing is marked', () => {
    expect(availabilityAt(windows, { date: monday, time: '15:00', duration: 60 })).toBe('free');
    expect(availabilityAt(windows, { date: monday, time: '17:30', duration: 60 })).toBe('busy');
    expect(availabilityAt(windows, { date: monday, time: '10:00', duration: 60 })).toBe('open');
    expect(availabilityAt(windows, { date: '2026-10-12', time: '15:30', duration: 30 })).toBe('busy');
    expect(availabilityAt(windows, { date: '2026-10-06', time: '15:00' })).toBe('open');
    expect(availabilityAt(null, { date: monday, time: '15:00' })).toBe('open');
  });

  it('draws the day bands in minutes and replaces overlapping windows of the same day when painting', () => {
    expect(bandsOn(windows, monday).map((band) => [band.kind, band.start, band.end])).toEqual([['free', 840, 1080], ['busy', 1080, 1200]]);
    const next = paintSlot(windows.slots, { id: 'd', kind: 'busy', day: 'Mon', start: '16:00', end: '17:00' });
    expect(next.map((slot) => slot.id).sort()).toEqual(['b', 'c', 'd']);
  });

  it('yellow windows take online lessons only; red still wins', () => {
    const yellow = { slots: [
      { id: 'y', kind: 'online', day: 'Mon', start: '19:00', end: '21:00' },
      { id: 'r', kind: 'busy', day: 'Mon', start: '20:30', end: '21:00' },
    ] };
    expect(availabilityAt(yellow, { date: monday, time: '19:00', duration: 60 })).toBe('online');
    expect(windowProblem(yellow, { date: monday, time: '19:00', duration: 60 }, 'Pavel')).toMatch(/ainult veebitunde/);
    expect(windowProblem(yellow, { date: monday, time: '19:00', duration: 60, online: true }, 'Pavel')).toBe('');
    expect(windowProblem(yellow, { date: monday, time: '20:00', duration: 60, online: true }, 'Pavel')).toMatch(/punane aeg/);
  });
});

describe('one cell status (Oleksiy 2026-10-15)', () => {
  // 2026-10-15 is a Thursday
  const weeklyFree = [{ id: 'w1', kind: 'free', day: 'Thu', start: '09:00', end: '17:00' }];
  it('a weekly cell cuts the weekly window around it; neighbours of one kind join again', async () => {
    const { setCellStatus } = await import('./availabilityModel.js');
    const busy = setCellStatus(weeklyFree, { date: '2026-10-15', weekly: true, start: '12:00', end: '12:30', kind: 'busy' });
    expect(busy.map((s) => [s.kind, s.start, s.end, s.day])).toEqual([['free', '09:00', '12:00', 'Thu'], ['busy', '12:00', '12:30', 'Thu'], ['free', '12:30', '17:00', 'Thu']]);
    const back = setCellStatus(busy, { date: '2026-10-15', weekly: true, start: '12:00', end: '12:30', kind: 'free' });
    expect(back.map((s) => [s.kind, s.start, s.end])).toEqual([['free', '09:00', '17:00']]);
  });
  it('a one-day status overrides the weekly window only on that date', async () => {
    const { setCellStatus, availabilityAt, cellStatus, bandsOn } = await import('./availabilityModel.js');
    const slots = setCellStatus(weeklyFree, { date: '2026-10-15', start: '10:00', end: '10:30', kind: 'online' });
    const availability = { slots };
    expect(availabilityAt(availability, { date: '2026-10-15', time: '10:00', duration: 30 })).toBe('online');
    expect(availabilityAt(availability, { date: '2026-10-22', time: '10:00', duration: 30 })).toBe('free');
    expect(cellStatus(availability, { date: '2026-10-15', start: '10:00', end: '10:30' })).toEqual({ kind: 'online', weekly: false });
    expect(cellStatus(availability, { date: '2026-10-15', start: '11:00', end: '11:30' })).toEqual({ kind: 'free', weekly: true });
    expect(bandsOn(availability, '2026-10-15').map((b) => [b.kind, b.start, b.end])).toEqual([['free', 540, 600], ['online', 600, 630], ['free', 630, 1020]]);
  });
  it('clearing one date inside a weekly window leaves it unmarked that day only; a free one-day cell beats a weekly busy one', async () => {
    const { setCellStatus, availabilityAt } = await import('./availabilityModel.js');
    const cleared = { slots: setCellStatus(weeklyFree, { date: '2026-10-15', start: '09:00', end: '09:30', kind: 'clear' }) };
    expect(availabilityAt(cleared, { date: '2026-10-15', time: '09:00', duration: 30 })).toBe('open');
    expect(availabilityAt(cleared, { date: '2026-10-22', time: '09:00', duration: 30 })).toBe('free');
    const weeklyBusy = [{ id: 'b', kind: 'busy', day: 'Thu', start: '09:00', end: '12:00' }];
    const freed = { slots: setCellStatus(weeklyBusy, { date: '2026-10-15', start: '10:00', end: '11:00', kind: 'free' }) };
    expect(availabilityAt(freed, { date: '2026-10-15', time: '10:00', duration: 60 })).toBe('free');
    expect(availabilityAt(freed, { date: '2026-10-15', time: '09:00', duration: 30 })).toBe('busy');
  });
});
