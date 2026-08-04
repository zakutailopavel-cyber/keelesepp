import { ArrowLeft, Pencil } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { scheduleService } from '../../services/firebase/schedule.js';
import { studentsService } from '../../services/firebase/students.js';
import { ROLES } from '../../utils/roles.js';
import { canonicalTeacherName, isSameTeacher } from '../../utils/teachers.js';
import StudentForm from './StudentForm.jsx';
import { studentFinancialSummary } from './studentFinance.js';
import { LEGACY_TEACHERS } from './studentOptions.js';
import { studentValueLabel } from '../../utils/studentPrivacy.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';

export default function StudentProfilePage({ studentApi = studentsService, lessonApi = lessonsService, invoiceApi = invoicesService, scheduleApi = scheduleService, actor }) {
  const { studentId } = useParams();
  const auth = useContext(AuthContext);
  const currentUser = actor || auth?.user || { roles: [ROLES.ADMIN], displayName: '' };
  const canAssignTeacher = currentUser.roles?.includes(ROLES.ADMIN);
  const canViewFinance = currentUser.roles?.some((role) => [ROLES.ADMIN, ROLES.FINANCE].includes(role));
  const teacherScope = canAssignTeacher ? '' : canonicalTeacherName(currentUser.displayName);
  const [state, setState] = useState({ loading: true, error: null, forbidden: false, student: null, lessons: [], invoices: [], schedule: [] });
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const student = await studentApi.getById(studentId);
      if (!student) { setState({ loading: false, error: null, forbidden: false, student: null, lessons: [], invoices: [], schedule: [] }); return; }
      if (!canAssignTeacher && !isSameTeacher(student.teacher, teacherScope)) {
        setState({ loading: false, error: null, forbidden: true, student: null, lessons: [], invoices: [], schedule: [] });
        return;
      }
      const [lessons, schedule, invoices] = await Promise.all([
        lessonApi.listByStudent(studentId),
        scheduleApi.listByStudent(studentId),
        canViewFinance ? invoiceApi.listByStudent(studentId) : Promise.resolve([]),
      ]);
      setState({ loading: false, error: null, forbidden: false, student, lessons, invoices, schedule });
    } catch (error) { setState((current) => ({ ...current, loading: false, error: new Error(firebaseErrorMessage(error)) })); }
  }, [canAssignTeacher, canViewFinance, invoiceApi, lessonApi, scheduleApi, studentApi, studentId, teacherScope]);

  useEffect(() => { load(); }, [load]);
  const financial = useMemo(() => studentFinancialSummary(state.invoices), [state.invoices]);
  const progress = useMemo(() => Object.entries(state.student?.skillMap || {}).sort((a, b) => b[1] - a[1]).slice(0, 8), [state.student]);

  if (state.loading) return <div className="page-content"><Card><LoadingState label="Laen õpilase profiili…" /></Card></div>;
  if (state.error) return <div className="page-content"><Card><ErrorState message={state.error.message} onRetry={load} /></Card></div>;
  if (state.forbidden) return <div className="page-content"><Card><ErrorState title="Ligipääs puudub" message="Õpilane ei ole määratud sinu õpetajakontole." /></Card></div>;
  if (!state.student) return <div className="page-content"><Card><EmptyState title="Õpilast ei leitud" action={<Link className="button button--secondary" to="/students">Tagasi nimekirja</Link>} /></Card></div>;
  const { student } = state;

  return (
    <div className="page-content">
      <Link className="back-link" to="/students"><ArrowLeft size={17} /> Kõik õpilased</Link>
      {notice ? <div className="success-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Sulge teade">×</button></div> : null}
      <PageHeader eyebrow={student.active ? 'Aktiivne õpilane' : 'Arhiveeritud'} title={student.name} description={`${student.subject || 'Õppeaine määramata'} · ${student.level || 'tase määramata'} → ${student.targetLevel || 'sihttase määramata'}`} actions={<Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={17} /> Muuda</Button>} />
      <div className="profile-grid">
        <Card><h2>Põhiandmed</h2><dl className="detail-list"><div><dt>Lapsevanem</dt><dd>{studentValueLabel(student, 'parentName')}</dd></div><div><dt>E-post</dt><dd>{studentValueLabel(student, 'email')}</dd></div><div><dt>Telefon</dt><dd>{studentValueLabel(student, 'phone')}</dd></div><div><dt>Õpetaja</dt><dd>{student.hiddenFields?.teacher ? 'Peidetud' : canonicalTeacherName(student.teacher) || 'Määramata'}</dd></div><div><dt>Rühm</dt><dd>{student.group || '—'}</dd></div><div><dt>Klass</dt><dd>{student.grade || '—'}</dd></div></dl></Card>
        {canViewFinance ? <Card><h2>Finantsseis</h2><div className="financial-summary"><strong>{(financial.balanceCents / 100).toLocaleString('et-EE', { style: 'currency', currency: 'EUR' })}</strong><span>Tasumata jääk</span></div><p>{financial.overdue ? <Badge tone="danger">{financial.overdue} tähtaja ületanud arvet</Badge> : <Badge tone="success">Tähtaja ületanud arveid ei ole</Badge>}</p><small>{state.invoices.length} arvet kokku</small></Card> : null}
        <Card className="profile-wide"><h2>Graafik</h2>{state.schedule.length ? <div className="simple-list">{state.schedule.slice(0, 8).map((item) => <div key={item.id}><div><strong>{item.date || `Iganädalane · ${item.day || 'päev määramata'}`} · {item.time || 'kellaaeg määramata'}</strong><span>{item.teacher || student.teacher || 'Õpetaja määramata'}</span></div><Badge tone={item.status === 'Tühistatud' ? 'neutral' : 'info'}>{item.status || 'Planeeritud'}</Badge></div>)}</div> : <EmptyState title="Graafikut ei ole veel lisatud" />}</Card>
        <Card className="profile-wide"><h2>Viimased tunnid</h2>{state.lessons.length ? <div className="simple-list">{state.lessons.slice(0, 6).map((lesson) => <div key={lesson.id}><div><strong>{lesson.date || 'Kuupäev puudub'} · {lesson.time || ''}</strong><span>{lesson.subject || student.subject}</span></div><Badge tone={lesson.status === 'Tühistatud' ? 'neutral' : 'info'}>{lesson.status || 'Toimunud'}</Badge></div>)}</div> : <EmptyState title="Tunde ei leitud" />}</Card>
        <Card className="profile-wide"><h2>Progress</h2>{progress.length ? <div className="progress-list">{progress.map(([skill, score]) => <div key={skill}><span>{skill}</span><div><i style={{ width: `${Math.max(0, Math.min(100, Number(score) || 0))}%` }} /></div><strong>{score}%</strong></div>)}</div> : <EmptyState title="Oskuste tulemusi ei ole veel salvestatud" />}</Card>
      </div>
      <StudentForm open={editing} student={student} teachers={[...new Set([...LEGACY_TEACHERS, canonicalTeacherName(student.teacher)].filter(Boolean))]} canAssignTeacher={canAssignTeacher} defaultTeacher={teacherScope} onClose={() => setEditing(false)} onSubmit={async (values) => { const safeValues = canAssignTeacher ? values : { ...values, teacher: student.teacher || teacherScope }; await studentApi.update(student.id, safeValues); await load(); setNotice('Õpilase andmed on salvestatud.'); }} />
    </div>
  );
}
