import { useParams } from 'react-router-dom';
import { homeworkService } from '../../services/firebase/index.js';
import LiveWorksheetView from './LiveWorksheetView.jsx';

// /library/worksheets/live/:assignmentId — the live view as a stand-alone page.
export default function LiveWorksheetPage({ repository = homeworkService }) {
  const { assignmentId } = useParams();
  return <div className="page-content"><LiveWorksheetView assignmentId={assignmentId} repository={repository} /></div>;
}
