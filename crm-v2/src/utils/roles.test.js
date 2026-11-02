import { hasAnyRole, normalizeRoles, roleLabels } from './roles.js';

describe('role access helpers', () => {
  it('normalizes profile and token roles without duplicates', () => {
    expect(normalizeRoles({ role: 'Teacher', roles: ['admin'] }, { role: 'teacher', roles: ['finance'] })).toEqual(['teacher', 'finance']);
  });

  it('keeps the existing server-side super administrator identity aligned in the UI', () => {
    expect(normalizeRoles(
      { role: 'teacher' },
      {},
      { email: 'zakutailo.pavel@gmail.com' },
    )).toEqual(['teacher', 'admin']);
  });

  it('requires at least one allowed role', () => {
    expect(hasAnyRole(['teacher'], ['admin', 'teacher'])).toBe(true);
    expect(hasAnyRole(['student'], ['admin', 'teacher'])).toBe(false);
  });
});

describe('roleLabels', () => {
  it('shows roles as words and keeps an unknown role as it is', () => {
    expect(roleLabels(['parent', 'teacher', 'other'])).toBe('Lapsevanem, Õpetaja, other');
    expect(roleLabels([])).toBe('');
  });
});
