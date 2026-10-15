import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import PaymentCheckPanel from './PaymentCheckPanel.jsx';

const invoices = [
  { id: 'dup', num: 'KS-2026-066', studentName: 'Milan', amountCents: 18000, status: 'Makstud', date: '2026-09-01' },
  { id: 'old1', num: 'KS-2026-001', studentName: 'Matvei', amount: 63, status: 'Makstud', paidAt: '2026-06-19', date: '2026-06-19' },
  { id: 'old2', num: 'KS-2026-002', studentName: 'Daniel', amount: 14, status: 'Makstud', paidAt: '2026-06-20', date: '2026-06-20' },
];
const payments = [
  { id: 'p1', invoiceId: 'dup', amountCents: 18000, paidAt: '2026-09-01', createdAt: '2026-09-01T09:57:28Z', status: 'active' },
  { id: 'p2', invoiceId: 'dup', amountCents: 18000, paidAt: '2026-09-01', createdAt: '2026-09-01T09:57:30Z', status: 'active' },
];

function setup(extra = {}) {
  const financeRepository = { recordPayment: vi.fn().mockResolvedValue({}), voidPayment: vi.fn().mockResolvedValue({}), resolveInvoiceOverpayment: vi.fn() };
  const paymentRepository = { listAll: vi.fn().mockResolvedValue(payments) };
  const onReload = vi.fn().mockResolvedValue(undefined);
  render(<PaymentCheckPanel invoices={invoices} transactions={[{ id: 't1', payerName: 'LESNIKOVA', paidAt: '2026-05-07', unappliedAmountCents: 18500 }]} financeRepository={financeRepository} paymentRepository={paymentRepository} onReload={onReload} {...extra} />);
  return { financeRepository, paymentRepository, onReload };
}

describe('payment check panel', () => {
  it('opens on the bank-like list of incoming payments and searches it by payer, child, invoice or amount', async () => {
    const paymentRepository = { listAll: vi.fn().mockResolvedValue([
      ...payments,
      { id: 'p3', invoiceId: 'old1', invoiceNum: 'KS-2026-001', studentName: 'Matvei', payerName: 'Ema', amountCents: 6300, paidAt: '2026-06-19', createdAt: '2026-10-15T10:00:00Z', status: 'active', note: 'LHV väljavõte 2026-06-19, JELENA AGAFONTSEVA (arve number selgituses)', reference: 'KS-2026-001' },
      { id: 'p4', invoiceId: 'old2', invoiceNum: 'KS-2026-002', studentName: 'Daniel', payerName: 'Isa', amountCents: 1400, paidAt: '2026-06-20', createdAt: '2026-06-20T10:00:00Z', status: 'voided' },
    ]) };
    render(<PaymentCheckPanel invoices={invoices} transactions={[{ id: 't1', payerName: 'LESNIKOVA JEKATERINA', reference: 'Artemi eesti keel', paidAt: '2026-05-07', amountCents: 18500, unappliedAmountCents: 18500, creditStudentName: 'Artemi Lesnikov' }]} financeRepository={{}} paymentRepository={paymentRepository} />);
    const table = await screen.findByRole('table', { name: 'Laekumised' });
    // newest first: the two KS-2026-066 payments, then June, then the May advance; a voided payment is not money
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(4);
    expect(rows[2]).toHaveTextContent('JELENA AGAFONTSEVA');
    expect(rows[2]).toHaveTextContent('KS-2026-001 · Matvei');
    expect(rows[3]).toHaveTextContent('Ettemaks 185,00');
    fireEvent.change(screen.getByLabelText('Otsi laekumisi'), { target: { value: 'agafontseva' } });
    expect(within(screen.getByRole('table', { name: 'Laekumised' })).getAllByRole('row')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Otsi laekumisi'), { target: { value: '066' } });
    expect(screen.getByRole('status')).toHaveTextContent('2 laekumist');
    fireEvent.change(screen.getByLabelText('Otsi laekumisi'), { target: { value: 'artemi' } });
    expect(screen.getByRole('status')).toHaveTextContent('1 laekumist');
    fireEvent.change(screen.getByLabelText('Otsi laekumisi'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Kuu'), { target: { value: '2026-06' } });
    expect(screen.getByRole('status')).toHaveTextContent('1 laekumist');
  });

  it('lists the findings and voids the duplicate payment after confirmation', async () => {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const { financeRepository, paymentRepository } = setup();
    fireEvent.click(await screen.findByRole('tab', { name: /Erinevused/ }));
    const duplicate = await screen.findByRole('region', { name: /kaks korda/ });
    expect(within(duplicate).getByText(/KS-2026-066 · Milan/)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Raha ilma arveta/ })).toHaveTextContent('LESNIKOVA');
    fireEvent.click(within(duplicate).getByRole('button', { name: 'Tühista korduv' }));
    await waitFor(() => expect(financeRepository.voidPayment).toHaveBeenCalledWith('p2', expect.stringMatching(/kaks korda/)));
    expect(await screen.findByText(/Korduv makse arvelt KS-2026-066 tühistati/)).toBeInTheDocument();
    expect(paymentRepository.listAll).toHaveBeenCalledTimes(2);
  });

  it('adds the missing payment records, one by one or all at once', async () => {
    const { financeRepository } = setup();
    fireEvent.click(await screen.findByRole('tab', { name: /Erinevused/ }));
    const missing = await screen.findByRole('region', { name: /makse kirje puudub/ });
    fireEvent.click(within(missing).getByRole('button', { name: /Lisa kõigile \(2\)/ }));
    await waitFor(() => expect(financeRepository.recordPayment).toHaveBeenCalledTimes(2));
    expect(financeRepository.recordPayment).toHaveBeenCalledWith('old1', expect.objectContaining({ amount: 63, paidAt: '2026-06-19', requestId: 'reconcile-missing-old1' }));
    expect(await screen.findByText(/Makse kirje lisati 2 arvele/)).toBeInTheDocument();
  });

  it('says when everything matches', async () => {
    const financeRepository = {};
    render(<PaymentCheckPanel invoices={[{ id: 'a', amountCents: 100, status: 'Makstud' }]} financeRepository={financeRepository} paymentRepository={{ listAll: vi.fn().mockResolvedValue([{ id: 'p', invoiceId: 'a', amountCents: 100, status: 'active' }]) }} />);
    fireEvent.click(await screen.findByRole('tab', { name: /Erinevused/ }));
    expect(await screen.findByText('Kõik klapib')).toBeInTheDocument();
  });
});
