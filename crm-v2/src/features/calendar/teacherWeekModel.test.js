import { describe, expect, it } from 'vitest';
import { availabilityAt } from './availabilityModel.js';
import { HALVES, cellKey, cellsFromSlots, changedDays, clashOf, datedSlots, lessonCells, outsideGrid, runsOfDay, slotsFromCells, studentCells } from './teacherWeekModel.js';

let counter = 0;
const ids = () => `n${counter += 1}`;
const strip = (slots) => slots.map((slot) => { const rest = { ...slot }; delete rest.id; return rest; });

describe('teacher week grid ↔ windows', () => {
  it('half hours 08:00–22:00, keys in the student poll format', () => {
    expect(HALVES).toHaveLength(28);
    expect(cellKey('Mon', HALVES[0])).toBe('Mon-08:00');
    expect(cellKey('Sun', HALVES.at(-1))).toBe('Sun-21:30');
  });

  it('round trip: windows → cells → windows gives the same windows', () => {
    const slots = [
      { id: 'a', kind: 'free', day: 'Mon', start: '09:00', end: '12:00' },
      { id: 'b', kind: 'busy', day: 'Mon', start: '12:00', end: '13:30' },
      { id: 'c', kind: 'online', day: 'Wed', start: '08:00', end: '22:00' },
      { id: 'd', kind: 'free', day: 'Sun', start: '21:30', end: '22:00' },
    ];
    const cells = cellsFromSlots(slots);
    expect(cells['Mon-08:30']).toBeUndefined();
    expect(cells['Mon-09:00']).toBe('free');
    expect(cells['Mon-13:00']).toBe('busy');
    expect(cells['Wed-21:30']).toBe('online');
    const next = slotsFromCells(slots, cells, undefined, ids);
    expect(strip(next)).toEqual(strip(slots));
    expect(runsOfDay(cells, 'Mon')).toEqual([{ kind: 'free', start: '09:00', end: '12:00' }, { kind: 'busy', start: '12:00', end: '13:30' }]);
  });

  it('cells → windows → cells gives the same cells (also a chequered day)', () => {
    const cells = {};
    HALVES.forEach((at, index) => { cells[cellKey('Tue', at)] = ['free', 'online', 'busy', ''][index % 4]; });
    cells['Fri-08:00'] = 'busy';
    const slots = slotsFromCells([], cells, undefined, ids);
    expect(cellsFromSlots(slots)).toEqual(Object.fromEntries(Object.entries(cells).filter(([, kind]) => kind)));
  });

  it('red over yellow over green where windows overlap; a window cutting a half hour marks it', () => {
    const cells = cellsFromSlots([
      { id: 'g', kind: 'free', day: 'Thu', start: '08:00', end: '20:00' },
      { id: 'y', kind: 'online', day: 'Thu', start: '10:00', end: '12:00' },
      { id: 'r', kind: 'busy', day: 'Thu', start: '11:15', end: '11:45' },
    ]);
    expect([cells['Thu-09:30'], cells['Thu-10:30'], cells['Thu-11:00'], cells['Thu-11:30'], cells['Thu-12:00']]).toEqual(['free', 'online', 'busy', 'busy', 'free']);
  });

  it('untouched days and every date window are kept exactly (same id, same odd times)', () => {
    const slots = [
      { id: 'odd', kind: 'busy', day: 'Mon', start: '09:15', end: '09:40' },
      { id: 'tue', kind: 'free', day: 'Tue', start: '10:00', end: '12:00' },
      { id: 'date', kind: 'busy', date: '2026-10-27', start: '10:00', end: '11:00' },
      { id: 'open', kind: 'open', date: '2026-10-26', start: '09:00', end: '10:00' },
    ];
    const cells = { ...cellsFromSlots(slots), 'Tue-12:00': 'free' };
    expect(changedDays(cellsFromSlots(slots), cells)).toEqual(['Tue']);
    const next = slotsFromCells(slots, cells, ['Tue'], ids);
    expect(next.filter((slot) => slot.id === 'odd' || slot.date)).toEqual([slots[0], slots[2], slots[3]]);
    expect(strip(next.filter((slot) => slot.day === 'Tue'))).toEqual([{ kind: 'free', start: '10:00', end: '12:30', day: 'Tue' }]);
  });

  it('a touched day keeps its time before 08:00 and after 22:00', () => {
    const slots = [{ id: 'long', kind: 'free', day: 'Sat', start: '07:00', end: '23:00' }];
    expect(outsideGrid(slots)).toHaveLength(1);
    const cells = cellsFromSlots(slots);
    delete cells['Sat-12:00'];
    const next = slotsFromCells(slots, cells, ['Sat'], ids);
    expect(strip(next)).toEqual([
      { kind: 'free', day: 'Sat', start: '07:00', end: '08:00' },
      { kind: 'free', day: 'Sat', start: '22:00', end: '23:00' },
      { kind: 'free', day: 'Sat', start: '08:00', end: '12:00' },
      { kind: 'free', day: 'Sat', start: '12:30', end: '22:00' },
    ]);
  });

  it('clearing a day removes its weekly windows; more than 200 windows is refused', () => {
    const slots = [{ id: 'a', kind: 'busy', day: 'Mon', start: '08:00', end: '22:00' }];
    expect(slotsFromCells(slots, {}, ['Mon'], ids)).toEqual([]);
    const many = Array.from({ length: 199 }, (_, index) => ({ id: `d${index}`, kind: 'busy', date: `2027-01-${String((index % 28) + 1).padStart(2, '0')}`, start: '08:00', end: '09:00' }));
    expect(() => slotsFromCells(many, { 'Mon-08:00': 'free', 'Mon-09:00': 'busy' }, ['Mon'], ids)).toThrow(/kuni 200/);
  });

  it('the saved windows mean the same to the calendar as the cells (availabilityAt)', () => {
    const cells = { 'Mon-10:00': 'free', 'Mon-10:30': 'free', 'Mon-11:00': 'online', 'Mon-11:30': 'busy' };
    const availability = { slots: slotsFromCells([], cells, undefined, ids) };
    // 2026-10-26 is a Monday, the day after the DST change in Tallinn
    expect(availabilityAt(availability, { date: '2026-10-26', time: '10:00', duration: 60 })).toBe('free');
    expect(availabilityAt(availability, { date: '2026-10-26', time: '10:30', duration: 60 })).toBe('online');
    expect(availabilityAt(availability, { date: '2026-10-26', time: '11:30', duration: 30 })).toBe('busy');
    expect(availabilityAt(availability, { date: '2026-03-30', time: '10:00', duration: 60 })).toBe('free');
  });

  it('dated windows from today on, sorted', () => {
    const slots = [{ id: 'b', date: '2026-11-02', start: '10:00', end: '11:00', kind: 'busy' }, { id: 'a', date: '2026-10-30', start: '09:00', end: '10:00', kind: 'free' }, { id: 'old', date: '2026-10-01', start: '09:00', end: '10:00', kind: 'free' }, { id: 'w', day: 'Mon', start: '09:00', end: '10:00', kind: 'free' }];
    expect(datedSlots(slots, '2026-10-24').map((slot) => slot.id)).toEqual(['a', 'b']);
  });
});

describe('lessons and a student on the teacher grid', () => {
  // the DST week in Tallinn: Sunday 2026-10-25 has 25 hours
  const week = ['2026-10-19', '2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24', '2026-10-25'];
  const events = [
    { id: 'w1', studentName: 'Mari', teacherUid: 't1', teacher: 'Pavel', recurring: true, startDate: '2026-10-05', day: 'Sun', time: '16:15', duration: 60, status: 'Planeeritud' },
    { id: 'o1', studentName: 'Jaan', teacherUid: 't1', teacher: 'Pavel', date: '2026-10-21', time: '09:00', duration: 45, online: true, status: 'Planeeritud' },
    { id: 'c1', studentName: 'Kati', teacherUid: 't1', teacher: 'Pavel', date: '2026-10-21', time: '12:00', duration: 60, status: 'Tühistatud' },
    { id: 'x1', studentName: 'Teine', teacherUid: 't2', teacher: 'Jelena', date: '2026-10-21', time: '12:00', duration: 60, status: 'Planeeritud' },
  ];

  it('places the week\'s lessons in their half hours, DST Sunday included; cancelled and other teachers\' lessons are left out', () => {
    const cells = lessonCells(events, week, { teacherUid: 't1', teacherName: 'Pavel' });
    expect(Object.keys(cells).sort()).toEqual(['Sun-16:00', 'Sun-16:30', 'Sun-17:00', 'Wed-09:00', 'Wed-09:30'].sort());
    expect(cells['Sun-16:00'][0]).toMatchObject({ label: '16:15 Mari', first: true, online: false });
    expect(cells['Sun-16:30'][0].first).toBe(false);
    expect(cells['Wed-09:00'][0].online).toBe(true);
  });

  it('a lesson in a red cell, or on site in a yellow one, is a clash', () => {
    expect(clashOf('busy', [{ online: true }])).toBe(true);
    expect(clashOf('online', [{ online: true }])).toBe(false);
    expect(clashOf('online', [{ online: false }])).toBe(true);
    expect(clashOf('free', [{ online: false }])).toBe(false);
    expect(clashOf('busy', [])).toBe(false);
  });

  it('a student\'s times map onto the same cells', () => {
    expect(studentCells({ slots: ['Mon-16:00', 'Mon-16:30'], preferred: ['Mon-16:30'] })).toEqual({ 'Mon-16:00': 'ok', 'Mon-16:30': 'best' });
    expect(studentCells(null)).toEqual({});
  });
});
