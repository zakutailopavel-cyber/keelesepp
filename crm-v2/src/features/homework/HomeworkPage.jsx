import { CheckCircle2, ClipboardCheck, Clock3, Eye, FileText, MessageSquare, Plus, Search, Star, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, studentsService } from '../../services/firebase/index.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';

const blank = { studentId: '', task: '', due: new Date().toISOString().slice(0, 10) };
const emptyReview = { teacherGrade: '', teacherFeedback: '' };

function formatDate(value) {
  if (!value) return 'Kuupäev puudub';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : new Intl.DateTimeFormat('et-EE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function readableValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Jah' : 'Ei';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(readableValue).join(', ');
  return Object.entries(value).map(([key, item]) => `${key}: ${readableValue(item)}`).join(' · ');
}

function AnswerList({ answers }) {
  const entries = answers && typeof answers === 'object' ? Object.entries(answers) : [];
  if (!entries.length) return <p className="submission-empty-answer">Vastuseid ei ole salvestatud.</p>;
  return <div className="submission-answers">{entries.map(([key, value], index) => <div key={key}><span>{index + 1}. vastus</span><strong>{readableValue(value)}</strong></div>)}</div>;
}

function SubmissionList({ items, staff, onOpen }) {
  if (!items.length) return <EmptyState title={staff ? 'Kontrollitavaid töid ei leitud' : 'Esitatud töid ei ole'} description={staff ? 'Uued õpilaste esitused ilmuvad siia automaatselt.' : 'Pärast töö esitamist näed siin tulemust ja õpetaja tagasisidet.'} />;
  return <div className="submission-list">{items.map((item) => {
    const reviewed = item.reviewStatus === 'reviewed';
    return <button className="submission-row" key={`${item.submissionKind}-${item.id}`} onClick={() => onOpen(item)}>
      <i>{item.submissionKind === 'worksheet' ? <FileText size={20} /> : <ClipboardCheck size={20} />}</i>
      <span className="submission-row__main"><strong>{item.title}</strong><small>{item.studentName || 'Õpilane'} · {formatDate(item.completedAt)}</small></span>
      <span className="submission-row__score">{item.percentage != null ? <b>{item.percentage}%</b> : null}{item.teacherGrade ? <small>Hinne {item.teacherGrade}</small> : null}</span>
      <Badge tone={reviewed ? 'success' : 'info'}>{reviewed ? 'Tagasiside antud' : 'Ootab kontrolli'}</Badge>
      <Eye size={18} />
    </button>;
  })}</div>;
}

export default function HomeworkPage({ repository = homeworkService, studentRepository = studentsService }) {
  const { user } = useAuth();
  const staff = hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.TEACHER]);
  const teacherOnly = hasAnyRole(user.roles, [ROLES.TEACHER]) && !hasAnyRole(user.roles, [ROLES.ADMIN]);
  const canMarkHomework = staff || hasAnyRole(user.roles, [ROLES.STUDENT]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [reviewStatus, setReviewStatus] = useState('pending');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [reviewing, setReviewing] = useState(null);
  const [review, setReview] = useState(emptyReview);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  const state = useAsyncData(async () => {
    const studentResult = staff
      ? await studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) })
      : { items: await studentRepository.listOwned(user.uid) };
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
  }, [repository, staff, studentRepository, teacherOnly, user.uid]);

  const filtered = useMemo(() => (state.data?.homework || []).filter((item) => (
    `${item.studentName || ''} ${item.task || ''}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))
    && (status === 'all' || (status === 'done' ? item.status === 'Tehtud' : item.status !== 'Tehtud'))
  )), [state.data, query, status]);
  const submissions = useMemo(() => (state.data?.submissions || []).filter((item) => (
    `${item.studentName} ${item.title}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'))
    && (!staff || reviewStatus === 'all' || item.reviewStatus === reviewStatus)
  )), [state.data, query, reviewStatus, staff]);

  if (state.loading) return <LoadingState label="Laen kodutöid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const { students } = state.data;

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
    setReview({ teacherGrade: submission.teacherGrade ?? '', teacherFeedback: submission.teacherFeedback || '' });
    setActionError('');
  };

  const saveReview = async () => {
    setSaving(true);
    setActionError('');
    try {
      await repository.reviewSubmission({ submission: reviewing, ...review, user });
      setReviewing(null);
      setSuccess('Hinne ja tagasiside saadeti õpilasele.');
      await state.reload();
    } catch (error) {
      setActionError(error.message);
    } finally {
      setSaving(false);
    }
  };

  return <div className="page-content">
    <PageHeader eyebrow="Õppetöö" title="Kodutööd" description={staff ? 'Ülesanded, esitused, hindamine ja tagasiside ühes vaates.' : 'Sinu ülesanded, tulemused ja õpetaja tagasiside.'} actions={staff ? <Button onClick={() => setModal(true)}><Plus size={18} /> Uus kodutöö</Button> : null} />
    {success ? <div className="success-notice" role="status">{success}<button onClick={() => setSuccess('')}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button onClick={() => setActionError('')}>×</button></div> : null}

    <Card className="homework-overview">
      <div className="list-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi kodutööd" placeholder="Otsi õpilast või ülesannet" value={query} onChange={(event) => setQuery(event.target.value)} /></div><Select aria-label="Kodutöö staatus" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Kõik ülesanded</option><option value="open">Pooleli</option><option value="done">Tehtud</option></Select></div>
    </Card>

    <div className="homework-grid">
      <Card className="list-card homework-task-card">
        <div className="homework-card-heading"><div><span className="eyebrow">Ülesanded</span><h2>Kodutööd</h2></div><Badge tone="neutral">{filtered.length}</Badge></div>
        {filtered.length ? <div className="task-list">{filtered.map((item) => {
          const done = item.status === 'Tehtud';
          const overdue = !done && item.due && item.due < new Date().toISOString().slice(0, 10);
          return <article className={done ? 'task-row is-done' : 'task-row'} key={item.id}>
            {canMarkHomework ? <button className="task-check" aria-label={done ? 'Märgi pooleliolevaks' : 'Märgi tehtuks'} onClick={async () => { await repository.setStatus(item.id, done ? 'Ootel' : 'Tehtud'); await state.reload(); }}>{done ? <CheckCircle2 /> : <Clock3 />}</button> : <span className="task-check">{done ? <CheckCircle2 /> : <Clock3 />}</span>}
            <div><strong>{item.task}</strong><span>{item.studentName || 'Õpilane'}</span></div>
            <div className="task-due"><Badge tone={done ? 'success' : overdue ? 'danger' : 'neutral'}>{done ? 'Tehtud' : `Tähtaeg ${item.due || '—'}`}</Badge>{staff ? <button className="text-button danger" aria-label="Kustuta" onClick={async () => { if (window.confirm('Kas kustutada kodutöö?')) { await repository.remove(item.id); await state.reload(); } }}><Trash2 size={17} /></button> : null}</div>
          </article>;
        })}</div> : <EmptyState title="Kodutöid ei leitud" description={staff ? 'Lisa esimene ülesanne või muuda filtrit.' : 'Praegu ei ole siin ühtegi ülesannet.'} />}
      </Card>

      <Card className="list-card submission-card">
        <div className="homework-card-heading"><div><span className="eyebrow">{staff ? 'Kontrollimine' : 'Tulemused'}</span><h2>{staff ? 'Esitatud tööd' : 'Minu esitused'}</h2></div>{staff ? <Select aria-label="Kontrolli staatus" value={reviewStatus} onChange={(event) => setReviewStatus(event.target.value)}><option value="pending">Ootab kontrolli</option><option value="reviewed">Tagasiside antud</option><option value="all">Kõik esitused</option></Select> : <Badge tone="neutral">{submissions.length}</Badge>}</div>
        <SubmissionList items={submissions} staff={staff} onOpen={openReview} />
      </Card>
    </div>

    <Modal open={modal} title="Uus kodutöö" onClose={() => setModal(false)} footer={<><Button variant="secondary" onClick={() => setModal(false)}>Loobu</Button><Button loading={saving} type="submit" form="homework-form">Lisa ülesanne</Button></>}>
      <form id="homework-form" className="form-grid" onSubmit={submit}><Select id="homework-student" className="form-grid__wide" label="Õpilane" value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} required><option value="">Vali õpilane</option>{students.items.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</Select><Input id="homework-task" className="form-grid__wide" label="Ülesanne" value={form.task} onChange={(event) => setForm({ ...form, task: event.target.value })} required /><Input id="homework-due" label="Tähtaeg" type="date" value={form.due} onChange={(event) => setForm({ ...form, due: event.target.value })} required /></form>
    </Modal>

    <Modal open={Boolean(reviewing)} title={reviewing?.title || 'Esitatud töö'} onClose={() => setReviewing(null)} className="modal--review" footer={staff ? <><Button variant="secondary" onClick={() => setReviewing(null)}>Sulge</Button><Button loading={saving} onClick={saveReview}><MessageSquare size={17} /> Saada tagasiside</Button></> : <Button variant="secondary" onClick={() => setReviewing(null)}>Sulge</Button>}>
      {reviewing ? <div className="submission-review">
        <div className="submission-review__hero"><div><span className="eyebrow">{reviewing.submissionKind === 'worksheet' ? 'Tööleht' : 'Interaktiivne harjutus'}</span><strong>{reviewing.studentName}</strong><small>Esitatud {formatDate(reviewing.completedAt)}</small></div><div>{reviewing.percentage != null ? <b>{reviewing.percentage}%</b> : <ClipboardCheck size={28} />}{reviewing.score?.total ? <small>{reviewing.score.correct}/{reviewing.score.total} õiget</small> : null}</div></div>
        {reviewing.selfAssessment ? <section className="submission-self"><strong>Õpilase enesehinnang</strong><p>{reviewing.selfAssessment.difficulty ? `Raskus: ${reviewing.selfAssessment.difficulty}. ` : ''}{reviewing.selfAssessment.comment || 'Kommentaari ei lisatud.'}</p></section> : null}
        <section><h3>Õpilase vastused</h3><AnswerList answers={reviewing.answers} /></section>
        {Array.isArray(reviewing.errorLog) && reviewing.errorLog.length ? <section><h3>Automaatselt tuvastatud vead</h3><div className="submission-errors">{reviewing.errorLog.map((error, index) => <p key={index}>{readableValue(error)}</p>)}</div></section> : null}
        {staff ? <section className="submission-feedback"><h3>Õpetaja tagasiside</h3><div className="submission-grade"><Select id="teacher-grade" label="Hinne 1–5" value={review.teacherGrade} onChange={(event) => setReview({ ...review, teacherGrade: event.target.value })}><option value="">Hindeta</option>{[1, 2, 3, 4, 5].map((grade) => <option key={grade} value={grade}>{grade}</option>)}</Select><Star size={21} /></div><label className="textarea-field"><span>Kommentaar õpilasele</span><textarea aria-label="Kommentaar õpilasele" rows="5" value={review.teacherFeedback} onChange={(event) => setReview({ ...review, teacherFeedback: event.target.value })} placeholder="Mis läks hästi ja mida järgmisel korral parandada?" /></label></section> : reviewing.reviewStatus === 'reviewed' ? <section className="returned-feedback"><div><MessageSquare size={20} /><strong>Õpetaja tagasiside</strong>{reviewing.teacherGrade ? <Badge tone="success">Hinne {reviewing.teacherGrade}</Badge> : null}</div><p>{reviewing.teacherFeedback || 'Õpetaja jättis tööle hinde ilma kommentaarita.'}</p><small>{reviewing.reviewedByName ? `${reviewing.reviewedByName} · ` : ''}{formatDate(reviewing.reviewedAt)}</small></section> : <section className="submission-waiting"><Clock3 size={20} /><p>Õpetaja ei ole tööle veel tagasisidet saatnud.</p></section>}
      </div> : null}
    </Modal>
  </div>;
}
