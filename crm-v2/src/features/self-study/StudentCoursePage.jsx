import { CheckCircle2, ChevronDown, ChevronRight, Circle, CircleDot, PlayCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, libraryService, lessonWorksheetsService, studentsService } from '../../services/firebase/index.js';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { publishedWorksheetDoc } from '../library/libraryModel.js';
import WorksheetPlayer from '../homework/WorksheetPlayer.jsx';
import { PHASES, lessonProgress, nextLesson, progressMap } from './selfStudyModel.js';
import './selfStudy.css';

const api = {
  students: (uid) => studentsService.listSelf(uid),
  curriculum: () => libraryService.listCurriculum(),
  assignments: (ids) => homeworkService.listWorksheetAssignmentsByStudentIds(ids),
  sheets: (lessonId) => lessonWorksheetsService.list(lessonId),
  start: (input) => homeworkService.createSelfStudy(input),
};
const ICON = { done: CheckCircle2, started: CircleDot, none: Circle };
// only the course itself (roadmapManaged lessons): old hand-made library lessons — some named after a student — and
// their modules without sheets stay out of a student's course map
export const courseLessons = (lessons = []) => (lessons.some((lesson) => lesson.roadmapManaged) ? lessons.filter((lesson) => lesson.roadmapManaged) : lessons);

// „Minu kursus” (owner 2026-10-23: самостоятельный курс нужен, сертификат нет): the course of the student's level module
// by module, each lesson's three sheets with his progress. A self-study card (isSelfStudent) opens the sheets itself
// („Õpi ise”, homework.createSelfStudy; the rules allow only the published sheet, unscored at the start); a student who
// learns with a teacher sees the map and his progress — the sheets are done in the lesson (owner 2026-10-12).
export default function StudentCoursePage({ repository = api }) {
  const { user } = useAuth();
  const state = useAsyncData(async () => {
    const students = await repository.students(user.uid);
    const [curriculum, assignments] = await Promise.all([repository.curriculum().catch(() => []), repository.assignments(students.map((s) => s.id)).catch(() => [])]);
    return { students, catalog: buildTopicCatalog(courseLessons(curriculum?.curriculumLessons || curriculum || [])), assignments };
  }, [repository, user.uid]);
  const [level, setLevel] = useState('');
  const [openModule, setOpenModule] = useState('');
  const [playing, setPlaying] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const student = state.data?.students.find((s) => s.isSelfStudent) || state.data?.students[0] || null;
  const levels = state.data?.catalog.levels || [];
  const shown = levels.find((entry) => entry.key === (level || student?.level)) || levels.find((entry) => entry.label === student?.level) || levels[0];
  const map = useMemo(() => progressMap(state.data?.assignments || []), [state.data]);
  const lessons = useMemo(() => (shown?.modules || []).flatMap((module) => module.lessons), [shown]);
  const next = nextLesson(lessons, map);

  if (state.loading) return <LoadingState label="Laen kursust…" />;
  if (state.error) return <ErrorState message={state.error.message || String(state.error)} onRetry={state.reload} />;
  if (!student || !shown) return <div className="page-content"><EmptyState title="Kursust veel ei ole" description="Kui sinu kaart on seotud ja tase määratud, ilmub kursus siia." /></div>;
  const selfStudy = Boolean(student.isSelfStudent);

  const open = async (lesson, phase) => {
    setError('');
    const existing = map[`${lesson.id}|${phase}`]?.assignment;
    if (existing) { setPlaying(existing); return; }
    if (!selfStudy) return;
    setBusy(`${lesson.id}|${phase}`);
    try {
      const record = (await repository.sheets(lesson.id)).find((item) => item.id === phase || item.worksheetId === phase);
      const doc = publishedWorksheetDoc(record);
      if (!doc?.blocks?.length) throw new Error('Seda töölehte veel ei ole.');
      setPlaying(await repository.start({ student, lesson, phase, publishedDoc: doc, user }));
    } catch (nextError) { setError(nextError?.message || 'Töölehte ei saanud avada.'); } finally { setBusy(''); }
  };

  return <div className="page-content course-page">
    <PageHeader eyebrow="Minu kursus" title={`Kursus · ${shown.label}`} description={selfStudy ? 'Mine tund tunni haaval: Avasta, Harjuta, Kasuta. Iga päev ka „Päeva 5 minutit”.' : 'Sinu kursuse kaart ja edenemine. Töölehti teed koos õpetajaga tunnis.'} />
    {levels.length > 1 ? <div className="course-levels" role="group" aria-label="Tase">{levels.map((entry) => <button type="button" key={entry.key} className={entry.key === shown.key ? 'is-active' : ''} aria-pressed={entry.key === shown.key} onClick={() => setLevel(entry.key)}>{entry.label}</button>)}</div> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {next ? <Card className="course-next"><span className="eyebrow">Järgmine tund</span><h2>{next.number ? `${next.number}. ` : ''}{next.title}</h2>
      {selfStudy ? <Button onClick={() => { const p = lessonProgress(next.id, map).phases.find((ph) => ph.status !== 'done'); open(next, p?.key || 'discover'); }} loading={Boolean(busy)}><PlayCircle size={16} /> {lessonProgress(next.id, map).done ? 'Jätka' : 'Alusta'}</Button> : <p className="form-hint">Seda tundi teed koos õpetajaga.</p>}
    </Card> : <Card className="course-next"><h2>Taseme kõik tunnid on tehtud!</h2></Card>}
    {shown.modules.map((module) => {
      const done = module.lessons.filter((lesson) => lessonProgress(lesson.id, map).done === 3).length;
      const expanded = openModule === module.key || (!openModule && module.lessons.some((lesson) => lesson.id === next?.id));
      return <Card key={module.key} className="course-module">
        <button type="button" className="course-module__head" aria-expanded={expanded} onClick={() => setOpenModule(expanded ? '-' : module.key)}>
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}<strong>{module.label}</strong><span>{done}/{module.lessons.length} tundi tehtud</span>
        </button>
        {expanded ? <ol className="course-lessons">{module.lessons.map((lesson) => {
          const progress = lessonProgress(lesson.id, map);
          return <li key={lesson.id} className={lesson.id === next?.id ? 'is-next' : ''}><span className="course-lesson__title">{lesson.number ? `${lesson.number}. ` : ''}{lesson.title}</span>
            <span className="course-phases">{progress.phases.map((phase) => {
              const Icon = ICON[phase.status];
              const can = phase.assignment || selfStudy;
              return <button type="button" key={phase.key} className={`course-phase is-${phase.status}`} disabled={!can || Boolean(busy)} onClick={() => open(lesson, phase.key)} title={phase.pct !== null ? `${phase.pct}%` : ''}>
                <Icon size={14} aria-hidden="true" />{phase.label}{phase.pct !== null ? ` · ${phase.pct}%` : ''}</button>;
            })}</span></li>;
        })}</ol> : null}
      </Card>;
    })}
    {playing ? <WorksheetPlayer assignment={playing} repository={homeworkService} onClose={() => { setPlaying(null); state.reload(); }} onSubmitted={state.reload} /> : null}
  </div>;
}
