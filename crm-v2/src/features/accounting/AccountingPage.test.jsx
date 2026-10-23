import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AccountingPage from './AccountingPage.jsx';
import { journalWorkbook, trialBalanceWorkbook } from './accountingExcel.js';
import { COMPANY, journalReport, trialBalance } from './accountingReports.js';

const year = new Date().getFullYear();
const accounts = [
  { code: '1010', name: 'Pangakonto', type: 'asset', reportLine: 'Raha' },
  { code: '1200', name: 'Ostjatelt laekumata arved', type: 'asset', reportLine: 'Nõuded ostjate vastu' },
  { code: '2210', name: 'Palgavõlg', type: 'liability', reportLine: 'Võlad töövõtjatele' },
  { code: '3060', name: 'Maksuvaba müügitulu', type: 'income', reportLine: 'Müügitulu' },
  { code: '4710', name: 'Palgakulu', type: 'expense', reportLine: 'Palgakulu' },
];
const entries = [
  { id: 'auto_invoice_i1', number: `${year}-0001`, date: `${year}-01-10`, origin: 'auto', documentType: 'invoice', description: 'Müügiarve KS-1', documentRef: 'KS-1', lines: [{ account: '1200', debitCents: 8000, creditCents: 0 }, { account: '3060', debitCents: 0, creditCents: 8000 }], totalCents: 8000 },
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
    expect(await screen.findByText('MA 1')).toBeInTheDocument();
    expect(screen.getByText('PR 1')).toBeInTheDocument();
    expect(screen.getAllByText('Jaanuari palk')).toHaveLength(2);
    expect(screen.getByText('Kokku 2 kannet')).toBeInTheDocument();
    expect(screen.getByText('4 kirjet')).toBeInTheDocument();
    expect(screen.getByText('Rg-kood 17270880')).toBeInTheDocument();
    await waitFor(() => expect(repository.sync).toHaveBeenCalledTimes(1));
    // only a manual entry can be reversed by hand; an automatic one follows its document
    expect(screen.getAllByRole('button', { name: 'Storno' })).toHaveLength(1);
  });

  it('filters the päevaraamat by kande kood and sorts it by date', async () => {
    const more = [...entries, { id: 'auto_invoice_i0', number: `${year}-0003`, date: `${year}-01-05`, origin: 'auto', documentType: 'invoice', description: 'Müügiarve KS-0', documentRef: 'KS-0', lines: [{ account: '1200', debitCents: 123456, creditCents: 0 }, { account: '3060', debitCents: 0, creditCents: 123456 }], totalCents: 123456 }];
    render(<MemoryRouter><AccountingPage repository={repo({ load: vi.fn().mockResolvedValue({ entries: more.map((x) => (x.origin === 'auto' ? { ...x, documentType: 'invoice' } : x)), accounts }) })} /></MemoryRouter>);
    await screen.findByText('MA 2');
    const labels = () => [...document.querySelectorAll('.accounting-grid__entry td:first-child')].map((td) => td.textContent);
    expect(labels()).toEqual(['MA 1', 'MA 2', 'PR 1']);
    fireEvent.change(screen.getByLabelText('Järjestus'), { target: { value: 'date' } });
    expect(labels()).toEqual(['MA 2', 'MA 1', 'PR 1']);
    fireEvent.change(screen.getByLabelText('Kande kood'), { target: { value: 'MA' } });
    expect(labels()).toEqual(['MA 2', 'MA 1']);
    expect(screen.getByText('MA Müügiarve kanne', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getAllByText('1 234,56').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1 314,56', { selector: 'tfoot td' })).toHaveLength(2);
    expect(screen.getByText('Kokku 2 kannet')).toBeInTheDocument();
  });

  it('saves a manual entry in cents and refuses an unbalanced one on the server side message', async () => {
    const repository = repo();
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    await screen.findByText('MA 1');
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
    await screen.findByText('PR 1');
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
    await screen.findByText('MA 1');
    fireEvent.click(screen.getByRole('button', { name: 'Käibeandmik' }));
    const row = screen.getByRole('button', { name: '3060' }).closest('tr');
    expect(within(row).getByText('Maksuvaba müügitulu')).toBeInTheDocument();
    expect(within(row).getAllByText('80,00')).toHaveLength(2);
    expect(screen.getByRole('columnheader', { name: 'Algsaldo' })).toHaveAttribute('colspan', '2');
    expect(screen.getAllByRole('columnheader', { name: 'Kreedit' })).toHaveLength(3);
    const total = screen.getByText('Kokku').closest('tr');
    expect(within(total).getAllByText('110,00')).toHaveLength(4);
  });
});

describe('Excel exports', () => {
  it('päevaraamat: the template grid with filters, entry blocks, totals and the company footer', () => {
    const report = journalReport([{ ...entries[0], documentType: 'invoice', description: 'Arve <A&B>' }, entries[1]], accounts, { from: `${year}-01-01`, to: `${year}-01-31`, code: '' });
    const xml = journalWorkbook(report, { company: COMPANY, printedAt: new Date(2026, 9, 23, 9, 5, 7) });
    expect(xml).toContain('<Data ss:Type="String">Päevaraamat</Data>');
    expect(xml).toContain(`01.01.${year} kuni 31.01.${year}`);
    expect(xml).toContain('<Data ss:Type="String">Kõik</Data>');
    expect(xml).toContain('<Data ss:Type="String">Kande kood</Data>');
    for (const head of ['Kanne', 'Dokument', 'Kuupäev', 'Konto', 'Kirjeldus', 'Deebet', 'Kreedit']) expect(xml).toContain(`ss:StyleID="gHead${head === 'Deebet' || head === 'Kreedit' ? 'Num' : ''}"><Data ss:Type="String">${head}</Data>`);
    // Kuupäev, then Dokument (the accountant 2026-10-23), in both header bands
    expect(xml).toContain('<Data ss:Type="String">Kanne</Data></Cell><Cell ss:StyleID="gHead"><Data ss:Type="String">Kuupäev</Data></Cell><Cell ss:StyleID="gHead"><Data ss:Type="String">Dokument</Data>');
    expect(xml).toContain('<Data ss:Type="String">Konto</Data></Cell><Cell ss:StyleID="gHead"><Data ss:Type="String">Kuupäev</Data></Cell><Cell ss:StyleID="gHead"><Data ss:Type="String">Dokument</Data></Cell><Cell ss:StyleID="gHead"><Data ss:Type="String">Kirjeldus</Data>');
    expect(xml).not.toContain('Kurss');
    expect(xml).not.toContain('Valuuta');
    expect(xml).toContain('<Data ss:Type="String">MA 1</Data>');
    expect(xml).toContain(`<Data ss:Type="String">10.01.${year}</Data>`);
    expect(xml).toContain('<Data ss:Type="String">1200 Ostjatelt laekumata arved</Data>');
    expect(xml).toContain('Arve &lt;A&amp;B&gt;');
    expect(xml).toContain('<Data ss:Type="Number">80.00</Data>');
    expect(xml).toContain('<Data ss:Type="Number">0.00</Data>');
    expect(xml).toContain('Kokku 2 kannet');
    expect(xml).toContain('4 kirjet');
    expect(xml).toContain('<Data ss:Type="Number">110.00</Data>');
    expect(xml).toContain('<Data ss:Type="String">E&amp;P Koolitus OÜ</Data>');
    expect(xml).toContain('23.10.2026 09:05:07');
    expect(xml).toContain('Rg-kood 17270880');
    // a ruled grid: every grid style has four borders
    expect(xml.match(/<Style ss:ID="g[A-Za-z]*">/g).length).toBeGreaterThan(5);
    expect(xml).toMatch(/<Style ss:ID="g"><Borders>(<Border [^>]+\/>){4}<\/Borders>/);
  });

  it('käibeandmik: two-level header Algsaldo / Käive / Lõppsaldo over Deebet / Kreedit and a Kokku row', () => {
    const trial = trialBalanceWorkbook(trialBalance(entries, accounts, { from: `${year}-01-01`, to: `${year}-12-31` }), { company: COMPANY, period: { from: `${year}-01-01`, to: `${year}-12-31` } });
    expect(trial).toContain('ss:MergeDown="1"><Data ss:Type="String">Konto</Data>');
    for (const group of ['Algsaldo', 'Käive', 'Lõppsaldo']) expect(trial).toContain(`ss:MergeAcross="1"><Data ss:Type="String">${group}</Data>`);
    expect(trial.match(/<Data ss:Type="String">Deebet<\/Data>/g)).toHaveLength(3);
    expect(trial.match(/<Data ss:Type="String">Kreedit<\/Data>/g)).toHaveLength(3);
    expect(trial).toContain('<Data ss:Type="String">Kokku</Data>');
    expect(trial).toContain('<Data ss:Type="Number">110.00</Data>');
  });
});
