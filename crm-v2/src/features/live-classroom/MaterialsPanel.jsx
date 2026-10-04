import { FileImage, FileText, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fileKind } from './roomMaterials.js';

// Õppevara image/PDF materials; „Tahvlile” puts one on the open board page (lesson room and teacher workspace).
export default function MaterialsPanel({ library, onPlace }) {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [query, setQuery] = useState('');
  const [placing, setPlacing] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => library.list())
      .then((result) => { if (alive) setState({ loading: false, items: (result.curriculumLessons || []).filter((lesson) => (lesson.files || []).some(fileKind)), error: '' }); })
      .catch((nextError) => { if (alive) setState({ loading: false, items: [], error: nextError?.message || 'Materjale ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [library]);
  const visible = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('et');
    return state.items.filter((lesson) => !q || `${lesson.title} ${lesson.level} ${lesson.topic}`.toLocaleLowerCase('et').includes(q)).slice(0, 60);
  }, [query, state.items]);
  const place = async (file) => {
    setPlacing(file.url);
    try { await onPlace(file); } finally { setPlacing(''); }
  };
  return <div className="lr-materials">
    <label className="lr-search"><Search size={16} /><input aria-label="Otsi materjali" placeholder="Otsi materjali…" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <p className="lr-muted">Pilt või PDF läheb tahvlile — mõlemad saate selle peale kirjutada. Konstruktori töölehed avad nupust „Ülesanded”.</p>
    {state.loading ? <p className="lr-muted">Laen materjale…</p> : null}
    {state.error ? <p className="lr-error" role="alert">{state.error}</p> : null}
    {visible.map((lesson) => <article key={lesson.id} className="lr-material">
      <strong>{lesson.title || 'Materjal'}</strong>
      <small>{[lesson.level, lesson.topic].filter(Boolean).join(' · ')}</small>
      <div>{(lesson.files || []).filter(fileKind).map((file) => <button type="button" key={file.url} disabled={placing === file.url} onClick={() => place(file)}>
        {fileKind(file) === 'pdf' ? <FileText size={14} /> : <FileImage size={14} />}<span>{file.name || 'Fail'}</span><em>Tahvlile</em>
      </button>)}</div>
    </article>)}
    {!state.loading && !visible.length ? <p className="lr-muted">Pildi- või PDF-materjale ei leitud.</p> : null}
  </div>;
}
