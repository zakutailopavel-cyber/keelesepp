import { describe, expect, it } from 'vitest';
import {
  addMinute, combineOffset, countdownRemaining, durationFrom, formatCountdown, normalizeCountdown, offsetSample, pauseCountdown,
  resumeCountdown, startCountdown,
} from './countdown.js';

const T0 = Date.parse('2026-11-04T16:00:00.000Z');
const running = (extra = {}) => normalizeCountdown({ running: true, remainingMs: 120000, durationMs: 120000, label: '', by: 't1', updatedAt: T0, ...extra });

describe('countdown remaining time', () => {
  it('derives the time left from the server time of the write, no per-second writes', () => {
    const cd = running();
    expect(countdownRemaining(cd, T0, 0)).toBe(120000);
    expect(countdownRemaining(cd, T0 + 30000, 0)).toBe(90000);
    expect(countdownRemaining(cd, T0 + 500000, 0)).toBe(0);
  });

  it('corrects a reader whose clock is off by the offset (server − local)', () => {
    const cd = running();
    // this computer runs 5 s behind the server: local T0+25 s is server T0+30 s
    expect(countdownRemaining(cd, T0 + 25000, 5000)).toBe(90000);
    // and 3 s ahead
    expect(countdownRemaining(cd, T0 + 33000, -3000)).toBe(90000);
  });

  it('a paused timer keeps its stored time left whatever the clock says', () => {
    const cd = normalizeCountdown({ running: false, remainingMs: 42000, durationMs: 60000, by: 't1', updatedAt: T0 });
    expect(countdownRemaining(cd, T0 + 999999, 12345)).toBe(42000);
  });

  it('pause stores the time left at that moment, resume continues from it', () => {
    const cd = running();
    const paused = pauseCountdown(cd, T0 + 20000, 0, 't1');
    expect(paused).toMatchObject({ running: false, remainingMs: 100000, durationMs: 120000 });
    const resumed = resumeCountdown(normalizeCountdown({ ...paused, updatedAt: T0 + 60000 }), 't1');
    expect(resumed).toMatchObject({ running: true, remainingMs: 100000 });
    // after resume the clock runs from the new write's server time
    expect(countdownRemaining(normalizeCountdown({ ...resumed, updatedAt: T0 + 60000 }), T0 + 70000, 0)).toBe(90000);
  });

  it('+1 min adds to the time left (and restarts a timer that already ended)', () => {
    expect(addMinute(running(), T0 + 30000, 0, 't1')).toMatchObject({ running: true, remainingMs: 150000, durationMs: 180000 });
    const ended = addMinute(running(), T0 + 600000, 0, 't1');
    expect(ended).toMatchObject({ running: true, remainingMs: 60000 });
  });

  it('start writes the whole duration; nothing without a time stamp counts as a timer', () => {
    expect(startCountdown(180000, { label: 'Loe', by: 't1' })).toEqual({ running: true, remainingMs: 180000, durationMs: 180000, label: 'Loe', by: 't1' });
    expect(normalizeCountdown({ running: true, remainingMs: 1000 })).toBeNull();
    expect(normalizeCountdown(null)).toBeNull();
    expect(normalizeCountdown({ running: true, remainingMs: 1000, updatedAt: { seconds: T0 / 1000, nanoseconds: 0 } }).updatedAt).toBe(T0);
  });
});

describe('clock offset', () => {
  it('a live write gives server − local; the largest of the recent samples wins (each is short by its delay)', () => {
    expect(offsetSample(T0, T0 - 4000)).toBe(4000);
    expect(offsetSample(0, T0)).toBeNull();
    expect(combineOffset([3800, 3950, 3700])).toBe(3950);
    expect(combineOffset([])).toBe(0);
    expect(combineOffset([9000, 1, 2, 3, 4, 5])).toBe(5);
  });
});

describe('formatting and input', () => {
  it('shows m:ss rounded up, h:mm:ss over an hour', () => {
    expect(formatCountdown(65000)).toBe('1:05');
    expect(formatCountdown(400)).toBe('0:01');
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(3725000)).toBe('1:02:05');
  });
  it('minutes + seconds → ms, at most two hours', () => {
    expect(durationFrom(2, 30)).toBe(150000);
    expect(durationFrom('0', '0')).toBe(0);
    expect(durationFrom(500, 0)).toBe(7200000);
  });
});
