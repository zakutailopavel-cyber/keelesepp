import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../../app/AuthContext.jsx';
import FinanceSettingsPage from '../FinanceSettingsPage.jsx';
import FiePanel from './FiePanel.jsx';
import FieSettings from './FieSettings.jsx';
import IssuerSelect from './IssuerSelect.jsx';
import StudentInvoiceIssuerCard from './StudentInvoiceIssuerCard.jsx';
import { fieSettingsErrors, fieSummary, validIban } from './fieModel.js';

vi.mock('../FinancePage.jsx', () => ({ default: ({ section }) => <div data-testid="finance-panel">{section}</div> }));

const OWNER = { user: { email: 'zakutailo.pavel@gmail.com', roles: ['admin'] } };
const OTHER_ADMIN = { user: { email: 'admin@example.com', roles: ['admin'] } };
const as = (auth, ui) => render(<AuthContext.Provider value={auth}><MemoryRouter>{ui}</MemoryRouter></AuthContext.Provider>);

describe('FIE (the owner\'s own sole proprietorship)', () => {
  it('validates the two requisites: name and IBAN (mod 97)', () => {
    expect(validIban('EE38 2200 2210 2014 5685')).toBe(true);
    expect(validIban('EE38 2200 2210 2014 5684')).toBe(false);
    expect(fieSettingsErrors({ name: 'Pavel Zakutailo', iban: 'EE382200221020145685' })).toEqual({});
    expect(Object.keys(fieSettingsErrors({ name: 'P', iban: 'x' }))).toEqual(['name', 'iban']);
  });

  it('sums only FIE invoices of the month, apart from the company', () => {
    const summary = fieSummary([
      { id: 'f1', issuer: 'fie', date: '2026-11-02', amountCents: 10000, paidAmountCents: 4000, balanceDueCents: 6000, due: '2026-11-10' },
      { id: 'f2', issuer: 'fie', date: '2026-10-02', amountCents: 5000, paidAmountCents: 5000, balanceDueCents: 0 },
      { id: 'c1', date: '2026-11-02', amountCents: 9000, balanceDueCents: 9000 },
      { id: 'f3', issuer: 'fie', date: '2026-11-03', amountCents: 7000, status: 'Tühistatud' },
    ], '2026-11', new Date('2026-11-05'));
    expect(summary).toMatchObject({ count: 1, amountCents: 10000, paidCents: 4000, debtCents: 6000 });
  });

  it('shows the FIE settings section and the issuer choice to the owner only', () => {
    window.history.replaceState(null, '', '#audit');
    as(OTHER_ADMIN, <FinanceSettingsPage />);
    expect(screen.queryByRole('button', { name: /FIE/ })).not.toBeInTheDocument();
    as(OTHER_ADMIN, <IssuerSelect value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Arve väljastaja')).not.toBeInTheDocument();
  });

  it('the owner sees the FIE section and the issuer choice', () => {
    window.history.replaceState(null, '', '#audit');
    const onChange = vi.fn();
    as(OWNER, <><FinanceSettingsPage /><IssuerSelect value="" onChange={onChange} /></>);
    expect(screen.getByRole('button', { name: /FIE/ })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Arve väljastaja'), { target: { value: 'fie' } });
    expect(onChange).toHaveBeenCalledWith('fie');
  });

  it('saves the FIE name and IBAN; refuses a wrong IBAN without calling the server', async () => {
    const api = { fieSettings: vi.fn().mockResolvedValueOnce({ settings: { name: '', iban: '' }, ready: false, students: [], prefix: 'FIE-' }).mockResolvedValueOnce({ settings: { name: 'Pavel Zakutailo', iban: 'EE382200221020145685' }, ready: true, students: [], prefix: 'FIE-' }) };
    as(OWNER, <FieSettings api={api} />);
    expect(await screen.findByText(/täitmata/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Ees- ja perekonnanimi'), { target: { value: 'Pavel Zakutailo' } });
    fireEvent.change(screen.getByLabelText('Pangakonto (IBAN)'), { target: { value: 'EE00 1111' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    expect(await screen.findByText('IBAN ei ole korrektne.')).toBeInTheDocument();
    expect(api.fieSettings).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('Pangakonto (IBAN)'), { target: { value: 'EE38 2200 2210 2014 5685' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(api.fieSettings).toHaveBeenLastCalledWith({ name: 'Pavel Zakutailo', iban: 'EE38 2200 2210 2014 5685' }));
    expect(await screen.findByText(/Olek: valmis/)).toBeInTheDocument();
  });

  it('the student card switch: FIE cannot be chosen before the requisites; nothing for another admin', async () => {
    const api = { fieSettings: vi.fn().mockResolvedValue({ ready: false, students: [] }), setStudentInvoiceIssuer: vi.fn() };
    as(OTHER_ADMIN, <StudentInvoiceIssuerCard student={{ id: 's1' }} api={api} />);
    expect(screen.queryByText('Arve väljastaja')).not.toBeInTheDocument();
    expect(api.fieSettings).not.toHaveBeenCalled();
    as(OWNER, <StudentInvoiceIssuerCard student={{ id: 's1' }} api={api} />);
    const option = await screen.findByRole('option', { name: /FIE \(minu\)/ });
    expect(option).toBeDisabled();
  });

  it('the FIE block lists FIE invoices with their totals and records a payment through the server', async () => {
    const invoiceRepository = { listFie: vi.fn().mockResolvedValue([{ id: 'f1', issuer: 'fie', num: 'FIE-2026-001', date: '2026-11-02', studentName: 'Mari', amountCents: 10000, balanceDueCents: 10000, paidAmountCents: 0, due: '2099-11-10' }]) };
    const api = { recordPayment: vi.fn().mockResolvedValue({}) };
    as(OWNER, <FiePanel month="2026-11" invoiceRepository={invoiceRepository} api={api} pdfApi={{ pdf: vi.fn() }} />);
    expect(await screen.findByText('FIE-2026-001')).toBeInTheDocument();
    expect(screen.getByText('Võlg').nextSibling).toHaveTextContent('100,00 €');
    fireEvent.click(screen.getByRole('button', { name: 'Registreeri makse' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Registreeri' }));
    await waitFor(() => expect(api.recordPayment).toHaveBeenCalledWith('f1', expect.objectContaining({ amount: 100 })));
  });
});
