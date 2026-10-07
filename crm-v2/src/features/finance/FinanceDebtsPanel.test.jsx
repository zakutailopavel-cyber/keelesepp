import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import FinanceDebtsPanel from './FinanceDebtsPanel.jsx';
import { pastDueInvoices } from './financeDebts.js';

vi.mock('./BankReconciliationPanel.jsx', () => ({ default: ({ onAllocate, onReload }) => <button type="button" onClick={async () => { await onAllocate({ requestId: 'bank-1' }); await onReload(); }}>Seo testmakse</button> }));

const invoices = [
  { id: 'old', planMonth: '2031-09', studentName: 'Mari', num: 'AR-1', amountCents: 10000, paidAmountCents: 2000, due: '2031-09-10' },
  { id: 'paid', planMonth: '2031-08', studentName: 'Jaan', amountCents: 5000, paidAmountCents: 5000, due: '2031-08-10' },
  { id: 'current', planMonth: '2031-10', studentName: 'Sofia', amountCents: 6000, due: '2031-10-10' },
];

describe('FinanceDebtsPanel', () => {
  it('shows only unpaid invoices from earlier months', () => {
    expect(pastDueInvoices(invoices, '2031-10').map((item) => item.id)).toEqual(['old']);
    render(<FinanceDebtsPanel month="2031-10" invoices={invoices} students={[]} transactions={[]} onAllocate={vi.fn()} onReload={vi.fn()} onRemind={vi.fn()} />);
    const table = screen.getByRole('table', { name: 'Võlgnevused' });
    expect(within(table).getByText('Mari')).toBeInTheDocument();
    expect(within(table).queryByText('Sofia')).not.toBeInTheDocument();
  });

  it('imports a bank row and requests an immediate debt refresh', async () => {
    const onAllocate = vi.fn().mockResolvedValue({}); const onReload = vi.fn().mockResolvedValue({});
    render(<FinanceDebtsPanel month="2031-10" invoices={invoices} students={[]} transactions={[]} onAllocate={onAllocate} onReload={onReload} onRemind={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Impordi pank/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Seo testmakse' })); });
    expect(onAllocate).toHaveBeenCalledWith({ requestId: 'bank-1' });
    expect(onReload).toHaveBeenCalled();
  });
});
