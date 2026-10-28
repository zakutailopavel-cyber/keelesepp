import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icons } from './icons.js';
import { homeworkService } from '../../services/firebase/index.js';
import Sheet from './engine/Sheet.jsx';
import { answerProgress, checkDocument } from './engine/registry.js';
import GoalEvidence from './GoalEvidence.jsx';
import LiveTaskPanel from './LiveTaskPanel.jsx';
import BlockKeyPanel from './BlockKeyPanel.jsx';
import { blockAnswerKey } from './engine/answerKey.js';
import { taskStats } from './engine/liveLesson.js';
import SheetAnnotations from './SheetAnnotations.jsx';
import { liveWordTools } from './liveWordTools.js';
import { setPath } from './engine/inlineEdit.js';
import { AuthContext } from '../../app/AuthContext.jsx';
import { BOARD_SHEET_SCALE, useFitScale } from './useFitScale.js';
import './engine/sheet.css';
import './worksheetStudio.css';

const NO_SERVICES = {};
const time = (iso) => (iso ? new Date(iso).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—');

// Live lesson on a structured worksheet: the teacher watches the learner's answers arrive (autosaved by the
// student player), sees the marks per task and per lesson goal, and points at the task the class works on.
// Uses the assignment document only; no Firestore rule change. Rendered as a page and inside the Live Classroom room.
export default function LiveWorksheetView({ assignmentId, repository = homeworkService, back = { to: '/homework', label: 'Kodutööd' }, embedded = false, board = false, wordServices = NO_SERVICES }) {
  const [assignment, setAssignment] = useState(null);
  const [error, setError] = useState('');
  const [focusError, setFocusError] = useState('');
  const [fitRef, fitted] = useFitScale();
  const scale = board ? BOARD_SHEET_SCALE : fitted;
  const user = useContext(AuthContext)?.user;

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
  const stats = useMemo(() => taskStats(doc, answers), [doc, answers]);
  const step = assignment?.liveStep || null;
  const shown = useMemo(() => assignment?.liveShown || [], [assignment?.liveShown]);
  const [busy, setBusy] = useState(false);
  const live = async (action) => {
    setFocusError(''); setBusy(true);
    try { await action(); } catch (err) { setFocusError(err.message || 'Muudatust ei saanud salvestada.'); } finally { setBusy(false); }
  };
  const canStep = typeof repository.setWorksheetLiveStep === 'function';
  const canShow = typeof repository.setWorksheetShown === 'function';
  const done = assignment?.status === 'done';
  const toggleStep = (on) => live(() => repository.setWorksheetLiveStep({ assignmentId, on, open: step?.open || [] }));
  const openTask = (blockId, open) => live(async () => {
    const list = new Set(step?.open || []);
    if (open) list.add(blockId); else list.delete(blockId);
    await repository.setWorksheetLiveStep({ assignmentId, on: true, open: [...list] });
    if (open) await repository.setWorksheetLiveFocus({ assignmentId, blockId });
  });
  // recorded on the assignment (who / when, liveShownBy + liveShownLog); scores and the learner's answers stay
  const setShown = (blockIds, show) => live(() => repository.setWorksheetShown({
    assignmentId,
    shown: show ? [...new Set([...shown, ...blockIds])] : shown.filter((id) => !blockIds.includes(id)),
    change: { blockIds, on: show },
    user,
  }));
  const showTask = (blockId, show) => setShown([blockId], show);
  const shownBy = assignment?.liveShownBy || null;
  // „Näita kõik vastused”: every task that has right answers
  const keyedIds = useMemo(() => stats.filter((s) => s.total).map((s) => s.id), [stats]);
  const showAll = (show) => setShown(show ? keyedIds.filter((id) => !shown.includes(id)) : shown.filter((id) => keyedIds.includes(id)), show);
  // the answers of the task the teacher clicked, under that task on the teacher's sheet only
  const [keyId, setKeyId] = useState('');
  // on the teacher's sheet: tasks the learner does not see yet are dimmed, shown answers are labelled
  const blockClasses = useMemo(() => (step?.on ? Object.fromEntries(stats.filter((s) => !(step.open || []).includes(s.id)).map((s) => [s.id, 'is-live-closed'])) : null), [step, stats]);
  // the teacher's notes under the blocks: answers shown to the learner, and the dictation text to read aloud (the
  // learner never sees it; before, it lived only in the editor and the teacher had nothing to read from)
  const blockNotes = useMemo(() => {
    const notes = {};
    (doc?.blocks || []).filter((b) => b.type === 'dictation').forEach((b) => {
      const sentences = String(b.data?.sentences || '').split('\n').map((line) => line.trim()).filter(Boolean);
      notes[b.id] = <div key={`${b.id}-read`} className="ws-dictation-read" role="note" aria-label="Loe ette">
        <strong><Icons.AudioLines size={14} aria-hidden="true" /> Loe ette (õpilane ei näe)</strong>
        {sentences.length ? <ol>{sentences.map((line, i) => <li key={i}>{line}</li>)}</ol> : <p>Etteütluse lauseid pole lisatud: lisa need lehe muutmises.</p>}
      </div>;
    });
    shown.filter((id) => id !== keyId).forEach((id) => { notes[id] = <>{notes[id] || null}<span key={id} className="ws-live-shown"><Icons.Eye size={14} aria-hidden="true" /> Õiged vastused on õpilasele näha</span></>; });
    const task = keyId ? blockAnswerKey(doc, keyId) : null;
    if (task) {
      notes[keyId] = <>{notes[keyId] || null}<BlockKeyPanel key={`${keyId}-key`} task={task} shown={shown.includes(keyId)} shownBy={shownBy?.[keyId] || null} busy={busy}
        onShow={done || !canShow ? null : (on) => showTask(keyId, on)} onClose={() => setKeyId('')} /></>;
    }
    return notes;
  // eslint-disable-next-line react-hooks/exhaustive-deps -- showTask is rebuilt every render; its inputs are listed
  }, [doc, shown, keyId, shownBy, busy, done, canShow, user]);

  const point = async (blockId) => {
    setFocusError('');
    // the click also opens (or closes) the answers of that task for the teacher
    setKeyId((current) => (current === blockId ? '' : blockId));
    try { await repository.setWorksheetLiveFocus({ assignmentId, blockId: blockId === focusId ? '' : blockId }); }
    catch (err) { setFocusError(err.message || 'Ülesannet ei saanud märkida.'); }
  };

  // Correct the sheet during the lesson (owner, 2026-10-10): double-click a text in edit mode; the change is saved on
  // this assignment's copy and the student's player, subscribed to it, shows it at once. The library sheet stays as is.
  const canEdit = typeof repository.saveWorksheetDoc === 'function';
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState('');
  const editText = (blockId, path, text) => live(async () => {
    const current = assignment.worksheetDoc;
    const next = blockId
      ? { ...current, blocks: current.blocks.map((b) => (b.id === blockId ? { ...b, data: setPath(b.data, path, text) } : b)) }
      : { ...current, meta: setPath(current.meta, path, text) };
    await repository.saveWorksheetDoc({ assignmentId, worksheetDoc: next });
    setEditNote('Parandus salvestatud — õpilane näeb seda kohe.');
  });
  const editToggle = canEdit ? <button type="button" className={`st-btn ${editing ? 'primary' : ''}`} aria-pressed={editing} onClick={() => { setEditing((v) => !v); setEditNote(''); }}>
    <Icons.Pencil size={15} aria-hidden="true" /> {editing ? 'Valmis' : 'Paranda lehte'}
  </button> : null;
  const editBanner = editing ? <div className="st-banner" role="status">{editNote || 'Topeltklõpsa tekstil, mida tahad parandada (lünga õige vastus on nurksulgudes). Parandus läheb ainult selle õpilase lehele.'}</div> : null;
  const sheet = editing
    ? <Sheet doc={doc} mode="edit" onEditText={editText} />
    : <Sheet doc={doc} mode="review" answers={answers} results={marks} focusId={focusId} onPick={point} blockClasses={blockClasses} blockNotes={blockNotes} />;

  // marks go to the assignment; the student's player is subscribed and shows them at once
  // double-click a word: „Viga”, „Märkus” or „Sõna” (three key forms → the student's „Sõnad”); a corrected answer can go
  // to the student's „Minu vead”
  const words = useMemo(() => liveWordTools({ studentId: assignment?.studentId, invitationId: assignment?.liveRoomKey || '', user, ...wordServices }), [assignment?.studentId, assignment?.liveRoomKey, user, wordServices]);
  const saveMarks = (annotations) => repository.saveSubmissionAnnotations({ submission: { ...assignment, submissionKind: 'worksheet' }, annotations, user });

  if (error) return <div className="ws-studio-error" role="alert">{error} {!embedded && <Link to={back.to}>Tagasi</Link>}</div>;
  if (!assignment) return <p className="ws-studio-loading">Ühendan tunniga…</p>;
  if (!doc) return <div className="ws-studio-error" role="alert">See ülesanne ei ole uues vormingus tööleht.</div>;

  const liveStats = <div className="st-actions ws-live-stats" aria-live="polite">
    <span className={`ws-live-dot ${done ? 'done' : ''}`} />
    <span>{done ? 'Esitatud' : assignment.status === 'in_progress' ? 'Täidab' : 'Pole alustanud'}</span>
    <b>{progress.answered}/{progress.total} vastust</b>
    <span>viimati {time(assignment.updatedAt)}</span>
  </div>;
  // on the board: the sheet first and nothing above it, so it lies exactly like the student's copy; the rest below
  if (board) {
    return (
      <div className="ws-studio ws-live is-embedded is-board">
        <div className="st-canvas" ref={fitRef}>
          <SheetAnnotations annotations={assignment.annotations || []} editable={!editing} onChange={saveMarks} words={words} analysis={{ level: doc?.meta?.level || 'A2' }}>
            <div className="st-zoom" style={{ zoom: scale }}>
              {sheet}
            </div>
          </SheetAnnotations>
        </div>
        <header className="st-bar"><div className="st-title"><b>Otse tunnis: {assignment.studentName || 'õpilane'}</b><span>{doc.meta?.title}</span></div>{editToggle}{liveStats}</header>
        {editBanner}
        {focusError && <div className="st-banner error" role="alert">{focusError}</div>}
        <GoalEvidence doc={doc} evidence={checked} title="Tunni eesmärgid praegu" />
        {canStep ? <LiveTaskPanel stats={stats} step={step} shown={shown} busy={busy} done={done} onStep={toggleStep} onOpen={openTask} onShow={showTask} onShowAll={keyedIds.length ? showAll : null} /> : null}
      </div>
    );
  }
  return (
    <div className={`ws-studio ws-live ${embedded ? 'is-embedded' : ''}`}>
      <header className="st-bar">
        {!embedded && <Link className="st-back" to={back.to}><Icons.ArrowLeft size={16} /> {back.label}</Link>}
        <div className="st-title"><b>Otse tunnis: {assignment.studentName || 'õpilane'}</b><span>{doc.meta?.title}</span></div>
        <div className="st-actions ws-live-stats" aria-live="polite">
          <span className={`ws-live-dot ${done ? 'done' : ''}`} />
          <span>{done ? 'Esitatud' : assignment.status === 'in_progress' ? 'Täidab' : 'Pole alustanud'}</span>
          <b>{progress.answered}/{progress.total} vastust</b>
          <span>viimati {time(assignment.updatedAt)}</span>
          {editToggle}
        </div>
      </header>
      {editBanner}
      <div className="st-banner">Klõpsa ülesandel: see süttib õpilase lehel ja leht kerib selleni. Topeltklõps sõnal: viga, märkus või sõna õpilase sõnavarasse (kolm põhivormi ja tõlge).</div>
      {focusError && <div className="st-banner error" role="alert">{focusError}</div>}
      <div className="st-body ws-live-body">
        <main className="st-canvas" ref={fitRef}>
          <SheetAnnotations annotations={assignment.annotations || []} editable={!editing} onChange={saveMarks} words={words} analysis={{ level: doc?.meta?.level || 'A2' }}>
            <div className="st-zoom" style={{ zoom: scale }}>
              {sheet}
            </div>
          </SheetAnnotations>
          <GoalEvidence doc={doc} evidence={checked} title="Tunni eesmärgid praegu" />
        </main>
        {canStep ? <LiveTaskPanel stats={stats} step={step} shown={shown} busy={busy} done={done} onStep={toggleStep} onOpen={openTask} onShow={showTask} onShowAll={keyedIds.length ? showAll : null} /> : null}
      </div>
    </div>
  );
}
