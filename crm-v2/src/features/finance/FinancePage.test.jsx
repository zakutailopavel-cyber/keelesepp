import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import FinancePage from './FinancePage.jsx';

const invoice = {
  id: 'invoice-1',
  num: 'KS-101',
  studentId: 'student-1',
  studentName: 'Sofia Tamm',
  payerName: 'Maarika Tamm',
  amountCents: 12000,
  paidAmountCents: 4000,
  balanceDueCents: 8000,
  date: '2026-08-01',
  due: '2026-08-10',
  lines: [{ lessonId: 'lesson-1', date: '2026-07-30', description: 'Keeletund 2026-07-30', amountCents: 12000 }],
};

function renderPage(financeRepository = { recordPayment: vi.fn().mockResolvedValue({}), createInvoiceFromLessons: vi.fn().mockResolvedValue({}), setLessonBillingDisposition: vi.fn().mockResolvedValue({}), creditInvoiceLessonLine: vi.fn().mockResolvedValue({}) }, deliveryRepository = { send: vi.fn().mockResolvedValue({}), remind: vi.fn().mockResolvedValue({}) }) {
  const invoiceRepository = { list: vi.fn().mockResolvedValue([invoice]) };
  const paymentRepository = { listByInvoice: vi.fn().mockResolvedValue([{ id: 'payment-1', amountCents: 4000, paidAt: '2026-08-03', method: 'bank', status: 'active' }]) };
  const planRepository = { list: vi.fn().mockResolvedValue([{ id: 'student-1', studentId: 'student-1', studentName: 'Sofia Tamm', lessonPriceCents: 2500, weeklyLessons: 2, active: true }]), save: vi.fn().mockResolvedValue({}) };
  const studentRepository = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Sofia Tamm', lessonPrice: 25, weeklyLessons: 2, active: true }] }) };
  const lessonRepository = { listForBilling: vi.fn().mockResolvedValue([{ id: 'lesson-1', studentId: 'student-1', studentName: 'Sofia Tamm', date: '2026-08-02', status: 'Toimunud' }]) };
  const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><FinancePage invoiceRepository={invoiceRepository} paymentRepository={paymentRepository} financeRepository={financeRepository} deliveryRepository={deliveryRepository} planRepository={planRepository} studentRepository={studentRepository} lessonRepository={lessonRepository} /></AuthContext.Provider></MemoryRouter>);
  return { financeRepository, deliveryRepository, invoiceRepository, paymentRepository, planRepository, studentRepository, lessonRepository, user };
}

describe('FinancePage', () => {
  it('opens invoice details and shows its payment history', async () => {
    const repositories = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    const dialog = await screen.findByRole('dialog', { name: 'Arve KS-101' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Maarika Tamm')).toBeInTheDocument();
    expect((await within(dialog).findAllByText('40,00 €')).length).toBeGreaterThan(0);
    expect(repositories.paymentRepository.listByInvoice).toHaveBeenCalledWith('invoice-1');
  });

  it('sends a payment through the trusted finance repository', async () => {
    const financeRepository = { recordPayment: vi.fn().mockResolvedValue({}) };
    renderPage(financeRepository);
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    fireEvent.click(screen.getByRole('button', { name: /Registreeri makse/ }));
    fireEvent.change(screen.getByLabelText('Laekunud summa (€)'), { target: { value: '25,50' } });
    fireEvent.click(screen.getByRole('button', { name: /Kinnita makse/ }));
    await waitFor(() => expect(financeRepository.recordPayment).toHaveBeenCalledWith('invoice-1', expect.objectContaining({ amount: 25.5, method: 'bank' })));
    await screen.findByRole('status');
  });

  it('lets an administrator set lesson price and weekly volume for the revenue forecast', async () => {
    const repositories = renderPage();
    await screen.findByText('Planeeritud tunnitulu');
    expect(screen.getAllByText(/216,67/)).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: /Seadista prognoos/ }));
    const dialog = screen.getByRole('dialog', { name: 'Õpilase tuluprognoos' });
    fireEvent.change(within(dialog).getByLabelText('Tunni hind (€)'), { target: { value: '30' } });
    fireEvent.change(within(dialog).getByLabelText('Tunde nädalas'), { target: { value: '3' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta prognoos' }));
    await waitFor(() => expect(repositories.planRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'student-1' }),
      expect.objectContaining({ lessonPrice: '30', weeklyLessons: '3' }),
      repositories.user,
    ));
  });

  it('creates an invoice from selected completed lessons through the trusted API', async () => {
    const financeRepository = {
      recordPayment: vi.fn(),
      setLessonBillingDisposition: vi.fn(),
      createInvoiceFromLessons: vi.fn().mockResolvedValue({ invoice: { num: 'KS-2026-201', lessonCount: 1 } }),
    };
    renderPage(financeRepository);
    await screen.findByText('Arveldamata tunnid');
    fireEvent.click(screen.getByRole('button', { name: /Loo arve/ }));
    const dialog = screen.getByRole('dialog', { name: 'Loo arve: Sofia Tamm' });
    fireEvent.click(within(dialog).getByRole('button', { name: /Loo arve/ }));
    await waitFor(() => expect(financeRepository.createInvoiceFromLessons).toHaveBeenCalledWith(expect.objectContaining({
      studentId: 'student-1', lessonIds: ['lesson-1'], due: expect.stringMatching(/^\d{4}-\d{2}-10$/),
    })));
    expect(await screen.findByRole('status')).toHaveTextContent('KS-2026-201');
  });

  it('shows invoice lesson lines and sends the invoice through the delivery API', async () => {
    const repositories = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    const dialog = screen.getByRole('dialog', { name: 'Arve KS-101' });
    expect(within(dialog).getByText('Tunnid ja summad')).toBeInTheDocument();
    expect(within(dialog).getByText('Keeletund 2026-07-30')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /Saada arve/ }));
    await waitFor(() => expect(repositories.deliveryRepository.send).toHaveBeenCalledWith('invoice-1'));
    expect(await screen.findByRole('status')).toHaveTextContent('Arve saadeti');
  });

  it('requires a reason before crediting an immutable invoice lesson line', async () => {
    const repositories = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    fireEvent.click(screen.getByRole('button', { name: /Krediteeri/ }));
    const dialog = screen.getByRole('dialog', { name: 'Krediteeri tunnirida' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kinnita krediteerimine' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('põhjus');
    fireEvent.change(within(dialog).getByLabelText('Põhjus *'), { target: { value: 'Tund sisestati ekslikult' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kinnita krediteerimine' }));
    await waitFor(() => expect(repositories.financeRepository.creditInvoiceLessonLine).toHaveBeenCalledWith('invoice-1', 'lesson-1', 'Tund sisestati ekslikult'));
  });

  it('lets finance view the limited forecast projection without loading student profiles', async () => {
    const user = { uid: 'finance-1', displayName: 'Finants', roles: ['finance'] };
    const invoiceRepository = { list: vi.fn().mockResolvedValue([]) };
    const planRepository = { list: vi.fn().mockResolvedValue([{ id: 'student-1', studentId: 'student-1', studentName: 'Sofia Tamm', lessonPriceCents: 2500, weeklyLessons: 2, active: true }]) };
    const studentRepository = { list: vi.fn() };
    render(<MemoryRouter><AuthContext.Provider value={{ user }}><FinancePage invoiceRepository={invoiceRepository} paymentRepository={{}} financeRepository={{}} planRepository={planRepository} studentRepository={studentRepository} /></AuthContext.Provider></MemoryRouter>);

    expect(await screen.findByText('Planeeritud tunnitulu')).toBeInTheDocument();
    expect(screen.getByText('Sofia Tamm')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Seadista prognoos/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Muuda' })).not.toBeInTheDocument();
    expect(studentRepository.list).not.toHaveBeenCalled();
  });
});
