import { Eye, EyeOff, Footprints, Lightbulb, LockOpen, Lock, SkipForward } from 'lucide-react';
import { hardestTasks } from './engine/liveLesson.js';

const TONE_LABEL = { good: 'Kõik õige', mixed: 'Osaliselt', hard: 'Raske', idle: 'Pole vastanud', open: 'Hindab õpetaja' };

// The teacher's task list in a live worksheet lesson: how each task goes (right / answered / all), step mode (open
// tasks one by one) and „Näita vastust” per task. After the lesson the same list says which tasks were hard.
export default function LiveTaskPanel({ stats, step, shown, busy = false, done = false, onStep, onOpen, onShow }) {
  const open = new Set(step?.open || []);
  const visible = new Set(shown || []);
  const stepOn = Boolean(step?.on);
  const hard = hardestTasks(stats);
  const nextId = stats.find((s) => !open.has(s.id))?.id || '';
  return (
    <aside className="ws-live-tasks" aria-label="Ülesanded">
      <div className="ws-live-tasks-head">
        <b>Ülesanded</b>
        {!done ? (
          <button type="button" className={`st-btn ${stepOn ? 'is-on' : ''}`} aria-pressed={stepOn} disabled={busy} onClick={() => onStep(!stepOn)} title="Õpilane näeb ainult avatud ülesandeid">
            <Footprints size={15} aria-hidden="true" /> Samm-sammult
          </button>
        ) : null}
      </div>
      {stepOn && !done ? (
        <div className="ws-live-step">
          <span>Avatud {stats.filter((s) => open.has(s.id)).length}/{stats.length}</span>
          <button type="button" className="st-btn primary" disabled={busy || !nextId} onClick={() => onOpen(nextId, true)}><SkipForward size={15} aria-hidden="true" /> Ava järgmine</button>
        </div>
      ) : null}
      <ol className="ws-live-list">
        {stats.map((s) => {
          const pct = s.total ? Math.round((s.ok / s.total) * 100) : 0;
          const answeredPct = s.total ? Math.round((s.answered / s.total) * 100) : 0;
          return (
            <li key={s.id} className={`is-${s.tone} ${stepOn && !open.has(s.id) ? 'is-closed' : ''}`}>
              <div className="ws-live-row">
                <span className="ws-live-num">{s.num}</span>
                <span className="ws-live-title" title={s.title}>{s.title}</span>
                <span className="ws-live-count" title={`${s.ok} õiget, ${s.answered} vastatud, ${s.total} kokku`}>{s.total ? `${s.ok}/${s.total}` : '—'}</span>
              </div>
              <div className="ws-live-bar" role="img" aria-label={`${TONE_LABEL[s.tone]}: ${s.ok} õiget ${s.total}-st`}>
                <span className="is-answered" style={{ width: `${answeredPct}%` }} />
                <span className="is-ok" style={{ width: `${pct}%` }} />
              </div>
              {!done ? (
                <div className="ws-live-actions">
                  {stepOn ? (
                    <button type="button" disabled={busy} onClick={() => onOpen(s.id, !open.has(s.id))} aria-label={`${open.has(s.id) ? 'Peida' : 'Ava'} ülesanne ${s.num}`}>
                      {open.has(s.id) ? <><Lock size={13} aria-hidden="true" /> Peida</> : <><LockOpen size={13} aria-hidden="true" /> Ava</>}
                    </button>
                  ) : null}
                  {s.total ? (
                    <button type="button" disabled={busy} className={visible.has(s.id) ? 'is-on' : ''} aria-pressed={visible.has(s.id)} onClick={() => onShow(s.id, !visible.has(s.id))} aria-label={`${visible.has(s.id) ? 'Peida vastused' : 'Näita vastust'}: ülesanne ${s.num}`}>
                      {visible.has(s.id) ? <><EyeOff size={13} aria-hidden="true" /> Peida vastus</> : <><Eye size={13} aria-hidden="true" /> Näita vastust</>}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
      {hard.length ? (
        <div className="ws-live-hard">
          <b><Lightbulb size={15} aria-hidden="true" /> Mis oli raske?</b>
          <ul>{hard.slice(0, 3).map((s) => <li key={s.id}>{s.num}. {s.title} — {s.wrong} viga</li>)}</ul>
        </div>
      ) : null}
    </aside>
  );
}
