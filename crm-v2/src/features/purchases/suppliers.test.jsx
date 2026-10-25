import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { clipboardRows } from '../accounting/journalGrid.js';
import SuppliersPanel from './SuppliersPanel.jsx';
import { filterSuppliers, ibanProblem, parseSupplierPaste, sortSuppliers, supplierDuplicate, supplierImportPreview, supplierNameKey } from './purchases.js';

// Tarnijad (the accountant 2026-10-24: „Поставщиков сначала”): search, sort, duplicates, import from Excel
const accounts = [{ code: '4210', name: 'Ruumide rent' }, { code: '4320', name: 'Tarkvara' }, { code: '9999', name: 'Suletud', active: false }];
const suppliers = [
  { id: 's1', name: 'Kirsi Residents OÜ', regCode: '12345678', iban: 'EE382200221020145685', defaultAccount: '4210', active: true },
  { id: 's2', name: 'Zone Media OÜ', regCode: '', email: 'arved@zone.ee', defaultAccount: '4320', active: true },
  { id: 's3', name: 'Apple Distribution International', regCode: 'IE1234', active: false },
];

describe('Tarnijad helpers', () => {
  it('name key ignores case, quotes and the legal form; duplicates by registry code or name', () => {
    expect(supplierNameKey('„Kirsi Residents” OÜ')).toBe('kirsi residents');
    expect(supplierDuplicate({ name: 'kirsi residents', regCode: '' }, suppliers).id).toBe('s1');
    expect(supplierDuplicate({ name: 'Uus', regCode: '12345678' }, suppliers).id).toBe('s1');
    expect(supplierDuplicate({ name: 'Kirsi Residents', regCode: '87654321' }, suppliers)).toBeNull();
    expect(supplierDuplicate(suppliers[0], suppliers, 's1')).toBeNull();
    expect(ibanProblem('EE38 2200 2210 2014 5685')).toBe('');
    expect(ibanProblem('EE382200221020145686')).toMatch(/kontrollsumma/);
  });

  it('search over every field, inactive ones optional; sort by a column both ways, empty values last', () => {
    expect(filterSuppliers(suppliers, { query: 'zone.ee' }).map((s) => s.id)).toEqual(['s2']);
    expect(filterSuppliers(suppliers, { query: '1234' }).map((s) => s.id)).toEqual(['s1', 's3']);
    expect(filterSuppliers(suppliers, { showInactive: false }).map((s) => s.id)).toEqual(['s1', 's2']);
    expect(sortSuppliers(suppliers, { key: 'regCode' }).map((s) => s.id)).toEqual(['s1', 's3', 's2']);
    expect(sortSuppliers(suppliers, { key: 'name', dir: 'desc' }).map((s) => s.id)).toEqual(['s2', 's1', 's3']);
  });

  it('paste from Excel: with a header row in any order, or the Tarnijad order without one; each row new / duplicate / error', () => {
    const withHeader = parseSupplierPaste('Registrikood\tNimi\tE-post\tKonto\n10883455\tEuronics AS\tinfo@euronics.ee\t4320 Tarkvara\n', clipboardRows);
    expect(withHeader).toEqual([expect.objectContaining({ name: 'Euronics AS', regCode: '10883455', email: 'info@euronics.ee', defaultAccount: '4320', active: true })]);
    const plain = parseSupplierPaste('Charlot OÜ\t11111111\t\tTallinn\t\t\t\tei\nZONE MEDIA\t\nVigane\t\t\t\t\tEE00\n\nHea Vesi OÜ\t22222222\t\t\t\t\t9999\nCharlot\t\n', clipboardRows);
    expect(plain.map((v) => v.name)).toEqual(['Charlot OÜ', 'ZONE MEDIA', 'Vigane', 'Hea Vesi OÜ', 'Charlot']);
    expect(plain[0]).toMatchObject({ address: 'Tallinn', active: false });
    const preview = supplierImportPreview(plain, suppliers, accounts);
    expect(preview.map((p) => [p.row, p.status])).toEqual([[1, 'new'], [2, 'duplicate'], [3, 'error'], [4, 'error'], [5, 'duplicate']]);
    expect(preview[1].message).toMatch(/Zone Media OÜ/);
    expect(preview[3].message).toMatch(/9999/);
    expect(preview[4].message).toBe('sama mis rida 1');
  });
});

describe('SuppliersPanel', () => {
  it('search, header sort and a duplicate warning on the new row', () => {
    render(<SuppliersPanel suppliers={suppliers} accounts={accounts} onSave={vi.fn()} />);
    expect(screen.getByText('3 tarnijat')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Otsi tarnijat'), { target: { value: 'kirsi' } });
    expect(screen.getByText('1 / 3 tarnijat')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Otsi tarnijat'), { target: { value: '' } });
    const names = () => [...document.querySelectorAll('.purchases-suppliers tbody tr')].slice(0, 3).map((tr) => tr.querySelector('input').value);
    expect(names()).toEqual(['Apple Distribution International', 'Kirsi Residents OÜ', 'Zone Media OÜ']);
    fireEvent.click(screen.getByRole('button', { name: /^Nimi/ }));
    expect(names()).toEqual(['Zone Media OÜ', 'Kirsi Residents OÜ', 'Apple Distribution International']);
    fireEvent.click(screen.getByLabelText(/Näita mitteaktiivseid/));
    expect(screen.getByText('2 / 3 tarnijat')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Uus tarnija: Nimi'), { target: { value: 'zone media' } });
    expect(screen.getByText('Võimalik duplikaat: Zone Media OÜ')).toBeInTheDocument();
  });

  it('import from Excel: preview per row, only the new rows are sent', async () => {
    const onImport = vi.fn().mockResolvedValue({ created: ['x'] });
    render(<SuppliersPanel suppliers={suppliers} accounts={accounts} onSave={vi.fn()} onImport={onImport} />);
    fireEvent.click(screen.getByRole('button', { name: /Impordi Excelist/ }));
    fireEvent.change(screen.getByLabelText('Kleebi tarnijad Excelist'), { target: { value: 'Nimi\tRegistrikood\nEuronics AS\t10883455\nKirsi Residents\t12345678\n' } });
    const preview = document.querySelector('.suppliers-import__preview');
    expect(within(preview).getByText('Imporditakse')).toBeInTheDocument();
    expect(within(preview).getByText(/Duplikaat — jääb vahele: juba olemas: Kirsi Residents OÜ/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Impordi 1 tarnija' }));
    await waitFor(() => expect(onImport).toHaveBeenCalledWith([expect.objectContaining({ name: 'Euronics AS', regCode: '10883455' })]));
    await waitFor(() => expect(screen.queryByLabelText('Kleebi tarnijad Excelist')).not.toBeInTheDocument());
  });

  it('a refused import keeps the pasted rows and says why', async () => {
    const onImport = vi.fn().mockRejectedValue(new Error('Importi ei tehtud. Rida 1: …'));
    render(<SuppliersPanel suppliers={[]} accounts={accounts} onSave={vi.fn()} onImport={onImport} />);
    fireEvent.click(screen.getByRole('button', { name: /Impordi Excelist/ }));
    fireEvent.change(screen.getByLabelText('Kleebi tarnijad Excelist'), { target: { value: 'Euronics AS\t10883455' } });
    fireEvent.click(screen.getByRole('button', { name: 'Impordi 1 tarnija' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Importi ei tehtud');
    expect(screen.getByLabelText('Kleebi tarnijad Excelist')).toHaveValue('Euronics AS\t10883455');
  });
});
