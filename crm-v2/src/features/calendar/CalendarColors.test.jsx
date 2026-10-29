import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CalendarColors from './CalendarColors.jsx';
import { calendarTones } from './calendarGrid.js';

const people = [{ id: 'a', name: 'Anhelina' }, { id: 'j', name: 'Jegor' }];

describe('CalendarColors („Värvid”)', () => {
  it('lists the teachers with their colour and saves a personal choice', () => {
    const onChange = vi.fn();
    render(<CalendarColors people={people} tones={calendarTones({ people })} personal={{}} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Värvid/ }));
    expect(screen.getByText('Valik kehtib ainult sinu kalendris.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Taasta vaikimisi/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Jegor/ }));
    const palette = screen.getByRole('group', { name: 'Jegor värv' });
    expect(palette.querySelectorAll('button')).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: 'Roosa' }));
    expect(onChange).toHaveBeenCalledWith({ j: 4 });
  });

  it('marks the own choice and restores the defaults', () => {
    const onChange = vi.fn();
    render(<CalendarColors people={people} tones={calendarTones({ people, personal: { j: 4, a: 6 } })} personal={{ j: 4, a: 6 }} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Värvid/ }));
    expect(screen.getAllByText('minu valik')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /Jegor/ }));
    expect(screen.getByRole('button', { name: 'Roosa' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Vaikimisi' }));
    expect(onChange).toHaveBeenLastCalledWith({ a: 6 });
    fireEvent.click(screen.getByRole('button', { name: /Taasta vaikimisi/ }));
    expect(onChange).toHaveBeenLastCalledWith({});
  });
});
