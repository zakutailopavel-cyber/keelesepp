import { CheckCircle2, ClipboardCheck, Clock3, Eye, FileText, MessageSquare, PlayCircle, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import PeopleOverview from '../../components/PeopleOverview.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, interactiveAssignmentsService, studentsService } from '../../services/firebase/index.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import WorksheetPlayer, { VisualWorksheetSubmissionPreview } from './WorksheetPlayer.jsx';
import { DocWorksheetSubmissionPreview } from '../worksheet-studio/DocWorksheetPlayer.jsx';
import ExercisePlayer from './ExercisePlayer.jsx';
import InteractiveLessonPlayer from './InteractiveLessonPlayer.jsx';
import { ASSIGNMENT_STATUS_LABEL } from './interactiveLessonModel.js';
import './interactiveLesson.css';
import TextAnnotationEditor from './TextAnnotationEditor.jsx';
import MaterialPreview from '../library/MaterialPreview.jsx';
import { buildLibraryItems } from '../library/libraryModel.js';
import '../common/finalReadiness.css';
import SubmissionReviewModal from './SubmissionReviewModal.jsx';
import { formatDate } from './submissionFormat.js';
import { isHomeworkOpen } from './homeworkStatus.js';
import { quickFeedback, suggestedGrade } from './reviewTemplates.js';

const blank = { studentId: '', task: '', due: new Date().toISOString().slice(0, 10) };

function SubmissionList({ items, staff, onOpen, onConfirm, confirming = '' }) {
  if (!items.length) return <EmptyState title={staff ? 'Kontrollitavaid töid ei leitud' : 'Esitatud töid ei ole'} description={staff ? 'Uued õpilaste esitused ilmuvad siia automaatselt.' : 'Pärast töö esitamist näed siin tulemust ja õpetaja tagasisidet.'} />;
  return <div className="submission-list">{items.map((item) => {
    const reviewed = item.reviewStatus === 'reviewed';
    // an auto-checked work waiting for review can be confirmed with the suggested grade without opening it
    const grade = staff && !reviewed && onConfirm ? suggestedGrade(item.percentage) : null;
    const key = `${item.submissionKind}-${item.id}`;
    const row = <button className="submission-row" key={grade ? undefined : key} onClick={() => onOpen(item)}>
      <i>{item.submissionKind === 'worksheet' ? <FileText size={20} /> : <ClipboardCheck size={20} />}</i>
      <span className="submission-row__main"><strong>{item.title}</strong><small>{item.studentName || 'Õpilane'} · {formatDate(item.completedAt)}</small></span>
      <span className="submission-row__score">{item.percentage != null ? <b>{item.percentage}%</b> : null}{item.teacherGrade ? <small>Hinne {item.teacherGrade}</small> : null}</span>
      <Badge tone={reviewed ? 'success' : 'info'}>{reviewed ? 'Tagasiside antud' : item.percentage != null ? 'Automaatselt kontrollitud' : 'Ootab kontrolli'}</Badge>
      <Eye size={18} />
    </button>;
    if (!grade) return row;
    return <div className="submission-item" key={key}>{row}
      <Button variant="secondary" className="submission-confirm" loading={confirming === key} disabled={Boolean(confirming)} aria-label={`Kinnita hinne ${grade} — ${item.studentName || 'Õpilane'}`} title={quickFeedback(item.percentage)} onClick={() => onConfirm(item, grade)}>Kinnita {grade}</Button>
    </div>;
  })}</div>;
}

export default function HomeworkPage({ repository = homeworkService, studentRepository = studentsService, interactiveRepository = interactiveAssignmentsService }) {
  const { user } = useAuth();
  const staff = hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.TEACHER]);
  const teacherOnly = hasAnyRole(user.roles, [ROLES.TEACHER]) && !hasAnyRole(user.roles, [ROLES.ADMIN]);
  const canMarkHomework = staff || hasAnyRole(user.roles, [ROLES.STUDENT]);
  const studentRole = hasAnyRole(user.roles, [ROLES.STUDENT]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [reviewing, setReviewing] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [playingExercise, setPlayingExercise] = useState(null);
  const [playingInteractive, setPlayingInteractive] = useState('');
  const [loadingExercise, setLoadingExercise] = useState('');
  const [previewingMaterial, setPreviewingMaterial] = useState(null);
  const [loadingMaterial, setLoadingMaterial] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirming, setConfirming] = useState('');

  const state = useAsyncData(async () => {
    const studentResult = staff
      ? await studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) })
      : { items: await studentRepository.listOwned(user.uid) };
    const studentIds = studentResult.items.map((item) => item.id);
    const [homework, submissions, assignments] = await Promise.all([
      repository.listByStudentIds(studentIds),
      repository.listSubmissionsByStudentIds(studentIds),
      staff ? Promise.resolve([]) : repository.listWorksheetAssignmentsByStudentIds(studentIds),
    ]);
    const studentNames = new Map(studentResult.items.map((student) => [student.id, student.name]));
    return {
      homework,
      students: studentResult,
      submissions: submissions.map((item) => ({ ...item, studentName: item.studentName || studentNames.get(item.studentId) || 'Õpilane' })),
      assignments: assignments.map((item) => ({ ...item, studentName: item.studentName || studentNames.get(item.studentId) || 'Õpilane' })),
    };
  }, [repository, staff, studentRepository, teacherOnly, user.uid]);

  // Interactive lessons assigned in CRM v1: students finish them here, teachers send feedback. Nothing new is assigned
  // in v2, so the card disappears once the old assignments are done. A failing API only hides the card.
  const interactiveState = useAsyncData(
    () => ((staff || studentRole) && interactiveRepository?.list ? interactiveRepository.list().catch(() => []) : Promise.resolve([])),
    [interactiveRepository, staff, studentRole],
  );
  const interactive = (interactiveState.data || []).filter((item) => (staff ? item.status === 'submitted' : true));

  const filtered = useMemo(() => (state.data?.homework || []).filter((item) => (
    `${item.studentName || ''} ${item.task || ''}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))
    && (status === 'all' || (status === 'done' ? !isHomeworkOpen(item) : isHomeworkOpen(item)))
  )), [state.data, query, status]);
  const submissions = useMemo(() => (state.data?.submissions || []).filter((item) => (
    `${item.studentName} ${item.title}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))
    && (!staff || reviewStatus === 'all' || item.reviewStatus === reviewStatus)
  )), [state.data, query, reviewStatus, staff]);
  const assignments = useMemo(() => (state.data?.assignments || []).filter((item) => (
    item.status !== 'done' && `${item.studentName} ${item.title}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))
  )), [state.data, query]);

  // A reload after saving or submitting keeps the page (and an open worksheet) on screen: unmounting the
  // player would reopen it from the old copy and hide the result.
  if (state.loading && !state.data) return <LoadingState label="Laen kodutöid…" />;
  if (state.error && !state.data) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const { students } = state.data;
  const today = new Date().toISOString().slice(0, 10);
  // the queue: the next work below in the list that still waits for a review (else the first one above)
  const reviewKey = (item) => `${item.submissionKind}-${item.id}`;
  const waiting = reviewing ? submissions.filter((item) => item.reviewStatus !== 'reviewed' && reviewKey(item) !== reviewKey(reviewing)) : [];
  const at = reviewing ? submissions.findIndex((item) => reviewKey(item) === reviewKey(reviewing)) : -1;
  const nextReview = waiting.find((item) => submissions.indexOf(item) > at) || waiting[0] || null;
  const openHomework = state.data.homework.filter(isHomeworkOpen);
  const overdueHomework = openHomework.filter((item) => item.due && item.due < today);
  const pendingReviews = state.data.submissions.filter((item) => item.reviewStatus !== 'reviewed');
  // Worksheets count as tasks too.
  const allAssignments = state.data.assignments || [];
  const openAssignments = allAssignments.filter((item) => item.status !== 'done');
  const overdueAssignments = openAssignments.filter((item) => item.dueDate && item.dueDate < today);

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      const student = students.items.find((item) => item.id === form.studentId);
      if (!student) throw new Error('Vali õpilane.');
      await repository.create({ ...form, studentName: student.name });
      setModal(false);
      setForm(blank);
      setSuccess('Kodutöö lisati.');
      await state.reload();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const openReview = (submission) => {
    setReviewing(submission);
    setActionError('');
  };
  // one click: the suggested grade and a short standard comment (open the work to write more)
  const confirmReview = async (submission, grade) => {
    const key = `${submission.submissionKind}-${submission.id}`;
    setConfirming(key); setActionError('');
    try {
      await repository.reviewSubmission({ submission, teacherGrade: grade, teacherFeedback: quickFeedback(submission.percentage), user });
      setSuccess(`${submission.studentName || 'Õpilane'}: hinne ${grade} saadetud.`);
      await state.reload();
    } catch (error) { setActionError(error.message || 'Hinnet ei saanud salvestada.'); } finally { setConfirming(''); }
  };

  const openExercise = async (homework) => {
    setLoadingExercise(homework.id);
    setActionError('');
    try { setPlayingExercise({ homework, exercise: await repository.getExercise(homework.exerciseId) }); }
    catch (error) { setActionError(error.message || 'Harjutuse avamine ebaõnnestus.'); }
    finally { setLoadingExercise(''); }
  };

  const openMaterial = async (homework) => {
    setLoadingMaterial(homework.id);
    setActionError('');
    try {
      const source = await repository.getAssignedMaterial(homework);
      const [item] = buildLibraryItems([source], []);
      setPreviewingMaterial({
        ...item,
        title: item?.title || homework.task || 'Õppematerjal',
        description: item?.description || homework.note || '',
        source,
      });
    } catch (error) {
      setActionError(error.message || 'Materjali eelvaate avamine ebaõnnestus.');
    } finally {
      setLoadingMaterial('');
    }
  };

  return <div className="page-content">
    <PageHeader compact eyebrow="Õppetöö" title="Kodutööd" description={staff ? 'Ülesanded, esitused, hindamine ja tagasiside ühes vaates.' : 'Sinu ülesanded, tulemused ja õpetaja tagasiside.'} actions={staff ? <Button onClick={() => setModal(true)}><Plus size={18} /> Uus kodutöö</Button> : null} />
    <PeopleOverview label="Kodutööde kokkuvõte" eyebrow={staff ? 'Õppetöö ülevaade' : 'Minu töölaud'} title={staff ? 'Ülesanded ja tagasiside' : 'Minu kodutööd'} description={staff ? 'Pooleliolevad tööd, tähtajad ja kontrollimist ootavad esitused.' : 'Ülesanded, tähtajad ja õpetaja tagasiside ühes vaates.'} metrics={[
      { icon: ClipboardCheck, label: 'Kõik ülesanded', value: state.data.homework.length + allAssignments.length, hint: staff ? `${students.items.length} õpilast` : `${allAssignments.length} töölehte` },
      { icon: Clock3, label: 'Pooleli', value: openHomework.length + openAssignments.length, hint: 'ootab tegemist' },
      { icon: Star, label: 'Hilinenud', value: overdueHomework.length + overdueAssignments.length, hint: 'vajab tähelepanu' },
      { icon: MessageSquare, label: staff ? 'Ootab kontrolli' : 'Tagasisideta', value: pendingReviews.length, hint: `${state.data.submissions.length} esitust kokku` },
    ]} />
    {success ? <div className="success-notice" role="status">{success}<button onClick={() => setSuccess('')}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button onClick={() => setActionError('')}>×</button></div> : null}

    <Card className="homework-overview">
      <div className="list-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi kodutööd" placeholder="Otsi õpilast või ülesannet" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select aria-label="Kodutöö staatus" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Kõik ülesanded</option><option value="open">Pooleli</option><option value="done">Tehtud</option></Select></div>
    </Card>

    {!staff ? <Card className="list-card assigned-worksheet-card">
      <div className="homework-card-heading"><div><span className="eyebrow">Töölehed</span><h2>Määratud töölehed</h2></div><Badge tone={assignments.length ? 'info' : 'neutral'}>{assignments.length}</Badge></div>
      {assignments.length ? <div className="assigned-worksheet-list">{assignments.map((assignment) => {
        const overdue = assignment.dueDate && assignment.dueDate < new Date().toISOString().slice(0, 10);
        return <button key={assignment.id} onClick={() => setPlaying(assignment)}><i><FileText size={20} /></i><span><strong>{assignment.title}</strong><small>{assignment.subject || 'Õppetöö'}{assignment.level ? ` · ${assignment.level}` : ''}{assignment.dueDate ? ` · Tähtaeg ${assignment.dueDate}` : ''}</small></span><Badge tone={overdue ? 'danger' : 'info'}>{overdue ? 'Hilinenud' : Object.keys(assignment.answers || {}).length ? 'Pooleli' : 'Alustamata'}</Badge><Eye size={18} /></button>;
      })}</div> : <EmptyState title="Kõik töölehed on tehtud" description="Uued õpetaja määratud töölehed ilmuvad siia." />}
    </Card> : null}

    {interactive.length ? <Card className="list-card">
      <div className="homework-card-heading"><div><span className="eyebrow">Varem määratud</span><h2>{staff ? 'Interaktiivsed tunnid ootavad tagasisidet' : 'Interaktiivsed tunnid'}</h2></div><Badge tone="info">{interactive.length}</Badge></div>
      <div className="interactive-list">{interactive.map((item) => <button type="button" key={item.id} onClick={() => setPlayingInteractive(item.id)}><span><strong>{item.title}</strong><small>{staff ? `${item.studentName} · ` : ''}{ASSIGNMENT_STATUS_LABEL[item.status] || item.status}</small></span><Badge tone={item.status === 'active' ? 'info' : 'success'}>{item.status === 'active' ? 'Ava' : 'Vaata'}</Badge></button>)}</div>
    </Card> : null}

    <div className="homework-grid">
      <Card className="list-card homework-task-card">
        <div className="homework-card-heading"><div><span className="eyebrow">Ülesanded</span><h2>Kodutööd</h2></div><Badge tone="neutral">{filtered.length}</Badge></div>
        {filtered.length ? <div className="task-list">{filtered.map((item) => {
          const done = item.status === 'Tehtud';
          const overdue = !done && item.due && item.due < new Date().toISOString().slice(0, 10);
          const exerciseTask = Boolean(item.isExercise && item.exerciseId);
          const materialTask = Boolean(!exerciseTask && (item.sourceId || item.attachments?.length || item.fileUrl));
          return <article className={done ? 'task-row is-done' : 'task-row'} key={item.id}>
            {exerciseTask && !staff ? studentRole && !done ? <button className="task-check exercise-launch" aria-label={`Alusta harjutust ${item.exerciseTitle || item.task}`} disabled={loadingExercise === item.id} onClick={() => openExercise(item)}>{loadingExercise === item.id ? <span className="button__spinner" /> : <PlayCircle />}</button> : <span className="task-check">{done ? <CheckCircle2 /> : <PlayCircle />}</span> : canMarkHomework ? <button className="task-check" aria-label={done ? 'Märgi pooleliolevaks' : 'Märgi tehtuks'} onClick={async () => { await repository.setStatus(item.id, done ? 'Ootel' : 'Tehtud'); await state.reload(); }}>{done ? <CheckCircle2 /> : <Clock3 />}</button> : <span className="task-check">{done ? <CheckCircle2 /> : <Clock3 />}</span>}
            <div><strong className="task-text">{item.task}</strong><span>{item.studentName || 'Õpilane'}{exerciseTask ? ' · Interaktiivne harjutus' : ''}{item.source === 'live-classroom' ? ' · Tunnist' : ''}</span>
              {item.boardPageId ? <Link className="task-link" to={staff ? `/board/${item.studentId}?page=${item.boardPageId}` : `/board?page=${item.boardPageId}`}>Ava tahvlileht „{item.boardPageTitle || 'Tahvlileht'}”</Link> : null}
              {item.worksheetTitle ? <span>Tööleht „{item.worksheetTitle}” on all „Töölehed”</span> : null}</div>
            <div className="task-due">{exerciseTask ? <Badge tone="info">Harjutus</Badge> : null}{materialTask ? <button className="task-preview-button" aria-label={`Eelvaade: ${item.task}`} disabled={loadingMaterial === item.id} onClick={() => openMaterial(item)}>{loadingMaterial === item.id ? <span className="button__spinner" /> : <Eye size={16} />}<span>Eelvaade</span></button> : null}<Badge tone={done ? 'success' : overdue ? 'danger' : 'neutral'}>{done ? 'Tehtud' : `Tähtaeg ${item.due || '—'}`}</Badge>{staff ? <button className="text-button danger" aria-label="Kustuta" onClick={async () => { if (window.confirm('Kas kustutada kodutöö?')) { await repository.remove(item.id); await state.reload(); } }}><Trash2 size={17} /></button> : null}</div>
          </article>;
        })}</div> : <EmptyState title="Kodutöid ei leitud" description={staff ? 'Lisa esimene ülesanne või muuda filtrit.' : 'Praegu ei ole siin ühtegi ülesannet.'} />}
      </Card>

      <Card className="list-card submission-card">
        <div className="homework-card-heading"><div><span className="eyebrow">{staff ? 'Kontrollimine' : 'Tulemused'}</span><h2>{staff ? 'Esitatud tööd' : 'Minu esitused'}</h2></div>{staff ? <Select aria-label="Kontrolli staatus" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}><option value="pending">Ootab kontrolli</option><option value="reviewed">Tagasiside antud</option><option value="all">Kõik esitused</option></Select> : <Badge tone="neutral">{submissions.length}</Badge>}</div>
        <SubmissionList items={submissions} staff={staff} onOpen={openReview} onConfirm={staff ? confirmReview : undefined} confirming={confirming} />
      </Card>
    </div>

    <Modal open={modal} title="Uus kodutöö" onClose={() => setModal(false)} footer={<><Button variant="secondary" onClick={() => setModal(false)}>Loobu</Button><Button loading={saving} type="submit" form="homework-form">Lisa ülesanne</Button></>}>
      <form id="homework-form" className="form-grid" onSubmit={submit}><Select id="homework-student" className="form-grid__wide" label="Õpilane" value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} required><option value="">Vali õpilane</option>{students.items.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</Select><Input id="homework-task" className="form-grid__wide" label="Ülesanne" value={form.task} onChange={(event) => setForm({ ...form, task: event.target.value })} required /><Input id="homework-due" label="Tähtaeg" type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} required /></form>
    </Modal>

    {reviewing ? <SubmissionReviewModal
      key={`${reviewing.submissionKind}-${reviewing.id}`}
      submission={reviewing}
      staff={staff}
      repository={repository}
      user={user}
      skillMap={staff ? (students.items.find((item) => item.id === reviewing.studentId)?.skillMap || {}) : null}
      onClose={() => setReviewing(null)}
      onSaved={async () => { setReviewing(null); setSuccess('Hinne ja tagasiside saadeti õpilasele.'); await state.reload(); }}
      {...(staff && nextReview ? { onSavedNext: async () => { setReviewing(nextReview); setSuccess('Hinne ja tagasiside saadeti õpilasele.'); await state.reload(); } } : {})}
    /> : null}
    {playing ? <WorksheetPlayer assignment={playing} repository={repository} readOnly={!hasAnyRole(user.roles, [ROLES.STUDENT])} onClose={() => setPlaying(null)} onSubmitted={state.reload} /> : null}
    {playingInteractive ? <InteractiveLessonPlayer assignmentId={playingInteractive} user={user} staff={staff} repository={interactiveRepository} onClose={() => setPlayingInteractive('')} onChanged={interactiveState.reload} /> : null}
    {playingExercise ? <ExercisePlayer exercise={playingExercise.exercise} homework={playingExercise.homework} repository={repository} user={user} onClose={() => setPlayingExercise(null)} onCompleted={state.reload} /> : null}
    {previewingMaterial ? <MaterialPreview item={previewingMaterial} onClose={() => setPreviewingMaterial(null)} /> : null}
  </div>;
}
