import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { liveGroupRoomsService } from '../../services/firebase/liveGroupRooms.js';
import { presenceIsFresh } from '../../services/firebase/liveLessonPresence.js';
import { liveTurnService } from '../../services/firebase/liveTurn.js';
import { callIceServers, mediaConstraints } from './useLiveCall.js';
import { openMedia } from './mobileMedia.js';

// Group lesson call (owner, 2026-10-04: up to 4 students, no paid video server): a WebRTC mesh — one
// RTCPeerConnection per pair of participants. For every pair the participant with the smaller uid makes the offer, so
// two browsers never offer to each other at the same time; the other answers as soon as its camera is on.
const RECOVERY_DELAY_MS = 1500;
const MAX_RECOVERIES = 3;

const sessionId = () => globalThis.crypto?.randomUUID?.() || `g-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const parse = (signal) => { try { return JSON.parse(signal?.payload || '{}'); } catch { return {}; } };
export const isInitiator = (me, other) => String(me) < String(other);

function defaultPeerFactory(iceServers) {
  if (!globalThis.RTCPeerConnection) throw new Error('See brauser ei toeta videokõnet.');
  return new globalThis.RTCPeerConnection({ iceServers });
}

export function useGroupCall({
  room, user, role, turnInvitationId = '', service = liveGroupRoomsService, turnService = liveTurnService,
  mediaDevices = globalThis.navigator?.mediaDevices, peerFactory = defaultPeerFactory,
}) {
  const roomId = room?.id || '';
  const me = user.uid;
  const participants = useMemo(() => {
    if (!room) return [];
    return [
      { uid: room.teacherUid, name: room.teacherName || 'Õpetaja', role: 'teacher' },
      ...(room.members || []).map((member) => ({ uid: member.studentUid, name: member.studentName || 'Õpilane', role: 'student' })),
    ];
  }, [room]);
  const others = useMemo(() => participants.filter((item) => item.uid !== me), [me, participants]);

  const localRef = useRef(null);
  const localVideoRef = useRef(null);
  const peers = useRef(new Map()); // uid -> { pc, sessionId, pending: [], attempts }
  const pendingOffers = useRef(new Map()); // uid -> offer signal waiting for my camera
  const seen = useRef(new Set());
  const turn = useRef([]);
  const [hasLocalMedia, setHasLocalMedia] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [remotes, setRemotes] = useState({}); // uid -> { stream, status }
  const [presence, setPresence] = useState([]);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const setRemote = useCallback((uid, patch) => setRemotes((current) => ({ ...current, [uid]: { ...(current[uid] || {}), ...patch } })), []);

  // TURN relay credentials (the TURN function accepts any accepted invitation of this person)
  useEffect(() => {
    if (!turnInvitationId || !turnService?.iceServers) return;
    Promise.resolve().then(() => turnService.iceServers(turnInvitationId)).then((result) => { turn.current = Array.isArray(result?.iceServers) ? result.iceServers : []; }).catch(() => {});
  }, [turnInvitationId, turnService]);

  const send = useCallback((toUid, type, payload, sid) => service.sendSignal(roomId, { type, sessionId: sid, fromUid: me, toUid, payload })
    .catch((nextError) => setError(nextError?.message || 'Signaali ei saanud saata.')), [me, roomId, service]);

  const closePeer = useCallback((uid) => {
    const entry = peers.current.get(uid);
    if (entry?.pc) { entry.pc.ontrack = null; entry.pc.onicecandidate = null; entry.pc.onconnectionstatechange = null; entry.pc.close(); }
    peers.current.delete(uid);
  }, []);

  const makePeer = useCallback((uid, sid, attempts = 0) => {
    closePeer(uid);
    const pc = peerFactory(callIceServers(turn.current));
    const entry = { pc, sessionId: sid, pending: [], attempts };
    peers.current.set(uid, entry);
    const stream = localRef.current;
    stream?.getTracks().forEach((track) => pc.addTrack(track, stream));
    pc.ontrack = (event) => { if (event.streams?.[0]) setRemote(uid, { stream: event.streams[0] }); };
    pc.onicecandidate = (event) => { if (event.candidate) send(uid, 'candidate', event.candidate.toJSON ? event.candidate.toJSON() : event.candidate, sid); };
    pc.onconnectionstatechange = () => {
      if (peers.current.get(uid)?.pc !== pc) return;
      const state = pc.connectionState;
      setRemote(uid, { status: state });
      if (state === 'connected') entry.attempts = 0;
      if (state === 'failed' && isInitiator(me, uid) && entry.attempts < MAX_RECOVERIES) {
        globalThis.setTimeout(() => { if (peers.current.get(uid)?.pc === pc) offerTo.current?.(uid, entry.attempts + 1); }, RECOVERY_DELAY_MS);
      }
    };
    return entry;
  }, [closePeer, me, peerFactory, send, setRemote]);

  const offerTo = useRef(null);
  offerTo.current = async (uid, attempts = 0) => {
    if (!localRef.current) return;
    const sid = sessionId();
    const { pc } = makePeer(uid, sid, attempts);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await send(uid, 'offer', offer.toJSON ? offer.toJSON() : offer, sid);
    setRemote(uid, { status: 'connecting' });
  };

  const answer = useCallback(async (signal) => {
    const entry = makePeer(signal.fromUid, signal.sessionId);
    await entry.pc.setRemoteDescription(parse(signal));
    for (const candidate of entry.pending.splice(0)) await entry.pc.addIceCandidate(candidate);
    const reply = await entry.pc.createAnswer();
    await entry.pc.setLocalDescription(reply);
    await send(signal.fromUid, 'answer', reply.toJSON ? reply.toJSON() : reply, signal.sessionId);
    setRemote(signal.fromUid, { status: 'connecting' });
  }, [makePeer, send, setRemote]);

  // signals addressed to me
  useEffect(() => {
    if (!roomId) return undefined;
    return service.subscribeSignals(roomId, me, (signal) => {
      if (!signal?.id || seen.current.has(signal.id)) return;
      seen.current.add(signal.id);
      const from = signal.fromUid;
      const handle = async () => {
        if (signal.type === 'offer') {
          if (localRef.current) await answer(signal);
          else pendingOffers.current.set(from, signal);
          return;
        }
        const entry = peers.current.get(from);
        if (!entry || entry.sessionId !== signal.sessionId) return;
        if (signal.type === 'answer' && !entry.pc.remoteDescription) {
          await entry.pc.setRemoteDescription(parse(signal));
          for (const candidate of entry.pending.splice(0)) await entry.pc.addIceCandidate(candidate);
        } else if (signal.type === 'candidate') {
          if (entry.pc.remoteDescription) await entry.pc.addIceCandidate(parse(signal));
          else entry.pending.push(parse(signal));
        } else if (signal.type === 'hangup') {
          closePeer(from);
          setRemote(from, { stream: null, status: 'ended' });
        }
      };
      handle().catch((nextError) => setError(nextError?.message || 'Videokõne signaali ei saanud töödelda.'));
    }, (nextError) => setError(nextError?.message || 'Videokõnet ei saanud jälgida.'));
  }, [answer, closePeer, me, roomId, service, setRemote]);

  // presence: heartbeat and who is here
  const myName = participants.find((item) => item.uid === me)?.name || user.displayName || '';
  useEffect(() => {
    if (!roomId) return undefined;
    const beat = () => service.heartbeat(roomId, { uid: me, role, displayName: myName }).catch(() => {});
    beat();
    const heartbeat = globalThis.setInterval(beat, 20_000);
    const clock = globalThis.setInterval(() => setNow(Date.now()), 5_000);
    const unsubscribe = service.subscribePresence(roomId, setPresence, () => {});
    return () => {
      globalThis.clearInterval(heartbeat);
      globalThis.clearInterval(clock);
      unsubscribe?.();
      service.heartbeat(roomId, { uid: me, role, displayName: myName, online: false }).catch(() => {});
    };
  }, [me, myName, role, roomId, service]);
  const online = useMemo(() => new Set(presence.filter((item) => presenceIsFresh(item, now)).map((item) => item.uid)), [now, presence]);

  // with my camera on: offer to everyone online I initiate for (again when someone comes back), answer waiting offers
  const onlineKey = [...online].sort().join(',');
  useEffect(() => {
    if (!hasLocalMedia) return;
    for (const other of others) {
      const pending = pendingOffers.current.get(other.uid);
      if (pending) { pendingOffers.current.delete(other.uid); answer(pending).catch((nextError) => setError(nextError?.message || 'Ühendust ei saanud luua.')); continue; }
      const entry = peers.current.get(other.uid);
      const live = entry && ['new', 'connecting', 'connected'].includes(entry.pc.connectionState);
      if (isInitiator(me, other.uid) && online.has(other.uid) && !live) offerTo.current?.(other.uid).catch((nextError) => setError(nextError?.message || 'Ühendust ei saanud luua.'));
    }
  }, [hasLocalMedia, onlineKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    setBusy(true);
    setError('');
    try {
      // phones: a camera that cannot be opened as asked falls back to a plain camera, then to the microphone only
      const { stream } = await openMedia(mediaDevices, mediaConstraints());
      localRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setLocalStream(stream);
      setHasLocalMedia(true);
    } catch (nextError) {
      setError(nextError?.message || 'Kaamerat ei saanud käivitada.');
    } finally {
      setBusy(false);
    }
  };

  const hangUp = useCallback(() => {
    for (const [uid, entry] of peers.current) { send(uid, 'hangup', {}, entry.sessionId); closePeer(uid); }
    localRef.current?.getTracks().forEach((track) => track.stop());
    localRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setLocalStream(null);
    setHasLocalMedia(false);
    setRemotes({});
  }, [closePeer, send]);
  useEffect(() => () => {
    for (const uid of [...peers.current.keys()]) closePeer(uid);
    localRef.current?.getTracks().forEach((track) => track.stop());
  }, [closePeer]);

  const toggle = (kind) => {
    const tracks = kind === 'audio' ? localRef.current?.getAudioTracks() : localRef.current?.getVideoTracks();
    const next = !(kind === 'audio' ? audioEnabled : videoEnabled);
    (tracks || []).forEach((track) => { track.enabled = next; });
    if (kind === 'audio') setAudioEnabled(next); else setVideoEnabled(next);
  };

  const tiles = others.map((other) => ({ ...other, online: online.has(other.uid), stream: remotes[other.uid]?.stream || null, status: remotes[other.uid]?.status || '' }));
  return {
    participants, tiles, hasLocalMedia, localStream, audioEnabled, videoEnabled, error, busy, localVideoRef,
    start, hangUp, toggleAudio: () => toggle('audio'), toggleVideo: () => toggle('video'),
  };
}
