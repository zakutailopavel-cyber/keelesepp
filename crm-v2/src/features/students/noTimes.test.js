import { describe, expect, it } from 'vitest';
import { ajadMessage, contactsText, studentsWithoutTimes } from './noTimes.js';

describe('Ilma ajata', () => {
  it('lists active students with neither own times nor a joined /ajad answer, with contacts', () => {
    const students = [
      { id: 'a', name: 'Anna Tamm', teacher: 'Pavel', parentName: 'Mari', parentPhone: '5551 111' },
      { id: 'b', name: 'Boris Kask', teacher: 'Pavel' },
      { id: 'c', name: 'Cärol Lepp', teacher: 'Elena', email: 'c@kool.test' },
      { id: 'd', name: 'Dora', active: false },
    ];
    const rows = studentsWithoutTimes({ students, own: [{ studentId: 'b', slots: ['Mon-16:00'] }], leads: [{ id: 'l', source: 'availability', name: 'Cärol Lepp', slots: ['Tue-10:00'], createdAt: '2026-10-20' }], lessons: [{ studentId: 'a', date: '2026-10-01', status: 'Toimunud' }] });
    expect(rows).toEqual([{ id: 'a', name: 'Anna Tamm', teacher: 'Pavel', level: '', parentName: 'Mari', phone: '5551 111', email: '', lastLesson: '2026-10-01' }]);
    expect(contactsText(rows)).toBe('Anna Tamm · vanem Mari · 5551 111 · Pavel');
    expect(ajadMessage('https://crm.epkoolitus.ee/ajad')).toMatch(/Tere![\s\S]*Здравствуйте![\s\S]*\/ajad/);
  });
});
