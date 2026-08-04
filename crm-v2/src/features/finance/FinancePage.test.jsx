import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import FinancePage from './FinancePage.jsx';

const invoice = {
  id: 'invoice-1',
  num: 'KS-101',
  studentId: 'student-1',
  studentName: 'Sofia Tamm',
  payerName: 'Maarika Tamm',
  amountCents: 12000,
  paidAmountCents: 4000,
  balanceDueCents: 8000,
  date: '2026-08-01',
  due: '2026-08-10',
};

function renderPage(financeRepository = { recordPayment: vi.fn().mockResolvedValue({}) }) {
  const invoiceRepository = { list: vi.fn().mockResolvedValue([invoice]) };
  const paymentRepository = { listByInvoice: vi.fn().mockResolvedValue([{ id: 'payment-1', amountCents: 4000, paidAt: '2026-08-03', method: 'bank', status: 'active' }]) };
  const user = { uid: 'admin-1', roles: ['admin'] };
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><FinancePage invoiceRepository={invoiceRepository} paymentRepository={paymentRepository} financeRepository={financeRepository} /></AuthContext.Provider></MemoryRouter>);
  return { financeRepository, invoiceRepository, paymentRepository };
}

describe('FinancePage', () => {
  it('opens invoice details and shows its payment history', async () => {
    const repositories = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    const dialog = await screen.findByRole('dialog', { name: 'Arve KS-101' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Maarika Tamm')).toBeInTheDocument();
    expect((await within(dialog).findAllByText('40,00 €')).length).toBeGreaterThan(0);
    expect(repositories.paymentRepository.listByInvoice).toHaveBeenCalledWith('invoice-1');
  });

  it('sends a payment through the trusted finance repository', async () => {
    const financeRepository = { recordPayment: vi.fn().mockResolvedValue({}) };
    renderPage(financeRepository);
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    fireEvent.click(screen.getByRole('button', { name: /Registreeri makse/ }));
    fireEvent.change(screen.getByLabelText('Laekunud summa (€)'), { target: { value: '25,50' } });
    fireEvent.click(screen.getByRole('button', { name: /Kinnita makse/ }));
    await waitFor(() => expect(financeRepository.recordPayment).toHaveBeenCalledWith('invoice-1', expect.objectContaining({ amount: 25.5, method: 'bank' })));
    await screen.findByRole('status');
  });
});
