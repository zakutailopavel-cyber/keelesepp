import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import CalendarPage from './CalendarPage.jsx';
import { toIsoDate } from './calendarView.js';

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
      completeFromSchedule: vi.fn().mockResolvedValue({ id: 'lesson-1' }),
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

  it('completes an individual lesson directly from the weekly calendar', async () => {
    const today = toIsoDate();
    const props = renderCalendar({
      events: [{
        id: 'schedule-1',
        studentId: 's1',
        studentName: 'Mari Maas',
        teacher: 'Pavel',
        teacherUid: 't1',
        date: today,
        startDate: today,
        time: '10:00',
        duration: 60,
        recurring: false,
        status: 'Planeeritud',
      }],
    });

    const action = await screen.findByRole('button', { name: 'Märgi toimunuks: Mari Maas' });
    fireEvent.click(action);

    await waitFor(() => expect(props.lessonRepository.completeFromSchedule).toHaveBeenCalledTimes(1));
    expect(props.lessonRepository.completeFromSchedule).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'schedule-1', studentId: 's1', occurrenceDate: today }),
      expect.objectContaining({ uid: 'admin-1' }),
    );
    await waitFor(() => expect(props.scheduleRepository.list).toHaveBeenCalledTimes(2));
  });
});
