import { ExternalLink, X } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { lazyComponent } from '../../app/lazyComponent.js';
import LoadingState from '../ui/LoadingState.jsx';
import { onStudentDrawer } from './studentDrawer.js';
import './studentDrawer.css';

// the full card, downloaded on the first opening only
const StudentProfilePage = lazyComponent(() => import('../../features/students/StudentProfilePage.jsx'));

/**
 * The student's full card in a panel over the current page (studentDrawer.js). Everything the card can do works here;
 * the page underneath keeps its place, filters and scroll. Escape, the backdrop or × closes it; a link inside the card
 * that leads to another page closes it too (the page changed under it).
 */
export default function StudentDrawer() {
  const [studentId, setStudentId] = useState('');
  const { pathname } = useLocation();
  const panel = useRef(null);
  const returnFocus = useRef(null);
  useEffect(() => onStudentDrawer((id) => {
    if (!returnFocus.current) returnFocus.current = document.activeElement;
    setStudentId(id);
  }), []);
  const close = () => {
    setStudentId('');
    const back = returnFocus.current; returnFocus.current = null;
    if (back?.isConnected) back.focus?.({ preventScroll: true });
  };
  // another page opened from inside the card: the drawer is done
  const openedOn = useRef(pathname);
  useEffect(() => {
    if (studentId && openedOn.current !== pathname) setStudentId('');
    openedOn.current = pathname;
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!studentId) return undefined;
    panel.current?.focus({ preventScroll: true });
    // Escape closes the drawer unless a dialog inside the card is open (it closes itself first)
    const onKey = (event) => { if (event.key === 'Escape' && !document.querySelector('.student-drawer .modal-backdrop')) close(); };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow; };
  }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!studentId) return null;
  return <div className="student-drawer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
    <aside ref={panel} className="student-drawer__panel" role="dialog" aria-modal="true" aria-label="Õpilase kaart" tabIndex={-1}>
      <div className="student-drawer__bar">
        <strong>Õpilase kaart</strong>
        <Link className="student-drawer__full" to={`/students/${encodeURIComponent(studentId)}`}><ExternalLink size={15} aria-hidden="true" /> Ava täislehena</Link>
        <button type="button" className="student-drawer__close" aria-label="Sulge kaart" onClick={close}><X size={20} /></button>
      </div>
      <div className="student-drawer__body">
        <Suspense fallback={<LoadingState label="Laen kaarti…" />}><StudentProfilePage key={studentId} studentId={studentId} embedded /></Suspense>
      </div>
    </aside>
  </div>;
}
