import { fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import TimeGrid from './TimeGrid.jsx';

// jsdom's PointerEvent drops clientX/clientY: without them a drag looks like a click
globalThis.PointerEvent = class PointerEvent extends globalThis.MouseEvent {
  constructor(type, init = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; }
};

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

describe('TimeGrid for the planner', () => {
  it('tells which lesson is being dragged (for the cell colours) and shows the marks; a chip can be dropped on a cell', () => {
    const onDragChange = vi.fn();
    const onMove = vi.fn();
    const onDropItem = vi.fn();
    const draft = { ...lesson('d', '10:00', 'Anna'), blockClass: 'is-draft is-plan-agree' };
    const marks = () => [{ kind: 'plan-green', start: 600, end: 630, title: '10:00–11:00: ★' }, { kind: 'plan-red', start: 630, end: 660, title: 'Kattub: Boris' }];
    const { container } = render(<TimeGrid columns={[column('2026-10-05', [draft])]} onOpen={() => {}} onMove={onMove} canDrag={() => true} marks={marks} onDragChange={onDragChange} onDropItem={onDropItem} />);
    const block = container.querySelector('.tg-block');
    expect(block).toHaveClass('is-draft', 'is-plan-agree');
    expect(container.querySelectorAll('.tg-fit.is-plan-green, .tg-fit.is-plan-red')).toHaveLength(2);
    fireEvent.pointerDown(block, { button: 0, clientX: 10, clientY: 100 });
    expect(onDragChange).not.toHaveBeenCalledWith(expect.objectContaining({ id: 'd' }));
    fireEvent.pointerMove(container.querySelector('.tg-body'), { clientX: 10, clientY: 166 });
    expect(onDragChange).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'd' }));
    fireEvent.pointerUp(container.querySelector('.tg-body'));
    expect(onDragChange).toHaveBeenLastCalledWith(null);
    fireEvent.drop(container.querySelector('.tg-col'), { clientY: 0 });
    expect(onDropItem).toHaveBeenCalledWith(expect.objectContaining({ key: '2026-10-05' }), '08:00');
  });
});
