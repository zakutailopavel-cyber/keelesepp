import { Plus } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const KINDS = [
  ['free', 'Vaba', 'tunde võib panna'],
  ['online', 'Ainult veebitunnid', 'kohapeal tunde ei saa'],
  ['busy', 'Hõivatud', 'tunde ei saa panna'],
];

// A click on an empty half-hour cell (Oleksiy 2026-10-15): the teacher's status for that cell — free / online only /
// busy, for this day or every week — or a new lesson there. Without a teacher (an administrator's week of all
// teachers) only the new lesson is offered.
export default function CellStatusMenu({ cell, teacherName = '', current = { kind: 'open', weekly: false }, saving = false, onStatus, onLesson, onClose }) {
  const [weekly, setWeekly] = useState(current.weekly);
  const ref = useRef(null);
  useEffect(() => {
    const away = (event) => { if (ref.current && !ref.current.contains(event.target)) onClose(); };
    const escape = (event) => { if (event.key === 'Escape') onClose(); };
    globalThis.document.addEventListener('pointerdown', away);
    globalThis.document.addEventListener('keydown', escape);
    // focus the menu itself: a focus ring on the first status would look like the cell's current status
    ref.current?.focus();
    return () => { globalThis.document.removeEventListener('pointerdown', away); globalThis.document.removeEventListener('keydown', escape); };
  }, [onClose]);
  const width = 280;
  const left = Math.max(8, Math.min((cell.x || 0) + 8, (globalThis.innerWidth || 1200) - width - 8));
  // the menu opens below the pointer; when its real height does not fit there (a cell near the bottom of the screen,
  // Oleksiy 2026-10-17) it opens above the pointer, and it never leaves the window
  const top = Math.max(8, (cell.y || 0) + 8);
  useLayoutEffect(() => {
    const height = ref.current?.getBoundingClientRect().height || 0;
    const view = globalThis.innerHeight || 800;
    const below = (cell.y || 0) + 8;
    const next = below + height <= view - 8 ? below : Math.max(8, Math.min((cell.y || 0) - height - 8, view - height - 8));
    if (ref.current) ref.current.style.top = `${next}px`;
  }, [cell.y, current.kind, onStatus]);
  const day = new Date(`${cell.date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'long', day: 'numeric', month: 'numeric' });

  return <div ref={ref} tabIndex={-1} className="cal-cell-menu" role="dialog" aria-label={`Aeg ${cell.start}–${cell.end}`} style={{ left, top, width }}>
    <header><strong>{day} · {cell.start}–{cell.end}</strong>{teacherName ? <small>{teacherName}</small> : null}</header>
    {onStatus ? <>
      <div className="cal-cell-menu__kinds" role="group" aria-label="Aja olek">
        {KINDS.map(([kind, label, hint]) => <button key={kind} type="button" disabled={saving} aria-pressed={current.kind === kind} className={current.kind === kind ? 'is-current' : ''} onClick={() => onStatus(kind, weekly)}>
          <i className={`cal2-dot is-${kind}`} /><span><b>{label}</b><small>{hint}</small></span>
        </button>)}
        {current.kind !== 'open' ? <button type="button" disabled={saving} onClick={() => onStatus('clear', weekly)}><i className="cal2-dot" /><span><b>Eemalda märge</b><small>aeg on märkimata</small></span></button> : null}
      </div>
      <label className="cal-cell-menu__weekly"><input type="checkbox" checked={weekly} onChange={(event) => setWeekly(event.target.checked)} /> Iga nädal (muidu ainult see päev)</label>
    </> : <p className="cal-cell-menu__hint">Õpetaja aja märkimiseks vali ülevalt õpetaja.</p>}
    <button type="button" className="cal-cell-menu__lesson" onClick={onLesson}><Plus size={16} /> Lisa tund</button>
  </div>;
}
