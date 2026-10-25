import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import MissingDataPanel from './MissingDataPanel.jsx';
import { filterRows, itemCounts } from './missingDataModel.js';
import { missingDataNotifications } from '../notifications/notificationModel.js';
import StudentsPage from '../students/StudentsPage.jsx';

const admin = { uid: 'adm', displayName: 'Boss', roles: ['admin'] };
const rows = [
  { studentId: 'a', name: 'Aadu', teacher: 'Liis', kind: 'adult', missing: ['phone'], required: [], account: 'student', wouldSee: false },
  { studentId: 'b', name: 'Bert', teacher: 'Mart', kind: 'child', missing: ['availability', 'grade'], required: ['availability', 'grade'], account: 'parent', wouldSee: true },
  { studentId: 'c', name: 'Cärolin', teacher: 'Liis', kind: 'unknown', missing: ['availability', 'email'], required: ['availability', 'email'], account: 'none', wouldSee: false },
  { studentId: 'd', name: 'Doris', teacher: 'Liis', kind: 'adult', missing: [], required: [], account: 'student', wouldSee: false },
];
const report = {
  settings: { availability: 'required', email: 'required', phone: 'optional', parentName: 'off', language: 'required', grade: 'required' },
  totals: { cards: 4, withMissing: 3, wouldSee: 1, missingWithoutAccount: 1 },
  rows,
};
const submission = { id: 'sub1', byUid: 'p1', byName: 'Ema Tamm', byRole: 'parent', at: '2026-10-25T10:00:00.000Z', studentIds: ['b'], studentNames: ['Bert'], changes: [{ target: 'student', id: 'b', field: 'grade', before: '', after: '5. klass' }, { target: 'profile', id: 'p1', field: 'preferredLanguage', before: '', after: 'ru' }], reviewedAt: '' };
const serviceWith = (extra = {}) => ({ report: vi.fn().mockResolvedValue(report), listUnreviewed: vi.fn().mockResolvedValue([submission]), markReviewed: vi.fn().mockResolvedValue({}), ...extra });

describe('„Puuduvad andmed” for the administrator', () => {
  it('filters by item, account and name; counts per item', () => {
    expect(filterRows(rows).map((row) => row.studentId)).toEqual(['a', 'b', 'c']);
    expect(filterRows(rows, { item: 'availability' }).map((row) => row.studentId)).toEqual(['b', 'c']);
    expect(filterRows(rows, { account: 'none' }).map((row) => row.studentId)).toEqual(['c']);
    expect(filterRows(rows, { account: 'any' }).map((row) => row.studentId)).toEqual(['a', 'b']);
    expect(filterRows(rows, { search: 'mart' }).map((row) => row.studentId)).toEqual(['b']);
    expect(itemCounts(rows).availability).toBe(2);
  });

  it('a filling shows in the bell until it is marked seen', () => {
    const [item] = missingDataNotifications([submission, { ...submission, id: 'old', reviewedAt: '2026-10-25T11:00:00Z' }]);
    expect(item).toMatchObject({ id: 'missing-data:sub1', title: 'Bert täitis puuduvad andmed', detail: 'klass, keel', meta: 'Ema Tamm (lapsevanem)', to: '/students?puuduvad=1&taidetud=sub1' });
    expect(missingDataNotifications([{ ...submission, reviewedAt: 'x' }])).toEqual([]);
  });

  it('lists the cards with what they miss, the account and the /ajad link for cards without one', async () => {
    const service = serviceWith();
    render(<MemoryRouter><MissingDataPanel open user={admin} service={service} focusSubmission="sub1" onClose={() => {}} /></MemoryRouter>);
    expect(await screen.findByText(/sisselogimisel näeks vormi 1/)).toBeInTheDocument();
    const list = screen.getByRole('list', { name: 'Kaardid' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    const bert = within(list).getByText('Bert').closest('li');
    expect(within(bert).getByText(/Lapsevanema konto · küsitakse sisselogimisel/)).toBeInTheDocument();
    expect(within(bert).getByRole('link', { name: /Ava kaart/ })).toHaveAttribute('href', '/students/b');
    expect(within(bert).queryByRole('button', { name: /ajad link/ })).toBeNull();
    const carolin = within(list).getByText('Cärolin').closest('li');
    expect(within(carolin).getByRole('button', { name: /Kopeeri \/ajad link/ })).toBeInTheDocument();
    // „Lapsevanema nimi” is off in Seaded: no chip
    expect(screen.queryByRole('button', { name: /Lapsevanema nimi/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Sobivad ajad/ }));
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
    fireEvent.change(screen.getByLabelText('Konto'), { target: { value: 'none' } });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);

    // the latest filling: before → after, marked seen
    const filled = screen.getByRole('region', { name: 'Uued täitmised' });
    expect(filled.querySelector('li.is-focus')).not.toBeNull();
    expect(within(filled).getByText(/klass: 5\. klass/)).toBeInTheDocument();
    expect(within(filled).getByText(/lapsevanema profiil: keel: vene/)).toBeInTheDocument();
    await act(async () => { fireEvent.click(within(filled).getByRole('button', { name: /Vaadatud/ })); });
    expect(service.markReviewed).toHaveBeenCalledWith('sub1', admin);
    expect(screen.queryByRole('region', { name: 'Uued täitmised' })).toBeNull();
  });

  it('says so when the server is not reachable', async () => {
    render(<MemoryRouter><MissingDataPanel open user={admin} service={serviceWith({ report: vi.fn().mockRejectedValue(new Error('Administrator access required')) })} onClose={() => {}} /></MemoryRouter>);
    expect(await screen.findByRole('alert')).toHaveTextContent('Administrator access required');
  });

  it('Õpilased opens it from the button and from ?puuduvad=1; teachers do not see it', async () => {
    const students = { list: vi.fn().mockResolvedValue({ items: [], cursor: null, hasMore: false }) };
    const service = serviceWith();
    const view = render(<MemoryRouter initialEntries={['/students?puuduvad=1&taidetud=sub1']}><StudentsPage service={students} actor={admin} teacherApi={{ list: vi.fn().mockResolvedValue([]) }} presenceApi={{ list: vi.fn().mockResolvedValue([]) }} missingDataApi={service} /></MemoryRouter>);
    expect(await screen.findByRole('dialog', { name: 'Puuduvad andmed' })).toBeInTheDocument();
    view.unmount();
    render(<MemoryRouter initialEntries={['/students']}><StudentsPage service={students} actor={{ uid: 't', displayName: 'Liis', roles: ['teacher'] }} teacherApi={{ list: vi.fn().mockResolvedValue([]) }} presenceApi={{ list: vi.fn().mockResolvedValue([]) }} missingDataApi={service} /></MemoryRouter>);
    expect(screen.queryByRole('button', { name: /Puuduvad andmed/ })).toBeNull();
  });
});
