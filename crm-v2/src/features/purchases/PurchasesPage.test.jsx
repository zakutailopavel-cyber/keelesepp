import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { purchaseInvoicesWorkbook } from '../accounting/accountingExcel.js';
import PurchasesPage from './PurchasesPage.jsx';
import { draftPayload, draftProblem } from './purchases.js';

const year = new Date().getFullYear();
const accounts = [
  { code: '1010', name: 'Pangakonto', type: 'asset' },
  { code: '2110', name: 'Võlad tarnijatele', type: 'liability' },
  { code: '4210', name: 'Ruumide rent', type: 'expense' },
  { code: '4330', name: 'Kontoritarbed', type: 'expense' },
];
const suppliers = [{ id: 's1', name: 'Senty Studio OÜ', regCode: '14512345', defaultAccount: '4210', active: true }];
const invoice = { id: 'pi1', supplierId: 's1', supplierName: 'Senty Studio OÜ', documentNumber: '1575', date: `${year}-03-01`, dueDate: `${year}-03-15`, lines: [{ account: '4210', description: 'Ruumide rent', amountCents: 30000, vatCents: 5000, vatDeductible: false }], totalCents: 30000, paidCents: 0, payments: [], status: 'unpaid', documents: [], entryNumber: `${year}-0007` };
const repo = (overrides = {}) => ({
  load: vi.fn().mockResolvedValue({ suppliers, invoices: [invoice], accounts, lockedThrough: '' }),
  saveSupplier: vi.fn().mockResolvedValue({}),
  saveInvoice: vi.fn().mockResolvedValue({ purchaseInvoice: { entryNumber: `${year}-0008` } }),
  pay: vi.fn().mockResolvedValue({}),
  removePayment: vi.fn(),
  voidInvoice: vi.fn().mockResolvedValue({}),
  uploadDocument: vi.fn(),
  getDocumentUrl: vi.fn(),
  ...overrides,
});
const renderPage = (repository) => render(<MemoryRouter><PurchasesPage repository={repository} /></MemoryRouter>);

describe('PurchasesPage', () => {
  it('a supplier invoice is typed into the grid; the supplier fills its default account; saved in cents, VAT not deductible by default', async () => {
    const repository = repo();
    renderPage(repository);
    await screen.findByText('1575');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa ostuarve' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Tarnija'), { target: { value: 'senty studio oü' } });
    expect(screen.getByLabelText('Rida 1 konto')).toHaveValue('4210');
    expect(screen.getByRole('button', { name: 'Salvesta ostuarve' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Arve nr'), { target: { value: '1576' } });
    fireEvent.change(screen.getByLabelText('Rida 1 kirjeldus'), { target: { value: 'Ruumide rent aprill' } });
    fireEvent.change(screen.getByLabelText('Rida 1 summa'), { target: { value: '300,00' } });
    fireEvent.change(screen.getByLabelText('Rida 1 KM'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Rida 2 konto'), { target: { value: '4330' } });
    fireEvent.change(screen.getByLabelText('Rida 2 kirjeldus'), { target: { value: 'Paber' } });
    fireEvent.change(screen.getByLabelText('Rida 2 summa'), { target: { value: '12,20' } });
    // Tab in the last cell adds a line
    fireEvent.keyDown(screen.getByLabelText('Rida 2 KM'), { key: 'Tab' });
    expect(screen.getByLabelText('Rida 3 konto')).toHaveFocus();
    expect(screen.getByLabelText('Rida 1 KM maha')).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta ostuarve' }));
    await waitFor(() => expect(repository.saveInvoice).toHaveBeenCalledWith('', {
      supplierId: 's1', documentNumber: '1576', date: expect.any(String), dueDate: expect.any(String), note: '',
      lines: [
        { account: '4210', description: 'Ruumide rent aprill', amountCents: 30000, vatCents: 5000, vatDeductible: false },
        { account: '4330', description: 'Paber', amountCents: 1220, vatCents: 0, vatDeductible: false },
      ],
    }, { paidNow: null }));
    expect(await screen.findByText(/Ostuarve 1576 salvestati/)).toBeInTheDocument();
  });

  it('invoice lines are pasted from Excel: Konto | Kirjeldus | Summa | KM, „1 234,50” amounts', async () => {
    const repository = repo();
    renderPage(repository);
    await screen.findByText('1575');
    fireEvent.click(screen.getByRole('button', { name: 'Lisa ostuarve' }));
    fireEvent.change(screen.getByLabelText('Tarnija'), { target: { value: 'Senty Studio OÜ' } });
    fireEvent.change(screen.getByLabelText('Arve nr'), { target: { value: '1580' } });
    fireEvent.paste(screen.getByLabelText('Rida 1 konto'), { clipboardData: { getData: () => '4210\tRuumide rent mai\t1 234,50\t\n4330 Kontoritarbed\tPaber\t12,2\t2,20\n' } });
    expect(screen.getByLabelText('Rida 1 summa')).toHaveValue('1234,50');
    expect(screen.getByLabelText('Rida 2 konto')).toHaveValue('4330');
    expect(screen.getByLabelText('Rida 2 KM')).toHaveValue('2,20');
    expect(screen.queryByLabelText('Rida 3 konto')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta ostuarve' }));
    await waitFor(() => expect(repository.saveInvoice).toHaveBeenCalledWith('', expect.objectContaining({
      lines: [
        { account: '4210', description: 'Ruumide rent mai', amountCents: 123450, vatCents: 0, vatDeductible: false },
        { account: '4330', description: 'Paber', amountCents: 1220, vatCents: 220, vatDeductible: false },
      ],
    }), { paidNow: null }));
  });

  it('„Tasutud kohe” sends the payment with the invoice; an unpaid invoice is paid from its row', async () => {
    const repository = repo();
    renderPage(repository);
    await screen.findByText('1575');
    fireEvent.click(screen.getByRole('button', { name: 'Tasu' }));
    expect(screen.getByLabelText('Tasutud summa')).toHaveValue('300,00');
    fireEvent.change(screen.getByLabelText('Tasumise viis'), { target: { value: 'cash' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.pay).toHaveBeenCalledWith('pi1', expect.objectContaining({ amountCents: 30000, method: 'cash' })));

    fireEvent.click(await screen.findByRole('button', { name: 'Lisa ostuarve' }));
    fireEvent.change(screen.getByLabelText('Tarnija'), { target: { value: 'Senty Studio OÜ' } });
    fireEvent.change(screen.getByLabelText('Arve nr'), { target: { value: 'K-1' } });
    fireEvent.change(screen.getByLabelText('Rida 1 kirjeldus'), { target: { value: 'Zoom' } });
    fireEvent.change(screen.getByLabelText('Rida 1 summa'), { target: { value: '14,99' } });
    fireEvent.change(screen.getByLabelText('Arve olek'), { target: { value: 'paid' } });
    fireEvent.change(screen.getByLabelText('Makseviis'), { target: { value: 'card' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta ostuarve' }));
    await waitFor(() => expect(repository.saveInvoice).toHaveBeenCalledWith('', expect.objectContaining({ documentNumber: 'K-1' }), { paidNow: { date: expect.any(String), method: 'card' } }));
  });

  it('an invoice is corrected in place; a locked period hides „Muuda”', async () => {
    const repository = repo();
    const { unmount } = renderPage(repository);
    await screen.findByText('1575');
    fireEvent.click(screen.getByRole('button', { name: 'Muuda' }));
    expect(screen.getByLabelText('Rida 1 summa')).toHaveValue('300,00');
    fireEvent.change(screen.getByLabelText('Rida 1 summa'), { target: { value: '310' } });
    fireEvent.change(screen.getByLabelText('Paranduse põhjus'), { target: { value: 'vale summa' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta parandus' }));
    await waitFor(() => expect(repository.saveInvoice).toHaveBeenCalledWith('pi1', expect.objectContaining({ lines: [expect.objectContaining({ amountCents: 31000 })] }), { reason: 'vale summa' }));
    unmount();

    renderPage(repo({ load: vi.fn().mockResolvedValue({ suppliers, invoices: [invoice], accounts, lockedThrough: `${year}-03-31` }) }));
    await screen.findByText('1575');
    expect(screen.queryByRole('button', { name: 'Muuda' })).not.toBeInTheDocument();
    expect(screen.getByText(/Periood suletud kuni 31\.03\./)).toBeInTheDocument();
  });

  it('a void needs a reason', async () => {
    const repository = repo();
    renderPage(repository);
    await screen.findByText('1575');
    fireEvent.click(screen.getByRole('button', { name: 'Tühista' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog.parentElement).getByRole('button', { name: 'Tühista arve' }));
    expect(await screen.findByText('Lisa põhjus.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Põhjus'), { target: { value: 'topelt' } });
    fireEvent.click(within(dialog.parentElement).getByRole('button', { name: 'Tühista arve' }));
    await waitFor(() => expect(repository.voidInvoice).toHaveBeenCalledWith('pi1', 'topelt'));
  });

  it('suppliers are edited in the grid: a changed row is saved, the last row adds one', async () => {
    const repository = repo();
    renderPage(repository);
    await screen.findByText('1575');
    fireEvent.click(screen.getByRole('button', { name: 'Tarnijad' }));
    expect(screen.getByText('Ruumide rent')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Senty Studio OÜ: IBAN'), { target: { value: 'EE382200221020145685' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.saveSupplier).toHaveBeenCalledWith('s1', expect.objectContaining({ iban: 'EE382200221020145685', name: 'Senty Studio OÜ' })));
    fireEvent.change(screen.getByLabelText('Uus tarnija: Nimi'), { target: { value: 'Telia Eesti AS' } });
    fireEvent.keyDown(screen.getByLabelText('Uus tarnija: Nimi'), { key: 'Enter' });
    await waitFor(() => expect(repository.saveSupplier).toHaveBeenCalledWith('', expect.objectContaining({ name: 'Telia Eesti AS' })));
  });
});

describe('purchase helpers', () => {
  it('draftProblem names the first problem; draftPayload drops empty lines and keeps VAT not deductible without a VAT amount', () => {
    const draft = { supplierId: 's1', documentNumber: '1', date: '2026-10-01', dueDate: '' };
    expect(draftProblem({ ...draft, supplierId: '' }, [], accounts)).toMatch(/tarnija/);
    expect(draftProblem(draft, [{ account: '2110', description: 'x', amount: '1' }], accounts)).toMatch(/kulu- või varakonto/);
    expect(draftProblem(draft, [{ account: '4210', description: 'x', amount: '1', vat: '2' }], accounts)).toMatch(/käibemaksu/);
    expect(draftProblem(draft, [{ account: '4210', description: 'x', amount: '1,5' }, { account: '', description: '', amount: '' }], accounts)).toBe('');
    expect(draftPayload(draft, [{ account: '4210', description: 'x', amount: '1,5', vat: '', vatDeductible: true }, { account: '', description: '', amount: '' }]).lines)
      .toEqual([{ account: '4210', description: 'x', amountCents: 150, vatCents: 0, vatDeductible: false }]);
  });

  it('the Excel has one row per invoice line', () => {
    const xml = purchaseInvoicesWorkbook([invoice], { company: { name: 'E&P Koolitus OÜ', regCode: '17270880' }, period: { from: `${year}-01-01`, to: '' }, accounts, statusLabels: { unpaid: 'Tasumata' } });
    expect(xml).toContain('<Data ss:Type="String">Senty Studio OÜ</Data>');
    expect(xml).toContain('4210 Ruumide rent');
    expect(xml).toContain('<Data ss:Type="Number">300.00</Data>');
    expect(xml).toContain('Tasumata');
  });
});
