import { Archive, ChevronRight, Pencil, Plus, Search } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, IconButton, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { enrollmentKey, groupStudentPeople, studentsService } from '../../services/firebase/students.js';
import { ROLES } from '../../utils/roles.js';
import { canonicalTeacherName } from '../../utils/teachers.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import StudentForm from './StudentForm.jsx';
import { LEGACY_TEACHERS, STUDENT_LEVELS } from './studentOptions.js';
import { DEFAULT_STUDENT_FILTERS, studentFiltersFromParams, studentFiltersToParams, studentListHref } from './studentFilterParams.js';


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


function EnrollmentManager({ student, teachers, service, onClose, onChanged }) {
  const [drafts, setDrafts] = useState(() => Object.fromEntries((student?.enrollments || []).map((item) => [item.id, { ...item }])));
  const [newEnrollment, setNewEnrollment] = useState({ subject: '', level: 'A1', targetLevel: 'B1', teacher: '', active: true });
  const [saving, setSaving] = useState('');
  const [error, setError] = useState('');

  const updateDraft = (id, field, value) => setDrafts((current) => ({ ...current, [id]: { ...current[id], [field]: value } }));

  const saveExisting = async (enrollment) => {
    const draft = drafts[enrollment.id];
    if (!draft?.subject?.trim()) { setError('Õppeaine on kohustuslik.'); return; }
    setSaving(enrollment.id); setError('');
    try {
      const recordIds = enrollment.sourceRecordIds?.length ? enrollment.sourceRecordIds : [student.id];
      await Promise.all(recordIds.map((recordId) => service.updateEnrollment(recordId, enrollmentKey(enrollment), draft)));
      await onChanged();
    } catch (err) { setError(firebaseErrorMessage(err)); }
    finally { setSaving(''); }
  };

  const add = async () => {
    if (!newEnrollment.subject.trim()) { setError('Sisesta õppeaine.'); return; }
    setSaving('new'); setError('');
    try {
      await service.addEnrollment(student.id, newEnrollment);
      setNewEnrollment({ subject: '', level: 'A1', targetLevel: 'B1', teacher: '', active: true });
      await onChanged();
    } catch (err) { setError(firebaseErrorMessage(err)); }
    finally { setSaving(''); }
  };

  return <Modal open={Boolean(student)} title={student ? `Õppesuunad: ${student.name}` : 'Õppesuunad'} onClose={saving ? () => {} : onClose} className="modal--enrollments" footer={<Button variant="secondary" disabled={Boolean(saving)} onClick={onClose}>Valmis</Button>}>
    <div className="enrollment-manager">
      <p className="form-hint">Üks laps võib õppida mitut ainet eri õpetajatega. Muudatus ei loo uut õpilase kaarti ega muuda tema varasemat ajalugu.</p>
      <div className="enrollment-manager__list">{(student?.enrollments || []).map((enrollment) => {
        const draft = drafts[enrollment.id] || enrollment;
        return <section className="enrollment-editor" key={enrollment.id}>
          <div className="enrollment-editor__title"><strong>{enrollment.subject || 'Õppesuund'}</strong><Badge tone={draft.active !== false ? 'success' : 'neutral'}>{draft.active !== false ? 'Aktiivne' : 'Mitteaktiivne'}</Badge></div>
          <div className="enrollment-editor__grid">
            <Input label="Õppeaine" value={draft.subject || ''} onChange={(event) => updateDraft(enrollment.id, 'subject', event.target.value)} />
            <Select label="Õpetaja" value={draft.teacher || ''} onChange={(event) => updateDraft(enrollment.id, 'teacher', event.target.value)}><option value="">Määramata</option>{teachers.map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}</Select>
            <Select label="Praegune tase" value={draft.level || ''} onChange={(event) => updateDraft(enrollment.id, 'level', event.target.value)}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
            <Select label="Sihttase" value={draft.targetLevel || ''} onChange={(event) => updateDraft(enrollment.id, 'targetLevel', event.target.value)}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
            <Select label="Staatus" value={draft.active === false ? 'inactive' : 'active'} onChange={(event) => updateDraft(enrollment.id, 'active', event.target.value === 'active')}><option value="active">Aktiivne</option><option value="inactive">Mitteaktiivne</option></Select>
          </div>
          <div className="enrollment-editor__actions"><Button loading={saving === enrollment.id} disabled={Boolean(saving)} onClick={() => saveExisting(enrollment)}>Salvesta õppesuund</Button></div>
        </section>;
      })}</div>
      <section className="enrollment-editor enrollment-editor--new">
        <div className="enrollment-editor__title"><strong>Lisa uus õppesuund</strong></div>
        <div className="enrollment-editor__grid">
          <Input label="Õppeaine" value={newEnrollment.subject} onChange={(event) => setNewEnrollment({ ...newEnrollment, subject: event.target.value })} />
          <Select label="Õpetaja" value={newEnrollment.teacher} onChange={(event) => setNewEnrollment({ ...newEnrollment, teacher: event.target.value })}><option value="">Määramata</option>{teachers.map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}</Select>
          <Select label="Praegune tase" value={newEnrollment.level} onChange={(event) => setNewEnrollment({ ...newEnrollment, level: event.target.value })}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
          <Select label="Sihttase" value={newEnrollment.targetLevel} onChange={(event) => setNewEnrollment({ ...newEnrollment, targetLevel: event.target.value })}>{STUDENT_LEVELS.map((level) => <option key={level} value={level}>{level || 'Määramata'}</option>)}</Select>
        </div>
        <div className="enrollment-editor__actions"><Button variant="secondary" loading={saving === 'new'} disabled={Boolean(saving)} onClick={add}><Plus size={16} /> Lisa õppesuund</Button></div>
      </section>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  </Modal>;
}

export default function StudentsPage({ service = studentsService, actor }) {
  const auth = useContext(AuthContext);
  const currentUser = actor || auth?.user || { roles: [ROLES.ADMIN], displayName: '' };
  const canAssignTeacher = currentUser.roles?.includes(ROLES.ADMIN);
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

  const options = useMemo(() => ({
    teachers: [...new Set([...LEGACY_TEACHERS, ...state.items.map((student) => canonicalTeacherName(student.teacher))].filter(Boolean))].sort((left, right) => left.localeCompare(right, 'et')),
    levels: STUDENT_LEVELS.filter(Boolean),
  }), [state.items]);

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
  const archive = async () => {
    setArchiving(true);
    setActionError('');
    try { await service.archive(archiveTarget.id); setArchiveTarget(null); setNotice('Õpilane on arhiveeritud.'); await load(); }
    catch (error) { setArchiveTarget(null); setActionError(firebaseErrorMessage(error)); }
    finally { setArchiving(false); }
  };

  return (
    <div className="page-content">
      <PageHeader eyebrow="CRM" title="Õpilased" description={state.loading ? 'Laen Firebase andmeid…' : `${people.length} õpilast`} actions={<Button onClick={openCreate}><Plus size={18} /> Lisa õpilane</Button>} />
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
              <tbody>{people.map((student) => <tr key={student.personKey || student.id}><td><Link className="student-identity" {...profileLinkProps(student.id)}><i>{initials(student.name)}</i><span><strong>{student.name || 'Nimetu õpilane'}</strong><small>{student.enrollments?.length || 0} õppesuun{student.enrollments?.length === 1 ? 'd' : 'da'}{canAssignTeacher && student.recordIds?.length > 1 ? ` · ${student.recordIds.length} seotud kirjet` : ''}</small></span></Link></td><td><EnrollmentStack student={student} compact /></td><td><Badge tone={student.active ? 'success' : 'neutral'}>{student.active ? 'Aktiivne' : 'Arhiveeritud'}</Badge></td><td><div className="row-actions"><Button variant="secondary" onClick={() => setEnrollmentStudent(student)}>Õppesuunad</Button><IconButton label={`Muuda ${student.name}`} onClick={() => openEdit(student)}><Pencil size={17} /></IconButton>{student.active ? <IconButton label={`Arhiveeri ${student.name}`} onClick={() => setArchiveTarget(student)}><Archive size={17} /></IconButton> : null}<Link className="icon-button" aria-label={`Ava ${student.name} profiil`} {...profileLinkProps(student.id)}><ChevronRight size={18} /></Link></div></td></tr>)}</tbody>
            </table>
          </div>
          <div className="students-mobile-list">{people.map((student) => <article className="student-mobile-card" key={student.personKey || student.id}><Link {...profileLinkProps(student.id)}><i className="student-avatar">{initials(student.name)}</i><div><strong>{student.name || 'Nimetu õpilane'}</strong><span>{student.enrollments?.length || 0} õppesuun{student.enrollments?.length === 1 ? 'd' : 'da'}</span></div><ChevronRight size={18} /></Link><EnrollmentStack student={student} /><div className="student-mobile-meta"><Badge tone={student.active ? 'success' : 'neutral'}>{student.active ? 'Aktiivne' : 'Arhiveeritud'}</Badge>{canAssignTeacher && student.recordIds?.length > 1 ? <span>{student.recordIds.length} seotud kirjet</span> : null}</div><div className="row-actions"><Button variant="secondary" onClick={() => setEnrollmentStudent(student)}>Õppesuunad</Button><Button variant="secondary" onClick={() => openEdit(student)}>Muuda</Button>{student.active ? <Button variant="danger" onClick={() => setArchiveTarget(student)}>Arhiveeri</Button> : null}</div></article>)}</div>
          {state.hasMore ? <div className="load-more"><Button variant="secondary" loading={state.loading} onClick={() => load({ append: true })}>Laadi veel</Button></div> : null}
        </Card>
      ) : null}

      {enrollmentStudent ? <EnrollmentManager student={enrollmentStudent} teachers={options.teachers} service={service} onClose={() => setEnrollmentStudent(null)} onChanged={async () => { await load(); const fresh = groupStudentPeople((await service.list({ ...filters, scopeTeacher: teacherScope, scopeTeacherUid: canAssignTeacher ? '' : currentUser.uid, pageSize: 500, exhaustive: true })).items).find((item) => item.personKey === enrollmentStudent.personKey); if (fresh) setEnrollmentStudent(fresh); }} /> : null}
      <StudentForm open={formOpen} student={formStudent} teachers={options.teachers} canAssignTeacher={canAssignTeacher} defaultTeacher={teacherScope} onClose={() => setFormOpen(false)} onSubmit={save} />
      <Modal open={Boolean(archiveTarget)} title="Arhiveeri õpilane" onClose={() => !archiving && setArchiveTarget(null)} footer={<><Button variant="secondary" onClick={() => setArchiveTarget(null)} disabled={archiving}>Loobu</Button><Button variant="danger" loading={archiving} onClick={archive}>Arhiveeri</Button></>}><p>Kas arhiveerida <strong>{archiveTarget?.name}</strong>? Õpilase ajalugu säilib ning kirje märgitakse väljal <code>active</code> mitteaktiivseks.</p></Modal>
    </div>
  );
}
