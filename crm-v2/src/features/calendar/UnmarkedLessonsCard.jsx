import { CalendarCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { onLessonMarked } from './lessonActions.js';
import { olderUnmarked, unmarkedLessons } from './unmarkedLessons.js';
import '../retention/retention.css';

const api = {
  lessons: (teacherUid) => lessonsService.listForCalendar(teacherUid ? { teacherUid } : {}),
  markHeld: (item, user) => lessonsService.completeFromSchedule(item, user, { status: 'Toimunud' }),
};
const dayLabel = (iso) => new Intl.DateTimeFormat('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(new Date(`${iso}T12:00:00`));
export const calendarLessonPath = (item) => `/calendar?lesson=${encodeURIComponent(`${item.occurrenceId}|${item.occurrenceDate}`)}`;

// „Märkimata tunnid” on the dashboard: past lessons of the last year with no journal mark. Unmarked lessons make
// the progress, retention and month reports wrong, so a held lesson is marked here in one click; an absence opens the
// calendar, where its billing choice (Puudus_eta / Puudus_p) is made. Hidden when everything is marked.
export default function UnmarkedLessonsCard({ schedule = [], teacherUid = '', today, user, repository = api, limit = 6 }) {
  const state = useAsyncData(() => Promise.resolve().then(() => repository.lessons(teacherUid)), [repository, teacherUid]);
  const [done, setDone] = useState(() => new Set());
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  // marked in the side drawer (right-click → „Ava tund (siinsamas)”, owner 2026-11-09): the row goes away here too
  useEffect(() => onLessonMarked((occurrenceId) => setDone((current) => new Set(current).add(occurrenceId))), []);
  const all = useMemo(() => (state.data ? unmarkedLessons({ schedule, lessons: state.data, today, teacherUid }) : []), [state.data, schedule, today, teacherUid]);
  const items = useMemo(() => all.filter((item) => !done.has(item.occurrenceId)), [all, done]);
  if (!items.length) return null;

  async function markHeld(item) {
    setBusy(item.occurrenceId);
    setError('');
    try {
      await repository.markHeld(item, user);
      setDone((current) => new Set(current).add(item.occurrenceId));
    } catch (problem) {
      setError(problem?.message || 'Märkimine ebaõnnestus.');
    } finally {
      setBusy('');
    }
  }

  const older = olderUnmarked(items, today);
  return <Card className="retention-card unmarked-card">
    <div className="section-heading"><div><span className="eyebrow">Tunnipäevik</span><h2><CalendarCheck size={18} aria-hidden="true" /> {items.length} märkimata {items.length === 1 ? 'tund' : 'tundi'}</h2></div></div>
    <p className="form-hint">Viimase aasta tunnid{older ? `, neist ${older} vanemad kui 2 nädalat` : ''}. Märgi need — muidu ei näe õpilase edenemine, aruanded ega kuuarved neid.</p>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <ul className="unmarked-list">
      {items.slice(0, limit).map((item) => <li key={item.occurrenceId} data-entity="lesson" data-schedule-id={item.id} data-date={item.occurrenceDate} data-student-id={item.studentId || undefined} data-entity-title={`${item.time ? `${item.time} · ` : ''}${item.studentName || 'Tund'}`}>
        <div><strong>{item.studentName || 'Õpilane'}</strong><small>{dayLabel(item.occurrenceDate)}{item.time ? ` · ${item.time}` : ''}{teacherUid ? '' : ` · ${item.teacher || 'Õpetaja'}`}</small></div>
        <button type="button" className="button button--primary" data-entity-action="done" disabled={Boolean(busy)} onClick={() => markHeld(item)}>{busy === item.occurrenceId ? 'Märgin…' : 'Toimunud'}</button>
        <Link to={calendarLessonPath(item)}>Muu…</Link>
      </li>)}
    </ul>
    <p className="form-hint">{items.length > limit ? `+ veel ${items.length - limit} tundi · ` : ''}<Link to="/calendar/markimata">Märkimata tunnid koos Live-tundidega</Link></p>
  </Card>;
}
