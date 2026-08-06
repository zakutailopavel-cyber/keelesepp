import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import FinanceWorkspaceNav from './FinanceWorkspaceNav.jsx';


describe('FinanceWorkspaceNav', () => {
  it('renders finance work in user-priority groups', () => {
    render(<FinanceWorkspaceNav activeSection="tunniarvestus" onSelect={vi.fn()} />);

    expect(screen.getByText('Igapäevane töö')).toBeInTheDocument();
    expect(screen.getByText('Ülevaated')).toBeInTheDocument();
    expect(screen.getByText('Täpsemad toimingud')).toBeInTheDocument();

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveTextContent('Loo arved');
    expect(buttons[1]).toHaveTextContent('Arved ja maksed');
    expect(buttons.at(-1)).toHaveTextContent('Arvete numeratsioon');
  });

  it('marks the active section and reports selection', () => {
    const onSelect = vi.fn();
    render(<FinanceWorkspaceNav activeSection="arved" onSelect={onSelect} />);

    expect(screen.getByRole('button', { name: 'Arved ja maksed' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Loo arved' })).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'Kuuülevaade' }));

    expect(onSelect).toHaveBeenCalledWith('perioodid');
  });

  it('falls back to the default section for an unknown value', () => {
    render(<FinanceWorkspaceNav activeSection="missing" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Loo arved' })).toHaveAttribute('aria-pressed', 'true');
  });
});
