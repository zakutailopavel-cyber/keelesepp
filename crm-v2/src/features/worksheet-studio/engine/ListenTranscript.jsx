import { useContext, useId } from 'react';
import { Eye, EyeOff, FileText } from 'lucide-react';
import { AudioBar } from './ui.jsx';
import { TRANSCRIPT_TEXT, TranscriptContext, hasTranscript, transcriptAccess, transcriptLines } from './transcript.js';

// The player of a listening task: the sheet learns when the recording was played to the end (a task with nothing to
// check opens its text then, see transcript.js).
export function ListenAudio({ id, ...props }) {
  const t = useContext(TranscriptContext);
  return <AudioBar {...props} onEnded={t?.markEnded && id ? () => t.markEnded(id) : undefined} />;
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
