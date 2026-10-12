import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import OpenInvoicesCard from './OpenInvoicesCard.jsx';
import LinkpaySettings from './LinkpaySettings.jsx';
import PayInvoicePage from './PayInvoicePage.jsx';

const page = (url, api, go = vi.fn()) => {
  render(<MemoryRouter initialEntries={[url]}><Routes><Route path="/maksa/:invoiceId" element={<PayInvoicePage api={api} go={go} />} /></Routes></MemoryRouter>);
  return go;
};

describe('LinkPay pay page', () => {
  it('opens the bank page for the invoice code from the PDF link', async () => {
    const api = { startWithCode: vi.fn().mockResolvedValue({ url: 'https://payment.sandbox.lhv.ee/lp?x=1' }) };
    const go = page('/maksa/inv-1?k=code123456789012345', api);
    await waitFor(() => expect(go).toHaveBeenCalledWith('https://payment.sandbox.lhv.ee/lp?x=1'));
    expect(api.startWithCode).toHaveBeenCalledWith('inv-1', 'code123456789012345');
  });

  it('shows the bank-confirmed result on the return page, never deciding by itself', async () => {
    const api = { checkReturn: vi.fn().mockResolvedValue({ status: 'settled', invoiceNum: 'KS-2026-001', balanceCents: 0 }) };
    page('/maksa/tagasi?payment_reference=pr123456&order_reference=KS-1-a', api);
    expect(await screen.findByText('Aitäh, makse on kinnitatud!')).toBeInTheDocument();
    expect(api.checkReturn).toHaveBeenCalledWith('pr123456', 'KS-1-a');
  });

  it('says what went wrong', async () => {
    page('/maksa/inv-1?k=bad', { startWithCode: vi.fn().mockRejectedValue(new Error('Arve on juba tasutud.')) });
    expect(await screen.findByText('Arve on juba tasutud.')).toBeInTheDocument();
  });
});

describe('Open invoices card', () => {
  const invoices = [
    { id: 'a', num: 'KS-1', studentName: 'Mari', subject: 'Inglise keel', due: '2026-11-10', balanceDueCents: 17500 },
    { id: 'b', num: 'KS-2', balanceDueCents: 0 },
    { id: 'c', num: 'KS-3', status: 'Tühistatud', balanceDueCents: 100 },
  ];

  it('is hidden while card payments are off', async () => {
    const api = { config: vi.fn().mockResolvedValue({ enabled: false }) };
    const { container } = render(<OpenInvoicesCard invoices={invoices} api={api} />);
    await waitFor(() => expect(api.config).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  it('lists only open invoices and pays one through the server', async () => {
    const go = vi.fn();
    const api = { config: vi.fn().mockResolvedValue({ enabled: true }), startForInvoice: vi.fn().mockResolvedValue({ url: 'https://bank/x' }) };
    render(<OpenInvoicesCard invoices={invoices} api={api} go={go} />);
    expect(await screen.findByText('Arve KS-1')).toBeInTheDocument();
    expect(screen.queryByText('Arve KS-2')).not.toBeInTheDocument();
    expect(screen.queryByText('Arve KS-3')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Maksa arve/ }));
    await waitFor(() => expect(go).toHaveBeenCalledWith('https://bank/x'));
    expect(api.startForInvoice).toHaveBeenCalledWith('a');
  });
});

describe('Kaardimaksed settings', () => {
  it('lets the administrator open a test payment while payments are off', async () => {
    const go = vi.fn();
    const api = { settings: vi.fn().mockResolvedValue({ enabled: false, environment: 'sandbox', linkpayToken: 'tok' }), startForInvoice: vi.fn().mockResolvedValue({ url: 'https://bank/test' }) };
    render(<LinkpaySettings api={api} go={go} />);
    fireEvent.change(await screen.findByLabelText('Arve ID'), { target: { value: 'inv-test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ava testmakse' }));
    await waitFor(() => expect(go).toHaveBeenCalledWith('https://bank/test'));
    expect(api.startForInvoice).toHaveBeenCalledWith('inv-test');
  });
});
