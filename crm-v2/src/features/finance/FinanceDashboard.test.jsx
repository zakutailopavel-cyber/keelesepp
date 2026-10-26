import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import FinanceDashboard from './FinanceDashboard.jsx';

describe('FinanceDashboard', () => {
  it('shows this month, the forecast and a month detail; can be hidden', async () => {
    const repository = { payments: vi.fn(async () => [{ invoiceId: 'i1', amountCents: 10000, paidAt: '2026-10-04', status: 'active' }]), schedule: vi.fn(async () => [{ id: 'w1', studentId: 's1', recurring: true, day: 'Mon', startDate: '2026-09-01', time: '17:00', duration: 60, status: 'Planeeritud' }]), groups: vi.fn(async () => []) };
    render(<FinanceDashboard today={new Date('2026-10-26T12:00:00')} repository={repository}
      invoices={[{ id: 'i1', date: '2026-10-02', amountCents: 12000 }]} students={[{ id: 's1', name: 'Mia', active: true }]} plans={[{ studentId: 's1', lessonPriceCents: 2500, billingMode: 'advance' }]} lessons={[]} />);
    expect(await screen.findByText('Arveldatud oktoober 2026')).toBeInTheDocument();
    expect(screen.getByText('Prognoos november 2026')).toBeInTheDocument();
    expect(screen.getByTestId('fd-detail')).toHaveTextContent('oktoober 2026 · arveldatud 120 € (1 arvet) · laekunud 100 €');
    fireEvent.click(screen.getByRole('button', { name: /november 2026: prognoos/ }));
    expect(screen.getByTestId('fd-detail')).toHaveTextContent('prognoos 125 € · 1 õpilast, 5 tundi');
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Peida/ })); });
    expect(screen.queryByText('Prognoos november 2026')).toBeNull();
  });
});
