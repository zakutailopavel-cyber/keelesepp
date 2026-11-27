import { ArrowLeft, Award, CalendarCheck, ClipboardCopy, ListChecks, Plus, RefreshCw, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService } from '../../services/firebase/groups.js';
import { studentsService } from '../../services/firebase/students.js';
import { trainingCoursesService } from '../../services/firebase/trainingCourses.js';
import { BUCKETS, CURRICULA, CURRICULUM_LABELS, DOCUMENTS, MAX_PARTICIPANTS, MIN_ATTENDANCE, MIN_FINAL_TEST, STATUSES, blankCourse, missingDocuments, nextDocumentNumber, normalizeCourse, reportText, sortCourses, suggestedDocument, toPercent, totalHours, validateCourse, withLessonAttendance, yearReport } from './trainingModel.js';
import './training.css';

const TONE = { active: 'info', finished: 'success', archived: 'neutral' };
const date = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : '');
const todayIso = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Tallinn' }).format(new Date());
const period = (course) => (course.endDate ? `${date(course.startDate)}–${date(course.endDate)}` : `alates ${date(course.startDate)}`);
const percentText = (value) => (value < 0 ? '' : String(value));
const blankParticipant = (student = {}) => ({ studentId: student.id || '', name: student.name || '', startedOn: '', attendancePct: -1, finalTestPct: -1, document: '', documentNumber: '', documentDate: '' });

function ParticipantRow({ item, index, onChange, onRemove, onIssue }) {
  const set = (patch) => onChange({ ...item, ...patch });
  // an empty field means „not known”; a value outside 0–100 is not taken
  const setPercent = (key, text) => { const next = toPercent(text); if (text.trim() === '' || next >= 0) set({ [key]: next }); };
  const suggestion = suggestedDocument(item);
  return <tr>
    <td><input className="field__input" aria-label={`Õppija ${index + 1} nimi`} value={item.name} maxLength={120} onChange={(event) => set({ name: event.target.value })} /></td>
    <td><input className="field__input" type="date" aria-label={`${item.name || `Õppija ${index + 1}`}: alustas`} value={item.startedOn} onChange={(event) => set({ startedOn: event.target.value })} /></td>
    <td><input className="field__input tr-percent" inputMode="numeric" aria-label={`${item.name || `Õppija ${index + 1}`}: osalus %`} value={percentText(item.attendancePct)} onChange={(event) => setPercent('attendancePct', event.target.value)} /></td>
    <td><input className="field__input tr-percent" inputMode="numeric" aria-label={`${item.name || `Õppija ${index + 1}`}: lõputest %`} value={percentText(item.finalTestPct)} onChange={(event) => setPercent('finalTestPct', event.target.value)} /></td>
    <td>{item.document
      ? <span className="tr-document"><Badge tone={item.document === 'tunnistus' ? 'success' : 'neutral'}>{DOCUMENTS[item.document]} nr {item.documentNumber}</Badge><small>{date(item.documentDate)}</small><button type="button" className="tr-link" onClick={() => set({ document: '', documentNumber: '', documentDate: '' })}>Võta tagasi</button></span>
      : suggestion
        ? <Button variant="secondary" onClick={() => onIssue(suggestion)}>Väljasta {DOCUMENTS[suggestion].toLowerCase()}</Button>
        : <small className="tr-muted">{item.attendancePct < 0 ? 'Osalus puudub' : 'Lõputest tegemata'}</small>}</td>
    <td><button type="button" className="tr-icon" aria-label={`Eemalda ${item.name || `õppija ${index + 1}`}`} onClick={onRemove}><Trash2 size={15} /></button></td>
  </tr>;
}

function CourseEditor({ initial, courses, students, groups, repository, today, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [pick, setPick] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [reading, setReading] = useState(false);
  const set = (patch) => setForm((current) => normalizeCourse(current.id, { ...current, ...patch }));
  const setParticipant = (index, next) => setForm((current) => ({ ...current, participants: current.participants.map((item, at) => (at === index ? { ...item, ...next } : item)) }));
  const chosen = new Set(form.participants.map((item) => item.studentId).filter(Boolean));
  const free = students.filter((student) => !chosen.has(student.id));
  const group = groups.find((item) => item.id === form.groupId);
  const add = (list) => setForm((current) => ({ ...current, participants: [...current.participants, ...list].slice(0, MAX_PARTICIPANTS) }));

  const setCurriculum = (key) => set({ curriculum: key, curriculumName: CURRICULA[key].name, contactHours: CURRICULA[key].contactHours || form.contactHours, independentHours: key === 'other' ? form.independentHours : CURRICULA[key].independentHours });
  const addGroup = () => add(group.students.filter((id) => !chosen.has(id)).map((id) => students.find((student) => student.id === id)).filter(Boolean).map(blankParticipant));
  const issue = (index, kind) => {
    const number = nextDocumentNumber([...courses.filter((course) => course.id !== form.id), normalizeCourse(form.id, form)], today.slice(0, 4));
    setParticipant(index, { document: kind, documentNumber: number, documentDate: today });
  };
  const readLessons = async () => {
    setReading(true); setError(''); setNote('');
    try {
      const lessons = await repository.lessonsOf(form.participants.map((item) => item.studentId));
      const next = withLessonAttendance(normalizeCourse(form.id, form), lessons, today);
      const filled = next.participants.filter((item, index) => item.attendancePct !== normalizeCourse(form.id, form).participants[index].attendancePct).length;
      setForm(next);
      setNote(filled ? `Osalus loetud tundide märgetest: ${filled} õppijal uuendatud.` : 'Selle perioodi tunnimärkeid ei leitud — osalus jäi muutmata.');
    } catch (failure) { setError(failure.message || 'Tunnimärkeid ei saanud lugeda.'); }
    setReading(false);
  };
  const save = async (event) => {
    event.preventDefault();
    const values = normalizeCourse(form.id, form);
    const problem = validateCourse(values);
    if (problem) { setError(problem); return; }
    setSaving(true); setError('');
    try { await onSave(values); } catch (failure) { setError(failure.message || 'Ei saanud salvestada.'); setSaving(false); }
  };

  return <Card className="tr-editor">
    <form onSubmit={save} aria-label="Kursus">
      <div className="section-heading tr-editor__head"><Button variant="secondary" disabled={saving} onClick={onCancel}><ArrowLeft size={15} /> Tagasi</Button><h2>{initial.id ? form.title || 'Kursus' : 'Uus kursus'}</h2></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="tr-grid">
        <Input label="Kursuse nimi *" id="tr-title" value={form.title} maxLength={120} placeholder="B1 õhtune rühm" onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <Select label="Õppekava" id="tr-curriculum" value={form.curriculum} onChange={(event) => setCurriculum(event.target.value)}>{Object.entries(CURRICULUM_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
        <Select label="Seis" id="tr-status" value={form.status} onChange={(event) => set({ status: event.target.value })}>{Object.entries(STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
      </div>
      <Input label="Õppekava nimetus (nagu tunnistusel) *" id="tr-curriculum-name" value={form.curriculumName} maxLength={200} onChange={(event) => setForm({ ...form, curriculumName: event.target.value })} />
      <div className="tr-grid">
        <Input label="Kontaktõpe (ak t) *" id="tr-contact" type="number" min="1" value={form.contactHours || ''} onChange={(event) => set({ contactHours: event.target.value })} />
        <Input label="Iseseisev töö (ak t)" id="tr-independent" type="number" min="0" value={form.independentHours || ''} onChange={(event) => set({ independentHours: event.target.value })} />
        <Input label="Algus *" id="tr-start" type="date" value={form.startDate} onChange={(event) => set({ startDate: event.target.value })} />
        <Input label="Lõpp" id="tr-end" type="date" value={form.endDate} onChange={(event) => set({ endDate: event.target.value })} />
        <Input label="Koolitaja" id="tr-teacher" value={form.teacherName} maxLength={120} onChange={(event) => setForm({ ...form, teacherName: event.target.value })} />
        <Select label="Grupp" id="tr-group" value={form.groupId} onChange={(event) => { const next = groups.find((item) => item.id === event.target.value); set({ groupId: event.target.value, teacherName: form.teacherName || next?.teacher || '' }); }}><option value="">— pole (individuaalõpe) —</option>{groups.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
      </div>

      <h3>Õppijad <small>{form.participants.length} · tunnistus: osalus vähemalt {MIN_ATTENDANCE} % ja lõputest vähemalt {MIN_FINAL_TEST} %</small></h3>
      {form.participants.length ? <div className="students-table-wrap"><table className="students-table tr-table">
        <thead><tr><th>Õppija</th><th>Alustas</th><th>Osalus %</th><th>Lõputest %</th><th>Dokument</th><th aria-label="Tegevus" /></tr></thead>
        <tbody>{form.participants.map((item, index) => <ParticipantRow key={index} item={item} index={index} onChange={(next) => setParticipant(index, next)} onIssue={(kind) => issue(index, kind)} onRemove={() => setForm({ ...form, participants: form.participants.filter((_, at) => at !== index) })} />)}</tbody>
      </table></div> : <p className="form-hint">Õppijaid ei ole veel lisatud.</p>}
      {note ? <p className="form-hint" role="status">{note}</p> : null}
      {form.participants.length < MAX_PARTICIPANTS ? <div className="tr-add">
        <Select label="Lisa õppija" id="tr-pick" value={pick} onChange={(event) => setPick(event.target.value)}><option value="">— vali õpilane —</option>{free.map((student) => <option key={student.id} value={student.id}>{student.name}{student.level ? ` · ${student.level}` : ''}</option>)}</Select>
        <Button variant="secondary" disabled={!pick} onClick={() => { add([blankParticipant(students.find((student) => student.id === pick))]); setPick(''); }}><Plus size={15} /> Lisa</Button>
        {group ? <Button variant="secondary" onClick={addGroup}><Users size={15} /> Lisa grupi õppijad</Button> : null}
        <Button variant="secondary" onClick={() => add([blankParticipant({ name: 'Uus õppija' })])}><Plus size={15} /> Lisa käsitsi</Button>
        <Button variant="secondary" disabled={!form.startDate || !chosen.size} loading={reading} onClick={readLessons}><RefreshCw size={15} /> Loe osalus tundidest</Button>
      </div> : null}

      <label className="tr-text"><span>Märkmed</span><textarea rows={2} maxLength={2000} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label>
      <div className="tr-actions"><Button type="submit" loading={saving}>Salvesta</Button><Button variant="secondary" disabled={saving} onClick={onCancel}>Loobu</Button></div>
    </form>
  </Card>;
}

export default function TrainingPage({ repository = trainingCoursesService, studentsRepository = studentsService, groupsRepository = groupsService, today = todayIso() }) {
  const { user } = useAuth();
  const [year, setYear] = useState(today.slice(0, 4));
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const [local, setLocal] = useState(null);
  const state = useAsyncData(async () => {
    const [courses, students, groups] = await Promise.all([
      repository.list(),
      studentsRepository.readList({ exhaustive: true }).then((result) => result.items || []).catch(() => []),
      groupsRepository.list().catch(() => []),
    ]);
    return { courses: courses.map((course) => normalizeCourse(course.id, course)), students, groups };
  }, [repository, studentsRepository, groupsRepository]);
  const courses = useMemo(() => sortCourses(local || state.data?.courses || []), [local, state.data]);
  const report = useMemo(() => yearReport(courses, year), [courses, year]);
  const years = useMemo(() => [...new Set([today.slice(0, 4), String(Number(today.slice(0, 4)) - 1), ...courses.map((course) => (course.endDate || course.startDate).slice(0, 4))])].filter(Boolean).sort().reverse(), [courses, today]);

  if (state.loading) return <LoadingState label="Laen kursusi…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const save = async (values) => {
    const saved = values.id ? await repository.update(courses.find((course) => course.id === values.id), values, user) : await repository.create(values, user);
    setLocal([...courses.filter((course) => course.id !== saved.id), normalizeCourse(saved.id, saved)]);
    setEditing(null);
    setNotice(`Salvestatud: ${saved.title}`);
  };
  const copyReport = async () => {
    try { await navigator.clipboard.writeText(reportText(report)); setNotice(`Aruanne ${year} kopeeritud.`); } catch { setNotice('Kopeerimine ei õnnestunud — vali arvud käsitsi.'); }
  };

  if (editing) return <div className="page-content training-page">
    <CourseEditor initial={editing} courses={courses} students={state.data.students} groups={state.data.groups} repository={repository} today={today} onSave={save} onCancel={() => setEditing(null)} />
  </div>;

  return <div className="page-content training-page">
    <PageHeader eyebrow="Täienduskoolitus" title="Kursused ja EHIS-e aruanne" description="Õppekavapõhised kursused, õppijate osalus ja lõputest, väljastatud tunnistused ja tõendid. Aasta tegevusnäitajad esitatakse EHIS-esse 31. märtsiks." actions={<Button onClick={() => { setNotice(''); setEditing(blankCourse()); }}><Plus size={17} /> Uus kursus</Button>} />
    {notice ? <div className="success-notice" role="status">{notice}<button aria-label="Sulge teade" onClick={() => setNotice('')}>×</button></div> : null}

    <Card className="tr-toolbar">
      <Select label="Aruandeaasta" id="tr-year" value={year} onChange={(event) => setYear(event.target.value)}>{years.map((value) => <option key={value} value={value}>{value}</option>)}</Select>
      <p className="form-hint">Arvesse lähevad kursused, mis lõppesid {year}. aastal ja on seisus „Lõppenud”.</p>
      <Button variant="secondary" onClick={copyReport}><ClipboardCopy size={15} /> Kopeeri aruanne</Button>
    </Card>
    <section className="metric-grid" aria-label={`Tegevusnäitajad ${year}`}>
      <Card className="metric-card metric-card--blue"><div className="metric-card__top"><span>Alustanud õppijaid</span><i><Users size={19} /></i></div><strong>{report.started}</strong><small>lõppenud kursustel</small></Card>
      <Card className="metric-card metric-card--green"><div className="metric-card__top"><span>Väljaantud tunnistusi</span><i><Award size={19} /></i></div><strong>{report.certificates}</strong><small>tõendeid {report.statements}</small></Card>
      <Card className="metric-card metric-card--purple"><div className="metric-card__top"><span>Lõppenud kursusi</span><i><CalendarCheck size={19} /></i></div><strong>{report.courses}</strong><small>käimas {report.running}</small></Card>
      <Card className="metric-card metric-card--amber"><div className="metric-card__top"><span>Vajab tegemist</span><i><ListChecks size={19} /></i></div><strong>{report.todo}</strong><small>õppijat ilma dokumendita</small></Card>
    </section>
    <Card className="tr-buckets" aria-label="Kursused mahu järgi">
      <strong>Kursused mahu järgi</strong>
      {BUCKETS.map(([key, label]) => <span key={key}>{label}: <b>{report.buckets[key]}</b></span>)}
    </Card>

    <Card className="tr-courses">
      {courses.length ? <div className="students-table-wrap"><table className="students-table tr-table">
        <thead><tr><th>Kursus</th><th>Maht</th><th>Õppijaid</th><th>Seis</th></tr></thead>
        <tbody>{courses.map((course) => {
          const todo = missingDocuments(course);
          return <tr key={course.id}>
            <td><button type="button" className="tr-open" onClick={() => { setNotice(''); setEditing(course); }}><strong>{course.title}</strong><span>{CURRICULUM_LABELS[course.curriculum]} · {period(course)}{course.teacherName ? ` · ${course.teacherName}` : ''}</span></button></td>
            <td>{totalHours(course)} ak t<span>kontakt {course.contactHours}</span></td>
            <td>{course.participants.length}</td>
            <td><Badge tone={TONE[course.status]}>{STATUSES[course.status]}</Badge>{todo ? <Badge tone="warning">{todo} ilma dokumendita</Badge> : null}</td>
          </tr>;
        })}</tbody>
      </table></div> : <EmptyState title="Kursusi ei ole veel" description="Lisa esimene kursus: õppekava, kuupäevad ja õppijad. Aruande arvud tekivad lõppenud kursustest." />}
    </Card>
  </div>;
}
