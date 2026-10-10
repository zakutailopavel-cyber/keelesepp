import { ArrowLeft, ArrowRight, Check, RotateCcw, Shuffle, Star, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildTest, checkAnswer, choices, learnedCount, learnStep, prompt, shuffle, startLearn } from './deckModel.js';

// The five ways to learn one deck (owner, 2026-10-10: like Quizlet). Each mode gets the deck, the direction
// ('back' = the Estonian word is shown, the meaning is asked; 'front' = the other way) and two callbacks:
// onResult(card, knew) for every answer (the student's own words move in their Leitner boxes), onMissed(cards) at the end.
export const STUDY_MODES = [
  { id: 'cards', label: 'Kaardid', hint: 'Pööra kaarti, sorteeri: tean / õpin veel' },
  { id: 'learn', label: 'Õpi', hint: 'Valikvastused, siis kirjutamine, kuni kõik on selge' },
  { id: 'write', label: 'Kirjuta', hint: 'Kirjuta vastus ise' },
  { id: 'match', label: 'Sobita', hint: 'Leia paarid võimalikult kiiresti' },
  { id: 'test', label: 'Test', hint: '10 küsimust, lõpus tulemus' },
];

function Done({ title, children, onAgain, onClose, missed = [], onAddMissed }) {
  return (
    <div className="vs-done" role="status">
      <strong>{title}</strong>
      {children}
      {missed.length ? <ul className="vs-missed">{missed.map((card) => <li key={card.id}><b>{card.front}</b> — {card.back}</li>)}</ul> : null}
      <div className="vs-row">
        {onAddMissed && missed.length ? <button type="button" className="vw-btn" onClick={() => onAddMissed(missed)}><Star size={15} /> Lisa raskemad minu sõnadesse</button> : null}
        <button type="button" className="vw-btn is-primary" onClick={onAgain}><RotateCcw size={15} /> Uuesti</button>
        <button type="button" className="vw-btn" onClick={onClose}>Vali teine viis</button>
      </div>
    </div>
  );
}

function Progress({ value, total, label }) {
  return <div className="vs-progress" aria-label={label}><i style={{ width: `${total ? Math.round((value / total) * 100) : 0}%` }} /><span>{value}/{total}</span></div>;
}

function CardsMode({ deck, direction, onResult, onClose, onAddMissed }) {
  const [order, setOrder] = useState(deck);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learning, setLearning] = useState([]);
  const card = order[index];
  const sort = (knew) => {
    onResult?.(card, knew);
    if (!knew) setLearning((current) => [...current, card]);
    setFlipped(false);
    setIndex(index + 1);
  };
  if (!card) {
    return <Done title={`Läbi! Tean ${order.length - learning.length}, õpin veel ${learning.length}.`} missed={learning} onAddMissed={onAddMissed} onClose={onClose}
      onAgain={() => { setOrder(learning.length ? learning : deck); setIndex(0); setLearning([]); }} />;
  }
  const side = prompt(card, direction);
  return (
    <div className="vs-mode">
      <Progress value={index} total={order.length} label="Kaardid" />
      <button type="button" className={`vs-card ${flipped ? 'is-flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-label={flipped ? `Vastus: ${side.answer}` : `Küsimus: ${side.ask}. Vajuta, et pöörata`}>
        <span>{flipped ? side.answer : side.ask}</span>
        {flipped && card.hint ? <small>{card.hint}</small> : null}
        <em>{flipped ? 'vastus' : 'vajuta, et pöörata'}</em>
      </button>
      <div className="vs-row">
        <button type="button" className="vw-btn" disabled={!index} onClick={() => { setIndex(index - 1); setFlipped(false); }} aria-label="Eelmine kaart"><ArrowLeft size={16} /></button>
        <button type="button" className="vw-btn is-warn" onClick={() => sort(false)}><X size={15} /> Õpin veel</button>
        <button type="button" className="vw-btn is-primary" onClick={() => sort(true)}><Check size={15} /> Tean</button>
        <button type="button" className="vw-btn" onClick={() => { setOrder(shuffle(order.slice(index)).concat()); setIndex(0); setFlipped(false); }} aria-label="Sega kaardid"><Shuffle size={16} /></button>
      </div>
    </div>
  );
}

function AnswerField({ onSubmit, disabled }) {
  const [value, setValue] = useState('');
  const field = useRef(null);
  useEffect(() => { if (!disabled) field.current?.focus(); }, [disabled]);
  return (
    <form className="vs-write" onSubmit={(event) => { event.preventDefault(); if (value.trim()) { onSubmit(value); setValue(''); } }}>
      <input ref={field} aria-label="Sinu vastus" value={value} disabled={disabled} onChange={(event) => setValue(event.target.value)} placeholder="Kirjuta vastus…" autoComplete="off" spellCheck="false" />
      <button type="submit" className="vw-btn is-primary" disabled={disabled || !value.trim()}>Kontrolli</button>
    </form>
  );
}

function Feedback({ result, answer, onNext, onOverride }) {
  if (!result) return null;
  return (
    <div className={`vs-feedback is-${result}`} role="status">
      <span>{result === 'right' ? 'Õige!' : result === 'almost' ? <>Peaaegu! Õigesti: <b>{answer}</b></> : <>Õige vastus: <b>{answer}</b></>}</span>
      <div className="vs-row">
        {result === 'wrong' && onOverride ? <button type="button" className="vw-btn" onClick={onOverride}>Mul oli õigus</button> : null}
        <button type="button" className="vw-btn is-primary" onClick={onNext} autoFocus>Edasi <ArrowRight size={15} /></button>
      </div>
    </div>
  );
}

function LearnMode({ deck, direction, onResult, onClose, onAddMissed }) {
  const [state, setState] = useState(() => startLearn(deck));
  const [answer, setAnswer] = useState(null);
  const byId = useMemo(() => new Map(deck.map((card) => [card.id, card])), [deck]);
  const [missed, setMissed] = useState([]);
  const cardId = state.queue[0];
  const card = byId.get(cardId);
  const options = useMemo(() => (card && state.level[card.id] === 0 && deck.length >= 4 ? choices(card, deck, direction) : null), [card, deck, direction, state.level]);
  if (!card) return <Done title={`Kõik ${deck.length} sõna õpitud!`} missed={missed} onAddMissed={onAddMissed} onClose={onClose} onAgain={() => { setState(startLearn(deck)); setMissed([]); }}><p>Vigu kokku: {state.mistakes}</p></Done>;
  const side = prompt(card, direction);
  const answerWith = (correct) => {
    setAnswer(correct ? 'right' : 'wrong');
    onResult?.(card, correct);
    if (!correct && !missed.some((item) => item.id === card.id)) setMissed((current) => [...current, card]);
  };
  const next = (correct) => { setState(learnStep(state, card.id, correct)); setAnswer(null); };
  return (
    <div className="vs-mode">
      <Progress value={learnedCount(state)} total={deck.length} label="Õpitud" />
      <div className="vs-question"><small>{options ? 'Vali õige vastus' : 'Kirjuta vastus'}</small><strong>{side.ask}</strong></div>
      {options ? (
        <div className="vs-choices">{options.map((option) => (
          <button type="button" key={option} disabled={Boolean(answer)} className={answer && option === side.answer ? 'is-right' : ''} onClick={() => answerWith(option === side.answer)}>{option}</button>
        ))}</div>
      ) : <AnswerField disabled={Boolean(answer)} onSubmit={(value) => { const result = checkAnswer(value, side.answer); setAnswer(result); onResult?.(card, result !== 'wrong'); if (result === 'wrong' && !missed.some((item) => item.id === card.id)) setMissed((current) => [...current, card]); }} />}
      <Feedback result={answer} answer={side.answer} onNext={() => next(answer !== 'wrong')} onOverride={() => next(true)} />
    </div>
  );
}

function WriteMode({ deck, direction, onResult, onClose, onAddMissed }) {
  const [order, setOrder] = useState(() => shuffle(deck));
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [missed, setMissed] = useState([]);
  const card = order[index];
  if (!card) return <Done title={`Valmis! Õigesti ${order.length - missed.length}/${order.length}.`} missed={missed} onAddMissed={onAddMissed} onClose={onClose} onAgain={() => { setOrder(shuffle(missed.length ? missed : deck)); setIndex(0); setMissed([]); }} />;
  const side = prompt(card, direction);
  const next = (correct) => {
    if (!correct && !missed.some((item) => item.id === card.id)) setMissed((current) => [...current, card]);
    setResult(null);
    setIndex(index + 1);
  };
  return (
    <div className="vs-mode">
      <Progress value={index} total={order.length} label="Kirjuta" />
      <div className="vs-question"><small>Kirjuta vastus</small><strong>{side.ask}</strong></div>
      <AnswerField disabled={Boolean(result)} onSubmit={(value) => { const checked = checkAnswer(value, side.answer); setResult(checked); onResult?.(card, checked !== 'wrong'); }} />
      <Feedback result={result} answer={side.answer} onNext={() => next(result !== 'wrong')} onOverride={() => next(true)} />
    </div>
  );
}

const MATCH_SIZE = 6;
function MatchMode({ deck, direction, onClose }) {
  const newRound = () => {
    const cards = shuffle(deck).slice(0, MATCH_SIZE);
    return { cards, tiles: shuffle(cards.flatMap((card) => [{ id: `${card.id}:q`, card, text: prompt(card, direction).ask }, { id: `${card.id}:a`, card, text: prompt(card, direction).answer }])), started: Date.now() };
  };
  const [round, setRound] = useState(newRound);
  const [picked, setPicked] = useState(null);
  const [done, setDone] = useState([]);
  const [wrong, setWrong] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const finished = done.length === round.cards.length;
  useEffect(() => {
    if (finished) return undefined;
    const timer = globalThis.setInterval(() => setNow(Date.now()), 200);
    return () => globalThis.clearInterval(timer);
  }, [finished]);
  const seconds = ((finished ? round.finishedAt || now : now) - round.started) / 1000;
  const pick = (tile) => {
    if (done.includes(tile.card.id)) return;
    if (!picked) { setPicked(tile); return; }
    if (picked.id === tile.id) { setPicked(null); return; }
    if (picked.card.id === tile.card.id) {
      const next = [...done, tile.card.id];
      setDone(next);
      if (next.length === round.cards.length) setRound((current) => ({ ...current, finishedAt: Date.now() }));
    } else {
      setWrong(tile.id);
      globalThis.setTimeout(() => setWrong(''), 500);
    }
    setPicked(null);
  };
  if (finished) {
    return <Done title={`Kõik paarid leitud ${seconds.toFixed(1)} sekundiga!`} onClose={onClose} onAgain={() => { setRound(newRound()); setDone([]); setPicked(null); setNow(Date.now()); }} />;
  }
  return (
    <div className="vs-mode">
      <div className="vs-timer" aria-live="off">{seconds.toFixed(1)} s</div>
      <div className="vs-match">{round.tiles.map((tile) => (
        <button type="button" key={tile.id} disabled={done.includes(tile.card.id)} aria-pressed={picked?.id === tile.id}
          className={`${done.includes(tile.card.id) ? 'is-done' : ''} ${picked?.id === tile.id ? 'is-picked' : ''} ${wrong === tile.id ? 'is-wrong' : ''}`}
          onClick={() => pick(tile)}>{tile.text}</button>
      ))}</div>
    </div>
  );
}

function TestMode({ deck, direction, onResult, onClose, onAddMissed }) {
  const [test, setTest] = useState(() => buildTest(deck, { direction }));
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const grade = (question, value) => {
    const expected = prompt(question.card, direction).answer;
    if (question.kind === 'truefalse') return value === question.truth;
    if (question.kind === 'choice') return value === expected;
    return checkAnswer(value, expected) !== 'wrong';
  };
  const score = test.filter((question, index) => grade(question, answers[index])).length;
  const missed = test.filter((question, index) => !grade(question, answers[index])).map((question) => question.card);
  const submit = () => {
    test.forEach((question, index) => onResult?.(question.card, grade(question, answers[index])));
    setSubmitted(true);
  };
  return (
    <div className="vs-mode vs-test">
      {submitted ? <Done title={`Tulemus: ${score}/${test.length} (${Math.round((score / test.length) * 100)}%)`} missed={missed} onAddMissed={onAddMissed} onClose={onClose}
        onAgain={() => { setTest(buildTest(deck, { direction })); setAnswers({}); setSubmitted(false); }} /> : null}
      <ol>
        {test.map((question, index) => {
          const side = prompt(question.card, direction);
          const set = (value) => !submitted && setAnswers((current) => ({ ...current, [index]: value }));
          const state = submitted ? (grade(question, answers[index]) ? 'is-right' : 'is-wrong') : '';
          return (
            <li key={`${question.card.id}-${index}`} className={state}>
              <strong>{side.ask}</strong>
              {question.kind === 'choice' ? <div className="vs-choices">{question.options.map((option) => <button type="button" key={option} aria-pressed={answers[index] === option} className={submitted && option === side.answer ? 'is-right' : ''} onClick={() => set(option)}>{option}</button>)}</div> : null}
              {question.kind === 'write' ? <input aria-label={`Vastus: ${side.ask}`} value={answers[index] || ''} disabled={submitted} onChange={(event) => set(event.target.value)} placeholder="Kirjuta vastus…" autoComplete="off" spellCheck="false" /> : null}
              {question.kind === 'truefalse' ? <div className="vs-tf"><span>= {question.shownAnswer}?</span>
                <button type="button" aria-pressed={answers[index] === true} onClick={() => set(true)}>Õige</button>
                <button type="button" aria-pressed={answers[index] === false} onClick={() => set(false)}>Vale</button></div> : null}
              {submitted && !grade(question, answers[index]) ? <small>Õige vastus: <b>{side.answer}</b></small> : null}
            </li>
          );
        })}
      </ol>
      {submitted ? null : <button type="button" className="vw-btn is-primary" onClick={submit}>Vaata tulemust</button>}
    </div>
  );
}

const MODES = { cards: CardsMode, learn: LearnMode, write: WriteMode, match: MatchMode, test: TestMode };

/** One deck: choose how to learn it, the direction, then the mode itself. */
export default function StudySession({ deck, title, onResult, onAddMissed, onBack }) {
  const [mode, setMode] = useState('');
  const [direction, setDirection] = useState('back');
  const Mode = MODES[mode];
  return (
    <section className="vs-session" aria-label={`Õppimine: ${title}`}>
      <header className="vs-head">
        <button type="button" className="vw-btn" onClick={mode ? () => setMode('') : onBack}><ArrowLeft size={15} /> {mode ? 'Viisid' : 'Kõik kogud'}</button>
        <div><strong>{title}</strong><small>{deck.length} kaarti</small></div>
        <label className="vs-direction"><span>Küsin</span>
          <select value={direction} onChange={(event) => setDirection(event.target.value)} aria-label="Küsimuse suund">
            <option value="back">eesti keeles → tähendus</option>
            <option value="front">tähendus → eesti keeles</option>
          </select>
        </label>
      </header>
      {Mode ? <Mode key={`${mode}-${direction}`} deck={deck} direction={direction} onResult={onResult} onAddMissed={onAddMissed} onClose={() => setMode('')} /> : (
        <div className="vs-modes" role="group" aria-label="Õppimise viisid">
          {STUDY_MODES.map((item) => (
            <button type="button" key={item.id} className="vs-mode-card" disabled={item.id === 'match' && deck.length < 2} onClick={() => setMode(item.id)}>
              <strong>{item.label}</strong><small>{item.hint}</small>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
