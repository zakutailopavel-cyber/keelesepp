import { useEffect, useState } from 'react';
import { homeworkService } from '../../services/firebase/homework.js';
import '../vocabulary/vocabulary.css';

const QUICK = ['Korda tunni sõnu („Minu sõnad” → „Harjuta”)', 'Lõpeta tööleht', 'Vaata tahvlileht üle ja kirjuta 5 lauset'];

function inDays(days, from = new Date()) {
  const date = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  return date.toISOString().slice(0, 10);
}

/**
 * Live Classroom „Kodutöö” (teacher): give homework from the lesson. It lands in the student's homework list
 * („Kodutööd”, dashboard); the open board page and the room's worksheet can be attached with one tick.
 */
export default function LessonHomeworkPanel({ invitation, user, boardPage = null, worksheet = null, service = homeworkService }) {
  const [task, setTask] = useState('');
  const [due, setDue] = useState(() => inDays(7));
  const [withPage, setWithPage] = useState(false);
  const [withSheet, setWithSheet] = useState(Boolean(worksheet));
  const [given, setGiven] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.resolve(service.listForLesson?.({ studentId: invitation.studentId, invitationId: invitation.id }) || [])
      .then((items) => { if (alive) setGiven(items); })
      .catch(() => {});
    return () => { alive = false; };
  }, [invitation.id, invitation.studentId, service]);

  const submit = async (event) => {
    event.preventDefault();
    if (!task.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const item = await service.createFromLesson({
        invitation, user, task, due,
        boardPage: withPage && boardPage ? boardPage : null,
        worksheet: withSheet && worksheet ? worksheet : null,
      });
      setGiven((current) => [...current, item]);
      setTask('');
      setWithPage(false);
    } catch (next) {
      setError(next?.message || 'Kodutööd ei saanud lisada.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="vw-panel">
      <form className="vw-form" onSubmit={submit} aria-label="Uus kodutöö">
        <label className="vw-field"><span>Mida teha</span>
          <textarea rows={3} maxLength={500} value={task} onChange={(event) => setTask(event.target.value)} required /></label>
        <div className="vw-actions">{QUICK.map((text) => <button type="button" key={text} className="vw-chip" onClick={() => setTask((current) => (current.trim() ? `${current.trim()}\n${text}` : text))}>{text}</button>)}</div>
        <label className="vw-field"><span>Tähtaeg</span><input type="date" value={due} onChange={(event) => setDue(event.target.value)} /></label>
        {boardPage ? <label className="vw-check"><input type="checkbox" checked={withPage} onChange={(event) => setWithPage(event.target.checked)} /> Lisa tahvlileht „{boardPage.title}”</label> : null}
        {worksheet ? <label className="vw-check"><input type="checkbox" checked={withSheet} onChange={(event) => setWithSheet(event.target.checked)} /> Tööleht „{worksheet.title}” kodutööks (sama tähtaeg)</label> : null}
        <button type="submit" className="vw-btn is-primary" disabled={busy || !task.trim()}>Anna kodutöö</button>
      </form>
      {error ? <p className="vw-error" role="alert">{error}</p> : null}
      <h3 className="vw-heading">Selles tunnis antud ({given.length})</h3>
      {given.length ? <ul className="vw-list">{given.map((item) => <li key={item.id}><span><strong>{item.task}</strong><small>{[item.due ? `Tähtaeg ${item.due}` : 'Tähtajata', item.boardPageTitle ? `Tahvlileht „${item.boardPageTitle}”` : '', item.worksheetTitle ? `Tööleht „${item.worksheetTitle}”` : ''].filter(Boolean).join(' · ')}</small></span></li>)}</ul>
        : <p className="vw-muted">Õpilane näeb kodutööd kohe oma töölaual ja lehel „Kodutööd”.</p>}
    </div>
  );
}
