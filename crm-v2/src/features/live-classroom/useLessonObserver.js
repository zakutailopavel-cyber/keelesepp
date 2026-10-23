/* global setInterval, clearInterval */
import { useCallback, useEffect, useRef, useState } from 'react';
import { liveLessonObserversService } from '../../services/firebase/liveLessonObservers.js';
import { liveTurnService } from '../../services/firebase/liveTurn.js';
import { callIceServers } from './useLiveCall.js';

// Administrator watching a lesson (owner, 2026-10-14: „именно подключиться”). The 1:1 call between the teacher and
// the student stays as it is; the observer has one extra connection to each of them: the observer offers, the
// participant answers with their camera and microphone. Watching, the observer sends nothing (recvonly); „Räägi kaasa”
// (owner 2026-10-23: „как будто групповой созвон”) offers again with the observer's microphone and camera, and the
// teacher and the student hear and see the observer. Both sides see „Administraator vaatab tundi”.

const OLD_SIGNAL_MS = 2 * 60 * 1000;
// the observer page renews its entry; a closed tab stops renewing and the badge goes away by itself
export const OBSERVER_HEARTBEAT_MS = 20000;
export const OBSERVER_STALE_MS = 60000;
export const liveObservers = (items = [], now = Date.now()) => items.filter((item) => item.active === true
  && now - Date.parse(item.lastSeenIso || 0) < OBSERVER_STALE_MS);
const RETRY_MS = 15000;
const parse = (signal) => { try { return JSON.parse(signal?.payload || '{}'); } catch { return {}; } };
const fresh = (signal) => !signal.createdAtIso || Date.now() - Date.parse(signal.createdAtIso) < OLD_SIGNAL_MS;
const newSessionId = () => globalThis.crypto?.randomUUID?.() || `o-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function defaultPeerFactory(iceServers) {
  if (!globalThis.RTCPeerConnection) throw new Error('See brauser ei toeta videokõnet.');
  return new globalThis.RTCPeerConnection({ iceServers });
}

async function iceServersFor(turnService, invitationId) {
  try { const result = await turnService?.iceServers?.(invitationId); return callIceServers(result?.iceServers || []); } catch { return callIceServers([]); }
}

// Teacher's and student's side: answer the observers with the local camera and microphone.
export function useObserverPeers({
  invitationId, user, localStream, enabled = true,
  service = liveLessonObserversService, turnService = liveTurnService, peerFactory = defaultPeerFactory,
}) {
  const [entries, setEntries] = useState([]);
  // what a speaking observer sends (uid → MediaStream); nothing while the observer only watches
  const [observerStreams, setObserverStreams] = useState({});
  const [now, setNow] = useState(() => Date.now());
  const observers = liveObservers(entries, now);
  const peersRef = useRef(new Map());
  const pendingRef = useRef(new Map());
  // the observer's ICE candidates follow its offer at once, while this side is still fetching TURN or has no camera
  // yet: they wait here by session, or the connection would only work on one network (owner's first real use)
  const earlyRef = useRef(new Map());
  const streamRef = useRef(localStream);
  const me = user?.uid || '';

  const close = useCallback((observerUid) => {
    const entry = peersRef.current.get(observerUid);
    if (entry) { try { entry.pc?.close(); } catch { /* closed */ } peersRef.current.delete(observerUid); }
    setObserverStreams((current) => { if (!(observerUid in current)) return current; const next = { ...current }; delete next[observerUid]; return next; });
  }, []);

  const answer = useCallback(async (signal) => {
    const stream = streamRef.current;
    if (!stream) { pendingRef.current.set(signal.observerUid, signal); return; }
    pendingRef.current.delete(signal.observerUid);
    const current = peersRef.current.get(signal.observerUid);
    if (current?.sessionId === signal.sessionId) return; // this offer is already being answered
    close(signal.observerUid);
    // registered before any await: candidates of this session that arrive meanwhile are kept, not dropped
    const entry = { pc: null, sessionId: signal.sessionId, candidates: earlyRef.current.get(signal.sessionId) || [] };
    earlyRef.current.delete(signal.sessionId);
    peersRef.current.set(signal.observerUid, entry);
    const pc = peerFactory(await iceServersFor(turnService, invitationId));
    if (peersRef.current.get(signal.observerUid) !== entry) { try { pc.close(); } catch { /* closed */ } return; }
    entry.pc = pc;
    const send = (type, payload) => service.sendSignal(invitationId, { type, sessionId: signal.sessionId, observerUid: signal.observerUid, fromUid: me, toUid: signal.observerUid, payload }).catch(() => {});
    pc.onicecandidate = (event) => { if (event.candidate) send('candidate', event.candidate.toJSON ? event.candidate.toJSON() : event.candidate); };
    // a speaking observer's microphone and camera: kept until this connection closes
    pc.ontrack = (event) => {
      if (peersRef.current.get(signal.observerUid) !== entry) return;
      const stream = event.streams?.[0] || new globalThis.MediaStream([event.track]);
      setObserverStreams((current) => ({ ...current, [signal.observerUid]: stream }));
    };
    await pc.setRemoteDescription(parse(signal));
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    const local = await pc.createAnswer();
    await pc.setLocalDescription(local);
    await send('answer', { type: local.type, sdp: local.sdp });
    for (const candidate of entry.candidates.splice(0)) await pc.addIceCandidate(candidate).catch(() => {});
  }, [close, invitationId, me, peerFactory, service, turnService]);

  useEffect(() => {
    if (!enabled || !invitationId) return undefined;
    // never breaks the lesson room: without the observer channel the lesson goes on as before
    const timer = setInterval(() => setNow(Date.now()), OBSERVER_HEARTBEAT_MS / 2);
    let unsubscribe = () => {};
    try { unsubscribe = service.subscribeObservers(invitationId, setEntries, () => setEntries([])); } catch { /* no observer channel */ }
    return () => { clearInterval(timer); unsubscribe(); };
  }, [enabled, invitationId, service]);

  useEffect(() => {
    if (!enabled || !invitationId || !me) return undefined;
    let unsubscribe = () => {};
    try { unsubscribe = service.subscribeSignals(invitationId, me, (signal) => {
      if (!fresh(signal)) return;
      if (signal.type === 'offer') { answer(signal).catch(() => close(signal.observerUid)); return; }
      const entry = peersRef.current.get(signal.observerUid);
      if (!entry || entry.sessionId !== signal.sessionId) {
        if (signal.type === 'candidate') {
          const early = earlyRef.current.get(signal.sessionId) || [];
          if (early.length < 200) earlyRef.current.set(signal.sessionId, [...early, parse(signal)]);
        }
        return;
      }
      if (signal.type === 'hangup') { close(signal.observerUid); return; }
      if (signal.type === 'candidate') {
        if (entry.pc?.remoteDescription) entry.pc.addIceCandidate(parse(signal)).catch(() => {});
        else entry.candidates.push(parse(signal));
      }
    }, () => {}); } catch { return undefined; }
    const peers = peersRef.current;
    return () => { unsubscribe(); [...peers.keys()].forEach(close); };
  }, [answer, close, enabled, invitationId, me, service]);

  // the camera or microphone changed (device switch, call started): the observers get the new tracks
  useEffect(() => {
    streamRef.current = localStream;
    if (!localStream) return;
    peersRef.current.forEach(({ pc }) => {
      if (!pc) return;
      localStream.getTracks().forEach((track) => {
        const sender = pc.getSenders?.().find((item) => item.track?.kind === track.kind);
        if (sender?.replaceTrack) sender.replaceTrack(track).catch(() => {});
      });
    });
    [...pendingRef.current.values()].forEach((signal) => answer(signal).catch(() => {}));
  }, [answer, localStream]);

  // an observer who left: close the connection
  const activeKey = observers.map((item) => item.uid || item.id).sort().join('|');
  useEffect(() => {
    const active = new Set(activeKey.split('|').filter(Boolean));
    [...peersRef.current.keys()].filter((uid) => !active.has(uid)).forEach(close);
  }, [activeKey, close]);

  return { observers, streams: observerStreams };
}

// Administrator's side: one receive-only connection to the teacher and one to the student.
export function useObserveLesson({
  invitation, user, localStream = null, service = liveLessonObserversService, turnService = liveTurnService, peerFactory = defaultPeerFactory,
}) {
  const localRef = useRef(localStream);
  useEffect(() => { localRef.current = localStream; }, [localStream]);
  const [streams, setStreams] = useState({});
  const [states, setStates] = useState({});
  const [error, setError] = useState('');
  const peersRef = useRef(new Map());
  const invitationId = invitation?.id || '';
  const open = invitation?.status === 'accepted';
  const targets = open ? [invitation.teacherUid, invitation.studentUid].filter(Boolean) : [];
  const targetKey = targets.join('|');
  const me = user?.uid || '';

  const connect = useCallback(async (target) => {
    const previous = peersRef.current.get(target);
    if (previous) { try { previous.pc.close(); } catch { /* closed */ } }
    const sessionId = newSessionId();
    const pc = peerFactory(await iceServersFor(turnService, invitationId));
    const entry = { pc, sessionId, candidates: [], startedAt: Date.now() };
    peersRef.current.set(target, entry);
    const send = (type, payload) => service.sendSignal(invitationId, { type, sessionId, observerUid: me, fromUid: me, toUid: target, payload });
    // watching: receive only; speaking: the observer's own microphone and camera go both ways
    const own = localRef.current;
    ['audio', 'video'].forEach((kind) => {
      const track = own?.getTracks().find((item) => item.kind === kind);
      if (track) pc.addTransceiver(track, { direction: 'sendrecv', streams: [own] });
      else pc.addTransceiver(kind, { direction: 'recvonly' });
    });
    pc.ontrack = (event) => {
      const stream = event.streams?.[0] || new globalThis.MediaStream([event.track]);
      setStreams((current) => ({ ...current, [target]: stream }));
    };
    pc.onicecandidate = (event) => { if (event.candidate) send('candidate', event.candidate.toJSON ? event.candidate.toJSON() : event.candidate).catch(() => {}); };
    pc.onconnectionstatechange = () => setStates((current) => ({ ...current, [target]: pc.connectionState }));
    // before the offer goes out: the answer (and 'connected') can arrive before the write is acknowledged
    setStates((current) => ({ ...current, [target]: 'connecting' }));
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await send('offer', { type: offer.type, sdp: offer.sdp });
  }, [invitationId, me, peerFactory, service, turnService]);

  useEffect(() => {
    if (!open || !invitationId || !me) return undefined;
    let stopped = false;
    service.setPresence(invitationId, user, true).catch((nextError) => setError(nextError?.message || 'Tundi ei saanud avada.'));
    const heartbeat = setInterval(() => { service.setPresence(invitationId, user, true).catch(() => {}); }, OBSERVER_HEARTBEAT_MS);
    const leave = () => { service.setPresence(invitationId, user, false).catch(() => {}); };
    globalThis.addEventListener?.('pagehide', leave);
    const unsubscribe = service.subscribeSignals(invitationId, me, (signal) => {
      const entry = peersRef.current.get(signal.fromUid);
      if (!entry || entry.sessionId !== signal.sessionId) return;
      if (signal.type === 'answer') {
        entry.pc.setRemoteDescription(parse(signal))
          .then(async () => { for (const candidate of entry.candidates.splice(0)) await entry.pc.addIceCandidate(candidate).catch(() => {}); })
          .catch(() => {});
      } else if (signal.type === 'candidate') {
        if (entry.pc.remoteDescription) entry.pc.addIceCandidate(parse(signal)).catch(() => {});
        else entry.candidates.push(parse(signal));
      }
    }, (nextError) => setError(nextError?.message || 'Ühendus katkes.'));
    const list = targetKey.split('|').filter(Boolean);
    list.forEach((target) => connect(target).catch((nextError) => setError(nextError?.message || 'Ühendust ei saanud luua.')));
    // a participant who has not started the camera yet, reloaded the page or lost the network: offer again
    const timer = setInterval(() => {
      if (stopped) return;
      list.forEach((target) => {
        const entry = peersRef.current.get(target);
        const state = entry?.pc.connectionState;
        if (!entry || ((state === 'failed' || state === 'disconnected' || state === 'closed' || !entry.pc.remoteDescription) && Date.now() - entry.startedAt > RETRY_MS)) {
          connect(target).catch(() => {});
        }
      });
    }, RETRY_MS / 3);
    const peers = peersRef.current;
    return () => {
      stopped = true;
      clearInterval(timer);
      clearInterval(heartbeat);
      globalThis.removeEventListener?.('pagehide', leave);
      unsubscribe();
      peers.forEach((entry, target) => {
        service.sendSignal(invitationId, { type: 'hangup', sessionId: entry.sessionId, observerUid: me, fromUid: me, toUid: target, payload: {} }).catch(() => {});
        try { entry.pc.close(); } catch { /* closed */ }
      });
      peers.clear();
      service.setPresence(invitationId, user, false).catch(() => {});
    };
    // once per room and target pair: a new user object or callback must not reconnect the call
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invitationId, me, targetKey]);

  // „Räägi kaasa” on or off: offer again to both, now with (or without) the observer's microphone and camera
  const speakingKey = localStream?.id || '';
  const firstSpeak = useRef(true);
  useEffect(() => {
    if (firstSpeak.current) { firstSpeak.current = false; return; }
    if (!open || !invitationId || !me) return;
    targetKey.split('|').filter(Boolean).forEach((target) => {
      const previous = peersRef.current.get(target);
      if (previous) service.sendSignal(invitationId, { type: 'hangup', sessionId: previous.sessionId, observerUid: me, fromUid: me, toUid: target, payload: {} }).catch(() => {});
      connect(target).catch((nextError) => setError(nextError?.message || 'Ühendust ei saanud luua.'));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingKey]);

  return { streams, states, error };
}

