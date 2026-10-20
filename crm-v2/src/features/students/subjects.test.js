import { itemSubject, onlySubject, subjectName, subjectsOf, tracksOf } from './subjects.js';

const stefania = { id: 's1', subject: 'Eesti keel', teacher: 'Pavel', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1' }, { subject: 'matemaatika', teacher: 'Yelyzaveta', teacherUid: 'y1' }] };

describe('subjects of a card', () => {
  it('reads old and new cards the same way', () => {
    expect(subjectName('Inglise Keel')).toBe('Inglise keel');
    expect(tracksOf({ subject: 'Matemaatika', teacher: 'Y' })).toEqual([{ subject: 'Matemaatika', teacher: 'Y', teacherUid: '', level: '' }]);
    expect(subjectsOf([stefania, { subject: 'Inglise keel' }])).toEqual(['Eesti keel', 'Matemaatika', 'Inglise keel']);
  });

  it('places a record by its own subject, else by its teacher, else by the only subject', () => {
    expect(itemSubject({ subject: 'Matemaatika' }, stefania)).toBe('Matemaatika');
    expect(itemSubject({ teacherUid: 'y1' }, stefania)).toBe('Matemaatika');
    expect(itemSubject({ teacher: 'Pavel' }, stefania)).toBe('Eesti keel');
    expect(itemSubject({}, stefania)).toBe('');
    expect(itemSubject({}, { subject: 'Inglise keel' })).toBe('Inglise keel');
    const items = [{ id: 'a', teacherUid: 'p1' }, { id: 'b', subject: 'Matemaatika' }];
    expect(onlySubject(items, 'Matemaatika', () => stefania).map((item) => item.id)).toEqual(['b']);
    expect(onlySubject(items, '', () => stefania)).toHaveLength(2);
  });
});
