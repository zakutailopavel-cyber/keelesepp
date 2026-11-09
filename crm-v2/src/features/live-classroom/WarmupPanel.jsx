import { useMemo, useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Button, LoadingState } from '../../components/ui/index.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { libraryService } from '../../services/firebase/library.js';
import { WARMUP_MAX, pickWarmupItems, warmupWorksheet } from './warmup.js';
import './warmup.css';

const dateLabel = (iso) => (iso ? iso.split('-').reverse().join('.') : '');

// „Soojendus” (teacher only): the learner's own sentences with errors from the previous analysed lesson, checked
// and edited by the teacher, then put on the board as a worksheet „Paranda lause” — one task per sentence, so the
// teacher's „Näita vastust” on the board opens the right sentence one by one. It is a normal worksheet assignment
// (library.assign + openWorksheetInRoom), so the answers come to the teacher live and stay in the student's history.
export default function WarmupPanel({ invitation, user, student = null, lessons = [], loading = false, error = '', library = libraryService, homework = homeworkService, onPlaced }) {
  const picked = useMemo(() => pickWarmupItems(lessons, { currentInvitationId: invitation.id }), [lessons, invitation.id]);
  if (loading) return <LoadingState inline className="warmup-muted" label="Laen eelmisi tunde…" />;
  if (error) return <p className="action-error" role="alert">{error}</p>;
  if (!picked.latest) return <p className="warmup-muted">Sellel õpilasel pole veel analüüsitud tundi. Soojendus tehakse eelmise tunni salvestuse analüüsist.</p>;
  // a new pick (other lessons loaded) starts a fresh list; the teacher's edits live in the editor
  const signature = picked.items.map((item) => item.id).join('|');
  return <WarmupEditor key={signature} picked={picked} invitation={invitation} user={user} student={student} library={library} homework={homework} onPlaced={onPlaced} />;
}

function WarmupEditor({ picked, invitation, user, student, library, homework, onPlaced }) {
  const [items, setItems] = useState(() => picked.items.map((item) => ({ ...item })));
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const [done, setDone] = useState('');
  const patch = (id, change) => setItems((list) => list.map((item) => (item.id === id ? { ...item, ...change } : item)));
  const remove = (id) => setItems((list) => list.filter((item) => item.id !== id));
  const addEmpty = () => setItems((list) => [...list, { id: `own-${Date.now()}`, said: '', corrected: '', topic: '', own: true }]);
  const ready = items.filter((item) => item.said.trim() && item.corrected.trim());
  const dates = [...new Set(picked.lessons.map((lesson) => dateLabel(String(lesson.startedAt || '').slice(0, 10))).filter(Boolean))];

  const place = async () => {
    setBusy(true); setFailure(''); setDone('');
    try {
      const today = new Date().toLocaleDateString('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const doc = warmupWorksheet(ready, { date: today, level: student?.level || '', studentName: invitation.studentName || '' });
      if (!doc) throw new Error('Lisa vähemalt üks lause.');
      const item = {
        kind: 'warmup', type: 'worksheet', sourceId: '', title: doc.meta.title, subject: student?.subject || '', level: student?.level || '', topic: 'Soojendus',
        source: { worksheetDoc: doc, publishedWorksheetDoc: doc, worksheetDocStatus: 'published', files: [] },
      };
      const result = await library.assign({ item, students: [{ id: invitation.studentId, name: invitation.studentName || '' }], note: 'Live Classroom: soojendus', user });
      const assignmentId = result?.assignments?.[0]?.id;
      if (!assignmentId) throw new Error('Soojendust ei saanud tahvlile panna.');
      await homework.openWorksheetInRoom({ assignmentId, roomKey: invitation.roomKey || invitation.id });
      setDone('Soojendus on tahvlil. „Näita vastust” avab õige lause ühe kaupa.');
      onPlaced?.(assignmentId);
    } catch (err) {
      setFailure(err?.message || 'Soojendust ei saanud tahvlile panna.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="warmup">
      <p className="warmup-muted">
        Õpilase laused {dates.length ? `tunnist ${dates.join(', ')}` : 'eelmisest tunnist'}. Vaata üle, paranda või eemalda; õpilane näeb ainult vigast lauset ja kirjutab selle õigesti.
      </p>
      {!items.length ? <p className="warmup-muted">Sobivaid lühikesi lauseid ei leitud. Lisa lause ise.</p> : null}
      <ol className="warmup-list">
        {items.map((item, i) => (
          <li key={item.id} className="warmup-item">
            <div className="warmup-item__head">
              <strong>{i + 1}.</strong>
              {item.topic ? <small>{item.topic}</small> : null}
              <button type="button" className="warmup-remove" aria-label={`Eemalda lause ${i + 1}`} title="Eemalda" onClick={() => remove(item.id)}><Trash2 size={14} aria-hidden="true" /></button>
            </div>
            <label>
              <span>Õpilane ütles</span>
              <input value={item.said} maxLength={300} onChange={(event) => patch(item.id, { said: event.target.value })} aria-label={`Vigane lause ${i + 1}`} />
            </label>
            <label>
              <span>Õige lause</span>
              <input value={item.corrected} maxLength={300} onChange={(event) => patch(item.id, { corrected: event.target.value })} aria-label={`Õige lause ${i + 1}`} />
            </label>
          </li>
        ))}
      </ol>
      <div className="warmup-actions">
        {items.length < WARMUP_MAX + 3 ? <Button variant="secondary" onClick={addEmpty}><Plus size={15} aria-hidden="true" /> Lisa lause</Button> : null}
        <Button variant="secondary" onClick={() => setItems(picked.items.map((item) => ({ ...item })))} disabled={busy}><RotateCcw size={15} aria-hidden="true" /> Vali uuesti</Button>
        <Button onClick={place} loading={busy} disabled={busy || !ready.length}>Pane tahvlile ({ready.length})</Button>
      </div>
      {failure ? <p className="action-error" role="alert">{failure}</p> : null}
      {done ? <p className="warmup-done" role="status">{done}</p> : null}
    </div>
  );
}
