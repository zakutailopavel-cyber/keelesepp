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
});
