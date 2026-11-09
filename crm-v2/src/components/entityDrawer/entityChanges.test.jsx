import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { announceLessonChanged, announceLessonMarked, onLessonMarked } from '../../features/calendar/lessonActions.js';
import { announceEntityChanged, onEntityChanged } from './entityDrawer.js';
import { useEntityChanged } from './useEntityChanged.js';

describe('entity changes: the page under the drawer hears what the drawer changed', () => {
  it('a listener hears only its kinds and stops when unsubscribed', () => {
    const lessons = vi.fn();
    const both = vi.fn();
    const stopLessons = onEntityChanged('lesson', lessons);
    const stopBoth = onEntityChanged(['lesson', 'invoice'], both);
    announceEntityChanged('invoice', { invoiceId: 'i1', change: 'payment' });
    announceEntityChanged('lesson', { occurrenceId: 'e1:2026-11-09', change: 'marked' });
    expect(lessons).toHaveBeenCalledTimes(1);
    expect(lessons).toHaveBeenCalledWith({ kind: 'lesson', occurrenceId: 'e1:2026-11-09', change: 'marked' });
    expect(both.mock.calls.map(([change]) => change.kind)).toEqual(['invoice', 'lesson']);
    stopLessons(); stopBoth();
    announceEntityChanged('lesson', { change: 'changed' });
    expect(lessons).toHaveBeenCalledTimes(1);
    expect(both).toHaveBeenCalledTimes(2);
  });

  it('„Märkimata tunnid” still hears only marks; other lesson changes go to the pages that reload', () => {
    const marked = vi.fn();
    const any = vi.fn();
    const stopMarked = onLessonMarked(marked);
    const stopAny = onEntityChanged('lesson', any);
    announceLessonMarked('e1:2026-11-09');
    announceLessonChanged('e2:2026-11-08');
    stopMarked(); stopAny();
    expect(marked.mock.calls).toEqual([['e1:2026-11-09']]);
    expect(any.mock.calls.map(([change]) => change.change)).toEqual(['marked', 'changed']);
  });

  it('useEntityChanged calls the latest handler, keeps the page mounted and lets go on unmount', () => {
    let mounts = 0;
    function Page() {
      const [count, setCount] = useState(0);
      const [mountId] = useState(() => { mounts += 1; return mounts; });
      useEntityChanged('invoice', () => setCount(count + 1));
      return <p>{`uuendatud ${count} · mount ${mountId}`}</p>;
    }
    const { unmount } = render(<Page />);
    act(() => { announceEntityChanged('invoice', { invoiceId: 'i1' }); });
    act(() => { announceEntityChanged('lesson', { occurrenceId: 'x' }); });
    act(() => { announceEntityChanged('invoice', { invoiceId: 'i2' }); });
    expect(screen.getByText('uuendatud 2 · mount 1')).toBeInTheDocument();
    unmount();
    expect(() => announceEntityChanged('invoice', { invoiceId: 'i3' })).not.toThrow();
  });
});
