import { ClipboardCheck, Send } from 'lucide-react';
import { useState } from 'react';
import { Button, Card } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { libraryService } from '../../services/firebase/library.js';
import { PLACEMENT_ID, placementItem, placementLevel } from './placementTest.js';
import './placement.css';

const api = {
  list: (studentId) => homeworkService.listWorksheetAssignmentsByStudentIds([studentId]),
  assign: ({ student, user }) => libraryService.assign({ item: placementItem(), students: [student], note: 'Paigutustest: umbes 15 minutit.', user }),
};
const when = (value) => (value ? new Date(value).toLocaleDateString('et-EE', { day: 'numeric', month: 'short', year: 'numeric' }) : '');

// „Paigutustest” on the student card (Esmane hindamine): send the 15-minute test and read the level it shows.
// The level is a suggestion; the teacher still sets the card's level (the assessment never sets it by itself).
export default function PlacementCard({ student, user, repository = api }) {
  const state = useAsyncData(() => repository.list(student.id), [repository, student.id]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const tests = (state.data || []).filter((item) => item.lessonId === PLACEMENT_ID);
  const done = tests.filter((item) => item.status === 'done' && item.score?.perGoal).sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)))[0];
  const open = tests.find((item) => item.status !== 'done');
  const result = done ? placementLevel(done.score.perGoal) : null;
  const send = async () => {
    setBusy(true); setNotice('');
    try { await repository.assign({ student, user }); setNotice('Paigutustest on õpilase „Kodutööd” all.'); await state.reload(); } catch (error) { setNotice(error?.message || 'Testi ei saanud saata.'); } finally { setBusy(false); }
  };
  return <Card className="placement-card">
    <div className="section-heading"><div><span className="eyebrow"><ClipboardCheck size={14} aria-hidden="true" /> Paigutustest · 15 min</span><h2>{result ? `Testi järgi: ${result.level === 'A0' ? 'algaja (alla A1)' : result.level}` : 'Taseme kiirtest'}</h2></div>
      <Button variant={result ? 'secondary' : 'primary'} loading={busy} disabled={Boolean(open)} onClick={send}><Send size={15} /> {open ? 'Test on saadetud' : result ? 'Saada uuesti' : 'Saada paigutustest'}</Button></div>
    {result ? <>
      <p className="form-hint">Tehtud {when(done.completedAt)}. Tase on soovitus — kaardi taseme määrab õpetaja.</p>
      <div className="placement-levels">{result.results.map((row) => <span key={row.level} className={row.pct >= 60 ? 'is-pass' : ''}><b>{row.level}</b>{row.total ? `${row.pct}%` : '—'}</span>)}</div>
    </> : <p className="form-hint">30 küsimust tasemetel A1–C1. Õpilane teeb testi „Kodutööd” all; tulemus ja soovitatav tase ilmuvad siia.</p>}
    {notice ? <p className="form-hint" role="status">{notice}</p> : null}
  </Card>;
}
