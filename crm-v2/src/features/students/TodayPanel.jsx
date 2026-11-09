import { Check, ChevronRight, Flame, GraduationCap, Languages, ListTodo, MessageSquareQuote, Pause, Play, SkipForward, Sparkles, Video } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { lazyComponent } from '../../app/lazyComponent.js';
import FlashcardSession from '../vocabulary/FlashcardSession.jsx';
import { dailyPlan, rateWord } from '../vocabulary/dailyReview.js';
import { petSvg } from '../pet/petArt.js';
import { thanksLine } from '../pet/petLoop.js';
import { seasonalWear } from '../pet/petLife.js';
import { petReact } from '../pet/petEvents.js';
import { ownWords } from './nextStep.js';
import './today.css';

// the practice lesson (tiles, drag and drop) loads when the sentences step starts, not with the home page
const PracticeLesson = lazyComponent(() => import('../practice/PracticeLesson.jsx'));

const ICON = { homework: ListTodo, words: Languages, sentences: MessageSquareQuote, course: GraduationCap };
const skipKey = (date) => `ks-tana-skip-${date}`;
const readSkipped = (date) => { try { return JSON.parse(globalThis.sessionStorage?.getItem(skipKey(date)) || '[]'); } catch { return []; } };
const writeSkipped = (date, list) => { try { globalThis.sessionStorage?.setItem(skipKey(date), JSON.stringify(list)); } catch { /* private mode */ } };

function PetFace({ pet, stage = 1, mood = 'happy' }) {
  if (!pet?.kind || pet.optedOut) return <span className="tn-pet tn-pet--none" aria-hidden="true"><Sparkles size={34} /></span>;
  const { bg: _bg, ...worn } = pet.wearing || {};
  return <span className="tn-pet" aria-hidden="true" dangerouslySetInnerHTML={{ __html: petSvg(pet.kind, mood, stage, seasonalWear(worn)) }} />;
}

/** The pet between two steps and at the end: its thanks, then one button on. */
function PetMoment({ pet, stage, kind, lang, title, children }) {
  const line = thanksLine(kind, lang);
  return <div className={`tn-moment ${kind === 'finished' ? 'is-finished' : ''}`} role="status">
    <PetFace pet={pet} stage={stage} mood={kind === 'finished' ? 'proud' : 'happy'} />
    <div className="tn-moment__talk">
      {title ? <strong className="tn-moment__title">{title}</strong> : null}
      <p className="tn-moment__bubble" lang={line.lang}>{pet?.kind && !pet.optedOut ? <b>{pet.name}: </b> : null}{line.text}<small lang="ru">{line.hint}</small></p>
      {children}
    </div>
  </div>;
}

function StepDots({ steps, current }) {
  return <ol className="tn-dots" aria-label="Tänased sammud">{steps.map((step) => {
    const Icon = ICON[step.key] || Check;
    const state = step.state === 'done' ? 'is-done' : step.key === current ? 'is-current' : '';
    return <li key={step.key} className={state} aria-current={step.key === current ? 'step' : undefined}>
      <span className="tn-dots__icon">{step.state === 'done' ? <Check size={15} aria-hidden="true" /> : <Icon size={15} aria-hidden="true" />}</span>
      <span className="tn-dots__label">{step.label}</span>
      <span className="sr-only">{step.state === 'done' ? ' — tehtud' : step.key === current ? ' — praegu' : ''}</span>
    </li>;
  })}</ol>;
}

/**
 * „Täna” (owner 2026-11-09): ONE button runs the day's steps in order (students/nextStep.js todaySteps), each ticked when
 * done; empty steps are skipped; the pet reacts after each step and thanks at the end. Props:
 *   plan        todaySteps() result; today: { date, done, xp } (practice/progress.js); streak
 *   onTick(key) a step was really finished (stored by the page); loadPractice() → Promise<{ items }> for the sentences step
 *   words / wordsService  his words and the service that moves them on their schedule; readOnly = staff preview
 *   onReact(kind)  tells the pet card below what just happened
 */
export default function TodayPanel({
  plan, today, streak = 0, pet = null, petStage = 1, lang = 'et', language = '', words = [], wordsService, readOnly = false,
  loadPractice, onTick, onReact, initialMode = 'overview', initialStep = '',
}) {
  const active = useMemo(() => plan.steps.filter((step) => step.state !== 'empty'), [plan]);
  const [mode, setMode] = useState(initialMode); // overview | run | between | finale
  const [current, setCurrent] = useState(initialStep);
  const [justDone, setJustDone] = useState('');
  const [skipped, setSkipped] = useState(() => readSkipped(today.date));
  const [cards, setCards] = useState(null);
  const [practice, setPractice] = useState(null); // { loading, items, error }

  const todo = plan.steps.filter((step) => step.state === 'todo');
  const nextTodo = (after = '') => todo.find((step) => step.key !== after && !skipped.includes(step.key)) || null;
  const step = plan.steps.find((item) => item.key === current) || null;
  const doneCount = active.filter((item) => item.state === 'done').length;

  const begin = (target) => {
    if (!target) { setMode(doneCount ? 'finale' : 'overview'); return; }
    setCurrent(target.key);
    setJustDone('');
    if (target.key === 'words') setCards(dailyPlan(ownWords(words)).cards);
    if (target.key === 'sentences') {
      setPractice({ loading: true, items: [] });
      Promise.resolve().then(() => loadPractice?.()).then((result) => {
        const items = result?.items || [];
        setPractice({ loading: false, items });
        // nothing to practise after all: the step is skipped
        if (!items.length) skipStep('sentences');
      }).catch((error) => setPractice({ loading: false, items: [], error: error?.message || 'Harjutust ei saanud avada.' }));
    }
    setMode('run');
  };
  const start = () => begin(nextTodo());
  const finishStep = (key) => {
    if (!readOnly) onTick?.(key);
    setJustDone(key);
    onReact?.(key);
    petReact('done');
  };
  const goOn = () => {
    const next = nextTodo(justDone || current);
    if (next) { begin(next); return; }
    setMode('finale');
    onReact?.('finished');
    petReact('streak');
  };
  function skipStep(key) {
    const list = [...new Set([...skipped, key])];
    setSkipped(list);
    writeSkipped(today.date, list);
    const next = todo.find((item) => item.key !== key && !list.includes(item.key)) || null;
    if (next) begin(next); else setMode(doneCount ? 'finale' : 'overview');
  }
  const skip = () => skipStep(current);

  // a step finished somewhere else (homework submitted, a course sheet done) shows as done at once: the pet's moment
  const autoDone = mode === 'run' && step?.state === 'done' && current !== 'words' && current !== 'sentences';
  if (autoDone && justDone !== current) setJustDone(current);
  const shownMode = autoDone ? 'between' : mode;

  if (shownMode === 'finale') {
    return <section className="tn tn--focus" aria-label="Täna">
      <PetMoment pet={pet} stage={petStage} kind="finished" lang={lang} title="Täna on tehtud!">
        <ul className="tn-finale">
          <li><Check size={16} aria-hidden="true" /> {doneCount} / {active.length} sammu</li>
          {today.xp ? <li><Sparkles size={16} aria-hidden="true" /> +{today.xp} XP</li> : null}
          {streak ? <li><Flame size={16} aria-hidden="true" /> {streak} {streak === 1 ? 'päev' : 'päeva'} järjest</li> : null}
        </ul>
        <button type="button" className="tn-go" onClick={() => setMode('overview')}>Valmis</button>
      </PetMoment>
    </section>;
  }

  if (shownMode === 'between') {
    const next = nextTodo(justDone);
    return <section className="tn tn--focus" aria-label="Täna">
      <StepDots steps={active} current={next?.key || ''} />
      <PetMoment pet={pet} stage={petStage} kind={justDone} lang={lang}>
        <button type="button" className="tn-go" onClick={goOn}>{next ? <>Edasi: {next.label} <ChevronRight size={18} aria-hidden="true" /></> : 'Lõpeta päev'}</button>
      </PetMoment>
    </section>;
  }

  if (shownMode === 'run' && step) {
    return <section className="tn tn--focus tn--run" aria-label={`Täna: ${step.label}`}>
      <header className="tn-run__head">
        <StepDots steps={active} current={step.key} />
        <button type="button" className="tn-icon" onClick={() => setMode('overview')} aria-label="Paus"><Pause size={18} aria-hidden="true" /></button>
      </header>
      {step.key === 'homework' ? <div className="tn-step">
        <h2>{step.label} <small lang="ru">· {step.ru}</small></h2>
        <ul className="tn-tasks">{(step.queue || []).slice(0, 3).map((task) => <li key={task.id} className={task.kind === 'overdue' ? 'is-late' : ''}>
          <ListTodo size={17} aria-hidden="true" /><b>{task.title}</b>{task.due ? <small>{task.kind === 'overdue' ? 'tähtaeg oli ' : 'tähtaeg '}{task.due.slice(8, 10)}.{task.due.slice(5, 7)}</small> : <small />}
        </li>)}</ul>
        <p className="tn-step__hint">Tee ülesanne ära ja tule siia tagasi — samm märgitakse ise tehtuks.<span lang="ru"> · Сделай задание и вернись сюда.</span></p>
        <div className="tn-step__actions">
          <Link className="tn-go" to={step.to}>Ava ülesanne <ChevronRight size={18} aria-hidden="true" /></Link>
          <button type="button" className="tn-skip" onClick={skip}><SkipForward size={16} aria-hidden="true" /> Hiljem</button>
        </div>
      </div> : null}
      {step.key === 'words' ? <div className="tn-step tn-step--cards">
        {cards?.length ? <FlashcardSession key={`words-${today.date}`} cards={cards} language={language}
          onRate={readOnly ? undefined : (item, rating, nextSide) => rateWord(wordsService, words, item, rating, nextSide)}
          onFinish={() => finishStep('words')} onClose={() => { setJustDone('words'); setMode('between'); }} closeLabel="Edasi" />
          : <div className="tn-empty"><p>Täna pole ühtegi kaarti. Tubli!</p><button type="button" className="tn-go" onClick={skip}>Edasi</button></div>}
      </div> : null}
      {step.key === 'sentences' ? <div className="tn-step tn-step--practice">
        {practice?.loading ? <p className="tn-loading" role="status">Teen sulle harjutuse valmis…</p>
          : practice?.error ? <div className="tn-empty"><p role="alert">{practice.error}</p><button type="button" className="tn-go" onClick={skip}>Edasi</button></div>
            : practice?.items?.length ? <Suspense fallback={<p className="tn-loading" role="status">Laen…</p>}>
              <PracticeLesson key={`sentences-${today.date}`} items={practice.items} lang={lang === 'en' ? 'en' : 'ru'} onExit={() => setMode('overview')}
                onDone={() => { setJustDone('sentences'); setMode('between'); }} doneLabel="Edasi"
                onFinish={(summary, results) => {
                  finishStep('sentences');
                  if (readOnly) return;
                  results.forEach(({ item, verdict }) => {
                    const word = item.wordId ? words.find((entry) => entry.id === item.wordId) : null;
                    if (word) rateWord(wordsService, words, { word, dir: 'r' }, verdict === 'wrong' ? 'again' : 'good');
                  });
                }} />
            </Suspense> : null}
      </div> : null}
      {step.key === 'course' ? <div className="tn-step">
        <h2>{step.label} <small lang="ru">· {step.ru}</small></h2>
        <p className="tn-step__lead">{step.detail}</p>
        <p className="tn-step__hint">Tee kursusel üks leht ja tule tagasi — samm märgitakse ise tehtuks.</p>
        <div className="tn-step__actions">
          <Link className="tn-go" to={step.to}>Ava kursus <ChevronRight size={18} aria-hidden="true" /></Link>
          <button type="button" className="tn-skip" onClick={skip}><SkipForward size={16} aria-hidden="true" /> Hiljem</button>
        </div>
      </div> : null}
    </section>;
  }

  // overview: the one button and the day's steps
  const started = doneCount > 0;
  const left = todo.filter((item) => !skipped.includes(item.key));
  const pct = active.length ? Math.round((doneCount / active.length) * 100) : 0;
  return <section className={`tn ${plan.finished ? 'is-finished' : ''}`} aria-label="Täna">
    {plan.live ? <div className="tn-live" role="alert">
      <Video size={22} aria-hidden="true" />
      <div><strong>{plan.live.started ? 'Tund käib praegu' : `Tund algab kell ${plan.live.time}`}</strong><small>{[plan.live.teacher, `${plan.live.duration || 60} min`].filter(Boolean).join(' · ')}</small></div>
      <Link className="tn-live__go" to="/live-classroom">Ava tund</Link>
    </div> : null}
    <div className="tn-hero">
      <div className="tn-ring" style={{ '--tn-pct': `${pct}%` }} aria-hidden="true"><span>{plan.finished ? <Check size={26} /> : `${doneCount}/${active.length || 0}`}</span></div>
      <div className="tn-hero__text">
        <h2>{plan.finished ? 'Täna on kõik tehtud!' : active.length ? 'Täna' : 'Täna pole midagi teha'}</h2>
        <p>{plan.finished ? 'Tubli! Homme jätkame.' : active.length ? `${left.length ? `Umbes ${Math.max(1, left.reduce((sum, item) => sum + item.minutes, 0))} min` : 'Kõik, mis jäi, on edasi lükatud'} · eesmärk ${plan.goal} min päevas` : 'Tubli! Kui tahad, vaata kursust.'}
          <span lang="ru"> · {plan.finished ? 'всё сделано' : 'на сегодня'}</span></p>
      </div>
    </div>
    {active.length ? <ul className="tn-list">{active.map((item) => {
      const Icon = ICON[item.key] || Check;
      const later = item.state === 'todo' && skipped.includes(item.key);
      return <li key={item.key} className={item.state === 'done' ? 'is-done' : later ? 'is-later' : ''}>
        <span className="tn-list__icon">{item.state === 'done' ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}</span>
        <span className="tn-list__text"><b>{item.label}</b><small>{item.state === 'done' ? 'tehtud' : later ? 'hiljem' : item.detail}</small></span>
        <span className="sr-only">{item.state === 'done' ? 'tehtud' : 'teha'}</span>
      </li>;
    })}</ul> : null}
    {plan.finished ? <Link className="tn-more" to="/student/kursus">Vaata kursust <ChevronRight size={16} aria-hidden="true" /></Link>
      : left.length ? <button type="button" className="tn-start" onClick={start}><Play size={20} aria-hidden="true" /> {started ? 'Jätka' : 'Alusta tänast'}</button>
        : todo.length ? <button type="button" className="tn-start is-soft" onClick={() => { setSkipped([]); writeSkipped(today.date, []); begin(todo[0]); }}><Play size={20} aria-hidden="true" /> Tee ka edasilükatud</button>
          : <Link className="tn-more" to="/student/kursus">Vaata kursust <ChevronRight size={16} aria-hidden="true" /></Link>}
    {readOnly ? <p className="tn-note">Vaade: siit ei salvestata midagi.</p> : null}
  </section>;
}
