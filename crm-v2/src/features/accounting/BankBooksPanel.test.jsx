import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BankBooksPanel from './BankBooksPanel.jsx';

const month = new Date().toISOString().slice(0, 7);
const accounts = [
  { code: '1010', name: 'Pangakonto' },
  { code: '3530', name: 'Saadud dotatsioonid, toetused' },
  { code: '4320', name: 'IT teenused, arvutitarvikud' },
];
const lines = [
  { id: 'lhv_1', state: 'review', date: `${month}-09`, direction: 'C', amountCents: 5000, counterpartyName: 'MARI NÄIDIS', explanation: 'tunnid', match: { kind: 'allocate', confidence: 'likely', reason: 'maksja nimi ja summa = avatud arve', allocations: [{ invoiceId: 'i3', invoiceNum: 'KS-2026-803', amountCents: 5000 }] } },
  { id: 'lhv_2', state: 'unmatched', date: `${month}-10`, direction: 'C', amountCents: 88452, counterpartyName: 'EESTI TÖÖTUKASSA', counterpartyAccount: 'EE000000000000000401', explanation: 'Juhendamistasu' },
  { id: 'lhv_3', state: 'categorized', date: `${month}-11`, direction: 'D', amountCents: 549, counterpartyName: 'APPLE.COM/BILL', category: { account: '4320', label: 'IT' }, entryKeys: ['bank-line:lhv_3'] },
];
const repo = (overrides = {}) => ({
  loadBank: vi.fn().mockResolvedValue({ lines, rules: [{ id: 'r1', direction: 'D', counterpartyName: 'APPLE', account: '4320', label: 'IT', active: true }], balances: {}, bankBooksSince: '2026-11-01', imports: [] }),
  importBankStatement: vi.fn().mockResolvedValue({ lines: 5, imported: 5, duplicates: 0, matched: 2, review: 1, categorized: 0, unmatched: 2, errors: [] }),
  confirmBankLine: vi.fn().mockResolvedValue({}),
  dismissBankLine: vi.fn().mockResolvedValue({}),
  categorizeBankLine: vi.fn().mockResolvedValue({ rule: { id: 'r2' }, appliedToOthers: 1 }),
  uncategorizeBankLine: vi.fn().mockResolvedValue({}),
  setBankBooks: vi.fn().mockResolvedValue({ bankBooks: { since: '2026-11-01' } }),
  setBankClosingBalance: vi.fn().mockResolvedValue({}),
  saveBankRule: vi.fn().mockResolvedValue({}),
  rematchBankLines: vi.fn().mockResolvedValue({ matched: 0, review: 0, categorized: 0 }),
  bankBooksReview: vi.fn().mockResolvedValue({ withoutBank: [], dateDiffers: [], salesWithoutMoney: [] }),
  ...overrides,
});
const entries = [{ id: 'auto_bank-line_lhv_3', sourceKey: 'bank-line:lhv_3', date: `${month}-11`, number: '2026-0100', origin: 'auto', lines: [{ account: '4320', debitCents: 549, creditCents: 0 }, { account: '1010', debitCents: 0, creditCents: 549 }] }];

describe('BankBooksPanel', () => {
  it('shows the start of the bank rule and confirms a suggestion in one click', async () => {
    const repository = repo();
    const onBooksChanged = vi.fn();
    render(<BankBooksPanel repository={repository} entries={entries} accounts={accounts} onBooksChanged={onBooksChanged} />);
    const review = await screen.findByRole('region', { name: 'Kinnita vasted' });
    expect(screen.getByText(/lähevad raamatupidamisse ainult arved ja maksed/)).toBeInTheDocument();
    expect(within(review).getByText(/KS-2026-803/)).toBeInTheDocument();
    expect(within(review).getByText(/maksja nimi ja summa/)).toBeInTheDocument();
    fireEvent.click(within(review).getByRole('button', { name: /Kinnita/ }));
    await waitFor(() => expect(repository.confirmBankLine).toHaveBeenCalledWith('lhv_1'));
    await waitFor(() => expect(onBooksChanged).toHaveBeenCalled());
    fireEvent.click(within(review).getByRole('button', { name: 'Pole see' }));
    await waitFor(() => expect(repository.dismissBankLine).toHaveBeenCalledWith('lhv_1'));
  });

  it('categorises a line without a document and saves a rule by the counterparty account', async () => {
    const repository = repo();
    render(<BankBooksPanel repository={repository} entries={entries} accounts={accounts} />);
    const open = await screen.findByRole('region', { name: 'Ilma dokumendita read' });
    expect(within(open).getByText('EESTI TÖÖTUKASSA')).toBeInTheDocument();
    const button = within(open).getByRole('button', { name: 'Kirjenda' });
    expect(button).toBeDisabled();
    fireEvent.change(within(open).getByLabelText('Kategooria lhv_2'), { target: { value: '3530' } });
    fireEvent.click(within(open).getByLabelText(/Reegel/));
    expect(within(open).getByLabelText('Reegli alus lhv_2').value).toBe('account');
    fireEvent.click(button);
    await waitFor(() => expect(repository.categorizeBankLine).toHaveBeenCalledWith('lhv_2', { account: '3530', label: 'Toetus (Töötukassa jm)', rule: { counterpartyAccount: 'EE000000000000000401' } }));
    expect(await screen.findByText(/rakendati veel 1 reale/)).toBeInTheDocument();
  });

  it('refuses the bank account itself as a category and shows the month check against 1010', async () => {
    render(<BankBooksPanel repository={repo()} entries={entries} accounts={accounts} />);
    const open = await screen.findByRole('region', { name: 'Ilma dokumendita read' });
    fireEvent.change(within(open).getByLabelText('Konto lhv_2'), { target: { value: '1010' } });
    expect(within(open).getByRole('button', { name: 'Kirjenda' })).toBeDisabled();
    const check = screen.getByRole('region', { name: 'Kuu kontroll' });
    const notBooked = within(check).getByRole('table', { name: 'Pangaread, mis ei klapi' });
    expect(within(notBooked).getAllByText('Otsus puudub')).toHaveLength(2);
    expect(within(notBooked).queryByText('APPLE.COM/BILL')).toBeNull();
  });

  it('read-only: lists without buttons', async () => {
    render(<BankBooksPanel repository={repo()} entries={entries} accounts={accounts} readOnly />);
    await screen.findByRole('region', { name: 'Kinnita vasted' });
    expect(screen.queryByRole('button', { name: /Kinnita/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /Impordi LHV/ })).toBeNull();
  });

  it('imports a statement file and reports what happened to its lines', async () => {
    const repository = repo();
    render(<BankBooksPanel repository={repository} entries={entries} accounts={accounts} />);
    const input = await screen.findByLabelText('LHV väljavõtte fail');
    const file = new globalThis.File(['"Счёт клиента","Дата","Сумма"\n'], 'okt.csv', { type: 'text/csv' });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => expect(repository.importBankStatement).toHaveBeenCalledWith(expect.stringContaining('Счёт клиента'), 'okt.csv'));
    expect(await screen.findByText(/okt.csv: 5 rida \(5 uut, 0 juba olemas\) · seotud 2 · kinnitada 1/)).toBeInTheDocument();
  });
});
