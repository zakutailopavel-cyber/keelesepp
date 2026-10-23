import { Send } from 'lucide-react';
import { useState } from 'react';
import { Button, Card } from '../../components/ui/index.js';
import { homeworkService, lessonsService } from '../../services/firebase/index.js';
import { messagesService } from '../../services/firebase/messages.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { monthlyReport } from './monthlyReport.js';

const api = {
  words: (id) => studentWordsService.listForStudent(id),
  assignments: (id) => homeworkService.listWorksheetAssignmentsByStudentIds([id]),
  homework: (id) => homeworkService.listByStudentIds([id]),
  lessons: (id) => lessonsService.listByStudent(id),
  send: (data, user) => messagesService.send(data, user),
};

// „Kuu aruanne vanemale” (admin only, StudentProfilePage): a draft from the month's data, edited by the admin, sent to the
// student's conversation („Suhtlus”, the family sees it) only when the admin presses „Saada”.
export default function MonthlyReportCard({ student, user, repository = api }) {
  const [text, setText] = useState(null);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const draft = async () => {
    setBusy('draft'); setNotice('');
    const settle = (load) => Promise.resolve().then(load).catch(() => []);
    const [words, assignments, homework, lessons] = await Promise.all(['words', 'assignments', 'homework', 'lessons'].map((key) => settle(() => repository[key](student.id))));
    setText(monthlyReport({ student, words, assignments, homework, lessons }));
    setBusy('');
  };
  const send = async () => {
    if (!globalThis.confirm('Saada see aruanne õpilase vestlusesse (vanem näeb seda „Suhtlus” all)?')) return;
    setBusy('send'); setNotice('');
    try {
      await repository.send({ studentId: student.id, studentName: student.name, teacher: student.teacher || '', text }, user);
      setText(null); setNotice('Aruanne saadeti õpilase vestlusesse.');
    } catch (error) { setNotice(error?.message || 'Aruannet ei saanud saata.'); } finally { setBusy(''); }
  };
  return <Card className="monthly-report">
    <div className="section-heading"><div><span className="eyebrow">Ainult administraatorile</span><h2>Kuu aruanne vanemale</h2></div>
      {text === null ? <Button variant="secondary" loading={busy === 'draft'} onClick={draft}>Koosta aruanne</Button> : null}</div>
    {text !== null ? <>
      <label className="textarea-field"><span>Kontrolli ja paranda enne saatmist (eesti ja vene keeles)</span>
        <textarea rows={14} maxLength={4000} value={text} onChange={(event) => setText(event.target.value)} /></label>
      <div className="form-actions"><Button loading={busy === 'send'} disabled={!text.trim()} onClick={send}><Send size={15} /> Saada vanemale</Button><Button variant="secondary" disabled={Boolean(busy)} onClick={() => setText(null)}>Loobu</Button></div>
    </> : <p className="form-hint">Kokkuvõte viimasest 30 päevast: tunnid, sõnad, tundide sammud, kodutööd. Saadetakse alles pärast sinu kontrolli.</p>}
    {notice ? <p className="form-hint" role="status">{notice}</p> : null}
  </Card>;
}
