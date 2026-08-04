import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import ParentsPage from './ParentsPage.jsx';

const parents = [
  { id: 'parent-1', role: 'parent', displayName: 'Mari Ema', email: 'ema@example.com', phone: '555', childName: 'Mari', parentReviewStatus: 'checked', parentReviewKey: 'mari', parentContactStatus: 'active', parentContactChannel: 'phone', parentContactNotes: 'Helistada õhtul.' },
  { id: 'parent-2', role: 'parent', displayName: 'Teine Vanem', email: 'teine@example.com', phone: '', childName: 'Karl', parentReviewStatus: 'new', parentReviewKey: '', parentContactStatus: 'new' },
];
const students = [
  { id: 'student-1', name: 'Mari', linkedParentId: 'parent-1', parentUid: 'parent-1', level: 'A1', subject: 'Eesti keel', teacher: 'Õpetaja', active: true },
  { id: 'student-2', name: 'Jaan', level: 'A1', subject: 'Eesti keel', teacher: 'Õpetaja', active: true },
];

function repositories() {
  return {
    repository: {
      list: vi.fn().mockResolvedValue(parents),
      updateCrm: vi.fn().mockResolvedValue(undefined),
      markReviewed: vi.fn().mockResolvedValue(undefined),
      linkStudent: vi.fn().mockResolvedValue(undefined),
      createMissingStudent: vi.fn().mockResolvedValue(undefined),
      mergeDuplicates: vi.fn().mockResolvedValue({ duplicateCount: 1, reassignedStudentCount: 0 }),
    },
    studentRepository: { list: vi.fn().mockResolvedValue({ items: students }) },
    invoiceRepository: { list: vi.fn().mockResolvedValue([{ id: 'invoice-1', studentId: 'student-1', amount: 40, paidAmount: 10 }]) },
    teacherRepository: { list: vi.fn().mockResolvedValue([{ id: 'teacher-1', name: 'Õpetaja' }]) },
  };
}

function renderPage(user, data) {
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><ParentsPage {...data} /></AuthContext.Provider></MemoryRouter>);
}

describe('ParentsPage', () => {
  it('lets an administrator edit CRM contact fields without changing account roles', async () => {
    const data = repositories();
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    await screen.findByText('Mari Ema');
    fireEvent.click(screen.getAllByRole('button', { name: /Muuda/ })[0]);
    const dialog = screen.getByRole('dialog', { name: 'Muuda: Mari Ema' });
    fireEvent.change(within(dialog).getByLabelText('Kontakti staatus'), { target: { value: 'called' } });
    fireEvent.change(within(dialog).getByLabelText('Lapsevanema märkmed'), { target: { value: 'Kõne tehtud.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta' }));

    await waitFor(() => expect(data.repository.updateCrm).toHaveBeenCalledWith(parents[0], expect.objectContaining({ parentContactStatus: 'called', parentContactNotes: 'Kõne tehtud.' }), user));
    expect(await screen.findByRole('status')).toHaveTextContent('salvestati');
  });

  it('shows linked children and lets an administrator add several children without closing the manager', async () => {
    const data = repositories();
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    await screen.findByText('Mari Ema');
    const card = screen.getByText('Mari Ema').closest('.parent-card');
    fireEvent.click(within(card).getByRole('button', { name: /Lisa laps/ }));
    const dialog = screen.getByRole('dialog', { name: 'Lisa laps: Mari Ema' });
    expect(within(dialog).getByText('Juba lisatud lapsed')).toBeInTheDocument();
    expect(within(dialog).getAllByText('Mari').length).toBeGreaterThan(0);
    const jaanRow = within(dialog).getByText('Jaan').closest('section');
    fireEvent.click(within(jaanRow).getByRole('button', { name: 'Lisa' }));

    await waitFor(() => expect(data.repository.linkStudent).toHaveBeenCalledWith(parents[0], students[1], user));
    expect(screen.getByRole('dialog', { name: 'Lisa laps: Mari Ema' })).toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent('lisati lapsevanema laste hulka');
  });

  it('can create a new child from any parent even when the name was not in registration', async () => {
    const data = repositories();
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    await screen.findByText('Mari Ema');
    const card = screen.getByText('Mari Ema').closest('.parent-card');
    fireEvent.click(within(card).getByRole('button', { name: /Lisa laps/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Lisa laps: Mari Ema' })).getByRole('button', { name: /Loo uus lapse kaart/ }));
    const dialog = screen.getByRole('dialog', { name: 'Loo õpilase kaart: Mari Ema' });
    fireEvent.change(within(dialog).getByLabelText('Lapse nimi'), { target: { value: 'Kati' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Loo ja seo' }));
    await waitFor(() => expect(data.repository.createMissingStudent).toHaveBeenCalledWith(
      parents[0],
      expect.objectContaining({ name: 'Kati', teacherUid: 'teacher-1', teacher: 'Õpetaja' }),
      students,
      user,
    ));
  });

  it('creates a missing requested child only after an administrator selects a directory teacher', async () => {
    const data = repositories();
    const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
    renderPage(user, data);
    await screen.findAllByText('Teine Vanem');
    const queue = screen.getByText('Uued registreeringud').closest('.parent-review-queue');
    fireEvent.click(within(queue).getByRole('button', { name: 'Loo kaart' }));
    const dialog = screen.getByRole('dialog', { name: 'Loo õpilase kaart: Teine Vanem' });
    expect(within(dialog).getByLabelText('Lapse nimi')).toHaveValue('Karl');
    expect(within(dialog).getByLabelText('Õpetaja')).toHaveValue('teacher-1');
    fireEvent.change(within(dialog).getByLabelText('Sihttase'), { target: { value: 'A2' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Loo ja seo' }));
    await waitFor(() => expect(data.repository.createMissingStudent).toHaveBeenCalledWith(
      parents[1],
      expect.objectContaining({ name: 'Karl', teacherUid: 'teacher-1', teacher: 'Õpetaja', targetLevel: 'A2' }),
      students,
      user,
    ));
  });

  it('shows a teacher only parents linked to teacher-scoped students and no finance or admin actions', async () => {
    const data = repositories();
    renderPage({ uid: 'teacher-1', displayName: 'Õpetaja', roles: ['teacher'] }, data);
    expect(await screen.findByText('Mari Ema')).toBeInTheDocument();
    expect(screen.queryByText('Teine Vanem')).not.toBeInTheDocument();
    expect(data.studentRepository.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' }));
    expect(data.invoiceRepository.list).not.toHaveBeenCalled();
    expect(data.teacherRepository.list).not.toHaveBeenCalled();
    expect(screen.queryByText('Tasumata jääk')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Muuda/ })).not.toBeInTheDocument();
  });
});
