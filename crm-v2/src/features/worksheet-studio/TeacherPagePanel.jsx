import { useContext } from 'react';
import { AuthContext } from '../../app/AuthContext.jsx';
import { ACCESS } from '../../app/accessPolicy.js';
import { hasAnyRole } from '../../utils/roles.js';
import './teacherPagePanel.css';

// „Õpetaja leht” (owner 2026-11-17): the lesson's teacher page (stations.js teacherPage(), put on every sheet of a
// stations / task-based lesson as meta.teacherPage by courseSheet.js) next to the sheet, for staff only. The learner's
// copy of the sheet may carry the same meta (it is the published sheet as is), so the rule is: never render it unless
// the viewer is admin or teacher. Labels are Estonian; the content stays in the language it was written in.
// Rendered generically: known fields in a teacher's order (hook, minute plan, plan B, errors, answer sources …) and any
// other text field the course adds later under its own key, so a renamed or new field still shows up.

const text = (v) => String(v ?? '').trim();
const list = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' || typeof x === 'number' ? text(x) : '')).filter(Boolean) : []);
// „0–4: крючок …” → { time: '0–4', text: 'крючок …' }; a line without a time stays one text
const PLAN_LINE = /^(\d{1,3}\s*[–-]\s*\d{1,3}|\d{1,3}\s*\+?)\s*(?:min\.?|мин\.?)?\s*[:.–-]\s+(.+)$/u;
export function planRows(plan) {
  return list(plan).map((line) => {
    const m = line.match(PLAN_LINE);
    return m ? { time: m[1].replace(/\s+/g, ''), text: m[2].trim() } : { time: '', text: line };
  });
}

// the fields the panel lays out itself; anything else (a string or a list of strings) is shown under its key
const KNOWN = new Set(['goal', 'hook', 'plan', 'stations', 'core', 'alt', 'coreMinutes', 'totalMinutes', 'short', 'errors', 'sources', 'groups', 'notes']);
export function extraFields(page) {
  return Object.entries(page || {}).filter(([key]) => !KNOWN.has(key)).map(([key, value]) => {
    if (typeof value === 'string') return text(value) ? { key, items: [text(value)] } : null;
    const items = list(value);
    return items.length ? { key, items } : null;
  }).filter(Boolean);
}

export const isStaffUser = (user) => Boolean(user && hasAnyRole(user.roles || [], ACCESS.STAFF));

function Section({ title, className = '', children }) {
  return <section className={`tp-section ${className}`}><h5>{title}</h5>{children}</section>;
}
const Bullets = ({ items }) => <ul className="tp-list">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;

// page: meta.teacherPage of the sheet. `user` defaults to the signed-in user (AuthContext); `defaultOpen` — open at start.
export default function TeacherPagePanel({ page, user: userProp, defaultOpen = false, className = '' }) {
  const auth = useContext(AuthContext);
  const user = userProp === undefined ? auth?.user : userProp;
  if (!page || typeof page !== 'object' || !isStaffUser(user)) return null;

  const goal = text(page.goal);
  const hook = text(page.hook);
  const plan = planRows(page.plan);
  const short = text(page.short);
  const errors = list(page.errors);
  const sources = text(page.sources);
  const groups = text(page.groups);
  const notes = list(page.notes);
  const stations = Array.isArray(page.stations) ? page.stations.filter((s) => s && typeof s === 'object') : [];
  const core = list(page.core);
  const cards = stations.flatMap((s) => (Array.isArray(s.tasks) ? s.tasks : []).filter((t) => text(t?.teacher)).map((t) => ({ n: s.n, id: t.id, text: text(t.teacher) })));
  const extras = extraFields(page);
  const empty = !goal && !hook && !plan.length && !short && !errors.length && !sources && !groups && !notes.length && !stations.length && !extras.length;
  if (empty) return null;
  const minutes = Number(page.totalMinutes) || 0;

  return (
    <details className={`tp-panel ${className}`} open={defaultOpen} data-testid="teacher-page-panel">
      <summary>
        <span className="tp-title">Õpetaja leht</span>
        <span className="tp-meta">{[plan.length ? 'minutiplaan' : '', hook ? 'konks' : '', stations.length ? `${stations.length} jaama${minutes ? ` · ${minutes} min` : ''}` : ''].filter(Boolean).join(' · ')}</span>
        <span className="tp-private">õpilane ei näe</span>
      </summary>
      <div className="tp-body">
        {goal ? <p className="tp-goal"><b>Eesmärk:</b> {goal}</p> : null}
        {hook ? <Section title="Konks — mida öelda" className="tp-hook"><p>{hook}</p></Section> : null}
        {plan.length ? (
          <Section title="Minutiplaan">
            <ol className="tp-plan">{plan.map((row, i) => <li key={i}><span className="tp-time">{row.time || '•'}</span><span>{row.text}</span></li>)}</ol>
          </Section>
        ) : null}
        {stations.length ? (
          <Section title={core.length ? `Jaamad · põhitee ${core.join(', ')}${Number(page.coreMinutes) ? ` (${page.coreMinutes} min)` : ''}` : 'Jaamad'}>
            <ul className="tp-stations">{stations.map((s, i) => (
              <li key={s.n ?? i} className={s.core ? 'is-core' : ''}>
                <b>{s.n}.</b> {text(s.title)}
                <span className="tp-tags">
                  {Number(s.minutes) ? <span>{s.minutes} min</span> : null}
                  {s.sheet ? <span>{s.sheet}</span> : null}
                  {s.core ? <span className="is-core">põhitee</span> : null}
                  {s.alt ? <span>varu</span> : null}
                  {s.final ? <span>lõpp</span> : null}
                  {s.needs ? <span>vajab jaama {s.needs}</span> : null}
                </span>
              </li>
            ))}</ul>
          </Section>
        ) : null}
        {short ? <Section title="Plaan B — kui aega on vähe"><p>{short}</p></Section> : null}
        {errors.length ? <Section title="Tüüpvead"><Bullets items={errors} /></Section> : null}
        {sources ? <Section title="Vastuste allikad"><p>{sources}</p></Section> : null}
        {groups ? <Section title="Väike rühm"><p>{groups}</p></Section> : null}
        {notes.length ? <Section title="Märkused"><Bullets items={notes} /></Section> : null}
        {cards.length ? <Section title="Õpetaja kaardid"><Bullets items={cards.map((c) => `Jaam ${c.n}${c.id ? ` (${c.id})` : ''}: ${c.text}`)} /></Section> : null}
        {extras.map((f) => <Section key={f.key} title={f.key}>{f.items.length > 1 ? <Bullets items={f.items} /> : <p>{f.items[0]}</p>}</Section>)}
      </div>
    </details>
  );
}
