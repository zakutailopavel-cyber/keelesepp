import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentLessonsPanel from './StudentLessonsPanel.jsx';
import { shiftDate } from '../calendar/calendarView.js';

const DAY_IDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

it('a weekly series that started weeks ago still shows its next lessons (owner 2026-10-17)', () => {
  const now = new Date().toISOString().slice(0, 10);
  const start = shiftDate(now, -14);
  const day = DAY_IDS[new Date(`${start}T12:00:00`).getDay()];
  const schedule = [
    { id: 'series', recurring: true, date: start, startDate: start, day, time: '15:00', status: 'Planeeritud', teacher: 'Mari' },
    { id: 'old', recurring: false, date: shiftDate(now, -3), time: '10:00', status: 'Toimunud' },
  ];
  render(<MemoryRouter><StudentLessonsPanel student={{ id: 's', name: 'Agata' }} lessons={[]} schedule={schedule} /></MemoryRouter>);
  expect(screen.queryByText('Tulevasi tunde ei ole')).toBeNull();
  expect(screen.getByText(`${now} · 15:00`)).toBeInTheDocument();
  expect(screen.getByText(`${shiftDate(now, 7)} · 15:00`)).toBeInTheDocument();
  expect(screen.queryByText(/10:00/)).toBeNull();
});
