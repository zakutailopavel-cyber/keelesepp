import { Check, ChevronRight, Languages } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../components/ui/index.js';
import FlashcardSession from '../vocabulary/FlashcardSession.jsx';
import { lessonWordCards, rateWord } from '../vocabulary/dailyReview.js';

/**
 * A teacher's word task opened from „Ülesanded” („Ava kaardid” → /student/harjuta?kaardid=<homeworkId>, owner
 * 2026-11-10): the cards of that lesson's words (else today's queue) in Harjuta's own card UI. The session finished =
 * the task is done: the same „Tehtud” the student could press himself (homework status, no new data); the day's words
 * step is ticked too when today's queue was used. Staff preview: practice only, nothing saved.
 */
export default function WordTaskCard({ homework, words = [], language = '', wordsService, repository, readOnly = false, onTick, onDone }) {
  // the words arrive live (a moment after the page): the deck is fixed once it has cards, so answers do not reshuffle it
  const computed = useMemo(() => lessonWordCards(words, homework?.invitationId || ''), [words, homework?.invitationId]);
  const [frozen, setFrozen] = useState(null);
  if (!frozen && computed.cards.length) setFrozen(computed);
  const { cards, source } = frozen || computed;
  const [state, setState] = useState(homework?.status === 'Tehtud' ? 'done' : 'run'); // run | saving | done
  const [error, setError] = useState('');
  const markDone = async () => {
    if (readOnly) { setState('done'); return; }
    setState('saving'); setError('');
    try {
      if (homework.status !== 'Tehtud') await repository.setStatus(homework.id, 'Tehtud');
      if (source === 'daily') onTick?.('words');
      setState('done');
      onDone?.();
    } catch (failure) { setError(failure?.message || 'Ülesannet ei saanud salvestada.'); setState('run'); }
  };

  const head = <div className="section-heading pf-head">
    <div><span className="eyebrow">Õpetaja ülesanne <span lang="ru">· задание учителя</span></span><h2>{homework.task || 'Korda sõnu'}</h2></div>
    {state === 'done' ? <Badge tone="success"><Check size={14} aria-hidden="true" /> Tehtud</Badge> : cards.length ? <Badge tone="neutral">{cards.length} {cards.length === 1 ? 'kaart' : 'kaarti'}</Badge> : null}
  </div>;

  if (state === 'done') {
    return <Card className="pf" aria-label="Õpetaja ülesanne">
      {head}
      <p>{readOnly ? 'Vaade: siit ei salvestata midagi.' : 'Ülesanne on tehtud. Õpetaja näeb seda.'}<span className="lt-ru" lang="ru"> · {readOnly ? 'Просмотр.' : 'Задание выполнено.'}</span></p>
      <div className="pf-actions"><Link className="button button--secondary" to="/homework">Tagasi ülesannetesse <ChevronRight size={16} aria-hidden="true" /></Link></div>
    </Card>;
  }
  return <Card className="pf pf--run" aria-label="Õpetaja ülesanne">
    {head}
    {source === 'daily' && cards.length ? <p className="form-hint">Selle tunni sõnu ei ole eraldi, kordame sinu tänaseid kaarte.<span lang="ru"> · Повторяем твои карточки на сегодня.</span></p> : null}
    {error ? <p className="action-error" role="alert">{error}</p> : null}
    {cards.length ? <FlashcardSession key={homework.id} cards={cards} language={language}
      onRate={readOnly ? undefined : (item, rating, nextSide) => rateWord(wordsService, words, item, rating, nextSide)}
      onFinish={markDone} />
      : <div className="pf-step">
        <p><Languages size={16} aria-hidden="true" /> Kaarte ei ole veel. Kui kordasid sõnu mujal (vihikus, õpikus), märgi ülesanne tehtuks.<span className="lt-ru" lang="ru"> · Карточек пока нет.</span></p>
        <div className="pf-actions"><Button loading={state === 'saving'} onClick={markDone}><Check size={16} aria-hidden="true" /> Tehtud</Button></div>
      </div>}
  </Card>;
}
