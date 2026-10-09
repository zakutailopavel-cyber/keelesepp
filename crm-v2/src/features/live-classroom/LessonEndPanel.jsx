import { useEffect, useState } from 'react';
import { homeworkService as defaultHomework } from '../../services/firebase/homework.js';
import { lessonSummariesService } from '../../services/firebase/lessonSummaries.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { saveLessonHandoff, unfinishedSheets } from './lessonHandoff.js';
import { lessonLinkFor } from './lessonLink.js';
import '../vocabulary/vocabulary.css';

const inWeek = () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

/**
 * Live Classroom „Lõpeta tund” (teacher): the lesson summary the student and parents get — the board pages used in the
 * lesson, its new words and homework (read live) and an optional note. Worksheets not finished in the lesson become
 * homework with one click. When the room was started from a calendar lesson, the calendar then marks that lesson held
 * („Toimunud”) with the note and the worksheets' curriculum topic (lessonHandoff.js).
 */
export default function LessonEndPanel({
  invitation, user, subject = '', startedAt = '', pages = [], sheets = [], ending = false, onEnd,
  lessonKey: linkedKey, saveHandoff = saveLessonHandoff,
  summaryService = lessonSummariesService, wordsService = studentWordsService, homeworkService = defaultHomework,
}) {
  const [note, setNote] = useState('');
  const [words, setWords] = useState([]);
  const [homework, setHomework] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lessonKey] = useState(() => linkedKey ?? lessonLinkFor(invitation.id));
  const [markHeld, setMarkHeld] = useState(true);
  const [giving, setGiving] = useState('');
  useEffect(() => {
    try {
      return wordsService.subscribeForStudent(invitation.studentId, (items) => setWords(items.filter((item) => item.invitationId === invitation.id)), () => {});
    } catch { return undefined; }
  }, [invitation.id, invitation.studentId, wordsService]);
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => homeworkService.listForLesson?.({ studentId: invitation.studentId, invitationId: invitation.id }) || [])
      // keep what was given here while the list was loading
      .then((items) => { if (alive) setHomework((current) => [...items, ...current.filter((item) => !items.some((loaded) => loaded.id === item.id))]); }).catch(() => {});
    return () => { alive = false; };
  }, [homeworkService, invitation.id, invitation.studentId]);

  // an unfinished worksheet of the lesson → homework „Lõpeta tööleht” due in a week (the sheet keeps its answers)
  const given = new Set(homework.map((item) => item.worksheetAssignmentId).filter(Boolean));
  const giveSheet = async (sheet) => {
    setGiving(sheet.id); setError('');
    try {
      const item = await homeworkService.createFromLesson({ invitation, user, task: `Lõpeta tööleht „${sheet.title}”`, due: inWeek(), worksheet: { id: sheet.id, title: sheet.title } });
      setHomework((current) => [...current, item]);
    } catch (next) {
      setError(next?.message || 'Kodutööd ei saanud lisada.');
    } finally {
      setGiving('');
    }
  };

  const finish = async (withSummary) => {
    setError('');
    if (lessonKey && markHeld) saveHandoff(lessonKey, { notes: note, lessonIds: sheets.map((sheet) => sheet.lessonId) });
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
      {sheets.length ? <>
        <h3 className="vw-heading">Töölehed tunnis ({sheets.length})</h3>
        <ul className="vw-list">{sheets.map((sheet) => {
          const open = unfinishedSheets([sheet]).length > 0;
          return <li key={sheet.id}><span><strong>{sheet.title}</strong><small>{open ? 'Pooleli' : 'Esitatud'}</small></span>
            {open ? (given.has(sheet.id) ? <small className="vw-muted">Kodutööks antud ✓</small>
              : <button type="button" className="vw-btn" disabled={Boolean(giving) || busy || ending} onClick={() => giveSheet(sheet)}>Anna kodutööks</button>) : null}</li>;
        })}</ul>
      </> : null}
      <h3 className="vw-heading">Uued sõnad ({words.length})</h3>
      {words.length ? <p className="vw-muted">{words.map((item) => item.word).join(', ')}</p> : <p className="vw-muted">Sõnu ei lisatud („Sõnad”).</p>}
      <h3 className="vw-heading">Kodutöö ({homework.length})</h3>
      {homework.length ? <ul className="vw-list">{homework.map((item) => <li key={item.id}><span>{item.task}</span></li>)}</ul> : <p className="vw-muted">Kodutööd ei antud („Rohkem” → „Anna kodutöö”).</p>}
      <label className="vw-field"><span>Sõnum õpilasele (valikuline)</span>
        <textarea rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tubli töö! Järgmises tunnis kordame …" /></label>
      {lessonKey ? <label className="vw-check"><input type="checkbox" checked={markHeld} onChange={(event) => setMarkHeld(event.target.checked)} /> Märgi tund kalendris toimunuks (teema töölehest, märkus läheb päevikusse)</label>
        : <p className="vw-muted">Tund ei alanud kalendrist: pärast lõppu märgi see kalendris ise.</p>}
      {error ? <p className="vw-error" role="alert">{error}</p> : null}
      <div className="vw-actions">
        <button type="button" className="vw-btn is-primary" disabled={busy || ending} onClick={() => finish(true)}>Saada kokkuvõte ja lõpeta tund</button>
        <button type="button" className="vw-btn" disabled={busy || ending} onClick={() => finish(false)}>Lõpeta ilma kokkuvõtteta</button>
      </div>
    </div>
  );
}
