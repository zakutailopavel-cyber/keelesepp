import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { scheduleService, studentsService } from '../../services/firebase/index.js';
import { hasScheduleConflict } from '../../services/firebase/schedule.js';
import { ROLES } from '../../utils/roles.js';

const iso = (date) => date.toISOString().slice(0, 10);
const addDays = (value, amount) => { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + amount); return iso(date); };
const empty = { studentId: '', date: iso(new Date()), time: '09:00', duration: 60, recurring: false };

export default function CalendarPage() {
  const { user } = useAuth();
  const [day, setDay] = useState(iso(new Date()));
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !user.roles.includes(ROLES.ADMIN);
  const state = useAsyncData(async () => Promise.all([
    scheduleService.list(teacherOnly ? { teacherUid: user.uid } : {}),
    studentsService.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }),
  ]), [teacherOnly, user.uid]);
  const week = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(day, index)), [day]);
  if (state.loading) return <LoadingState label="Laen kalendrit…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const [events, students] = state.data;
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setActionError('');
    try {
      const student = students.items.find((item) => item.id === form.studentId);
      if (!student) throw new Error('Vali õpilane.');
      const candidate = { ...form, studentName: student.name, teacher: student.teacher || user.displayName, teacherUid: student.teacherUid || user.uid };
      if (hasScheduleConflict(events, candidate)) throw new Error('Sellel õpetajal on valitud ajal juba teine tund.');
      await scheduleService.create(candidate);
      setModal(false); setForm(empty); await state.reload();
    } catch (error) { setActionError(error.message); } finally { setSaving(false); }
  };
  return <div className="page-content"><PageHeader eyebrow="Planeerimine" title="Kalender" description="Nädalavaade, tunnid ja õpetajate koormus." actions={<Button onClick={() => setModal(true)}><Plus size={18} /> Lisa tund</Button>} />
    {actionError ? <div className="action-error">{actionError}<button onClick={() => setActionError('')}>×</button></div> : null}
    <Card className="calendar-card"><div className="calendar-toolbar"><div><Button variant="secondary" onClick={() => setDay(addDays(day, -7))}><ChevronLeft size={17} /></Button><Button variant="secondary" onClick={() => setDay(iso(new Date()))}>Täna</Button><Button variant="secondary" onClick={() => setDay(addDays(day, 7))}><ChevronRight size={17} /></Button></div><strong>{new Date(`${day}T12:00:00`).toLocaleDateString('et-EE', { month: 'long', year: 'numeric' })}</strong></div>
    <div className="week-grid">{week.map((date) => { const daily = events.filter((item) => (item.date || item.startDate) === date && item.status !== 'Tühistatud'); return <section className={date === iso(new Date()) ? 'is-today' : ''} key={date}><header><span>{new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short' })}</span><strong>{date.slice(-2)}</strong></header><div>{daily.map((item) => <button className="lesson-chip" key={item.id} onClick={async () => { if (window.confirm('Kas tühistada see tund?')) { await scheduleService.cancel(item.id, item); await state.reload(); } }}><time>{item.time}</time><strong>{item.studentName}</strong><small>{item.teacher} · {item.duration} min</small></button>)}{!daily.length ? <span className="day-empty">—</span> : null}</div></section>; })}</div>
    {!events.length ? <EmptyState title="Kalender on tühi" description="Lisa esimene tund, et nädalaplaan tekiks." /> : null}</Card>
    <Modal open={modal} title="Uus tund" onClose={() => setModal(false)} footer={<><Button variant="secondary" onClick={() => setModal(false)}>Loobu</Button><Button loading={saving} type="submit" form="lesson-form">Salvesta tund</Button></>}><form id="lesson-form" className="form-grid" onSubmit={submit}><Select className="form-grid__wide" label="Õpilane" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required><option value="">Vali õpilane</option>{students.items.map((student) => <option value={student.id} key={student.id}>{student.name} · {student.teacher}</option>)}</Select><Input label="Kuupäev" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /><Input label="Kellaaeg" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required /><Input label="Kestus minutites" type="number" min="5" step="5" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></form></Modal>
  </div>;
}
