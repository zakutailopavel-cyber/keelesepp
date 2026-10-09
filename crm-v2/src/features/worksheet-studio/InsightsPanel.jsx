import { useEffect, useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, Flame, Lightbulb, Plus, RefreshCw } from 'lucide-react';
import { sheetInsights } from './engine/insights.js';

// „Tulemused”: how this sheet went with the learners who submitted it — per task the share of right answers, and
// the same „wrong” answer written by several learners (one click makes it a right answer of that gap).
export default function InsightsPanel({ lessonId, doc, load, onSelect, onAddAlternative }) {
  const [state, setState] = useState({ loading: true, error: '', list: [] });
  const [tick, setTick] = useState(0);
  const [added, setAdded] = useState([]);
  useEffect(() => {
    let alive = true;
    Promise.resolve(load(lessonId))
      .then((list) => { if (alive) setState({ loading: false, error: '', list: list || [] }); })
      .catch((err) => { if (alive) setState({ loading: false, error: err.message || 'Tulemusi ei saanud laadida.', list: [] }); });
    return () => { alive = false; };
  }, [lessonId, load, tick]);
  const insights = useMemo(() => sheetInsights(doc, state.list), [doc, state.list]);

  if (state.loading) return <p className="st-insights-empty">Laadin tulemusi…</p>;
  if (state.error) return <p className="st-insights-empty is-error" role="alert">{state.error}</p>;
  if (!insights.submitted) {
    return (
      <div className="st-insights">
        <p className="st-insights-empty"><BarChart3 size={18} aria-hidden="true" /> Seda lehte pole veel keegi esitanud{insights.assigned ? ` (määratud ${insights.assigned} õpilasele)` : ''}. Kui õpilased esitavad, näed siin, mis oli raske.</p>
      </div>
    );
  }
  return (
    <div className="st-insights">
      <div className="st-insights-sum">
        <div><b>{insights.submitted}</b><span>esitanud</span></div>
        <div><b>{insights.avgPct}%</b><span>keskmine</span></div>
        <button type="button" className="st-btn" onClick={() => { setState((s) => ({ ...s, loading: true, error: '' })); setTick((n) => n + 1); }} aria-label="Värskenda tulemusi"><RefreshCw size={14} aria-hidden="true" /></button>
      </div>
      <ol className="st-insights-tasks">
        {insights.tasks.map((t) => (
          <li key={t.blockId}>
            <button type="button" onClick={() => onSelect(t.blockId)} title="Näita lehel">
              <span className="st-insights-num">{t.num}</span>
              <span className="st-insights-title">{t.title}</span>
              <span className={`st-insights-pct ${t.pct === null ? '' : t.pct >= 80 ? 'is-good' : t.pct >= 50 ? 'is-mixed' : 'is-hard'}`}>{t.pct === null ? '—' : `${t.pct}%`}</span>
              <span className="st-insights-bar" aria-hidden="true"><span style={{ width: `${t.pct || 0}%` }} /></span>
            </button>
          </li>
        ))}
      </ol>
      {insights.hints.length ? (
        <div className="st-insights-hints">
          <b><Lightbulb size={15} aria-hidden="true" /> Mida parandada?</b>
          <ul>
            {insights.hints.map((h) => {
              const id = `${h.kind}:${h.blockId}:${h.key || ''}:${h.answer || ''}`;
              if (h.kind === 'same-answer') {
                return (
                  <li key={id}>
                    <span>Ülesanne {h.num}: {h.count} õpilast kirjutas „<b>{h.answer}</b>”. Kas see on ka õige?</span>
                    {h.canAdd ? (added.includes(id)
                      ? <em><CheckCircle2 size={13} aria-hidden="true" /> Lisatud. Salvesta leht.</em>
                      : <button type="button" className="st-btn" onClick={() => { onAddAlternative(h.blockId, h.key, h.answer); setAdded((a) => [...a, id]); }}><Plus size={13} aria-hidden="true" /> Lisa õigeks</button>) : null}
                  </li>
                );
              }
              if (h.kind === 'hard') return <li key={id}><span><Flame size={13} aria-hidden="true" /> Ülesanne {h.num} on raske ({h.pct}% õigesti): lisa näidis või sõnapank, või tee toetav versioon.</span></li>;
              return <li key={id}><span>Ülesanne {h.num}: kõik vastasid õigesti — sobib kordamiseks või tee väljakutse versioon.</span></li>;
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
