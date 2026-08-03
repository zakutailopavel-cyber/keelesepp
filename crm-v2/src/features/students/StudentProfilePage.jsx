import { ArrowLeft, Pencil } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { studentsService } from '../../services/firebase/students.js';
import StudentForm from './StudentForm.jsx';

function invoiceBalance(invoice) {
  if (Number.isFinite(invoice.balanceDueCents)) return invoice.balanceDueCents;
  return Math.max(0, Math.round((Number(invoice.amount) - Number(invoice.paidAmount || 0)) * 100));
}

export default function StudentProfilePage({ studentApi = studentsService, lessonApi = lessonsService, invoiceApi = invoicesService }) {
  const { studentId } = useParams();
  const [state, setState] = useState({ loading: true, error: null, student: null, lessons: [], invoices: [] });
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const student = await studentApi.getById(studentId);
      if (!student) { setState({ loading: false, error: null, student: null, lessons: [], invoices: [] }); return; }
      const [lessons, invoices] = await Promise.all([lessonApi.listByStudent(studentId), invoiceApi.listByStudent(studentId)]);
      setState({ loading: false, error: null, student, lessons, invoices });
    } catch (error) { setState((current) => ({ ...current, loading: false, error })); }
  }, [invoiceApi, lessonApi, studentApi, studentId]);

  useEffect(() => { load(); }, [load]);
  const financial = useMemo(() => ({ balanceCents: state.invoices.reduce((sum, invoice) => sum + invoiceBalance(invoice), 0), overdue: state.invoices.filter((invoice) => invoice.status === 'overdue' || invoice.paymentStatus === 'overdue').length }), [state.invoices]);
  const progress = useMemo(() => Object.entries(state.student?.skillMap || {}).sort((a, b) => b[1] - a[1]).slice(0, 8), [state.student]);

  if (state.loading) return <div className="page-content"><Card><LoadingState label="Laen õpilase profiili…" /></Card></div>;
  if (state.error) return <div className="page-content"><Card><ErrorState message={state.error.message} onRetry={load} /></Card></div>;
  if (!state.student) return <div className="page-content"><Card><EmptyState title="Õpilast ei leitud" action={<Link className="button button--secondary" to="/students">Tagasi nimekirja</Link>} /></Card></div>;
  const { student } = state;

  return (
    <div className="page-content">
      <Link className="back-link" to="/students"><ArrowLeft size={17} /> Kõik õpilased</Link>
      <PageHeader eyebrow={student.active ? 'Aktiivne õpilane' : 'Arhiveeritud'} title={student.name} description={`${student.subject || 'Õppeaine määramata'} · ${student.level || 'tase määramata'} → ${student.targetLevel || 'sihttase määramata'}`} actions={<Button variant="secondary" onClick={() => setEditing(true)}><Pencil size={17} /> Muuda</Button>} />
      <div className="profile-grid">
        <Card><h2>Põhiandmed</h2><dl className="detail-list"><div><dt>Lapsevanem</dt><dd>{student.parentName || '—'}</dd></div><div><dt>E-post</dt><dd>{student.email || '—'}</dd></div><div><dt>Telefon</dt><dd>{student.phone || '—'}</dd></div><div><dt>Õpetaja</dt><dd>{student.teacher || 'Määramata'}</dd></div><div><dt>Rühm</dt><dd>{student.group || '—'}</dd></div><div><dt>Klass</dt><dd>{student.grade || '—'}</dd></div></dl></Card>
        <Card><h2>Finantsseis</h2><div className="financial-summary"><strong>{(financial.balanceCents / 100).toLocaleString('et-EE', { style: 'currency', currency: 'EUR' })}</strong><span>Tasumata jääk</span></div><p>{financial.overdue ? <Badge tone="danger">{financial.overdue} tähtaja ületanud arvet</Badge> : <Badge tone="success">Tähtaja ületanud arveid ei ole</Badge>}</p><small>{state.invoices.length} arvet kokku</small></Card>
        <Card className="profile-wide"><h2>Viimased tunnid</h2>{state.lessons.length ? <div className="simple-list">{state.lessons.slice(0, 6).map((lesson) => <div key={lesson.id}><div><strong>{lesson.date || 'Kuupäev puudub'} · {lesson.time || ''}</strong><span>{lesson.subject || student.subject}</span></div><Badge tone={lesson.status === 'Tühistatud' ? 'neutral' : 'info'}>{lesson.status || 'Toimunud'}</Badge></div>)}</div> : <EmptyState title="Tunde ei leitud" />}</Card>
        <Card className="profile-wide"><h2>Progress</h2>{progress.length ? <div className="progress-list">{progress.map(([skill, score]) => <div key={skill}><span>{skill}</span><div><i style={{ width: `${Math.max(0, Math.min(100, Number(score) || 0))}%` }} /></div><strong>{score}%</strong></div>)}</div> : <EmptyState title="Oskuste tulemusi ei ole veel salvestatud" />}</Card>
      </div>
      <StudentForm open={editing} student={student} teachers={student.teacher ? [student.teacher] : []} onClose={() => setEditing(false)} onSubmit={async (values) => { await studentApi.update(student.id, values); await load(); }} />
    </div>
  );
}
