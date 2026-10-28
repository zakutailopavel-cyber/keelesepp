import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentLessonsPanel from './StudentLessonsPanel.jsx';
import { shiftDate } from '../calendar/calendarView.js';
import { localDate } from '../../utils/localDate.js';

const DAY_IDS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

it('a weekly series that started weeks ago still shows its next lessons (owner 2026-10-17)', () => {
  const now = localDate();
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

// Oleksiy 2026-10-17 / 2026-10-24: after the card was renamed its future lessons disappeared. Lessons belong to the card
// by `studentId`; the name stored on the lesson (from the day it was planned) does not matter.
it('a renamed card still lists its next lessons, which carry the old name', () => {
  const now = localDate();
  const schedule = [{ id: 'one', studentId: 's', studentName: 'Agata', recurring: false, date: shiftDate(now, 2), time: '16:00', status: 'Planeeritud', teacher: 'Mari' }];
  render(<MemoryRouter><StudentLessonsPanel student={{ id: 's', name: 'Agata Kuzina' }} lessons={[]} schedule={schedule} /></MemoryRouter>);
  expect(screen.getByText(`${shiftDate(now, 2)} · 16:00`)).toBeInTheDocument();
});

it('a card with two subjects says the subject of each next lesson', () => {
  const now = localDate();
  const student = { id: 's', name: 'Milan', subject: 'Eesti keel', teacher: 'Pavel', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p' }, { subject: 'Inglise keel', teacher: 'Anna', teacherUid: 'a' }] };
  const schedule = [
    { id: 'et', studentId: 's', date: shiftDate(now, 1), time: '15:00', teacher: 'Pavel', teacherUid: 'p' },
    { id: 'en', studentId: 's', date: shiftDate(now, 2), time: '17:00', teacher: 'Anna', teacherUid: 'a', subject: 'Inglise keel' },
  ];
  render(<MemoryRouter><StudentLessonsPanel student={student} lessons={[]} schedule={schedule} /></MemoryRouter>);
  expect(screen.getByText('Eesti keel · Pavel')).toBeInTheDocument();
  expect(screen.getByText('Inglise keel · Anna')).toBeInTheDocument();
});
