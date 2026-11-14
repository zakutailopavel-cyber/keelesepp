import { useEffect, useRef, useState } from 'react';
import { Md } from './ui.jsx';
import { objectPosition } from './image.js';
import { LINE_COLOR_VALUE, PAGE_W, lineGeom, moveEnd, moveItem, lookStyle, resizeItem, snapItem, textStyle } from './freeLayer.js';

// „Vaba kiht” on one A4 page (freeLayer.js). Positions are mm on the 270 mm design page, so print, zoom and the book
// draw it the same. In the constructor (`edit`): a tap selects, a drag moves, the corner resizes (pictures and circles
// keep their proportions), each finished drag is one undo step (`onChange(id, next)`). A locked item can only be
// selected (to open its lock). Buttons are of a finger's size whatever the page's zoom (sheet.css .ws-free-*).
const mm = (value) => `${value}mm`;

// the thin guide lines of a snap, drawn straight into the page's layer during a drag (no React redraw per move)
function showGuides(layer, guides = []) {
  if (!layer) return;
  layer.querySelectorAll('.ws-free-guide').forEach((node) => node.remove());
  for (const guide of guides) {
    const node = document.createElement('div');
    node.className = `ws-free-guide is-${guide.axis}`;
    node.style[guide.axis === 'x' ? 'left' : 'top'] = mm(guide.at);
    layer.appendChild(node);
  }
}

function FreeContent({ item }) {
  if (item.kind === 'image') {
    return item.img?.src
      ? <img src={item.img.src} alt={item.alt || ''} style={{ objectPosition: objectPosition(item.img) }} draggable={false} />
      : <div className="ws-free-empty">Pilt</div>;
  }
  if (item.kind === 'text') return <div className="ws-free-text" style={textStyle(item)}><Md text={item.text} /></div>;
  return null;
}

// A text box typed in on the sheet itself (2026-11-14): a double tap / click — or a tap on a box that is already
// selected — opens a textarea in the box with the same size of letters; leaving it (tap elsewhere, Ctrl+Enter) keeps
// the text as one undo step, Esc gives the old text back. The text stays Markdown (*kaldkiri*, **paks**).
function TextEditor({ item, onDone }) {
  const [value, setValue] = useState(item.text);
  const box = useRef(null);
  const cancelled = useRef(false);
  useEffect(() => { const el = box.current; if (el) { el.focus(); el.select(); } }, []);
  const finish = () => onDone(cancelled.current ? null : value.slice(0, 600));
  return (
    <textarea
      ref={box}
      className="ws-free-input"
      aria-label="Tekstikasti tekst"
      value={value}
      maxLength={600}
      style={textStyle(item)}
      onChange={(e) => setValue(e.target.value)}
      onBlur={finish}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Escape') { e.preventDefault(); cancelled.current = true; e.currentTarget.blur(); }
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); e.currentTarget.blur(); }
      }}
    />
  );
}

function FreeItem({ item, others = [], editable, selected, onSelect, onChange }) {
  const ref = useRef(null);
  const live = editable && !item.locked;
  const [typing, setTyping] = useState(false);
  const canType = editable && item.kind === 'text';
  // another item selected → stop typing (adjusting state while rendering, not in an effect)
  const [shownSelected, setShownSelected] = useState(selected);
  if (shownSelected !== selected) { setShownSelected(selected); if (!selected) setTyping(false); }
  const doneTyping = (text) => {
    setTyping(false);
    if (text !== null && text !== item.text) onChange?.(item.id, { ...item, text });
  };
  // one pointer drag: the item follows by a CSS transform, the stored value changes once at the end
  const drag = (event, kind) => {
    if (!editable || typing) return;
    event.stopPropagation();
    const wasSelected = selected;
    onSelect?.(item.id);
    if (!live) return;
    event.preventDefault();
    const el = ref.current;
    const page = el?.closest('.ws-page');
    const layer = el?.closest('.ws-free');
    if (!el || !page) return;
    const perPx = PAGE_W / Math.max(1, page.getBoundingClientRect().width);
    const start = { x: event.clientX, y: event.clientY };
    const target = event.currentTarget;
    target.setPointerCapture?.(event.pointerId);
    const next = (e) => {
      const dx = (e.clientX - start.x) * perPx;
      const dy = (e.clientY - start.y) * perPx;
      if (kind !== 'move') return resizeItem(item, dx, dy, item.kind === 'image' || item.shape === 'circle');
      const moved = moveItem(item, dx, dy);
      const snap = e.altKey ? { item: moved, guides: [] } : snapItem(moved, others);
      showGuides(layer, snap.guides);
      return snap.item;
    };
    const onMove = (e) => {
      const n = next(e);
      el.style.left = mm(n.x); el.style.top = mm(n.y); el.style.width = mm(n.w); el.style.height = mm(n.h);
    };
    const onUp = (e) => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
      el.style.left = mm(item.x); el.style.top = mm(item.y); el.style.width = mm(item.w); el.style.height = mm(item.h);
      if (e.type !== 'pointerup') { showGuides(layer); return; }
      if (Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) < 4) {
        showGuides(layer);
        if (kind === 'move' && wasSelected && canType) setTyping(true); // a second tap on a selected text box: type
        return;
      }
      const n = next(e);
      showGuides(layer);
      onChange?.(item.id, n);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };
  const classes = ['ws-free-item', `is-${item.kind}`, typing ? 'is-typing' : '', `shape-${item.shape}`, `fill-${item.fill}`, `border-${item.border}`, selected ? 'is-selected' : '', item.locked ? 'is-locked' : ''].filter(Boolean).join(' ');
  return (
    <div
      ref={ref}
      className={classes}
      data-free={item.id}
      style={{ left: mm(item.x), top: mm(item.y), width: mm(item.w), height: mm(item.h), zIndex: 5 + item.z, transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined, ...lookStyle(item) }}
      onPointerDown={editable ? (e) => drag(e, 'move') : undefined}
      onClick={editable ? (e) => e.stopPropagation() : undefined}
      onDoubleClick={editable ? (e) => { e.stopPropagation(); if (canType) { onSelect?.(item.id); setTyping(true); } } : undefined}
      role={editable && !typing ? 'button' : undefined}
      aria-label={editable && !typing ? `Vaba element: ${item.kind === 'text' ? item.text.slice(0, 40) : item.kind === 'image' ? 'pilt' : 'kujund'}` : undefined}
      aria-pressed={editable && !typing ? selected : undefined}
    >
      {typing ? <TextEditor item={item} onDone={doneTyping} /> : <FreeContent item={item} />}
      {live && selected && !typing ? <button type="button" className="ws-free-size" aria-label="Muuda suurust" title="Lohista: suurus" onPointerDown={(e) => drag(e, 'size')} onClick={(e) => e.stopPropagation()}>⤡</button> : null}
    </div>
  );
}

// A line / arrow: a strip as long as the line, turned by its angle around its start; the SVG inside is in mm. The
// strip is 8 mm high so a finger can take it; the ends are round handles (edit mode, selected, not locked).
const HIT = 8;
const lineStyle = (item) => {
  const { length, angle } = lineGeom(item);
  return { left: mm(item.x), top: mm(item.y - HIT / 2), width: mm(Math.max(length, 0.1)), height: mm(HIT), transform: `rotate(${angle}deg)` };
};
function LineArt({ item }) {
  const { length } = lineGeom(item);
  const color = LINE_COLOR_VALUE[item.color] || LINE_COLOR_VALUE.ink;
  const head = Math.max(2.5, item.stroke * 3 + 1.5);
  const mid = HIT / 2;
  const startAt = item.heads === 'both' ? head * 0.8 : 0;
  const endAt = item.heads === 'none' ? length : Math.max(startAt, length - head * 0.8);
  const arrow = (tip, dir) => <polygon points={`${tip},${mid} ${tip - dir * head},${mid - head * 0.55} ${tip - dir * head},${mid + head * 0.55}`} fill={color} />;
  return (
    <svg className="ws-free-line" width={mm(Math.max(length, 0.1))} height={mm(HIT)} viewBox={`0 0 ${Math.max(length, 0.1)} ${HIT}`} aria-hidden="true">
      <line x1={startAt} y1={mid} x2={endAt} y2={mid} stroke={color} strokeWidth={item.stroke} strokeLinecap={item.dash ? 'butt' : 'round'} strokeDasharray={item.dash ? `${item.stroke * 3} ${item.stroke * 2}` : undefined} />
      {item.heads !== 'none' ? arrow(length, 1) : null}
      {item.heads === 'both' ? arrow(0, -1) : null}
    </svg>
  );
}

function LineItem({ item, others = [], editable, selected, onSelect, onChange }) {
  const ref = useRef(null);
  const live = editable && !item.locked;
  const drag = (event, part) => {
    if (!editable) return;
    event.stopPropagation();
    onSelect?.(item.id);
    if (!live) return;
    event.preventDefault();
    const el = ref.current;
    const page = el?.closest('.ws-page');
    const layer = el?.closest('.ws-free');
    if (!el || !page) return;
    const perPx = PAGE_W / Math.max(1, page.getBoundingClientRect().width);
    const start = { x: event.clientX, y: event.clientY };
    const target = event.currentTarget;
    target.setPointerCapture?.(event.pointerId);
    const next = (e) => {
      const dx = (e.clientX - start.x) * perPx;
      const dy = (e.clientY - start.y) * perPx;
      if (part !== 'move') return moveEnd(item, part, dx, dy);
      const moved = moveItem(item, dx, dy);
      const snap = e.altKey ? { item: moved, guides: [] } : snapItem(moved, others);
      showGuides(layer, snap.guides);
      return snap.item;
    };
    const show = (n) => Object.assign(el.style, lineStyle(n));
    const onMove = (e) => show(next(e));
    const onUp = (e) => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
      show(item);
      if (e.type !== 'pointerup' || Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) < 4) { showGuides(layer); return; }
      const n = next(e);
      showGuides(layer);
      onChange?.(item.id, n);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };
  return (
    <div
      ref={ref}
      className={['ws-free-item', 'is-line', selected ? 'is-selected' : '', item.locked ? 'is-locked' : ''].filter(Boolean).join(' ')}
      data-free={item.id}
      style={{ ...lineStyle(item), zIndex: 5 + item.z, ...lookStyle(item) }}
      onPointerDown={editable ? (e) => drag(e, 'move') : undefined}
      onClick={editable ? (e) => e.stopPropagation() : undefined}
      onDoubleClick={editable ? (e) => e.stopPropagation() : undefined}
      role={editable ? 'button' : undefined}
      aria-label={editable ? (item.heads === 'none' ? 'Vaba element: joon' : 'Vaba element: nool') : undefined}
      aria-pressed={editable ? selected : undefined}
    >
      <LineArt item={item} />
      {live && selected ? <>
        <button type="button" className="ws-free-end is-start" aria-label="Lohista joone algust" onPointerDown={(e) => drag(e, 'start')} onClick={(e) => e.stopPropagation()} />
        <button type="button" className="ws-free-end is-end" aria-label="Lohista joone lõppu" onPointerDown={(e) => drag(e, 'end')} onClick={(e) => e.stopPropagation()} />
      </> : null}
    </div>
  );
}

// the layer of one page: `items` = freeLayer.itemsOnPage(...); `edit` = { selectedId, onSelect, onChange } or null
export default function FreeLayer({ items, edit = null }) {
  if (!items.length) return null;
  return (
    <div className="ws-free" data-noedit="">
      {items.map((item) => (item.kind === 'line'
        ? <LineItem key={item.id} item={item} others={edit ? items.filter((o) => o.id !== item.id) : undefined} editable={Boolean(edit)} selected={edit?.selectedId === item.id} onSelect={edit?.onSelect} onChange={edit?.onChange} />
        : <FreeItem key={item.id} item={item} others={edit ? items.filter((o) => o.id !== item.id) : undefined} editable={Boolean(edit)} selected={edit?.selectedId === item.id} onSelect={edit?.onSelect} onChange={edit?.onChange} />
      ))}
    </div>
  );
}

// the phone column: pictures and text boxes one under another after the blocks (freeLayer.flowItems)
export function FreeFlow({ items }) {
  if (!items.length) return null;
  return (
    <div className="ws-free-flow">
      {items.map((item) => (
        <div key={item.id} className={`ws-free-flowitem is-${item.kind} shape-${item.shape} fill-${item.fill} border-${item.border}`} style={lookStyle(item)}>
          <FreeContent item={item} />
        </div>
      ))}
    </div>
  );
}
