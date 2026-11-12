import { Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, Languages, ListTodo, Mic, Paperclip, PlayCircle, Target } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { interactiveAssignmentsService } from '../../services/firebase/interactiveAssignments.js';
import { studentsService } from '../../services/firebase/students.js';
import { groupStudentPeople } from '../../services/firebase/students.js';
import { studentMonologuesService } from '../../services/firebase/studentMonologues.js';
import { monologueLevel, monologueTask } from '../monologue/monologueModel.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import { localDate } from '../../utils/localDate.js';
import MaterialPreview from '../library/MaterialPreview.jsx';
import { buildLibraryItems } from '../library/libraryModel.js';
import ChildSwitch, { childKeyOf } from '../parents/ChildSwitch.jsx';
import { feedbackSeenAt, markFeedbackSeen } from '../students/nextStep.js';
import { isTaskSkill, SKILL_TASKS } from '../students/skillTasks.js';
import { itemSubject, subjectsOf } from '../students/subjects.js';
import ExercisePlayer from './ExercisePlayer.jsx';
import InteractiveLessonPlayer from './InteractiveLessonPlayer.jsx';
import SubmissionReviewModal from './SubmissionReviewModal.jsx';
import TaskAnswerForm from './TaskAnswerForm.jsx';
import VoiceAnswer from './VoiceAnswer.jsx';
import WorksheetPlayer from './WorksheetPlayer.jsx';
import { PHASES, TASK_STATE, mergeTasks, taskCount, taskDueText, tasksForSkill } from './taskList.js';
import { buildPath, isLateTask, isWordTask, taskLink, taskMinutes } from './taskPath.js';
import { isAudioFile } from './voiceTask.js';
import './interactiveLesson.css';
import '../students/practiceFlow.css';
import '../students/studentHome.css';
import './learnerTasks.css';
import { announcePractice } from '../practice/events.js';

const shortDay = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' }); };
const stepId = (task) => `t-${String(task.key).replace(/[^\w-]/g, '_')}`;

// what was sent: the child's own text, files and voice, one tap away so a done step stays short
function OwnAnswer({ homework }) {
  if (!homework?.studentAnswer && !homework?.studentFiles?.length) return null;
  return <details className="lt-answer"><summary>Sinu vastus</summary>
    {homework.studentAnswer ? <p>{homework.studentAnswer}</p> : null}
    {(homework.studentFiles || []).map((file) => (isAudioFile(file)
      ? <audio key={file.url} controls src={file.url} aria-label={`Häälvastus: ${file.name || ''}`} />
      : <a key={file.url} href={file.url} target="_blank" rel="noreferrer"><Paperclip size={13} /> {file.name || 'Fail'}</a>))}
  </details>;
}

const canPreviewMaterial = (homework) => Boolean(homework && !(homework.isExercise && homework.exerciseId) && (homework.sourceId || homework.attachments?.length || homework.fileUrl));

// the teacher's real grade / comment / automatic score — never anything invented
const resultText = (task) => (task.state === TASK_STATE.REVIEWED
  ? [task.grade !== '' && task.grade != null ? `Hinne ${task.grade}` : '', task.percentage != null ? `${task.percentage}%` : ''].filter(Boolean).join(' · ')
  : task.percentage != null ? `Kontrollitud automaatselt: ${task.percentage}%` : '');

// the one action of a task: the same buttons as before the path (Alusta / Jätka / Vaata / Salvesta / Tehtud / Ava kaardid)
function primaryAction(task, { canAct, busy, actions, big = false }) {
  const { homework } = task;
  const todo = task.state === TASK_STATE.TODO;
  const answering = actions.answering === homework?.id;
  const variant = big ? 'primary' : 'secondary';
  if (todo) {
    if (task.kind === 'sheet') return <Button variant={variant} data-preview-allowed onClick={() => actions.playSheet(task.sheet)}><PlayCircle size={16} aria-hidden="true" /> {!canAct ? 'Vaata' : task.started ? 'Jätka' : 'Alusta'}</Button>;
    if (canAct && task.kind === 'exercise') return <Button variant={variant} loading={busy === homework.id} onClick={() => actions.playExercise(homework)}><PlayCircle size={16} aria-hidden="true" /> Alusta</Button>;
    if (canAct && task.kind === 'interactive') return <Button variant={variant} onClick={() => actions.playInteractive(task.interactive.id)}><PlayCircle size={16} aria-hidden="true" /> Alusta</Button>;
    // „Kuu monoloog”: its own page (prompt, 2-minute timer, record again, send)
    if (task.kind === 'monologue') return <Link className={`button button--${canAct ? variant : 'secondary'}`} to="/student/monoloog"><Mic size={16} aria-hidden="true" /> {canAct ? 'Salvesta' : 'Vaata'}</Link>;
    // word cards: „Harjuta” opens the lesson's cards; the session done marks the task done (StudentPracticePage)
    if (canAct && isWordTask(task)) return <Link className={`button button--${variant}`} to={taskLink(task)}><Languages size={16} aria-hidden="true" /> Ava kaardid</Link>;
    if (canAct && task.kind === 'voice' && !answering) return <Button variant={variant} onClick={() => actions.setAnswering(homework.id)}><Mic size={16} aria-hidden="true" /> Salvesta vastus</Button>;
    if (canAct && task.kind === 'homework' && !answering) return <Button variant={variant} loading={actions.answerBusy && actions.finishing === homework.id} disabled={actions.answerBusy} onClick={() => actions.finish(homework)}><CheckCircle2 size={16} aria-hidden="true" /> Tehtud</Button>;
    return null;
  }
  if (task.kind === 'monologue') return <Link className="button button--secondary" to="/student/monoloog">Vaata</Link>;
  if (task.kind === 'interactive') return canAct ? <Button variant="secondary" onClick={() => actions.playInteractive(task.interactive.id)}>{task.state === TASK_STATE.REVIEWED ? 'Vaata tagasisidet' : 'Vaata'}</Button> : null;
  if (task.submission) return <Button variant="secondary" data-preview-allowed onClick={() => actions.review(task.submission)}>{task.state === TASK_STATE.REVIEWED ? 'Vaata tagasisidet' : 'Vaata'}</Button>;
  return null;
}

function StepIcon({ task, index }) {
  if (task.state !== TASK_STATE.TODO) return <span className="lt-step__icon is-done" aria-hidden="true"><Check size={16} /></span>;
  if (index) return <span className="lt-step__icon" aria-hidden="true">{index}</span>;
  return <span className="lt-step__icon" aria-hidden="true">{isWordTask(task) ? <Languages size={16} /> : task.kind === 'monologue' || task.kind === 'voice' ? <Mic size={16} /> : <ListTodo size={16} />}</span>;
}

/** One step of the path: a lesson's sheet (Avasta 1/3 …) or one free task. Its own actions stay as they were. */
function TaskStep({ task, phaseStep = false, current = false, today, canAct, isNew, subjectTag, busy, actions }) {
  const { homework } = task;
  const todo = task.state === TASK_STATE.TODO;
  const late = isLateTask(task, today);
  const minutes = todo ? taskMinutes(task) : 0;
  const due = todo && task.due && !late ? taskDueText(task.due, today) : '';
  const answering = actions.answering === homework?.id;
  const result = resultText(task);
  const phase = phaseStep ? PHASES[task.phase] : null;
  // the next step's button is the big one on top („Järgmine samm”); here the step only says so. A written task keeps
  // its own „Tehtud” (the big button opens its answer form instead).
  const sameAsTop = current && todo && !((task.kind === 'homework' || task.kind === 'voice') && !isWordTask(task));
  const primary = sameAsTop ? <Badge tone="success">Järgmine samm ↑</Badge> : primaryAction(task, { canAct, busy, actions });
  const word = todo && canAct && isWordTask(task);

  return <article id={stepId(task)} className={`lt-step${current ? ' is-current' : ''}${todo ? '' : ' is-done'}`} aria-label={phase ? `${phase.label}: ${task.title}` : task.title}>
    <StepIcon task={task} index={phase?.step || 0} />
    <div className="lt-step__body">
      <h4>{phase ? <>{phase.label}<span className="lt-step__purpose"> · {phase.purpose}<span className="lt-ru" lang="ru"> · {phase.ru}</span></span></> : task.title}{isNew ? <em className="lt-new">Uus</em> : null}</h4>
      {current && task.goal ? <p className="lt-goal"><Target size={14} aria-hidden="true" /> <span>{task.goal}</span></p> : null}
      {task.kind === 'voice' && todo && homework?.prompts?.length ? <ul className="voice-answer__prompts">{homework.prompts.map((line) => <li key={line}>{line}</li>)}</ul> : null}
      {task.state === TASK_STATE.REVIEWED && task.feedback ? <p className="lt-feedback">{task.feedback}</p> : null}
      {minutes || due || late || result || subjectTag || (!todo && task.doneAt) ? <p className="lt-facts">
        {minutes ? <span>umbes {minutes} min</span> : null}
        {due ? <span><Clock3 size={13} aria-hidden="true" /> {due}</span> : null}
        {late ? <span className="lt-late">hilinenud</span> : null}
        {subjectTag ? <span>{subjectTag}</span> : null}
        {result ? <span className="lt-result">{result}</span> : null}
        {!todo && task.doneAt && task.state === TASK_STATE.WAITING ? <span>Tehtud {shortDay(task.doneAt)}</span> : null}
      </p> : null}
      <OwnAnswer homework={homework} />
      <div className="lt-links">
        {homework?.boardPageId && !homework.worksheetFromBoardPage ? <Link to={`/board?page=${homework.boardPageId}`}>Ava tahvlileht „{homework.boardPageTitle || 'Tahvlileht'}”</Link> : null}
        {canPreviewMaterial(homework) && task.kind !== 'sheet' ? <button type="button" className="lt-link" data-preview-allowed disabled={busy === `material-${homework.id}`} aria-label={`Vaata materjali: ${task.title}`} onClick={() => actions.previewMaterial(homework)}>Vaata materjali</button> : null}
        {word && !answering ? <button type="button" className="lt-link" disabled={actions.answerBusy} onClick={() => actions.finish(homework)}><CheckCircle2 size={13} aria-hidden="true" /> Tehtud</button> : null}
        {canAct && todo && task.kind === 'homework' && !answering ? <button type="button" className="lt-link" onClick={() => actions.setAnswering(homework.id)}><Paperclip size={13} aria-hidden="true" /> Lisa vastus</button> : null}
        {canAct && task.state === TASK_STATE.WAITING && (task.kind === 'homework' || task.kind === 'voice') ? <button type="button" className="lt-link" onClick={() => actions.reopen(homework)}>Võta tagasi</button> : null}
      </div>
      {answering ? (task.kind === 'voice'
        ? <VoiceAnswer prompts={homework.prompts || []} busy={actions.answerBusy} onSend={(answer) => actions.finish(homework, answer)} onCancel={() => actions.setAnswering(null)} />
        : <TaskAnswerForm busy={actions.answerBusy} onSend={(answer) => actions.finish(homework, answer)} onCancel={() => actions.setAnswering(null)} />) : null}
    </div>
    {primary ? <div className="lt-step__action">{primary}</div> : null}
  </article>;
}

/** One lesson of the path: its title once, the teacher's words once, the three steps as 1/3 · 2/3 · 3/3, then its free tasks. */
function LessonNode({ node, next, renderStep }) {
  const pct = node.total ? Math.round((node.done / node.total) * 100) : 0;
  const holdsNext = Boolean(next && node.tasks.includes(next));
  const done = node.state === 'done';
  const lesson = node.kind === 'lesson';
  return <li className={`lt-node${holdsNext ? ' is-current' : ''}${done ? ' is-done' : ''}`}>
    <span className="lt-node__dot" aria-hidden="true">{done ? <Check size={15} /> : null}</span>
    <section className="card lt-node__card" aria-label={lesson ? `Tund: ${node.title}` : node.title}>
      {lesson ? <header className="lt-node__head">
        <div><h3>{node.title}</h3>{node.day ? <small>antud {shortDay(`${node.day}T12:00:00`)}</small> : null}</div>
        {node.phases.length ? <Badge tone={done ? 'success' : 'neutral'}>{node.phases.filter((item) => item.task.state !== TASK_STATE.TODO).length}/{node.phases.length}</Badge>
          : <Badge tone={done ? 'success' : 'neutral'}>{node.done}/{node.total}</Badge>}
      </header> : null}
      {lesson && !done ? <div className="pf-meter" role="progressbar" aria-label={`${node.title}: tehtud`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div> : null}
      {lesson && node.notes.length ? <ul className="lt-notes">{node.notes.map((note) => <li key={note}>Õpetaja: {note}</li>)}</ul> : null}
      {!lesson && node.notes.length ? <ul className="lt-notes">{node.notes.filter((note) => note !== node.title).map((note) => <li key={note}>Õpetaja: {note}</li>)}</ul> : null}
      <div className="lt-steps">
        {node.phases.map((item) => renderStep(item.task, { phaseStep: true, current: item.task === next }))}
        {node.steps.map((task) => renderStep(task, { current: task === next }))}
      </div>
    </section>
  </li>;
}

/** „Järgmine samm”: the one best task (taskPath.js pathQueue), one big button. */
function NextStep({ next, node, canAct, studentRole, busy, actions, today }) {
  if (!next) {
    return <section className="sh-step is-done lt-next" aria-label="Järgmine samm">
      <small>Järgmine samm <span lang="ru">· следующий шаг</span></small>
      <strong>{studentRole ? 'Kõik on tehtud. Tubli!' : 'Kõik on tehtud.'}</strong>
      <span>{studentRole ? 'Korda vahepeal sõnu „Harjutas”.' : 'Õpetaja annab uusi ülesandeid.'}<span lang="ru"> · {studentRole ? 'Пока повтори слова в «Harjuta».' : 'Учитель даст новые задания.'}</span></span>
      {studentRole ? <Link to="/student/harjuta">Ava Harjuta <ChevronRight size={17} aria-hidden="true" /></Link> : null}
    </section>;
  }
  const phase = PHASES[next.phase];
  const minutes = taskMinutes(next);
  const late = isLateTask(next, today);
  const lessonTitle = node?.kind === 'lesson' ? node.title : '';
  const title = phase && lessonTitle ? `${lessonTitle} · ${phase.label}${phase.step ? ` ${phase.step}/3` : ''}` : next.title;
  const facts = [minutes ? `umbes ${minutes} min` : '', next.due && !late ? taskDueText(next.due, today) : '', late ? 'hilinenud' : '', next.started ? 'alustatud' : ''].filter(Boolean).join(' · ');
  let action = primaryAction(next, { canAct, busy, actions, big: true });
  // a written or voice task: its form opens in its place on the path
  if (canAct && (next.kind === 'homework' || next.kind === 'voice') && !isWordTask(next)) {
    action = <Button onClick={() => actions.focusStep(next, true)}>{next.kind === 'voice' ? <Mic size={16} aria-hidden="true" /> : <ListTodo size={16} aria-hidden="true" />} Tee ära</Button>;
  }
  if (!action) action = <Button variant="secondary" onClick={() => actions.focusStep(next, false)}>Näita</Button>;
  return <section className="sh-step lt-next" aria-label="Järgmine samm">
    <small>{studentRole ? 'Järgmine samm' : 'Järgmisena'} <span lang="ru">· {studentRole ? 'следующий шаг' : 'дальше по плану'}</span></small>
    <strong>{title}</strong>
    {phase ? <span>{phase.purpose}<span lang="ru"> · {phase.ru}</span></span> : null}
    {facts ? <span className="lt-next__facts">{facts}</span> : null}
    <div className="lt-next__go">{action}</div>
  </section>;
}

// „/homework?oskus=Kuulamine” (a hint in „Minu areng”): only the tasks that move that skill, and when there are none,
// say so plainly and show where to practise it meanwhile, instead of a list that has nothing to do with the hint
function SkillFilter({ skill, count, todo, studentRole }) {
  const words = SKILL_TASKS[skill];
  const head = todo ? `${taskCount(todo)} teha` : count ? 'kõik on tehtud' : `praegu ${words.tasks} ei ole`;
  const headRu = todo ? `сделать: ${todo}` : count ? 'всё сделано' : `сейчас ${words.ru} нет`;
  return <div className={`lt-skill${todo ? '' : ' is-empty'}`} role="status">
    <p><strong>{skill}</strong>: {head}<span className="lt-ru" lang="ru"> · {headRu}</span></p>
    {!todo ? <p>{studentRole
      ? <>Õpetaja annab sulle uusi. Seni harjuta ise „Minu kursuses”: tundide lehtedel on ka {words.tasks}, ja iga tehtud leht loeb sinu arengusse.
        <span className="lt-ru" lang="ru"> Учитель даст новые. А пока тренируйся сам в «Minu kursus»: каждый сделанный лист тоже засчитывается.</span></>
      : <>Õpetaja annab uusi.<span className="lt-ru" lang="ru"> · Учитель даст новые.</span></>}</p> : null}
    <p className="lt-skill__links">
      {!todo && studentRole ? <Link className="button button--secondary" to="/student/kursus">Ava „Minu kursus”</Link> : null}
      <Link to="/homework">Näita kõiki ülesandeid</Link>
    </p>
  </div>;
}

/** A folded part of the path: „Vanad ülesanded (N)” and „Tehtud (N)”. Opens by itself when it holds what is asked for. */
function Fold({ id, title, ru, count, hint, open, onToggle, children }) {
  return <section className="lt-fold" id={id} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>
      <button type="button" className="lt-fold__toggle" aria-expanded={open} data-preview-allowed onClick={onToggle}>
        <span>{title} ({count})<span className="lt-ru" lang="ru"> · {ru}</span></span>
        <ChevronDown size={18} aria-hidden="true" className={open ? 'is-open' : ''} />
      </button>
    </h2>
    {open ? <>{hint ? <p className="lt-fold__hint">{hint}</p> : null}{children}</> : null}
  </section>;
}

/**
 * „Ülesanded” for a student and a family (owner 2026-11-10: „делай Ülesanded как дуалинго”): one „Järgmine samm” on
 * top, then the path of lessons (taskPath.js), the old work and the done work folded. The data and every action are the
 * same as in the list before (taskList.js); a parent reads the same path, per child, and answers nothing.
 */
export default function LearnerTasksPage({ repository = homeworkService, studentRepository = studentsService, interactiveRepository = interactiveAssignmentsService, monologueRepository = studentMonologuesService }) {
  const { user, preview } = useAuth();
  const studentRole = hasAnyRole(user.roles, [ROLES.STUDENT]);
  const canAct = studentRole && !preview;
  const location = useLocation();
  const [childKey, setChildKey] = useState(location.state?.child || '');
  const [reviewing, setReviewing] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [playingExercise, setPlayingExercise] = useState(null);
  const [playingInteractive, setPlayingInteractive] = useState('');
  const [previewingMaterial, setPreviewingMaterial] = useState(null);
  const [busy, setBusy] = useState('');
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const [reopenable, setReopenable] = useState(null);
  const [answering, setAnswering] = useState(null);
  const [answerBusy, setAnswerBusy] = useState(false);
  const [finishing, setFinishing] = useState('');
  const [folds, setFolds] = useState({});
  const opened = useRef(false);
  // feedback newer than the last visit gets a small „Uus”; this visit then counts as having seen it
  const [seenAt] = useState(() => (canAct ? feedbackSeenAt(user.uid) : Number.POSITIVE_INFINITY));

  const state = useAsyncData(async () => {
    const records = preview?.studentId && studentRepository.getById
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listOwned(user.uid);
    const ids = records.map((item) => item.id);
    const [homework, submissions, assignments] = await Promise.all([
      repository.listByStudentIds(ids),
      repository.listSubmissionsByStudentIds(ids),
      repository.listWorksheetAssignmentsByStudentIds(ids),
    ]);
    // „Kuu monoloog” (owner 2026-11-04): the student's own card with an Estonian A2–C1 track; parents have no access.
    // A failed read (e.g. rules not deployed yet) leaves the task out instead of showing it as never done.
    const monologueCard = studentRole && monologueRepository ? records.find((record) => monologueLevel(record)) || null : null;
    const monologues = monologueCard ? await monologueRepository.listByStudent(monologueCard.id).catch(() => null) : null;
    return { records, homework, submissions, assignments, monologueCard, monologues };
  }, [monologueRepository, preview?.studentId, repository, studentRepository, studentRole, user.uid]);

  // Interactive lessons from the old CRM: only the student's own login may read them, a failing API only hides them.
  const interactiveState = useAsyncData(
    () => (canAct && interactiveRepository?.list ? interactiveRepository.list().catch(() => []) : Promise.resolve([])),
    [interactiveRepository, canAct],
  );

  const people = useMemo(() => groupStudentPeople(state.data?.records || []), [state.data]);
  const child = people.find((person) => childKeyOf(person) === childKey) || people[0] || null;
  const tasks = useMemo(() => {
    if (!state.data) return [];
    const ids = new Set(child?.recordIds || (child ? [child.id] : []));
    const mine = (item) => !people.length || people.length < 2 || ids.has(item.studentId);
    const merged = mergeTasks({
      homework: state.data.homework.filter(mine),
      assignments: state.data.assignments.filter(mine),
      submissions: state.data.submissions.filter(mine),
      interactive: people.length < 2 ? interactiveState.data || [] : (interactiveState.data || []).filter(mine),
    });
    const { monologueCard, monologues } = state.data;
    const monologue = monologueCard && monologues && mine({ studentId: monologueCard.id }) ? monologueTask({ student: monologueCard, monologues }) : null;
    return monologue ? [...merged, monologue] : merged;
  }, [child, interactiveState.data, people, state.data]);
  const skillParam = new globalThis.URLSearchParams(location.search).get('oskus') || '';
  const askedKey = new globalThis.URLSearchParams(location.search).get('ava') || '';
  const skill = isTaskSkill(skillParam) ? skillParam : '';
  const shownTasks = useMemo(() => tasksForSkill(tasks, skill), [skill, tasks]);
  const today = localDate();
  const path = useMemo(() => buildPath(shownTasks, today), [shownTasks, today]);

  const loaded = Boolean(state.data);
  useEffect(() => { if (loaded && canAct) markFeedbackSeen(user.uid); }, [canAct, loaded, user.uid]);
  // a line on the home page leads to one part here; `?ava=<task>` (Täna / Harjuta) opens that task: a sheet starts at
  // once, any other task is scrolled to (its fold opened first)
  useEffect(() => {
    if (!loaded) return;
    if (askedKey && !opened.current) {
      opened.current = true;
      const task = tasks.find((item) => item.key === askedKey);
      if (task) {
        // after this render: the sheet opens, or the page scrolls to the task (its fold opened)
        globalThis.setTimeout(() => (task.kind === 'sheet' && task.state === TASK_STATE.TODO ? setPlaying(task.sheet) : focusStep(task, false)), 0);
        return;
      }
    }
    if (!location.hash) return;
    const fold = location.hash === '#vanad' ? 'old' : location.hash === '#vaadatud' || location.hash === '#tehtud' ? 'done' : '';
    try { globalThis.setTimeout(() => { if (fold) setFolds((current) => ({ ...current, [fold]: true })); document.getElementById(location.hash.slice(1) === 'vaadatud' ? 'tehtud' : location.hash.slice(1))?.scrollIntoView?.({ block: 'start' }); }, 0); } catch { /* an odd hash */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, location.hash, askedKey]);

  // A reload after saving keeps the page (and an open task) on screen: unmounting the player would reopen it from the old copy.
  if (state.loading && !state.data) return <LoadingState label="Laen ülesandeid…" />;
  if (state.error && !state.data) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const subjects = subjectsOf(child ? [child] : []);
  const recordOf = (studentId) => state.data.records.find((item) => item.id === studentId) || null;
  function focusStep(task, answer) {
    const inOld = path.old.some((node) => node.tasks.includes(task));
    const inDone = path.done.some((node) => node.tasks.includes(task));
    if (inOld || inDone) setFolds((current) => ({ ...current, ...(inOld ? { old: true } : {}), ...(inDone ? { done: true } : {}) }));
    if (answer && canAct && task.homework?.id) setAnswering(task.homework.id);
    try { globalThis.setTimeout(() => document.getElementById(stepId(task))?.scrollIntoView?.({ block: 'center', behavior: 'smooth' }), 0); } catch { /* no element */ }
  }
  const finish = async (item, withAnswer = null) => {
    setAnswerBusy(true); setFinishing(item.id); setActionError('');
    try {
      if (withAnswer && repository.submitAnswer) await repository.submitAnswer({ item, ...withAnswer });
      else await repository.setStatus(item.id, 'Tehtud');
      announcePractice({ kind: 'homework' }); // the day streak (Fable U2); only a student's account records it
      setAnswering(null);
      // one click without an answer: a written task would reach the teacher empty, so offer a way back
      setReopenable(withAnswer ? null : item);
      setSuccess(withAnswer ? 'Ülesanne on tehtud. Õpetaja näeb seda kohe.' : '');
      await state.reload();
    } catch (error) { setActionError(error.message || 'Ülesannet ei saanud salvestada.'); } finally { setAnswerBusy(false); }
  };
  const reopen = async (item, thenAnswer = false) => {
    setReopenable(null); setActionError('');
    try {
      await repository.setStatus(item.id, 'Ootel');
      await state.reload();
      if (thenAnswer) setAnswering(item.id);
    } catch (error) { setActionError(error.message || 'Ülesannet ei saanud tagasi võtta.'); }
  };
  const playExercise = async (homework) => {
    setBusy(homework.id); setActionError('');
    try { setPlayingExercise({ homework, exercise: await repository.getExercise(homework.exerciseId) }); }
    catch (error) { setActionError(error.message || 'Ülesannet ei saanud avada.'); }
    finally { setBusy(''); }
  };
  const previewMaterial = async (homework) => {
    setBusy(`material-${homework.id}`); setActionError('');
    try {
      const source = await repository.getAssignedMaterial(homework);
      const [item] = buildLibraryItems([source], []);
      setPreviewingMaterial({ ...item, title: item?.title || homework.task || 'Õppematerjal', description: item?.description || homework.note || '', source });
    } catch (error) { setActionError(error.message || 'Materjali ei saanud avada.'); } finally { setBusy(''); }
  };
  const actions = { answering, answerBusy, finishing, setAnswering, finish, reopen, review: setReviewing, playSheet: setPlaying, playExercise, playInteractive: setPlayingInteractive, previewMaterial, focusStep };
  const renderStep = (task, { phaseStep = false, current = false } = {}) => {
    const record = task.studentId ? recordOf(task.studentId) : null;
    return <TaskStep key={task.key} task={task} phaseStep={phaseStep} current={current} today={today} canAct={canAct} busy={busy} actions={actions}
      isNew={task.state === TASK_STATE.REVIEWED && (Date.parse(task.reviewedAt || '') || 0) > seenAt}
      subjectTag={subjects.length > 1 ? itemSubject(task.sheet || task.homework || task, record) : ''} />;
  };
  const nothing = !shownTasks.length;
  const newFeedback = path.done.some((node) => node.tasks.some((task) => task.state === TASK_STATE.REVIEWED && (Date.parse(task.reviewedAt || '') || 0) > seenAt));
  const oldOpen = folds.old ?? false;
  const doneOpen = folds.done ?? newFeedback;
  const nextNode = path.path.find((node) => node.tasks.includes(path.next)) || null;
  const nodes = (list) => <ol className="lt-path">{list.map((node) => <LessonNode key={node.key} node={node} next={path.next} renderStep={renderStep} />)}</ol>;

  return <div className="page-content lt-page">
    <PageHeader compact title="Ülesanded" description={studentRole
      ? <>Mida õpetaja andis — alusta ülevalt.<span className="lt-ru" lang="ru"> · Что задал учитель — начни сверху.</span></>
      : <>Siin on kõik, mida õpetaja lapsele andis.<span className="lt-ru" lang="ru"> · Всё, что учитель задал ребёнку.</span></>} />
    <ChildSwitch people={people} value={childKeyOf(child)} onChange={setChildKey} />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    {reopenable ? <div className="success-notice" role="status">Ülesanne on tehtud. Kui see oli kirjalik, lisa ka vastus, muidu õpetaja seda ei näe. <button type="button" className="link-button" onClick={() => reopen(reopenable, true)}>Võta tagasi ja lisa vastus</button><button aria-label="Sulge teade" onClick={() => setReopenable(null)}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge teade" onClick={() => setActionError('')}>×</button></div> : null}

    {skill ? <SkillFilter skill={skill} count={shownTasks.length} todo={path.open} studentRole={studentRole} /> : null}
    {nothing && skill ? null : nothing ? <div className="lt-empty"><EmptyState title="Praegu ülesandeid ei ole" description={studentRole
      ? 'Kui õpetaja annab sulle ülesande, ilmub see siia. Seni võid korrata sõnu.'
      : 'Kui õpetaja annab lapsele ülesande, näete seda siin. · Когда учитель задаст задание, оно появится здесь.'} action={studentRole ? <Link className="button button--secondary" to="/student/sonavara">Ava sõnad</Link> : null} /></div> : <>
      <NextStep next={path.next} node={nextNode} canAct={canAct} studentRole={studentRole} busy={busy} actions={actions} today={today} />
      {path.path.length ? <section className="lt-group" id="tee-nuud" aria-labelledby="tee-nuud-title">
        <h2 id="tee-nuud-title">{studentRole ? 'Sinu tee' : 'Vaja teha'}<span className="lt-ru" lang="ru"> · {studentRole ? 'твой путь' : 'нужно сделать'}</span><span className="lt-count">{path.open - path.oldCount}</span></h2>
        {nodes(path.path)}
      </section> : null}
      {path.old.length ? <Fold id="vanad" title="Vanad ülesanded" ru="старые задания" count={path.oldCount} open={oldOpen} onToggle={() => setFolds((current) => ({ ...current, old: !oldOpen }))}
        hint={<>Üle kahe nädala vanad. Neid saab ikka teha.<span className="lt-ru" lang="ru"> · Старше двух недель. Их всё ещё можно сделать.</span></>}>
        {nodes(path.old)}
      </Fold> : null}
      {path.done.length ? <Fold id="tehtud" title="Tehtud" ru="сделано" count={path.done.reduce((sum, node) => sum + node.total, 0)} open={doneOpen} onToggle={() => setFolds((current) => ({ ...current, done: !doneOpen }))}>
        {nodes(path.done)}
      </Fold> : null}
    </>}

    {reviewing ? <SubmissionReviewModal key={`${reviewing.submissionKind}-${reviewing.id}`} submission={reviewing} staff={false} repository={repository} user={user} skillMap={null} onClose={() => setReviewing(null)} onSaved={() => setReviewing(null)} /> : null}
    {/* closing reloads the list: the answers were autosaved meanwhile and a reopened sheet must start from them */}
    {playing ? <WorksheetPlayer assignment={playing} repository={repository} readOnly={!canAct} onClose={() => { setPlaying(null); state.reload(); }} onSubmitted={state.reload} /> : null}
    {playingInteractive ? <InteractiveLessonPlayer assignmentId={playingInteractive} user={user} staff={false} repository={interactiveRepository} onClose={() => setPlayingInteractive('')} onChanged={interactiveState.reload} /> : null}
    {playingExercise ? <ExercisePlayer exercise={playingExercise.exercise} homework={playingExercise.homework} repository={repository} user={user} onClose={() => setPlayingExercise(null)} onCompleted={state.reload} /> : null}
    {previewingMaterial ? <MaterialPreview item={previewingMaterial} onClose={() => setPreviewingMaterial(null)} /> : null}
  </div>;
}
