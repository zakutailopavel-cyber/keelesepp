import { CheckCircle2, Clock3, Send, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Modal, Select } from '../../components/ui/index.js';
import { answerKey, blockTitle, calculateWorksheetResult, parseFillText, worksheetProgress } from './worksheetPlayer.js';

function questionText(question) { return question.q || question.question || question.prompt || 'Küsimus'; }
function questionOptions(question) { return question.opts || question.options || []; }
function pairLeft(pair) { return pair.l || pair.left || pair.from || ''; }
function pairRight(pair) { return pair.r || pair.right || pair.to || ''; }

function WorksheetBlock({ block, index, answers, done, readOnly, onAnswer }) {
  const disabled = done || readOnly;
  const set = (key, value) => onAnswer((current) => ({ ...current, [key]: value }));
  const choiceList = (block.questions || []).map((question, questionIndex) => {
    const key = answerKey(block, questionIndex);
    const selected = answers[key];
    return <div className="worksheet-question" key={key}><strong>{questionIndex + 1}. {questionText(question)}</strong><div>{questionOptions(question).filter(Boolean).map((option, optionIndex) => {
      const correct = done && optionIndex === Number(question.correct ?? 0);
      const wrong = done && Number(selected) === optionIndex && !correct;
      return <button type="button" className={`${Number(selected) === optionIndex ? 'is-selected' : ''} ${correct ? 'is-correct' : ''} ${wrong ? 'is-wrong' : ''}`} disabled={disabled} onClick={() => set(key, optionIndex)} key={`${option}-${optionIndex}`}>{option}{correct ? ' ✓' : wrong ? ' ✕' : ''}</button>;
    })}</div></div>;
  });

  return <section className="worksheet-block">
    <header><span>{index + 1}</span><div><strong>{block.label || blockTitle(block.type)}</strong>{block.instruction ? <small>{block.instruction}</small> : null}</div></header>
    {block.type === 'text' ? <p className="worksheet-copy">{block.content || block.text}</p> : null}
    {block.type === 'image' && block.imageUrl ? <figure><img src={block.imageUrl} alt={block.caption || 'Töölehe pilt'} />{block.caption ? <figcaption>{block.caption}</figcaption> : null}</figure> : null}
    {block.type === 'fill' ? <p className="worksheet-fill">{parseFillText(block.text).map((part, partIndex) => part.type === 'text' ? <span key={partIndex}>{part.value}</span> : <label key={partIndex}><span className="sr-only">Lünk {part.index + 1}</span><input value={answers[answerKey(block, part.index)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, part.index), event.target.value)} />{done && String(answers[answerKey(block, part.index)] || '').trim().toLocaleLowerCase('et') !== part.answer.trim().toLocaleLowerCase('et') ? <small>{part.answer}</small> : null}</label>)}</p> : null}
    {block.type === 'choice' ? <div className="worksheet-questions">{choiceList}</div> : null}
    {block.type === 'reading' ? <><p className="worksheet-passage">{block.passage || block.text}</p><div className="worksheet-questions">{choiceList}</div></> : null}
    {block.type === 'match' ? <div className="worksheet-match">{(block.pairs || []).map((pair, pairIndex) => <label key={answerKey(block, pairIndex)}><strong>{pairIndex + 1}. {pairLeft(pair)}</strong><Select aria-label={`Paar ${pairIndex + 1}`} value={answers[answerKey(block, pairIndex)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, pairIndex), event.target.value)}><option value="">Vali paar</option>{(block.pairs || []).map((option, optionIndex) => <option value={pairRight(option)} key={`${pairRight(option)}-${optionIndex}`}>{pairRight(option)}</option>)}</Select>{done && answers[answerKey(block, pairIndex)] !== pairRight(pair) ? <small>Õige: {pairRight(pair)}</small> : null}</label>)}</div> : null}
    {block.type === 'writing' ? <><p className="worksheet-task">{block.task || block.prompt}</p><textarea aria-label={`Kirjalik vastus ${index + 1}`} rows={Math.min(Number(block.lines) || 5, 12)} value={answers[block.id] || ''} disabled={disabled} onChange={(event) => set(block.id, event.target.value)} placeholder="Kirjuta vastus siia…" /></> : null}
    {block.type === 'order' ? <><div className="worksheet-words">{String(block.sentence || '').split(/\s+/).filter(Boolean).reverse().map((word, wordIndex) => <span key={`${word}-${wordIndex}`}>{word}</span>)}</div><input className="worksheet-long-input" aria-label={`Järjestatud lause ${index + 1}`} value={answers[block.id] || ''} disabled={disabled} onChange={(event) => set(block.id, event.target.value)} placeholder="Kirjuta õige lause" />{done && String(answers[block.id] || '').trim().toLocaleLowerCase('et') !== String(block.sentence || '').trim().toLocaleLowerCase('et') ? <small className="worksheet-correction">Õige: {block.sentence}</small> : null}</> : null}
    {block.type === 'table' ? <div className="worksheet-table-wrap"><table><thead><tr>{(block.headers || []).map((header, column) => <th key={`${header}-${column}`}>{header}</th>)}</tr></thead><tbody>{Array.from({ length: Math.max(Number(block.rows) || 0, 1) }, (_, row) => <tr key={row}>{(block.headers || []).map((_, column) => <td key={column}><input aria-label={`Tabel ${row + 1}, ${column + 1}`} value={answers[answerKey(block, row, column)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, row, column), event.target.value)} /></td>)}</tr>)}</tbody></table></div> : null}
    {block.type === 'dialogue' ? <div className="worksheet-dialogue">{(block.lines || []).map((line, lineIndex) => <p key={lineIndex}><strong>{line.speaker}:</strong>{parseFillText(line.text).map((part, partIndex) => part.type === 'text' ? <span key={partIndex}>{part.value}</span> : <input aria-label={`Dialoogi lünk ${lineIndex + 1}.${part.index + 1}`} key={partIndex} value={answers[answerKey(block, lineIndex, part.index)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, lineIndex, part.index), event.target.value)} />)}</p>)}</div> : null}
    {block.type === 'error_correction' ? <div className="worksheet-repeat">{(block.sentences || []).map((sentence, sentenceIndex) => <label key={answerKey(block, sentenceIndex)}><span><s>{sentence.wrong}</s></span><input value={answers[answerKey(block, sentenceIndex)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, sentenceIndex), event.target.value)} placeholder="Parandatud lause" />{done ? <small>Õige: {sentence.correct}</small> : null}</label>)}</div> : null}
    {block.type === 'transformation' ? <div className="worksheet-repeat">{block.example?.from || block.example?.to ? <p className="worksheet-example"><strong>Näide:</strong> {block.example.from} → {block.example.to}</p> : null}{(block.sentences || []).map((sentence, sentenceIndex) => <label key={answerKey(block, sentenceIndex)}><span>{typeof sentence === 'string' ? sentence : sentence.from}</span><input value={answers[answerKey(block, sentenceIndex)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, sentenceIndex), event.target.value)} placeholder="Muudetud lause" /></label>)}</div> : null}
    {block.type === 'translate' ? <div className="worksheet-repeat">{(block.items || block.pairs || []).map((pair, pairIndex) => <label key={answerKey(block, pairIndex)}><span>{pairLeft(pair)}</span><input value={answers[answerKey(block, pairIndex)] || ''} disabled={disabled} onChange={(event) => set(answerKey(block, pairIndex), event.target.value)} placeholder="Tõlge" />{done ? <small>Õige: {pairRight(pair)}</small> : null}</label>)}</div> : null}
    {!['text', 'image', 'fill', 'choice', 'reading', 'match', 'writing', 'order', 'table', 'dialogue', 'error_correction', 'transformation', 'translate'].includes(block.type) ? <p className="worksheet-copy">{block.content || block.text || block.task || 'Seda ülesandetüüpi saab praegu ainult vaadata.'}</p> : null}
  </section>;
}

export default function WorksheetPlayer({ assignment, repository, readOnly = false, onClose, onSubmitted }) {
  const blocks = useMemo(() => assignment.worksheetData?.blocks || [], [assignment]);
  const [answers, setAnswers] = useState(assignment.answers || {});
  const [submitted, setSubmitted] = useState(assignment.status === 'done');
  const [score, setScore] = useState(assignment.score || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState(assignment.selfAssessment?.difficulty || '');
  const [comment, setComment] = useState(assignment.selfAssessment?.comment || '');
  const [assessmentSaved, setAssessmentSaved] = useState(Boolean(assignment.selfAssessment));
  const progress = useMemo(() => worksheetProgress(blocks, answers), [answers, blocks]);

  const submit = async () => {
    if (!progress.complete) { setError(`Täida kõik vastused (${progress.answered}/${progress.total}).`); return; }
    setSaving(true); setError('');
    try {
      const result = calculateWorksheetResult(blocks, answers);
      await repository.submitWorksheet({ assignmentId: assignment.id, answers, ...result });
      setScore(result.score); setSubmitted(true); onSubmitted?.();
    } catch (submitError) { setError(submitError.message || 'Töölehe esitamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  const saveAssessment = async () => {
    setSaving(true); setError('');
    try { await repository.saveSelfAssessment({ assignmentId: assignment.id, difficulty, comment }); setAssessmentSaved(true); onSubmitted?.(); }
    catch (assessmentError) { setError(assessmentError.message || 'Tagasiside salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  const footer = !submitted && !readOnly && blocks.length
    ? <><span className="worksheet-progress">{progress.answered}/{progress.total} vastust</span><Button variant="secondary" onClick={onClose}>Sulge</Button><Button loading={saving} onClick={submit}><Send size={17} /> Esita tööleht</Button></>
    : <Button variant="secondary" onClick={onClose}>Sulge</Button>;

  return <Modal open title={assignment.title} onClose={onClose} className="modal--worksheet" footer={footer}>
    <article className="worksheet-player">
      <header><div><span className="eyebrow">{assignment.subject || 'Õppetöö'} · {assignment.level || 'Tööleht'}</span><p>{assignment.topic || assignment.note || 'Õpetaja määratud tööleht'}</p></div>{submitted ? <Badge tone="success">Esitatud</Badge> : readOnly ? <Badge tone="neutral">Ainult vaatamiseks</Badge> : <Badge tone="info">Täitmisel</Badge>}</header>
      {assignment.note ? <div className="worksheet-note"><strong>Õpetaja märkus</strong><p>{assignment.note}</p></div> : null}
      {submitted && score ? <div className="worksheet-result"><CheckCircle2 size={24} /><div><strong>{score.pct}% · {score.correct}/{score.total} õiget</strong><span>{score.pct >= 80 ? 'Suurepärane töö!' : score.pct >= 50 ? 'Tubli! Vaata vead üle.' : 'Harjuta veel ja küsi õpetajalt abi.'}</span></div></div> : null}
      {error ? <div className="action-error" role="alert">{error}<button onClick={() => setError('')}>×</button></div> : null}
      <div className="worksheet-blocks">{blocks.map((block, index) => <WorksheetBlock block={{ ...block, id: block.id || `block-${index}` }} index={index} answers={answers} done={submitted} readOnly={readOnly} onAnswer={setAnswers} key={block.id || `${block.type}-${index}`} />)}</div>
      {!blocks.length ? <div className="worksheet-empty">Töölehel ei ole täidetavaid ülesandeid.</div> : null}
      {submitted ? <section className="worksheet-assessment"><div><Star size={21} /><div><strong>Kuidas tööleht tundus?</strong><span>Tagasiside aitab õpetajal järgmisi ülesandeid kohandada.</span></div></div>{assessmentSaved ? <p><CheckCircle2 size={17} /> Tagasiside salvestatud. Aitäh!</p> : <><Select id="worksheet-difficulty" label="Raskusaste" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">Vali</option><option value="1">Väga lihtne</option><option value="2">Lihtne</option><option value="3">Paras</option><option value="4">Raske</option><option value="5">Väga raske</option></Select><label className="textarea-field"><span>Kommentaar</span><textarea rows="3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Mis oli raske või jäi arusaamatuks?" /></label><Button loading={saving} disabled={!difficulty} onClick={saveAssessment}>Saada tagasiside</Button></>}</section> : null}
      {readOnly && !submitted ? <div className="worksheet-readonly"><Clock3 size={19} /><p>Õpilane ei ole seda töölehte veel esitanud.</p></div> : null}
    </article>
  </Modal>;
}
