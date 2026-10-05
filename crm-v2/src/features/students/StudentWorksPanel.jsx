import { ClipboardCheck, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import SubmissionReviewModal from '../homework/SubmissionReviewModal.jsx';
import { formatDate } from '../homework/submissionFormat.js';

// Student card „Tööd”: every worksheet and exercise the student handed in, opened in the large check window where the
// teacher grades it and grades the skills it showed (that moves the skill map in „Areng”).
export default function StudentWorksPanel({ student, user, homeworkApi, onSkillMap }) {
  const [state, setState] = useState({ loading: true, error: '', items: [] });
  const [opened, setOpened] = useState(null);
  const [notice, setNotice] = useState('');

  const [version, setVersion] = useState(0);
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => homeworkApi.listSubmissionsByStudentIds([student.id]))
      .then((items) => { if (alive) setState({ loading: false, error: '', items: items || [] }); })
      .catch((error) => { if (alive) setState({ loading: false, error: error.message || 'Töid ei saanud laadida.', items: [] }); });
    return () => { alive = false; };
  }, [homeworkApi, student.id, version]);
  const load = () => { setState((current) => ({ ...current, loading: true, error: '' })); setVersion((value) => value + 1); };

  const pending = state.items.filter((item) => item.reviewStatus !== 'reviewed').length;

  return (
    <Card className="profile-wide student-works">
      <div className="section-heading"><div><span className="eyebrow">Õpilase tööd</span><h2>Esitatud tööd</h2></div>{pending ? <Badge tone="info">{pending} ootab kontrolli</Badge> : null}</div>
      {notice ? <div className="success-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Sulge teade">×</button></div> : null}
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
