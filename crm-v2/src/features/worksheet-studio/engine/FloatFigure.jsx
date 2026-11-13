import { useRef } from 'react';
import { Photo, Md } from './ui.jsx';
import { dropPlace, figuresOf, figuresPatch, frameClass, normalizeFigure, shapeAspect, snapWidth } from './figureFloat.js';

// A picture inside a text block (figureFloat.js). In the constructor, unless locked: a grip to drag it to the other
// side / another paragraph, a corner to drag its width, a lock. All three are buttons of a finger's size (44 px on the
// screen, whatever the page's zoom), work with touch and mouse, and every change is one undo step (`onChange`).
export default function FloatFigure({ figure: stored, onChange = null }) {
  const figure = normalizeFigure(stored);
  const ref = useRef(null);
  if (!figure) return null;
  const editable = typeof onChange === 'function';
  const live = editable && !figure.locked;
  const caption = figure.caption.trim();
  const update = (patch) => onChange?.({ ...stored, ...patch });

  // one pointer drag: `move(event, start)` while it lasts, `end(event, start)` on release
  const drag = (event, move, end) => {
    event.preventDefault();
    event.stopPropagation();
    const el = ref.current;
    const column = el?.closest('[data-figure-column]');
    if (!el || !column) return;
    const start = { x: event.clientX, y: event.clientY, fig: el.getBoundingClientRect(), col: column.getBoundingClientRect(), column };
    const target = event.currentTarget;
    target.setPointerCapture?.(event.pointerId);
    const onMove = (e) => move(e, start);
    const onUp = (e) => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
      el.style.transform = '';
      el.style.width = `${figure.width}%`;
      el.style.setProperty('--ffig-w', `${figure.width}%`);
      delete el.dataset.size;
      if (e.type === 'pointerup') end(e, start);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };
  const startMove = (event) => drag(event,
    (e, s) => { ref.current.style.transform = `translate(${e.clientX - s.x}px, ${e.clientY - s.y}px)`; },
    (e, s) => {
      if (Math.abs(e.clientX - s.x) + Math.abs(e.clientY - s.y) < 6) return;
      const tops = [...s.column.querySelectorAll(':scope > p')].map((p) => p.getBoundingClientRect().top);
      const place = dropPlace({ x: e.clientX, y: e.clientY }, s.col, tops);
      if (place.side !== figure.side || place.at !== figure.at) update(place);
    });
  const widthAt = (e, s) => {
    const px = figure.side === 'right' ? s.fig.right - e.clientX : e.clientX - s.fig.left;
    return snapWidth(((figure.side === 'center' ? px * 2 - s.fig.width : px) / Math.max(1, s.col.width)) * 100);
  };
  const startResize = (event) => drag(event,
    (e, s) => { const w = widthAt(e, s); ref.current.style.width = `${w}%`; ref.current.style.setProperty('--ffig-w', `${w}%`); ref.current.dataset.size = `${w} %`; },
    (e, s) => { const w = widthAt(e, s); if (w !== figure.width) update({ width: w }); });
  const stop = (event) => event.stopPropagation();

  return (
    <figure
      ref={ref}
      className={`ws-ffig is-${figure.side} ${frameClass(figure)} ${caption ? 'has-caption' : ''} ${figure.locked ? 'is-locked' : ''}`}
      style={{ width: `${figure.width}%`, '--ffig-w': `${figure.width}%` }}
      data-figure-at={figure.at}
    >
      <div data-noedit="">
        <Photo img={figure.img} aspect={shapeAspect(figure.shape, figure.img?.aspect || '4:3')} alt={figure.alt || caption} />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
      {live ? <button type="button" className="ws-ffig-handle is-move" aria-label="Lohista pilt teise kohta" title="Lohista: vasakule, keskele, paremale või teise lõigu juurde" onPointerDown={startMove} onClick={stop}>✥</button> : null}
      {live ? <button type="button" className="ws-ffig-handle is-size" aria-label="Muuda pildi laiust" title="Lohista nurgast: pildi laius" onPointerDown={startResize} onClick={stop}>⤡</button> : null}
      {editable ? <button type="button" className="ws-ffig-handle is-lock" aria-pressed={figure.locked} aria-label={figure.locked ? 'Ava pildi lukk' : 'Lukusta pilt'} title={figure.locked ? 'Pilt on lukus: asukoht ja suurus ei muutu. Vajuta, et avada.' : 'Lukusta: pildi asukoht ja suurus jäävad paika, kui teksti muudad'} onPointerDown={stop} onClick={(e) => { e.stopPropagation(); update({ locked: !figure.locked }); }}>{figure.locked ? '🔒' : '🔓'}</button> : null}
    </figure>
  );
}

// A text column with its pictures (the text block, the reading text). `paragraphs` = the paragraphs drawn; `offset` =
// the paragraph index of the first one in the whole text (a reading split over two pages draws a part, pageSplit.js),
// so a part shows only its own pictures and a change is stored against the whole text. A picture whose paragraph is
// gone (text shortened) stands before the last paragraph. `patch` = ctx.patch of the constructor, else null.
export function FigureFlow({ className, heading = null, paragraphs, data, patch = null, offset = 0, last = true }) {
  const figures = figuresOf(data);
  const count = paragraphs.length;
  const placed = figures.map((figure, index) => {
    const at = Math.max(0, Math.floor(Number(figure.at) || 0)) - offset;
    return { figure, index, at: last ? Math.min(at, count - 1) : at };
  }).filter((f) => f.at >= 0 && f.at < count);
  const change = (index, next) => patch?.(figuresPatch(figures.map((f, i) => (i === index ? { ...next, at: (Number(next.at) || 0) + offset } : f))));
  const draw = ({ figure, index, at }) => (
    <FloatFigure key={`figure-${index}`} figure={{ ...figure, at }} onChange={patch ? (next) => change(index, next) : null} />
  );
  return (
    <div className={`${className}${placed.length ? ' has-figure' : ''}`} data-figure-column="">
      {heading}
      {paragraphs.map((p, i) => [...placed.filter((f) => f.at === i).map(draw), <p key={i}><Md text={p} /></p>])}
    </div>
  );
}
