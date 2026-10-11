import { registrationProfile, validatePassword } from './auth.js';

describe('self-registration profile', () => {
  const now = new Date(2026, 8, 29, 10, 0, 0);

  it('builds the same profile shape as the legacy CRM for a parent', () => {
    const profile = registrationProfile({ role: 'parent', displayName: ' Mari Maasikas ', email: 'mari@example.ee', childName: 'Kati, Mati', preferredTeacher: 'Jelena', acceptedTerms: true }, now);
    expect(profile).toEqual({
      role: 'parent', displayName: 'Mari Maasikas', email: 'mari@example.ee', childName: 'Kati, Mati', preferredTeacher: '',
      createdAt: '2026-09-29', termsAcceptedAt: now.toISOString(), termsVersion: '2025-08-10', approvalStatus: 'pending',
    });
  });

  it('does not keep parent-only fields for a student and never takes a teacher from the registering person', () => {
    expect(registrationProfile({ role: 'student', displayName: 'Kati', email: 'k@example.ee', childName: 'x', acceptedTerms: true }, now))
      .toMatchObject({ childName: '', preferredTeacher: '' });
    expect(registrationProfile({ role: 'parent', displayName: 'M', email: 'm@example.ee', childName: 'Kati', preferredTeacher: 'Jelena', acceptedTerms: true }, now).preferredTeacher).toBe('');
  });

  it('requires the child name from a parent', () => {
    expect(() => registrationProfile({ role: 'parent', displayName: 'M', email: 'm@example.ee', childName: '  ', acceptedTerms: true }, now)).toThrow(/lapse nimi/);
  });

  it('never creates staff accounts and requires the terms', () => {
    expect(() => registrationProfile({ role: 'teacher', displayName: 'T', email: 't@example.ee', acceptedTerms: true })).toThrow(/administraator/);
    expect(() => registrationProfile({ role: 'admin', displayName: 'A', email: 'a@example.ee', acceptedTerms: true })).toThrow(/administraator/);
    expect(() => registrationProfile({ role: 'parent', displayName: 'M', email: 'm@example.ee', childName: 'Kati' })).toThrow(/tingimustega/);
    expect(() => registrationProfile({ role: 'parent', displayName: ' ', email: 'm@example.ee', childName: 'Kati', acceptedTerms: true })).toThrow(/Nimi/);
  });

  it('checks the password like the legacy form', () => {
    expect(validatePassword('')).toMatch(/kohustuslik/);
    expect(validatePassword('12345', '12345')).toMatch(/6/);
    expect(validatePassword('123456', '1234567')).toMatch(/ei ühti/);
    expect(validatePassword('123456', '123456')).toBe('');
  });
});
