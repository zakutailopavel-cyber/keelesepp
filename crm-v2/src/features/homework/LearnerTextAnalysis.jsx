import { Fragment } from 'react';
import { SpellCheck } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { wordDiff } from '../lesson-recording/lessonTimeline.js';
import { useMacRequest } from '../worksheet-studio/editor/useMacRequest.js';
import LevelBars from '../worksheet-studio/editor/LevelBars.jsx';
import '../worksheet-studio/worksheetStudio.css';

const words = (t) => String(t || '').split(/\s+/).filter(Boolean).length;

// The learner's written answers of a worksheet (writing, letters): structured sheets (blocks) and older sheets
// (writing fields, annotations.js). Only texts of at least 5 words.
export function learnerTexts({ worksheetDoc = null, answers = {}, fields = [] } = {}) {
  const out = [];
  for (const b of worksheetDoc?.blocks || []) {
    if (b.type !== 'writing' && b.type !== 'guidedletter') continue;
    const text = String(answers[`${b.id}:text`] || '').trim();
    if (words(text) >= 5) out.push({ id: b.id, label: b.data?.title || 'Kirjalik vastus', text });
  }
  for (const f of fields) if (words(f.text) >= 5 && !out.some((x) => x.id === f.blockId)) out.push({ id: f.blockId, label: f.label, text: f.text });
  return out;
}

// One answer: TartuNLP's corrections per sentence and EKI's levels of the words and forms the learner used — what to
// fix, and what he can already produce. The teacher may copy the corrections into the feedback.
function OneText({ item, level, onFeedback }) {
  const { state, run } = useMacRequest('learnerText');
  const r = state.result;
  const lines = (r?.corrections || []).map((c) => `„${c.said}” → „${c.corrected}”`);
  return (
    <div className="learner-text">
      <div className="learner-text__head"><b>{item.label}</b><small>{words(item.text)} sõna</small>
        <Button variant="secondary" loading={state.phase === 'waiting'} onClick={() => run(item.text, level)}><SpellCheck size={15} aria-hidden="true" /> Analüüsi teksti</Button></div>
      {state.phase === 'waiting' && state.slow ? <p className="form-hint" role="status">Kooli Mac ei vasta veel. Kas see on sees?</p> : null}
      {state.error ? <p className="form-error" role="alert">{state.error}</p> : null}
      {r ? <div className="learner-text__result">
        <p className="form-hint">{r.sentences} lauset · {r.corrections.length ? `${r.corrections.length} parandust (Tartu mudel)` : 'vigu ei leitud (Tartu mudel)'}</p>
        {r.corrections.length ? <ol className="learner-text__fixes">{r.corrections.map((c, i) => (
          <li key={i}>{wordDiff(c.said, c.corrected).map((w, k) => <Fragment key={k}>{k ? ' ' : ''}{w.type === 'del' ? <s>{w.text}</s> : w.type === 'ins' ? <ins>{w.text}</ins> : w.text}</Fragment>)}</li>
        ))}</ol> : null}
        {r.evaluation ? <div className="ws-studio learner-text__eki">
          <LevelBars rows={[['Sõnad', r.evaluation.wordLevels], ['Vormid', r.evaluation.formLevels]]} />
          {r.evaluation.topForms?.length ? <p className="form-hint">Kasutab juba: {r.evaluation.topForms.slice(0, 5).map((f) => `${f.text} — ${f.form} (${f.level})`).join('; ')}</p> : null}
          {r.evaluation.aboveWords?.length ? <p className="form-hint">Sõnad üle taseme {level}: {r.evaluation.aboveWords.map((w) => `${w.text} (${w.level})`).join(', ')}</p> : null}
        </div> : <p className="form-hint">EKI tasemehinnang ei olnud praegu kättesaadav.</p>}
        {lines.length && onFeedback ? <Button variant="secondary" onClick={() => onFeedback(lines)}>Lisa parandused tagasisidesse</Button> : null}
        <p className="form-hint">Kontrolli üle: Tartu mudel ja EKI hinnang on abiks, mitte lõplik otsus.</p>
      </div> : null}
    </div>
  );
}

export default function LearnerTextAnalysis({ texts = [], level = 'A2', onFeedback }) {
  if (!texts.length) return null;
  return (
    <section className="learner-texts">
      <h3>Kirjutatud tekstid · Tartu mudel + EKI</h3>
      {texts.map((item) => <OneText key={item.id} item={item} level={level} onFeedback={onFeedback} />)}
    </section>
  );
}
