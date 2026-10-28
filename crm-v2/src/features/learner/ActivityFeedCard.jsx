import { Activity } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, EmptyState, LoadingState } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, lessonsService } from '../../services/firebase/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { presenceService } from '../../services/firebase/presence.js';
import { activityFeed, feedByDay } from './activityFeed.js';
import './learner.css';

const api = {
  words: (studentId) => studentWordsService.listForStudent(studentId),
  assignments: (studentId) => homeworkService.listWorksheetAssignmentsByStudentIds([studentId]),
  homework: (studentId) => homeworkService.listByStudentIds([studentId]),
  lessons: (studentId) => lessonsService.listByStudent(studentId),
  presence: (studentId) => presenceService.forStudent(studentId),
};
const ICON = { seen: '👋', course: '📘', assigned: '📄', started: '✏️', done: '✅', words: '🔤', errors: '🔁', homework: '🏠', lesson: '🎓' };
const dayLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'short' });
const clock = (at) => new Date(at).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' });

/** „Õpilase tegevused”: what the student did in the last 60 days, by day (activityFeed.js). */
export default function ActivityFeedCard({ studentId, repository = api }) {
  const state = useAsyncData(async () => {
    const settle = (load) => Promise.resolve().then(load).catch(() => null);
    const [words, assignments, homework, lessons, presence] = await Promise.all(['words', 'assignments', 'homework', 'lessons', 'presence'].map((key) => settle(() => repository[key]?.(studentId))));
    return { words: words || [], assignments: assignments || [], homework: homework || [], lessons: lessons || [], presence };
  }, [repository, studentId]);
  const days = useMemo(() => (state.data ? feedByDay(activityFeed(state.data)) : []), [state.data]);
  const [all, setAll] = useState(false);
  if (state.loading && !state.data) return <Card><LoadingState label="Laen õpilase tegevusi…" /></Card>;
  const shown = all ? days : days.slice(0, 7);
  return (
    <Card className="profile-wide activity-feed" role="region" aria-label="Õpilase tegevused">
      <div className="section-heading"><div><span className="eyebrow">60 päeva</span><h2>Õpilase tegevused</h2></div><Activity size={20} aria-hidden="true" /></div>
      {shown.length ? <ol className="activity-feed__days">{shown.map((group) => <li key={group.date}>
        <strong>{dayLabel(group.date)}</strong>
        <ul>{group.items.map((item, index) => <li key={`${item.kind}-${item.at}-${index}`}><span aria-hidden="true">{ICON[item.kind] || '•'}</span><span>{item.text}</span>{item.kind === 'errors' || item.kind === 'lesson' ? null : <small>{clock(item.at)}</small>}</li>)}</ul>
      </li>)}</ol> : <EmptyState title="Tegevusi pole" description="Kui õpilane logib sisse, avab või täidab töölehti või kordab sõnu, näed seda siin." />}
      {days.length > 7 ? <button type="button" className="link-button" onClick={() => setAll(!all)}>{all ? 'Näita vähem' : `Näita kõiki (${days.length} päeva)`}</button> : null}
    </Card>
  );
}
