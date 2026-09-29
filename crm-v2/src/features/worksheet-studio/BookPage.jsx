/* global setTimeout */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { libraryService } from '../../services/firebase/index.js';
import Sheet from './engine/Sheet.jsx';
import { useFitScale } from './useFitScale.js';
import './engine/sheet.css';
import './worksheetStudio.css';

const DRAFT_KEY = 'ks-worksheet-book-draft';
const norm = (v) => String(v || '').toLocaleLowerCase('et').normalize('NFD').replace(/[̀-ͯ]/g, '');

function readDraft() {
  try { return JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; }
}
function writeDraft(value) {
  try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value)); } catch { /* private mode: the book still works */ }
}

// Book pages share the worksheet page frame (270 mm canvas, A4 on print).
function Cover({ book }) {
  return (
    <div className="ws-root mode-print"><div className="ws-page ws-book-cover">
      <div className="ws-logo">KeeleSepp<small>by EP Koolitus</small></div>
      <div className="ws-book-cover-title">
        {book.level && <div className="ws-big">{book.level}</div>}
        <h1>{book.title || 'Õpik'}</h1>
        {book.subtitle && <p>{book.subtitle}</p>}
      </div>
      <div className="ws-book-cover-foot">{book.author}</div>
    </div></div>
  );
}

function Contents({ entries }) {
  return (
    <div className="ws-root mode-print"><div className="ws-page ws-book-toc">
      <div className="ws-runhead"><span>Sisukord</span><span /></div>
      <ol>{entries.map((e) => <li key={e.id}><span>{e.level ? `${e.level} · ` : ''}{e.title}</span><i /><b>{e.page}</b></li>)}</ol>
    </div></div>
  );
}

// Textbook export: structured worksheets in a chosen order, with cover, contents and running page numbers.
// Print → "Save as PDF" gives the book file; worksheets stay the single source (edit a sheet, the book follows).
export default function BookPage({ repository = libraryService }) {
  const [draft] = useState(readDraft);
  const [state, setState] = useState({ loading: true, error: '', lessons: [] });
  const [book, setBook] = useState(draft?.book || { title: '', subtitle: '', level: '', author: 'EP Koolitus' });
  const [ids, setIds] = useState(draft?.ids || []);
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState({});
  const [fitRef, scale] = useFitScale();

  useEffect(() => {
    let alive = true;
    repository.list()
      .then((res) => { if (alive) setState({ loading: false, error: '', lessons: (res.curriculumLessons || []).filter((l) => l?.worksheetDoc?.blocks?.length) }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error.message || 'Laadimine ebaõnnestus.', lessons: [] }); });
    return () => { alive = false; };
  }, [repository]);

  useEffect(() => { writeDraft({ book, ids }); }, [book, ids]);
  useEffect(() => {
    document.body.classList.add('ws-studio-open');
    return () => document.body.classList.remove('ws-studio-open');
  }, []);

  const byId = useMemo(() => Object.fromEntries(state.lessons.map((l) => [l.id, l])), [state.lessons]);
  const chosen = ids.map((id) => byId[id]).filter(Boolean);
  const available = state.lessons
    .filter((l) => !ids.includes(l.id) && (!query || norm(`${l.title} ${l.level} ${l.topic}`).includes(norm(query))))
    .sort((a, b) => String(a.level).localeCompare(String(b.level), 'et') || String(a.title).localeCompare(String(b.title), 'et'));

  // page 1 cover, page 2 contents, then each sheet continues the numbering
  const entries = chosen.reduce((list, l) => {
    const prev = list[list.length - 1];
    const page = prev ? prev.page + (counts[prev.id] || 1) : 3;
    return [...list, { id: l.id, title: l.worksheetDoc.meta?.title || l.title, level: l.worksheetDoc.meta?.level || l.level, page }];
  }, []);
  const last = entries[entries.length - 1];
  const totalPages = last ? last.page + (counts[last.id] || 1) - 1 : 2;
  const setCount = useCallback((id, n) => setCounts((c) => (c[id] === n ? c : { ...c, [id]: n })), []);
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= ids.length) return; const n = [...ids]; [n[i], n[j]] = [n[j], n[i]]; setIds(n); };

  if (state.loading) return <div className="page-content"><p className="ws-studio-loading">Laen töölehti…</p></div>;
  if (state.error) return <div className="page-content"><div className="ws-studio-error" role="alert">{state.error} <Link to="/library">Tagasi Õppevarasse</Link></div></div>;

  return (
    <div className="ws-studio ws-book-studio">
      <header className="st-bar">
        <Link className="st-back" to="/library"><Icons.ArrowLeft size={16} /> Õppevara</Link>
        <div className="st-title"><b>Õpik töölehtedest</b><span>{chosen.length} töölehte · {totalPages} lk</span></div>
        <div className="st-actions">
          <button type="button" className="st-btn primary" disabled={!chosen.length} onClick={() => setTimeout(() => window.print(), 200)}>PDF / Prindi</button>
        </div>
      </header>
      <div className="st-body">
        <aside className="st-palette ws-book-side" aria-label="Õpiku koostamine">
          <div className="st-group-title">Õpik</div>
          <label className="ed-field"><span>Pealkiri</span><input className="ed-input" value={book.title} onChange={(e) => setBook({ ...book, title: e.target.value })} placeholder="Eesti keel A2" /></label>
          <label className="ed-field"><span>Alapealkiri</span><input className="ed-input" value={book.subtitle} onChange={(e) => setBook({ ...book, subtitle: e.target.value })} /></label>
          <label className="ed-field"><span>Tase</span><input className="ed-input" value={book.level} onChange={(e) => setBook({ ...book, level: e.target.value })} /></label>
          <label className="ed-field"><span>Autor / väljaandja</span><input className="ed-input" value={book.author} onChange={(e) => setBook({ ...book, author: e.target.value })} /></label>

          <div className="st-group-title">Järjekord</div>
          {chosen.length === 0 && <p className="st-hint">Lisa allpool töölehed.</p>}
          <ol className="ws-book-order">
            {chosen.map((l, i) => (
              <li key={l.id}>
                <span>{entries[i].page}. {entries[i].title}</span>
                <button type="button" aria-label={`Üles: ${entries[i].title}`} onClick={() => move(i, -1)}><Icons.ChevronUp size={14} /></button>
                <button type="button" aria-label={`Alla: ${entries[i].title}`} onClick={() => move(i, 1)}><Icons.ChevronDown size={14} /></button>
                <button type="button" aria-label={`Eemalda: ${entries[i].title}`} onClick={() => setIds(ids.filter((x) => x !== l.id))}><Icons.X size={14} /></button>
              </li>
            ))}
          </ol>

          <div className="st-group-title">Töölehed uues vormingus</div>
          <input className="ed-input" aria-label="Otsi töölehti" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Otsi" />
          {available.length === 0 && <p className="st-hint">{state.lessons.length ? 'Kõik on lisatud.' : 'Uues vormingus töölehti veel pole. Koosta või too need üle.'}</p>}
          {available.map((l) => (
            <button type="button" key={l.id} className="st-block" onClick={() => setIds([...ids, l.id])}>
              <Icons.Plus size={15} aria-hidden="true" /><span>{l.worksheetDoc.meta?.title || l.title}</span><em>{l.worksheetDoc.meta?.level || l.level}</em>
            </button>
          ))}
        </aside>
        <main className="st-canvas" ref={fitRef}>
          <div className="st-zoom ws-book" style={{ zoom: scale }}>
            <Cover book={book} />
            <Contents entries={entries} />
            {chosen.map((l, i) => <Sheet key={l.id} doc={l.worksheetDoc} mode="print" startPage={entries[i].page} onPageCount={(n) => setCount(l.id, n)} />)}
          </div>
        </main>
      </div>
    </div>
  );
}
