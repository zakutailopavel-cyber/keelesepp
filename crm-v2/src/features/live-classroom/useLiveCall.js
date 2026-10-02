import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { liveLessonCallSignalsService } from '../../services/firebase/liveLessonCallSignals.js';
import { liveLessonPresenceService, presenceIsFresh } from '../../services/firebase/liveLessonPresence.js';

const ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
];

function defaultPeerFactory() {
  if (!globalThis.RTCPeerConnection) throw new Error('See brauser ei toeta videokõnet.');
  return new globalThis.RTCPeerConnection({ iceServers: ICE_SERVERS });
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
  onMediaStreams,
}) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const sessionIdRef = useRef('');
  const pendingOfferRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const processedSignalsRef = useRef(new Set());
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

  const closePeer = useCallback(() => {
    const peer = peerRef.current;
    if (peer) {
      peer.ontrack = null;
      peer.onicecandidate = null;
      peer.onconnectionstatechange = null;
      peer.close();
    }
    peerRef.current = null;
    sessionIdRef.current = '';
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    reportStreams({ remote: null });
  }, [reportStreams]);

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
    const peer = peerFactory();
    peerRef.current = peer;
    sessionIdRef.current = sessionId;

    const cameraStream = localStreamRef.current;
    const screenStream = screenStreamRef.current;
    cameraStream?.getAudioTracks().forEach((track) => peer.addTrack(track, cameraStream));
    const outboundVideoTrack = screenStream?.getVideoTracks?.()[0] || cameraStream?.getVideoTracks?.()[0];
    if (outboundVideoTrack) peer.addTrack(outboundVideoTrack, screenStream || cameraStream);

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
      if (next === 'connected') setStatus('connected');
      else if (next === 'connecting' || next === 'new') setStatus('connecting');
      else if (next === 'failed') setStatus('failed');
      else if (next === 'disconnected') setStatus('reconnecting');
      else if (next === 'closed') setStatus('ended');
    };
    return peer;
  }, [closePeer, peerFactory, reportStreams, sendSignal]);

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
    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
    });
    localStreamRef.current = stream;
    attachLocalStream(stream);
    reportStreams({ local: stream });
    setHasLocalMedia(true);
    setAudioEnabled(stream.getAudioTracks().some((track) => track.enabled !== false));
    setVideoEnabled(stream.getVideoTracks().some((track) => track.enabled !== false));
    return stream;
  }, [attachLocalStream, mediaDevices, reportStreams]);

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

  const startTeacherCall = async () => {
    setBusy(true);
    setError('');
    try {
      await ensureLocalMedia();
      pendingCandidatesRef.current = [];
      const sessionId = createSessionId();
      const peer = makePeer(sessionId);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await sendSignal('offer', offer.toJSON ? offer.toJSON() : offer, sessionId);
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

  const connected = status === 'connected';
  const canReconnect = role === 'teacher' && hasLocalMedia && ['failed', 'reconnecting'].includes(status);

  return {
    status, statusLabel: statusText(status, role, teacherReady), busy, screenBusy, error, setError, hasLocalMedia,
    audioEnabled, videoEnabled, screenSharing, teacherReady, peerOnline, peerName, connected, canReconnect,
    localVideoRef, remoteVideoRef, startTeacherCall, joinStudentCall, hangUp, toggleAudio, toggleVideo,
    startScreenShare, stopScreenShare,
  };
}
