import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DailyReminder from './DailyReminder.jsx';

describe('DailyReminder', () => {
  it('downloads a daily calendar event at the chosen time', () => {
    const download = vi.fn();
    render(<DailyReminder download={download} />);
    fireEvent.change(screen.getByLabelText('Meeldetuletuse kellaaeg'), { target: { value: '07:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa telefoni kalendrisse' }));
    expect(download).toHaveBeenCalledWith('keelesepp-paeva-5-minutit.ics', expect.stringContaining('RRULE:FREQ=DAILY'));
    expect(download.mock.calls[0][1]).toMatch(/DTSTART:\d{8}T073000/);
    expect(screen.getByText('Meeldetuletus on kalendris kell 07:30.')).toBeTruthy();
  });
});
