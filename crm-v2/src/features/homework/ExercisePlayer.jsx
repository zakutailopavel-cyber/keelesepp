import { CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Modal, Select } from '../../components/ui/index.js';
import { evaluateExercise, exerciseProgress, exerciseTypeLabel, parseExerciseFill } from './exercisePlayer.js';

function options(question) { return question.options || question.opts || []; }
function questionText(question) { return question.question || question.q || question.prompt || 'Küsimus'; }
function left(pair) { return pair.l || pair.left || pair.from || pair.source || ''; }
function right(pair) { return pair.r || pair.right || pair.to || pair.translation || ''; }

export default function ExercisePlayer({ exercise, homework, repository, user, onClose, onCompleted }) {
  const [answers, setAnswers] = useState({});
  const [picked, setPicked] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const type = exercise.type || 'fill';
  const progress = useMemo(() => exerciseProgress(exercise, answers), [answers, exercise]);
  const orderWords = useMemo(() => String(exercise.sentence || exercise.text || '').split(/\s+/).filter(Boolean).map((word, index) => ({ word, index })).reverse(), [exercise.sentence, exercise.text]);
  const set = (key, value) => setAnswers((current) => ({ ...current, [key]: value }));
  const submittedScore = result?.total ? Math.round((result.correct / result.total) * 100) : null;

  const pickWord = (word) => {
    const next = [...picked, word];
    setPicked(next);
    set('sentence', next.map((item) => item.word).join(' '));
  };
  const removeWord = (index) => {
    const next = picked.filter((_, itemIndex) => itemIndex !== index);
    setPicked(next);
    set('sentence', next.map((item) => item.word).join(' '));
  };

  const submit = async () => {
    if (progress.total && progress.answered < progress.total) { setError(`Vasta kõigile küsimustele (${progress.answered}/${progress.total}).`); return; }
    setSaving(true); setError('');
    try {
      const nextResult = evaluateExercise(exercise, answers);
      await repository.submitExerciseResult({ exercise, homework, result: nextResult, user });
      setResult(nextResult); setSubmitted(true); onCompleted?.();
    } catch (submitError) { setError(submitError.message || 'Tulemuse salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  return <Modal open title={exercise.title || homework.exerciseTitle || 'Harjutus'} onClose={onClose} className="modal--exercise" footer={submitted ? <Button variant="secondary" onClick={onClose}>Sulge</Button> : <><span className="worksheet-progress">{progress.answered}/{progress.total} vastust</span><Button variant="secondary" onClick={onClose}>Sulge</Button><Button loading={saving} onClick={submit}><Send size={17} /> Esita tulemus</Button></>}>
    <article className="exercise-player">
      <header><div><Badge tone="info">{exerciseTypeLabel(type)}</Badge><span>{exercise.subject || 'Õppetöö'}{exercise.level ? ` · ${exercise.level}` : ''}{exercise.topic ? ` · ${exercise.topic}` : ''}</span></div>{exercise.description ? <p>{exercise.description}</p> : null}</header>
      {submitted ? <div className="exercise-result"><CheckCircle2 size={25} /><div><strong>{submittedScore != null ? `${submittedScore}% · ${result.correct}/${result.total} õiget` : 'Vastus on esitatud'}</strong><span>Tulemus salvestati ja saadeti õpetajale.</span></div></div> : null}
      {error ? <div className="action-error" role="alert">{error}<button onClick={() => setError('')}>×</button></div> : null}

      <section className="exercise-stage">
        {type === 'fill' ? <p className="worksheet-fill">{parseExerciseFill(exercise.text).map((part, index) => part.type === 'text' ? <span key={index}>{part.value}</span> : <label key={index}><span className="sr-only">Lünk {part.index + 1}</span><input value={answers[part.index] || ''} disabled={submitted} onChange={(event) => set(part.index, event.target.value)} />{submitted && String(answers[part.index] || '').trim().toLocaleLowerCase('et') !== part.answer.trim().toLocaleLowerCase('et') ? <small>{part.answer}</small> : null}</label>)}</p> : null}

        {['choice', 'reading'].includes(type) ? <>{type === 'reading' && (exercise.passage || exercise.text) ? <p className="worksheet-passage">{exercise.passage || exercise.text}</p> : null}<div className="worksheet-questions">{(exercise.questions || []).map((question, questionIndex) => <div className="worksheet-question" key={questionIndex}><strong>{questionIndex + 1}. {questionText(question)}</strong><div>{options(question).map((option, optionIndex) => {
          const correct = submitted && optionIndex === Number(question.correct ?? 0);
          const wrong = submitted && Number(answers[questionIndex]) === optionIndex && !correct;
          return <button type="button" className={`${Number(answers[questionIndex]) === optionIndex ? 'is-selected' : ''} ${correct ? 'is-correct' : ''} ${wrong ? 'is-wrong' : ''}`} disabled={submitted} onClick={() => set(questionIndex, optionIndex)} key={`${option}-${optionIndex}`}>{option}{correct ? ' ✓' : wrong ? ' ✕' : ''}</button>;
        })}</div></div>)}</div></> : null}

        {type === 'writing' ? <><p className="worksheet-task">{exercise.task || exercise.prompt || exercise.description || exercise.instruction || exercise.text}</p><textarea aria-label="Kirjalik vastus" rows={exercise.lines || 8} value={answers.text || ''} disabled={submitted} onChange={(event) => set('text', event.target.value)} placeholder="Kirjuta oma vastus siia…" /><small className="exercise-word-count">{String(answers.text || '').trim() ? String(answers.text).trim().split(/\s+/).length : 0} sõna{exercise.minWords ? ` · soovitatav ${exercise.minWords}` : ''}</small></> : null}

        {type === 'order' ? <div className="exercise-order"><div className="exercise-order__answer">{picked.length ? picked.map((item, index) => <button type="button" disabled={submitted} onClick={() => removeWord(index)} key={`${item.index}-${index}`}>{item.word}</button>) : <span>Klõpsa sõnadel, et moodustada lause.</span>}</div><div className="worksheet-words">{orderWords.filter((word) => !picked.some((item) => item.index === word.index)).map((word) => <button type="button" disabled={submitted} onClick={() => pickWord(word)} key={word.index}>{word.word}</button>)}</div>{submitted && String(answers.sentence || '').trim().toLocaleLowerCase('et') !== String(exercise.sentence || exercise.text || '').trim().toLocaleLowerCase('et') ? <p className="worksheet-correction">Õige: {exercise.sentence || exercise.text}</p> : null}</div> : null}

        {type === 'match' ? <div className="worksheet-match">{(exercise.pairs || []).map((pair, pairIndex) => <label key={pairIndex}><strong>{pairIndex + 1}. {left(pair)}</strong><Select aria-label={`Paar ${pairIndex + 1}`} value={answers[pairIndex] || ''} disabled={submitted} onChange={(event) => set(pairIndex, event.target.value)}><option value="">Vali paar</option>{(exercise.pairs || []).map((option, optionIndex) => <option value={right(option)} key={`${right(option)}-${optionIndex}`}>{right(option)}</option>)}</Select>{submitted && answers[pairIndex] !== right(pair) ? <small>Õige: {right(pair)}</small> : null}</label>)}</div> : null}

        {type === 'translate' ? <div className="worksheet-repeat">{(exercise.items || exercise.pairs || []).map((pair, pairIndex) => <label key={pairIndex}><span>{pairIndex + 1}. {left(pair)}</span><input value={answers[pairIndex] || ''} disabled={submitted} onChange={(event) => set(pairIndex, event.target.value)} placeholder="Tõlge" />{submitted && String(answers[pairIndex] || '').trim().toLocaleLowerCase('et') !== right(pair).trim().toLocaleLowerCase('et') ? <small>Õige: {right(pair)}</small> : null}</label>)}</div> : null}

        {!['fill', 'choice', 'reading', 'writing', 'order', 'match', 'translate'].includes(type) ? <div className="exercise-unsupported"><RotateCcw size={22} /><p>{exercise.task || exercise.description || exercise.text || 'Harjutuse juhis puudub.'}</p></div> : null}
      </section>
    </article>
  </Modal>;
}
