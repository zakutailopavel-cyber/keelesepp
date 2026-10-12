import { ArrowLeft, Check, ChevronRight, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { lessonsService, lessonWorksheetsService, libraryService, studentsService } from '../../services/firebase/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { buildTopicCatalog } from '../calendar/lessonTopic.js';
import { petReact } from '../pet/petEvents.js';
import { deckFromSheets, deckFromWords } from '../vocabulary/deckModel.js';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { keyForms, loadWordForms } from '../vocabulary/wordForms.js';
import { buildReview, checkTask, ERROR_PREFIX, heldLessons, ownErrors } from './reviewModel.js';
import { readDone, saveDone } from './reviewStore.js';
import './selfStudy.css';

/**
 * „Kordamine” (owner 2026-10-12): the course worksheets stay for the lesson with the teacher. Here the student repeats
 * only what was already held — a short drill per held lesson (words, three forms, his own corrected sentences), one
 * task at a time, checked at once. A lesson not yet held is not shown.
 */
export default function SelfStudyPage({
  studentRepository = studentsService, lessonRepository = lessonsService, catalogRepository = libraryService,
  worksheetRepository = lessonWorksheetsService, wordsService = studentWordsService, formsLoader = loadWordForms,
}) {
  const { user, preview } = useAuth();
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const [lessonLists, curriculum] = await Promise.all([
      Promise.all(students.map((student) => lessonRepository.listByStudent(student.id).catch(() => []))),
      catalogRepository.listCurriculum(),
    ]);
    return { students, held: heldLessons(lessonLists.flat(), buildTopicCatalog(curriculum)) };
  }, [preview?.studentId, user.uid]);
  const students = useMemo(() => state.data?.students || [], [state.data]);
  const words = useStudentWords(students.map((student) => student.id), wordsService);
  const [dictionary, setDictionary] = useState({});
  const [drill, setDrill] = useState(null); // { key, title, tasks, loading, error }
  const [done, setDone] = useState(() => readDone(user?.uid));

  useEffect(() => { let live = true; formsLoader().then((forms) => live && setDictionary(forms || {})); return () => { live = false; }; }, [formsLoader]);

  const errors = useMemo(() => ownErrors(words), [words]);
  const myCards = useMemo(() => deckFromWords(words.filter((word) => !String(word.translation || '').startsWith(ERROR_PREFIX))), [words]);
  const forms = (word) => keyForms(word, '', dictionary);
  const today = new Date().toISOString().slice(0, 10);

  if (state.loading) return <div className="page-content"><LoadingState label="Laen kordamist…" /></div>;
  if (state.error) return <div className="page-content"><ErrorState message={state.error.message || String(state.error)} onRetry={state.reload} /></div>;
  if (!students.length) return <div className="page-content"><Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" /></Card></div>;
  const held = state.data.held;
  const title = (lesson) => `${lesson.number ? `${lesson.number}. ` : ''}${lesson.title}`;

  const start = async (key, label, lessons, extraCards = [], errorCount = 2) => {
    const base = { key, title: label, lessons, extra: extraCards, errorCount, run: Date.now() };
    setDrill({ ...base, loading: true, tasks: [] });
    try {
      const decks = await Promise.all(lessons.map((lesson) => worksheetRepository.list(lesson.id).then((records) => deckFromSheets(records, lesson.id)).catch(() => [])));
      const cards = [...decks.flat(), ...extraCards];
      const picked = errorCount ? errors.slice(0, errorCount) : [];
      const tasks = buildReview({ cards, forms, errors: picked, seed: Date.now() % 100000, size: 10 });
      setDrill({ ...base, loading: false, tasks, error: tasks.length ? '' : 'Selle tunni kohta ei ole veel kordamist.' });
    } catch (error) {
      setDrill({ ...base, loading: false, tasks: [], error: error?.message || 'Kordamist ei saanud koostada.' });
    }
  };

  const finish = (pct) => {
    if (preview || !drill) return;
    setDone(saveDone(user?.uid, drill.key, { date: today, pct }));
  };

  if (drill) {
    return <div className="page-content">
      <button type="button" className="ss-back" onClick={() => setDrill(null)}><ArrowLeft size={16} /> Kordamine</button>
      {drill.loading ? <LoadingState label="Koostan ülesandeid…" />
        : drill.error ? <Card><EmptyState title={drill.error} /></Card>
          : <Drill key={drill.run} title={drill.title} tasks={drill.tasks} onFinish={finish} onAgain={() => start(drill.key, drill.title, drill.lessons, drill.extra, drill.errorCount)} onClose={() => setDrill(null)} />}
    </div>;
  }

  const recent = held.slice(0, 3);
  const doneToday = Object.values(done).some((entry) => entry?.date === today);
  return <div className="page-content">
    <PageHeader eyebrow="Minu õpingud" title="Kordamine" description="Korda seda, mida tunnis juba tegime: sõnad, vormid ja sinu enda laused. 5–10 minutit päevas." />
    {recent.length || errors.length ? <section className="ss-hero" aria-label="Tänane kordamine">
      <div><span className="eyebrow">{doneToday ? 'Täna tehtud ✓' : 'Tänane kordamine'}</span>
        <h2>{recent.length ? `Viimased tunnid: ${recent.map((lesson) => lesson.title).join(', ')}` : 'Sinu laused tunnist'}</h2>
        <p>Umbes 7 minutit · 10 ülesannet{errors.length ? ` · ${Math.min(errors.length, 3)} sinu lauset` : ''}</p></div>
      <button type="button" className="ss-hero__go" onClick={() => start('mix', 'Tänane kordamine', recent, myCards.slice(0, 12), 3)}><Play size={18} /> Alusta</button>
    </section> : null}
    {errors.length ? <Card>
      <div className="section-heading"><div><span className="eyebrow">Minu vead</span><h2>{errors.length} parandatud lauset</h2></div>
        <button type="button" className="ss-btn" onClick={() => start('errors', 'Minu vead', [], [], 10)}><Sparkles size={15} /> Harjuta</button></div>
      <p className="ss-muted">Laused, mida ütlesid tunnis valesti. Vali õige ja pane lause kokku.</p>
    </Card> : null}
    <Card>
      <div className="section-heading"><div><span className="eyebrow">Tunnid õpetajaga</span><h2>{held.length ? `${held.length} tundi korrata` : 'Tunde veel ei ole'}</h2></div></div>
      {held.length ? <div className="ss-lessons">{held.map((lesson) => {
        const entry = done[`lesson:${lesson.id}`];
        return <button type="button" key={lesson.id} className={`ss-lesson ${entry ? 'is-done' : ''}`} onClick={() => start(`lesson:${lesson.id}`, title(lesson), [lesson])}>
          <span><strong>{title(lesson)}</strong><small>{lesson.moduleTitle}{lesson.heldAt ? ` · tund ${lesson.heldAt}` : ''}</small></span>
          <span className="ss-badge">{entry ? `${entry.pct}%` : 'Korda'}</span>
          <ChevronRight size={16} />
        </button>;
      })}</div> : <EmptyState title="Kordamine avaneb pärast esimest tundi" description="Uued teemad teeme koos õpetajaga. Pärast tundi saad siin sõnu ja vorme korrata." />}
    </Card>
  </div>;
}

function Drill({ title, tasks, onFinish, onAgain, onClose }) {
  const [index, setIndex] = useState(0);
  const [given, setGiven] = useState('');
  const [pair, setPair] = useState(['', '']);
  const [picked, setPicked] = useState([]);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const task = tasks[index];
  const finished = index >= tasks.length;

  useEffect(() => {
    if (!finished) return;
    const pct = Math.round((score / Math.max(1, tasks.length)) * 100);
    onFinish(pct);
    petReact('done');
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (finished) {
    const pct = Math.round((score / Math.max(1, tasks.length)) * 100);
    return <section className="ss-drill ss-drill--end">
      <span className="ss-drill__big">{pct >= 80 ? '🎉' : '💪'}</span>
      <h2>{score}/{tasks.length} õigesti</h2>
      <p>{pct >= 80 ? 'Väga hea! Tunni teema on kindel.' : 'Hea algus. Korda veel kord, siis läheb kergemini.'}</p>
      <div className="ss-drill__actions"><button type="button" className="ss-btn ss-btn--ghost" onClick={onAgain}><RotateCcw size={15} /> Uuesti</button><button type="button" className="ss-btn" onClick={onClose}>Valmis</button></div>
    </section>;
  }

  const answer = (value) => {
    if (result) return;
    const verdict = checkTask(task, value);
    setResult(verdict);
    if (verdict !== 'wrong') setScore((current) => current + 1);
    petReact(verdict === 'wrong' ? 'wrong' : 'correct');
  };
  const next = () => { setIndex((current) => current + 1); setGiven(''); setPair(['', '']); setPicked([]); setResult(null); };
  const shown = Array.isArray(task.answer) ? task.answer.join(', ') : task.answer;
  const LABEL = { meaning: 'Mida see tähendab?', recall: 'Kirjuta eesti keeles', forms: 'Kirjuta omastav ja osastav', fix: 'Milline lause on õige?', order: 'Pane lause kokku' };

  return <section className="ss-drill" aria-label={title}>
    <div className="ss-drill__top"><strong>{title}</strong><span>{index + 1}/{tasks.length}</span></div>
    <div className="ss-drill__bar"><i style={{ width: `${(index / tasks.length) * 100}%` }} /></div>
    <p className="ss-drill__label">{LABEL[task.kind]}</p>
    {task.ask ? <h2 className="ss-drill__ask">{task.ask}{task.hint ? <small> — {task.hint}</small> : null}</h2> : null}

    {task.kind === 'meaning' || task.kind === 'fix' ? <div className="ss-options">{task.options.map((option) => {
      const state = result ? (option === task.answer ? 'is-right' : option === given ? 'is-wrong' : '') : '';
      return <button type="button" key={option} className={`ss-option ${state}`} disabled={Boolean(result)} onClick={() => { setGiven(option); answer(option); }}>{option}</button>;
    })}</div> : null}

    {task.kind === 'recall' ? <form className="ss-write" onSubmit={(event) => { event.preventDefault(); answer(given); }}>
      <input aria-label="Vastus" autoFocus value={given} disabled={Boolean(result)} onChange={(event) => setGiven(event.target.value)} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
      {!result ? <button type="submit" className="ss-btn" disabled={!given.trim()}>Kontrolli</button> : null}
    </form> : null}

    {task.kind === 'forms' ? <form className="ss-write ss-write--two" onSubmit={(event) => { event.preventDefault(); answer(pair); }}>
      <label>Omastav (kelle? mille?)<input aria-label="Omastav" autoFocus value={pair[0]} disabled={Boolean(result)} onChange={(event) => setPair([event.target.value, pair[1]])} autoCapitalize="off" spellCheck={false} /></label>
      <label>Osastav (keda? mida?)<input aria-label="Osastav" value={pair[1]} disabled={Boolean(result)} onChange={(event) => setPair([pair[0], event.target.value])} autoCapitalize="off" spellCheck={false} /></label>
      {!result ? <button type="submit" className="ss-btn" disabled={!pair[0].trim() || !pair[1].trim()}>Kontrolli</button> : null}
    </form> : null}

    {task.kind === 'order' ? <div className="ss-order">
      <p className="ss-order__line">{picked.map((i) => task.pieces[i]).join(' ') || '…'}</p>
      <div className="ss-options ss-options--chips">{task.pieces.map((piece, i) => <button type="button" key={`${piece}-${i}`} className="ss-option" disabled={picked.includes(i) || Boolean(result)} onClick={() => setPicked([...picked, i])}>{piece}</button>)}</div>
      {!result ? <div className="ss-drill__actions"><button type="button" className="ss-btn ss-btn--ghost" onClick={() => setPicked([])} disabled={!picked.length}>Tühjenda</button><button type="button" className="ss-btn" disabled={picked.length !== task.pieces.length} onClick={() => answer(picked.map((i) => task.pieces[i]).join(' '))}>Kontrolli</button></div> : null}
    </div> : null}

    {result ? <div className={`ss-result is-${result}`} role="status">
      {result === 'wrong' ? <X size={18} /> : <Check size={18} />}
      <span>{result === 'right' ? 'Õige!' : result === 'almost' ? `Peaaegu: ${shown}` : `Õige vastus: ${shown}`}</span>
      <button type="button" className="ss-btn" autoFocus onClick={next}>{index + 1 < tasks.length ? 'Edasi' : 'Lõpeta'} <ChevronRight size={15} /></button>
    </div> : null}
  </section>;
}

