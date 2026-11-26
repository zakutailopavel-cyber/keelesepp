import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import CashPage from './CashPage.jsx';
import MyCashPage from './MyCashPage.jsx';
import CashOnHandLine from './CashOnHandLine.jsx';
import { cashHandoverNotifications } from '../notifications/notificationModel.js';
import { chosenCents, itemLine, matchStudents, myCashTotals, teacherCashDayRange } from './myCashModel.js';
import { todayIso } from './cashModel.js';

// „Minu kassa” (owner 2026-11-11)
const items = [
  { id: 'r2', type: 'receipt', source: 'lesson', date: '2026-11-10', studentName: 'Mia Tamm', occurrenceDate: '2026-11-10', lessonTime: '16:00', subject: 'Eesti keel', amountCents: 2500, remainingCents: 2500 },
  { id: 'r1', type: 'receipt', source: 'lesson', date: '2026-11-09', studentName: 'Karl Kask', occurrenceDate: '2026-11-09', lessonTime: '15:00', subject: 'Eesti keel', amountCents: 2500, remainingCents: 2500 },
];
const box = (extra = {}) => ({
  onHandCents: 5000, pendingOutCents: 0, availableCents: 5000, ever: true, items, handovers: [], incoming: [], received: [],
  receivers: [{ uid: 'pavel', name: 'Pavel Zakutailo' }, { uid: 'oleksiy', name: 'Oleksiy Skoryk' }], isReceiver: false, ...extra,
});
const teacher = { uid: 'mari', displayName: 'Mari', roles: ['teacher'] };

function renderAt(element, user = teacher, path = '/kassa/minu') {
  return render(<MemoryRouter initialEntries={[path]}><AuthContext.Provider value={{ user }}>{element}</AuthContext.Provider></MemoryRouter>);
}

describe('Minu kassa', () => {
  it('shows only the teacher’s own cash: on hand, entries not handed over, hand-overs', async () => {
    const api = { cashMine: vi.fn().mockResolvedValue(box({ handovers: [{ id: 'h1', toName: 'Pavel Zakutailo', amountCents: 3000, handedAt: '2026-11-05', status: 'active' }, { id: 'h0', toName: 'Oleksiy Skoryk', amountCents: 1000, handedAt: '2026-11-02', status: 'rejected', rejectNote: 'sain ainult 5 €' }] })) };
    renderAt(<MyCashPage api={api} />);
    expect(await screen.findByText('50,00 €', { selector: '.my-cash-summary strong' })).toBeInTheDocument();
    const list = screen.getByRole('region', { name: 'Käes, üle andmata' });
    expect(within(list).getByText(/Mia Tamm · tund 10\.11 kell 16:00 · Eesti keel/)).toBeInTheDocument();
    const history = screen.getByRole('region', { name: 'Minu üleandmised' });
    expect(within(history).getByText('kinnitatud')).toBeInTheDocument();
    expect(within(history).getByText('ei saanud kätte')).toBeInTheDocument();
    expect(within(history).getByText('„sain ainult 5 €”')).toBeInTheDocument();
  });

  it('„Andsin raha üle”: a receiver from the list, everything by default or chosen entries', async () => {
    const api = { cashMine: vi.fn().mockResolvedValue(box()), requestCashHandover: vi.fn().mockResolvedValue({ entry: { id: 'h9', status: 'pending' } }) };
    renderAt(<MyCashPage api={api} />);
    fireEvent.click(await screen.findByRole('button', { name: /Andsin raha üle/ }));
    const dialog = screen.getByRole('dialog', { name: 'Andsin raha üle' });
    const submit = within(dialog).getByRole('button', { name: /Andsin üle/ });
    expect(submit).toBeDisabled(); // no receiver chosen yet
    fireEvent.click(within(dialog).getByLabelText('Oleksiy Skoryk'));
    expect(submit).toHaveTextContent('50,00 €');
    fireEvent.click(within(dialog).getByLabelText('Valin kirjed'));
    expect(submit).toBeDisabled(); // nothing chosen = 0 €
    fireEvent.click(within(dialog).getByRole('checkbox', { name: /Karl Kask/ }));
    expect(submit).toHaveTextContent('25,00 €');
    fireEvent.click(submit);
    await waitFor(() => expect(api.requestCashHandover).toHaveBeenCalledWith(expect.objectContaining({ toUid: 'oleksiy', itemIds: ['r1'] })));
    expect(await screen.findByText(/ootab, et Oleksiy Skoryk kinnitab/)).toBeInTheDocument();
  });

  it('nothing to give: the button is disabled; a pending hand-over can be taken back', async () => {
    const api = {
      cashMine: vi.fn().mockResolvedValue(box({ availableCents: 0, pendingOutCents: 5000, items: [], handovers: [{ id: 'h1', toName: 'Pavel Zakutailo', amountCents: 5000, handedAt: '2026-11-11', status: 'pending' }] })),
      cancelCashHandover: vi.fn().mockResolvedValue({}),
    };
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    renderAt(<MyCashPage api={api} />);
    expect(await screen.findByRole('button', { name: /Andsin raha üle/ })).toBeDisabled();
    expect(screen.getByText('sellest 50,00 € ootab kinnitust')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Võta üleandmine tagasi' }));
    await waitFor(() => expect(api.cancelCashHandover).toHaveBeenCalledWith('h1'));
  });

  it('a receiver confirms „Sain kätte” or says „Ei saanud” with a note', async () => {
    const api = {
      cashMine: vi.fn().mockResolvedValue(box({ incoming: [{ id: 'h5', fromName: 'Mari', amountCents: 5000, handedAt: '2026-11-11', status: 'pending', itemCount: 2 }] })),
      answerCashHandover: vi.fn().mockResolvedValue({ status: 'active' }),
    };
    renderAt(<MyCashPage api={api} />, { uid: 'oleksiy', displayName: 'Oleksiy', roles: ['teacher'] });
    const card = await screen.findByRole('region', { name: 'Ootab sinu kinnitust' });
    expect(within(card).getByText('Mari andis sulle 50,00 €')).toBeInTheDocument();
    fireEvent.click(within(card).getByRole('button', { name: /Ei saanud/ }));
    expect(within(card).getByRole('button', { name: 'Saada' })).toBeDisabled();
    fireEvent.change(within(card).getByLabelText('Mis juhtus?'), { target: { value: 'sain 40 €' } });
    fireEvent.click(within(card).getByRole('button', { name: 'Saada' }));
    await waitFor(() => expect(api.answerCashHandover).toHaveBeenCalledWith('h5', 'reject', 'sain 40 €'));
  });

  it('the admin’s Kassa: pending hand-overs for them, their own cash, receivers’ setting, a teacher who left', async () => {
    const api = {
      cashSummary: vi.fn().mockResolvedValue({ isAdmin: true, entries: [], balances: [{ uid: 'mari', name: 'Mari', cents: 5000, pendingOutCents: 5000 }, { uid: 'gone', name: 'Kadunud', cents: 1000, inactive: true }], people: [] }),
      cashMine: vi.fn().mockResolvedValue(box({ incoming: [{ id: 'h5', fromName: 'Mari', amountCents: 5000, handedAt: '2026-11-11', status: 'pending' }], receivers: [{ uid: 'oleksiy', name: 'Oleksiy Skoryk' }] })),
      cashReceiverSettings: vi.fn().mockResolvedValue({ saved: false, receivers: [{ uid: 'pavel', name: 'Pavel Zakutailo' }, { uid: 'oleksiy', name: 'Oleksiy Skoryk' }], people: [{ uid: 'pavel', name: 'Pavel Zakutailo' }, { uid: 'oleksiy', name: 'Oleksiy Skoryk' }, { uid: 'mari', name: 'Mari' }] }),
      answerCashHandover: vi.fn().mockResolvedValue({ status: 'active' }),
    };
    renderAt(<CashPage api={api} studentApi={{ list: vi.fn().mockResolvedValue({ items: [] }) }} />, { uid: 'pavel', displayName: 'Pavel', roles: ['admin'] }, '/kassa');
    const card = await screen.findByRole('region', { name: 'Ootab sinu kinnitust' });
    expect(screen.getByRole('region', { name: 'Minu käes olev sularaha' })).toBeInTheDocument();
    const held = screen.getByRole('region', { name: 'Õpetajate käes sularaha' });
    expect(within(held).getByText('50,00 € ootab kinnitust')).toBeInTheDocument();
    expect(within(held).getAllByRole('button', { name: /Sain kätte/ })).toHaveLength(1); // Mari's money all waits for a receiver
    expect(within(held).getByText('lahkunud')).toBeInTheDocument();
    const receivers = await screen.findByRole('region', { name: 'Kassa vastuvõtjad' });
    expect(within(receivers).getByText('Oleksiy Skoryk')).toBeInTheDocument();
    fireEvent.click(within(card).getByRole('button', { name: /Sain kätte/ }));
    await waitFor(() => expect(api.answerCashHandover).toHaveBeenCalledWith('h5', 'confirm', ''));
  });

  it('the dashboard line: amount on hand and „Anna üle”; nothing without cash', async () => {
    const entries = [{ id: 'r1', type: 'receipt', holderUid: 'mari', amountCents: 5000, status: 'open' }];
    renderAt(<CashOnHandLine uid="mari" service={{ ownEntries: vi.fn().mockResolvedValue(entries) }} />, teacher, '/');
    expect(await screen.findByText(/Sinu käes sularaha:/)).toHaveTextContent('50,00 €');
    expect(screen.getByRole('link', { name: 'Anna üle' })).toHaveAttribute('href', '/kassa/minu?anna=1');
  });

  it('model: totals from own entries, chosen amount, entry line, bell item', () => {
    const entries = [
      { id: 'r1', type: 'receipt', holderUid: 'mari', amountCents: 5000, status: 'open' },
      { id: 'h1', type: 'handover', fromUid: 'mari', toUid: 'pavel', amountCents: 2000, status: 'active' },
      { id: 'h2', type: 'handover', fromUid: 'mari', toUid: 'pavel', amountCents: 1000, status: 'pending' },
      { id: 'h3', type: 'handover', fromUid: 'mari', toUid: 'pavel', amountCents: 900, status: 'rejected' },
      { id: 'h4', type: 'handover', fromUid: 'kati', toUid: 'mari', amountCents: 700, status: 'pending' },
    ];
    expect(myCashTotals(entries, 'mari')).toEqual({ onHandCents: 3000, pendingOutCents: 1000, availableCents: 2000, pendingIn: 1, ever: true });
    expect(myCashTotals([], 'mari').ever).toBe(false);
    expect(chosenCents(items, null, 5000)).toBe(5000);
    expect(chosenCents(items, new Set(['r2']), 5000)).toBe(2500);
    expect(chosenCents(items, new Set(), 5000)).toBe(0);
    expect(itemLine({ type: 'handover', fromName: 'Mari' })).toBe('Mari andis üle');
    const [bell] = cashHandoverNotifications([{ id: 'h4', fromName: 'Kati', amountCents: 700, status: 'pending', handedAt: '2026-11-11' }], { isAdmin: true });
    expect(bell).toMatchObject({ category: 'cash', to: '/kassa' });
    expect(bell.title).toMatch(/^Kati andis sulle sularaha 7,00\s€$/);
    expect(cashHandoverNotifications([{ id: 'h5', status: 'active' }])).toEqual([]);
  });
});

// „Sain sularaha” (owner 2026-11-26): the teacher records cash they got; off the books, no lesson balance change
describe('Minu kassa — „Sain sularaha”', () => {
  const ownStudents = { items: [{ id: 's1', name: 'Mari Tamm', parentName: 'Kati Tamm', active: true }, { id: 's2', name: 'Jaan Kask', active: true }] };
  const teacherItem = { id: 'c1', type: 'receipt', source: 'teacher', offBooks: true, date: '2026-11-26', receivedAt: '2026-11-26', studentId: 's1', studentName: 'Mari Tamm', payerName: 'Kati Tamm', purpose: 'lessons', lessons: 4, note: 'detsembri tunnid', amountCents: 10000, remainingCents: 10000, canEdit: true, ownEntry: true };

  it('the page has the standard padding (page-content) and both buttons', async () => {
    const { container } = renderAt(<MyCashPage api={{ cashMine: vi.fn().mockResolvedValue(box()) }} studentApi={{ list: vi.fn() }} />);
    expect(await screen.findByRole('button', { name: /Sain sularaha/ })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Andsin raha üle/ })).toBeInTheDocument();
    expect(container.querySelector('.page-content.my-cash')).not.toBeNull();
  });

  it('records cash from an own student: search, amount, today, lessons; saves once and reloads', async () => {
    const api = { cashMine: vi.fn().mockResolvedValue(box({ ever: false, items: [], onHandCents: 0, availableCents: 0 })), recordTeacherCash: vi.fn().mockResolvedValue({ entry: { id: 'c1' } }) };
    const studentApi = { list: vi.fn().mockResolvedValue(ownStudents) };
    renderAt(<MyCashPage api={api} studentApi={studentApi} />);
    fireEvent.click(await screen.findByRole('button', { name: /Sain sularaha/ }));
    expect(studentApi.list).toHaveBeenCalledWith(expect.objectContaining({ scopeTeacherUid: 'mari', status: 'active' }));
    const dialog = screen.getByRole('dialog', { name: 'Sain sularaha' });
    const today = todayIso();
    const day = within(dialog).getByLabelText('Kuupäev');
    expect(day).toHaveValue(today);
    expect(day).toHaveAttribute('max', today);
    expect(day).toHaveAttribute('min', teacherCashDayRange(today).min);
    const who = within(dialog).getByRole('combobox', { name: 'Kellelt?' });
    fireEvent.focus(who);
    await waitFor(() => expect(within(dialog).getAllByRole('option')).toHaveLength(3)); // 2 students + „Muu maksja”
    fireEvent.change(who, { target: { value: 'tamm' } });
    const options = within(dialog).getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual(['Mari TammKati Tamm', 'Muu maksjant lapsevanem, kellel pole kaarti']);
    fireEvent.mouseDown(options[0]);
    expect(who).toHaveValue('Mari Tamm');
    fireEvent.change(within(dialog).getByLabelText('Summa €'), { target: { value: '100' } });
    fireEvent.change(within(dialog).getByLabelText('Mitu tundi? (valikuline)'), { target: { value: '4' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(api.recordTeacherCash).toHaveBeenCalledTimes(1));
    expect(api.recordTeacherCash).toHaveBeenCalledWith(expect.objectContaining({ studentId: 's1', amount: '100.00', receivedAt: today, purpose: 'lessons', lessons: 4, note: '', requestId: expect.stringMatching(/^cash_teacher-/) }));
    expect(await screen.findByText('100,00 € (Mari Tamm) on sinu kassas.')).toBeInTheDocument();
    expect(api.cashMine).toHaveBeenCalledTimes(2);
  });

  it('„Muu maksja” needs a name; „Muu” sends no lesson count; a future or too old day is refused before the server', async () => {
    const api = { cashMine: vi.fn().mockResolvedValue(box()), recordTeacherCash: vi.fn().mockResolvedValue({}) };
    renderAt(<MyCashPage api={api} studentApi={{ list: vi.fn().mockResolvedValue(ownStudents) }} />);
    fireEvent.click(await screen.findByRole('button', { name: /Sain sularaha/ }));
    const dialog = screen.getByRole('dialog', { name: 'Sain sularaha' });
    const who = within(dialog).getByRole('combobox', { name: 'Kellelt?' });
    fireEvent.focus(who);
    fireEvent.mouseDown(await within(dialog).findByRole('option', { name: /Muu maksja/ }));
    fireEvent.change(within(dialog).getByLabelText('Summa €'), { target: { value: '12,50' } });
    fireEvent.click(within(dialog).getByLabelText('Muu'));
    expect(within(dialog).queryByLabelText('Mitu tundi? (valikuline)')).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Vali, kellelt raha said.');
    fireEvent.change(within(dialog).getByLabelText('Maksja nimi'), { target: { value: 'Kati Tamm' } });
    fireEvent.change(within(dialog).getByLabelText('Kuupäev'), { target: { value: '2999-01-01' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta' }));
    expect(within(dialog).getByRole('alert')).toHaveTextContent(/Kuupäev võib olla/);
    fireEvent.change(within(dialog).getByLabelText('Kuupäev'), { target: { value: teacherCashDayRange(todayIso()).min } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(api.recordTeacherCash).toHaveBeenCalledWith(expect.objectContaining({ studentId: null, payerName: 'Kati Tamm', amount: '12.50', purpose: 'other', lessons: null })));
  });

  it('the list line: „Mari Tamm · 4 tundi · sularaha” with „lisasid ise”; edit and cancel while not handed over', async () => {
    const api = {
      cashMine: vi.fn().mockResolvedValue(box({ items: [teacherItem, { ...teacherItem, id: 'c0', canEdit: false, studentName: '', studentId: null, payerName: 'Naaber', purpose: 'other', lessons: null, note: '' }, ...items] })),
      editTeacherCash: vi.fn().mockResolvedValue({}),
      voidTeacherCash: vi.fn().mockResolvedValue({}),
    };
    renderAt(<MyCashPage api={api} studentApi={{ list: vi.fn().mockResolvedValue(ownStudents) }} />);
    const list = await screen.findByRole('region', { name: 'Käes, üle andmata' });
    expect(within(list).getByText('Mari Tamm · 4 tundi · sularaha')).toBeInTheDocument();
    expect(within(list).getByText('Naaber (muu maksja) · sularaha')).toBeInTheDocument();
    expect(within(list).getAllByText('lisasid ise')).toHaveLength(2);
    expect(within(list).getByText(/detsembri tunnid/)).toBeInTheDocument();
    // only the entry not handed over yet can be changed by the teacher
    expect(within(list).getAllByRole('button', { name: /Paranda kirjet/ })).toHaveLength(1);
    fireEvent.click(within(list).getByRole('button', { name: 'Paranda kirjet: Mari Tamm · 4 tundi · sularaha' }));
    const dialog = screen.getByRole('dialog', { name: 'Paranda sularaha kirjet' });
    expect(within(dialog).getByRole('combobox', { name: 'Kellelt?' })).toHaveValue('Mari Tamm');
    expect(within(dialog).getByLabelText('Summa €')).toHaveValue('100,00');
    expect(within(dialog).getByLabelText('Mitu tundi? (valikuline)')).toHaveValue('4');
    fireEvent.change(within(dialog).getByLabelText('Mitu tundi? (valikuline)'), { target: { value: '5' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Salvesta' }));
    await waitFor(() => expect(api.editTeacherCash).toHaveBeenCalledWith('c1', expect.objectContaining({ studentId: 's1', amount: '100.00', lessons: 5, receivedAt: '2026-11-26' })));
    expect(await screen.findByText('Kirje on parandatud.')).toBeInTheDocument();
    const prompt = vi.spyOn(globalThis, 'prompt').mockReturnValue('vale summa');
    fireEvent.click(within(list).getByRole('button', { name: /Paranda kirjet: Mari/ }));
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Paranda sularaha kirjet' })).getByRole('button', { name: 'Tühista kirje' }));
    await waitFor(() => expect(api.voidTeacherCash).toHaveBeenCalledWith('c1', 'vale summa'));
    prompt.mockRestore();
  });

  it('a lesson-cash line and the itemLine helper stay as before', () => {
    expect(itemLine(items[0])).toBe('Mia Tamm · tund 10.11 kell 16:00 · Eesti keel');
    expect(itemLine({ ...teacherItem, lessons: 1 })).toBe('Mari Tamm · 1 tund · sularaha');
    expect(itemLine({ ...teacherItem, lessons: null })).toBe('Mari Tamm · sularaha');
    expect(matchStudents(ownStudents.items, 'kati').map((student) => student.id)).toEqual(['s1']);
  });
});
