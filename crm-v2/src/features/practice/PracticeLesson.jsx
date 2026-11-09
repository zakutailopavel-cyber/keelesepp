import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, RotateCcw, X } from 'lucide-react';
import { ItemPrompt } from './PracticeItem.jsx';
import SentenceBuilder from './SentenceBuilder.jsx';
import { OptionChoice, TypedAnswer } from './AnswerInputs.jsx';
import { inputOf, tileSet } from './engine/items.js';
import { ALMOST_HINT } from './engine/compare.js';
import { grammarLabel } from './engine/grammar.js';
import { advance, createSession, currentItem, isRetry, progressOf, submitAnswer, summaryOf } from './engine/session.js';
import { announcePractice } from './events.js';
import './practice.css';

const VERDICT = {
  correct: { et: 'Õige!', ru: 'Верно!', en: 'Correct!' },
  almost: { et: 'Peaaegu!', ru: 'Почти!', en: 'Almost!' },
  wrong: { et: 'Õige vastus:', ru: 'Правильный ответ:', en: 'Right answer:' },
};

const emptyDraft = () => ({ tiles: [], option: '', text: '' });

// One practice lesson: item after item with immediate feedback, then one round of the items answered wrong, then the
// result. Announces the result once (events.js) — nothing is stored here. `onFinish(summary, results)` gets the first
// answers ({ item, verdict }) — „Täna” ticks its step and moves the learner's own sentence cards on their schedule;
// `onDone` is the result's „Valmis” (defaults to `onExit`, the ✕ of an unfinished lesson).
export default function PracticeLesson({ items, lang = 'ru', onExit, onDone = onExit, onRestart, onFinish, doneLabel = 'Valmis', now = () => Date.now() }) {
  const [session, setSession] = useState(() => createSession(items));
  const [draft, setDraft] = useState(emptyDraft);
  const [feedback, setFeedback] = useState(null);
  const [startedAt] = useState(() => now());
  const [endedAt, setEndedAt] = useState(0);
  const announced = useRef(false);
  const cta = useRef(null);
  const item = currentItem(session);
  const input = item ? inputOf(item) : '';
  const tiles = useMemo(() => (item ? item.shown || tileSet(item) : []), [item]);
  const done = session.phase === 'done';
  const summary = useMemo(() => (done ? summaryOf(session, { minutes: (endedAt - startedAt) / 60000 }) : null), [done, session, endedAt, startedAt]);

  useEffect(() => {
    if (!summary || announced.current) return;
    announced.current = true;
    announcePractice({ kind: summary.kind, items: summary.total, correct: summary.correct, minutes: summary.minutes, grammarPoints: summary.grammarPoints });
    onFinish?.(summary, session.log.filter((entry) => entry.phase === 'main').map((entry) => ({ item: session.items[entry.index], verdict: entry.verdict })));
  }, [summary]); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = input === 'tiles' ? draft.tiles.length > 0 : input === 'options' ? Boolean(draft.option) : draft.text.trim().length > 0;
  const check = useCallback(() => {
    if (!item || feedback || !ready) return;
    const response = input === 'tiles' ? { tiles: draft.tiles.map((i) => tiles[i]) } : input === 'options' ? { option: draft.option } : { text: draft.text };
    const result = submitAnswer(session, response);
    setSession(result.session);
    setFeedback(result.feedback);
  }, [item, feedback, ready, input, draft, tiles, session]);
  // after a check the button („Edasi”) takes the focus: Enter / Space goes on
  useEffect(() => { if (feedback) cta.current?.focus({ preventScroll: true }); }, [feedback]);
  const next = useCallback(() => {
    const following = advance(session);
    if (following.phase === 'done') setEndedAt(now());
    setSession(following);
    setFeedback(null);
    setDraft(emptyDraft());
  }, [session, now]);

  // keyboard: Enter checks / goes on, 1–9 picks an option
  useEffect(() => {
    if (done) return undefined;
    const onKey = (event) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const typing = /^(INPUT|TEXTAREA)$/.test(event.target?.tagName || '');
      if (event.key === 'Enter' && !typing && event.target?.tagName !== 'BUTTON') { event.preventDefault(); if (feedback) next(); else check(); }
      if (event.key === 'Enter' && typing && feedback) { event.preventDefault(); next(); }
      if (!typing && !feedback && input === 'options' && /^[1-9]$/.test(event.key)) {
        const opt = item.options[Number(event.key) - 1];
        if (opt) setDraft((d) => ({ ...d, option: opt }));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, feedback, next, check, input, item]);

  if (done) return <LessonSummary summary={summary} lang={lang} onExit={onDone} onRestart={onRestart} doneLabel={doneLabel} />;
  if (!item) return null;

  const filled = input === 'options' ? draft.option : input === 'type' && (item.type === 'form' || item.type === 'connector') ? draft.text : '';
  const pct = Math.round(progressOf(session) * 100);
  return (
    <section className="pr-lesson" aria-label="Harjutus">
      <header className="pr-lesson__top">
        {onExit ? <button type="button" className="pr-icon" onClick={onExit} aria-label="Lõpeta harjutus"><X size={20} aria-hidden="true" /></button> : null}
        <div className="pr-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Edenemine">
          <i style={{ width: `${pct}%` }} />
        </div>
        {isRetry(session) ? <span className="pr-retry-badge"><RotateCcw size={14} aria-hidden="true" /> Kordame vigu</span> : null}
      </header>

      <div className="pr-card" key={`${session.phase}-${session.pos}`}>
        <ItemPrompt item={item} lang={lang} filled={feedback ? '' : filled} />
        {input === 'tiles' ? (
          <SentenceBuilder tiles={tiles} value={draft.tiles} onChange={(t) => setDraft((d) => ({ ...d, tiles: t }))} disabled={Boolean(feedback)} />
        ) : input === 'options' ? (
          <OptionChoice options={item.options} value={draft.option} onChange={(option) => setDraft((d) => ({ ...d, option }))} disabled={Boolean(feedback)} verdict={feedback?.verdict} expected={feedback?.expected} />
        ) : (
          <TypedAnswer value={draft.text} onChange={(text) => setDraft((d) => ({ ...d, text }))} onSubmit={feedback ? next : check} disabled={Boolean(feedback)} multiline={item.type === 'transform'} />
        )}
      </div>

      <footer className={`pr-foot${feedback ? ` is-${feedback.verdict}` : ''}`}>
        {feedback ? <Feedback feedback={feedback} item={item} lang={lang} /> : null}
        <button ref={cta} type="button" className="pr-cta" onClick={feedback ? next : check} disabled={!feedback && !ready}>
          {feedback ? 'Edasi' : 'Kontrolli'}
        </button>
      </footer>
    </section>
  );
}

function Feedback({ feedback, item, lang }) {
  const v = VERDICT[feedback.verdict];
  const point = item.grammar?.[0];
  return (
    <div className="pr-feedback" role="status" aria-live="polite">
      <p className="pr-feedback__head">
        {feedback.verdict === 'correct' ? <Check size={20} aria-hidden="true" /> : null}
        <strong>{v.et}</strong>{lang !== 'et' && v[lang] ? <span lang={lang}> {v[lang]}</span> : null}
      </p>
      {feedback.verdict !== 'correct' ? <p className="pr-feedback__answer" lang="et">{feedback.expected}</p> : null}
      {feedback.verdict === 'almost' ? (
        <p className="pr-feedback__hint">{ALMOST_HINT.et}{lang !== 'et' && ALMOST_HINT[lang] ? <span lang={lang}> {ALMOST_HINT[lang]}</span> : null}{feedback.letters?.length ? <b> ({feedback.letters.join(', ')})</b> : null}</p>
      ) : null}
      {item.explain?.et ? <p className="pr-feedback__rule" lang="et">{item.explain.et}</p> : null}
      {item.explain?.[lang] && lang !== 'et' ? <p className="pr-feedback__rule" lang={lang}>{item.explain[lang]}</p> : null}
      {point ? <p className="pr-feedback__point">{grammarLabel(point, 'et')}{lang !== 'et' ? <span lang={lang}> · {grammarLabel(point, lang)}</span> : null}</p> : null}
    </div>
  );
}

export function LessonSummary({ summary, lang = 'ru', onExit, onRestart, doneLabel = 'Valmis' }) {
  const share = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;
  const praise = share >= 80 ? 'Väga hea!' : share >= 50 ? 'Hea töö!' : 'Harjutame veel!';
  const ru = share >= 80 ? 'Отлично!' : share >= 50 ? 'Хорошо!' : 'Потренируемся ещё!';
  return (
    <section className="pr-summary" aria-label="Tulemus">
      <div className="pr-ring" style={{ '--pr-share': `${share}%` }} aria-hidden="true"><span>{share}%</span></div>
      <h2>{praise}{lang === 'ru' ? <small lang="ru">{ru}</small> : null}</h2>
      <dl className="pr-stats">
        <div><dt>Õigesti kohe</dt><dd>{summary.correct} / {summary.total}</dd></div>
        {summary.almost ? <div><dt>Peaaegu (täpitähed)</dt><dd>{summary.almost}</dd></div> : null}
        {summary.retried ? <div><dt>Parandatud kordamisel</dt><dd>{summary.fixed} / {summary.retried}</dd></div> : null}
        <div><dt>Aeg</dt><dd>{summary.minutes < 1 ? '< 1 min' : `${Math.round(summary.minutes)} min`}</dd></div>
      </dl>
      {summary.grammarPoints.length ? (
        <ul className="pr-points" aria-label="Grammatika">
          {summary.grammarPoints.slice(0, 6).map((g) => <li key={g} className={summary.missed.includes(g) ? 'is-missed' : ''}>{grammarLabel(g, 'et')}</li>)}
        </ul>
      ) : null}
      <div className="pr-summary__actions">
        {onRestart ? <button type="button" className="pr-cta pr-cta--ghost" onClick={onRestart}>Uus harjutus</button> : null}
        {onExit ? <button type="button" className="pr-cta" onClick={onExit}>{doneLabel}</button> : null}
      </div>
    </section>
  );
}
