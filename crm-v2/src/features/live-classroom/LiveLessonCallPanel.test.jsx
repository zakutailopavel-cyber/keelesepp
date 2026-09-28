import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import LiveLessonCallPanel from './LiveLessonCallPanel.jsx';

function makeTrack(kind) {
  return { kind, enabled: true, stop: vi.fn() };
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

function makePeer() {
  return {
    connectionState: 'new',
    remoteDescription: null,
    localDescription: null,
    addTrack: vi.fn(),
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

const teacherInvitation = {
  id: 'invite-1',
  teacherName: 'Pavel',
  studentName: 'Mari',
  status: 'accepted',
};

describe('LiveLessonCallPanel', () => {
  it('starts a teacher camera session and publishes an offer', async () => {
    const stream = makeStream();
    const mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
    const peer = makePeer();
    const signalService = {
      subscribe: vi.fn(() => vi.fn()),
      send: vi.fn().mockResolvedValue(undefined),
    };

    render(<LiveLessonCallPanel
      invitation={teacherInvitation}
      role="teacher"
      user={{ uid: 'teacher-1' }}
      signalService={signalService}
      mediaDevices={mediaDevices}
      peerFactory={() => peer}
    />);

    fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(mediaDevices.getUserMedia).toHaveBeenCalled());
    await waitFor(() => expect(signalService.send).toHaveBeenCalledWith(
      'invite-1',
      expect.objectContaining({
        type: 'offer',
        senderUid: 'teacher-1',
        senderRole: 'teacher',
        payload: expect.objectContaining({ type: 'offer' }),
      }),
    ));
    expect(peer.addTrack).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('button', { name: 'Lülita mikrofon välja' })).toBeInTheDocument();
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

    render(<LiveLessonCallPanel
      invitation={teacherInvitation}
      role="student"
      user={{ uid: 'student-1' }}
      signalService={signalService}
      mediaDevices={mediaDevices}
      peerFactory={() => peer}
    />);

    fireEvent.click(screen.getByRole('button', { name: /Liitu videokõnega/i }));
    await waitFor(() => expect(mediaDevices.getUserMedia).toHaveBeenCalled());

    await act(async () => {
      emitSignal({
        id: 'signal-offer',
        type: 'offer',
        sessionId: 'session-1',
        senderUid: 'teacher-1',
        senderRole: 'teacher',
        payload: JSON.stringify({ type: 'offer', sdp: 'teacher-offer' }),
      });
    });

    await waitFor(() => expect(peer.setRemoteDescription).toHaveBeenCalledWith({ type: 'offer', sdp: 'teacher-offer' }));
    await waitFor(() => expect(signalService.send).toHaveBeenCalledWith(
      'invite-1',
      expect.objectContaining({
        type: 'answer',
        sessionId: 'session-1',
        senderUid: 'student-1',
        senderRole: 'student',
      }),
    ));
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

    render(<LiveLessonCallPanel
      invitation={teacherInvitation}
      role="teacher"
      user={{ uid: 'teacher-1' }}
      signalService={signalService}
      mediaDevices={mediaDevices}
      peerFactory={() => peer}
    />);

    fireEvent.click(screen.getByRole('button', { name: /Käivita video ja mikrofon/i }));
    await waitFor(() => expect(signalService.send).toHaveBeenCalled());
    const offerCall = signalService.send.mock.calls.find((call) => call[1].type === 'offer');
    const sessionId = offerCall[1].sessionId;

    await act(async () => {
      emitSignal({
        id: 'signal-hangup',
        type: 'hangup',
        sessionId,
        senderUid: 'student-1',
        senderRole: 'student',
        payload: '{}',
      });
    });

    await waitFor(() => expect(stream.audio.stop).toHaveBeenCalled());
    expect(stream.video.stop).toHaveBeenCalled();
    expect(screen.getByText('Kõne lõpetatud')).toBeInTheDocument();
  });
});
