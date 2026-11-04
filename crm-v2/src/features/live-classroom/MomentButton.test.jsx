import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import MomentButton from './MomentButton.jsx';

const invitation = { id: 'inv-1', studentId: 's1', teacherUid: 't1' };
const user = { uid: 't1', displayName: 'Kati' };
const fakeService = () => ({
  add: vi.fn(async (record) => ({ id: 'm1', ...record })),
  setLabel: vi.fn(async () => 'x'),
  remove: vi.fn(async () => {}),
});

describe('MomentButton', () => {
  it('a click saves the moment at once with its place in the recording; a label is optional', async () => {
    const service = fakeService();
    render(<MomentButton invitation={invitation} user={user} recording={{ id: 'inv-1_1', t0: Date.now() - 65000 }} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Hetk/ }));
    await waitFor(() => expect(service.add).toHaveBeenCalledTimes(1));
    const record = service.add.mock.calls[0][0];
    expect(record).toMatchObject({ invitationId: 'inv-1', recordingId: 'inv-1_1', teacherUid: 't1', studentId: 's1', label: '', byUid: 't1' });
    expect(record.atMs).toBeGreaterThanOrEqual(65000);
    expect(await screen.findByText(/Hetk 1:0\d salvestatud/)).toBeInTheDocument();
    const input = screen.getByRole('textbox', { name: /märksõna/ });
    fireEvent.change(input, { target: { value: 'vaata üle' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(service.setLabel).toHaveBeenCalledWith('m1', 'vaata üle'));
    await waitFor(() => expect(screen.queryByText(/salvestatud/)).toBeNull());
  });

  it('the key B marks a moment, but not while typing; without a recording only the clock time', async () => {
    const service = fakeService();
    render(<><input aria-label="muu" /><MomentButton invitation={invitation} user={user} service={service} /></>);
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'muu' }), { key: 'b' });
    expect(service.add).not.toHaveBeenCalled();
    act(() => { fireEvent.keyDown(document.body, { key: 'b' }); });
    await waitFor(() => expect(service.add).toHaveBeenCalledTimes(1));
    expect(service.add.mock.calls[0][0]).toMatchObject({ recordingId: '', atMs: null });
  });

  it('a wrong press can be deleted; a failed save is said', async () => {
    const service = fakeService();
    render(<MomentButton invitation={invitation} user={user} service={service} />);
    fireEvent.click(screen.getByRole('button', { name: /Hetk/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'Kustuta hetk' }));
    await waitFor(() => expect(service.remove).toHaveBeenCalledWith('m1'));
    service.add.mockRejectedValueOnce(new Error('permission denied'));
    fireEvent.click(screen.getByRole('button', { name: /Hetk/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('permission denied');
  });
});
