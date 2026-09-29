import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import FinanceWorkspacePage from './FinanceWorkspacePage.jsx';

vi.mock('./FinancePage.jsx', () => ({
  default: ({ section }) => <div id="arved">Finantsvaate sisu: {section}</div>,
}));

describe('finance workspace integration', () => {
  it('renders grouped navigation together with the finance page', () => {
    render(<FinanceWorkspacePage />);

    expect(screen.getByRole('navigation', { name: 'Finantsmooduli jaotised' })).toBeInTheDocument();
    expect(screen.getByText('Finantsvaate sisu: kuuarved')).toBeInTheDocument();
  });

  it('updates the hash and active state when a section is selected', () => {
    const replaceState = vi.spyOn(window.history, 'replaceState');
    window.requestAnimationFrame = (callback) => callback();
    document.getElementById = vi.fn().mockReturnValue({ scrollIntoView: vi.fn() });

    render(<FinanceWorkspacePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Arved ja maksed' }));

    expect(replaceState).toHaveBeenCalledWith(null, '', '#arved');
    expect(screen.getByRole('button', { name: 'Arved ja maksed' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Finantsvaate sisu: arved')).toBeInTheDocument();
  });
});
