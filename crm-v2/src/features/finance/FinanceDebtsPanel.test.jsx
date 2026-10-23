import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import FinanceDebtsPanel from './FinanceDebtsPanel.jsx';
import { pastDueInvoices } from './financeDebts.js';

vi.mock('./BankReconciliationPanel.jsx', () => ({ default: ({ onAllocate, onReload }) => <button type="button" onClick={async () => { await onAllocate({ requestId: 'bank-1' }); await onReload(); }}>Seo testmakse</button> }));

const invoices = [
  { id: 'old', planMonth: '2031-09', studentName: 'Mari', num: 'AR-1', amountCents: 10000, paidAmountCents: 2000, due: '2031-09-10' },
  { id: 'paid', planMonth: '2031-08', studentName: 'Jaan', amountCents: 5000, paidAmountCents: 5000, due: '2031-08-10' },
  { id: 'current', planMonth: '2031-10', studentName: 'Sofia', amountCents: 6000, due: '2031-10-10' },
];

describe('FinanceDebtsPanel', () => {
  it('shows only unpaid invoices from earlier months', () => {
    expect(pastDueInvoices(invoices, '2031-10').map((item) => item.id)).toEqual(['old']);
    render(<FinanceDebtsPanel month="2031-10" invoices={invoices} students={[]} transactions={[]} onAllocate={vi.fn()} onReload={vi.fn()} onRemind={vi.fn()} />);
    const table = screen.getByRole('table', { name: 'Võlgnevused' });
    expect(within(table).getByText('Mari')).toBeInTheDocument();
    expect(within(table).queryByText('Sofia')).not.toBeInTheDocument();
  });

  it('imports a bank row and requests an immediate debt refresh', async () => {
    const onAllocate = vi.fn().mockResolvedValue({}); const onReload = vi.fn().mockResolvedValue({});
    render(<FinanceDebtsPanel month="2031-10" invoices={invoices} students={[]} transactions={[]} onAllocate={onAllocate} onReload={onReload} onRemind={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Impordi pank/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Seo testmakse' })); });
    expect(onAllocate).toHaveBeenCalledWith({ requestId: 'bank-1' });
    expect(onReload).toHaveBeenCalled();
  });

  const base = { month: '2031-10', students: [], transactions: [], onAllocate: vi.fn(), onRemind: vi.fn() };

  it('corrects an earlier invoice due date with a reason and reloads the debts', async () => {
    const onCorrectDueDate = vi.fn().mockResolvedValue({}); const onReload = vi.fn().mockResolvedValue({});
    render(<FinanceDebtsPanel {...base} invoices={invoices} onReload={onReload} onCorrectDueDate={onCorrectDueDate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-1' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Uus maksetähtaeg'), { target: { value: '2031-10-20' } });
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'lühike' } });
    expect(within(dialog).getByRole('button', { name: 'Salvesta tähtaeg' })).toBeDisabled();
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'Kokkulepitud uus maksetähtaeg' } });
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta tähtaeg' })); });
    expect(onCorrectDueDate).toHaveBeenCalledWith(invoices[0], '2031-10-20', 'Kokkulepitud uus maksetähtaeg');
    expect(onReload).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('Maksetähtaeg parandati');
  });

  it('credits one incorrect lesson line as a separate credit note and refreshes the debt', async () => {
    const invoice = { ...invoices[0], lines: [{ lessonId: 'lesson-1', date: '2031-09-01', amountCents: 8000, description: 'Keeletund' }, { lessonId: 'lesson-2', date: '2031-09-08', amountCents: 2000 }], correctedLessonIds: ['lesson-2'] };
    const onCreditLessonLine = vi.fn().mockResolvedValue({}); const onReload = vi.fn().mockResolvedValue({});
    render(<FinanceDebtsPanel {...base} invoices={[invoice]} onReload={onReload} onCorrectDueDate={vi.fn()} onCreditLessonLine={onCreditLessonLine} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-1' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getAllByRole('radio')).toHaveLength(1);
    fireEvent.click(within(dialog).getByRole('radio'));
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'Tund jäi tegelikult ära' } });
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Krediteeri tunnirida' })); });
    expect(onCreditLessonLine).toHaveBeenCalledWith(invoice, 'lesson-1', 'Tund jäi tegelikult ära');
    expect(onReload).toHaveBeenCalledOnce();
  });

  it('explains that a monthly invoice without lesson lines cannot have a single lesson credited', () => {
    render(<FinanceDebtsPanel {...base} invoices={invoices} onReload={vi.fn()} onCorrectDueDate={vi.fn()} onCreditLessonLine={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-1' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).queryByRole('radio')).not.toBeInTheDocument();
    expect(within(dialog).getByText(/ei ole tunniridu/)).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Krediteeri tunnirida' })).not.toBeInTheDocument();
  });

  it('keeps the edit dialog open when the correction API rejects it', async () => {
    const onCorrectDueDate = vi.fn().mockRejectedValue(new Error('Financial period is closed'));
    render(<FinanceDebtsPanel {...base} invoices={invoices} onReload={vi.fn()} onCorrectDueDate={onCorrectDueDate} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-1' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Uus maksetähtaeg'), { target: { value: '2031-10-20' } });
    fireEvent.change(within(dialog).getByLabelText('Paranduse põhjus'), { target: { value: 'Kokkulepitud uus maksetähtaeg' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta tähtaeg' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Financial period is closed');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Salvesta tähtaeg' })).not.toBeDisabled());
  });

  it('offers „Tühista” by the current cancellation rule: a sent unpaid invoice yes, a paid or lesson-line invoice no', () => {
    const onCancel = vi.fn();
    const list = [
      ...invoices,
      { id: 'sent', planMonth: '2031-08', billingMode: 'monthly_plan_v1', status: 'Ootel', emailStatus: 'sent', num: 'AR-4', amountCents: 7000, due: '2031-08-10' },
      { id: 'lessons', planMonth: '2031-08', billingMode: 'monthly_plan_v1', status: 'Ootel', num: 'AR-5', amountCents: 7000, due: '2031-08-10', lines: [{ lessonId: 'l1', amountCents: 7000 }] },
    ];
    render(<FinanceDebtsPanel {...base} invoices={list} onReload={vi.fn()} onCancel={onCancel} />);
    expect(screen.queryByRole('button', { name: 'Tühista arve AR-1' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Tühista arve AR-5' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tühista arve AR-4' }));
    expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ id: 'sent' }));
  });
  const unpaid = { id: 'whole', planMonth: '2031-09', billingMode: 'monthly_plan_v1', status: 'Ootel', studentName: 'Kati', num: 'AR-7', amountCents: 8000, amount: 80, due: '2031-09-10', payerName: 'Ema Kask', payerEmail: 'ema@example.com' };

  it('„Krediteeri kogu arve”: explains the credit note, needs a reason and a confirmation, then reloads', async () => {
    const onCreditInFull = vi.fn().mockResolvedValue({ creditNote: { num: 'KN-2031-004' } }); const onReload = vi.fn().mockResolvedValue({});
    render(<FinanceDebtsPanel {...base} invoices={[unpaid]} onReload={onReload} onCorrectDueDate={vi.fn()} onCreditInFull={onCreditInFull} onCorrectInvoice={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-7' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Krediteeri kogu arve' }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/kreeditarve summas 80,00/);
    expect(dialog).toHaveTextContent('uut arvet ei tehta');
    const submit = within(dialog).getByRole('button', { name: 'Krediteeri kogu arve' });
    fireEvent.change(within(dialog).getByLabelText('Põhjus'), { target: { value: 'Arve tehti valele perele' } });
    expect(submit).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('checkbox'));
    expect(submit).not.toBeDisabled();
    await act(async () => { fireEvent.click(submit); });
    expect(onCreditInFull).toHaveBeenCalledWith(unpaid, 'Arve tehti valele perele', expect.stringMatching(/^credit_full-/));
    expect(onReload).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('kreeditarve KN-2031-004');
  });

  it('„Paranda summa või maksja”: a credit note and a new invoice with the corrected amount and payer', async () => {
    const onCorrectInvoice = vi.fn().mockResolvedValue({ creditNote: { num: 'KN-2031-005' }, invoice: { num: 'KS-2031-040' } }); const onReload = vi.fn().mockResolvedValue({});
    render(<FinanceDebtsPanel {...base} invoices={[unpaid]} onReload={onReload} onCreditInFull={vi.fn()} onCorrectInvoice={onCorrectInvoice} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-7' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Paranda summa või maksja' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Õige summa (€)')).toHaveValue('80,00');
    expect(within(dialog).getByLabelText('Maksja nimi')).toHaveValue('Ema Kask');
    fireEvent.change(within(dialog).getByLabelText('Põhjus'), { target: { value: 'Summa ja maksja olid valed' } });
    fireEvent.click(within(dialog).getByRole('checkbox'));
    const submit = within(dialog).getByRole('button', { name: 'Loo kreeditarve ja uus arve' });
    expect(submit).toBeDisabled();
    expect(dialog).toHaveTextContent('praegu on kõik sama');
    fireEvent.change(within(dialog).getByLabelText('Õige summa (€)'), { target: { value: '70,50' } });
    fireEvent.change(within(dialog).getByLabelText('Maksja nimi'), { target: { value: 'Firma OÜ' } });
    fireEvent.change(within(dialog).getByLabelText('Registrikood (ettevõttel)'), { target: { value: '12345678' } });
    expect(dialog).toHaveTextContent(/uus arve summas 70,50/);
    expect(dialog).toHaveTextContent('maksjale Firma OÜ');
    expect(dialog).toHaveTextContent('Selle arve saab pere');
    await act(async () => { fireEvent.click(submit); });
    expect(onCorrectInvoice).toHaveBeenCalledWith(unpaid, expect.objectContaining({ amount: '70.50', payer: { payerName: 'Firma OÜ', payerEmail: 'ema@example.com', payerRegCode: '12345678', payerAddress: '' }, reason: 'Summa ja maksja olid valed', requestId: expect.stringMatching(/^invoice_correction-/), due: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }));
    expect(onReload).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('uus arve KS-2031-040');
  });

  it('a paid-in-part invoice is not credited in full; a lesson-line invoice can change only its payer', () => {
    const { unmount } = render(<FinanceDebtsPanel {...base} invoices={invoices} onReload={vi.fn()} onCreditInFull={vi.fn()} onCorrectInvoice={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-1' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Arvel on laekumisi');
    expect(within(screen.getByRole('dialog')).queryByRole('button', { name: 'Krediteeri kogu arve' })).not.toBeInTheDocument();
    unmount();
    const lessons = { ...unpaid, lines: [{ lessonId: 'l1', amountCents: 8000 }] };
    render(<FinanceDebtsPanel {...base} invoices={[lessons]} onReload={vi.fn()} onCreditInFull={vi.fn()} onCorrectInvoice={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-7' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Paranda summa või maksja' }));
    expect(within(screen.getByRole('dialog')).getByLabelText('Õige summa (€)')).toBeDisabled();
  });

  it('offers „Krediteeri kogu arve” for old debts that cannot be cancelled (no billingMode, lesson links, failed e-mail)', async () => {
    // shaped like KS-2026-030 / -049 / -050 / -004 (lead 2026-10-23)
    const legacy = [
      { id: 'jegor', date: '2026-03-02', due: '2026-03-12', status: 'Ootel', studentName: 'Jegor', parentName: 'Jegori ema', num: 'KS-2026-030', amount: 56, lessonIds: ['j1', 'j2'] },
      { id: 'daniel', date: '2026-04-01', due: '2026-04-11', status: 'Ootel', studentName: 'Daniel', num: 'KS-2026-049', amount: 56, amountCents: 5600, emailStatus: 'failed', lessonIds: ['d1'], lines: [{ lessonId: 'd1', amountCents: 5600 }] },
      { id: 'hanna', date: '2026-01-20', due: '2026-01-30', status: 'Ootel', studentName: 'Hanna Skoryk', num: 'KS-2026-004', amount: 60, amountCents: 6000, creditedAmountCents: 2000, correctedLessonIds: ['h1'], lessonIds: ['h1', 'h2'], lines: [{ lessonId: 'h1', amountCents: 2000 }, { lessonId: 'h2', amountCents: 4000 }] },
    ];
    const onCreditInFull = vi.fn().mockResolvedValue({ creditNote: { num: 'KN-2026-020' } });
    render(<FinanceDebtsPanel {...base} month="2026-10" invoices={legacy} onReload={vi.fn().mockResolvedValue({})} onCancel={vi.fn()} onCreditInFull={onCreditInFull} onCorrectInvoice={vi.fn()} />);
    ['KS-2026-030', 'KS-2026-049', 'KS-2026-004'].forEach((num) => expect(screen.queryByRole('button', { name: `Tühista arve ${num}` })).not.toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet KS-2026-004' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Krediteeri kogu arve' }));
    let dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent(/kreeditarve summas 40,00/);
    fireEvent.change(within(dialog).getByLabelText('Põhjus'), { target: { value: 'Vana võlg suletakse' } });
    fireEvent.click(within(dialog).getByRole('checkbox'));
    await act(async () => { fireEvent.click(within(dialog).getByRole('button', { name: 'Krediteeri kogu arve' })); });
    expect(onCreditInFull).toHaveBeenCalledWith(legacy[2], 'Vana võlg suletakse', expect.any(String));
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet KS-2026-030' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Paranda summa või maksja' }));
    dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Õige summa (€)')).toHaveValue('56,00');
    expect(within(dialog).getByLabelText('Õige summa (€)')).toBeDisabled();
    expect(within(dialog).getByLabelText('Maksja nimi')).toHaveValue('Jegori ema');
  });

  it('keeps the correction dialog open with the server refusal', async () => {
    const onCreditInFull = vi.fn().mockRejectedValue(new Error('Arve on juba täielikult krediteeritud.'));
    render(<FinanceDebtsPanel {...base} invoices={[unpaid]} onReload={vi.fn()} onCreditInFull={onCreditInFull} />);
    fireEvent.click(screen.getByRole('button', { name: 'Muuda arvet AR-7' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Krediteeri kogu arve' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.change(within(dialog).getByLabelText('Põhjus'), { target: { value: 'Arve tehti valele perele' } });
    fireEvent.click(within(dialog).getByRole('checkbox'));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Krediteeri kogu arve' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('täielikult krediteeritud');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
