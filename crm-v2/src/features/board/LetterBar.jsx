import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowBigUp, X } from 'lucide-react';
import { LETTERS, barSpot, insertLetter, isLetterField, letterBox, lettersHidden, rememberLettersHidden, upper } from './letters.js';

function screenBounds() {
  const vv = globalThis.visualViewport;
  if (vv && vv.width && vv.height) return { left: vv.offsetLeft, top: vv.offsetTop, right: vv.offsetLeft + vv.width, bottom: vv.offsetTop + vv.height };
  return { left: 0, top: 0, right: globalThis.innerWidth || 1024, bottom: globalThis.innerHeight || 768 };
}

/**
 * „õ ä ö ü”: while a text field inside `root` (the lesson board: worksheet answers, board texts, the bookmark sheet) has
 * the focus, a small bar floats under it. A press on a letter never takes the focus (mousedown / pointerdown are
 * cancelled), so the caret and the phone's keyboard stay; the letter goes in at the caret (letters.js insertLetter).
 * Capitals: Shift held, or the ⇧ toggle. `canHide` (the teacher): × folds the bar to a small „õ” on this device.
 */
export default function LetterBar({ root, canHide = false }) {
  const [field, setField] = useState(null);
  const [spot, setSpot] = useState(null);
  const [caps, setCaps] = useState(false);
  const [shift, setShift] = useState(false);
  const [hidden, setHidden] = useState(() => lettersHidden());
  const barRef = useRef(null);

  useEffect(() => {
    if (!root) return undefined;
    const doc = root.ownerDocument || globalThis.document;
    const onIn = (event) => { if (root.contains(event.target) && isLetterField(event.target)) setField(event.target); };
    const onOut = (event) => {
      if (event.relatedTarget && barRef.current?.contains(event.relatedTarget)) return;
      setField((current) => (current === event.target ? null : current));
    };
    const onKey = (event) => { if (event.key === 'Shift') setShift(event.type === 'keydown'); };
    const onBlurWindow = () => setShift(false);
    doc.addEventListener('focusin', onIn);
    doc.addEventListener('focusout', onOut);
    globalThis.addEventListener?.('keydown', onKey);
    globalThis.addEventListener?.('keyup', onKey);
    globalThis.addEventListener?.('blur', onBlurWindow);
    return () => {
      doc.removeEventListener('focusin', onIn);
      doc.removeEventListener('focusout', onOut);
      globalThis.removeEventListener?.('keydown', onKey);
      globalThis.removeEventListener?.('keyup', onKey);
      globalThis.removeEventListener?.('blur', onBlurWindow);
    };
  }, [root]);

  // follows the field every frame (the board pans and zooms under it; the phone's keyboard moves the screen)
  useEffect(() => {
    if (!field) return undefined;
    let frame = 0;
    let last = null;
    const measure = () => {
      if (!field.isConnected) { setField(null); return; }
      const rect = letterBox(field).getBoundingClientRect();
      const bar = barRef.current;
      const size = { w: bar?.offsetWidth || 260, h: bar?.offsetHeight || 40 };
      const next = barSpot({ field: rect, size, bounds: screenBounds() });
      if (!last || last.left !== next.left || last.top !== next.top) { last = next; setSpot(next); }
      frame = globalThis.requestAnimationFrame?.(measure) || 0;
    };
    frame = globalThis.requestAnimationFrame?.(measure) || 0;
    return () => { if (frame) globalThis.cancelAnimationFrame?.(frame); };
  }, [field]);

  const body = globalThis.document?.body;
  if (!body || !field) return null;
  const on = caps !== shift;
  // the field keeps the focus (and the phone its keyboard)
  const keep = (event) => { event.preventDefault(); event.stopPropagation(); };
  const put = (letter, event) => insertLetter(field, upper(letter, caps !== (shift || Boolean(event?.shiftKey))));
  const fold = (value) => { setHidden(value); rememberLettersHidden(value); };
  const style = spot ? { left: spot.left, top: spot.top } : { left: 0, top: 0, visibility: 'hidden' };
  return createPortal(
    <div ref={barRef} className={`sb-letters ${hidden ? 'is-folded' : ''}`} role="toolbar" aria-label="Eesti tähed" style={style} data-side={spot?.side || ''}
      onPointerDown={keep} onMouseDown={keep} onClick={(event) => event.stopPropagation()}>
      {hidden ? <button type="button" className="sb-letters__open" aria-label="Näita eesti tähti" title="Näita õ ä ö ü" onClick={() => fold(false)}>õ</button> : <>
        {LETTERS.map((letter) => <button type="button" key={letter} className="sb-letters__key" aria-label={`Lisa ${upper(letter, on)}`} onClick={(event) => put(letter, event)}>{upper(letter, on)}</button>)}
        <button type="button" className={`sb-letters__caps ${on ? 'is-active' : ''}`} aria-label="Suurtähed" aria-pressed={caps} title="Suurtähed (või hoia Shift all)" onClick={() => setCaps(!caps)}><ArrowBigUp size={16} aria-hidden="true" /></button>
        {canHide ? <button type="button" className="sb-letters__hide" aria-label="Peida eesti tähed" title="Peida (see seade jätab meelde)" onClick={() => fold(true)}><X size={14} aria-hidden="true" /></button> : null}
      </>}
    </div>,
    body,
  );
}
