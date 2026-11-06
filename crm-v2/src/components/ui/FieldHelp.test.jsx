import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FieldHelp from './FieldHelp.jsx';
import Input from './Input.jsx';
import Modal from './Modal.jsx';
import Select from './Select.jsx';

describe('FieldHelp „?”', () => {
  it('opens a short help with an example and closes it with Escape, the focus back on „?”', () => {
    render(<FieldHelp label="Grupi nimi" text="Lühike nimi." example="Eesti keel B1" />);
    const button = screen.getByRole('button', { name: 'Abi: Grupi nimi' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(button);
    const tip = screen.getByRole('dialog', { name: 'Grupi nimi' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('aria-controls', tip.id);
    expect(tip).toHaveTextContent('Lühike nimi.');
    expect(tip).toHaveTextContent('Näide: Eesti keel B1');
    expect(tip).toHaveFocus();
    fireEvent.keyDown(tip, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });

  it('a second tap or a tap outside closes it', () => {
    render(<div><FieldHelp label="Kohti" text="Mitu õpilast." /><p>väljas</p></div>);
    const button = screen.getByRole('button', { name: 'Abi: Kohti' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(button);
    fireEvent.pointerDown(screen.getByText('väljas'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens from the keyboard (Enter on the button)', () => {
    render(<FieldHelp label="Tase" text="Keeletase." />);
    const button = screen.getByRole('button', { name: 'Abi: Tase' });
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter' });
    fireEvent.click(button); // a native button turns Enter / Space into a click
    expect(screen.getByRole('dialog', { name: 'Tase' })).toBeInTheDocument();
  });

  it('Escape inside a Modal closes only the help, not the window', () => {
    const onClose = vi.fn();
    render(<Modal open title="Uus grupp" onClose={onClose}><Input label="Grupi nimi" help="Lühike nimi." /></Modal>);
    fireEvent.click(screen.getByRole('button', { name: 'Abi: Grupi nimi' }));
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Grupi nimi' }), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Uus grupp' })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText('Grupi nimi'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('Input and Select take `help`; the label still names the control; no help, no button', () => {
    render(<><Input label="Grupi nimi" help="Nimi." helpExample="B1" /><Select label="Tase" help="Tase."><option>A1</option></Select><Input label="Muu" /></>);
    expect(screen.getByLabelText('Grupi nimi').tagName).toBe('INPUT');
    expect(screen.getByLabelText('Tase').tagName).toBe('SELECT');
    expect(screen.getByRole('button', { name: 'Abi: Grupi nimi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abi: Tase' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Abi: Muu' })).not.toBeInTheDocument();
  });

  it('renders nothing without a text', () => {
    const { container } = render(<FieldHelp label="X" text="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
