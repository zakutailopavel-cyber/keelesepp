import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

  it('corrects an earlier invoice due date with a reason and reloads the debts', async () => {
    const onCorrectDueDate = vi.fn().mockResolvedValue({}); const onReload = vi.fn().mockResolvedValue({});
    render(<FinanceDebtsPanel month="2031-10" invoices={invoices} students={[]} transactions={[]} onAllocate={vi.fn()} onReload={onReload} onRemind={vi.fn()} onCorrectDueDate={onCorrectDueDate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-1' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Uus maksetähtaeg'), { target: { value: '2031-10-20' } });
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'Kokkulepitud uus maksetähtaeg' } });
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta tähtaeg' })); });
    expect(onCorrectDueDate).toHaveBeenCalledWith(invoices[0], '2031-10-20', 'Kokkulepitud uus maksetähtaeg');
    expect(onReload).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Maksetähtaeg parandati');
  });

  it('offers cancellation only for eligible old invoices', () => {
    const onCancel = vi.fn();
    render(<FinanceDebtsPanel month="2031-10" invoices={[...invoices, { id: 'voidable', planMonth: '2031-08', billingMode: 'monthly_plan_v1', num: 'AR-4', amountCents: 7000, due: '2031-08-10' }]} students={[]} transactions={[]} onAllocate={vi.fn()} onReload={vi.fn()} onRemind={vi.fn()} onCancel={onCancel} />);
    expect(screen.queryByRole('button', { name: 'Tühista arve AR-1' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tühista arve AR-4' }));
    expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ id: 'voidable' }));
  });

  it('credits an incorrect lesson line and refreshes the debt', async () => {
    const invoice = { ...invoices[0], lines: [{ lessonId: 'lesson-1', date: '2031-09-01', amountCents: 8000, description: 'Keeletund' }] };
    const onCreditLessonLine = vi.fn().mockResolvedValue({}); const onReload = vi.fn().mockResolvedValue({});
    render(<FinanceDebtsPanel month="2031-10" invoices={[invoice]} students={[]} transactions={[]} onAllocate={vi.fn()} onReload={onReload} onRemind={vi.fn()} onCreditLessonLine={onCreditLessonLine} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-1' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('radio'));
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'Tund jäi tegelikult ära' } });
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Krediteeri tunnirida' })); });
    expect(onCreditLessonLine).toHaveBeenCalledWith(invoice, 'lesson-1', 'Tund jäi tegelikult ära');
    expect(onReload).toHaveBeenCalledOnce();
  });

  it('keeps the edit dialog open when the correction API rejects it', async () => {
    const onCorrectDueDate = vi.fn().mockRejectedValue(new Error('Financial period is closed'));
    render(<FinanceDebtsPanel month="2031-10" invoices={invoices} students={[]} transactions={[]} onAllocate={vi.fn()} onReload={vi.fn()} onRemind={vi.fn()} onCorrectDueDate={onCorrectDueDate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-1' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Uus maksetähtaeg'), { target: { value: '2031-10-20' } });
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'Kokkulepitud uus maksetähtaeg' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta tähtaeg' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Financial period is closed');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Salvesta tähtaeg' })).not.toBeDisabled());
  });
});
