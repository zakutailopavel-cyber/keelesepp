import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AccountingPage from './AccountingPage.jsx';

// The accountant 2026-11-19: „К старым проводкам не привязать поставщиков, они же партнеры.” Real (sanitised)
// production entries: an old manual entry imported 2026-10-23 (no updatedAt, no history, documentType „other”), the
// opening entry and an automatic entry, with the real suppliers.
const year = new Date().getFullYear();
const accounts = ['1010', '1246', '1840', '2110', '2500', '2910', '2980', '4210', '4320'].map((code) => ({ code, name: `Konto ${code}`, type: code < '2' ? 'asset' : code < '3' ? 'liability' : 'expense' }));
const zone = { id: 'supplier-99bf6989', name: 'Zone Media OÜ', regCode: '', active: true };
const kirsi = { id: 'supplier-7a1b9aa4', name: 'Kirsi Residents', regCode: '', active: true };
const suppliers = [kirsi, zone];
const entries = [
  { id: 'auto_credit_banktx_pilcq16', sourceKey: 'credit:banktx_pilcq16', date: `${year}-05-05`, documentType: 'bankTransaction', documentRef: 'pilcq16', description: 'Ettemaks pangast · I. Š.', lines: [{ account: '1010', debitCents: 2500, creditCents: 0, note: '' }, { account: '2500', debitCents: 0, creditCents: 2500, note: '' }], origin: 'auto', number: `${year}-0001`, totalCents: 2500 },
  { id: 'manual_accounting_entry-1fc0d0e1', date: `${year}-03-02`, description: 'Zone Media virtuaalserver', documentRef: 'OA-1010140274', lines: [{ account: '4320', debitCents: 1482, creditCents: 0, note: '' }, { account: '2110', debitCents: 0, creditCents: 1482, note: '' }], totalCents: 1482, origin: 'manual', documentType: 'other', requestId: 'accounting_entry-1fc0d0e1', number: `${year}-0242`, createdAt: `${year}-10-23T19:12:04.750Z` },
  { id: 'opening_accounting_opening-0ffa17c2', date: `${year}-01-01`, description: `Algsaldod seisuga ${year}-01-01`, documentRef: 'Eelmise perioodi käibeandmik', origin: 'opening', number: `${year}-0269`, totalCents: 1000000,
    lines: [{ account: '1010', debitCents: 900000, creditCents: 0 }, { account: '1246', debitCents: 50000, creditCents: 0 }, { account: '1840', debitCents: 50000, creditCents: 0 }, { account: '2110', debitCents: 0, creditCents: 24840, note: 'Kirsi Residents arve 2025/195' }, { account: '2910', debitCents: 0, creditCents: 500000 }, { account: '2980', debitCents: 0, creditCents: 475160 }] },
];
const repo = () => ({
  load: vi.fn().mockResolvedValue({ entries, accounts, suppliers }),
  sync: vi.fn().mockResolvedValue({ created: 0 }),
  updateEntry: vi.fn().mockResolvedValue({}),
  createEntry: vi.fn(),
});
const open = async (repository) => {
  render(<MemoryRouter><AccountingPage repository={repository} canEdit /></MemoryRouter>);
  await screen.findByText('PR 1');
  await waitFor(() => expect(repository.sync).toHaveBeenCalled());
};
// the block of an entry and the partner cell of its line with that account
const block = (label) => screen.getByText(label, { selector: 'td' }).closest('tbody');
const partnerCell = (label, account) => {
  const row = [...block(label).querySelectorAll('tr')].find((tr) => tr.querySelector('[data-cell$="-0"]')?.textContent.replace(/^[+×]+/, '').startsWith(account));
  return row.querySelector('[data-cell$="-4"]');
};
const ZONE = { type: 'supplier', id: zone.id, name: 'Zone Media OÜ' };
const KIRSI = { type: 'supplier', id: kirsi.id, name: 'Kirsi Residents' };
const pickByClick = (target, typed, name) => {
  fireEvent.mouseDown(target);
  fireEvent.change(screen.getByLabelText('Partner (muuda)'), { target: { value: typed } });
  fireEvent.mouseDown(within(screen.getByRole('listbox', { name: 'Sobivad tarnijad' })).getByRole('option', { name: new RegExp(name) }));
};

describe('partner on old entries (the accountant 2026-11-19)', () => {
  it('a click on the 2110 line of PR 1 (2026-0242), „Zone”, a click on „Zone Media OÜ” and Salvesta sends the partner', async () => {
    const repository = repo();
    await open(repository);
    pickByClick(partnerCell('PR 1', '2110'), 'Zone', 'Zone Media OÜ');
    expect(partnerCell('PR 1', '2110')).toHaveTextContent('Zone Media OÜ');
    expect(screen.queryByLabelText('Partner (muuda)')).not.toBeInTheDocument();
    fireEvent.click(within(block('PR 1')).getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('manual_accounting_entry-1fc0d0e1', {
      date: `${year}-03-02`, description: 'Zone Media virtuaalserver', documentRef: 'OA-1010140274',
      lines: [{ account: '4320', debitCents: 1482, creditCents: 0, note: '' }, { account: '2110', debitCents: 0, creditCents: 1482, note: '', partner: ZONE }],
    }, ''));
  });

  it('the opening entry takes a partner the same way (its date and document stay)', async () => {
    const repository = repo();
    await open(repository);
    const label = [...document.querySelectorAll('tbody')].find((t) => t.textContent.includes('Algsaldod')).querySelector('[data-cell$="-0"]').textContent;
    pickByClick(partnerCell(label, '2110'), 'Kirsi', 'Kirsi Residents');
    expect(partnerCell(label, '2110')).toHaveTextContent('Kirsi Residents');
    fireEvent.click(within(block(label)).getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('opening_accounting_opening-0ffa17c2', expect.objectContaining({
      date: `${year}-01-01`, documentRef: 'Eelmise perioodi käibeandmik',
      lines: expect.arrayContaining([{ account: '2110', debitCents: 0, creditCents: 24840, note: 'Kirsi Residents arve 2025/195', partner: KIRSI }]),
    }), ''));
  });

  it('„Lisa partner: …” on a 2110 line whose entry names exactly one supplier saves it with one click', async () => {
    const repository = repo();
    await open(repository);
    // no suggestion on an expense line, nor on the bank entry (no supplier account)
    expect(screen.getAllByRole('button', { name: /^Lisa partner:/ }).map((b) => b.textContent).sort()).toEqual(['Lisa partner: Kirsi Residents', 'Lisa partner: Zone Media OÜ']);
    fireEvent.click(within(block('PR 1')).getByRole('button', { name: 'Lisa partner: Zone Media OÜ' }));
    await waitFor(() => expect(repository.updateEntry).toHaveBeenCalledWith('manual_accounting_entry-1fc0d0e1', {
      date: `${year}-03-02`, description: 'Zone Media virtuaalserver', documentRef: 'OA-1010140274',
      lines: [{ account: '4320', debitCents: 1482, creditCents: 0, note: '' }, { account: '2110', debitCents: 0, creditCents: 1482, note: '', partner: ZONE }],
    }, ''));
    expect(await screen.findByText(/salvestati\. Enne ja pärast on kande ajaloos/)).toBeInTheDocument();
  });
});
