import { Check, ChevronRight, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { petReact } from '../pet/petEvents.js';
import { checkTask } from './reviewModel.js';
import './selfStudy.css';

// One review drill, one task per screen with big buttons (owner 2026-10-12): used by „Minu vead” (and the older
// lesson review). Tasks come from reviewModel.buildReview.
export default function ReviewDrill({ title, tasks, onFinish, onAgain, onClose }) {
  const [index, setIndex] = useState(0);
  const [given, setGiven] = useState('');
  const [pair, setPair] = useState(['', '']);
  const [picked, setPicked] = useState([]);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const task = tasks[index];
  const finished = index >= tasks.length;

  useEffect(() => {
    if (!finished) return;
    const pct = Math.round((score / Math.max(1, tasks.length)) * 100);
    onFinish(pct);
    petReact('done');
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) {
    const pct = Math.round((score / Math.max(1, tasks.length)) * 100);
    return <section className="ss-drill ss-drill--end">
      <span className="ss-drill__big">{pct >= 80 ? '🎉' : '💪'}</span>
      <h2>{score}/{tasks.length} õigesti</h2>
      <p>{pct >= 80 ? 'Väga hea! Tunni teema on kindel.' : 'Hea algus. Korda veel kord, siis läheb kergemini.'}</p>
      <div className="ss-drill__actions"><button type="button" className="ss-btn ss-btn--ghost" onClick={onAgain}><RotateCcw size={15} /> Uuesti</button><button type="button" className="ss-btn" onClick={onClose}>Valmis</button></div>
    </section>;
  }

  const answer = (value) => {
    if (result) return;
    const verdict = checkTask(task, value);
    setResult(verdict);
    if (verdict !== 'wrong') setScore((current) => current + 1);
    petReact(verdict === 'wrong' ? 'wrong' : 'correct');
  };
  const next = () => { setIndex((current) => current + 1); setGiven(''); setPair(['', '']); setPicked([]); setResult(null); };
  const shown = Array.isArray(task.answer) ? task.answer.join(', ') : task.answer;
  const LABEL = { meaning: 'Mida see tähendab?', recall: 'Kirjuta eesti keeles', forms: 'Kirjuta omastav ja osastav', fix: 'Milline lause on õige?', order: 'Pane lause kokku' };

  return <section className="ss-drill" aria-label={title}>
    <div className="ss-drill__top"><strong>{title}</strong><span>{index + 1}/{tasks.length}</span></div>
    <div className="ss-drill__bar"><i style={{ width: `${(index / tasks.length) * 100}%` }} /></div>
    <p className="ss-drill__label">{LABEL[task.kind]}</p>
    {task.ask ? <h2 className="ss-drill__ask">{task.ask}{task.hint ? <small> — {task.hint}</small> : null}</h2> : null}

    {task.kind === 'meaning' || task.kind === 'fix' ? <div className="ss-options">{task.options.map((option) => {
      const state = result ? (option === task.answer ? 'is-right' : option === given ? 'is-wrong' : '') : '';
      return <button type="button" key={option} className={`ss-option ${state}`} disabled={Boolean(result)} onClick={() => { setGiven(option); answer(option); }}>{option}</button>;
    })}</div> : null}

    {task.kind === 'recall' ? <form className="ss-write" onSubmit={(event) => { event.preventDefault(); answer(given); }}>
      <input aria-label="Vastus" autoFocus value={given} disabled={Boolean(result)} onChange={(event) => setGiven(event.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
      {!result ? <button type="submit" className="ss-btn" disabled={!given.trim()}>Kontrolli</button> : null}
    </form> : null}

    {task.kind === 'forms' ? <form className="ss-write ss-write--two" onSubmit={(event) => { event.preventDefault(); answer(pair); }}>
      <label>Omastav (kelle? mille?)<input aria-label="Omastav" autoFocus value={pair[0]} disabled={Boolean(result)} onChange={(event) => setPair([event.target.value, pair[1]])} autoCapitalize="off" spellCheck={false} /></label>
      <label>Osastav (keda? mida?)<input aria-label="Osastav" value={pair[1]} disabled={Boolean(result)} onChange={(event) => setPair([pair[0], event.target.value])} autoCapitalize="off" spellCheck={false} /></label>
      {!result ? <button type="submit" className="ss-btn" disabled={!pair[0].trim() || !pair[1].trim()}>Kontrolli</button> : null}
    </form> : null}

    {task.kind === 'order' ? <div className="ss-order">
      <p className="ss-order__line">{picked.map((i) => task.pieces[i]).join(' ') || '…'}</p>
      <div className="ss-options ss-options--chips">{task.pieces.map((piece, i) => <button type="button" key={`${piece}-${i}`} className="ss-option" disabled={picked.includes(i) || Boolean(result)} onClick={() => setPicked([...picked, i])}>{piece}</button>)}</div>
      {!result ? <div className="ss-drill__actions"><button type="button" className="ss-btn ss-btn--ghost" onClick={() => setPicked([])} disabled={!picked.length}>Tühjenda</button><button type="button" className="ss-btn" disabled={picked.length !== task.pieces.length} onClick={() => answer(picked.map((i) => task.pieces[i]).join(' '))}>Kontrolli</button></div> : null}
    </div> : null}

    {result ? <div className={`ss-result is-${result}`} role="status">
      {result === 'wrong' ? <X size={18} /> : <Check size={18} />}
      <span>{result === 'right' ? 'Õige!' : result === 'almost' ? `Peaaegu: ${shown}` : `Õige vastus: ${shown}`}</span>
      <button type="button" className="ss-btn" autoFocus onClick={next}>{index + 1 < tasks.length ? 'Edasi' : 'Lõpeta'} <ChevronRight size={15} /></button>
    </div> : null}
  </section>;
}

