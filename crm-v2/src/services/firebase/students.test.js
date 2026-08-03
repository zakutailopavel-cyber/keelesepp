import { matchesStudentFilters, normalizeStudent, sortStudents, studentProfileKey } from './students.js';

describe('students service mapping', () => {
  it('preserves legacy fields and normalizes missing values', () => {
    expect(normalizeStudent('s1', { name: '  Mari  ', active: false, skillMap: { reading: 75 } })).toMatchObject({ id: 's1', name: 'Mari', active: false, subject: 'Eesti keel', skillMap: { reading: 75 } });
  });

  it('treats legacy records without active as active', () => {
    expect(normalizeStudent('legacy', { name: 'Jaan' }).active).toBe(true);
  });

  it('scopes a teacher to their own students across legacy aliases', () => {
    expect(matchesStudentFilters({ teacher: 'Pavel' }, { scopeTeacher: 'Pavel Zakutailo' })).toBe(true);
    expect(matchesStudentFilters({ teacher: 'Jelena' }, { scopeTeacher: 'Pavel Zakutailo' })).toBe(false);
    expect(matchesStudentFilters({ teacher: 'Pavel Zakutailo' }, { teacher: 'Pavel' })).toBe(true);
  });

  it('sorts a descending name page consistently', () => {
    expect(sortStudents([{ name: 'Anna' }, { name: 'Mari' }], 'name-desc').map((item) => item.name)).toEqual(['Mari', 'Anna']);
  });

  it('builds the same duplicate key for normalized legacy contact data', () => {
    const left = studentProfileKey({ name: ' Mari ', email: 'PARENT@EXAMPLE.COM', parentName: ' Kati ', subject: 'Eesti keel', teacher: 'Pavel' });
    const right = studentProfileKey({ name: 'mari', parentEmail: 'parent@example.com', parentName: 'kati', subject: 'eesti keel', teacher: 'pavel' });
    expect(left).toBe(right);
  });
});
