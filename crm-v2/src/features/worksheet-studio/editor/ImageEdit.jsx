/* global Image */
import { useEffect, useRef, useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';
import { CROP_RATIOS, editImage, fitCrop, moveCrop, normRotation, resizeCrop, rotatedSize } from '../engine/image.js';

// „Lõika / pööra”: turn the picture by 90° and cut it — free or in a fixed shape (4:3, 1:1…). The result is a new
// picture (uploaded like any other); the old file stays where it was. Needs the picture's host to allow CORS.
const HANDLES = ['nw', 'ne', 'sw', 'se'];
const PREVIEW = 520; // px, the longer side of the preview canvas

export default function ImageEdit({ src, onApply, onCancel }) {
  const canvas = useRef(null);
  const box = useRef(null);
  const [img, setImg] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [ratioKey, setRatioKey] = useState('free');
  const [rect, setRect] = useState({ x: 0, y: 0, w: 1, h: 1 });
  const [state, setState] = useState({ busy: false, error: '' });

  useEffect(() => {
    let alive = true;
    // with CORS first (the same cached copy is then usable for the cut); without it the preview still shows
    const load = (cors) => {
      const i = new Image();
      if (cors) i.crossOrigin = 'anonymous';
      i.onload = () => { if (alive) setImg(i); };
      i.onerror = () => { if (!alive) return; if (cors) load(false); else setState({ busy: false, error: 'Pilti ei saanud avada.' }); };
      i.src = src;
    };
    load(true);
    return () => { alive = false; };
  }, [src]);

  const nw = img?.naturalWidth || 0;
  const nh = img?.naturalHeight || 0;
  const { width: W, height: H } = rotatedSize(nw, nh, rotation);
  const ratio = CROP_RATIOS.find(([key]) => key === ratioKey)?.[2] || 0;

  // the rotated picture on a canvas (display only)
  useEffect(() => {
    const el = canvas.current;
    if (!el || !img || !W || !H) return;
    const scale = Math.min(1, PREVIEW / Math.max(W, H));
    el.width = Math.round(W * scale);
    el.height = Math.round(H * scale);
    const ctx = el.getContext?.('2d');
    if (!ctx) return;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    const rot = normRotation(rotation);
    if (rot === 90) { ctx.translate(nh, 0); ctx.rotate(Math.PI / 2); }
    else if (rot === 180) { ctx.translate(nw, nh); ctx.rotate(Math.PI); }
    else if (rot === 270) { ctx.translate(0, nw); ctx.rotate(-Math.PI / 2); }
    ctx.drawImage(img, 0, 0, nw, nh);
  }, [img, rotation, W, H, nw, nh]);

  const turn = (deg) => {
    const next = normRotation(rotation + deg);
    setRotation(next);
    const size = rotatedSize(nw, nh, next);
    setRect(fitCrop(ratio, size.width, size.height));
  };
  const pickRatio = (key) => {
    setRatioKey(key);
    setRect(fitCrop(CROP_RATIOS.find(([k]) => k === key)?.[2] || 0, W, H));
  };

  // drag the rectangle (move) or one of its corners (resize)
  const startDrag = (event, handle) => {
    event.preventDefault();
    event.stopPropagation();
    const bounds = box.current?.getBoundingClientRect();
    if (!bounds?.width || !bounds?.height) return;
    const start = { x: event.clientX, y: event.clientY, rect };
    const move = (e) => {
      const dx = (e.clientX - start.x) / bounds.width;
      const dy = (e.clientY - start.y) / bounds.height;
      setRect(handle ? resizeCrop(start.rect, handle, dx, dy, { ratio, W, H }) : moveCrop(start.rect, dx, dy));
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const apply = async () => {
    setState({ busy: true, error: '' });
    try {
      const file = await editImage(src, { rotation, crop: rect }, 'loigatud');
      await onApply(file, ratioKey);
    } catch (error) {
      setState({ busy: false, error: error.message || 'Pilti ei saanud muuta.' });
    }
  };

  const pct = (value) => `${(value * 100).toFixed(2)}%`;
  return (
    <div className="ed-crop" role="group" aria-label="Lõika ja pööra pilti">
      <div className="ed-row">
        <button type="button" className="ed-btn ghost" onClick={() => turn(-90)} aria-label="Pööra vasakule" title="Pööra vasakule"><RotateCcw size={14} aria-hidden="true" /></button>
        <button type="button" className="ed-btn ghost" onClick={() => turn(90)} aria-label="Pööra paremale" title="Pööra paremale"><RotateCw size={14} aria-hidden="true" /></button>
        <div className="ed-seg" role="group" aria-label="Lõike kuju">
          {CROP_RATIOS.map(([key, label]) => <button type="button" key={key} aria-pressed={ratioKey === key} className={ratioKey === key ? 'on' : ''} onClick={() => pickRatio(key)}>{label}</button>)}
        </div>
      </div>
      <div className="ed-crop-stage" ref={box} style={W && H ? { aspectRatio: `${W} / ${H}` } : undefined}>
        <canvas ref={canvas} aria-hidden="true" />
        {img ? (
          <div className="ed-crop-rect" style={{ left: pct(rect.x), top: pct(rect.y), width: pct(rect.w), height: pct(rect.h) }} onPointerDown={(e) => startDrag(e, '')}>
            {HANDLES.map((h) => <span key={h} className={`ed-crop-handle is-${h}`} onPointerDown={(e) => startDrag(e, h)} />)}
          </div>
        ) : null}
      </div>
      <span className="ed-hint">Lohista raami või selle nurki. {W && H ? `Tulemus: ${Math.round(rect.w * W)} × ${Math.round(rect.h * H)} px` : ''}</span>
      <div className="ed-row">
        <button type="button" className="ed-btn" disabled={!img || state.busy} onClick={apply}>{state.busy ? 'Salvestan…' : 'Rakenda'}</button>
        <button type="button" className="ed-btn ghost" onClick={onCancel}>Loobu</button>
      </div>
      {state.error ? <span className="ed-hint ed-err" role="alert">{state.error}</span> : null}
    </div>
  );
}
