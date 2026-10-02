import { useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { Button, Card, Select } from '../../components/ui/index.js';
import { homeworkService, libraryService } from '../../services/firebase/index.js';
import DocWorksheetPlayer from './DocWorksheetPlayer.jsx';
import LiveWorksheetView from './LiveWorksheetView.jsx';
import './worksheetStudio.css';

// A structured worksheet inside a Live Classroom room (materials of the lesson).
// Teacher: picks a studio worksheet → it is assigned to this student (normal assignment, so it also stays in
// homework history) and tagged with the room key; the teacher then watches answers live and points at tasks.
// Student: sees the worksheet of this room inline and fills it in; answers autosave.
export default function RoomWorksheetPanel({ invitation, role, user, homework = homeworkService, library = libraryService, onCurrentChange }) {
  const roomKey = invitation.roomKey || invitation.id;
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [choices, setChoices] = useState(null);
  const [choice, setChoice] = useState('');
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    try {
      return homework.subscribeRoomWorksheets(
        { studentId: invitation.studentId, roomKey },
        (next) => { setItems(next); setError(''); },
        (err) => setError(err.message || 'Töölehte ei saanud laadida.'),
      );
    } catch (err) {
      setError(err.message || 'Töölehte ei saanud laadida.');
      return undefined;
    }
  }, [homework, invitation.studentId, roomKey]);

  useEffect(() => {
    if (role !== 'teacher') return undefined;
    let alive = true;
    Promise.resolve()
      .then(() => library.list())
      .then((res) => { if (alive) setChoices((res.curriculumLessons || []).filter((l) => l?.worksheetDoc?.blocks?.length)); })
      .catch((err) => { if (alive) { setChoices([]); setError(err.message || 'Töölehti ei saanud laadida.'); } });
    return () => { alive = false; };
  }, [library, role]);

  const current = items?.[0] || null;
  // the Live Classroom room shows a marker on „Ülesanded” and opens it for the student when a worksheet appears
  useEffect(() => { onCurrentChange?.(current); }, [current, onCurrentChange]);
  const options = useMemo(() => (choices || []).map((l) => ({ id: l.id, label: `${l.worksheetDoc.meta?.level || l.level || ''} ${l.worksheetDoc.meta?.title || l.title}`.trim(), lesson: l })), [choices]);

  const open = async () => {
    const picked = options.find((o) => o.id === choice);
    if (!picked) return;
    setOpening(true); setError('');
    try {
      const l = picked.lesson;
      const item = { kind: 'curriculum', type: 'worksheet', sourceId: l.id, title: l.title || l.worksheetDoc.meta?.title, subject: l.subject || '', level: l.level || '', topic: l.topic || '', source: l };
      const result = await library.assign({ item, students: [{ id: invitation.studentId, name: invitation.studentName }], note: invitation.title ? `Live Classroom: ${invitation.title}` : 'Live Classroom', user });
      const assignmentId = result.assignments?.[0]?.id;
      if (!assignmentId) throw new Error('Töölehte ei saanud avada.');
      await homework.openWorksheetInRoom({ assignmentId, roomKey });
      setChoice('');
    } catch (err) {
      setError(err.message || 'Töölehte ei saanud avada.');
    } finally {
      setOpening(false);
    }
  };

  return (
    <Card className="live-room-worksheet">
      <div className="live-room-worksheet__head">
        <FileText size={20} aria-hidden="true" />
        <div><strong>Tööleht tunnis</strong><small>{role === 'teacher' ? 'Vali tööleht: õpilane näeb seda kohe siin ja vastused jõuavad sinuni reaalajas.' : 'Kui õpetaja avab töölehe, ilmub see siia.'}</small></div>
      </div>
      {error ? <div className="action-error" role="alert">{error}</div> : null}
      {role === 'teacher' && (
        <div className="live-room-worksheet__pick">
          <Select label={current ? 'Ava teine tööleht' : 'Tööleht'} value={choice} onChange={(e) => setChoice(e.target.value)} disabled={!choices}>
            <option value="">{choices ? (options.length ? 'Vali tööleht' : 'Uues vormingus töölehti pole') : 'Laen…'}</option>
            {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </Select>
          <Button loading={opening} disabled={!choice} onClick={open}>Ava tunnis</Button>
        </div>
      )}
      {current && role === 'teacher' ? <LiveWorksheetView key={current.id} assignmentId={current.id} repository={homework} embedded /> : null}
      {current && role === 'student' ? <DocWorksheetPlayer key={`${current.id}-${current.status === 'done' ? 'done' : 'open'}`} assignment={current} repository={homework} inline /> : null}
    </Card>
  );
}
