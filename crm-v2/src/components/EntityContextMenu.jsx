import { Archive, BookOpen, CalendarPlus, Check, Copy, CreditCard, ExternalLink, Eye, FilePlus2, FileText, Link2, Mail, MessageSquare, PenLine, Pencil, Printer, RotateCcw, Send, Star, StickyNote, Trash2, Type, UserRound } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { studentsService } from '../services/firebase/students.js';
import { actionLabel, actionsFor, ENTITY_TYPES, entityAt, pressTarget } from './entityMenu/entityRegistry.js';
import { openStudentDrawer } from './studentDrawer/studentDrawer.js';
import './entityContextMenu.css';

const ICONS = {
  open: ExternalLink, rename: Type, edit: Pencil, message: MessageSquare, calendar: CalendarPlus, newSheet: FilePlus2,
  board: PenLine, money: CreditCard, copy: Copy, restore: RotateCcw, archive: Archive, view: Eye, link: Link2,
  sheet: FileText, user: UserRound, print: Printer, send: Send, mail: Mail, note: StickyNote, star: Star, check: Check, book: BookOpen, trash: Trash2,
};

// a right-click in a field keeps the browser's menu (copy / paste), so does one on selected text
function keepsBrowserMenu(event) {
  const target = event.target;
  if (event.shiftKey) return true;
  if (target?.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"]') || target?.isContentEditable) return true;
  const selection = globalThis.getSelection?.();
  return Boolean(selection && !selection.isCollapsed && String(selection).trim() && target && selection.containsNode?.(target, true));
}

/**
 * The right-click menu for everything in the CRM (owner 2026-10-27 for students, 2026-11-02 for everything else):
 * a right-click on a student, a lesson in the calendar, an invoice, a sheet or a task in the Õpik, a library row,
 * a homework, a group, a teacher or a lead opens the actions this user's role may use there (entityRegistry.js).
 * Without allowed actions — and for students and parents, whom the shell does not give it — the browser's own menu
 * opens. Shift + right-click and right-clicks in fields keep the browser's menu.
 */
export default function EntityContextMenu({ roles = [], enabled = true, services = { students: studentsService } }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(null); // { type, data, element, x, y, record, loaded }
  const [renaming, setRenaming] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const [position, setPosition] = useState(null);
  const box = useRef(null);
  const returnFocus = useRef(null);
  const rolesKey = roles.join(',');

  const close = useCallback((restore = false) => {
    setMenu(null); setRenaming(''); setNote(''); setPosition(null);
    const back = returnFocus.current; returnFocus.current = null;
    if (restore && back?.isConnected) back.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (!enabled || !roles.length) return undefined;
    const open = (event) => {
      if (keepsBrowserMenu(event)) return;
      const found = entityAt(event.target);
      if (!found) return;
      const type = ENTITY_TYPES[found.type];
      // nothing this role may do here: the browser's menu (a student's record is not loaded yet, so probe with {})
      if (!actionsFor(found.type, roles, found.data, { record: type.load ? {} : null, element: found.element }).length) return;
      event.preventDefault();
      returnFocus.current = document.activeElement instanceof globalThis.HTMLElement ? document.activeElement : null;
      // the keyboard's menu key opens at the element, not at 0 / 0
      let { clientX: x, clientY: y } = event;
      if (!x && !y) { const rect = found.element.getBoundingClientRect?.(); x = rect?.left || 0; y = rect?.bottom || 0; }
      setMenu({ ...found, x, y, record: null, loaded: !type.load });
      setRenaming(''); setNote(''); setPosition(null);
      if (type.load) {
        const key = JSON.stringify(found.data);
        Promise.resolve().then(() => type.load(found.data, services)).then((record) => {
          setMenu((current) => (current && JSON.stringify(current.data) === key ? { ...current, record: record || null, loaded: true } : current));
        }).catch(() => setMenu((current) => (current ? { ...current, loaded: true } : current)));
      }
    };
    document.addEventListener('contextmenu', open);
    return () => document.removeEventListener('contextmenu', open);
  }, [enabled, rolesKey, services]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!menu) return undefined;
    const away = (event) => { if (box.current && !box.current.contains(event.target)) close(); };
    const scroll = (event) => { if (!box.current?.contains(event.target)) close(); };
    const resize = () => close();
    document.addEventListener('mousedown', away);
    document.addEventListener('touchstart', away);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', resize);
    window.addEventListener('blur', resize);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('touchstart', away);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', resize);
      window.removeEventListener('blur', resize);
    };
  }, [menu, close]);

  // kept inside the window: measured after it renders, then moved left / up when it would overflow
  useLayoutEffect(() => {
    if (!menu || !box.current) return;
    const { offsetWidth: width, offsetHeight: height } = box.current;
    const left = Math.max(8, Math.min(menu.x, window.innerWidth - width - 8));
    const top = Math.max(8, Math.min(menu.y, window.innerHeight - height - 8));
    setPosition((current) => (current && current.left === left && current.top === top ? current : { left, top }));
  }, [menu, note, renaming]);

  // the first item takes the focus when the menu opens (keyboard: arrows, Home / End, Escape)
  const opened = menu ? `${menu.type}:${JSON.stringify(menu.data)}` : '';
  useEffect(() => {
    if (!opened) return;
    box.current?.querySelector('[role="menuitem"]:not(:disabled)')?.focus({ preventScroll: true });
  }, [opened]);

  if (!menu) return null;
  const { type: typeName, data, element, record } = menu;
  const type = ENTITY_TYPES[typeName];
  const actions = actionsFor(typeName, roles, data, { record, element });
  if (!actions.length) return null;

  const onKeyDown = (event) => {
    const items = [...(box.current?.querySelectorAll('[role="menuitem"]:not(:disabled)') || [])];
    const index = items.indexOf(document.activeElement);
    const move = (next) => { event.preventDefault(); items[(next + items.length) % items.length]?.focus(); };
    if (event.key === 'Escape') { event.preventDefault(); close(true); }
    else if (event.key === 'Tab') close(true);
    else if (event.target.closest('form')) return; // the rename field keeps its own keys
    else if (event.key === 'ArrowDown') move(index + 1);
    else if (event.key === 'ArrowUp') move(index < 0 ? items.length - 1 : index - 1);
    else if (event.key === 'Home') move(0);
    else if (event.key === 'End') move(items.length - 1);
  };

  const copy = async (value) => { try { await navigator.clipboard.writeText(value); setNote('Kopeeritud.'); } catch { setNote(value); } };
  const run = async (action, done) => {
    setBusy(true); setNote('');
    try { const result = await action(); setNote(done(result)); } catch (error) { setNote(error.message || 'Ei õnnestunud.'); } finally { setBusy(false); }
  };
  const setRecord = (patch) => setMenu((current) => ({ ...current, record: { ...current.record, ...patch } }));
  const students = services.students;

  const choose = (action) => {
    if (action.kind === 'drawer') { close(); if (!openStudentDrawer(data.studentId)) navigate(`/students/${encodeURIComponent(data.studentId)}`); return; }
    if (action.to) { close(); navigate(action.to(data, { pathname })); return; }
    if (action.press) { const button = pressTarget(element, action.press); close(); button?.click(); return; }
    if (action.copy) { copy(action.copy(data, record)); return; }
    if (action.kind === 'rename') { setRenaming(record?.name || ''); return; }
    if (action.kind === 'restore') { run(() => students.restore([data.studentId]), () => { setRecord({ active: true }); return 'Õpilane taastatud.'; }); return; }
    if (action.kind === 'archive' && globalThis.confirm(`Arhiveerida ${record?.name || 'õpilane'}? Tunnid, arved ja ajalugu jäävad alles.`)) {
      run(() => students.archive([data.studentId]), () => { setRecord({ active: false }); return 'Õpilane arhiveeritud.'; });
    }
  };

  const title = type.title ? type.title(data, record) : (data.entityTitle || type.label);
  const subtitle = type.subtitle ? type.subtitle(data, record) : (data.entityTitle ? type.label : '');
  const style = position || { left: menu.x, top: menu.y, opacity: 0 };

  return (
    <div ref={box} className="entity-menu" role="menu" aria-label={`${type.label}: ${title}`} style={style} onKeyDown={onKeyDown}>
      <div className="entity-menu__head"><strong>{title}</strong>{subtitle ? <small>{subtitle}</small> : null}</div>
      {renaming !== '' ? <form className="entity-menu__rename" onSubmit={(event) => { event.preventDefault(); run(() => students.rename(data.studentId, renaming), (result) => { setRenaming(''); setRecord({ name: result.name }); return `Nimi muudetud: ${result.name}. Uuendatud ka tunnid, kodutööd ja töölehed.`; }); }}>
        <input autoFocus aria-label="Uus nimi" value={renaming} onChange={(event) => setRenaming(event.target.value)} />
        <button type="submit" disabled={busy}>Salvesta</button>
      </form> : null}
      {actions.map((action) => {
        const Icon = ICONS[action.icon] || ExternalLink;
        const waiting = action.needsRecord && !record;
        const busyKind = busy && (action.kind === 'archive' || action.kind === 'restore');
        return <button key={action.id} type="button" role="menuitem" tabIndex={-1} className={action.danger ? 'is-danger' : undefined} disabled={waiting || busyKind} onClick={() => choose(action)}><Icon size={15} aria-hidden="true" /> {actionLabel(action, data, record)}</button>;
      })}
      {note ? <p className="entity-menu__note" role="status">{note}</p> : null}
      <small className="entity-menu__hint">Brauseri menüü: Shift + parem klõps</small>
    </div>
  );
}
