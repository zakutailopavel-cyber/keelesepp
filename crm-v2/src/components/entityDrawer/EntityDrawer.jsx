import { ExternalLink, X } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { rolesForRoute } from '../../app/accessPolicy.js';
import { lazyComponent } from '../../app/lazyComponent.js';
import { hasAnyRole } from '../../utils/roles.js';
import LoadingState from '../ui/LoadingState.jsx';
import { onDrawer } from './entityDrawer.js';
import './entityDrawer.css';

// each panel is downloaded on its first opening only
const StudentProfilePage = lazyComponent(() => import('../../features/students/StudentProfilePage.jsx'));
const LessonDrawerPanel = lazyComponent(() => import('../../features/calendar/LessonDrawerPanel.jsx'));
const InvoiceDrawerPanel = lazyComponent(() => import('../../features/finance/InvoiceDrawerPanel.jsx'));

const enc = encodeURIComponent;

// kind → what the drawer shows; `full` is the entity's own page, offered only when the role may open its route
export const DRAWER_PANELS = Object.freeze({
  student: {
    label: 'Õpilase kaart', wide: true, loading: 'Laen kaarti…', key: (d) => d.studentId,
    full: { label: 'Ava täislehena', route: '/students/:studentId', to: (d) => `/students/${enc(d.studentId)}` },
    Panel: ({ data }) => <StudentProfilePage studentId={data.studentId} embedded />,
  },
  lesson: {
    label: 'Tund', loading: 'Laen tundi…', key: (d) => `${d.scheduleId}:${d.date}`,
    // the calendar opens this lesson's own panel from `?lesson=<occurrenceId>|<date>`
    full: { label: 'Ava kalendris', route: '/calendar', to: (d) => `/calendar?lesson=${enc(`${d.scheduleId}:${d.date}|${d.date}`)}` },
    Panel: ({ data, onClose }) => <LessonDrawerPanel scheduleId={data.scheduleId} date={data.date} onClose={onClose} />,
  },
  invoice: {
    label: 'Arve', loading: 'Laen arvet…', key: (d) => d.invoiceId,
    full: { label: 'Ava Finantsid', route: '/finance', to: () => '/finance' },
    Panel: ({ data }) => <InvoiceDrawerPanel invoiceId={data.invoiceId} />,
  },
});

/**
 * One side drawer over the current page for every entity (entityDrawer.js): a student's full card, a calendar lesson,
 * an invoice. Everything the panel can do works here; the page underneath keeps its place, filters and scroll. Escape,
 * the backdrop or × closes it; a link inside the panel that leads to another page closes it too (the page changed
 * under it).
 */
export default function EntityDrawer({ roles = [] }) {
  const [shown, setShown] = useState(null); // { kind, ...data }
  const { pathname } = useLocation();
  const panel = useRef(null);
  const returnFocus = useRef(null);
  useEffect(() => onDrawer((request) => {
    if (!returnFocus.current) returnFocus.current = document.activeElement;
    setShown(request);
  }), []);
  const close = () => {
    setShown(null);
    const back = returnFocus.current; returnFocus.current = null;
    if (back?.isConnected) back.focus?.({ preventScroll: true });
  };
  // another page opened from inside the panel: the drawer is done
  const openedOn = useRef(pathname);
  useEffect(() => {
    if (shown && openedOn.current !== pathname) setShown(null);
    openedOn.current = pathname;
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  const open = Boolean(shown);
  useEffect(() => {
    if (!open) return undefined;
    panel.current?.focus({ preventScroll: true });
    // Escape closes the drawer unless a dialog inside the panel is open (it closes itself first)
    const onKey = (event) => { if (event.key === 'Escape' && !document.querySelector('.entity-drawer .modal-backdrop')) close(); };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const kind = shown ? DRAWER_PANELS[shown.kind] : null;
  if (!kind) return null;
  const full = kind.full && (!roles.length || hasAnyRole(roles, rolesForRoute(kind.full.route))) ? kind.full.to(shown) : '';
  return <div className={`entity-drawer entity-drawer--${shown.kind}`} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <aside ref={panel} className={`entity-drawer__panel${kind.wide ? ' is-wide' : ''}`} role="dialog" aria-modal="true" aria-label={kind.label} tabIndex={-1}>
      <div className="entity-drawer__bar">
        <strong>{kind.label}</strong>
        {full ? <Link className="entity-drawer__full" to={full}><ExternalLink size={15} aria-hidden="true" /> {kind.full.label}</Link> : null}
        <button type="button" className="entity-drawer__close" aria-label={`Sulge: ${kind.label.toLowerCase()}`} onClick={close}><X size={20} /></button>
      </div>
      <div className="entity-drawer__body">
        <Suspense fallback={<LoadingState label={kind.loading} />}><div key={`${shown.kind}:${kind.key(shown)}`} className="entity-drawer__content"><kind.Panel data={shown} onClose={close} /></div></Suspense>
      </div>
    </aside>
  </div>;
}
