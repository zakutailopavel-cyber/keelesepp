/* global fetch, setTimeout, clearTimeout */
import { CheckCircle2, Clock3, Send, Star } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge, Button, Modal, Select } from '../../components/ui/index.js';
import Sheet from './engine/Sheet.jsx';
import { answerProgress, checkDocument } from './engine/registry.js';
import GoalEvidence from './GoalEvidence.jsx';
import { BOARD_SHEET_SCALE, useFitScale } from './useFitScale.js';
import { petCelebrate, petQuiet } from '../pet/petEvents.js';
import './engine/sheet.css';
import './worksheetStudio.css';
import SheetAnnotations from './SheetAnnotations.jsx';
import { rightAnswers, shownResults, stepView } from './engine/liveLesson.js';

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

const AUTOSAVE_EVERY_MS = 600;
const AUTOSAVE_MIN_DELAY_MS = 150;

export default function DocWorksheetPlayer({ assignment, repository, readOnly = false, onClose, onSubmitted, inline = false, board = false }) {
  // the teacher may correct a task during the live lesson: the sheet follows the assignment document
  const [doc, setDoc] = useState(assignment.worksheetDoc);
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
  const [fitRef, fitted] = useFitScale();
  const scale = board ? BOARD_SHEET_SCALE : fitted;
  const setCanvas = useCallback((node) => { canvasRef.current = node; fitRef(node); }, [fitRef]);

  const review = submitted || readOnly;
  const checked = useMemo(() => (submitted ? checkDocument(doc, answers) : null), [doc, answers, submitted]);
  const progress = useMemo(() => answerProgress(doc, answers), [doc, answers]);

  const [focusId, setFocusId] = useState(assignment.liveFocus?.blockId || '');
  const [teacherMarks, setTeacherMarks] = useState(assignment.annotations || []);
  // live lesson: the teacher opens tasks one by one and shows the right answers of a task
  const [liveStep, setLiveStep] = useState(assignment.liveStep || null);
  const [liveShown, setLiveShown] = useState(assignment.liveShown || []);
  const [autosaved, setAutosaved] = useState('');
  const edited = useRef(false);

  const setAnswer = (key, value) => { edited.current = true; setAnswers((a) => ({ ...a, [key]: value })); setDraftSaved(false); };

  // the cabinet pet stays silent while a worksheet is open; it celebrates after the student is back
  useEffect(() => {
    petQuiet(true);
    return () => petQuiet(false);
  }, []);

  // Autosave (also what the teacher sees live). Local recordings are uploaded only on Salvesta / Esita.
  // A throttle, not a debounce: while the student types, the teacher sees the text about every 0.6 s instead of only after
  // a pause (owner, 2026-10-10). Firestore takes ~1 sustained write per second per document, short bursts are fine.
  const lastAutosave = useRef(0);
  useEffect(() => {
    if (review || !edited.current) return undefined;
    const wait = Math.max(AUTOSAVE_MIN_DELAY_MS, AUTOSAVE_EVERY_MS - (Date.now() - lastAutosave.current));
    const timer = setTimeout(() => {
      lastAutosave.current = Date.now();
      const clean = Object.fromEntries(Object.entries(answers).filter(([k, v]) => !k.endsWith(':error') && !(typeof v === 'string' && v.startsWith('blob:'))));
      repository.saveWorksheetDraft({ assignmentId: assignment.id, answers: clean })
        .then(() => setAutosaved(new Date().toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' })))
        .catch(() => setAutosaved(''));
    }, wait);
    return () => clearTimeout(timer);
  }, [answers, review, repository, assignment.id]);

  // Live lesson: follow the task the teacher points at.
  useEffect(() => {
    if (typeof repository.subscribeWorksheetAssignment !== 'function') return undefined;
    return repository.subscribeWorksheetAssignment(assignment.id, (next) => {
      if (next.worksheetDoc?.blocks) setDoc(next.worksheetDoc);
      if (!review) setFocusId(next.liveFocus?.blockId || '');
      setTeacherMarks(next.annotations || []);
      setLiveStep(next.liveStep || null);
      setLiveShown(next.liveShown || []);
    }, () => {});
  }, [review, repository, assignment.id]);
  useEffect(() => {
    if (!focusId) return;
    const el = canvasRef.current?.querySelector(`.ws-page [data-block="${focusId}"]`);
    if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusId]);

  const stepped = useMemo(() => (review ? { doc, hidden: 0 } : stepView(doc, liveStep)), [doc, liveStep, review]);
  const shownMarks = useMemo(() => (review ? {} : shownResults(doc, answers, liveShown)), [doc, answers, liveShown, review]);
  const answerNotes = useMemo(() => {
    if (review || !liveShown.length) return null;
    return Object.fromEntries(doc.blocks.filter((b) => liveShown.includes(b.id)).map((b) => {
      const list = rightAnswers(b);
      return [b.id, list.length ? <span className="ws-live-answers"><b>Õiged vastused:</b> {list.map((a, i) => <span key={i}>{i + 1}) {a}</span>)}</span> : <span className="ws-live-answers">Õpetaja vaatab selle ülesande koos sinuga üle.</span>];
    }));
  }, [doc, liveShown, review]);

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
      {stepped.hidden > 0 ? <div className="ws-live-wait" role="status"><Clock3 size={17} aria-hidden="true" /> Õpetaja avab ülesandeid ükshaaval. Järgmine tuleb peagi.</div> : null}
      <div className="st-canvas" ref={setCanvas}>
        <SheetAnnotations annotations={teacherMarks}>
        <div className="st-zoom" style={{ zoom: scale }}>
          <Sheet doc={stepped.doc} mode={review ? 'review' : 'interactive'} answers={answers} setAnswer={review ? undefined : setAnswer} results={checked?.results || shownMarks} focusId={review ? '' : focusId} blockNotes={answerNotes} />
        </div>
        </SheetAnnotations>
      </div>
      {checked ? <GoalEvidence doc={doc} evidence={checked} /> : null}
      {submitted && !readOnly ? <section className="worksheet-assessment"><div><Star size={21} /><div><strong>Kuidas tööleht tundus?</strong><span>Tagasiside aitab õpetajal järgmisi ülesandeid kohandada.</span></div></div>{assessmentSaved ? <p><CheckCircle2 size={17} /> Tagasiside salvestatud. Aitäh!</p> : <><Select id="worksheet-difficulty" label="Raskusaste" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="">Vali</option><option value="1">Väga lihtne</option><option value="2">Lihtne</option><option value="3">Paras</option><option value="4">Raske</option><option value="5">Väga raske</option></Select><label className="textarea-field"><span>Kommentaar</span><textarea rows="3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Mis oli raske või jäi arusaamatuks?" /></label><Button loading={saving} disabled={!difficulty} onClick={saveAssessment}>Saada tagasiside</Button></>}</section> : null}
    </article>
  );
  // on the board: the sheet first and nothing above it, so it lies exactly like the teacher's copy; the rest below
  if (board) {
    const sheetFirst = <article className="worksheet-player ws-studio ws-doc-player is-inline is-board">
      <div className="st-canvas" ref={setCanvas}>
        <SheetAnnotations annotations={teacherMarks}>
        <div className="st-zoom" style={{ zoom: scale }}>
          <Sheet doc={stepped.doc} mode={review ? 'review' : 'interactive'} answers={answers} setAnswer={review ? undefined : setAnswer} results={checked?.results || shownMarks} focusId={review ? '' : focusId} blockNotes={answerNotes} />
        </div>
        </SheetAnnotations>
      </div>
      {stepped.hidden > 0 ? <div className="ws-live-wait" role="status"><Clock3 size={17} aria-hidden="true" /> Õpetaja avab ülesandeid ükshaaval. Järgmine tuleb peagi.</div> : null}
      {error ? <div className="action-error" role="alert">{error}<button onClick={() => setError('')}>×</button></div> : null}
      {submitted && score ? <div className="worksheet-result"><CheckCircle2 size={24} /><div><strong>{score.pct}% · {score.correct}/{score.total} õiget</strong></div></div> : null}
      {checked ? <GoalEvidence doc={doc} evidence={checked} /> : null}
    </article>;
    return <section className="ws-inline-player is-board" aria-label={assignment.title}>{sheetFirst}{footer ? <div className="ws-inline-footer">{footer}</div> : null}</section>;
  }
  // inline: inside the Live Classroom room, next to video and board (no dialog)
  if (inline) return <section className="ws-inline-player" aria-label={assignment.title}><h3>{assignment.title}</h3>{body}{footer ? <div className="ws-inline-footer">{footer}</div> : null}</section>;
  return <Modal open title={assignment.title} onClose={onClose} className="modal--worksheet modal--worksheet-doc" footer={footer}>{body}</Modal>;
}

// Teacher review inside the homework submission dialog: the sheet with the learner's answers and marks.
// annotations: teacher marks on the sheet (SheetAnnotations); editable for staff.
export function DocWorksheetSubmissionPreview({ worksheetDoc, answers = {}, annotations = [], editable = false, onAnnotationsChange }) {
  const [fitRef, scale] = useFitScale();
  const checked = useMemo(() => checkDocument(worksheetDoc, answers), [worksheetDoc, answers]);
  return <div className="ws-studio ws-doc-player">
    {editable ? <p className="sa-hint">Vali ülesandes tekst või klõpsa õpilase vastusel, et lisada viga või märkus.</p> : null}
    <div className="st-canvas" ref={fitRef}>
      <SheetAnnotations annotations={annotations} editable={editable} onChange={onAnnotationsChange}>
        <div className="st-zoom" style={{ zoom: scale }}>
          <Sheet doc={worksheetDoc} mode="review" answers={answers} results={checked.results} />
        </div>
      </SheetAnnotations>
    </div>
    <GoalEvidence doc={worksheetDoc} evidence={checked} />
  </div>;
}
