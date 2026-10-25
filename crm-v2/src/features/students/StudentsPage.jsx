import { Archive, ChevronRight, ClipboardList, Pencil, Plus, RotateCcw, Search, UsersRound } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, IconButton, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { groupStudentPeople, studentsService } from '../../services/firebase/students.js';
import { lastSeenOf, presenceService } from '../../services/firebase/presence.js';
import { agoLabel } from '../learner/learnerSnapshot.js';
import { ROLES } from '../../utils/roles.js';
import { canonicalTeacherName } from '../../utils/teachers.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import StudentForm from './StudentForm.jsx';
import EnrollmentManager from './EnrollmentManager.jsx';
import DuplicateCandidatesModal from './DuplicateCandidatesModal.jsx';
import MissingDataPanel from '../missing-data/MissingDataPanel.jsx';
import { duplicateCandidates } from './duplicateCandidates.js';
import { STUDENT_LEVELS } from './studentOptions.js';
import { teacherChoices, useTeacherNames } from './useTeacherNames.js';
import { DEFAULT_STUDENT_FILTERS, studentFiltersFromParams, studentFiltersToParams, studentListHref } from './studentFilterParams.js';
import './studentFinancePanel.css';


function EnrollmentStack({ student, compact = false }) {
  const enrollments = student.enrollments || [];
  if (!enrollments.length) return <span className="student-enrollment-empty">Õppesuunad puuduvad</span>;
  return <div className={compact ? 'student-enrollments student-enrollments--compact' : 'student-enrollments'}>
    {enrollments.map((enrollment) => <div className="student-enrollment-row" key={enrollment.id}>
      <strong>{enrollment.subject || 'Õppeaine puudub'}</strong>
      <span>{[enrollment.level && enrollment.targetLevel ? `${enrollment.level} → ${enrollment.targetLevel}` : enrollment.level, enrollment.teacher].filter(Boolean).join(' · ') || 'Andmed puuduvad'}</span>
    </div>)}
  </div>;
}


export default function StudentsPage({ service = studentsService, mergeService, teacherApi, actor, presenceApi = presenceService, missingDataApi }) {
  const auth = useContext(AuthContext);
  const currentUser = actor || auth?.user || { roles: [ROLES.ADMIN], displayName: '' };
  const canAssignTeacher = currentUser.roles?.includes(ROLES.ADMIN);
  const staffTeachers = useTeacherNames(canAssignTeacher, teacherApi);
  const teacherScope = canAssignTeacher ? '' : canonicalTeacherName(currentUser.displayName);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = studentFiltersFromParams(searchParams);
  const [search, setSearch] = useState(initialFilters.search);
  const [filters, setFilters] = useState(initialFilters);
  const [state, setState] = useState({ loading: true, error: null, items: [], cursor: null, hasMore: false });
  const [formStudent, setFormStudent] = useState(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [enrollmentStudent, setEnrollmentStudent] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  // „Võimalikud duplikaadid” (owner 2026-10-24): pairs + „Liida” with the server preview; cards are never deleted
  const [duplicatesOpen, setDuplicatesOpen] = useState(false);
  // „Puuduvad andmed” (owner 2026-10-25): what each card misses; ?puuduvad=1 (the bell) opens it, &taidetud=<id> marks a filling
  const [missing, setMissing] = useState(() => ({ open: searchParams.get('puuduvad') === '1', focus: searchParams.get('taidetud') || '' }));
  useEffect(() => {
    if (searchParams.get('puuduvad') === '1') setMissing({ open: true, focus: searchParams.get('taidetud') || '' });
  }, [searchParams]);
  const requestId = useRef(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = search.trim();
      const nextFilters = { ...filters, search: nextSearch };
      setFilters((current) => current.search === nextSearch ? current : nextFilters);
      setSearchParams(studentFiltersToParams(nextFilters), { replace: true });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async ({ append = false } = {}) => {
    const activeRequest = ++requestId.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await service.list({
        ...filters,
        scopeTeacher: teacherScope,
        scopeTeacherUid: canAssignTeacher ? '' : currentUser.uid,
        cursor: append ? state.cursor : null,
        pageSize: 500,
        exhaustive: true,
      });
      if (activeRequest !== requestId.current) return;
      setState((current) => ({ loading: false, error: null, items: append ? [...current.items, ...result.items] : result.items, cursor: result.cursor, hasMore: result.hasMore }));
    } catch (error) {
      if (activeRequest === requestId.current) setState((current) => ({ ...current, loading: false, error: new Error(firebaseErrorMessage(error)) }));
    }
  }, [canAssignTeacher, currentUser.uid, filters, service, state.cursor, teacherScope]);

  useEffect(() => { load(); }, [filters, service]); // eslint-disable-line react-hooks/exhaustive-deps

  const people = useMemo(() => groupStudentPeople(state.items), [state.items]);
  // „sees eile”: the student's last visit or „Minu vead” day (presence.js); loads after the list, a failure shows nothing
  const [seen, setSeen] = useState(() => new Map());
  useEffect(() => {
    let alive = true;
    if (!people.length) return undefined;
    Promise.resolve().then(() => presenceApi.forStudents(people)).then((map) => { if (alive) setSeen(map); }).catch(() => {});
    return () => { alive = false; };
  }, [people, presenceApi]);
  const seenText = (student) => { const at = lastSeenOf(seen.get(student.id)); return at ? ` · sees ${agoLabel(at)}` : ''; };
  const duplicateCount = useMemo(() => (canAssignTeacher ? duplicateCandidates(state.items).length : 0), [canAssignTeacher, state.items]);

  const options = useMemo(() => ({
    teachers: teacherChoices(staffTeachers, state.items.map((student) => student.teacher)),
    levels: STUDENT_LEVELS.filter(Boolean),
  }), [state.items, staffTeachers]);

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters);
    setSearch(nextFilters.search);
    setSearchParams(studentFiltersToParams(nextFilters), { replace: true });
  };
  const setFilter = (event) => applyFilters({ ...filters, [event.target.name]: event.target.value });
  const resetFilters = () => applyFilters(DEFAULT_STUDENT_FILTERS);
  const currentListHref = studentListHref(filters);
  const profileLinkProps = (studentId) => ({ to: `/students/${studentId}`, state: { studentListHref: currentListHref } });
  const initials = (name) => String(name || '?').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  const activeCount = people.filter((student) => student.records?.some((record) => record.active)).length;
  const unassignedCount = people.filter((student) => student.active && !(student.enrollments || []).some((enrollment) => canonicalTeacherName(enrollment.teacher))).length;
  const openCreate = () => { setFormStudent(undefined); setFormOpen(true); };
  const openEdit = (student) => { setFormStudent(student); setFormOpen(true); };
  const save = async (values) => {
    setActionError('');
    const safeValues = canAssignTeacher ? values : { ...values, teacher: formStudent?.teacher || teacherScope };
    if (formStudent) await service.update(formStudent.id, safeValues); else await service.create(safeValues);
    setNotice(formStudent ? 'Õpilase andmed on salvestatud.' : 'Õpilane on lisatud.');
    await load();
  };
  const setActive = async (active) => {
    setArchiving(true);
    setActionError('');
    try {
      const ids = archiveTarget.recordIds?.length ? archiveTarget.recordIds : [archiveTarget.id];
      await (active ? service.restore(ids) : service.archive(ids));
      setArchiveTarget(null);
      setNotice(active ? 'Õpilane on taastatud.' : 'Õpilane on arhiveeritud.');
      await load();
    }
    catch (error) { setArchiveTarget(null); setActionError(firebaseErrorMessage(error)); }
    finally { setArchiving(false); }
  };
  return (
    <div className="page-content">
      <PageHeader eyebrow="CRM" title="Õpilased" description={state.loading ? 'Laen Firebase andmeid…' : `${people.length} õpilast`} actions={<>{canAssignTeacher ? <Button variant="secondary" onClick={() => setMissing({ open: true, focus: '' })}><ClipboardList size={18} /> Puuduvad andmed</Button> : null}{canAssignTeacher ? <Button variant="secondary" onClick={() => setDuplicatesOpen(true)}><UsersRound size={18} /> Võimalikud duplikaadid{duplicateCount ? <Badge tone="warning">{duplicateCount}</Badge> : null}</Button> : null}<Button onClick={openCreate}><Plus size={18} /> Lisa õpilane</Button></>} />
      {notice ? <div className="success-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Sulge teade">×</button></div> : null}
      {actionError ? <div className="action-error" role="alert">{actionError}<button onClick={() => setActionError('')} aria-label="Sulge veateade">×</button></div> : null}
      {state.items.length ? <section className="student-directory-summary" aria-label="Õpilaste kokkuvõte"><div><span>Leitud</span><strong>{people.length}</strong></div><div><span>Aktiivsed</span><strong>{activeCount}</strong></div><div><span>Tasemeid</span><strong>{new Set(people.flatMap((student) => (student.enrollments || []).map((enrollment) => enrollment.level)).filter(Boolean)).size}</strong></div>{canAssignTeacher ? <div className={unassignedCount ? 'needs-attention' : ''}><span>Õpetajata</span><strong>{unassignedCount}</strong></div> : null}</section> : null}
      <Card className={`filters-card ${canAssignTeacher ? '' : 'filters-card--teacher'}`}>
        <div className="search-field"><Search size={18} /><Input aria-label="Otsi nime, telefoni või e-posti järgi" name="search" placeholder="Otsi nime, telefoni või e-posti järgi…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
        <Select aria-label="Staatus" name="status" value={filters.status} onChange={setFilter}><option value="">Kõik staatused</option><option value="active">Aktiivsed</option><option value="archived">Arhiveeritud</option></Select>
        <Select aria-label="Tase" name="level" value={filters.level} onChange={setFilter}><option value="">Kõik tasemed</option>{options.levels.map((level) => <option key={level}>{level}</option>)}</Select>
        {canAssignTeacher ? <Select aria-label="Õpetaja" name="teacher" value={filters.teacher} onChange={setFilter}><option value="">Kõik õpetajad</option>{options.teachers.map((teacher) => <option key={teacher}>{teacher}</option>)}</Select> : null}
        <Select aria-label="Sortimine" name="sort" value={filters.sort} onChange={setFilter}><option value="name-asc">Nimi A–Z</option><option value="name-desc">Nimi Z–A</option><option value="level">Tase</option><option value="teacher">Õpetaja</option></Select>
        {(search || filters.status !== 'active' || filters.level || filters.teacher || filters.sort !== 'name-asc') ? <Button variant="secondary" onClick={resetFilters}>Lähtesta filtrid</Button> : null}
      </Card>

      {state.loading && !state.items.length ? <Card><LoadingState label="Laen õpilasi…" /></Card> : null}
      {state.error ? <Card><ErrorState message={state.error.message} onRetry={() => load()} /></Card> : null}
      {!state.loading && !state.error && !state.items.length ? <Card><EmptyState title="Õpilasi ei leitud" description={state.hasMore ? 'Esimesel andmelehel vasteid ei olnud. Laadi järgmine leht.' : 'Muuda filtreid või lisa esimene õpilane.'} action={state.hasMore ? <Button variant="secondary" loading={state.loading} onClick={() => load({ append: true })}>Laadi veel</Button> : <Button onClick={openCreate}>Lisa õpilane</Button>} /></Card> : null}
      {state.items.length ? (
        <Card className="students-card">
          <div className="students-table-wrap">
            <table className="students-table students-table--people"><thead><tr><th>Õpilane</th><th>Õppesuunad</th><th>Staatus</th><th><span className="sr-only">Toimingud</span></th></tr></thead>
              <tbody>{people.map((student) => <tr key={student.personKey || student.id}><td><Link className="student-identity" {...profileLinkProps(student.id)}><i>{initials(student.name)}</i><span><strong>{student.name || 'Nimetu õpilane'}</strong><small>{student.enrollments?.length || 0} õppesuun{student.enrollments?.length === 1 ? 'd' : 'da'}{canAssignTeacher && student.recordIds?.length > 1 ? ` · ${student.recordIds.length} seotud kirjet` : ''}{seenText(student)}</small></span></Link></td><td><EnrollmentStack student={student} compact /></td><td><Badge tone={student.active ? 'success' : 'neutral'}>{student.active ? 'Aktiivne' : 'Arhiveeritud'}</Badge></td><td><div className="row-actions">{canAssignTeacher ? <Button variant="secondary" onClick={() => setEnrollmentStudent(student)}>Õppesuunad</Button> : null}<IconButton label={`Muuda ${student.name}`} onClick={() => openEdit(student)}><Pencil size={17} /></IconButton>{student.active ? <IconButton label={`Arhiveeri ${student.name}`} onClick={() => setArchiveTarget(student)}><Archive size={17} /></IconButton> : <IconButton label={`Taasta ${student.name}`} onClick={() => setArchiveTarget(student)}><RotateCcw size={17} /></IconButton>}<Link className="icon-button" aria-label={`Ava ${student.name} profiil`} {...profileLinkProps(student.id)}><ChevronRight size={18} /></Link></div></td></tr>)}</tbody>
            </table>
          </div>
          <div className="students-mobile-list">{people.map((student) => <article className="student-mobile-card" key={student.personKey || student.id}><Link {...profileLinkProps(student.id)}><i className="student-avatar">{initials(student.name)}</i><div><strong>{student.name || 'Nimetu õpilane'}</strong><span>{student.enrollments?.length || 0} õppesuun{student.enrollments?.length === 1 ? 'd' : 'da'}{seenText(student)}</span></div><ChevronRight size={18} /></Link><EnrollmentStack student={student} /><div className="student-mobile-meta"><Badge tone={student.active ? 'success' : 'neutral'}>{student.active ? 'Aktiivne' : 'Arhiveeritud'}</Badge>{canAssignTeacher && student.recordIds?.length > 1 ? <span>{student.recordIds.length} seotud kirjet</span> : null}</div><div className="row-actions">{canAssignTeacher ? <Button variant="secondary" onClick={() => setEnrollmentStudent(student)}>Õppesuunad</Button> : null}<Button variant="secondary" onClick={() => openEdit(student)}>Muuda</Button>{student.active ? <Button variant="danger" onClick={() => setArchiveTarget(student)}>Arhiveeri</Button> : <Button variant="secondary" onClick={() => setArchiveTarget(student)}>Taasta</Button>}</div></article>)}</div>
          {state.hasMore ? <div className="load-more"><Button variant="secondary" loading={state.loading} onClick={() => load({ append: true })}>Laadi veel</Button></div> : null}
        </Card>
      ) : null}

      {enrollmentStudent ? <EnrollmentManager student={enrollmentStudent} teachers={options.teachers} service={service} onClose={() => setEnrollmentStudent(null)} onChanged={async () => { await load(); const fresh = groupStudentPeople((await service.list({ ...filters, scopeTeacher: teacherScope, scopeTeacherUid: canAssignTeacher ? '' : currentUser.uid, pageSize: 500, exhaustive: true })).items).find((item) => item.personKey === enrollmentStudent.personKey); if (fresh) setEnrollmentStudent(fresh); }} /> : null}
      <StudentForm open={formOpen} student={formStudent} teachers={options.teachers} canAssignTeacher={canAssignTeacher} existingStudents={state.items} defaultTeacher={teacherScope} onClose={() => setFormOpen(false)} onSubmit={save} />
      <Modal open={Boolean(archiveTarget)} title={archiveTarget?.active ? 'Arhiveeri õpilane' : 'Taasta õpilane'} onClose={() => !archiving && setArchiveTarget(null)} footer={<><Button variant="secondary" onClick={() => setArchiveTarget(null)} disabled={archiving}>Loobu</Button><Button variant={archiveTarget?.active ? 'danger' : 'primary'} loading={archiving} onClick={() => setActive(!archiveTarget?.active)}>{archiveTarget?.active ? 'Arhiveeri' : 'Taasta'}</Button></>}><p>Kas {archiveTarget?.active ? 'arhiveerida' : 'taastada'} <strong>{archiveTarget?.name}</strong>? Toiming rakendub kõigile {archiveTarget?.recordIds?.length || 1} seotud kirjele. Õpilase ID-d, õppesuunad ja ajalugu säilivad.</p></Modal>
      {canAssignTeacher && missing.open ? <MissingDataPanel open user={currentUser} focusSubmission={missing.focus} {...(missingDataApi ? { service: missingDataApi } : {})} onClose={() => setMissing({ open: false, focus: '' })} /> : null}
      {canAssignTeacher && duplicatesOpen ? <DuplicateCandidatesModal open service={service} {...(mergeService ? { mergeService } : {})} onClose={() => setDuplicatesOpen(false)} onMerged={() => { setNotice('Kaardid on liidetud. Teine kaart on arhiveeritud ja viitab alles jäänud kaardile.'); load(); }} /> : null}
    </div>
  );
}
