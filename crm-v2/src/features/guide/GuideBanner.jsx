import { Compass } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GUIDE_SEEN_KEY } from './TeacherGuidePage.jsx';
import './guide.css';

const seen = () => { try { return globalThis.localStorage?.getItem(GUIDE_SEEN_KEY) === 'true'; } catch { return false; } };

// A teacher who has not opened the guide yet sees one quiet invitation above the page; closing it counts as seen.
export default function GuideBanner({ user, preview }) {
  const location = useLocation();
  const [hidden, setHidden] = useState(seen);
  const staff = (user?.roles || []).some((role) => role === 'teacher' || role === 'admin');
  if (!staff || preview || hidden || location.pathname.startsWith('/guide') || location.pathname.startsWith('/live-classroom')) return null;
  const close = () => { try { globalThis.localStorage?.setItem(GUIDE_SEEN_KEY, 'true'); } catch { /* storage blocked */ } setHidden(true); };
  return <div className="guide-banner" role="status">
    <div><strong><Compass size={16} aria-hidden="true" /> Uus KeeleSepas? Vaata süsteemi tutvustust.</strong><small>Новенький? Посмотри обзор всех возможностей системы.</small></div>
    <div className="guide-banner__actions"><Link to="/guide" onClick={close}>Ava juhend</Link><button type="button" onClick={close} aria-label="Sulge">Hiljem</button></div>
  </div>;
}
