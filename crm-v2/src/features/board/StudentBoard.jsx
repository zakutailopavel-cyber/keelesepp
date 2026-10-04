import { ArrowUpRight, ChevronDown, Circle, ClipboardList, Eraser, FilePlus2, FileText, MousePointerClick, Pencil, Hand, ImagePlus, Maximize, Minus, MousePointer2, PenLine, Plus, Shapes, Square, StickyNote, Trash2, Type } from 'lucide-react';
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { COLORS, FONTS, NOTE_COLORS, ROOM_COLORS, SIZES, arrowHead, clampPoint, clampView, fitPage, fitView, fitWidth, WORKSHEET_WIDTH, worksheetPageTitle, fontCss, imageSize, movable, pageBounds, pathFor, screenToWorld, shapeFromDrag, teacherMaterial, textAt, textBox, zoomAt } from './boardModel.js';
import './board.css';

const TOOLS = [
  ['select', 'Vali ja liiguta', MousePointer2],
  ['pen', 'Pliiats', PenLine],
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
  controllerRef, onHistoryChange, uploadImage, newPageTitle, initialPageId = '', worksheet = null,
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
  const ready = loaded.key === pageKey;
  const elements = useMemo(() => (ready ? loaded.items : []), [ready, loaded.items]);

  const byId = useMemo(() => new Map(elements.map((element) => [element.id, element])), [elements]);
  // The open worksheet (Live Classroom) is a page of the board: it lies under the drawing layer, moves and zooms with
  // the board, and what is drawn on top of it is stored on its own lesson page „Tööleht: <title>”.
  const worksheetPage = worksheet ? pages.find((page) => page.title === worksheetPageTitle(worksheet.title)) : null;
  const onWorksheet = Boolean(worksheet && worksheetPage && pageId === worksheetPage.id);
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
  const preset = SIZES[size] || SIZES.M;
  const shapeWidth = Math.max(1, Math.round(width * 0.75));

  // ── own-action history (undo/redo) ─────────────────────────────
  const record = useCallback((entry) => setHistory((current) => ({ undo: [...current.undo, entry].slice(-HISTORY_LIMIT), redo: [] })), []);
  const choosePage = (next) => { setPageId(next); setHistory({ undo: [], redo: [] }); setEditing(null); };
  const add = useCallback((data, message) => service.add(studentId, pageId, data, user)
    .then((id) => { record({ op: 'add', id, data }); return id; })
    .catch((nextError) => { setError(nextError?.message || message); return null; }), [pageId, record, service, studentId, user]);
  const update = (element, patch, message) => {
    const before = Object.fromEntries(Object.keys(patch).map((key) => [key, element[key]]));
    return service.update(studentId, pageId, element, patch, user)
      .then(() => record({ op: 'update', id: element.id, before, after: patch }))
      .catch(fail(message));
  };
  const erase = (element) => service.remove(studentId, pageId, element.id)
    .then(() => record({ op: 'remove', id: element.id, data: plain(element) }))
    .catch(fail('Elementi ei saanud kustutada.'));

  // apply an entry backwards (undo) or forwards (redo); returns the entry with its current element id
  const apply = useCallback(async (entry, backwards) => {
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
    if (!staff) throw new Error('Materjali saab tahvlile lisada õpetaja.');
    const rect = svgRef.current?.getBoundingClientRect();
    const box = { w: rect?.width || 900, h: rect?.height || 600 };
    const fitScale = Math.min((box.w * 0.66) / view.scale / naturalW, (box.h * 0.9) / view.scale / naturalH, 1.5);
    const w = Math.round(naturalW * fitScale);
    const h = Math.round(naturalH * fitScale);
    const center = screenToWorld({ x: box.w / 2, y: box.h / 2 }, view);
    const data = { type: kind === 'pdf' ? 'pdf' : 'image', x: Math.round(center.x - w / 2), y: Math.round(center.y - h / 2), w, h, url, locked: false, ...(storagePath ? { storagePath } : {}), ...(kind === 'pdf' ? { name: String(name).slice(0, 300) } : {}) };
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
    if (!onWorksheet || fittedWorksheet.current === worksheetPage.id) return;
    const [width] = screenSize();
    if (!width) return;
    fittedWorksheet.current = worksheetPage.id;
    setView(fitWidth(bounds, width));
  }, [onWorksheet]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!onWorksheet && tool === 'fill') setTool('pen'); }, [onWorksheet, tool]);

  const openWorksheet = useCallback(() => {
    if (!worksheet) return;
    if (worksheetPage) { choosePage(worksheetPage.id); setTool('fill'); } else setWantWorksheet(worksheet.id);
  }, [worksheet, worksheetPage]);
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
      : <button type="button" role="tab" key={page.id} aria-selected={pageId === page.id} className={worksheetPage?.id === page.id ? 'is-worksheet' : ''} title="Topeltklõps: nimeta ümber" onClick={() => { choosePage(page.id); if (worksheetPage?.id === page.id) setTool('fill'); }} onDoubleClick={() => setRenaming({ id: page.id, title: page.title || '' })}>{worksheetPage?.id === page.id ? <ClipboardList size={13} aria-hidden="true" /> : null}{page.title || 'Leht'}</button>))}
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
    const world = clampPoint(screenToWorld(screen, view), bounds);
    const target = byId.get(event.target?.closest?.('[data-element-id]')?.dataset?.elementId);
    if (tool === 'hand' || (tool === 'select' && !target)) {
      gesture.current = { kind: 'pan', start: screen, view };
    } else if (tool === 'eraser') {
      if (target?.locked) { setError('Õpetaja materjal on lukus ja seda ei saa kustutada.'); return; }
      if (!staff && teacherMaterial(target)) { setError('Õpetaja lisatud materjali saab kustutada ainult õpetaja.'); return; }
      if (target) erase(target);
      return;
    } else if (tool === 'select') {
      if (!movable(target) || (!staff && teacherMaterial(target))) return;
      gesture.current = { kind: 'move', element: target, start: world, dx: 0, dy: 0 };
    } else if (tool === 'pen') {
      gesture.current = { kind: 'pen', points: [world] };
      setDraft({ type: 'stroke', points: [world], color, strokeWidth: width });
    } else if (['rect', 'ellipse', 'arrow'].includes(tool)) {
      gesture.current = { kind: 'shape', start: world };
    } else if (tool === 'note' || tool === 'text') {
      const existing = textAt(elements, world);
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
    const current = gesture.current;
    if (!current) return;
    const screen = local(event);
    const world = clampPoint(screenToWorld(screen, view), bounds);
    if (current.kind === 'pan') {
      moveView({ ...current.view, x: current.view.x + screen.x - current.start.x, y: current.view.y + screen.y - current.start.y });
    } else if (current.kind === 'pen') {
      const last = current.points[current.points.length - 1];
      if (Math.hypot(world.x - last.x, world.y - last.y) * view.scale < 3 || current.points.length >= 800) return;
      current.points = [...current.points, { x: Math.round(world.x * 100) / 100, y: Math.round(world.y * 100) / 100 }];
      setDraft({ type: 'stroke', points: current.points, color, strokeWidth: width });
    } else if (current.kind === 'shape') {
      setDraft({ type: 'shape', shape: tool, ...shapeFromDrag(tool, current.start, world), color, strokeWidth: shapeWidth });
    } else if (current.kind === 'move') {
      current.dx = world.x - current.start.x; current.dy = world.y - current.start.y;
      setDraft({ ...current.element, id: '__moving', movingId: current.element.id, x: current.element.x + current.dx, y: current.element.y + current.dy });
    }
  };

  const up = (event) => {
    const current = gesture.current;
    gesture.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDraft(null);
    if (!current) return;
    if (current.kind === 'pen' && current.points.length > 1) {
      add({ type: 'stroke', points: current.points, color, strokeWidth: width }, 'Joont ei saanud salvestada.');
    } else if (current.kind === 'shape') {
      const end = clampPoint(screenToWorld(local(event), view), bounds);
      const box = shapeFromDrag(tool, current.start, end);
      if (Math.abs(box.w) > 4 || Math.abs(box.h) > 4) add({ type: 'shape', shape: tool, ...box, color, strokeWidth: shapeWidth }, 'Kujundit ei saanud salvestada.');
    } else if (current.kind === 'move' && (Math.abs(current.dx) > 1 || Math.abs(current.dy) > 1)) {
      const element = current.element;
      const x = Math.min(bounds.x2 - Math.min(element.w || 0, bounds.x2 - bounds.x1), Math.max(bounds.x1, element.x + current.dx));
      const y = Math.min(bounds.y2 - Math.min(element.h || 0, bounds.y2 - bounds.y1), Math.max(bounds.y1, element.y + current.dy));
      update(element, { x, y }, 'Elementi ei saanud liigutada.');
    }
  };

  const wheel = (event) => {
    event.preventDefault?.();
    moveView((current) => zoomAt(current, event.deltaY < 0 ? 1.08 : 1 / 1.08, local(event)));
  };
  const zoom = (factor) => {
    const rect = svgRef.current?.getBoundingClientRect();
    moveView((current) => zoomAt(current, factor, { x: (rect?.width || 800) / 2, y: (rect?.height || 500) / 2 }));
  };
  const fit = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    setView(fitPage(bounds, rect?.width || 800, rect?.height || 500));
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
    if (element.type === 'stroke') return <path {...common} d={pathFor(element.points)} fill="none" stroke={element.color || COLORS[0]} strokeWidth={element.strokeWidth || 4} strokeLinecap="round" strokeLinejoin="round" />;
    if (element.type === 'shape') {
      const stroke = { stroke: element.color || COLORS[0], strokeWidth: element.strokeWidth || 3, fill: 'none' };
      if (element.shape === 'ellipse') return <ellipse {...common} {...stroke} cx={element.x + element.w / 2} cy={element.y + element.h / 2} rx={Math.abs(element.w / 2)} ry={Math.abs(element.h / 2)} />;
      if (element.shape === 'line' || element.shape === 'arrow') return <g {...common}><line {...stroke} x1={element.x} y1={element.y} x2={element.x + element.w} y2={element.y + element.h} strokeLinecap="round" />{element.shape === 'arrow' ? <polyline {...stroke} points={arrowHead(element)} strokeLinecap="round" strokeLinejoin="round" /> : null}<line x1={element.x} y1={element.y} x2={element.x + element.w} y2={element.y + element.h} stroke="transparent" strokeWidth="14" /></g>;
      return <rect {...common} {...stroke} x={element.x} y={element.y} width={element.w} height={element.h} rx="4" />;
    }
    if (element.type === 'note' || element.type === 'text') {
      const isNote = element.type === 'note';
      return <foreignObject {...common} x={element.x} y={element.y} width={element.w} height={element.h} onDoubleClick={() => setEditing({ id: element.id, text: element.text || '' })}>
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
  const palette = tool === 'note' ? NOTE_COLORS : room ? ROOM_COLORS : COLORS;
  const activeColor = tool === 'note' ? noteColor : color;
  const chooseColor = (value) => {
    if (tool === 'note') { setNoteColor(value); return; }
    setColor(value);
    restyle({ color: value });
  };
  const fontButtons = <div className="sb-style__fonts" role="group" aria-label="Kiri">{Object.entries(FONTS).map(([key, item]) => <button type="button" key={key} className={font === key ? 'is-active' : ''} aria-pressed={font === key} style={{ fontFamily: item.css }} onMouseDown={(event) => event.preventDefault()} onClick={() => pickFont(key)}>{item.label}</button>)}</div>;
  const toolButton = ([key, label, Icon]) => <button type="button" key={key} className={tool === key ? 'is-active' : ''} aria-pressed={tool === key} aria-label={label} title={label} onClick={() => { setTool(key); setShapesOpen(false); }}><Icon size={room ? 20 : 18} /></button>;
  const zoomControls = <>
    <button type="button" aria-label="Vähenda" onClick={() => zoom(1 / 1.2)}><Minus size={16} /></button>
    <span className="sb-zoom">{Math.round(view.scale * 100)}%</span>
    <button type="button" aria-label="Suurenda" onClick={() => zoom(1.2)}><Plus size={16} /></button>
    <button type="button" aria-label="Sobita" title="Näita kõike" onClick={fit}><Maximize size={16} /></button>
  </>;

  const filling = onWorksheet && tool === 'fill';
  const stage = <div className={`sb-stage tool-${tool} ${onWorksheet ? 'has-worksheet' : ''}`} onWheel={filling ? wheel : undefined}>
    {onWorksheet ? <div ref={underlayRef} className="sb-underlay" style={{ width: WORKSHEET_WIDTH, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}>{worksheet.content}</div> : null}
    <svg ref={svgRef} role="img" aria-label="Õpilase tahvel" style={filling ? { pointerEvents: 'none' } : undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={filling ? undefined : wheel} onDoubleClick={(event) => { const hit = textAt(elements, screenToWorld(local(event), view)); if (hit) setEditing({ id: hit.id, text: hit.text || '' }); }}>
      <defs><pattern id="sb-dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#d0d5dd" /></pattern></defs>
      <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
        {onWorksheet ? null : <>
          <rect className="sb-sheet" x={bounds.x1} y={bounds.y1} width={bounds.x2 - bounds.x1} height={bounds.y2 - bounds.y1} rx="6" />
          <rect x={bounds.x1} y={bounds.y1} width={bounds.x2 - bounds.x1} height={bounds.y2 - bounds.y1} fill="url(#sb-dots)" pointerEvents="none" />
        </>}
        {elements.filter((element) => element.id !== draft?.movingId).map((element) => <g key={element.id}>{render(element)}</g>)}
        {draft ? <g key="__draft">{render({ ...draft, id: draft.id || '__draft' })}</g> : null}
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
          <span className="sb-dock__group">
            <button type="button" className={SHAPES.some(([key]) => key === tool) ? 'is-active' : ''} aria-label="Kujundid" aria-expanded={shapesOpen} title="Kujundid" onClick={() => setShapesOpen(!shapesOpen)}><ShapeIcon size={20} /></button>
            {shapesOpen ? <span className="sb-dock__menu" role="menu" aria-label="Kujundid">{SHAPES.map(toolButton)}</span> : null}
          </span>
          {TOOLS.filter(([key]) => ['pen', 'eraser', 'text', 'note'].includes(key)).map(toolButton)}
          {staff && uploadImage ? <>
            <input ref={fileInput} className="sr-only" type="file" accept="image/*" aria-label="Lisa pilt tahvlile" onChange={(event) => { pickImage(event.target.files?.[0]); event.target.value = ''; }} />
            <button type="button" aria-label="Pilt" title="Lisa pilt" disabled={uploading} onClick={() => fileInput.current?.click()}><ImagePlus size={20} /></button>
          </> : null}
          <button type="button" className={`sb-dock__more ${stylesOpen ? 'is-open' : ''}`} aria-label={stylesOpen ? 'Peida värvid' : 'Näita värve'} aria-pressed={stylesOpen} onClick={() => setStylesOpen(!stylesOpen)}><ChevronDown size={18} /></button>
        </div>
        {stylesOpen ? <div className="sb-style" aria-label="Värv ja suurus">
          <div className="sb-style__colors">{palette.map((value) => <button type="button" key={value} className={`sb-color ${activeColor === value ? 'is-active' : ''}`} style={{ background: value }} aria-label={`Värv ${value}`} aria-pressed={activeColor === value} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseColor(value)} />)}</div>
          <label className="sb-style__width"><span className="sr-only">Joone paksus</span><input type="range" min="1" max="24" value={width} aria-label="Joone paksus" onChange={(event) => { setWidth(Number(event.target.value)); setSize(''); }} /></label>
          <div className="sb-style__sizes" role="group" aria-label="Suurus">{Object.keys(SIZES).map((key) => <button type="button" key={key} className={size === key ? 'is-active' : ''} aria-pressed={size === key} onMouseDown={(event) => event.preventDefault()} onClick={() => pickSize(key)}>{key}</button>)}</div>
          {fontButtons}
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
