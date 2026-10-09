/* global setTimeout, clearTimeout */
import { useEffect, useRef, useState } from 'react';
import { BookOpenText } from 'lucide-react';
import { useAuth } from '../../../app/AuthContext.jsx';
import { aiRequestsService } from '../../../services/firebase/aiRequests.js';
import { useGrammarTopics } from './useGrammarTopics.js';
import { levelProfile } from '../didactics/levels.js';

const SLOW_MS = 3 * 60 * 1000;

// „Paku tekst” for a reading block: the school Mac writes a text with questions under the level's norms (gemma3),
// simplifies it once when it has too many words above the level (EKI lists), and TartuNLP's model checks every
// sentence. The teacher sees the hard words and the corrections, applies them and uses the text.
export default function AiReading({ meta = {}, onUse, service = aiRequestsService }) {
  const { user } = useAuth() || {};
  const topics = useGrammarTopics(meta.level);
  const listId = 'ed-grammar-reading';
  const norm = levelProfile(meta.level);
  const [form, setForm] = useState({ topic: meta.title || '', grammar: '', words: Math.round((norm.reading.words[0] + norm.reading.words[1]) / 2) });
  const [state, setState] = useState({ phase: 'idle', result: null, error: '', slow: false });
  const stop = useRef(() => {});
  useEffect(() => () => stop.current(), []);

  const ask = async () => {
    stop.current();
    setState({ phase: 'waiting', result: null, error: '', slow: false });
    try {
      const id = await service.requestReading({ ...form, level: meta.level || 'A2' }, user);
      const timer = setTimeout(() => setState((s) => (s.phase === 'waiting' ? { ...s, slow: true } : s)), SLOW_MS);
      const unsubscribe = service.subscribe(id, (req) => {
        if (req?.status === 'done') { setState({ phase: 'done', result: req.result, error: '', slow: false }); stop.current(); }
        else if (req?.status === 'failed') { setState({ phase: 'idle', result: null, error: req.error || 'Kooli Mac ei saanud teksti teha.', slow: false }); stop.current(); }
      }, (err) => setState({ phase: 'idle', result: null, error: err.message || 'Viga.', slow: false }));
      stop.current = () => { clearTimeout(timer); unsubscribe?.(); stop.current = () => {}; };
    } catch (err) {
      setState({ phase: 'idle', result: null, error: err.message || 'Päringut ei saanud saata.', slow: false });
    }
  };
  const fix = (only) => setState((s) => {
    const r = s.result;
    let passage = r.passage;
    const left = [];
    r.flagged.forEach((f) => { if ((!only || only === f) && passage.includes(f.sentence)) passage = passage.replace(f.sentence, f.suggestion); else left.push(f); });
    return { ...s, result: { ...r, passage, flagged: left } };
  });
  const r = state.result;
  return (
    <div className="ed-ai">
      <span className="ed-label"><BookOpenText size={14} aria-hidden="true" /> Paku tekst (AI kooli arvutis · tase {norm.label})</span>
      <datalist id={listId}>{topics.map((t) => <option key={t} value={t} />)}</datalist>
      <div className="ed-ai__form">
        <input className="ed-input" aria-label="Teksti teema" placeholder="Teema" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
        <input className="ed-input" aria-label="Grammatika tekstis" list={listId} placeholder="Grammatika tekstis (valikuline, nt lihtminevik)" value={form.grammar} onChange={(e) => setForm({ ...form, grammar: e.target.value })} />
        <div className="ed-row">
          <label className="ed-hint">Sõnu <input className="ed-input small" type="number" min={norm.reading.words[0]} max={norm.reading.words[1]} aria-label="Sõnade arv" value={form.words} onChange={(e) => setForm({ ...form, words: Number(e.target.value) })} /></label>
          <button type="button" className="ed-btn" disabled={state.phase === 'waiting'} onClick={ask}>{state.phase === 'waiting' ? 'Kirjutan…' : 'Paku tekst'}</button>
        </div>
      </div>
      {state.phase === 'waiting' ? <p className="ed-hint" role="status">{state.slow ? 'Kooli Mac ei vasta veel. Kas see on sees? Päring jääb ootama.' : 'Kooli Mac kirjutab, lihtsustab ja kontrollib teksti… (tavaliselt 30–90 s)'}</p> : null}
      {state.error ? <p className="ed-hint is-error" role="alert">{state.error}</p> : null}
      {state.phase === 'done' && r ? (
        <div className="ed-ai__reading">
          <b>{r.title || 'Tekst'}</b> <small className="ed-hint">· {r.words} sõna</small>
          <p className="ed-ai__passage">{r.passage}</p>
          {r.hard?.length ? <p className="ed-hint">Üle taseme {r.level} (EKI loend): {r.hard.join(', ')} — selgita või asenda.</p> : <p className="ed-hint is-ok">Kõik sõnad on tasemel {r.level}.</p>}
          {r.flagged?.length ? <div className="ed-ai__flags">
            <span className="ed-hint">Tartu mudel parandaks {r.flagged.length} lauset: <button type="button" className="ed-btn ghost" onClick={() => fix(null)}>Paranda kõik</button></span>
            <ul className="ed-ai__list">{r.flagged.map((f, i) => <li key={i} className="is-check"><span><s>{f.sentence}</s></span><small>→ {f.suggestion} <button type="button" className="ed-btn ghost" onClick={() => fix(f)}>Paranda</button></small></li>)}</ul>
          </div> : null}
          {r.questions?.length ? <ol className="ed-ai__questions">{r.questions.map((q, i) => <li key={i}>{q.q} <small>[{q.a}]</small></li>)}</ol> : null}
          <button type="button" className="ed-btn" onClick={() => { onUse({ passageTitle: r.title, passage: r.passage, questions: (r.questions || []).map((q) => `${q.q} [${q.a}]`).join('\n') }); setState({ phase: 'idle', result: null, error: '', slow: false }); }}>Kasuta seda teksti</button>
        </div>
      ) : null}
    </div>
  );
}
