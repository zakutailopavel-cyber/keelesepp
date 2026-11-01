import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { shiftDate, toIsoDate } from '../calendar/calendarView.js';
import ParentDashboardPage from './ParentDashboardPage.jsx';

describe('ParentDashboardPage', () => {
  it('loads only explicitly owned students and summarizes their lessons, homework and invoices', async () => {
    const today = toIsoDate();
    const studentRepository = { listOwned: vi.fn().mockResolvedValue([{ id: 'student-1', name: 'Mari', subject: 'Eesti keel', level: 'A1', targetLevel: 'A2', teacher: 'Õpetaja' }]) };
    const homeworkRepository = { listByStudentIds: vi.fn().mockResolvedValue([{ id: 'homework-1', studentId: 'student-1', studentName: 'Mari', task: 'Õpi sõnad', due: shiftDate(today, 2), status: 'Ootel' }]) };
    const scheduleRepository = { listByStudent: vi.fn().mockResolvedValue([{ id: 'schedule-1', studentId: 'student-1', studentName: 'Mari', teacher: 'Õpetaja', date: shiftDate(today, 1), time: '16:00', duration: 60, status: 'Planeeritud' }]) };
    const invoiceRepository = { listByStudent: vi.fn().mockResolvedValue([{ id: 'invoice-1', studentId: 'student-1', amount: 40, paidAmount: 10 }]) };
    const user = { uid: 'parent-1', displayName: 'Mari Ema', roles: ['parent'] };

    render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentDashboardPage studentRepository={studentRepository} homeworkRepository={homeworkRepository} scheduleRepository={scheduleRepository} invoiceRepository={invoiceRepository} /></AuthContext.Provider></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Tere, Mari Ema!' })).toBeInTheDocument();
    expect(screen.getByText('Õpi sõnad')).toBeInTheDocument();
    expect(screen.getAllByText(/30,00/).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Arved' })).toBeInTheDocument();
    expect(screen.getByText('Tasumata', { selector: '.badge' })).toBeInTheDocument();
    expect(screen.getByText('Eesti keel')).toBeInTheDocument();
    expect(screen.getByText('A1 → A2')).toBeInTheDocument();
    expect(screen.getByText('Õpetaja')).toBeInTheDocument();
    expect(studentRepository.listOwned).toHaveBeenCalledWith('parent-1');
    expect(homeworkRepository.listByStudentIds).toHaveBeenCalledWith(['student-1']);
    expect(scheduleRepository.listByStudent).toHaveBeenCalledWith('student-1');
    expect(invoiceRepository.listByStudent).toHaveBeenCalledWith('student-1');
  });

  it('lists the family\'s invoices with their state and leaves out cancelled and credited ones', async () => {
    const studentRepository = { listOwned: vi.fn().mockResolvedValue([{ id: 'student-1', name: 'Mari' }]) };
    const empty = { listByStudentIds: vi.fn().mockResolvedValue([]), listByStudent: vi.fn().mockResolvedValue([]) };
    const invoiceRepository = { listByStudent: vi.fn().mockResolvedValue([
      { id: 'i1', num: 'KS-1', studentId: 'student-1', amountCents: 9000, paidAmountCents: 9000, status: 'Makstud', date: '2026-10-01' },
      { id: 'i2', num: 'KS-2', studentId: 'student-1', amountCents: 9000, paidAmountCents: 0, status: 'Ootel', date: '2026-10-02', due: '2020-01-01' },
      { id: 'i3', num: 'KS-3', studentId: 'student-1', amountCents: 9000, balanceDueCents: 0, status: 'Krediteeritud', date: '2026-10-03' },
      { id: 'i4', num: 'KS-4', studentId: 'student-1', amountCents: 9000, status: 'Tühistatud', date: '2026-10-04' },
    ]) };
    const user = { uid: 'parent-1', displayName: 'Mari Ema', roles: ['parent'] };
    render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentDashboardPage studentRepository={studentRepository} homeworkRepository={empty} scheduleRepository={empty} invoiceRepository={invoiceRepository} lessonRepository={empty} /></AuthContext.Provider></MemoryRouter>);
    const card = (await screen.findByRole('heading', { name: 'Arved' })).closest('.card, section, article') || document.body;
    expect(within(card).getByText(/Arve KS-1/)).toBeInTheDocument();
    expect(within(card).getByText('Tasutud')).toBeInTheDocument();
    expect(within(card).getByText('Tähtaeg möödas')).toBeInTheDocument();
    expect(screen.queryByText(/Arve KS-3/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Arve KS-4/)).not.toBeInTheDocument();
  });

  it('shows parents the last lessons, absences included: Õppevara topic, note, or "Individuaalne tund"', async () => {
    const studentRepository = { listOwned: vi.fn().mockResolvedValue([{ id: 'student-1', name: 'Mari' }]) };
    const empty = { listByStudentIds: vi.fn().mockResolvedValue([]), listByStudent: vi.fn().mockResolvedValue([]) };
    const lessonRepository = { listByStudent: vi.fn().mockResolvedValue([
      { id: 'l1', studentId: 'student-1', date: '2026-09-28', time: '16:00', status: 'Toimunud', topic: 'Partitiiv toidu juures', topicLevel: 'B1', topicModule: 'Toit ja teenindus', notes: 'Harjutasime tellimist kohvikus.' },
      { id: 'l2', studentId: 'student-1', date: '2026-09-21', time: '16:00', status: 'Toimunud', topic: 'Individuaalne tund', notes: 'Kooli kodutöö.' },
      { id: 'l3', studentId: 'student-1', date: '2026-09-14', time: '16:00', status: 'Puudus_eta', topic: '' },
      { id: 'l4', studentId: 'student-1', date: '2026-09-07', time: '16:00', status: 'Puudus_p', topic: '' },
    ]) };
    const user = { uid: 'parent-1', displayName: 'Mari Ema', roles: ['parent'] };
    render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentDashboardPage studentRepository={studentRepository} homeworkRepository={empty} scheduleRepository={empty} invoiceRepository={empty} lessonRepository={lessonRepository} /></AuthContext.Provider></MemoryRouter>);

    expect(await screen.findByRole('heading', { name: 'Viimased tunnid' })).toBeInTheDocument();
    expect(screen.getByText('Partitiiv toidu juures')).toBeInTheDocument();
    expect(screen.getByText(/B1 · Toit ja teenindus/)).toBeInTheDocument();
    expect(screen.getByText('Harjutasime tellimist kohvikus.')).toBeInTheDocument();
    expect(screen.getByText('Individuaalne tund')).toBeInTheDocument();
    expect(screen.getAllByText('Toimus')).toHaveLength(2);
    // a missed lesson is shown too, with the same meaning as in the calendar
    expect(screen.getByText('Puudus (ei teatanud)')).toBeInTheDocument();
    expect(screen.getByText('Puudus (teatas ette)')).toBeInTheDocument();
    expect(screen.getAllByText('Tund jäi vahele')).toHaveLength(2);
  });

  it('an administrator\'s preview does not ask the parent\'s recording question', async () => {
    const studentRepository = { listOwned: vi.fn().mockResolvedValue([{ id: 's1', name: 'Mia', linkedParentId: 'parent-1' }]) };
    const empty = { listByStudentIds: vi.fn().mockResolvedValue([]), listByStudent: vi.fn().mockResolvedValue([]) };
    const user = { uid: 'parent-1', displayName: 'Ema', roles: ['parent'] };
    const page = (auth) => <MemoryRouter><AuthContext.Provider value={auth}><ParentDashboardPage studentRepository={studentRepository} homeworkRepository={empty} scheduleRepository={empty} invoiceRepository={empty} lessonRepository={empty} /></AuthContext.Provider></MemoryRouter>;
    const own = render(page({ user }));
    expect(await screen.findByRole('dialog', { name: /Tunni salvestamine/ })).toBeInTheDocument();
    own.unmount();
    render(page({ user, preview: { readOnly: true } }));
    expect(await screen.findByRole('heading', { name: 'Minu õpilased' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /Tunni salvestamine/ })).toBeNull();
  });

  it('one child with two subjects: one card, a subject switcher, each subject with its own lessons and homework', async () => {
    const today = toIsoDate();
    const studentRepository = { listOwned: vi.fn().mockResolvedValue([{ id: 's1', name: 'Stefania', subject: 'Eesti keel', teacher: 'Pavel', enrollments: [
      { subject: 'Eesti keel', teacher: 'Pavel', teacherUid: 'p1', level: 'A2' }, { subject: 'Matemaatika', teacher: 'Yelyzaveta', teacherUid: 'y1', level: '5. klass' }] }]) };
    const homeworkRepository = { listByStudentIds: vi.fn().mockResolvedValue([
      { id: 'h1', studentId: 's1', task: 'Õpi sõnad', subject: 'Eesti keel', due: shiftDate(today, 2), status: 'Ootel' },
      { id: 'h2', studentId: 's1', task: 'Murrud lk 12', subject: 'Matemaatika', due: shiftDate(today, 2), status: 'Ootel' }]) };
    // an old schedule entry without a subject is placed by its teacher
    const scheduleRepository = { listByStudent: vi.fn().mockResolvedValue([
      { id: 'e1', studentId: 's1', teacher: 'Pavel', teacherUid: 'p1', date: shiftDate(today, 1), time: '15:00', duration: 60, status: 'Planeeritud' },
      { id: 'm1', studentId: 's1', teacher: 'Yelyzaveta', teacherUid: 'y1', date: shiftDate(today, 2), time: '17:00', duration: 60, status: 'Planeeritud' }]) };
    const empty = { listByStudent: vi.fn().mockResolvedValue([]) };
    const user = { uid: 'parent-1', displayName: 'Ema', roles: ['parent'] };
    render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentDashboardPage studentRepository={studentRepository} homeworkRepository={homeworkRepository} scheduleRepository={scheduleRepository} invoiceRepository={empty} /></AuthContext.Provider></MemoryRouter>);
    const tabs = await screen.findByRole('tablist', { name: 'Näita õppeainet' });
    expect(within(tabs).getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Kõik', 'Eesti keel', 'Matemaatika']);
    expect(screen.getByText('Õpi sõnad')).toBeInTheDocument();
    expect(screen.getByText('Murrud lk 12')).toBeInTheDocument();
    fireEvent.click(within(tabs).getByRole('tab', { name: 'Matemaatika' }));
    expect(screen.queryByText('Õpi sõnad')).toBeNull();
    expect(screen.getByText('Murrud lk 12')).toBeInTheDocument();
    expect(screen.getByText(/17:00/)).toBeInTheDocument();
    expect(screen.queryByText(/15:00/)).toBeNull();
  });
});
