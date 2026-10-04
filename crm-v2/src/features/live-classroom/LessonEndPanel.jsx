import { useEffect, useState } from 'react';
import { homeworkService as defaultHomework } from '../../services/firebase/homework.js';
import { lessonSummariesService } from '../../services/firebase/lessonSummaries.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import '../vocabulary/vocabulary.css';

/**
 * Live Classroom „Lõpeta tund” (teacher): the lesson summary the student and parents get — the board pages used in the
 * lesson, its new words and homework (read live) and an optional note — then the lesson ends as before.
 */
export default function LessonEndPanel({
  invitation, user, subject = '', startedAt = '', pages = [], ending = false, onEnd,
  summaryService = lessonSummariesService, wordsService = studentWordsService, homeworkService = defaultHomework,
}) {
  const [note, setNote] = useState('');
  const [words, setWords] = useState([]);
  const [homework, setHomework] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    try {
      return wordsService.subscribeForStudent(invitation.studentId, (items) => setWords(items.filter((item) => item.invitationId === invitation.id)), () => {});
    } catch { return undefined; }
  }, [invitation.id, invitation.studentId, wordsService]);
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => homeworkService.listForLesson?.({ studentId: invitation.studentId, invitationId: invitation.id }) || [])
      .then((items) => { if (alive) setHomework(items); }).catch(() => {});
    return () => { alive = false; };
  }, [homeworkService, invitation.id, invitation.studentId]);

  const finish = async (withSummary) => {
    setError('');
    if (withSummary) {
      setBusy(true);
      try {
        await summaryService.save({ invitation, user, subject, startedAt, note, pages });
      } catch (next) {
        setBusy(false);
        setError(`${next?.message || 'Kokkuvõtet ei saanud salvestada.'} Võid tunni lõpetada ka ilma kokkuvõtteta.`);
        return;
      }
      setBusy(false);
    }
    onEnd?.();
  };

  return (
    <div className="vw-panel">
      <p className="vw-note">Õpilane ja vanem näevad pärast tundi kokkuvõtet: tunni lehed, uued sõnad ja kodutöö.</p>
      <h3 className="vw-heading">Tahvli lehed ({pages.length})</h3>
      {pages.length ? <ul className="vw-list">{pages.map((page) => <li key={page.id}><span>{page.title || 'Leht'}</span></li>)}</ul> : <p className="vw-muted">Tunnis kasutati ainult põhitahvlit.</p>}
      <h3 className="vw-heading">Uued sõnad ({words.length})</h3>
      {words.length ? <p className="vw-muted">{words.map((item) => item.word).join(', ')}</p> : <p className="vw-muted">Sõnu ei lisatud („Sõnad”).</p>}
      <h3 className="vw-heading">Kodutöö ({homework.length})</h3>
      {homework.length ? <ul className="vw-list">{homework.map((item) => <li key={item.id}><span>{item.task}</span></li>)}</ul> : <p className="vw-muted">Kodutööd ei antud („Rohkem” → „Anna kodutöö”).</p>}
      <label className="vw-field"><span>Sõnum õpilasele (valikuline)</span>
        <textarea rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tubli töö! Järgmises tunnis kordame …" /></label>
      {error ? <p className="vw-error" role="alert">{error}</p> : null}
      <div className="vw-actions">
        <button type="button" className="vw-btn is-primary" disabled={busy || ending} onClick={() => finish(true)}>Saada kokkuvõte ja lõpeta tund</button>
        <button type="button" className="vw-btn" disabled={busy || ending} onClick={() => finish(false)}>Lõpeta ilma kokkuvõtteta</button>
      </div>
    </div>
  );
}
