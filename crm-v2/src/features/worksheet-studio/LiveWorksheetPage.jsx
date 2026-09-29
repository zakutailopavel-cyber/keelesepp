import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { homeworkService } from '../../services/firebase/index.js';
import Sheet from './engine/Sheet.jsx';
import { answerProgress, checkDocument } from './engine/registry.js';
import GoalEvidence from './GoalEvidence.jsx';
import { useFitScale } from './useFitScale.js';
import './engine/sheet.css';
import './worksheetStudio.css';

const time = (iso) => (iso ? new Date(iso).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—');

// Live lesson on a structured worksheet: the teacher watches the learner's answers arrive (autosaved by the
// student player), sees the marks per task and per lesson goal, and points at the task the class works on.
// Uses the assignment document only; no Firestore rule change.
export default function LiveWorksheetPage({ repository = homeworkService }) {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState('');
  const [focusError, setFocusError] = useState('');
  const [fitRef, scale] = useFitScale();

  useEffect(() => repository.subscribeWorksheetAssignment(
    assignmentId,
    (next) => { setAssignment(next); setError(''); },
    (err) => setError(err.message || 'Töölehte ei saanud avada.'),
  ), [assignmentId, repository]);

  const doc = assignment?.worksheetDoc;
  const answers = useMemo(() => assignment?.answers || {}, [assignment]);
  const checked = useMemo(() => (doc ? checkDocument(doc, answers) : null), [doc, answers]);
  // while the lesson runs, only fields the learner already answered get ✓/✗; untouched ones stay neutral
  const marks = useMemo(() => {
    if (!checked || assignment?.status === 'done') return checked?.results || {};
    return Object.fromEntries(Object.entries(checked.results).filter(([k]) => {
      const v = answers[k];
      return v !== undefined && v !== null && String(v).trim() !== '';
    }));
  }, [checked, answers, assignment?.status]);
  const progress = useMemo(() => (doc ? answerProgress(doc, answers) : null), [doc, answers]);
  const focusId = assignment?.liveFocus?.blockId || '';

  const point = async (blockId) => {
    setFocusError('');
    try { await repository.setWorksheetLiveFocus({ assignmentId, blockId: blockId === focusId ? '' : blockId }); }
    catch (err) { setFocusError(err.message || 'Ülesannet ei saanud märkida.'); }
  };

  if (error) return <div className="page-content"><div className="ws-studio-error" role="alert">{error} <Link to="/homework">Tagasi</Link></div></div>;
  if (!assignment) return <div className="page-content"><p className="ws-studio-loading">Ühendan tunniga…</p></div>;
  if (!doc) return <div className="page-content"><div className="ws-studio-error" role="alert">See ülesanne ei ole uues vormingus tööleht.</div></div>;

  const done = assignment.status === 'done';
  return (
    <div className="ws-studio ws-live">
      <header className="st-bar">
        <Link className="st-back" to="/homework"><Icons.ArrowLeft size={16} /> Kodutööd</Link>
        <div className="st-title"><b>Otse tunnis: {assignment.studentName || 'õpilane'}</b><span>{doc.meta?.title}</span></div>
        <div className="st-actions ws-live-stats" aria-live="polite">
          <span className={`ws-live-dot ${done ? 'done' : ''}`} />
          <span>{done ? 'Esitatud' : assignment.status === 'in_progress' ? 'Täidab' : 'Pole alustanud'}</span>
          <b>{progress.answered}/{progress.total} vastust</b>
          <span>viimati {time(assignment.updatedAt)}</span>
        </div>
      </header>
      <div className="st-banner">Klõpsa ülesandel: see süttib õpilase lehel ja leht kerib selleni. Uuesti klõpsates märge kaob.</div>
      {focusError && <div className="st-banner error" role="alert">{focusError}</div>}
      <div className="st-body">
        <main className="st-canvas" ref={fitRef}>
          <div className="st-zoom" style={{ zoom: scale }}>
            <Sheet doc={doc} mode="review" answers={answers} results={marks} focusId={focusId} onPick={point} />
          </div>
          <GoalEvidence doc={doc} evidence={checked} title="Tunni eesmärgid praegu" />
        </main>
      </div>
    </div>
  );
}
