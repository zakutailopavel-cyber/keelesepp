import { navigation, settingsNavigation } from './navigation.js';

describe('application navigation roles', () => {
  it('exposes the learning library only to administrators and teachers', () => {
    expect(navigation.find((item) => item.to === '/library')?.roles).toEqual(['admin', 'teacher']);
    expect(navigation.find((item) => item.to === '/groups')?.roles).toEqual(['admin', 'teacher']);
    expect(navigation.find((item) => item.to === '/parents')?.roles).toEqual(['admin', 'teacher']);
    expect(navigation.find((item) => item.to === '/parent')?.roles).toEqual(['parent']);
    expect(navigation.find((item) => item.to === '/student')?.roles).toEqual(['student']);
    expect(settingsNavigation.roles).toEqual(expect.arrayContaining(['admin', 'teacher', 'student', 'parent', 'finance']));
  });
});
