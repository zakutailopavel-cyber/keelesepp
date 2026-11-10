import { useEffect, useRef, useState } from 'react';
import { Banknote, Undo2, X } from 'lucide-react';
import { toimusCashLabel } from '../cash/lessonCash.js';
import './quickMark.css';

// Phone-first marking (owner 2026-11-09: a teacher marks a past lesson in ~10 seconds): „Toimus ✓” and „Puudus ▾”
// (teatas ette → Puudus_p, ei teatanud → Puudus_eta) as ≥ 44 px buttons, inline in the phone calendar's agenda and on
// „Märkimata tunnid”. The billable „Puudus (ei teatanud)” is never a default: it is only the second item of the menu.
// The caller writes the mark through the calendar's own path (lessons.completeFromSchedule).
// cashCents > 0 (owner 2026-11-11: the card „Maksab sularahas”): the one tap is „Toimus · makstud sularahas 25 €” —
// the caller marks the lesson held and records the cash (the server's fixed amount)
export default function QuickMarkButtons({ item, busy = '', disabled = false, onMark, doneLabel: plainLabel = 'Toimus ✓', cashCents = 0 }) {
  const doneLabel = cashCents > 0 ? toimusCashLabel(cashCents) : plainLabel;
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const away = (event) => { if (!box.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', escape); };
  }, [open]);
  const who = item.studentName || 'Õpilane';
  const mark = (event, status) => { event.preventDefault(); event.stopPropagation(); setOpen(false); onMark(item, status); };
  const off = disabled || Boolean(busy);
  return <div className="qm" ref={box} onClick={(event) => event.stopPropagation()}>
    <button type="button" className={`qm__btn qm__btn--done${cashCents > 0 ? ' qm__btn--cash' : ''}`} disabled={off} aria-busy={busy === 'Toimunud' || undefined} aria-label={cashCents > 0 ? `${toimusCashLabel(cashCents)}: ${who}` : `Toimus: ${who}`} data-entity-action="done" onClick={(event) => mark(event, 'Toimunud')}>{busy === 'Toimunud' ? 'Märgin…' : doneLabel}</button>
    <button type="button" className="qm__btn qm__btn--absent" disabled={off} aria-haspopup="menu" aria-expanded={open} aria-label={`Puudus: ${who}`} onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }}>{busy && busy !== 'Toimunud' ? 'Märgin…' : 'Puudus ▾'}</button>
    {open ? <div className="qm__menu" role="menu" aria-label={`Puudus: ${who}`}>
      <button type="button" role="menuitem" onClick={(event) => mark(event, 'Puudus_p')}>Teatas ette <small>tasuta</small></button>
      <button type="button" role="menuitem" onClick={(event) => mark(event, 'Puudus_eta')}>Ei teatanud <small>tasuline</small></button>
    </div> : null}
  </div>;
}

// The undo strip after a mark. `undo.action` (owner 2026-11-11, after „Toimus”): a small second step — „Maksis
// sularahas” — whose run() returns the next toast (onReplace shows it; without onReplace the strip closes).
export function MarkUndoToast({ undo, onClose, onError, onReplace }) {
  const [busy, setBusy] = useState(false);
  if (!undo) return null;
  const take = async () => {
    setBusy(true);
    try { await undo.run(); onClose(); } catch (error) { onError?.(error); onClose(); } finally { setBusy(false); }
  };
  const act = async () => {
    setBusy(true);
    try { const next = await undo.action.run(); if (next && onReplace) onReplace(next); else onClose(); } catch (error) { onError?.(error); } finally { setBusy(false); }
  };
  return <div className="qm-toast" role="status">
    <span>{undo.label}</span>
    {undo.action ? <button type="button" className="qm-toast__action" disabled={busy} onClick={act}><Banknote size={15} aria-hidden="true" /> {undo.action.label}</button> : null}
    <button type="button" className="qm-toast__undo" disabled={busy} onClick={take}><Undo2 size={15} aria-hidden="true" /> Võta tagasi</button>
    <button type="button" aria-label="Sulge" onClick={onClose}><X size={15} /></button>
  </div>;
}
