import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AccountingPage from './AccountingPage.jsx';
import { partnerRegisterWorkbook, partnersWorkbook } from './accountingExcel.js';
import { maskCode, partnerKey, partnerReport } from './accountingReports.js';
import { cardPartner, partnerMatches, resolvePartner } from './journalGrid.js';
import { filterRegister, missingPresets, otherImportPreview, parseOtherPaste, partnerCards, registerRows } from './partnerRegister.js';
import { clipboardRows } from './journalGrid.js';

// Partnerid — ostjad, tarnijad ja muud (the accountant 2026-11-19: „Партнёров нет в бухгалтерии, есть только tarnijad”,
// docs/ACCOUNTING.md „Partnerid”). Grid rows: OA 1 header 0, lines 1–2; PR 1 header 3, lines 4–5. Partner column 4.
const year = new Date().getFullYear();
const accounts = [
  { code: '1010', name: 'Pangakonto', type: 'asset' },
  { code: '1200', name: 'Ostjatelt laekumata arved', type: 'asset' },
  { code: '2030', name: 'Lühiajaline laen omanikult', type: 'liability' },
  { code: '2110', name: 'Võlad tarnijatele', type: 'liability' },
  { code: '4210', name: 'Ruumide rent', type: 'expense' },
];
const kirsi = { id: 's1', name: 'Kirsi Residents OÜ', regCode: '12345678', active: true };
const mta = { id: 'p1', name: 'Maksu- ja Tolliamet', kind: 'tax', regCode: '70000349', active: true };
const mari = { id: 'p2', name: 'Mari Maasikas', kind: 'employee', regCode: '48001010000', active: true };
const popov = { id: 'reg:14112233', type: 'customer', kind: 'company', name: 'Popovtakso OÜ', regCode: '14112233', invoiceCount: 3, lastInvoiceDate: `${year}-02-01`, source: 'CRM arved' };
const anna = { id: 'name:anna kask', type: 'customer', kind: 'private', name: 'Anna Kask', regCode: '', invoiceCount: 1, lastInvoiceDate: `${year}-01-10`, source: 'CRM arved' };
const entries = [
  { id: 'auto_purchase-invoice_pi1', number: `${year}-0001`, date: `${year}-01-05`, origin: 'auto', documentType: 'purchaseInvoice', description: 'Kirsi Residents OÜ', documentRef: '2026/7', lines: [{ account: '4210', debitCents: 30000, creditCents: 0, partner: { type: 'supplier', id: 's1', name: 'Kirsi Residents OÜ' } }, { account: '2110', debitCents: 0, creditCents: 30000, partner: { type: 'supplier', id: 's1', name: 'Kirsi Residents OÜ' } }], totalCents: 30000 },
  { id: 'manual_m1', number: `${year}-0002`, date: `${year}-02-17`, origin: 'manual', description: 'Tasaarvestus osanikuga', documentRef: 'Leping 1', lines: [{ account: '1010', debitCents: 5000, creditCents: 0 }, { account: '2030', debitCents: 0, creditCents: 5000 }], totalCents: 5000 },
  { id: 'auto_invoice_i1', number: `${year}-0003`, date: `${year}-02-01`, origin: 'auto', documentType: 'invoice', description: 'Müügiarve', documentRef: 'KS-1', lines: [{ account: '1200', debitCents: 9000, creditCents: 0, partner: { type: 'customer', id: 'student1', name: 'Popovtakso OÜ' } }, { account: '3000', debitCents: 0, creditCents: 9000 }], totalCents: 9000 },
];
const repo = (overrides = {}) => ({
  load: vi.fn().mockResolvedValue({ entries, accounts, suppliers: [kirsi], otherPartners: [mta, mari] }),
  loadCustomers: vi.fn().mockResolvedValue([popov, anna]),
  sync: vi.fn().mockResolvedValue({ created: 0 }),
  updateEntry: vi.fn().mockResolvedValue({}),
  createEntry: vi.fn().mockResolvedValue({ entry: { number: `${year}-0004` } }),
  saveSupplier: vi.fn().mockResolvedValue({}),
  importSuppliers: vi.fn().mockResolvedValue({ created: ['a'] }),
  saveAccountingPartner: vi.fn().mockResolvedValue({}),
  importAccountingPartners: vi.fn().mockResolvedValue({ created: ['x', 'y'] }),
  ...overrides,
});
const cell = (r, c) => document.querySelector(`[data-cell="${r}-${c}"]`);
const open = async (repository) => {
  render(<MemoryRouter><AccountingPage repository={repository} canEdit /></MemoryRouter>);
  await screen.findByText('PR 1');
  await waitFor(() => expect(repository.sync).toHaveBeenCalled());
};
const openRegister = async (repository) => {
  await open(repository);
  fireEvent.click(screen.getByRole('button', { name: /Partnerite register/, pressed: false }));
};

describe('partner helpers', () => {
  it('cards of three types; suggestions over all of them; a picked card keeps its type', () => {
    const cards = partnerCards({ suppliers: [kirsi], others: [mta, { ...mari, active: false }], customers: [popov] });
    expect(cards.map((c) => c.partnerType)).toEqual(['supplier', 'customer', 'other', 'other']);
    expect(partnerMatches(cards, 'ma').map((c) => c.name)).toEqual(['Maksu- ja Tolliamet']);
    expect(partnerMatches(cards, 'oü').map((c) => c.name)).toEqual(['Kirsi Residents OÜ', 'Popovtakso OÜ']);
    expect(partnerMatches(cards, '1411').map((c) => c.name)).toEqual(['Popovtakso OÜ']);
    expect(cardPartner(cards[2])).toEqual({ type: 'other', id: 'p1', name: 'Maksu- ja Tolliamet' });
    expect(resolvePartner('popovtakso oü', cards)).toEqual({ type: 'customer', id: 'reg:14112233', name: 'Popovtakso OÜ' });
    expect(resolvePartner('70000349', cards)).toEqual({ type: 'other', id: 'p1', name: 'Maksu- ja Tolliamet' });
    // a Tarnijad card without partnerType is still a supplier (before 2026-11-19)
    expect(cardPartner(kirsi)).toEqual({ type: 'supplier', id: 's1', name: 'Kirsi Residents OÜ' });
  });

  it('register rows: Tüüp, masked personal codes, search, presets not yet added', () => {
    const rows = registerRows({ suppliers: [kirsi], others: [mta, mari], customers: [popov, anna] });
    expect(rows.map((r) => [r.name, r.typeLabel, r.code])).toEqual([
      ['Anna Kask', 'Ostja', ''],
      ['Kirsi Residents OÜ', 'Tarnija', '12345678'],
      ['Maksu- ja Tolliamet', 'Muu', '70000349'],
      ['Mari Maasikas', 'Muu', '4******0000'],
      ['Popovtakso OÜ', 'Ostja', '14112233'],
    ]);
    expect(filterRegister(rows, { type: 'other' })).toHaveLength(2);
    expect(filterRegister(rows, { query: 'töötaja' }).map((r) => r.name)).toEqual(['Mari Maasikas']);
    expect(maskCode('70000349')).toBe('70000349');
    expect(missingPresets([mta]).map((p) => p.key)).toEqual(['tootukassa', 'osanik', 'lhv']);
    const xml = partnerRegisterWorkbook(rows, { company: { name: 'E&P', regCode: '1' } });
    expect(xml).toContain('<Data ss:Type="String">Tüüp</Data>');
    expect(xml).toContain('4******0000');
    expect(xml).not.toContain('48001010000');
  });

  it('Muud from Excel: header row in any order, kinds by name, duplicates and errors skipped', () => {
    const rows = parseOtherPaste('Nimi\tLiik\tKood\nEesti Töötukassa\tRiigiasutus\t70009770\nMTA\tMaksuamet\t70000349\nJaan\tTöötaja\t\n\tMuu\t\n', clipboardRows);
    expect(rows.map((r) => [r.name, r.kind, r.regCode])).toEqual([['Eesti Töötukassa', 'public', '70009770'], ['MTA', 'tax', '70000349'], ['Jaan', 'employee', '']]);
    expect(otherImportPreview(rows, [mta]).map((p) => p.status)).toEqual(['new', 'duplicate', 'new']);
  });

  it('Partnerid report: customers grouped by name (sales entries carry the student id), Tüüp and codes for every type', () => {
    const lines = [
      ...entries,
      { id: 'manual_m2', number: `${year}-0004`, date: `${year}-03-01`, origin: 'manual', description: 'Laekumine', documentRef: 'PA-2', lines: [{ account: '1010', debitCents: 9000 }, { account: '1200', creditCents: 9000, partner: { type: 'customer', id: 'reg:14112233', name: 'Popovtakso OÜ' } }], totalCents: 9000 },
    ];
    const report = partnerReport(lines, [...accounts, { code: '3000', name: 'Müügitulu', type: 'income' }], { from: `${year}-01-01`, to: `${year}-12-31`, account: '1200' }, { suppliers: [kirsi], others: [mta], customers: [popov] });
    expect(report.rows.map((r) => [r.name, r.typeLabel, r.regCode, r.turnover.debit, r.turnover.credit])).toEqual([['Popovtakso OÜ', 'Ostja', '14112233', 9000, 9000]]);
    expect(partnerKey({ type: 'customer', id: 'student1', name: 'Popovtakso OÜ' })).toBe(partnerKey({ type: 'customer', id: 'reg:14112233', name: 'popovtakso oü' }));
    const onlyOther = partnerReport(lines, accounts, { account: '', type: 'other' }, {});
    expect(onlyOther.rows).toEqual([]);
    const sheets = partnersWorkbook(report, { company: { name: 'E&P', regCode: '1' }, period: { from: `${year}-01-01`, to: '' }, accountLabel: '1200' });
    expect(sheets).toContain('<Data ss:Type="String">Tüüp</Data>');
    expect(sheets).toContain('<Data ss:Type="String">Ostja</Data>');
  });
});

describe('Partnerite register on Raamatupidamine', () => {
  it('Kõik shows every partner with its type; Ostjad come from the invoices read-only; a personal code is masked', async () => {
    const repository = repo();
    await openRegister(repository);
    await waitFor(() => expect(repository.loadCustomers).toHaveBeenCalled());
    const table = document.querySelector('.partners-register__table');
    await waitFor(() => expect(table).toHaveTextContent('Popovtakso OÜ'));
    expect(table).toHaveTextContent('Kirsi Residents OÜ');
    expect(table).toHaveTextContent('Maksu- ja Tolliamet');
    expect(table).toHaveTextContent('4******0000');
    expect(table).not.toHaveTextContent('48001010000');
    fireEvent.click(screen.getByRole('button', { name: /^Ostjad/ }));
    expect(screen.getByText(/Ostjad tulevad CRM-i arvetest/)).toBeInTheDocument();
    const rows = document.querySelectorAll('.partners-register__table tbody tr');
    expect([...rows].map((r) => r.textContent)).toEqual([expect.stringContaining('Anna Kask'), expect.stringContaining('Popovtakso OÜ')]);
    expect(rows[1]).toHaveTextContent('14112233');
    expect(screen.queryByRole('textbox', { name: /Popovtakso OÜ:/ })).toBeNull();
  });

  it('Muud: one-click presets, a new partner typed in the grid, import from Excel', async () => {
    const repository = repo();
    await openRegister(repository);
    fireEvent.click(screen.getByRole('button', { name: /^Muud/ }));
    const presets = screen.getByRole('group', { name: 'Lisa kiiresti' });
    expect(within(presets).queryByRole('button', { name: /Maksu- ja Tolliamet/ })).toBeNull();
    fireEvent.click(within(presets).getByRole('button', { name: /Pavel Zakutailo/ }));
    await waitFor(() => expect(repository.saveAccountingPartner).toHaveBeenCalledWith('', { name: 'Pavel Zakutailo', kind: 'owner', regCode: '', active: true }));
    expect(screen.getByLabelText('Mari Maasikas: Reg-kood / isikukood')).toHaveValue('4******0000');
    fireEvent.focus(screen.getByLabelText('Mari Maasikas: Reg-kood / isikukood'));
    expect(screen.getByLabelText('Mari Maasikas: Reg-kood / isikukood')).toHaveValue('48001010000');
    fireEvent.change(screen.getByLabelText('Uus partner: Nimi'), { target: { value: 'Jaan Tamm' } });
    fireEvent.change(screen.getByLabelText('Uus partner: Liik'), { target: { value: 'employee' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa partner' }));
    await waitFor(() => expect(repository.saveAccountingPartner).toHaveBeenLastCalledWith('', expect.objectContaining({ name: 'Jaan Tamm', kind: 'employee' })));
    fireEvent.click(screen.getByRole('button', { name: /Impordi Excelist/ }));
    fireEvent.change(screen.getByLabelText('Kleebi partnerid Excelist'), { target: { value: 'Eesti Töötukassa\tRiigiasutus\t70009770\nMTA\tMaksuamet\t70000349\n' } });
    expect(screen.getByText(/Duplikaat — jääb vahele/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Impordi 1 partner' }));
    await waitFor(() => expect(repository.importAccountingPartners).toHaveBeenCalledWith([expect.objectContaining({ name: 'Eesti Töötukassa', kind: 'public', regCode: '70009770' })]));
  });

  it('the register still opens when Ostjad cannot be loaded', async () => {
    const repository = repo({ loadCustomers: vi.fn().mockRejectedValue(new Error('403')) });
    await openRegister(repository);
    expect(await screen.findByText(/Ostjate nimekirja ei saanud laadida/)).toBeInTheDocument();
    expect(document.querySelector('.partners-register__table')).toHaveTextContent('Kirsi Residents OÜ');
  });
});

describe('Partner cell with all partner types', () => {
  it('suggests Tarnija / Ostja / Muu with a badge and saves an „other” partner on a line', async () => {
    // only OA 1 and PR 1 in the grid, so the rows are as in the header comment
    const repository = repo({ load: vi.fn().mockResolvedValue({ entries: entries.slice(0, 2), accounts, suppliers: [kirsi], otherPartners: [mta, mari] }) });
    await open(repository);
    await waitFor(() => expect(repository.loadCustomers).toHaveBeenCalled());
    fireEvent.mouseDown(cell(5, 4));
    const editor = screen.getByLabelText('Partner (muuda)');
    fireEvent.change(editor, { target: { value: 'o' } });
    await waitFor(() => expect(screen.getByRole('listbox', { name: 'Sobivad partnerid' })).toHaveTextContent('Ostja'));
    const options = within(screen.getByRole('listbox', { name: 'Sobivad partnerid' })).getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(expect.arrayContaining(['Kirsi Residents OÜ 12345678 Tarnija', 'Popovtakso OÜ 14112233 Ostja', 'Maksu- ja Tolliamet 70000349 Muu']));
    fireEvent.change(editor, { target: { value: 'mari' } });
    expect(within(screen.getByRole('listbox', { name: 'Sobivad partnerid' })).getAllByRole('option').map((o) => o.textContent)).toEqual(['Mari Maasikas 4******0000 Muu']);
    fireEvent.change(editor, { target: { value: 'maks' } });
    fireEvent.keyDown(editor, { key: 'Enter' });
    expect(cell(5, 4)).toHaveTextContent('Maksu- ja Tolliamet');
    fireEvent.mouseDown(cell(1, 3));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('manual_m1', expect.objectContaining({
      lines: [{ account: '1010', debitCents: 5000, creditCents: 0, note: '' }, { account: '2030', debitCents: 0, creditCents: 5000, note: '', partner: { type: 'other', id: 'p1', name: 'Maksu- ja Tolliamet' } }],
    }), ''));
  });

  it('the Partnerid report filters by Tüüp', async () => {
    const repository = repo();
    await open(repository);
    fireEvent.click(screen.getByRole('button', { name: 'Partnerid' }));
    fireEvent.change(screen.getByLabelText('Konto'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Tüüp'), { target: { value: 'customer' } });
    const table = document.querySelector('.accounting-partners');
    expect(table).toHaveTextContent('Popovtakso OÜ');
    expect(table).not.toHaveTextContent('Kirsi Residents OÜ');
  });
});
