import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BookmarkCheck, BookmarkPlus, Loader2, X } from 'lucide-react';
import { CARD_WIDTH, wordCardSpot } from './wordTap.js';

const LANGUAGE_NAMES = { ru: 'vene k', en: 'inglise k', uk: 'ukraina k' };

function screenBounds() {
  const vv = globalThis.visualViewport;
  if (vv && vv.width && vv.height) return { left: vv.offsetLeft, top: vv.offsetTop, right: vv.offsetLeft + vv.width, bottom: vv.offsetTop + vv.height };
  return { left: 0, top: 0, right: globalThis.innerWidth || 1024, bottom: globalThis.innerHeight || 768 };
}
const plain = (r) => ({ left: r.left, top: r.top, right: r.right, bottom: r.bottom });
const sameSpot = (a, b) => Boolean(a && b) && a.hidden === b.hidden && a.left === b.left && a.top === b.top && a.width === b.width;

// The small card of „Puuduta sõna”, drawn on document.body (the board is a scaled, panned layer: the card would be
// clipped there or move the layout). It follows its word every frame, so it moves with the board's pan and zoom.
export default function WordTapCard({ card, canAdd, onAdd, onClose }) {
  const ref = useRef(null);
  const [spot, setSpot] = useState(null);
  const spotRef = useRef(null);

  useLayoutEffect(() => {
    let frame = 0;
    const measure = () => {
      const node = ref.current;
      if (!node || !card?.anchor) return;
      const anchor = plain(card.anchor.getBoundingClientRect());
      const clipEl = card.anchor.closest?.('.sb-stage');
      const bounds = screenBounds();
      const next = card.anchor.isConnected?.() === false ? { hidden: true, left: 0, top: 0, width: CARD_WIDTH }
        : wordCardSpot({ anchor, clip: clipEl ? plain(clipEl.getBoundingClientRect()) : bounds, bounds, height: node.offsetHeight });
      if (!sameSpot(next, spotRef.current)) { spotRef.current = next; setSpot(next); }
    };
    const loop = () => { measure(); frame = globalThis.requestAnimationFrame?.(loop) || 0; };
    frame = globalThis.requestAnimationFrame?.(loop) || 0;
    return () => { if (frame) globalThis.cancelAnimationFrame?.(frame); };
  }, [card?.anchor]);

  // Escape, or a press anywhere else closes it
  useEffect(() => {
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    const onDown = (event) => { if (!event.target?.closest?.('.sb-word-tap')) onClose(); };
    globalThis.addEventListener?.('keydown', onKey);
    globalThis.addEventListener?.('pointerdown', onDown, true);
    return () => { globalThis.removeEventListener?.('keydown', onKey); globalThis.removeEventListener?.('pointerdown', onDown, true); };
  }, [onClose]);

  const body = globalThis.document?.body;
  if (!body || !card) return null;
  const data = card.data;
  const style = !spot || spot.hidden ? { visibility: 'hidden', left: 0, top: 0, width: CARD_WIDTH } : { left: spot.left, top: spot.top, width: spot.width };
  const stop = (event) => event.stopPropagation();
  return createPortal(
    <div ref={ref} className="sb-word-tap" role="dialog" aria-label={`Sõna ${card.word}`} style={style} data-side={spot?.side || ''}
      onPointerDown={stop} onPointerUp={stop} onClick={stop} onDoubleClick={stop} onWheel={stop}>
      <button type="button" className="sb-word-tap__x" aria-label="Sulge" onClick={onClose}><X size={14} aria-hidden="true" /></button>
      <strong className="sb-word-tap__word">{card.word}</strong>
      {card.loading ? <p className="sb-word-tap__muted"><Loader2 size={14} className="spin" aria-hidden="true" /> Otsin põhivormi ja tõlget…</p> : null}
      {data?.lemma ? <p className="sb-word-tap__lemma">Põhivorm: <b>{data.lemma}</b></p> : null}
      {data?.translation ? <p className="sb-word-tap__tr" lang={card.tgt}><span>{LANGUAGE_NAMES[card.tgt] || card.tgt}</span> {data.translation}</p> : null}
      {data && !data.translation ? <p className="sb-word-tap__muted" role={data.error ? 'alert' : undefined}>{data.error ? 'Tõlget ei saanud praegu leida.' : 'Tõlget ei leitud.'}</p> : null}
      {canAdd && data ? (card.saved
        ? <p className="sb-word-tap__saved" role="status"><BookmarkCheck size={14} aria-hidden="true" /> {card.saved === 'already' ? 'See sõna on juba sõnastikus.' : 'Lisatud sõnastikku.'}</p>
        : <button type="button" className="sb-word-tap__add" disabled={card.saving} onClick={onAdd}>
          {card.saving ? <Loader2 size={14} className="spin" aria-hidden="true" /> : <BookmarkPlus size={14} aria-hidden="true" />} Lisa sõnastikku
        </button>) : null}
      {card.addError ? <p className="sb-word-tap__muted" role="alert">{card.addError}</p> : null}
    </div>,
    body,
  );
}
