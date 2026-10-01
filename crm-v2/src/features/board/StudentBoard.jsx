import { ArrowUpRight, Circle, Eraser, FileText, Hand, Maximize, Minus, MousePointer2, PenLine, Plus, Square, StickyNote, Trash2, Type } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/ui/index.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { COLORS, NOTE_COLORS, arrowHead, fitView, movable, pathFor, screenToWorld, shapeFromDrag, zoomAt } from './boardModel.js';
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

/** The student's persistent board (and the v1 lesson pages), shared live by the student, parents and the teacher. */
export default function StudentBoard({ studentId, user, staff = false, service = studentBoardService }) {
  const [pages, setPages] = useState([]);
  const [pageId, setPageId] = useState(null);
  // Elements of the open page; tagged with the page they belong to, so a page switch never shows stale elements.
  const [loaded, setLoaded] = useState({ key: '', items: [] });
  const [error, setError] = useState('');
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(COLORS[0]);
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null);
  const svgRef = useRef(null);
  const gesture = useRef(null);

  useEffect(() => service.subscribePages(studentId, setPages, () => setPages([])), [service, studentId]);
  const pageKey = `${studentId}/${pageId || 'board'}`;
  useEffect(() => service.subscribeElements(
    studentId,
    pageId,
    (items) => setLoaded({ key: `${studentId}/${pageId || 'board'}`, items }),
    (nextError) => { setLoaded({ key: `${studentId}/${pageId || 'board'}`, items: [] }); setError(nextError?.message || 'Tahvlit ei saanud laadida.'); },
  ), [service, studentId, pageId]);
  const ready = loaded.key === pageKey;
  const elements = useMemo(() => (ready ? loaded.items : []), [ready, loaded.items]);

  const byId = useMemo(() => new Map(elements.map((element) => [element.id, element])), [elements]);
  const fail = (message) => (nextError) => setError(nextError?.message || message);
  const local = (event) => {
    const rect = svgRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const down = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    setError('');
    const screen = local(event);
    const world = screenToWorld(screen, view);
    const target = byId.get(event.target?.closest?.('[data-element-id]')?.dataset?.elementId);
    if (tool === 'hand' || (tool === 'select' && !target)) {
      gesture.current = { kind: 'pan', start: screen, view };
    } else if (tool === 'eraser') {
      if (target?.locked) { setError('Õpetaja materjal on lukus ja seda ei saa kustutada.'); return; }
      if (target) service.remove(studentId, pageId, target.id).catch(fail('Elementi ei saanud kustutada.'));
      return;
    } else if (tool === 'select') {
      if (!movable(target)) return;
      gesture.current = { kind: 'move', element: target, start: world, dx: 0, dy: 0 };
    } else if (tool === 'pen') {
      gesture.current = { kind: 'pen', points: [world] };
      setDraft({ type: 'stroke', points: [world], color, strokeWidth: 4 });
    } else if (['rect', 'ellipse', 'arrow'].includes(tool)) {
      gesture.current = { kind: 'shape', start: world };
    } else if (tool === 'note' || tool === 'text') {
      const data = tool === 'note'
        ? { type: 'note', x: world.x, y: world.y, w: 180, h: 140, text: '', color: noteColor }
        : { type: 'text', x: world.x, y: world.y, w: 260, h: 44, text: '', color, fontSize: 18 };
      service.add(studentId, pageId, data, user).then((id) => setEditing({ id, text: '' })).catch(fail('Elementi ei saanud lisada.'));
      setTool('select');
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const move = (event) => {
    const current = gesture.current;
    if (!current) return;
    const screen = local(event);
    const world = screenToWorld(screen, view);
    if (current.kind === 'pan') {
      setView({ ...current.view, x: current.view.x + screen.x - current.start.x, y: current.view.y + screen.y - current.start.y });
    } else if (current.kind === 'pen') {
      const last = current.points[current.points.length - 1];
      if (Math.hypot(world.x - last.x, world.y - last.y) * view.scale < 3 || current.points.length >= 800) return;
      current.points = [...current.points, { x: Math.round(world.x * 100) / 100, y: Math.round(world.y * 100) / 100 }];
      setDraft({ type: 'stroke', points: current.points, color, strokeWidth: 4 });
    } else if (current.kind === 'shape') {
      setDraft({ type: 'shape', shape: tool, ...shapeFromDrag(tool, current.start, world), color, strokeWidth: 3 });
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
      service.add(studentId, pageId, { type: 'stroke', points: current.points, color, strokeWidth: 4 }, user).catch(fail('Joont ei saanud salvestada.'));
    } else if (current.kind === 'shape') {
      const end = screenToWorld(local(event), view);
      const box = shapeFromDrag(tool, current.start, end);
      if (Math.abs(box.w) > 4 || Math.abs(box.h) > 4) service.add(studentId, pageId, { type: 'shape', shape: tool, ...box, color, strokeWidth: 3 }, user).catch(fail('Kujundit ei saanud salvestada.'));
    } else if (current.kind === 'move' && (Math.abs(current.dx) > 1 || Math.abs(current.dy) > 1)) {
      service.update(studentId, pageId, current.element, { x: current.element.x + current.dx, y: current.element.y + current.dy }, user).catch(fail('Elementi ei saanud liigutada.'));
    }
  };

  const wheel = (event) => {
    event.preventDefault?.();
    setView((current) => zoomAt(current, event.deltaY < 0 ? 1.08 : 1 / 1.08, local(event)));
  };
  const zoom = (factor) => {
    const rect = svgRef.current?.getBoundingClientRect();
    setView((current) => zoomAt(current, factor, { x: (rect?.width || 800) / 2, y: (rect?.height || 500) / 2 }));
  };
  const fit = () => {
    const rect = svgRef.current?.getBoundingClientRect();
    setView(fitView(elements, rect?.width || 800, rect?.height || 500));
  };
  const clear = () => {
    if (!globalThis.confirm('Tühjendada see tahvel? Lukus materjalid jäävad alles.')) return;
    service.clear(studentId, pageId).catch(fail('Tahvlit ei saanud tühjendada.'));
  };
  const saveText = () => {
    const element = byId.get(editing?.id);
    const text = editing?.text ?? '';
    setEditing(null);
    if (!element) return;
    if (!text.trim()) { service.remove(studentId, pageId, element.id).catch(fail('Tühja elementi ei saanud eemaldada.')); return; }
    if (text !== element.text) service.update(studentId, pageId, element, { text: text.slice(0, element.type === 'note' ? 2000 : 4000) }, user).catch(fail('Teksti ei saanud salvestada.'));
  };

  const render = (element) => {
    const common = { 'data-element-id': element.id, key: element.id };
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
        <div data-element-id={element.id} className={isNote ? 'sb-note' : 'sb-text'} style={isNote ? { background: element.color } : { color: element.color, fontSize: element.fontSize || 18 }}>{element.text || (isNote ? 'Topeltklõps, et kirjutada' : 'Tekst')}</div>
      </foreignObject>;
    }
    if (element.type === 'image') return <image {...common} href={element.url} x={element.x} y={element.y} width={element.w} height={element.h} preserveAspectRatio="xMidYMid meet" />;
    if (element.type === 'pdf') return <foreignObject {...common} x={element.x} y={element.y} width={Math.max(element.w, 160)} height={Math.max(Math.min(element.h, 120), 60)}><div data-element-id={element.id} className="sb-pdf"><strong>{element.name || 'PDF'}</strong><a href={element.url} target="_blank" rel="noreferrer">Ava PDF</a></div></foreignObject>;
    return null;
  };

  const editingElement = editing ? byId.get(editing.id) : null;
  return (
    <div className="sb">
      <div className="sb-pages" role="tablist" aria-label="Tahvli lehed">
        <button type="button" role="tab" aria-selected={pageId === null} onClick={() => setPageId(null)}>Tahvel</button>
        {pages.map((page) => <button type="button" role="tab" key={page.id} aria-selected={pageId === page.id} onClick={() => setPageId(page.id)}>{page.title || 'Leht'}</button>)}
        <span className={ready ? 'sb-sync is-ready' : 'sb-sync'}>{ready ? 'Sünkroonitud' : 'Ühendan…'}</span>
      </div>
      <div className="sb-toolbar" role="toolbar" aria-label="Tahvli tööriistad">
        {TOOLS.map(([key, label, Icon]) => <button type="button" key={key} className={tool === key ? 'is-active' : ''} aria-pressed={tool === key} aria-label={label} title={label} onClick={() => setTool(key)}><Icon size={18} /></button>)}
        <span className="sb-sep" />
        {(tool === 'note' ? NOTE_COLORS : COLORS).map((value) => <button type="button" key={value} className={`sb-color ${(tool === 'note' ? noteColor : color) === value ? 'is-active' : ''}`} style={{ background: value }} aria-label={`Värv ${value}`} onClick={() => (tool === 'note' ? setNoteColor(value) : setColor(value))} />)}
        <span className="sb-sep" />
        <button type="button" aria-label="Vähenda" onClick={() => zoom(1 / 1.2)}><Minus size={16} /></button>
        <span className="sb-zoom">{Math.round(view.scale * 100)}%</span>
        <button type="button" aria-label="Suurenda" onClick={() => zoom(1.2)}><Plus size={16} /></button>
        <button type="button" aria-label="Sobita" title="Näita kõike" onClick={fit}><Maximize size={16} /></button>
        {staff ? <Button variant="secondary" disabled={!elements.length} onClick={clear}><Trash2 size={16} /> Tühjenda</Button> : null}
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className={`sb-stage tool-${tool}`}>
        <svg ref={svgRef} role="img" aria-label="Õpilase tahvel" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onWheel={wheel}>
          <defs><pattern id="sb-dots" width={24 * view.scale} height={24 * view.scale} patternUnits="userSpaceOnUse" x={view.x} y={view.y}><circle cx="1" cy="1" r="1" fill="#d0d5dd" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#sb-dots)" />
          <g transform={`translate(${view.x} ${view.y}) scale(${view.scale})`}>
            {elements.filter((element) => element.id !== draft?.movingId).map(render)}
            {draft ? render({ ...draft, id: draft.id || '__draft' }) : null}
          </g>
        </svg>
        {editingElement ? <textarea
          className="sb-editor"
          aria-label={editingElement.type === 'note' ? 'Märkmepaberi tekst' : 'Tekst'}
          autoFocus
          style={{ left: view.x + editingElement.x * view.scale, top: view.y + editingElement.y * view.scale, width: editingElement.w * view.scale, height: editingElement.h * view.scale, fontSize: (editingElement.type === 'note' ? 15 : editingElement.fontSize || 18) * view.scale }}
          value={editing.text}
          maxLength={editingElement.type === 'note' ? 2000 : 4000}
          onChange={(event) => setEditing({ ...editing, text: event.target.value })}
          onBlur={saveText}
          onKeyDown={(event) => { if (event.key === 'Escape') event.currentTarget.blur(); }}
        /> : null}
        {ready && !elements.length && !draft ? <div className="sb-empty">Tühi tahvel: joonista, lisa märkmepaber või tekst. Õpetaja ja õpilane näevad muudatusi kohe.</div> : null}
      </div>
      <p className="sb-hint"><FileText size={14} /> Sama tahvel, mis vanas CRM-is: varem joonistatu on alles. Rattaga suumid, „Liiguta tahvlit” või tühjast kohast lohistades nihutad.</p>
    </div>
  );
}
