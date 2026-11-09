import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import ParentDashboardPage from './ParentDashboardPage.jsx';
import UnpaidInvoicesNotice from './UnpaidInvoicesNotice.jsx';

const TODAY = new Date('2026-11-09T12:00:00Z');
const unpaid = { id: 'i130', num: 'KS-2026-130', studentId: 's1', amountCents: 24000, paidAmountCents: 0, status: 'Ootel', due: '2026-11-10' };
const late = { id: 'i120', num: 'KS-2026-120', studentId: 's1', amountCents: 9000, paidAmountCents: 3000, status: 'Ootel', due: '2026-11-01' };
const paid = { id: 'i100', num: 'KS-2026-100', studentId: 's1', amountCents: 9000, paidAmountCents: 9000, status: 'Makstud', due: '2026-10-10' };
const cancelled = { id: 'i101', num: 'KS-2026-101', studentId: 's1', amountCents: 9000, status: 'Tühistatud', due: '2026-10-10' };
const off = { config: vi.fn().mockResolvedValue({ enabled: false }), startForInvoice: vi.fn() };

describe('UnpaidInvoicesNotice', () => {
  it('shows one line per unpaid invoice: number, open sum, due date; paid and cancelled ones are left out', () => {
    render(<UnpaidInvoicesNotice invoices={[paid, unpaid, cancelled]} api={off} today={TODAY} />);
    const card = screen.getByRole('region', { name: 'Tasumata arved' });
    const lines = within(card).getAllByRole('listitem');
    expect(lines).toHaveLength(1);
    expect(lines[0].textContent.replace(/\s/g, ' ')).toContain('Arve ootab tasumist · KS-2026-130 · 240,00 € · tähtaeg 10.11');
    expect(card).toHaveTextContent('счёт ждёт оплаты');
    expect(card).not.toHaveTextContent('KS-2026-100');
    expect(card).not.toHaveTextContent('KS-2026-101');
    expect(card).not.toHaveClass('is-overdue');
  });

  it('shows nothing when everything is paid', () => {
    const api = { config: vi.fn().mockResolvedValue({ enabled: true }), startForInvoice: vi.fn() };
    const { container } = render(<UnpaidInvoicesNotice invoices={[paid, cancelled]} api={api} today={TODAY} />);
    expect(container).toBeEmptyDOMElement();
    expect(api.config).not.toHaveBeenCalled();
  });

  it('puts the overdue invoice first, in red with „tähtaeg möödus”, with the balance still due', () => {
    render(<UnpaidInvoicesNotice invoices={[unpaid, late]} api={off} today={TODAY} />);
    const card = screen.getByRole('region', { name: 'Tasumata arved' });
    expect(card).toHaveClass('is-overdue');
    const [first, second] = within(card).getAllByRole('listitem');
    expect(first).toHaveClass('is-overdue');
    expect(first.textContent.replace(/\s/g, ' ')).toContain('KS-2026-120 · 60,00 € · tähtaeg möödus 01.11');
    expect(within(first).getByText('tähtaeg möödus 01.11')).toHaveClass('pd-pay__late');
    expect(first).toHaveTextContent('срок оплаты прошёл');
    expect(second).not.toHaveClass('is-overdue');
  });

  it('never says anything about lessons left — invoice data only', () => {
    render(<UnpaidInvoicesNotice invoices={[{ ...unpaid, lessonsLeft: 3, remainingLessons: 3, lessonBalance: 3 }]} api={off} today={TODAY} />);
    const text = screen.getByRole('region', { name: 'Tasumata arved' }).textContent;
    expect(text).not.toMatch(/tund|tunde|tundi|урок|järel|jääk|balance/i);
  });

  it('offers „Maksa arve” only with card payments on, and opens the bank page from the existing LinkPay start', async () => {
    const api = { config: vi.fn().mockResolvedValue({ enabled: true }), startForInvoice: vi.fn().mockResolvedValue({ url: 'https://pay.example/lp' }) };
    const go = vi.fn();
    render(<UnpaidInvoicesNotice invoices={[unpaid]} api={api} go={go} today={TODAY} />);
    fireEvent.click(await screen.findByRole('button', { name: /Maksa arve/ }));
    await waitFor(() => expect(go).toHaveBeenCalledWith('https://pay.example/lp'));
    expect(api.startForInvoice).toHaveBeenCalledWith('i130');
  });

  it('has no pay button with card payments off or in the administrator\'s preview', async () => {
    const api = { config: vi.fn().mockResolvedValue({ enabled: true }), startForInvoice: vi.fn() };
    render(<UnpaidInvoicesNotice invoices={[unpaid]} api={api} readOnly today={TODAY} />);
    expect(screen.getByRole('region', { name: 'Tasumata arved' })).toBeInTheDocument();
    await Promise.resolve();
    expect(screen.queryByRole('button', { name: /Maksa arve/ })).toBeNull();
    expect(api.config).not.toHaveBeenCalled();
  });
});

describe('UnpaidInvoicesNotice · „Arve PDF” and „Maksin ära” (owner 2026-11-09)', () => {
  const noClaims = () => ({ forInvoices: vi.fn().mockResolvedValue(new Map()), create: vi.fn() });

  it('„Maksin ära” sends a notice with an optional note and then says „Teade saadetud, kontrollime” — not paid', async () => {
    const claims = noClaims();
    claims.create.mockResolvedValue({ id: 'i130', invoiceId: 'i130', claimedByUid: 'p1', note: 'LHV 08.11' });
    const api = { config: vi.fn().mockResolvedValue({ enabled: true }), startForInvoice: vi.fn() };
    render(<UnpaidInvoicesNotice invoices={[unpaid]} api={api} claimsRepository={claims} today={TODAY} />);
    await waitFor(() => expect(claims.forInvoices).toHaveBeenCalledWith(['i130']));
    fireEvent.click(screen.getByRole('button', { name: /Maksin ära/ }));
    const form = screen.getByRole('form', { name: /Teade: arve KS-2026-130 on makstud/ });
    expect(form).toHaveTextContent('Arve jääb tasumata, kuni kool näeb makset pangas.');
    fireEvent.change(within(form).getByLabelText(/Märkus/), { target: { value: 'LHV 08.11' } });
    fireEvent.click(within(form).getByRole('button', { name: 'Saada teade' }));
    expect(await screen.findByText('Teade saadetud, kontrollime')).toBeInTheDocument();
    expect(claims.create).toHaveBeenCalledWith('i130', 'LHV 08.11', undefined, expect.objectContaining({ id: 'i130' }));
    expect(screen.queryByRole('button', { name: /Maksin ära/ })).toBeNull();
    // still in the list as unpaid; the card payment is not offered again to avoid paying twice
    expect(screen.getByRole('region', { name: 'Tasumata arved' })).toHaveTextContent('Arve ootab tasumist · KS-2026-130');
    expect(screen.queryByRole('button', { name: /Maksa arve/ })).toBeNull();
  });

  it('an invoice already claimed shows the notice instead of the button; „Loobu” closes the form without sending', async () => {
    const claims = { forInvoices: vi.fn().mockResolvedValue(new Map([['i120', { id: 'i120' }]])), create: vi.fn() };
    render(<UnpaidInvoicesNotice invoices={[unpaid, late]} api={off} claimsRepository={claims} today={TODAY} />);
    const [first, second] = within(screen.getByRole('region', { name: 'Tasumata arved' })).getAllByRole('listitem');
    expect(await within(first).findByText('Teade saadetud, kontrollime')).toBeInTheDocument();
    expect(within(first).queryByRole('button', { name: /Maksin ära/ })).toBeNull();
    fireEvent.click(within(second).getByRole('button', { name: /Maksin ära/ }));
    fireEvent.click(within(second).getByRole('button', { name: 'Loobu' }));
    expect(within(second).queryByRole('form')).toBeNull();
    expect(claims.create).not.toHaveBeenCalled();
  });

  it('a refused send that another parent already made shows the notice; any other error is shown', async () => {
    const claims = { forInvoices: vi.fn().mockResolvedValueOnce(new Map()).mockResolvedValueOnce(new Map()), create: vi.fn().mockRejectedValue(new Error('Missing or insufficient permissions.')) };
    render(<UnpaidInvoicesNotice invoices={[unpaid]} api={off} claimsRepository={claims} today={TODAY} />);
    await waitFor(() => expect(claims.forInvoices).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: /Maksin ära/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Saada teade' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Missing or insufficient permissions.');
    claims.forInvoices.mockResolvedValueOnce(new Map([['i130', { id: 'i130' }]]));
    fireEvent.click(screen.getByRole('button', { name: 'Saada teade' }));
    expect(await screen.findByText('Teade saadetud, kontrollime')).toBeInTheDocument();
  });

  it('„Arve PDF” fetches the invoice document from the server and hands it to the browser', async () => {
    const pdfApi = { pdf: vi.fn().mockResolvedValue({ filename: 'Arve KS-2026-130.pdf', contentType: 'application/pdf', contentBase64: 'JVBERi0=' }) };
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:invoice') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const click = vi.spyOn(globalThis.HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    render(<UnpaidInvoicesNotice invoices={[unpaid]} api={off} pdfApi={pdfApi} claimsRepository={noClaims()} today={TODAY} />);
    fireEvent.click(screen.getByRole('button', { name: 'Arve KS-2026-130 PDF' }));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(pdfApi.pdf).toHaveBeenCalledWith('i130');
    click.mockRestore();
  });

  it('the administrator\'s preview has neither button', async () => {
    const claims = noClaims();
    render(<UnpaidInvoicesNotice invoices={[unpaid]} api={off} readOnly claimsRepository={claims} today={TODAY} />);
    await waitFor(() => expect(claims.forInvoices).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /Maksin ära|PDF/ })).toBeNull();
  });
});

describe('ParentDashboardPage · unpaid invoices', () => {
  const empty = { listByStudentIds: vi.fn().mockResolvedValue([]), listByStudent: vi.fn().mockResolvedValue([]) };
  const user = { uid: 'parent-1', displayName: 'Mari Ema', roles: ['parent'] };
  const renderPage = (invoices, students = [{ id: 's1', name: 'Mari Tamm' }]) => render(<MemoryRouter><AuthContext.Provider value={{ user }}>
    <ParentDashboardPage studentRepository={{ listOwned: vi.fn().mockResolvedValue(students) }} homeworkRepository={empty} scheduleRepository={empty} lessonRepository={empty}
      invoiceRepository={{ listByStudent: vi.fn().mockImplementation((id) => Promise.resolve(invoices.filter((invoice) => invoice.studentId === id))) }} paymentsApi={off} />
  </AuthContext.Provider></MemoryRouter>);

  it('shows the card at the top of the page, before the child\'s card, naming the child when there are several', async () => {
    renderPage([unpaid, { ...late, studentId: 's2', due: '2020-01-01' }], [{ id: 's1', name: 'Mari Tamm', recordingConsent: true }, { id: 's2', name: 'Jaan Tamm', recordingConsent: true }]);
    const card = await screen.findByRole('region', { name: 'Tasumata arved' });
    const child = screen.getByRole('article');
    expect(card.compareDocumentPosition(child) & globalThis.Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(card).toHaveTextContent('Mari ·');
    expect(card).toHaveTextContent('Jaan ·');
    fireEvent.click(within(card).getByRole('button', { name: /Vaata arveid/ }));
    expect(screen.getByRole('heading', { name: /Viimased arved/ })).toBeInTheDocument();
  });

  it('is not there when every invoice is paid', async () => {
    renderPage([paid]);
    expect(await screen.findByRole('heading', { name: 'Tere, Mari Ema!' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Tasumata arved' })).toBeNull();
  });
});
