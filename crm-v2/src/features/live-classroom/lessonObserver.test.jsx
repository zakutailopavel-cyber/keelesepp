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
