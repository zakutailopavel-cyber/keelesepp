import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { vi } from 'vitest';
import StudentsPage from './StudentsPage.jsx';

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}{location.search}</output>;
}

function renderStudents(initialEntry = '/students', serviceOverrides = {}) {
  const service = {
    list: vi.fn().mockResolvedValue({
      items: [{ id: 's1', name: 'Mari Maas', active: true, level: 'B2', teacher: 'Pavel' }],
      cursor: null,
      hasMore: false,
    }),
    create: vi.fn(),
    update: vi.fn(),
    archive: vi.fn(),
    ...serviceOverrides,
  };

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <LocationProbe />
      <Routes>
        <Route path="/students" element={<StudentsPage service={service} actor={{ uid: 'admin-1', roles: ['admin'], displayName: 'Admin' }} />} />
        <Route path="/students/:studentId" element={<div>Profiil</div>} />
      </Routes>
    </MemoryRouter>,
  );

  return service;
}

describe('student list filter context', () => {
  it('restores all filters from the URL', async () => {
    const service = renderStudents('/students?status=archived&level=B2&teacher=Pavel&sort=teacher&search=mari');

    expect(screen.getByLabelText('Staatus')).toHaveValue('archived');
    expect(screen.getByLabelText('Tase')).toHaveValue('B2');
    expect(screen.getByLabelText('Õpetaja')).toHaveValue('Pavel');
    expect(screen.getByLabelText('Sortimine')).toHaveValue('teacher');
    expect(screen.getByLabelText('Otsi nime, telefoni või e-posti järgi')).toHaveValue('mari');

    await waitFor(() => expect(service.list).toHaveBeenCalledWith(expect.objectContaining({
      status: 'archived',
      level: 'B2',
      teacher: 'Pavel',
      sort: 'teacher',
      search: 'mari',
    })));
  });

  it('writes filter changes to the URL', async () => {
    renderStudents();
    await screen.findByText('Mari Maas');

    fireEvent.change(screen.getByLabelText('Tase'), { target: { name: 'level', value: 'C1' } });

    await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/students?level=C1'));
  });
});
