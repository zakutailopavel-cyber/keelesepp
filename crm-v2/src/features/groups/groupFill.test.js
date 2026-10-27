import { describe, expect, it } from 'vitest';
import { ageOf, audienceOf, capacityOf, freeSeats, groupCandidates, nextDateOf } from './groupFill.js';
import { groupSettings } from '../../services/firebase/groups.js';

const today = '2026-10-27'; // a Tuesday
const halves = (day, from, to) => { const out = []; for (let at = from * 60; at < to * 60; at += 30) out.push(`${day}-${String(Math.floor(at / 60)).padStart(2, '0')}:${at % 60 ? '30' : '00'}`); return out; };

describe('group fill', () => {
  it('reads the age from the birth year, the school class or words on the card', () => {
    expect(ageOf({ birthYear: 2020 }, 2026)).toBe(6);
    expect(ageOf({ grade: '5. klass' }, 2026)).toBe(11);
    expect(ageOf({ grade: 'Täiskasvanu' }, 2026)).toBe(18);
    expect(ageOf({ grade: 'lasteaed' }, 2026)).toBe(6);
    expect(ageOf({}, 2026)).toBeNull();
    expect(audienceOf({ birthYear: 2020 }, 2026)).toBe('preschool');
    expect(audienceOf({ adult: false })).toBe('child');
    expect(nextDateOf('Thu', today)).toBe('2026-10-29');
  });

  it('counts seats: 6 for preschool, 8 otherwise, or the group own number', () => {
    expect(capacityOf({ audience: 'preschool' })).toBe(6);
    expect(freeSeats({ capacity: 3, students: ['a', 'b'] })).toBe(1);
    expect(groupSettings({ audience: 'adult', capacity: '99', ageFrom: 5 })).toEqual({ audience: 'adult', capacity: null, ageFrom: null, ageTo: null });
  });

  it('ranks students and enquiries: subject, age group, level, the group times, clashes', () => {
    const group = { id: 'g1', subject: 'Eesti keel', level: 'A2', audience: 'school', students: ['in'], lessons: [{ id: 'l1', day: 'Thu', time: '16:00', duration: 60 }] };
    const students = [
      { id: 'in', name: 'Juba', subject: 'Eesti keel', level: 'A2', grade: '5. klass' },
      { id: 'best', name: 'Anna', subject: 'Eesti keel', level: 'A2', grade: '6. klass' },
      { id: 'near', name: 'Boris', subject: 'Eesti keel', level: 'B1', grade: '7. klass' },
      { id: 'far', name: 'Cäro', subject: 'Eesti keel', level: 'C1', grade: '7. klass' },
      { id: 'adult', name: 'Dora', subject: 'Eesti keel', level: 'A2', grade: 'Täiskasvanu' },
      { id: 'math', name: 'Eero', subject: 'Matemaatika', level: 'A2', grade: '6. klass' },
      { id: 'busy', name: 'Fred', subject: 'Eesti keel', level: 'A2', grade: '6. klass' },
    ];
    const studentTimes = new Map([['best', { slots: halves('Thu', 15, 18), preferred: halves('Thu', 16, 17) }], ['near', { slots: halves('Thu', 16, 17), preferred: [], learned: true }]]);
    const events = [{ id: 'own', studentId: 'busy', date: '2026-10-29', time: '16:30', duration: 45 }];
    const leads = [{ id: 'lead', name: 'Gert', parentName: 'Ema', adult: false, level: 'Määramata', status: 'new', phone: '5551234', slots: halves('Thu', 16, 17) }, { id: 'old', name: 'H', status: 'closed' }];
    const result = groupCandidates({ group, students, leads, studentTimes, events, today });
    expect(result.students.map((item) => item.id)).toEqual(['best', 'near', 'busy']);
    expect(result.students[0]).toMatchObject({ fit: 'good' });
    expect(result.students[0].reasons).toContain('grupi aeg on ★ eelistatud');
    expect(result.students[1].reasons.join(' ')).toMatch(/naabertase.*varasemate tundide järgi/);
    expect(result.students[2]).toMatchObject({ fit: 'weak' });
    expect(result.students[2].reasons.join(' ')).toMatch(/kattub: oma tund/);
    expect(result.leads).toEqual([expect.objectContaining({ id: 'lead', name: 'Gert (Ema)', contact: '5551234' })]);
  });

  it('a preschool group asks no level and keeps to the ages', () => {
    const group = { id: 'g2', subject: 'Eesti keel', level: 'A1', audience: 'preschool', ageFrom: 5, ageTo: 7, students: [], lessons: [] };
    const students = [{ id: 'k', name: 'Kai', birthYear: 2020, level: 'B2' }, { id: 'o', name: 'Oskar', birthYear: 2016 }, { id: 'u', name: 'Uku' }];
    const result = groupCandidates({ group, students, today });
    expect(result.students.map((item) => item.id)).toEqual(['k', 'u']);
    expect(result.students[1].reasons).toContain('vanus teadmata');
  });
});
