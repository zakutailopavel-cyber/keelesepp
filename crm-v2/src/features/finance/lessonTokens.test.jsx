import { createRequire } from 'node:module';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, beforeAll, vi } from 'vitest';
import TokenInvoiceDialog from './TokenInvoiceDialog.jsx';
import LessonTokensCard from '../students/LessonTokensCard.jsx';
import { monthlyBillingRows } from './monthlyBilling.js';
import { lessonTokenCost, owedForSubject, packageSubject, TOKEN_EXPIRY_DAYS, TOKEN_EXPIRY_FROM, tokenAccount, tokenExpiresOn, tokenExpiryStart, tokenInvoiceUsage, tokenLine, tokenLines, tokenPackageExpired, tokenSubjectKey, tokenSummary } from '../../services/firebase/lessonTokens.js';

const require = createRequire(import.meta.url);
const server = require('../../../../functions/lesson-tokens-core.js');

const kaarel = { id: 'k1', name: 'Kaarel Laps', subject: 'Eesti keel', parentName: 'Liis Vanem', parentEmail: 'liis@example.ee', active: true };

describe('lesson tokens', () => {
  // the views read expiry for today: a fixed today, inside the 14 days of the fixtures
  beforeAll(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-11-02T10:00:00Z')); });
  afterAll(() => { vi.useRealTimers(); });

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
    expect(tokenLine(tokenAccount({ packages: [pkg('a', '2026-09-01', 8, 3, 5)] }))).toBe('Paketist alles 5 tundi · kehtib kuni 13.11.2026');
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

  // ---- one package per subject, expiry (owner 2026-10-30) ----
  const mia = { id: 'm1', name: 'Mia', subject: 'Eesti keel', parentName: 'Ema', parentEmail: 'ema@example.ee', active: true, enrollments: [{ subject: 'Eesti keel', teacher: 'Pavel' }, { subject: 'Matemaatika', teacher: 'Liza' }] };
  const et = (id, granted, consumed, balance, extra = {}) => pkg(id, '2026-10-20', granted, consumed, balance, { subject: 'Eesti keel', ...extra });
  const ma = (id, granted, consumed, balance, extra = {}) => pkg(id, '2026-10-21', granted, consumed, balance, { subject: 'Matemaatika', ...extra });

  it('the same rule as the server: subject keys, start, last day, expired (worked examples)', () => {
    expect([TOKEN_EXPIRY_DAYS, TOKEN_EXPIRY_FROM]).toEqual([server.TOKEN_EXPIRY_DAYS, server.TOKEN_EXPIRY_FROM]);
    for (const subject of ['Eesti keel', 'EESTI', 'English', 'Inglise Keel', 'Matem', 'Matemaatika', 'Vene keel', 'Russian', 'Eesti keel emakeelena', 'Õpioskused', '']) {
      expect(tokenSubjectKey(subject)).toBe(server.tokenSubjectKey(subject));
    }
    const examples = [
      { issuedAt: '2026-01-05', createdAt: '2026-01-06T10:00:00Z', lastLessonDate: '2026-02-01' },
      { issuedAt: '2031-03-01', activatedOn: '2031-03-02' },
      { issuedAt: '2031-03-01', activatedOn: '2031-03-10', lastLessonDate: '2031-01-15' },
      { issuedAt: '2031-03-01', activatedOn: '2031-03-02', lastLessonDate: '2031-03-09' },
      { issuedAt: '2031-03-01', activatedOn: '2031-03-02', extendedUntil: '2031-06-01' },
      { issuedAt: '2031-11-01', createdAt: '2026-10-30T10:00:00Z' },
    ];
    for (const item of examples) {
      expect(tokenExpiryStart(item)).toBe(server.tokenExpiryStart(item));
      expect(tokenExpiresOn(item)).toBe(server.tokenExpiresOn(item));
      for (const asOf of ['2026-11-13', '2026-11-14', '2031-03-16', '2031-03-17', '2031-06-02']) expect(tokenPackageExpired(item, asOf)).toBe(server.tokenPackageExpired(item, asOf));
    }
    for (const card of [mia, kaarel]) for (const item of [{}, { subject: 'matemaatika' }]) expect(packageSubject(item, card)).toBe(server.packageSubject(item, card));
  });

  it('the account per subject: each its own left, debt and state; an old package on a card with several stays shared', () => {
    const account = tokenAccount({
      card: mia,
      packages: [et('e', 8, 3, 5), ma('m', 4, 4, 0), pkg('old', '2026-10-19', 2, 0, 2)],
      owed: [{ lessonDate: '2026-10-25', subject: 'Matemaatika', status: 'needs_attention', credits: 2 }],
    });
    const bySubject = Object.fromEntries(account.subjects.map((group) => [group.subject, [group.left, group.owed, group.state]]));
    expect(bySubject).toEqual({ 'Eesti keel': [5, 0, 'ok'], Matemaatika: [0, 2, 'owed'], '': [2, 0, 'low'] });
    expect([account.left, account.owed, account.state]).toEqual([7, 2, 'owed']);
    expect(tokenLines(account)).toEqual([
      'Paketist alles 2 tundi · kehtib kuni 13.11.2026 · ilma aineta',
      'Paketist alles 5 tundi · kehtib kuni 13.11.2026 · Eesti keel',
      'Pakett on läbi · 2 tundi ootab tasumist · Matemaatika',
    ]);
    // one subject on the card: an old package and an owed state without a subject take it
    const one = tokenAccount({ card: kaarel, packages: [pkg('a', '2026-10-20', 8, 8, 0)], owed: [{ lessonDate: '2026-10-25', status: 'needs_attention' }] });
    expect(one.subjects.map((group) => group.subject)).toEqual(['Eesti keel']);
    expect(tokenLine(one)).toBe('Pakett on läbi · 1 tund ootab tasumist · Eesti keel');
  });

  it('an expired package: no longer „alles”, shown as „aegunud N”; grandfathered until the rule\'s 14 days have passed', () => {
    const old = et('e', 8, 3, 5, { lastLessonDate: '2026-10-20' });
    expect(tokenAccount({ card: kaarel, packages: [old], today: '2026-11-13' }).left).toBe(5);
    const account = tokenAccount({ card: kaarel, packages: [old], today: '2026-11-14' });
    expect([account.left, account.expired, account.state]).toEqual([0, 5, 'expired']);
    expect(account.rows[0]).toMatchObject({ left: 0, expired: 5, usedUp: false, corrected: 0 });
    expect(tokenLine(account)).toBe('Paketist alles 0 tundi · aegunud 5 tundi · Eesti keel');
    expect(tokenSummary([old], '2026-11-14').balance).toBe(0);
    expect(tokenInvoiceUsage({ tokenCredits: 8, tokenStatus: 'credited' }, old, { today: '2026-11-14' })).toBe('Tunnipakett · 8 tundi · peetud 3 · aegunud 5');
    // a used-up package has nothing to expire; an extended one counts again
    expect(tokenAccount({ packages: [et('f', 8, 8, 0)], today: '2027-01-01' }).expired).toBe(0);
    expect(tokenAccount({ card: kaarel, packages: [{ ...old, extendedUntil: '2026-11-28' }], today: '2026-11-20' }).left).toBe(5);
  });

  it('each subject\'s debt on that subject\'s package invoice', () => {
    const owed = [{ subject: 'Matemaatika', credits: 2 }, { subject: 'Eesti keel' }];
    expect(owedForSubject(owed, 'Matemaatika')).toBe(2);
    expect(owedForSubject(owed, 'Eesti keel')).toBe(1);
    expect(owedForSubject(owed, '')).toBe(3);
  });

  it('the student card splits by subject; the parent reads one line per subject with its name', async () => {
    const service = {
      listByStudent: vi.fn().mockResolvedValue([et('e', 8, 3, 5), ma('m', 4, 4, 0)]),
      ledgerByStudent: vi.fn().mockResolvedValue([]),
      owedByStudent: vi.fn().mockResolvedValue([{ lessonId: 'l1', lessonDate: '2026-10-25', subject: 'Matemaatika', status: 'needs_attention' }]),
    };
    const { unmount } = render(<LessonTokensCard student={mia} service={service} />);
    expect(await screen.findByRole('table', { name: 'Tunnipaketid arvete kaupa · Eesti keel' })).toHaveTextContent('KS-e');
    expect(screen.getByRole('table', { name: 'Tunnipaketid arvete kaupa · Matemaatika' })).toHaveTextContent('läbi');
    expect(screen.getByRole('status')).toHaveTextContent('võlg 1 tund');
    unmount();
    render(<LessonTokensCard student={mia} service={service} compact />);
    const lines = await screen.findAllByTestId('token-line');
    expect(lines.map((line) => line.textContent)).toEqual(['Paketist alles 5 tundi · kehtib kuni 13.11.2026 · Eesti keel', 'Pakett on läbi · 1 tund ootab tasumist · Matemaatika']);
  });

  it('the package dialog requires a subject on a card with several: its price, its balance, sent to the server', async () => {
    const api = { createTokens: vi.fn().mockResolvedValue({ invoice: { id: 'inv2', num: 'KS-2026-301' } }) };
    const tokensApi = { listByStudent: vi.fn().mockResolvedValue([et('e', 8, 3, 5), ma('m', 4, 2, 2)]) };
    const plans = [{ studentId: 'm1', lessonPriceCents: 2000, lessonMinutes: 60, subjectPrices: { Matemaatika: { lessonPriceCents: 3000, lessonMinutes: 45 } } }];
    render(<TokenInvoiceDialog studentCards={[mia]} plans={plans} api={api} tokensApi={tokensApi} />);
    fireEvent.click(screen.getByRole('button', { name: /Tunnipakett/ }));
    fireEvent.change(screen.getByLabelText('Õpilane ja aine'), { target: { value: 'm1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Vali aine');
    expect(api.createTokens).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Aine'), { target: { value: 'Matemaatika' } });
    expect(await screen.findByText('2 tundi')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('8 × 30,00 € = 240,00 €');
    fireEvent.click(screen.getByRole('button', { name: 'Loo arve' }));
    await waitFor(() => expect(api.createTokens).toHaveBeenCalledWith(expect.objectContaining({ studentId: 'm1', subject: 'Matemaatika' })));
  });

  it('an administrator extends an expired package with a reason; others get no button', async () => {
    vi.setSystemTime(new Date('2026-12-01T10:00:00Z'));
    try {
      const service = { listByStudent: vi.fn().mockResolvedValue([et('e', 8, 3, 5)]), ledgerByStudent: vi.fn().mockResolvedValue([]) };
      const extendApi = { extendStudentPackage: vi.fn().mockResolvedValue({}) };
      const { unmount } = render(<LessonTokensCard student={kaarel} service={service} />);
      expect(await screen.findByText('Aegunud')).toBeInTheDocument();
      expect(screen.getByRole('table', { name: 'Tunnipaketid arvete kaupa' })).toHaveTextContent('aegunud 5');
      expect(screen.queryByRole('button', { name: 'Pikenda' })).toBeNull();
      unmount();
      render(<LessonTokensCard student={kaarel} service={service} canExtend extendApi={extendApi} />);
      fireEvent.click(await screen.findByRole('button', { name: 'Pikenda' }));
      fireEvent.click(screen.getByRole('button', { name: 'Pikenda 14 päeva' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('põhjus');
      expect(extendApi.extendStudentPackage).not.toHaveBeenCalled();
      fireEvent.change(screen.getByLabelText('Põhjus'), { target: { value: 'Õpilane oli haige' } });
      fireEvent.click(screen.getByRole('button', { name: 'Pikenda 14 päeva' }));
      await waitFor(() => expect(extendApi.extendStudentPackage).toHaveBeenCalledWith('e', { reason: 'Õpilane oli haige' }));
      await waitFor(() => expect(service.listByStudent).toHaveBeenCalledTimes(3));
    } finally {
      vi.setSystemTime(new Date('2026-11-02T10:00:00Z'));
    }
  });
});
