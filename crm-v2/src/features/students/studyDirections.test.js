import { activeDirections, canonicalSubject, directionId, directionList, directionPayload, findDirection, levelOptions, parseList, subjectOptions, subjectUsage } from './studyDirections.js';

const stored = [
  { id: 'eesti-keel', name: 'Eesti keel', levels: ['A1', 'A2', 'B1'], status: 'active', order: 1 },
  { id: 'matemaatika', name: 'Matemaatika', levels: ['1. klass', '2. klass'], aliases: ['Muu', 'matem'], status: 'active', order: 2 },
  { id: 'vene-keel', name: 'Vene keel', status: 'archived', order: 3 },
];

describe('study directions', () => {
  it('uses the built-in list until the school saves its own', () => {
    const fallback = directionList([]);
    expect(fallback.map((d) => d.name)).toEqual(['Eesti keel', 'Inglise keel', 'Matemaatika', 'Emakeel', 'Vene keel']);
    expect(fallback.every((d) => d.fallback)).toBe(true);
    expect(directionList(stored).map((d) => d.name)).toEqual(['Eesti keel', 'Matemaatika', 'Vene keel']);
  });

  it('matches old spellings and aliases, keeps unknown values as they are', () => {
    expect(findDirection('matemaatika', stored).name).toBe('Matemaatika');
    expect(canonicalSubject('MUU', stored)).toBe('Matemaatika');
    expect(canonicalSubject('kunst', stored)).toBe('Kunst');
    expect(findDirection('Vene keel', stored).status).toBe('archived');
  });

  it('offers active directions plus the card\'s own unknown value; levels follow the direction', () => {
    expect(activeDirections(stored).map((d) => d.name)).toEqual(['Eesti keel', 'Matemaatika']);
    expect(subjectOptions(stored, ['Kunst', 'Vene keel'])).toEqual(['Eesti keel', 'Matemaatika', 'Kunst']);
    expect(levelOptions('Matemaatika', stored)).toEqual(['', '1. klass', '2. klass']);
    expect(levelOptions('Kunst', stored, 'B2')).toEqual(['', 'Eelkool', 'A1', 'A2', 'B1', 'B2', 'C1']);
    expect(levelOptions('Eesti keel', stored, 'C1')).toEqual(['', 'A1', 'A2', 'B1', 'C1']);
  });

  it('builds the stored record the rules accept', () => {
    const payload = directionPayload({ name: ' keemia ', shortLabel: 'kemia1', color: 'blue', levels: ['8. klass'], status: 'x' }, { uid: 'admin', displayName: 'Admin' }, 4);
    expect(payload).toMatchObject({ name: 'Keemia', shortLabel: 'KEMIA1', color: '', levels: ['8. klass'], aliases: [], status: 'active', order: 4, updatedByUid: 'admin' });
    expect(Object.keys(payload).sort()).toEqual(['aliases', 'color', 'levels', 'name', 'order', 'shortLabel', 'status', 'updatedAt', 'updatedByName', 'updatedByUid']);
    expect(() => directionPayload({ name: '' }, {})).toThrow('kohustuslik');
    expect(directionId('Eesti keel (täiskasvanud)')).toBe('eesti-keel-taiskasvanud');
    expect(parseList('A1, a1; B1\n\nB2')).toEqual(['A1', 'B1', 'B2']);
  });

  it('counts the cards per direction (active tracks of open cards)', () => {
    const counts = subjectUsage([
      { id: '1', subject: 'Eesti keel', enrollments: [{ subject: 'Eesti keel' }, { subject: 'Muu' }, { subject: 'Kunst', status: 'ended', active: false }] },
      { id: '2', subject: 'eesti keel' },
      { id: '3', subject: 'Eesti keel', active: false },
      { id: '4', subject: 'Matemaatika', mergedInto: '1' },
    ], stored);
    expect(Object.fromEntries(counts)).toEqual({ 'Eesti keel': 2, Matemaatika: 1 });
  });
});
