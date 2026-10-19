import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

it('the student name opens the student card (admin, 2026-10-17)', () => {
  render(<LessonPanel item={{ id: 's', studentId: 'p', studentName: 'Maria', status: 'Planeeritud', occurrenceDate: '2026-10-05', time: '15:00' }} student={{ id: 'p', name: 'Maria' }} />);
  expect(screen.getByRole('link', { name: 'Maria' })).toHaveAttribute('href', '/students/p');
});

it('the lesson panel names the subject (owner chat 2026-10-17)', () => {
  render(<LessonPanel item={{ id: 's', studentId: 'p', studentName: 'Maria', subject: 'Inglise keel', teacher: 'Kati', status: 'Planeeritud', occurrenceDate: '2026-10-05', time: '15:00' }} student={{ id: 'p', name: 'Maria' }} />);
  expect(screen.getByLabelText('Õppeaine: Inglise keel')).toHaveTextContent('EN');
  expect(screen.getByText('Inglise keel')).toBeInTheDocument();
});

it('„Kooli kulul”: admin marks a held lesson as paid by the school, with a reason', async () => {
  const onSchoolCovered = vi.fn().mockResolvedValue(true);
  const item = { id: 's', studentId: 'p', studentName: 'Maria', status: 'Toimunud', lessonRecordId: 'r1', record: { id: 'r1', status: 'Toimunud', topic: 'Kellaaeg' }, occurrenceDate: '2026-10-05', time: '15:00' };
  const { rerender } = render(<LessonPanel item={item} onSchoolCovered={onSchoolCovered} />);
  fireEvent.click(screen.getByRole('button', { name: /Kooli kulul/ }));
  const confirm = screen.getByRole('button', { name: /Kinnita: kooli kulul/ });
  expect(confirm).toBeDisabled();
  fireEvent.change(screen.getByLabelText(/Põhjus/), { target: { value: 'proovitund' } });
  fireEvent.click(confirm);
  await waitFor(() => expect(onSchoolCovered).toHaveBeenCalledWith('school_covered', 'proovitund'));
  rerender(<LessonPanel item={{ ...item, record: { ...item.record, billingStatus: 'school_covered', billingDispositionReason: 'proovitund' } }} onSchoolCovered={onSchoolCovered} />);
  expect(screen.getByText(/Toimunud · kooli kulul/)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Tühista „kooli kulul”/ })).toBeInTheDocument();
});

it('„Kooli kulul” is not offered without the admin handler', () => {
  render(<LessonPanel item={{ id: 's', studentId: 'p', studentName: 'Maria', status: 'Toimunud', lessonRecordId: 'r1', record: { id: 'r1', status: 'Toimunud' }, occurrenceDate: '2026-10-05', time: '15:00' }} />);
  expect(screen.queryByRole('button', { name: /Kooli kulul/ })).toBeNull();
});
