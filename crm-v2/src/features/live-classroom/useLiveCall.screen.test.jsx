import { act, renderHook } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { useLiveCall } from './useLiveCall.js';

// a connection with the transceiver API: the camera on its own track, the shared screen on the second video slot
const track = (kind, id = kind) => ({ id, kind, enabled: true, contentHint: '', muted: true, readyState: 'live', stop: vi.fn(), getSettings: () => ({}), listeners: {},
  addEventListener(type, fn) { this.listeners[type] = fn; } });
const streamOf = (...tracks) => ({ getTracks: () => tracks, getAudioTracks: () => tracks.filter((t) => t.kind === 'audio'), getVideoTracks: () => tracks.filter((t) => t.kind === 'video') });
const sender = (initial) => ({ track: initial, replaceTrack: vi.fn(function replaceTrack(next) { this.track = next; return Promise.resolve(); }) });
function makePeer() {
  const transceivers = [];
  const add = (kind, item, direction) => {
    const entry = { direction, sender: sender(item), receiver: { track: track(kind, `remote-${kind}-${transceivers.length}`) } };
    transceivers.push(entry);
    return entry;
  };
  const channel = { label: 'room', readyState: 'connecting', send: vi.fn(), close: vi.fn() };
  return {
    connectionState: 'new', transceivers, channel,
    addTrack: vi.fn((item) => add(item.kind, item, 'sendrecv').sender),
    addTransceiver: vi.fn((what, options) => add(typeof what === 'string' ? what : what.kind, typeof what === 'string' ? null : what, options.direction)),
    getTransceivers: () => transceivers,
    getSenders: () => transceivers.map((item) => item.sender),
    createDataChannel: vi.fn(() => channel),
    createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'o' }),
    createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'a' }),
    setLocalDescription: vi.fn().mockResolvedValue(undefined),
    setRemoteDescription: vi.fn(function setRemoteDescription(value) {
      this.remoteDescription = value;
      // the answering side: the offer's audio, camera and screen slot become transceivers (own camera reused)
      if (!this.transceivers.some((item) => item.receiver.track.kind === 'audio')) add('audio', null, 'recvonly');
      while (this.transceivers.filter((item) => item.receiver.track.kind === 'video').length < 2) add('video', null, 'recvonly');
      return Promise.resolve();
    }),
    addIceCandidate: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  };
}
const invitation = { id: 'inv-1', teacherName: 'Kati', studentName: 'Mari', status: 'accepted' };
const signals = () => {
  const state = { onSignal: null };
  return { state, service: { subscribe: vi.fn((id, onSignal) => { state.onSignal = onSignal; return vi.fn(); }), send: vi.fn().mockResolvedValue(undefined) } };
};
const services = (signalService, screenTrack) => ({
  signalService,
  presenceService: { heartbeat: vi.fn().mockResolvedValue(), markOffline: vi.fn().mockResolvedValue(), subscribe: vi.fn(() => vi.fn()) },
  turnService: null,
  mediaDevices: {
    getUserMedia: vi.fn(async () => streamOf(track('audio', 'mic'), track('video', 'cam'))),
    getDisplayMedia: vi.fn(async () => streamOf(screenTrack)),
    enumerateDevices: vi.fn().mockResolvedValue([]), addEventListener: vi.fn(), removeEventListener: vi.fn(),
  },
});
// options built once: a new mediaDevices or service object on every render would restart the hook's effects
const renderOnce = (options) => renderHook(() => useLiveCall(options));
const sent = (peer) => peer.channel.send.mock.calls.map(([data]) => JSON.parse(data));

beforeEach(() => {
  globalThis.localStorage.clear();
  globalThis.MediaStream = class { constructor(tracks = []) { this.tracks = tracks; } getTracks() { return this.tracks; } getVideoTracks() { return this.tracks.filter((t) => t.kind === 'video'); } getAudioTracks() { return this.tracks.filter((t) => t.kind === 'audio'); } addTrack(t) { this.tracks.push(t); } };
});

describe('useLiveCall: the screen goes on its own slot', () => {
  it('the teacher offers camera + screen slot, shares on the slot, keeps the camera and announces it', async () => {
    const peer = makePeer();
    const screen = track('video', 'screen');
    const { service } = signals();
    const { result } = renderOnce({ invitation, role: 'teacher', user: { uid: 't1' }, peerFactory: () => peer, ...services(service, screen) });
    await act(async () => { await result.current.startTeacherCall(); });
    expect(peer.addTransceiver).toHaveBeenCalledWith('video', { direction: 'sendrecv' });
    const [, camera, slot] = peer.transceivers;
    expect(camera.sender.track.id).toBe('cam');
    act(() => { peer.channel.readyState = 'open'; peer.channel.onopen(); });
    expect(sent(peer).at(-1)).toEqual({ t: 'screen', on: false, slot: true });

    await act(async () => { await result.current.startScreenShare(); });
    expect(slot.sender.track).toBe(screen);
    expect(camera.sender.track.id).toBe('cam');
    expect(screen.contentHint).toBe('detail');
    expect(result.current.screenSharing).toBe(true);
    expect(sent(peer).at(-1)).toEqual({ t: 'screen', on: true, slot: true });

    await act(async () => { await result.current.stopScreenShare(); });
    expect(slot.sender.replaceTrack).toHaveBeenLastCalledWith(null);
    expect(camera.sender.track.id).toBe('cam');
    expect(screen.stop).toHaveBeenCalled();
    expect(sent(peer).at(-1)).toEqual({ t: 'screen', on: false, slot: true });
  });

  it('the camera can be changed while the screen is shared on the slot', async () => {
    const peer = makePeer();
    const screen = track('video', 'screen');
    const { service } = signals();
    const options = services(service, screen);
    options.mediaDevices.getUserMedia = vi.fn()
      .mockResolvedValueOnce(streamOf(track('audio', 'mic'), track('video', 'cam')))
      .mockResolvedValueOnce(streamOf(track('video', 'cam-2')));
    const { result } = renderOnce({ invitation, role: 'teacher', user: { uid: 't1' }, peerFactory: () => peer, ...options });
    await act(async () => { await result.current.startTeacherCall(); });
    await act(async () => { await result.current.startScreenShare(); });
    await act(async () => { await result.current.switchDevice('video', 'cam-2'); });
    expect(peer.transceivers[1].sender.track.id).toBe('cam-2');
    expect(peer.transceivers[2].sender.track).toBe(screen);
  });

  it('the student answers the slot as sendrecv, sees an announced share and can share back', async () => {
    const peer = makePeer();
    const screen = track('video', 'student-screen');
    const { state, service } = signals();
    const { result } = renderOnce({ invitation, role: 'student', autoAnswer: true, user: { uid: 's1' }, peerFactory: () => peer, ...services(service, screen) });
    await act(async () => {
      state.onSignal({ id: 'o1', type: 'offer', sessionId: 'sess-1', senderUid: 't1', senderRole: 'teacher', payload: JSON.stringify({ type: 'offer', sdp: 'o' }) });
      await new Promise((resolve) => { globalThis.setTimeout(resolve, 0); });
    });
    await vi.waitFor(() => expect(peer.createAnswer).toHaveBeenCalled());
    const videos = peer.transceivers.filter((item) => item.receiver.track.kind === 'video');
    expect(videos).toHaveLength(2);
    expect(videos[0].sender.track.id).toBe('cam');
    expect(videos[1].direction).toBe('sendrecv');

    // the teacher's slot track arrives (muted until frames come), then the announcement over the channel
    const slotTrack = videos[1].receiver.track;
    act(() => { peer.ontrack({ track: slotTrack, transceiver: videos[1], streams: [] }); });
    expect(result.current.remoteScreen.active).toBe(false);
    act(() => { peer.ondatachannel({ channel: peer.channel }); peer.channel.readyState = 'open'; peer.channel.onopen(); });
    act(() => { peer.channel.onmessage({ data: JSON.stringify({ t: 'screen', on: true, slot: true }) }); });
    expect(result.current.remoteScreen.active).toBe(true);
    expect(result.current.remoteScreen.stream.getVideoTracks()).toEqual([slotTrack]);
    act(() => { peer.channel.onmessage({ data: JSON.stringify({ t: 'screen', on: false, slot: true }) }); });
    expect(result.current.remoteScreen.active).toBe(false);

    // without an announcement, frames on the slot count as a share
    act(() => { slotTrack.muted = false; slotTrack.listeners.unmute(); });
    expect(result.current.remoteScreen.active).toBe(false); // the last announcement (off) still decides

    await act(async () => { await result.current.startScreenShare(); });
    expect(videos[1].sender.track).toBe(screen);
    expect(videos[0].sender.track.id).toBe('cam');
  });

  it('frames on the slot show the share before any announcement', async () => {
    const peer = makePeer();
    const { state, service } = signals();
    const { result } = renderOnce({ invitation, role: 'student', autoAnswer: true, user: { uid: 's1' }, peerFactory: () => peer, ...services(service, track('video', 'x')) });
    await act(async () => {
      state.onSignal({ id: 'o1', type: 'offer', sessionId: 'sess-1', senderUid: 't1', senderRole: 'teacher', payload: JSON.stringify({ type: 'offer', sdp: 'o' }) });
      await new Promise((resolve) => { globalThis.setTimeout(resolve, 0); });
    });
    await vi.waitFor(() => expect(peer.createAnswer).toHaveBeenCalled());
    const slot = peer.transceivers.filter((item) => item.receiver.track.kind === 'video')[1];
    act(() => { peer.ontrack({ track: slot.receiver.track, transceiver: slot, streams: [] }); });
    expect(result.current.remoteScreen.active).toBe(false);
    act(() => { slot.receiver.track.muted = false; slot.receiver.track.listeners.unmute(); });
    expect(result.current.remoteScreen.active).toBe(true);
    act(() => { slot.receiver.track.muted = true; slot.receiver.track.listeners.mute(); });
    expect(result.current.remoteScreen.active).toBe(false);
  });
});
