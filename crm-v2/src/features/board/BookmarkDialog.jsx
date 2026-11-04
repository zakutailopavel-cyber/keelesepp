import { Bookmark, Eraser, PenLine, Type, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BOOKMARK_COLORS, INK_BOX, INK_COLORS, MAX_INK, bookmarkEmpty, cleanInk, inkPath } from './bookmarkModel.js';

/**
 * „Järjehoidja / Kleebis”: a small sheet to write on by hand (pen, finger, stylus) or type. „Salvesta” hands
 * { text, ink, color } to `onSave`; the board stores it as a sticky sheet and as a note in the student's „Minu vead”.
 */
export default function BookmarkDialog({ initial = null, onSave, onCancel, forStudent = '', saving = false }) {
  const [text, setText] = useState(initial?.text || '');
  const [ink, setInk] = useState(() => cleanInk(initial?.ink));
  const [color, setColor] = useState(initial?.color || BOOKMARK_COLORS[0]);
  const [pen, setPen] = useState(INK_COLORS[0]);
  const [mode, setMode] = useState(initial?.text && !initial?.ink?.length ? 'type' : 'pen');
  const [live, setLive] = useState(null);
  const pad = useRef(null);
  const typed = useRef(null);
  // „Trüki”: the caret goes straight into the sheet
  useEffect(() => { if (mode === 'type') typed.current?.focus(); }, [mode]);
  const stroke = useRef(null);
  const at = (event) => {
    const rect = pad.current.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / (rect.width || 1)) * INK_BOX.w, y: ((event.clientY - rect.top) / (rect.height || 1)) * INK_BOX.h };
  };
  const down = (event) => {
    if (mode !== 'pen' || ink.length >= MAX_INK) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    stroke.current = [at(event)];
    setLive(inkPath(stroke.current));
  };
  const move = (event) => {
    if (!stroke.current) return;
    event.preventDefault();
    const point = at(event);
    const last = stroke.current[stroke.current.length - 1];
    if (Math.hypot(point.x - last.x, point.y - last.y) < 1.2 || stroke.current.length >= 500) return;
    stroke.current.push(point);
    setLive(inkPath(stroke.current));
  };
  const up = () => {
    if (!stroke.current) return;
    const d = inkPath(stroke.current);
    stroke.current = null;
    setLive(null);
    if (d) setInk((current) => cleanInk([...current, { d, c: pen, w: 3 }]));
  };
  const empty = bookmarkEmpty({ text, ink });
  return <div className="sb-bookmark" role="dialog" aria-label="Järjehoidja" onPointerDown={(event) => event.stopPropagation()} onWheel={(event) => event.stopPropagation()}>
    <header>
      <Bookmark size={16} aria-hidden="true" />
      <strong>Järjehoidja</strong>
      {forStudent ? <small>läheb ka „Minu vead” alla</small> : null}
      <button type="button" className="sb-bookmark__close" aria-label="Sulge" onClick={onCancel}><X size={16} /></button>
    </header>
    <div className="sb-bookmark__modes" role="group" aria-label="Kirjutamise viis">
      <button type="button" className={mode === 'pen' ? 'is-active' : ''} aria-pressed={mode === 'pen'} onClick={() => setMode('pen')}><PenLine size={14} /> Käega</button>
      <button type="button" className={mode === 'type' ? 'is-active' : ''} aria-pressed={mode === 'type'} onClick={() => setMode('type')}><Type size={14} /> Trüki</button>
      {mode === 'pen' ? <span className="sb-bookmark__inks">{INK_COLORS.map((value) => <button type="button" key={value} className={`sb-color ${pen === value ? 'is-active' : ''}`} style={{ background: value }} aria-label={`Pliiats ${value}`} aria-pressed={pen === value} onClick={() => setPen(value)} />)}</span> : null}
    </div>
    <div className="sb-bookmark__sheet" style={{ background: color }}>
      <svg ref={pad} data-testid="bookmark-pad" className={mode === 'pen' ? 'is-pen' : ''} viewBox={`0 0 ${INK_BOX.w} ${INK_BOX.h}`} preserveAspectRatio="none"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        {ink.map((item, index) => <path key={index} d={item.d} stroke={item.c} strokeWidth={item.w} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        {live ? <path d={live} stroke={pen} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
      <textarea ref={typed} aria-label="Järjehoidja tekst" placeholder={mode === 'type' ? 'Kirjuta siia…' : ''} value={text} maxLength={2000}
        className={mode === 'type' ? 'is-typing' : ''} readOnly={mode !== 'type'} tabIndex={mode === 'type' ? 0 : -1}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Escape') onCancel?.(); if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !empty) onSave?.({ text, ink, color }); }} />
    </div>
    <div className="sb-bookmark__colors" role="group" aria-label="Paberi värv">
      {BOOKMARK_COLORS.map((value) => <button type="button" key={value} className={`sb-color ${color === value ? 'is-active' : ''}`} style={{ background: value }} aria-label={`Paber ${value}`} aria-pressed={color === value} onClick={() => setColor(value)} />)}
      <button type="button" className="sb-bookmark__clear" disabled={!ink.length} onClick={() => setInk((current) => current.slice(0, -1))}><Eraser size={14} /> Võta joon tagasi</button>
    </div>
    <footer>
      <button type="button" className="sb-bookmark__cancel" onClick={onCancel}>Loobu</button>
      <button type="button" className="sb-bookmark__save" disabled={empty || saving} onClick={() => onSave?.({ text, ink, color })}>{saving ? 'Salvestan…' : 'Salvesta'}</button>
    </footer>
  </div>;
}
