import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, X } from 'lucide-react';
import { anchorVisible, pickNote, pillSpot, placeFloating } from './floatingNote.js';

// the note's width when the screen has room (narrower on a phone)
const NOTE_WIDTH = 360;
const FIELD = 'input, textarea, select, [contenteditable="true"], [contenteditable="plaintext-only"]';

function screenBounds() {
  const vv = globalThis.visualViewport;
  if (vv && vv.width && vv.height) return { left: vv.offsetLeft, top: vv.offsetTop, right: vv.offsetLeft + vv.width, bottom: vv.offsetTop + vv.height };
  return { left: 0, top: 0, right: globalThis.innerWidth || 1024, bottom: globalThis.innerHeight || 768 };
}

const plain = (r) => (r ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null);
const KEYS = ['mode', 'left', 'top', 'right', 'width', 'maxHeight', 'side'];
const sameSpot = (a, b) => Boolean(a && b) && KEYS.every((key) => a[key] === b[key]);

// A task's note floating next to it (floatingNote.js), drawn on document.body: the sheet may lie in a scaled, panned
// layer (the lesson board) where it would be clipped or move the layout. It follows its task every frame, so it moves
// with the board's pan and zoom and with the page's scroll, and hides while the task is out of sight.
// Several notes of one sheet share `group`: only one is open at a time (pickNote: the one the user opened, the task being
// typed in, the task the teacher points at, else the task nearest the screen's middle); the others, and a closed one,
// wait as a small button at their task's corner. On a phone the task fills the screen and the open note lies over it at
// the screen's edge; while an answer is typed there it folds into that button, so the word bank and the lines stay in
// sight.
// rank: 0 opened by the user, 1 typed in, 2 pointed at, 3 none. closed: closed with ×. onOpen: the button was tapped.
// ownClose: the content has its own × (the teacher's answer key); else the note gets one.
export default function FloatingNote({ anchorRef, blockId, label = 'Märkus', chip = '', onClose, onOpen, ownClose = false, group = null, rank = 3, closed = false, children }) {
  const noteRef = useRef(null);
  const [spot, setSpot] = useState(null);
  const spotRef = useRef(null);
  const fullSize = useRef(null);
  const [unfolded, setUnfolded] = useState(false);
  // what the frame loop reads: the latest props without restarting the loop
  const live = useRef({ rank, closed, unfolded });
  useLayoutEffect(() => { live.current = { rank, closed, unfolded }; });

  useLayoutEffect(() => {
    let frame = 0;
    const measure = () => {
      const anchorEl = anchorRef.current;
      const note = noteRef.current;
      if (!anchorEl || !note) return;
      const { rank: myRank, closed: isClosed, unfolded: isUnfolded } = live.current;
      const anchor = plain(anchorEl.getBoundingClientRect());
      const bounds = screenBounds();
      // the frame the sheet is seen through: the lesson board's stage, else the sheet's own scrolling canvas
      const clipEl = anchorEl.closest?.('.sb-stage') || anchorEl.closest?.('.st-canvas');
      const clip = clipEl ? plain(clipEl.getBoundingClientRect()) : bounds;
      const visible = anchorVisible(anchor, clip) && anchorVisible(anchor, bounds);
      // a button stays inside the sheet's own frame (not over the room's tabs)
      const inner = { left: Math.max(clip.left, bounds.left), top: Math.max(clip.top, bounds.top), right: Math.min(clip.right, bounds.right), bottom: Math.min(clip.bottom, bounds.bottom) };
      const middle = (bounds.top + bounds.bottom) / 2;
      const distance = Math.abs((Math.max(anchor.top, bounds.top) + Math.min(anchor.bottom, bounds.bottom)) / 2 - middle);
      group?.set(blockId, { visible, closed: isClosed, rank: myRank, distance });
      let next;
      if (!visible) next = { mode: 'hidden' };
      else if (isClosed || (group && pickNote(group) !== blockId)) next = { mode: 'pill', ...pillSpot(anchor, inner) };
      else {
        const active = globalThis.document?.activeElement;
        const avoid = active && active !== globalThis.document.body && active.matches?.(FIELD) && !note.contains(active) ? plain(active.getBoundingClientRect()) : null;
        if (!avoid && isUnfolded) setUnfolded(false);
        // the natural size (without the height limit of the last frame); a note shown as a button keeps its open size
        if (spotRef.current?.mode === 'open' || !fullSize.current) fullSize.current = { w: NOTE_WIDTH, h: note.scrollHeight || note.offsetHeight || 160 };
        const place = placeFloating({ anchor, size: fullSize.current, bounds, avoid });
        next = avoid && place.side.startsWith('dock') && !isUnfolded
          ? { mode: 'fold', ...pillSpot(anchor, inner) }
          : { mode: 'open', ...place };
      }
      if (!sameSpot(next, spotRef.current)) { spotRef.current = next; setSpot(next); }
    };
    const loop = () => { measure(); frame = globalThis.requestAnimationFrame?.(loop) || 0; };
    loop();
    return () => { if (frame) globalThis.cancelAnimationFrame?.(frame); group?.delete(blockId); };
  }, [anchorRef, group, blockId]);

  const open = spot?.mode === 'open';
  useEffect(() => {
    if (!open || !onClose) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    globalThis.addEventListener?.('keydown', onKey);
    return () => globalThis.removeEventListener?.('keydown', onKey);
  }, [open, onClose]);

  const body = globalThis.document?.body;
  if (!body) return null;
  const pill = spot?.mode === 'pill' || spot?.mode === 'fold';
  // clicks inside the note must not reach the task card (a click there points at the task) or the board under it
  const stop = (event) => event.stopPropagation();
  // the field being typed in keeps the focus (and the phone its keyboard) when the button is tapped
  const keepFocus = (event) => { event.stopPropagation(); event.preventDefault(); };
  const style = !spot || spot.mode === 'hidden'
    ? { visibility: 'hidden', left: 0, top: 0 }
    : pill
      ? { top: Math.round(spot.top), right: Math.round((globalThis.innerWidth || 0) - spot.right), left: 'auto', width: 'auto' }
      : { left: Math.round(spot.left), top: Math.round(spot.top), width: Math.round(spot.width), ...(spot.maxHeight ? { maxHeight: Math.round(spot.maxHeight) } : {}) };
  const openNote = () => (spot?.mode === 'fold' ? setUnfolded(true) : onOpen?.());
  return createPortal(
    <div ref={noteRef} className={`ws-float-note ${open ? `is-${spot.side}` : ''} ${pill ? 'is-folded' : ''}`} data-for-block={blockId} data-mode={spot?.mode || 'hidden'} role={open ? 'dialog' : undefined} aria-label={open ? label : undefined} style={style}
      onClick={stop} onDoubleClick={stop} onPointerDown={stop} onPointerMove={stop} onPointerUp={stop} onMouseDown={stop} onWheel={stop}>
      {pill ? <button type="button" className="ws-float-note-open" onPointerDown={keepFocus} onMouseDown={keepFocus} onClick={openNote}>{chip || label} <ChevronDown size={15} aria-hidden="true" /></button> : null}
      <div className="ws-float-note-body" hidden={pill}>
        {ownClose || !onClose ? null : <button type="button" className="ws-float-note-x" onClick={onClose} aria-label={`Sulge: ${label}`}><X size={15} aria-hidden="true" /></button>}
        {children}
      </div>
    </div>,
    body,
  );
}
