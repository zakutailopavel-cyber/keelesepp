import { canonicalTeacherName, isSameTeacher, teachesStudent, tracksTaughtBy } from './teachers.js';

describe('legacy teacher names', () => {
  it('normalizes short and full legacy aliases', () => {
    expect(canonicalTeacherName('Pavel')).toBe('Pavel Zakutailo');
    expect(canonicalTeacherName('Jelena Zakutailo')).toBe('Elena Zakutailo');
    expect(isSameTeacher('Elizaveta', 'Yelyzaveta Lukiianchuk')).toBe(true);
  });

  it('preserves unknown teacher names', () => {
    expect(canonicalTeacherName('  Mari Maas  ')).toBe('Mari Maas');
  });
});

describe('whose student is this (one rule for the student list and the teacher pages)', () => {
  const pavel = { id: 'pav', name: 'Pavel Zakutailo' };
  const jegor = { id: 'jeg', name: 'Jegor Fjodorov' };
  it('follows the active study tracks, not the stale main teacher or old access ids', () => {
    // Mykyta-like card: the track says Pavel, an old main teacher and an old access id say someone else
    const card = { teacher: 'Anhelina Korotka', teacherUid: 'ang', teacherUids: ['ang', 'pav'], enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel Zakutailo', teacherUid: 'pav' }] };
    expect(teachesStudent(card, pavel)).toBe(true);
    expect(teachesStudent(card, { id: 'ang', name: 'Anhelina Korotka' })).toBe(false);
  });
  it('knows a short name and a card without tracks; an inactive track does not count', () => {
    expect(teachesStudent({ enrollments: [{ teacher: 'Jegor' }] }, jegor)).toBe(true);
    expect(teachesStudent({ teacher: 'Pavel', teacherUid: 'pav' }, pavel)).toBe(true);
    expect(teachesStudent({ enrollments: [{ teacherUid: 'pav' }] }, pavel)).toBe(true);
    expect(teachesStudent({ enrollments: [{ teacher: 'Pavel Zakutailo', active: false }] }, pavel)).toBe(false);
    const two = { enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'Inglise keel', teacher: 'Jegor Fjodorov' }] };
    expect(tracksTaughtBy(two, jegor).map((track) => track.subject)).toEqual(['Inglise keel']);
  });
});
