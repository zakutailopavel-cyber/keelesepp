import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import AvailabilityCard from './AvailabilityCard.jsx';
import { availabilityNotifications } from '../notifications/notificationModel.js';

const student = { uid: 'u1', displayName: 'Mari', roles: ['student'] };
const admin = { uid: 'a', displayName: 'Admin', roles: ['admin'] };

describe('Sobivad ajad on the card', () => {
  it('the student marks the times and saves them', async () => {
    const service = { get: vi.fn().mockResolvedValue(null), save: vi.fn().mockResolvedValue({}), markReviewed: vi.fn() };
    render(<AvailabilityCard studentId="s1" user={student} service={service} />);
    fireEvent.click(await screen.findByRole('button', { name: /Märgi ajad/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Tööpäeva õhtud 17–21' }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'L 10:00' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta ajad' })); });
    const [studentId, payload, user] = service.save.mock.calls[0];
    expect(studentId).toBe('s1');
    expect(payload.slots).toContain('Mon-17:00');
    expect(payload.slots).toContain('Sat-10:30');
    expect(user).toBe(student);
  });

  it('the administrator sees a change, what it was before, and marks it reviewed', async () => {
    const saved = { studentId: 's1', slots: ['Tue-18:00', 'Tue-18:30'], preferred: [], previousSlots: ['Mon-17:00', 'Mon-17:30'], previousPreferred: [], changedAt: '2026-10-21T10:00:00.000Z', changedByName: 'Ema', changedByRole: 'parent', reviewedAt: '' };
    const service = { get: vi.fn().mockResolvedValue(saved), save: vi.fn(), markReviewed: vi.fn().mockResolvedValue({}) };
    render(<AvailabilityCard studentId="s1" user={admin} mode="admin" service={service} />);
    expect(await screen.findByText(/Muutunud/)).toBeInTheDocument();
    expect(screen.getByText('Teisipäev 18–19')).toBeInTheDocument();
    expect(screen.getByText('Esmaspäev 17–18')).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /Vaadatud/ })); });
    expect(service.markReviewed).toHaveBeenCalledWith('s1', admin);
    expect(availabilityNotifications([saved], new Map([['s1', 'Mari']]))).toEqual([expect.objectContaining({ title: 'Mari muutis sobivaid aegu', to: '/students/s1#sobivad-ajad' })]);
    expect(availabilityNotifications([{ ...saved, reviewedAt: '2026-10-21T11:00:00.000Z' }])).toEqual([]);
  });

  it('a teacher only reads', async () => {
    const service = { get: vi.fn().mockResolvedValue({ studentId: 's1', slots: ['Tue-18:00'], preferred: [], changedAt: '2026-10-21T10:00:00.000Z', changedByRole: 'student' }), save: vi.fn(), markReviewed: vi.fn() };
    render(<AvailabilityCard studentId="s1" user={{ uid: 't', roles: ['teacher'] }} mode="view" service={service} />);
    expect(await screen.findByText('Teisipäev 18–19')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Muuda/ })).toBeNull();
    expect(screen.queryByText(/Muutunud/)).toBeNull();
  });

  it('the student marks the times of one coming week only, and can go back to the usual week', async () => {
    const saved = { studentId: 's1', slots: ['Mon-17:00', 'Mon-17:30'], preferred: [], weeks: { '2026-11-09': { slots: ['Sat-10:00', 'Sat-10:30'], preferred: [] } }, changedAt: '2026-10-21T10:00:00.000Z', changedByRole: 'student' };
    const service = { get: vi.fn().mockResolvedValue(saved), save: vi.fn().mockResolvedValue({}), markReviewed: vi.fn() };
    render(<AvailabilityCard studentId="s1" user={student} service={service} today="2026-10-29" />);
    fireEvent.click(await screen.findByRole('button', { name: /Järgmine nädal 2\.11–8\.11/ }));
    expect(screen.getByText(/kehtib tavaline nädal/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Muuda/ }));
    fireEvent.pointerDown(screen.getByRole('button', { name: 'R 10:00' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta ajad' })); });
    expect(service.save.mock.calls[0][1]).toMatchObject({ week: '2026-11-02' });
    expect(service.save.mock.calls[0][1].slots).toContain('Fri-10:00');
    fireEvent.click(screen.getByRole('button', { name: /Nädal 9\.11–15\.11/ }));
    expect(screen.getByText('Laupäev 10–11')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Muuda/ }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Kasuta tavalist nädalat' })); });
    expect(service.save.mock.calls[1][1]).toMatchObject({ week: '2026-11-09', reset: true });
  });

  it('a learner of two courses says how many lessons a week each; the administrator reads it', async () => {
    const service = { get: vi.fn().mockResolvedValue(null), save: vi.fn().mockResolvedValue({}), markReviewed: vi.fn() };
    render(<AvailabilityCard studentId="s1" user={student} service={service} subjects={['Eesti keel', 'Matemaatika']} />);
    fireEvent.click(await screen.findByRole('button', { name: /Märgi ajad/ }));
    expect(screen.getByText(/Mitu korda nädalas soovid õppida\?/)).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Mitu korda nädalas: Eesti keel' }), { target: { value: '2' } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Mitu korda nädalas: Matemaatika' }), { target: { value: '1' } });
    fireEvent.pointerDown(screen.getByRole('button', { name: 'L 10:00' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Salvesta ajad' })); });
    expect(service.save.mock.calls[0][1].perWeek).toEqual({ 'eesti-keel': 2, matemaatika: 1 });

    const saved = { studentId: 's1', slots: ['Tue-18:00'], preferred: [], perWeek: { 'eesti-keel': 2, matemaatika: 1 }, changedAt: '2026-10-21T10:00:00.000Z', changedByRole: 'student', reviewedAt: '2026-10-22T10:00:00.000Z' };
    const adminService = { get: vi.fn().mockResolvedValue(saved), save: vi.fn(), markReviewed: vi.fn() };
    render(<AvailabilityCard studentId="s1" user={admin} mode="admin" service={adminService} subjects={['Eesti keel', 'Matemaatika']} />);
    expect(await screen.findByText('Eesti keel 2× · Matemaatika 1× nädalas')).toBeInTheDocument();
  });

  it('a card with one course has one field without a course name', async () => {
    const service = { get: vi.fn().mockResolvedValue({ studentId: 's1', slots: ['Tue-18:00'], preferred: [], perWeek: { 'eesti-keel': 3 }, changedAt: '2026-10-21T10:00:00.000Z', changedByRole: 'student' }), save: vi.fn().mockResolvedValue({}), markReviewed: vi.fn() };
    render(<AvailabilityCard studentId="s1" user={student} service={service} subjects={['Eesti keel']} />);
    expect(await screen.findByText('Eesti keel 3× nädalas')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Muuda/ }));
    expect(screen.getAllByRole('combobox')).toHaveLength(1);
    expect(screen.getByRole('combobox', { name: 'Mitu korda nädalas: Eesti keel' })).toHaveValue('3');
  });
});
