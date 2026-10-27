import { describe, expect, it } from 'vitest';
import { groupGaps } from './groupCheck.js';

describe('Mis grupil puudub', () => {
  it('lists what the group still misses, the open points first', () => {
    const group = { name: 'Mudilased', teacher: 'Anhelina', teacherUid: 't1', capacity: 5, audience: 'preschool', ageFrom: 5, ageTo: 7, lessons: [] };
    const members = [
      { id: 'a', name: 'Daniel', birthYear: 2019, parentPhone: '555', groupInterest: { status: 'interested' } },
      { id: 'b', name: 'Artem', birthYear: 2015, active: false, groupInterest: { status: 'contact' } },
    ];
    const gaps = groupGaps(group, members, { studentTimes: new Map([['a', { slots: ['Mon-16:00'] }]]), year: 2026 });
    expect(gaps.filter((item) => !item.ok).map((item) => item.text)).toEqual([
      'Tunniajad puuduvad — lisa aeg',
      'Nõus (huvitatud): 1/2',
      '1 endist õpilast (arhiivis) — taasta, kui nad tulevad',
      '1 väljaspool vanust 5–7: Artem',
      '1 õpilase sobivad ajad teadmata',
      '1 õpilasel puuduvad kontaktid: Artem',
    ]);
    expect(gaps.find((item) => item.key === 'seats')).toMatchObject({ ok: true, text: '2/5 kohta' });
    expect(groupGaps({ ...group, capacity: 1 }, members).find((item) => item.key === 'seats').text).toBe('Liiga palju õpilasi: 2/1 kohta');
  });
});
