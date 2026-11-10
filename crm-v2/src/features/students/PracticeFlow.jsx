import { Check, ChevronRight, Flame, GraduationCap, Languages, ListTodo, MessageSquareQuote, Pause, Play, SkipForward, Sparkles, Video } from 'lucide-react';
import { Suspense, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { lazyComponent } from '../../app/lazyComponent.js';
import { Badge, Button, Card } from '../../components/ui/index.js';
import FlashcardSession from '../vocabulary/FlashcardSession.jsx';
import { dailyPlan, rateWord } from '../vocabulary/dailyReview.js';
import { petSvg } from '../pet/petArt.js';
import { thanksLine } from '../pet/petLoop.js';
import { seasonalWear } from '../pet/petLife.js';
import { petReact } from '../pet/petEvents.js';
import { ownWords } from './nextStep.js';
import './practiceFlow.css';

// the practice lesson (tiles, drag and drop) loads when the sentences step starts, not with the page
const PracticeLesson = lazyComponent(() => import('../practice/PracticeLesson.jsx'));

const ICON = { homework: ListTodo, words: Languages, sentences: MessageSquareQuote, course: GraduationCap };
const skipKey = (date) => `ks-harjuta-skip-${date}`;
const readSkipped = (date) => { try { return JSON.parse(globalThis.sessionStorage?.getItem(skipKey(date)) || '[]'); } catch { return []; } };
const writeSkipped = (date, list) => { try { globalThis.sessionStorage?.setItem(skipKey(date), JSON.stringify(list)); } catch { /* private mode */ } };

function PetFace({ pet, stage = 1, mood = 'happy' }) {
  if (!pet?.kind || pet.optedOut) return <span className="pf-pet pf-pet--none" aria-hidden="true"><Sparkles size={30} /></span>;
  const { bg: _bg, ...worn } = pet.wearing || {};
  return <span className="pf-pet" aria-hidden="true" dangerouslySetInnerHTML={{ __html: petSvg(pet.kind, mood, stage, seasonalWear(worn)) }} />;
}

/** The pet between two steps and at the end: its thanks (the pet's own bubble), then one button on. */
function PetMoment({ pet, stage, kind, lang, title, children }) {
  const line = thanksLine(kind, lang);
  return <div className="pf-moment" role="status">
    <PetFace pet={pet} stage={stage} mood={kind === 'finished' ? 'proud' : 'happy'} />
    <div className="pf-moment__talk">
      {title ? <h2>{title}</h2> : null}
      <div className="pet-bubble pf-bubble" lang={line.lang}><p>{pet?.kind && !pet.optedOut ? <b>{pet.name}: </b> : null}{line.text}</p><small lang="ru">{line.hint}</small></div>
      {children}
    </div>
  </div>;
}

/** Step N of M while the flow runs; pause goes back to the list. */
function RunHead({ steps, current, onPause }) {
  const index = steps.findIndex((item) => item.key === current);
  const step = steps[index];
  return <header className="pf-run__head">
    <div><span className="eyebrow">Samm {index + 1} / {steps.length}</span><h2>{step?.label}</h2></div>
    <Button variant="secondary" onClick={onPause}><Pause size={16} aria-hidden="true" /> Paus</Button>
  </header>;
}

/**
 * „Harjuta” (owner 2026-11-09): ONE button runs the day's practice in order (students/nextStep.js todaySteps), each step
 * ticked when done; empty steps are skipped; the pet reacts after each step and thanks at the end. The cabinet's own
 * Card / Button / Badge look; no text links. Props:
 *   plan        todaySteps() result; today: { date, done, xp } (practice/progress.js); streak
 *   onTick(key) a step was really finished (stored by the page); loadPractice() → Promise<{ items }> for the sentences step
 *   words / wordsService  his words and the service that moves them on their schedule; readOnly = staff preview
 *   onReact(kind)  tells the pet card what just happened
 */
export default function PracticeFlow({
  plan, today, streak = 0, pet = null, petStage = 1, lang = 'et', language = '', words = [], wordsService, readOnly = false,
  loadPractice, onTick, onReact,
}) {
  const active = useMemo(() => plan.steps.filter((step) => step.state !== 'empty'), [plan]);
  const [mode, setMode] = useState('overview'); // overview | run | between | finale
  const [current, setCurrent] = useState('');
  const [justDone, setJustDone] = useState('');
  const [skipped, setSkipped] = useState(() => readSkipped(today.date));
  const [cards, setCards] = useState(null);
  const [practice, setPractice] = useState(null); // { loading, items, error }

  const todo = plan.steps.filter((step) => step.state === 'todo');
  const nextTodo = (after = '') => todo.find((step) => step.key !== after && !skipped.includes(step.key)) || null;
  const step = plan.steps.find((item) => item.key === current) || null;
  const doneCount = active.filter((item) => item.state === 'done').length;

  function begin(target) {
    if (!target) { setMode(doneCount ? 'finale' : 'overview'); return; }
    setCurrent(target.key);
    setJustDone('');
    if (target.key === 'words') setCards(dailyPlan(ownWords(words)).cards);
    if (target.key === 'sentences') {
      setPractice({ loading: true, items: [] });
      Promise.resolve().then(() => loadPractice?.()).then((result) => {
        const items = result?.items || [];
        setPractice({ loading: false, items });
        if (!items.length) skipStep('sentences'); // nothing to practise after all
      }).catch((error) => setPractice({ loading: false, items: [], error: error?.message || 'Harjutust ei saanud avada.' }));
    }
    setMode('run');
  }
  function skipStep(key) {
    const list = [...new Set([...skipped, key])];
    setSkipped(list);
    writeSkipped(today.date, list);
    const next = todo.find((item) => item.key !== key && !list.includes(item.key)) || null;
    if (next) begin(next); else setMode(doneCount ? 'finale' : 'overview');
  }
  const skip = () => skipStep(current);
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

  // a step finished somewhere else (homework submitted, a course sheet done) shows as done at once: the pet's moment
  const autoDone = mode === 'run' && step?.state === 'done' && current !== 'words' && current !== 'sentences';
  if (autoDone && justDone !== current) setJustDone(current);
  const shownMode = autoDone ? 'between' : mode;

  if (shownMode === 'finale') {
    return <Card className="pf" aria-label="Harjuta">
      <PetMoment pet={pet} stage={petStage} kind="finished" lang={lang} title="Täna on tehtud!">
        <div className="pf-badges">
          <Badge tone="success"><Check size={14} aria-hidden="true" /> {doneCount} / {active.length} sammu</Badge>
          {today.xp ? <Badge tone="info"><Sparkles size={14} aria-hidden="true" /> +{today.xp} XP</Badge> : null}
          {streak ? <Badge tone="neutral"><Flame size={14} aria-hidden="true" /> {streak} {streak === 1 ? 'päev' : 'päeva'} järjest</Badge> : null}
        </div>
        <Button onClick={() => setMode('overview')}>Valmis</Button>
      </PetMoment>
    </Card>;
  }

  if (shownMode === 'between') {
    const next = nextTodo(justDone);
    return <Card className="pf" aria-label="Harjuta">
      <PetMoment pet={pet} stage={petStage} kind={justDone} lang={lang}>
        <Button onClick={goOn}>{next ? <>Edasi: {next.label} <ChevronRight size={16} aria-hidden="true" /></> : 'Lõpeta päev'}</Button>
      </PetMoment>
    </Card>;
  }

  if (shownMode === 'run' && step) {
    return <Card className="pf pf--run" aria-label={`Harjuta: ${step.label}`}>
      <RunHead steps={active} current={step.key} onPause={() => setMode('overview')} />
      {step.key === 'homework' ? <div className="pf-step">
        <ul className="pf-tasks">{(step.queue || []).slice(0, 3).map((task) => <li key={task.id}>
          <ListTodo size={17} aria-hidden="true" /><b>{task.title}</b>{task.kind === 'overdue' || task.kind === 'old' ? <Badge tone="neutral">hilinenud</Badge> : task.due ? <Badge tone="neutral">tähtaeg {task.due.slice(8, 10)}.{task.due.slice(5, 7)}</Badge> : <span />}
        </li>)}</ul>
        <p className="form-hint">Tee ülesanne ära ja tule tagasi — samm märgitakse ise tehtuks.</p>
        <div className="pf-actions">
          {/* the first task of the one order opens itself (a sheet starts, word cards open here); the rest wait in „Ülesanded” */}
          <Link className="button button--primary" to={step.to}>{step.queue?.[0]?.to?.startsWith('/student/harjuta') ? 'Ava kaardid' : 'Ava ülesanne'} <ChevronRight size={16} aria-hidden="true" /></Link>
          <Button variant="secondary" onClick={skip}><SkipForward size={16} aria-hidden="true" /> Hiljem</Button>
        </div>
      </div> : null}
      {step.key === 'words' ? <div className="pf-step">
        {cards?.length ? <FlashcardSession key={`words-${today.date}`} cards={cards} language={language}
          onRate={readOnly ? undefined : (item, rating, nextSide) => rateWord(wordsService, words, item, rating, nextSide)}
          onFinish={() => finishStep('words')} onClose={() => { setJustDone('words'); setMode('between'); }} closeLabel="Edasi" />
          : <div className="pf-actions"><p>Täna pole ühtegi kaarti. Tubli!</p><Button onClick={skip}>Edasi</Button></div>}
      </div> : null}
      {step.key === 'sentences' ? <div className="pf-step">
        {practice?.loading ? <p className="form-hint" role="status">Teen sulle harjutuse valmis…</p>
          : practice?.error ? <div className="pf-actions"><p role="alert">{practice.error}</p><Button onClick={skip}>Edasi</Button></div>
            : practice?.items?.length ? <Suspense fallback={<p className="form-hint" role="status">Laen…</p>}>
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
      {step.key === 'course' ? <div className="pf-step">
        <p><b>{step.detail}</b></p>
        <p className="form-hint">Tee kursusel üks leht ja tule tagasi — samm märgitakse ise tehtuks.</p>
        <div className="pf-actions">
          <Link className="button button--primary" to={step.to}>Ava kursus <ChevronRight size={16} aria-hidden="true" /></Link>
          <Button variant="secondary" onClick={skip}><SkipForward size={16} aria-hidden="true" /> Hiljem</Button>
        </div>
      </div> : null}
    </Card>;
  }

  // overview: the day's steps and the one button
  const left = todo.filter((item) => !skipped.includes(item.key));
  const pct = active.length ? Math.round((doneCount / active.length) * 100) : 0;
  return <Card className={`pf ${plan.finished ? 'is-finished' : ''}`} aria-label="Harjuta">
    {plan.live ? <div className="pf-live" role="alert">
      <Video size={20} aria-hidden="true" />
      <div><strong>{plan.live.started ? 'Tund käib praegu' : `Tund algab kell ${plan.live.time}`}</strong><small>{[plan.live.teacher, `${plan.live.duration || 60} min`].filter(Boolean).join(' · ')}</small></div>
      <Link className="button button--primary" to="/live-classroom">Ava tund</Link>
    </div> : null}
    <div className="section-heading pf-head">
      <div><span className="eyebrow">Täna</span><h2>{plan.finished ? 'Kõik on tehtud!' : active.length ? `${doneCount} / ${active.length} sammu tehtud` : 'Täna pole midagi harjutada'}</h2></div>
      {left.length ? <Badge tone="neutral">~{Math.max(1, left.reduce((sum, item) => sum + item.minutes, 0))} min</Badge> : null}
    </div>
    {active.length ? <div className="pf-meter" role="progressbar" aria-label="Tänane harjutus" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div> : null}
    {active.length ? <ul className="pf-list">{active.map((item) => {
      const Icon = ICON[item.key] || Check;
      const later = item.state === 'todo' && skipped.includes(item.key);
      return <li key={item.key} className={item.state === 'done' ? 'is-done' : ''}>
        <span className="pf-list__icon">{item.state === 'done' ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}</span>
        <span className="pf-list__text"><b>{item.label}</b><small>{item.state === 'done' ? 'Tehtud' : later ? 'Hiljem' : item.detail}</small></span>
        {item.state === 'done' ? <Badge tone="success">Tehtud</Badge> : later ? <Badge tone="neutral">Hiljem</Badge> : item.minutes ? <Badge tone="neutral">~{item.minutes} min</Badge> : <span />}
      </li>;
    })}</ul> : <p className="form-hint">Sõnu, lauseid ega ülesandeid täna ei oota. Kursusel saad alati edasi minna.</p>}
    <div className="pf-actions">
      {plan.finished || !todo.length ? <Link className="button button--secondary" to="/student/kursus">Vaata kursust <ChevronRight size={16} aria-hidden="true" /></Link>
        : left.length ? <Button className="pf-start" onClick={() => begin(nextTodo())}><Play size={18} aria-hidden="true" /> {doneCount ? 'Jätka' : 'Alusta tänast'}</Button>
          : <Button variant="secondary" onClick={() => { setSkipped([]); writeSkipped(today.date, []); begin(todo[0]); }}><Play size={18} aria-hidden="true" /> Tee ka edasilükatud</Button>}
    </div>
    {readOnly ? <p className="form-hint">Vaade: siit ei salvestata midagi.</p> : null}
  </Card>;
}
