import { isAccountantOnly } from './teachers.js';

describe('teacher pickers leave out the accountant', () => {
  it('treats an admin with the finance role as the accountant', () => {
    expect(isAccountantOnly({ role: 'admin', roles: ['admin', 'finance'] })).toBe(true);
  });

  it('keeps teachers and admins who teach', () => {
    expect(isAccountantOnly({ role: 'teacher' })).toBe(false);
    expect(isAccountantOnly({ role: 'admin' })).toBe(false);
    expect(isAccountantOnly({ role: 'teacher', roles: ['finance'] })).toBe(false);
    expect(isAccountantOnly({ role: 'admin', roles: ['admin', 'finance', 'teacher'] })).toBe(false);
  });
});
