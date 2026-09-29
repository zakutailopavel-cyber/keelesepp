import { useRef, useState } from 'react';
import { Scissors } from 'lucide-react';
import { fileKind } from './conversion.js';

// The original (generated image or PDF) next to the sheet while a teacher rebuilds it as blocks.
// Drag on the image to select a photo, then cut it out into the selected block or a new photo block.
export default function OriginalPanel({ files, onCut, busy, error }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const start = useRef(null);
  const box = useRef(null);
  const file = files[Math.min(index, files.length - 1)];
  if (!file) return <p className="st-hint">Sellel materjalil pole originaalpilti.</p>;

  const pos = (e) => {
    const r = box.current.getBoundingClientRect();
    return { x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)), y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)) };
  };
  const down = (e) => { e.preventDefault(); start.current = pos(e); setRect(null); };
  const move = (e) => {
    if (!start.current) return;
    const p = pos(e);
    const s = start.current;
    setRect({ x: Math.min(s.x, p.x), y: Math.min(s.y, p.y), w: Math.abs(p.x - s.x), h: Math.abs(p.y - s.y) });
  };
  const up = () => { start.current = null; };

  return (
    <div className="st-original">
      {files.length > 1 && (
        <div className="st-original-tabs">{files.map((f, i) => <button type="button" key={f.url} aria-pressed={i === index} onClick={() => { setIndex(i); setRect(null); }}>{i + 1}</button>)}</div>
      )}
      {fileKind(file) === 'image' ? (
        <>
          <div className="st-original-img" ref={box} onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}>
            <img src={file.url} alt={`Originaal: ${file.name || ''}`} draggable={false} />
            {rect && <i className="st-crop" style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }} />}
          </div>
          <p className="st-hint">Vea hiirega foto ümber raam ja lõika see lehele. Tekst kirjuta plokkidesse uuesti, mitte pildina.</p>
          <button type="button" className="st-btn primary" disabled={!rect || rect.w < 2 || rect.h < 2 || busy} onClick={() => onCut(file.url, rect)}>
            <Scissors size={15} /> {busy ? 'Lõikan…' : 'Lõika foto lehele'}
          </button>
          {error && <p className="st-hint error" role="alert">{error}</p>}
        </>
      ) : (
        <a className="st-btn" href={file.url} target="_blank" rel="noreferrer">Ava originaal (PDF)</a>
      )}
    </div>
  );
}
