import { describe, expect, it } from 'vitest';
import { localDate } from './localDate.js';

describe('localDate', () => {
  it('is the local calendar day, not the UTC one', () => {
    const lateNight = new Date(2026, 9, 27, 0, 30); // 00:30 local
    expect(localDate(lateNight)).toBe('2026-10-27');
    expect(localDate(lateNight.getTime())).toBe('2026-10-27');
    expect(localDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
