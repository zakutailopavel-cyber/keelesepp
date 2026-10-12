import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import RescheduleDialog from './RescheduleDialog.jsx';

describe('Ei saa tulla?', () => {
  it('sends up to three of the teacher\'s free times with a reason', async () => {
    const future = new Date(Date.now() + 5 * 86400000);
    const iso = (date) => date.toISOString().slice(0, 10);
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][future.getDay()];
    const lesson = { id: 'sch-1', occurrenceDate: iso(new Date(Date.now() + 10 * 86400000)), time: '16:00', duration: 60, teacherUid: 't1', teacher: 'Pavel', studentId: 's1' };
    const availabilityRepository = { get: vi.fn().mockResolvedValue({ slots: [{ kind: 'free', day, start: '15:00', end: '17:00' }] }) };
    const requests = { create: vi.fn(async (value) => ({ id: 'r1', ...value })) };
    const onSent = vi.fn();
    render(<RescheduleDialog lesson={lesson} student={{ id: 's1', name: 'Полина' }} user={{ uid: 'u1', displayName: 'Полина' }} availabilityRepository={availabilityRepository} requests={requests} onClose={vi.fn()} onSent={onSent} />);
    const slot = await screen.findAllByRole('button', { pressed: false });
    fireEvent.click(slot[0]);
    fireEvent.change(screen.getByLabelText('Põhjus (soovi korral)'), { target: { value: 'kunstikool' } });
    fireEvent.click(screen.getByRole('button', { name: 'Saada palve' }));
    await waitFor(() => expect(onSent).toHaveBeenCalled());
    expect(availabilityRepository.get).toHaveBeenCalledWith('t1');
    expect(requests.create.mock.calls[0][0]).toMatchObject({ scheduleId: 'sch-1', studentId: 's1', status: 'pending', reason: 'kunstikool' });
    expect(requests.create.mock.calls[0][0].proposals).toHaveLength(1);
  });

  it('asks for a time when none is chosen', async () => {
    const lesson = { id: 'sch-1', occurrenceDate: '2030-01-10', time: '16:00', teacherUid: 't1' };
    render(<RescheduleDialog lesson={lesson} student={{ id: 's1' }} user={{ uid: 'u1' }} availabilityRepository={{ get: vi.fn().mockResolvedValue(null) }} requests={{ create: vi.fn() }} onClose={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Saada palve' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Vali uus aeg');
  });
});
