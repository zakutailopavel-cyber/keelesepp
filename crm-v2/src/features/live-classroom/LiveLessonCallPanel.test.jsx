import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LiveLessonCallPanel from './LiveLessonCallPanel.jsx';

function makeTrack(kind) {
  return { kind, enabled: true, stop: vi.fn(), onended: null };
}

function makeStream() {
  const audio = makeTrack('audio');
  const video = makeTrack('video');
  return {
    audio,
    video,
    getTracks: () => [audio, video],
    getAudioTracks: () => [audio],
    getVideoTracks: () => [video],
  };
}

function makeDisplayStream() {
  const video = makeTrack('video');
  return {
    video,
    getTracks: () => [video],
    getAudioTracks: () => [],
    getVideoTracks: () => [video],
  };
}

function makePeer() {
  const videoSender = {
    track: { kind: 'video' },
    replaceTrack: vi.fn(function replaceTrack(track) {
      this.track = track || { kind: 'video' };
      return Promise.resolve();
    }),
  };
  return {
    connectionState: 'new',
    remoteDescription: null,
    localDescription: null,
    addTrack: vi.fn(),
    getSenders: vi.fn(() => [videoSender]),
    videoSender,
    addIceCandidate: vi.fn().mockResolvedValue(undefined),
    createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'offer-sdp' }),
    createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'answer-sdp' }),
    setLocalDescription: vi.fn(function setLocalDescription(value) { this.localDescription = value; return Promise.resolve(); }),
    setRemoteDescription: vi.fn(function setRemoteDescription(value) { this.remoteDescription = value; return Promise.resolve(); }),
    close: vi.fn(),
    ontrack: null,
    onicecandidate: null,
    onconnectionstatechange: null,
  };
}

function makePresenceService(peerRole = 'student') {
  return {
    heartbeat: vi.fn().mockResolvedValue(undefined),
    markOffline: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn((id, onChange) => {
      onChange([{ id: 'peer', uid: 'peer-1', role: peerRole, displayName: 'Mari', online: true, lastSeenIso: new Date().toISOString() }]);
      return vi.fn();
    }),
  };
}

const teacherInvitation = {
  id: 'invite-1',
  teacherName: 'Pavel',
  studentName: 'Mari',
  status: 'accepted',
};

describe('LiveLessonCallPanel', () => {
  it('starts a teacher camera session, reports presence and publishes an offer', async () => {
    const stream = makeStream();
    const mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
    const peer = makePeer();
    const signalService = { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };
    const presenceService = makePresenceService();

    render(<LiveLessonCallPanel invitation={teacherInvitation} role="teacher" user={{ uid: 'teacher-1' }} signalService={signalService} presenceService={presenceService} mediaDevices={mediaDevices} peerFactory={() => peer} />);

    expect(await screen.findByText('Mari on võrgus')).toBeInTheDocument();
    expect(presenceService.heartbeat).toHaveBeenCalledWith('invite-1', expect.objectContaining({ uid: 'teacher-1', role: 'teacher' }));
    fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(signalService.send).toHaveBeenCalledWith('invite-1', expect.objectContaining({ type: 'offer', senderUid: 'teacher-1', senderRole: 'teacher' })));
    expect(peer.addTrack).toHaveBeenCalledTimes(2);
  });

  it('gives the call STUN plus the TURN relay from the server, fetched once the room is open', async () => {
    const stream = makeStream();
    const mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
    const peer = makePeer();
    const peerFactory = vi.fn(() => peer);
    const signalService = { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };
    const relay = { urls: ['turn:turn.cloudflare.com:3478?transport=udp'], username: 'u', credential: 'c' };
    const turnService = { iceServers: vi.fn().mockResolvedValue({ iceServers: [relay], ttl: 14400 }) };

    render(<LiveLessonCallPanel invitation={teacherInvitation} role="teacher" user={{ uid: 'teacher-1' }} signalService={signalService} presenceService={makePresenceService()} mediaDevices={mediaDevices} peerFactory={peerFactory} turnService={turnService} />);
    await waitFor(() => expect(turnService.iceServers).toHaveBeenCalledWith('invite-1'));
    fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(peerFactory).toHaveBeenCalled());
    const servers = peerFactory.mock.calls[0][0];
    expect(servers[0].urls[0]).toMatch(/^stun:/);
    expect(servers).toContainEqual(relay);
    expect(turnService.iceServers).toHaveBeenCalledTimes(1);
  });

  it('still calls with STUN only when the TURN service fails', async () => {
    const stream = makeStream();
    const mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
    const peerFactory = vi.fn(() => makePeer());
    const signalService = { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };
    const turnService = { iceServers: vi.fn().mockRejectedValue(new Error('down')) };

    render(<LiveLessonCallPanel invitation={teacherInvitation} role="teacher" user={{ uid: 'teacher-1' }} signalService={signalService} presenceService={makePresenceService()} mediaDevices={mediaDevices} peerFactory={peerFactory} turnService={turnService} />);
    fireEvent.click(await screen.findByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(signalService.send).toHaveBeenCalledWith('invite-1', expect.objectContaining({ type: 'offer' })));
    expect(peerFactory.mock.calls[0][0]).toEqual([{ urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] }]);
  });

  it('does not hold the call more than a few seconds for a slow TURN service', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    try {
      const stream = makeStream();
      const mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
      const peerFactory = vi.fn(() => makePeer());
      const signalService = { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };
      const turnService = { iceServers: vi.fn(() => new Promise(() => {})) };
      render(<LiveLessonCallPanel invitation={teacherInvitation} role="teacher" user={{ uid: 'teacher-1' }} signalService={signalService} presenceService={makePresenceService()} mediaDevices={mediaDevices} peerFactory={peerFactory} turnService={turnService} />);
      fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
      await vi.advanceTimersByTimeAsync(3100);
      expect(peerFactory).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('lets a student opt in first and answers when the teacher offer arrives', async () => {
    const stream = makeStream();
    const mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
    const peer = makePeer();
    let emitSignal;
    const signalService = {
      subscribe: vi.fn((id, onSignal) => { emitSignal = onSignal; return vi.fn(); }),
      send: vi.fn().mockResolvedValue(undefined),
    };

    render(<LiveLessonCallPanel invitation={teacherInvitation} role="student" user={{ uid: 'student-1' }} signalService={signalService} presenceService={makePresenceService('teacher')} mediaDevices={mediaDevices} peerFactory={() => peer} />);
    fireEvent.click(screen.getByRole('button', { name: /Liitu videokõnega/i }));
    await waitFor(() => expect(mediaDevices.getUserMedia).toHaveBeenCalled());

    await act(async () => {
      emitSignal({ id: 'signal-offer', type: 'offer', sessionId: 'session-1', senderUid: 'teacher-1', senderRole: 'teacher', payload: JSON.stringify({ type: 'offer', sdp: 'teacher-offer' }) });
    });

    await waitFor(() => expect(peer.setRemoteDescription).toHaveBeenCalledWith({ type: 'offer', sdp: 'teacher-offer' }));
    await waitFor(() => expect(signalService.send).toHaveBeenCalledWith('invite-1', expect.objectContaining({ type: 'answer', sessionId: 'session-1', senderUid: 'student-1', senderRole: 'student' })));
  });

  it('stops local tracks when the other side hangs up', async () => {
    const stream = makeStream();
    const mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
    const peer = makePeer();
    let emitSignal;
    const signalService = {
      subscribe: vi.fn((id, onSignal) => { emitSignal = onSignal; return vi.fn(); }),
      send: vi.fn().mockResolvedValue(undefined),
    };

    render(<LiveLessonCallPanel invitation={teacherInvitation} role="teacher" user={{ uid: 'teacher-1' }} signalService={signalService} presenceService={makePresenceService()} mediaDevices={mediaDevices} peerFactory={() => peer} />);
    fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(signalService.send).toHaveBeenCalled());
    const offerCall = signalService.send.mock.calls.find((call) => call[1].type === 'offer');

    await act(async () => {
      emitSignal({ id: 'signal-hangup', type: 'hangup', sessionId: offerCall[1].sessionId, senderUid: 'student-1', senderRole: 'student', payload: '{}' });
    });

    await waitFor(() => expect(stream.audio.stop).toHaveBeenCalled());
    expect(stream.video.stop).toHaveBeenCalled();
    expect(screen.getAllByText('Kõne lõpetatud').length).toBeGreaterThan(0);
  });

  it('offers teacher reconnection and supports floating mode after disconnect', async () => {
    const stream = makeStream();
    const mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
    const firstPeer = makePeer();
    const secondPeer = makePeer();
    const peers = [firstPeer, secondPeer];
    const signalService = { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };

    render(<LiveLessonCallPanel invitation={teacherInvitation} role="teacher" user={{ uid: 'teacher-1' }} signalService={signalService} presenceService={makePresenceService()} mediaDevices={mediaDevices} peerFactory={() => peers.shift()} />);
    fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(firstPeer.onconnectionstatechange).toBeTypeOf('function'));

    firstPeer.connectionState = 'disconnected';
    act(() => firstPeer.onconnectionstatechange());
    expect(screen.getByRole('button', { name: /Taasta ühendus/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ava ujuvas aknas' }));
    expect(screen.getByRole('button', { name: 'Tagasi lehele' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Taasta ühendus/i }));
    await waitFor(() => expect(secondPeer.createOffer).toHaveBeenCalled());
  });

  it('lets the teacher share the screen by replacing only the outgoing video track', async () => {
    const stream = makeStream();
    const displayStream = makeDisplayStream();
    const mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(stream),
      getDisplayMedia: vi.fn().mockResolvedValue(displayStream),
    };
    const peer = makePeer();
    const signalService = { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };

    render(<LiveLessonCallPanel invitation={teacherInvitation} role="teacher" user={{ uid: 'teacher-1' }} signalService={signalService} presenceService={makePresenceService()} mediaDevices={mediaDevices} peerFactory={() => peer} />);
    fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Jaga ekraani/i })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Jaga ekraani/i }));
    await waitFor(() => expect(mediaDevices.getDisplayMedia).toHaveBeenCalledWith({ video: true, audio: false }));
    await waitFor(() => expect(peer.videoSender.replaceTrack).toHaveBeenCalledWith(displayStream.video));
    expect(screen.getByText('Ekraan on jagatud')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Lõpeta ekraani jagamine/i })).toBeInTheDocument();
    expect(stream.audio.stop).not.toHaveBeenCalled();
  });

  it('restores the camera when browser screen sharing ends', async () => {
    const stream = makeStream();
    const displayStream = makeDisplayStream();
    const mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue(stream),
      getDisplayMedia: vi.fn().mockResolvedValue(displayStream),
    };
    const peer = makePeer();
    const signalService = { subscribe: vi.fn(() => vi.fn()), send: vi.fn().mockResolvedValue(undefined) };

    render(<LiveLessonCallPanel invitation={teacherInvitation} role="teacher" user={{ uid: 'teacher-1' }} signalService={signalService} presenceService={makePresenceService()} mediaDevices={mediaDevices} peerFactory={() => peer} />);
    fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(screen.getByRole('button', { name: /Jaga ekraani/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Jaga ekraani/i }));
    await waitFor(() => expect(displayStream.video.onended).toBeTypeOf('function'));

    await act(async () => {
      displayStream.video.onended();
    });

    await waitFor(() => expect(peer.videoSender.replaceTrack).toHaveBeenLastCalledWith(stream.video));
    expect(displayStream.video.stop).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Jaga ekraani/i })).toBeInTheDocument();
    expect(screen.queryByText('Ekraan on jagatud')).not.toBeInTheDocument();
  });
});
