import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AccountingPage from './AccountingPage.jsx';
import { journalWorkbook, partnersWorkbook } from './accountingExcel.js';
import { journalReport, ledger, linesText, partnerKey, partnerReport } from './accountingReports.js';

// Partners on entry lines (the accountant 2026-10-24: „Поставщиков сначала, и привяжи их к проводкам”,
// docs/ACCOUNTING.md „Partnerid”). Grid rows: OA 1 header 0, lines 1–2; PR 1 header 3, lines 4–5.
// Columns: Konto 0, Kuupäev 1, Dokument 2, Kirjeldus 3, Partner 4, Deebet 5, Kreedit 6.
const year = new Date().getFullYear();
const accounts = [
  { code: '1010', name: 'Pangakonto', type: 'asset' },
  { code: '1200', name: 'Ostjatelt laekumata arved', type: 'asset' },
  { code: '2110', name: 'Võlad tarnijatele', type: 'liability' },
  { code: '4210', name: 'Ruumide rent', type: 'expense' },
  { code: '4320', name: 'Tarkvara', type: 'expense' },
];
const kirsi = { id: 's1', name: 'Kirsi Residents OÜ', regCode: '12345678', active: true };
const zone = { id: 's2', name: 'Zone Media OÜ', regCode: '11223344', active: true };
const suppliers = [kirsi, zone];
const P = (s) => ({ type: 'supplier', id: s.id, name: s.name });
const entries = [
  { id: 'auto_purchase-invoice_pi1', number: `${year}-0001`, date: `${year}-01-05`, origin: 'auto', documentType: 'purchaseInvoice', description: 'Kirsi Residents OÜ', documentRef: '2026/7', lines: [{ account: '4210', debitCents: 30000, creditCents: 0, note: 'üür', partner: P(kirsi) }, { account: '2110', debitCents: 0, creditCents: 30000, note: 'Arve 2026/7', partner: P(kirsi) }], totalCents: 30000 },
  { id: 'manual_m1', number: `${year}-0002`, date: `${year}-02-17`, origin: 'manual', description: 'Zone Media tasumine', documentRef: 'PA-1', lines: [{ account: '2110', debitCents: 1482, creditCents: 0 }, { account: '1010', debitCents: 0, creditCents: 1482 }], totalCents: 1482 },
];
const repo = (overrides = {}) => ({
  load: vi.fn().mockResolvedValue({ entries, accounts, suppliers }),
  sync: vi.fn().mockResolvedValue({ created: 0 }),
  updateEntry: vi.fn().mockResolvedValue({}),
  createEntry: vi.fn().mockResolvedValue({ entry: { number: `${year}-0003` } }),
  saveSupplier: vi.fn().mockResolvedValue({}),
  importSuppliers: vi.fn().mockResolvedValue({ created: ['a'] }),
  ...overrides,
});
const cell = (r, c) => document.querySelector(`[data-cell="${r}-${c}"]`);
const open = async (repository, props = {}) => {
  render(<MemoryRouter><AccountingPage repository={repository} canEdit {...props} /></MemoryRouter>);
  await screen.findByText('PR 1');
  await waitFor(() => expect(repository.sync).toHaveBeenCalled());
};

describe('Partner column in the päevaraamat', () => {
  it('shows the partner, „Puudub: partner” on a 2110 line without one; type-ahead by name or registry code saves the supplier', async () => {
    const repository = repo();
    await open(repository);
    expect(screen.getByRole('button', { name: /^Partner\s*$/ })).toBeInTheDocument();
    expect(cell(1, 4)).toHaveTextContent('Kirsi Residents OÜ');
    expect(cell(4, 4)).toHaveTextContent('Puudub: partner');
    expect(cell(5, 4)).not.toHaveTextContent('Puudub');
    fireEvent.mouseDown(cell(4, 4));
    const editor = screen.getByLabelText('Partner (muuda)');
    fireEvent.change(editor, { target: { value: '1122' } });
    const list = screen.getByRole('listbox', { name: 'Sobivad tarnijad' });
    expect(within(list).getAllByRole('option').map((o) => o.textContent)).toEqual(['Zone Media OÜ 11223344']);
    fireEvent.keyDown(editor, { key: 'Enter' });
    expect(cell(4, 4)).toHaveTextContent('Zone Media OÜ');
    expect(cell(5, 4)).toHaveClass('is-active');
    fireEvent.mouseDown(cell(1, 3));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('manual_m1', expect.objectContaining({
      lines: [{ account: '2110', debitCents: 1482, creditCents: 0, note: '', partner: { type: 'supplier', id: 's2', name: 'Zone Media OÜ' } }, { account: '1010', debitCents: 0, creditCents: 1482, note: '' }],
    }), ''));
  });

  it('a manual entry does not save with a 2110 line without a supplier or with a name that is not in Tarnijad', async () => {
    const repository = repo();
    await open(repository);
    fireEvent.mouseDown(cell(3, 3));
    fireEvent.change(screen.getByLabelText('Kirjeldus (muuda)'), { target: { value: 'Zone Media OÜ tasumine' } });
    fireEvent.keyDown(screen.getByLabelText('Kirjeldus (muuda)'), { key: 'Enter' });
    fireEvent.mouseDown(cell(1, 3));
    expect(await screen.findByText(/Real 2110 puudub partner \(tarnija\)/)).toBeInTheDocument();
    fireEvent.mouseDown(cell(4, 4));
    fireEvent.change(screen.getByLabelText('Partner (muuda)'), { target: { value: 'Keegi Muu' } });
    fireEvent.keyDown(screen.getByLabelText('Partner (muuda)'), { key: 'Enter' });
    expect(cell(4, 4)).toHaveTextContent('pole tarnijate seas');
    fireEvent.mouseDown(cell(1, 3));
    expect(await screen.findByText(/Partner „Keegi Muu” — vali tarnija nimekirjast/)).toBeInTheDocument();
    expect(repository.updateEntry).not.toHaveBeenCalled();
  });

  it('filter by partner; the new manual entry needs the partner on 2110 and pastes a Partner column from Excel', async () => {
    const repository = repo();
    await open(repository);
    fireEvent.change(screen.getByLabelText('Filter: partner'), { target: { value: 'kirsi' } });
    expect(screen.queryByText('PR 1')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filter: partner'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa kanne' }));
    fireEvent.change(screen.getByLabelText('Algdokument (nr / nimetus)'), { target: { value: 'OA-2026/20' } });
    fireEvent.change(screen.getByLabelText('Sisu'), { target: { value: 'Kirsi üür' } });
    fireEvent.change(screen.getByLabelText('Rida 1 konto'), { target: { value: '4210' } });
    fireEvent.change(screen.getByLabelText('Rida 1 deebet'), { target: { value: '248,40' } });
    fireEvent.change(screen.getByLabelText('Rida 2 konto'), { target: { value: '2110' } });
    fireEvent.change(screen.getByLabelText('Rida 2 kreedit'), { target: { value: '248,40' } });
    expect(screen.getByText(/Puudub: partner \(2110\)/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Salvesta kanne' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Rida 2 partner'), { target: { value: 'kir' } });
    fireEvent.mouseDown(screen.getByRole('option', { name: /Kirsi Residents OÜ/ }));
    expect(screen.getByLabelText('Rida 2 partner')).toHaveValue('Kirsi Residents OÜ');
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta kanne' }));
    await waitFor(() => expect(repository.createEntry).toHaveBeenCalledWith(expect.objectContaining({ lines: [
      { account: '4210', debitCents: 24840, creditCents: 0, note: '' },
      { account: '2110', debitCents: 0, creditCents: 24840, note: '', partner: { type: 'supplier', id: 's1', name: 'Kirsi Residents OÜ' } },
    ] })));
    // paste from Excel: Konto | Kirjeldus | Deebet | Kreedit | Partner (name or registry code)
    fireEvent.click(await screen.findByRole('button', { name: 'Lisa kanne' }));
    fireEvent.paste(screen.getByLabelText('Rida 1 konto'), { clipboardData: { getData: () => '4320\tserver\t14,82\t\t\n2110\tserver\t\t14,82\t11223344\n' } });
    expect(screen.getByLabelText('Rida 2 partner')).toHaveValue('Zone Media OÜ');
    expect(document.querySelector('tbody.accounting-draft')).not.toHaveTextContent(/Puudub: partner/);
  });
});

describe('Partnerid report and the pearaamat by partner', () => {
  const report = () => partnerReport(entries, accounts, { from: `${year}-01-01`, to: `${year}-12-31`, account: '2110' }, { suppliers, labels: new Map([['auto_purchase-invoice_pi1', 'OA 1']]) });

  it('per partner: algsaldo, käive D / K, lõppsaldo and the lines; lines without a partner in „Partner puudub”', () => {
    const r = report();
    expect(r.rows.map((x) => [x.name, x.regCode, x.turnover.debit, x.turnover.credit, x.closing.debit, x.closing.credit])).toEqual([
      ['Kirsi Residents OÜ', '12345678', 0, 30000, 0, 30000],
      ['Partner puudub', '', 1482, 0, 1482, 0],
    ]);
    expect(r.rows[0].lines[0]).toMatchObject({ label: 'OA 1', documentRef: '2026/7', creditCents: 30000, balance: -30000 });
    expect(r.missing.lines).toHaveLength(1);
    expect(r.total.turnover).toEqual({ debit: 1482, credit: 30000 });
    const later = partnerReport(entries, accounts, { from: `${year}-02-01`, to: `${year}-12-31`, account: '2110' });
    expect(later.rows[0]).toMatchObject({ name: 'Kirsi Residents OÜ', opening: { debit: 0, credit: 30000 }, turnover: { debit: 0, credit: 0 } });
    expect(partnerReport(entries, accounts, { account: '' }).rows.find((x) => x.name === 'Kirsi Residents OÜ').turnover).toEqual({ debit: 30000, credit: 30000 });
  });

  it('pearaamat filtered by a partner; the history shows the partner; Excel has the Partner column and the Partnerid sheets', () => {
    const only = ledger(entries, '2110', { from: `${year}-01-01`, partner: partnerKey(P(kirsi)) }, accounts);
    expect(only.rows.map((r) => r.creditCents)).toEqual([30000]);
    expect(ledger(entries, '2110', { from: `${year}-01-01`, partner: 'none' }, accounts).rows.map((r) => r.debitCents)).toEqual([1482]);
    expect(linesText(entries[0].lines)).toBe('4210 D 300,00 (Kirsi Residents OÜ), 2110 K 300,00 (Kirsi Residents OÜ)');
    const xml = journalWorkbook(journalReport(entries, accounts, {}), { company: { name: 'E&P', regCode: '1' } });
    expect(xml).toContain('<Data ss:Type="String">Partner</Data>');
    expect(xml).toContain('<Data ss:Type="String">Kirsi Residents OÜ</Data>');
    const sheets = partnersWorkbook(report(), { company: { name: 'E&P', regCode: '1' }, period: { from: `${year}-01-01`, to: '' }, accountLabel: '2110 Võlad tarnijatele' });
    expect(sheets).toContain('ss:Name="Partnerid"');
    expect(sheets).toContain('ss:Name="Read"');
    expect(sheets).toContain('12345678');
    expect(sheets).toContain('Partner puudub');
  });

  it('the Partnerid tab: 2110 by default, a click opens the lines, „Pearaamat” opens the ledger filtered by that partner', async () => {
    const repository = repo();
    await open(repository);
    fireEvent.click(screen.getByRole('button', { name: 'Partnerid' }));
    expect(screen.getByRole('heading', { name: /Partnerid · 2110 Võlad tarnijatele/ })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Partner puudub 1 real/);
    fireEvent.click(screen.getByRole('button', { name: /Kirsi Residents OÜ/ }));
    expect(screen.getByText('OA 1')).toBeInTheDocument();
    fireEvent.click(within(document.querySelector('.accounting-partners')).getByRole('button', { name: 'Pearaamat' }));
    expect(screen.getByLabelText('Konto')).toHaveValue('2110');
    expect(screen.getByLabelText('Partner')).toHaveValue(partnerKey(P(kirsi)));
    expect(document.querySelectorAll('.accounting-table tbody tr')).toHaveLength(3);
    expect(screen.queryByText('Zone Media tasumine')).not.toBeInTheDocument();
  });

  it('Tarnijad is reachable from Raamatupidamine: the button opens the suppliers grid', async () => {
    const repository = repo();
    await open(repository);
    fireEvent.click(screen.getAllByRole('button', { name: /Tarnijad/ })[0]);
    expect(screen.getByLabelText('Otsi tarnijat')).toBeInTheDocument();
    expect(screen.getByLabelText('Kirsi Residents OÜ: Registrikood')).toHaveValue('12345678');
    expect(screen.getByText('2 tarnijat')).toBeInTheDocument();
  });
});
