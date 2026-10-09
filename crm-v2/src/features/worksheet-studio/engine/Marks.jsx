/* global ResizeObserver */
import { useLayoutEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { MARK_COLORS, STICKERS, marksOf, moveMark, removeMark, resizeMark, updateMark } from './marksModel.js';
import { openFloatingEditor } from './floatingEditor.js';

// The free layer over a block card: arrows, callouts, free text, stickers and rings (marksModel.js). In edit mode a
// mark is dragged to move, its handle resizes it (an arrow has a handle at each end), double-click edits its text,
// Delete removes it; the small bar above the selected mark changes the colour or the sticker.
export default function MarksLayer({ block, editable = false, onChange }) {
  const layer = useRef(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null); // the mark being dragged, drawn before it is saved
  const marks = marksOf(block).map((m) => (draft?.id === m.id ? draft : m));
  const hasMarks = marks.length > 0;

  useLayoutEffect(() => {
    const el = layer.current;
    if (!el) return undefined;
    const measure = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [hasMarks]);

  if (!hasMarks) return null;
  const save = (next) => onChange?.(next);
  const pct = (e) => {
    const r = layer.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / Math.max(1, r.width)) * 100, y: ((e.clientY - r.top) / Math.max(1, r.height)) * 100 };
  };
  // pointer drag: move the mark, or move one handle
  const drag = (event, mark, handle = null) => {
    if (!editable || event.button > 0) return;
    event.preventDefault();
    event.stopPropagation();
    setSelected(mark.id);
    const start = pct(event);
    const mmPerPct = layer.current ? (layer.current.getBoundingClientRect().width / 100) / ((layer.current.closest('.ws-page')?.getBoundingClientRect().width || 1020) / 270) : 2.5;
    let current = mark;
    let moved = false;
    const move = (e) => {
      const at = pct(e);
      moved = true;
      current = handle ? resizeMark(mark, handle, at.x, at.y, mmPerPct) : moveMark(mark, at.x - start.x, at.y - start.y);
      setDraft(current);
    };
    const up = () => {
      globalThis.removeEventListener('pointermove', move);
      globalThis.removeEventListener('pointerup', up);
      setDraft(null);
      if (moved) {
        save(updateMark(block, mark.id, current));
        // the click that ends a drag must not select the block underneath
        const swallow = (e) => e.stopPropagation();
        globalThis.addEventListener('click', swallow, { capture: true, once: true });
        globalThis.setTimeout(() => globalThis.removeEventListener('click', swallow, { capture: true }), 0);
      }
    };
    globalThis.addEventListener('pointermove', move);
    globalThis.addEventListener('pointerup', up);
  };
  const editText = (event, mark) => {
    if (!editable || !('text' in mark)) return;
    event.preventDefault();
    event.stopPropagation();
    openFloatingEditor({ anchor: event.currentTarget, value: mark.text || '', multiline: mark.kind === 'note', label: 'Märke tekst', onCommit: (text) => save(updateMark(block, mark.id, { text: text.trim() || mark.text })) });
  };
  const keys = (event, mark) => {
    if (!editable) return;
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); event.stopPropagation(); setSelected(null); save(removeMark(block, mark.id)); }
    if (event.key === 'Escape') setSelected(null);
  };
  const common = (mark) => ({
    'data-mark': mark.id,
    tabIndex: editable ? 0 : -1,
    onPointerDown: (e) => drag(e, mark),
    onClick: editable ? (e) => { e.stopPropagation(); setSelected(mark.id); } : undefined,
    onDoubleClick: (e) => editText(e, mark),
    onKeyDown: (e) => keys(e, mark),
    onFocus: editable ? () => setSelected(mark.id) : undefined,
  });
  const handle = (mark, name, x, y) => (
    <span key={name} className={`ws-mark-handle is-${name}`} style={{ left: `${x}%`, top: `${y}%` }} role="separator" aria-label={name === 'end' || name === 'start' ? 'Lohista noole otsa' : 'Muuda suurust'} onPointerDown={(e) => drag(e, mark, name)} onClick={(e) => e.stopPropagation()} />
  );
  const color = (mark) => MARK_COLORS[mark.color] || MARK_COLORS.navy;
  const current = marks.find((m) => m.id === selected);

  return (
    <div ref={layer} className={`ws-marks ${editable ? 'is-editable' : ''}`} onDoubleClick={editable ? (e) => e.stopPropagation() : undefined}>
      {box.w > 0 && marks.some((m) => m.kind === 'arrow') ? (
        <svg className="ws-marks-svg" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
          {marks.filter((m) => m.kind === 'arrow').map((m) => {
            const x1 = (m.x1 / 100) * box.w; const y1 = (m.y1 / 100) * box.h;
            const x2 = (m.x2 / 100) * box.w; const y2 = (m.y2 / 100) * box.h;
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const head = 14;
            const wing = (side) => `${x2 - head * Math.cos(angle - side * 0.45)},${y2 - head * Math.sin(angle - side * 0.45)}`;
            return (
              <g key={m.id} style={{ color: color(m) }} className={selected === m.id ? 'is-selected' : ''} {...common(m)}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="ws-arrow-hit" />
                <line x1={x1} y1={y1} x2={x2 - 6 * Math.cos(angle)} y2={y2 - 6 * Math.sin(angle)} className="ws-arrow-line" />
                <polygon points={`${x2},${y2} ${wing(1)} ${wing(-1)}`} className="ws-arrow-head" />
              </g>
            );
          })}
        </svg>
      ) : null}
      {marks.filter((m) => m.kind !== 'arrow').map((m) => {
        const style = { left: `${m.x}%`, top: `${m.y}%`, '--mark-c': color(m), ...(m.w ? { width: `${m.w}%` } : {}), ...(m.kind === 'circle' ? { height: `${m.h}%` } : {}), ...(m.kind === 'sticker' ? { fontSize: `${m.size || 12}mm` } : {}) };
        return (
          <div key={m.id} className={`ws-mark is-${m.kind} ${selected === m.id ? 'is-selected' : ''}`} style={style} {...common(m)} aria-label={m.kind === 'sticker' ? `Kleebis ${m.emoji}` : undefined}>
            {m.kind === 'note' || m.kind === 'label' ? <span className="ws-mark-text">{m.text}</span> : null}
            {m.kind === 'sticker' ? <span aria-hidden="true">{m.emoji}</span> : null}
          </div>
        );
      })}
      {editable && current ? (
        <>
          {current.kind === 'arrow'
            ? [handle(current, 'start', current.x1, current.y1), handle(current, 'end', current.x2, current.y2)]
            : current.kind === 'sticker'
              ? handle(current, 'size', current.x + ((current.size || 12) / 2.5), current.y + 4)
              : handle(current, 'size', current.x + (current.w || 10), current.kind === 'circle' ? current.y + current.h : current.y + 6)}
          <div className="ws-mark-bar" role="toolbar" aria-label="Märke tööriistad" style={{ left: `${current.kind === 'arrow' ? Math.min(current.x1, current.x2) : current.x}%`, top: `${current.kind === 'arrow' ? Math.min(current.y1, current.y2) : current.y}%` }} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            {current.kind === 'sticker'
              ? STICKERS.map((emoji) => <button key={emoji} type="button" className={current.emoji === emoji ? 'on' : ''} onClick={() => save(updateMark(block, current.id, { emoji }))} aria-label={`Kleebis ${emoji}`}>{emoji}</button>)
              : Object.entries(MARK_COLORS).map(([name, value]) => <button key={name} type="button" className={`is-color ${current.color === name ? 'on' : ''}`} style={{ background: value }} onClick={() => save(updateMark(block, current.id, { color: name }))} aria-label={`Värv ${name}`} />)}
            <button type="button" className="is-delete" onClick={() => { setSelected(null); save(removeMark(block, current.id)); }} aria-label="Kustuta märge"><Trash2 aria-hidden="true" /></button>
          </div>
        </>
      ) : null}
    </div>
  );
}
