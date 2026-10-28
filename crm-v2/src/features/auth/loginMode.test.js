import { describe, expect, it } from 'vitest';

describe('landing after sign-in', () => {
  it('keeps the wanted page only when the new account may open it', async () => {
    const { landingPath } = await import('./loginMode.js');
    expect(landingPath({ pathname: '/student' }, ['parent'])).toBe('/');
    expect(landingPath({ pathname: '/student' }, ['student'])).toBe('/student');
    expect(landingPath({ pathname: '/students/abc', search: '?tab=1' }, ['teacher'])).toBe('/students/abc?tab=1');
    expect(landingPath({ pathname: '/students/abc' }, ['student'])).toBe('/');
    expect(landingPath({ pathname: '/ai/connect', search: '?x=1' }, ['admin'])).toBe('/ai/connect?x=1');
    expect(landingPath(null, ['admin'])).toBe('/');
  });
});
