import {
  ArrowRight,
  BookOpen,
  LayoutTemplate, Replace, BookCopy,
  ClipboardCheck,
  Dumbbell,
  Eye,
  FilePenLine,
  House,
  Paperclip,
  Presentation,
  Search,
  Send,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, Input, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { curriculumInstallerService, groupsService, libraryService, studentsService } from '../../services/firebase/index.js';
import { legacyUrl } from '../../utils/legacyUrls.js';
import { ROLES } from '../../utils/roles.js';
import { A2_LESSON_COUNT, a2InstalledCount } from '../curriculum/a2Curriculum.js';
import {
  buildLibraryItems,
  isUnpublishedWorksheet,
  LIBRARY_TYPES,
  levelFacets,
  moduleFacets,
  searchLibrary,
  sectionsByModule,
  sortLibrary,
  typeFacets,
} from './libraryModel.js';
import MaterialPreview from './MaterialPreview.jsx';
import MaterialEditor from './MaterialEditor.jsx';
import ExerciseEditor from './ExerciseEditor.jsx';
import './libraryWorkspace.css';

const typeIcons = {
  lesson: Presentation,
  worksheet: FilePenLine,
  exercise: Dumbbell,
  test: ClipboardCheck,
  homework: House,
  material: BookOpen,
};

const defaultRepository = libraryService;
const defaultStudentRepository = studentsService;
const defaultGroupRepository = groupsService;
const defaultCurriculumInstaller = curriculumInstallerService;
const PAGE = 80;
const SORTS = { toc: 'Õppekava järjekord', relevance: 'Asjakohasus', recent: 'Viimati muudetud', title: 'Pealkiri A–Z' };

// Favourites are a per-teacher convenience on this device.
const favKey = (uid) => `keelesepp.library.favorites.${uid || 'anon'}`;
function loadFavorites(uid) {
  try { return new Set(JSON.parse(globalThis.localStorage?.getItem(favKey(uid)) || '[]')); } catch { return new Set(); }
}
function saveFavorites(uid, set) {
  try { globalThis.localStorage?.setItem(favKey(uid), JSON.stringify([...set])); } catch { /* storage unavailable */ }
}
const shortDate = (iso) => (iso && /^\d{4}-\d{2}-\d{2}/.test(iso) ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : '');
const hasStudioDoc = (item) => item.kind !== 'exercise' && (item.source?.worksheetDoc?.blocks?.length || item.source?.worksheetData?.blocks?.length);
const usesLessonEngine = (item) => item?.kind === 'curriculum' && item?.source?.roadmapManaged === true && !hasStudioDoc(item);

function AssignmentModal({ item, user, repository, studentRepository, groupRepository, onClose, onAssigned }) {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const unpublished = isUnpublishedWorksheet(item.source);
  const teacherOnly = user.roles.includes(ROLES.TEACHER) && !user.roles.includes(ROLES.ADMIN);
  const state = useAsyncData(async () => {
    const [studentResult, groups] = await Promise.all([
      studentRepository.list({ status: 'active', pageSize: 500, exhaustive: true, ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}) }),
      groupRepository.list(teacherOnly ? { teacherUid: user.uid, teacherName: user.displayName } : {}),
    ]);
    return { students: studentResult.items, groups };
  }, [groupRepository, studentRepository, teacherOnly, user.displayName, user.uid]);
  const students = state.data?.students?.filter((student) => student.active && !student.convertedToParent) || [];
  const studentGroups = state.data?.groups || [];
  const visibleStudents = students.filter((student) => `${student.name} ${student.subject} ${student.level} ${student.group || ''}`.toLocaleLowerCase('et').includes(query.toLocaleLowerCase('et')));
  const toggle = (studentId) => setSelectedIds((current) => current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]);
  const selectVisible = () => {
    const visibleIds = visibleStudents.map((student) => student.id);
    const allSelected = visibleIds.length && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((current) => allSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
  };
  const selectGroup = (groupId) => {
    setSelectedGroup(groupId);
    const group = studentGroups.find((item) => item.id === groupId);
    if (group) {
      const visibleStudentIds = new Set(students.map((student) => student.id));
      setSelectedIds((group.students || []).filter((studentId) => visibleStudentIds.has(studentId)));
    }
  };
  const assign = async () => {
    if (!selectedIds.length) return;
    setSaving(true);
    setError('');
    try {
      const selectedStudents = students.filter((student) => selectedIds.includes(student.id));
      const result = await repository.assign({ item, students: selectedStudents, dueDate, note: note.trim(), user });
      onAssigned(result);
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
      footer={<><Button variant="secondary" disabled={saving} onClick={onClose}>Tühista</Button>{unpublished ? <Link className="button button--primary" to={`/library/worksheets/${item.sourceId}`}>Ava konstruktoris ja avalda</Link> : <Button loading={saving} disabled={!selectedIds.length} onClick={assign}>Määra {selectedIds.length || ''} õpilasele</Button>}</>}
    >
      <div className="assignment-form">
        <p className="form-hint">{item.type === 'worksheet' ? 'Tööleht ilmub õpilase kabinetti ja tulemus salvestatakse õpetajale.' : 'Materjal lisatakse õpilase kodutööde hulka.'}</p>
        {error ? <div className="action-error" role="alert">{error}</div> : null}
        {unpublished ? <p role="status">See tööleht on mustand ja sellel pole avaldatud versiooni. Avalda see konstruktoris enne õpilasele määramist.</p> : null}
        {state.loading ? <LoadingState label="Laen õpilasi…" /> : state.error ? <ErrorState message={state.error.message} onRetry={state.reload} /> : (
          <>
            <div className="assignment-list-head"><strong>Õpilased ({selectedIds.length} valitud)</strong><Button variant="secondary" onClick={selectVisible}>{visibleStudents.length && visibleStudents.every((student) => selectedIds.includes(student.id)) ? 'Tühista nähtavad' : 'Vali nähtavad'}</Button></div>
            {studentGroups.length ? <Select id="assignment-group" label="Vali terve grupp" value={selectedGroup} onChange={(event) => selectGroup(event.target.value)}><option value="">Vali õpilased eraldi</option>{studentGroups.map((group) => <option value={group.id} key={group.id}>{group.name} · {(group.students || []).length} õpilast</option>)}</Select> : null}
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

export default function LibraryPage({ repository = defaultRepository, studentRepository = defaultStudentRepository, groupRepository = defaultGroupRepository, curriculumInstaller = defaultCurriculumInstaller }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState(null);
  const [assigning, setAssigning] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [editing, setEditing] = useState(undefined);
  const [exerciseEditing, setExerciseEditing] = useState(undefined);
  const [success, setSuccess] = useState('');
  const [installingA2, setInstallingA2] = useState(false);
  const [installError, setInstallError] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [favorites, setFavorites] = useState(() => loadFavorites(user?.uid));
  const searchRef = useRef(null);
  const state = useAsyncData(() => repository.list(), [repository]);
  const a2Count = a2InstalledCount(state.data?.curriculumLessons || []);
  const a2Complete = a2Count >= A2_LESSON_COUNT;

  const q = searchParams.get('q') || '';
  const level = searchParams.get('tase') || '';
  const module = searchParams.get('moodul') || '';
  const type = searchParams.get('tyyp') || '';
  const onlyFav = searchParams.get('lemmikud') === '1';
  const onlyMine = searchParams.get('minu') === '1';
  const sort = searchParams.get('jarjestus') || (q.trim() ? 'relevance' : 'toc');

  const setParam = (changes, { replace = false } = {}) => {
    const next = new globalThis.URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value); else next.delete(key);
    }
    setSearchParams(next, { replace });
    setLimit(PAGE);
  };

  // "/" jumps to the search field from anywhere on the page
  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName;
      if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) && !event.target?.isContentEditable) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, []);

  const items = useMemo(() => state.data ? buildLibraryItems(state.data.curriculumLessons, state.data.exercises) : [], [state.data]);
  const favFilter = onlyFav ? favorites : null;
  const mineUid = onlyMine ? user?.uid || '' : '';
  const levels = useMemo(() => levelFacets(searchLibrary(items, { query: q, type, favorites: favFilter, mineUid }).map((r) => r.item)), [items, q, type, favFilter, mineUid]);
  const modules = useMemo(() => moduleFacets(searchLibrary(items, { query: q, level, type, favorites: favFilter, mineUid }).map((r) => r.item)), [items, q, level, type, favFilter, mineUid]);
  const types = useMemo(() => typeFacets(searchLibrary(items, { query: q, level, module, favorites: favFilter, mineUid }).map((r) => r.item)), [items, q, level, module, favFilter, mineUid]);
  const results = useMemo(() => sortLibrary(searchLibrary(items, { query: q, level, module, type, favorites: favFilter, mineUid }), sort), [items, q, level, module, type, sort, favFilter, mineUid]);

  if (state.loading) return <LoadingState label="Laen õppevara…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const installA2Curriculum = async () => {
    setInstallingA2(true);
    setInstallError('');
    try {
      const result = await curriculumInstaller.installA2({ user });
      setSuccess(`A2 õppekava paigaldati: ${result.count} tundi.`);
      state.reload();
    } catch (error) {
      setInstallError(error?.message || 'A2 õppekava paigaldamine ebaõnnestus.');
    } finally {
      setInstallingA2(false);
    }
  };

  const toggleFavorite = (item) => {
    const next = new Set(favorites);
    if (next.has(item.key)) next.delete(item.key); else next.add(item.key);
    setFavorites(next);
    saveFavorites(user?.uid, next);
  };
  const open = (item) => {
    if (item.kind === 'exercise') { setSelected(item); return; }
    setPreviewing(item);
  };
  // Worksheets (structured or old image/PDF ones) are edited in the worksheet builder, other materials in the editor.
  const edit = (item) => {
    if (item.kind === 'exercise') { setExerciseEditing(item); return; }
    if ((item.type === 'worksheet' || item.source?.type === 'worksheet' || hasStudioDoc(item)) && item.sourceId) { navigate(`/library/worksheets/${encodeURIComponent(item.sourceId)}`); return; }
    setEditing(item);
  };
  const openWorksheet = (item) => navigate(usesLessonEngine(item)
    ? `/library/lessons/${encodeURIComponent(item.sourceId)}/worksheets/discover`
    : `/library/worksheets/${encodeURIComponent(item.sourceId)}`);
  const shown = results.slice(0, limit);
  const sections = sort === 'toc' ? sectionsByModule(shown) : [{ key: 'all', label: '', results: shown }];
  const filtersOn = Boolean(q || level || module || type || onlyFav || onlyMine);

  const row = ({ item, snippet }) => {
    const Icon = typeIcons[item.type] || BookOpen;
    const meta = LIBRARY_TYPES[item.type] || LIBRARY_TYPES.material;
    const fav = favorites.has(item.key);
    return (
      <li className="lib2-row" key={item.key}>
        <button type="button" className={`lib2-star ${fav ? 'is-on' : ''}`} aria-pressed={fav} aria-label={fav ? `Eemalda lemmikutest: ${item.title}` : `Lisa lemmikutesse: ${item.title}`} onClick={() => toggleFavorite(item)}><Star size={17} /></button>
        <i className={`lib2-icon tone-${meta.tone}`} aria-hidden="true"><Icon size={18} /></i>
        <button type="button" className="lib2-main" onClick={() => setSelected(item)}>
          <strong>{item.lessonNumber && item.kind !== 'exercise' ? <span className="lib2-num">{item.lessonNumber}.</span> : null}{item.title}</strong>
          <small>{[meta.label, item.level || item.ageGroup, sort !== 'toc' ? item.moduleTitle : '', item.languageFocus].filter(Boolean).join(' · ')}</small>
          {snippet ? <em className="lib2-snippet"><b>{snippet.label}:</b> {snippet.text}</em> : null}
        </button>
        <span className="lib2-meta">{item.fileCount ? <span title={`${item.fileCount} faili`}><Paperclip size={14} />{item.fileCount}</span> : null}{shortDate(item.updatedAt) ? <time dateTime={item.updatedAt}>{shortDate(item.updatedAt)}</time> : null}</span>
        <span className="lib2-actions">
          <Button variant="secondary" aria-label={`Vaata: ${item.title}`} onClick={() => open(item)}><Eye size={15} /> Vaata</Button>
          {usesLessonEngine(item) ? <Button variant="secondary" aria-label={`Töölehed: ${item.title}`} onClick={() => openWorksheet(item)}><Sparkles size={15} /> Töölehed</Button> : null}
          <Button variant="secondary" aria-label={`Muuda: ${item.title}`} onClick={() => edit(item)}><FilePenLine size={15} /> Muuda</Button>
          <Button onClick={() => setAssigning(item)}><Send size={15} /> Määra</Button>
        </span>
      </li>
    );
  };

  return (
    <div className="page-content library-page lib2">
      <PageHeader
        eyebrow="Õppetöö"
        title="Õppevara"
        description="Otsi pealkirja, teema või sisu järgi — või vali tase ja moodul nagu õpiku sisukorrast."
        actions={<>{!a2Complete ? <Button variant="secondary" loading={installingA2} disabled={installingA2} onClick={installA2Curriculum}><BookOpen size={17} /> Paigalda A2 õppekava</Button> : null}<Button onClick={() => navigate('/library/worksheets/new')}><LayoutTemplate size={17} /> Töölehe konstruktor</Button><Button variant="secondary" onClick={() => navigate('/library/worksheets/convert')}><Replace size={17} /> Üleviimine</Button><Button variant="secondary" onClick={() => navigate('/library/worksheets/book')}><BookCopy size={17} /> Õpik</Button><Button variant="secondary" onClick={() => setEditing(null)}><Sparkles size={17} /> Lisa materjal</Button></>}
      />
      {success ? <div className="success-notice" role="status">{success}<button aria-label="Sulge teade" onClick={() => setSuccess('')}>×</button></div> : null}
      {installError ? <div className="action-error" role="alert">{installError}</div> : null}
      {!a2Complete ? <div className="form-hint">A2 õppekava: {a2Count}/{A2_LESSON_COUNT} tundi paigaldatud. Paigaldus kasutab stabiilseid tunni-ID-sid ega loo duplikaate.</div> : null}

      <div className="lib2-search">
        <Search size={20} aria-hidden="true" />
        <input ref={searchRef} type="search" aria-label="Otsi õppevara" placeholder="Otsi: partitiiv, tööintervjuu, kirjutamine B1…" value={q} onChange={(event) => setParam({ q: event.target.value, jarjestus: '' }, { replace: true })} />
        {q ? <button type="button" className="lib2-clear" aria-label="Tühjenda otsing" onClick={() => setParam({ q: '' })}><X size={16} /></button> : <kbd aria-hidden="true">/</kbd>}
      </div>

      <div className="lib2-levels" role="group" aria-label="Tase">
        <button type="button" className={!level ? 'is-active' : ''} aria-pressed={!level} onClick={() => setParam({ tase: '', moodul: '' })}>Kõik <span>{levels.reduce((sum, facet) => sum + facet.count, 0)}</span></button>
        {levels.map((facet) => <button type="button" key={facet.key} className={level === facet.key ? 'is-active' : ''} aria-pressed={level === facet.key} onClick={() => setParam({ tase: level === facet.key ? '' : facet.key, moodul: '' })}>{facet.label} <span>{facet.count}</span></button>)}
      </div>

      <div className="lib2-body">
        <aside className="lib2-toc" aria-label="Moodulid">
          <label className="lib2-toc-select"><span>Moodul</span>
            <select value={module} onChange={(event) => setParam({ moodul: event.target.value })}>
              <option value="">Kõik moodulid</option>
              {modules.map((facet) => <option value={facet.key} key={facet.key}>{level ? '' : `${facet.level} · `}{facet.label} ({facet.count})</option>)}
            </select>
          </label>
          <ul>
            <li><button type="button" className={!module ? 'is-active' : ''} onClick={() => setParam({ moodul: '' })}>Kõik moodulid</button></li>
            {modules.map((facet) => <li key={facet.key}><button type="button" className={module === facet.key ? 'is-active' : ''} onClick={() => setParam({ moodul: module === facet.key ? '' : facet.key })}>{!level ? <b>{facet.level}</b> : null}<span>{facet.label}</span><small>{facet.count}</small></button></li>)}
          </ul>
        </aside>

        <section className="lib2-results" aria-label="Õppematerjalid">
          <div className="lib2-filters">
            <div className="lib2-chips" role="group" aria-label="Materjali tüüp">
              <button type="button" className={!type ? 'is-active' : ''} aria-pressed={!type} onClick={() => setParam({ tyyp: '' })}>Kõik tüübid</button>
              {types.map((facet) => <button type="button" key={facet.key} className={type === facet.key ? 'is-active' : ''} aria-pressed={type === facet.key} onClick={() => setParam({ tyyp: type === facet.key ? '' : facet.key })}>{facet.label} <span>{facet.count}</span></button>)}
              <button type="button" className={onlyFav ? 'is-active' : ''} aria-pressed={onlyFav} onClick={() => setParam({ lemmikud: onlyFav ? '' : '1' })}><Star size={14} /> Lemmikud</button>
              <button type="button" className={onlyMine ? 'is-active' : ''} aria-pressed={onlyMine} onClick={() => setParam({ minu: onlyMine ? '' : '1' })}>Minu loodud</button>
            </div>
            <label className="lib2-sort"><span>Järjestus</span>
              <select value={sort} onChange={(event) => setParam({ jarjestus: event.target.value })}>
                {Object.entries(SORTS).filter(([key]) => key !== 'relevance' || q.trim()).map(([key, label]) => <option value={key} key={key}>{label}</option>)}
              </select>
            </label>
          </div>
          <p className="lib2-count" aria-live="polite">{results.length} materjali{filtersOn ? <> · <button type="button" onClick={() => setSearchParams(new globalThis.URLSearchParams())}>Tühjenda filtrid</button></> : null}</p>

          {results.length ? sections.map((section) => (
            <div className="lib2-section" key={section.key}>
              {section.label ? <h3>{section.level ? <span>{section.level}</span> : null}{section.label}<small>{section.results.length}</small></h3> : null}
              <ul className="lib2-list">{section.results.map(row)}</ul>
            </div>
          )) : <Card><EmptyState title="Midagi ei leitud" description={onlyFav ? 'Lemmikuid pole veel — märgi materjal tärniga.' : 'Proovi teist sõna või tühjenda filtrid.'} /></Card>}
          {results.length > limit ? <div className="lib2-more"><Button variant="secondary" onClick={() => setLimit(limit + PAGE)}>Näita veel ({results.length - limit})</Button></div> : null}
        </section>
      </div>

      <Modal
        open={Boolean(selected)}
        title={selected?.title || 'Õppematerjal'}
        onClose={() => setSelected(null)}
        footer={<>{selected?.kind === 'exercise' ? <a className="button button--secondary" href={legacyUrl(`/haldus-exercises/?exercise=${encodeURIComponent(selected.sourceId)}`)}>Ava töövahend <ArrowRight size={16} /></a> : null}{selected?.kind !== 'exercise' && selected?.sourceId ? <Button variant="secondary" onClick={() => navigate(`/library/lessons/${encodeURIComponent(selected.sourceId)}/worksheets/discover`)}><Sparkles size={16} /> Tunni töölehed</Button> : null}{selected?.kind !== 'exercise' && selected?.sourceId && !usesLessonEngine(selected) ? <Button variant="secondary" onClick={() => navigate(`/library/worksheets/${encodeURIComponent(selected.sourceId)}`)}>{hasStudioDoc(selected) ? 'Muuda töölehte' : 'Loo tööleht'}</Button> : null}<Button variant="secondary" onClick={() => { if (selected?.kind === 'exercise') setExerciseEditing(selected); else setEditing(selected); setSelected(null); }}>Muuda</Button><Button variant="secondary" onClick={() => { setPreviewing(selected); setSelected(null); }}>Eelvaade</Button><Button onClick={() => { setAssigning(selected); setSelected(null); }}>Määra õpilastele</Button></>}
      >
        {selected ? <div className="library-detail"><Badge tone={LIBRARY_TYPES[selected.type]?.tone}>{selected.typeLabel}</Badge><p>{selected.description || 'Materjalil ei ole kirjeldust.'}</p><dl><div><dt>Tase</dt><dd>{selected.level || selected.ageGroup || '—'}</dd></div><div><dt>Moodul</dt><dd>{selected.moduleTitle || selected.curriculum || selected.topic || '—'}</dd></div>{selected.languageFocus ? <div><dt>Keelefookus</dt><dd>{selected.languageFocus}</dd></div> : null}{selected.source?.goal ? <div><dt>Eesmärk</dt><dd>{selected.source.goal}</dd></div> : null}<div><dt>Failid</dt><dd>{selected.fileCount || '—'}</dd></div><div><dt>Muudetud</dt><dd>{shortDate(selected.updatedAt) || '—'}{selected.authorName ? ` · ${selected.authorName}` : ''}</dd></div></dl></div> : null}
      </Modal>
      {previewing ? <MaterialPreview item={previewing} onClose={() => setPreviewing(null)} onEditWorksheet={previewing.sourceId ? openWorksheet : undefined} /> : null}
      {editing !== undefined ? <MaterialEditor item={editing} repository={repository} user={user} onOpenWorksheet={openWorksheet} onPreview={(item) => { setEditing(undefined); setPreviewing(item); }} onClose={() => setEditing(undefined)} onSaved={(result) => { setEditing(undefined); setSuccess(`„${result.title}” ${result.created ? 'loodi' : 'salvestati'}.`); state.reload(); }} /> : null}
      {exerciseEditing !== undefined ? <ExerciseEditor item={exerciseEditing} repository={repository} user={user} onClose={() => setExerciseEditing(undefined)} onSaved={(result) => { setExerciseEditing(undefined); setSuccess(`Harjutus „${result.title}” ${result.created ? 'loodi' : 'salvestati'}.`); state.reload(); }} /> : null}
      {assigning ? <AssignmentModal item={assigning} user={user} repository={repository} studentRepository={studentRepository} groupRepository={groupRepository} onClose={() => setAssigning(null)} onAssigned={(result) => {
        const live = assigning.source?.worksheetDoc?.blocks?.length ? (result.assignments || []).slice(0, 6) : [];
        setAssigning(null);
        setSuccess(<>„{assigning.title}” määrati {result.count} õpilasele.{live.length ? <span className="assign-live-links"> Jälgi tunnis otse: {live.map((a) => <Link key={a.id} to={`/library/worksheets/live/${a.id}`}>{a.studentName || 'õpilane'}</Link>)}</span> : null}</>);
      }} /> : null}
    </div>
  );
}
