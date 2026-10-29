import { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from './icons.js';
import { lessonWorksheetsService, libraryService } from '../../services/firebase/index.js';
import { assembleProgramBook, BOOK_PHASES, programLevels, programModules, programProgress, publishedPhaseDoc, sheetEditorPath } from './bookProgram.js';
import Sheet from './engine/Sheet.jsx';

// A book holds hundreds of sheets: a sheet redraws only when its own props change (its first page number), not on
// every page count another sheet reports (a B1 book of 270 sheets froze the browser, 2026-10-13).
const BookSheet = memo(Sheet);

// A sheet is drawn only when it comes near the screen (owner 2026-10-22: a whole level froze teachers' computers — every
// sheet is drawn twice, once to measure its pages). Until then it is an empty frame of its page height; once drawn it
// stays. „PDF / Prindi” draws all sheets first. Without IntersectionObserver (old browsers, tests) every sheet is drawn.
const PAGE_MM = 392; // a 270 × 381.86 mm sheet page on screen plus the gap between pages
function BookItem({ item, page, pages, force, rootRef, onPageCount, onEdit }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(() => typeof globalThis.IntersectionObserver === 'undefined');
  useEffect(() => {
    if (seen || !ref.current) return undefined;
    const observer = new globalThis.IntersectionObserver((list) => {
      if (list.some((entry) => entry.isIntersecting)) { setSeen(true); observer.disconnect(); }
    }, { root: rootRef?.current || null, rootMargin: '1500px 0px' });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [seen, rootRef]);
  // a sheet drawn for printing stays drawn (state adjusted while rendering, not in an effect)
  if (force && !seen) setSeen(true);
  return (
    <div className="ws-book-item" ref={ref}>
      <Link className="st-btn ws-book-edit" to={sheetEditorPath(item)} target="_blank" rel="noopener" title="Avaneb uues vahelehel. Õpikusse jõuab muudatus pärast „Avalda”." onClick={onEdit}>
        <Icons.PenLine size={15} aria-hidden="true" /> Muuda lehte<span className="sr-only">: {item.title}</span>
      </Link>
      {seen || force
        ? <BookSheet doc={item.doc} mode="print" startPage={page} onPageCount={onPageCount} />
        : <div className="ws-book-placeholder" style={{ height: `${pages * PAGE_MM}mm` }} aria-label={`${item.title} (laaditakse kerimisel)`} />}
    </div>
  );
}

// Page counts reported by the sheets, applied to the book in one batch per task (not one book redraw per sheet), and one
// stable callback per sheet so a memoized sheet is not redrawn for a new function.
function pageCounter(setCounts) {
  let pending = {};
  let frame = 0;
  const callbacks = new Map();
  const flush = () => {
    frame = 0;
    const batch = pending;
    pending = {};
    setCounts((c) => (Object.entries(batch).some(([key, value]) => c[key] !== value) ? { ...c, ...batch } : c));
  };
  const report = (id, n) => {
    pending[id] = n;
    // a timer, not an animation frame: frames stop in a hidden tab and the book would never get its page numbers
    if (!frame) frame = globalThis.setTimeout(flush, 0);
  };
  return {
    setter: (id) => {
      if (!callbacks.has(id)) callbacks.set(id, (n) => report(id, n));
      return callbacks.get(id);
    },
    cancel: () => { if (frame) globalThis.clearTimeout(frame); frame = 0; },
  };
}
import { useFitScale } from './useFitScale.js';
import { applyPrintA4 } from './printPage.js';
import { courseNameForLevel } from '../curriculum/courseNames.js';
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
      <ol>{entries.map((e, i) => [
        e.section && e.section !== entries[i - 1]?.section ? <li key={`${e.id}-section`} className="ws-book-toc-section">{e.section}</li> : null,
        <li key={e.id}><span>{!e.section && e.level ? `${e.level} · ` : ''}{e.title}</span><i /><b>{e.page}</b></li>,
      ])}</ol>
    </div></div>
  );
}

// Textbook export with cover, contents and running page numbers. „Õppekava järgi” assembles the published
// Avasta / Harjuta / Kasuta sheets of a level (or one module) in curriculum order; „Vali käsitsi” keeps the old
// hand-picked book of lesson worksheets. Print → "Save as PDF"; the sheets stay the single source.
export default function BookPage({ repository = libraryService, worksheetRepository = lessonWorksheetsService }) {
  const [draft] = useState(readDraft);
  const [state, setState] = useState({ loading: true, error: '', lessons: [], all: [] });
  const [mode, setMode] = useState(draft?.mode === 'manual' ? 'manual' : 'program');
  const [program, setProgram] = useState({ level: draft?.program?.level || '', module: draft?.program?.module || '', phases: draft?.program?.phases || BOOK_PHASES.map((phase) => phase.id) });
  const [built, setBuilt] = useState({ loading: false, error: '', sheets: [], missing: [], key: '' });
  const [book, setBook] = useState(draft?.book || { title: '', subtitle: '', level: '', author: 'EP Koolitus' });
  const [ids, setIds] = useState(draft?.ids || []);
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState({});
  const [fitRef, scale] = useFitScale();
  // the scrolling canvas: sheets near its visible part are drawn (BookItem)
  const canvasRef = useRef(null);
  const canvasNode = useCallback((node) => { canvasRef.current = node; fitRef(node); }, [fitRef]);

  useEffect(() => {
    let alive = true;
    repository.list()
      .then((res) => { if (alive) setState({ loading: false, error: '', all: res.curriculumLessons || [], lessons: (res.curriculumLessons || []).filter((l) => l?.worksheetDoc?.blocks?.length) }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error.message || 'Laadimine ebaõnnestus.', lessons: [], all: [] }); });
    return () => { alive = false; };
  }, [repository]);

  useEffect(() => { writeDraft({ book, ids, mode, program }); }, [book, ids, mode, program]);
  useEffect(() => {
    return applyPrintA4();
  }, []);

  const byId = useMemo(() => Object.fromEntries(state.lessons.map((l) => [l.id, l])), [state.lessons]);
  const chosen = ids.map((id) => byId[id]).filter(Boolean);
  const available = state.lessons
    .filter((l) => !ids.includes(l.id) && (!query || norm(`${l.title} ${l.level} ${l.topic}`).includes(norm(query))))
    .sort((a, b) => String(a.level).localeCompare(String(b.level), 'et') || String(a.title).localeCompare(String(b.title), 'et'));

  // program mode: levels, modules and readiness from the lesson summaries; sheets are read only on „Koosta õpik”
  const levels = useMemo(() => programLevels(state.all), [state.all]);
  const level = program.level && levels.includes(program.level) ? program.level : levels[0] || '';
  const modules = useMemo(() => programModules(state.all, level), [state.all, level]);
  const chosenModule = modules.find((item) => item.key === program.module) || null;
  const scope = chosenModule ? chosenModule.lessons : modules.flatMap((item) => item.lessons);
  const progress = programProgress(scope);
  const buildKey = `${level}|${chosenModule?.key || ''}|${program.phases.join(',')}`;
  const latestBuild = useRef('');
  const buildProgram = async () => {
    const key = buildKey;
    latestBuild.current = key;
    setBuilt({ loading: true, error: '', sheets: [], missing: [], key });
    try {
      const records = await Promise.all(scope.map((lesson) => worksheetRepository.list(lesson.id).then((list) => [lesson.id, list]).catch(() => [lesson.id, []])));
      if (latestBuild.current !== key) return;
      const result = assembleProgramBook(scope, Object.fromEntries(records), program.phases);
      setBuilt({ loading: false, error: '', ...result, key });
      // the default title follows the level; a title the teacher typed is kept
      setBook((current) => (!current.title || /^(Eesti keel (A1|A2|B1|B2|C1|C2)|C1 süvakursus)$/.test(current.title)
        ? { ...current, title: courseNameForLevel(level) || `Eesti keel ${level}`, level, subtitle: chosenModule ? chosenModule.label : '' }
        : current));
    } catch (error) {
      if (latestBuild.current === key) setBuilt({ loading: false, error: error.message || 'Õpikut ei saanud koostada.', sheets: [], missing: [], key });
    }
  };
  // „✎ Muuda lehte” opens the sheet in its editor in a new tab; when the book tab is shown again the edited sheets are
  // read again, so a published change appears in place (the book keeps its scroll position and does not rebuild)
  const edited = useRef(new Set());
  useEffect(() => {
    const refresh = async () => {
      if (globalThis.document?.visibilityState === 'hidden' || !edited.current.size) return;
      const lessonIds = [...edited.current];
      edited.current = new Set();
      if (mode === 'manual') {
        repository.list().then((res) => setState((current) => ({ ...current, all: res.curriculumLessons || [], lessons: (res.curriculumLessons || []).filter((l) => l?.worksheetDoc?.blocks?.length) }))).catch(() => {});
        return;
      }
      const fresh = Object.fromEntries(await Promise.all(lessonIds.map((id) => worksheetRepository.list(id).then((list) => [id, list]).catch(() => [id, null]))));
      setBuilt((current) => ({
        ...current,
        sheets: current.sheets.map((sheet) => {
          const records = fresh[sheet.lessonId];
          if (!records) return sheet;
          const doc = publishedPhaseDoc(records.find((record) => (record.worksheetId || record.id) === sheet.phase));
          return doc && doc !== sheet.doc ? { ...sheet, doc } : sheet;
        }),
      }));
    };
    globalThis.document?.addEventListener('visibilitychange', refresh);
    globalThis.addEventListener?.('focus', refresh);
    return () => { globalThis.document?.removeEventListener('visibilitychange', refresh); globalThis.removeEventListener?.('focus', refresh); };
  }, [mode, repository, worksheetRepository]);

  // the book assembles itself for the chosen level / module (owner, 2026-10-10: an empty book until a button press
  // looked broken); „Koosta õpik” stays to rebuild after sheets were published
  useEffect(() => {
    if (mode !== 'program' || state.loading || !scope.length || !program.phases.length || latestBuild.current === buildKey) return;
    globalThis.queueMicrotask(buildProgram);
  }, [buildKey, mode, state.loading]); // eslint-disable-line react-hooks/exhaustive-deps
  const programSheets = built.key === buildKey ? built.sheets : [];
  const items = mode === 'program'
    ? programSheets
    : chosen.map((l) => ({ id: l.id, title: l.worksheetDoc.meta?.title || l.title, level: l.worksheetDoc.meta?.level || l.level, doc: l.worksheetDoc }));

  // page 1 cover, page 2 contents, then each sheet continues the numbering
  const entries = items.reduce((list, item) => {
    const prev = list[list.length - 1];
    const page = prev ? prev.page + (counts[prev.id] || 1) : 3;
    return [...list, { id: item.id, title: item.title, level: item.level, section: item.section || '', page }];
  }, []);
  const last = entries[entries.length - 1];
  const totalPages = last ? last.page + (counts[last.id] || 1) - 1 : 2;
  // the sheets report their page counts while they lay out; applied once per frame (pageCounter below)
  const [counter] = useState(() => pageCounter(setCounts));
  useEffect(() => () => counter.cancel(), [counter]);
  // „PDF / Prindi”: every sheet is drawn and measured first (page numbers in the contents), a few at a time so the page
  // keeps answering (all 270 at once froze it), then the print dialog opens when the page counts are still
  const PRINT_STEP = 4;
  const [printing, setPrinting] = useState(false);
  const [forced, setForced] = useState(0);
  const measured = items.filter((item) => counts[item.id]).length;
  const drawing = printing && forced < items.length;
  useEffect(() => {
    if (!drawing) return undefined;
    const timer = globalThis.setTimeout(() => setForced((n) => n + PRINT_STEP), 30);
    return () => globalThis.clearTimeout(timer);
  }, [drawing, forced]);
  useEffect(() => {
    if (!printing || drawing) return undefined;
    // a sheet that never reports its pages cannot block the dialog
    const timer = globalThis.setTimeout(() => { setPrinting(false); window.print(); }, measured >= items.length ? 300 : 1500);
    return () => globalThis.clearTimeout(timer);
  }, [printing, drawing, counts, measured, items.length]);
  const startPrint = () => { setForced(0); setPrinting(true); };
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= ids.length) return; const n = [...ids]; [n[i], n[j]] = [n[j], n[i]]; setIds(n); };

  if (state.loading) return <div className="page-content"><p className="ws-studio-loading">Laen töölehti…</p></div>;
  if (state.error) return <div className="page-content"><div className="ws-studio-error" role="alert">{state.error} <Link to="/library">Tagasi Õppevarasse</Link></div></div>;

  return (
    <div className="ws-studio ws-book-studio">
      <header className="st-bar">
        <Link className="st-back" to="/library"><Icons.ArrowLeft size={16} /> Õppevara</Link>
        <div className="st-title"><b>Õpik töölehtedest</b><span>{items.length} töölehte · {totalPages} lk</span></div>
        <div className="st-seg" role="tablist" aria-label="Õpiku koostamise viis">
          {[['program', 'Õppekava järgi'], ['manual', 'Vali käsitsi']].map(([m, l]) => <button type="button" role="tab" key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>{l}</button>)}
        </div>
        <div className="st-actions">
          <button type="button" className="st-btn primary" disabled={!items.length || printing} title={items.length > 40 ? 'Enne printimist joonistatakse kõik lehed — suure õpiku puhul võtab see aega' : undefined} onClick={startPrint}>{printing ? `Valmistan… ${Math.min(forced, items.length)}/${items.length}` : 'PDF / Prindi'}</button>
        </div>
      </header>
      <div className="st-body">
        <aside className="st-palette ws-book-side" aria-label="Õpiku koostamine">
          <div className="st-group-title">Õpik</div>
          <label className="ed-field"><span>Pealkiri</span><input className="ed-input" value={book.title} onChange={(e) => setBook({ ...book, title: e.target.value })} placeholder="Eesti keel A2" /></label>
          <label className="ed-field"><span>Alapealkiri</span><input className="ed-input" value={book.subtitle} onChange={(e) => setBook({ ...book, subtitle: e.target.value })} /></label>
          <label className="ed-field"><span>Tase</span><input className="ed-input" value={book.level} onChange={(e) => setBook({ ...book, level: e.target.value })} /></label>
          <label className="ed-field"><span>Autor / väljaandja</span><input className="ed-input" value={book.author} onChange={(e) => setBook({ ...book, author: e.target.value })} /></label>

          {mode === 'program' ? (
            <>
              <div className="st-group-title">Õppekava</div>
              <label className="ed-field"><span>Tase</span><select className="ed-input" aria-label="Õpiku tase" value={level} onChange={(e) => setProgram({ ...program, level: e.target.value, module: '' })}>{levels.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label className="ed-field"><span>Moodul</span><select className="ed-input" aria-label="Õpiku moodul" value={chosenModule?.key || ''} onChange={(e) => setProgram({ ...program, module: e.target.value })}><option value="">Kõik moodulid ({modules.length})</option>{modules.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
              <fieldset className="ws-book-phases"><legend>Etapid</legend>{BOOK_PHASES.map((phase) => (
                <label key={phase.id}><input type="checkbox" checked={program.phases.includes(phase.id)} onChange={(e) => setProgram({ ...program, phases: e.target.checked ? BOOK_PHASES.map((item) => item.id).filter((id) => id === phase.id || program.phases.includes(id)) : program.phases.filter((id) => id !== phase.id) })} /> {phase.label}</label>
              ))}</fieldset>
              <p className="st-hint ws-book-progress" aria-label="Valmidus">{progress.map((item) => `${item.label} ${item.done}/${item.total}`).join(' · ')}</p>
              <button type="button" className="st-btn primary" disabled={!scope.length || !program.phases.length || built.loading} onClick={buildProgram}>{built.loading ? 'Koostan…' : 'Koosta õpik'}</button>
              {built.error ? <p className="st-hint" role="alert">{built.error}</p> : null}
              {built.key === buildKey && !built.loading && built.missing.length ? (
                <details className="ws-book-missing"><summary>Puudu {built.missing.length} avaldatud lehte</summary><ul>{built.missing.slice(0, 60).map((item) => <li key={`${item.lessonId}:${item.phase}`}><Link to={`/library/lessons/${encodeURIComponent(item.lessonId)}/worksheets/${item.phase}`}>{item.title}</Link></li>)}</ul></details>
              ) : null}
            </>
          ) : null}
          {mode === 'manual' ? <>
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
          </> : null}
        </aside>
        <main className="st-canvas" ref={canvasNode}>
          <div className="st-zoom ws-book" style={{ zoom: scale }}>
            <Cover book={book} />
            <Contents entries={entries} />
            {items.map((item, i) => (
              <BookItem key={item.id} item={item} page={entries[i].page} pages={counts[item.id] || 2} force={printing && i < forced} rootRef={canvasRef} onPageCount={counter.setter(item.id)} onEdit={() => edited.current.add(item.lessonId || item.id)} />
            ))}
            {printing ? <p className="ws-studio-loading">Valmistan printimiseks… {Math.min(forced, items.length)}/{items.length} lehte</p> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
