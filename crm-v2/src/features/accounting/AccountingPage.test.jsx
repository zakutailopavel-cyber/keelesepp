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
    // the entry content in its header row and on each line
    expect(screen.getAllByText('Jaanuari palk')).toHaveLength(3);
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

  it('a manual entry is typed into the päevaraamat grid and saved in cents only when it balances', async () => {
    const repository = repo();
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    await screen.findByText('MA 1');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa kanne' }));
    // no dialog: the entry rows open inside the grid
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Rida 1 konto').closest('table')).toHaveClass('accounting-journal');
    fireEvent.change(screen.getByLabelText('Algdokument (nr / nimetus)'), { target: { value: 'Palgaleht 02' } });
    fireEvent.change(screen.getByLabelText('Sisu'), { target: { value: 'Veebruari palk' } });
    fireEvent.change(screen.getByLabelText('Rida 1 konto'), { target: { value: '4710' } });
    fireEvent.change(screen.getByLabelText('Rida 1 deebet'), { target: { value: '1 250,50' } });
    fireEvent.change(screen.getByLabelText('Rida 2 konto'), { target: { value: '2210' } });
    fireEvent.change(screen.getByLabelText('Rida 2 kreedit'), { target: { value: '1250' } });
    expect(screen.getByRole('button', { name: 'Salvesta kanne' })).toBeDisabled();
    expect(screen.getByText(/vahe 0,50/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Rida 2 kreedit'), { target: { value: '1250,50' } });
    // Tab in the last cell adds a row
    fireEvent.keyDown(screen.getByLabelText('Rida 2 kreedit'), { key: 'Tab' });
    expect(screen.getByLabelText('Rida 3 konto')).toHaveFocus();
    expect(screen.getByText(/Deebet 1\s?250,50 · Kreedit 1\s?250,50/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta kanne' }));
    await waitFor(() => expect(repository.createEntry).toHaveBeenCalledWith(expect.objectContaining({
      description: 'Veebruari palk', documentRef: 'Palgaleht 02',
      lines: [{ account: '4710', debitCents: 125050, creditCents: 0, note: '' }, { account: '2210', debitCents: 0, creditCents: 125050, note: '' }],
    })));
  });

  it('saves an entry with an empty „kande sisu” using the first line note, and says what is missing', async () => {
    const repository = repo();
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    await screen.findByText('MA 1');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa kanne' }));
    fireEvent.change(screen.getByLabelText('Rida 1 deebet'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Rida 2 kreedit'), { target: { value: '25' } });
    expect(screen.getByRole('button', { name: 'Salvesta kanne' })).toBeDisabled();
    expect(screen.getByText(/Puudub: dokument, kande sisu, konto summaga real/)).toBeInTheDocument();
    // the Dokument cell of a line is the entry's document too
    fireEvent.change(screen.getByLabelText('Rida 2 dokument'), { target: { value: 'Arve 12' } });
    expect(screen.getByLabelText('Algdokument (nr / nimetus)')).toHaveValue('Arve 12');
    fireEvent.change(screen.getByLabelText('Rida 1 konto'), { target: { value: '4710' } });
    fireEvent.change(screen.getByLabelText('Rida 1 märkus'), { target: { value: 'müügiarve Dalia' } });
    fireEvent.change(screen.getByLabelText('Rida 2 konto'), { target: { value: '2210' } });
    expect(screen.queryByText(/Puudub:/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta kanne' }));
    await waitFor(() => expect(repository.createEntry).toHaveBeenCalledWith(expect.objectContaining({ description: 'müügiarve Dalia', documentRef: 'Arve 12' })));
  });

  it('„Algsaldod” shows the entered balances and corrects the same entry', async () => {
    const opening = { id: 'opening_1', number: `${year}-0000`, date: `${year}-01-01`, origin: 'opening', description: 'Algsaldod', documentRef: 'Eelmise perioodi käibeandmik', lines: [{ account: '1010', debitCents: 50000, creditCents: 0 }, { account: '2210', debitCents: 0, creditCents: 50000 }], totalCents: 50000 };
    const repository = repo({ load: vi.fn().mockResolvedValue({ entries: [opening, ...entries], accounts }), updateEntry: vi.fn().mockResolvedValue({ entry: { number: opening.number } }) });
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    await screen.findByText('MA 1');
    fireEvent.click(screen.getByRole('button', { name: /Algsaldod/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByDisplayValue('1010')).toBeInTheDocument();
    expect(within(dialog).getAllByDisplayValue('500,00')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta algsaldod' }));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('opening_1', expect.objectContaining({ date: opening.date, lines: [expect.objectContaining({ account: '1010', debitCents: 50000 }), expect.objectContaining({ account: '2210', creditCents: 50000 })] }), 'Algsaldode parandus'));
    expect(repository.setOpening).not.toHaveBeenCalled();
  });

  it('the account cell of a new entry suggests accounts by number or name', async () => {
    const repository = repo();
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    await screen.findByText('MA 1');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa kanne' }));
    const cell = screen.getByLabelText('Rida 1 konto');
    fireEvent.focus(cell);
    fireEvent.change(cell, { target: { value: 'palga' } });
    const list = screen.getByRole('listbox', { name: 'Sobivad kontod' });
    expect(within(list).getAllByRole('option').map((o) => o.textContent)).toEqual(['2210 Palgavõlg', '4710 Palgakulu']);
    fireEvent.keyDown(cell, { key: 'ArrowDown' });
    fireEvent.keyDown(cell, { key: 'Enter' });
    expect(cell).toHaveValue('4710');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Rida 2 konto'), { target: { value: '22' } });
    fireEvent.focus(screen.getByLabelText('Rida 2 konto'));
    fireEvent.mouseDown(screen.getByRole('option', { name: /2210 Palgavõlg/ }));
    expect(screen.getByLabelText('Rida 2 konto')).toHaveValue('2210');
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

  it('the history of a corrected entry shows before and after; an entry is deleted without a reason', async () => {
    const history = [{ at: `${year}-02-01T10:00:00.000Z`, by: { name: 'Raamatupidaja' }, action: 'edit', reason: 'summa', before: { date: `${year}-01-31`, description: 'Jaanuari palk', documentRef: 'Palgaleht 01', lines: [{ account: '4710', debitCents: 2000, creditCents: 0 }, { account: '2210', debitCents: 0, creditCents: 2000 }] }, after: { date: `${year}-01-31`, description: 'Jaanuari palk', documentRef: 'Palgaleht 01', lines: [{ account: '4710', debitCents: 3000, creditCents: 0 }, { account: '2210', debitCents: 0, creditCents: 3000 }] } }];
    const repository = repo({ load: vi.fn().mockResolvedValue({ entries: [entries[0], { ...entries[1], history }], accounts }), deleteEntry: vi.fn().mockResolvedValue({}) });
    render(<MemoryRouter><AccountingPage repository={repository} canEdit /></MemoryRouter>);
    await screen.findByText('PR 1');
    fireEvent.click(screen.getByRole('button', { name: 'Ajalugu (1)' }));
    expect(screen.getByText(/enne: .*4710 D 20,00/)).toBeInTheDocument();
    expect(screen.getByText(/pärast: .*4710 D 30,00/)).toBeInTheDocument();
    expect(screen.getByText(/Raamatupidaja · „summa”/)).toBeInTheDocument();
    // no separate „Muuda” mode: the cells are edited in place (JournalGrid.test.jsx)
    expect(screen.queryByRole('button', { name: 'Muuda' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Kustuta' })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button', { name: 'Kustuta' })[1]);
    fireEvent.click(screen.getByRole('button', { name: 'Kustuta kanne' }));
    await waitFor(() => expect(repository.deleteEntry).toHaveBeenCalledWith('manual_m1'));
  });

  it('a deleted entry leaves the registers (shown on request, its number kept); a locked period allows only a storno', async () => {
    const deleted = { id: 'manual_m0', number: `${year}-0000`, date: `${year}-01-20`, origin: 'manual', description: 'Vale', documentRef: 'X', deleted: true, lines: [{ account: '4710', debitCents: 999, creditCents: 0 }, { account: '2210', debitCents: 0, creditCents: 999 }], history: [{ action: 'delete', reason: 'topelt', by: { email: 'a@b.ee' } }] };
    const repository = repo({ load: vi.fn().mockResolvedValue({ entries: [...entries, deleted], accounts, lockedThrough: `${year}-01-31` }), setLock: vi.fn().mockResolvedValue({}) });
    render(<MemoryRouter><AccountingPage repository={repository} /></MemoryRouter>);
    await screen.findByText('MA 1');
    expect(screen.queryByText('Vale')).not.toBeInTheDocument();
    expect(screen.getByText('Kokku 2 kannet')).toBeInTheDocument();
    // the deleted entry kept its running number: the live manual entry is PR 2
    expect(screen.getByText('PR 2')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Näita kustutatud/));
    expect(screen.getByText('kustutatud')).toBeInTheDocument();
    expect(screen.getByText('Kokku 2 kannet')).toBeInTheDocument();
    // locked through 31.01: no edit or delete, the storno stays
    fireEvent.mouseDown(document.querySelector('[data-cell="4-4"]'));
    expect(document.querySelector('[data-cell="4-4"] input')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Kustuta' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Storno' })).toHaveLength(1);
    // reopening needs a reason
    fireEvent.click(screen.getByRole('button', { name: `Suletud kuni 31.01.${year}` }));
    fireEvent.change(screen.getByLabelText('Periood suletud kuni'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByText('Perioodi uuesti avamiseks lisa põhjus.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Perioodi põhjus'), { target: { value: 'parandus' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.setLock).toHaveBeenCalledWith('', 'parandus'));
  });

  it('käibeandmik shows the turnover per account with totals', async () => {
    render(<MemoryRouter><AccountingPage repository={repo()} /></MemoryRouter>);
    await screen.findByText('MA 1');
    fireEvent.click(screen.getByRole('button', { name: 'Käibeandmik' }));
    const row = screen.getByRole('button', { name: '3060' }).closest('tr');
    expect(within(row).getByText('Maksuvaba müügitulu')).toBeInTheDocument();
    expect(within(row).getAllByText('80,00')).toHaveLength(2);
    expect(screen.getByRole('columnheader', { name: /^Algsaldo/ })).toHaveAttribute('colspan', '2');
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
