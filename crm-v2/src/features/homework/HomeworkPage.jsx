import { Archive, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, Eye, FileText, MessageSquare, Mic, Paperclip, PlayCircle, Plus, RotateCcw, Search, Star, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import LearnerTasksPage from './LearnerTasksPage.jsx';
import TaskAnswerForm from './TaskAnswerForm.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import PeopleOverview from '../../components/PeopleOverview.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { interactiveAssignmentsService } from '../../services/firebase/interactiveAssignments.js';
import { studentsService } from '../../services/firebase/students.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import InteractiveLessonPlayer from './InteractiveLessonPlayer.jsx';
import { ASSIGNMENT_STATUS_LABEL } from './interactiveLessonModel.js';
import './interactiveLesson.css';
import './homeworkPage.css';
import TextAnnotationEditor from './TextAnnotationEditor.jsx';
import MaterialPreview from '../library/MaterialPreview.jsx';
import { buildLibraryItems } from '../library/libraryModel.js';
import '../common/finalReadiness.css';
import VoiceAnswer from './VoiceAnswer.jsx';
import { isAudioFile, voicePrompts } from './voiceTask.js';
import SubmissionReviewModal from './SubmissionReviewModal.jsx';
import { formatDate } from './submissionFormat.js';
import { isHomeworkOpen } from './homeworkStatus.js';
import { quickFeedback, suggestedGrade } from './reviewTemplates.js';
import { QUICK_MIN_GRADE, dueLabel, isOverdue, selfCompleted, sortHomework, staleHomework } from './homeworkFlow.js';
import { localDate } from '../../utils/localDate.js';
import { displayDate } from '../finance/finance.js';

const blank = { studentId: '', task: '', due: localDate(), voice: false, prompts: '' };

// a school has dozens of submissions: the first ones show, the rest on request, so the page stays short on a phone
const SUBMISSIONS_SHOWN = 10;

function SubmissionList({ items, onOpen, onConfirm, confirming = '' }) {
  const [shown, setShown] = useState(SUBMISSIONS_SHOWN);
  if (!items.length) return <EmptyState title="Kontrollitavaid töid ei leitud" description="Uued õpilaste esitused ilmuvad siia automaatselt." />;
  return <div className="submission-list">{items.slice(0, shown).map((item) => {
    const reviewed = item.reviewStatus === 'reviewed';
    // an auto-checked work waiting for review can be confirmed with the suggested grade without opening it
    // only a good result is confirmed without opening the work; a low grade needs a look and a comment
    const suggested = !reviewed && onConfirm ? suggestedGrade(item.percentage) : null;
    const grade = suggested && suggested >= QUICK_MIN_GRADE ? suggested : null;
    const key = `${item.submissionKind}-${item.id}`;
    const row = <button className="submission-row" data-entity="homework" data-entity-action="open" data-assignment-id={item.id} data-entity-title={item.title || undefined} data-student-id={item.studentId || undefined} key={grade ? undefined : key} onClick={() => onOpen(item)}>
      <i>{item.submissionKind === 'worksheet' ? <FileText size={20} /> : <ClipboardCheck size={20} />}</i>
      <span className="submission-row__main"><strong>{item.title}</strong><small>{item.studentName || 'Õpilane'} · {formatDate(item.completedAt)}</small></span>
      <span className="submission-row__score">{item.percentage != null ? <b>{item.percentage}%</b> : null}{item.teacherGrade ? <small>Hinne {item.teacherGrade}</small> : null}</span>
      <Badge tone={reviewed ? 'success' : 'info'}>{reviewed ? 'Tagasiside antud' : item.percentage != null ? 'Ootab hinnet' : 'Ootab kontrolli'}</Badge>
      <Eye size={18} />
    </button>;
    if (!grade) return row;
    return <div className="submission-item" key={key}>{row}
      <Button variant="secondary" className="submission-confirm" loading={confirming === key} disabled={Boolean(confirming)} aria-label={`Kinnita hinne ${grade} — ${item.studentName || 'Õpilane'}`} title={quickFeedback(item.percentage)} onClick={() => onConfirm(item, grade)}>Kinnita {grade}</Button>
    </div>;
  })}{items.length > shown ? <div className="load-more"><Button variant="secondary" onClick={() => setShown(shown + 20)}>Näita veel ({items.length - shown})</Button></div> : null}</div>;
}

// The teacher's and the administrator's Kodutööd. A learner and a family have „Ülesanded” (LearnerTasksPage.jsx).
function StaffHomeworkPage({ repository = homeworkService, studentRepository = studentsService, interactiveRepository = interactiveAssignmentsService, quickDelayMs = 5000 }) {
  const { user } = useAuth();
  const teacherOnly = hasAnyRole(user.roles, [ROLES.TEACHER]) && !hasAnyRole(user.roles, [ROLES.ADMIN]);
  const studentRole = hasAnyRole(user.roles, [ROLES.STUDENT]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [reviewing, setReviewing] = useState(null);
  const [playingInteractive, setPlayingInteractive] = useState('');
  const [previewingMaterial, setPreviewingMaterial] = useState(null);
  const [loadingMaterial, setLoadingMaterial] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirming, setConfirming] = useState('');
  const pendingQuick = useRef(null);
  const [undoable, setUndoable] = useState(null);
  const [reopenable, setReopenable] = useState(null);
  const [answering, setAnswering] = useState(null);
  const [answerBusy, setAnswerBusy] = useState(false);
  // leaving the page within the 5 seconds still sends the grade the teacher confirmed
  useEffect(() => () => { const entry = pendingQuick.current; if (entry) { globalThis.clearTimeout(entry.timer); repository.reviewSubmission({ submission: entry.submission, teacherGrade: entry.grade, teacherFeedback: quickFeedback(entry.submission.percentage), user }).catch(() => {}); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const state = useAsyncData(async () => {
    const studentResult = await studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) });
    const studentIds = studentResult.items.map((item) => item.id);
    const [homework, submissions] = await Promise.all([
      repository.listByStudentIds(studentIds),
      repository.listSubmissionsByStudentIds(studentIds),
    ]);
    const studentNames = new Map(studentResult.items.map((student) => [student.id, student.name]));
    return {
      homework,
      students: studentResult,
      submissions: submissions.map((item) => ({ ...item, studentName: item.studentName || studentNames.get(item.studentId) || 'Õpilane' })),
    };
  }, [repository, studentRepository, teacherOnly, user.uid]);

  // Interactive lessons assigned in CRM v1: students finish them here, teachers send feedback. Nothing new is assigned
  // in v2, so the card disappears once the old assignments are done. A failing API only hides the card.
  const interactiveState = useAsyncData(
    () => (interactiveRepository?.list ? interactiveRepository.list().catch(() => []) : Promise.resolve([])),
    [interactiveRepository],
  );
  const interactive = (interactiveState.data || []).filter((item) => item.status === 'submitted');

  const filtered = useMemo(() => sortHomework((state.data?.homework || []).filter((item) => (
    `${item.studentName || ''} ${item.task || ''}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))
    && (status === 'all' || (status === 'done' ? !isHomeworkOpen(item) : isHomeworkOpen(item)))
  ))), [state.data, query, status]);
  const stale = staleHomework(state.data?.homework || []);
  const submissions = useMemo(() => (state.data?.submissions || []).filter((item) => (
    `${item.studentName} ${item.title}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))
    && (reviewStatus === 'all' || item.reviewStatus === reviewStatus)
  )), [state.data, query, reviewStatus]);

  // A reload after saving or submitting keeps the page (and an open worksheet) on screen: unmounting the
  // player would reopen it from the old copy and hide the result.
  if (state.loading && !state.data) return <LoadingState label="Laen kodutöid…" />;
  if (state.error && !state.data) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const { students } = state.data;
  const today = localDate();
  // the queue: the next work below in the list that still waits for a review (else the first one above)
  const reviewKey = (item) => `${item.submissionKind}-${item.id}`;
  const waiting = reviewing ? submissions.filter((item) => item.reviewStatus !== 'reviewed' && reviewKey(item) !== reviewKey(reviewing)) : [];
  const at = reviewing ? submissions.findIndex((item) => reviewKey(item) === reviewKey(reviewing)) : -1;
  const nextReview = waiting.find((item) => submissions.indexOf(item) > at) || waiting[0] || null;
  const openHomework = state.data.homework.filter(isHomeworkOpen);
  const overdueHomework = openHomework.filter((item) => item.due && item.due < today);
  const pendingReviews = state.data.submissions.filter((item) => item.reviewStatus !== 'reviewed');

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      const student = students.items.find((item) => item.id === form.studentId);
      if (!student) throw new Error('Vali õpilane.');
      // „Häälülesanne”: the student answers by voice; up to three helper questions
      const { voice, prompts, ...task } = form;
      const lines = voicePrompts(prompts);
      await repository.create({ ...task, studentName: student.name, ...(voice ? { kind: 'voice', prompts: lines } : {}) });
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
  // „Kinnita” waits 5 seconds with „Tühista” before the grade goes to the student
  const sendQuick = async (entry) => {
    try {
      await repository.reviewSubmission({ submission: entry.submission, teacherGrade: entry.grade, teacherFeedback: quickFeedback(entry.submission.percentage), user });
      setSuccess(`${entry.submission.studentName || 'Õpilane'}: hinne ${entry.grade} saadetud.`);
      await state.reload();
    } catch (error) { setActionError(error.message || 'Hinnet ei saanud salvestada.'); } finally { setConfirming(''); }
  };
  const confirmReview = (submission, grade) => {
    const key = `${submission.submissionKind}-${submission.id}`;
    setConfirming(key); setActionError(''); setSuccess('');
    const entry = { submission, grade };
    entry.timer = globalThis.setTimeout(() => { pendingQuick.current = null; setUndoable(null); sendQuick(entry); }, quickDelayMs);
    pendingQuick.current = entry;
    setUndoable(entry);
  };
  const undoQuick = () => {
    const entry = pendingQuick.current;
    if (!entry) return;
    globalThis.clearTimeout(entry.timer);
    pendingQuick.current = null;
    setUndoable(null); setConfirming('');
  };

  // the student's own „Tehtud” (with an optional answer) and the teacher's „Sulge”
  const finishTask = async (item, withAnswer = null) => {
    setAnswerBusy(true); setActionError('');
    try {
      if (withAnswer && repository.submitAnswer) await repository.submitAnswer({ item, ...withAnswer });
      else await repository.setStatus(item.id, 'Tehtud');
      setAnswering(null);
      // one click without an answer: a written task would reach the teacher empty, so offer a way back
      setReopenable(withAnswer ? null : item);
      setSuccess(withAnswer ? 'Kodutöö on märgitud tehtuks. Õpetaja näeb seda kohe.' : '');
      await state.reload();
    } catch (error) { setActionError(error.message || 'Kodutööd ei saanud salvestada.'); } finally { setAnswerBusy(false); }
  };
  const reopenForAnswer = async () => {
    const item = reopenable;
    setReopenable(null); setActionError('');
    try {
      await repository.setStatus(item.id, 'Ootel');
      await state.reload();
      setAnswering(item.id);
    } catch (error) { setActionError(error.message || 'Kodutööd ei saanud tagasi võtta.'); }
  };
  const closeTasks = async (items, ask) => {
    if (!items.length || (ask && !globalThis.confirm(ask))) return;
    setActionError('');
    try {
      await (repository.closeMany ? repository.closeMany(items.map((item) => item.id)) : Promise.all(items.map((item) => repository.setStatus(item.id, 'Suletud'))));
      setSuccess(items.length === 1 ? 'Kodutöö on suletud.' : `${items.length} vana kodutööd on suletud.`);
      await state.reload();
    } catch (error) { setActionError(error.message || 'Kodutöid ei saanud sulgeda.'); }
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
    <PageHeader compact eyebrow="Õppetöö" title="Kodutööd" description="Ülesanded, esitused, hindamine ja tagasiside ühes vaates." actions={<Button onClick={() => setModal(true)}><Plus size={18} /> Uus kodutöö</Button>} />
    <PeopleOverview label="Kodutööde kokkuvõte" eyebrow="Õppetöö ülevaade" title="Ülesanded ja tagasiside" description="Pooleliolevad tööd, tähtajad ja kontrollimist ootavad esitused." metrics={[
      { icon: ClipboardCheck, label: 'Kõik ülesanded', value: state.data.homework.length, hint: `${students.items.length} õpilast` },
      { icon: Clock3, label: 'Pooleli', value: openHomework.length, hint: 'ootab tegemist' },
      { icon: Star, label: 'Hilinenud', value: overdueHomework.length, hint: 'vajab tähelepanu' },
      { icon: MessageSquare, label: 'Ootab kontrolli', value: pendingReviews.length, hint: `${state.data.submissions.length} esitust kokku` },
    ]} />
    {undoable ? <div className="success-notice" role="status">{undoable.submission.studentName || 'Õpilane'}: hinne {undoable.grade} saadetakse 5 sekundi pärast. <button type="button" className="link-button" onClick={undoQuick}>Tühista</button></div> : null}
    {success ? <div className="success-notice" role="status">{success}<button onClick={() => setSuccess('')}>×</button></div> : null}
    {reopenable ? <div className="success-notice" role="status">Kodutöö on märgitud tehtuks. Kirjalik töö? Õpetaja ei näe vastust, kui seda ei lisa. <button type="button" className="link-button" onClick={reopenForAnswer}>Võta tagasi ja lisa vastus</button><button aria-label="Sulge teade" onClick={() => setReopenable(null)}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button onClick={() => setActionError('')}>×</button></div> : null}

    <div className="homework-toolbar">
      <div className="list-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi kodutööd" placeholder="Otsi õpilast või ülesannet" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select aria-label="Kodutöö staatus" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Kõik ülesanded</option><option value="open">Pooleli</option><option value="done">Tehtud</option></Select></div>
    </div>

    {interactive.length ? <Card className="list-card">
      <div className="homework-card-heading"><div><span className="eyebrow">Varem määratud</span><h2>Interaktiivsed tunnid ootavad tagasisidet</h2></div><Badge tone="info">{interactive.length}</Badge></div>
      <div className="interactive-list">{interactive.map((item) => <button type="button" key={item.id} onClick={() => setPlayingInteractive(item.id)}><span><strong>{item.title}</strong><small>{`${item.studentName} · `}{ASSIGNMENT_STATUS_LABEL[item.status] || item.status}</small></span><Badge tone={item.status === 'active' ? 'info' : 'success'}>{item.status === 'active' ? 'Ava' : 'Vaata'}</Badge></button>)}</div>
    </Card> : null}

    <div className="homework-grid">
      <Card className="list-card homework-task-card">
        <div className="homework-card-heading"><div><span className="eyebrow">Ülesanded</span><h2>Kodutööd</h2></div>{stale.length ? <Button variant="secondary" onClick={() => closeTasks(stale, `Sulgeda ${stale.length} kodutööd, mille tähtaeg möödus üle 30 päeva tagasi? Need jäävad alles staatusega „Suletud”.`)}><Archive size={16} /> Sulge vanad ({stale.length})</Button> : <Badge tone="neutral">{filtered.length}</Badge>}</div>
        {filtered.length ? <div className="task-list">{filtered.map((item) => {
          const done = item.status === 'Tehtud';
          const closed = item.status === 'Suletud';
          const overdue = isOverdue(item, localDate());
          const studentCanFinish = studentRole && !done && !closed && selfCompleted(item);
          const exerciseTask = Boolean(item.isExercise && item.exerciseId);
          const materialTask = Boolean(!exerciseTask && (item.sourceId || item.attachments?.length || item.fileUrl));
          return <article className={done || closed ? 'task-row is-done' : 'task-row'} key={item.id} data-entity="homework" data-assignment-id={item.id} data-entity-title={[item.studentName, item.task].filter(Boolean).join(' · ') || undefined} data-student-id={item.studentId || undefined}>
            <button className="task-check" data-entity-action="toggle" aria-label={done ? 'Märgi pooleliolevaks' : 'Märgi tehtuks'} onClick={async () => { await repository.setStatus(item.id, done ? 'Ootel' : 'Tehtud'); await state.reload(); }}>{done ? <CheckCircle2 /> : <Clock3 />}</button>
            <div><b className="task-student">{item.studentName || 'Õpilane'}</b><strong className="task-text">{item.task}</strong>{exerciseTask || item.source === 'live-classroom' || item.source === 'lesson-errors' ? <span>{[exerciseTask ? 'Interaktiivne harjutus' : '', item.source === 'live-classroom' ? 'Tunnist' : '', item.source === 'lesson-errors' ? 'Tunni vigadest' : ''].filter(Boolean).join(' · ')}</span> : null}
              {item.boardPageId ? <Link className="task-link" to={`/board/${item.studentId}?page=${item.boardPageId}`}>Ava tahvlileht „{item.boardPageTitle || 'Tahvlileht'}”</Link> : null}
              {item.worksheetTitle ? <span>Tööleht „{item.worksheetTitle}” on all „Töölehed”</span> : null}
              {item.kind === 'voice' && !(item.studentFiles || []).some(isAudioFile) && item.prompts?.length ? <ul className="voice-answer__prompts">{item.prompts.map((line) => <li key={line}>{line}</li>)}</ul> : null}
              {item.studentAnswer || item.studentFiles?.length ? <div className="task-answer"><small>Õpilase vastus</small>{item.studentAnswer ? <p>{item.studentAnswer}</p> : null}{(item.studentFiles || []).map((file) => (isAudioFile(file) ? <audio key={file.url} controls src={file.url} aria-label={`Häälvastus: ${file.name || ''}`} /> : <a key={file.url} href={file.url} target="_blank" rel="noreferrer"><Paperclip size={13} /> {file.name || 'Fail'}</a>))}</div> : null}
              {studentCanFinish && answering !== item.id ? (item.kind === 'voice'
                ? <div className="task-actions"><Button onClick={() => setAnswering(item.id)}><Mic size={15} /> Salvesta vastus</Button></div>
                : <div className="task-actions"><Button loading={answerBusy && answering === null} onClick={() => finishTask(item)}><CheckCircle2 size={16} /> Tehtud</Button><Button variant="secondary" onClick={() => setAnswering(item.id)}><Paperclip size={15} /> Lisa vastus</Button></div>) : null}
              {studentCanFinish && answering === item.id ? (item.kind === 'voice'
                ? <VoiceAnswer prompts={item.prompts || []} busy={answerBusy} onSend={(answer) => finishTask(item, answer)} onCancel={() => setAnswering(null)} />
                : <TaskAnswerForm busy={answerBusy} onSend={(answer) => finishTask(item, answer)} onCancel={() => setAnswering(null)} />) : null}</div>
            <div className="task-due">{exerciseTask ? <Badge tone="info">Harjutus</Badge> : null}{materialTask ? <button className="task-preview-button" data-entity-action="preview" aria-label={`Eelvaade: ${item.task}`} disabled={loadingMaterial === item.id} onClick={() => openMaterial(item)}>{loadingMaterial === item.id ? <span className="button__spinner" /> : <Eye size={16} />}<span>Eelvaade</span></button> : null}<Badge tone={done ? 'success' : closed ? 'neutral' : overdue ? 'danger' : 'neutral'}>{done ? 'Tehtud' : closed ? 'Suletud' : <span title={item.due ? `Tähtaeg ${displayDate(item.due)}` : undefined}>{dueLabel(item.due, today)}</span>}</Badge>{!done && !closed ? <button className="text-button" aria-label={`Sulge: ${item.task}`} title="Sulge (keegi ei tee seda enam)" onClick={() => closeTasks([item])}><Archive size={17} /></button> : null}<button className="text-button danger" aria-label="Kustuta" onClick={async () => { if (window.confirm('Kas kustutada kodutöö?')) { await repository.remove(item.id); await state.reload(); } }}><Trash2 size={17} /></button></div>
          </article>;
        })}</div> : <EmptyState title="Kodutöid ei leitud" description="Lisa esimene ülesanne või muuda filtrit." />}
      </Card>

      <Card className="list-card submission-card">
        <div className="homework-card-heading"><div><span className="eyebrow">Kontrollimine</span><h2>Esitatud tööd</h2></div><Select aria-label="Kontrolli staatus" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}><option value="pending">Ootab kontrolli</option><option value="reviewed">Tagasiside antud</option><option value="all">Kõik esitused</option></Select></div>
        <SubmissionList items={submissions} onOpen={openReview} onConfirm={confirmReview} confirming={confirming} />
      </Card>
    </div>

    <Modal open={modal} title="Uus kodutöö" onClose={() => setModal(false)} footer={<><Button variant="secondary" onClick={() => setModal(false)}>Loobu</Button><Button loading={saving} type="submit" form="homework-form">Lisa ülesanne</Button></>}>
      <form id="homework-form" className="form-grid" onSubmit={submit}><Select id="homework-student" className="form-grid__wide" label="Õpilane" value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} required><option value="">Vali õpilane</option>{students.items.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</Select><Input id="homework-task" className="form-grid__wide" label="Ülesanne" value={form.task} onChange={(event) => setForm({ ...form, task: event.target.value })} required /><Input id="homework-due" label="Tähtaeg" type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} required />
        <label className="form-grid__wide homework-voice-toggle"><input type="checkbox" checked={form.voice} onChange={(event) => setForm({ ...form, voice: event.target.checked })} /> <span><strong>Häälülesanne</strong> — õpilane räägib kuni 2 minutit ja saadab salvestuse</span></label>
        {form.voice ? <label className="textarea-field form-grid__wide"><span>Abiküsimused (kuni 3, igaüks eraldi real)</span><textarea rows={3} value={form.prompts} onChange={(event) => setForm({ ...form, prompts: event.target.value })} placeholder={'Mida sa eile tegid?\nKuhu sa läksid?\nMis sulle meeldis?'} /></label> : null}</form>
    </Modal>

    {reviewing ? <SubmissionReviewModal
      key={`${reviewing.submissionKind}-${reviewing.id}`}
      submission={reviewing}
      staff
      repository={repository}
      user={user}
      skillMap={students.items.find((item) => item.id === reviewing.studentId)?.skillMap || {}}
      onClose={() => setReviewing(null)}
      onSaved={async () => { setReviewing(null); setSuccess('Hinne ja tagasiside saadeti õpilasele.'); await state.reload(); }}
      {...(nextReview ? { onSavedNext: async () => { setReviewing(nextReview); setSuccess('Hinne ja tagasiside saadeti õpilasele.'); await state.reload(); } } : {})}
    /> : null}
    {playingInteractive ? <InteractiveLessonPlayer assignmentId={playingInteractive} user={user} staff repository={interactiveRepository} onClose={() => setPlayingInteractive('')} onChanged={interactiveState.reload} /> : null}
    {previewingMaterial ? <MaterialPreview item={previewingMaterial} onClose={() => setPreviewingMaterial(null)} /> : null}
  </div>;
}

export default function HomeworkPage(props) {
  const { user } = useAuth();
  const { quickDelayMs: _quickDelayMs, ...learner } = props;
  return hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.TEACHER]) ? <StaffHomeworkPage {...props} /> : <LearnerTasksPage {...learner} />;
}
