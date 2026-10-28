import { ArrowRight, ListChecks, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Card, Modal, PageHeader } from '../../components/ui/index.js';
import { useAuth } from '../../app/AuthContext.jsx';
import { LATEST, RELEASES, markSeen, releaseFor, seenRelease } from './whatsNew.js';
import './whatsNew.css';

function ReleaseBody({ release, onGo }) {
  return <>
    {release.todo.length ? <section className="whats-new__todo" aria-label="Mida teha">
      <h3><ListChecks size={16} aria-hidden="true" /> Что сделать</h3>
      <ol>{release.todo.map((item) => <li key={item.text}>{item.to ? <Link to={item.to} onClick={onGo}>{item.text} <ArrowRight size={13} aria-hidden="true" /></Link> : item.text}</li>)}</ol>
    </section> : null}
    {release.sections.map((section) => <section className="whats-new__section" key={section.title}>
      <h3>{section.title}</h3>
      <ul>{section.items.map((item) => <li key={item.where + item.text}>
        <span className="whats-new__where">{item.to ? <Link to={item.to} onClick={onGo}>{item.where}</Link> : item.where}</span>
        <span>{item.text}</span>
      </li>)}</ul>
    </section>)}
  </>;
}

/**
 * Shown once after signing in to staff (owner 2026-10-27: „при входе в систему, чтобы не беспокоить человека”): the
 * newest release until „Selge”, then never again until the next release. Not in a read-only preview or a lesson.
 */
export function WhatsNewDialog({ user, preview, storage }) {
  const location = useLocation();
  const staff = (user?.roles || []).some((role) => role === 'teacher' || role === 'admin');
  const [open, setOpen] = useState(() => staff && !preview && seenRelease(user?.uid, storage) !== LATEST.id);
  if (!open || location.pathname.startsWith('/live-classroom') || location.pathname.startsWith('/uuendused')) return null;
  const close = () => { markSeen(user?.uid, LATEST.id, storage); setOpen(false); };
  const release = releaseFor(LATEST, user?.roles || []);
  return <Modal open title={`${release.title} · ${release.date}`} onClose={close} className="modal--whats-new"
    footer={<><Link className="button button--secondary" to="/uuendused" onClick={close}>Ava lehel</Link><Button onClick={close}>Selge</Button></>}>
    <ReleaseBody release={release} onGo={close} />
  </Modal>;
}

/** /uuendused: every release, newest first (the dialog's content kept for later). */
export default function WhatsNewPage() {
  const { user } = useAuth();
  return <div className="page-content whats-new">
    <PageHeader eyebrow="Juhend" title="Uuendused" description="Mis KeeleSepas muutus · Что изменилось в системе." />
    {RELEASES.map((release) => { const shown = releaseFor(release, user?.roles || []); return <Card key={release.id}>
      <div className="section-heading"><div><span className="eyebrow">{shown.date}</span><h2>{shown.title}</h2></div><Sparkles size={20} aria-hidden="true" /></div>
      <ReleaseBody release={shown} />
    </Card>; })}
  </div>;
}
