import { hasDuplicateStudent, matchesStudentFilters, normalizeStudent, sortStudents, studentProfileKey } from './students.js';

describe('students service mapping', () => {
  it('preserves legacy fields and normalizes missing values', () => {
    expect(normalizeStudent('s1', { name: '  Mari  ', active: false, skillMap: { reading: 75 } })).toMatchObject({ id: 's1', name: 'Mari', active: false, subject: 'Eesti keel', skillMap: { reading: 75 } });
  });

  it('treats legacy records without active as active', () => {
    expect(normalizeStudent('legacy', { name: 'Jaan' }).active).toBe(true);
  });

  it('shows legacy teacher spellings as one canonical person', () => {
    expect(normalizeStudent('short', { teacher: 'Pavel' }).teacher).toBe('Pavel Zakutailo');
    expect(normalizeStudent('long', { teacher: 'Pavel Zakutailo' }).teacher).toBe('Pavel Zakutailo');
    expect(normalizeStudent('old-spelling', { teacher: 'Elizaveta' }).teacher).toBe('Yelyzaveta Lukiianchuk');
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

  it('rejects a duplicate identity while excluding the record being edited', () => {
    const candidate = normalizeStudent('editing', { name: 'Mari', email: 'parent@example.com', parentName: 'Kati', teacher: 'Pavel' });
    const records = [
      normalizeStudent('editing', { name: 'Mari', email: 'parent@example.com', parentName: 'Kati', teacher: 'Pavel' }),
      normalizeStudent('duplicate', { name: ' mari ', parentEmail: 'PARENT@EXAMPLE.COM', parentName: 'kati', teacher: 'Pavel Zakutailo' }),
    ];

    expect(hasDuplicateStudent(records, candidate, 'editing')).toBe(true);
    expect(hasDuplicateStudent(records.slice(0, 1), candidate, 'editing')).toBe(false);
  });
});
