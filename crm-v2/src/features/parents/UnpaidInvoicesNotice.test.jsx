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
