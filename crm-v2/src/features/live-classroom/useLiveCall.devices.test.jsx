import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import { mediaConstraints, useLiveCall } from './useLiveCall.js';

const track = (kind, deviceId) => ({ kind, deviceId, enabled: true, stop: vi.fn(), getSettings: () => ({ deviceId }) });
const streamOf = (...tracks) => ({
  tracks,
  getTracks: () => tracks,
  getAudioTracks: () => tracks.filter((item) => item.kind === 'audio'),
  getVideoTracks: () => tracks.filter((item) => item.kind === 'video'),
});

function makePeer() {
  const senders = [];
  return {
    connectionState: 'new',
    senders,
    addTrack: vi.fn((item) => { senders.push({ track: item, replaceTrack: vi.fn(function replaceTrack(next) { this.track = next; return Promise.resolve(); }) }); }),
    getSenders: () => senders,
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
});

beforeEach(() => {
  globalThis.localStorage.clear();
  globalThis.MediaStream = class { constructor(tracks) { return streamOf(...tracks); } };
});

describe('useLiveCall devices', () => {
  it('prefers the remembered devices without requiring them', () => {
    expect(mediaConstraints({ audioId: 'mic-2', videoId: 'cam-2' })).toMatchObject({ audio: { deviceId: { ideal: 'mic-2' } }, video: { deviceId: { ideal: 'cam-2' } } });
    expect(mediaConstraints()).toMatchObject({ audio: true, video: { facingMode: 'user' } });
  });

  it('switches the microphone mid-call on the same connection, keeps mute and remembers the choice', async () => {
    const mic1 = track('audio', 'mic-1');
    const cam1 = track('video', 'cam-1');
    const mic2 = track('audio', 'mic-2');
    const mediaDevices = {
      getUserMedia: vi.fn()
        .mockResolvedValueOnce(streamOf(mic1, cam1))
        .mockResolvedValueOnce(streamOf(mic2)),
      enumerateDevices: vi.fn().mockResolvedValue([
        { kind: 'audioinput', deviceId: 'mic-1', label: 'MacBook' },
        { kind: 'audioinput', deviceId: 'mic-2', label: 'AirPods' },
        { kind: 'videoinput', deviceId: 'cam-1', label: 'FaceTime' },
      ]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    const peer = makePeer();
    const onMediaStreams = vi.fn();
    const { result } = renderHook(() => useLiveCall({ invitation, role: 'teacher', user: { uid: 't1' }, mediaDevices, peerFactory: () => peer, onMediaStreams, ...services() }));
    await act(async () => { await result.current.startTeacherCall(); });
    await waitFor(() => expect(result.current.devices.audio.map((item) => item.label)).toEqual(['MacBook', 'AirPods']));
    act(() => result.current.toggleAudio());
    await act(async () => { await result.current.switchDevice('audio', 'mic-2'); });

    expect(mediaDevices.getUserMedia).toHaveBeenLastCalledWith({ audio: { deviceId: { exact: 'mic-2' } }, video: false });
    const audioSender = peer.senders.find((item) => item.track.kind === 'audio');
    expect(audioSender.replaceTrack).toHaveBeenCalledWith(mic2);
    expect(peer.createOffer).toHaveBeenCalledTimes(1);
    expect(mic1.stop).toHaveBeenCalled();
    expect(mic2.enabled).toBe(false);
    const local = onMediaStreams.mock.calls.at(-1)[0].local;
    expect(local.getAudioTracks()).toEqual([mic2]);
    expect(local.getVideoTracks()).toEqual([cam1]);
    expect(JSON.parse(globalThis.localStorage.getItem('keelesepp.liveDevices'))).toMatchObject({ audioId: 'mic-2' });
    expect(result.current.selectedDevices.audioId).toBe('mic-2');
  });

  it('does not take the screen share off the connection when the camera changes', async () => {
    const cam2 = track('video', 'cam-2');
    const screen = track('video', 'screen');
    const mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValueOnce(streamOf(track('audio', 'mic-1'), track('video', 'cam-1'))).mockResolvedValueOnce(streamOf(cam2)),
      getDisplayMedia: vi.fn().mockResolvedValue(streamOf(screen)),
    };
    const peer = makePeer();
    const { result } = renderHook(() => useLiveCall({ invitation, role: 'teacher', user: { uid: 't1' }, mediaDevices, peerFactory: () => peer, ...services() }));
    await act(async () => { await result.current.startTeacherCall(); });
    await act(async () => { await result.current.startScreenShare(); });
    await act(async () => { await result.current.switchDevice('video', 'cam-2'); });
    const videoSender = peer.senders.find((item) => item.track.kind === 'video');
    expect(videoSender.track).toBe(screen);
    await act(async () => { await result.current.stopScreenShare(); });
    expect(videoSender.track).toBe(cam2);
  });
});
