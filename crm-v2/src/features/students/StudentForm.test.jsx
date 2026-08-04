import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
});
