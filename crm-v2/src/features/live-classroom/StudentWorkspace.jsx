import { ArrowLeft, PenLine, Redo2, Undo2, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button, EmptyState, ErrorState, LoadingState, Select } from '../../components/ui/index.js';
import StudentBoard from '../board/StudentBoard.jsx';
import './liveRoom.css';

// Outside a lesson „Tund” first says plainly that the lesson has not started and what happens next (owner 2026-10-12:
// students saw a board with 45 buttons and did not know what to do); the own board (homework, notes, the same board
// the teacher uses in the lesson) opens with one button.
export default function StudentWorkspace({ user, studentRepository, boardService, resumable = null, onResume, onBack, error = '' }) {
  const [state, setState] = useState({ loading: true, items: [], error: '' });
  const [chosen, setChosen] = useState('');
  const [showBoard, setShowBoard] = useState(false);
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
    <div className="lr lw" role="region" aria-label={showBoard ? 'Minu tahvel' : 'Tund'}>
      <header className="lr-top lw-top">
        <div className="lr-top__group lw-pick">
          {onBack ? <button type="button" className="lr-icon" aria-label="Tagasi" title="Tagasi" onClick={onBack}><ArrowLeft size={19} /></button> : null}
          <div className="lr-title"><strong>{showBoard ? 'Minu tahvel' : 'Tund'}</strong><small>{showBoard ? 'Kodutööd ja oma märkmed.' : 'Kui õpetaja alustab tundi, ilmub kutse siia.'}</small></div>
          {state.items.length > 1 ? <Select label="Õppeaine" value={chosen} onChange={(event) => setChosen(event.target.value)}>{state.items.map((item) => <option key={item.id} value={item.id}>{item.subject || item.name}</option>)}</Select> : null}
        </div>
        <div className="lr-top__group lr-top__right">
          {student && showBoard ? <>
            <button type="button" aria-label="Võta tagasi" title="Võta tagasi" className="lr-icon" disabled={!history.canUndo} onClick={() => boardRef.current?.undo()}><Undo2 size={18} /></button>
            <button type="button" aria-label="Tee uuesti" title="Tee uuesti" className="lr-icon" disabled={!history.canRedo} onClick={() => boardRef.current?.redo()}><Redo2 size={18} /></button>
          </> : null}
          {resumable ? <Button onClick={onResume}><Video size={17} /> Tagasi tundi: {resumable.teacherName}</Button> : null}
        </div>
      </header>
      {error ? <p className="lr-toast lr-toast--error" role="alert">{error}</p> : null}
      <div className="lr-body">
        <main className="lr-stage">
          {state.loading ? <LoadingState label="Laen tahvlit…" /> : state.error ? <ErrorState message={state.error} /> : student && !showBoard
            ? <div className="lw-empty"><EmptyState title={resumable ? 'Tund käib' : 'Tund ei ole veel alanud'} description={resumable ? `Õpetaja ${resumable.teacherName || ''} ootab sind tunnis.` : 'Kui õpetaja alustab tundi, ilmub siia kutse. Vajuta siis „Liitu”. Kaamera ja mikrofoni lülitad sisse tunnis.'} action={<div className="form-actions">{resumable ? <Button onClick={onResume}><Video size={17} /> Tagasi tundi</Button> : null}<Button variant="secondary" onClick={() => setShowBoard(true)}><PenLine size={17} /> Ava minu tahvel</Button></div>} /></div>
            : student ? <StudentBoard key={student.id} studentId={student.id} user={user} variant="room" controllerRef={boardRef} onHistoryChange={setHistory} {...(boardService ? { service: boardService } : {})} />
            : <div className="lw-empty"><EmptyState title="Tahvlit ei leitud" description="Konto ei ole veel õpilase kaardiga seotud. Kirjuta õpetajale." /></div>}
        </main>
      </div>
    </div>
  );
}
