import { Fragment, useEffect, useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { fixParts } from '../homework/LearnerTextAnalysis.jsx';
import { useMacRequest } from './editor/useMacRequest.js';

export const ANALYSIS_MIN_WORDS = 5;
export const wordCount = (text) => String(text || '').split(/\s+/).filter(Boolean).length;

// „Analüüs” in the mark composer (owner 2026-10-23, the live lesson): the selected student text goes through the same
// check as in the homework review (school Mac: TartuNLP corrections + EKI levels); each correction becomes a „Viga”
// mark on its own words with one click.
export default function TextAnalysisPane({ text, level = 'A2', onMark, useRequest = useMacRequest }) {
  const { state, run } = useRequest('learnerText');
  const [done, setDone] = useState(() => new Set());
  const [busy, setBusy] = useState(-1);
  const [error, setError] = useState('');
  useEffect(() => { run(text, level); }, [text, level]); // eslint-disable-line react-hooks/exhaustive-deps
  const result = state.result;
  const corrections = result?.corrections || [];
  const mark = async (indexes) => {
    setError('');
    for (const index of indexes) {
      setBusy(index);
      try { await onMark(corrections[index]); setDone((current) => new Set(current).add(index)); } catch (caught) { setError(caught?.message || 'Märkust ei saanud lisada.'); break; }
    }
    setBusy(-1);
  };
  const open = corrections.map((_, index) => index).filter((index) => !done.has(index));

  return <div className="sa-analysis" aria-live="polite">
    {state.phase === 'waiting' ? <p className="sa-muted"><Loader2 size={14} className="spin" aria-hidden="true" /> Analüüsin teksti…{state.slow ? ' Kooli Mac ei vasta — kas see on sees?' : ''}</p> : null}
    {state.error ? <p className="sa-error" role="alert">{state.error}</p> : null}
    {result ? <>
      <p className="sa-muted">{result.sentences} lauset · {corrections.length ? `${corrections.length} parandust` : 'vigu ei leitud'}</p>
      {corrections.length ? <ol className="sa-fixes">{corrections.map((c, index) => <li key={index}>
        <span>{fixParts(c.said, c.corrected).map((w, k) => <Fragment key={k}>{k ? ' ' : ''}{w.type === 'del' ? <s>{w.text}</s> : w.type === 'ins' ? <ins>{w.text}</ins> : w.text}</Fragment>)}</span>
        {done.has(index) ? <b className="sa-done"><Check size={13} aria-hidden="true" /> Märgitud</b>
          : <button type="button" aria-label={`Märgi veaks: ${c.said}`} disabled={busy >= 0} onClick={() => mark([index])}>{busy === index ? '…' : 'Märgi'}</button>}
      </li>)}</ol> : null}
      {result.evaluation?.aboveWords?.length ? <p className="sa-muted">Üle taseme {level}: {result.evaluation.aboveWords.slice(0, 8).map((w) => `${w.text} (${w.level})`).join(', ')}</p> : null}
      {open.length > 1 ? <button type="button" className="sa-all" disabled={busy >= 0} onClick={() => mark(open)}>Märgi kõik vigadeks ({open.length})</button> : null}
      <p className="sa-muted">Kontrolli üle: Tartu mudel on abiks, mitte lõplik otsus.</p>
    </> : null}
    {error ? <p className="sa-error" role="alert">{error}</p> : null}
  </div>;
}
