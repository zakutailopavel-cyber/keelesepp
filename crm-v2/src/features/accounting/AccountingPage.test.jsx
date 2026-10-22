import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AccountingPage from './AccountingPage.jsx';
import { journalWorkbook, trialBalanceWorkbook } from './accountingExcel.js';
import { journalRows, trialBalance } from './accountingReports.js';

const year = new Date().getFullYear();
const accounts = [
  { code: '1010', name: 'Pangakonto', type: 'asset', reportLine: 'Raha' },
  { code: '1200', name: 'Ostjatelt laekumata arved', type: 'asset', reportLine: 'Nõuded ostjate vastu' },
  { code: '2210', name: 'Palgavõlg', type: 'liability', reportLine: 'Võlad töövõtjatele' },
  { code: '3060', name: 'Maksuvaba müügitulu', type: 'income', reportLine: 'Müügitulu' },
  { code: '4710', name: 'Palgakulu', type: 'expense', reportLine: 'Palgakulu' },
];
const entries = [
  { id: 'auto_invoice_i1', number: `${year}-0001`, date: `${year}-01-10`, origin: 'auto', description: 'Müügiarve KS-1', documentRef: 'KS-1', lines: [{ account: '1200', debitCents: 8000, creditCents: 0 }, { account: '3060', debitCents: 0, creditCents: 8000 }], totalCents: 8000 },
  { id: 'manual_m1', number: `${year}-0002`, date: `${year}-01-31`, origin: 'manual', description: 'Jaanuari palk', documentRef: 'Palgaleht 01', lines: [{ account: '4710', debitCents: 3000, creditCents: 0 }, { account: '2210', debitCents: 0, creditCents: 3000 }], totalCents: 3000 },
];
const repo = (overrides = {}) => ({
  load: vi.fn().mockResolvedValue({ entries, accounts }),
  sync: vi.fn().mockResolvedValue({ created: 0, total: 1 }),
  createEntry: vi.fn().mockResolvedValue({ entry: { number: `${year}-0003` } }),
  reverse: vi.fn().mockResolvedValue({ entry: { number: `${year}-0004` } }),
  setOpening: vi.fn(),
  saveAccount: vi.fn(),
  ...overrides,
});

describe('AccountingPage', () => {
  it('shows the päevaraamat and brings the automatic entries up to date when it opens', async () => {
    const repository = repo();
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    expect(await screen.findByText('Müügiarve KS-1')).toBeInTheDocument();
    expect(screen.getByText('Jaanuari palk')).toBeInTheDocument();
    await waitFor(() => expect(repository.sync).toHaveBeenCalledTimes(1));
    // only a manual entry can be reversed by hand; an automatic one follows its document
    expect(screen.getAllByRole('button', { name: 'Storno' })).toHaveLength(1);
  });

  it('saves a manual entry in cents and refuses an unbalanced one on the server side message', async () => {
    const repository = repo();
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    await screen.findByText('Müügiarve KS-1');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa kanne' }));
    fireEvent.change(screen.getByLabelText('Algdokument (nr / nimetus)'), { target: { value: 'Palgaleht 02' } });
    fireEvent.change(screen.getByLabelText('Sisu'), { target: { value: 'Veebruari palk' } });
    fireEvent.change(screen.getByLabelText('Rida 1 konto'), { target: { value: '4710' } });
    fireEvent.change(screen.getByLabelText('Rida 1 deebet'), { target: { value: '1 250,50' } });
    fireEvent.change(screen.getByLabelText('Rida 2 konto'), { target: { value: '2210' } });
    fireEvent.change(screen.getByLabelText('Rida 2 kreedit'), { target: { value: '1250,50' } });
    expect(screen.getByText(/Deebet 1\s?250,50 · Kreedit 1\s?250,50/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta kanne' }));
    await waitFor(() => expect(repository.createEntry).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Veebruari palk', documentRef: 'Palgaleht 02',
      lines: [{ account: '4710', debitCents: 125050, creditCents: 0, note: '' }, { account: '2210', debitCents: 0, creditCents: 125050, note: '' }],
    })));
  });

  it('a storno needs a reason', async () => {
    const repository = repo();
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    await screen.findByText('Jaanuari palk');
    fireEvent.click(screen.getByRole('button', { name: 'Storno' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tee storno' }));
    expect(await screen.findByText('Lisa tühistamise põhjus.')).toBeInTheDocument();
    expect(repository.reverse).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Storno põhjus'), { target: { value: 'vale summa' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tee storno' }));
    await waitFor(() => expect(repository.reverse).toHaveBeenCalledWith('manual_m1', expect.any(String), 'vale summa'));
  });

  it('käibeandmik shows the turnover per account with totals', async () => {
    render(<MemoryRouter><AccountingPage repository={repo()} /></MemoryRouter>);
    await screen.findByText('Müügiarve KS-1');
    fireEvent.click(screen.getByRole('button', { name: 'Käibeandmik' }));
    const row = screen.getByRole('button', { name: '3060' }).closest('tr');
    expect(within(row).getByText('Maksuvaba müügitulu')).toBeInTheDocument();
    expect(within(row).getAllByText('80,00')).toHaveLength(2);
  });
});

describe('Excel exports', () => {
  it('päevaraamat and käibeandmik have the template columns and escape text', () => {
    const journal = journalWorkbook(journalRows([{ ...entries[0], description: 'Arve <A&B>' }], accounts, {}), { company: 'E&P Koolitus OÜ', period: { from: `${year}-01-01`, to: `${year}-12-31` } });
    expect(journal).toContain('Järjekorra nr');
    expect(journal).toContain('Kontode nimetus ja operatsiooni sisu');
    expect(journal).toContain('Arve &lt;A&amp;B&gt;');
    expect(journal).toContain('<Data ss:Type="Number">80.00</Data>');
    const trial = trialBalanceWorkbook(trialBalance(entries, accounts, { from: `${year}-01-01`, to: `${year}-12-31` }), { company: 'E&P Koolitus OÜ', period: {} });
    expect(trial).toContain('Algsaldo deebet');
    expect(trial).toContain('Lõppsaldo kreedit');
  });
});
