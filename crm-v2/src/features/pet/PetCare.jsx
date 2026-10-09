import { Gamepad2, Moon, Utensils } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import WordPractice from '../vocabulary/WordPractice.jsx';
import { FEED_WORDS, LOW_NEED, feedingWords, gameRounds } from './petCare.js';

const NEEDS = [
  { key: 'food', label: 'Kõht', ru: 'Сытость: повтор слов', Icon: Utensils },
  { key: 'energy', label: 'Energia', ru: 'Энергия: домашние задания', Icon: Moon },
  { key: 'joy', label: 'Rõõm', ru: 'Радость: урок или игра со словами', Icon: Gamepad2 },
];

/** Word game: GAME_ROUNDS questions „word → translation”, nothing is written to the word list. */
export function PetGame({ words, onDone, onClose }) {
  const [rounds] = useState(() => gameRounds(words));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState('');
  const [right, setRight] = useState(0);
  const round = rounds[index];
  if (!round) {
    return <div className="vw-practice" role="status">
      <p><strong>Mäng läbi!</strong> Õigeid vastuseid: {right} / {rounds.length}.</p>
      <button type="button" className="vw-btn" onClick={onClose}>Sulge</button>
    </div>;
  }
  const next = () => {
    const ok = picked === round.answer;
    const total = right + (ok ? 1 : 0);
    setRight(total);
    setPicked('');
    setIndex(index + 1);
    if (index + 1 === rounds.length) onDone?.(total);
  };
  return (
    <div className="vw-practice pet-game" aria-label="Sõnamäng">
      <small className="vw-muted">{index + 1} / {rounds.length} · Mis see on?</small>
      <div className="vw-card"><strong>{round.word}</strong></div>
      <div className="pet-game__options" role="group" aria-label="Vastused">
        {round.options.map((option) => {
          const state = picked ? (option === round.answer ? 'is-right' : option === picked ? 'is-wrong' : '') : '';
          return <button type="button" key={option} className={`vw-btn ${state}`} disabled={Boolean(picked)} onClick={() => setPicked(option)}>{option}</button>;
        })}
      </div>
      {picked ? <div className="vw-actions"><span role="status" className={picked === round.answer ? 'vw-right' : 'vw-wrong'}>{picked === round.answer ? 'Õige!' : `Õige: ${round.answer}`}</span><button type="button" className="vw-btn is-primary" onClick={next}>Edasi</button></div> : null}
    </div>
  );
}

/** The three needs with their care actions (read-only for parents and the staff preview). */
export default function PetCare({ needs, words, wordsService, readOnly = false, onPlayed }) {
  const [mode, setMode] = useState('');
  const [feed, setFeed] = useState([]);
  const close = () => setMode('');
  return (
    <div className="pet-care">
      <div className="pet-needs">
        {NEEDS.map(({ key, label, ru, Icon }) => (
          <div key={key} className={`pet-need ${needs[key] < LOW_NEED ? 'is-low' : ''}`} title={ru}>
            <span><Icon size={14} aria-hidden="true" /> {label}</span>
            <div className="pet-need__bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={needs[key]}><i style={{ width: `${needs[key]}%` }} /></div>
          </div>
        ))}
      </div>
      {readOnly ? null : <>
        {mode === 'feed' ? <WordPractice words={feed} service={wordsService} onClose={close} />
          : mode === 'play' ? <PetGame words={words} onDone={onPlayed} onClose={close} />
          : <div className="pet-care__actions">
            <button type="button" className="pet-btn" disabled={!needs.dueWords} onClick={() => { setFeed(feedingWords(words)); setMode('feed'); }} title={needs.dueWords ? '' : 'Kõik sõnad on korratud'}>
              <Utensils size={14} aria-hidden="true" /> Toida ({Math.min(FEED_WORDS, needs.dueWords)} sõna)
            </button>
            {needs.openHomework ? <Link className="pet-btn" to="/homework"><Moon size={14} aria-hidden="true" /> Kodutöö ({needs.openHomework})</Link> : null}
            {needs.canPlay ? <button type="button" className="pet-btn" onClick={() => setMode('play')}><Gamepad2 size={14} aria-hidden="true" /> Mängi</button> : null}
          </div>}
      </>}
    </div>
  );
}
