import { ArrowUpRight, ChevronDown, Circle, ClipboardList, Copy, Crosshair, Eraser, Highlighter, FilePlus2, FileText, MousePointerClick, Pencil, Hand, ImagePlus, Maximize, Minus, MousePointer2, PenLine, Plus, Shapes, Square, StickyNote, Trash2, Type } from 'lucide-react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { COLORS, FONTS, NOTE_COLORS, ROOM_COLORS, SIZES, arrowHead, clampPoint, clampView, fitPage, fitView, fitWidth, WORKSHEET_WIDTH, worksheetPageTitle, fontCss, imageSize, movable, pageBounds, pathFor, screenToWorld, shapeFromDrag, teacherMaterial, textAt, textBox, wheelView, zoomAt, pinchView,
  BACKGROUNDS, MARKER_COLORS, backgroundOf, copyData, frameFrom, growBounds, isMarker, markerColor, markerWidth, movePatch, resizePatch, touchesBox, unionBounds } from './boardModel.js';
import './board.css';

const TOOLS = [
  ['select', 'Vali ja liiguta', MousePointer2],
  ['pen', 'Pliiats', PenLine],
  ['marker', 'Marker', Highlighter],
  ['note', 'Märkmepaber', StickyNote],
  ['text', 'Tekst', Type],
  ['rect', 'Ristkülik', Square],
  ['ellipse', 'Ellips', Circle],
  ['arrow', 'Nool', ArrowUpRight],
  ['eraser', 'Kustutaja', Eraser],
  ['hand', 'Liiguta tahvlit', Hand],
];
// on a worksheet page: click into the worksheet (answer) instead of drawing on top of it
const FILL_TOOL = ['fill', 'Täida töölehte', MousePointerClick];
// Live Classroom, teacher: a pointer the student sees on the same page (sent over the call, nothing is saved)
const LASER_TOOL = ['laser', 'Osuti', Crosshair];
const SHAPES = TOOLS.filter(([key]) => ['rect', 'ellipse', 'arrow'].includes(key));
const META = ['id', 'updatedAt', 'updatedByUid', 'updatedByName', 'lastClientId', 'revision'];
const plain = (element) => Object.fromEntries(Object.entries(element).filter(([key]) => !META.includes(key)));
const HISTORY_LIMIT = 50;

/**
 * The student's persistent board (and the v1 lesson pages), shared live by the student, parents and the teacher.
 * variant="room" is the Live Classroom layout: floating tool dock, style panel, zoom badge; the room drives undo/redo
 * and inserts materials through `controllerRef`, and gets the history state through `onHistoryChange`.
 */
export default function StudentBoard({
  studentId, user, staff = false, service = studentBoardService, variant = 'page',
  controllerRef, onHistoryChange, uploadImage, newPageTitle, initialPageId = '', worksheet: singleWorksheet = null, worksheets: worksheetList = null,
  onPageChange, onPointer, pointer = null,
}) {
  const room = variant === 'room';
  const [pages, setPages] = useState([]);
  const [pageId, setPageId] = useState(initialPageId || null);
  // Elements of the open page; tagged with the page they belong to, so a page switch never shows stale elements.
  const [loaded, setLoaded] = useState({ key: '', items: [] });
  const [error, setError] = useState('');
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const [size, setSize] = useState('M');
  const [font, setFont] = useState('sans');
  const [width, setWidth] = useState(SIZES.M.pen);
  const [shapesOpen, setShapesOpen] = useState(false);
  const [stylesOpen, setStylesOpen] = useState(() => !globalThis.matchMedia?.('(max-width: 760px)')?.matches);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null);
  const [history, setHistory] = useState({ undo: [], redo: [] });
  const [uploading, setUploading] = useState(false);
  // selection (tool „Vali”): ids; while dragging, the moved / resized preview and the selection frame
  const [selected, setSelected] = useState([]);
  const [moving, setMoving] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [marquee, setMarquee] = useState(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [marker, setMarker] = useState(MARKER_COLORS[0]);
  const clipboard = useRef([]);
  // the paper of each page (dots, grid, lines, plain), shared by everyone with the board
  const [backgrounds, setBackgrounds] = useState({});
  useEffect(() => {
    if (!service.subscribeBackgrounds) return undefined;
    try { return service.subscribeBackgrounds(studentId, setBackgrounds, () => setBackgrounds({})); } catch { return undefined; }
  }, [service, studentId]);
  const svgRef = useRef(null);
  const gesture = useRef(null);
  const fileInput = useRef(null);

  useEffect(() => service.subscribePages(studentId, setPages, () => setPages([])), [service, studentId]);
  const pageKey = `${studentId}/${pageId || 'board'}`;
  // Every page is fitted once when it opens; later changes keep the user's own zoom and position.
  const fitted = useRef(new Set());
  useEffect(() => service.subscribeElements(
    studentId,
    pageId,
    (items) => {
      const key = `${studentId}/${pageId || 'board'}`;
      setLoaded({ key, items });
      if (!fitted.current.has(key) && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        if (rect.width && rect.height) {
          fitted.current.add(key);
          // content readable first (a teacher's material on a phone); an empty page shows its whole sheet
          setView(items.length ? fitView(items, rect.width, rect.height) : fitPage(pageBounds(items), rect.width, rect.height));
        }
      }
    },
    (nextError) => { setLoaded({ key: `${studentId}/${pageId || 'board'}`, items: [] }); setError(nextError?.message || 'Tahvlit ei saanud laadida.'); },
  ), [service, studentId, pageId]);
  const pageTitle = pageId ? pages.find((page) => page.id === pageId)?.title || '' : '';
  useEffect(() => { onPageChange?.(pageId || '', pageTitle); }, [onPageChange, pageId, pageTitle]);
  const ready = loaded.key === pageKey;
  const elements = useMemo(() => (ready ? loaded.items : []), [ready, loaded.items]);

  const byId = useMemo(() => new Map(elements.map((element) => [element.id, element])), [elements]);
  // The open worksheet (Live Classroom) is a page of the board: it lies under the drawing layer, moves and zooms with
  // the board, and what is drawn on top of it is stored on its own lesson page „Tööleht: <title>”.
  // Several worksheets can be open in one lesson (newest first); each has its own page „Tööleht: <title>”.
  const sheets = useMemo(() => (worksheetList?.length ? worksheetList : singleWorksheet ? [singleWorksheet] : []), [worksheetList, singleWorksheet]);
  const sheetPageOf = useCallback((sheet) => (sheet ? pages.find((page) => page.title === worksheetPageTitle(sheet.title)) || null : null), [pages]);
  const sheetPageIds = useMemo(() => new Set(sheets.map(sheetPageOf).filter(Boolean).map((page) => page.id)), [sheets, sheetPageOf]);
  // the newest sheet takes over the board when it opens; the page on screen decides which sheet lies under the drawing
  const worksheet = sheets[0] || null;
  const worksheetPage = sheetPageOf(worksheet);
  const activeSheet = sheets.find((sheet) => sheetPageOf(sheet)?.id === pageId) || null;
  const onWorksheet = Boolean(activeSheet);
  const underlayRef = useRef(null);
  const [underlayHeight, setUnderlayHeight] = useState(1000);
  useEffect(() => {
    const node = underlayRef.current;
    if (!onWorksheet || !node || !globalThis.ResizeObserver) return undefined;
    const observer = new globalThis.ResizeObserver(() => setUnderlayHeight(Math.max(400, Math.ceil(node.offsetHeight || 0))));
    observer.observe(node);
    return () => observer.disconnect();
  }, [onWorksheet]);
  const bounds = useMemo(() => pageBounds(elements, 40, onWorksheet ? { w: WORKSHEET_WIDTH, h: underlayHeight + 40 } : undefined), [elements, onWorksheet, underlayHeight]);
  const screenSize = () => { const rect = svgRef.current?.getBoundingClientRect(); return [rect?.width || 0, rect?.height || 0]; };
  // every pan and zoom keeps part of the sheet on screen
  const moveView = (update) => setView((current) => clampView(typeof update === 'function' ? update(current) : update, bounds, ...screenSize()));
  const fail = (message) => (nextError) => setError(nextError?.message || message);
  const local = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const drawBounds = growBounds(bounds);
  const canEdit = (element) => staff || !teacherMaterial(element);
  const selectedElements = elements.filter((element) => selected.includes(element.id) && movable(element) && canEdit(element));
  const pageKeyName = pageId || 'board';
  const paper = backgroundOf(backgrounds, pageKeyName);
  const chooseBackground = (key) => {
    setBackgrounds((current) => ({ ...current, [pageKeyName]: key }));
    service.setBackground?.(studentId, pageKeyName, key, user).catch(fail('Tausta ei saanud muuta.'));
  };
  const preset = SIZES[size] || SIZES.M;
  const shapeWidth = Math.max(1, Math.round(width * 0.75));

  // ── own-action history (undo/redo) ─────────────────────────────
  const record = useCallback((entry) => setHistory((current) => ({ undo: [...current.undo, entry].slice(-HISTORY_LIMIT), redo: [] })), []);
  const choosePage = (next) => { setPageId(next); setHistory({ undo: [], redo: [] }); setEditing(null); setSelected([]); };
  const add = useCallback((input, message) => {
    const data = staff ? { ...input, byStaff: true } : input;
    return service.add(studentId, pageId, data, user)
    .then((id) => { record({ op: 'add', id, data }); return id; })
    .catch((nextError) => { setError(nextError?.message || message); return null; });
  }, [pageId, record, service, staff, studentId, user]);
  const update = (element, patch, message) => {
    const before = Object.fromEntries(Object.keys(patch).map((key) => [key, element[key]]));
    return service.update(studentId, pageId, element, patch, user)
      .then(() => record({ op: 'update', id: element.id, before, after: patch }))
      .catch(fail(message));
  };
  const erase = (element) => service.remove(studentId, pageId, element.id)
    .then(() => record({ op: 'remove', id: element.id, data: plain(element) }))
    .catch(fail('Elementi ei saanud kustutada.'));
  // several elements at once (move, resize, delete, copy) are one step for „Võta tagasi”
  const changeMany = (pairs, message) => Promise.all(pairs.map(({ element, patch }) => service.update(studentId, pageId, element, patch, user)))
    .then(() => record({ op: 'batch', entries: pairs.map(({ element, patch }) => ({ op: 'update', id: element.id, before: Object.fromEntries(Object.keys(patch).map((key) => [key, element[key]])), after: patch })) }))
    .catch(fail(message));
  const eraseMany = (list) => Promise.all(list.map((element) => service.remove(studentId, pageId, element.id)))
    .then(() => record({ op: 'batch', entries: list.map((element) => ({ op: 'remove', id: element.id, data: plain(element) })) }))
    .catch(fail('Elementi ei saanud kustutada.'));
  const addMany = (list) => {
    const marked = list.map((data) => (staff ? { ...data, byStaff: true } : data));
    return Promise.all(marked.map((data) => service.add(studentId, pageId, data, user)))
      .then((ids) => { record({ op: 'batch', entries: ids.map((id, index) => ({ op: 'add', id, data: marked[index] })) }); setSelected(ids); return ids; })
      .catch(fail('Kopeerimine ebaõnnestus.'));
  };

  // apply an entry backwards (undo) or forwards (redo); returns the entry with its current element id
  const apply = useCallback(async (first, backwards) => {
    const one = async (entry) => {
      if (entry.op === 'batch') {
        const list = backwards ? [...entry.entries].reverse() : entry.entries;
        const done = [];
        for (const item of list) done.push(await one(item));
        return { ...entry, entries: backwards ? done.reverse() : done };
      }
      const removeIt = (entry.op === 'add') === backwards;
      if (entry.op === 'update') {
        const element = byId.get(entry.id);
        if (!element) throw new Error('Element on vahepeal kustutatud.');
        await service.update(studentId, pageId, element, backwards ? entry.before : entry.after, user);
        return entry;
      }
      if (removeIt) { await service.remove(studentId, pageId, entry.id); return entry; }
      const id = await service.add(studentId, pageId, entry.data, user);
      return { ...entry, id };
    };
    return one(first);
  }, [byId, pageId, service, studentId, user]);
  const undo = useCallback(() => {
    const entry = history.undo.at(-1);
    if (!entry) return;
    setHistory((current) => ({ undo: current.undo.slice(0, -1), redo: current.redo }));
    apply(entry, true).then((next) => setHistory((current) => ({ undo: current.undo, redo: [...current.redo, next] })))
      .catch((nextError) => setError(nextError?.message || 'Tagasivõtmine ebaõnnestus.'));
  }, [apply, history.undo]);
  const redo = useCallback(() => {
    const entry = history.redo.at(-1);
    if (!entry) return;
    setHistory((current) => ({ undo: current.undo, redo: current.redo.slice(0, -1) }));
    apply(entry, false).then((next) => setHistory((current) => ({ undo: [...current.undo, next], redo: current.redo })))
      .catch((nextError) => setError(nextError?.message || 'Uuesti tegemine ebaõnnestus.'));
  }, [apply, history.redo]);
  const canUndo = history.undo.length > 0;
  const canRedo = history.redo.length > 0;
  useEffect(() => { onHistoryChange?.({ canUndo, canRedo }); }, [canUndo, canRedo, onHistoryChange]);

  // A material (image or PDF) placed in the middle of the visible board, scaled to fit about two thirds of it.
  const insertFile = useCallback(async ({ url, name = '', kind = 'image', width: naturalW = 1000, height: naturalH = 1400, storagePath = '' }) => {
    if (!staff && kind !== 'image') throw new Error('Materjali saab tahvlile lisada õpetaja.');
    const rect = svgRef.current?.getBoundingClientRect();
    const box = { w: rect?.width || 900, h: rect?.height || 600 };
    const fitScale = Math.min((box.w * 0.66) / view.scale / naturalW, (box.h * 0.9) / view.scale / naturalH, 1.5);
    const w = Math.round(naturalW * fitScale);
    const h = Math.round(naturalH * fitScale);
    const center = screenToWorld({ x: box.w / 2, y: box.h / 2 }, view);
    const data = { type: kind === 'pdf' ? 'pdf' : 'image', x: Math.round(center.x - w / 2), y: Math.round(center.y - h / 2), w, h, url, locked: false, ...(storagePath ? { storagePath } : {}), ...(kind === 'pdf' ? { name: String(name).slice(0, 300) } : {}), ...(staff ? {} : { byStudent: true }) };
    return add(data, 'Materjali ei saanud tahvlile lisada.');
  }, [add, staff, view]);
  const newPage = useCallback(async (title) => {
    const id = await service.addPage(studentId, title || newPageTitle || `Leht ${pages.length + 1}`, pages.length + 1, user);
    choosePage(id);
    return id;
  }, [newPageTitle, pages.length, service, studentId, user]);
  // a newly opened worksheet takes over the board for both: the teacher creates its page once, everyone switches to it
  const [wantWorksheet, setWantWorksheet] = useState('');
  const creatingWorksheet = useRef('');
  useEffect(() => { if (worksheet?.id) setWantWorksheet(worksheet.id); }, [worksheet?.id]);
  useEffect(() => {
    if (!wantWorksheet || !worksheet || wantWorksheet !== worksheet.id) return;
    if (worksheetPage) {
      setWantWorksheet('');
      if (pageId !== worksheetPage.id) choosePage(worksheetPage.id);
      setTool('fill');
      return;
    }
    if (staff && creatingWorksheet.current !== worksheet.id) {
      creatingWorksheet.current = worksheet.id;
      service.addPage(studentId, worksheetPageTitle(worksheet.title), pages.length + 1, user).catch(fail('Töölehe lehte ei saanud luua.'));
    }
  }, [wantWorksheet, worksheet, worksheetPage, staff]); // eslint-disable-line react-hooks/exhaustive-deps
  // a worksheet page opens with its width on screen, from the top
  const fittedWorksheet = useRef('');
  useEffect(() => {
    if (!onWorksheet || fittedWorksheet.current === pageId) return;
    const [width] = screenSize();
    if (!width) return;
    fittedWorksheet.current = pageId;
    setView(fitWidth(bounds, width));
  }, [onWorksheet, pageId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!onWorksheet && tool === 'fill') setTool('pen'); }, [onWorksheet, tool]);
  // the pointer disappears for the student when the teacher puts it away
  useEffect(() => { if (tool !== 'laser') onPointer?.(null); }, [onPointer, tool]);

  // opens a worksheet of the lesson (the newest one without an id); its page is created when it does not exist yet
  const openWorksheet = useCallback((sheetId = '') => {
    const target = sheets.find((sheet) => sheet.id === sheetId) || worksheet;
    if (!target) return;
    const page = sheetPageOf(target);
    if (page) { choosePage(page.id); setTool('fill'); return; }
    if (target.id === worksheet?.id) { setWantWorksheet(target.id); return; }
    if (staff) service.addPage(studentId, worksheetPageTitle(target.title), pages.length + 1, user).then((id) => { choosePage(id); setTool('fill'); }).catch(fail('Töölehe lehte ei saanud luua.'));
  }, [sheets, worksheet, sheetPageOf, staff, service, studentId, pages.length, user]); // eslint-disable-line react-hooks/exhaustive-deps
  useImperativeHandle(controllerRef, () => ({ undo, redo, insertFile, newPage, selectPage: choosePage, openWorksheet }), [insertFile, newPage, openWorksheet, redo, undo]);

  // rename a lesson page: double click its tab or the pencil next to the open page
  const [renaming, setRenaming] = useState(null);
  const saveRename = () => {
    const current = renaming;
    setRenaming(null);
    const page = pages.find((item) => item.id === current?.id);
    if (!page || !current.title.trim() || current.title.trim() === page.title) return;
    service.renamePage(studentId, page.id, current.title, user).catch(fail('Lehte ei saanud ümber nimetada.'));
  };
  const pageTabs = (className) => <div className={className} role="tablist" aria-label="Tahvli lehed">
    <button type="button" role="tab" aria-selected={pageId === null} onClick={() => choosePage(null)}>Tahvel</button>
    {pages.map((page) => (renaming?.id === page.id
      ? <input key={page.id} className="sb-page-rename" aria-label="Lehe nimi" autoFocus maxLength={200} value={renaming.title}
        onChange={(event) => setRenaming({ ...renaming, title: event.target.value })} onBlur={saveRename}
        onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); if (event.key === 'Escape') setRenaming(null); }} />
      : <button type="button" role="tab" key={page.id} aria-selected={pageId === page.id} className={sheetPageIds.has(page.id) ? 'is-worksheet' : ''} title="Topeltklõps: nimeta ümber" onClick={() => { choosePage(page.id); if (sheetPageIds.has(page.id)) setTool('fill'); }} onDoubleClick={() => setRenaming({ id: page.id, title: page.title || '' })}>{sheetPageIds.has(page.id) ? <ClipboardList size={13} aria-hidden="true" /> : null}{page.title || 'Leht'}</button>))}
    {pageId && !renaming ? <button type="button" className="sb-page-tool" aria-label="Nimeta leht ümber" title="Nimeta leht ümber" onClick={() => { const page = pages.find((item) => item.id === pageId); if (page) setRenaming({ id: page.id, title: page.title || '' }); }}><Pencil size={14} /></button> : null}
    <button type="button" className="sb-page-tool sb-room-newpage" aria-label="Uus leht" title="Uus leht" onClick={() => newPage().catch(fail('Uut lehte ei saanud luua.'))}><FilePlus2 size={15} /></button>
    <span className={ready ? 'sb-sync is-ready' : 'sb-sync'}>{ready ? 'Sünkroonitud' : 'Ühendan…'}</span>
  </div>;

  // while a text is open for editing, the font, size and colour buttons change that text
  const editingText = () => { const element = byId.get(editing?.id); return element?.type === 'text' ? element : null; };
  const restyle = (patch) => {
    const element = editingText();
    if (!element) return;
    const next = { ...element, ...patch };
    update(element, { ...patch, ...textBox(editing?.text ?? element.text, next.fontSize || 18, 120) }, 'Teksti ei saanud muuta.');
  };
  const pickSize = (key) => { setSize(key); setWidth(SIZES[key].pen); restyle({ fontSize: SIZES[key].font }); };
  const pickFont = (key) => { setFont(key); restyle({ fontFamily: key }); };

  const down = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    setError('');
    setShapesOpen(false);
    const screen = local(event);
    const raw = screenToWorld(screen, view);
    // drawing may go past the edge of the sheet: the sheet grows to hold it
    const world = clampPoint(raw, drawBounds);
    const target = byId.get(event.target?.closest?.('[data-element-id]')?.dataset?.elementId);
    if (tool === 'laser') { onPointer?.({ x: Math.round(world.x), y: Math.round(world.y) }); return; }
    if (tool === 'hand' || spaceHeld) {
      gesture.current = { kind: 'pan', start: screen, view };
    } else if (tool === 'eraser') {
      if (target?.locked) { setError('Õpetaja materjal on lukus ja seda ei saa kustutada.'); return; }
      if (!staff && teacherMaterial(target)) { setError('Õpetaja lisatud osa saab kustutada ainult õpetaja.'); return; }
      if (target) erase(target);
      return;
    } else if (tool === 'select') {
      if (event.target?.dataset?.handle && selectedElements.length === 1) {
        gesture.current = { kind: 'resize', element: selectedElements[0], start: raw };
      } else if (movable(target) && canEdit(target)) {
        const has = selected.includes(target.id);
        const ids = event.shiftKey ? (has ? selected.filter((id) => id !== target.id) : [...selected, target.id]) : (has ? selected : [target.id]);
        setSelected(ids);
        gesture.current = { kind: 'move', ids, start: raw, dx: 0, dy: 0 };
      } else {
        // empty place (or the teacher's material for a student): drag a frame to select several
        gesture.current = { kind: 'marquee', start: raw, add: event.shiftKey };
      }
    } else if (tool === 'pen' || tool === 'marker') {
      const style = tool === 'marker' ? { color: markerColor(marker), strokeWidth: markerWidth(width) } : { color, strokeWidth: width };
      gesture.current = { kind: 'pen', points: [world], style };
      setDraft({ type: 'stroke', points: [world], ...style });
    } else if (['rect', 'ellipse', 'arrow'].includes(tool)) {
      gesture.current = { kind: 'shape', start: world };
    } else if (tool === 'note' || tool === 'text') {
      const existing = textAt(elements, world);
      if (existing && !staff && teacherMaterial(existing)) { setError('Õpetaja teksti saab muuta ainult õpetaja.'); return; }
      if (existing) { setEditing({ id: existing.id, text: existing.text || '' }); return; }
      const data = tool === 'note'
        ? { type: 'note', x: world.x, y: world.y, w: 180, h: 140, text: '', color: noteColor }
        : { type: 'text', x: world.x, y: world.y, w: 260, h: Math.round(preset.font * 2.4), text: '', color, fontSize: preset.font, ...(font !== 'sans' ? { fontFamily: font } : {}) };
      add(data, 'Elementi ei saanud lisada.').then((id) => { if (id) setEditing({ id, text: '' }); });
      setTool('select');
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const move = (event) => {
    if (tool === 'laser') {
      const point = clampPoint(screenToWorld(local(event), view), bounds);
      onPointer?.({ x: Math.round(point.x), y: Math.round(point.y) });
      return;
    }
    const current = gesture.current;
    if (!current) return;
    const screen = local(event);
    const raw = screenToWorld(screen, view);
    const world = clampPoint(raw, drawBounds);
    if (current.kind === 'pan') {
      moveView({ ...current.view, x: current.view.x + screen.x - current.start.x, y: current.view.y + screen.y - current.start.y });
    } else if (current.kind === 'pen') {
      const last = current.points[current.points.length - 1];
      if (Math.hypot(world.x - last.x, world.y - last.y) * view.scale < 3 || current.points.length >= 800) return;
      current.points = [...current.points, { x: Math.round(world.x * 100) / 100, y: Math.round(world.y * 100) / 100 }];
      setDraft({ type: 'stroke', points: current.points, ...current.style });
    } else if (current.kind === 'shape') {
      setDraft({ type: 'shape', shape: tool, ...shapeFromDrag(tool, current.start, world), color, strokeWidth: shapeWidth });
    } else if (current.kind === 'move') {
      current.dx = raw.x - current.start.x; current.dy = raw.y - current.start.y;
      setMoving({ ids: new Set(current.ids), dx: current.dx, dy: current.dy });
    } else if (current.kind === 'resize') {
      current.patch = resizePatch(current.element, raw.x - current.start.x, raw.y - current.start.y);
      setResizing({ id: current.element.id, patch: current.patch });
    } else if (current.kind === 'marquee') {
      current.box = frameFrom(current.start, raw);
      setMarquee(current.box);
    }
  };

  const up = (event) => {
    const current = gesture.current;
    gesture.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDraft(null);
    if (!current) return;
    if (current.kind === 'pen' && current.points.length > 1) {
      add({ type: 'stroke', points: current.points, ...current.style }, 'Joont ei saanud salvestada.');
    } else if (current.kind === 'shape') {
      const end = clampPoint(screenToWorld(local(event), view), drawBounds);
      const box = shapeFromDrag(tool, current.start, end);
      if (Math.abs(box.w) > 4 || Math.abs(box.h) > 4) add({ type: 'shape', shape: tool, ...box, color, strokeWidth: shapeWidth }, 'Kujundit ei saanud salvestada.');
    } else if (current.kind === 'move') {
      const list = current.ids.map((id) => byId.get(id)).filter((element) => element && movable(element) && canEdit(element));
      if (list.length && (Math.abs(current.dx) > 1 || Math.abs(current.dy) > 1)) {
        changeMany(list.map((element) => ({ element, patch: movePatch(element, current.dx, current.dy) })), 'Elementi ei saanud liigutada.').finally(() => setMoving(null));
      } else setMoving(null);
    } else if (current.kind === 'resize') {
      if (current.patch && Object.keys(current.patch).length) changeMany([{ element: current.element, patch: current.patch }], 'Suurust ei saanud muuta.').finally(() => setResizing(null));
      else setResizing(null);
    } else if (current.kind === 'marquee') {
      const box = current.box;
      setMarquee(null);
      if (!box || (box.x2 - box.x1) * view.scale < 4 || (box.y2 - box.y1) * view.scale < 4) { if (!current.add) setSelected([]); return; }
      const ids = elements.filter((element) => movable(element) && canEdit(element) && touchesBox(element, box)).map((element) => element.id);
      setSelected(current.add ? [...new Set([...selected, ...ids])] : ids);
    }
  };

  // ── selection actions and keys ─────────────────────────────────
  const duplicate = () => { if (selectedElements.length) addMany(selectedElements.map((element) => copyData(element))); };
  const deleteSelection = () => {
    const list = selectedElements.filter((element) => element.locked !== true);
    setSelected([]);
    if (list.length) eraseMany(list);
  };
  const onKey = useRef(null);
  onKey.current = (event) => {
    const target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName || ''))) return;
    if (editing) return;
    const mod = event.ctrlKey || event.metaKey;
    const key = String(event.key || '').toLowerCase();
    if (event.key === ' ') { event.preventDefault(); setSpaceHeld(true); return; }
    if (mod && key === 'z') { event.preventDefault(); if (event.shiftKey) redo(); else undo(); return; }
    if (mod && key === 'y') { event.preventDefault(); redo(); return; }
    if (mod && key === 'c' && selectedElements.length) { clipboard.current = selectedElements.map((element) => copyData(element, 0)); return; }
    if (mod && key === 'v' && clipboard.current.length) {
      event.preventDefault();
      clipboard.current = clipboard.current.map((data) => ({ ...data, ...movePatch(data, 24, 24) }));
      addMany(clipboard.current);
      setTool('select');
      return;
    }
    if (mod && key === 'd') { event.preventDefault(); duplicate(); return; }
    if ((key === 'delete' || key === 'backspace') && selectedElements.length) { event.preventDefault(); deleteSelection(); return; }
    if (key === 'escape') { setSelected([]); setShapesOpen(false); return; }
    if (mod || event.altKey) return;
    const tools = { v: 'select', p: 'pen', m: 'marker', t: 'text', n: 'note', e: 'eraser', h: 'hand' };
    if (tools[key]) { setTool(tools[key]); if (tools[key] !== 'select') setSelected([]); }
  };
  useEffect(() => {
    const down = (event) => onKey.current?.(event);
    const up = (event) => { if (event.key === ' ') setSpaceHeld(false); };
    globalThis.addEventListener?.('keydown', down);
    globalThis.addEventListener?.('keyup', up);
    return () => { globalThis.removeEventListener?.('keydown', down); globalThis.removeEventListener?.('keyup', up); };
  }, []);

  const wheel = (event) => {
    event.preventDefault?.();
    moveView((current) => wheelView(current, event, local(event)));
  };
  // Moving the board without the hand tool: two fingers (pan + pinch) with any tool, one finger on a worksheet page
  // while filling it in, the middle mouse button anywhere. Handled on the stage before the drawing layer sees it.
  const touches = useRef(new Map());
  const nav = useRef(null);
  const navDown = (event) => {
    const point = local(event);
    if (event.pointerType === 'mouse') {
      if (event.button !== 1) return;
      event.preventDefault(); event.stopPropagation();
      nav.current = { kind: 'pan', start: point, view, pointerId: event.pointerId };
      return;
    }
    if (event.pointerType !== 'touch') return;
    touches.current.set(event.pointerId, point);
    if (touches.current.size === 2) {
      // a second finger: whatever the first one started (a line, a shape) is dropped, the board moves instead
      gesture.current = null; setDraft(null);
      nav.current = { kind: 'pinch', start: [...touches.current.values()], view };
      event.stopPropagation();
    } else if (touches.current.size === 1 && filling) {
      nav.current = { kind: 'pan', start: point, view, pointerId: event.pointerId, moved: false };
    }
  };
  const navMove = (event) => {
    const current = nav.current;
    if (!current) return;
    const point = local(event);
    if (current.kind === 'pinch') {
      if (!touches.current.has(event.pointerId)) return;
      touches.current.set(event.pointerId, point);
      const now = [...touches.current.values()];
      if (now.length >= 2) moveView(pinchView(current.view, current.start, now.slice(0, 2)));
      event.stopPropagation();
      return;
    }
    if (event.pointerId !== current.pointerId) return;
    const dx = point.x - current.start.x;
    const dy = point.y - current.start.y;
    if (!current.moved && Math.hypot(dx, dy) < 8 && event.pointerType === 'touch') return; // a tap on an answer field
    current.moved = true;
    moveView({ ...current.view, x: current.view.x + dx, y: current.view.y + dy });
    event.stopPropagation();
  };
  const navUp = (event) => {
    touches.current.delete(event.pointerId);
    const current = nav.current;
    if (!current) return;
    if (current.kind === 'pinch' ? touches.current.size < 2 : event.pointerId === current.pointerId) {
      nav.current = null;
      event.stopPropagation();
    }
  };
  const zoom = (factor) => {
    const rect = svgRef.current?.getBoundingClientRect();
    moveView((current) => zoomAt(current, factor, { x: (rect?.width || 800) / 2, y: (rect?.height || 500) / 2 }));
  };
  const fit = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    // a worksheet page is read top-down: fit its width; anything else fits whole
    setView(onWorksheet ? fitWidth(bounds, rect?.width || 800) : fitPage(bounds, rect?.width || 800, rect?.height || 500));
  };
  const clear = () => {
    if (!globalThis.confirm('Tühjendada see tahvel? Lukus materjalid jäävad alles.')) return;
    service.clear(studentId, pageId).then(() => setHistory({ undo: [], redo: [] })).catch(fail('Tahvlit ei saanud tühjendada.'));
  };
  const saveText = () => {
    const element = byId.get(editing?.id);
    const text = editing?.text ?? '';
    setEditing(null);
    if (!element) return;
    if (!text.trim()) { service.remove(studentId, pageId, element.id).catch(fail('Tühja elementi ei saanud eemaldada.')); return; }
    if (text === element.text) return;
    const value = text.slice(0, element.type === 'note' ? 2000 : 4000);
    const box = element.type === 'text' ? textBox(value, element.fontSize || 18, 120) : {};
    update(element, { text: value, ...box }, 'Teksti ei saanud salvestada.');
  };
  const pickImage = async (file) => {
    if (!file || !uploadImage) return;
    setUploading(true);
    setError('');
    try {
      const uploaded = await uploadImage(file);
      const size = await imageSize(uploaded.url);
      await insertFile({ url: uploaded.url, storagePath: uploaded.storagePath, kind: 'image', ...size });
    } catch (nextError) {
      setError(nextError?.message || 'Pilti ei saanud lisada.');
    } finally {
      setUploading(false);
    }
  };

  const render = (element) => {
    const common = { 'data-element-id': element.id };
    if (element.type === 'stroke') return <path {...common} d={pathFor(element.points)} fill="none" stroke={element.color || COLORS[0]} strokeWidth={element.strokeWidth || 4} strokeLinecap="round" strokeLinejoin="round" style={isMarker(element) ? { mixBlendMode: 'multiply' } : undefined} />;
    if (element.type === 'shape') {
      const stroke = { stroke: element.color || COLORS[0], strokeWidth: element.strokeWidth || 3, fill: 'none' };
      if (element.shape === 'ellipse') return <ellipse {...common} {...stroke} cx={element.x + element.w / 2} cy={element.y + element.h / 2} rx={Math.abs(element.w / 2)} ry={Math.abs(element.h / 2)} />;
      if (element.shape === 'line' || element.shape === 'arrow') return <g {...common}><line {...stroke} x1={element.x} y1={element.y} x2={element.x + element.w} y2={element.y + element.h} strokeLinecap="round" />{element.shape === 'arrow' ? <polyline {...stroke} points={arrowHead(element)} strokeLinecap="round" strokeLinejoin="round" /> : null}<line x1={element.x} y1={element.y} x2={element.x + element.w} y2={element.y + element.h} stroke="transparent" strokeWidth="14" /></g>;
      return <rect {...common} {...stroke} x={element.x} y={element.y} width={element.w} height={element.h} rx="4" />;
    }
    if (element.type === 'note' || element.type === 'text') {
      const isNote = element.type === 'note';
      return <foreignObject {...common} x={element.x} y={element.y} width={element.w} height={element.h} onDoubleClick={(event) => { event.stopPropagation(); if (staff || !teacherMaterial(element)) setEditing({ id: element.id, text: element.text || '' }); }}>
        <div data-element-id={element.id} className={isNote ? 'sb-note' : 'sb-text'} style={isNote ? { background: element.color } : { color: element.color, fontSize: element.fontSize || 18, fontFamily: fontCss(element.fontFamily) }}>{element.text || (isNote ? 'Topeltklõps, et kirjutada' : 'Tekst')}</div>
      </foreignObject>;
    }
    if (element.type === 'image') return <image {...common} href={element.url} x={element.x} y={element.y} width={element.w} height={element.h} preserveAspectRatio="xMidYMid meet" />;
    if (element.type === 'pdf') return <foreignObject {...common} x={element.x} y={element.y} width={Math.max(element.w, 160)} height={room ? Math.max(element.h, 120) : Math.max(Math.min(element.h, 120), 60)}>
      {room ? <div data-element-id={element.id} className="sb-pdf sb-pdf--page"><iframe title={`PDF: ${element.name || 'materjal'}`} src={`${element.url}#toolbar=0&navpanes=0&view=FitH`} /><span>{element.name || 'PDF'} · <a href={element.url} target="_blank" rel="noreferrer">Ava PDF</a></span></div>
        : <div data-element-id={element.id} className="sb-pdf"><strong>{element.name || 'PDF'}</strong><a href={element.url} target="_blank" rel="noreferrer">Ava PDF</a></div>}
    </foreignObject>;
    return null;
  };

  const editingElement = editing ? byId.get(editing.id) : null;
  const palette = tool === 'note' ? NOTE_COLORS : tool === 'marker' ? MARKER_COLORS : room ? ROOM_COLORS : COLORS;
  const activeColor = tool === 'note' ? noteColor : tool === 'marker' ? marker : color;
  const chooseColor = (value) => {
    if (tool === 'note') { setNoteColor(value); return; }
    if (tool === 'marker') { setMarker(value); return; }
    setColor(value);
    restyle({ color: value });
  };
  const fontButtons = <div className="sb-style__fonts" role="group" aria-label="Kiri">{Object.entries(FONTS).map(([key, item]) => <button type="button" key={key} className={font === key ? 'is-active' : ''} aria-pressed={font === key} style={{ fontFamily: item.css }} onMouseDown={(event) => event.preventDefault()} onClick={() => pickFont(key)}>{item.label}</button>)}</div>;
  const toolButton = ([key, label, Icon]) => <button type="button" key={key} className={tool === key ? 'is-active' : ''} aria-pressed={tool === key} aria-label={label} title={label} onClick={() => { setTool(key); setShapesOpen(false); if (key !== 'select') setSelected([]); }}><Icon size={room ? 20 : 18} /></button>;
  const zoomControls = <>
    <button type="button" aria-label="Vähenda" onClick={() => zoom(1 / 1.2)}><Minus size={16} /></button>
    <span className="sb-zoom">{Math.round(view.scale * 100)}%</span>
    <button type="button" aria-label="Suurenda" onClick={() => zoom(1.2)}><Plus size={16} /></button>
    <button type="button" aria-label="Sobita" title="Näita kõike" onClick={fit}><Maximize size={16} /></button>
  </>;

  const shownSelection = selectedElements.map((element) => (resizing?.id === element.id ? { ...element, ...resizing.patch } : element));
  const selectionBounds = tool === 'select' ? unionBounds(shownSelection) : null;
  const selectionBox = selectionBounds && moving ? { x1: selectionBounds.x1 + moving.dx, y1: selectionBounds.y1 + moving.dy, x2: selectionBounds.x2 + moving.dx, y2: selectionBounds.y2 + moving.dy } : selectionBounds;
  const filling = onWorksheet && tool === 'fill';
  const stage = <div className={`sb-stage tool-${spaceHeld ? 'hand' : tool} ${onWorksheet ? 'has-worksheet' : ''}`} onWheel={filling ? wheel : undefined}
    onPointerDownCapture={navDown} onPointerMoveCapture={navMove} onPointerUpCapture={navUp} onPointerCancelCapture={navUp}>
    {onWorksheet ? <div ref={underlayRef} className="sb-underlay" style={{ width: WORKSHEET_WIDTH, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>{activeSheet.content}</div> : null}
    <svg ref={svgRef} role="img" aria-label="Õpilase tahvel" style={filling ? { pointerEvents: 'none' } : undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={tool === 'laser' ? () => onPointer?.(null) : undefined} onWheel={filling ? undefined : wheel} onDoubleClick={(event) => { const hit = textAt(elements, screenToWorld(local(event), view)); if (hit && (staff || !teacherMaterial(hit))) setEditing({ id: hit.id, text: hit.text || '' }); }}>
      <defs>
        <pattern id="sb-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d0d5dd" /></pattern>
        <pattern id="sb-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#e4e7ec" strokeWidth="1" /></pattern>
        <pattern id="sb-lines" width="40" height="40" patternUnits="userSpaceOnUse"><line x1="0" y1="39.5" x2="40" y2="39.5" stroke="#c7d7fe" strokeWidth="1" /></pattern>
      </defs>
      <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
        {onWorksheet ? null : <>
          <rect className="sb-sheet" x={bounds.x1} y={bounds.y1} width={bounds.x2 - bounds.x1} height={bounds.y2 - bounds.y1} rx="6" />
          {paper === 'plain' ? null : <rect className={`sb-paper is-${paper}`} x={bounds.x1} y={bounds.y1} width={bounds.x2 - bounds.x1} height={bounds.y2 - bounds.y1} fill={`url(#sb-${paper})`} pointerEvents="none" />}
        </>}
        {elements.map((element) => <g key={element.id} transform={moving?.ids.has(element.id) ? `translate(${moving.dx} ${moving.dy})` : undefined}>{render(resizing?.id === element.id ? { ...element, ...resizing.patch } : element)}</g>)}
        {draft ? <g key="__draft">{render({ ...draft, id: draft.id || '__draft' })}</g> : null}
        {selectionBox ? <g className="sb-selection">
          <rect x={selectionBox.x1 - 6 / view.scale} y={selectionBox.y1 - 6 / view.scale} width={selectionBox.x2 - selectionBox.x1 + 12 / view.scale} height={selectionBox.y2 - selectionBox.y1 + 12 / view.scale} fill="none" stroke="#4f7cff" strokeWidth={1.5 / view.scale} strokeDasharray={`${6 / view.scale} ${4 / view.scale}`} pointerEvents="none" />
          {selectedElements.length === 1 && !moving ? <rect data-handle="se" aria-label="Muuda suurust" x={selectionBox.x2 + 6 / view.scale - 8 / view.scale} y={selectionBox.y2 + 6 / view.scale - 8 / view.scale} width={16 / view.scale} height={16 / view.scale} rx={4 / view.scale} fill="#fff" stroke="#4f7cff" strokeWidth={2 / view.scale} className="sb-handle" /> : null}
        </g> : null}
        {marquee ? <rect className="sb-marquee" x={marquee.x1} y={marquee.y1} width={marquee.x2 - marquee.x1} height={marquee.y2 - marquee.y1} strokeWidth={1 / view.scale} pointerEvents="none" /> : null}
        {pointer && (pointer.pageId || '') === (pageId || '') ? <g className="sb-laser" data-testid="teacher-pointer" pointerEvents="none">
          <circle cx={pointer.x} cy={pointer.y} r={16 / view.scale} className="sb-laser__glow" />
          <circle cx={pointer.x} cy={pointer.y} r={6 / view.scale} className="sb-laser__dot" />
        </g> : null}
      </g>
    </svg>
    {editingElement ? <textarea
      className="sb-editor"
      aria-label={editingElement.type === 'note' ? 'Märkmepaberi tekst' : 'Tekst'}
      autoFocus
      style={{ left: view.x + editingElement.x * view.scale, top: view.y + editingElement.y * view.scale, width: editingElement.w * view.scale, height: editingElement.h * view.scale, fontSize: (editingElement.type === 'note' ? 15 : editingElement.fontSize || 18) * view.scale, ...(editingElement.type === 'text' ? { fontFamily: fontCss(editingElement.fontFamily), color: editingElement.color } : {}) }}
      value={editing.text}
      maxLength={editingElement.type === 'note' ? 2000 : 4000}
      onChange={(event) => setEditing({ ...editing, text: event.target.value })}
      onBlur={saveText}
      onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.blur(); }}
    /> : null}
    {selectionBox && !moving && !resizing ? <div className="sb-selbar" role="toolbar" aria-label="Valitud" style={{ left: Math.max(8, view.x + selectionBox.x1 * view.scale), top: Math.max(8, view.y + selectionBox.y1 * view.scale - 52) }}>
      <button type="button" aria-label="Kopeeri" title="Kopeeri (Ctrl+D)" onClick={duplicate}><Copy size={16} /></button>
      <button type="button" aria-label="Kustuta valitud" title="Kustuta (Delete)" onClick={deleteSelection}><Trash2 size={16} /></button>
    </div> : null}
    {ready && !elements.length && !draft && !onWorksheet ? <div className="sb-empty">{room ? (staff ? 'Tühi tahvel. Lisa materjal nupust „Materjalid” või joonista ja kirjuta — õpilane näeb kõike kohe.' : 'Tühi tahvel. Kui õpetaja lisab materjali, näed seda siin. Võid ka ise joonistada ja kirjutada.') : 'Tühi tahvel: joonista, lisa märkmepaber või tekst. Õpetaja ja õpilane näevad muudatusi kohe.'}</div> : null}
  </div>;

  if (room) {
    const shapeActive = SHAPES.find(([key]) => key === tool) || SHAPES[0];
    const ShapeIcon = SHAPES.some(([key]) => key === tool) ? shapeActive[2] : Shapes;
    return (
      <div className="sb sb--room">
        {pageTabs('sb-room-pages')}
        {stage}
        {error ? <p className="sb-room-error" role="alert">{error}</p> : null}
        <div className="sb-zoombar" aria-label="Suum">{zoomControls}</div>
        <div className="sb-dock" role="toolbar" aria-label="Tahvli tööriistad">
          {onWorksheet ? toolButton(FILL_TOOL) : null}
          {TOOLS.filter(([key]) => ['select', 'hand'].includes(key)).map(toolButton)}
          {staff && onPointer ? toolButton(LASER_TOOL) : null}
          <span className="sb-dock__group">
            <button type="button" className={SHAPES.some(([key]) => key === tool) ? 'is-active' : ''} aria-label="Kujundid" aria-expanded={shapesOpen} title="Kujundid" onClick={() => setShapesOpen(!shapesOpen)}><ShapeIcon size={20} /></button>
            {shapesOpen ? <span className="sb-dock__menu" role="menu" aria-label="Kujundid">{SHAPES.map(toolButton)}</span> : null}
          </span>
          {TOOLS.filter(([key]) => ['pen', 'marker', 'eraser', 'text', 'note'].includes(key)).map(toolButton)}
          {uploadImage ? <>
            <input ref={fileInput} className="sr-only" type="file" accept="image/*" aria-label="Lisa pilt tahvlile" onChange={(event) => { pickImage(event.target.files?.[0]); event.target.value = ''; }} />
            <button type="button" aria-label="Pilt" title={staff ? 'Lisa pilt' : 'Lisa foto (nt vihikust)'} disabled={uploading} onClick={() => fileInput.current?.click()}><ImagePlus size={20} /></button>
          </> : null}
          <button type="button" className={`sb-dock__more ${stylesOpen ? 'is-open' : ''}`} aria-label={stylesOpen ? 'Peida värvid' : 'Näita värve'} aria-pressed={stylesOpen} onClick={() => setStylesOpen(!stylesOpen)}><ChevronDown size={18} /></button>
        </div>
        {stylesOpen ? <div className="sb-style" aria-label="Värv ja suurus">
          <div className="sb-style__colors">{palette.map((value) => <button type="button" key={value} className={`sb-color ${activeColor === value ? 'is-active' : ''}`} style={{ background: value }} aria-label={`Värv ${value}`} aria-pressed={activeColor === value} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseColor(value)} />)}</div>
          <label className="sb-style__width"><span className="sr-only">Joone paksus</span><input type="range" min="1" max="24" value={width} aria-label="Joone paksus" onChange={(event) => { setWidth(Number(event.target.value)); setSize(''); }} /></label>
          <div className="sb-style__sizes" role="group" aria-label="Suurus">{Object.keys(SIZES).map((key) => <button type="button" key={key} className={size === key ? 'is-active' : ''} aria-pressed={size === key} onMouseDown={(event) => event.preventDefault()} onClick={() => pickSize(key)}>{key}</button>)}</div>
          {fontButtons}
          {onWorksheet || !service.setBackground ? null : <div className="sb-style__paper" role="group" aria-label="Taust">{BACKGROUNDS.map(([key, label]) => <button type="button" key={key} className={paper === key ? 'is-active' : ''} aria-pressed={paper === key} onClick={() => chooseBackground(key)}>{label}</button>)}</div>}
          {staff ? <button type="button" className="sb-style__clear" disabled={!elements.length} onClick={clear}><Trash2 size={14} /> Tühjenda leht</button> : null}
        </div> : null}
      </div>
    );
  }

  return (
    <div className="sb">
      {pageTabs('sb-pages')}
      <div className="sb-toolbar" role="toolbar" aria-label="Tahvli tööriistad">
        {onWorksheet ? toolButton(FILL_TOOL) : null}
        {TOOLS.map(toolButton)}
        <span className="sb-sep" />
        {palette.map((value) => <button type="button" key={value} className={`sb-color ${activeColor === value ? 'is-active' : ''}`} style={{ background: value }} aria-label={`Värv ${value}`} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseColor(value)} />)}
        {tool === 'text' || editingText() ? <><span className="sb-sep" />{fontButtons}</> : null}
        <span className="sb-sep" />
        {zoomControls}
        {staff ? <Button variant="secondary" disabled={!elements.length} onClick={clear}><Trash2 size={16} /> Tühjenda</Button> : null}
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {stage}
      <p className="sb-hint"><FileText size={14} /> Sama tahvel, mis vanas CRM-is: varem joonistatu on alles. Rattaga suumid, „Liiguta tahvlit” või tühjast kohast lohistades nihutad.</p>
    </div>
  );
}
