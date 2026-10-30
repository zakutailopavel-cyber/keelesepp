import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AccountingPage from './AccountingPage.jsx';

// The päevaraamat as a spreadsheet (docs/ACCOUNTING.md „Päevaraamat kui tabel”). Rows in the default order:
// MA 1 header 0, its lines 1–2; PR 1 header 3, its lines 4–5. Columns: Konto 0, Kuupäev 1, Dokument 2, Kirjeldus 3,
// Partner 4, Deebet 5, Kreedit 6.
const year = new Date().getFullYear();
const accounts = [
  { code: '1010', name: 'Pangakonto', type: 'asset' },
  { code: '1200', name: 'Ostjatelt laekumata arved', type: 'asset' },
  { code: '2210', name: 'Palgavõlg', type: 'liability' },
  { code: '3000', name: 'Kauba, teenuse müük', type: 'income' },
  { code: '3060', name: 'Maksuvaba müügitulu', type: 'income' },
  { code: '4710', name: 'Palgakulu', type: 'expense' },
];
const entries = [
  { id: 'auto_invoice_i1', number: `${year}-0001`, date: `${year}-01-10`, origin: 'auto', documentType: 'invoice', description: 'Müügiarve KS-1', documentRef: 'KS-1', lines: [{ account: '1200', debitCents: 8000, creditCents: 0 }, { account: '3060', debitCents: 0, creditCents: 8000 }], totalCents: 8000 },
  { id: 'manual_m1', number: `${year}-0002`, date: `${year}-01-31`, origin: 'manual', description: 'Jaanuari palk', documentRef: 'Palgaleht 01', lines: [{ account: '4710', debitCents: 3000, creditCents: 0 }, { account: '2210', debitCents: 0, creditCents: 3000 }], totalCents: 3000 },
];
const repo = (overrides = {}) => ({
  load: vi.fn().mockResolvedValue({ entries, accounts }),
  sync: vi.fn().mockResolvedValue({ created: 0 }),
  updateEntry: vi.fn().mockResolvedValue({}),
  replaceAccount: vi.fn().mockResolvedValue({ changed: [{ entryId: 'auto_invoice_i1', number: `${year}-0001`, lineIndexes: [1] }] }),
  deleteEntry: vi.fn(),
  reverse: vi.fn(),
  createEntry: vi.fn().mockResolvedValue({ entry: { number: `${year}-0003` } }),
  ...overrides,
});
const cell = (r, c) => document.querySelector(`[data-cell="${r}-${c}"]`);
const grid = () => screen.getByRole('grid', { name: 'Päevaraamat' });
const open = async (repository, props = {}) => {
  render(<MemoryRouter><AccountingPage repository={repository} canEdit {...props} /></MemoryRouter>);
  await screen.findByText('PR 1');
  await waitFor(() => expect(repository.sync).toHaveBeenCalled());
};
const typeInto = (r, c, value, key = 'Enter') => {
  fireEvent.mouseDown(cell(r, c));
  const editor = cell(r, c).querySelector('input');
  fireEvent.change(editor, { target: { value } });
  fireEvent.keyDown(editor, { key });
};

beforeEach(() => { try { globalThis.sessionStorage.clear(); } catch { /* no storage */ } });

describe('JournalGrid', () => {
  it('a click edits a cell in place; Enter, arrows and Tab move like Excel; leaving the entry saves it when D = K', async () => {
    const repository = repo();
    await open(repository);
    const loads = repository.load.mock.calls.length;
    fireEvent.mouseDown(cell(4, 5));
    const editor = screen.getByLabelText('Deebet (muuda)');
    expect(editor).toHaveValue('30,00');
    fireEvent.change(editor, { target: { value: '35' } });
    fireEvent.keyDown(editor, { key: 'Enter' });
    // Enter moves down to the credit line's debit cell
    expect(cell(5, 5)).toHaveClass('is-active');
    expect(cell(4, 5)).toHaveTextContent('35,00');
    fireEvent.keyDown(grid(), { key: 'ArrowRight' });
    expect(cell(5, 6)).toHaveClass('is-active');
    // typing starts an edit with that character; Esc cancels it
    fireEvent.keyDown(grid(), { key: '9' });
    expect(screen.getByLabelText('Kreedit (muuda)')).toHaveValue('9');
    fireEvent.keyDown(screen.getByLabelText('Kreedit (muuda)'), { key: 'Escape' });
    expect(cell(5, 6)).toHaveTextContent('30,00');
    // the entry is not balanced yet: still unsaved, the difference shown
    expect(screen.getByText(/vahe 5,00/)).toBeInTheDocument();
    // F2 edits; Tab in the last cell adds a line and goes to its account
    fireEvent.keyDown(grid(), { key: 'F2' });
    fireEvent.change(screen.getByLabelText('Kreedit (muuda)'), { target: { value: '35' } });
    fireEvent.keyDown(screen.getByLabelText('Kreedit (muuda)'), { key: 'Tab' });
    expect(cell(6, 0)).toHaveClass('is-active');
    expect(repository.updateEntry).not.toHaveBeenCalled();
    // leaving the entry saves it (the empty new line is left out)
    fireEvent.keyDown(grid(), { key: 'ArrowUp' });
    fireEvent.mouseDown(cell(1, 3));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('manual_m1', {
      date: `${year}-01-31`, description: 'Jaanuari palk', documentRef: 'Palgaleht 01',
      lines: [{ account: '4710', debitCents: 3500, creditCents: 0, note: '' }, { account: '2210', debitCents: 0, creditCents: 3500, note: '' }],
    }, ''));
    await waitFor(() => expect(repository.load.mock.calls.length).toBe(loads + 1));
  });

  it('an unbalanced entry turns red and is not saved until it is fixed', async () => {
    const repository = repo();
    await open(repository);
    typeInto(4, 5, '40');
    fireEvent.mouseDown(cell(1, 0));
    await waitFor(() => expect(document.querySelector('tbody.is-invalid')).not.toBeNull());
    expect(screen.getByRole('alert', { name: '' })).toHaveTextContent(/vahe 10,00.*D − K = 10,00/);
    expect(repository.updateEntry).not.toHaveBeenCalled();
    // Esc on the grid in that entry would drop it; here it is fixed instead
    fireEvent.keyDown(screen.getByLabelText('Konto (muuda)'), { key: 'Escape' });
    typeInto(5, 6, '40');
    fireEvent.mouseDown(cell(0, 3));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('manual_m1', expect.objectContaining({ lines: [expect.objectContaining({ debitCents: 4000 }), expect.objectContaining({ creditCents: 4000 })] }), ''));
  });

  it('an automatic entry is corrected like any other, no reason asked; Ctrl+Z undoes the last saved change', async () => {
    const repository = repo();
    await open(repository);
    typeInto(2, 0, '3000');
    expect(cell(2, 0)).toHaveTextContent('3000 Kauba, teenuse müük');
    fireEvent.mouseDown(cell(4, 3));
    fireEvent.keyDown(screen.getByLabelText('Kirjeldus (muuda)'), { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta muudatused (1)' }));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('auto_invoice_i1', expect.objectContaining({ date: `${year}-01-10`, documentRef: 'KS-1', lines: [expect.objectContaining({ account: '1200' }), expect.objectContaining({ account: '3000' })] }), ''));
    // an automatic entry can be deleted too
    expect(screen.getAllByRole('button', { name: 'Kustuta' })).toHaveLength(2);
    fireEvent.keyDown(grid(), { key: 'z', ctrlKey: true });
    await waitFor(() => expect(repository.updateEntry).toHaveBeenLastCalledWith('auto_invoice_i1', expect.objectContaining({ lines: [expect.objectContaining({ account: '1200', debitCents: 8000 }), expect.objectContaining({ account: '3060', creditCents: 8000 })] }), 'Tagasivõtmine (Ctrl+Z): müügitulu 3000'));
  });

  it('an automatic entry saves and takes a new date and document', async () => {
    const repository = repo();
    await open(repository);
    typeInto(2, 0, '3000');
    fireEvent.mouseDown(cell(4, 3));
    fireEvent.keyDown(screen.getByLabelText('Kirjeldus (muuda)'), { key: 'Escape' });
    fireEvent.click(await screen.findByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('auto_invoice_i1', expect.anything(), ''));
    fireEvent.mouseDown(cell(1, 1));
    expect(cell(1, 1).classList.contains('is-editable')).toBe(true);
  });

  it('a manual entry changes its date and document in place; lines are inserted and deleted with the keyboard and the row control', async () => {
    const repository = repo();
    await open(repository);
    typeInto(3, 1, `15.01.${year}`);
    typeInto(3, 2, 'Palgaleht 01b');
    fireEvent.mouseDown(cell(4, 0));
    fireEvent.keyDown(screen.getByLabelText('Konto (muuda)'), { key: 'Escape' });
    fireEvent.keyDown(grid(), { key: 'Insert' });
    expect(document.querySelectorAll('tbody')[1].querySelectorAll('tr')).toHaveLength(5);
    fireEvent.keyDown(grid(), { key: 'ArrowDown' });
    fireEvent.keyDown(grid(), { key: '-', ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Lisa rida pärast rida 2 (PR 1)' }));
    // the row controls show on the active row (and on hover)
    fireEvent.click(screen.getByRole('button', { name: 'Kustuta rida 3 (PR 1)', hidden: true }));
    fireEvent.mouseDown(cell(0, 3));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('manual_m1', expect.objectContaining({ date: `${year}-01-15`, documentRef: 'Palgaleht 01b', lines: [expect.objectContaining({ account: '4710' }), expect.objectContaining({ account: '2210' })] }), ''));
  });

  it('Shift+click selects cells and Ctrl+C copies them as tab separated text; Ctrl+V pastes rows from Excel into an entry', async () => {
    const repository = repo();
    await open(repository);
    fireEvent.mouseDown(cell(4, 0));
    fireEvent.keyDown(screen.getByLabelText('Konto (muuda)'), { key: 'Escape' });
    fireEvent.mouseDown(cell(5, 6), { shiftKey: true });
    expect(cell(4, 5)).toHaveClass('is-selected');
    const setData = vi.fn();
    fireEvent.copy(grid(), { clipboardData: { setData } });
    expect(setData).toHaveBeenCalledWith('text/plain', `4710 Palgakulu\t31.01.${year}\tPalgaleht 01\tJaanuari palk\t\t30,00\t0,00\n2210 Palgavõlg\t31.01.${year}\tPalgaleht 01\tJaanuari palk\t\t0,00\t30,00`);
    fireEvent.mouseDown(cell(4, 0));
    fireEvent.keyDown(screen.getByLabelText('Konto (muuda)'), { key: 'Escape' });
    fireEvent.paste(grid(), { clipboardData: { getData: () => '4710\t\t\tpalk\t\t1 234,50\t\n2210\t\t\tpalk\t\t\t1 234,50' } });
    expect(cell(4, 5)).toHaveTextContent('1 234,50');
    fireEvent.mouseDown(cell(0, 3));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('manual_m1', expect.objectContaining({ lines: [{ account: '4710', debitCents: 123450, creditCents: 0, note: 'palk' }, { account: '2210', debitCents: 0, creditCents: 123450, note: 'palk' }] }), ''));
  });

  it('„Asenda konto” previews the count and the sum, applies through one batch request and Ctrl+Z moves it back', async () => {
    const repository = repo();
    await open(repository);
    fireEvent.click(screen.getByRole('button', { name: /Asenda konto/ }));
    fireEvent.change(screen.getByLabelText('Asendatav konto'), { target: { value: '3060' } });
    fireEvent.change(screen.getByLabelText('Uus konto'), { target: { value: '3000' } });
    expect(screen.getByText(/Eelvaade: 1 kanne, 1 rida · D 0,00 · K 80,00/)).toBeInTheDocument();
    const apply = screen.getByRole('button', { name: 'Asenda 1 kandes' });
    fireEvent.click(apply);
    await waitFor(() => expect(repository.replaceAccount).toHaveBeenCalledWith({ fromAccount: '3060', toAccount: '3000', entryIds: ['auto_invoice_i1'] }));
    expect(await screen.findByText(/asendati kontoga 3000 1 kandes/)).toBeInTheDocument();
    await act(async () => { fireEvent.keyDown(grid(), { key: 'z', metaKey: true }); });
    await waitFor(() => expect(repository.replaceAccount).toHaveBeenLastCalledWith({ fromAccount: '3000', toAccount: '3060', targets: [{ entryId: 'auto_invoice_i1', lineIndexes: [1] }], reason: 'Tagasivõtmine (Ctrl+Z): müügitulu 3000' }));
  });

  it('filters by account, text, document and amount; a header click sorts', async () => {
    await open(repo());
    fireEvent.change(screen.getByLabelText('Filter: konto'), { target: { value: '47' } });
    expect(screen.queryByText('MA 1')).not.toBeInTheDocument();
    expect(screen.getByText('Kokku 1 kanne')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filter: konto'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Filter: summa'), { target: { value: '80' } });
    expect(screen.queryByText('PR 1')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filter: summa'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Filter: dokument'), { target: { value: 'palgaleht' } });
    expect(screen.getByText('PR 1')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filter: dokument'), { target: { value: '' } });
    const labels = () => [...document.querySelectorAll('.accounting-grid__entry td:first-child')].map((td) => td.textContent);
    fireEvent.click(screen.getByRole('button', { name: /^Deebet/ }));
    expect(labels()).toEqual(['PR 1', 'MA 1']);
    fireEvent.click(screen.getByRole('button', { name: /^Deebet/ }));
    expect(labels()).toEqual(['MA 1', 'PR 1']);
    expect(screen.getByText('Summa (kahanev)', { selector: 'dd' })).toBeInTheDocument();
  });

  it('read-only (no edit rights, a phone or a locked period): cells are selected and copied but not edited', async () => {
    const repository = repo();
    await open(repository, { canEdit: false });
    expect(screen.queryByLabelText('Paranduse põhjus')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lisa kanne' })).not.toBeInTheDocument();
    fireEvent.mouseDown(cell(4, 5));
    expect(cell(4, 5).querySelector('input')).toBeNull();
    fireEvent.keyDown(grid(), { key: '5' });
    expect(cell(4, 5).querySelector('input')).toBeNull();
    const setData = vi.fn();
    fireEvent.copy(grid(), { clipboardData: { setData } });
    expect(setData).toHaveBeenCalledWith('text/plain', '30,00');
  });

  it('a locked period: its entries are not editable, the others are', async () => {
    await open(repo({ load: vi.fn().mockResolvedValue({ entries, accounts, lockedThrough: `${year}-01-15` }) }));
    fireEvent.mouseDown(cell(1, 5));
    expect(cell(1, 5).querySelector('input')).toBeNull();
    fireEvent.mouseDown(cell(4, 5));
    expect(cell(4, 5).querySelector('input')).not.toBeNull();
  });
});

describe('paste into a new manual entry', () => {
  it('rows with Kuupäev | Dokument | Konto | Kirjeldus | Deebet | Kreedit fill the entry', async () => {
    const repository = repo();
    await open(repository);
    fireEvent.click(screen.getByRole('button', { name: 'Lisa kanne' }));
    fireEvent.paste(screen.getByLabelText('Rida 1 konto'), { clipboardData: { getData: () => `28.02.${year}\tPL 02\t4710\tPalk\t1 250,50\t\n28.02.${year}\tPL 02\t2210\tVõlg\t\t1 250,50\n` } });
    expect(screen.getByLabelText('Rida 1 konto')).toHaveValue('4710');
    expect(screen.getByLabelText('Rida 2 kreedit')).toHaveValue('1250,50');
    expect(screen.queryByLabelText('Rida 3 konto')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Kuupäev')).toHaveValue(`${year}-02-28`);
    expect(screen.getByLabelText('Algdokument (nr / nimetus)')).toHaveValue('PL 02');
    fireEvent.change(screen.getByLabelText('Sisu'), { target: { value: 'Veebruari palk' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta kanne' }));
    await waitFor(() => expect(repository.createEntry).toHaveBeenCalledWith(expect.objectContaining({ date: `${year}-02-28`, documentRef: 'PL 02', lines: [{ account: '4710', debitCents: 125050, creditCents: 0, note: 'Palk' }, { account: '2210', debitCents: 0, creditCents: 125050, note: 'Võlg' }] })));
  });
});
