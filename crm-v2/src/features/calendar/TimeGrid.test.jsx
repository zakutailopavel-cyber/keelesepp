import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import TimeGrid from './TimeGrid.jsx';

const lesson = (id, time, studentName, teacher = 'Pavel') => ({ id, occurrenceId: `${id}:2026-10-05`, occurrenceDate: '2026-10-05', time, duration: 60, studentName, teacher, status: 'Planeeritud' });
const column = (key, items) => ({ key, title: key, subtitle: 'E', today: '2026-10-05', isToday: false, items });

describe('TimeGrid in the week view', () => {
  it('lists three or more lessons at the same time in one readable card; each row opens its lesson', () => {
    const onOpen = vi.fn();
    const crowded = [lesson('a', '16:00', 'Maria'), lesson('b', '16:00', 'Arseni'), lesson('c', '16:30', 'Emilia', 'Yelyzaveta')];
    render(<TimeGrid columns={[column('2026-10-05', crowded), column('2026-10-06', [lesson('d', '16:00', 'Martin')])]} onOpen={onOpen} canDrag={() => false} />);
    const card = screen.getByRole('list', { name: '3 tundi korraga' });
    expect(within(card).getAllByRole('listitem').map((row) => row.textContent)).toEqual(['16:00Arseni', '16:00Maria', '16:30Emilia']);
    fireEvent.click(within(card).getByRole('listitem', { name: /Emilia/ }));
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'c' }));
    expect(screen.getByRole('button', { name: '16:00 Martin' })).toBeInTheDocument();
  });

  it('keeps side-by-side blocks in the day view', () => {
    const crowded = [lesson('a', '16:00', 'Maria'), lesson('b', '16:00', 'Arseni'), lesson('c', '16:00', 'Emilia')];
    render(<TimeGrid columns={[column('2026-10-05', crowded)]} onOpen={() => {}} canDrag={() => false} />);
    expect(screen.queryByRole('list', { name: /tundi korraga/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '16:00 Emilia' })).toBeInTheDocument();
  });
});
