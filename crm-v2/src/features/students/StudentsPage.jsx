import { Archive, ChevronRight, Pencil, Plus, Search } from 'lucide-react';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, IconButton, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { studentsService } from '../../services/firebase/students.js';
import { ROLES } from '../../utils/roles.js';
import { canonicalTeacherName } from '../../utils/teachers.js';
import { firebaseErrorMessage } from '../../utils/firebaseErrors.js';
import StudentForm from './StudentForm.jsx';
import { LEGACY_TEACHERS, STUDENT_LEVELS } from './studentOptions.js';
import { studentValueLabel, visibleStudentValue } from '../../utils/studentPrivacy.js';

const baseFilters = { search: '', status: 'active', level: '', teacher: '', sort: 'name-asc' };

export default function StudentsPage({ service = studentsService, actor }) {
  const auth = useContext(AuthContext);
  const currentUser = actor || auth?.user || { roles: [ROLES.ADMIN], displayName: '' };
  const canAssignTeacher = currentUser.roles?.includes(ROLES.ADMIN);
  const teacherScope = canAssignTeacher ? '' : canonicalTeacherName(currentUser.displayName);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({ ...baseFilters, search: initialSearch });
  const [state, setState] = useState({ loading: true, error: null, items: [], cursor: null, hasMore: false });
  const [formStudent, setFormStudent] = useState(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const requestId = useRef(0);
  const urlSearch = searchParams.get('search') || '';

  useEffect(() => {
    if (urlSearch !== search && urlSearch !== filters.search) setSearch(urlSearch);
  }, [filters.search, search, urlSearch]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = search.trim();
      setFilters((current) => current.search === nextSearch ? current : { ...current, search: nextSearch });
      setSearchParams((current) => {
        const next = new window.URLSearchParams(current);
        if (nextSearch) next.set('search', nextSearch); else next.delete('search');
        return next;
      }, { replace: true });
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [search, setSearchParams]);

  const load = useCallback(async ({ append = false } = {}) => {
    const activeRequest = ++requestId.current;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const result = await service.list({ ...filters, scopeTeacher: teacherScope, cursor: append ? state.cursor : null });
      if (activeRequest !== requestId.current) return;
      setState((current) => ({ loading: false, error: null, items: append ? [...current.items, ...result.items] : result.items, cursor: result.cursor, hasMore: result.hasMore }));
    } catch (error) {
      if (activeRequest === requestId.current) setState((current) => ({ ...current, loading: false, error: new Error(firebaseErrorMessage(error)) }));
    }
  }, [filters, service, state.cursor, teacherScope]);

  useEffect(() => { load(); }, [filters, service]); // eslint-disable-line react-hooks/exhaustive-deps

  const options = useMemo(() => ({
    teachers: [...new Set([...LEGACY_TEACHERS, ...state.items.map((student) => student.teacher)].filter(Boolean))].sort(),
    levels: STUDENT_LEVELS.filter(Boolean),
  }), [state.items]);

  const setFilter = (event) => setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  const resetFilters = () => { setSearch(''); setFilters(baseFilters); setSearchParams({}, { replace: true }); };
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
      <PageHeader eyebrow="CRM" title="Õpilased" description={state.loading ? 'Laen Firebase andmeid…' : `${state.items.length} õpilast laaditud`} actions={<Button onClick={openCreate}><Plus size={18} /> Lisa õpilane</Button>} />
      {notice ? <div className="success-notice" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Sulge teade">×</button></div> : null}
      {actionError ? <div className="action-error" role="alert">{actionError}<button onClick={() => setActionError('')} aria-label="Sulge veateade">×</button></div> : null}
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
            <table className="students-table"><thead><tr><th>Õpilane</th><th>Kontakt</th><th>Tase</th><th>Õpetaja</th><th>Staatus</th><th><span className="sr-only">Toimingud</span></th></tr></thead>
              <tbody>{state.items.map((student) => <tr key={student.id}><td><Link to={`/students/${student.id}`}><strong>{student.name || 'Nimetu õpilane'}</strong><span>{studentValueLabel(student, 'parentName', student.subject || '—')}</span></Link></td><td><span>{studentValueLabel(student, 'email')}</span><span>{studentValueLabel(student, 'phone')}</span></td><td><Badge tone="info">{student.level || '—'} → {student.targetLevel || '—'}</Badge></td><td>{studentValueLabel(student, 'teacher', 'Määramata')}</td><td><Badge tone={student.active ? 'success' : 'neutral'}>{student.active ? 'Aktiivne' : 'Arhiveeritud'}</Badge></td><td><div className="row-actions"><IconButton label={`Muuda ${student.name}`} onClick={() => openEdit(student)}><Pencil size={17} /></IconButton>{student.active ? <IconButton label={`Arhiveeri ${student.name}`} onClick={() => setArchiveTarget(student)}><Archive size={17} /></IconButton> : null}<Link className="icon-button" aria-label={`Ava ${student.name} profiil`} to={`/students/${student.id}`}><ChevronRight size={18} /></Link></div></td></tr>)}</tbody>
            </table>
          </div>
          <div className="students-mobile-list">{state.items.map((student) => <article className="student-mobile-card" key={student.id}><Link to={`/students/${student.id}`}><div><strong>{student.name || 'Nimetu õpilane'}</strong><span>{visibleStudentValue(student, 'email') || visibleStudentValue(student, 'phone') || (student.hiddenFields?.email || student.hiddenFields?.phone ? 'Kontakt peidetud' : 'Kontakt puudub')}</span></div><ChevronRight size={18} /></Link><div className="student-mobile-meta"><Badge tone="info">{student.level || '—'} → {student.targetLevel || '—'}</Badge><span>{studentValueLabel(student, 'teacher', 'Õpetaja määramata')}</span></div><div className="row-actions"><Button variant="secondary" onClick={() => openEdit(student)}>Muuda</Button>{student.active ? <Button variant="danger" onClick={() => setArchiveTarget(student)}>Arhiveeri</Button> : null}</div></article>)}</div>
          {state.hasMore ? <div className="load-more"><Button variant="secondary" loading={state.loading} onClick={() => load({ append: true })}>Laadi veel</Button></div> : null}
        </Card>
      ) : null}

      <StudentForm open={formOpen} student={formStudent} teachers={options.teachers} canAssignTeacher={canAssignTeacher} defaultTeacher={teacherScope} onClose={() => setFormOpen(false)} onSubmit={save} />
      <Modal open={Boolean(archiveTarget)} title="Arhiveeri õpilane" onClose={() => !archiving && setArchiveTarget(null)} footer={<><Button variant="secondary" onClick={() => setArchiveTarget(null)} disabled={archiving}>Loobu</Button><Button variant="danger" loading={archiving} onClick={archive}>Arhiveeri</Button></>}><p>Kas arhiveerida <strong>{archiveTarget?.name}</strong>? Õpilase ajalugu säilib ning kirje märgitakse väljal <code>active</code> mitteaktiivseks.</p></Modal>
    </div>
  );
}
