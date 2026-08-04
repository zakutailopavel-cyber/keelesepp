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
import { Badge, Card, EmptyState, ErrorState, LoadingState, Modal, PageHeader, Select } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { libraryService } from '../../services/firebase/index.js';
import { legacyUrl } from '../../utils/legacyUrls.js';
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

function readPath(params) {
  return Object.fromEntries(Object.entries(pathFields).map(([field, parameter]) => [field, params.get(parameter) || '']));
}

export default function LibraryPage({ repository = defaultRepository }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [selected, setSelected] = useState(null);
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
        footer={<><button className="button button--secondary" onClick={() => setSelected(null)}>Sulge</button><a className="button button--primary" href={legacyUrl(selected?.kind === 'exercise' ? `/haldus-exercises/?exercise=${encodeURIComponent(selected.sourceId)}` : '/haldus-exercises/')}>Ava töövahend <ArrowRight size={16} /></a></>}
      >
        {selected ? <div className="library-detail"><Badge tone={LIBRARY_TYPES[selected.type]?.tone}>{selected.typeLabel}</Badge><p>{selected.description || 'Materjalil ei ole kirjeldust.'}</p><dl><div><dt>Õppeaine</dt><dd>{selected.subject || '—'}</dd></div><div><dt>Tase või vanus</dt><dd>{selected.level || selected.ageGroup || '—'}</dd></div><div><dt>Teema</dt><dd>{selected.curriculum || selected.topic || '—'}</dd></div><div><dt>Andmeallikas</dt><dd>{selected.kind === 'exercise' ? 'Harjutused' : 'Õppekava'}</dd></div></dl></div> : null}
      </Modal>
    </div>
  );
}
