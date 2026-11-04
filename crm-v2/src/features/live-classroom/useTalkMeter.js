import { useEffect, useState } from 'react';
import { createTalkTracker, EMPTY_TALK, rms, rmsBytes } from './talkMeter.js';

const SAMPLE_MS = 100; // ~10 Hz
const PAINT_MS = 1000; // the indicator changes once a second

/**
 * „Kõneaeg” for the teacher: reads the level of the own microphone (`local`) and the student's incoming audio
 * (`remote`) with AnalyserNodes and counts talk time (`talkMeter.js`). The sources are never connected to the
 * speakers, so playback, echo cancellation and the recording stay as they are. Paused while the tab is hidden; the
 * AudioContext is closed when the streams change or the room is left. The totals live as long as the component.
 */
export function useTalkMeter({ local = null, remote = null, enabled = true } = {}) {
  const [tracker] = useState(() => createTalkTracker());
  const [snapshot, setSnapshot] = useState(EMPTY_TALK);

  useEffect(() => {
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    const doc = globalThis.document;
    if (!enabled || !AudioCtx || typeof globalThis.MediaStream !== 'function' || (!local && !remote)) return undefined;
    let context;
    try { context = new AudioCtx(); } catch { return undefined; }
    const streams = { teacher: local, student: remote };
    const taps = { teacher: null, student: null };
    const detach = (side) => {
      try { taps[side]?.source.disconnect(); } catch { /* already gone */ }
      taps[side] = null;
    };
    // (re)attach when the side's audio track appears or changes (a mobile peer may add it to the same stream later)
    const tapFor = (side) => {
      const track = streams[side]?.getAudioTracks?.().find((item) => item.readyState !== 'ended') || null;
      if (taps[side]?.track === track) return taps[side];
      detach(side);
      if (!track) return null;
      try {
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0;
        // a new stream around the same track: the track itself (mute, recording, the peer connection) is untouched
        const source = context.createMediaStreamSource(new globalThis.MediaStream([track]));
        source.connect(analyser);
        const float = typeof analyser.getFloatTimeDomainData === 'function';
        taps[side] = { track, source, analyser, float, data: float ? new Float32Array(analyser.fftSize) : new Uint8Array(analyser.fftSize) };
      } catch { taps[side] = null; }
      return taps[side];
    };
    const level = (side) => {
      const tap = tapFor(side);
      if (!tap) return 0;
      // a muted microphone (enabled = false) delivers silence anyway; this only saves the work
      if (tap.track.enabled === false) return 0;
      if (tap.float) { tap.analyser.getFloatTimeDomainData(tap.data); return rms(tap.data); }
      tap.analyser.getByteTimeDomainData(tap.data);
      return rmsBytes(tap.data);
    };

    let timer = 0;
    let last = 0;
    let painted = 0;
    const tick = () => {
      const at = globalThis.performance?.now?.() ?? Date.now();
      const dt = at - last;
      last = at;
      if (context.state !== 'running') return;
      const now = Date.now();
      tracker.sample({ teacher: level('teacher'), student: level('student') }, now, dt);
      if (now - painted >= PAINT_MS) { painted = now; setSnapshot(tracker.snapshot(now)); }
    };
    const resume = () => { if (context.state === 'suspended') context.resume?.()?.catch?.(() => {}); };
    const start = () => {
      if (timer) return;
      last = globalThis.performance?.now?.() ?? Date.now();
      resume();
      timer = globalThis.setInterval(tick, SAMPLE_MS);
    };
    const stop = () => {
      if (!timer) return;
      globalThis.clearInterval(timer);
      timer = 0;
      context.suspend?.()?.catch?.(() => {});
    };
    const onVisibility = () => (doc?.hidden ? stop() : start());
    // a context made without a recent click may start suspended; the next click in the room wakes it
    const onPointer = () => { if (!doc?.hidden) resume(); };
    doc?.addEventListener?.('visibilitychange', onVisibility);
    doc?.addEventListener?.('pointerdown', onPointer);
    if (!doc?.hidden) start();
    return () => {
      doc?.removeEventListener?.('visibilitychange', onVisibility);
      doc?.removeEventListener?.('pointerdown', onPointer);
      if (timer) globalThis.clearInterval(timer);
      timer = 0;
      detach('teacher');
      detach('student');
      context.close?.()?.catch?.(() => {});
    };
  }, [enabled, local, remote, tracker]);

  return snapshot;
}
