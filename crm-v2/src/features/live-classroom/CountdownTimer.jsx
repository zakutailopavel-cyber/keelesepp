import { Maximize2, Minimize2, Pause, Play, Plus, Square, Timer, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { COUNTDOWN_PRESETS, COUNTDOWN_WARN_MS, durationFrom, formatCountdown } from './countdown.js';

const MUTE_KEY = 'keelesepp.countdownMuted';
const readMuted = () => { try { return globalThis.localStorage?.getItem(MUTE_KEY) === '1'; } catch { return false; } };

// a soft two-note chime (Web Audio, no file); silent where audio is not allowed
function playChime() {
  const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const context = new AudioCtx();
    context.resume?.();
    [660, 880].forEach((frequency, index) => {
      const start = context.currentTime + index * 0.28;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.5);
    });
    globalThis.setTimeout(() => context.close?.(), 1500);
  } catch { /* no sound */ }
}

/**
 * The countdown everyone in the room sees: a badge in the corner (never blocks the board), a click makes it big;
 * the last 10 s are highlighted, at zero a soft chime (mute toggle, remembered in this browser) and „Aeg läbi!”.
 */
export function CountdownBadge({ timer, chime = playChime }) {
  const [expanded, setExpanded] = useState(false);
  const [muted, setMuted] = useState(readMuted);
  // chimes once per timer, and only when this screen saw it running (a room opened after the end stays quiet)
  const armed = useRef('');
  const key = timer.countdown ? `${timer.countdown.updatedAt}` : '';
  useEffect(() => {
    if (!key) return;
    if (timer.running && !timer.expired) { armed.current = key; return; }
    if (!timer.expired || armed.current !== key) return;
    armed.current = '';
    if (!muted) chime();
  }, [timer.running, timer.expired, key, muted, chime]);
  if (!timer.active) return null;
  const warn = timer.running && !timer.expired && timer.remainingMs <= COUNTDOWN_WARN_MS;
  const toggleMute = () => setMuted((current) => {
    try { globalThis.localStorage?.setItem(MUTE_KEY, current ? '0' : '1'); } catch { /* private mode */ }
    return !current;
  });
  const label = timer.countdown.label;
  const text = timer.expired ? 'Aeg läbi!' : formatCountdown(timer.remainingMs);
  return <div className={`lr-countdown ${expanded ? 'is-big' : ''} ${warn ? 'is-warn' : ''} ${timer.expired ? 'is-done' : ''} ${!timer.running ? 'is-paused' : ''}`}
    role="timer" aria-live={timer.expired || warn ? 'assertive' : 'off'} aria-label={timer.expired ? 'Aeg läbi!' : `Taimer: ${formatCountdown(timer.remainingMs)}${timer.running ? '' : ', peatatud'}`}>
    <button type="button" className="lr-countdown__main" onClick={() => setExpanded(!expanded)} title={expanded ? 'Tee väikseks' : 'Tee suureks'} aria-label={expanded ? 'Tee taimer väikseks' : 'Tee taimer suureks'}>
      <Timer size={expanded ? 22 : 15} aria-hidden="true" />
      <span className="lr-countdown__time">{text}</span>
      {label && expanded ? <small>{label}</small> : null}
      {!timer.running ? <small>Peatatud</small> : null}
      {expanded ? <Minimize2 size={14} aria-hidden="true" /> : <Maximize2 size={12} aria-hidden="true" />}
    </button>
    <button type="button" className="lr-countdown__mute" aria-pressed={muted} aria-label={muted ? 'Lülita taimeri heli sisse' : 'Lülita taimeri heli välja'} title={muted ? 'Heli on väljas' : 'Heli on sees'} onClick={toggleMute}>
      {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
    </button>
  </div>;
}

// the teacher's tool: presets, own time (minutes + seconds), then pause / resume, +1 min and stop
export function CountdownControls({ timer }) {
  const [minutes, setMinutes] = useState('4');
  const [seconds, setSeconds] = useState('0');
  const [label, setLabel] = useState('');
  const custom = durationFrom(minutes, seconds);
  return <div className="lr-countdown-tool">
    {timer.active ? <div className="lr-countdown-tool__now">
      <strong className={timer.expired ? 'is-done' : ''}>{timer.expired ? 'Aeg läbi!' : formatCountdown(timer.remainingMs)}</strong>
      <span className="lr-muted">{timer.expired ? 'Õpilased näevad „Aeg läbi!”.' : timer.running ? 'Käib — õpilased näevad seda nurgas.' : 'Peatatud.'}</span>
      <div className="lr-countdown-tool__row">
        {timer.running && !timer.expired ? <button type="button" className="lr-text-btn" disabled={timer.busy} onClick={timer.actions.pause}><Pause size={15} /> Paus</button> : null}
        {!timer.running ? <button type="button" className="lr-text-btn" disabled={timer.busy} onClick={timer.actions.resume}><Play size={15} /> Jätka</button> : null}
        <button type="button" className="lr-text-btn" aria-label="Lisa 1 minut" disabled={timer.busy} onClick={timer.actions.addMinute}><Plus size={15} /> 1 min</button>
        <button type="button" className="lr-text-btn is-danger" disabled={timer.busy} onClick={timer.actions.stop}><Square size={14} /> Lõpeta</button>
      </div>
    </div> : <p className="lr-muted">Õpilased näevad aega ekraani nurgas. Heli kõlab, kui aeg on läbi.</p>}
    <label className="lr-field"><span>Nimetus (valikuline)</span><input value={label} maxLength={80} placeholder="nt Loe tekst läbi" onChange={(event) => setLabel(event.target.value)} /></label>
    <div className="lr-countdown-tool__presets" role="group" aria-label="Kiirvalik">
      {COUNTDOWN_PRESETS.map((value) => <button key={value} type="button" className="lr-text-btn" disabled={timer.busy} onClick={() => timer.actions.start(value * 60000, label)}>{value} min</button>)}
    </div>
    <form className="lr-countdown-tool__custom" onSubmit={(event) => { event.preventDefault(); if (custom) timer.actions.start(custom, label); }}>
      <label className="lr-field"><span>Minutid</span><input type="number" min="0" max="120" inputMode="numeric" value={minutes} onChange={(event) => setMinutes(event.target.value)} /></label>
      <label className="lr-field"><span>Sekundid</span><input type="number" min="0" max="59" inputMode="numeric" value={seconds} onChange={(event) => setSeconds(event.target.value)} /></label>
      <button type="submit" className="lr-text-btn" disabled={!custom || timer.busy}><Play size={15} /> Alusta</button>
    </form>
    {timer.error ? <p className="lr-error" role="alert">{timer.error}</p> : null}
  </div>;
}
