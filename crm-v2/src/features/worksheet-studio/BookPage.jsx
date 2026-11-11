import { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icons } from './icons.js';
import { lessonWorksheetsService } from '../../services/firebase/lessonWorksheets.js';
import { libraryService } from '../../services/firebase/library.js';
import { assembleTextbook, BOOK_PHASES, bookContents, programLevels, programModules, programProgress, publishedPhaseDoc, sheetEditorPath, tocPages } from './bookProgram.js';
import Sheet from './engine/Sheet.jsx';
import { BOOK_THEME, Contents, Cover, LessonHead, ModuleOpener, ReviewPage, WordsPage } from './BookPages.jsx';
import { loadBookExtras } from './bookExtras.js';
import { useScreenFlow } from './sheetFlow.js';
import { initialSideOpen, rememberBookPlace, rememberSideOpen, scrollToBookPlace, sheetInView, takeBookPlace } from './bookPlace.js';
import { TABLET_QUERY, screenMatches } from './editor/touchEditing.js';

// A book holds hundreds of sheets: a sheet redraws only when its own props change (its first page number), not on
// every page count another sheet reports (a B1 book of 270 sheets froze the browser, 2026-10-13).
const BookSheet = memo(Sheet);

// A sheet is drawn only when it comes near the screen (owner 2026-10-22: a whole level froze teachers' computers — every
// sheet is drawn twice, once to measure its pages). Until then it is an empty frame of its page height; once drawn it
// stays. „PDF / Prindi” draws all sheets first. Without IntersectionObserver (old browsers, tests) every sheet is drawn.
const PAGE_MM = 392; // a 270 × 381.86 mm sheet page on screen plus the gap between pages
// a phone shows the book as the student's column (docs/WORKSHEET_PHONE_VIEW.md); a tablet keeps the A4 pages
const BOOK_FLOW_QUERY = '(max-width: 760px)';
const SHEET_IDS = new Set(BOOK_PHASES.map((phase) => phase.id));
function BookItem({ item, page, pages, force, rootRef, onPageCount, onEdit, onEditHere, uniform, flow }) {
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
  // one look for the whole book: a sheet with its own theme is drawn in the book theme (the sheet itself is unchanged)
  const doc = useMemo(() => (uniform && item.doc?.meta?.theme !== BOOK_THEME ? { ...item.doc, meta: { ...item.doc.meta, theme: BOOK_THEME } } : item.doc), [item.doc, uniform]);
  const sheetCanDo = item.doc?.meta?.canDo || '';
  const lead = useMemo(() => (item.lesson ? <LessonHead lesson={item.lesson} module={item.module} sheetCanDo={sheetCanDo} /> : null), [item.lesson, item.module, sheetCanDo]);
  // data-entity / data-lesson-id / data-worksheet-id: the marks another tool's right-click menu attaches to
  return (
    <div className={`ws-book-item${item.lesson ? ' is-lesson-start' : ''}`} ref={ref} data-book-item={item.id} data-entity="sheet" data-lesson-id={item.lessonId || item.id} data-worksheet-id={SHEET_IDS.has(item.phase) ? item.phase : undefined}>
      <Link className="st-btn ws-book-edit" to={sheetEditorPath(item)} target="_blank" rel="noopener" title="Avaneb uues vahelehel. Õpikusse jõuab muudatus pärast „Avalda”." onClick={(event) => {
        // a tablet: the same tab (a new tab is awkward there), and „← Õpik” comes back to this sheet
        if (onEditHere && screenMatches('(hover: none)')) { event.preventDefault(); onEditHere(item); return; }
        onEdit?.();
      }}>
        <Icons.PenLine size={15} aria-hidden="true" /> Muuda lehte<span className="sr-only">: {item.title}</span>
      </Link>
      {seen || force
        ? <BookSheet doc={doc} mode="print" startPage={page} onPageCount={onPageCount} running={item.running || null} lead={lead} flow={flow} />
        : <div className="ws-book-placeholder" style={{ height: flow ? `${pages * 900}px` : `${pages * PAGE_MM}mm` }} aria-label={`${item.title} (laaditakse kerimisel)`} />}
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
import { courseForLevel, courseNameForLevel } from '../curriculum/courseNames.js';

// the cover's level: from → to when the course starts a level lower („A2 → B1”, the lessons' levelStage)
const levelSpan = (lessons, level) => {
  const from = lessons.find((lesson) => lesson.levelStage)?.levelStage;
  return from && from !== level && /^[ABC][12]$/.test(from) ? `${from} → ${level}` : level;
};
import './engine/sheet.css';
import './engine/sheetFlow.css';
import './worksheetStudio.css';
import { LoadingState } from '../../components/ui/index.js';

const DRAFT_KEY = 'ks-worksheet-book-draft';

const norm = (v) => String(v || '').toLocaleLowerCase('et').normalize('NFD').replace(/[̀-ͯ]/g, '');

function readDraft() {
  try { return JSON.parse(window.localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; }
}
function writeDraft(value) {
  try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(value)); } catch { /* private mode: the book still works */ }
}

// Textbook export. „Õppekava järgi” is one course as one book: cover, contents by module, and per module an opener,
// its lessons (lesson head + Avasta / Harjuta / Kasuta / Õpik, published versions), the module's words and a review
// page; running head and page numbers on every page. „Vali käsitsi” keeps the old hand-picked book of lesson
// worksheets. Print → "Save as PDF"; the sheets stay the single source.
export default function BookPage({ repository = libraryService, worksheetRepository = lessonWorksheetsService, loadExtras = loadBookExtras }) {
  const [draft] = useState(readDraft);
  const [state, setState] = useState({ loading: true, error: '', lessons: [], all: [] });
  const [mode, setMode] = useState(draft?.mode === 'manual' ? 'manual' : 'program');
  // a draft saved before the 4th sheet „Õpik” was in the book gets it (v2)
  const [program, setProgram] = useState(() => {
    const phases = draft?.program?.phases || BOOK_PHASES.map((phase) => phase.id);
    return {
      level: draft?.program?.level || '',
      module: draft?.program?.module || '',
      phases: draft?.program?.v === 2 || phases.includes('opik') ? phases : [...phases, 'opik'],
      extras: draft?.program?.extras !== false,
      uniform: draft?.program?.uniform !== false,
      v: 2,
    };
  });
  const [built, setBuilt] = useState({ loading: false, error: '', items: [], modules: [], missing: [], key: '' });
  const flow = useScreenFlow(true, BOOK_FLOW_QUERY);
  const [book, setBook] = useState(draft?.book || { title: '', subtitle: '', level: '', author: 'EP Koolitus' });
  const [ids, setIds] = useState(draft?.ids || []);
  const [query, setQuery] = useState('');
  const [counts, setCounts] = useState({});
  const [fitRef, scale] = useFitScale();
  const navigate = useNavigate();
  // the settings on the left fold away so the book gets the width (owner 2026-11-11); a tablet starts with them folded
  const [sideOpen, setSideOpen] = useState(() => initialSideOpen(screenMatches(TABLET_QUERY)));
  const toggleSide = () => setSideOpen((open) => { rememberSideOpen(!open); return !open; });
  // the place in the book to come back to after „Muuda” (bookPlace.js)
  const [returnPlace, setReturnPlace] = useState(takeBookPlace);
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
  const courseName = courseNameForLevel(level) || level;
  const buildKey = `${level}|${chosenModule?.key || ''}|${program.phases.join(',')}|${program.extras ? 'x' : ''}`;
  const latestBuild = useRef('');
  const buildProgram = async () => {
    const key = buildKey;
    latestBuild.current = key;
    setBuilt({ loading: true, error: '', items: [], modules: [], missing: [], key });
    try {
      // the words and goals of this course only (one chunk per course), next to the sheets
      const [records, extras] = await Promise.all([
        Promise.all(scope.map((lesson) => worksheetRepository.list(lesson.id).then((list) => [lesson.id, list]).catch(() => [lesson.id, []]))),
        program.extras ? loadExtras(scope.map((lesson) => lesson.id)).catch(() => ({})) : Promise.resolve({}),
      ]);
      if (latestBuild.current !== key) return;
      const result = assembleTextbook(scope, Object.fromEntries(records), program.phases, { words: extras.words || {}, goals: extras.goals || {}, course: courseName, extras: program.extras });
      setBuilt({ loading: false, error: '', ...result, key });
      // the default title follows the level; a title the teacher typed is kept
      setBook((current) => (!current.title || /^(Eesti keel (A1|A2|B1|B2|C1|C2)|C1 süvakursus)$/.test(current.title)
        ? { ...current, title: courseNameForLevel(level) || `Eesti keel ${level}`, level: levelSpan(scope, level), subtitle: chosenModule ? chosenModule.label : courseForLevel(level)?.subtitle || '' }
        : current));
    } catch (error) {
      if (latestBuild.current === key) setBuilt({ loading: false, error: error.message || 'Õpikut ei saanud koostada.', items: [], modules: [], missing: [], key });
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
        items: current.items.map((sheet) => {
          const records = sheet.kind === 'sheet' ? fresh[sheet.lessonId] : null;
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
  const programBuilt = mode === 'program' && built.key === buildKey;
  const items = mode === 'program'
    ? (programBuilt ? built.items : [])
    : chosen.map((l) => ({ kind: 'sheet', id: l.id, title: l.worksheetDoc.meta?.title || l.title, level: l.worksheetDoc.meta?.level || l.level, doc: l.worksheetDoc }));
  const sheetItems = items.filter((item) => item.kind === 'sheet');
  const pagesOf = (item) => item.pages || counts[item.id] || 1;

  // page 1 cover, then the contents pages, then every item continues the numbering. The contents rows do not depend
  // on the page numbers, so the number of contents pages is known before the numbers are
  const contentsRows = (pageOf) => (mode === 'program'
    ? bookContents(programBuilt ? built.modules : [], items, pageOf)
    : items.map((item) => ({ id: item.id, kind: 'lesson', title: `${item.level ? `${item.level} · ` : ''}${item.title}`, page: pageOf(item.id) })));
  const tocCount = tocPages(contentsRows(() => 0)).length;
  const pageById = {};
  let next = 2 + tocCount;
  for (const item of items) { pageById[item.id] = next; next += pagesOf(item); }
  const totalPages = next - 1;
  const toc = tocPages(contentsRows((id) => pageById[id] ?? null));
  const firstSheetPage = {};
  for (const item of sheetItems) if (!(item.lessonId in firstSheetPage)) firstSheetPage[item.lessonId] = pageById[item.id];
  const wordsPageOf = (module) => pageById[`${module.key}:words`];
  // back from „Muuda”: the same sheet and place once the book is there; again shortly after, as the sheets near it are
  // drawn and grow (a scroll by the teacher meanwhile wins)
  const placeReady = Boolean(returnPlace) && items.some((item) => item.id === returnPlace?.id);
  useEffect(() => {
    if (!placeReady) return undefined;
    const canvas = canvasRef.current;
    let moved = false;
    const stop = () => { moved = true; };
    canvas?.addEventListener('touchstart', stop, { passive: true });
    canvas?.addEventListener('wheel', stop, { passive: true });
    const timers = [0, 350, 900, 1800].map((ms) => globalThis.setTimeout(() => { if (!moved) scrollToBookPlace(canvas, returnPlace); }, ms));
    const done = globalThis.setTimeout(() => setReturnPlace(null), 2000);
    return () => { timers.forEach((t) => globalThis.clearTimeout(t)); globalThis.clearTimeout(done); canvas?.removeEventListener('touchstart', stop); canvas?.removeEventListener('wheel', stop); };
  }, [placeReady]); // eslint-disable-line react-hooks/exhaustive-deps
  // the sheets report their page counts while they lay out; applied once per frame (pageCounter below)
  const [counter] = useState(() => pageCounter(setCounts));
  useEffect(() => () => counter.cancel(), [counter]);
  // „PDF / Prindi”: every sheet is drawn and measured first (page numbers in the contents), a few at a time so the page
  // keeps answering (all 270 at once froze it), then the print dialog opens when the page counts are still
  const PRINT_STEP = 4;
  const [printing, setPrinting] = useState(false);
  const [forced, setForced] = useState(0);
  const measured = sheetItems.filter((item) => counts[item.id]).length;
  const drawing = printing && forced < sheetItems.length;
  useEffect(() => {
    if (!drawing) return undefined;
    const timer = globalThis.setTimeout(() => setForced((n) => n + PRINT_STEP), 30);
    return () => globalThis.clearTimeout(timer);
  }, [drawing, forced]);
  useEffect(() => {
    if (!printing || drawing) return undefined;
    // a sheet that never reports its pages cannot block the dialog
    const timer = globalThis.setTimeout(() => { setPrinting(false); window.print(); }, measured >= sheetItems.length ? 300 : 1500);
    return () => globalThis.clearTimeout(timer);
  }, [printing, drawing, counts, measured, sheetItems.length]);
  const startPrint = () => { setForced(0); setPrinting(true); };
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= ids.length) return; const n = [...ids]; [n[i], n[j]] = [n[j], n[i]]; setIds(n); };

  // „Muuda”: the sheet on the screen (or the one tapped) opens in its editor in this tab; the place is kept for the way back
  const editHere = (item) => {
    const place = sheetInView(canvasRef.current);
    rememberBookPlace({ id: item.id, offset: place?.id === item.id ? place.offset : 0 });
    navigate(sheetEditorPath(item));
  };
  const editInView = () => {
    const place = sheetInView(canvasRef.current);
    const item = sheetItems.find((sheet) => sheet.id === place?.id);
    if (item) editHere(item);
  };
  if (state.loading) return <div className="page-content"><LoadingState label="Laen töölehti…" /></div>;
  if (state.error) return <div className="page-content"><div className="ws-studio-error" role="alert">{state.error} <Link to="/library">Tagasi Õppevarasse</Link></div></div>;

  return (
    <div className={`ws-studio ws-book-studio${flow ? ' ws-narrow ws-book-narrow' : ''}${sideOpen ? '' : ' is-side-closed'}`}>
      <header className="st-bar">
        <Link className="st-back" to="/library"><Icons.ArrowLeft size={16} /> Õppevara</Link>
        <button type="button" className="st-btn st-icon ws-book-side-toggle" aria-expanded={sideOpen} aria-controls="ws-book-side" onClick={toggleSide} title={sideOpen ? 'Peida seaded — õpiku leht saab kogu laiuse' : 'Näita õpiku seadeid'} aria-label={sideOpen ? 'Peida seaded' : 'Näita seadeid'}>{sideOpen ? <Icons.PanelLeftClose size={18} aria-hidden="true" /> : <Icons.PanelLeftOpen size={18} aria-hidden="true" />}</button>
        <div className="st-title"><b>Õpik töölehtedest</b><span>{sheetItems.length} töölehte · {totalPages} lk</span></div>
        <div className="st-seg" role="tablist" aria-label="Õpiku koostamise viis">
          {[['program', 'Õppekava järgi'], ['manual', 'Vali käsitsi']].map(([m, l]) => <button type="button" role="tab" key={m} aria-pressed={mode === m} onClick={() => setMode(m)}>{l}</button>)}
        </div>
        <div className="st-actions">
          <button type="button" className="st-btn ws-book-muuda" disabled={!sheetItems.length || printing} onClick={editInView} title="Ava ekraanil olev leht redaktoris. Pärast „Salvesta” / „Avalda” viib „← Õpik” samale kohale tagasi."><Icons.PenLine size={16} aria-hidden="true" /> Muuda</button>
          <button type="button" className="st-btn primary" disabled={!items.length || printing} title={sheetItems.length > 40 ? 'Enne printimist joonistatakse kõik lehed — suure õpiku puhul võtab see aega' : undefined} onClick={startPrint}>{printing ? `Valmistan… ${Math.min(forced, sheetItems.length)}/${sheetItems.length}` : 'PDF / Prindi'}</button>
        </div>
      </header>
      <div className="st-body">
        {sideOpen ? <aside className="st-palette ws-book-side" id="ws-book-side" aria-label="Õpiku koostamine">
          <div className="st-group-title">Õpik</div>
          <label className="ed-field"><span>Pealkiri</span><input className="ed-input" value={book.title} onChange={(e) => setBook({ ...book, title: e.target.value })} placeholder="Eesti keel A2" /></label>
          <label className="ed-field"><span>Alapealkiri</span><input className="ed-input" value={book.subtitle} onChange={(e) => setBook({ ...book, subtitle: e.target.value })} /></label>
          <label className="ed-field"><span>Tase</span><input className="ed-input" value={book.level} onChange={(e) => setBook({ ...book, level: e.target.value })} /></label>
          <label className="ed-field"><span>Autor / väljaandja</span><input className="ed-input" value={book.author} onChange={(e) => setBook({ ...book, author: e.target.value })} /></label>

          {mode === 'program' ? (
            <>
              <div className="st-group-title">Õppekava</div>
              <label className="ed-field"><span>Kursus</span><select className="ed-input" aria-label="Õpiku kursus" value={level} onChange={(e) => setProgram({ ...program, level: e.target.value, module: '' })}>{levels.map((item) => <option key={item} value={item}>{courseNameForLevel(item) || item}</option>)}</select></label>
              <label className="ed-field"><span>Moodul</span><select className="ed-input" aria-label="Õpiku moodul" value={chosenModule?.key || ''} onChange={(e) => setProgram({ ...program, module: e.target.value })}><option value="">Kõik moodulid ({modules.length})</option>{modules.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
              <fieldset className="ws-book-phases"><legend>Etapid</legend>{BOOK_PHASES.map((phase) => (
                <label key={phase.id}><input type="checkbox" checked={program.phases.includes(phase.id)} onChange={(e) => setProgram({ ...program, phases: e.target.checked ? BOOK_PHASES.map((item) => item.id).filter((id) => id === phase.id || program.phases.includes(id)) : program.phases.filter((id) => id !== phase.id) })} /> {phase.label}</label>
              ))}</fieldset>
              <label className="ed-check"><input type="checkbox" checked={program.extras} onChange={(e) => setProgram({ ...program, extras: e.target.checked })} /> Mooduli avaleht, „Sõnad” ja „Korda”</label>
              <label className="ed-check"><input type="checkbox" checked={program.uniform} onChange={(e) => setProgram({ ...program, uniform: e.target.checked })} /> Ühtne kujundus (kõik lehed õpiku stiilis)</label>
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
                <span>{pageById[items[i].id]}. {items[i].title}</span>
                <button type="button" aria-label={`Üles: ${items[i].title}`} onClick={() => move(i, -1)}><Icons.ChevronUp size={14} /></button>
                <button type="button" aria-label={`Alla: ${items[i].title}`} onClick={() => move(i, 1)}><Icons.ChevronDown size={14} /></button>
                <button type="button" aria-label={`Eemalda: ${items[i].title}`} onClick={() => setIds(ids.filter((x) => x !== l.id))}><Icons.X size={14} /></button>
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
        </aside> : null}
        <main className="st-canvas" ref={canvasNode}>
          <div className="st-zoom ws-book" style={{ zoom: flow ? 1 : scale }}>
            <Cover book={book} stats={mode === 'program' && programBuilt && built.modules.length ? `${built.modules.length} moodulit · ${built.modules.reduce((n, m) => n + m.lessons.length, 0)} tundi` : ''} />
            <Contents pages={toc} course={mode === 'program' ? courseName : book.title} />
            {items.map((item) => {
              const page = pageById[item.id];
              if (item.kind === 'opener') return <ModuleOpener key={item.id} module={item.module} course={courseName} page={page} pageOf={(lessonId) => firstSheetPage[lessonId]} />;
              if (item.kind === 'words') return <WordsPage key={item.id} item={item} course={courseName} page={page} />;
              if (item.kind === 'review') return <ReviewPage key={item.id} item={item} course={courseName} page={page} wordsPage={wordsPageOf(item.module)} />;
              const index = sheetItems.indexOf(item);
              return <BookItem key={item.id} item={item} page={page} pages={counts[item.id] || 2} force={printing && index < forced} rootRef={flow ? null : canvasRef} onPageCount={counter.setter(item.id)} onEdit={() => edited.current.add(item.lessonId || item.id)} onEditHere={editHere} uniform={mode === 'program' ? program.uniform : false} flow={flow} />;
            })}
            {printing ? <p className="ws-studio-loading">Valmistan printimiseks… {Math.min(forced, sheetItems.length)}/{sheetItems.length} lehte</p> : null}
          </div>
        </main>
      </div>
    </div>
  );
}
