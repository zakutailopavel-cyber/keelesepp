import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Flame, Lightbulb } from 'lucide-react';
import { lessonHints } from './warmup.js';
import './warmup.css';

const STORE = 'keelesepp.lessonHintsOpen';
const readOpen = () => { try { return globalThis.localStorage?.getItem(STORE) !== '0'; } catch { return true; } };
const saveOpen = (open) => { try { globalThis.localStorage?.setItem(STORE, open ? '1' : '0'); } catch { /* private window */ } };
const dateLabel = (iso) => (iso ? iso.split('-').reverse().join('.') : '');

// „Täna harjutada” (teacher only): a small box over the board's lower left corner with 2–3 error topics of the last
// analysed lessons, one example each and the „Järgmiseks tunniks” advice. It is not part of the board (the student's
// board is synced through Firestore, this box is not), and it hides itself while the teacher shares the screen.
// Group room: `switcher` (GroupLessonHints) picks the member whose hints are shown; it sits on top of the body.
export default function LessonHints({ invitation, lessons = [], loading = false, hidden = false, onWarmup, switcher = null }) {
  const hints = useMemo(() => lessonHints(lessons, { currentInvitationId: invitation.id }), [lessons, invitation.id]);
  const [open, setOpen] = useState(readOpen);
  if (hidden || loading || !hints) return null;
  const toggle = () => { setOpen(!open); saveOpen(!open); };
  const analysisHref = `/students/${encodeURIComponent(invitation.studentId)}?tab=learning`;
  return (
    <aside className={`lesson-hints ${open ? 'is-open' : ''}`} aria-label="Täna harjutada (näeb ainult õpetaja)">
      <button type="button" className="lesson-hints__head" aria-expanded={open} onClick={toggle} title="Näeb ainult õpetaja">
        <Lightbulb size={15} aria-hidden="true" /> <strong>Täna harjutada</strong>
        {hints.topics.length ? <span className="lesson-hints__count">{hints.topics.length}</span> : null}
        {open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronUp size={15} aria-hidden="true" />}
      </button>
      {open ? (
        <div className="lesson-hints__body">
          {switcher}
          <small className="lesson-hints__src">{hints.lessonCount === 1 ? 'Eelmisest tunnist' : `Viimasest ${hints.lessonCount} tunnist`}{hints.latestDate ? ` (viimane ${dateLabel(hints.latestDate)})` : ''} · näeb ainult õpetaja</small>
          {hints.topics.length ? (
            <ol className="lesson-hints__topics">
              {hints.topics.map((topic) => (
                <li key={topic.key}>
                  <span><b>{topic.topic}</b> <small>· {topic.count}×</small></span>
                  {topic.example ? <span className="lesson-hints__ex"><s>{topic.example.said}</s> → {topic.example.corrected}</span> : null}
                </li>
              ))}
            </ol>
          ) : null}
          {hints.next.length ? (
            <div className="lesson-hints__next">
              <b>Järgmiseks tunniks</b>
              <ul>{hints.next.map((line, i) => <li key={i}>{line}</li>)}</ul>
            </div>
          ) : null}
          <div className="lesson-hints__actions">
            {onWarmup ? <button type="button" className="lr-text-btn" onClick={onWarmup}><Flame size={15} aria-hidden="true" /> Soojendus</button> : null}
            <a className="lr-text-btn" href={analysisHref} target="_blank" rel="noreferrer"><ExternalLink size={15} aria-hidden="true" /> Tunni analüüs</a>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
