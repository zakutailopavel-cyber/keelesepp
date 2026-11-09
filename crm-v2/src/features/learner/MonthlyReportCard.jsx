import { askConfirm } from '../../components/ui/ConfirmHost.jsx';
import { Check, Copy, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button, Card } from '../../components/ui/index.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { lessonSummariesService } from '../../services/firebase/lessonSummaries.js';
import { messagesService } from '../../services/firebase/messages.js';
import { parentReportsService } from '../../services/firebase/parentReports.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { localDate } from '../../utils/localDate.js';
import { LANGUAGE_LABEL, REPORT_LANGUAGES, defaultMonth, factsForAdmin, monthFacts, monthLabel, parentMessage, reportLanguage } from './parentMonthReport.js';

const api = {
  words: (id) => studentWordsService.listForStudent(id),
  assignments: (id) => homeworkService.listWorksheetAssignmentsByStudentIds([id]),
  homework: (id) => homeworkService.listByStudentIds([id]),
  lessons: (id) => lessonsService.listByStudent(id),
  summaries: (id) => lessonSummariesService.listForStudent(id),
  recordings: (id, user) => lessonRecordingsService.listForStudent({ studentId: id, user, isAdmin: true }),
  reports: (id) => parentReportsService.listForStudent(id),
  markSent: (input) => parentReportsService.markSent(input),
  send: (data, user) => messagesService.send(data, user),
};
const SOURCES = ['words', 'assignments', 'homework', 'lessons', 'summaries', 'recordings'];
const when = (iso) => { const d = new Date(iso || ''); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('et-EE'); };

// „Kuu kokkuvõte vanemale” (admin only, StudentProfilePage; owner 2026-10-23 / 2026-11-04): the admin picks a month, the
// app drafts a short message in the parent's language from stored data only (parentMonthReport.js), the admin edits it,
// copies it to wherever he writes to the family and marks it sent. Nothing goes to the family on its own; „Saada õpilase
// vestlusesse” sends only after the admin's confirmation. Lessons left (balance) are never part of it.
export default function MonthlyReportCard({ student, user, repository = api, now: nowProp }) {
  // the moment the card opened (tests pass `now`); read once, not on every render
  const [now] = useState(() => nowProp ?? Date.now());
  const [month, setMonth] = useState(() => defaultMonth(now));
  const [language, setLanguage] = useState(() => reportLanguage(student));
  const [text, setText] = useState(null);
  const [facts, setFacts] = useState([]);
  const [draftMonth, setDraftMonth] = useState('');
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const thisMonth = localDate(new Date(now)).slice(0, 7);

  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => repository.reports?.(student.id)).then((list) => { if (alive) setHistory(Array.isArray(list) ? list : []); }).catch(() => {});
    return () => { alive = false; };
  }, [repository, student.id]);

  const draft = async () => {
    setBusy('draft'); setNotice('');
    const settle = (load) => Promise.resolve().then(load).catch(() => []);
    const loaded = await Promise.all(SOURCES.map((key) => settle(() => repository[key]?.(student.id, user) || [])));
    const data = Object.fromEntries(SOURCES.map((key, index) => [key, Array.isArray(loaded[index]) ? loaded[index] : []]));
    const result = monthFacts({ month, now, ...data });
    setFacts(factsForAdmin(result));
    setText(parentMessage({ facts: result, student, language }));
    setDraftMonth(month);
    setBusy('');
  };
  const copy = async () => {
    try { await globalThis.navigator.clipboard.writeText(text); setNotice('Tekst kopeeritud. Saada see vanemale ise ja vajuta siis „Märgi saadetuks”.'); } catch { globalThis.prompt?.('Kopeeri', text); }
  };
  const record = async (channel) => {
    const saved = await repository.markSent({ studentId: student.id, month: draftMonth, language, text, channel, user });
    setHistory((list) => [saved, ...list]);
  };
  const markSent = async () => {
    setBusy('mark'); setNotice('');
    try { await record('copy'); setText(null); setNotice('Märgitud saadetuks.'); } catch (error) { setNotice(error?.message || 'Ei saanud märkida.'); } finally { setBusy(''); }
  };
  const send = async () => {
    if (!(await askConfirm('Saada see kokkuvõte õpilase vestlusesse (vanem näeb seda „Suhtlus” all)?'))) return;
    setBusy('send'); setNotice('');
    try {
      await repository.send({ studentId: student.id, studentName: student.name, teacher: student.teacher || '', text }, user);
      await record('conversation').catch(() => {});
      setText(null); setNotice('Kokkuvõte saadeti õpilase vestlusesse.');
    } catch (error) { setNotice(error?.message || 'Kokkuvõtet ei saanud saata.'); } finally { setBusy(''); }
  };

  return <Card className="monthly-report">
    <div className="section-heading"><div><span className="eyebrow">Ainult administraatorile</span><h2>Kuu kokkuvõte vanemale</h2></div></div>
    <div className="form-actions">
      <label className="field"><span className="field__label">Kuu</span><input type="month" value={month} max={thisMonth} onChange={(event) => setMonth(event.target.value || defaultMonth(now))} /></label>
      <label className="field"><span className="field__label">Keel</span><select value={language} onChange={(event) => setLanguage(event.target.value)}>
        {REPORT_LANGUAGES.map((code) => <option key={code} value={code}>{LANGUAGE_LABEL[code]}</option>)}</select></label>
      <Button variant="secondary" loading={busy === 'draft'} onClick={draft}>{text === null ? 'Koosta kokkuvõte' : 'Koosta uuesti'}</Button>
    </div>
    {text !== null ? <>
      <ul className="form-hint" aria-label="Andmed">{facts.map((line) => <li key={line}>{line}</li>)}</ul>
      <label className="textarea-field"><span>Kontrolli ja paranda enne saatmist ({monthLabel(draftMonth)}, {LANGUAGE_LABEL[language]} keeles)</span>
        <textarea rows={14} maxLength={4000} value={text} onChange={(event) => setText(event.target.value)} /></label>
      <div className="form-actions">
        <Button variant="secondary" disabled={!text.trim()} onClick={copy}><Copy size={15} /> Kopeeri</Button>
        <Button loading={busy === 'mark'} disabled={!text.trim() || Boolean(busy)} onClick={markSent}><Check size={15} /> Märgi saadetuks</Button>
        <Button variant="secondary" loading={busy === 'send'} disabled={!text.trim() || Boolean(busy)} onClick={send}><Send size={15} /> Saada õpilase vestlusesse</Button>
        <Button variant="secondary" disabled={Boolean(busy)} onClick={() => setText(null)}>Loobu</Button>
      </div>
    </> : <p className="form-hint">Lühike kiri valitud kuu kohta vanema keeles: toimunud tunnid, teemad, arvud tunnisalvestustest, sõnad ja kodutööd. Midagi ei saadeta ise — kopeeri tekst, saada see ise ja märgi saadetuks.</p>}
    {notice ? <p className="form-hint" role="status">{notice}</p> : null}
    {history.length ? <div className="monthly-report__history"><h3>Saadetud</h3><ul>{history.slice(0, 6).map((item) => <li key={item.id}>{monthLabel(item.month)} · {when(item.sentAt)} · {item.byName || '—'}{item.channel === 'conversation' ? ' · vestlusesse' : ''}</li>)}</ul></div> : null}
  </Card>;
}
