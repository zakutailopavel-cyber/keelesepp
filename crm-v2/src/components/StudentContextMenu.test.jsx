import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import StudentContextMenu, { studentIdAt } from './StudentContextMenu.jsx';

describe('the student menu (right-click)', () => {
  it('finds the student of a card link or a marked element, not of other links', () => {
    const box = document.createElement('div');
    box.innerHTML = '<a href="/students/s1"><span id="n">Mia</span></a><a id="w" href="/students/s1/worksheets/new">x</a><div data-student-id="s2"><b id="m">Boris</b></div>';
    expect(studentIdAt(box.querySelector('#n'))).toBe('s1');
    expect(studentIdAt(box.querySelector('#w'))).toBe('');
    expect(studentIdAt(box.querySelector('#m'))).toBe('s2');
  });

  it('opens on right-click with the actions and renames the student', async () => {
    const service = { getById: vi.fn(async () => ({ id: 's1', name: 'Mia', level: 'A2', active: true, parentPhone: '5551 111' })), rename: vi.fn(async (id, name) => ({ name, copies: {} })), archive: vi.fn(), restore: vi.fn() };
    render(<MemoryRouter><a href="/students/s1">Mia</a><StudentContextMenu service={service} /></MemoryRouter>);
    fireEvent.contextMenu(screen.getByText('Mia'));
    const menu = await screen.findByRole('menu');
    await waitFor(() => expect(service.getById).toHaveBeenCalledWith('s1'));
    for (const label of ['Ava kaart', 'Nimeta ümber', 'Muuda andmeid', 'Kirjuta', 'Koosta tööleht', 'Ava tahvel', 'Arhiveeri']) expect(menu).toHaveTextContent(label);
    fireEvent.click(await screen.findByRole('menuitem', { name: /Nimeta ümber/ }));
    fireEvent.change(screen.getByLabelText('Uus nimi'), { target: { value: 'Mia Tamm' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(service.rename).toHaveBeenCalledWith('s1', 'Mia Tamm'));
    expect(await screen.findByText(/Nimi muudetud: Mia Tamm/)).toBeInTheDocument();
  });
});
