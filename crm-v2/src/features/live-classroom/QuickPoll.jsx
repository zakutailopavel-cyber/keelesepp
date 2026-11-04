import { Check, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import '../vocabulary/vocabulary.css';
import './quickPoll.css';
import { GAP, MAX_OPTIONS, MIN_OPTIONS, OPTION_MAX, POLL_MODES, POLL_TIME_LIMITS, QUESTION_MAX, gapParts, pollTimeUp, pollTitle, studentPollState, tallyAnswers } from './quickPoll.js';

const emptyForm = () => ({ mode: 'choice', question: '', sentence: '', options: ['', ''], correctIndex: 0, timeLimitSec: 0 });

// the question as students see it: a gap sentence shows the gap as a box (or the chosen / right form in it)
export function PollQuestion({ poll, fill = '' }) {
  if (poll.mode !== 'gap') return <p className="qp-question">{poll.question}</p>;
  const [before, after] = gapParts(poll.sentence);
  return <>
    {poll.question ? <p className="qp-hint">{poll.question}</p> : null}
    <p className="qp-question qp-sentence">{before}<span className={`qp-gap ${fill ? 'is-filled' : ''}`}>{fill || ' '}</span>{after}</p>
  </>;
}

/**
 * The teacher's „Kiirküsimus” drawer: the form for a new question (or a gap sentence), then the answers live, „Näita
 * vastust” and one click per wrong answer into the student's „Minu vead”. `pickText()` → text chosen on the board.
 */
export function QuickPollPanel({ quick, names = {}, pickText, timer }) {
  const { poll, correctIndex, busy, error, actions } = quick;
  const [form, setForm] = useState(emptyForm);
  const [asking, setAsking] = useState(false);
  const [picked, setPicked] = useState('');
  const live = poll && poll.status !== 'closed';
  const set = (patch) => { quick.clearError?.(); setForm((current) => ({ ...current, ...patch })); };
  const setOption = (index, value) => set({ options: form.options.map((item, at) => (at === index ? value : item)) });
  const removeOption = (index) => set({
    options: form.options.filter((_, at) => at !== index),
    correctIndex: form.correctIndex === index ? 0 : form.correctIndex > index ? form.correctIndex - 1 : form.correctIndex,
  });
  // the text chosen on the board (a selected text / note, or text marked with the mouse) goes into the question
  const take = () => {
    const text = String(pickText?.() || '').replace(/\s+/g, ' ').trim().slice(0, QUESTION_MAX);
    if (!text) { setPicked('Vali tahvlil tekst („Vali” tööriistaga) või märgi see hiirega, siis vajuta uuesti.'); return; }
    setPicked('');
    set(form.mode === 'gap' ? { sentence: text } : { question: text });
  };
  const start = async (event) => {
    event.preventDefault();
    if (await actions.start(form)) { setAsking(false); setForm((current) => ({ ...emptyForm(), mode: current.mode, timeLimitSec: current.timeLimitSec })); }
  };

  if (live && !asking) {
    const tally = tallyAnswers(poll, quick.answers, { correctIndex, names });
    const timeUp = pollTimeUp(poll, timer);
    return <div className="qp-panel">
      <div className="qp-now">
        <small>{poll.mode === 'gap' ? 'Vali õige vorm' : 'Küsimus'} · {poll.status === 'revealed' ? 'vastus on näidatud' : timeUp ? 'aeg läbi' : 'vastatakse'}</small>
        <PollQuestion poll={poll} fill={poll.mode === 'gap' && correctIndex >= 0 ? poll.options[correctIndex] : ''} />
      </div>
      <p className="qp-count" role="status">Vastanud {tally.answered}/{tally.total}{tally.missing.length && poll.status === 'open' ? ` · ootan: ${tally.missing.join(', ')}` : ''}</p>
      <ul className="qp-results">{tally.options.map((item) => {
        const share = tally.total ? Math.round((item.count / tally.total) * 100) : 0;
        return <li key={item.index} className={item.correct ? 'is-correct' : ''}>
          <span className="qp-results__label">{item.correct ? <Check size={14} aria-label="õige" /> : null}{item.text}</span>
          <span className="qp-bar" aria-hidden="true"><span style={{ width: `${share}%` }} /></span>
          <span className="qp-results__count">{item.count}</span>
          {item.names.length ? <small>{item.names.join(', ')}</small> : null}
        </li>;
      })}</ul>
      {tally.rows.some((row) => row.correct === false) ? <div className="qp-mistakes">
        <h4>Valed vastused</h4>
        <ul>{tally.rows.filter((row) => row.correct === false).map((row) => <li key={row.uid}>
          <span><strong>{row.name}</strong> — {row.text}</span>
          {quick.isSaved(row) ? <small className="qp-saved">„Minu vead” all ✓</small>
            : <button type="button" className="vw-btn" disabled={busy} onClick={() => actions.saveMistake(row)}>Lisa „Minu vead” alla</button>}
        </li>)}</ul>
      </div> : null}
      {error ? <p className="vw-error" role="alert">{error}</p> : null}
      <div className="vw-actions">
        {poll.status === 'open' ? <button type="button" className="vw-btn is-primary" disabled={busy || correctIndex < 0} onClick={actions.reveal}>Näita vastust</button> : null}
        <button type="button" className="vw-btn" disabled={busy} onClick={() => setAsking(true)}>Uus küsimus</button>
        <button type="button" className="vw-btn" disabled={busy} onClick={actions.close}>Lõpeta</button>
      </div>
    </div>;
  }

  return <form className="qp-panel qp-form" onSubmit={start}>
    <div className="qp-modes" role="radiogroup" aria-label="Küsimuse liik">
      {POLL_MODES.map((mode) => <button type="button" key={mode.id} role="radio" aria-checked={form.mode === mode.id} className={form.mode === mode.id ? 'is-active' : ''} onClick={() => set({ mode: mode.id })}>{mode.label}</button>)}
    </div>
    {form.mode === 'gap' ? <>
      <label className="vw-field"><span>Lause lüngaga</span>
        <input value={form.sentence} maxLength={QUESTION_MAX} placeholder={`Ma elan ${GAP} (Tallinn).`} onChange={(event) => set({ sentence: event.target.value })} /></label>
      <p className="vw-muted">Lünk on {GAP} (kolm alakriipsu). Variantideks kirjuta vormid, nt Tallinnas / Tallinnasse / Tallinnast.</p>
      <label className="vw-field"><span>Juhis (valikuline)</span>
        <input value={form.question} maxLength={QUESTION_MAX} placeholder="Vali õige vorm" onChange={(event) => set({ question: event.target.value })} /></label>
    </> : <label className="vw-field"><span>Küsimus</span>
      <textarea rows={2} value={form.question} maxLength={QUESTION_MAX} placeholder="Mis on sõna „raamatukogu” mitmus?" onChange={(event) => set({ question: event.target.value })} /></label>}
    {pickText ? <button type="button" className="vw-btn" onMouseDown={(event) => event.preventDefault()} onClick={take}>Võta tahvlilt valitud tekst</button> : null}
    {picked ? <p className="vw-muted" role="status">{picked}</p> : null}
    <fieldset className="qp-options">
      <legend>Vastusevariandid · märgi õige</legend>
      {form.options.map((value, index) => <div key={index} className="qp-option">
        <input type="radio" name="qp-correct" aria-label={`Variant ${index + 1} on õige`} checked={form.correctIndex === index} onChange={() => set({ correctIndex: index })} />
        <input aria-label={`Variant ${index + 1}`} value={value} maxLength={OPTION_MAX} placeholder={`Variant ${index + 1}`} onChange={(event) => setOption(index, event.target.value)} />
        {form.options.length > MIN_OPTIONS ? <button type="button" className="lr-icon" aria-label={`Eemalda variant ${index + 1}`} onClick={() => removeOption(index)}><Trash2 size={15} /></button> : null}
      </div>)}
      {form.options.length < MAX_OPTIONS ? <button type="button" className="vw-btn" onClick={() => set({ options: [...form.options, ''] })}><Plus size={14} /> Lisa variant</button> : null}
    </fieldset>
    <label className="vw-field"><span>Aeg</span>
      <select value={form.timeLimitSec} onChange={(event) => set({ timeLimitSec: Number(event.target.value) })}>
        {POLL_TIME_LIMITS.map((item) => <option key={item.sec} value={item.sec}>{item.label}</option>)}
      </select></label>
    {error ? <p className="vw-error" role="alert">{error}</p> : null}
    <div className="vw-actions">
      <button type="submit" className="vw-btn is-primary" disabled={busy}>Küsi õpilastelt</button>
      {live ? <button type="button" className="vw-btn" onClick={() => setAsking(false)}>Tagasi tulemuste juurde</button> : null}
    </div>
    {poll?.status === 'closed' && poll.question ? <p className="vw-muted">Eelmine: {pollTitle(poll)}</p> : null}
  </form>;
}

/**
 * The student's card over the board: tap an answer (it can be changed until the teacher shows the right one), then
 * see whether it was right; a right answer gets a small celebration. „Sulge” hides it until the next question.
 */
export function QuickPollCard({ quick, timer }) {
  const { poll, myAnswer, busy, error, actions } = quick;
  const [hidden, setHidden] = useState(0);
  const timeUp = pollTimeUp(poll, timer);
  const state = studentPollState(poll, myAnswer, { expired: timeUp });
  if (state === 'none' || hidden === poll.round) return null;
  const mine = myAnswer && myAnswer.round === poll.round ? myAnswer.choice : -1;
  const revealed = poll.status === 'revealed';
  const locked = revealed || timeUp || busy;
  const fill = poll.mode === 'gap' ? (revealed ? poll.options[poll.correctIndex] : mine >= 0 ? poll.options[mine] : '') : '';
  return <section className={`qp-card is-${state}`} role="dialog" aria-label="Kiirküsimus">
    <header>
      <strong><Sparkles size={16} aria-hidden="true" /> Kiirküsimus</strong>
      <button type="button" className="lr-icon" aria-label="Sulge kiirküsimus" onClick={() => setHidden(poll.round)}><X size={16} /></button>
    </header>
    <PollQuestion poll={poll} fill={fill} />
    <div className="qp-choices">{poll.options.map((text, index) => {
      const cls = [mine === index ? 'is-mine' : '', revealed && index === poll.correctIndex ? 'is-correct' : '', revealed && mine === index && index !== poll.correctIndex ? 'is-wrong' : ''].filter(Boolean).join(' ');
      return <button type="button" key={index} className={cls} aria-pressed={mine === index} disabled={locked} onClick={() => actions.answer(index)}>{text}</button>;
    })}</div>
    <p className="qp-status" role="status">{{
      answer: 'Puuduta vastust.',
      sent: revealed ? '' : 'Vastus on saadetud. Võid veel muuta, kuni õpetaja näitab õiget vastust.',
      late: 'Aeg läbi.',
      right: 'Õige! Tubli!',
      wrong: `Seekord mitte. Õige: ${poll.options[poll.correctIndex] || ''}`,
      missed: `Õige vastus: ${poll.options[poll.correctIndex] || ''}`,
    }[state]}</p>
    {state === 'right' ? <div className="qp-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} style={{ '--i': index }} />)}</div> : null}
    {error ? <p className="vw-error" role="alert">{error}</p> : null}
  </section>;
}
