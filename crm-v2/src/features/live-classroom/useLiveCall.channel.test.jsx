import { act, renderHook } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { useLiveCall } from './useLiveCall.js';

const track = (kind) => ({ kind, enabled: true, stop: vi.fn(), getSettings: () => ({}) });
const streamOf = (...tracks) => ({ getTracks: () => tracks, getAudioTracks: () => tracks.filter((t) => t.kind === 'audio'), getVideoTracks: () => tracks.filter((t) => t.kind === 'video') });
const makeChannel = (label) => ({ label, readyState: 'connecting', send: vi.fn(), close: vi.fn() });
function makePeer() {
  return {
    connectionState: 'new', channels: [],
    addTrack: vi.fn(), getSenders: () => [],
    createDataChannel: vi.fn(function createDataChannel(label) { const channel = makeChannel(label); this.channels.push(channel); return channel; }),
    createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'x' }),
    setLocalDescription: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  };
}
const invitation = { id: 'inv-1', teacherName: 'Kati', studentName: 'Mari', status: 'accepted' };
const services = () => ({
  signalService: { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) },
  presenceService: { heartbeat: vi.fn().mockResolvedValue(), markOffline: vi.fn().mockResolvedValue(), subscribe: vi.fn(() => vi.fn()) },
  turnService: null,
  mediaDevices: { getUserMedia: vi.fn(async () => streamOf(track('audio'), track('video'))), enumerateDevices: vi.fn().mockResolvedValue([]), addEventListener: vi.fn(), removeEventListener: vi.fn() },
});

beforeEach(() => {
  globalThis.localStorage.clear();
  globalThis.MediaStream = class { constructor(tracks) { return streamOf(...tracks); } };
});

describe('useLiveCall room channel', () => {
  it('the teacher opens a room channel with the offer and sends JSON once it is open', async () => {
    const peer = makePeer();
    const options = { invitation, role: 'teacher', user: { uid: 't1' }, peerFactory: () => peer, ...services() };
    const { result } = renderHook(() => useLiveCall(options));
    await act(async () => { await result.current.startTeacherCall(); });
    expect(result.current.error).toBe('');
    expect(peer.createDataChannel).toHaveBeenCalledWith('room');
    expect(peer.createDataChannel.mock.invocationCallOrder[0]).toBeLessThan(peer.createOffer.mock.invocationCallOrder[0]);
    const channel = peer.channels[0];
    expect(result.current.sendRoom({ t: 'page', pageId: 'p1' })).toBe(false);
    act(() => { channel.readyState = 'open'; channel.onopen(); });
    expect(result.current.roomChannelOpen).toBe(true);
    expect(result.current.sendRoom({ t: 'page', pageId: 'p1' })).toBe(true);
    expect(JSON.parse(channel.send.mock.calls[0][0])).toEqual({ t: 'page', pageId: 'p1' });

    const listener = vi.fn();
    act(() => { result.current.onRoomMessage(listener); });
    channel.onmessage({ data: '{"t":"ptr","x":1,"y":2}' });
    channel.onmessage({ data: 'not json' });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ t: 'ptr', x: 1, y: 2 });

    await act(async () => { await result.current.hangUp(); });
    expect(channel.close).toHaveBeenCalled();
    expect(result.current.roomChannelOpen).toBe(false);
  });

  it('a peer without data channels still calls', async () => {
    const peer = { ...makePeer(), createDataChannel: undefined };
    const options = { invitation, role: 'teacher', user: { uid: 't1' }, peerFactory: () => peer, ...services() };
    const { result } = renderHook(() => useLiveCall(options));
    await act(async () => { await result.current.startTeacherCall(); });
    expect(peer.createOffer).toHaveBeenCalled();
    expect(result.current.sendRoom({ t: 'page' })).toBe(false);
  });
});
