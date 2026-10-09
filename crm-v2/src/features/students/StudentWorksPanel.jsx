import { ClipboardCheck, Eye, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card, EmptyState, ErrorState, LoadingState, Modal } from '../../components/ui/index.js';
import LiveWorksheetView from '../worksheet-studio/LiveWorksheetView.jsx';
import { answerProgress } from '../worksheet-studio/engine/registry.js';
import '../homework/reviewLayout.css';
import SubmissionReviewModal from '../homework/SubmissionReviewModal.jsx';
import { formatDate } from '../homework/submissionFormat.js';
import { studentWorksheetsService } from '../../services/firebase/studentWorksheets.js';

// Student card „Tööd”: worksheets given but not handed in yet (open live: the teacher sees the answers as they are now,
// autosaved by the student's player) and every worksheet and exercise the student handed in, opened in the large
// check window where the teacher grades it and grades the skills it showed (that moves the skill map in „Areng”).
const today = () => new Date().toISOString().slice(0, 10);
function openState(assignment) {
  const doc = assignment.worksheetDoc;
  const progress = doc?.blocks?.length ? answerProgress(doc, assignment.answers || {}) : null;
  const answered = progress ? progress.answered : Object.keys(assignment.answers || {}).length;
  const overdue = assignment.dueDate && assignment.dueDate < today();
  return {
    label: answered ? (progress ? `Pooleli · ${progress.answered}/${progress.total} vastust` : `Pooleli · ${answered} vastust`) : 'Alustamata',
    tone: overdue ? 'danger' : answered ? 'info' : 'neutral',
    overdue,
  };
}
export default function StudentWorksPanel({ student, user, homeworkApi, privateWorksheetApi = studentWorksheetsService, onSkillMap }) {
  const [state, setState] = useState({ loading: true, error: '', items: [], open: [], drafts: [], draftError: '' });
  const [watching, setWatching] = useState(null);
  const [opened, setOpened] = useState(null);
  const [notice, setNotice] = useState('');

  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => Promise.all([
      homeworkApi.listSubmissionsByStudentIds([student.id]),
      homeworkApi.listWorksheetAssignmentsByStudentIds ? homeworkApi.listWorksheetAssignmentsByStudentIds([student.id]) : [],
      privateWorksheetApi.listDraftsByStudent(student.id)
        .then((items) => ({ items, error: '' }))
        .catch((error) => ({ items: [], error: error.message || 'Isiklikke mustandeid ei saanud laadida.' })),
    ]))
      .then(([items, assignments, drafts]) => { if (alive) setState({ loading: false, error: '', items: items || [], open: (assignments || []).filter((item) => item.status !== 'done' && item.reviewStatus !== 'reviewed'), drafts: drafts.items || [], draftError: drafts.error }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error.message || 'Töid ei saanud laadida.', items: [], open: [], drafts: [], draftError: '' }); });
    return () => { alive = false; };
  }, [homeworkApi, privateWorksheetApi, student.id, version]);
  const load = () => { setState((current) => ({ ...current, loading: true, error: '' })); setVersion((value) => value + 1); };

  const pending = state.items.filter((item) => item.reviewStatus !== 'reviewed').length;

  return (
    <Card className="profile-wide student-works">
      <div className="section-heading"><div><span className="eyebrow">Õpilase tööd</span><h2>Töölehed ja harjutused</h2></div><div className="student-works__actions">{pending ? <Badge tone="info">{pending} ootab kontrolli</Badge> : null}<Link className="button button--primary" to={`/students/${encodeURIComponent(student.id)}/worksheets/new`}>Koosta isiklik tööleht</Link></div></div>
      {notice ? <div className="success-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Sulge teade">×</button></div> : null}
      {state.draftError ? <p className="form-hint" role="alert">{state.draftError}</p> : null}
      {!state.loading && !state.error && state.drafts.length ? (
        <section className="student-works__open" aria-label="Isiklikud mustandid">
          <h3>Isiklikud mustandid ({state.drafts.length})</h3>
          <div className="submission-list">{state.drafts.map((draft) => <Link className="submission-row" key={draft.id} to={`/students/${encodeURIComponent(student.id)}/worksheets/${encodeURIComponent(draft.id)}`}><i><FileText size={20} /></i><span className="submission-row__main"><strong>{draft.title}</strong><small>Nähtav ainult õpetajatele, kuni määrad selle õpilasele</small></span><Badge tone="neutral">Mustand</Badge></Link>)}</div>
        </section>
      ) : null}
      {!state.loading && !state.error && state.open.length ? (
        <section className="student-works__open" aria-label="Määratud, veel esitamata">
          <h3>Määratud, veel esitamata ({state.open.length})</h3>
          <div className="submission-list">
            {state.open.map((assignment) => {
              const info = openState(assignment);
              return (
                <button type="button" className="submission-row" key={assignment.id} onClick={() => setWatching(assignment)}>
                  <i><FileText size={20} /></i>
                  <span className="submission-row__main"><strong>{assignment.title}</strong><small>{[assignment.assignedAt ? `määratud ${formatDate(assignment.assignedAt)}` : '', assignment.dueDate ? `tähtaeg ${assignment.dueDate}` : ''].filter(Boolean).join(' · ')}</small></span>
                  <Badge tone={info.tone}>{info.overdue ? `${info.label} · hilinenud` : info.label}</Badge>
                  <Eye size={18} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      {!state.loading && !state.error && state.open.length ? <h3 className="student-works__subhead">Esitatud tööd</h3> : null}
      {state.loading ? <LoadingState label="Laen töid…" /> : state.error ? <ErrorState message={state.error} onRetry={load} /> : state.items.length ? (
        <div className="submission-list">
          {state.items.map((item) => {
            const reviewed = item.reviewStatus === 'reviewed';
            const deltas = Object.entries(item.skillGrades || {});
            return (
              <button type="button" className="submission-row" key={`${item.submissionKind}-${item.id}`} onClick={() => setOpened(item)}>
                <i>{item.submissionKind === 'worksheet' ? <FileText size={20} /> : <ClipboardCheck size={20} />}</i>
                <span className="submission-row__main"><strong>{item.title}</strong><small>{formatDate(item.completedAt)}{deltas.length ? ` · ${deltas.map(([skill, grade]) => `${skill} ${grade}`).join(', ')}` : ''}</small></span>
                <span className="submission-row__score">{item.percentage != null ? <b>{item.percentage}%</b> : null}{item.teacherGrade ? <small>Hinne {item.teacherGrade}</small> : null}</span>
                <Badge tone={reviewed ? 'success' : 'info'}>{reviewed ? 'Kontrollitud' : 'Ootab kontrolli'}</Badge>
              </button>
            );
          })}
        </div>
      ) : <EmptyState title="Esitatud töid veel ei ole" description="Kui õpilane esitab töölehe või harjutuse, ilmub see siia." />}
      {watching ? (
        <Modal open title={`${watching.title} · praegune seis`} onClose={() => { setWatching(null); load(); }} className="modal--review">
          <div className="review-layout review-layout--single">
            <div className="review-layout__work">
              <p className="form-hint">Õpilane ei ole tööd veel esitanud. Näed tema vastuseid nii, nagu need praegu on — uued vastused ilmuvad kohe.</p>
              <LiveWorksheetView assignmentId={watching.id} repository={homeworkApi} embedded />
            </div>
          </div>
        </Modal>
      ) : null}
      {opened ? (
        <SubmissionReviewModal
          key={`${opened.submissionKind}-${opened.id}`}
          submission={opened}
          staff
          repository={homeworkApi}
          user={user}
          skillMap={student.skillMap || {}}
          onClose={() => setOpened(null)}
          onSaved={(result) => {
            setOpened(null);
            if (result?.skillMap) onSkillMap?.(result.skillMap);
            setNotice('Tagasiside saadeti õpilasele. Oskuste hinnang on arengukaardil.');
            load();
          }}
        />
      ) : null}
    </Card>
  );
}
