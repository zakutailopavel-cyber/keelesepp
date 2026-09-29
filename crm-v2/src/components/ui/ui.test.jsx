import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
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

  it('keeps focus in a field while the parent re-renders with a new onClose (typing in a form)', () => {
    function Form() {
      const [name, setName] = useState('');
      return <Modal open title="Uus tund" onClose={() => {}}><label>Õpilane<input value={name} onChange={(event) => setName(event.target.value)} /></label></Modal>;
    }
    render(<Form />);
    const input = screen.getByLabelText('Õpilane');
    input.focus();
    fireEvent.change(input, { target: { value: 'd' } });
    expect(input).toHaveFocus();
    fireEvent.change(input, { target: { value: 'de' } });
    expect(input).toHaveFocus();
    expect(input).toHaveValue('de');
  });

  it('closes with Escape using the latest onClose', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Modal open title="Kinnitus" onClose={first}><p>Sisu</p></Modal>);
    rerender(<Modal open title="Kinnitus" onClose={second}><p>Sisu</p></Modal>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });
});
