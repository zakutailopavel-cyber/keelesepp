import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { liveLessonCallSignalsService } from '../../services/firebase/liveLessonCallSignals.js';
import { liveLessonPresenceService, presenceIsFresh } from '../../services/firebase/liveLessonPresence.js';
import { liveTurnService } from '../../services/firebase/liveTurn.js';

export const STUN_SERVERS = Object.freeze([
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
]);
const TURN_WAIT_MS = 3000;
// automatic recovery (teacher side): a „disconnected” peer often heals by itself, so it gets a grace period first
export const DISCONNECT_GRACE_MS = 8000;
export const RECOVERY_DELAY_MS = 1500;
export const MAX_AUTO_RECOVERIES = 3;

function defaultPeerFactory(iceServers = STUN_SERVERS) {
  if (!globalThis.RTCPeerConnection) throw new Error('See brauser ei toeta videokõnet.');
  return new globalThis.RTCPeerConnection({ iceServers });
}

// STUN first, then the TURN relay (used only when a direct connection is impossible: strict firewalls, mobile NAT).
export function callIceServers(turnServers = []) {
  return [...STUN_SERVERS, ...turnServers];
}

const DEVICES_KEY = 'keelesepp.liveDevices';
function savedDevices() {
  try { return JSON.parse(globalThis.localStorage?.getItem(DEVICES_KEY) || '{}') || {}; } catch { return {}; }
}
function saveDevices(value) {
  try { globalThis.localStorage?.setItem(DEVICES_KEY, JSON.stringify(value)); } catch { /* private mode */ }
}
// camera/microphone constraints; a remembered device is preferred („ideal”), so a missing one never blocks the call
export function mediaConstraints({ audioId = '', videoId = '' } = {}) {
  return {
    audio: audioId ? { deviceId: { ideal: audioId } } : true,
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, ...(videoId ? { deviceId: { ideal: videoId } } : { facingMode: 'user' }) },
  };
}

function createSessionId() {
  return globalThis.crypto?.randomUUID?.() || `call-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function signalPayload(signal) {
  try {
    return JSON.parse(signal?.payload || '{}');
  } catch {
    throw new Error('Videokõne signaal on vigane.');
  }
}

export function statusText(status, role, teacherReady) {
  if (status === 'connected') return 'Ühendatud';
  if (status === 'connecting') return 'Ühendan…';
  if (status === 'reconnecting') return 'Ühendus katkes, taastan…';
  if (status === 'waiting') return role === 'teacher' ? 'Ootan õpilast…' : 'Ootan õpetaja kõnet…';
  if (status === 'failed') return 'Ühendus ebaõnnestus';
  if (status === 'ended') return 'Kõne lõpetatud';
  if (role === 'student' && teacherReady) return 'Õpetaja kõne on valmis';
  return 'Videokõne pole veel käivitatud';
}

// WebRTC call of a Live Classroom room (offer/answer + ICE over Firestore signals, presence heartbeat, screen share).
// Used by the room top bar and video tiles (LiveRoom) and by the standalone LiveLessonCallPanel.
export function useLiveCall({
  invitation,
  role,
  user,
  signalService = liveLessonCallSignalsService,
  presenceService = liveLessonPresenceService,
  mediaDevices = globalThis.navigator?.mediaDevices,
  peerFactory = defaultPeerFactory,
  turnService = liveTurnService,
  onMediaStreams,
}) {
  // TURN credentials are fetched as soon as the room is open, so they are usually ready before the call starts.
  const turnRef = useRef({ servers: [], expiresAt: 0, pending: null });
  const loadTurn = useCallback(() => {
    const current = turnRef.current;
    if (current.pending) return current.pending;
    if (current.servers.length && Date.now() < current.expiresAt) return Promise.resolve(current.servers);
    const pending = Promise.resolve()
      .then(() => turnService?.iceServers?.(invitation?.id))
      .then((result) => {
        const servers = Array.isArray(result?.iceServers) ? result.iceServers : [];
        // refresh after half the lifetime, so a credential never expires in the middle of a reconnect
        turnRef.current = { servers, expiresAt: Date.now() + Math.max(0, Number(result?.ttl) || 0) * 500, pending: null };
        return servers;
      })
      .catch(() => {
        turnRef.current = { ...turnRef.current, pending: null };
        return [];
      });
    turnRef.current = { ...current, pending };
    return pending;
  }, [invitation?.id, turnService]);
  const waitForTurn = useCallback(() => Promise.race([
    loadTurn(),
    new Promise((resolve) => { globalThis.setTimeout(() => resolve([]), TURN_WAIT_MS); }),
  ]), [loadTurn]);
  useEffect(() => {
    if (invitation?.status === 'accepted') loadTurn();
  }, [invitation?.status, loadTurn]);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const sessionIdRef = useRef('');
  const pendingOfferRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const processedSignalsRef = useRef(new Set());
  const recoveryRef = useRef({ timer: null, attempts: 0 });
  const restartRef = useRef(null);
  // room data channel (teacher's page and pointer): created by the teacher with every offer, received by the student
  const channelRef = useRef(null);
  const roomListenerRef = useRef(null);
  const [roomChannelOpen, setRoomChannelOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [busy, setBusy] = useState(false);
  const [screenBusy, setScreenBusy] = useState(false);
  const [error, setError] = useState('');
  const [hasLocalMedia, setHasLocalMedia] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [teacherReady, setTeacherReady] = useState(false);
  const [presence, setPresence] = useState([]);
  const [presenceNow, setPresenceNow] = useState(() => Date.now());
  // chosen camera and microphone (remembered in this browser) and the list the browser offers
  const [devices, setDevices] = useState({ audio: [], video: [] });
  const [selected, setSelected] = useState(() => {
    const value = savedDevices();
    return { audioId: String(value.audioId || ''), videoId: String(value.videoId || '') };
  });
  const [deviceBusy, setDeviceBusy] = useState(false);
  // lesson recording listens to the teacher's own stream and the student's incoming stream
  const onMediaStreamsRef = useRef(onMediaStreams);
  useEffect(() => { onMediaStreamsRef.current = onMediaStreams; }, [onMediaStreams]);
  const streamsRef = useRef({ local: null, remote: null });
  const reportStreams = useCallback((patch) => {
    streamsRef.current = { ...streamsRef.current, ...patch };
    onMediaStreamsRef.current?.(streamsRef.current);
  }, []);

  const participant = useMemo(() => ({
    uid: user.uid,
    role,
    displayName: role === 'teacher' ? invitation.teacherName : invitation.studentName,
  }), [invitation.studentName, invitation.teacherName, role, user.uid]);

  const peerRole = role === 'teacher' ? 'student' : 'teacher';
  const peerPresence = presence.find((item) => item.role === peerRole);
  const peerOnline = presenceIsFresh(peerPresence, presenceNow);
  const peerName = role === 'teacher' ? invitation.studentName : invitation.teacherName;

  const attachLocalStream = useCallback((stream) => {
    if (localVideoRef.current) localVideoRef.current.srcObject = stream || null;
  }, []);

  const clearRecovery = useCallback(() => {
    if (recoveryRef.current.timer) globalThis.clearTimeout(recoveryRef.current.timer);
    recoveryRef.current.timer = null;
  }, []);

  // The teacher re-offers on a fresh session when the connection drops; the student answers it automatically
  // (camera already on). Bounded: after MAX_AUTO_RECOVERIES failed tries the manual „Taasta ühendus” stays.
  const scheduleRecovery = useCallback((delay) => {
    if (role !== 'teacher' || recoveryRef.current.timer || !localStreamRef.current) return false;
    if (recoveryRef.current.attempts >= MAX_AUTO_RECOVERIES) return false;
    const peer = peerRef.current;
    recoveryRef.current.timer = globalThis.setTimeout(() => {
      recoveryRef.current.timer = null;
      if (peerRef.current !== peer || !localStreamRef.current) return;
      if (peer?.connectionState === 'connected') return;
      recoveryRef.current.attempts += 1;
      restartRef.current?.();
    }, delay);
    return true;
  }, [role]);

  const wireChannel = useCallback((channel) => {
    channelRef.current = channel;
    channel.onopen = () => { if (channelRef.current === channel) setRoomChannelOpen(true); };
    channel.onclose = () => { if (channelRef.current === channel) setRoomChannelOpen(false); };
    channel.onmessage = (event) => {
      let message = null;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message && typeof message === 'object') roomListenerRef.current?.(message);
    };
    if (channel.readyState === 'open') setRoomChannelOpen(true);
  }, []);

  const closePeer = useCallback(() => {
    clearRecovery();
    const channel = channelRef.current;
    channelRef.current = null;
    if (channel) {
      channel.onopen = null; channel.onclose = null; channel.onmessage = null;
      try { channel.close?.(); } catch { /* already closed */ }
    }
    setRoomChannelOpen(false);
    const peer = peerRef.current;
    if (peer) {
      peer.ondatachannel = null;
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.close();
    }
    peerRef.current = null;
    sessionIdRef.current = '';
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    reportStreams({ remote: null });
  }, [clearRecovery, reportStreams]);

  const stopScreenTracks = useCallback(() => {
    const stream = screenStreamRef.current;
    if (stream) stream.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    screenStreamRef.current = null;
    setScreenSharing(false);
  }, []);

  const stopLocalMedia = useCallback(() => {
    stopScreenTracks();
    const stream = localStreamRef.current;
    if (stream) stream.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    attachLocalStream(null);
    reportStreams({ local: null });
    setHasLocalMedia(false);
    setAudioEnabled(true);
    setVideoEnabled(true);
  }, [attachLocalStream, reportStreams, stopScreenTracks]);

  const resetCall = useCallback((nextStatus = 'idle', stopMedia = true) => {
    closePeer();
    if (stopMedia) stopLocalMedia();
    pendingCandidatesRef.current = [];
    setStatus(nextStatus);
  }, [closePeer, stopLocalMedia]);

  const sendSignal = useCallback(async (type, payload, sessionId) => {
    await signalService.send(invitation.id, {
      type,
      payload,
      sessionId,
      senderUid: user.uid,
      senderRole: role,
    });
  }, [invitation.id, role, signalService, user.uid]);

  const makePeer = useCallback((sessionId) => {
    closePeer();
    const peer = peerFactory(callIceServers(turnRef.current.servers));
    peerRef.current = peer;
    sessionIdRef.current = sessionId;

    const cameraStream = localStreamRef.current;
    const screenStream = screenStreamRef.current;
    cameraStream?.getAudioTracks().forEach((track) => peer.addTrack(track, cameraStream));
    const outboundVideoTrack = screenStream?.getVideoTracks?.()[0] || cameraStream?.getVideoTracks?.()[0];
    if (outboundVideoTrack) peer.addTrack(outboundVideoTrack, screenStream || cameraStream);

    if (role === 'teacher' && typeof peer.createDataChannel === 'function') {
      try { wireChannel(peer.createDataChannel('room')); } catch { /* call works without it */ }
    }
    peer.ondatachannel = (event) => { if (event.channel?.label === 'room') wireChannel(event.channel); };
    peer.ontrack = (event) => {
      const remoteStream = event.streams?.[0];
      if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
      if (remoteStream) reportStreams({ remote: remoteStream });
    };
    peer.onicecandidate = (event) => {
      if (!event.candidate) return;
      const payload = event.candidate.toJSON ? event.candidate.toJSON() : event.candidate;
      sendSignal('candidate', payload, sessionId).catch((nextError) => setError(nextError.message));
    };
    peer.onconnectionstatechange = () => {
      const next = peer.connectionState;
      if (peerRef.current !== peer) return;
      if (next === 'connected') {
        clearRecovery();
        recoveryRef.current.attempts = 0;
        setStatus('connected');
      } else if (next === 'connecting' || next === 'new') setStatus('connecting');
      else if (next === 'failed') {
        clearRecovery();
        setStatus(scheduleRecovery(RECOVERY_DELAY_MS) ? 'reconnecting' : 'failed');
      } else if (next === 'disconnected') {
        setStatus('reconnecting');
        scheduleRecovery(DISCONNECT_GRACE_MS);
      } else if (next === 'closed') setStatus('ended');
    };
    return peer;
  }, [clearRecovery, closePeer, peerFactory, reportStreams, role, scheduleRecovery, sendSignal, wireChannel]);

  const flushCandidates = useCallback(async (sessionId) => {
    const peer = peerRef.current;
    if (!peer || sessionIdRef.current !== sessionId || !peer.remoteDescription) return;
    const pending = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];
    for (const signal of pending) {
      if (signal.sessionId !== sessionId) {
        pendingCandidatesRef.current.push(signal);
        continue;
      }
      await peer.addIceCandidate(signalPayload(signal));
    }
  }, []);

  const ensureLocalMedia = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    if (!mediaDevices?.getUserMedia) throw new Error('Kaamera ja mikrofoni kasutamine pole selles brauseris saadaval.');
    // camera permission and TURN credentials in parallel: the first peer then already has the relay
    const [stream] = await Promise.all([
      mediaDevices.getUserMedia(mediaConstraints(selected)),
      waitForTurn(),
    ]);
    localStreamRef.current = stream;
    attachLocalStream(stream);
    reportStreams({ local: stream });
    setHasLocalMedia(true);
    setAudioEnabled(stream.getAudioTracks().some((track) => track.enabled !== false));
    setVideoEnabled(stream.getVideoTracks().some((track) => track.enabled !== false));
    return stream;
  }, [attachLocalStream, mediaDevices, reportStreams, selected, waitForTurn]);

  const answerOffer = useCallback(async (signal) => {
    if (role !== 'student' || !localStreamRef.current) return;
    const peer = makePeer(signal.sessionId);
    await peer.setRemoteDescription(signalPayload(signal));
    await flushCandidates(signal.sessionId);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    await sendSignal('answer', answer.toJSON ? answer.toJSON() : answer, signal.sessionId);
    setStatus('connecting');
  }, [flushCandidates, makePeer, role, sendSignal]);

  const stopScreenShare = useCallback(async () => {
    const screenStream = screenStreamRef.current;
    if (!screenStream) return;
    const cameraStream = localStreamRef.current;
    const cameraTrack = cameraStream?.getVideoTracks?.()[0] || null;
    const sender = peerRef.current?.getSenders?.().find((item) => item.track?.kind === 'video');
    try {
      if (sender?.replaceTrack) await sender.replaceTrack(cameraTrack);
    } finally {
      stopScreenTracks();
      attachLocalStream(cameraStream);
    }
  }, [attachLocalStream, stopScreenTracks]);

  const startScreenShare = async () => {
    if (role !== 'teacher') return;
    setScreenBusy(true);
    setError('');
    try {
      if (!mediaDevices?.getDisplayMedia) throw new Error('Ekraani jagamine pole selles brauseris saadaval.');
      const peer = peerRef.current;
      const sender = peer?.getSenders?.().find((item) => item.track?.kind === 'video');
      if (!peer || !sender?.replaceTrack) throw new Error('Käivita enne videokõne.');
      const stream = await mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = stream.getVideoTracks?.()[0];
      if (!track) {
        stream.getTracks?.().forEach((item) => item.stop());
        throw new Error('Ekraani videorada ei leitud.');
      }
      screenStreamRef.current = stream;
      track.onended = () => {
        stopScreenShare().catch((nextError) => setError(nextError.message || 'Ekraani jagamist ei saanud lõpetada.'));
      };
      await sender.replaceTrack(track);
      attachLocalStream(stream);
      setScreenSharing(true);
    } catch (nextError) {
      if (screenStreamRef.current) stopScreenTracks();
      setError(nextError.message || 'Ekraani jagamist ei saanud käivitada.');
    } finally {
      setScreenBusy(false);
    }
  };

  useEffect(() => {
    const unsubscribe = signalService.subscribe(
      invitation.id,
      (signal) => {
        if (!signal?.id || processedSignalsRef.current.has(signal.id)) return;
        processedSignalsRef.current.add(signal.id);
        if (signal.senderUid === user.uid) return;

        const handle = async () => {
          if (signal.type === 'offer' && role === 'student') {
            pendingOfferRef.current = signal;
            setTeacherReady(true);
            if (localStreamRef.current) await answerOffer(signal);
            return;
          }
          if (signal.type === 'answer' && role === 'teacher') {
            const peer = peerRef.current;
            if (!peer || sessionIdRef.current !== signal.sessionId || peer.remoteDescription) return;
            await peer.setRemoteDescription(signalPayload(signal));
            await flushCandidates(signal.sessionId);
            return;
          }
          if (signal.type === 'candidate') {
            const peer = peerRef.current;
            if (!peer || sessionIdRef.current !== signal.sessionId || !peer.remoteDescription) {
              pendingCandidatesRef.current.push(signal);
              return;
            }
            await peer.addIceCandidate(signalPayload(signal));
            return;
          }
          if (signal.type === 'hangup' && (sessionIdRef.current === signal.sessionId || pendingOfferRef.current?.sessionId === signal.sessionId)) {
            pendingOfferRef.current = null;
            setTeacherReady(false);
            resetCall('ended', true);
          }
        };

        handle().catch((nextError) => {
          setError(nextError.message || 'Videokõne signaali ei saanud töödelda.');
          setStatus('failed');
        });
      },
      (nextError) => setError(nextError?.message || 'Videokõne ühendust ei saanud jälgida.'),
    );
    return () => unsubscribe?.();
  }, [answerOffer, flushCandidates, invitation.id, resetCall, role, signalService, user.uid]);

  useEffect(() => {
    let alive = true;
    const reportPresence = () => presenceService.heartbeat(invitation.id, participant).catch((nextError) => {
      if (alive) setError(nextError?.message || 'Kohalolekut ei saanud uuendada.');
    });
    reportPresence();
    const heartbeatTimer = window.setInterval(reportPresence, 20_000);
    const freshnessTimer = window.setInterval(() => setPresenceNow(Date.now()), 5_000);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') reportPresence();
    };
    document.addEventListener('visibilitychange', onVisibility);
    const unsubscribe = presenceService.subscribe(
      invitation.id,
      (items) => { if (alive) setPresence(items); },
      (nextError) => { if (alive) setError(nextError?.message || 'Kohalolekut ei saanud jälgida.'); },
    );
    return () => {
      alive = false;
      window.clearInterval(heartbeatTimer);
      window.clearInterval(freshnessTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      unsubscribe?.();
      presenceService.markOffline(invitation.id, participant).catch(() => {});
    };
  }, [invitation.id, participant, presenceService]);

  useEffect(() => () => {
    closePeer();
    const screenStream = screenStreamRef.current;
    screenStream?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    screenStreamRef.current = null;
    const stream = localStreamRef.current;
    stream?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }, [closePeer]);

  const sendOffer = async () => {
    pendingCandidatesRef.current = [];
    const sessionId = createSessionId();
    const peer = makePeer(sessionId);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    await sendSignal('offer', offer.toJSON ? offer.toJSON() : offer, sessionId);
    return peer;
  };

  restartRef.current = async () => {
    try {
      const peer = await sendOffer();
      if (peerRef.current === peer && peer.connectionState !== 'connected') setStatus('reconnecting');
    } catch (nextError) {
      setError(nextError.message || 'Ühendust ei saanud taastada.');
      setStatus('failed');
    }
  };

  // the student came back (page reload, network back) or this browser is online again: try again from the start
  const peerWasOnlineRef = useRef(peerOnline);
  useEffect(() => {
    const cameBack = peerOnline && !peerWasOnlineRef.current;
    peerWasOnlineRef.current = peerOnline;
    if (cameBack && ['failed', 'reconnecting'].includes(status)) {
      recoveryRef.current.attempts = 0;
      clearRecovery();
      if (scheduleRecovery(RECOVERY_DELAY_MS)) setStatus('reconnecting');
    }
  }, [clearRecovery, peerOnline, scheduleRecovery, status]);
  useEffect(() => {
    if (role !== 'teacher' || !['failed', 'reconnecting'].includes(status)) return undefined;
    const onOnline = () => {
      recoveryRef.current.attempts = 0;
      clearRecovery();
      if (scheduleRecovery(RECOVERY_DELAY_MS)) setStatus('reconnecting');
    };
    globalThis.addEventListener?.('online', onOnline);
    return () => globalThis.removeEventListener?.('online', onOnline);
  }, [clearRecovery, role, scheduleRecovery, status]);

  const startTeacherCall = async () => {
    setBusy(true);
    setError('');
    recoveryRef.current.attempts = 0;
    try {
      await ensureLocalMedia();
      await sendOffer();
      setStatus('waiting');
    } catch (nextError) {
      resetCall('failed', true);
      setError(nextError.message || 'Videokõnet ei saanud käivitada.');
    } finally {
      setBusy(false);
    }
  };

  const joinStudentCall = async () => {
    setBusy(true);
    setError('');
    try {
      await ensureLocalMedia();
      const offer = pendingOfferRef.current;
      if (offer) await answerOffer(offer);
      else setStatus('waiting');
    } catch (nextError) {
      resetCall('failed', true);
      setError(nextError.message || 'Videokõnega ei saanud liituda.');
    } finally {
      setBusy(false);
    }
  };

  const hangUp = async () => {
    const sessionId = sessionIdRef.current || pendingOfferRef.current?.sessionId;
    setBusy(true);
    setError('');
    try {
      if (sessionId) await sendSignal('hangup', {}, sessionId);
    } catch (nextError) {
      setError(nextError.message || 'Kõne lõpetamise signaali ei saanud saata.');
    } finally {
      pendingOfferRef.current = null;
      setTeacherReady(false);
      recoveryRef.current.attempts = 0;
      resetCall('ended', true);
      setBusy(false);
    }
  };

  const toggleAudio = () => {
    const tracks = localStreamRef.current?.getAudioTracks() || [];
    const next = !audioEnabled;
    tracks.forEach((track) => { track.enabled = next; });
    setAudioEnabled(next);
  };

  const toggleVideo = () => {
    const tracks = localStreamRef.current?.getVideoTracks() || [];
    const next = !videoEnabled;
    tracks.forEach((track) => { track.enabled = next; });
    setVideoEnabled(next);
  };

  // device list: labels are only shown after the camera permission, so it is read when local media starts
  const refreshDevices = useCallback(async () => {
    if (!mediaDevices?.enumerateDevices) return;
    try {
      const list = await mediaDevices.enumerateDevices();
      const pick = (kind, fallback) => list.filter((item) => item.kind === kind && item.deviceId)
        .map((item, index) => ({ id: item.deviceId, label: item.label || `${fallback} ${index + 1}` }));
      setDevices({ audio: pick('audioinput', 'Mikrofon'), video: pick('videoinput', 'Kaamera') });
    } catch { /* the list is optional */ }
  }, [mediaDevices]);
  useEffect(() => {
    if (!hasLocalMedia) return undefined;
    refreshDevices();
    if (!mediaDevices?.addEventListener) return undefined;
    mediaDevices.addEventListener('devicechange', refreshDevices);
    return () => mediaDevices.removeEventListener?.('devicechange', refreshDevices);
  }, [hasLocalMedia, mediaDevices, refreshDevices]);
  const currentIds = useMemo(() => {
    if (!hasLocalMedia) return selected;
    const stream = localStreamRef.current;
    const id = (track) => track?.getSettings?.().deviceId || '';
    return {
      audioId: id(stream?.getAudioTracks?.()[0]) || selected.audioId,
      videoId: id(stream?.getVideoTracks?.()[0]) || selected.videoId,
    };
  }, [hasLocalMedia, selected]);

  // switch the camera or microphone during the call: the new track replaces the old one on the connection (no new
  // offer), keeps the mute state and becomes part of a new local stream (the lesson recording follows it)
  const switchDevice = async (kind, deviceId) => {
    const next = { ...selected, [kind === 'audio' ? 'audioId' : 'videoId']: deviceId };
    setSelected(next);
    saveDevices(next);
    const current = localStreamRef.current;
    if (!current || !mediaDevices?.getUserMedia) return;
    setDeviceBusy(true);
    setError('');
    try {
      const constraints = kind === 'audio'
        ? { audio: { deviceId: { exact: deviceId } }, video: false }
        : { audio: false, video: { ...mediaConstraints({ videoId: deviceId }).video, deviceId: { exact: deviceId } } };
      const fresh = await mediaDevices.getUserMedia(constraints);
      const track = kind === 'audio' ? fresh.getAudioTracks()[0] : fresh.getVideoTracks()[0];
      if (!track) throw new Error('Seadet ei leitud.');
      track.enabled = kind === 'audio' ? audioEnabled : videoEnabled;
      const old = kind === 'audio' ? current.getAudioTracks()[0] : current.getVideoTracks()[0];
      // while the screen is shared the video sender carries the screen; the camera change applies when sharing stops
      const sender = peerRef.current?.getSenders?.().find((item) => item.track?.kind === kind);
      if (sender?.replaceTrack && !(kind === 'video' && screenStreamRef.current)) await sender.replaceTrack(track);
      const others = kind === 'audio' ? current.getVideoTracks() : current.getAudioTracks();
      const stream = new globalThis.MediaStream(kind === 'audio' ? [track, ...others] : [...others, track]);
      old?.stop();
      localStreamRef.current = stream;
      if (!screenStreamRef.current) attachLocalStream(stream);
      reportStreams({ local: stream });
      refreshDevices();
    } catch (nextError) {
      setError(nextError?.message ? `Seadet ei saanud vahetada: ${nextError.message}` : 'Seadet ei saanud vahetada.');
    } finally {
      setDeviceBusy(false);
    }
  };

  const sendRoom = useCallback((message) => {
    const channel = channelRef.current;
    if (!channel || channel.readyState !== 'open') return false;
    try { channel.send(JSON.stringify(message)); return true; } catch { return false; }
  }, []);
  // one listener for the room's messages; returns the unsubscribe
  const onRoomMessage = useCallback((listener) => {
    roomListenerRef.current = listener;
    return () => { if (roomListenerRef.current === listener) roomListenerRef.current = null; };
  }, []);

  const connected = status === 'connected';
  const canReconnect = role === 'teacher' && hasLocalMedia && ['failed', 'reconnecting'].includes(status);

  return {
    status, statusLabel: statusText(status, role, teacherReady), busy, screenBusy, error, setError, hasLocalMedia,
    audioEnabled, videoEnabled, screenSharing, teacherReady, peerOnline, peerName, connected, canReconnect,
    localVideoRef, remoteVideoRef, startTeacherCall, joinStudentCall, hangUp, toggleAudio, toggleVideo,
    startScreenShare, stopScreenShare, devices, selectedDevices: currentIds, switchDevice, deviceBusy,
    roomChannelOpen, sendRoom, onRoomMessage,
  };
}
