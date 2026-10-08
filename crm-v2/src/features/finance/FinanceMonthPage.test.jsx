import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import FinanceMonthPage from './FinanceMonthPage.jsx';

vi.mock('./monthlyBilling.js', async (importOriginal) => ({ ...(await importOriginal()), defaultBillingMonth: () => '2031-10' }));
vi.mock('./PricePrivacyBanner.jsx', () => ({ default: () => null }));
vi.mock('./ManualInvoiceDialog.jsx', () => ({ default: () => <button type="button">Lisa arve</button> }));
vi.mock('./MonthlyInvoicePanel.jsx', () => ({ default: () => <section aria-label="Kuuarvete koostamine">Kuuarved</section> }));

const emptyList = { list: vi.fn().mockResolvedValue([]) };
const props = () => ({
  invoiceRepository: { list: vi.fn().mockResolvedValue([{ id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', payerEmail: 'payer@example.com', num: 'AR-31', amountCents: 10000, paidCents: 0, due: '2020-10-01' }]) },
  financeRepository: { recordPayment: vi.fn().mockResolvedValue({}) },
  manualInvoiceRepository: { cancel: vi.fn().mockResolvedValue({}) },
  deliveryRepository: { send: vi.fn().mockResolvedValue({}), remind: vi.fn().mockResolvedValue({}) },
  planRepository: emptyList,
  studentRepository: { list: vi.fn().mockResolvedValue({ items: [] }) },
  lessonRepository: { listForBilling: vi.fn().mockResolvedValue([]) },
  bankRepository: emptyList,
  periodRepository: emptyList,
  creditRepository: { list: vi.fn().mockResolvedValue([]), listRefunds: vi.fn().mockResolvedValue([]) },
  creditNoteRepository: emptyList,
  auditRepository: emptyList,
});

const renderPage = (value, route = '/') => render(<MemoryRouter initialEntries={[route]}><AuthContext.Provider value={{ user: { uid: 'a1', roles: ['admin'] } }}><FinanceMonthPage {...value} /></AuthContext.Provider></MemoryRouter>);

describe('FinanceMonthPage', () => {
  it('registers a payment and refreshes the month', async () => {
    const value = props(); renderPage(value);
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    fireEvent.click(within(table).getByRole('button', { name: 'Makse' }));
    const dialog = screen.getByRole('dialog');
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Registreeri' })); });
    expect(value.financeRepository.recordPayment).toHaveBeenCalledWith('i1', expect.objectContaining({ amount: 100, method: 'bank' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Makse registreeriti'));
    expect(value.invoiceRepository.list).toHaveBeenCalledTimes(2);
  });

  it('sends an overdue reminder from the invoice row', async () => {
    const value = props(); renderPage(value, '/finance?status=overdue');
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    await act(async () => { fireEvent.click(within(table).getByRole('button', { name: /Meeldetuletus/ })); });
    expect(value.deliveryRepository.remind).toHaveBeenCalledWith('i1');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Maksemeeldetuletus saadeti'));
  });

  it('opens all issued invoices for the selected month from the hero', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValue([
      { id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, paidCents: 0, due: '2020-10-01' },
      { id: 'i2', planMonth: '2031-10', studentName: 'Jaan Tamm', num: 'AR-32', amountCents: 5000, paidAmountCents: 5000, due: '2020-10-01' },
    ]);
    const scrollIntoView = vi.fn();
    globalThis.HTMLElement.prototype.scrollIntoView = scrollIntoView;
    renderPage(value, '/finance?status=overdue');
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    expect(within(table).queryByText('Jaan Tamm')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Väljastatud arved 2/ }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(within(table).getByText('Jaan Tamm')).toBeInTheDocument();
  });

  it('cancels an unsent unpaid invoice with a reason and removes it from the active list', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValueOnce([
      { id: 'i1', planMonth: '2031-10', billingMode: 'monthly_plan_v1', status: 'Ootel', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, due: '2031-10-10' },
    ]).mockResolvedValueOnce([
      { id: 'i1', planMonth: '2031-10', billingMode: 'monthly_plan_v1', status: 'Tühistatud', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, effectiveAmountCents: 0, balanceDueCents: 0, due: '2031-10-10' },
    ]);
    renderPage(value);
    fireEvent.click(await screen.findByRole('button', { name: 'Tühista arve AR-31' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Tühistamise põhjus'), { target: { value: 'Arve koostati ekslikult' } });
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Tühista arve' })); });
    expect(value.manualInvoiceRepository.cancel).toHaveBeenCalledWith('i1', 'Arve koostati ekslikult');
    await waitFor(() => expect(screen.queryByText('Mari Maasikas')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Väljastatud arved 0/ })).toBeInTheDocument();
  });

  it('does not offer cancellation for a sent invoice', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValue([{ id: 'i1', planMonth: '2031-10', billingMode: 'monthly_plan_v1', status: 'Ootel', emailStatus: 'sent', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, due: '2031-10-10' }]);
    renderPage(value);
    await screen.findByText('Mari Maasikas');
    expect(screen.queryByRole('button', { name: 'Tühista arve AR-31' })).not.toBeInTheDocument();
  });
});
