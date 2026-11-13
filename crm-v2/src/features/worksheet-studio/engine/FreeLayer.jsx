import { useRef } from 'react';
import { Md } from './ui.jsx';
import { objectPosition } from './image.js';
import { PAGE_W, moveItem, resizeItem } from './freeLayer.js';

// „Vaba kiht” on one A4 page (freeLayer.js). Positions are mm on the 270 mm design page, so print, zoom and the book
// draw it the same. In the constructor (`edit`): a tap selects, a drag moves, the corner resizes (pictures and circles
// keep their proportions), each finished drag is one undo step (`onChange(id, next)`). A locked item can only be
// selected (to open its lock). Buttons are of a finger's size whatever the page's zoom (sheet.css .ws-free-*).
const mm = (value) => `${value}mm`;

function FreeContent({ item }) {
  if (item.kind === 'image') {
    return item.img?.src
      ? <img src={item.img.src} alt={item.alt || ''} style={{ objectPosition: objectPosition(item.img) }} draggable={false} />
      : <div className="ws-free-empty">Pilt</div>;
  }
  if (item.kind === 'text') return <div className="ws-free-text" style={{ fontSize: `${item.size}pt`, fontWeight: item.bold ? 800 : 400 }}><Md text={item.text} /></div>;
  return null;
}

function FreeItem({ item, editable, selected, onSelect, onChange }) {
  const ref = useRef(null);
  const live = editable && !item.locked;
  // one pointer drag: the item follows by a CSS transform, the stored value changes once at the end
  const drag = (event, kind) => {
    if (!editable) return;
    event.stopPropagation();
    onSelect?.(item.id);
    if (!live) return;
    event.preventDefault();
    const el = ref.current;
    const page = el?.closest('.ws-page');
    if (!el || !page) return;
    const perPx = PAGE_W / Math.max(1, page.getBoundingClientRect().width);
    const start = { x: event.clientX, y: event.clientY };
    const target = event.currentTarget;
    target.setPointerCapture?.(event.pointerId);
    const next = (e) => {
      const dx = (e.clientX - start.x) * perPx;
      const dy = (e.clientY - start.y) * perPx;
      return kind === 'move' ? moveItem(item, dx, dy) : resizeItem(item, dx, dy, item.kind === 'image' || item.shape === 'circle');
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
      if (e.type !== 'pointerup' || Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) < 4) return;
      const n = next(e);
      onChange?.(item.id, n);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };
  const classes = ['ws-free-item', `is-${item.kind}`, `shape-${item.shape}`, `fill-${item.fill}`, `border-${item.border}`, selected ? 'is-selected' : '', item.locked ? 'is-locked' : ''].filter(Boolean).join(' ');
  return (
    <div
      ref={ref}
      className={classes}
      data-free={item.id}
      style={{ left: mm(item.x), top: mm(item.y), width: mm(item.w), height: mm(item.h), zIndex: 5 + item.z, transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined }}
      onPointerDown={editable ? (e) => drag(e, 'move') : undefined}
      onClick={editable ? (e) => e.stopPropagation() : undefined}
      onDoubleClick={editable ? (e) => e.stopPropagation() : undefined}
      role={editable ? 'button' : undefined}
      aria-label={editable ? `Vaba element: ${item.kind === 'text' ? item.text.slice(0, 40) : item.kind === 'image' ? 'pilt' : 'kujund'}` : undefined}
      aria-pressed={editable ? selected : undefined}
    >
      <FreeContent item={item} />
      {live && selected ? <button type="button" className="ws-free-size" aria-label="Muuda suurust" title="Lohista: suurus" onPointerDown={(e) => drag(e, 'size')} onClick={(e) => e.stopPropagation()}>⤡</button> : null}
    </div>
  );
}

// the layer of one page: `items` = freeLayer.itemsOnPage(...); `edit` = { selectedId, onSelect, onChange } or null
export default function FreeLayer({ items, edit = null }) {
  if (!items.length) return null;
  return (
    <div className="ws-free" data-noedit="">
      {items.map((item) => (
        <FreeItem key={item.id} item={item} editable={Boolean(edit)} selected={edit?.selectedId === item.id} onSelect={edit?.onSelect} onChange={edit?.onChange} />
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
        <div key={item.id} className={`ws-free-flowitem is-${item.kind} shape-${item.shape} fill-${item.fill} border-${item.border}`}>
          <FreeContent item={item} />
        </div>
      ))}
    </div>
  );
}
