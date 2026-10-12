import { navigation, navigationFor, settingsNavigation, studentNavigation } from './navigation.js';

describe('application navigation roles', () => {
  it('exposes the learning library only to administrators and teachers', () => {
    expect(navigation.find((item) => item.to === '/library')?.roles).toEqual(['admin', 'teacher']);
    expect(navigation.find((item) => item.to === '/groups')?.roles).toEqual(['admin', 'teacher']);
    expect(navigation.find((item) => item.to === '/parents')?.roles).toEqual(['admin', 'teacher']);
    expect(navigation.find((item) => item.to === '/parent')?.roles).toEqual(['parent']);
    expect(navigation.find((item) => item.to === '/student')?.roles).toEqual(['student']);
    expect(settingsNavigation.roles).toEqual(expect.arrayContaining(['admin', 'teacher', 'student', 'parent', 'finance']));
  });

  it('gives a pure student the short menu and keeps the full one for staff and parents', () => {
    expect(navigationFor(['student']).map((item) => item.label)).toEqual(['Minu õpingud', 'Ülesanded', 'Sõnavara', 'Tund', 'Suhtlus']);
    expect(navigationFor(['student'])).toBe(studentNavigation);
    expect(navigationFor(['student', 'parent'])).toBe(navigation);
    expect(navigationFor(['teacher'])).toBe(navigation);
  });
});
