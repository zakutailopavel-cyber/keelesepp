import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, ErrorState, LoadingState } from '../../components/ui/index.js';
import { studentWorksheetsService } from '../../services/firebase/studentWorksheets.js';
import { studentsService } from '../../services/firebase/students.js';
import { ROLES } from '../../utils/roles.js';
import { canonicalTeacherName, isSameTeacher } from '../../utils/teachers.js';
import WorksheetStudioPage from '../worksheet-studio/WorksheetStudioPage.jsx';

export default function StudentWorksheetStudioPage({ studentApi = studentsService, worksheetApi = studentWorksheetsService }) {
  const { studentId, lessonId } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, student: null, error: '' });

  useEffect(() => {
    let alive = true;
    studentApi.getById(studentId)
      .then((student) => {
        if (!alive) return;
        if (!student) throw new Error('Õpilast ei leitud.');
        if (!user?.roles?.includes(ROLES.ADMIN) && !isSameTeacher(student.teacher, canonicalTeacherName(user?.displayName))) {
          throw new Error('Õpilane ei ole määratud sinu õpetajakontole.');
        }
        setState({ loading: false, student, error: '' });
      })
      .catch((error) => { if (alive) setState({ loading: false, student: null, error: error.message || 'Õpilast ei saanud laadida.' }); });
    return () => { alive = false; };
  }, [studentApi, studentId, user?.displayName, user?.roles]);

  const repository = useMemo(() => state.student ? worksheetApi.forStudent(state.student) : null, [state.student, worksheetApi]);
  if (state.loading) return <div className="page-content"><Card><LoadingState label="Laen õpilase töölehe koostamist…" /></Card></div>;
  if (state.error) return <div className="page-content"><Card><ErrorState message={state.error} /><Link to={`/students/${encodeURIComponent(studentId)}?tab=works`}>Tagasi õpilase juurde</Link></Card></div>;

  const profile = `/students/${encodeURIComponent(studentId)}?tab=works`;
  return (
    <WorksheetStudioPage
      key={`${studentId}-${lessonId}`}
      repository={repository}
      templates={null}
      backTo={profile}
      backLabel={state.student.name || 'Õpilase tööd'}
      editorBase={`/students/${encodeURIComponent(studentId)}/worksheets`}
      draftId={`student-${studentId}-${lessonId}`}
      allowCopy={false}
      allowAssign={false}
      privateFor={state.student.name || 'õpilane'}
    />
  );
}
