import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CalendarPage from './CalendarPage.jsx';

vi.mock('../../app/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] } }),
}));

function repositories({ events = [] } = {}) {
  return {
    scheduleRepository: {
      list: vi.fn().mockResolvedValue(events),
      create: vi.fn(),
      update: vi.fn(),
      cancel: vi.fn(),
    },
    studentRepository: {
      list: vi.fn().mockResolvedValue({ items: [
        { id: 's1', name: 'Mari Maas', teacher: 'Pavel', teacherUid: 't1' },
        { id: 's2', name: 'Jaan Tamm', teacher: 'Jelena', teacherUid: 't2' },
      ] }),
    },
    groupRepository: {
      list: vi.fn().mockResolvedValue([]),
      setAttendance: vi.fn(),
    },
    lessonRepository: {
      listForCalendar: vi.fn().mockResolvedValue([]),
      completeFromSchedule: vi.fn(),
    },
  };
}

function renderCalendar(options) {
  const props = repositories(options);
  render(<MemoryRouter><CalendarPage {...props} /></MemoryRouter>);
  return props;
}

describe('calendar filtering UX', () => {
  it('shows the selected-period count and accessible view state', async () => {
    renderCalendar();

    expect(await screen.findByText(/0 tundi valitud perioodil/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nädal' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Päev' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('offers a clear reset action when filters hide every lesson', async () => {
    renderCalendar();
    await screen.findByText(/0 tundi valitud perioodil/);

    fireEvent.change(screen.getByLabelText('Otsi kalendrist'), { target: { value: 'puuduv nimi' } });

    expect(screen.getByText('Filtritele vastavaid tunde ei leitud')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Tühjenda filtrid' }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getAllByRole('button', { name: 'Tühjenda filtrid' })[0]);

    expect(screen.getByLabelText('Otsi kalendrist')).toHaveValue('');
    expect(screen.queryByText('Filtritele vastavaid tunde ei leitud')).not.toBeInTheDocument();
  });

  it('opens lesson creation from an empty day in the weekly view', async () => {
    renderCalendar();
    await screen.findByText(/0 tundi valitud perioodil/);

    fireEvent.click(screen.getAllByText('Lisa tund')[0]);

    expect(screen.getByRole('heading', { name: 'Uus tund' })).toBeInTheDocument();
    expect(screen.getByLabelText('Õpilane')).toBeInTheDocument();
  });
});
