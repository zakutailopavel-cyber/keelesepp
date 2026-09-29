import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileImage, FileText } from 'lucide-react';
import { Badge, Card, EmptyState, ErrorState, Input, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import { libraryService } from '../../services/firebase/index.js';
import { CONVERSION_STATUS, conversionQueue, fileKind } from './conversion.js';
import './worksheetStudio.css';

const norm = (v) => String(v || '').toLocaleLowerCase('et').normalize('NFD').replace(/[̀-ͯ]/g, '');

// Migration plan for Õppevara worksheets: generated images and v1 worksheets move to the structured,
// editable format one by one. Opening a row starts the studio with the original shown next to the sheet.
export default function ConversionQueuePage({ repository = libraryService }) {
  const [state, setState] = useState({ loading: true, error: '', lessons: [] });
  const [status, setStatus] = useState('todo');
  const [level, setLevel] = useState('');
  const [query, setQuery] = useState('');

  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    repository.list()
      .then((res) => { if (alive) setState({ loading: false, error: '', lessons: res.curriculumLessons || [] }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error.message || 'Laadimine ebaõnnestus.', lessons: [] }); });
    return () => { alive = false; };
  }, [repository, attempt]);
  const load = () => { setState((s) => ({ ...s, loading: true, error: '' })); setAttempt((n) => n + 1); };

  const queue = useMemo(() => conversionQueue(state.lessons), [state.lessons]);
  const levels = useMemo(() => [...new Set(queue.rows.map((r) => r.level).filter(Boolean))].sort(), [queue.rows]);
  const rows = queue.rows.filter((r) => (
    (status === 'all' || (status === 'todo' ? r.status !== 'done' : r.status === status))
    && (!level || r.level === level)
    && (!query || norm(`${r.title} ${r.topic} ${r.subject}`).includes(norm(query)))
  ));

  return (
    <div className="page-content ws-convert">
      <PageHeader eyebrow="Õppevara" title="Töölehtede üleviimine" description="Genereeritud pildid ja vanad töölehed viiakse ükshaaval uude, muudetavasse vormingusse. Vana versioon jääb alles." />
      {state.loading ? <LoadingState label="Laen õppematerjale…" /> : state.error ? <ErrorState message={state.error} onRetry={load} /> : (
        <>
          <Card className="ws-convert-stats">
            <div><b>{queue.pct}%</b><span>uues vormingus</span></div>
            <div className="ws-convert-bar" aria-label={`Valmis ${queue.counts.done} / ${queue.total}`}><i style={{ width: `${queue.pct}%` }} /></div>
            <ul>
              <li><Badge tone="warning">{queue.counts.image}</Badge> ainult pilt / PDF</li>
              <li><Badge tone="info">{queue.counts.structured}</Badge> vana struktuur</li>
              <li><Badge tone="success">{queue.counts.done}</Badge> valmis</li>
            </ul>
          </Card>
          <div className="ws-convert-filters">
            <Select id="convert-status" label="Olek" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">Tegemata</option>
              <option value="image">Ainult pilt / PDF</option>
              <option value="structured">Vana struktuur</option>
              <option value="done">Valmis</option>
              <option value="all">Kõik</option>
            </Select>
            <Select id="convert-level" label="Tase" value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">Kõik tasemed</option>
              {levels.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
            <Input id="convert-query" label="Otsi" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pealkiri või teema" />
          </div>
          {rows.length === 0 ? <EmptyState title="Siin pole midagi" description="Muuda filtreid." /> : (
            <Card className="ws-convert-list">
              {rows.map((r) => {
                const img = r.files.find((f) => fileKind(f) === 'image');
                const Ico = img ? FileImage : FileText;
                return (
                  <Link key={r.id} to={`/library/worksheets/${r.id}`} className="ws-convert-row">
                    {img ? <img src={img.url} alt="" loading="lazy" /> : <span className="ws-convert-ico"><Ico size={22} /></span>}
                    <span><strong>{r.title}</strong><small>{[r.level, r.topic, r.subject].filter(Boolean).join(' · ') || '—'}</small></span>
                    <Badge tone={CONVERSION_STATUS[r.status].tone}>{CONVERSION_STATUS[r.status].label}</Badge>
                    <span className="ws-convert-go">{r.status === 'done' ? 'Ava' : 'Too üle'} <ArrowRight size={16} /></span>
                  </Link>
                );
              })}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
