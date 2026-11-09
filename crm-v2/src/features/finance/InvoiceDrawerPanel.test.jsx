import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import { onEntityChanged } from '../../components/entityDrawer/entityDrawer.js';
import InvoiceDrawerPanel from './InvoiceDrawerPanel.jsx';

const invoice = { id: 'i1', num: '26-014', studentId: 's1', studentName: 'Mia', payerEmail: 'ema@example.ee', date: '2026-11-01', due: '2099-11-15', amountCents: 10000, paidAmountCents: 4000, payments: [{ amountCents: 4000, paidAt: '2026-11-03', method: 'bank', reference: '26-014' }], emailStatus: 'sent' };

function renderPanel(props, roles = ['admin']) {
  const auth = { user: { uid: 'u1', displayName: 'Admin', roles }, signOut: vi.fn() };
  return render(<AuthContext.Provider value={auth}><InvoiceDrawerPanel invoiceId="i1" {...props} /></AuthContext.Provider>);
}

describe('InvoiceDrawerPanel (the side drawer’s invoice)', () => {
  it('shows the sums and payments and records a payment through the month list’s window and path', async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:invoice-preview') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const invoiceRepository = { get: vi.fn().mockResolvedValueOnce(invoice).mockResolvedValue({ ...invoice, paidAmountCents: 10000, payments: [...invoice.payments, { amountCents: 6000, paidAt: '2026-11-09', method: 'cash' }] }) };
    const financeRepository = { recordPayment: vi.fn(async () => ({ invoice: {} })), cashSummary: vi.fn(async () => ({ people: [] })) };
    const deliveryRepository = { pdf: vi.fn(async () => ({ filename: 'arve-26-014.pdf', contentType: 'application/pdf', contentBase64: 'JVBERi0=' })) };
    const changes = [];
    const stop = onEntityChanged(['invoice', 'lesson'], (change) => changes.push(change));
    renderPanel({ invoiceRepository, financeRepository, deliveryRepository });
    expect(await screen.findByText('Arve 26-014')).toBeInTheDocument();
    expect(screen.getByText('Osaliselt')).toBeInTheDocument();
    expect(changes).toEqual([]);
    expect(within(screen.getByRole('region', { name: 'Maksed' })).getByText(/03\.11\.2026 · pangaülekanne · 26-014/)).toBeInTheDocument();
    // the administrator sees the document itself (the server's „Prindi” PDF)
    expect(await screen.findByTitle('Arve arve-26-014.pdf')).toBeInTheDocument();
    expect(deliveryRepository.pdf).toHaveBeenCalledWith('i1');
    fireEvent.click(screen.getByRole('button', { name: /Lisa makse/ }));
    const dialog = await screen.findByRole('dialog', { name: /Registreeri makse/ });
    expect(within(dialog).getByLabelText('Summa (€)')).toHaveValue(60);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Registreeri' }));
    await waitFor(() => expect(financeRepository.recordPayment).toHaveBeenCalledWith('i1', expect.objectContaining({ amount: 60, method: 'bank' })));
    expect(await screen.findByText('Makse arvele 26-014 registreeriti.')).toBeInTheDocument();
    // the finance month under the drawer is told, once, which invoice changed
    stop();
    expect(changes).toEqual([{ kind: 'invoice', invoiceId: 'i1', change: 'payment' }]);
    // the sum label and now the status too
    await waitFor(() => expect(screen.getAllByText('Makstud')).toHaveLength(2));
    expect(screen.queryByRole('button', { name: /Lisa makse/ })).not.toBeInTheDocument();
  });

  it('the accountant sees the invoice; the PDF and payments stay with the administrator, as on the page', async () => {
    const deliveryRepository = { pdf: vi.fn() };
    renderPanel({ invoiceRepository: { get: vi.fn(async () => invoice) }, deliveryRepository }, ['finance']);
    expect(await screen.findByText('Arve 26-014')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lisa makse/ })).not.toBeInTheDocument();
    expect(screen.getByText(/teeb administraator/)).toBeInTheDocument();
    expect(deliveryRepository.pdf).not.toHaveBeenCalled();
  });

  it('a missing invoice says so', async () => {
    renderPanel({ invoiceRepository: { get: vi.fn(async () => null) }, deliveryRepository: { pdf: vi.fn() } });
    expect(await screen.findByText('Arvet ei leitud')).toBeInTheDocument();
  });

  it('shows a family\'s „Maksin ära” notice on an unpaid invoice — still unpaid, the administrator checks the bank', async () => {
    const claimsRepository = { get: vi.fn(async () => ({ id: 'i1', invoiceId: 'i1', claimedByName: 'Mia Ema', claimedAt: '2026-11-08T10:00:00.000Z', note: 'Swedbank' })) };
    renderPanel({ invoiceRepository: { get: vi.fn(async () => invoice) }, deliveryRepository: { pdf: vi.fn(() => new Promise(() => {})) }, claimsRepository });
    expect(await screen.findByText('Pere: makstud?')).toBeInTheDocument();
    expect(screen.getByText(/Pere teatas maksest 08\.11\.2026 \(Mia Ema\) — „Swedbank”\. Kontrolli panka ja lisa makse\./)).toBeInTheDocument();
    expect(screen.getByText('Osaliselt')).toBeInTheDocument();
    expect(claimsRepository.get).toHaveBeenCalledWith('i1');
  });

  it('the administrator removes the notice after confirming; the accountant sees it without the button', async () => {
    const claim = { id: 'i1', invoiceId: 'i1', claimedByName: 'Mia Ema', claimedAt: '2026-11-08T10:00:00.000Z' };
    const claimsRepository = { get: vi.fn().mockResolvedValueOnce(claim).mockResolvedValue(null), remove: vi.fn().mockResolvedValue() };
    const confirm = vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    const { unmount } = renderPanel({ invoiceRepository: { get: vi.fn(async () => invoice) }, deliveryRepository: { pdf: vi.fn(() => new Promise(() => {})) }, claimsRepository });
    fireEvent.click(await screen.findByRole('button', { name: 'Eemalda teade' }));
    await waitFor(() => expect(claimsRepository.remove).toHaveBeenCalledWith('i1'));
    expect(confirm.mock.calls[0][0]).toContain('26-014');
    expect(await screen.findByText('Pere teade eemaldati.')).toBeInTheDocument();
    expect(screen.queryByText('Pere: makstud?')).toBeNull();
    confirm.mockRestore();
    unmount();
    renderPanel({ invoiceRepository: { get: vi.fn(async () => invoice) }, deliveryRepository: { pdf: vi.fn() }, claimsRepository: { get: vi.fn(async () => claim), remove: vi.fn() } }, ['finance']);
    expect(await screen.findByText('Pere: makstud?')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eemalda teade' })).toBeNull();
  });

  it('no notice when there is none or it cannot be read', async () => {
    const claimsRepository = { get: vi.fn(async () => { throw new Error('Missing or insufficient permissions.'); }) };
    renderPanel({ invoiceRepository: { get: vi.fn(async () => invoice) }, deliveryRepository: { pdf: vi.fn(() => new Promise(() => {})) }, claimsRepository });
    expect(await screen.findByText('Arve 26-014')).toBeInTheDocument();
    await waitFor(() => expect(claimsRepository.get).toHaveBeenCalled());
    expect(screen.queryByText('Pere: makstud?')).toBeNull();
  });
});
