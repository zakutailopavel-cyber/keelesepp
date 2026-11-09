import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { announceEntityChanged } from '../../components/entityDrawer/entityDrawer.js';
import FinanceMonthPage from './FinanceMonthPage.jsx';

vi.mock('./monthlyBilling.js', async (importOriginal) => ({ ...(await importOriginal()), defaultBillingMonth: () => '2031-10', currentMonth: () => '2031-10' }));
vi.mock('./PricePrivacyBanner.jsx', () => ({ default: () => null }));
vi.mock('./ManualInvoiceDialog.jsx', () => ({ default: () => <button type="button">Lisa arve</button> }));
vi.mock('./fie/FiePanel.jsx', () => ({ default: () => <p>FIE plokk</p> }));
vi.mock('./TokenInvoiceDialog.jsx', () => ({ default: () => <button type="button">Tunnipakett</button> }));
vi.mock('./MonthlyInvoicePanel.jsx', () => ({ default: () => <section aria-label="Kuuarvete koostamine">Kuuarved</section> }));

const emptyList = { list: vi.fn().mockResolvedValue([]) };
const props = () => ({
  invoiceRepository: { list: vi.fn().mockResolvedValue([{ id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', payerEmail: 'payer@example.com', num: 'AR-31', amountCents: 10000, paidCents: 0, due: '2020-10-01' }]) },
  financeRepository: { recordPayment: vi.fn().mockResolvedValue({}) },
  manualInvoiceRepository: { cancel: vi.fn().mockResolvedValue({}) },
  deliveryRepository: { send: vi.fn().mockResolvedValue({}), remind: vi.fn().mockResolvedValue({}), pdf: vi.fn().mockResolvedValue({ filename: 'arve-AR-31.pdf', contentType: 'application/pdf', contentBase64: 'JVBERg==' }) },
  planRepository: emptyList,
  studentRepository: { list: vi.fn().mockResolvedValue({ items: [] }) },
  lessonRepository: { listForBilling: vi.fn().mockResolvedValue([]) },
  bankRepository: emptyList,
  periodRepository: emptyList,
  creditRepository: { list: vi.fn().mockResolvedValue([]), listRefunds: vi.fn().mockResolvedValue([]) },
  creditNoteRepository: emptyList,
  auditRepository: emptyList,
  noteRepository: { list: vi.fn().mockResolvedValue(new Map()), save: vi.fn() },
});

const renderPage = (value, route = '/') => render(<MemoryRouter initialEntries={[route]}><AuthContext.Provider value={{ user: { uid: 'a1', roles: ['admin'] } }}><FinanceMonthPage {...value} /></AuthContext.Provider></MemoryRouter>);

describe('FinanceMonthPage', () => {
  it('opens one finance view at a time from the summary tabs', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValue([
      { id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, paidCents: 0, due: '2031-10-10' },
      { id: 'i2', planMonth: '2031-10', studentName: 'Jaan Tamm', num: 'AR-32', amountCents: 5000, paidAmountCents: 2000, due: '2031-10-10' },
    ]);
    value.creditRepository.list.mockResolvedValue([{ id: 'c1', status: 'open', studentName: 'Jaan Tamm', availableAmountCents: 2500, createdAt: '2031-09-01' }]);
    renderPage(value);
    expect(await screen.findByRole('table', { name: 'Arved 2031-10' })).toBeInTheDocument();
    expect(screen.queryByText('Kuuarved')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Arveid 2/ })).toHaveAttribute('aria-selected', 'true');

    fireEvent.click(screen.getByRole('tab', { name: /Laekunud/ }));
    expect(screen.getByRole('tab', { name: /Laekunud/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('Mari Maasikas')).not.toBeInTheDocument();
    expect(screen.getByText('Jaan Tamm')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /Ette makstud/ }));
    expect(screen.queryByRole('table', { name: 'Arved 2031-10' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Õpilaste avansid' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ette makstud/ })).toHaveTextContent('25,00');

    fireEvent.click(screen.getByRole('tab', { name: /Koosta arved/ }));
    expect(screen.getByText('Kuuarved')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Õpilaste avansid' })).not.toBeInTheDocument();
  });

  it('a payment added in the side drawer: the month reads its invoices again in place, the open view stays', async () => {
    const value = props();
    value.invoiceRepository.list
      .mockResolvedValueOnce([{ id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, paidCents: 0, due: '2031-10-10' }])
      .mockResolvedValue([{ id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, paidAmountCents: 10000, due: '2031-10-10' }]);
    renderPage(value);
    await screen.findByRole('table', { name: 'Arved 2031-10' });
    fireEvent.click(screen.getByRole('tab', { name: /Laekumata/ }));
    expect(screen.getByText('Mari Maasikas')).toBeInTheDocument();
    const tab = screen.getByRole('tab', { name: /Laekumata/ });
    act(() => { announceEntityChanged('invoice', { invoiceId: 'i1', change: 'payment' }); });
    await waitFor(() => expect(value.invoiceRepository.list).toHaveBeenCalledTimes(2));
    // the paid invoice leaves the unpaid list; the same tab element is still selected (no remount, no reset)
    await waitFor(() => expect(screen.queryByText('Mari Maasikas')).not.toBeInTheDocument());
    expect(tab).toBeInTheDocument();
    expect(tab).toHaveAttribute('aria-selected', 'true');
    expect(screen.queryByText('Laen finantsandmeid…')).not.toBeInTheDocument();
  });

  it('shows current unpaid invoices and previous debts only in the unpaid tab', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValue([
      { id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, paidCents: 0, due: '2031-10-10' },
      { id: 'i2', planMonth: '2031-09', studentName: 'Jaan Tamm', num: 'AR-32', amountCents: 5000, paidCents: 0, due: '2031-09-10' },
    ]);
    renderPage(value);
    await screen.findByRole('table', { name: 'Arved 2031-10' });
    expect(screen.queryByRole('table', { name: 'Võlgnevused' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Laekumata/ }));
    expect(screen.getByRole('table', { name: 'Võlgnevused' })).toBeInTheDocument();
    expect(screen.getByText('Jaan Tamm')).toBeInTheDocument();
    expect(screen.getByText('Mari Maasikas')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /Arveid/ }));
    expect(screen.queryByRole('table', { name: 'Võlgnevused' })).not.toBeInTheDocument();
  });

  it('supports keyboard navigation and opens overdue links in the unpaid tab', async () => {
    renderPage(props(), '/finance?status=overdue');
    expect(await screen.findByRole('table', { name: 'Arved 2031-10' })).toBeInTheDocument();
    const unpaid = screen.getByRole('tab', { name: /Laekumata/ });
    expect(unpaid).toHaveAttribute('aria-selected', 'true');
    expect(unpaid).toHaveTextContent('selle kuu arved');
    expect(screen.getByLabelText('Olek')).toHaveValue('overdue');
    fireEvent.keyDown(unpaid, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: /Ette makstud/ })).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Õpilaste avansid' })).toBeInTheDocument();
  });

  it('shows the staff-only invoice note by the number, finds the invoice by it and edits it on an issued invoice', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValue([
      { id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, paidAmountCents: 10000, due: '2031-10-10', emailStatus: 'sent' },
      { id: 'i2', planMonth: '2031-10', studentName: 'Jaan Tamm', num: 'AR-32', amountCents: 5000, paidCents: 0, due: '2031-10-10' },
    ]);
    value.noteRepository.list.mockResolvedValue(new Map([['i1', { id: 'i1', text: 'Oktoobri 8 tundi + õpik', updatedByName: 'Admin', updatedAt: '2031-10-02T09:00:00.000Z' }]]));
    value.noteRepository.save.mockImplementation(async (id, text) => ({ id, invoiceId: id, text, updatedByName: 'Admin', updatedAt: '2031-10-03T09:00:00.000Z' }));
    renderPage(value);
    const noted = await screen.findByRole('button', { name: 'Sisemine märkus arvel AR-31: Oktoobri 8 tundi + õpik' });
    expect(noted).toHaveAttribute('title', 'Oktoobri 8 tundi + õpik');
    expect(screen.getByText('Märkus: Oktoobri 8 tundi + õpik')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lisa sisemine märkus arvele AR-32' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Otsi'), { target: { value: 'õpik' } });
    const table = screen.getByRole('table', { name: 'Arved 2031-10' });
    expect(within(table).getByText('Mari Maasikas')).toBeInTheDocument();
    expect(within(table).queryByText('Jaan Tamm')).not.toBeInTheDocument();

    fireEvent.click(noted);
    const dialog = await screen.findByRole('dialog', { name: 'Sisemine märkus · AR-31' });
    expect(within(dialog).getByText(/Viimati muutis Admin/)).toBeInTheDocument();
    fireEvent.change(within(dialog).getByLabelText('Mille eest arve on (ainult töötajatele)'), { target: { value: 'Oktoobri 8 tundi, õpik eraldi' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(value.noteRepository.save).toHaveBeenCalledWith('i1', 'Oktoobri 8 tundi, õpik eraldi', expect.objectContaining({ uid: 'a1' })));
    expect(await screen.findByText('Märkus: Oktoobri 8 tundi, õpik eraldi')).toBeInTheDocument();
    expect(value.invoiceRepository.list).toHaveBeenCalledTimes(1);
  });

  it('a refused note list (rules not deployed) leaves the invoices working', async () => {
    const value = props();
    value.noteRepository.list.mockRejectedValue(new Error('Missing or insufficient permissions.'));
    renderPage(value);
    expect(await screen.findByRole('button', { name: 'Lisa sisemine märkus arvele AR-31' })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('opens the existing invoice PDF for printing without creating or sending anything', async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:invoice-preview') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const value = props();
    renderPage(value);
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    fireEvent.click(within(table).getByRole('button', { name: 'Prindi arve AR-31' }));
    await waitFor(() => expect(value.deliveryRepository.pdf).toHaveBeenCalledWith('i1'));
    const dialog = await screen.findByRole('dialog', { name: 'arve-AR-31.pdf' });
    expect(within(dialog).getByRole('link', { name: 'Ava PDF printimiseks' })).toHaveAttribute('href', 'blob:invoice-preview');
    expect(value.deliveryRepository.send).not.toHaveBeenCalled();
    expect(value.financeRepository.recordPayment).not.toHaveBeenCalled();
  });

  it('registers a payment and refreshes the month', async () => {
    const value = props(); renderPage(value);
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    fireEvent.click(within(table).getByRole('button', { name: 'Makse' }));
    const dialog = screen.getByRole('dialog');
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Registreeri' })); });
    expect(value.financeRepository.recordPayment).toHaveBeenCalledWith('i1', expect.objectContaining({ amount: 100, method: 'bank', requestId: expect.stringMatching(/^payment-/) }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Makse registreeriti'));
    expect(value.invoiceRepository.list).toHaveBeenCalledTimes(2);
  });

  it('the same dialog sends one request id: a double click never records the payment twice', async () => {
    const value = props(); renderPage(value);
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    fireEvent.click(within(table).getByRole('button', { name: 'Makse' }));
    const form = screen.getByRole('dialog').querySelector('form');
    await act(async () => { fireEvent.submit(form); fireEvent.submit(form); });
    const ids = value.financeRepository.recordPayment.mock.calls.map(([, payment]) => payment.requestId);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(1);
  });

  it('the payment date shows the due date and warns when it is far past it (the receipt is booked on this date)', async () => {
    const value = props(); renderPage(value);
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    fireEvent.click(within(table).getByRole('button', { name: 'Makse' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Maksetähtaeg 01\.10\.2020/)).toBeInTheDocument();
    expect(within(dialog).getByText('Kuupäev peab olema päev, mil raha pangakontole laekus.')).toBeInTheDocument();
    expect(within(dialog).getByText(/üle 7 päeva pärast maksetähtaega/)).toBeInTheDocument();
    // still editable: a date near the due date drops the „late” reason; another month than today still reminds
    fireEvent.change(within(dialog).getByLabelText('Makse kuupäev'), { target: { value: '2020-10-03' } });
    expect(within(dialog).queryByText(/üle 7 päeva pärast maksetähtaega/)).not.toBeInTheDocument();
    expect(within(dialog).getByText(/teises kuus kui täna/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Registreeri' })); });
    expect(value.financeRepository.recordPayment).toHaveBeenCalledWith('i1', expect.objectContaining({ paidAt: '2020-10-03' }));
  });

  it('a refused overpayment asks first; „Jah” records it with the same request id and moves the excess to an advance', async () => {
    const value = props();
    const refusal = Object.assign(new Error('Arve on juba makstud. Kas registreerida ülemakse ettemaksuna?'), { status: 409, details: { code: 'overpayment', balanceCents: 0 } });
    value.financeRepository = {
      recordPayment: vi.fn().mockRejectedValueOnce(refusal).mockResolvedValueOnce({ invoice: { overpaidAmountCents: 10000 } }),
      resolveInvoiceOverpayment: vi.fn().mockResolvedValue({}),
    };
    renderPage(value);
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    fireEvent.click(within(table).getByRole('button', { name: 'Makse' }));
    const dialog = screen.getByRole('dialog');
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Registreeri' })); });
    const question = await within(dialog).findByRole('alertdialog', { name: 'Ülemakse' });
    expect(question).toHaveTextContent('Arve on juba makstud. Kas registreerida ülemakse ettemaksuna?');
    expect(value.financeRepository.resolveInvoiceOverpayment).not.toHaveBeenCalled();
    await act(async () => { fireEvent.click(within(question).getByRole('button', { name: 'Jah, registreeri ettemaksuna' })); });
    const [[, first], [, second]] = value.financeRepository.recordPayment.mock.calls;
    expect(first.allowOverpayment).toBeUndefined();
    expect(second).toEqual(expect.objectContaining({ allowOverpayment: true, requestId: first.requestId }));
    expect(value.financeRepository.resolveInvoiceOverpayment).toHaveBeenCalledWith('i1', expect.stringMatching(/ettemaksuna/));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('ülejääk kanti maksja ettemaksuks'));
  });

  it('a duplicate payment refused by the server is shown and nothing else happens', async () => {
    const value = props();
    value.financeRepository.recordPayment.mockRejectedValue(Object.assign(new Error('Sama makse (100,00 €, 2031-10-01) on sellele arvele juba registreeritud 3 min tagasi.'), { status: 409, details: { code: 'duplicate_payment' } }));
    renderPage(value);
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    fireEvent.click(within(table).getByRole('button', { name: 'Makse' }));
    const dialog = screen.getByRole('dialog');
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Registreeri' })); });
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('juba registreeritud 3 min tagasi');
    expect(within(dialog).queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('the administrator opens „Kontroll”: invoices against payments', async () => {
    const value = props();
    renderPage({ ...value, paymentRepository: { listAll: vi.fn().mockResolvedValue([]) } });
    fireEvent.click(await screen.findByRole('tab', { name: /Kontroll/ }));
    expect(await screen.findByRole('heading', { name: 'Arved ja maksed' })).toBeInTheDocument();
  });

  it('sends an overdue reminder from the invoice row', async () => {
    const value = props(); renderPage(value, '/finance?status=overdue');
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    await act(async () => { fireEvent.click(within(table).getByRole('button', { name: /Meeldetuletus/ })); });
    expect(value.deliveryRepository.remind).toHaveBeenCalledWith('i1');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Maksemeeldetuletus saadeti'));
  });

  it('offers a payment reminder before the due date too (owner 2026-10-27), not for a paid invoice', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValue([
      { id: 'i9', planMonth: '2031-10', studentName: 'Ana Lepp', num: 'AR-39', amountCents: 10000, paidCents: 0, due: '2099-11-10' },
      { id: 'i8', planMonth: '2031-10', studentName: 'Mari Maasikas', num: 'AR-38', amountCents: 10000, paidAmountCents: 10000, due: '2099-11-10' },
    ]);
    renderPage(value, '/finance?status=all');
    const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
    expect(within(table).getAllByRole('button', { name: /Meeldetuletus/ })).toHaveLength(1);
    await act(async () => { fireEvent.click(within(table).getByRole('button', { name: /Meeldetuletus/ })); });
    expect(value.deliveryRepository.remind).toHaveBeenCalledWith('i9');
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

  it('cancels an e-mailed unpaid invoice (wrong address) only after the administrator confirms it was sent', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValue([
      { id: 'i2', planMonth: '2031-10', billingMode: 'manual_charge_v1', status: 'Ootel', studentName: 'Mykyta', num: 'KS-94', amountCents: 7500, due: '2031-10-20', emailStatus: 'sent', emailSentAt: '2031-10-14T18:18:00Z', emailRecipient: 'raninyana9@gmail.com' },
    ]);
    renderPage(value);
    fireEvent.click(await screen.findByRole('button', { name: 'Tühista arve KS-94' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Tühistamise põhjus'), { target: { value: 'Vale e-post, arve ei jõudnud kohale' } });
    expect(within(dialog).getByRole('button', { name: 'Tühista arve' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /aadressile raninyana9@gmail.com/ }));
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Tühista arve' })); });
    expect(value.manualInvoiceRepository.cancel).toHaveBeenCalledWith('i2', 'Vale e-post, arve ei jõudnud kohale', { afterSending: true });
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
    expect(value.manualInvoiceRepository.cancel).toHaveBeenCalledWith('i1', 'Arve koostati ekslikult', { afterSending: false });
    await waitFor(() => expect(screen.queryByText('Mari Maasikas')).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Väljastatud arved 0/ })).toBeInTheDocument();
  });

  it('offers cancellation for a sent unpaid invoice, never for a paid one', async () => {
    const value = props();
    value.invoiceRepository.list.mockResolvedValue([
      { id: 'i1', planMonth: '2031-10', billingMode: 'monthly_plan_v1', status: 'Ootel', emailStatus: 'sent', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, due: '2031-10-10' },
      { id: 'i3', planMonth: '2031-10', billingMode: 'monthly_plan_v1', status: 'Makstud', emailStatus: 'sent', studentName: 'Jaan Tamm', num: 'AR-32', amountCents: 10000, paidAmountCents: 10000, balanceDueCents: 0, due: '2031-10-10' },
    ]);
    renderPage(value, '/finance?status=all');
    await screen.findByText('Mari Maasikas');
    expect(screen.getByRole('button', { name: 'Tühista arve AR-31' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tühista arve AR-32' })).not.toBeInTheDocument();
  });

  it('opens the same audited cancel dialog for a sent prior-month debt and wires the due-date correction', async () => {
    const value = props();
    value.financeRepository.correctInvoiceDueDate = vi.fn().mockResolvedValue({});
    value.invoiceRepository.list.mockResolvedValue([
      { id: 'old-1', planMonth: '2031-09', billingMode: 'monthly_plan_v1', status: 'Ootel', emailStatus: 'sent', studentName: 'Mari Maasikas', num: 'AR-30', amountCents: 10000, due: '2031-09-10' },
    ]);
    renderPage(value, '/finance?view=unpaid');
    const debtTable = await screen.findByRole('table', { name: 'Võlgnevused' });
    fireEvent.click(within(debtTable).getByRole('button', { name: 'Tühista arve AR-30' }));
    let dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Tühistamise põhjus'), { target: { value: 'Arve koostati ekslikult' } });
    expect(within(dialog).getByRole('button', { name: 'Tühista arve' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('checkbox'));
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Tühista arve' })); });
    expect(value.manualInvoiceRepository.cancel).toHaveBeenCalledWith('old-1', 'Arve koostati ekslikult', { afterSending: true });

    fireEvent.click(within(await screen.findByRole('table', { name: 'Võlgnevused' })).getByRole('button', { name: 'Muuda arvet AR-30' }));
    dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Uus maksetähtaeg'), { target: { value: '2031-10-20' } });
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'Kokkulepitud uus maksetähtaeg' } });
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta tähtaeg' })); });
    expect(value.financeRepository.correctInvoiceDueDate).toHaveBeenCalledWith('old-1', '2031-10-20', 'Kokkulepitud uus maksetähtaeg');
  });

  it('„Ei kuulu raamatupidamisse”: needs a reason, goes through the server, shows the mark and can be undone', async () => {
    const value = props();
    const invoice = { id: 'i1', planMonth: '2031-10', studentName: 'Mari Maasikas', num: 'AR-31', amountCents: 10000, paidCents: 0, due: '2031-10-10' };
    value.invoiceRepository.list.mockResolvedValue([invoice]);
    value.financeRepository.excludeInvoiceFromAccounting = vi.fn().mockResolvedValue({ entries: [{ id: 'e1', number: '2031-0001' }], relatedInvoices: [{ id: 'i2', num: 'AR-32' }] });
    value.financeRepository.includeInvoiceInAccounting = vi.fn().mockResolvedValue({ entries: [{ id: 'e1', number: '2031-0001' }] });
    renderPage(value);
    fireEvent.click(await screen.findByRole('button', { name: 'Märgi arve AR-31: ei kuulu raamatupidamisse' }));
    const dialog = await screen.findByRole('dialog', { name: 'Ei kuulu raamatupidamisse · AR-31' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Märgi' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Põhjus on kohustuslik.');
    expect(value.financeRepository.excludeInvoiceFromAccounting).not.toHaveBeenCalled();
    fireEvent.change(within(dialog).getByLabelText('Põhjus'), { target: { value: ' Raha teisel kontol ' } });
    value.invoiceRepository.list.mockResolvedValue([{ ...invoice, accountingExcluded: true, accountingExcludedReason: 'Raha teisel kontol' }]);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Märgi' }));
    await waitFor(() => expect(value.financeRepository.excludeInvoiceFromAccounting).toHaveBeenCalledWith('i1', 'Raha teisel kontol'));
    expect(await screen.findByText(/AR-31: ei kuulu raamatupidamisse, 1 kannet.*Seotud arve AR-32/)).toBeInTheDocument();
    expect(await screen.findByText('Ei kuulu raamatupidamisse')).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Taasta arve AR-31 raamatupidamisse' }));
    const undo = await screen.findByRole('dialog', { name: 'Taasta raamatupidamisse · AR-31' });
    fireEvent.change(within(undo).getByLabelText('Põhjus'), { target: { value: 'Eksitus' } });
    fireEvent.click(within(undo).getByRole('button', { name: 'Taasta' }));
    await waitFor(() => expect(value.financeRepository.includeInvoiceInAccounting).toHaveBeenCalledWith('i1', 'Eksitus'));
  });

  it('the mark is not offered to a teacher', async () => {
    const value = props();
    render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 't1', roles: ['teacher'] } }}><FinanceMonthPage {...value} /></AuthContext.Provider></MemoryRouter>);
    expect(await screen.findByRole('table', { name: 'Arved 2031-10' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ei kuulu raamatupidamisse/ })).not.toBeInTheDocument();
  });

  it('shows money in and out on demand for the administrator (it lived only in Vana vaade)', async () => {
    const value = props();
    value.financeRepository = { ...value.financeRepository, previewFinancialAnalytics: vi.fn().mockResolvedValue({ snapshot: { summary: { cashInflowCents: 123400, cashOutflowCents: 0, cashNetCents: 123400, marginCents: 0, revenueCents: 0, forecastCents: 0 }, breakdown: {}, agedDebt: { buckets: [], rows: [], totalCents: 0 }, trend: [] } }) };
    renderPage(value);
    fireEvent.click(await screen.findByText(/Raha liikumine/));
    fireEvent.click(screen.getByRole('button', { name: /Koosta analüüs/ }));
    expect(value.financeRepository.previewFinancialAnalytics).toHaveBeenCalled();
    expect(await screen.findAllByText(/1234,00/)).not.toHaveLength(0);
  });

  describe('the overview (Stripe-style, owner 2026-11-09)', () => {
    afterEach(() => { globalThis.localStorage?.removeItem('keelesepp.financeMonth.unit'); });
    const overviewInvoices = [
      { id: 'i1', planMonth: '2031-10', studentId: 's1', studentName: 'Mari Maasikas', payerEmail: 'mari@x.ee', num: 'AR-31', amountCents: 10000, paidAmountCents: 0, due: '2020-10-01' },
      { id: 'i2', planMonth: '2031-10', studentId: 's2', studentName: 'Jaan Tamm', num: 'AR-32', amountCents: 5000, paidAmountCents: 5000, paidAt: '2031-10-03', due: '2031-10-10', status: 'Makstud' },
      { id: 'i0', planMonth: '2031-08', studentId: 's3', studentName: 'Eva Kask', num: 'AR-29', amountCents: 7000, paidAmountCents: 7000, paidAt: '2031-08-04', due: '2031-08-10', status: 'Makstud' },
    ];
    const card = (title) => screen.getByRole('heading', { name: title }).closest('article');

    it('keeps every page action and link reachable', async () => {
      renderPage(props());
      await screen.findByRole('table', { name: 'Arved 2031-10' });
      expect(screen.getByRole('button', { name: /Väljastatud arved 1/ })).toBeInTheDocument();
      for (const [name, href] of [['Seaded', '/finance/seaded'], ['Raamatupidamine', '/finance/raamatupidamine'], ['INF 3', '/finance/inf3'], ['Palgad', '/finance/payroll'], ['Vana vaade', '/finance/vana']]) {
        expect(screen.getByRole('link', { name })).toHaveAttribute('href', href);
      }
      expect(screen.getByRole('button', { name: 'Lisa arve' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Tunnipakett' })).toBeInTheDocument();
      expect(screen.getAllByRole('tab').map((tab) => tab.id)).toEqual(['finance-tab-invoices', 'finance-tab-paid', 'finance-tab-unpaid', 'finance-tab-credits', 'finance-tab-prepare', 'finance-tab-check']);
    });

    it('shows the cards from the loaded invoices and „Vaata” opens the list behind them', async () => {
      const value = props();
      value.invoiceRepository.list.mockResolvedValue(overviewInvoices);
      renderPage(value);
      await screen.findByRole('table', { name: 'Arved 2031-10' });
      expect(screen.getByRole('region', { name: 'Ülevaade · oktoober 2031' })).toBeInTheDocument();
      expect(card('Arveldatud')).toHaveTextContent('150,00');
      expect(card('Arveldatud')).toHaveTextContent('2 arvet');
      expect(card('Tasumata')).toHaveTextContent('100,00');
      expect(card('Üle tähtaja · täna')).toHaveTextContent('1 pere · 1 arve');
      expect(card('Õpilasi arveldatud')).toHaveTextContent('2');
      expect(card('Keskmine arve')).toHaveTextContent('75,00');
      fireEvent.click(screen.getByRole('button', { name: 'Vaata üle tähtaja arveid' }));
      expect(screen.getByRole('tab', { name: /Laekumata/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText('Olek')).toHaveValue('overdue');
    });

    it('Kvartal / Aasta: the list and the cards cover the whole period, the arrows step a period', async () => {
      const value = props();
      value.invoiceRepository.list.mockResolvedValue(overviewInvoices);
      renderPage(value);
      await screen.findByRole('table', { name: 'Arved 2031-10' });
      expect(screen.queryByText('Eva Kask')).not.toBeInTheDocument();
      fireEvent.click(within(screen.getByRole('group', { name: 'Perioodi pikkus' })).getByRole('button', { name: 'Kvartal' }));
      expect(screen.getByRole('table', { name: 'Arved IV kvartal 2031' })).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Eelmine kvartal' }));
      const table = screen.getByRole('table', { name: 'Arved III kvartal 2031' });
      expect(within(table).getByText('Eva Kask')).toBeInTheDocument();
      expect(card('Arveldatud')).toHaveTextContent('70,00');
      fireEvent.click(screen.getByRole('button', { name: 'Praegune kvartal' }));
      expect(screen.getByRole('table', { name: 'Arved IV kvartal 2031' })).toBeInTheDocument();
      fireEvent.click(within(screen.getByRole('group', { name: 'Perioodi pikkus' })).getByRole('button', { name: 'Aasta' }));
      expect(within(screen.getByRole('table', { name: 'Arved 2031' })).getByText('Eva Kask')).toBeInTheDocument();
      expect(card('Arveldatud')).toHaveTextContent('220,00');
    });

    it('the owner\'s FIE invoices stay out of every company figure', async () => {
      const value = props();
      value.invoiceRepository.list.mockResolvedValue(overviewInvoices);
      value.invoiceRepository.listFie = vi.fn().mockResolvedValue([{ id: 'f1', issuer: 'fie', planMonth: '2031-10', studentId: 's9', studentName: 'FIE Õpilane', num: 'FIE-1', amountCents: 90000, paidAmountCents: 90000, paidAt: '2031-10-02', due: '2031-10-10' }]);
      render(<MemoryRouter><AuthContext.Provider value={{ user: { uid: 'o1', email: 'zakutailo.pavel@gmail.com', roles: ['admin'] } }}><FinanceMonthPage {...value} /></AuthContext.Provider></MemoryRouter>);
      await screen.findByRole('table', { name: 'Arved 2031-10' });
      await waitFor(() => expect(value.invoiceRepository.listFie).toHaveBeenCalled());
      expect(screen.getByText('FIE plokk')).toBeInTheDocument();
      expect(card('Arveldatud')).toHaveTextContent('150,00');
      expect(card('Õpilasi arveldatud')).toHaveTextContent('2');
      expect(screen.queryByText('FIE Õpilane')).not.toBeInTheDocument();
    });

    it('a row\'s student name opens the invoice (the PDF when no side drawer is mounted)', async () => {
      const value = props();
      renderPage(value);
      const table = await screen.findByRole('table', { name: 'Arved 2031-10' });
      fireEvent.click(within(table).getByRole('button', { name: 'Mari Maasikas' }));
      await waitFor(() => expect(value.deliveryRepository.pdf).toHaveBeenCalledWith('i1'));
    });
  });
});
