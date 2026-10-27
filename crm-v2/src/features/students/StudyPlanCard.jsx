import { ArrowDown, ArrowUp, ListChecks, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, EmptyState, Input, LoadingState, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, libraryService, studentsService } from '../../services/firebase/index.js';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { autoPlan, lessonResults, movePlanLesson, planDoneIds, planPace, planRows, recommendLessons, weeklyLessonsNow } from './studyPlanModel.js';
import { toIsoDate } from '../calendar/calendarView.js';
import './studyPlan.css';

const STATE = {
  mastered: ['success', 'selge'],
  done: ['info', 'tehtud'],
  repeat: ['warning', 'korda'],
  new: ['neutral', 'plaanis'],
  skipped: ['neutral', 'vahele jäetud'],
};
const EMPTY = { level: '', goal: '', targetDate: '', lessons: [] };

/**
 * „Õppeplaan” on the student card: the course (level), the goal and the ordered course lessons for this student.
 * Recommendations come from the student's own results: weak lessons to repeat first, then the next new lessons of
 * the course; lessons learned well are left out. The calendar suggests the first open lesson of the plan as the topic.
 */
export default function StudyPlanCard({ student, lessons = [], schedule = [], user, canEdit = false, library = libraryService, homework = homeworkService, students = studentsService, onSaved }) {
  const libraryState = useAsyncData(() => library.list(), [library]);
  const worksState = useAsyncData(() => homework.listWorksheetAssignmentsByStudentIds([student.id]).catch(() => []), [homework, student.id]);
  const catalog = useMemo(() => (libraryState.data ? buildTopicCatalog(libraryState.data.curriculumLessons) : null), [libraryState.data]);
  const results = useMemo(() => lessonResults({ assignments: worksState.data || [], records: lessons }), [worksState.data, lessons]);
  const [plan, setPlan] = useState(() => ({ ...EMPTY, ...(student.studyPlan || {}) }));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dirty, setDirty] = useState(false);

  // a course the student's level points to, when no plan was chosen yet
  useEffect(() => {
    if (!catalog || plan.level) return;
    const level = catalog.levels.find((entry) => entry.key === student.level)?.key || catalog.levels.find((entry) => String(entry.key).startsWith(String(student.level || '').slice(0, 2)))?.key || '';
    if (level) setPlan((current) => ({ ...current, level }));
  }, [catalog, plan.level, student.level]);

  if (libraryState.loading || worksState.loading) return <Card><LoadingState label="Laen õppeplaani…" /></Card>;
  if (!catalog) return <Card><EmptyState title="Õppevara ei saanud laadida" /></Card>;

  const change = (patch) => { setPlan((current) => ({ ...current, ...patch })); setDirty(true); setMessage(''); };
  const setLessons = (next) => change({ lessons: next });
  const rows = planRows({ plan, catalog, results });
  const recommended = recommendLessons({ catalog, level: plan.level, plan, results });
  const done = rows.filter((row) => ['mastered', 'done'].includes(row.state)).length;
  const today = toIsoDate();
  const pace = planPace({ plan, doneIds: planDoneIds(results), today, weeklyNow: weeklyLessonsNow(schedule, today) });
  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const saved = await students.saveStudyPlan(student.id, plan, user);
      setPlan((current) => ({ ...current, ...saved })); setDirty(false); setMessage('Õppeplaan salvestati.');
      onSaved?.(saved);
    } catch (error) { setMessage(error.message || 'Plaani ei saanud salvestada.'); } finally { setSaving(false); }
  };

  return (
    <Card className="study-plan">
      <div className="section-heading"><div><span className="eyebrow">Individuaalne</span><h2>Õppeplaan</h2></div><ListChecks size={20} aria-hidden="true" /></div>
      <div className="study-plan__head form-grid">
        <Select id="study-plan-level" label="Kursus" value={plan.level} disabled={!canEdit} onChange={(event) => change({ level: event.target.value })}>
          <option value="">Vali kursus</option>
          {catalog.levels.map((entry) => <option key={entry.key} value={entry.key}>{entry.label}</option>)}
        </Select>
        <Input id="study-plan-target" label="Siht kuupäev" type="date" value={plan.targetDate} disabled={!canEdit} onChange={(event) => change({ targetDate: event.target.value })} />
        <Input id="study-plan-goal" className="form-grid__wide" label="Eesmärk" placeholder="Nt: põhikooli lõpueksam B1, mai 2027" value={plan.goal} disabled={!canEdit} onChange={(event) => change({ goal: event.target.value })} />
      </div>

      {pace ? <p className={`study-plan__pace is-${pace.status}`} role="status">{pace.status === 'done' ? 'Kõik plaani tunnid on tehtud.' : <>Jäänud <b>{pace.remaining}</b> tundi · <b>{pace.weeks}</b> nädalat sihtkuupäevani → vaja <b>{pace.needed}</b> tundi nädalas · tunniplaanis praegu <b>{pace.weeklyNow}</b>{pace.status === 'behind' ? ' — ei jõua: lisa tunde kalendris või Planeerijas (Planeerija arvestab plaani tempot).' : ' — jõuab.'}</>}</p> : null}

      {plan.level ? <section className="study-plan__section" aria-label="Soovitused">
        <div className="study-plan__bar"><h3><Sparkles size={16} aria-hidden="true" /> Soovitame järgmiseks</h3>
          {canEdit ? <Button variant="secondary" onClick={() => setLessons(autoPlan({ catalog, level: plan.level, results }))}>Koosta plaan automaatselt</Button> : null}</div>
        {recommended.length ? <ul className="study-plan__list">{recommended.map((item) => <li key={item.lesson.id}>
          <span><strong>{item.lesson.title}</strong><small>{item.reason}</small></span>
          <Badge tone={item.kind === 'repeat' ? 'warning' : 'info'}>{item.kind === 'repeat' ? 'korda' : 'uus'}</Badge>
          {canEdit ? <Button variant="secondary" aria-label={`Lisa plaani: ${item.lesson.title}`} onClick={() => setLessons([...plan.lessons, { id: item.lesson.id, status: 'planned' }])}><Plus size={15} /> Lisa</Button> : null}
        </li>)}</ul> : <p className="form-hint">Selle kursuse tunnid on plaanis või juba hästi selged.</p>}
      </section> : null}

      <section className="study-plan__section" aria-label="Plaan">
        <div className="study-plan__bar"><h3>Plaan ({rows.length} tundi{rows.length ? ` · tehtud ${done}` : ''})</h3></div>
        {rows.length ? <ol className="study-plan__list study-plan__list--plan">{rows.map((row, index) => <li key={row.id} className={row.status === 'skipped' ? 'is-skipped' : ''}>
          <span><strong>{row.lesson?.title || 'Tund puudub Õppevaras'}</strong><small>{[row.lesson?.level, row.lesson?.moduleTitle, row.result?.pct !== null && row.result?.pct !== undefined ? `tulemus ${row.result.pct}%` : row.result?.held ? 'tund toimus' : ''].filter(Boolean).join(' · ')}</small></span>
          <Badge tone={STATE[row.state][0]}>{STATE[row.state][1]}</Badge>
          {canEdit ? <span className="study-plan__actions">
            <button type="button" className="text-button" aria-label="Üles" disabled={!index} onClick={() => setLessons(movePlanLesson(plan.lessons, row.id, -1))}><ArrowUp size={16} /></button>
            <button type="button" className="text-button" aria-label="Alla" disabled={index === rows.length - 1} onClick={() => setLessons(movePlanLesson(plan.lessons, row.id, 1))}><ArrowDown size={16} /></button>
            <button type="button" className="link-button" onClick={() => setLessons(plan.lessons.map((item) => (item.id === row.id ? { ...item, status: item.status === 'skipped' ? 'planned' : 'skipped' } : item)))}>{row.status === 'skipped' ? 'Taasta' : 'Jäta vahele'}</button>
            <button type="button" className="text-button danger" aria-label={`Eemalda: ${row.lesson?.title || row.id}`} onClick={() => setLessons(plan.lessons.filter((item) => item.id !== row.id))}><Trash2 size={16} /></button>
          </span> : null}
        </li>)}</ol> : <EmptyState title="Plaan on tühi" description={canEdit ? 'Vali kursus ja vajuta „Koosta plaan automaatselt” või lisa tunnid soovitustest.' : 'Õpetaja pole veel plaani koostanud.'} />}
      </section>

      {canEdit ? <div className="form-actions"><Button loading={saving} disabled={!dirty} onClick={save}>Salvesta plaan</Button>{plan.updatedAt && !dirty ? <small className="form-hint">Viimati muutis {plan.updatedByName || '—'} · {String(plan.updatedAt).slice(0, 10)}</small> : null}</div> : null}
      {message ? <p className="form-hint" role="status">{message}</p> : null}
    </Card>
  );
}
