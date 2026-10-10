/* global setTimeout, clearTimeout */
import { useEffect, useRef, useState } from 'react';
import { petSvg } from './petArt.js';
import { GAMES, GAME_SIZE, gameRounds, sameSentence } from './petGames.js';
import './pet.css';

const TRUTH_SECONDS = 7;

function Pet({ kind, mood }) {
  return <span className="pg-pet" aria-hidden="true" dangerouslySetInnerHTML={{ __html: petSvg(kind, mood, 2) }} />;
}

function Finish({ kind, right, total, moves = 0, onAgain, onClose }) {
  return (
    <div className="pg-finish" role="status">
      <Pet kind={kind} mood={right >= total / 2 ? 'proud' : 'happy'} />
      <p><strong>{right >= total / 2 ? 'Tubli!' : 'Hea katse!'}</strong> {moves ? `Kõik ${total} paari leitud, käike: ${moves}.` : `Õigeid: ${right} / ${total}.`}</p>
      <div className="vw-actions"><button type="button" className="vw-btn is-primary" onClick={onAgain}>Mängi veel</button><button type="button" className="vw-btn" onClick={onClose}>Sulge</button></div>
    </div>
  );
}

// „Püüa sõna”: three words fall; click the one that fits before it lands
function CatchGame({ rounds, kind, onEnd }) {
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState(null); // { option, ok } | { missed: true }
  const round = rounds[i];
  const next = (ok) => {
    const total = right + (ok ? 1 : 0);
    setRight(total);
    setTimeout(() => { setPicked(null); if (i + 1 >= rounds.length) onEnd(total); else setI(i + 1); }, ok ? 900 : 1600);
  };
  const pick = (option) => { if (picked) return; const ok = option === round.answer; setPicked({ option, ok }); next(ok); };
  const landed = (option) => { if (picked || option !== round.answer) return; setPicked({ missed: true }); next(false); };
  return (
    <div className="pg-game" aria-label="Püüa sõna">
      <small className="vw-muted">{i + 1} / {rounds.length} · Püüa õige sõna, enne kui see maha kukub!</small>
      <p className="pg-task">{round.prompt ? round.prompt : <>{round.before} <span className="pg-gap">{picked?.ok ? round.answer : '___'}</span> {round.after}</>}</p>
      <div className="pg-sky" key={i}>
        {round.options.map((option, k) => {
          const state = picked ? (option === round.answer ? 'is-right' : option === picked.option ? 'is-wrong' : 'is-gone') : '';
          return (
            <button type="button" key={option} className={`pg-drop ${state}`} disabled={Boolean(picked)} style={{ left: `${8 + k * 31}%`, animationDuration: `${6 + k * 1.3}s`, animationDelay: `${k * 0.35}s` }}
              onClick={() => pick(option)} onAnimationEnd={() => landed(option)}>{option}</button>
          );
        })}
        <Pet kind={kind} mood={picked ? (picked.ok ? 'happy' : 'sad') : 'calm'} />
      </div>
      {picked ? <p role="status" className={picked.ok ? 'vw-right' : 'vw-wrong'}>{picked.ok ? 'Ämm! Õige!' : `Õige: ${round.answer}`}</p> : null}
    </div>
  );
}

// „Paarid”: memory cards
function PairsGame({ cards, onEnd }) {
  const [open, setOpen] = useState([]);
  const [found, setFound] = useState([]);
  const [moves, setMoves] = useState(0);
  const pairs = cards.length / 2;
  const flip = (card) => {
    if (open.length === 2 || open.includes(card.id) || found.includes(card.pair)) return;
    const now = [...open, card.id];
    setOpen(now);
    if (now.length < 2) return;
    setMoves(moves + 1);
    const [a, b] = now.map((id) => cards.find((c) => c.id === id));
    if (a.pair === b.pair) {
      const all = [...found, a.pair];
      setFound(all); setOpen([]);
      if (all.length === pairs) setTimeout(() => onEnd(pairs, moves + 1), 700);
    } else setTimeout(() => setOpen([]), 900);
  };
  return (
    <div className="pg-game" aria-label="Paarid">
      <small className="vw-muted">Leia paarid · käike: {moves}</small>
      <div className="pg-cards">
        {cards.map((card) => {
          const shown = open.includes(card.id) || found.includes(card.pair);
          return <button type="button" key={card.id} className={`pg-card ${shown ? 'is-open' : ''} ${found.includes(card.pair) ? 'is-found' : ''}`} aria-label={shown ? card.text : 'Kaart'} onClick={() => flip(card)}><span>{shown ? card.text : '?'}</span></button>;
        })}
      </div>
    </div>
  );
}

// „Lauseehitus”: tap the words in order
function OrderGame({ rounds, onEnd }) {
  const [i, setI] = useState(0);
  const [line, setLine] = useState([]);
  const [right, setRight] = useState(0);
  const [checked, setChecked] = useState(null);
  const round = rounds[i];
  const left = round.mixed.map((w, k) => ({ w, k })).filter((x) => !line.includes(x.k));
  const check = () => {
    const ok = sameSentence(line.map((k) => round.mixed[k]).join(' '), round.words.join(' '));
    setChecked(ok);
    const total = right + (ok ? 1 : 0);
    setRight(total);
    setTimeout(() => { setChecked(null); setLine([]); if (i + 1 >= rounds.length) onEnd(total); else setI(i + 1); }, ok ? 900 : 2200);
  };
  return (
    <div className="pg-game" aria-label="Lauseehitus">
      <small className="vw-muted">{i + 1} / {rounds.length} · Pane sõnad õigesse järjekorda.</small>
      <div className={`pg-line ${checked === true ? 'is-right' : checked === false ? 'is-wrong' : ''}`} aria-label="Sinu lause">
        {line.length ? line.map((k) => <button type="button" key={k} className="pg-chip" disabled={checked !== null} onClick={() => setLine(line.filter((x) => x !== k))}>{round.mixed[k]}</button>) : <span className="vw-muted">Vajuta sõnadele…</span>}
      </div>
      <div className="pg-chips">{left.map(({ w, k }) => <button type="button" key={k} className="pg-chip" disabled={checked !== null} onClick={() => setLine([...line, k])}>{w}</button>)}</div>
      {checked === false ? <p role="status" className="vw-wrong">Õige: {round.sentence}</p> : checked ? <p role="status" className="vw-right">Õige!</p> : null}
      <div className="vw-actions"><button type="button" className="vw-btn is-primary" disabled={left.length > 0 || checked !== null} onClick={check}>Kontrolli</button></div>
    </div>
  );
}

// „Kiire kontroll”: right or wrong before the bar runs out
function TruthGame({ rounds, kind, onEnd }) {
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [answer, setAnswer] = useState(null); // { ok, timeout }
  const timer = useRef(0);
  const round = rounds[i];
  const done = (ok, timeout = false) => {
    clearTimeout(timer.current);
    setAnswer({ ok, timeout });
    const total = right + (ok ? 1 : 0);
    setRight(total);
    setTimeout(() => { setAnswer(null); if (i + 1 >= rounds.length) onEnd(total); else setI(i + 1); }, ok ? 800 : 1800);
  };
  useEffect(() => {
    timer.current = setTimeout(() => done(false, true), TRUTH_SECONDS * 1000);
    return () => clearTimeout(timer.current);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps
  const say = (value) => { if (!answer) done(value === round.right); };
  return (
    <div className="pg-game" aria-label="Kiire kontroll">
      <small className="vw-muted">{i + 1} / {rounds.length} · Kas see on õige?</small>
      <div className="pg-timer" key={i}><i style={{ animationDuration: `${TRUTH_SECONDS}s`, animationPlayState: answer ? 'paused' : 'running' }} /></div>
      <div className="pg-truth"><Pet kind={kind} mood={answer ? (answer.ok ? 'happy' : 'sad') : 'calm'} /><p className="pg-task">{round.text}</p></div>
      <div className="vw-actions">
        <button type="button" className="vw-btn pg-yes" disabled={Boolean(answer)} onClick={() => say(true)}>Õige</button>
        <button type="button" className="vw-btn pg-no" disabled={Boolean(answer)} onClick={() => say(false)}>Vale</button>
      </div>
      {answer ? <p role="status" className={answer.ok ? 'vw-right' : 'vw-wrong'}>{answer.ok ? 'Jah!' : answer.timeout ? 'Aeg sai otsa!' : 'Ei!'}{!answer.ok && round.fix ? ` Õigesti: ${round.fix}` : ''}</p> : null}
    </div>
  );
}

/** Topic games: choose one of the learner's topics and a game; `onDone(score)` when a game is finished. */
export default function PetGames({ topics = [], kind = 'siil', onDone, onClose }) {
  const [topicId, setTopicId] = useState(topics[0]?.id || '');
  const [game, setGame] = useState('');
  const [rounds, setRounds] = useState([]);
  const [result, setResult] = useState(null);
  const [run, setRun] = useState(0);
  const topic = topics.find((t) => t.id === topicId) || topics[0];
  const start = (key) => { setGame(key); setRounds(gameRounds(topic, key)); setResult(null); setRun((n) => n + 1); };
  const end = (score, moves = 0) => { const total = game === 'pairs' ? rounds.length / 2 : rounds.length; setResult({ right: score, total, moves }); onDone?.(score); };

  if (!topic) return <div className="vw-practice"><p>Teemamängude jaoks pole veel töölehti. Kui õpetaja annab töölehe, saame mängida!</p><button type="button" className="vw-btn" onClick={onClose}>Sulge</button></div>;
  if (game && result) return <div className="vw-practice pet-games"><Finish kind={kind} {...result} onAgain={() => start(game)} onClose={() => { setGame(''); setResult(null); }} /></div>;
  if (game) {
    const props = { key: run, rounds, kind, onEnd: end };
    return (
      <div className="vw-practice pet-games">
        <div className="pg-head"><b>{GAMES.find((g) => g.key === game).label}</b><small>{topic.title}</small><button type="button" className="pet-link" onClick={() => setGame('')}>Tagasi</button></div>
        {game === 'catch' ? <CatchGame {...props} /> : game === 'pairs' ? <PairsGame key={run} cards={rounds} onEnd={end} /> : game === 'order' ? <OrderGame {...props} /> : <TruthGame {...props} />}
      </div>
    );
  }
  return (
    <div className="vw-practice pet-games" aria-label="Teemamängud">
      <p className="pg-intro">Mängime sinu teemadega! <small lang="ru">Играем по твоим темам из листов.</small></p>
      {topics.length > 1 ? <div className="pg-topics" role="radiogroup" aria-label="Teema">
        {topics.map((t) => <button type="button" role="radio" aria-checked={t.id === topic.id} key={t.id} className={`pg-topic ${t.id === topic.id ? 'is-on' : ''}`} onClick={() => setTopicId(t.id)}>{t.title}{t.level ? <small> · {t.level}</small> : null}</button>)}
      </div> : <p className="pg-one-topic">Teema: <b>{topic.title}</b></p>}
      <div className="pg-menu">
        {GAMES.filter((g) => topic.games.includes(g.key)).map((g) => (
          <button type="button" key={g.key} className={`pg-choice is-${g.key}`} onClick={() => start(g.key)}>
            <b>{g.label}</b><small lang="ru">{g.ru}</small><span className="vw-muted">{Math.min(GAME_SIZE[g.key], topic.items[g.key].length)} {g.key === 'pairs' ? 'paari' : 'ülesannet'}</span>
          </button>
        ))}
      </div>
      <div className="vw-actions"><button type="button" className="vw-btn" onClick={onClose}>Sulge</button></div>
    </div>
  );
}
