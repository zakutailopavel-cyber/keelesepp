import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import EntityContextMenu from './EntityContextMenu.jsx';
import { studentIdAt } from './entityMenu/entityRegistry.js';

const studentService = () => ({ getById: vi.fn(async () => ({ id: 's1', name: 'Mia', level: 'A2', active: true, parentPhone: '5551 111' })), rename: vi.fn(async (id, name) => ({ name, copies: {} })), archive: vi.fn(), restore: vi.fn() });

function Where() {
  const location = useLocation();
  return <output data-testid="where">{location.pathname}{location.search}</output>;
}

function setup(children, { roles = ['teacher'], students = studentService(), path = '/' } = {}) {
  render(<MemoryRouter initialEntries={[path]}><Routes><Route path="*" element={<>{children}<Where /><EntityContextMenu roles={roles} services={{ students }} /></>} /></Routes></MemoryRouter>);
  return students;
}

describe('the right-click menu', () => {
  it('finds the student of a card link or a marked element, not of other links', () => {
    const box = document.createElement('div');
    box.innerHTML = '<a href="/students/s1"><span id="n">Mia</span></a><a id="w" href="/students/s1/worksheets/new">x</a><div data-student-id="s2"><b id="m">Boris</b></div>';
    expect(studentIdAt(box.querySelector('#n'))).toBe('s1');
    expect(studentIdAt(box.querySelector('#w'))).toBe('');
    expect(studentIdAt(box.querySelector('#m'))).toBe('s2');
  });

  it('opens on a student with the actions and renames the student', async () => {
    const service = setup(<a href="/students/s1">Mia</a>);
    fireEvent.contextMenu(screen.getByText('Mia'));
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(service.getById).toHaveBeenCalledWith('s1'));
    for (const label of ['Ava kaart', 'Nimeta ümber', 'Muuda andmeid', 'Kirjuta', 'Koosta tööleht', 'Ava tahvel', 'Arhiveeri']) expect(menu).toHaveTextContent(label);
    expect(menu).not.toHaveTextContent('Finantsid'); // the finance tab is for the administrator and the accountant
    fireEvent.click(await screen.findByRole('menuitem', { name: /Nimeta ümber/ }));
    fireEvent.change(screen.getByLabelText('Uus nimi'), { target: { value: 'Mia Tamm' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(service.rename).toHaveBeenCalledWith('s1', 'Mia Tamm'));
    expect(await screen.findByText(/Nimi muudetud: Mia Tamm/)).toBeInTheDocument();
  });

  it('keeps the browser menu with Shift, in fields and for roles without actions', () => {
    setup(<div><a href="/students/s1">Mia</a><div data-entity="invoice" data-invoice-id="i1"><input aria-label="väli" /><span>Arve 12</span></div></div>);
    expect(fireEvent.contextMenu(screen.getByText('Mia'), { shiftKey: true })).toBe(true);
    expect(fireEvent.contextMenu(screen.getByLabelText('väli'))).toBe(true);
    // a teacher has no invoice actions: the browser's own menu
    expect(fireEvent.contextMenu(screen.getByText('Arve 12'))).toBe(true);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('gives the accountant the invoice row actions and runs the row’s own button', async () => {
    const print = vi.fn();
    setup(<div data-entity="invoice" data-invoice-id="i1" data-invoice-number="2026-12" data-student-id="s1" data-entity-title="Mia · 2026-12">
      <span>Mia</span>
      <button type="button" data-entity-action="print" onClick={print}>Prindi</button>
      <button type="button" data-entity-action="payment" disabled>Makse</button>
    </div>, { roles: ['finance'] });
    expect(fireEvent.contextMenu(screen.getByText('Mia'))).toBe(false);
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveTextContent('Prindi / PDF');
    expect(menu).toHaveTextContent('Kopeeri arve number');
    expect(menu).not.toHaveTextContent('Lisa makse'); // its button is disabled in the row
    expect(menu).not.toHaveTextContent('Õpilase finantsid'); // the accountant cannot open a student card
    fireEvent.click(screen.getByRole('menuitem', { name: /Prindi/ }));
    expect(print).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens a task of an Õpik sheet in the studio with the block selected and the way back to the book', async () => {
    setup(<section data-entity="sheet" data-lesson-id="est-b1-01" data-worksheet-id="practice"><div data-entity="block" data-block-id="b7"><p>Ülesanne 3</p></div><h2>Harjuta</h2></section>, { path: '/library/worksheets/book' });
    fireEvent.contextMenu(screen.getByText('Ülesanne 3'));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Muuda ülesannet' }));
    expect(screen.getByTestId('where')).toHaveTextContent('/library/lessons/est-b1-01/worksheets/practice?plokk=b7&tagasi=opik');
    fireEvent.contextMenu(screen.getByText('Harjuta'));
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveTextContent('Muuda lehte');
    expect(menu).toHaveTextContent('Ava õpilase vaates');
  });

  it('is keyboard accessible: the first item has the focus, arrows move, Escape closes', async () => {
    setup(<section data-entity="sheet" data-lesson-id="l1" data-worksheet-id="discover"><h2>Avasta</h2></section>);
    fireEvent.contextMenu(screen.getByText('Avasta'));
    const menu = await screen.findByRole('menu');
    const items = screen.getAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
    fireEvent.keyDown(menu, { key: 'ArrowDown' });
    expect(items[1]).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    fireEvent.keyDown(menu, { key: 'ArrowUp' });
    expect(items[items.length - 1]).toHaveFocus();
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
