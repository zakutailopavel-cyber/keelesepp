import { AlertTriangle, BookOpenCheck, CalendarClock, CheckCircle2, ClipboardList, Languages, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, lessonsService } from '../../services/firebase/index.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { describeAutoErrors } from '../worksheet-studio/engine/errorText.js';
import { learnerSnapshot, reviewPageText } from './learnerSnapshot.js';
import './learner.css';

const api = {
  words: (studentId) => studentWordsService.listForStudent(studentId),
  assignments: (studentId) => homeworkService.listWorksheetAssignmentsByStudentIds([studentId]),
  homework: (studentId) => homeworkService.listByStudentIds([studentId]),
  lessons: (studentId) => lessonsService.listByStudent(studentId),
};
const dateLabel = (value) => (value ? new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'short' }).format(new Date(value)) : '');

// „Õpilase pilt”: the student before the lesson (learnerSnapshot.js). Each source may fail on its own (a teacher may
// not read another teacher's journal): what loaded is shown. `onReviewPage(text)` puts the forgotten words on the board.
export default function LearnerSnapshotCard({ studentId, studentName = '', repository = api, onReviewPage, compact = false }) {
  const state = useAsyncData(async () => {
    const settle = (promise) => Promise.resolve().then(() => promise).catch(() => null);
    const [words, assignments, homework, lessons] = await Promise.all([
      settle(repository.words(studentId)), settle(repository.assignments(studentId)), settle(repository.homework(studentId)), settle(repository.lessons(studentId)),
    ]);
    return { words: words || [], assignments: assignments || [], homework: homework || [], lessons: lessons || [], partial: [words, assignments, homework, lessons].some((item) => item === null) };
  }, [repository, studentId]);
  const snapshot = useMemo(() => (state.data ? learnerSnapshot({ ...state.data, describe: describeAutoErrors }) : null), [state.data]);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState('');

  if (!studentId) return null;
  if (state.loading && !snapshot) return <section className="ls-card" aria-busy="true"><p className="ls-muted">Laen õpilase pilti…</p></section>;
  if (!snapshot) return <section className="ls-card"><p className="ls-muted">Õpilase pilti ei saanud laadida.</p><button type="button" className="ls-link" onClick={state.reload}>Proovi uuesti</button></section>;

  const review = reviewPageText(snapshot);
  const placeReview = async () => {
    setPlacing(true); setPlaced('');
    try { await onReviewPage(review); setPlaced('Kordamise leht on tahvlil.'); } catch (error) { setPlaced(error?.message || 'Lehte ei saanud luua.'); } finally { setPlacing(false); }
  };
  const { lastActivity, week, words, sheets, homework, lastLesson, signals } = snapshot;

  return <section className={`ls-card ${compact ? 'is-compact' : ''}`} aria-label={`Õpilase pilt${studentName ? `: ${studentName}` : ''}`}>
    <header className="ls-head">
      {/* the student's page already has his name as its heading: the card names itself there, the lesson panel names him */}
      <div><span className="ls-eyebrow">Enne tundi</span><h3>{compact ? studentName || 'Õpilane' : 'Õpilase pilt'}</h3></div>
      <button type="button" className="ls-icon" aria-label="Värskenda" title="Värskenda" onClick={state.reload}><RefreshCw size={15} /></button>
    </header>

    <ul className="ls-signals">
      {signals.map((signal) => <li key={signal.text} className={`is-${signal.tone}`}>{signal.tone === 'success' ? <CheckCircle2 size={15} aria-hidden="true" /> : <AlertTriangle size={15} aria-hidden="true" />}<span>{signal.text}</span></li>)}
    </ul>

    <dl className="ls-facts">
      <div><dt>Viimati õppis ise</dt><dd>{lastActivity ? `${lastActivity.label} · ${lastActivity.kind}` : 'veel mitte'}</dd></div>
      <div><dt>7 päevaga</dt><dd>{week.words} sõna · {week.sheets} töölehte · {week.homework} kodutööd</dd></div>
      {lastLesson ? <div><dt>Eelmine tund</dt><dd>{dateLabel(lastLesson.date)}{lastLesson.topic ? ` · ${lastLesson.topic}` : ''}{lastLesson.notes ? <small>{lastLesson.notes}</small> : null}</dd></div> : null}
    </dl>

    <div className="ls-block">
      <h4><Languages size={15} aria-hidden="true" /> Sõnad <small>{words.total} kokku · {words.learned} selgeks · {words.due} kordamisel{words.neverPractised ? ` · ${words.neverPractised} harjutamata` : ''}</small></h4>
      {words.forgotten.length ? <>
        <p className="ls-muted">Ununeb ({words.forgotten.length}):</p>
        <ul className="ls-chips">{words.forgotten.map((item) => <li key={item.id} title={item.translation}>{item.word}</li>)}</ul>
        {onReviewPage ? <button type="button" className="ls-action" disabled={placing} onClick={placeReview}><BookOpenCheck size={15} aria-hidden="true" /> {placing ? 'Loon…' : 'Pane kordamine tahvlile'}</button> : null}
        {placed ? <p className="ls-muted" role="status">{placed}</p> : null}
      </> : <p className="ls-muted">{words.total ? 'Ükski sõna ei unune.' : 'Sõnu veel pole — lisa tunnis „Sõnad” paneelist.'}</p>}
    </div>

    {sheets.length ? <div className="ls-block">
      <h4><ClipboardList size={15} aria-hidden="true" /> Viimased töölehed</h4>
      <ul className="ls-sheets">{sheets.map((sheet) => <li key={sheet.id}>
        <div><strong>{sheet.title}</strong><span className={sheet.score !== null && sheet.score < 70 ? 'is-low' : ''}>{sheet.score !== null ? `${sheet.score}%` : 'esitatud'}{sheet.errors ? ` · ${sheet.errors} viga` : ''}</span></div>
        {sheet.details.length ? <ul className="ls-errors">{sheet.details.map((line) => <li key={line}>{line}</li>)}</ul> : null}
      </li>)}</ul>
    </div> : null}

    {homework.open ? <div className="ls-block">
      <h4><CalendarClock size={15} aria-hidden="true" /> Kodutööd <small>{homework.open} avatud</small></h4>
      {homework.overdue.length ? <ul className="ls-errors">{homework.overdue.map((item) => <li key={item.id}>{item.task}{item.due ? ` · tähtaeg ${dateLabel(item.due)}` : ''}</li>)}</ul> : null}
    </div> : null}

    {state.data.partial ? <p className="ls-muted ls-note">Osa andmeid jäi laadimata (õiguste tõttu) — pilt võib olla mittetäielik.</p> : null}
  </section>;
}
