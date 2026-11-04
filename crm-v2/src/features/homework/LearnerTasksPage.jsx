import { CheckCircle2, ChevronRight, Clock3, Mic, Paperclip, PlayCircle, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Button, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, interactiveAssignmentsService, studentsService } from '../../services/firebase/index.js';
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
import { PHASES, TASK_STATE, groupTasks, isTaskLate, mergeTasks, taskCount, taskDueText, tasksForSkill } from './taskList.js';
import { isAudioFile } from './voiceTask.js';
import './interactiveLesson.css';
import './learnerTasks.css';

const FIRST_SHOWN = 5;
const shortDay = (value) => { const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' }); };

function PhaseLine({ phase }) {
  const info = PHASES[phase];
  if (!info) return null;
  return <p className="lt-phase">
    {info.step ? <b aria-label={`${info.step}. samm kolmest`}>{info.step}/3</b> : null}
    <span><strong>{info.label}</strong>: {info.purpose}<span className="lt-ru" lang="ru"> · {info.ru}</span></span>
  </p>;
}

// what was sent: the child's own text, files and voice, one tap away so a done card stays short
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

function TaskCard({ task, today, canAct, isNew, subjectTag, busy, actions }) {
  const { homework } = task;
  const todo = task.state === TASK_STATE.TODO;
  const late = isTaskLate(task, today);
  const dueText = todo ? taskDueText(task.due, today) : '';
  const facts = [task.minutes ? `umbes ${task.minutes} min` : '', subjectTag].filter(Boolean);
  const answering = actions.answering === homework?.id;
  const result = task.state === TASK_STATE.REVIEWED
    ? [task.grade !== '' && task.grade != null ? `Hinne ${task.grade}` : '', task.percentage != null ? `${task.percentage}%` : ''].filter(Boolean).join(' · ')
    : task.percentage != null ? `Kontrollitud automaatselt: ${task.percentage}%` : '';

  let primary = null;
  if (todo) {
    if (task.kind === 'sheet') primary = <Button data-preview-allowed onClick={() => actions.playSheet(task.sheet)}><PlayCircle size={16} /> {!canAct ? 'Vaata' : task.started ? 'Jätka' : 'Alusta'}</Button>;
    else if (canAct && task.kind === 'exercise') primary = <Button loading={busy === homework.id} onClick={() => actions.playExercise(homework)}><PlayCircle size={16} /> Alusta</Button>;
    else if (canAct && task.kind === 'interactive') primary = <Button onClick={() => actions.playInteractive(task.interactive.id)}><PlayCircle size={16} /> Alusta</Button>;
    // „Kuu monoloog”: its own page (prompt, 2-minute timer, record again, send)
    else if (task.kind === 'monologue') primary = <Link className={`button button--${canAct ? 'primary' : 'secondary'}`} to="/student/monoloog"><Mic size={16} /> {canAct ? 'Salvesta' : 'Vaata'}</Link>;
    else if (canAct && task.kind === 'voice' && !answering) primary = <Button onClick={() => actions.setAnswering(homework.id)}><Mic size={16} /> Salvesta vastus</Button>;
    else if (canAct && task.kind === 'homework' && !answering) primary = <Button loading={actions.answerBusy && actions.finishing === homework.id} disabled={actions.answerBusy} onClick={() => actions.finish(homework)}><CheckCircle2 size={16} /> Tehtud</Button>;
  } else if (task.kind === 'monologue') {
    primary = <Link className="button button--secondary" to="/student/monoloog">Vaata</Link>;
  } else if (task.kind === 'interactive') {
    primary = canAct ? <Button variant="secondary" onClick={() => actions.playInteractive(task.interactive.id)}>{task.state === TASK_STATE.REVIEWED ? 'Vaata tagasisidet' : 'Vaata'}</Button> : null;
  } else if (task.submission) {
    primary = <Button variant="secondary" data-preview-allowed onClick={() => actions.review(task.submission)}>{task.state === TASK_STATE.REVIEWED ? 'Vaata tagasisidet' : 'Vaata'}</Button>;
  }

  return <article className={`lt-card ${late ? 'is-late' : ''}`}>
    <div className="lt-card__body">
      <h3>{task.title}{isNew ? <em className="lt-new">Uus</em> : null}</h3>
      <PhaseLine phase={task.phase} />
      {task.teacherText ? <p className="lt-teacher">Õpetaja: {task.teacherText}</p> : null}
      {task.note ? <p className="lt-teacher">Õpetaja: {task.note}</p> : null}
      {task.goal ? <p className="lt-goal"><Target size={14} aria-hidden="true" /> <span>{task.goal}</span></p> : null}
      {task.kind === 'voice' && todo && homework.prompts?.length ? <ul className="voice-answer__prompts">{homework.prompts.map((line) => <li key={line}>{line}</li>)}</ul> : null}
      {task.state === TASK_STATE.REVIEWED && task.feedback ? <p className="lt-feedback">{task.feedback}</p> : null}
      {dueText || facts.length || result || (!todo && task.doneAt) ? <p className="lt-facts">
        {dueText ? <span className={late ? 'lt-late' : ''}><Clock3 size={13} aria-hidden="true" /> {dueText}</span> : null}
        {facts.map((fact) => <span key={fact}>{fact}</span>)}
        {result ? <span className="lt-result">{result}</span> : null}
        {!todo && task.doneAt && task.state === TASK_STATE.WAITING ? <span>Tehtud {shortDay(task.doneAt)}</span> : null}
      </p> : null}
      <OwnAnswer homework={homework} />
      {/* quiet ways on: the action stays one */}
      <div className="lt-links">
        {homework?.boardPageId ? <Link to={`/board?page=${homework.boardPageId}`}>Ava tahvlileht „{homework.boardPageTitle || 'Tahvlileht'}”</Link> : null}
        {canPreviewMaterial(homework) ? <button type="button" className="lt-link" data-preview-allowed disabled={busy === `material-${homework.id}`} aria-label={`Vaata materjali: ${task.title}`} onClick={() => actions.previewMaterial(homework)}>Vaata materjali</button> : null}
        {canAct && todo && task.kind === 'homework' && !answering ? <button type="button" className="lt-link" onClick={() => actions.setAnswering(homework.id)}><Paperclip size={13} aria-hidden="true" /> Lisa vastus</button> : null}
        {canAct && task.state === TASK_STATE.WAITING && (task.kind === 'homework' || task.kind === 'voice') ? <button type="button" className="lt-link" onClick={() => actions.reopen(homework)}>Võta tagasi</button> : null}
      </div>
      {answering ? (task.kind === 'voice'
        ? <VoiceAnswer prompts={homework.prompts || []} busy={actions.answerBusy} onSend={(answer) => actions.finish(homework, answer)} onCancel={() => actions.setAnswering(null)} />
        : <TaskAnswerForm busy={actions.answerBusy} onSend={(answer) => actions.finish(homework, answer)} onCancel={() => actions.setAnswering(null)} />) : null}
    </div>
    {primary ? <div className="lt-card__action">{primary}</div> : null}
  </article>;
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

function TaskGroup({ id, title, ru, tasks, children, renderTask, showAll = false }) {
  const [more, setMore] = useState(false);
  const shown = showAll || more ? tasks : tasks.slice(0, FIRST_SHOWN);
  return <section className="lt-group" id={id} aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>{title}<span className="lt-ru" lang="ru"> · {ru}</span>{tasks.length ? <span className="lt-count">{tasks.length}</span> : null}</h2>
    {tasks.length ? <div className="lt-list">{shown.map(renderTask)}</div> : children}
    {tasks.length > shown.length ? <button type="button" className="lt-more" data-preview-allowed onClick={() => setMore(true)}>Näita veel ({tasks.length - shown.length}) <ChevronRight size={15} aria-hidden="true" /></button> : null}
  </section>;
}

/**
 * „Ülesanded” for a student and a family (owner 2026-11-01): one list, whatever collection a task lives in. Tee nüüd →
 * Tehtud → Õpetaja vaatas üle (plain homework has no review step, so „Tehtud” does not promise one). A parent reads the same list, per child, and answers nothing.
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
  const skill = isTaskSkill(skillParam) ? skillParam : '';
  const shownTasks = useMemo(() => tasksForSkill(tasks, skill), [skill, tasks]);
  const groups = useMemo(() => groupTasks(shownTasks), [shownTasks]);

  const loaded = Boolean(state.data);
  useEffect(() => { if (loaded && canAct) markFeedbackSeen(user.uid); }, [canAct, loaded, user.uid]);
  // a line on the home page leads to one group here
  useEffect(() => {
    if (!loaded || !location.hash) return;
    try { document.getElementById(location.hash.slice(1))?.scrollIntoView?.({ block: 'start' }); } catch { /* an odd hash */ }
  }, [loaded, location.hash]);

  // A reload after saving keeps the page (and an open task) on screen: unmounting the player would reopen it from the old copy.
  if (state.loading && !state.data) return <LoadingState label="Laen ülesandeid…" />;
  if (state.error && !state.data) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const today = localDate();
  const subjects = subjectsOf(child ? [child] : []);
  const recordOf = (studentId) => state.data.records.find((item) => item.id === studentId) || null;
  const finish = async (item, withAnswer = null) => {
    setAnswerBusy(true); setFinishing(item.id); setActionError('');
    try {
      if (withAnswer && repository.submitAnswer) await repository.submitAnswer({ item, ...withAnswer });
      else await repository.setStatus(item.id, 'Tehtud');
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
  const actions = { answering, answerBusy, finishing, setAnswering, finish, reopen, review: setReviewing, playSheet: setPlaying, playExercise, playInteractive: setPlayingInteractive, previewMaterial };
  const renderTask = (task) => {
    const record = task.studentId ? recordOf(task.studentId) : null;
    return <TaskCard key={task.key} task={task} today={today} canAct={canAct} busy={busy} actions={actions}
      isNew={task.state === TASK_STATE.REVIEWED && (Date.parse(task.reviewedAt || '') || 0) > seenAt}
      subjectTag={subjects.length > 1 ? itemSubject(task.sheet || task.homework || task, record) : ''} />;
  };
  const nothing = !shownTasks.length;

  return <div className="page-content lt-page">
    <PageHeader compact title="Ülesanded" description={studentRole
      ? 'Siin on kõik, mida õpetaja sulle andis. Alusta ülevalt.'
      : <>Siin on kõik, mida õpetaja lapsele andis.<span className="lt-ru" lang="ru"> · Всё, что учитель задал ребёнку.</span></>} />
    <ChildSwitch people={people} value={childKeyOf(child)} onChange={setChildKey} />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    {reopenable ? <div className="success-notice" role="status">Ülesanne on tehtud. Kui see oli kirjalik, lisa ka vastus, muidu õpetaja seda ei näe. <button type="button" className="link-button" onClick={() => reopen(reopenable, true)}>Võta tagasi ja lisa vastus</button><button aria-label="Sulge teade" onClick={() => setReopenable(null)}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge teade" onClick={() => setActionError('')}>×</button></div> : null}

    {skill ? <SkillFilter skill={skill} count={shownTasks.length} todo={groups.todo.length} studentRole={studentRole} /> : null}
    {nothing && skill ? null : nothing ? <div className="lt-empty"><EmptyState title="Praegu ülesandeid ei ole" description={studentRole
      ? 'Kui õpetaja annab sulle ülesande, ilmub see siia. Seni võid korrata sõnu.'
      : 'Kui õpetaja annab lapsele ülesande, näete seda siin. · Когда учитель задаст задание, оно появится здесь.'} action={studentRole ? <Link className="button button--secondary" to="/student/sonavara">Ava sõnad</Link> : null} /></div> : <>
      <TaskGroup id="tee-nuud" title={studentRole ? 'Tee nüüd' : 'Vaja teha'} ru={studentRole ? 'сделать сейчас' : 'нужно сделать'} tasks={groups.todo} renderTask={renderTask} showAll>
        <p className="lt-clear"><CheckCircle2 size={17} aria-hidden="true" /> {studentRole ? 'Kõik on tehtud. Tubli!' : 'Kõik on tehtud.'}<span className="lt-ru" lang="ru"> · всё сделано</span></p>
      </TaskGroup>
      {groups.waiting.length ? <TaskGroup id="ootab" title="Tehtud" ru="сделано" tasks={groups.waiting} renderTask={renderTask} /> : null}
      {groups.reviewed.length ? <TaskGroup id="vaadatud" title="Õpetaja vaatas üle" ru="учитель проверил" tasks={groups.reviewed} renderTask={renderTask} /> : null}
    </>}

    {reviewing ? <SubmissionReviewModal key={`${reviewing.submissionKind}-${reviewing.id}`} submission={reviewing} staff={false} repository={repository} user={user} skillMap={null} onClose={() => setReviewing(null)} onSaved={() => setReviewing(null)} /> : null}
    {/* closing reloads the list: the answers were autosaved meanwhile and a reopened sheet must start from them */}
    {playing ? <WorksheetPlayer assignment={playing} repository={repository} readOnly={!canAct} onClose={() => { setPlaying(null); state.reload(); }} onSubmitted={state.reload} /> : null}
    {playingInteractive ? <InteractiveLessonPlayer assignmentId={playingInteractive} user={user} staff={false} repository={interactiveRepository} onClose={() => setPlayingInteractive('')} onChanged={interactiveState.reload} /> : null}
    {playingExercise ? <ExercisePlayer exercise={playingExercise.exercise} homework={playingExercise.homework} repository={repository} user={user} onClose={() => setPlayingExercise(null)} onCompleted={state.reload} /> : null}
    {previewingMaterial ? <MaterialPreview item={previewingMaterial} onClose={() => setPreviewingMaterial(null)} /> : null}
  </div>;
}
