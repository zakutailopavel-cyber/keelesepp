import { render, screen } from '@testing-library/react';
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
});
