import { act, renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { isInitiator, useGroupCall } from './useGroupCall.js';

const track = (kind) => ({ kind, enabled: true, stop: vi.fn() });
const stream = () => { const tracks = [track('audio'), track('video')]; return { tracks, getTracks: () => tracks, getAudioTracks: () => [tracks[0]], getVideoTracks: () => [tracks[1]] }; };

function bus() {
  const subs = new Map();
  const presence = [];
  const presenceSubs = [];
  let n = 0;
  return {
    sent: [],
    subscribeSignals: vi.fn((roomId, uid, onSignal) => { subs.set(uid, onSignal); return () => subs.delete(uid); }),
    sendSignal: vi.fn(async (roomId, signal) => {
      const item = { id: `sig-${(n += 1)}`, ...signal, payload: JSON.stringify(signal.payload) };
      bus.last = item;
      subs.get(signal.toUid)?.(item);
    }),
    heartbeat: vi.fn(async (roomId, item) => {
      const index = presence.findIndex((p) => p.uid === item.uid);
      const next = { ...item, online: item.online !== false, lastSeenIso: new Date().toISOString() };
      if (index >= 0) presence[index] = next; else presence.push(next);
      presenceSubs.forEach((cb) => cb([...presence]));
    }),
    subscribePresence: vi.fn((roomId, cb) => { presenceSubs.push(cb); cb([...presence]); return () => {}; }),
  };
}

function peer(name) {
  const p = {
    name, connectionState: 'new', remoteDescription: null, localDescription: null,
    addTrack: vi.fn(), addIceCandidate: vi.fn(async () => {}), close: vi.fn(),
    createOffer: vi.fn(async () => ({ type: 'offer', sdp: `${name}-offer` })),
    createAnswer: vi.fn(async () => ({ type: 'answer', sdp: `${name}-answer` })),
    setLocalDescription: vi.fn(async function set(d) { this.localDescription = d; }),
    setRemoteDescription: vi.fn(async function set(d) { this.remoteDescription = d; }),
  };
  return p;
}

const room = { id: 'room-1', teacherUid: 'a-teacher', teacherName: 'Kati', members: [{ studentUid: 'b-mari', studentName: 'Mari' }, { studentUid: 'c-jaan', studentName: 'Jaan' }] };

describe('group call (mesh)', () => {
  it('the smaller uid of a pair makes the offer', () => {
    expect(isInitiator('a-teacher', 'b-mari')).toBe(true);
    expect(isInitiator('c-jaan', 'b-mari')).toBe(false);
  });

  it('teacher and student connect: the offer waits until the student turns the camera on, then is answered', async () => {
    const service = bus();
    const teacherPeers = [];
    const studentPeers = [];
    const teacher = renderHook(() => useGroupCall({ room, role: 'teacher', user: { uid: 'a-teacher' }, service, turnService: null, mediaDevices: { getUserMedia: vi.fn(async () => stream()) }, peerFactory: () => { const p = peer('t'); teacherPeers.push(p); return p; } }));
    const student = renderHook(() => useGroupCall({ room, role: 'student', user: { uid: 'b-mari' }, service, turnService: null, mediaDevices: { getUserMedia: vi.fn(async () => stream()) }, peerFactory: () => { const p = peer('s'); studentPeers.push(p); return p; } }));
    expect(teacher.result.current.tiles.map((t) => t.name)).toEqual(['Mari', 'Jaan']);
    expect(student.result.current.tiles.map((t) => t.name)).toEqual(['Kati', 'Jaan']);

    await act(async () => { await teacher.result.current.start(); });
    await waitFor(() => expect(service.sendSignal).toHaveBeenCalledWith('room-1', expect.objectContaining({ type: 'offer', fromUid: 'a-teacher', toUid: 'b-mari' })));
    expect(service.sendSignal).not.toHaveBeenCalledWith('room-1', expect.objectContaining({ toUid: 'c-jaan' }));
    expect(studentPeers).toHaveLength(0);

    await act(async () => { await student.result.current.start(); });
    await waitFor(() => expect(service.sendSignal).toHaveBeenCalledWith('room-1', expect.objectContaining({ type: 'answer', fromUid: 'b-mari', toUid: 'a-teacher' })));
    expect(studentPeers[0].setRemoteDescription).toHaveBeenCalledWith({ type: 'offer', sdp: 't-offer' });
    await waitFor(() => expect(teacherPeers.at(-1).setRemoteDescription).toHaveBeenCalledWith({ type: 'answer', sdp: 's-answer' }));

    const remote = stream();
    act(() => teacherPeers.at(-1).ontrack({ streams: [remote] }));
    expect(teacher.result.current.tiles.find((t) => t.uid === 'b-mari').stream).toBe(remote);

    act(() => teacher.result.current.hangUp());
    expect(service.sendSignal).toHaveBeenLastCalledWith('room-1', expect.objectContaining({ type: 'hangup', toUid: 'b-mari' }));
  });
});
