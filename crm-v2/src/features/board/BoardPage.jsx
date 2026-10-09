import { ArrowLeft, Redo2, Undo2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, Select } from '../../components/ui/index.js';
import { libraryService, studentsService } from '../../services/firebase/index.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import StudentBoard from './StudentBoard.jsx';
import '../live-classroom/liveRoom.css';

/**
 * "Tahvel": the student's own board outside lessons, full screen like the Live Classroom board (floating tools).
 * Staff open it from the student card (/board/:studentId); students and parents open /board and see the board of
 * their own student card (a choice when there are several). Always available, also without a lesson.
 */
export default function BoardPage({ studentRepository = studentsService, boardService = studentBoardService, library = libraryService }) {
  const { user } = useAuth();
  const { studentId: routeStudentId } = useParams();
  // ?page=<lessonPageId>: opened from a lesson row on the student card, straight on that lesson's page
  const [searchParams] = useSearchParams();
  const initialPageId = searchParams.get('page') || '';
  const staff = hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.TEACHER]);
  const [state, setState] = useState({ loading: true, students: [], error: '' });
  const [chosen, setChosen] = useState('');
  const [history, setHistory] = useState({ canUndo: false, canRedo: false });
  const boardRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = routeStudentId
      ? studentRepository.getById(routeStudentId).then((student) => (student ? [student] : []))
      : studentRepository.listOwned(user.uid);
    Promise.resolve().then(() => load)
      .then((students) => { if (alive) { setState({ loading: false, students, error: '' }); setChosen((current) => current || students[0]?.id || ''); } })
      .catch((error) => { if (alive) setState({ loading: false, students: [], error: error.message || 'Õpilast ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [routeStudentId, studentRepository, user.uid]);

  if (state.loading) return <LoadingState label="Laen tahvlit…" />;
  if (state.error) return <div className="page-content"><ErrorState message={state.error} /></div>;
  const student = state.students.find((item) => item.id === chosen);
  const back = staff && routeStudentId ? { to: `/students/${routeStudentId}`, label: 'Õpilase kaart' } : { to: '/', label: 'Tagasi' };
  if (!student) {
    return <div className="page-content board-page"><Card><EmptyState title="Tahvlit ei leitud" description="Konto ei ole veel õpilase kaardiga seotud. Kirjuta õpetajale." /></Card></div>;
  }
  // teachers can put a picture on the board here too (the same upload as in the Live Classroom)
  const uploadImage = staff && library?.uploadFile ? (file) => library.uploadFile({ file, user }) : undefined;
  return (
    <div className="lr lw board-full" role="region" aria-label="Tahvel">
      <header className="lr-top lw-top">
        <div className="lr-top__group lw-pick">
          <Link className="lr-icon" to={back.to} aria-label={back.label} title={back.label}><ArrowLeft size={19} /></Link>
          <div className="lr-title"><h1 className="board-full__title">{student.name} — tahvel</h1><small>{staff ? 'Õpilase oma tahvel: õpilane ja vanem näevad muudatusi kohe.' : 'Sinu tahvel on alati avatud: joonista, kirjuta, tee märkmeid. Õpetaja näeb seda.'}</small></div>
          {state.students.length > 1 ? <Select label="Õpilane" value={chosen} onChange={(event) => setChosen(event.target.value)}>{state.students.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select> : null}
        </div>
        <div className="lr-top__group lr-top__right">
          <button type="button" aria-label="Võta tagasi" title="Võta tagasi" className="lr-icon" disabled={!history.canUndo} onClick={() => boardRef.current?.undo()}><Undo2 size={18} /></button>
          <button type="button" aria-label="Tee uuesti" title="Tee uuesti" className="lr-icon" disabled={!history.canRedo} onClick={() => boardRef.current?.redo()}><Redo2 size={18} /></button>
        </div>
      </header>
      <div className="lr-body">
        <main className="lr-stage">
          <StudentBoard key={student.id} studentId={student.id} user={user} staff={staff} service={boardService} variant="room"
            controllerRef={boardRef} onHistoryChange={setHistory} uploadImage={uploadImage} initialPageId={initialPageId} />
        </main>
      </div>
    </div>
  );
}
