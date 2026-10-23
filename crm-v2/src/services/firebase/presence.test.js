import { describe, expect, it } from 'vitest';
import { nextPractice, shouldMarkSeen, SEEN_EVERY_MS } from './presence.js';

const now = Date.parse('2026-10-23T12:00:00Z');
const student = (profile = {}) => ({ uid: 'u1', roles: ['student'], approvalStatus: 'approved', profile: { displayName: 'Mari', ...profile } });

describe('presence', () => {
  it('marks a student or parent seen at most every 6 hours, never staff, waiting or profile-less accounts', () => {
    expect(shouldMarkSeen(student(), now)).toBe(true);
    expect(shouldMarkSeen(student({ lastSeenAt: { toMillis: () => now - 3600000 } }), now)).toBe(false);
    expect(shouldMarkSeen(student({ lastSeenAt: { toMillis: () => now - SEEN_EVERY_MS } }), now)).toBe(true);
    expect(shouldMarkSeen({ ...student(), roles: ['parent'] }, now)).toBe(true);
    expect(shouldMarkSeen({ ...student(), roles: ['teacher'] }, now)).toBe(false);
    expect(shouldMarkSeen({ ...student(), approvalStatus: 'pending' }, now)).toBe(false);
    expect(shouldMarkSeen({ ...student(), profile: {} }, now)).toBe(false);
  });

  it('keeps the last review result and at most 60 practice days', () => {
    expect(nextPractice({ days: ['2026-10-21'] }, { date: '2026-10-23', pct: 79.6 })).toEqual({ errorsDate: '2026-10-23', errorsPct: 80, days: ['2026-10-21', '2026-10-23'] });
    expect(nextPractice({ days: ['2026-10-23'] }, { date: '2026-10-23', pct: 140 }).days).toEqual(['2026-10-23']);
    expect(nextPractice({ days: ['2026-10-23'] }, { date: '2026-10-23', pct: 140 }).errorsPct).toBe(100);
    const many = Array.from({ length: 70 }, (_, i) => `2026-08-${String((i % 28) + 1).padStart(2, '0')}`.replace('08', i < 28 ? '07' : i < 56 ? '08' : '09'));
    expect(nextPractice({ days: many }, { date: '2026-10-23', pct: 50 }).days).toHaveLength(60);
    expect(nextPractice({ days: many }, { date: '2026-10-23', pct: 50 }).days.at(-1)).toBe('2026-10-23');
  });
});
