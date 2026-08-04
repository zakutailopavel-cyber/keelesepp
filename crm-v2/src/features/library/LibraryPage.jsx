import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Dumbbell,
  FilePenLine,
  FolderOpen,
  House,
  Presentation,
  Search,
  Sparkles,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { libraryService, studentsService } from '../../services/firebase/index.js';
import { legacyUrl } from '../../utils/legacyUrls.js';
import { ROLES } from '../../utils/roles.js';
import {
  buildLibraryItems,
  filterLibraryItems,
  groupLabel,
  groupLibraryItems,
  itemsInLibraryPath,
  LIBRARY_TYPES,
  pathDimension,
} from './libraryModel.js';

const typeIcons = {
  lesson: Presentation,
  worksheet: FilePenLine,
  exercise: Dumbbell,
  test: ClipboardCheck,
  homework: House,
  material: BookOpen,
};

const pathFields = { subject: 'libSubject', stage: 'libStage', topic: 'libTopic' };
const defaultRepository = libraryService;
const defaultStudentRepository = studentsService;

function readPath(params) {
  return Object.fromEntries(Object.entries(pathFields).map(([field, parameter]) => [field, params.get(parameter) || '']));
}

function AssignmentModal({ item, user, repository, studentRepository, onClose, onAssigned }) {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !user.roles.includes(ROLES.ADMIN);
  const state = useAsyncData(() => studentRepository.list({
    status: 'active',
    pageSize: 500,
    exhaustive: true,
    ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}),
  }), [studentRepository, teacherOnly, user.uid]);
  const students = state.data?.items?.filter((student) => student.active && !student.convertedToParent) || [];
  const visibleStudents = students.filter((student) => `${student.name} ${student.subject} ${student.level} ${student.group || ''}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et')));
  const toggle = (studentId) => setSelectedIds((current) => current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]);
  const selectVisible = () => {
    const visibleIds = visibleStudents.map((student) => student.id);
    const allSelected = visibleIds.length && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  };
  const assign = async () => {
    if (!selectedIds.length) return;
    setSaving(true);
    setError('');
    try {
      const selectedStudents = students.filter((student) => selectedIds.includes(student.id));
      const result = await repository.assign({ item, students: selectedStudents, dueDate, note: note.trim(), user });
      onAssigned(result.count);
    } catch (assignmentError) {
      setError(assignmentError.message || 'Materjali määramine ebaõnnestus.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      title={`Määra: ${item.title}`}
      onClose={onClose}
      footer={<><Button variant="secondary" disabled={saving} onClick={onClose}>Tühista</Button><Button loading={saving} disabled={!selectedIds.length} onClick={assign}>Määra {selectedIds.length || ''} õpilasele</Button></>}
    >
      <div className="assignment-form">
        <p className="form-hint">{item.type === 'worksheet' ? 'Tööleht ilmub õpilase kabinetti ja tulemus salvestatakse õpetajale.' : 'Materjal lisatakse õpilase kodutööde hulka.'}</p>
        {error ? <div className="action-error" role="alert">{error}</div> : null}
        {state.loading ? <LoadingState label="Laen õpilasi…" /> : state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : (
          <>
            <div className="assignment-list-head"><strong>Õpilased ({selectedIds.length} valitud)</strong><Button variant="secondary" onClick={selectVisible}>{visibleStudents.length && visibleStudents.every((student) => selectedIds.includes(student.id)) ? 'Tühista nähtavad' : 'Vali nähtavad'}</Button></div>
            <div className="search-field"><Search size={17} /><input aria-label="Otsi õpilast määramiseks" placeholder="Otsi nime, aine või taseme järgi" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
            <div className="assignment-students">
              {visibleStudents.map((student) => (
                <label className={selectedIds.includes(student.id) ? 'is-selected' : ''} key={student.id}>
                  <input type="checkbox" checked={selectedIds.includes(student.id)} onChange={() => toggle(student.id)} />
                  <span><strong>{student.name}</strong><small>{[student.subject, student.level, student.group, student.teacher].filter(Boolean).join(' · ') || 'Õppeinfo puudub'}</small></span>
                </label>
              ))}
              {!visibleStudents.length ? <EmptyState title="Õpilasi ei leitud" description="Muuda otsingut või kontrolli õpetaja seost." /> : null}
            </div>
            <div className="assignment-options"><Input id="assignment-due" label="Tähtaeg" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /><Input id="assignment-note" label="Märkus õpilasele" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Näiteks: tee enne järgmist tundi" /></div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function LibraryPage({ repository = defaultRepository, studentRepository = defaultStudentRepository }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [success, setSuccess] = useState('');
  const state = useAsyncData(() => repository.list(), [repository]);
  const path = useMemo(() => readPath(searchParams), [searchParams]);

  const items = useMemo(() => state.data
    ? buildLibraryItems(state.data.curriculumLessons, state.data.exercises)
    : [], [state.data]);
  const pathItems = useMemo(() => itemsInLibraryPath(items, path), [items, path]);
  const dimension = pathDimension(path);
  const searching = Boolean(query.trim()) || type !== 'all';
  const folders = !searching && dimension ? groupLibraryItems(pathItems, dimension) : [];
  const visibleItems = searching || !dimension ? filterLibraryItems(pathItems, { query, type }) : [];

  const changePath = (nextPath) => {
    const next = new globalThis.URLSearchParams(searchParams);
    for (const [field, parameter] of Object.entries(pathFields)) {
      if (nextPath[field]) next.set(parameter, nextPath[field]);
      else next.delete(parameter);
    }
    setSearchParams(next);
  };

  const openFolder = (key) => {
    if (dimension === 'subject') changePath({ subject: key, stage: '', topic: '' });
    if (dimension === 'stage') changePath({ ...path, stage: key, topic: '' });
    if (dimension === 'topic') changePath({ ...path, topic: key });
  };

  if (state.loading) return <LoadingState label="Laen õppevara…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const breadcrumbItems = [
    { field: 'root', label: 'Kõik materjalid', path: { subject: '', stage: '', topic: '' } },
    ...(path.subject ? [{ field: 'subject', label: groupLabel('subject', path.subject, pathItems[0]), path: { subject: path.subject, stage: '', topic: '' } }] : []),
    ...(path.stage ? [{ field: 'stage', label: groupLabel('stage', path.stage, pathItems[0]), path: { subject: path.subject, stage: path.stage, topic: '' } }] : []),
    ...(path.topic ? [{ field: 'topic', label: groupLabel('topic', path.topic, pathItems[0]), path }] : []),
  ];

  return (
    <div className="page-content">
      <PageHeader
        eyebrow="Õppetöö"
        title="Õppevara"
        description="Tunnikavad, töölehed ja harjutused olemasolevast KeeleSepa andmebaasist."
        actions={<a className="button button--primary" href={legacyUrl('/haldus-worksheet/')}><Sparkles size={17} /> Loo materjal</a>}
      />
      {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
      <Card className="library-toolbar">
        <div className="search-field"><Search size={18} /><input aria-label="Otsi õppevara" placeholder="Otsi pealkirja, teema või taseme järgi" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <Select aria-label="Materjali tüüp" value={type} onChange={(event) => setType(event.target.value)}>
          <option value="all">Kõik tüübid</option>
          {Object.entries(LIBRARY_TYPES).map(([value, meta]) => <option value={value} key={value}>{meta.label}</option>)}
        </Select>
        <strong>{visibleItems.length || pathItems.length} materjali</strong>
      </Card>
      <nav className="library-breadcrumbs" aria-label="Õppevara asukoht">
        {breadcrumbItems.map((item, index) => (
          <span key={item.field}>
            {index ? <ArrowRight size={14} /> : null}
            <button aria-current={index === breadcrumbItems.length - 1 ? 'page' : undefined} onClick={() => changePath(item.path)}>{item.label}</button>
          </span>
        ))}
      </nav>

      {folders.length ? (
        <section className="library-folder-grid" aria-label="Õppevara kaustad">
          {folders.map((folder) => (
            <button className="library-folder" key={folder.key} onClick={() => openFolder(folder.key)}>
              <i><FolderOpen size={23} /></i>
              <span><strong>{folder.label}</strong><small>{folder.count} materjali</small></span>
              <ArrowRight size={18} />
            </button>
          ))}
        </section>
      ) : visibleItems.length ? (
        <section className="library-item-grid" aria-label="Õppematerjalid">
          {visibleItems.map((item) => {
            const Icon = typeIcons[item.type] || BookOpen;
            const meta = LIBRARY_TYPES[item.type] || LIBRARY_TYPES.material;
            return (
              <button className="library-item" key={item.key} onClick={() => setSelected(item)}>
                <div className="library-item__head"><i><Icon size={20} /></i><Badge tone={meta.tone}>{meta.label}</Badge></div>
                <strong>{item.title}</strong>
                <p>{item.description || 'Kirjeldus puudub.'}</p>
                <div className="library-item__meta"><span>{item.subject || 'Õppeaine määramata'}</span><span>{item.level || item.ageGroup || 'Tase määramata'}</span></div>
              </button>
            );
          })}
        </section>
      ) : (
        <Card><EmptyState title="Õppevara ei leitud" description="Muuda otsingut, filtrit või vali teine kaust." /></Card>
      )}

      <Modal
        open={Boolean(selected)}
        title={selected?.title || 'Õppematerjal'}
        onClose={() => setSelected(null)}
        footer={<><a className="button button--secondary" href={legacyUrl(selected?.kind === 'exercise' ? `/haldus-exercises/?exercise=${encodeURIComponent(selected.sourceId)}` : '/haldus-exercises/')}>Ava töövahend <ArrowRight size={16} /></a><Button onClick={() => { setAssigning(selected); setSelected(null); }}>Määra õpilastele</Button></>}
      >
        {selected ? <div className="library-detail"><Badge tone={LIBRARY_TYPES[selected.type]?.tone}>{selected.typeLabel}</Badge><p>{selected.description || 'Materjalil ei ole kirjeldust.'}</p><dl><div><dt>Õppeaine</dt><dd>{selected.subject || '—'}</dd></div><div><dt>Tase või vanus</dt><dd>{selected.level || selected.ageGroup || '—'}</dd></div><div><dt>Teema</dt><dd>{selected.curriculum || selected.topic || '—'}</dd></div><div><dt>Andmeallikas</dt><dd>{selected.kind === 'exercise' ? 'Harjutused' : 'Õppekava'}</dd></div></dl></div> : null}
      </Modal>
      {assigning ? <AssignmentModal item={assigning} user={user} repository={repository} studentRepository={studentRepository} onClose={() => setAssigning(null)} onAssigned={(count) => { setAssigning(null); setSuccess(`„${assigning.title}” määrati ${count} õpilasele.`); }} /> : null}
    </div>
  );
}
