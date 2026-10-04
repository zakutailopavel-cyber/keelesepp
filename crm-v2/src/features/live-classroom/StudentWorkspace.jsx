import { ArrowLeft, Redo2, Undo2, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, EmptyState, ErrorState, LoadingState, Select } from '../../components/ui/index.js';
import StudentBoard from '../board/StudentBoard.jsx';
import './liveRoom.css';

// Outside a lesson the student's Live Classroom is their own board (owner, 2026-10-04): homework, own notes and
// preparation on separate sheets, the same board the teacher uses in the lesson.
export default function StudentWorkspace({ user, studentRepository, boardService, resumable = null, onResume, onBack, error = '' }) {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [chosen, setChosen] = useState('');
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const boardRef = useRef(null);
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => (studentRepository?.listSelf ? studentRepository.listSelf(user.uid) : []))
      .then((items) => { if (alive) { setState({ loading: false, items, error: '' }); setChosen((current) => current || items[0]?.id || ''); } })
      .catch((nextError) => { if (alive) setState({ loading: false, items: [], error: nextError?.message || 'Tahvlit ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [studentRepository, user.uid]);
  const student = state.items.find((item) => item.id === chosen) || null;

  return (
    <div className="lr lw" role="region" aria-label="Minu tahvel">
      <header className="lr-top lw-top">
        <div className="lr-top__group lw-pick">
          {onBack ? <button type="button" className="lr-icon" aria-label="Tagasi" title="Tagasi" onClick={onBack}><ArrowLeft size={19} /></button> : null}
          <div className="lr-title"><strong>Minu tahvel</strong><small>Kodutööd ja oma märkmed. Kui õpetaja kutsub tundi, ilmub kutse siia.</small></div>
          {state.items.length > 1 ? <Select label="Õppeaine" value={chosen} onChange={(event) => setChosen(event.target.value)}>{state.items.map((item) => <option key={item.id} value={item.id}>{item.subject || item.name}</option>)}</Select> : null}
        </div>
        <div className="lr-top__group lr-top__right">
          {student ? <>
            <button type="button" aria-label="Võta tagasi" title="Võta tagasi" className="lr-icon" disabled={!history.canUndo} onClick={() => boardRef.current?.undo()}><Undo2 size={18} /></button>
            <button type="button" aria-label="Tee uuesti" title="Tee uuesti" className="lr-icon" disabled={!history.canRedo} onClick={() => boardRef.current?.redo()}><Redo2 size={18} /></button>
          </> : null}
          {resumable ? <Button onClick={onResume}><Video size={17} /> Tagasi tundi: {resumable.teacherName}</Button> : null}
        </div>
      </header>
      {error ? <p className="lr-toast lr-toast--error" role="alert">{error}</p> : null}
      <div className="lr-body">
        <main className="lr-stage">
          {state.loading ? <LoadingState label="Laen tahvlit…" /> : state.error ? <ErrorState message={state.error} /> : student
            ? <StudentBoard key={student.id} studentId={student.id} user={user} variant="room" controllerRef={boardRef} onHistoryChange={setHistory} {...(boardService ? { service: boardService } : {})} />
            : <div className="lw-empty"><EmptyState title="Tahvlit ei leitud" description="Konto ei ole veel õpilase kaardiga seotud. Kirjuta õpetajale." /></div>}
        </main>
      </div>
    </div>
  );
}
