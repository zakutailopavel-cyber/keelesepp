import { canonicalTeacherName, isSameTeacher } from './teachers.js';

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
