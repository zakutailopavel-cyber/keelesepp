import { isNonTeachingStaff } from './teachers.js';

describe('teacher pickers leave out admins who do not teach', () => {
  it('leaves out the accountant and an admin without the teacher role', () => {
    expect(isNonTeachingStaff({ role: 'admin', roles: ['admin', 'finance'] })).toBe(true);
    expect(isNonTeachingStaff({ role: 'admin' })).toBe(true);
  });

  it('keeps everyone with the teacher role', () => {
    expect(isNonTeachingStaff({ role: 'teacher' })).toBe(false);
    expect(isNonTeachingStaff({ role: 'teacher', roles: ['finance'] })).toBe(false);
    expect(isNonTeachingStaff({ role: 'admin', roles: ['admin', 'teacher'] })).toBe(false);
  });
});
