/* global clearInterval, setInterval */
import { useContext, useEffect, useId, useRef, useState } from 'react';
import { Eye, EyeOff, FileText, Headphones, Play } from 'lucide-react';
import { AudioBar } from './ui.jsx';
import { TRANSCRIPT_TEXT, TranscriptContext, hasTranscript, transcriptAccess, transcriptLines } from './transcript.js';
import { formatClock } from './metaKeys.js';

const PLAYS_TEXT = {
  et: { play: 'Kuula', playing: 'Kõlab…', left: (n, all) => `Kuulamisi jäänud: ${n} / ${all}`, none: 'Salvestus on kuulatud.', next: (s) => `Järgmine kuulamine algab ${s} s pärast`, again: 'Kuula uuesti' },
  en: { play: 'Listen', playing: 'Playing…', left: (n, all) => `Plays left: ${n} / ${all}`, none: 'The recording has been played.', next: (s) => `The next play starts in ${s} s`, again: 'Play again' },
};

// A recording heard a set number of times, as in the exam (docs/EXAM_9KL_E_EKSAM.md §1: „each recording twice without a
// pause”): one play button, no pause and no seeking, the plays left shown; after a play the next one starts by itself
// after `gapSec` seconds (0: the learner presses play again). `used` / `onUse(n)` keep the count with the answers, so a
// reload does not give the plays back. A play counts when the sound starts.
export function LimitedAudio({ src, label, plays, used = 0, gapSec = 0, onUse, onEnded, lang = 'et' }) {
  const L = PLAYS_TEXT[lang] || PLAYS_TEXT.et;
  const ref = useRef(null);
  const counted = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState({ at: 0, length: 0 });
  const [wait, setWait] = useState(0);
  const waitTimer = useRef(null);
  const all = Math.max(1, Number(plays) || 1);
  const left = Math.max(0, all - (Number(used) || 0));
  // the next play starts from a timer: it reads the state of now, not of the render that set the timer
  const now = useRef({ playing, left });
  useEffect(() => { now.current = { playing, left }; }, [playing, left]);
  useEffect(() => () => clearInterval(waitTimer.current), []);
  const start = () => {
    const audio = ref.current;
    if (!audio || now.current.playing || now.current.left <= 0) return;
    clearInterval(waitTimer.current);
    setWait(0);
    counted.current = false;
    try { audio.currentTime = 0; } catch { /* not loaded yet */ }
    const run = audio.play?.();
    if (run?.catch) run.catch(() => setPlaying(false));
  };
  const onPlay = () => {
    setPlaying(true);
    now.current = { ...now.current, playing: true };
    if (!counted.current) { counted.current = true; onUse?.((Number(used) || 0) + 1); }
  };
  const ended = () => {
    setPlaying(false);
    now.current = { ...now.current, playing: false };
    onEnded?.();
    // `left` still holds the count before this play
    if (left - 1 > 0 && Number(gapSec) > 0) {
      let s = Number(gapSec);
      setWait(s);
      waitTimer.current = setInterval(() => {
        s -= 1;
        setWait(s);
        if (s <= 0) { clearInterval(waitTimer.current); start(); }
      }, 1000);
    }
  };
  // no pause: a pause from outside (a media key, the system) resumes at once
  const onPause = () => { const audio = ref.current; if (audio && !audio.ended && playing) audio.play?.()?.catch?.(() => setPlaying(false)); };
  const share = time.length ? Math.min(100, (time.at / time.length) * 100) : 0;
  const disabled = playing || left <= 0 || wait > 0;
  return (
    <div className={`ws-audio is-limited ${playing ? 'is-playing' : ''}`}>
      <span className="ws-audio-ico" aria-hidden="true"><Headphones /></span>
      <button type="button" className="ws-plays-btn" disabled={disabled} onClick={start} aria-label={`${label || L.play}. ${L.left(left, all)}`}>
        <Play aria-hidden="true" /> {playing ? L.playing : left < all ? L.again : (label || L.play)}
      </button>
      <span className="ws-plays-track" aria-hidden="true"><i style={{ width: `${share}%` }} /></span>
      <span className="ws-plays-time" aria-hidden="true">{formatClock(time.at)}{time.length ? ` / ${formatClock(time.length)}` : ''}</span>
      <span className={`ws-plays-left ${left ? '' : 'is-none'}`} role="status">{wait > 0 ? L.next(wait) : left ? L.left(left, all) : L.none}</span>
      <audio ref={ref} preload="metadata" src={src} onPlay={onPlay} onPause={onPause} onEnded={ended}
        onLoadedMetadata={(e) => setTime({ at: 0, length: e.currentTarget.duration || 0 })}
        onTimeUpdate={(e) => setTime({ at: e.currentTarget.currentTime || 0, length: e.currentTarget.duration || 0 })} />
    </div>
  );
}

// The player of a listening task: the sheet learns when the recording was played to the end (a task with nothing to
// check opens its text then, see transcript.js). `limit` = { plays, gapSec, used, onUse } makes it the exam's player
// (heard `plays` times) for the learner; staff (studio, the teacher's preview) and a checked sheet play it freely.
export function ListenAudio({ id, limit = null, lang = 'et', ...props }) {
  const t = useContext(TranscriptContext);
  const onEnded = t?.markEnded && id ? () => t.markEnded(id) : undefined;
  if (limit && props.interactive && props.audio?.src && t?.role !== 'staff') {
    return <LimitedAudio src={props.audio.src} label={props.label} plays={limit.plays} used={limit.used} gapSec={limit.gapSec} onUse={limit.onUse} onEnded={onEnded} lang={lang} />;
  }
  return <AudioBar {...props} onEnded={onEnded} />;
}

// the lines of a transcript: the speaker's name in bold once per turn (also in the teacher's answer key)
export function TranscriptText({ text }) {
  return transcriptLines(text).map((line, i) => (
    <p key={i} className={`ws-script-line ${line.speaker ? (line.first ? 'is-turn' : 'is-cont') : ''}`}>
      {line.speaker && line.first ? <><b>{line.speaker}:</b> </> : null}{line.text}
    </p>
  ));
}

// „Näita teksti / Peida tekst” under the player, and in the live lesson the teacher's „Näita õpilasele / Peida õpilaselt”.
// The text: one line per line of speech, the speaker's name in bold once per turn. Printed only when it is open.
export function ListenTranscript({ id, type, data, ctx, lang = 'et' }) {
  const t = useContext(TranscriptContext);
  const domId = useId();
  // a task split over pages carries its text once, on the first part
  if (!t?.role || !id || ctx?.start || !hasTranscript(type, data)) return null;
  const L = TRANSCRIPT_TEXT[lang] || TRANSCRIPT_TEXT.et;
  const revealed = t.revealed.has(id);
  const access = transcriptAccess({ role: t.role, check: t.checks.has(id), submitted: t.submitted, revealed, answersShown: t.answersShown.has(id), audioEnded: t.ended(id) });
  const live = t.role === 'staff' && typeof t.onLive === 'function';
  if (!access.can) return null;
  const open = t.isOpen(id);
  const panelId = `ws-script-${domId}`;
  // a click inside the task must not also pick the task (the teacher's live view, the answer key)
  const stop = (fn) => (event) => { event.stopPropagation(); fn(); };
  return (
    <div className={`ws-script ${open ? 'is-open' : ''}`}>
      <div className="ws-script-bar">
        <button type="button" className="ws-script-btn" aria-expanded={open} aria-controls={panelId} onClick={stop(() => t.setOpen(id, !open))}>
          {open ? <EyeOff aria-hidden="true" /> : <FileText aria-hidden="true" />} {open ? L.hide : L.show}
        </button>
        {live ? (
          <button type="button" className={`ws-script-btn is-live ${revealed ? 'is-on' : ''}`} aria-pressed={revealed} disabled={t.busy} onClick={stop(() => t.onLive(id, !revealed))}>
            {revealed ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />} {revealed ? L.hideStudent : L.showStudent}
          </button>
        ) : null}
        {live && revealed ? <span className="ws-script-state" role="status"><Eye aria-hidden="true" /> {L.shownStudent}</span> : null}
        {t.role === 'student' && access.why === 'teacher' ? <span className="ws-script-state" role="status">{L.byTeacher}</span> : null}
      </div>
      {open ? (
        <section id={panelId} className="ws-script-text" role="region" aria-label={L.title}>
          <h4>{L.title}</h4>
          <TranscriptText text={data.transcript} />
        </section>
      ) : <div id={panelId} hidden />}
    </div>
  );
}
