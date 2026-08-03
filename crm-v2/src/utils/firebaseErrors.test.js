import { firebaseErrorMessage } from './firebaseErrors.js';

describe('Firebase error messages', () => {
  it('turns infrastructure codes into user-facing Estonian', () => {
    expect(firebaseErrorMessage({ code: 'permission-denied' })).toContain('ligipääs');
    expect(firebaseErrorMessage({ code: 'unavailable' })).toContain('kättesaadav');
  });

  it('preserves an intentional domain error message', () => {
    expect(firebaseErrorMessage({ code: 'students/duplicate', message: 'Duplikaat' })).toBe('Duplikaat');
  });
});
