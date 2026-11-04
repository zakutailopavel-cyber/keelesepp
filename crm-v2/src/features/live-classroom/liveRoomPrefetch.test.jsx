import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PREFETCH_BEFORE_MS, prefetchDelay } from './liveRoomPrefetch.js';
import LessonSoonPrefetch from './LessonSoonPrefetch.jsx';

const at = (date, time) => new Date(`${date}T${time}:00`).getTime();

describe('prefetching the Live Classroom before a lesson', () => {
  afterEach(() => vi.useRealTimers());

  it('fetches now within 30 minutes of the start, later within a few hours, never for a far or broken time', () => {
    const now = at('2026-11-04', '15:00');
    expect(prefetchDelay({ occurrenceDate: '2026-11-04', time: '15:20' }, now)).toBe(0);
    expect(prefetchDelay({ occurrenceDate: '2026-11-04', time: '15:30' }, now)).toBe(0);
    expect(prefetchDelay({ occurrenceDate: '2026-11-04', time: '16:00' }, now)).toBe(60 * 60 * 1000 - PREFETCH_BEFORE_MS);
    expect(prefetchDelay({ occurrenceDate: '2026-11-05', time: '15:00' }, now)).toBeNull();
    expect(prefetchDelay({ occurrenceDate: '2026-11-04', time: '' }, now)).toBeNull();
    expect(prefetchDelay(null, now)).toBeNull();
  });

  it('the home page component prefetches once the time comes and stops its timer when it goes away', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(at('2026-11-04', '15:00')));
    const prefetch = vi.fn();
    const soon = render(<LessonSoonPrefetch lesson={{ occurrenceDate: '2026-11-04', time: '15:10' }} prefetch={prefetch} />);
    expect(prefetch).toHaveBeenCalledTimes(1);
    soon.unmount();

    const later = vi.fn();
    const view = render(<LessonSoonPrefetch lesson={{ occurrenceDate: '2026-11-04', time: '16:00' }} prefetch={later} />);
    expect(later).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30 * 60 * 1000);
    expect(later).toHaveBeenCalledTimes(1);
    view.unmount();

    const gone = vi.fn();
    render(<LessonSoonPrefetch lesson={{ occurrenceDate: '2026-11-04', time: '17:00' }} prefetch={gone} />).unmount();
    vi.advanceTimersByTime(3 * 60 * 60 * 1000);
    expect(gone).not.toHaveBeenCalled();
  });
});
