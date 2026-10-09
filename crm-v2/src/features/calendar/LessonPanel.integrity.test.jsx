import { render, screen } from '@testing-library/react';
import LessonPanel from './LessonPanel.jsx';
it('shows an actionable journal link for a missing accounting record without allowing a second charge', () => {
 render(<LessonPanel item={{ id: 's', studentId: 'p', studentName: 'Maria', status: 'Toimunud', recordProblem: 'missing', occurrenceDate: '2026-10-05', time: '15:00' }} />);
 expect(screen.getByRole('alert')).toHaveTextContent('päevikukannet ei leitud');
 expect(screen.getByRole('link', { name: 'Ava õpilase päevik' })).toHaveAttribute('href', '/students/p');
 expect(screen.queryByText('Tund toimus')).not.toBeInTheDocument();
});

it('a „Toimunud” mark without a journal entry can still be cancelled or deleted (admin, 2026-10-09)', () => {
  const onDeleteLesson = vi.fn();
  const onCancelLesson = vi.fn();
  render(<LessonPanel item={{ id: 's', studentId: 'p', studentName: 'Maria', status: 'Toimunud', lessonRecordId: 'gone', recurring: true, occurrenceDate: '2026-10-05', time: '15:00' }} onDeleteLesson={onDeleteLesson} onCancelLesson={onCancelLesson} />);
  expect(screen.getByText(/ilma päevikukandeta/)).toBeInTheDocument();
  screen.getByRole('button', { name: /Kustuta/ }).click();
  expect(onDeleteLesson).toHaveBeenCalled();
  expect(screen.getByRole('button', { name: /Tühista tund/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Muuda aega/ })).toBeNull();
});

it('a lesson with its journal entry keeps the delete buttons hidden', () => {
  render(<LessonPanel item={{ id: 's', studentId: 'p', studentName: 'Maria', status: 'Toimunud', lessonRecordId: 'r1', record: { status: 'Toimunud', topic: 'Kellaaeg' }, occurrenceDate: '2026-10-05', time: '15:00' }} onDeleteLesson={vi.fn()} onCancelLesson={vi.fn()} />);
  expect(screen.queryByRole('button', { name: /Kustuta/ })).toBeNull();
  expect(screen.queryByText(/ilma päevikukandeta/)).toBeNull();
});
