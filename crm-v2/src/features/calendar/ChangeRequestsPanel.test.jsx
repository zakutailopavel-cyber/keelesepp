import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChangeRequestsPanel from './ChangeRequestsPanel.jsx';

describe('change requests in the calendar', () => {
  it('confirms a proposed time or declines with a note', () => {
    const onAccept = vi.fn();
    const onDecline = vi.fn();
    const request = { id: 'r1', studentName: 'Полина', occurrenceDate: '2026-10-13', occurrenceTime: '16:00', reason: 'kunstikool', late: true, proposals: [{ date: '2026-10-16', time: '15:00' }] };
    render(<ChangeRequestsPanel requests={[request]} onAccept={onAccept} onDecline={onDecline} />);
    expect(screen.getByText('vähem kui 24 h')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Kinnita/ }));
    expect(onAccept).toHaveBeenCalledWith(request, { date: '2026-10-16', time: '15:00' });
    fireEvent.change(screen.getByLabelText('Vastus õpilasele'), { target: { value: 'Sel nädalal ei saa' } });
    fireEvent.click(screen.getByRole('button', { name: 'Keeldu' }));
    expect(onDecline).toHaveBeenCalledWith(request, 'Sel nädalal ei saa');
  });

  it('is hidden without requests', () => {
    const { container } = render(<ChangeRequestsPanel requests={[]} onAccept={vi.fn()} onDecline={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });
});
