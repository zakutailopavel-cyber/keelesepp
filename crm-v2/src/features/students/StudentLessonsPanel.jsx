import { CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, EmptyState } from '../../components/ui/index.js';
import LessonDetailModal from './LessonDetailModal.jsx';

// Student card „Tunnid”: the timetable (planned lessons) and the lesson journal (held / absent) in one place.
// Admins change the mark of a held lesson here, including „Toimunud ja kontrollitud”.

const LESSON_MARKS = [
  { value: 'Toimunud', label: 'Toimunud' },
  { value: 'verified', label: 'Toimunud ja kontrollitud' },
  { value: 'Puudus_p', label: 'Puudus (teatas ette)' },
  { value: 'Puudus_eta', label: 'Puudus (ei teatanud)' },
  { value: 'remove', label: 'Eemalda märge (jälle planeeritud)' },
];

const markOf = (lesson) => (lesson.status === 'Toimunud' || !lesson.status ? (lesson.verified ? 'verified' : 'Toimunud') : lesson.status);
const markLabel = (lesson) => LESSON_MARKS.find((mark) => mark.value === markOf(lesson))?.label || lesson.status || 'Toimunud';
const markTone = (mark) => (mark === 'verified' ? 'success' : mark === 'Toimunud' ? 'info' : mark === 'Tühistatud' ? 'neutral' : 'warning');
const today = () => new Date().toISOString().slice(0, 10);

export default function StudentLessonsPanel({ student, lessons, schedule, canManage = false, lessonApi, user, onChanged, detailApis = {} }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [opened, setOpened] = useState(null);

  const now = today();
  const upcoming = schedule
    .filter((item) => item.status !== 'Tühistatud' && (!item.date || item.date >= now) && !['Toimunud', 'Puudus_eta', 'Puudus_p'].includes(item.status))
    .sort((a, b) => `${a.date || '9'}${a.time || ''}`.localeCompare(`${b.date || '9'}${b.time || ''}`));
  const markedIds = new Set(lessons.map((lesson) => lesson.scheduleId).filter(Boolean));
  const unmarked = schedule.filter((item) => item.date && item.date < now && !item.recurring && (item.status || 'Planeeritud') === 'Planeeritud' && !markedIds.has(item.id));
  const shownLessons = showAll ? lessons : lessons.slice(0, 15);

  const change = async (lesson, next) => {
    const current = markOf(lesson);
    if (next === current) return;
    if (next === 'remove' && !globalThis.confirm('Eemalda tunni märge? Tund on siis jälle planeeritud ja seda ei arvestata arvel.')) return;
    setBusy(lesson.id); setError(''); setNotice('');
    try {
      const recurring = schedule.find((item) => item.id === lesson.scheduleId)?.recurring;
      const options = { scheduleRecurring: recurring === undefined ? true : Boolean(recurring) };
      let updated = lesson;
      if (next === 'remove') {
        await lessonApi.removeMark(lesson, user, options);
        updated = null;
      } else if (next === 'verified' || (next === 'Toimunud' && current === 'verified')) {
        if (lesson.status && lesson.status !== 'Toimunud') updated = await lessonApi.changeMark(lesson, 'Toimunud', user, options);
        updated = await lessonApi.setVerified(updated, next === 'verified', user);
      } else {
        updated = await lessonApi.changeMark(lesson, next, user, options);
      }
      onChanged(lessons.flatMap((item) => (item.id !== lesson.id ? [item] : updated ? [{ ...item, ...updated }] : [])));
      setNotice(next === 'remove' ? 'Märge eemaldati, tund on jälle planeeritud.' : `Tund ${lesson.date}: ${LESSON_MARKS.find((mark) => mark.value === next)?.label}.`);
    } catch (changeError) {
      setError(changeError.message || 'Tunni staatust ei saanud muuta.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="profile-grid student-lessons">
      <Card className="profile-wide">
        <div className="section-heading"><h2>Tulevased tunnid</h2><Link className="button button--secondary" to="/calendar">Ava kalender</Link></div>
        {upcoming.length ? (
          <div className="simple-list">
            {upcoming.slice(0, 12).map((item) => (
              <div key={item.id}>
                <div><strong>{item.date || `Iganädalane · ${item.day || 'päev määramata'}`} · {item.time || 'kellaaeg määramata'}</strong><span>{item.teacher || student.teacher || 'Õpetaja määramata'}</span></div>
                <Badge tone="info">{item.status || 'Planeeritud'}</Badge>
              </div>
            ))}
          </div>
        ) : <EmptyState title="Tulevasi tunde ei ole" description="Uus tund lisatakse kalendri kaudu." />}
        {unmarked.length ? <p className="student-lessons__unmarked">{unmarked.length} möödunud tundi on märkimata ({unmarked.slice(0, 3).map((item) => item.date).join(', ')}{unmarked.length > 3 ? ', …' : ''}). Märgi need kalendris.</p> : null}
      </Card>

      <Card className="profile-wide">
        <div className="section-heading"><h2>Toimunud tunnid</h2>{canManage ? <span className="student-lessons__hint">Staatust muudab admin. Arvel olevat tundi parandatakse Finantsides.</span> : null}</div>
        {error ? <div className="form-error" role="alert">{error}</div> : null}
        {notice ? <div className="success-notice" role="status">{notice}</div> : null}
        {lessons.length ? (
          <div className="simple-list">
            {shownLessons.map((lesson) => {
              const mark = markOf(lesson);
              return (
                <div key={lesson.id}>
                  <button type="button" className="student-lessons__open" onClick={() => setOpened(lesson)} aria-label={`Ava tund ${lesson.date || ''}`}>
                    <strong>{lesson.date || 'Kuupäev puudub'}{lesson.time ? ` · ${lesson.time}` : ''}</strong>
                    <span>{[lesson.subject || student.subject, lesson.topic, lesson.teacher].filter(Boolean).join(' · ')}</span>
                    {lesson.verified && lesson.verifiedByName ? <small className="student-lessons__verified"><CheckCheck size={13} aria-hidden="true" /> Kontrollis {lesson.verifiedByName}</small> : null}
                  </button>
                  {canManage ? (
                    <select
                      className={`student-lessons__mark tone-${markTone(mark)}`}
                      aria-label={`Tunni ${lesson.date} staatus`}
                      value={mark}
                      disabled={busy === lesson.id}
                      onChange={(event) => change(lesson, event.target.value)}
                    >
                      {LESSON_MARKS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : <Badge tone={markTone(mark)}>{markLabel(lesson)}</Badge>}
                </div>
              );
            })}
          </div>
        ) : <EmptyState title="Toimunud tunde veel ei ole" />}
        {opened ? <LessonDetailModal lesson={lessons.find((item) => item.id === opened.id) || opened} student={student} user={user} isAdmin={canManage} markLabel={markLabel(lessons.find((item) => item.id === opened.id) || opened)} onClose={() => setOpened(null)} {...detailApis} /> : null}
        {lessons.length > 15 ? <button type="button" className="button button--secondary student-lessons__more" onClick={() => setShowAll((value) => !value)}>{showAll ? 'Näita vähem' : `Näita kõiki (${lessons.length})`}</button> : null}
      </Card>
    </div>
  );
}
