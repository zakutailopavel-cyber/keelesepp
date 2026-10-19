import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import CashPage from './CashPage.jsx';
import { invoiceChoices, openReceipts } from './cashModel.js';

const people = [{ uid: 'admin-1', name: 'Pavel' }, { uid: 'teacher-1', name: 'Oleksiy' }];
const receipt = { id: 'r1', type: 'receipt', status: 'open', holderUid: 'teacher-1', holderName: 'Oleksiy', amountCents: 6000, receivedAt: '2026-10-15', studentId: 's1', studentName: 'Mia', payerName: 'Kati', createdAt: '2026-10-15T10:00:00Z' };

function renderPage(user, props) {
  render(<MemoryRouter initialEntries={['/kassa?student=s1']}><AuthContext.Provider value={{ user }}><CashPage {...props} /></AuthContext.Provider></MemoryRouter>);
}

describe('CashPage', () => {
  it('a teacher records cash from their student and hands it over (owner 2026-10-18)', async () => {
    const api = {
      cashSummary: vi.fn().mockResolvedValue({ isAdmin: false, entries: [receipt], balances: [{ uid: 'teacher-1', name: 'Oleksiy', cents: 6000 }], people }),
      recordCashReceipt: vi.fn().mockResolvedValue({}),
      recordCashHandover: vi.fn().mockResolvedValue({}),
    };
    const studentApi = { list: vi.fn().mockResolvedValue({ items: [{ id: 's1', name: 'Mia', parentName: 'Kati', payerMethod: 'cash' }] }) };
    renderPage({ uid: 'teacher-1', displayName: 'Oleksiy', roles: ['teacher'] }, { api, studentApi });
    expect(await screen.findByText('60,00 €', { selector: 'strong' })).toBeInTheDocument();
    expect(studentApi.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'teacher-1' }));
    expect(screen.queryByText('Seo arvega')).toBeNull();
    expect(screen.queryByLabelText('Kelle käes raha on')).toBeNull();

    fireEvent.change(screen.getAllByLabelText('Summa (€)')[0], { target: { value: '45' } });
    fireEvent.click(screen.getByRole('button', { name: /Märgi saaduks/ }));
    await waitFor(() => expect(api.recordCashReceipt).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', amount: '45', holderUid: undefined })));

    fireEvent.change(await screen.findByLabelText('Kellele'), { target: { value: 'admin-1' } });
    fireEvent.change(screen.getAllByLabelText('Summa (€)')[1], { target: { value: '60' } });
    fireEvent.click(screen.getByRole('button', { name: /Märgi üleantuks/ }));
    await waitFor(() => expect(api.recordCashHandover).toHaveBeenCalledWith(expect.objectContaining({ toUid: 'admin-1', amount: '60' })));
  });

  it('an administrator links an open receipt to the payer invoice', async () => {
    const api = {
      cashSummary: vi.fn().mockResolvedValue({ isAdmin: true, entries: [receipt], balances: [{ uid: 'teacher-1', name: 'Oleksiy', cents: 6000 }], people }),
      allocateCashReceipt: vi.fn().mockResolvedValue({}),
    };
    const studentApi = { list: vi.fn().mockResolvedValue({ items: [] }) };
    const invoiceApi = { listByStudent: vi.fn().mockResolvedValue([{ id: 'inv-1', num: 'KS-1', date: '2026-10-01', status: 'Ootel', balanceDueCents: 6000 }, { id: 'inv-0', num: 'KS-0', status: 'Makstud', balanceDueCents: 0 }]) };
    renderPage({ uid: 'admin-1', displayName: 'Pavel', roles: ['admin'] }, { api, studentApi, invoiceApi });
    fireEvent.click(await screen.findByRole('button', { name: /Seo arvega/ }));
    fireEvent.click(await screen.findByRole('radio'));
    expect(screen.queryByText('KS-0')).toBeNull();
    fireEvent.click(screen.getAllByRole('button', { name: /Seo arvega/ }).at(-1));
    await waitFor(() => expect(api.allocateCashReceipt).toHaveBeenCalledWith('r1', 'inv-1'));
  });
});

describe('cash model', () => {
  it('offers the invoices still due, the same sum first', () => {
    const choices = invoiceChoices([
      { id: 'a', date: '2026-09-01', status: 'Ootel', balanceDueCents: 3000 },
      { id: 'b', date: '2026-10-01', status: 'Osaliselt makstud', balanceDue: 60 },
      { id: 'c', status: 'Tühistatud', balanceDueCents: 6000 },
    ], { amountCents: 6000 });
    expect(choices.map((invoice) => invoice.id)).toEqual(['b', 'a']);
    expect(openReceipts([receipt, { ...receipt, id: 'x', status: 'allocated' }]).map((entry) => entry.id)).toEqual(['r1']);
  });
});
