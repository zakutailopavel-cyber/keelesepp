/* global fetch, setTimeout, clearTimeout */
import { CheckCircle2, Clock3, Send, Star } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Modal, Select } from '../../components/ui/index.js';
import Sheet from './engine/Sheet.jsx';
import { answerProgress, checkDocument } from './engine/registry.js';
import GoalEvidence from './GoalEvidence.jsx';
import { useFitScale } from './useFitScale.js';
import { petCelebrate, petQuiet } from '../pet/petEvents.js';
import './engine/sheet.css';
import './worksheetStudio.css';

// Local recordings (blob: URLs) must be uploaded before the answers are stored.
async function persistRecordings({ doc, answers, assignment, repository }) {
  const next = { ...answers };
  for (const block of doc.blocks.filter((b) => b.type === 'speaking')) {
    const key = `${block.id}:audioUrl`;
    const url = next[key];
    if (typeof url !== 'string' || !url.startsWith('blob:')) continue;
    const blob = await (await fetch(url)).blob();
    const saved = await repository.uploadRecording({ studentId: assignment.studentId, assignmentId: assignment.id, blockId: block.id, blob });
    next[key] = saved.url;
  }
  Object.keys(next).filter((k) => k.endsWith(':error')).forEach((k) => { delete next[k]; });
  return next;
}

// Student player for a structured worksheet (assignment.worksheetDoc): the same sheet, the same design,
// the answers kept on the assignment. Teachers open it read-only and see the marks and the per-goal result.
export default function DocWorksheetPlayer({ assignment, repository, readOnly = false, onClose, onSubmitted, inline = false }) {
  const doc = assignment.worksheetDoc;
  const [answers, setAnswers] = useState(assignment.answers || {});
  const [submitted, setSubmitted] = useState(assignment.status === 'done');
  const [score, setScore] = useState(assignment.score || null);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState(assignment.selfAssessment?.difficulty || '');
  const [comment, setComment] = useState(assignment.selfAssessment?.comment || '');
  const [assessmentSaved, setAssessmentSaved] = useState(Boolean(assignment.selfAssessment));
  const canvasRef = useRef(null);
  const [fitRef, scale] = useFitScale();
  const setCanvas = useCallback((node) => { canvasRef.current = node; fitRef(node); }, [fitRef]);

  const review = submitted || readOnly;
  const checked = useMemo(() => (submitted ? checkDocument(doc, answers) : null), [doc, answers, submitted]);
  const progress = useMemo(() => answerProgress(doc, answers), [doc, answers]);

  const [focusId, setFocusId] = useState(assignment.liveFocus?.blockId || '');
  const [autosaved, setAutosaved] = useState('');
  const edited = useRef(false);

  const setAnswer = (key, value) => { edited.current = true; setAnswers((a) => ({ ...a, [key]: value })); setDraftSaved(false); };

  // the cabinet pet stays silent while a worksheet is open; it celebrates after the student is back
  useEffect(() => {
    petQuiet(true);
    return () => petQuiet(false);
  }, []);

  // Autosave (also what the teacher sees live). Local recordings are uploaded only on Salvesta / Esita.
  useEffect(() => {
    if (review || !edited.current) return undefined;
    const timer = setTimeout(() => {
      const clean = Object.fromEntries(Object.entries(answers).filter(([k, v]) => !k.endsWith(':error') && !(typeof v === 'string' && v.startsWith('blob:'))));
      repository.saveWorksheetDraft({ assignmentId: assignment.id, answers: clean })
        .then(() => setAutosaved(new Date().toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })))
        .catch(() => setAutosaved(''));
    }, 1500);
    return () => clearTimeout(timer);
  }, [answers, review, repository, assignment.id]);

  // Live lesson: follow the task the teacher points at.
  useEffect(() => {
    if (review || typeof repository.subscribeWorksheetAssignment !== 'function') return undefined;
    return repository.subscribeWorksheetAssignment(assignment.id, (next) => setFocusId(next.liveFocus?.blockId || ''), () => {});
  }, [review, repository, assignment.id]);
  useEffect(() => {
    if (!focusId) return;
    const el = canvasRef.current?.querySelector(`.ws-page [data-block="${focusId}"]`);
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusId]);

  const saveDraft = async () => {
    setSavingDraft(true); setError('');
    try {
      const stored = await persistRecordings({ doc, answers, assignment, repository });
      await repository.saveWorksheetDraft({ assignmentId: assignment.id, answers: stored });
      setAnswers(stored); setDraftSaved(true); onSubmitted?.();
    } catch (saveError) { setError(saveError.message || 'Töölehe salvestamine ebaõnnestus.'); }
    finally { setSavingDraft(false); }
  };

  const submit = async () => {
    if (progress.answered < progress.total && !window.confirm(`Vastatud ${progress.answered}/${progress.total}. Kas esitad töölehe ikkagi?`)) return;
    setSaving(true); setError('');
    try {
      const stored = await persistRecordings({ doc, answers, assignment, repository });
      const result = checkDocument(doc, stored);
      const errorLog = Object.entries(result.results).filter(([, v]) => v === 'bad').slice(0, 20)
        .map(([key]) => ({ key, answer: String(stored[key] ?? '') }));
      await repository.submitWorksheet({ assignmentId: assignment.id, answers: stored, score: result.score, errorLog });
      setAnswers(stored); setScore(result.score); setSubmitted(true); onSubmitted?.();
      const goals = Object.entries(result.perGoal || {}).filter(([id, g]) => id !== '_none' && g.total > 0 && g.ok === g.total).length;
      petCelebrate({ xp: 15 + goals * 5, goals });
    } catch (submitError) { setError(submitError.message || 'Töölehe esitamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  const saveAssessment = async () => {
    setSaving(true); setError('');
    try { await repository.saveSelfAssessment({ assignmentId: assignment.id, difficulty, comment }); setAssessmentSaved(true); onSubmitted?.(); }
    catch (assessmentError) { setError(assessmentError.message || 'Tagasiside salvestamine ebaõnnestus.'); }
    finally { setSaving(false); }
  };

  const footer = !review
    ? <><span className="worksheet-progress">{progress.answered}/{progress.total} vastust{draftSaved ? ' · Salvestatud' : autosaved ? ` · automaatselt salvestatud ${autosaved}` : ''}</span><Button variant="secondary" loading={savingDraft} onClick={saveDraft}>Salvesta</Button>{onClose ? <Button variant="secondary" onClick={onClose}>Sulge</Button> : null}<Button loading={saving} onClick={submit}><Send size={17} /> Esita tööleht</Button></>
    : onClose ? <Button variant="secondary" onClick={onClose}>Sulge</Button> : null;

  const body = (
    <article className={`worksheet-player ws-studio ws-doc-player ${inline ? 'is-inline' : ''}`}>
      <header><div><span className="eyebrow">{assignment.subject || 'Õppetöö'} · {assignment.level || doc.meta?.level || 'Tööleht'}</span><p>{assignment.topic || assignment.note || doc.meta?.canDo || 'Õpetaja määratud tööleht'}</p></div>{submitted ? <Badge tone="success">Esitatud</Badge> : readOnly ? <Badge tone="neutral">Ainult vaatamiseks</Badge> : <Badge tone="info">Täitmisel</Badge>}</header>
      {assignment.note ? <div className="worksheet-note"><strong>Õpetaja märkus</strong><p>{assignment.note}</p></div> : null}
      {submitted && score ? <div className="worksheet-result"><CheckCircle2 size={24} /><div><strong>{score.pct}% · {score.correct}/{score.total} õiget</strong><span>{score.pct >= 80 ? 'Suurepärane töö!' : score.pct >= 50 ? 'Tubli! Vaata vead üle.' : 'Harjuta veel ja küsi õpetajalt abi.'}</span></div></div> : null}
      {error ? <div className="action-error" role="alert">{error}<button onClick={() => setError('')}>×</button></div> : null}
      {readOnly && !submitted ? <div className="worksheet-readonly"><Clock3 size={19} /><p>Õpilane ei ole seda töölehte veel esitanud.</p></div> : null}
      <div className="st-canvas" ref={setCanvas}>
        <div className="st-zoom" style={{ zoom: scale }}>
          <Sheet doc={doc} mode={review ? 'review' : 'interactive'} answers={answers} setAnswer={review ? undefined : setAnswer} results={checked?.results || {}} focusId={review ? '' : focusId} />
        </div>
      </div>
      {checked ? <GoalEvidence doc={doc} evidence={checked} /> : null}
      {submitted && !readOnly ? <section className="worksheet-assessment"><div><Star size={21} /><div><strong>Kuidas tööleht tundus?</strong><span>Tagasiside aitab õpetajal järgmisi ülesandeid kohandada.</span></div></div>{assessmentSaved ? <p><CheckCircle2 size={17} /> Tagasiside salvestatud. Aitäh!</p> : <><Select id="worksheet-difficulty" label="Raskusaste" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">Vali</option><option value="1">Väga lihtne</option><option value="2">Lihtne</option><option value="3">Paras</option><option value="4">Raske</option><option value="5">Väga raske</option></Select><label className="textarea-field"><span>Kommentaar</span><textarea rows="3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Mis oli raske või jäi arusaamatuks?" /></label><Button loading={saving} disabled={!difficulty} onClick={saveAssessment}>Saada tagasiside</Button></>}</section> : null}
    </article>
  );
  // inline: inside the Live Classroom room, next to video and board (no dialog)
  if (inline) return <section className="ws-inline-player" aria-label={assignment.title}><h3>{assignment.title}</h3>{body}{footer ? <div className="ws-inline-footer">{footer}</div> : null}</section>;
  return <Modal open title={assignment.title} onClose={onClose} className="modal--worksheet modal--worksheet-doc" footer={footer}>{body}</Modal>;
}

// Teacher review inside the homework submission dialog: the sheet with the learner's answers and marks.
export function DocWorksheetSubmissionPreview({ worksheetDoc, answers = {} }) {
  const [fitRef, scale] = useFitScale();
  const checked = useMemo(() => checkDocument(worksheetDoc, answers), [worksheetDoc, answers]);
  return <div className="ws-studio ws-doc-player">
    <div className="st-canvas" ref={fitRef}>
      <div className="st-zoom" style={{ zoom: scale }}>
        <Sheet doc={worksheetDoc} mode="review" answers={answers} results={checked.results} />
      </div>
    </div>
    <GoalEvidence doc={worksheetDoc} evidence={checked} />
  </div>;
}
