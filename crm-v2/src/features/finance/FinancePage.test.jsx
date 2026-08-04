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

function renderPage(financeRepository = { recordPayment: vi.fn().mockResolvedValue({}), createInvoiceFromLessons: vi.fn().mockResolvedValue({}), setLessonBillingDisposition: vi.fn().mockResolvedValue({}), creditInvoiceLessonLine: vi.fn().mockResolvedValue({}), allocateBankTransaction: vi.fn().mockResolvedValue({}), previewFinancialPeriod: vi.fn().mockResolvedValue({ snapshot: { month: '2026-07', canReview: true, summary: {}, issues: [] } }), reviewFinancialPeriod: vi.fn().mockResolvedValue({}), applyPayerCredit: vi.fn().mockResolvedValue({}), refundPayerCredit: vi.fn().mockResolvedValue({}), voidPayment: vi.fn().mockResolvedValue({}), resolveInvoiceOverpayment: vi.fn().mockResolvedValue({}), attachPaymentDocument: vi.fn().mockResolvedValue({}) }, deliveryRepository = { send: vi.fn().mockResolvedValue({}), remind: vi.fn().mockResolvedValue({}), pdf: vi.fn().mockResolvedValue({ filename: 'arve-KS-101.pdf', contentType: 'application/pdf', contentBase64: 'JVBERg==' }), creditNotePdf: vi.fn().mockResolvedValue({}), sendCreditNote: vi.fn().mockResolvedValue({}) }, options = {}) {
  const invoiceRepository = { list: vi.fn().mockResolvedValue(options.invoices || [invoice]) };
  const paymentRepository = { listByInvoice: vi.fn().mockResolvedValue(options.payments || [{ id: 'payment-1', amountCents: 4000, paidAt: '2026-08-03', method: 'bank', status: 'active' }]) };
  const planRepository = { list: vi.fn().mockResolvedValue([{ id: 'student-1', studentId: 'student-1', studentName: 'Sofia Tamm', lessonPriceCents: 2500, weeklyLessons: 2, active: true }]), save: vi.fn().mockResolvedValue({}) };
  const studentRepository = { list: vi.fn().mockResolvedValue({ items: [{ id: 'student-1', name: 'Sofia Tamm', lessonPrice: 25, weeklyLessons: 2, active: true }] }) };
  const lessonRepository = { listForBilling: vi.fn().mockResolvedValue([{ id: 'lesson-1', studentId: 'student-1', studentName: 'Sofia Tamm', date: '2026-08-02', status: 'Toimunud' }]) };
  const bankRepository = { list: vi.fn().mockResolvedValue([]) };
  const periodRepository = { list: vi.fn().mockResolvedValue([]) };
  const creditRepository = { list: vi.fn().mockResolvedValue(options.credits || []), listRefunds: vi.fn().mockResolvedValue(options.refunds || []) };
  const creditNoteRepository = { list: vi.fn().mockResolvedValue(options.creditNotes || []) };
  const auditRepository = { list: vi.fn().mockResolvedValue(options.auditEntries || []) };
  const documentRepository = { upload: vi.fn().mockResolvedValue({ payment: { id: 'payment-1', amountCents: 4000, paidAt: '2026-08-03', method: 'bank', status: 'active', documents: [] } }), getUrl: vi.fn().mockResolvedValue('blob:payment-document') };
  const user = { uid: 'admin-1', displayName: 'Admin', roles: ['admin'] };
  render(<MemoryRouter><AuthContext.Provider value={{ user }}><FinancePage invoiceRepository={invoiceRepository} paymentRepository={paymentRepository} financeRepository={financeRepository} deliveryRepository={deliveryRepository} planRepository={planRepository} studentRepository={studentRepository} lessonRepository={lessonRepository} bankRepository={bankRepository} periodRepository={periodRepository} creditRepository={creditRepository} creditNoteRepository={creditNoteRepository} auditRepository={auditRepository} documentRepository={documentRepository} /></AuthContext.Provider></MemoryRouter>);
  return { financeRepository, deliveryRepository, invoiceRepository, paymentRepository, planRepository, studentRepository, lessonRepository, bankRepository, periodRepository, creditRepository, creditNoteRepository, auditRepository, documentRepository, user };
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

  it('opens the invoice PDF inside the CRM without downloading it first', async () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:invoice-preview') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const repositories = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    const invoiceDialog = screen.getByRole('dialog', { name: 'Arve KS-101' });
    fireEvent.click(within(invoiceDialog).getByRole('button', { name: /Eelvaade/ }));
    await waitFor(() => expect(repositories.deliveryRepository.pdf).toHaveBeenCalledWith('invoice-1'));
    expect(await screen.findByRole('dialog', { name: 'arve-KS-101.pdf' })).toBeInTheDocument();
  });

  it('uploads a payment confirmation through the protected document repository', async () => {
    const repositories = renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    const dialog = screen.getByRole('dialog', { name: 'Arve KS-101' });
    const file = new globalThis.File(['payment'], 'maksekorraldus.pdf', { type: 'application/pdf' });
    fireEvent.change(await within(dialog).findByLabelText(/Lisa kinnitus/), { target: { files: [file] } });
    await waitFor(() => expect(repositories.documentRepository.upload).toHaveBeenCalledWith('payment-1', file, repositories.financeRepository));
    expect(await screen.findByRole('status')).toHaveTextContent('maksekorraldus.pdf');
  });

  it('shows immutable financial audit entries', async () => {
    renderPage(undefined, undefined, {
      auditEntries: [{
        id: 'audit-1',
        action: 'payment.created',
        invoiceNum: 'KS-101',
        studentName: 'Sofia Tamm',
        amountCents: 4000,
        createdAt: '2026-08-04T10:00:00.000Z',
        actor: { email: 'admin@example.com' },
      }],
    });
    expect(await screen.findByText('Finantstegevuste ajalugu')).toBeInTheDocument();
    expect(screen.getByText('Makse registreeriti')).toBeInTheDocument();
    expect(screen.getByText(/admin@example.com/)).toBeInTheDocument();
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

  it('imports a bank CSV and allocates an automatically matched payment', async () => {
    const financeRepository = {
      recordPayment: vi.fn(),
      setLessonBillingDisposition: vi.fn(),
      createInvoiceFromLessons: vi.fn(),
      creditInvoiceLessonLine: vi.fn(),
      allocateBankTransaction: vi.fn().mockResolvedValue({ bankTransaction: { id: 'bank-1' } }),
    };
    renderPage(financeRepository);
    await screen.findByText('Pangaväljavõtte võrdlus');
    const file = {
      name: 'lhv.csv',
      text: vi.fn().mockResolvedValue('Kuupäev;Maksja;Selgitus;Summa;Tehingu ID\n03.08.2026;Maarika Tamm;Arve KS-101;80,00;TX-101'),
    };
    fireEvent.change(document.querySelector('input[type="file"]'), { target: { files: [file] } });
    expect(await screen.findByText('Leitud automaatselt')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Seo valitud maksed/ }));
    await waitFor(() => expect(financeRepository.allocateBankTransaction).toHaveBeenCalledWith(expect.objectContaining({
      invoiceId: 'invoice-1', studentId: 'student-1', allocationCents: 8000, amountCents: 8000,
    })));
    expect(await screen.findByRole('status')).toHaveTextContent('edukalt seotud');
  });

  it('previews a reconciled month and records its financial review', async () => {
    const snapshot = {
      month: '2026-07',
      canReview: true,
      summary: {
        lessonCount: 4,
        unbilledLessonCount: 0,
        invoiceCount: 2,
        issuedCents: 10000,
        bankReceivedCents: 10000,
        bankTransactionCount: 2,
        blockingIssueCount: 0,
        warningCount: 0,
        bankAdvanceCents: 0,
      },
      issues: [],
    };
    const financeRepository = {
      previewFinancialPeriod: vi.fn().mockResolvedValue({ snapshot }),
      reviewFinancialPeriod: vi.fn().mockResolvedValue({ review: { month: '2026-07' } }),
    };
    renderPage(financeRepository);
    await screen.findByText('Finantsperioodi võrdlus');
    fireEvent.click(screen.getByRole('button', { name: /Kontrolli kuu/ }));
    expect(await screen.findByText('Kuu andmed on omavahel kooskõlas')).toBeInTheDocument();
    expect(financeRepository.previewFinancialPeriod).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}$/));
    fireEvent.click(screen.getByRole('button', { name: /Märgi kontrollituks/ }));
    await waitFor(() => expect(financeRepository.reviewFinancialPeriod).toHaveBeenCalled());
    expect(await screen.findByRole('status')).toHaveTextContent('kontrollituks märgitud');
  });

  it('applies an available student advance to an open invoice', async () => {
    const financeRepository = { applyPayerCredit: vi.fn().mockResolvedValue({}) };
    renderPage(financeRepository, undefined, { credits: [{ id: 'credit-1', studentId: 'student-1', studentName: 'Sofia Tamm', payerName: 'Maarika Tamm', availableAmountCents: 3000, status: 'open', createdAt: '2026-08-03' }] });
    await screen.findByText('Õpilaste avansid');
    fireEvent.click(screen.getByRole('button', { name: /Kasuta arvel/ }));
    const dialog = screen.getByRole('dialog', { name: 'Kasuta avanssi arvel' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Rakenda avanss' }));
    await waitFor(() => expect(financeRepository.applyPayerCredit).toHaveBeenCalledWith('credit-1', 'invoice-1', 30, ''));
  });

  it('records a payer-credit refund with a mandatory reason', async () => {
    const financeRepository = { refundPayerCredit: vi.fn().mockResolvedValue({}) };
    renderPage(financeRepository, undefined, { credits: [{ id: 'credit-1', studentId: 'student-1', studentName: 'Sofia Tamm', payerName: 'Maarika Tamm', availableAmountCents: 3000, status: 'open', createdAt: '2026-08-03' }] });
    await screen.findByText('Õpilaste avansid');
    fireEvent.click(screen.getByRole('button', { name: /Tagasta/ }));
    const dialog = screen.getByRole('dialog', { name: 'Tagasta avanss' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kinnita tagastus' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('põhjus');
    fireEvent.change(within(dialog).getByLabelText('Tagastuse põhjus *'), { target: { value: 'Kliendi soov' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kinnita tagastus' }));
    await waitFor(() => expect(financeRepository.refundPayerCredit).toHaveBeenCalledWith('credit-1', expect.objectContaining({ amount: 30, reason: 'Kliendi soov' })));
  });

  it('voids an erroneous payment only after a reason is entered', async () => {
    const financeRepository = { voidPayment: vi.fn().mockResolvedValue({}) };
    renderPage(financeRepository);
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    const invoiceDialog = screen.getByRole('dialog', { name: 'Arve KS-101' });
    fireEvent.click(await within(invoiceDialog).findByRole('button', { name: /Tühista/ }));
    const dialog = screen.getByRole('dialog', { name: 'Tühista makse' });
    fireEvent.change(within(dialog).getByLabelText('Tühistamise põhjus *'), { target: { value: 'Makse sisestati kaks korda' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tühista makse' }));
    await waitFor(() => expect(financeRepository.voidPayment).toHaveBeenCalledWith('payment-1', 'Makse sisestati kaks korda'));
  });

  it('moves an invoice overpayment into the student advance ledger', async () => {
    const financeRepository = { resolveInvoiceOverpayment: vi.fn().mockResolvedValue({}) };
    renderPage(financeRepository, undefined, { invoices: [{ ...invoice, paidAmountCents: 14000, balanceDueCents: 0, overpaidAmountCents: 2000 }] });
    fireEvent.click(await screen.findByRole('button', { name: 'KS-101' }));
    fireEvent.click(screen.getByRole('button', { name: /Muuda avansiks/ }));
    const dialog = screen.getByRole('dialog', { name: 'Muuda ülemakse avansiks' });
    fireEvent.change(within(dialog).getByLabelText('Põhjus *'), { target: { value: 'Järgmise arve ettemaks' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Kinnita avanss' }));
    await waitFor(() => expect(financeRepository.resolveInvoiceOverpayment).toHaveBeenCalledWith('invoice-1', 'Järgmise arve ettemaks'));
  });

  it('lets finance view the limited forecast projection without loading student profiles', async () => {
    const user = { uid: 'finance-1', displayName: 'Finants', roles: ['finance'] };
    const invoiceRepository = { list: vi.fn().mockResolvedValue([]) };
    const planRepository = { list: vi.fn().mockResolvedValue([{ id: 'student-1', studentId: 'student-1', studentName: 'Sofia Tamm', lessonPriceCents: 2500, weeklyLessons: 2, active: true }]) };
    const studentRepository = { list: vi.fn() };
    const bankRepository = { list: vi.fn() };
    const periodRepository = { list: vi.fn() };
    const creditRepository = { list: vi.fn(), listRefunds: vi.fn() };
    const creditNoteRepository = { list: vi.fn() };
    const auditRepository = { list: vi.fn() };
    render(<MemoryRouter><AuthContext.Provider value={{ user }}><FinancePage invoiceRepository={invoiceRepository} paymentRepository={{}} financeRepository={{}} planRepository={planRepository} studentRepository={studentRepository} bankRepository={bankRepository} periodRepository={periodRepository} creditRepository={creditRepository} creditNoteRepository={creditNoteRepository} auditRepository={auditRepository} /></AuthContext.Provider></MemoryRouter>);

    expect(await screen.findByText('Planeeritud tunnitulu')).toBeInTheDocument();
    expect(screen.getByText('Sofia Tamm')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Seadista prognoos/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Muuda' })).not.toBeInTheDocument();
    expect(studentRepository.list).not.toHaveBeenCalled();
    expect(bankRepository.list).not.toHaveBeenCalled();
    expect(periodRepository.list).not.toHaveBeenCalled();
    expect(creditRepository.list).not.toHaveBeenCalled();
    expect(creditRepository.listRefunds).not.toHaveBeenCalled();
    expect(creditNoteRepository.list).not.toHaveBeenCalled();
    expect(auditRepository.list).not.toHaveBeenCalled();
  });
});
