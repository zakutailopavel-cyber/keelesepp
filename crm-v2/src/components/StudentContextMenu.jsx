import { Archive, CalendarPlus, Copy, ExternalLink, FilePlus2, MessageSquare, PenLine, Pencil, RotateCcw, Type } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentsService } from '../services/firebase/students.js';
import './studentContextMenu.css';

// the student a right-click points at: an element with data-student-id, or a link to the student's card
export function studentIdAt(target) {
  const marked = target?.closest?.('[data-student-id]');
  if (marked?.dataset?.studentId) return marked.dataset.studentId;
  const link = target?.closest?.('a[href]');
  const match = String(link?.getAttribute('href') || '').match(/^\/students\/([^/?#]+)\/?(?:[?#].*)?$/);
  return match ? decodeURIComponent(match[1]) : '';
}

/**
 * The student menu (owner 2026-10-27: „правой кнопкой мыши на ученика — фиксированный набор инструментов, чтобы не
 * скакать по вкладкам … переименовать, изменить, архивировать, написать”): a right-click on any student name that
 * links to the card, anywhere in the CRM (staff only). Instead of the browser's menu: open the card, rename (copied
 * onto lessons, homework and sheets), edit, write, new lesson, new sheet, board, copy contacts, archive / restore.
 */
export default function StudentContextMenu({ enabled = true, service = studentsService }) {
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null); // { id, x, y, student }
  const [renaming, setRenaming] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const box = useRef(null);
  const close = useCallback(() => { setMenu(null); setRenaming(''); setNote(''); }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    const open = (event) => {
      const id = studentIdAt(event.target);
      if (!id || event.shiftKey) return; // Shift + right-click keeps the browser's own menu
      event.preventDefault();
      setMenu({ id, x: event.clientX, y: event.clientY, student: null }); setRenaming(''); setNote('');
      Promise.resolve().then(() => service.getById(id)).then((student) => setMenu((current) => (current?.id === id ? { ...current, student } : current))).catch(() => {});
    };
    const away = (event) => { if (box.current && !box.current.contains(event.target)) close(); };
    const key = (event) => { if (event.key === 'Escape') close(); };
    document.addEventListener('contextmenu', open);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('contextmenu', open);
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', key);
      window.removeEventListener('scroll', close, true);
    };
  }, [enabled, service, close]);

  if (!menu) return null;
  const { id, student } = menu;
  const go = (to) => { close(); navigate(to); };
  const copy = async (value) => { try { await navigator.clipboard.writeText(value); setNote('Kopeeritud.'); } catch { setNote(value); } };
  const run = async (action, done) => {
    setBusy(true); setNote('');
    try { const result = await action(); setNote(done(result)); } catch (error) { setNote(error.message || 'Ei õnnestunud.'); } finally { setBusy(false); }
  };
  const phone = student?.parentPhone || student?.phone || '';
  const email = student?.parentEmail || student?.email || '';
  const left = Math.min(menu.x, window.innerWidth - 270);
  const top = Math.min(menu.y, window.innerHeight - 420);
  const enc = encodeURIComponent(id);

  return (
    <div ref={box} className="student-menu" role="menu" aria-label={`Õpilane: ${student?.name || ''}`} style={{ left: Math.max(8, left), top: Math.max(8, top) }}>
      <div className="student-menu__head"><strong>{student?.name || 'Õpilane'}</strong>{student ? <small>{[student.level, student.teacher, student.active === false ? 'arhiivis' : ''].filter(Boolean).join(' · ')}</small> : <small>Laen…</small>}</div>
      {renaming !== '' ? <form className="student-menu__rename" onSubmit={(event) => { event.preventDefault(); run(() => service.rename(id, renaming), (result) => { setRenaming(''); setMenu((current) => ({ ...current, student: { ...current.student, name: result.name } })); return `Nimi muudetud: ${result.name}. Uuendatud ka tunnid, kodutööd ja töölehed.`; }); }}>
        <input autoFocus aria-label="Uus nimi" value={renaming} onChange={(event) => setRenaming(event.target.value)} />
        <button type="submit" disabled={busy}>Salvesta</button>
      </form> : null}
      <button type="button" role="menuitem" onClick={() => go(`/students/${enc}`)}><ExternalLink size={15} /> Ava kaart</button>
      <button type="button" role="menuitem" disabled={!student} onClick={() => setRenaming(student?.name || '')}><Type size={15} /> Nimeta ümber</button>
      <button type="button" role="menuitem" onClick={() => go(`/students/${enc}?edit=1`)}><Pencil size={15} /> Muuda andmeid</button>
      <button type="button" role="menuitem" onClick={() => go(`/messages?student=${enc}`)}><MessageSquare size={15} /> Kirjuta</button>
      <button type="button" role="menuitem" onClick={() => go(`/calendar?student=${enc}`)}><CalendarPlus size={15} /> Kalender (õpilase tunnid)</button>
      <button type="button" role="menuitem" onClick={() => go(`/students/${enc}/worksheets/new`)}><FilePlus2 size={15} /> Koosta tööleht</button>
      <button type="button" role="menuitem" onClick={() => go(`/board/${enc}`)}><PenLine size={15} /> Ava tahvel</button>
      {phone ? <button type="button" role="menuitem" onClick={() => copy(phone)}><Copy size={15} /> Kopeeri telefon ({phone})</button> : null}
      {email ? <button type="button" role="menuitem" onClick={() => copy(email)}><Copy size={15} /> Kopeeri e-post</button> : null}
      {student ? (student.active === false
        ? <button type="button" role="menuitem" disabled={busy} onClick={() => run(() => service.restore([id]), () => { setMenu((current) => ({ ...current, student: { ...current.student, active: true } })); return 'Õpilane taastatud.'; })}><RotateCcw size={15} /> Taasta arhiivist</button>
        : <button type="button" role="menuitem" className="is-danger" disabled={busy} onClick={() => { if (globalThis.confirm(`Arhiveerida ${student.name}? Tunnid, arved ja ajalugu jäävad alles.`)) run(() => service.archive([id]), () => { setMenu((current) => ({ ...current, student: { ...current.student, active: false } })); return 'Õpilane arhiveeritud.'; }); }}><Archive size={15} /> Arhiveeri</button>) : null}
      {note ? <p className="student-menu__note" role="status">{note}</p> : null}
      <small className="student-menu__hint">Brauseri menüü: Shift + parem klõps</small>
    </div>
  );
}
