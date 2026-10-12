import { ArrowLeft, CheckCircle2, ClipboardCheck, Lock, Repeat } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Card, EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import { loadWordsForLessons } from './lessonWords.js';
import StudySession from './StudySession.jsx';
import {
  buildTopicTest, buildTopics, cycleProgress, gradeTopicTest, levelHasWords, nextCycleCards, readLearned, saveLearned,
  topicStates, wordsToAdd,
} from './topicModel.js';

const PREVIEW_WORDS = 5;

function TopicCheck({ test, onSubmit, onBack }) {
  const [answers, setAnswers] = useState({});
  const set = (id, value) => setAnswers((current) => ({ ...current, [id]: value }));
  return (
    <form className="vt-check" onSubmit={(event) => { event.preventDefault(); onSubmit(answers); }}>
      {test.match ? (
        <fieldset className="vt-match">
          <legend>Sobita sõna ja tähendus</legend>
          {test.match.cards.map((card) => (
            <label key={card.id}><strong lang="et">{card.front}</strong>
              <select aria-label={`Tähendus: ${card.front}`} value={answers[card.id] || ''} onChange={(event) => set(card.id, event.target.value)}>
                <option value="">— vali —</option>
                {test.match.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          ))}
        </fieldset>
      ) : null}
      <ol className="vt-questions">
        {test.questions.map((question) => (
          <li key={question.id}>
            <small>{question.kind === 'choice' ? 'Vali tähendus' : 'Kirjuta eesti keeles'}</small>
            <strong lang={question.kind === 'choice' ? 'et' : undefined}>{question.ask}</strong>
            {question.kind === 'choice' ? (
              <div className="vs-choices">{question.options.map((option) => (
                <button type="button" key={option} aria-pressed={answers[question.id] === option} onClick={() => set(question.id, option)}>{option}</button>
              ))}</div>
            ) : <input aria-label={`Vastus: ${question.ask}`} value={answers[question.id] || ''} onChange={(event) => set(question.id, event.target.value)} placeholder="Kirjuta sõna…" autoComplete="off" spellCheck="false" lang="et" />}
          </li>
        ))}
      </ol>
      <div className="vs-row">
        <button type="button" className="vw-btn" onClick={onBack}><ArrowLeft size={15} /> Tagasi</button>
        <button type="submit" className="vw-btn is-primary">Vaata tulemust</button>
      </div>
    </form>
  );
}

/**
 * „Teemad” (owner, 2026-10-13): every word of the course level, topic by topic. The open topic: „Kordamine” (Õpi, ten
 * words at a time, until every word is learned once), then „Kinnita teadmisi” (14 words, ≥ 80 %) — its words go to
 * „Minu sõnad” and the next topic opens. Later topics are locked.
 */
export default function TopicsSection({ catalog, studentId = '', studentLevel = '', words = [], wordsService, user, preview = false, loadWords = loadWordsForLessons, storage = globalThis.localStorage }) {
  const levels = useMemo(() => (catalog?.levels || []).filter(levelHasWords), [catalog]);
  const [level, setLevel] = useState('');
  const shownLevel = level || levels.find((entry) => entry.key === studentLevel || entry.label === studentLevel)?.key || levels[0]?.key || '';
  const levelEntry = levels.find((entry) => entry.key === shownLevel);
  const [loaded, setLoaded] = useState({ level: '', words: null, error: '' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!levelEntry) return undefined;
    let alive = true;
    loadWords(levelEntry.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)))
      .then((map) => { if (alive) setLoaded({ level: levelEntry.key, words: map, error: '' }); })
      .catch((error) => { if (alive) setLoaded({ level: levelEntry.key, words: null, error: error?.message || 'Sõnu ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [levelEntry, loadWords, attempt]);
  const topics = useMemo(() => (loaded.words && loaded.level === shownLevel ? topicStates(buildTopics(levelEntry, loaded.words, studentId), words) : null),
    [loaded, shownLevel, levelEntry, studentId, words]);

  const [learned, setLearned] = useState({});
  const learnedOf = (topic) => learned[topic.key] || readLearned(studentId, topic.key, storage);
  const [view, setView] = useState(null); // { topicKey, kind: 'cycle' | 'test', deck?, test? }
  const [result, setResult] = useState(null); // { topicKey, score, total, percent, passed, missed, added, error }
  const [saving, setSaving] = useState(false);
  const active = topics?.find((topic) => topic.key === view?.topicKey);

  const startCycle = (topic) => { setResult(null); setView({ topicKey: topic.key, kind: 'cycle', deck: nextCycleCards(topic, learnedOf(topic)) }); };
  const startTest = (topic) => { setResult(null); setView({ topicKey: topic.key, kind: 'test', test: buildTopicTest(topic) }); };
  const learnDone = (topic, deck) => {
    const next = [...new Set([...learnedOf(topic), ...deck.map((card) => card.id)])];
    saveLearned(studentId, topic.key, next, storage);
    setLearned((current) => ({ ...current, [topic.key]: next }));
  };
  const submitTest = async (topic, answers) => {
    const graded = gradeTopicTest(view.test, answers);
    setView(null);
    if (!graded.passed) { setResult({ topicKey: topic.key, ...graded }); return; }
    if (preview) { setResult({ topicKey: topic.key, ...graded, added: 0, error: 'Eelvaates sõnu ei salvestata.' }); return; }
    setSaving(true);
    try {
      const items = wordsToAdd(topic, words);
      if (items.length) await wordsService.addLessonWords({ studentId, items, user });
      setResult({ topicKey: topic.key, ...graded, added: items.length });
    } catch (error) {
      setResult({ topicKey: topic.key, ...graded, added: 0, error: error?.message || 'Sõnu ei saanud salvestada. Proovi uuesti.' });
    } finally { setSaving(false); }
  };

  if (!levels.length) return null;
  const header = (
    <div className="section-heading"><div><span className="eyebrow">Teemad</span><h2>Kõik kursuse sõnad</h2></div>
      {view ? null : <select className="vd-level" aria-label="Teemade tase" value={shownLevel} onChange={(event) => { setLevel(event.target.value); setResult(null); }}>{levels.map((entry) => <option key={entry.key} value={entry.key}>{entry.label}</option>)}</select>}
    </div>
  );

  if (view && active) {
    return (
      <Card className="vt-topics">
        {header}
        {view.kind === 'cycle' ? (
          <>
            <p className="vw-muted">Kordamine: {cycleProgress(active, learnedOf(active)).learned}/{active.words.length} sõna õpitud. Kui kõik sõnad on õpitud, saad teadmisi kinnitada.</p>
            <StudySession key={`${active.key}-${view.deck.map((card) => card.id).join()}`} deck={view.deck} title={`${active.title} · Kordamine`} initialMode="learn"
              onLearnDone={(deck) => learnDone(active, deck)} onBack={() => setView(null)} />
          </>
        ) : <>
          <p className="vw-muted"><strong>{active.title}</strong> · Kinnita teadmisi: {view.test.total} küsimust, läbimiseks vähemalt 80 %.</p>
          <TopicCheck test={view.test} onBack={() => setView(null)} onSubmit={(answers) => submitTest(active, answers)} />
        </>}
      </Card>
    );
  }

  return (
    <Card className="vt-topics">
      {header}
      {loaded.error && loaded.level === shownLevel ? <ErrorState message={loaded.error} onRetry={() => setAttempt((value) => value + 1)} />
        : !topics ? <LoadingState label="Laen teemade sõnu…" />
          : !topics.length ? <EmptyState title="Selle taseme sõnu veel ei ole" />
            : (
              <>
                <p className="vw-muted">Läbitud {topics.filter((topic) => topic.state === 'passed').length}/{topics.length} teemat. Uus teema avaneb, kui eelmise sõnad on korratud ja teadmised kinnitatud.</p>
                {saving ? <LoadingState label="Salvestan sõnu…" /> : null}
                <ol className="vt-list">{topics.map((topic, index) => {
                  const cycle = cycleProgress(topic, learnedOf(topic));
                  const shown = result?.topicKey === topic.key ? result : null;
                  return (
                    <li key={topic.key} className={`vt-topic is-${topic.state}`}>
                      <div className="vt-topic__head">
                        {topic.state === 'passed' ? <CheckCircle2 size={18} aria-hidden="true" /> : topic.state === 'locked' ? <Lock size={18} aria-hidden="true" /> : <span className="vt-num" aria-hidden="true">{index + 1}</span>}
                        <span><strong>{topic.title}</strong><small>{topic.words.length} sõna · {topic.state === 'passed' ? 'läbitud' : topic.state === 'open' ? 'avatud' : 'lukus'}</small></span>
                      </div>
                      {topic.state === 'locked' ? <p className="vt-preview" aria-label="Eelvaade">{topic.words.slice(0, PREVIEW_WORDS).map((word) => word.et).join(', ')}…</p> : null}
                      {topic.state === 'open' ? (
                        <div className="vt-open">
                          <div className="vs-progress" aria-label="Kordamine"><i style={{ width: `${Math.round((cycle.learned / cycle.total) * 100)}%` }} /><span>{cycle.learned}/{cycle.total}</span></div>
                          <div className="vw-actions">
                            <button type="button" className={`vw-btn ${cycle.done ? '' : 'is-primary'}`} onClick={() => startCycle(topic)}><Repeat size={15} /> {cycle.done ? 'Korda veel' : cycle.learned ? 'Jätka kordamist' : 'Kordamine'}</button>
                            <button type="button" className={`vw-btn ${cycle.done ? 'is-primary' : ''}`} disabled={!cycle.done || saving} onClick={() => startTest(topic)} title={cycle.done ? '' : 'Enne korda kõik sõnad'}><ClipboardCheck size={15} /> Kinnita teadmisi</button>
                          </div>
                        </div>
                      ) : null}
                      {shown ? (
                        <div className={`vt-result ${shown.passed ? 'is-passed' : 'is-failed'}`} role="status">
                          <strong>{shown.score}/{shown.total} ({shown.percent} %) — {shown.passed ? 'teema läbitud!' : 'veel mitte, vaja on 80 %.'}</strong>
                          {shown.passed && !shown.error ? <span>{shown.added ? `${shown.added} sõna lisati sinu sõnade hulka.` : 'Sõnad on sinu sõnade hulgas.'} Järgmine teema on avatud.</span> : null}
                          {shown.error ? <span className="vw-error">{shown.error}</span> : null}
                          {!shown.passed && shown.missed.length ? <ul className="vs-missed">{shown.missed.map((card) => <li key={card.id}><b>{card.front}</b> — {card.back}</li>)}</ul> : null}
                          {!shown.passed && topic.state === 'open' ? <button type="button" className="vw-btn" onClick={() => startTest(topic)}>Proovi uuesti</button> : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}</ol>
              </>
            )}
    </Card>
  );
}
