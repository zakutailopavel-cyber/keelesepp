import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TeacherWeekEditor from './TeacherWeekEditor.jsx';

globalThis.PointerEvent = class PointerEvent extends globalThis.MouseEvent {
  constructor(type, init = {}) { super(type, init); this.pointerId = init.pointerId ?? 1; }
};

// 2026-10-19 is a Monday (the DST week: Sunday 2026-10-25)
const teacher = { uid: 't1', name: 'Pavel' };
const availability = { slots: [
  { id: 'tue', kind: 'free', day: 'Tue', start: '09:15', end: '11:45' },
  { id: 'date', kind: 'busy', date: '2026-10-28', start: '10:00', end: '12:00' },
  { id: 'old', kind: 'busy', date: '2026-10-01', start: '10:00', end: '12:00' },
] };
const events = [{ id: 'l1', studentName: 'Mari', teacherUid: 't1', teacher: 'Pavel', recurring: true, startDate: '2026-10-05', day: 'Wed', time: '10:00', duration: 60, status: 'Planeeritud' }];

function setup(extra = {}) {
  const onSave = vi.fn().mockResolvedValue(true);
  const onClose = vi.fn();
  render(<TeacherWeekEditor teacher={teacher} availability={availability} events={events} weekStart="2026-10-19" today="2026-10-24" own onSave={onSave} onClose={onClose} {...extra} />);
  const grid = screen.getByRole('grid', { name: 'Minu nädala ajad' });
  const cell = (name) => within(grid).getByRole('button', { name: new RegExp(`^${name}`) });
  const tap = (name) => { fireEvent.pointerDown(cell(name)); fireEvent.pointerUp(grid); };
  return { onSave, onClose, grid, cell, tap };
}

afterEach(() => { delete globalThis.document.elementFromPoint; });

describe('TeacherWeekEditor („Minu ajad”)', () => {
  it('shows the saved week, the week\'s lessons and the date windows from today on', () => {
    const { cell } = setup();
    expect(screen.getByRole('dialog', { name: 'Minu ajad' })).toBeInTheDocument();
    expect(cell('Teisipäev 09:00').getAttribute('aria-label')).toMatch(/Saadaval/);
    expect(cell('Teisipäev 11:30').getAttribute('aria-label')).toMatch(/Saadaval/);
    expect(cell('Teisipäev 12:00').getAttribute('aria-label')).toMatch(/märkimata/);
    expect(cell('Kolmapäev 10:00').getAttribute('aria-label')).toMatch(/tund 10:00 Mari/);
    const dated = screen.getByRole('region', { name: 'Ühe päeva erandid' });
    expect(within(dated).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Salvesta ajad' })).toBeDisabled();
  });

  it('paints with the chosen colour, a second tap clears, the eraser clears; saves only the changed day', async () => {
    const { cell, tap, onSave } = setup();
    tap('Esmaspäev 16:00');
    fireEvent.click(screen.getByRole('button', { name: /Ainult veebis/ }));
    tap('Esmaspäev 16:30');
    fireEvent.click(screen.getByRole('button', { name: /Ei saa/ }));
    tap('Esmaspäev 17:00');
    tap('Esmaspäev 17:30');
    tap('Esmaspäev 17:30'); // the same colour again: cleared
    fireEvent.click(screen.getByRole('button', { name: /Kustuta/ }));
    tap('Esmaspäev 16:30');
    expect(cell('Esmaspäev 16:00').className).toContain('is-free');
    expect(cell('Esmaspäev 16:30').className).not.toContain('is-online');
    expect(cell('Esmaspäev 17:00').className).toContain('is-busy');
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta ajad' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    const slots = onSave.mock.calls[0][0];
    // Tuesday's odd 09:15–11:45 window and both date windows stay exactly as they were
    expect(slots.filter((slot) => ['tue', 'date', 'old'].includes(slot.id))).toEqual(availability.slots);
    expect(slots.filter((slot) => slot.day === 'Mon').map(({ kind, start, end }) => [kind, start, end])).toEqual([['free', '16:00', '16:30'], ['busy', '17:00', '17:30']]);
  });

  it('dragging paints every half hour between (a fast finger skips cells)', async () => {
    const { cell, grid, onSave } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Ei saa/ }));
    fireEvent.pointerDown(cell('Neljapäev 08:00'));
    globalThis.document.elementFromPoint = () => cell('Neljapäev 10:30');
    fireEvent.pointerMove(grid, { clientX: 1, clientY: 1 });
    fireEvent.pointerUp(grid);
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta ajad' }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].filter((slot) => slot.day === 'Thu').map(({ kind, start, end }) => [kind, start, end])).toEqual([['busy', '08:00', '11:00']]);
  });

  it('a day header fills the whole day, a second click empties it', () => {
    const { cell } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Reede: kogu päev' }));
    expect(cell('Reede 08:00').className).toContain('is-free');
    expect(cell('Reede 21:30').className).toContain('is-free');
    fireEvent.click(screen.getByRole('button', { name: 'Reede: kogu päev' }));
    expect(cell('Reede 21:30').className).not.toContain('is-free');
  });

  it('a lesson in a red cell is marked and counted', () => {
    const { tap, cell } = setup();
    fireEvent.click(screen.getByRole('button', { name: /Ei saa/ }));
    tap('Kolmapäev 10:30');
    expect(cell('Kolmapäev 10:30').className).toContain('is-clash');
    expect(screen.getByText(/1 tund on sel nädalal punasel ajal/)).toBeInTheDocument();
  });

  it('the week of lessons can be changed and hidden', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Järgmine nädal' }));
    expect(screen.getByRole('button', { name: /^Kolmapäev 10:00/ }).getAttribute('aria-label')).toMatch(/Mari/);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Näita tunde' }));
    expect(screen.getByRole('button', { name: /^Kolmapäev 10:00/ }).getAttribute('aria-label')).not.toMatch(/Mari/);
  });

  it('compares with a student\'s „Sobivad ajad” on the same cells', () => {
    const studentTimes = new Map([['s1', { slots: ['Mon-16:00', 'Mon-16:30'], preferred: ['Mon-16:30'] }]]);
    const { cell } = setup({ students: [{ id: 's1', name: 'Mari Maas' }, { id: 's2', name: 'Ilma Aegadeta' }], studentTimes });
    const select = screen.getByRole('combobox', { name: 'Võrdle õpilasega' });
    expect(within(select).queryByRole('option', { name: 'Ilma Aegadeta' })).toBeNull();
    fireEvent.change(select, { target: { value: 's1' } });
    expect(cell('Esmaspäev 16:00').className).toContain('is-student-ok');
    expect(cell('Esmaspäev 16:30').className).toContain('is-student-best');
  });

  it('a date window can be removed; a failed save says so and keeps the editor open', async () => {
    const onSave = vi.fn().mockResolvedValue(false);
    setup({ onSave });
    fireEvent.click(within(screen.getByRole('region', { name: 'Ühe päeva erandid' })).getByRole('button', { name: 'Eemalda' }));
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta ajad' }));
    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave.mock.calls[0][0].map((slot) => slot.id)).toEqual(['tue', 'old']);
    expect(await screen.findByText(/Aegu ei saanud salvestada/)).toBeInTheDocument();
  });

  it('keyboard: Enter marks a cell with the chosen colour', () => {
    const { cell } = setup();
    fireEvent.keyDown(cell('Laupäev 12:00'), { key: 'Enter' });
    expect(cell('Laupäev 12:00').className).toContain('is-free');
  });
});
