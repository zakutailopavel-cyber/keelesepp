import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import TokenInvoiceDialog from './TokenInvoiceDialog.jsx';
import LessonTokensCard from '../students/LessonTokensCard.jsx';
import { monthlyBillingRows } from './monthlyBilling.js';
import { lessonTokenCost, tokenAccount, tokenInvoiceUsage, tokenLine, tokenSummary } from '../../services/firebase/lessonTokens.js';

const kaarel = { id: 'k1', name: 'Kaarel Laps', subject: 'Eesti keel', parentName: 'Liis Vanem', parentEmail: 'liis@example.ee', active: true };

describe('lesson tokens', () => {
  it('an invoice for N lessons at the card price, created and e-mailed, with the current balance shown', async () => {
    const api = { createTokens: vi.fn().mockResolvedValue({ invoice: { id: 'inv1', num: 'KS-2026-300' } }) };
    const deliveryApi = { send: vi.fn().mockResolvedValue({}) };
    const tokensApi = { listByStudent: vi.fn().mockResolvedValue([{ status: 'active', balanceCredits: 2, grantedCredits: 8, consumedCredits: 6 }]) };
    const onCreated = vi.fn();
    render(<TokenInvoiceDialog studentCards={[kaarel]} plans={[{ studentId: 'k1', lessonPriceCents: 2000, lessonMinutes: 60 }]} api={api} deliveryApi={deliveryApi} tokensApi={tokensApi} onCreated={onCreated} />);
    fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
    fireEvent.change(screen.getByLabelText('Õpilane ja aine'), { target: { value: 'k1' } });
    expect(await screen.findByText('2 tundi')).toBeInTheDocument();
    expect(screen.getByText('Liis Vanem')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '9' }));
    expect(screen.getByRole('status')).toHaveTextContent('9 × 20,00 € = 180,00 €');
    fireEvent.click(screen.getByRole('button', { name: 'Loo ja saada' }));
    await waitFor(() => expect(api.createTokens).toHaveBeenCalledWith(expect.objectContaining({ studentId: 'k1', lessons: 9 })));
    expect(deliveryApi.send).toHaveBeenCalledWith('inv1');
    expect(onCreated).toHaveBeenCalledWith({ id: 'inv1', num: 'KS-2026-300' }, { sent: true });
  });

  it('refuses without a lesson price on the card', async () => {
    const api = { createTokens: vi.fn() };
    render(<TokenInvoiceDialog studentCards={[kaarel]} plans={[]} api={api} tokensApi={{ listByStudent: vi.fn().mockResolvedValue([]) }} />);
    fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
    fireEvent.change(screen.getByLabelText('Õpilane ja aine'), { target: { value: 'k1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('tunnihind');
    expect(api.createTokens).not.toHaveBeenCalled();
  });

  it('the student card shows lessons left, a low balance and every movement', async () => {
    const service = {
      listByStudent: vi.fn().mockResolvedValue([{ id: 'p1', status: 'active', balanceCredits: 1, grantedCredits: 9, consumedCredits: 8 }]),
      ledgerByStudent: vi.fn().mockResolvedValue([
        { id: 'l2', entryType: 'lesson_consumption', lessonDate: '2026-10-14', lessonTopic: 'Võrdlemine', creditsDelta: -1, balanceAfter: 1, createdAt: '2026-10-14T10:00:00Z' },
        { id: 'l1', entryType: 'grant', sourceInvoiceNum: 'KS-2026-300', creditsDelta: 9, balanceAfter: 9, createdAt: '2026-10-01T10:00:00Z' },
      ]),
    };
    render(<LessonTokensCard student={kaarel} service={service} />);
    expect(await screen.findByText('1 tundi alles')).toBeInTheDocument();
    expect(screen.getByText('Lõppemas')).toBeInTheDocument();
    expect(screen.getByText(/arve KS-2026-300/)).toBeInTheDocument();
    expect(screen.getByText('-1 → 1')).toBeInTheDocument();
  });

  it('a package card is never offered a monthly invoice; the summary counts only active packages', () => {
    const rows = monthlyBillingRows({ month: '2031-10', students: [kaarel], plans: [{ studentId: 'k1', lessonPriceCents: 2000, billingMode: 'package' }], schedule: [{ id: 'e', studentId: 'k1', recurring: true, day: 'Wed', startDate: '2031-09-03', duration: 60 }] });
    expect(rows[0].status).toBe('package');
    expect(tokenSummary([{ status: 'active', balanceCredits: 3, grantedCredits: 4, consumedCredits: 1 }, { status: 'closed', balanceCredits: 5 }])).toEqual({ balance: 3, granted: 4, consumed: 1, packages: 1 });
  });

  const pkg = (id, issuedAt, granted, consumed, balance, extra = {}) => ({ id, issuedAt, createdAt: `${issuedAt}T10:00:00Z`, status: balance > 0 ? 'active' : 'depleted', grantedCredits: granted, consumedCredits: consumed, balanceCredits: balance, sourceInvoiceId: `inv-${id}`, sourceInvoiceNum: `KS-${id}`, ...extra });

  it('the account per package invoice, oldest first: bought / held / left, used-up packages still counted, owed lessons', () => {
    const account = tokenAccount({
      packages: [pkg('b', '2026-10-01', 4, 1, 3), pkg('a', '2026-09-01', 8, 8, 0), pkg('x', '2026-08-01', 4, 0, 4, { status: 'closed' })],
      owed: [{ lessonId: 'l2', lessonDate: '2026-10-08', status: 'needs_attention' }, { lessonId: 'l3', status: 'cleared' }],
    });
    expect(account.rows.map((row) => [row.invoiceNum, row.bought, row.held, row.left, row.usedUp])).toEqual([['KS-a', 8, 8, 0, true], ['KS-b', 4, 1, 3, false]]);
    expect([account.bought, account.held, account.left, account.owed, account.state]).toEqual([12, 9, 3, 1, 'owed']);
    expect(tokenSummary([pkg('a', '2026-09-01', 8, 8, 0), pkg('b', '2026-10-01', 4, 1, 3)])).toEqual({ balance: 3, granted: 12, consumed: 9, packages: 1 });
    // a correction shows as the difference
    expect(tokenAccount({ packages: [pkg('c', '2026-10-01', 4, 1, 4)] }).rows[0].corrected).toBe(1);
    expect(tokenAccount({ packages: [pkg('d', '2026-10-01', 8, 6, 2)] }).state).toBe('low');
  });

  it('the parent line and the finance month line', () => {
    expect(tokenLine(tokenAccount({ packages: [pkg('a', '2026-09-01', 8, 3, 5)] }))).toBe('Paketist alles 5 tundi');
    expect(tokenLine(tokenAccount({ packages: [pkg('a', '2026-09-01', 8, 8, 0)], owed: [{ lessonDate: '2026-10-08', status: 'needs_attention' }, { lessonDate: '2026-10-15', status: 'needs_attention' }] }))).toBe('Pakett on läbi · 2 tundi ootab tasumist');
    expect(tokenLine(tokenAccount({ packages: [] }))).toBe('');
    const invoice = { billingMode: 'lesson_tokens_v1', tokenCredits: 8, tokenStatus: 'credited' };
    expect(tokenInvoiceUsage(invoice, pkg('a', '2026-09-01', 8, 5, 3))).toBe('Tunnipakett · 8 tundi · peetud 5 · alles 3');
    expect(tokenInvoiceUsage(invoice, pkg('a', '2026-09-01', 8, 8, 0), { owed: 2, showOwed: true })).toBe('Tunnipakett · 8 tundi · peetud 8 · läbi · võlg 2 tundi (uus arve)');
    expect(tokenInvoiceUsage(invoice, null)).toBe('Tunnipakett · 8 tundi · ✓ lisatud õpilasele');
    expect(tokenInvoiceUsage({ ...invoice, tokenStatus: 'pending' })).toBe('Tunnipakett · 8 tundi · tunnid lisatakse pärast makset');
  });

  it('the student card: a table per package invoice and the owed lessons; the parent sees one line', async () => {
    const service = {
      listByStudent: vi.fn().mockResolvedValue([pkg('a', '2026-09-01', 8, 8, 0)]),
      ledgerByStudent: vi.fn().mockResolvedValue([]),
      owedByStudent: vi.fn().mockResolvedValue([{ lessonId: 'l9', lessonDate: '2026-10-08', status: 'needs_attention' }]),
    };
    const { unmount } = render(<LessonTokensCard student={kaarel} service={service} />);
    expect(await screen.findByText('0 tundi alles')).toBeInTheDocument();
    expect(screen.getByText('Võlg')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Tunnipaketid arvete kaupa' });
    expect(table).toHaveTextContent('KS-a');
    expect(table).toHaveTextContent('läbi');
    expect(screen.getByRole('status')).toHaveTextContent('ilma paketita peetud 08.10.2026 — võlg 1 tund');
    unmount();
    render(<LessonTokensCard student={kaarel} service={service} compact />);
    expect(await screen.findByTestId('token-line')).toHaveTextContent('Pakett on läbi · 1 tund ootab tasumist');
  });

  it('a double lesson (120 min) is 2 credits: the rule and the owed count', () => {
    expect([45, 60, 90, 120, 180, undefined].map((duration) => lessonTokenCost({ duration }))).toEqual([1, 1, 1, 2, 3, 1]);
    const account = tokenAccount({ packages: [pkg('a', '2026-09-01', 8, 8, 0)], owed: [{ lessonDate: '2026-10-08', credits: 2, status: 'needs_attention' }, { lessonDate: '2026-10-15', status: 'needs_attention' }] });
    expect(account.owed).toBe(3);
    expect(tokenLine(account)).toBe('Pakett on läbi · 3 tundi ootab tasumist');
  });
});
