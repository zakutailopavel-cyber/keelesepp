import { CalendarCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { lessonsService } from '../../services/firebase/index.js';
import { unmarkedLessons } from './unmarkedLessons.js';
import '../retention/retention.css';

const api = {
  lessons: (teacherUid) => lessonsService.listForCalendar(teacherUid ? { teacherUid } : {}),
  markHeld: (item, user) => lessonsService.completeFromSchedule(item, user, { status: 'Toimunud' }),
};
const dayLabel = (iso) => new Intl.DateTimeFormat('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' }).format(new Date(`${iso}T12:00:00`));
export const calendarLessonPath = (item) => `/calendar?lesson=${encodeURIComponent(`${item.occurrenceId}|${item.occurrenceDate}`)}`;

// „Märkimata tunnid” on the dashboard: past lessons of the last two weeks with no journal mark. Unmarked lessons make
// the progress, retention and month reports wrong, so a held lesson is marked here in one click; an absence opens the
// calendar, where its billing choice (Puudus_eta / Puudus_p) is made. Hidden when everything is marked.
export default function UnmarkedLessonsCard({ schedule = [], teacherUid = '', today, user, repository = api, limit = 6 }) {
  const state = useAsyncData(() => Promise.resolve().then(() => repository.lessons(teacherUid)), [repository, teacherUid]);
  const [done, setDone] = useState(() => new Set());
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const items = useMemo(() => (state.data ? unmarkedLessons({ schedule, lessons: state.data, today, teacherUid }).filter((item) => !done.has(item.occurrenceId)) : []), [state.data, schedule, today, teacherUid, done]);
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

  return <Card className="retention-card unmarked-card">
    <div className="section-heading"><div><span className="eyebrow">Tunnipäevik</span><h2><CalendarCheck size={18} aria-hidden="true" /> {items.length} märkimata tundi</h2></div></div>
    <p className="form-hint">Märgi möödunud tunnid — muidu ei näe õpilase edenemine ega aruanded neid.</p>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <ul className="unmarked-list">
      {items.slice(0, limit).map((item) => <li key={item.occurrenceId}>
        <div><strong>{item.studentName || 'Õpilane'}</strong><small>{dayLabel(item.occurrenceDate)}{item.time ? ` · ${item.time}` : ''}{teacherUid ? '' : ` · ${item.teacher || 'Õpetaja'}`}</small></div>
        <button type="button" className="button button--primary" disabled={Boolean(busy)} onClick={() => markHeld(item)}>{busy === item.occurrenceId ? 'Märgin…' : 'Toimunud'}</button>
        <Link to={calendarLessonPath(item)}>Muu…</Link>
      </li>)}
    </ul>
    {items.length > limit ? <p className="form-hint">+ veel {items.length - limit} tundi · <Link to="/calendar">Ava kalender</Link></p> : null}
  </Card>;
}
