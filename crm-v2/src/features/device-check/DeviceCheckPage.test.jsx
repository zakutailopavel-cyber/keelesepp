import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DeviceCheckPage from './DeviceCheckPage.jsx';
import { gatherIce } from './deviceProbes.js';

const CHROME = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

function track(kind, deviceId) {
  return { kind, stop: vi.fn(), getSettings: () => ({ deviceId }) };
}
class FakeStream {
  constructor(tracks = []) { this.tracks = tracks; }
  getTracks() { return this.tracks; }
  getAudioTracks() { return this.tracks.filter((item) => item.kind === 'audio'); }
  getVideoTracks() { return this.tracks.filter((item) => item.kind === 'video'); }
}
class FakeAudioContext {
  constructor() { this.close = vi.fn(); this.currentTime = 0; this.destination = {}; FakeAudioContext.last = this; }
  resume() { return Promise.resolve(); }
  createMediaStreamSource() { return { connect: vi.fn(), disconnect: vi.fn() }; }
  createAnalyser() { return { fftSize: 1024, getByteTimeDomainData: (buffer) => buffer.fill(160) }; }
}

function setup({ userMedia, ice = { iceServers: [] }, search = '' } = {}) {
  const made = [];
  const getUserMedia = vi.fn(userMedia || (async (constraints) => {
    const tracks = [];
    if (constraints.audio) tracks.push(track('audio', 'mic-1'));
    if (constraints.video) tracks.push(track('video', 'cam-1'));
    const stream = new FakeStream(tracks);
    made.push(stream);
    return stream;
  }));
  const mediaDevices = {
    getUserMedia,
    enumerateDevices: vi.fn(async () => [
      { kind: 'videoinput', deviceId: 'cam-1', label: 'FaceTime HD' }, { kind: 'videoinput', deviceId: 'cam-2', label: 'USB kaamera' },
      { kind: 'audioinput', deviceId: 'mic-1', label: 'Sisseehitatud' },
    ]),
    getDisplayMedia: vi.fn(),
  };
  const env = {
    isSecureContext: true, RTCPeerConnection: function Peer() {}, AudioContext: FakeAudioContext,
    MediaRecorder: Object.assign(function Rec() {}, { isTypeSupported: (type) => type === 'audio/webm;codecs=opus' }),
    navigator: { userAgent: CHROME, maxTouchPoints: 0, onLine: true, mediaDevices },
  };
  const turnService = { ping: vi.fn(async () => true), iceServers: vi.fn(async () => ice) };
  const peers = [];
  const peerFactory = vi.fn((config) => {
    const peer = {
      config, close: vi.fn(), iceGatheringState: 'new',
      createDataChannel: vi.fn(),
      createOffer: vi.fn(async () => ({ type: 'offer', sdp: '' })),
      setLocalDescription: vi.fn(async () => {
        const hasTurn = config.iceServers.some((server) => [].concat(server.urls).some((url) => url.startsWith('turn')));
        peer.onicecandidate({ candidate: { candidate: 'candidate:1 1 udp 1 1.2.3.4 5000 typ srflx' } });
        if (hasTurn) peer.onicecandidate({ candidate: { candidate: 'candidate:2 1 udp 1 5.6.7.8 5000 typ relay' } });
        peer.onicecandidate({ candidate: null });
      }),
    };
    peers.push(peer);
    return peer;
  });
  const fetchImpl = vi.fn(async () => ({ ok: true }));
  globalThis.MediaStream = FakeStream;
  const view = render(<MemoryRouter initialEntries={[`/kontroll${search}`]}><Routes><Route path="/kontroll" element={
    <DeviceCheckPage env={env} mediaDevices={mediaDevices} turnService={turnService} peerFactory={peerFactory} fetchImpl={fetchImpl} role="student" />} /></Routes></MemoryRouter>);
  return { view, made, mediaDevices, turnService, peers, peerFactory, fetchImpl };
}

describe('DeviceCheckPage', () => {
  it('shows browser support before any permission is asked', () => {
    const { mediaDevices } = setup();
    expect(screen.getByRole('heading', { name: 'Seadme kontroll' })).toBeInTheDocument();
    expect(screen.getByText('Chrome 130')).toBeInTheDocument();
    expect(screen.getByText('Videotund töötab selles brauseris.')).toBeInTheDocument();
    expect(mediaDevices.getUserMedia).not.toHaveBeenCalled();
  });

  it('opens camera and microphone, checks the network and releases every track on leaving', async () => {
    const { view, made, turnService, peers, fetchImpl } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Alusta kontrolli' }));
    expect(await screen.findByText('Mikrofon kuuleb sind.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('võimalik')).toBeInTheDocument());
    expect(screen.getByLabelText('Vali kaamera')).toBeInTheDocument();
    expect(turnService.ping).toHaveBeenCalled();
    expect(turnService.iceServers).not.toHaveBeenCalled(); // no lesson link → STUN only
    expect(peers[0].close).toHaveBeenCalled();
    expect(fetchImpl.mock.calls[0][0]).toMatch(/\/favicon\.ico\?kontroll=/);
    // speakers question finishes the check
    fireEvent.click(screen.getByRole('button', { name: 'Mängi heli' }));
    await act(async () => { await new Promise((resolve) => { globalThis.setTimeout(resolve, 1600); }); });
    fireEvent.click(await screen.findByRole('button', { name: 'Jah' }));
    expect(screen.getByRole('heading', { level: 2, name: /Kõik on korras/ })).toBeInTheDocument();
    const ctx = FakeAudioContext.last;
    view.unmount();
    for (const stream of made) for (const item of stream.getTracks()) expect(item.stop).toHaveBeenCalled();
    expect(ctx.close).toHaveBeenCalled();
  });

  it('switches the camera, stops the old one and remembers it for the lesson room', async () => {
    const { made, mediaDevices } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Alusta kontrolli' }));
    const picker = await screen.findByLabelText('Vali kaamera');
    fireEvent.change(picker, { target: { value: 'cam-2' } });
    await waitFor(() => expect(mediaDevices.getUserMedia).toHaveBeenLastCalledWith({ audio: false, video: expect.objectContaining({ deviceId: { exact: 'cam-2' } }) }));
    expect(made[0].getVideoTracks()[0].stop).toHaveBeenCalled();
    expect(JSON.parse(globalThis.localStorage.getItem('keelesepp.liveDevices'))).toMatchObject({ videoId: 'cam-2' });
  });

  it('says how to allow the microphone when it is refused', async () => {
    setup({ userMedia: async () => { throw Object.assign(new Error('no'), { name: 'NotAllowedError' }); } });
    fireEvent.click(screen.getByRole('button', { name: 'Alusta kontrolli' }));
    expect(await screen.findByText(/Luba mikrofon brauseri seadetes/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: /Enne tundi on vaja midagi parandada/ })).toBeInTheDocument();
  });

  it('tells which device is busy when only the camera fails', async () => {
    setup({ userMedia: async (constraints) => {
      if (constraints.video) throw Object.assign(new Error('busy'), { name: 'NotReadableError' });
      return new FakeStream([track('audio', 'mic-1')]);
    } });
    fireEvent.click(screen.getByRole('button', { name: 'Alusta kontrolli' }));
    expect(await screen.findByText(/Sulge teised rakendused, mis kasutavad kaamerat/)).toBeInTheDocument();
    expect(await screen.findByText('Mikrofon kuuleb sind.')).toBeInTheDocument();
  });

  it('checks the TURN relay with the lesson link, without showing credentials', async () => {
    const { turnService, peerFactory } = setup({ search: '?tund=inv-1', ice: { iceServers: [{ urls: ['turn:turn.cloudflare.com:3478?transport=udp'], username: 'secret-user', credential: 'secret-pass' }] } });
    fireEvent.click(screen.getByRole('button', { name: 'Alusta kontrolli' }));
    expect(await screen.findByText('kättesaadav')).toBeInTheDocument();
    expect(turnService.iceServers).toHaveBeenCalledWith('inv-1');
    expect(peerFactory.mock.calls[0][0].iceServers.some((server) => server.username === 'secret-user')).toBe(true);
    expect(document.body.textContent).not.toMatch(/secret/);
  });
});

describe('gatherIce', () => {
  it('times out and closes the connection when no candidate comes', async () => {
    const peer = { close: vi.fn(), createDataChannel: vi.fn(), createOffer: () => new Promise(() => {}), setLocalDescription: vi.fn() };
    const result = await gatherIce({ peerFactory: () => peer, timeoutMs: 10 });
    expect(result).toMatchObject({ stun: false, relay: 'unavailable' });
    expect(peer.close).toHaveBeenCalled();
  });
});
