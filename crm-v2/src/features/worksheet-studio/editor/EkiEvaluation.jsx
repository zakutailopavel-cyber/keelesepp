import { Gauge } from 'lucide-react';
import { sheetText } from '../didactics/sheetText.js';
import { useMacRequest } from './useMacRequest.js';
import LevelBars from './LevelBars.jsx';

// „Hinda EKI-ga”: EKI's text evaluation (Sõnaveeb „Õppeteksti hindamine”) of everything the learner reads on the sheet —
// the level of every word and every grammatical form, and what lies above the sheet's level. EKI answers only Estonian
// addresses, so the school Mac asks it (aiRequests kind „evaluate”).
export default function EkiEvaluation({ doc, service }) {
  const { state, run } = useMacRequest('evaluate', ...(service ? [service] : []));
  const start = () => {
    const text = sheetText(doc);
    if (text.split(' ').length < 5) return;
    run(text, doc.meta?.level || 'A2');
  };
  const r = state.result;
  const empty = sheetText(doc).split(' ').length < 5;
  return (
    <div className="ed-eki">
      <span className="ed-label"><Gauge size={14} aria-hidden="true" /> Teksti tasemekohasus (EKI)</span>
      <button type="button" className="ed-btn ghost" disabled={state.phase === 'waiting' || empty} onClick={start}>{state.phase === 'waiting' ? 'Hindan…' : 'Hinda EKI-ga'}</button>
      {empty ? <p className="ed-hint">Lehel on hindamiseks liiga vähe teksti.</p> : null}
      {state.phase === 'waiting' && state.slow ? <p className="ed-hint" role="status">Kooli Mac ei vasta veel. Kas see on sees?</p> : null}
      {state.error ? <p className="ed-hint is-error" role="alert">{state.error}</p> : null}
      {r ? <>
        <p className="ed-hint">{r.words} sõna{r.unknownWords ? ` · ${r.unknownWords} loendites puudu` : ''}</p>
        <LevelBars rows={[['Sõnad', r.wordLevels], ['Vormid', r.formLevels]]} />
        {r.aboveWords?.length ? <p className="ed-hint">Sõnad üle taseme {doc.meta?.level}: {r.aboveWords.map((w) => `${w.text} (${w.level})`).join(', ')}</p> : null}
        {r.aboveForms?.length ? <ul className="ed-eki__forms">{r.aboveForms.map((f, i) => <li key={i}><b>{f.text}</b> — {f.form} <small>{f.level}</small></li>)}</ul> : <p className="ed-hint is-ok">Grammatilised vormid sobivad tasemele {doc.meta?.level}.</p>}
        <p className="ed-hint">Allikas: Eesti Keele Instituut, „Õppeteksti hindamine” (Sõnaveeb).</p>
      </> : null}
    </div>
  );
}
