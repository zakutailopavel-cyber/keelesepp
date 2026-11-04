import { Maximize2, Minimize2 } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  PRESET_WIDTHS, clampRect, fitWidth, fromAnchored, loadLayout, saveLayout, snapRect, toAnchored,
} from './floatingLayout.js';

// Movable, resizable video windows over the board (owner 2026-11-04). The layer covers the board but lets every
// pointer through; only a window itself catches the pointer, so drawing under it works everywhere else.
const BoundsContext = createContext({ w: 0, h: 0 });
let topZ = 1;

function measure(element) {
  const w = element?.clientWidth || 0;
  const h = element?.clientHeight || 0;
  // no layout (tests, a hidden tab): the window size is a fair stand-in, so the geometry still works
  if (!w || !h) return { w: globalThis.innerWidth || 1024, h: globalThis.innerHeight || 768 };
  return { w, h };
}

export function FloatingLayer({ children, inset = {}, className = '' }) {
  const ref = useRef(null);
  const [bounds, setBounds] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const element = ref.current;
    const update = () => setBounds((current) => {
      const next = measure(element);
      return current.w === next.w && current.h === next.h ? current : next;
    });
    update();
    const observer = typeof globalThis.ResizeObserver === 'function' ? new globalThis.ResizeObserver(update) : null;
    observer?.observe?.(element);
    globalThis.addEventListener?.('resize', update);
    return () => { observer?.disconnect?.(); globalThis.removeEventListener?.('resize', update); };
  }, []);
  return <div ref={ref} className={`lr-float ${className}`} style={{ top: inset.top || 0, right: inset.right || 0, bottom: inset.bottom || 0, left: inset.left || 0 }}>
    <BoundsContext.Provider value={bounds}>{bounds.w ? children : null}</BoundsContext.Provider>
  </div>;
}

const PRESET_LABELS = [['s', 'Väike aken', 'S'], ['m', 'Keskmine aken', 'M'], ['l', 'Suur aken', 'L']];

/**
 * One movable window. `heightFor(width)` keeps the aspect; `defaultLayout(bounds)` places it the first time.
 * The content stays mounted when minimized (the other side's sound plays from its <video>).
 */
export default function FloatingWindow({
  id, label, heightFor, defaultLayout, presets = PRESET_WIDTHS, minWidth = 96, children, controls = null,
  className = '', onLayoutChange, minimizeLabel = 'Peida video (heli jääb)', restoreLabel, restoreContent = null,
}) {
  const bounds = useContext(BoundsContext);
  const [layout, setLayout] = useState(() => loadLayout(id) || defaultLayout(bounds));
  // another window id in the same place (e.g. the group strip turned into a row): its own remembered layout
  const [layoutId, setLayoutId] = useState(id);
  if (layoutId !== id) {
    setLayoutId(id);
    setLayout(loadLayout(id) || defaultLayout(bounds));
  }
  const [drag, setDrag] = useState(null); // live rectangle while moving / resizing
  const [showTools, setShowTools] = useState(false);
  const [z, setZ] = useState(() => topZ);
  const gesture = useRef(null);
  const options = useMemo(() => ({ minWidth }), [minWidth]);
  const rect = useMemo(() => fromAnchored(layout, bounds, heightFor, options), [layout, bounds, heightFor, options]);
  const shown = drag || rect;

  const commit = useCallback((next) => {
    setLayout(next);
    saveLayout(id, next);
  }, [id]);
  const onLayoutRef = useRef(onLayoutChange);
  useEffect(() => { onLayoutRef.current = onLayoutChange; }, [onLayoutChange]);
  useEffect(() => { onLayoutRef.current?.(id, layout); }, [id, layout]);

  const front = () => { topZ += 1; setZ(topZ); };
  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const resize = event.target.closest?.('[data-resize]')?.getAttribute('data-resize') || '';
    if (!resize && event.target.closest?.('button, a, input, select, textarea, [data-no-drag]')) return;
    front();
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, start: rect, resize, moved: false };
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* not supported */ }
    event.preventDefault();
  };
  // the rectangle for the pointer's current place (a move or a resize from a corner)
  const rectAt = (current, event) => {
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (!current.moved && Math.abs(dx) + Math.abs(dy) < 4) return null;
    current.moved = true;
    const { start } = current;
    if (current.resize) {
      const wanted = current.resize === 'left' ? start.w - dx : start.w + dx;
      const w = fitWidth(wanted, heightFor, bounds, options);
      const x = current.resize === 'left' ? start.x + start.w - w : start.x;
      return clampRect({ x, y: start.y, w, h: heightFor(w) }, bounds);
    }
    return clampRect({ ...start, x: start.x + dx, y: start.y + dy }, bounds);
  };
  const onPointerMove = (event) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const next = rectAt(current, event);
    if (next) setDrag(next);
  };
  const finish = (event) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    // the release point decides (a fast flick may skip the last move events)
    const end = event.type === 'pointercancel' ? drag : rectAt(current, event) || drag;
    if (!current.moved || !end) { if (!current.moved) setShowTools((open) => !open); setDrag(null); return; }
    setDrag(null);
    commit(toAnchored(current.resize ? clampRect(end, bounds) : snapRect(end, bounds), bounds, { min: layout.min }));
  };
  const setPreset = (name) => {
    const w = fitWidth(presets[name], heightFor, bounds, options);
    // grow or shrink towards the window's own corner, so it stays where it was put
    const right = rect.x + rect.w / 2 > bounds.w / 2;
    const bottom = rect.y + rect.h / 2 > bounds.h / 2;
    const h = heightFor(w);
    const next = clampRect({ x: right ? rect.x + rect.w - w : rect.x, y: bottom ? rect.y + rect.h - h : rect.y, w, h }, bounds);
    commit(toAnchored(next, bounds, { min: false }));
  };
  const setMin = (min) => commit({ ...layout, min });
  const onKeyDown = (event) => {
    const step = event.shiftKey ? 48 : 16;
    const move = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (!move || event.target !== event.currentTarget) return;
    event.preventDefault();
    commit(toAnchored(clampRect({ ...rect, x: rect.x + move[0], y: rect.y + move[1] }, bounds), bounds, { min: layout.min }));
  };

  const style = { transform: `translate(${Math.round(shown.x)}px, ${Math.round(shown.y)}px)`, width: Math.round(shown.w), height: Math.round(shown.h), zIndex: z };
  const minimized = layout.min;
  // a minimized window is a chip in the same corner; its content stays (sound) but is out of sight
  const chipStyle = {
    zIndex: z,
    ...(layout.ax === 'left' ? { left: layout.dx } : { right: layout.dx }),
    ...(layout.ay === 'top' ? { top: layout.dy } : { bottom: layout.dy }),
  };
  return <>
    {minimized ? <button type="button" className="lr-fw-chip" style={chipStyle} onClick={() => setMin(false)} aria-label={restoreLabel || `Näita videot: ${label}`}>
      <Maximize2 size={14} aria-hidden="true" />{restoreContent || <span>{label}</span>}
    </button> : null}
    <div
      role="group" aria-label={label} tabIndex={minimized ? -1 : 0}
      className={`lr-fw ${className} ${minimized ? 'is-min' : ''} ${drag ? 'is-dragging' : ''} ${showTools ? 'show-tools' : ''}`}
      style={minimized ? { zIndex: z } : style} aria-hidden={minimized || undefined}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={finish} onPointerCancel={finish} onKeyDown={onKeyDown}
    >
      <div className="lr-fw__body">{children}</div>
      {!minimized ? <>
        <div className="lr-fw__tools" data-no-drag>
          {PRESET_LABELS.map(([name, text, short]) => <button key={name} type="button" aria-label={text} title={text} onClick={() => setPreset(name)}>{short}</button>)}
          {controls}
          <button type="button" aria-label={minimizeLabel} title={minimizeLabel} onClick={() => setMin(true)}><Minimize2 size={14} aria-hidden="true" /></button>
        </div>
        <span className="lr-fw__grip lr-fw__grip--left" data-resize="left" aria-hidden="true" />
        <span className="lr-fw__grip lr-fw__grip--right" data-resize="right" aria-hidden="true" />
      </> : null}
    </div>
  </>;
}
