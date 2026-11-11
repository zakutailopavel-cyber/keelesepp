import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext } from '../../app/AuthContext.jsx';
import CashPage from './CashPage.jsx';
import MyCashPage from './MyCashPage.jsx';
import CashOnHandLine from './CashOnHandLine.jsx';
import { cashHandoverNotifications } from '../notifications/notificationModel.js';
import { chosenCents, itemLine, myCashTotals } from './myCashModel.js';

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
