import { CalendarClock, Layers3, Pencil, Plus, Search, ShieldCheck, Trash2, UserPlus, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import PeopleOverview from '../../components/PeopleOverview.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService, studentsService, teachersService } from '../../services/firebase/index.js';
import { ROLES } from '../../utils/roles.js';
import SubjectSelect from '../students/SubjectSelect.jsx';
import GroupFillDialog from './GroupFillDialog.jsx';
import GroupContactsPanel from './GroupContactsPanel.jsx';
import GroupDetailDialog from './GroupDetailDialog.jsx';
import { AUDIENCES, capacityOf, freeSeats } from './groupFill.js';
import './groupFill.css';
import { localDate } from '../../utils/localDate.js';

const dayLabels = { Mon: 'Esmaspäev', Tue: 'Teisipäev', Wed: 'Kolmapäev', Thu: 'Neljapäev', Fri: 'Reede', Sat: 'Laupäev', Sun: 'Pühapäev' };
const dayShort = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const blankGroup = { name: '', teacherUid: '', subject: 'Eesti keel', level: 'A1', audience: '', capacity: '' };
const blankLesson = () => ({ day: 'Mon', time: '16:00', duration: '60', startDate: localDate() });
const DURATIONS = [30, 45, 60, 75, 90, 120];
const isArchived = (student) => student?.active === false;
const ArchivedBadge = () => <Badge tone="warning">Arhiveeritud</Badge>;

function assignedLessonIds(group, studentId) {
  const saved = group.studentLessonMap?.[studentId];
  return Array.isArray(saved) ? saved : group.lessons.map((lesson) => lesson.id);
}

export default function GroupsPage({ repository = groupsService, studentRepository = studentsService, teacherRepository = teachersService, contactsRepositories }) {
  const { user } = useAuth();
  const admin = user.roles.includes(ROLES.ADMIN);
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !admin;
  const [query, setQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [groupForm, setGroupForm] = useState(blankGroup);
  const [memberGroupId, setMemberGroupId] = useState('');
  const [fillGroupId, setFillGroupId] = useState('');
  const [openGroupId, setOpenGroupId] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [lessonGroupId, setLessonGroupId] = useState('');
  const [lessonForm, setLessonForm] = useState(blankLesson());
  const [editLessonId, setEditLessonId] = useState('');
  const [editGroupId, setEditGroupId] = useState('');
  const [editForm, setEditForm] = useState(null);
  const [archivedAsk, setArchivedAsk] = useState(null);
  const [saving, setSaving] = useState('');
  const [actionError, setActionError] = useState('');
  const [success, setSuccess] = useState('');

  const state = useAsyncData(async () => {
    const [groups, students, teachers] = await Promise.all([
      repository.list(teacherOnly ? { teacherUid: user.uid, teacherName: user.displayName } : {}),
      studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }),
      admin ? teacherRepository.list() : Promise.resolve([]),
    ]);
    // members taken from the former students (the group offer list) are archived cards: they must show in the group too
    const archived = await studentRepository.list({ status: 'archived', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }).then((result) => result.items || []).catch(() => []);
    return { groups, students: students.items.filter((student) => student.active && !student.convertedToParent), archived: archived.filter((student) => student.active === false), teachers: teachers.filter((teacher) => !teacher.disabled) };
  }, [admin, repository, studentRepository, teacherOnly, teacherRepository, user.displayName, user.uid]);

  const studentMap = useMemo(() => new Map([...(state.data?.archived || []), ...(state.data?.students || [])].map((student) => [student.id, student])), [state.data]);
  const visibleGroups = useMemo(() => (state.data?.groups || []).filter((group) => {
    const memberNames = group.students.map((id) => studentMap.get(id)?.name || '').join(' ');
    return `${group.name} ${group.teacher} ${group.subject} ${group.level} ${memberNames}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et'));
  }), [query, state.data, studentMap]);
  const memberGroup = state.data?.groups.find((group) => group.id === memberGroupId) || null;
  const lessonGroup = state.data?.groups.find((group) => group.id === lessonGroupId) || null;
  const fillGroup = state.data?.groups.find((group) => group.id === fillGroupId) || null;
  const openGroup = state.data?.groups.find((group) => group.id === openGroupId) || null;
  const editGroup = state.data?.groups.find((group) => group.id === editGroupId) || null;
  // „Halda”: active and archived cards in one list (admin bug 2026-11-03: archived students were sometimes there,
  // sometimes not) — active first, archived after them with the „Arhiveeritud” label
  const memberStudents = [...(state.data?.students || []), ...(state.data?.archived || [])].filter((student) => `${student.name} ${student.email || ''} ${student.level || ''}`.toLocaleLowerCase('et').includes(memberQuery.toLocaleLowerCase('et')));

  if (state.loading) return <LoadingState label="Laen gruppe…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const uniqueMemberCount = new Set(state.data.groups.flatMap((group) => group.students)).size;
  const lessonCount = state.data.groups.reduce((sum, group) => sum + group.lessons.length, 0);
  const readyGroups = state.data.groups.filter((group) => group.teacherUid && group.students.length && group.lessons.length).length;

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

  const changeMember = async (group, student, shouldAdd, { restore = false, confirmed = false } = {}) => {
    // an archived card can join a group; the admin chooses whether the card stays archived or is restored
    if (shouldAdd && isArchived(student) && !confirmed) { setArchivedAsk({ group, student }); return; }
    setSaving(`student:${student.id}`);
    setActionError('');
    try {
      await repository.setStudent(group, student, shouldAdd, user);
      if (restore && studentRepository.restore) await studentRepository.restore([student.id]);
      setSuccess(shouldAdd ? `${student.name} lisati gruppi.${isArchived(student) ? (restore ? ' Kaart taastati arhiivist.' : ' Kaart jääb arhiivi.') : ''}` : `${student.name} eemaldati grupist.`);
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Grupi koosseisu muutmine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const saveSettings = async (group, settings) => {
    setSaving('settings');
    setActionError('');
    try {
      await repository.updateSettings(group, settings, user);
      setSuccess('Grupi sihtrühm ja kohad salvestati.');
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Salvestamine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const openEdit = (group) => {
    setEditForm({ name: group.name, teacherUid: group.teacherUid || '', subject: group.subject, level: group.level, audience: group.audience || '', capacity: group.capacity ? String(group.capacity) : '', ageFrom: group.ageFrom || '', ageTo: group.ageTo || '', teacherFrom: localDate() });
    setEditGroupId(group.id);
    setActionError('');
  };
  const editTeachers = editGroup ? [...state.data.teachers, ...(editGroup.teacherUid && !state.data.teachers.some((teacher) => teacher.id === editGroup.teacherUid) ? [{ id: editGroup.teacherUid, name: editGroup.teacher || 'Praegune õpetaja' }] : [])] : [];
  const teacherChanged = Boolean(editGroup && editForm && editForm.teacherUid !== (editGroup.teacherUid || ''));
  const saveGroup = async (event) => {
    event.preventDefault();
    setSaving('edit');
    setActionError('');
    try {
      const teacher = editTeachers.find((item) => item.id === editForm.teacherUid);
      if (!teacher) throw new Error('Vali õpetaja.');
      const { teacherFrom, ...fields } = editForm;
      await repository.update(editGroup, { ...fields, teacher: teacher.name }, user, { students: [...state.data.students, ...state.data.archived], ...(teacherChanged ? { teacherFrom } : {}) });
      setEditGroupId('');
      setSuccess(teacherChanged ? `Grupp salvestati. ${teacher.name} annab tunde alates ${teacherFrom}; varasemad tunnid jäävad endisele õpetajale.` : 'Grupp salvestati.');
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Grupi salvestamine ebaõnnestus.');
    } finally {
      setSaving('');
    }
  };

  const addLesson = async (event) => {
    event.preventDefault();
    setSaving('lesson');
    setActionError('');
    try {
      const duration = Math.max(5, Math.round(Number(lessonForm.duration) || 60));
      if (editLessonId) await repository.patchLesson(lessonGroup, editLessonId, { duration }, user);
      else await repository.addLesson(lessonGroup, { ...lessonForm, duration }, user);
      setLessonGroupId('');
      setEditLessonId('');
      setLessonForm(blankLesson());
      setSuccess(editLessonId ? 'Tunni kestus muudeti.' : 'Grupi tunniaeg lisati.');
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

  // „Kinnita osalemine” in the group window: the card's group offer status (the same field as „Kellele pakkuda grupitunde”)
  const saveInterest = async (student, status) => {
    setSaving(`interest:${student.id}`);
    setActionError('');
    try {
      await studentRepository.saveGroupInterest(student.id, { ...(student.groupInterest || {}), status }, user);
      setSuccess(`${student.name}: ${status === 'interested' ? 'osalemine kinnitatud' : 'pakkumise olek salvestati'}.`);
      await state.reload();
    } catch (error) {
      setActionError(error.message || 'Salvestamine ebaõnnestus.');
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
    <PeopleOverview label="Gruppide kokkuvõte" eyebrow="Õppetöö ülevaade" title="Grupid ühes töölauas" description="Koosseisud, tunniajad ja vastutavad õpetajad on kohe nähtavad." metrics={[
      { icon: Layers3, label: 'Gruppe', value: state.data.groups.length, hint: teacherOnly ? 'sinu tööalas' : 'aktiivses vaates' },
      { icon: UsersRound, label: 'Õpilasi', value: uniqueMemberCount, hint: 'gruppides' },
      { icon: CalendarClock, label: 'Tunniaegu', value: lessonCount, hint: 'iganädalaselt' },
      { icon: ShieldCheck, label: 'Valmis grupid', value: readyGroups, hint: 'õpetaja, koosseis ja aeg' },
    ]} />
    {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
    {actionError ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge veateade" onClick={() => setActionError('')}>×</button></div> : null}
    <Card className="group-toolbar people-directory-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi gruppi" placeholder="Otsi grupi, õpetaja või õpilase järgi" value={query} onChange={(event) => setQuery(event.target.value)} /></div><strong>{visibleGroups.length} gruppi</strong></Card>

    {visibleGroups.length ? <div className="group-grid">{visibleGroups.map((group) => {
      const members = group.students.map((id) => studentMap.get(id)).filter(Boolean);
      return <Card className="group-card" key={group.id} data-entity="group" data-group-id={group.id} data-entity-title={group.name}>
        <header><i><Layers3 size={22} /></i><button type="button" className="group-card__open" data-entity-action="open" onClick={() => setOpenGroupId(group.id)} aria-label={`Ava grupp ${group.name}`}><h2>{group.name}</h2><span>{group.subject} · {group.level}</span></button>{admin ? <button className="text-button" aria-label={`Muuda gruppi ${group.name}`} data-entity-action="edit" onClick={() => openEdit(group)}><Pencil size={17} /></button> : null}{admin ? <button className="text-button danger" aria-label={`Kustuta ${group.name}`} disabled={saving === `group:${group.id}`} onClick={() => removeGroup(group)}><Trash2 size={18} /></button> : null}</header>
        <div className="group-card__stats"><div><UsersRound size={18} /><strong>{group.students.length}</strong><span>õpilast</span></div><div><CalendarClock size={18} /><strong>{group.lessons.length}</strong><span>tunniaega</span></div></div>
        <div className="group-card__seats"><Badge tone={freeSeats(group) ? 'info' : 'success'}>{group.students.length}/{capacityOf(group)} kohta</Badge>{group.audience ? <Badge tone="neutral">{AUDIENCES[group.audience]}{group.ageFrom || group.ageTo ? ` · ${group.ageFrom || '…'}–${group.ageTo || '…'} a` : ''}</Badge> : null}{admin ? <Button variant="secondary" data-entity-action="fill" onClick={() => setFillGroupId(group.id)}><UserPlus size={15} /> Täida</Button> : null}</div>
        <dl><div><dt>Õpetaja</dt><dd>{group.teacher || 'Määramata'}</dd></div><div><dt>Aine ja tase</dt><dd>{group.subject} · {group.level}</dd></div></dl>
        <section className="group-lessons"><div className="group-section-head"><strong>Tunniajad</strong>{admin ? <button onClick={() => { setLessonGroupId(group.id); setEditLessonId(''); setLessonForm(blankLesson()); }}><Plus size={15} /> Lisa aeg</button> : null}</div>{group.lessons.length ? group.lessons.map((lesson) => <div key={lesson.id}><span><b>{dayLabels[lesson.day] || lesson.day}</b><small>alates {lesson.startDate}</small></span><strong>{lesson.time}<small> · {lesson.duration || 60} min</small></strong>{admin ? <button aria-label={`Muuda ${group.name} tunni kestust (${dayLabels[lesson.day] || lesson.day} ${lesson.time})`} onClick={() => { setLessonGroupId(group.id); setEditLessonId(lesson.id); setLessonForm({ day: lesson.day, time: lesson.time, duration: String(lesson.duration || 60), startDate: lesson.startDate }); }}><Pencil size={13} /></button> : null}{admin ? <button aria-label={`Eemalda ${group.name} tunniaeg`} disabled={saving === `lesson:${lesson.id}`} onClick={() => removeLesson(group, lesson)}>×</button> : null}</div>) : <p>Tunniajad puuduvad.</p>}</section>
        <section className="group-members"><div className="group-section-head"><strong>Õpilased</strong>{admin ? <button onClick={() => { setMemberGroupId(group.id); setMemberQuery(''); }}><UserPlus size={15} /> Halda</button> : null}</div>{members.length ? <div>{members.slice(0, 6).map((student) => <Link to={`/students/${student.id}`} key={student.id}><span>{student.name}</span>{isArchived(student) ? <ArchivedBadge /> : null}<Badge tone="info">{student.level || '—'}</Badge></Link>)}{members.length > 6 ? <button type="button" className="link-button" onClick={() => setOpenGroupId(group.id)}>+{members.length - 6} õpilast · ava grupp</button> : null}</div> : <p>Õpilasi pole veel lisatud.</p>}</section>
      </Card>;
    })}</div> : <Card><EmptyState title="Gruppe ei leitud" description={query ? 'Muuda otsingut.' : admin ? 'Lisa esimene grupp, tunniajad ja õpilased.' : 'Sinu õpetajakontoga seotud gruppe ei ole.'} /></Card>}

    <Modal open={creating} title="Uus grupp" onClose={() => !saving && setCreating(false)} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setCreating(false)}>Loobu</Button><Button type="submit" form="group-form" loading={saving === 'create'}>Salvesta grupp</Button></>}>
      <form id="group-form" className="form-grid" onSubmit={createGroup}><Input id="group-name" className="form-grid__wide" label="Grupi nimi" value={groupForm.name} onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })} required /><Select id="group-teacher" label="Õpetaja" value={groupForm.teacherUid} onChange={(event) => setGroupForm({ ...groupForm, teacherUid: event.target.value })} required><option value="">Vali õpetaja</option>{state.data.teachers.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</Select><SubjectSelect id="group-subject" label="Õppeaine" value={groupForm.subject} onChange={(event) => setGroupForm({ ...groupForm, subject: event.target.value })} required /><Select id="group-level" label="Tase" value={groupForm.level} onChange={(event) => setGroupForm({ ...groupForm, level: event.target.value })}>{['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => <option key={level}>{level}</option>)}</Select><Select id="group-audience" label="Sihtrühm" value={groupForm.audience} onChange={(event) => setGroupForm({ ...groupForm, audience: event.target.value, ...(event.target.value === 'preschool' ? { ageFrom: 5, ageTo: 7, capacity: groupForm.capacity || 6 } : {}) })}><option value="">Kõik</option>{Object.entries(AUDIENCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select><Input id="group-capacity" label="Kohti" type="number" min="1" max="30" placeholder="8" value={groupForm.capacity} onChange={(event) => setGroupForm({ ...groupForm, capacity: event.target.value })} /></form>
    </Modal>

    <Modal open={Boolean(lessonGroup)} title={`${editLessonId ? 'Muuda tunni kestust' : 'Lisa tunniaeg'}: ${lessonGroup?.name || ''}`} onClose={() => !saving && setLessonGroupId('')} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setLessonGroupId('')}>Loobu</Button><Button type="submit" form="group-lesson-form" loading={saving === 'lesson'}>{editLessonId ? 'Salvesta kestus' : 'Lisa tunniaeg'}</Button></>}>
      <form id="group-lesson-form" className="form-grid" onSubmit={addLesson}><Select id="group-lesson-day" label="Nädalapäev" value={lessonForm.day} disabled={Boolean(editLessonId)} onChange={(event) => setLessonForm({ ...lessonForm, day: event.target.value })}>{Object.entries(dayLabels).map(([day, label]) => <option value={day} key={day}>{label}</option>)}</Select><Input id="group-lesson-time" label="Kellaaeg" type="time" value={lessonForm.time} disabled={Boolean(editLessonId)} onChange={(event) => setLessonForm({ ...lessonForm, time: event.target.value })} required /><Input id="group-lesson-duration" label="Kestus (min)" type="number" min="5" max="480" step="5" list="group-lesson-durations" value={lessonForm.duration} onChange={(event) => setLessonForm({ ...lessonForm, duration: event.target.value })} required /><datalist id="group-lesson-durations">{DURATIONS.map((minutes) => <option key={minutes} value={minutes} />)}</datalist>{editLessonId ? null : <Input id="group-lesson-start" label="Alguskuupäev" type="date" value={lessonForm.startDate} onChange={(event) => setLessonForm({ ...lessonForm, startDate: event.target.value })} required />}{editLessonId ? <p className="form-hint form-grid__wide">Uus kestus kehtib selle tunniaja kõigile tundidele. Juba märgitud tunnid jäävad oma kestusega. Päeva või kellaaega muuda kalendris lohistades.</p> : null}</form>
    </Modal>

    <Modal open={Boolean(editGroup && editForm)} title={`Muuda gruppi: ${editGroup?.name || ''}`} onClose={() => !saving && setEditGroupId('')} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setEditGroupId('')}>Loobu</Button><Button type="submit" form="group-edit-form" loading={saving === 'edit'}>Salvesta muudatused</Button></>}>
      {editGroup && editForm ? <form id="group-edit-form" className="form-grid" onSubmit={saveGroup}>
        <Input id="group-edit-name" className="form-grid__wide" label="Grupi nimi" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} required />
        <Select id="group-edit-teacher" label="Õpetaja" value={editForm.teacherUid} onChange={(event) => setEditForm({ ...editForm, teacherUid: event.target.value })} required><option value="">Vali õpetaja</option>{editTeachers.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</Select>
        {teacherChanged ? <Input id="group-edit-teacher-from" label="Uus õpetaja alates" type="date" value={editForm.teacherFrom} onChange={(event) => setEditForm({ ...editForm, teacherFrom: event.target.value })} required /> : null}
        <SubjectSelect id="group-edit-subject" label="Õppeaine" value={editForm.subject} onChange={(event) => setEditForm({ ...editForm, subject: event.target.value })} required />
        <Select id="group-edit-level" label="Tase" value={editForm.level} onChange={(event) => setEditForm({ ...editForm, level: event.target.value })}>{['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => <option key={level}>{level}</option>)}</Select>
        <Select id="group-edit-audience" label="Sihtrühm" value={editForm.audience} onChange={(event) => setEditForm({ ...editForm, audience: event.target.value })}><option value="">Kõik</option>{Object.entries(AUDIENCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
        <Input id="group-edit-capacity" label="Kohti" type="number" min="1" max="30" placeholder="8" value={editForm.capacity} onChange={(event) => setEditForm({ ...editForm, capacity: event.target.value })} />
        {teacherChanged && editGroup.lessons.length ? <p className="form-hint form-grid__wide">Tunnid alates {editForm.teacherFrom || '…'} lähevad uuele õpetajale (kalender, kohalolu, aruanded). Varasemad tunnid jäävad endisele õpetajale; juba märgitud tunnid ei muutu.</p> : null}
        {editForm.name.trim() !== editGroup.name ? <p className="form-hint form-grid__wide">Uus nimi kirjutatakse ka grupi õpilaste kaartidele. Juba märgitud tunnid jäävad vana nimega.</p> : null}
      </form> : null}
    </Modal>

    {admin ? <GroupContactsPanel groups={state.data.groups} user={user} saving={saving} {...(contactsRepositories ? { repositories: contactsRepositories } : {})}
      onAddToGroup={async (group, student) => { await repository.setStudent(group, student, true, user); await state.reload(); }} /> : null}

    {openGroup ? <GroupDetailDialog group={openGroup} members={openGroup.students.map((id) => studentMap.get(id)).filter(Boolean)} saving={saving} canEdit={admin}
      onEdit={() => { setOpenGroupId(''); openEdit(openGroup); }} onInterest={admin && studentRepository.saveGroupInterest ? saveInterest : undefined}
      onRemove={(student) => changeMember(openGroup, student, false)} onFill={() => { setOpenGroupId(''); setFillGroupId(openGroup.id); }} onClose={() => setOpenGroupId('')} /> : null}

    {fillGroup ? <GroupFillDialog group={fillGroup} groups={state.data.groups} students={state.data.students} saving={saving}
      onAdd={(studentId) => { const student = studentMap.get(studentId); if (student) changeMember(fillGroup, student, true); }}
      onSaveSettings={(settings) => saveSettings(fillGroup, settings)} onClose={() => setFillGroupId('')} /> : null}

    <Modal open={Boolean(memberGroup)} title={`Grupi õpilased: ${memberGroup?.name || ''}`} onClose={() => !saving && setMemberGroupId('')} className="modal--group-members" footer={<Button variant="secondary" disabled={Boolean(saving)} onClick={() => setMemberGroupId('')}>Valmis</Button>}>
      {memberGroup ? <div className="group-member-manager"><div className="search-field"><Search size={17} /><input aria-label="Otsi õpilast gruppi" placeholder="Otsi õpilast" value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} /></div><div>{memberStudents.map((student) => {
        const selected = memberGroup.students.includes(student.id);
        const selectedLessons = assignedLessonIds(memberGroup, student.id);
        return <section className={selected ? 'is-member' : ''} key={student.id}><label><input type="checkbox" checked={selected} disabled={Boolean(saving)} onChange={(event) => changeMember(memberGroup, student, event.target.checked)} /><span><strong>{student.name} {isArchived(student) ? <ArchivedBadge /> : null}</strong><small>{[student.level, student.teacher, student.group].filter(Boolean).join(' · ') || 'Õppeinfo puudub'}</small></span></label>{selected && memberGroup.lessons.length ? <div>{memberGroup.lessons.map((lesson) => <label key={lesson.id}><input type="checkbox" checked={selectedLessons.includes(lesson.id)} disabled={Boolean(saving)} onChange={(event) => changeStudentLesson(memberGroup, student.id, lesson.id, event.target.checked)} /><span>{dayShort[lesson.day]} {lesson.time}</span></label>)}</div> : null}</section>;
      })}{!memberStudents.length ? <EmptyState title="Õpilasi ei leitud" /> : null}</div></div> : null}
    </Modal>

    {/* after „Halda”, so it opens on top of it */}
    <Modal open={Boolean(archivedAsk)} title="Arhiveeritud õpilane" onClose={() => setArchivedAsk(null)} footer={<><Button variant="secondary" onClick={() => setArchivedAsk(null)}>Loobu</Button><Button variant="secondary" onClick={() => { const ask = archivedAsk; setArchivedAsk(null); changeMember(ask.group, ask.student, true, { confirmed: true }); }}>Lisa, kaart jääb arhiivi</Button>{studentRepository.restore ? <Button onClick={() => { const ask = archivedAsk; setArchivedAsk(null); changeMember(ask.group, ask.student, true, { confirmed: true, restore: true }); }}>Lisa ja taasta kaart</Button> : null}</>}>
      {archivedAsk ? <p><b>{archivedAsk.student.name}</b> on arhiivis. Kas lisada ta gruppi „{archivedAsk.group.name}”? Arhiivis kaart on grupis märgitud „Arhiveeritud”, kuni see taastatakse; taastatud kaart on taas õpilaste nimekirjas ja kuuarvetes.</p> : null}
    </Modal>
  </div>;
}
