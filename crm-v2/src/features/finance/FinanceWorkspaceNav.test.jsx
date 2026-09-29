import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import FinanceWorkspaceNav from './FinanceWorkspaceNav.jsx';

describe('FinanceWorkspaceNav', () => {
  it('shows three tabs and the rare tools under Täpsem', () => {
    const onSelect = vi.fn();
    render(<FinanceWorkspaceNav activeSection="kuuarved" onSelect={onSelect} />);
    expect(screen.getByRole('button', { name: 'Kuuarved' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Arved ja maksed' }));
    expect(onSelect).toHaveBeenCalledWith('arved');
    fireEvent.click(screen.getByText('Täpsem'));
    fireEvent.click(screen.getByRole('button', { name: 'Finantsaudit' }));
    expect(onSelect).toHaveBeenCalledWith('audit');
  });

  it('falls back to monthly invoices for an unknown tab', () => {
    render(<FinanceWorkspaceNav activeSection="missing" onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Kuuarved' })).toHaveAttribute('aria-pressed', 'true');
  });
});
