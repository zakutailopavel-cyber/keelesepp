import { useEffect, useRef, useState } from 'react';
import { createGroupTalkTracker, createTalkTracker, EMPTY_TALK, rms, rmsBytes } from './talkMeter.js';

const SAMPLE_MS = 100; // ~10 Hz
const PAINT_MS = 1000; // the indicator changes once a second

/**
 * Reads the level of every side's audio (`streams` = { side: MediaStream|null }) with AnalyserNodes and feeds a
 * talk tracker (`talkMeter.js`). The sources are never connected to the speakers, so playback, echo cancellation and
 * the recording stay as they are. Each tick reads the latest `streams`, so a side whose track appears, changes or
 * leaves is re-attached / detached without a new AudioContext. Paused while the tab is hidden; the AudioContext is
 * closed when the room is left (or no side has a stream any more). The totals live as long as the tracker.
 */
export function useTalkSampler({ streams = {}, tracker, enabled = true, empty = EMPTY_TALK } = {}) {
  const [snapshot, setSnapshot] = useState(empty);
  const streamsRef = useRef(streams);
  useEffect(() => { streamsRef.current = streams; });
  const anyStream = Object.values(streams).some(Boolean);

  useEffect(() => {
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    const doc = globalThis.document;
    if (!enabled || !AudioCtx || typeof globalThis.MediaStream !== 'function' || !anyStream) return undefined;
    let context;
    try { context = new AudioCtx(); } catch { return undefined; }
    const taps = new Map();
    const detach = (side) => {
      try { taps.get(side)?.source.disconnect(); } catch { /* already gone */ }
      taps.delete(side);
    };
    // (re)attach when the side's audio track appears or changes (a mobile peer may add it to the same stream later)
    const tapFor = (side, stream) => {
      const track = stream?.getAudioTracks?.().find((item) => item.readyState !== 'ended') || null;
      if (taps.get(side)?.track === track) return taps.get(side);
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
        taps.set(side, { track, source, analyser, float, data: float ? new Float32Array(analyser.fftSize) : new Uint8Array(analyser.fftSize) });
      } catch { taps.delete(side); }
      return taps.get(side) || null;
    };
    const level = (side, stream) => {
      const tap = tapFor(side, stream);
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
      const current = streamsRef.current || {};
      for (const side of [...taps.keys()]) if (!(side in current)) detach(side);
      const levels = {};
      for (const [side, stream] of Object.entries(current)) levels[side] = level(side, stream);
      const now = Date.now();
      tracker.sample(levels, now, dt);
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
      for (const side of [...taps.keys()]) detach(side);
      context.close?.()?.catch?.(() => {});
    };
  }, [anyStream, enabled, tracker]);

  return snapshot;
}

/** „Kõneaeg” for the teacher in a 1:1 room: the own microphone (`local`) against the student's incoming audio. */
export function useTalkMeter({ local = null, remote = null, enabled = true } = {}) {
  const [tracker] = useState(() => createTalkTracker());
  return useTalkSampler({ streams: { teacher: local, student: remote }, tracker, enabled });
}

const EMPTY_GROUP = Object.freeze({ ...EMPTY_TALK, people: {} });

/** Group room: the teacher's microphone (`local`) and every student's incoming track (`remotes` = [{ uid, stream }]). */
export function useGroupTalkMeter({ local = null, remotes = [], enabled = true } = {}) {
  const [tracker] = useState(() => createGroupTalkTracker());
  const streams = { teacher: local };
  for (const item of remotes) if (item?.uid && item.uid !== 'teacher') streams[item.uid] = item.stream || null;
  return useTalkSampler({ streams, tracker, enabled, empty: EMPTY_GROUP });
}
