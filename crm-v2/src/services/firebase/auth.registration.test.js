import { registrationProfile, validatePassword } from './auth.js';

describe('self-registration profile', () => {
  const now = new Date(2026, 8, 29, 10, 0, 0);

  it('builds the same profile shape as the legacy CRM for a parent', () => {
    const profile = registrationProfile({ role: 'parent', displayName: ' Mari Maasikas ', email: 'mari@example.ee', childName: 'Kati, Mati', preferredTeacher: 'Jelena', acceptedTerms: true }, now);
    expect(profile).toEqual({
      role: 'parent', displayName: 'Mari Maasikas', email: 'mari@example.ee', childName: 'Kati, Mati', preferredTeacher: 'Jelena',
      createdAt: '2026-09-29', termsAcceptedAt: now.toISOString(), termsVersion: '2025-08-10', approvalStatus: 'pending',
    });
  });

  it('does not keep parent-only fields for a student and falls back to a known teacher', () => {
    expect(registrationProfile({ role: 'student', displayName: 'Kati', email: 'k@example.ee', childName: 'x', acceptedTerms: true }, now))
      .toMatchObject({ childName: '', preferredTeacher: '' });
    expect(registrationProfile({ role: 'parent', displayName: 'M', email: 'm@example.ee', preferredTeacher: 'Hacker', acceptedTerms: true }, now).preferredTeacher).toBe('Pavel');
  });

  it('never creates staff accounts and requires the terms', () => {
    expect(() => registrationProfile({ role: 'teacher', displayName: 'T', email: 't@example.ee', acceptedTerms: true })).toThrow(/administraator/);
    expect(() => registrationProfile({ role: 'admin', displayName: 'A', email: 'a@example.ee', acceptedTerms: true })).toThrow(/administraator/);
    expect(() => registrationProfile({ role: 'parent', displayName: 'M', email: 'm@example.ee' })).toThrow(/tingimustega/);
    expect(() => registrationProfile({ role: 'parent', displayName: ' ', email: 'm@example.ee', acceptedTerms: true })).toThrow(/Nimi/);
  });

  it('checks the password like the legacy form', () => {
    expect(validatePassword('')).toMatch(/kohustuslik/);
    expect(validatePassword('12345', '12345')).toMatch(/6/);
    expect(validatePassword('123456', '1234567')).toMatch(/ei ühti/);
    expect(validatePassword('123456', '123456')).toBe('');
  });
});
