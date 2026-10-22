import { HeartHandshake, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { lessonsService } from '../../services/firebase/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { retentionRisk } from './retentionRisk.js';
import './retention.css';

const api = {
  lessons: (teacherUid) => lessonsService.listForCalendar(teacherUid ? { teacherUid } : {}),
  words: (studentIds) => studentWordsService.listForStudentIds(studentIds),
};

// The dashboard's „Riskis õpilased” (retentionRisk.js): the journal and the words load on their own, so the dashboard
// itself is not slower; a source that fails is left out.
export default function RetentionCard({ students = [], unplanned = [], scheduledIds = [], overdueInvoices = [], teacherUid = '', repository = api, limit = 8 }) {
  const ids = useMemo(() => students.map((student) => student.id), [students]);
  const state = useAsyncData(async () => {
    const [lessons, words] = await Promise.all([
      Promise.resolve().then(() => repository.lessons(teacherUid)).catch(() => []),
      Promise.resolve().then(() => repository.words(ids)).catch(() => []),
    ]);
    return { lessons, words };
  }, [repository, teacherUid, ids]);
  const result = useMemo(() => (state.data ? retentionRisk({ students, lessons: state.data.lessons, words: state.data.words, unplannedIds: unplanned.map((item) => item.student?.id || item.id), scheduledIds, overdueInvoices }) : null), [state.data, students, unplanned, scheduledIds, overdueInvoices]);

  return <Card className="retention-card">
    <div className="section-heading"><div><span className="eyebrow">Hoia õpilased</span><h2>Riskis õpilased</h2></div>
      <button type="button" className="retention-refresh" aria-label="Värskenda" title="Värskenda" onClick={state.reload}><RefreshCw size={15} /></button></div>
    {!result ? <p className="form-hint">Arvutan…</p> : <>
      {result.risky.length ? <ul className="retention-list">
        {result.risky.slice(0, limit).map(({ student, level, reasons }) => <li key={student.id}>
          <Link to={`/students/${student.id}`}>
            <span className={`retention-dot is-${level}`} aria-hidden="true" />
            <div><strong>{student.name || 'Õpilane'}</strong><small>{reasons.join(' · ')}</small></div>
            <Badge tone={level === 'high' ? 'danger' : 'warning'}>{level === 'high' ? 'Kõrge' : 'Jälgi'}</Badge>
          </Link>
        </li>)}
      </ul> : <p className="form-hint">Kõik aktiivsed õpilased käivad ja õpivad — riskis õpilasi pole.</p>}
      {result.risky.length > limit ? <p className="form-hint">+ veel {result.risky.length - limit} õpilast</p> : null}
      {result.renewals.length ? <div className="retention-renewals">
        <h3><HeartHandshake size={16} aria-hidden="true" /> Pakett lõpeb — hea hetk rääkida jätkust</h3>
        <ul>{result.renewals.slice(0, 6).map(({ student, left }) => <li key={student.id}><Link to={`/students/${student.id}`}>{student.name}</Link><span>{left ? `${left} tund jäänud` : 'pakett läbi'}</span></li>)}</ul>
      </div> : null}
    </>}
  </Card>;
}
