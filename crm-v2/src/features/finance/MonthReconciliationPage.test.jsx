import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import MonthReconciliationPage from './MonthReconciliationPage.jsx';

vi.mock('./BankReconciliationPanel.jsx', () => ({ default: ({ payments }) => <p>Väljavõtte paneel · makseid {payments.length}</p> }));

const admin = { uid: 'admin-1', displayName: 'Pavel', email: 'admin@example.test', roles: ['admin'] };
const students = [{ id: 's1', name: 'Mia Tamm' }, { id: 's2', name: 'Arseni Kask' }, { id: 's3', name: 'Demjan Saar' }];
const plans = [
  { studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60 },
  { studentId: 's2', lessonPriceCents: 2500, lessonMinutes: 60, cashSubjects: ['*'] },
  { studentId: 's3', lessonPriceCents: 2000, lessonMinutes: 60 },
];
const invoices = [
  { id: 'i1', num: 'KS-101', studentId: 's1', studentName: 'Mia Tamm', planMonth: '2026-11', amountCents: 10000, paidAmountCents: 10000, status: 'Makstud' },
  { id: 'i2', num: 'KS-102', studentId: 's3', studentName: 'Demjan Saar', planMonth: '2026-11', amountCents: 8000, due: '2026-12-10' },
];
const lessons = [
  { id: 'l1', studentId: 's2', date: '2026-11-03', status: 'Toimunud', duration: 60 },
  { id: 'l2', studentId: 's2', date: '2026-11-10', status: 'Toimunud', duration: 60 },
];

function setup(user = admin, overrides = {}) {
  const repos = {
    invoiceRepository: { list: vi.fn().mockResolvedValue(invoices) },
    planRepository: { list: vi.fn().mockResolvedValue(plans) },
    studentRepository: { list: vi.fn().mockResolvedValue({ items: students }) },
    lessonRepository: { listForBilling: vi.fn().mockResolvedValue(lessons) },
    bankRepository: { list: vi.fn().mockResolvedValue([]) },
    paymentRepository: { listAll: vi.fn().mockResolvedValue([{ id: 'p1' }]) },
    financeRepository: {
      cashSummary: vi.fn().mockResolvedValue({ entries: [], people: [] }),
      recordPayment: vi.fn().mockResolvedValue({ invoice: {} }),
      recordTeacherCash: vi.fn().mockResolvedValue({}),
      allocateBankTransaction: vi.fn(),
    },
    deliveryRepository: { remind: vi.fn().mockResolvedValue({}) },
    ...overrides,
  };
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><MonthReconciliationPage today="2026-11-27" {...repos} /></AuthContext.Provider></MemoryRouter>);
  return repos;
}

describe('MonthReconciliationPage', () => {
  it('shows one number, only the students that do not match, and the matched ones folded into one line', async () => {
    setup();
    const list = await screen.findByRole('list', { name: 'Ei klapi' });
    expect(screen.getByText('Jäänud kontrollida').nextSibling).toHaveTextContent('2');
    expect(screen.getByText(/Klapib 1 \/ 3 · kontrollimata 130,00/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Klapib' })).toHaveAttribute('aria-valuenow', '33');
    const rows = within(list).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('Demjan Saar');
    expect(rows[0]).toHaveTextContent('Arve tasumata · KS-102');
    expect(rows[1]).toHaveTextContent('Maksab sularahas · 2 tundi kinnitamata');
    expect(within(list).queryByText('Mia Tamm')).toBeNull();
    expect(screen.getByText('Klapib: 1 õpilane')).toBeInTheDocument();
    expect(screen.getByText('november 2026')).toBeInTheDocument();
  });

  it('„Märgi” records a transfer through the existing payment operation', async () => {
    const repos = setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Märgi: Demjan Saar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Makstud ülekandega' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Registreeri' }));
    await waitFor(() => expect(repos.financeRepository.recordPayment).toHaveBeenCalledWith('i2', expect.objectContaining({ amount: 80, method: 'bank' })));
    expect(await screen.findByText('Makse arvele KS-102 registreeriti.')).toBeInTheDocument();
    expect(repos.invoiceRepository.list).toHaveBeenCalledTimes(2);
  });

  it('„Makstud sularahas” opens the payment window with cash chosen; a reminder goes through the delivery API', async () => {
    const repos = setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Märgi: Demjan Saar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Makstud sularahas' }));
    expect(await screen.findByLabelText('Makseviis')).toHaveValue('cash');
    fireEvent.click(screen.getByRole('button', { name: 'Loobu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Märgi: Demjan Saar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Saada meeldetuletus' }));
    await waitFor(() => expect(repos.deliveryRepository.remind).toHaveBeenCalledWith('i2'));
    expect(repos.financeRepository.recordPayment).not.toHaveBeenCalled();
  });

  it('a cash payer gets „Sain kätte”: an off-the-books cash receipt dated inside the month', async () => {
    const repos = setup();
    fireEvent.click(await screen.findByRole('button', { name: 'Sain kätte: Arseni Kask' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByLabelText('Summa (€)')).toHaveValue('50,00');
    expect(within(dialog).getByLabelText('Kuupäev')).toHaveValue('2026-11-27');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Sain kätte' }));
    await waitFor(() => expect(repos.financeRepository.recordTeacherCash).toHaveBeenCalledWith(expect.objectContaining({
      studentId: 's2', amount: '50.00', receivedAt: '2026-11-27', purpose: 'lessons', lessons: 2, note: 'Kuu võrdlus: november 2026',
    })));
  });

  it('the statement button opens the existing bank panel; the month can be changed', async () => {
    const repos = setup();
    await screen.findByRole('list', { name: 'Ei klapi' });
    fireEvent.click(screen.getByRole('button', { name: /Laadi väljavõte/ }));
    expect(await screen.findByText('Väljavõtte paneel · makseid 1')).toBeInTheDocument();
    expect(repos.paymentRepository.listAll).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getAllByRole('button', { name: 'Sulge' }).at(-1));
    expect(screen.getByRole('button', { name: 'Järgmine kuu' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Eelmine kuu' }));
    expect(await screen.findByText('oktoober 2026')).toBeInTheDocument();
    expect(screen.getByText('Selles kuus pole veel midagi võrrelda')).toBeInTheDocument();
  });

  it('nobody but an administrator sees it, and nothing is loaded for them', () => {
    const repos = setup({ uid: 'fin-1', displayName: 'Raamatupidaja', roles: ['finance'] });
    expect(screen.getByText('Ainult administraatorile')).toBeInTheDocument();
    expect(repos.invoiceRepository.list).not.toHaveBeenCalled();
    expect(repos.financeRepository.cashSummary).not.toHaveBeenCalled();
  });
});
