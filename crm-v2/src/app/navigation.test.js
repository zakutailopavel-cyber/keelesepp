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

  it('gives a pure student and a pure parent their own menu and keeps the full one for staff', () => {
    // owner 2026-11-09 „Täna”: Täna · Ülesanded · Suhtlus, then everything else under „Rohkem”
    expect(navigationFor(['student']).map((item) => item.label)).toEqual(['Täna', 'Ülesanded', 'Suhtlus', 'Sõnad', 'Minu vead', 'Kursus', 'Lemmik', 'Minu areng', 'Tahvel']);
    expect(studentNavigation.filter((item) => !item.group).map((item) => item.to)).toEqual(['/student', '/homework', '/messages']);
    expect(new Set(studentNavigation.filter((item) => item.group).map((item) => item.group))).toEqual(new Set(['Rohkem']));
    expect(navigationFor(['student'])).toBe(studentNavigation);
    expect(studentNavigation.map((item) => item.to)).toContain('/board');
    expect(navigationFor(['student', 'parent'])).toBe(navigation);
    expect(navigationFor(['teacher'])).toBe(navigation);
    expect(navigationFor(['parent']).map((item) => item.label)).toEqual(['Minu pere', 'Ülesanded', 'Suhtlus', 'Tahvel']);
    expect(navigationFor(['parent', 'teacher'])).toBe(navigation);
  });
});
