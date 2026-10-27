import { describe, expect, it } from 'vitest';
import { leadStudentIds, timesFromLeads, withLeadTimes } from './leadTimes.js';

const students = [
  { id: 'a', name: 'Anna Tamm', parentEmail: 'ema@kool.test', parentPhone: '+372 5555 1111' },
  { id: 'a2', name: 'Tamm Anna', subject: 'Matemaatika', parentEmail: 'ema@kool.test' },
  { id: 'b', name: 'Boris Tamm', parentEmail: 'ema@kool.test', parentPhone: '5555 1111' },
  { id: 'c', name: 'Cärol Kask', email: 'carol@kool.test' },
  { id: 'old', name: 'Vana Õpilane', active: false },
];

describe('/ajad answers on the student cards', () => {
  it('finds the card by the learner name (all cards of that person), else by a contact of one person only', () => {
    expect(leadStudentIds({ name: ' anna  TAMM ', email: 'ema@kool.test' }, students)).toEqual(['a', 'a2']);
    expect(leadStudentIds({ name: 'Carol', email: 'CAROL@kool.test' }, students)).toEqual(['c']);
    expect(leadStudentIds({ name: 'Keegi', phone: '55551111' }, students)).toEqual([]); // two children share the phone
    expect(leadStudentIds({ name: 'Vana Õpilane' }, students)).toEqual([]);
  });

  it('uses the newest answer when the card has no times or older ones', () => {
    const leads = [
      { id: 'l1', source: 'availability', name: 'Cärol Kask', slots: ['Mon-16:00'], preferred: ['Mon-16:00', 'Tue-10:00'], createdAt: '2026-10-20T10:00:00Z' },
      { id: 'l2', source: 'availability', name: 'Cärol Kask', slots: ['Wed-17:00'], createdAt: '2026-10-26T10:00:00Z' },
      { id: 'l3', source: 'availability', name: 'Boris Tamm', slots: ['Fri-15:00'], createdAt: '2026-10-21T10:00:00Z' },
      { id: 'l4', source: 'level-test', name: 'Anna Tamm', slots: ['Fri-15:00'] },
    ];
    const fromLeads = timesFromLeads(leads, students);
    expect(fromLeads.get('c')).toMatchObject({ slots: ['Wed-17:00'], leadId: 'l2', fromLead: true });
    expect(fromLeads.has('a')).toBe(false);
    const own = new Map([['b', { studentId: 'b', slots: ['Sat-10:00'], changedAt: '2026-10-25T00:00:00Z' }]]);
    const merged = withLeadTimes(own, fromLeads);
    expect(merged.get('b').slots).toEqual(['Sat-10:00']);
    expect(merged.get('c').slots).toEqual(['Wed-17:00']);
  });
});
