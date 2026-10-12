import { ArrowLeft, BookOpen, Check, ChevronRight, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, lessonWorksheetsService, libraryService, studentsService } from '../../services/firebase/index.js';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { publishedWorksheetDoc } from '../library/libraryModel.js';
import DocWorksheetPlayer from '../worksheet-studio/DocWorksheetPlayer.jsx';
import { lessonProgress, nextLesson, PHASES, progressMap } from './selfStudyModel.js';
import './selfStudy.css';

/**
 * „Õpi ise” (owner 2026-10-12): the student goes through the course on his own between lessons — the published sheets
 * of every lesson of his level (Avasta → Harjuta → Kasuta), checked automatically, progress per module. The teacher
 * sees the sheets like any other work (source „self_study”).
 */
export default function SelfStudyPage({
  studentRepository = studentsService, catalogRepository = libraryService,
  worksheetRepository = lessonWorksheetsService, homework = homeworkService,
}) {
  const { user, preview } = useAuth();
  const [extra, setExtra] = useState([]);
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const [curriculum, assignments] = await Promise.all([
      catalogRepository.listCurriculum(),
      homework.listWorksheetAssignmentsByStudentIds(students.map((student) => student.id)),
    ]);
    return { students, catalog: buildTopicCatalog(curriculum), assignments };
  }, [preview?.studentId, user.uid]);
  const [level, setLevel] = useState('');
  const [open, setOpen] = useState(null); // { lesson, sheets: { phase: doc }, loading, error }
  const [playing, setPlaying] = useState(null); // an assignment
  const [busy, setBusy] = useState('');

  const assignments = useMemo(() => [...extra, ...(state.data?.assignments || [])], [extra, state.data]);
  const map = useMemo(() => progressMap(assignments), [assignments]);
  if (state.loading) return <div className="page-content"><LoadingState label="Laen kursust…" /></div>;
  if (state.error) return <div className="page-content"><ErrorState message={state.error.message || String(state.error)} onRetry={state.reload} /></div>;

  const { students, catalog } = state.data;
  const student = students[0];
  if (!student) return <div className="page-content"><Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" /></Card></div>;
  const levels = catalog.levels;
  const shown = level || levels.find((entry) => entry.key === student.level || entry.label === student.level)?.key || levels[0]?.key || '';
  const modules = levels.find((entry) => entry.key === shown)?.modules || [];
  const lessons = modules.flatMap((module) => module.lessons);
  const next = nextLesson(lessons, map);
  const doneLessons = lessons.filter((lesson) => lessonProgress(lesson.id, map).done === 3).length;

  const openLesson = async (lesson) => {
    setPlaying(null);
    setOpen({ lesson, sheets: {}, loading: true });
    try {
      const records = await worksheetRepository.list(lesson.id);
      const sheets = {};
      for (const record of records) {
        const doc = publishedWorksheetDoc(record);
        const phase = record.worksheetId || record.role || doc?.meta?.phase;
        if (doc?.blocks?.length && PHASES.some((p) => p.key === phase)) sheets[phase] = doc;
      }
      setOpen({ lesson, sheets, loading: false });
    } catch (error) {
      setOpen({ lesson, sheets: {}, loading: false, error: error?.message || 'Lehti ei saanud laadida.' });
    }
  };

  const startPhase = async (phase) => {
    const existing = map[`${open.lesson.id}|${phase}`]?.assignment;
    if (existing) { setPlaying(existing); return; }
    setBusy(phase);
    try {
      const created = await homework.createSelfStudy({ student, lesson: open.lesson, phase, publishedDoc: open.sheets[phase], user });
      setExtra((current) => [created, ...current]);
      setPlaying(created);
    } catch (error) {
      setOpen((current) => ({ ...current, error: error?.message || 'Lehte ei saanud avada.' }));
    } finally { setBusy(''); }
  };

  const title = (lesson) => `${lesson.number ? `${lesson.number}. ` : ''}${lesson.title}`;

  if (open && playing) {
    return <div className="page-content">
      <button type="button" className="ss-back" onClick={() => { setPlaying(null); state.reload(); }}><ArrowLeft size={16} /> {title(open.lesson)}</button>
      <DocWorksheetPlayer key={playing.id} assignment={playing} repository={homework} inline readOnly={Boolean(preview)} onClose={() => { setPlaying(null); state.reload(); }} onSubmitted={() => state.reload()} />
    </div>;
  }

  if (open) {
    const progress = lessonProgress(open.lesson.id, map);
    return <div className="page-content">
      <button type="button" className="ss-back" onClick={() => setOpen(null)}><ArrowLeft size={16} /> Kõik tunnid</button>
      <PageHeader eyebrow={open.lesson.moduleTitle || 'Õpi ise'} title={title(open.lesson)} description="Tee kolm sammu järjest: avasta uus teema, harjuta ja kasuta seda päris olukorras." />
      {open.error ? <p className="form-error" role="alert">{open.error}</p> : null}
      {open.loading ? <LoadingState label="Laen tunni lehti…" /> : <div className="ss-steps">
        {progress.phases.map((phase, index) => {
          const available = Boolean(open.sheets[phase.key]);
          return <article key={phase.key} className={`ss-step is-${phase.status}`}>
            <span className="ss-step__num">{phase.status === 'done' ? <Check size={18} /> : index + 1}</span>
            <div><strong>{phase.label}</strong><small>{phase.status === 'done' ? (phase.pct != null ? `Tehtud · ${phase.pct}%` : 'Tehtud') : phase.status === 'started' ? 'Pooleli' : available ? 'Alustamata' : 'Leht on veel tegemisel'}</small></div>
            <button type="button" className="ss-btn" disabled={!available || Boolean(busy) || (Boolean(preview) && phase.status === 'none')} onClick={() => startPhase(phase.key)}>
              {busy === phase.key ? 'Avan…' : phase.status === 'done' ? 'Vaata' : phase.status === 'started' ? 'Jätka' : 'Alusta'} <ChevronRight size={15} />
            </button>
          </article>;
        })}
      </div>}
    </div>;
  }

  return <div className="page-content">
    <PageHeader eyebrow="Minu õpingud" title="Õpi ise" description="Kursuse tunnid sinu tasemel: tee lehed omas tempos, iga leht kontrollitakse kohe." />
    {next ? <section className="ss-hero" aria-label="Jätka">
      <div><span className="eyebrow">Jätka siit</span><h2>{title(next)}</h2><p>{next.moduleTitle} · {lessonProgress(next.id, map).done}/3 sammu tehtud</p></div>
      <button type="button" className="ss-hero__go" onClick={() => openLesson(next)}><Play size={18} /> {lessonProgress(next.id, map).done ? 'Jätka' : 'Alusta'}</button>
    </section> : null}
    <Card>
      <div className="section-heading"><div><span className="eyebrow">Kursus</span><h2>{doneLessons}/{lessons.length} tundi läbitud</h2></div>
        {levels.length ? <select className="vd-level" aria-label="Tase" value={shown} onChange={(event) => setLevel(event.target.value)}>{levels.map((entry) => <option key={entry.key} value={entry.key}>{entry.label}</option>)}</select> : null}
      </div>
      {modules.length ? modules.map((module) => {
        const done = module.lessons.filter((lesson) => lessonProgress(lesson.id, map).done === 3).length;
        return <details key={module.key} className="ss-module" open={module.lessons.some((lesson) => lesson.id === next?.id)}>
          <summary><BookOpen size={16} /> {module.label} <small>{done}/{module.lessons.length}</small></summary>
          <div className="ss-lessons">{module.lessons.map((lesson) => {
            const progress = lessonProgress(lesson.id, map);
            return <button type="button" key={lesson.id} className={`ss-lesson ${progress.done === 3 ? 'is-done' : ''}`} onClick={() => openLesson(lesson)}>
              <span><strong>{title(lesson)}</strong></span>
              <span className="ss-dots" aria-label={`${progress.done}/3 sammu tehtud`}>{progress.phases.map((phase) => <i key={phase.key} className={`is-${phase.status}`} title={phase.label} />)}</span>
              <ChevronRight size={16} />
            </button>;
          })}</div>
        </details>;
      }) : <EmptyState title="Kursuse tunde ei leitud" />}
    </Card>
  </div>;
}
