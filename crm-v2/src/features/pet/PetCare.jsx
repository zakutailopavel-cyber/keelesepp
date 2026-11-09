import { Gamepad2, Moon, Puzzle, SpellCheck, Utensils } from 'lucide-react';
import { Suspense, useState } from 'react';
import { Link } from 'react-router-dom';
import { lazyComponent } from '../../app/lazyComponent.js';
import FlashcardSession from '../vocabulary/FlashcardSession.jsx';
import { feedingCards, rateWord } from '../vocabulary/dailyReview.js';
import { ownSentenceItems, ownSentencePairs } from '../practice/engine/ownSentences.js';
import PetGames from './PetGames.jsx';
import { FEED_WORDS } from './petCare.js';

// the practice lesson (tiles, drag and drop) loads only when „Paranda” is opened
const PracticeLesson = lazyComponent(() => import('../practice/PracticeLesson.jsx'));

const NEEDS = [
  { key: 'food', label: 'Kõht', Icon: Utensils },
  { key: 'energy', label: 'Energia', Icon: Moon },
  { key: 'joy', label: 'Rõõm', Icon: Gamepad2 },
];

/**
 * The three needs with their care actions (read-only for parents and the staff preview). One card UI (owner 2026-11-09):
 * „Toida” is the same flashcards as „Sõnad” and „Täna” and moves the words on their schedule; „Paranda” is the same
 * practice lesson as „Täna”, made of his own wrong sentences (both sources). The topic games stay games.
 */
export default function PetCare({ needs, words, wordsService, readOnly = false, onPlayed, stats = [], topics = [], kind = 'siil', language = '' }) {
  const own = ownSentencePairs({ words, stats });
  const [mode, setMode] = useState('');
  const [feed, setFeed] = useState([]);
  const [fix, setFix] = useState([]);
  const close = () => setMode('');
  const played = () => { onPlayed?.(); };
  return (
    <div className="pet-care">
      <div className="pet-needs">
        {NEEDS.map(({ key, label, Icon }) => (
          <div key={key} className="pet-need">
            <span><Icon size={14} aria-hidden="true" /> {label}</span>
            <div className="pet-need__bar" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={needs[key]}><i style={{ width: `${needs[key]}%` }} /></div>
          </div>
        ))}
      </div>
      {readOnly ? null : <>
        {mode === 'feed' ? <FlashcardSession cards={feed} language={language} onRate={(item, rating, nextSide) => rateWord(wordsService, words, item, rating, nextSide)} onFinish={played} onClose={close} closeLabel="Valmis" />
          : mode === 'fix' ? <Suspense fallback={null}><PracticeLesson items={fix} lang="ru" onExit={close} onFinish={(summary, results) => { played(); results.forEach(({ item, verdict }) => { const word = words.find((entry) => entry.id === item.wordId); if (word) rateWord(wordsService, words, { word, dir: 'r' }, verdict === 'wrong' ? 'again' : 'good'); }); }} /></Suspense>
          : mode === 'topics' ? <PetGames topics={topics} kind={kind} onDone={onPlayed} onClose={close} />
          : <div className="pet-care__actions">
            <button type="button" className="pet-btn" disabled={!needs.dueWords} onClick={() => { setFeed(feedingCards(words)); setMode('feed'); }}>
              <Utensils size={14} aria-hidden="true" /> Toida ({Math.min(FEED_WORDS, needs.dueWords)} sõna)
            </button>
            {needs.openHomework ? <Link className="pet-btn" to="/homework"><Moon size={14} aria-hidden="true" /> Kodutöö ({needs.openHomework})</Link> : null}
            {topics.length ? <button type="button" className="pet-btn" onClick={() => setMode('topics')}><Puzzle size={14} aria-hidden="true" /> Teemamängud</button> : null}
            {own.length ? <button type="button" className="pet-btn" onClick={() => { setFix(ownSentenceItems(own, { seed: Date.now() })); setMode('fix'); }}><SpellCheck size={14} aria-hidden="true" /> Paranda</button> : null}
          </div>}
      </>}
    </div>
  );
}
