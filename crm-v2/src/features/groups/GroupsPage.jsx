import { askConfirm } from '../../components/ui/ConfirmHost.jsx';
import { CalendarClock, Layers3, Pencil, Plus, Search, ShieldCheck, Trash2, UserPlus, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import PeopleOverview from '../../components/PeopleOverview.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService } from '../../services/firebase/groups.js';
import { studentsService } from '../../services/firebase/students.js';
import { teachersService } from '../../services/firebase/teachers.js';
import { ROLES } from '../../utils/roles.js';
import SubjectSelect from '../students/SubjectSelect.jsx';
import GroupFillDialog from './GroupFillDialog.jsx';
import GroupContactsPanel from './GroupContactsPanel.jsx';
import GroupDetailDialog from './GroupDetailDialog.jsx';
import { AUDIENCES, capacityOf, freeSeats } from './groupFill.js';
import { CUSTOM_DURATION, DURATION_PRESETS, GROUP_HELP, LEVELS, durationChoice, groupFormError, lessonDuration } from './groupForm.js';
import './groupFill.css';
import { localDate } from '../../utils/localDate.js';

const dayLabels = { Mon: 'Esmaspäev', Tue: 'Teisipäev', Wed: 'Kolmapäev', Thu: 'Neljapäev', Fri: 'Reede', Sat: 'Laupäev', Sun: 'Pühapäev' };
const dayShort = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const blankGroup = { name: '', teacherUid: '', subject: 'Eesti keel', level: 'A1', audience: '', capacity: '', ageFrom: '', ageTo: '' };
const blankLesson = () => ({ day: 'Mon', time: '16:00', duration: '60', durationChoice: '60', startDate: localDate() });
const isArchived = (student) => student?.active === false;
const ArchivedBadge = () => <Badge tone="warning">Arhiveeritud</Badge>;
const lower = (value) => String(value ?? '').toLocaleLowerCase('et');
// „Halda” search: the same fields for active and archived cards (admin bug: archived ones were found only sometimes)
const memberText = (student) => lower([student.name, student.email, student.parentName, student.parentEmail, student.phone, student.parentPhone, student.level].filter(Boolean).join(' '));
const help = (key) => ({ help: GROUP_HELP[key].text, helpExample: GROUP_HELP[key].example });

// the fields of a group, the same for „Uus grupp” and „Muuda gruppi” (one validation: groupForm.js groupFormError)
function GroupFields({ prefix, form, onChange, teachers, teacherChanged = false }) {
  const set = (patch) => onChange({ ...form, ...patch });
  const withAge = form.audience && form.audience !== 'adult';
  return <>
    <Input id={`${prefix}-name`} className="form-grid__wide" label="Grupi nimi" maxLength={120} placeholder="nt Eesti keel B1 · teisipäev 18:00" value={form.name} onChange={(event) => set({ name: event.target.value })} required {...help('name')} />
    <Select id={`${prefix}-teacher`} label="Õpetaja" value={form.teacherUid} onChange={(event) => set({ teacherUid: event.target.value })} required {...help('teacher')}><option value="">Vali õpetaja</option>{teachers.map((teacher) => <option value={teacher.id} key={teacher.id}>{teacher.name}</option>)}</Select>
    {teacherChanged ? <Input id={`${prefix}-teacher-from`} label="Uus õpetaja alates" type="date" value={form.teacherFrom} onChange={(event) => set({ teacherFrom: event.target.value })} required {...help('teacherFrom')} /> : null}
    <SubjectSelect id={`${prefix}-subject`} label="Õppeaine" value={form.subject} onChange={(event) => set({ subject: event.target.value })} required {...help('subject')} />
    <Select id={`${prefix}-level`} label="Tase" value={form.level} onChange={(event) => set({ level: event.target.value })} {...help('level')}>{[...new Set([...LEVELS, form.level].filter(Boolean))].map((level) => <option key={level}>{level}</option>)}</Select>
    <Select id={`${prefix}-audience`} label="Sihtrühm" value={form.audience} onChange={(event) => set({ audience: event.target.value, ...(event.target.value === 'preschool' && !form.ageFrom && !form.ageTo ? { ageFrom: 5, ageTo: 7, capacity: form.capacity || 6 } : {}) })} {...help('audience')}><option value="">Kõik</option>{Object.entries(AUDIENCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
    <Input id={`${prefix}-capacity`} label="Kohti" type="number" min="1" max="30" step="1" placeholder="8" value={form.capacity} onChange={(event) => set({ capacity: event.target.value })} {...help('capacity')} />
    {withAge ? <Input id={`${prefix}-age-from`} label="Vanus alates" type="number" min="3" max="18" step="1" value={form.ageFrom ?? ''} onChange={(event) => set({ ageFrom: event.target.value })} {...help('ageFrom')} /> : null}
    {withAge ? <Input id={`${prefix}-age-to`} label="Vanus kuni" type="number" min="3" max="18" step="1" value={form.ageTo ?? ''} onChange={(event) => set({ ageTo: event.target.value })} {...help('ageTo')} /> : null}
  </>;
}

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
    // a failed archive read is said out loud in „Halda” (it used to be swallowed: archived students were then simply
    // missing — „sometimes there, sometimes not”)
    let archivedError = '';
    const archived = await studentRepository.list({ status: 'archived', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) })
      .then((result) => result.items || [])
      .catch(() => { archivedError = 'Arhiveeritud õpilasi ei õnnestunud laadida. Proovi lehte värskendada.'; return []; });
    const activeIds = new Set(students.items.map((student) => student.id));
    return {
      groups,
      students: students.items.filter((student) => student.active && !student.convertedToParent),
      archived: archived.filter((student) => student.active === false && !student.convertedToParent && !activeIds.has(student.id)),
      archivedError,
      teachers: teachers.filter((teacher) => !teacher.disabled),
    };
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
  // „Halda”: active and archived cards, the archived ones under their own „Arhiveeritud” header (admin bug
  // 2026-11-03 / 2026-11-06: archived students were sometimes there, sometimes not); one search for both
  const memberMatch = (student) => memberText(student).includes(lower(memberQuery.trim()));
  const memberActive = (state.data?.students || []).filter(memberMatch);
  const memberArchived = (state.data?.archived || []).filter(memberMatch);

  // a reload after a save keeps the page (and the open window) on screen: replacing everything with „Laen…” closed
  // and reopened the windows, so a click looked as if nothing happened
  if (!state.data) {
    if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
    return <LoadingState label="Laen gruppe…" />;
  }

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
      const problem = groupFormError(groupForm, { teachers: state.data.teachers });
      if (problem) throw new Error(problem);
      const teacher = state.data.teachers.find((item) => item.id === groupForm.teacherUid);
      await repository.create({ ...groupForm, name: groupForm.name.trim(), teacher: teacher.name }, user);
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
    setEditForm({ name: group.name, teacherUid: group.teacherUid || '', subject: group.subject, level: group.level, audience: group.audience || '', capacity: group.capacity ? String(group.capacity) : '', ageFrom: group.ageFrom ? String(group.ageFrom) : '', ageTo: group.ageTo ? String(group.ageTo) : '', teacherFrom: localDate() });
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
      const problem = groupFormError(editForm, { teachers: editTeachers, teacherChanged });
      if (problem) throw new Error(problem);
      const teacher = editTeachers.find((item) => item.id === editForm.teacherUid);
      const { teacherFrom, ...fields } = editForm;
      await repository.update(editGroup, { ...fields, name: fields.name.trim(), teacher: teacher.name }, user, { students: [...state.data.students, ...state.data.archived], ...(teacherChanged ? { teacherFrom } : {}) });
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
      const { minutes: duration, error } = lessonDuration(lessonForm.durationChoice === CUSTOM_DURATION ? lessonForm.duration : lessonForm.durationChoice);
      if (error) throw new Error(error);
      if (!editLessonId && !/^\d{2}:\d{2}$/.test(lessonForm.time || '')) throw new Error('Sisesta tunni kellaaeg.');
      if (!editLessonId && !/^\d{4}-\d{2}-\d{2}$/.test(lessonForm.startDate || '')) throw new Error('Vali alguskuupäev.');
      if (editLessonId) await repository.patchLesson(lessonGroup, editLessonId, { duration }, user);
      else await repository.addLesson(lessonGroup, { day: lessonForm.day, time: lessonForm.time, startDate: lessonForm.startDate, duration }, user);
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
    if (!(await askConfirm(`Kas eemaldada ${dayLabels[lesson.day]} kell ${lesson.time}?`))) return;
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
    if (!(await askConfirm(`Kas kustutada grupp „${group.name}”? Õpilasi ei kustutata.`))) return;
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

  // a save error inside an open form shows in that form (the page notice was hidden behind the window)
  const formOpen = creating || Boolean(lessonGroup) || Boolean(editGroup && editForm) || Boolean(memberGroup);
  const formError = actionError ? <p className="form-error form-grid__wide" role="alert">{actionError}</p> : null;
  const memberRow = (group, student) => {
    const selected = group.students.includes(student.id);
    const selectedLessons = assignedLessonIds(group, student.id);
    return <section className={selected ? 'is-member' : ''} key={student.id}><label><input type="checkbox" checked={selected} disabled={Boolean(saving)} onChange={(event) => changeMember(group, student, event.target.checked)} /><span><strong>{student.name} {isArchived(student) ? <ArchivedBadge /> : null}</strong><small>{[student.level, student.teacher, student.group].filter(Boolean).join(' · ') || 'Õppeinfo puudub'}</small></span></label>{selected && group.lessons.length ? <div>{group.lessons.map((lesson) => <label key={lesson.id}><input type="checkbox" checked={selectedLessons.includes(lesson.id)} disabled={Boolean(saving)} onChange={(event) => changeStudentLesson(group, student.id, lesson.id, event.target.checked)} /><span>{dayShort[lesson.day]} {lesson.time}</span></label>)}</div> : null}</section>;
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
    {actionError && !formOpen ? <div className="action-error" role="alert">{actionError}<button aria-label="Sulge veateade" onClick={() => setActionError('')}>×</button></div> : null}
    <Card className="group-toolbar people-directory-toolbar"><div className="search-field"><Search size={18} /><input aria-label="Otsi gruppi" placeholder="Otsi grupi, õpetaja või õpilase järgi" value={query} onChange={(event) => setQuery(event.target.value)} /></div><strong>{visibleGroups.length} gruppi</strong></Card>

    {visibleGroups.length ? <div className="group-grid">{visibleGroups.map((group) => {
      const members = group.students.map((id) => studentMap.get(id)).filter(Boolean);
      return <Card className="group-card" key={group.id} data-entity="group" data-group-id={group.id} data-entity-title={group.name}>
        <header><i><Layers3 size={22} /></i><button type="button" className="group-card__open" data-entity-action="open" onClick={() => setOpenGroupId(group.id)} aria-label={`Ava grupp ${group.name}`}><h2>{group.name}</h2><span>{group.subject} · {group.level}</span></button>{admin ? <button className="text-button" aria-label={`Muuda gruppi ${group.name}`} data-entity-action="edit" onClick={() => openEdit(group)}><Pencil size={17} /></button> : null}{admin ? <button className="text-button danger" aria-label={`Kustuta ${group.name}`} disabled={saving === `group:${group.id}`} onClick={() => removeGroup(group)}><Trash2 size={18} /></button> : null}</header>
        <div className="group-card__stats"><div><UsersRound size={18} /><strong>{group.students.length}</strong><span>õpilast</span></div><div><CalendarClock size={18} /><strong>{group.lessons.length}</strong><span>tunniaega</span></div></div>
        <div className="group-card__seats"><Badge tone={freeSeats(group) ? 'info' : 'success'}>{group.students.length}/{capacityOf(group)} kohta</Badge>{group.audience ? <Badge tone="neutral">{AUDIENCES[group.audience]}{group.ageFrom || group.ageTo ? ` · ${group.ageFrom || '…'}–${group.ageTo || '…'} a` : ''}</Badge> : null}{admin ? <Button variant="secondary" data-entity-action="fill" onClick={() => setFillGroupId(group.id)}><UserPlus size={15} /> Täida</Button> : null}</div>
        <dl><div><dt>Õpetaja</dt><dd>{group.teacher || 'Määramata'}</dd></div><div><dt>Aine ja tase</dt><dd>{group.subject} · {group.level}</dd></div></dl>
        <section className="group-lessons"><div className="group-section-head"><strong>Tunniajad</strong>{admin ? <button onClick={() => { setLessonGroupId(group.id); setEditLessonId(''); setLessonForm(blankLesson()); setActionError(''); }}><Plus size={15} /> Lisa aeg</button> : null}</div>{group.lessons.length ? group.lessons.map((lesson) => <div key={lesson.id}><span><b>{dayLabels[lesson.day] || lesson.day}</b><small>alates {lesson.startDate}</small></span><strong>{lesson.time}<small> · {lesson.duration || 60} min</small></strong>{admin ? <button aria-label={`Muuda ${group.name} tunni kestust (${dayLabels[lesson.day] || lesson.day} ${lesson.time})`} onClick={() => { setLessonGroupId(group.id); setEditLessonId(lesson.id); setLessonForm({ day: lesson.day, time: lesson.time, duration: String(lesson.duration || 60), durationChoice: durationChoice(lesson.duration || 60), startDate: lesson.startDate }); setActionError(''); }}><Pencil size={13} /></button> : null}{admin ? <button aria-label={`Eemalda ${group.name} tunniaeg`} disabled={saving === `lesson:${lesson.id}`} onClick={() => removeLesson(group, lesson)}>×</button> : null}</div>) : <p>Tunniajad puuduvad.</p>}</section>
        <section className="group-members"><div className="group-section-head"><strong>Õpilased</strong>{admin ? <button onClick={() => { setMemberGroupId(group.id); setMemberQuery(''); setActionError(''); }}><UserPlus size={15} /> Halda</button> : null}</div>{members.length ? <div>{members.slice(0, 6).map((student) => <Link to={`/students/${student.id}`} key={student.id}><span>{student.name}</span>{isArchived(student) ? <ArchivedBadge /> : null}<Badge tone="info">{student.level || '—'}</Badge></Link>)}{members.length > 6 ? <button type="button" className="link-button" onClick={() => setOpenGroupId(group.id)}>+{members.length - 6} õpilast · ava grupp</button> : null}</div> : <p>Õpilasi pole veel lisatud.</p>}</section>
      </Card>;
    })}</div> : <Card><EmptyState title="Gruppe ei leitud" description={query ? 'Muuda otsingut.' : admin ? 'Lisa esimene grupp, tunniajad ja õpilased.' : 'Sinu õpetajakontoga seotud gruppe ei ole.'} /></Card>}

    <Modal open={creating} title="Uus grupp" onClose={() => !saving && setCreating(false)} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setCreating(false)}>Loobu</Button><Button type="submit" form="group-form" loading={saving === 'create'}>Salvesta grupp</Button></>}>
      <form id="group-form" className="form-grid" onSubmit={createGroup} noValidate>
        {formError}
        <GroupFields prefix="group" form={groupForm} onChange={setGroupForm} teachers={state.data.teachers} />
      </form>
    </Modal>

    <Modal open={Boolean(lessonGroup)} title={`${editLessonId ? 'Muuda tunni kestust' : 'Lisa tunniaeg'}: ${lessonGroup?.name || ''}`} onClose={() => !saving && setLessonGroupId('')} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setLessonGroupId('')}>Loobu</Button><Button type="submit" form="group-lesson-form" loading={saving === 'lesson'}>{editLessonId ? 'Salvesta kestus' : 'Lisa tunniaeg'}</Button></>}>
      <form id="group-lesson-form" className="form-grid" onSubmit={addLesson} noValidate>
        {formError}
        <Select id="group-lesson-day" label="Nädalapäev" value={lessonForm.day} disabled={Boolean(editLessonId)} onChange={(event) => setLessonForm({ ...lessonForm, day: event.target.value })} {...help('day')}>{Object.entries(dayLabels).map(([day, label]) => <option value={day} key={day}>{label}</option>)}</Select>
        <Input id="group-lesson-time" label="Kellaaeg" type="time" value={lessonForm.time} disabled={Boolean(editLessonId)} onChange={(event) => setLessonForm({ ...lessonForm, time: event.target.value })} required {...help('time')} />
        {/* the length like a 1:1 lesson (admin bug: there was no visible choice): 45 / 60 / 90 / 120 or „Muu pikkus” */}
        <Select id="group-lesson-duration" label="Kestus" value={lessonForm.durationChoice} onChange={(event) => setLessonForm({ ...lessonForm, durationChoice: event.target.value, ...(event.target.value === CUSTOM_DURATION ? {} : { duration: event.target.value }) })} {...help('duration')}>
          {DURATION_PRESETS.map((minutes) => <option key={minutes} value={String(minutes)}>{minutes} min</option>)}
          <option value={CUSTOM_DURATION}>Muu pikkus…</option>
        </Select>
        {lessonForm.durationChoice === CUSTOM_DURATION ? <Input id="group-lesson-duration-custom" label="Kestus minutites" type="number" min="5" max="480" step="5" inputMode="numeric" value={lessonForm.duration} onChange={(event) => setLessonForm({ ...lessonForm, duration: event.target.value })} required {...help('customDuration')} /> : null}
        {editLessonId ? null : <Input id="group-lesson-start" label="Alguskuupäev" type="date" value={lessonForm.startDate} onChange={(event) => setLessonForm({ ...lessonForm, startDate: event.target.value })} required {...help('startDate')} />}
        {editLessonId ? <p className="form-hint form-grid__wide">Uus kestus kehtib selle tunniaja kõigile märkimata tundidele. Juba märgitud tunnid jäävad oma kestusega. Päeva või kellaaega muuda kalendris lohistades.</p> : null}
      </form>
    </Modal>

    <Modal open={Boolean(editGroup && editForm)} title={`Muuda gruppi: ${editGroup?.name || ''}`} onClose={() => !saving && setEditGroupId('')} footer={<><Button variant="secondary" disabled={Boolean(saving)} onClick={() => setEditGroupId('')}>Loobu</Button><Button type="submit" form="group-edit-form" loading={saving === 'edit'}>Salvesta muudatused</Button></>}>
      {editGroup && editForm ? <form id="group-edit-form" className="form-grid" onSubmit={saveGroup} noValidate>
        {formError}
        <GroupFields prefix="group-edit" form={editForm} onChange={setEditForm} teachers={editTeachers} teacherChanged={teacherChanged} />
        {teacherChanged && editGroup.lessons.length ? <p className="form-hint form-grid__wide">Tunnid alates {editForm.teacherFrom || '…'} lähevad uuele õpetajale (kalender, kohalolu, aruanded, Google'i kalender). Varasemad tunnid jäävad endisele õpetajale; juba märgitud tunnid ei muutu.</p> : null}
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
      {memberGroup ? <div className="group-member-manager"><div className="search-field"><Search size={17} /><input aria-label="Otsi õpilast gruppi" placeholder="Otsi nime, e-posti, telefoni või vanema järgi" value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} /></div>
        {actionError ? <p className="form-error" role="alert">{actionError}</p> : null}
        <div>
          {memberActive.length ? <h3 className="group-member-manager__head">Aktiivsed õpilased ({memberActive.length})</h3> : null}
          {memberActive.map((student) => memberRow(memberGroup, student))}
          {memberArchived.length ? <h3 className="group-member-manager__head">Arhiveeritud ({memberArchived.length})</h3> : null}
          {memberArchived.length ? <p className="form-hint">Arhiveeritud õpilase saab lisada: enne küsitakse, kas kaart taastada aktiivseks.</p> : null}
          {memberArchived.map((student) => memberRow(memberGroup, student))}
          {state.data.archivedError ? <p className="form-hint" role="status">{state.data.archivedError}</p> : null}
          {!memberActive.length && !memberArchived.length ? <EmptyState title="Õpilasi ei leitud" description={memberQuery ? 'Otsing vaatab aktiivseid ja arhiveeritud õpilasi.' : ''} /> : null}
        </div></div> : null}
    </Modal>

    {/* after „Halda”, so it opens on top of it. Rule (2026-11-06): an archived student can join a group; the admin
        is asked whether to restore the card to active first (recommended) or to keep it archived */}
    <Modal open={Boolean(archivedAsk)} title="Arhiveeritud õpilane" onClose={() => setArchivedAsk(null)} footer={<><Button variant="secondary" onClick={() => setArchivedAsk(null)}>Loobu</Button><Button variant="secondary" onClick={() => { const ask = archivedAsk; setArchivedAsk(null); changeMember(ask.group, ask.student, true, { confirmed: true }); }}>Lisa, kaart jääb arhiivi</Button>{studentRepository.restore ? <Button onClick={() => { const ask = archivedAsk; setArchivedAsk(null); changeMember(ask.group, ask.student, true, { confirmed: true, restore: true }); }}>Lisa ja taasta kaart</Button> : null}</>}>
      {archivedAsk ? <><p><b>Õpilane on arhiveeritud — kas taastada aktiivseks?</b></p><p>{archivedAsk.student.name} lisatakse gruppi „{archivedAsk.group.name}”. Taastatud kaart on taas õpilaste nimekirjas, kalendris ja kuuarvetes. Kui kaart jääb arhiivi, on õpilane grupis märgitud „Arhiveeritud”.</p></> : null}
    </Modal>
  </div>;
}
