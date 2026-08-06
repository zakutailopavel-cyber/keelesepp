import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import QuickAttendanceAction from './QuickAttendanceAction.jsx';

describe('QuickAttendanceAction', () => {
  it('shows a quick completion action for an individual planned lesson', () => {
    render(<QuickAttendanceAction item={{ id: 'schedule-1', occurrenceDate: '2026-08-06', status: 'Planeeritud', studentName: 'Mari Maas' }} onComplete={() => {}} />);

    expect(screen.getByRole('button', { name: 'Märgi toimunuks: Mari Maas' })).toBeInTheDocument();
  });

  it('does not render for group, completed or cancelled lessons', () => {
    const { rerender } = render(<QuickAttendanceAction item={{ id: 'group-1', occurrenceDate: '2026-08-06', isGroup: true }} onComplete={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<QuickAttendanceAction item={{ id: 'schedule-1', occurrenceDate: '2026-08-06', lessonRecordId: 'lesson-1' }} onComplete={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<QuickAttendanceAction item={{ id: 'schedule-1', occurrenceDate: '2026-08-06', status: 'Tühistatud' }} onComplete={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('stops the parent lesson click and completes the selected item', () => {
    const onComplete = vi.fn();
    const onParentClick = vi.fn();
    const item = { id: 'schedule-1', occurrenceDate: '2026-08-06', status: 'Planeeritud', studentName: 'Mari Maas' };

    render(<div onClick={onParentClick}><QuickAttendanceAction item={item} onComplete={onComplete} /></div>);
    fireEvent.click(screen.getByRole('button', { name: 'Märgi toimunuks: Mari Maas' }));

    expect(onComplete).toHaveBeenCalledWith(item);
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
