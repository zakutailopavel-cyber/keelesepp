import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState, PageHeader, Select } from '../../components/ui/index.js';
import { studentsService } from '../../services/firebase/index.js';
import { studentBoardService } from '../../services/firebase/studentBoard.js';
import { hasAnyRole, ROLES } from '../../utils/roles.js';
import StudentBoard from './StudentBoard.jsx';

/**
 * "Tahvel": the student's own board outside lessons. Staff open it from the student card (/board/:studentId);
 * students and parents open /board and see the board of their own student card (a choice when there are several).
 */
export default function BoardPage({ studentRepository = studentsService, boardService = studentBoardService }) {
  const { user } = useAuth();
  const { studentId: routeStudentId } = useParams();
  const staff = hasAnyRole(user.roles, [ROLES.ADMIN, ROLES.TEACHER]);
  const [state, setState] = useState({ loading: true, students: [], error: '' });
  const [chosen, setChosen] = useState('');

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
  return (
    <div className="page-content board-page">
      {staff && routeStudentId ? <Link className="back-link" to={`/students/${routeStudentId}`}><ArrowLeft size={17} /> Õpilase kaart</Link> : null}
      <PageHeader eyebrow="Tahvel" title={student ? `${student.name} — tahvel` : 'Tahvel'} description="Õpilase oma tahvel väljaspool tundi: märkmed, joonised ja õpetaja materjalid ühes kohas." />
      {state.students.length > 1 ? <div className="board-pick"><Select label="Õpilane" value={chosen} onChange={(event) => setChosen(event.target.value)}>{state.students.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></div> : null}
      {student ? <StudentBoard key={student.id} studentId={student.id} user={user} staff={staff} service={boardService} /> : <Card><EmptyState title="Tahvlit ei leitud" description="Konto ei ole veel õpilase kaardiga seotud. Kirjuta õpetajale." /></Card>}
    </div>
  );
}
