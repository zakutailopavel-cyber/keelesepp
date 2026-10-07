import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import MonthlyInvoicePanel from './MonthlyInvoicePanel.jsx';

vi.mock('./monthlyBilling.js', async (importOriginal) => ({ ...(await importOriginal()), defaultBillingMonth: () => '2031-10' }));

const props = () => ({
  students: [{ id: 's1', name: 'Mari', active: true, parentEmail: 'mari@example.com' }, { id: 's2', name: 'Jaan', active: true }],
  plans: [{ studentId: 's1', lessonPriceCents: 2500, lessonMinutes: 60, billingMode: 'current' }],
  lessons: [{ id: 'l3', studentId: 's1', date: '2031-09-17', status: 'Puudus_eta', duration: 60 }],
  invoices: [{ studentId: 's1', planMonth: '2031-09', plannedUnits: 1, status: 'Ootel' }],
  scheduleRepository: { list: vi.fn().mockResolvedValue([{ id: 'e1', studentId: 's1', recurring: true, day: 'Wed', startDate: '2031-09-03', duration: 60 }, { id: 'e2', studentId: 's2', recurring: true, day: 'Wed', startDate: '2031-09-03', duration: 60 }]) },
  groupRepository: { list: vi.fn().mockResolvedValue([]) },
  invoiceApi: { createMonthly: vi.fn().mockResolvedValue({ invoice: { id: 'inv1' } }) },
  deliveryApi: { send: vi.fn().mockResolvedValue({}) },
  lessonRepository: { setBillingWaived: vi.fn().mockResolvedValue({}) },
  onChanged: vi.fn(),
  user: { displayName: 'Admin' },
});

describe('MonthlyInvoicePanel', () => {
  it('creates and e-mails the selected monthly invoices', async () => {
    const p = props();
    render(<MonthlyInvoicePanel {...p} />);
    const table = await screen.findByRole('table', { name: 'Kuuarved 2031-10' });
    expect(within(table).getByText('Hind puudub')).toBeInTheDocument();
    expect(await screen.findByText(/Valitud 1 \/ 1 arvet/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Koosta ja saada/ })); });
    expect(p.invoiceApi.createMonthly).toHaveBeenCalledWith({ studentId: 's1', month: '2031-10', due: '2031-10-10', plannedUnits: 5, correctionUnits: 0, correctionNote: '' });
    expect(p.deliveryApi.send).toHaveBeenCalledWith('inv1');
    expect(screen.getByRole('status')).toHaveTextContent('Valmis: 1 arvet, e-postiga saadetud 1');
    expect(p.onChanged).toHaveBeenCalled();
  });

  it('lets the admin waive last month no-show and the correction follows', async () => {
    const p = props();
    render(<MonthlyInvoicePanel {...p} />);
    await screen.findByRole('table', { name: 'Kuuarved 2031-10' });
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    await act(async () => { fireEvent.click(screen.getByLabelText(/erand, ära arvesta/)); });
    expect(p.lessonRepository.setBillingWaived).toHaveBeenCalledWith('l3', true, p.user);
    await waitFor(() => expect(screen.getByRole('button', { name: '-1' })).toBeInTheDocument());
  });

  it('the admin enters a missing price and payer e-mail in the row and it becomes ready at once', async () => {
    const p = props();
    p.user = { uid: 'a', displayName: 'Admin', roles: ['admin'] };
    p.parentRepository = { list: vi.fn().mockResolvedValue([]) };
    p.planRepository = { save: vi.fn().mockImplementation(async (student, values) => ({ studentId: student.id, lessonPriceCents: 2000, lessonMinutes: Number(values.lessonMinutes), billingMode: 'current', weeklyLessons: values.weeklyLessons })) };
    p.studentRepository = { update: vi.fn().mockResolvedValue({}) };
    render(<MonthlyInvoicePanel {...p} />);
    const priceForm = await screen.findByRole('form', { name: 'Tunni hind: Jaan' });
    fireEvent.change(within(priceForm).getByLabelText('Tunni hind (€)'), { target: { value: '20' } });
    await act(async () => { fireEvent.click(within(priceForm).getByRole('button', { name: 'Salvesta hind' })); });
    expect(p.planRepository.save).toHaveBeenCalledWith(expect.objectContaining({ id: 's2' }), expect.objectContaining({ lessonPrice: '20', lessonMinutes: '60', weeklyLessons: 1 }), p.user, null);
    const emailForm = screen.getByRole('form', { name: 'Maksja e-post: Jaan' });
    fireEvent.change(within(emailForm).getByLabelText('Maksja e-post'), { target: { value: 'jaan.isa@example.com' } });
    await act(async () => { fireEvent.click(within(emailForm).getByRole('button', { name: 'Salvesta e-post' })); });
    expect(p.studentRepository.update).toHaveBeenCalledWith('s2', { parentEmail: 'jaan.isa@example.com' });
    await waitFor(() => expect(screen.queryByRole('form', { name: /Jaan/ })).not.toBeInTheDocument());
    expect(screen.getByText(/Valitud 2 \/ 2 arvet/)).toBeInTheDocument();
  });
});
