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
