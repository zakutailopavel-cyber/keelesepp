import { useEffect, useRef, useState } from 'react';
import { Undo2, X } from 'lucide-react';
import './quickMark.css';

// Phone-first marking (owner 2026-11-09: a teacher marks a past lesson in ~10 seconds): „Toimus ✓” and „Puudus ▾”
// (teatas ette → Puudus_p, ei teatanud → Puudus_eta) as ≥ 44 px buttons, inline in the phone calendar's agenda and on
// „Märkimata tunnid”. The billable „Puudus (ei teatanud)” is never a default: it is only the second item of the menu.
// The caller writes the mark through the calendar's own path (lessons.completeFromSchedule).
export default function QuickMarkButtons({ item, busy = '', disabled = false, onMark, doneLabel = 'Toimus ✓' }) {
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
    <button type="button" className="qm__btn qm__btn--done" disabled={off} aria-busy={busy === 'Toimunud' || undefined} aria-label={`Toimus: ${who}`} data-entity-action="done" onClick={(event) => mark(event, 'Toimunud')}>{busy === 'Toimunud' ? 'Märgin…' : doneLabel}</button>
    <button type="button" className="qm__btn qm__btn--absent" disabled={off} aria-haspopup="menu" aria-expanded={open} aria-label={`Puudus: ${who}`} onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }}>{busy && busy !== 'Toimunud' ? 'Märgin…' : 'Puudus ▾'}</button>
    {open ? <div className="qm__menu" role="menu" aria-label={`Puudus: ${who}`}>
      <button type="button" role="menuitem" onClick={(event) => mark(event, 'Puudus_p')}>Teatas ette <small>tasuta</small></button>
      <button type="button" role="menuitem" onClick={(event) => mark(event, 'Puudus_eta')}>Ei teatanud <small>tasuline</small></button>
    </div> : null}
  </div>;
}

export function MarkUndoToast({ undo, onClose, onError }) {
  const [busy, setBusy] = useState(false);
  if (!undo) return null;
  const take = async () => {
    setBusy(true);
    try { await undo.run(); onClose(); } catch (error) { onError?.(error); onClose(); } finally { setBusy(false); }
  };
  return <div className="qm-toast" role="status">
    <span>{undo.label}</span>
    <button type="button" className="qm-toast__undo" disabled={busy} onClick={take}><Undo2 size={15} aria-hidden="true" /> Võta tagasi</button>
    <button type="button" aria-label="Sulge" onClick={onClose}><X size={15} /></button>
  </div>;
}
