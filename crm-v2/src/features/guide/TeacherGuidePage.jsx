import { CheckCircle2, Circle, ExternalLink, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, PageHeader } from '../../components/ui/index.js';
import { FIRST_STEPS, searchGuide, visibleGuide } from './guideContent.js';
import './guide.css';

// per-browser conveniences only (a remembered checklist and „guide seen”); the page works without storage
export const GUIDE_SEEN_KEY = 'keelesepp.guideSeen';
const STEPS_KEY = 'keelesepp.guideSteps';
const read = (key, fallback) => { try { return JSON.parse(globalThis.localStorage?.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; } };
const write = (key, value) => { try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ } };

// The teacher's introduction to the whole system: first steps with a checklist, then every part of the system with a
// short explanation (Estonian and Russian), a link to the page and „how to” steps.
export default function TeacherGuidePage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [done, setDone] = useState(() => read(STEPS_KEY, {}));
  useEffect(() => { write(GUIDE_SEEN_KEY, true); }, []);
  const sections = useMemo(() => searchGuide(visibleGuide(user?.roles || []), query), [user?.roles, query]);
  const toggle = (id) => setDone((current) => { const next = { ...current, [id]: !current[id] }; write(STEPS_KEY, next); return next; });
  const count = FIRST_STEPS.filter((step) => done[step.id]).length;

  return <div className="page-content guide-page">
    <PageHeader eyebrow="Juhend" title="Süsteemi tutvustus" description="Kõik KeeleSepa võimalused õpetajale ühes kohas · Все возможности системы для учителя в одном месте." />

    <Card className="guide-steps">
      <div className="guide-steps__head"><h2>Esimesed sammud</h2><span className="guide-steps__count">{count}/{FIRST_STEPS.length}</span></div>
      <p className="guide-ru">Первые шаги: отметь, что уже сделал(а). Ссылка открывает нужную страницу.</p>
      <ol className="guide-steps__list">
        {FIRST_STEPS.map((step) => <li key={step.id} className={done[step.id] ? 'is-done' : ''}>
          <button type="button" className="guide-check" aria-pressed={Boolean(done[step.id])} aria-label={`Märgi tehtuks: ${step.et}`} onClick={() => toggle(step.id)}>{done[step.id] ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>
          <div><strong>{step.et}</strong><span className="guide-ru">{step.ru}</span></div>
          <Link className="guide-open" to={step.to}>Ava <ExternalLink size={14} aria-hidden="true" /></Link>
        </li>)}
      </ol>
    </Card>

    <label className="guide-search"><Search size={17} aria-hidden="true" /><input type="search" placeholder="Otsi juhendist… / Поиск…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Otsi juhendist" /></label>

    <nav className="guide-toc" aria-label="Juhendi osad">{sections.map((section) => <a key={section.id} href={`#guide-${section.id}`}>{section.title}</a>)}</nav>

    {sections.length ? sections.map((section) => <section key={section.id} id={`guide-${section.id}`} className="guide-section">
      <h2>{section.title} <span className="guide-ru">· {section.ru}</span></h2>
      <div className="guide-grid">
        {section.items.map((item) => <Card key={item.title} className="guide-item">
          <h3>{item.title}</h3>
          <p>{item.et}</p>
          <p className="guide-ru">{item.ru}</p>
          {item.steps ? <ol className="guide-howto">{item.steps.map((step) => <li key={step}>{step}</li>)}</ol> : null}
          {item.to ? <Link className="guide-open" to={item.to}>Ava „{item.title}” <ExternalLink size={14} aria-hidden="true" /></Link> : null}
        </Card>)}
      </div>
    </section>) : <p className="guide-empty">Midagi ei leitud. · Ничего не найдено.</p>}
  </div>;
}
