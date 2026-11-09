/* global SpeechSynthesisUtterance, Audio */
// „Kaardid” (2026-11-09, docs/VOCABULARY_SRS.md): one big card on spaced repetition. Tap / Space turns it; then
// Uuesti / Raske / Hea / Lihtne by button, key 1–4 or a swipe (left = Uuesti, right = Hea, up = Lihtne). A card answered
// „Uuesti” comes back in the same session after its learning step; the end screen tells honestly how it went.
import { RotateCcw, Star, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { petReact } from '../pet/petEvents.js';
import { announcePractice } from '../practice/events.js';
import { estonianVoice, exampleFor, formatWhen, formRows, meaningFor, meaningLang, posLabel } from './cardFace.js';
import { formatInterval, previewIntervals, RATING_LABELS, RATINGS, rateInSession, sessionStats, startSession } from './srs.js';
import './flashcards.css';

const SWIPE_PX = 80;
const WAY = { again: 'left', hard: 'left', good: 'right', easy: 'up' };

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => Boolean(globalThis.matchMedia?.(query)?.matches));
  useEffect(() => {
    const list = globalThis.matchMedia?.(query);
    if (!list?.addEventListener) return undefined;
    const update = () => setReduced(list.matches);
    list.addEventListener('change', update);
    return () => list.removeEventListener('change', update);
  }, []);
  return reduced;
}

// the browser's Estonian voice (it may arrive a moment after the page loads)
function useEstonianVoice(synth) {
  const [voice, setVoice] = useState(() => estonianVoice(synth));
  useEffect(() => {
    if (!synth?.addEventListener) return undefined;
    const update = () => setVoice(estonianVoice(synth));
    update();
    synth.addEventListener('voiceschanged', update);
    return () => synth.removeEventListener('voiceschanged', update);
  }, [synth]);
  return voice;
}

function AudioButton({ text, audio, voice, synth }) {
  if (!audio && !voice) return null;
  const play = (event) => {
    event.stopPropagation();
    try {
      if (audio) { new Audio(audio).play()?.catch?.(() => {}); return; }
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'et-EE';
      utterance.voice = voice;
      utterance.rate = 0.9;
      synth.speak(utterance);
    } catch { /* no sound: the card works without it */ }
  };
  return <button type="button" className="fc-audio" onClick={play} onPointerDown={(event) => event.stopPropagation()} aria-label={`Kuula: ${text}`}><Volume2 size={18} aria-hidden="true" /></button>;
}

function Face({ item, side, dictionary, language, voice, synth }) {
  const estonianFirst = item.dir !== 'p';
  const meaning = meaningFor(item, language);
  const pos = posLabel(item, dictionary);
  if (side === 'front') {
    const text = estonianFirst ? item.front : meaning;
    return (
      <div className="fc-face fc-front" aria-hidden={side !== 'front' ? 'true' : undefined}>
        <div className="fc-face__top">{pos ? <span className="fc-pos">{pos}</span> : <span />}<span className="fc-ask">{estonianFirst ? 'Mida see tähendab?' : 'Kuidas on see eesti keeles?'}</span></div>
        <strong className={`fc-word ${text.length > 28 ? 'is-long' : ''}`} lang={estonianFirst ? 'et' : meaningLang(text)}>{text}</strong>
        {estonianFirst ? <AudioButton text={item.front} audio={item.audio} voice={voice} synth={synth} /> : null}
        <span className="fc-tap">Puuduta, et pöörata</span>
      </div>
    );
  }
  const forms = formRows(item, dictionary);
  const example = exampleFor(item);
  const answer = estonianFirst ? meaning : item.front;
  return (
    <div className="fc-face fc-back">
      <div className="fc-face__top">{pos ? <span className="fc-pos">{pos}</span> : <span />}<span className="fc-ask" lang={estonianFirst ? 'et' : meaningLang(meaning)}>{estonianFirst ? item.front : meaning}</span></div>
      <div className="fc-answer">
        <strong className={`fc-word ${answer.length > 28 ? 'is-long' : ''}`} lang={estonianFirst ? meaningLang(answer) : 'et'}>{answer}</strong>
        <AudioButton text={item.front} audio={item.audio} voice={voice} synth={synth} />
      </div>
      {forms.length ? (
        <dl className="fc-forms" aria-label="Põhivormid">{forms.map((row) => (
          <div key={`${row.label}-${row.value}`}><dt>{row.label}</dt><dd lang="et">{row.value}</dd></div>
        ))}</dl>
      ) : null}
      {example ? <p className="fc-example" lang="et">{example}</p> : null}
    </div>
  );
}

function EndScreen({ session, missed, nextDueAt, onAgain, onClose, onAddMissed, now }) {
  const stats = useMemo(() => sessionStats(session, now()), [session]); // eslint-disable-line react-hooks/exhaustive-deps
  const announced = useRef(false);
  useEffect(() => {
    if (announced.current || !stats.reviewed) return;
    announced.current = true;
    petReact('done');
    announcePractice({ kind: 'words', reviewed: stats.reviewed, correct: stats.correct, minutes: stats.minutes, cards: stats.cards, learned: stats.learned });
  }, [stats]);
  const next = [stats.nextDue, nextDueAt].filter(Boolean).sort()[0] || '';
  const when = formatWhen(next, now());
  return (
    <div className="fc-done" role="status">
      <span className="fc-done__ring" style={{ '--fc-pct': `${stats.percent}%` }} aria-hidden="true"><b>{stats.percent}%</b></span>
      <strong>{stats.percent >= 80 ? 'Väga hea!' : stats.percent >= 50 ? 'Hästi läks!' : 'Hea, et harjutasid!'}</strong>
      <dl className="fc-stats">
        <div><dt>Esimesel korral õigesti</dt><dd>{stats.correctFirst}/{stats.firstTry}</dd></div>
        <div><dt>Uusi sõnu õpitud</dt><dd>{stats.learned}</dd></div>
        <div><dt>Vastuseid kokku</dt><dd>{stats.reviewed}</dd></div>
        <div><dt>Aega</dt><dd>{stats.minutes < 1 ? '<1 min' : `${Math.round(stats.minutes)} min`}</dd></div>
      </dl>
      {when ? <p className="fc-next">Järgmine kordamine: <b>{when}</b></p> : null}
      {missed.length ? <ul className="fc-missed" aria-label="Raskemad sõnad">{missed.map((item) => <li key={item.key}><b lang="et">{item.front}</b> — {meaningFor(item)}</li>)}</ul> : null}
      <div className="fc-done__actions">
        {onAddMissed && missed.some((item) => !item.word) ? <button type="button" className="vw-btn" onClick={() => onAddMissed(missed.filter((item) => !item.word))}><Star size={15} /> Lisa raskemad minu sõnadesse</button> : null}
        {missed.length ? <button type="button" className="vw-btn is-primary" onClick={onAgain}><RotateCcw size={15} /> Korda raskemaid</button> : null}
        {onClose ? <button type="button" className="vw-btn" onClick={onClose}>Vali teine viis</button> : null}
      </div>
    </div>
  );
}

/**
 * cards: [{ id, key, dir: 'r' | 'p', front, back, hint, word?, side?, example?, pos?, audio?, meanings? }]
 * onRate(item, rating, nextSide) after every answer (the page saves the student's own words; course words stay in memory).
 */
export default function FlashcardSession({ cards = [], dictionary = {}, language = '', onRate, onAddMissed, onClose, nextDueAt = '', now = () => new Date(), synth = globalThis.speechSynthesis }) {
  const [session, setSession] = useState(() => startSession(cards, now()));
  const [flipped, setFlipped] = useState(false);
  const [drag, setDrag] = useState(null);
  const [leaving, setLeaving] = useState(null);
  const pointer = useRef(null);
  const moved = useRef(false);
  const reduced = usePrefersReducedMotion();
  const voice = useEstonianVoice(synth);
  const item = session.current >= 0 ? session.queue[session.current] : null;
  const intervals = useMemo(() => (item ? previewIntervals(item.side, now()) : null), [item]); // eslint-disable-line react-hooks/exhaustive-deps
  const missed = useMemo(() => {
    const keys = new Set(session.answers.filter((answer) => answer.rating === 'again').map((answer) => answer.key));
    const all = [...session.finished, ...session.queue];
    return [...keys].map((key) => all.find((entry) => entry.key === key)).filter(Boolean);
  }, [session]);

  const rate = (rating) => {
    if (!item || !flipped) return;
    const result = rateInSession(session, rating, now());
    if (!reduced) setLeaving({ item, way: WAY[rating], id: `${item.key}-${session.answers.length}` });
    setSession(result.session);
    setFlipped(false);
    setDrag(null);
    petReact(rating === 'again' ? 'wrong' : 'correct');
    onRate?.(item, rating, result.side);
  };
  const flip = () => { if (item) setFlipped((value) => !value); };

  useEffect(() => {
    const onKey = (event) => {
      if (event.target?.closest?.('input, textarea, select') || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === ' ' || event.key === 'Enter') {
        if (event.target?.closest?.('button') && event.key === 'Enter') return;
        event.preventDefault();
        flip();
        return;
      }
      const index = ['1', '2', '3', '4'].indexOf(event.key);
      if (index >= 0 && flipped) { event.preventDefault(); rate(RATINGS[index]); }
    };
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!leaving) return undefined;
    const timer = globalThis.setTimeout(() => setLeaving(null), 320);
    return () => globalThis.clearTimeout(timer);
  }, [leaving]);

  const down = (event) => {
    pointer.current = { x: event.clientX ?? 0, y: event.clientY ?? 0, id: event.pointerId };
    moved.current = false;
    try { event.currentTarget.setPointerCapture?.(event.pointerId); } catch { /* old browsers */ }
  };
  const move = (event) => {
    if (!pointer.current) return;
    const dx = (event.clientX ?? 0) - pointer.current.x;
    const dy = (event.clientY ?? 0) - pointer.current.y;
    if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved.current = true;
    if (moved.current) setDrag({ x: dx, y: dy });
  };
  const up = (event) => {
    if (!pointer.current) return;
    const dx = (event.clientX ?? 0) - pointer.current.x;
    const dy = (event.clientY ?? 0) - pointer.current.y;
    pointer.current = null;
    setDrag(null);
    if (!moved.current) return;
    const way = -dy > SWIPE_PX && -dy > Math.abs(dx) ? 'up' : dx > SWIPE_PX ? 'right' : dx < -SWIPE_PX ? 'left' : '';
    if (!way) return;
    if (!flipped) { setFlipped(true); return; } // the first swipe shows the answer
    rate(way === 'up' ? 'easy' : way === 'right' ? 'good' : 'again');
  };

  if (!item) {
    return <EndScreen session={session} missed={missed} nextDueAt={nextDueAt} now={now} onClose={onClose} onAddMissed={onAddMissed}
      onAgain={() => { setSession(startSession(missed.map(({ showAt, order, startState, ...rest }) => rest), now())); setFlipped(false); }} />; // eslint-disable-line no-unused-vars
  }

  const done = session.finished.length;
  const percent = session.total ? Math.round((done / session.total) * 100) : 0;
  const hint = drag ? (-drag.y > SWIPE_PX && -drag.y > Math.abs(drag.x) ? 'easy' : drag.x > SWIPE_PX ? 'good' : drag.x < -SWIPE_PX ? 'again' : '') : '';
  const style = drag ? { '--fc-dx': `${drag.x}px`, '--fc-dy': `${Math.min(0, drag.y)}px`, '--fc-rot': `${drag.x / 18}deg` } : undefined;

  return (
    <div className="fc" aria-label="Kaardid">
      <div className="fc-top">
        <div className="fc-bar" role="progressbar" aria-label="Seansi edenemine" aria-valuemin={0} aria-valuemax={session.total} aria-valuenow={done}><i style={{ width: `${percent}%` }} /></div>
        <span className="fc-count">{done}/{session.total}</span>
      </div>
      <div className="fc-stage">
        {leaving ? <div key={leaving.id} className={`fc-card fc-ghost is-${leaving.way}`} aria-hidden="true"><div className="fc-inner is-flipped"><Face item={leaving.item} side="back" dictionary={dictionary} language={language} /></div></div> : null}
        <div key={`${item.key}-${session.answers.length}`} role="button" tabIndex={0}
          className={`fc-card ${reduced ? 'is-still' : 'is-entering'} ${drag ? 'is-dragging' : ''} ${hint ? `is-hint-${hint}` : ''}`} style={style}
          aria-label={flipped ? `Vastus: ${item.dir === 'p' ? item.front : meaningFor(item, language)}` : `Küsimus: ${item.dir === 'p' ? meaningFor(item, language) : item.front}. Vajuta, et pöörata`}
          aria-pressed={flipped}
          onClick={() => { if (!moved.current) flip(); moved.current = false; }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { pointer.current = null; setDrag(null); }}>
          <div className={`fc-inner ${flipped ? 'is-flipped' : ''}`}>
            <Face item={item} side="front" dictionary={dictionary} language={language} voice={voice} synth={synth} />
            {flipped || !reduced ? <Face item={item} side="back" dictionary={dictionary} language={language} voice={voice} synth={synth} /> : null}
          </div>
          {hint ? <span className={`fc-stamp is-${hint}`} aria-hidden="true">{RATING_LABELS[hint]}</span> : null}
        </div>
      </div>
      {flipped ? (
        <div className="fc-rate" role="group" aria-label="Kui hästi sa teadsid?">
          {RATINGS.map((rating, index) => (
            <button type="button" key={rating} className={`fc-rate__btn is-${rating}`} onClick={() => rate(rating)} aria-label={`${RATING_LABELS[rating]} (${formatInterval(intervals[rating])})`}>
              <span>{RATING_LABELS[rating]}</span><small>{formatInterval(intervals[rating])}</small><kbd aria-hidden="true">{index + 1}</kbd>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className="fc-show" onClick={flip}>Näita vastust</button>
      )}
      <p className="fc-keys" aria-hidden="true">Tühik — pööra · 1 Uuesti · 2 Raske · 3 Hea · 4 Lihtne · telefonis libista: ← Uuesti, → Hea, ↑ Lihtne</p>
    </div>
  );
}
