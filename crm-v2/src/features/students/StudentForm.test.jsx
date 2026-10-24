import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StudentForm from './StudentForm.jsx';

const baseProps = { open: true, onClose: () => {}, onSubmit: async () => {} };

describe('student form business options', () => {
  it('uses the levels from the legacy CRM', () => {
    render(<StudentForm {...baseProps} canAssignTeacher />);
    const currentLevel = screen.getByLabelText('Praegune tase');
    const options = [...currentLevel.options].map((option) => option.value);
    expect(options).toContain('Eelkool');
    expect(options).not.toContain('C2');
  });

  it('does not let a teacher reassign a student', () => {
    render(<StudentForm {...baseProps} defaultTeacher="Pavel Zakutailo" />);
    expect(screen.getByLabelText('Õpetaja')).toBeDisabled();
    expect(screen.getByLabelText('Õpetaja')).toHaveValue('Pavel Zakutailo');
  });

  it('lets an administrator choose a teacher', () => {
    render(<StudentForm {...baseProps} canAssignTeacher teachers={['Pavel', 'Jelena']} />);
    expect(screen.getByLabelText('Õpetaja')).toBeEnabled();
    expect(screen.getByRole('option', { name: 'Jelena' })).toBeInTheDocument();
  });

  it('sets the lesson recording consent in the form', async () => {
    const onSubmit = vi.fn(async () => {});
    render(<StudentForm {...baseProps} showConsent student={{ id: 's1', name: 'Mari', recordingConsent: false }} onSubmit={onSubmit} />);
    const box = screen.getByRole('checkbox', { name: /Tundi võib salvestada/ });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ recordingConsent: true })));
  });

  it('validates required and contact fields before submitting', async () => {
    const onSubmit = vi.fn();
    render(<StudentForm {...baseProps} onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByText('Nimi on kohustuslik.')).toBeInTheDocument();
    expect(screen.getByLabelText('Õpilase nimi *')).toHaveFocus();
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Õpilase nimi *'), { target: { value: 'Mari' } });
    expect(screen.queryByText('Nimi on kohustuslik.')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByText('Kontrolli e-posti aadressi.')).toBeInTheDocument();
    expect(screen.getByText('Kontrolli telefoninumbrit.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('blocks repeat submission and exposes a service error', async () => {
    let rejectSubmit;
    const onSubmit = vi.fn(() => new Promise((resolve, reject) => { rejectSubmit = reject; }));
    render(<StudentForm {...baseProps} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Õpilase nimi *'), { target: { value: 'Mari' } });
    const submit = screen.getByRole('button', { name: 'Salvesta' });

    fireEvent.click(submit);
    await waitFor(() => expect(submit).toBeDisabled());
    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    rejectSubmit(new Error('Salvestamine ebaõnnestus'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Salvestamine ebaõnnestus');
    expect(submit).toBeEnabled();
  });

  it('warns before a second card for a child who already has one (Oleksiy 2026-10-24)', () => {
    const existing = [{ id: 'm1', name: 'Milan Grozovski', active: true, subject: 'Eesti keel', teacher: 'Pavel Zakutailo' }];
    render(<MemoryRouter><StudentForm {...baseProps} canAssignTeacher existingStudents={existing} /></MemoryRouter>);
    expect(screen.queryByText(/Sama nimega õpilane on juba olemas/)).toBeNull();
    fireEvent.change(screen.getByLabelText('Õpilase nimi *'), { target: { value: 'Milan' } });
    expect(screen.getByText(/Sama nimega õpilane on juba olemas/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Milan Grozovski' })).toHaveAttribute('href', '/students/m1?enrollments=1');
  });

  it('on a card with two subjects it says the form edits the main subject only', () => {
    const student = { id: 's1', name: 'Milan', subject: 'Eesti keel', teacher: 'Pavel Zakutailo', enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel Zakutailo' }, { subject: 'Inglise keel', teacher: 'Anhelina Korotka' }] };
    render(<MemoryRouter><StudentForm {...baseProps} canAssignTeacher student={student} existingStudents={[{ id: 'x', name: 'Milan', active: true }]} /></MemoryRouter>);
    expect(screen.getByText(/Teised ained: Inglise keel – Anhelina Korotka/)).toBeInTheDocument();
    expect(screen.queryByText(/Sama nimega õpilane/)).toBeNull();
  });
});

