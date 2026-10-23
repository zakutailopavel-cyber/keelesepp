import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ActiveLessonsMenu from './ActiveLessonsMenu.jsx';
import { liveObservers, OBSERVER_STALE_MS } from './useLessonObserver.js';
import { activeLessons, ACTIVE_LESSON_MAX_MS } from '../../services/firebase/liveLessonObservers.js';

const NOW = Date.parse('2026-10-14T15:00:00Z');
const iso = (msAgo) => new Date(NOW - msAgo).toISOString();

describe('administrator watching a lesson', () => {
  it('lists only rooms that are open now, newest first (a room nobody closed for hours is not a lesson)', () => {
    const items = activeLessons([
      { id: 'a', status: 'accepted', respondedAt: iso(10 * 60 * 1000) },
      { id: 'b', status: 'accepted', respondedAt: iso(60 * 1000) },
      { id: 'old', status: 'accepted', respondedAt: iso(ACTIVE_LESSON_MAX_MS + 1000) },
      { id: 'pending', status: 'pending', createdAt: iso(1000) },
      { id: 'closed', status: 'closed', respondedAt: iso(1000) },
    ], NOW);
    expect(items.map((item) => item.id)).toEqual(['b', 'a']);
  });

  it('the badge shows only an observer whose page is still open (a closed tab stops renewing)', () => {
    const items = liveObservers([
      { uid: 'on', active: true, lastSeenIso: iso(5000) },
      { uid: 'left', active: false, lastSeenIso: iso(5000) },
      { uid: 'closed-tab', active: true, lastSeenIso: iso(OBSERVER_STALE_MS + 1000) },
    ], NOW);
    expect(items.map((item) => item.uid)).toEqual(['on']);
  });

  it('the menu lists the lessons with „Vaata tundi”', () => {
    let push = () => {};
    const service = { subscribeAccepted: vi.fn((onChange) => { push = onChange; return vi.fn(); }) };
    render(<MemoryRouter><ActiveLessonsMenu service={service} /></MemoryRouter>);
    act(() => push([{ id: 'inv-1', status: 'accepted', teacherName: 'Liza', studentName: 'Emma', title: 'Inglise keel', respondedAt: new Date().toISOString() }]));
    fireEvent.click(screen.getByRole('button', { name: /Käimasolevad tunnid \(1\)/ }));
    expect(screen.getByText('Liza')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Vaata tundi/ })).toHaveAttribute('href', '/live-classroom/vaatle/inv-1');
  });
});

describe('participant answering an observer', () => {
  it('keeps the observer\'s candidates that arrive while TURN is still loading (they were dropped before)', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useObserverPeers } = await import('./useLessonObserver.js');
    let onSignal = () => {};
    const sent = [];
    const service = {
      subscribeObservers: (id, onChange) => { onChange([{ uid: 'adm', active: true, lastSeenIso: new Date().toISOString() }]); return () => {}; },
      subscribeSignals: (id, uid, listener) => { onSignal = listener; return () => {}; },
      sendSignal: vi.fn(async (id, signal) => { sent.push(signal); }),
    };
    let releaseTurn;
    const turnService = { iceServers: () => new Promise((resolve) => { releaseTurn = () => resolve({ iceServers: [] }); }) };
    const added = [];
    const peerFactory = () => ({
      remoteDescription: null,
      async setRemoteDescription(d) { this.remoteDescription = d; },
      addTrack() {}, getSenders: () => [],
      async createAnswer() { return { type: 'answer', sdp: 'a' }; },
      async setLocalDescription() {},
      async addIceCandidate(c) { added.push(c.candidate); },
      close() {},
    });
    const stream = { getTracks: () => [] };
    renderHook(() => useObserverPeers({ invitationId: 'inv', user: { uid: 'teach' }, localStream: stream, service, turnService, peerFactory }));
    const at = new Date().toISOString();
    const base = { sessionId: 's1', observerUid: 'adm', fromUid: 'adm', toUid: 'teach', createdAtIso: at };
    await act(async () => {
      onSignal({ ...base, type: 'offer', payload: JSON.stringify({ type: 'offer', sdp: 'o' }) });
      onSignal({ ...base, type: 'candidate', payload: JSON.stringify({ candidate: 'relay-1' }) });
      onSignal({ ...base, type: 'candidate', payload: JSON.stringify({ candidate: 'host-2' }) });
    });
    await act(async () => { releaseTurn(); });
    await vi.waitFor(() => expect(sent.some((item) => item.type === 'answer')).toBe(true));
    await vi.waitFor(() => expect(added).toEqual(['relay-1', 'host-2']));
  });
});

describe('„Räägi kaasa”: the administrator speaks in the lesson', () => {
  const track = (kind) => ({ kind, enabled: true, stop: vi.fn() });
  const ownStream = (kinds) => { const tracks = kinds.map(track); return { id: `own-${kinds.join('')}`, getTracks: () => tracks, getAudioTracks: () => tracks.filter((t) => t.kind === 'audio'), getVideoTracks: () => tracks.filter((t) => t.kind === 'video') }; };

  it('watching offers receive-only; speaking offers again to both with the microphone and camera', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useObserveLesson } = await import('./useLessonObserver.js');
    const peers = [];
    const peerFactory = () => { const pc = { transceivers: [], addTransceiver(what, options) { this.transceivers.push([typeof what === 'string' ? what : what.kind, options.direction]); }, async createOffer() { return { type: 'offer', sdp: 'o' }; }, async setLocalDescription() {}, close: vi.fn() }; peers.push(pc); return pc; };
    const sent = [];
    const service = { setPresence: vi.fn(async () => {}), subscribeSignals: () => () => {}, sendSignal: vi.fn(async (id, signal) => { sent.push(signal); }) };
    const invitation = { id: 'inv', status: 'accepted', teacherUid: 't', studentUid: 's' };
    const { rerender, unmount } = renderHook(({ localStream }) => useObserveLesson({ invitation, user: { uid: 'adm', displayName: 'Pavel' }, localStream, service, turnService: { iceServers: async () => ({ iceServers: [] }) }, peerFactory }), { initialProps: { localStream: null } });
    await vi.waitFor(() => expect(peers).toHaveLength(2));
    expect(peers[0].transceivers).toEqual([['audio', 'recvonly'], ['video', 'recvonly']]);
    rerender({ localStream: ownStream(['audio', 'video']) });
    await vi.waitFor(() => expect(peers).toHaveLength(4));
    expect(peers[2].transceivers).toEqual([['audio', 'sendrecv'], ['video', 'sendrecv']]);
    expect(sent.filter((item) => item.type === 'hangup').map((item) => item.toUid).sort()).toEqual(['s', 't']);
    rerender({ localStream: ownStream(['audio']) });
    await vi.waitFor(() => expect(peers).toHaveLength(6));
    expect(peers[4].transceivers).toEqual([['audio', 'sendrecv'], ['video', 'recvonly']]);
    unmount();
  });

  it('the teacher hears the speaking administrator; the stream goes away with the connection', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useObserverPeers } = await import('./useLessonObserver.js');
    let onSignal = () => {};
    const service = {
      subscribeObservers: (id, onChange) => { onChange([{ uid: 'adm', active: true, lastSeenIso: new Date().toISOString() }]); return () => {}; },
      subscribeSignals: (id, uid, listener) => { onSignal = listener; return () => {}; },
      sendSignal: vi.fn(async () => {}),
    };
    let pc;
    const peerFactory = () => { pc = { remoteDescription: null, async setRemoteDescription(d) { this.remoteDescription = d; }, addTrack() {}, getSenders: () => [], async createAnswer() { return { type: 'answer', sdp: 'a' }; }, async setLocalDescription() {}, async addIceCandidate() {}, close() {} }; return pc; };
    const turnService = { iceServers: async () => ({ iceServers: [] }) };
    const localStream = { getTracks: () => [] };
    const user = { uid: 'teach' };
    const { result } = renderHook(() => useObserverPeers({ invitationId: 'inv', user, localStream, service, turnService, peerFactory }));
    const base = { sessionId: 's1', observerUid: 'adm', fromUid: 'adm', toUid: 'teach', createdAtIso: new Date().toISOString() };
    await act(async () => { onSignal({ ...base, type: 'offer', payload: JSON.stringify({ type: 'offer', sdp: 'o' }) }); });
    await vi.waitFor(() => expect(pc?.ontrack).toBeTypeOf('function'));
    const voice = { id: 'adm-voice' };
    act(() => { pc.ontrack({ streams: [voice], track: { kind: 'audio' } }); });
    expect(result.current.streams.adm).toBe(voice);
    await act(async () => { onSignal({ ...base, type: 'hangup', payload: '{}' }); });
    expect(result.current.streams.adm).toBeUndefined();
  });

  it('plays the administrator in the room; a watching administrator adds nothing', async () => {
    const { default: ObserverMedia } = await import('./ObserverMedia.jsx');
    const stream = { getVideoTracks: () => [{ kind: 'video' }] };
    const { container, rerender } = render(<ObserverMedia observers={[{ uid: 'adm', displayName: 'Pavel' }]} streams={{}} />);
    expect(container.textContent).toBe('');
    rerender(<ObserverMedia observers={[{ uid: 'adm', displayName: 'Pavel' }]} streams={{ adm: stream }} />);
    expect(screen.getByTestId('observer-audio')).toBeInTheDocument();
    expect(screen.getByText('Pavel')).toBeInTheDocument();
    rerender(<ObserverMedia observers={[{ uid: 'adm', displayName: 'Pavel' }]} streams={{ adm: stream }} showVideo={false} />);
    expect(screen.queryByText('Pavel')).toBeNull();
    expect(screen.getByTestId('observer-audio')).toBeInTheDocument();
  });
});
