import { describe, expect, it } from 'vitest';
import { contactRows, filterContacts } from './groupContacts.js';

const today = '2026-10-27';
const students = [
  { id: 'a', name: 'Anna Tamm', active: true, grade: '6. klass', subject: 'Eesti keel', level: 'A2', parentName: 'Mari Tamm', parentPhone: '5551 111', parentEmail: 'mari@kool.test', groupInterest: { status: 'offered', note: 'helistan reedel' } },
  { id: 'b', name: 'Boris', active: true, birthYear: 2020, subject: 'Eesti keel', level: 'A1', phone: '5552 222' },
  { id: 'c', name: 'Cärol', active: false, grade: 'Täiskasvanu', subject: 'Inglise keel', level: 'B1', email: 'c@kool.test' },
  { id: 'p', name: 'Vanem', convertedToParent: true },
];
const events = [{ id: 'w', studentId: 'a', recurring: true, day: 'Wed', startDate: '2026-09-02', time: '16:00' }];
const journal = [{ studentId: 'c', date: '2026-06-10', status: 'Toimunud' }];
const leads = [{ id: 'l1', name: 'Dora', parentName: 'Ema', adult: false, phone: '5553 333', level: 'Määramata', status: 'new', slots: ['Mon-16:00'], createdAt: '2026-10-20T10:00:00Z' }, { id: 'l2', name: 'X', status: 'closed' }];
const groups = [{ id: 'g1', name: 'Mudilased', students: ['b'] }];

describe('Kellele pakkuda grupitunde', () => {
  const rows = contactRows({ students, leads, events, journal, groups, today });

  it('lists current and former cards and open enquiries with age, contacts, lessons and the offer', () => {
    expect(rows.map((row) => row.id)).toEqual(['a', 'b', 'c', 'l1']);
    expect(rows[0]).toMatchObject({ age: 12, audience: 'school', parentName: 'Mari Tamm', phone: '5551 111', email: 'mari@kool.test', lessonsAhead: true, interest: { status: 'offered' } });
    expect(rows[1]).toMatchObject({ audience: 'preschool', group: 'Mudilased', lessonsAhead: false });
    expect(rows[2]).toMatchObject({ active: false, lastLesson: '2026-06-10', audience: 'adult' });
    expect(rows[3]).toMatchObject({ kind: 'lead', audience: 'child', hasTimes: true, level: '' });
  });

  it('filters by who, age group, subject, level, offer and text', () => {
    const ids = (filters) => filterContacts(rows, filters).map((row) => row.id);
    expect(ids({ who: 'noLessons' })).toEqual(['c']); // a has lessons, b is in a group; c (former, no lessons) can be offered
    expect(ids({ who: 'former' })).toEqual(['c']);
    expect(ids({ who: 'leads' })).toEqual(['l1']);
    expect(ids({ audience: 'preschool' })).toEqual(['b', 'l1']); // an enquiry child of unknown age stays in
    expect(ids({ subject: 'inglise keel' })).toEqual(['c']);
    expect(ids({ level: 'A2' })).toEqual(['a']);
    expect(ids({ interest: 'offered' })).toEqual(['a']);
    expect(ids({ query: 'mari' })).toEqual(['a']);
  });
});
