import { act, renderHook } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { useLiveCall } from './useLiveCall.js';

// clientErrors 2026-11-04/05: „Missing or insufficient permissions (set liveLessonInvitations/{id}/presence/{id})” —
// the rules take presence writes only while the invitation is 'accepted'; the room wrote after the lesson was closed.
const denied = () => Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' });

function setup({ status = 'accepted', heartbeat = vi.fn().mockResolvedValue() } = {}) {
  const presenceService = { heartbeat, markOffline: vi.fn().mockResolvedValue(true), subscribe: vi.fn(() => vi.fn()) };
  const props = { invitation: { id: 'inv-1', teacherName: 'Kati', studentName: 'Mari', status } };
  const hook = renderHook(({ invitation }) => useLiveCall({
    invitation, role: 'teacher', user: { uid: 't1' },
    peerFactory: () => ({}), signalService: { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue() },
    mediaDevices: { getUserMedia: vi.fn(), enumerateDevices: vi.fn().mockResolvedValue([]), addEventListener: vi.fn(), removeEventListener: vi.fn() },
    turnService: null, presenceService,
  }), { initialProps: props });
  return { ...hook, presenceService };
}

describe('room presence writes', () => {
  afterEach(() => { vi.useRealTimers(); });

  it('an open lesson: heartbeat, then offline on leaving', async () => {
    const { presenceService, unmount } = setup();
    await act(async () => {});
    expect(presenceService.heartbeat).toHaveBeenCalledWith('inv-1', expect.objectContaining({ uid: 't1', role: 'teacher' }));
    unmount();
    expect(presenceService.markOffline).toHaveBeenCalledTimes(1);
  });

  it('a closed lesson gets no presence writes at all', async () => {
    const { presenceService, unmount } = setup({ status: 'closed' });
    await act(async () => {});
    expect(presenceService.heartbeat).not.toHaveBeenCalled();
    unmount();
    expect(presenceService.markOffline).not.toHaveBeenCalled();
  });

  it('closed during the lesson: the next heartbeat and the offline mark are skipped', async () => {
    vi.useFakeTimers();
    const { presenceService, rerender, unmount } = setup();
    await act(async () => {});
    expect(presenceService.heartbeat).toHaveBeenCalledTimes(1);
    rerender({ invitation: { id: 'inv-1', teacherName: 'Kati', studentName: 'Mari', status: 'closed' } });
    await act(async () => { vi.advanceTimersByTime(45_000); });
    expect(presenceService.heartbeat).toHaveBeenCalledTimes(1);
    unmount();
    expect(presenceService.markOffline).not.toHaveBeenCalled();
  });

  it('a refused heartbeat stops the heartbeats without an error banner', async () => {
    vi.useFakeTimers();
    const heartbeat = vi.fn().mockRejectedValue(denied());
    const { result, presenceService, unmount } = setup({ heartbeat });
    await act(async () => {});
    await act(async () => { vi.advanceTimersByTime(65_000); });
    expect(heartbeat).toHaveBeenCalledTimes(1);
    expect(result.current.error || '').toBe('');
    unmount();
    expect(presenceService.markOffline).not.toHaveBeenCalled();
  });

  it('another failure (network) is still shown', async () => {
    const heartbeat = vi.fn().mockRejectedValue(new Error('Võrk katkes'));
    const { result } = setup({ heartbeat });
    await act(async () => {});
    expect(result.current.error).toBe('Võrk katkes');
  });
});
