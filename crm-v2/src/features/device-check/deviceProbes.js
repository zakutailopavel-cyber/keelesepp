// „Seadme kontroll”: network probes. Nothing here sends camera / microphone data anywhere.
import { callIceServers } from '../live-classroom/useLiveCall.js';
import { classifyCandidates } from './deviceCheckModel.js';

const now = () => (globalThis.performance?.now ? globalThis.performance.now() : Date.now());

/** Round trip to the app's own hosting (a small static file, never cached). → { ok, ms } (median of `times` tries) */
export async function pingHosting({ fetchImpl = globalThis.fetch, origin = globalThis.location?.origin || '', times = 3 } = {}) {
  const results = [];
  for (let attempt = 0; attempt < times; attempt += 1) {
    const started = now();
    try {
      const response = await fetchImpl(`${origin}/favicon.ico?kontroll=${Date.now()}-${attempt}`, { cache: 'no-store', method: 'GET' });
      if (!response?.ok) return { ok: false, ms: null };
      results.push(now() - started);
    } catch {
      return { ok: false, ms: null };
    }
  }
  results.sort((a, b) => a - b);
  return { ok: true, ms: results[Math.floor(results.length / 2)] ?? null };
}

/** The live classroom's Firebase function (TURN credentials) answers its wake-up request. → { ok, ms } */
export async function pingFunctions(turnService) {
  if (!turnService?.ping) return { ok: null, ms: null };
  const started = now();
  const ok = await turnService.ping();
  return { ok, ms: ok ? now() - started : null };
}

/**
 * Gather ICE candidates with the room's ICE configuration (public STUN + the lesson's TURN relay when given) and
 * count them per type. Credentials stay inside the RTCPeerConnection; only counts come back.
 * → { stun: boolean, relay: 'ok' | 'none' | 'unavailable', counts }
 */
export function gatherIce({ turnServers = [], peerFactory = (config) => new globalThis.RTCPeerConnection(config), timeoutMs = 8000 } = {}) {
  return new Promise((resolve) => {
    let peer;
    const candidates = [];
    let done = false;
    let timer = null;
    const finish = () => {
      if (done) return;
      done = true;
      globalThis.clearTimeout(timer);
      try { peer?.close(); } catch { /* already closed */ }
      const counts = classifyCandidates(candidates);
      const relayAsked = turnServers.some((server) => [].concat(server?.urls || []).some((url) => String(url).startsWith('turn')));
      resolve({ stun: counts.srflx + counts.prflx > 0, relay: relayAsked ? (counts.relay > 0 ? 'ok' : 'none') : 'unavailable', counts });
    };
    try {
      peer = peerFactory({ iceServers: callIceServers(turnServers) });
      peer.onicecandidate = (event) => { if (event.candidate) candidates.push(event.candidate); else finish(); };
      peer.onicegatheringstatechange = () => { if (peer.iceGatheringState === 'complete') finish(); };
      peer.createDataChannel('kontroll');
      timer = globalThis.setTimeout(finish, timeoutMs);
      Promise.resolve(peer.createOffer()).then((offer) => peer.setLocalDescription(offer)).catch(finish);
    } catch {
      finish();
    }
  });
}

/** Short local recording of an audio stream (nothing is uploaded). Resolves with { blob, type } after `ms`. */
export function recordClip(stream, { ms = 5000, MediaRecorderImpl = globalThis.MediaRecorder, mimeType = '' } = {}) {
  return new Promise((resolve, reject) => {
    let recorder;
    try {
      const audioOnly = new globalThis.MediaStream(stream.getAudioTracks());
      recorder = new MediaRecorderImpl(audioOnly, mimeType ? { mimeType } : undefined);
    } catch (error) {
      reject(error);
      return;
    }
    const chunks = [];
    recorder.ondataavailable = (event) => { if (event.data?.size) chunks.push(event.data); };
    recorder.onstop = () => {
      const type = (recorder.mimeType || mimeType || 'audio/webm').split(';')[0];
      resolve({ blob: new globalThis.Blob(chunks, { type }), type });
    };
    recorder.onerror = (event) => reject(event?.error || new Error('Salvestus ebaõnnestus.'));
    recorder.start();
    globalThis.setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, ms);
  });
}

/** A short two-note chime through the speakers (Web Audio, no file). Resolves when it has played. */
export function playTone(context, { destination } = {}) {
  const start = context.currentTime + 0.05;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.05);
  gain.gain.setValueAtTime(0.25, start + 1.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.4);
  gain.connect(destination || context.destination);
  [[523.25, 0], [659.25, 0.45], [783.99, 0.9]].forEach(([frequency, offset]) => {
    const osc = context.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start + offset);
    osc.connect(gain);
    osc.start(start + offset);
    osc.stop(start + Math.min(offset + 0.5, 1.4));
  });
  return new Promise((resolve) => { globalThis.setTimeout(resolve, 1500); });
}
