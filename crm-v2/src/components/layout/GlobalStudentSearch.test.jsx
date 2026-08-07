import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import GlobalStudentSearch from './GlobalStudentSearch.jsx';

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current-path">{location.pathname}</output>;
}

function renderSearch({ user, items = [] }) {
  const studentRepository = {
    list: vi.fn().mockResolvedValue({ items }),
  };
  render(
    <MemoryRouter initialEntries={['/calendar']}>
      <Routes>
        <Route path="*" element={<><GlobalStudentSearch user={user} studentRepository={studentRepository} /><LocationProbe /></>} />
      </Routes>
    </MemoryRouter>,
  );
  return studentRepository;
}

async function typeQuery(value) {
  fireEvent.change(screen.getByLabelText('Otsi õpilast'), { target: { value } });
  await act(async () => {
    vi.advanceTimersByTime(250);
    await Promise.resolve();
  });
}

describe('global student search', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('searches active students and opens a selected profile', async () => {
    const repository = renderSearch({
      user: { uid: 'admin-1', roles: ['admin'] },
      items: [{ id: 's1', name: 'Mari Maas', level: 'B1', teacher: 'Pavel' }],
    });

    await typeQuery('Mari');

    expect(repository.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'Mari', status: 'active', exhaustive: true }));
    fireEvent.click(await screen.findByRole('button', { name: /Mari Maas/ }));
    expect(screen.getByLabelText('current-path')).toHaveTextContent('/students/s1');
  });

  it('scopes teacher search to the signed-in teacher uid', async () => {
    const repository = renderSearch({
      user: { uid: 'teacher-7', roles: ['teacher'] },
    });

    await typeQuery('Jaan');

    expect(repository.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-7' }));
  });

  it('supports keyboard selection', async () => {
    renderSearch({
      user: { uid: 'admin-1', roles: ['admin'] },
      items: [{ id: 's2', name: 'Jaan Tamm', level: 'A2', teacher: 'Jelena' }],
    });

    await typeQuery('Jaan');
    const input = screen.getByLabelText('Otsi õpilast');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByLabelText('current-path')).toHaveTextContent('/students/s2');
  });

  it('does not query for one-character input', async () => {
    const repository = renderSearch({ user: { uid: 'admin-1', roles: ['admin'] } });

    await typeQuery('M');

    expect(repository.list).not.toHaveBeenCalled();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});