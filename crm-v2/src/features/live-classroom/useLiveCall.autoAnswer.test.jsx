import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useLiveCall } from './useLiveCall.js';

const track = (kind) => ({ kind, enabled: true, stop: vi.fn(), getSettings: () => ({}) });
const streamOf = (...tracks) => ({ getTracks: () => tracks, getAudioTracks: () => tracks.filter((t) => t.kind === 'audio'), getVideoTracks: () => tracks.filter((t) => t.kind === 'video') });
function makePeer() {
  return {
    connectionState: 'new', addTrack: vi.fn(), getSenders: () => [], createDataChannel: undefined,
    setRemoteDescription: vi.fn().mockResolvedValue(undefined),
    createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'y' }),
    setLocalDescription: vi.fn().mockResolvedValue(undefined),
    addIceCandidate: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  };
}
function setup(autoAnswer) {
  let push = null;
  const signalService = { subscribe: vi.fn((id, onSignal) => { push = onSignal; return vi.fn(); }), send: vi.fn().mockResolvedValue(undefined) };
  const mediaDevices = { getUserMedia: vi.fn(async () => streamOf(track('audio'), track('video'))), enumerateDevices: vi.fn().mockResolvedValue([]), addEventListener: vi.fn(), removeEventListener: vi.fn() };
  const options = {
    invitation: { id: 'inv-1', teacherName: 'Kati', studentName: 'Mari', status: 'accepted' }, role: 'student', user: { uid: 's1' },
    peerFactory: () => makePeer(), signalService, mediaDevices, turnService: null, autoAnswer,
    presenceService: { heartbeat: vi.fn().mockResolvedValue(), markOffline: vi.fn().mockResolvedValue(), subscribe: vi.fn(() => vi.fn()) },
  };
  const hook = renderHook(() => useLiveCall(options));
  const offer = (id) => act(async () => { push({ id, type: 'offer', senderUid: 't1', sessionId: `sess-${id}`, payload: JSON.stringify({ type: 'offer', sdp: 'x' }) }); });
  return { ...hook, signalService, mediaDevices, offer };
}

describe('useLiveCall student auto-answer', () => {
  it('joins the call by itself when the teacher starts it: one „Liitu tunniga” is enough', async () => {
    const { result, signalService, mediaDevices, offer } = setup(true);
    expect(result.current.manualJoin).toBe(false);
    await offer('o1');
    await waitFor(() => expect(signalService.send).toHaveBeenCalledWith('inv-1', expect.objectContaining({ type: 'answer' })));
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
    expect(result.current.hasLocalMedia).toBe(true);
  });

  it('after the student hangs up, a new offer waits for the manual button', async () => {
    const { result, mediaDevices, offer } = setup(true);
    await offer('o1');
    await waitFor(() => expect(result.current.hasLocalMedia).toBe(true));
    await act(async () => { await result.current.hangUp(); });
    expect(result.current.manualJoin).toBe(true);
    await offer('o2');
    expect(mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('without autoAnswer the student still presses the button', async () => {
    const { result, mediaDevices, offer } = setup(false);
    expect(result.current.manualJoin).toBe(true);
    await offer('o1');
    expect(mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });
});
