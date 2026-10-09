/* global setTimeout, clearTimeout */
import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { aiRequestsService } from '../../../services/firebase/aiRequests.js';
import { useGrammarTopics } from './useGrammarTopics.js';

const SLOW_MS = 2 * 60 * 1000;

// „Paku laused” for a gaps block: the school Mac writes sentences with one gap (gemma3) and TartuNLP's Estonian model
// checks each one. A sentence the check would change is marked „kontrolli” and not ticked. The teacher picks what to
// add; nothing is added by itself.
export default function AiSentences({ meta = {}, onAdd, service = aiRequestsService }) {
  const { user } = useAuth() || {};
  const topics = useGrammarTopics(meta.level);
  const listId = 'ed-grammar-sentences';
  const [form, setForm] = useState({ topic: meta.title || '', grammar: '', count: 8 });
  const [state, setState] = useState({ phase: 'idle', items: [], picked: [], error: '', slow: false });
  const stop = useRef(() => {});
  useEffect(() => () => stop.current(), []);

  const ask = async () => {
    stop.current();
    setState({ phase: 'waiting', items: [], picked: [], error: '', slow: false });
    try {
      const id = await service.requestSentences({ ...form, level: meta.level || 'A2' }, user);
      const timer = setTimeout(() => setState((s) => (s.phase === 'waiting' ? { ...s, slow: true } : s)), SLOW_MS);
      const unsubscribe = service.subscribe(id, (req) => {
        if (req?.status === 'done') {
          const items = Array.isArray(req.result) ? req.result : [];
          setState({ phase: 'done', items, picked: items.map((it) => it.ok), error: '', slow: false });
          stop.current();
        } else if (req?.status === 'failed') {
          setState({ phase: 'idle', items: [], picked: [], error: req.error || 'Kooli Mac ei saanud lauseid teha.', slow: false });
          stop.current();
        }
      }, (err) => setState({ phase: 'idle', items: [], picked: [], error: err.message || 'Viga.', slow: false }));
      stop.current = () => { clearTimeout(timer); unsubscribe?.(); stop.current = () => {}; };
    } catch (err) {
      setState({ phase: 'idle', items: [], picked: [], error: err.message || 'Päringut ei saanud saata.', slow: false });
    }
  };
  const chosen = state.items.filter((_, i) => state.picked[i]);
  return (
    <div className="ed-ai">
      <span className="ed-label"><Sparkles size={14} aria-hidden="true" /> Paku laused (AI kooli arvutis)</span>
      <datalist id={listId}>{topics.map((t) => <option key={t} value={t} />)}</datalist>
      <div className="ed-ai__form">
        <input className="ed-input" aria-label="Teema" placeholder="Teema" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        <input className="ed-input" aria-label="Mida lünk harjutab" list={listId} placeholder="Lünk harjutab (nt osastav, mineviku vorm)" value={form.grammar} onChange={(e) => setForm({ ...form, grammar: e.target.value })} />
        <div className="ed-row">
          <select className="ed-input small" aria-label="Mitu lauset" value={form.count} onChange={(e) => setForm({ ...form, count: Number(e.target.value) })}>{[4, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} lauset</option>)}</select>
          <button type="button" className="ed-btn" disabled={state.phase === 'waiting'} onClick={ask}>{state.phase === 'waiting' ? 'Kirjutan…' : 'Paku laused'}</button>
        </div>
      </div>
      {state.phase === 'waiting' ? <p className="ed-hint" role="status">{state.slow ? 'Kooli Mac ei vasta veel. Kas see on sees? Päring jääb ootama.' : 'Kooli Mac kirjutab ja kontrollib lauseid… (tavaliselt 20–60 s)'}</p> : null}
      {state.error ? <p className="ed-hint is-error" role="alert">{state.error}</p> : null}
      {state.phase === 'done' ? (state.items.length ? <>
        <ul className="ed-ai__list">{state.items.map((it, i) => (
          <li key={i} className={it.ok ? '' : 'is-check'}>
            <label><input type="checkbox" checked={Boolean(state.picked[i])} onChange={(e) => setState((s) => ({ ...s, picked: s.picked.map((v, j) => (j === i ? e.target.checked : v)) }))} /> <span>{it.text}</span></label>
            {it.suggestion ? <small>kontrolli · Tartu mudel parandaks: „{it.suggestion}”</small> : null}
            {it.hard?.length ? <small>üle taseme: {it.hard.join(', ')}</small> : null}
          </li>
        ))}</ul>
        <button type="button" className="ed-btn" disabled={!chosen.length} onClick={() => { onAdd(chosen.map((it) => it.text)); setState({ phase: 'idle', items: [], picked: [], error: '', slow: false }); }}>Lisa valitud ({chosen.length})</button>
      </> : <p className="ed-hint">Sobivaid lauseid ei tulnud. Proovi teist teemat.</p>) : null}
    </div>
  );
}
