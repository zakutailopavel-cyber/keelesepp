import { fireEvent, render, screen } from '@testing-library/react';
import Button from './Button.jsx';
import Input from './Input.jsx';
import Modal from './Modal.jsx';
import Select from './Select.jsx';

describe('shared UI safety and accessibility', () => {
  it('does not submit a form unless the button explicitly opts in', () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(<form onSubmit={onSubmit}><Button>Abinupp</Button></form>);
    fireEvent.click(screen.getByRole('button', { name: 'Abinupp' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('associates a field error with its input', () => {
    render(<Input label="E-post" name="email" error="Kontrolli aadressi" />);
    const input = screen.getByLabelText('E-post');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
    expect(screen.getByRole('alert')).toHaveAttribute('id', 'email-error');
  });

  it('announces a select error and associates it with the control', () => {
    render(<Select label="Tase" name="level" error="Vali tase"><option value="">Määramata</option></Select>);
    const select = screen.getByLabelText('Tase');
    expect(select).toHaveAttribute('aria-describedby', 'level-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Vali tase');
  });

  it('moves focus into a modal and closes it with Escape', () => {
    const onClose = vi.fn();
    render(<Modal open title="Kinnitus" onClose={onClose}><p>Sisu</p></Modal>);
    expect(screen.getByRole('button', { name: 'Sulge' })).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
