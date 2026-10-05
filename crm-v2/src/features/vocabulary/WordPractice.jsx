import { useState } from 'react';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { formQuestion, practiceOrder, sameForm } from './wordsModel.js';
import './vocabulary.css';

/** Flashcards over the words that are due: word → „Näita” → translation and example → „Teadsin” / „Ei teadnud”. */
export default function WordPractice({ words, service = studentWordsService, onClose }) {
  // the deck is fixed when practice starts, so answers do not reshuffle it
  const [deck] = useState(() => practiceOrder(words));
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(false);
  const [score, setScore] = useState({ knew: 0, again: 0 });
  const [error, setError] = useState('');
  const card = deck[index];
  // every other review of a word with forms asks one of its forms („kass — ainsuse osastav?”)
  const question = card ? formQuestion(card) : null;
  const [typed, setTyped] = useState('');
  const [checked, setChecked] = useState(null);

  const answer = async (knew) => {
    setError('');
    try {
      await service.review(card, knew);
      setScore((current) => (knew ? { ...current, knew: current.knew + 1 } : { ...current, again: current.again + 1 }));
      setShown(false);
      setTyped('');
      setChecked(null);
      setIndex(index + 1);
    } catch (next) {
      setError(next?.message || 'Vastust ei saanud salvestada.');
    }
  };

  if (!deck.length) return <div className="vw-practice"><p>Täna pole ühtegi sõna kordamiseks. Tubli!</p>{onClose ? <button type="button" className="vw-btn" onClick={onClose}>Sulge</button> : null}</div>;
  if (!card) {
    return <div className="vw-practice" role="status">
      <p><strong>Valmis!</strong> Teadsid {score.knew} sõna, kordamiseks jäi {score.again}.</p>
      {onClose ? <button type="button" className="vw-btn" onClick={onClose}>Sulge</button> : null}
    </div>;
  }
  return (
    <div className="vw-practice" aria-label="Sõnade kordamine">
      <small className="vw-muted">{index + 1} / {deck.length}</small>
      {question ? <div className="vw-card" aria-live="polite">
        <strong>{card.word}</strong>
        <span>{question.label}?</span>
        {checked === null ? <form className="vw-formcheck" onSubmit={(event) => { event.preventDefault(); setChecked(sameForm(typed, question.value)); }}>
          <input aria-label={`Vorm: ${question.label}`} value={typed} autoComplete="off" autoCapitalize="none" onChange={(event) => setTyped(event.target.value)} />
          <button type="submit" className="vw-btn is-primary" disabled={!typed.trim()}>Kontrolli</button>
        </form> : <span className={checked ? 'vw-right' : 'vw-wrong'} role="status">{checked ? 'Õige!' : `Õige vorm: ${question.value}`}</span>}
        {checked !== null && card.forms ? <small>{card.forms}</small> : null}
      </div> : <div className="vw-card" aria-live="polite">
        <strong>{card.word}</strong>
        {shown ? <>{card.translation ? <span>{card.translation}</span> : null}{card.forms ? <small className="vw-forms">{card.forms}</small> : null}{card.example ? <small>{card.example}</small> : null}</> : null}
      </div>}
      {error ? <p className="vw-error" role="alert">{error}</p> : null}
      {question ? <div className="vw-actions">{checked !== null ? <button type="button" className="vw-btn is-primary" onClick={() => answer(checked)}>Edasi</button> : null}</div> : <div className="vw-actions">
        {shown ? <>
          <button type="button" className="vw-btn" onClick={() => answer(false)}>Ei teadnud</button>
          <button type="button" className="vw-btn is-primary" onClick={() => answer(true)}>Teadsin</button>
        </> : <button type="button" className="vw-btn is-primary" onClick={() => setShown(true)}>Näita</button>}
      </div>}
    </div>
  );
}
