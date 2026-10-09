import { useState } from 'react';
import { Gauge } from 'lucide-react';
import { sheetText } from '../didactics/sheetText.js';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

// „Hinda EKI-ga”: EKI's text evaluation (Sõnaveeb „Õppeteksti hindamine”) of everything the learner reads on the sheet —
// the level of every word and every grammatical form, and what lies above the sheet's level.
export default function EkiEvaluation({ doc, evaluate }) {
  const [state, setState] = useState({ busy: false, result: null, error: '' });
  if (!evaluate) return null;
  const run = async () => {
    const text = sheetText(doc);
    if (text.split(' ').length < 5) { setState({ busy: false, result: null, error: 'Lehel on hindamiseks liiga vähe teksti.' }); return; }
    setState({ busy: true, result: null, error: '' });
    try { setState({ busy: false, result: await evaluate({ text, level: doc.meta?.level || 'A2' }), error: '' }); }
    catch (err) { setState({ busy: false, result: null, error: err.message || 'EKI hindamine ei õnnestunud.' }); }
  };
  const r = state.result;
  const bar = (levels) => { const total = LEVELS.reduce((n, l) => n + (levels?.[l] || 0), 0) || 1; return LEVELS.map((l) => ({ l, pct: Math.round(((levels?.[l] || 0) / total) * 100) })); };
  return (
    <div className="ed-eki">
      <span className="ed-label"><Gauge size={14} aria-hidden="true" /> Teksti tasemekohasus (EKI)</span>
      <button type="button" className="ed-btn ghost" disabled={state.busy} onClick={run}>{state.busy ? 'Hindan…' : 'Hinda EKI-ga'}</button>
      {state.error ? <p className="ed-hint is-error" role="alert">{state.error}</p> : null}
      {r ? <>
        <p className="ed-hint">{r.words} sõna{r.unknownWords ? ` · ${r.unknownWords} loendites puudu` : ''}{r.lix != null && r.lix !== '-' ? ` · LIX ${r.lix}` : ''}</p>
        {[['Sõnad', r.wordLevels], ['Vormid', r.formLevels]].map(([name, levels]) => (
          <div key={name} className="ed-eki__row"><small>{name}</small><div className="ed-eki__bar">{bar(levels).filter((x) => x.pct).map((x) => <i key={x.l} className={`lv-${x.l}`} style={{ width: `${x.pct}%` }} title={`${x.l} ${x.pct}%`}>{x.pct >= 12 ? x.l : ''}</i>)}</div></div>
        ))}
        {r.aboveWords?.length ? <p className="ed-hint">Sõnad üle taseme {doc.meta?.level}: {r.aboveWords.map((w) => `${w.text} (${w.level})`).join(', ')}</p> : null}
        {r.aboveForms?.length ? <ul className="ed-eki__forms">{r.aboveForms.map((f, i) => <li key={i}><b>{f.text}</b> — {f.form} <small>{f.level}</small></li>)}</ul> : <p className="ed-hint is-ok">Grammatilised vormid sobivad tasemele {doc.meta?.level}.</p>}
        <p className="ed-hint">Allikas: Eesti Keele Instituut, „Õppeteksti hindamine” (Sõnaveeb).</p>
      </> : null}
    </div>
  );
}
