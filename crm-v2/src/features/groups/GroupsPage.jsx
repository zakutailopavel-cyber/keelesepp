import { CalendarClock, Layers3, Plus, Search, Trash2, UserPlus, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService, studentsService, teachersService } from '../../services/firebase/index.js';
import { ROLES } from '../../utils/roles.js';

const dayLabels = { Mon: 'Esmaspäev', Tue: 'Teisipäev', Wed: 'Kolmapäev', Thu: 'Neljapäev', Fri: 'Reede', Sat: 'Laupäev', Sun: 'Pühapäev' };
const dayShort = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const blankGroup = { name: '', teacherUid: '', subject: 'Eesti keel', level: 'A1' };
const blankLesson = () => ({ day: 'Mon', time: '16:00', startDate: new Date().toISOString().slice(0, 10) });

function assignedLessonIds(group, studentId) {
  const saved = group.studentLessonMap?.[studentId];
  return Array.isArray(saved) ? saved : group.lessons.map((lesson) => lesson.id);
}

export default function GroupsPage({ repository = groupsService, studentRepository = studentsService, teacherRepository = teachersService }) {
  const { user } = useAuth();
  const admin = user.roles.includes(ROLES.ADMIN);
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !admin;
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [groupForm, setGroupForm] = useState(blankGroup);
  const [memberGroupId, setMemberGroupId] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [lessonGroupId, setLessonGroupId] = useState('');
  const [lessonForm, setLessonForm] = useState(blankLesson());
  const [saving, setSaving] = useState('');
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  const state = useAsyncData(async () => {
    const [groups, students, teachers] = await Promise.all([
      repository.list(teacherOnly ? { teacherUid: user.uid, teacherName: user.displayName } : {}),
      studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }),
      admin ? teacherRepository.list() : Promise.resolve([]),
    ]);
    return { groups, students: students.items.filter((student) => student.active && !student.convertedToParent), teachers: teachers.filter((teacher) => !teacher.disabled) };
  }, [admin, repository, studentRepository, teacherOnly, teacherRepository, user.displayName, user.uid]);

  const studentMap = useMemo(() => new Map((state.data?.students || []).map((student) => [student.id, student])), [state.data]);
  const visibleGroups = useMemo(() => (state.data?.groups || []).filter((group) => {
    const memberNames = group.students.map((id) => studentMap.get(id)?.name || '').join(' ');
    return `${group.name} ${group.teacher} ${group.subject} ${group.level} ${memberNames}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'));
  }), [query, state.data, studentMap]);
  const memberGroup = state.data?.groups.find((group) => group.id === memberGroupId) || null;
  const lessonGroup = state.data?.groups.find((group) => group.id === lessonGroupId) || null;
  const memberStudents = (state.data?.students || []).filter((student) => `${student.name} ${student.email || ''} ${student.level || ''}`.toLocaleLowerCase('et').includes(memberQuery.toLocaleLowerCase('et')));

  if (state.loading) return <LoadingState label="Laen gruppe…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const openCreate = () => {
    const teacher = state.data.teachers[0];
    setGroupForm({ ...blankGroup, teacherUid: teacher?.id || '' });
    setCreating(true);
    setActionError('');
  };

  const createGroup = async (event) => {
    event.preventDefault();
    setSaving('create');
    setActionError('');
    try {
      const teacher = state.data.teachers.find((item) => item.id === groupForm.teacherUid);
      if (!teacher) throw new Error('Vali õpetaja.');
      await repository.create({ ...groupForm, teacher: teacher.name }, user);
      setCreating(false);
      setSuccess('Grupp lisati.');
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Grupi lisamine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const changeMember = async (group, student, shouldAdd) => {
    setSaving(`student:${student.id}`);
    setActionError('');
    try {
      await repository.setStudent(group, student, shouldAdd, user);
      setSuccess(shouldAdd ? `${student.name} lisati gruppi.` : `${student.name} eemaldati grupist.`);
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Grupi koosseisu muutmine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const addLesson = async (event) => {
    event.preventDefault();
    setSaving('lesson');
    setActionError('');
    try {
      await repository.addLesson(lessonGroup, lessonForm, user);
      setLessonGroupId('');
      setLessonForm(blankLesson());
      setSuccess('Grupi tunniaeg lisati.');
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Tunniaja lisamine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const removeLesson = async (group, lesson) => {
    if (!window.confirm(`Kas eemaldada ${dayLabels[lesson.day]} kell ${lesson.time}?`)) return;
    setSaving(`lesson:${lesson.id}`);
    try {
      await repository.removeLesson(group, lesson.id, user);
      setSuccess('Grupi tunniaeg eemaldati.');
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Tunniaja eemaldamine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const removeGroup = async (group) => {
    if (!window.confirm(`Kas kustutada grupp „${group.name}”? Õpilasi ei kustutata.`)) return;
    setSaving(`group:${group.id}`);
    try {
      await repository.remove(group, state.data.students, user);
      setSuccess('Grupp kustutati.');
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Grupi kustutamine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const changeStudentLesson = async (group, studentId, lessonId, checked) => {
    setSaving(`student-lesson:${studentId}:${lessonId}`);
    try {
      await repository.setStudentLesson(group, studentId, lessonId, checked, user);
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Õpilase tunniseose muutmine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  return <div className="page-content">
    <PageHeader eyebrow="Õppetöö" title="Grupid" description="Grupi koosseis, õpetaja ja iganädalane tunniplaan." actions={admin ? <Button onClick={openCreate}><Plus size={18} /> Lisa grupp</Button> : null} />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge veateade" onClick={() => setActionError('')}>×</button></div> : null}
    <Card className="group-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi gruppi" placeholder="Otsi grupi, õpetaja või õpilase järgi" value={query} onChange={(event) => setQuery(event.target.value)} /></div><strong>{visibleGroups.length} gruppi</strong></Card>

    {visibleGroups.length ? <div className="group-grid">{visibleGroups.map((group) => {
      const members = group.students.map((id) => studentMap.get(id)).filter(Boolean);
      return <Card className="group-card" key={group.id}>
        <header><i><Layers3 size={22} /></i><div><h2>{group.name}</h2><span>{group.subject} · {group.level}</span></div>{admin ? <button className="text-button danger" aria-label={`Kustuta ${group.name}`} disabled={saving === `group:${group.id}`} onClick={() => removeGroup(group)}><Trash2 size={18} /></button> : null}</header>
        <div className="group-card__stats"><div><UsersRound size={18} /><strong>{group.students.length}</strong><span>õpilast</span></div><div><CalendarClock size={18} /><strong>{group.lessons.length}</strong><span>tunniaega</span></div></div>
        <dl><div><dt>Õpetaja</dt><dd>{group.teacher || 'Määramata'}</dd></div><div><dt>Aine ja tase</dt><dd>{group.subject} · {group.level}</dd></div></dl>
        <section className="group-lessons"><div className="group-section-head"><strong>Tunniajad</strong>{admin ? <button onClick={() => { setLessonGroupId(group.id); setLessonForm(blankLesson()); }}><Plus size={15} /> Lisa aeg</button> : null}</div>{group.lessons.length ? group.lessons.map((lesson) => <div key={lesson.id}><span><b>{dayLabels[lesson.day] || lesson.day}</b><small>alates {lesson.startDate}</small></span><strong>{lesson.time}</strong>{admin ? <button aria-label={`Eemalda ${group.name} tunniaeg`} disabled={saving === `lesson:${lesson.id}`} onClick={() => removeLesson(group, lesson)}>×</button> : null}</div>) : <p>Tunniajad puuduvad.</p>}</section>
        <section className="group-members"><div className="group-section-head"><strong>Õpilased</strong>{admin ? <button onClick={() => { setMemberGroupId(group.id); setMemberQuery(''); }}><UserPlus size={15} /> Halda</button> : null}</div>{members.length ? <div>{members.slice(0, 6).map((student) => <Link to={`/students/${student.id}`} key={student.id}><span>{student.name}</span><Badge tone="info">{student.level || '—'}</Badge></Link>)}{members.length > 6 ? <small>+{members.length - 6} õpilast</small> : null}</div> : <p>Õpilasi pole veel lisatud.</p>}</section>
      </Card>;
    })}</div> : <Card><EmptyState title="Gruppe ei leitud" description={query ? 'Muuda otsingut.' : admin ? 'Lisa esimene grupp, tunniajad ja õpilased.' : 'Sinu õpetajakontoga seotud gruppe ei ole.'} /></Card>}

    <Modal open={creating} title="Uus grupp" onClose={() => !saving && setCreating(false)} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setCreating(false)}>Loobu</Button><Button type="submit" form="group-form" loading={saving === 'create'}>Salvesta grupp</Button></>}>
      <form id="group-form" className="form-grid" onSubmit={createGroup}><Input id="group-name" className="form-grid__wide" label="Grupi nimi" value={groupForm.name} onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })} required /><Select id="group-teacher" label="Õpetaja" value={groupForm.teacherUid} onChange={(event) => setGroupForm({ ...groupForm, teacherUid: event.target.value })} required><option value="">Vali õpetaja</option>{state.data.teachers.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</Select><Input id="group-subject" label="Õppeaine" value={groupForm.subject} onChange={(event) => setGroupForm({ ...groupForm, subject: event.target.value })} required /><Select id="group-level" label="Tase" value={groupForm.level} onChange={(event) => setGroupForm({ ...groupForm, level: event.target.value })}>{['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => <option key={level}>{level}</option>)}</Select></form>
    </Modal>

    <Modal open={Boolean(lessonGroup)} title={`Lisa tunniaeg: ${lessonGroup?.name || ''}`} onClose={() => !saving && setLessonGroupId('')} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setLessonGroupId('')}>Loobu</Button><Button type="submit" form="group-lesson-form" loading={saving === 'lesson'}>Lisa tunniaeg</Button></>}>
      <form id="group-lesson-form" className="form-grid" onSubmit={addLesson}><Select id="group-lesson-day" label="Nädalapäev" value={lessonForm.day} onChange={(event) => setLessonForm({ ...lessonForm, day: event.target.value })}>{Object.entries(dayLabels).map(([day, label]) => <option value={day} key={day}>{label}</option>)}</Select><Input id="group-lesson-time" label="Kellaaeg" type="time" value={lessonForm.time} onChange={(event) => setLessonForm({ ...lessonForm, time: event.target.value })} required /><Input id="group-lesson-start" className="form-grid__wide" label="Alguskuupäev" type="date" value={lessonForm.startDate} onChange={(event) => setLessonForm({ ...lessonForm, startDate: event.target.value })} required /></form>
    </Modal>

    <Modal open={Boolean(memberGroup)} title={`Grupi õpilased: ${memberGroup?.name || ''}`} onClose={() => !saving && setMemberGroupId('')} className="modal--group-members" footer={<Button variant="secondary" disabled={Boolean(saving)} onClick={() => setMemberGroupId('')}>Valmis</Button>}>
      {memberGroup ? <div className="group-member-manager"><div className="search-field"><Search size={17} /><input aria-label="Otsi õpilast gruppi" placeholder="Otsi õpilast" value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} /></div><div>{memberStudents.map((student) => {
        const selected = memberGroup.students.includes(student.id);
        const selectedLessons = assignedLessonIds(memberGroup, student.id);
        return <section className={selected ? 'is-member' : ''} key={student.id}><label><input type="checkbox" checked={selected} disabled={Boolean(saving)} onChange={(event) => changeMember(memberGroup, student, event.target.checked)} /><span><strong>{student.name}</strong><small>{[student.level, student.teacher, student.group].filter(Boolean).join(' · ') || 'Õppeinfo puudub'}</small></span></label>{selected && memberGroup.lessons.length ? <div>{memberGroup.lessons.map((lesson) => <label key={lesson.id}><input type="checkbox" checked={selectedLessons.includes(lesson.id)} disabled={Boolean(saving)} onChange={(event) => changeStudentLesson(memberGroup, student.id, lesson.id, event.target.checked)} /><span>{dayShort[lesson.day]} {lesson.time}</span></label>)}</div> : null}</section>;
      })}{!memberStudents.length ? <EmptyState title="Õpilasi ei leitud" /> : null}</div></div> : null}
    </Modal>
  </div>;
}
