import { useState } from 'react';
import { Footprints, SkipForward } from 'lucide-react';
import { Button } from '../../components/ui/index.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { nextToOpen, stepCounts } from './engine/liveLesson.js';

// (moved out of RoomWorksheetPanel.jsx: it needs every block's rules, which the room loads only with an open sheet)
// „Samm-sammult” in the side panel: on the board the task list lies under the sheet, out of sight (owner 2026-10-13:
// the student saw only the text and the picture and thought the sheet was broken)
export default function RoomStepControl({ current, homework = homeworkService }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const step = current?.liveStep;
  if (!step?.on || current?.status === 'done' || !homework.setWorksheetLiveStep) return null;
  const doc = current.worksheetDoc;
  const counts = stepCounts(doc, step);
  const nextId = nextToOpen(doc, step);
  const run = async (task) => {
    setBusy(true); setError('');
    try { await task(); } catch (err) { setError(err.message || 'Ei õnnestunud.'); } finally { setBusy(false); }
  };
  return (
    <div className="live-step-control" role="status">
      <p><Footprints size={16} aria-hidden="true" /> <b>Samm-sammult</b>: õpilane näeb {counts.open}/{counts.total} ülesannet.</p>
      <div>
        <Button variant="secondary" disabled={busy || !nextId} onClick={() => run(async () => {
          await homework.setWorksheetLiveStep({ assignmentId: current.id, on: true, open: [...(step.open || []), nextId] });
          if (homework.setWorksheetLiveFocus) await homework.setWorksheetLiveFocus({ assignmentId: current.id, blockId: nextId });
        })}><SkipForward size={15} aria-hidden="true" /> Ava järgmine</Button>
        <Button disabled={busy} onClick={() => run(() => homework.setWorksheetLiveStep({ assignmentId: current.id, on: false, open: step.open || [] }))}>Näita kõiki</Button>
      </div>
      {error ? <p className="action-error" role="alert">{error}</p> : null}
    </div>
  );
}

