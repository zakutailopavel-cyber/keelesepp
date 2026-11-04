import { CalendarClock, CalendarDays, Check, ChevronRight, Flame, Languages, ListTodo, Megaphone, MessageSquareText, PawPrint, PenLine, SpellCheck, TrendingUp, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, lessonChangeRequestsService, lessonsService, petsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { announcementsService } from '../../services/firebase/announcements.js';
import { isAbsenceOnly, requestFor } from '../calendar/rescheduleModel.js';
import RescheduleDialog from './RescheduleDialog.jsx';
import { readDone } from '../self-study/reviewStore.js';
import PetLoop from '../pet/PetLoop.jsx';
import { petProgress } from '../pet/petModel.js';
import { nextLesson as firstLessonAhead } from '../pet/petLife.js';
import { todayPath } from './todayPath.js';
import { petReact } from '../pet/petEvents.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { invoiceBalanceCents } from './studentFinance.js';
import OpenInvoicesCard from '../payments/OpenInvoicesCard.jsx';
import { linkpayApi } from '../../services/firebase/linkpayApi.js';
import { parentCardIds } from '../parents/parentModel.js';
import RecordingConsentPrompt from '../lesson-recording/RecordingConsentPrompt.jsx';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import SubjectSwitcher from './SubjectSwitcher.jsx';
import { itemSubject, onlySubject, subjectsOf } from './subjects.js';
import { feedbackSeenAt, homeNotes, homeSections, newFeedback, nextStep } from './nextStep.js';
import './studentHome.css';

function unique(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

function money(cents) {
  return (Number(cents || 0) / 100).toLocaleString('et-EE', { style: 'currency', currency: 'EUR' });
}

function dateLabel(value) {
  if (!value) return 'Kuupäev puudub';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('et-EE', { day: 'numeric', month: 'short' });
}

const firstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'õpilane';
const NOTE_ICON = { feedback: MessageSquareText, announcement: Megaphone, invoice: WalletCards, availability: CalendarClock };
const SECTION_ICON = { tasks: ListTodo, words: Languages, mistakes: SpellCheck, boards: PenLine, progress: TrendingUp };

/** Unpaid invoice: one line; with card payments on, „Maksa” opens the existing payment card right here. */
function InvoiceNote({ note, invoices, readOnly, api = linkpayApi }) {
  const [canPay, setCanPay] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let live = true;
    Promise.resolve().then(() => api.config()).then((config) => live && setCanPay(Boolean(config?.enabled))).catch(() => {});
    return () => { live = false; };
  }, [api]);
  return <li>
    <div><WalletCards size={17} aria-hidden="true" /> <span>{note.text}</span>{canPay ? <button type="button" className="link-button" aria-expanded={open} onClick={() => setOpen(!open)}>Maksa</button> : null}</div>
    {open ? <OpenInvoicesCard invoices={invoices} readOnly={readOnly} api={api} /> : null}
  </li>;
}

export default function StudentDashboardPage({
  studentRepository = studentsService,
  homeworkRepository = homeworkService,
  scheduleRepository = scheduleService,
  invoiceRepository = invoicesService,
  lessonRepository = lessonsService,
  petRepository = petsService,
  changeRequests = lessonChangeRequestsService,
  announcementService = announcementsService,
  consentService,
  wordsService,
  paymentsApi,
}) {
  const { user, preview } = useAuth();
  const [rescheduling, setRescheduling] = useState(false);
  // several subjects on one card (owner 2026-10-20): the next lesson and the work of one subject, or all
  const [subject, setSubject] = useState('');
  const state = useAsyncData(async () => {
    const students = preview?.studentId
      ? [await studentRepository.getById(preview.studentId)].filter(Boolean)
      : await studentRepository.listSelf(user.uid);
    const studentIds = students.map((student) => student.id);
    // a child's invoices are the business of the parent linked to the card: not even read for this page
    const ownInvoiceCards = students.filter((student) => !parentCardIds(student).some((id) => id !== user.uid)).map((student) => student.id);
    const [pet, sheets, homework, submissions, scheduleLists, invoiceLists, lessonLists] = await Promise.all([
      // staff in a preview see the same pet read-only, if the rules let them read it
      Promise.resolve().then(() => petRepository.get?.(user.uid)).catch(() => null),
      Promise.resolve().then(() => homeworkRepository.listWorksheetAssignmentsByStudentIds?.(studentIds) || []).catch(() => []),
      homeworkRepository.listByStudentIds(studentIds),
      homeworkRepository.listSubmissionsByStudentIds(studentIds),
      Promise.all(studentIds.map((studentId) => scheduleRepository.listByStudent(studentId))),
      Promise.all(ownInvoiceCards.map((studentId) => invoiceRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => lessonRepository.listByStudent(studentId))),
    ]);
    const requests = await Promise.resolve().then(() => changeRequests?.listForStudents?.(studentIds) || []).catch(() => []);
    return { pet: pet || null, sheets, students, homework, submissions, schedule: unique(scheduleLists.flat()), invoices: unique(invoiceLists.flat()), lessons: unique(lessonLists.flat()), requests };
  }, [homeworkRepository, invoiceRepository, lessonRepository, preview?.studentId, scheduleRepository, studentRepository, user.uid]);

  // the school's open announcements, after the page is drawn: a line appears if there is one (the gate shows them first)
  const [pendingNotes, setPendingNotes] = useState([]);
  useEffect(() => {
    if (preview || !announcementService?.mine) return undefined;
    let live = true;
    Promise.resolve().then(() => announcementService.mine()).then((result) => { if (live) setPendingNotes(Array.isArray(result?.pending) ? result.pending : []); }).catch(() => {});
    return () => { live = false; };
  }, [announcementService, preview, user.uid]);

  // words of „Minu sõnad” also feed the pet (learned words, practice days)
  const words = useStudentWords((state.data?.students || []).map((student) => student.id), ...(wordsService ? [wordsService] : []));
  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 28 }, (_, index) => shiftDate(today, index)), [today]);
  // the whole day's path done → the walking pet shows a flame, once a day
  const reviewedToday = readDone(user?.uid).errors?.date === today || user?.profile?.practice?.errorsDate === today;
  const pathDone = useMemo(() => {
    if (!state.data) return false;
    const steps = todayPath({ words, homework: state.data.homework, submissions: state.data.submissions, assignments: state.data.sheets, mistakesDoneToday: reviewedToday, today }).steps.filter((item) => !item.idle);
    return steps.length > 0 && steps.every((item) => item.done);
  }, [state.data, words, today, reviewedToday]);
  useEffect(() => {
    if (!pathDone || preview) return;
    try {
      const key = `ks-path-done-${today}`;
      if (globalThis.localStorage?.getItem(key)) return;
      globalThis.localStorage?.setItem(key, '1');
    } catch { return; }
    petReact('streak');
  }, [pathDone, preview, today]);
  if (state.loading) return <LoadingState label="Laen sinu õpinguid…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const { students, submissions, invoices, sheets, pet } = state.data;
  const hello = <h1 className="sh-hello">Tere, {firstName(user.displayName)}!</h1>;
  if (!students.length) {
    return <div className="page-content sh-page"><div className="sh">{hello}<Card><EmptyState title="Õpilase profiil ei ole kontoga seotud" description="Palu administraatoril siduda õpilase kaart sinu kontoga. Nime või e-posti põhjal profiili automaatselt ei seostata." /></Card></div></div>;
  }

  const studentMap = new Map(students.map((student) => [student.id, student]));
  const subjects = subjectsOf(students);
  const chosen = subjects.length > 1 ? subject : '';
  const studentOf = (item) => studentMap.get(item.studentId) || null;
  const homework = onlySubject(state.data.homework, chosen, studentOf);
  const assignments = onlySubject(sheets, chosen, studentOf);
  const occurrences = onlySubject(occurrencesForDates(state.data.schedule, nextDates), chosen, studentOf);
  const lessonAhead = firstLessonAhead(occurrences);
  const nextRequest = requestFor(state.data.requests, lessonAhead);
  const cancelRequest = async () => { try { await changeRequests.cancel(nextRequest.id); } finally { state.reload(); } };

  const step = nextStep({ occurrences, homework, assignments, words, today });
  const sections = homeSections({ homework, assignments, words, today, path: todayPath({ words, homework, submissions, assignments, mistakesDoneToday: reviewedToday, today }) });
  const upcoming = occurrences.filter((item) => item.status !== 'Tühistatud').slice(0, 5);
  const progress = petProgress({ lessons: state.data.lessons, submissions, homework: state.data.homework, words });
  const { streak } = progress;
  const offerPet = !preview && !pet?.optedOut && !pet?.kind;
  const unpaid = invoices.filter((invoice) => invoice.status !== 'Tühistatud' && invoiceBalanceCents(invoice) > 0);
  const unpaidCents = unpaid.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0);
  const notes = homeNotes({ feedback: newFeedback(submissions, feedbackSeenAt(user.uid)), announcements: preview ? [] : pendingNotes, unpaidCents, money });

  return <div className="page-content sh-page"><div className="sh">
    {hello}
    {!preview?.studentId ? <RecordingConsentPrompt students={students} user={user} role="student" {...(consentService ? { service: consentService } : {})} /> : null}
    <SubjectSwitcher subjects={subjects} value={subject} onChange={setSubject} label="Minu õppeained" />

    {/* the first screen (owner 2026-11-01): exactly one next step and one request of the pet, nothing else */}
    <div className="sh-hero">
      <section className={`sh-step ${step.key === 'done' ? 'is-done' : ''}`} aria-label="Järgmine samm">
        <small>Järgmine samm <span lang="ru">· следующий шаг</span></small>
        <strong>{step.title}</strong>
        <span>{step.detail}</span>
        {step.to.startsWith('#') ? <a href={step.to}>{step.button} <ChevronRight size={17} aria-hidden="true" /></a> : <Link to={step.to}>{step.button} <ChevronRight size={17} aria-hidden="true" /></Link>}
      </section>
      {pet?.kind && !pet.optedOut ? <PetLoop user={user} studentId={students[0].id} pet={pet} readOnly={Boolean(preview)} lessons={state.data.lessons} submissions={submissions} homework={state.data.homework} assignments={sheets} words={words} subject={chosen || students[0].subject || ''}
        repository={petRepository} {...(wordsService ? { wordsService } : {})} /> : null}
      {offerPet ? <Link className="sh-pet" to="/student/lemmik"><i style={{ display: 'grid', placeItems: 'center' }}><PawPrint size={40} aria-hidden="true" /></i><span><strong>Vali endale sõber</strong><small>Õppesõber kasvab koos sinuga</small></span></Link> : null}
    </div>

    {notes.length ? <ul className="sh-notes" aria-label="Sulle on uudiseid">{notes.map((note) => {
      if (note.key === 'invoice') return <InvoiceNote key={note.key} note={note} invoices={unpaid} readOnly={Boolean(preview)} {...(paymentsApi ? { api: paymentsApi } : {})} />;
      const Icon = NOTE_ICON[note.key];
      return <li key={note.key}><Link to={note.to}><Icon size={17} aria-hidden="true" /> {note.text} <ChevronRight size={15} aria-hidden="true" /></Link></li>;
    })}</ul> : null}

    {/* below the first screen: every section one tap away, with a small count instead of a long block */}
    <section className="sh-sections" aria-label="Minu õppimine">
      <header className="sh-sections__head">
        <h2>Minu õppimine <small lang="ru">· моя учёба</small></h2>
        {streak ? <span className="sh-streak" title="Õppimise päevi järjest"><Flame size={15} aria-hidden="true" /> {streak} {streak === 1 ? 'päev' : 'päeva'} järjest</span> : null}
      </header>
      <ul>{sections.map((item) => {
        const Icon = SECTION_ICON[item.key];
        return <li key={item.key} className={item.done ? 'is-done' : ''}><Link to={item.to}>
          <Icon size={18} aria-hidden="true" />
          <b>{item.label}</b>
          <small>{item.detail}</small>
          {item.count ? <em>{item.count}</em> : item.done ? <Check size={16} className="sh-sections__done" aria-hidden="true" /> : <ChevronRight size={16} aria-hidden="true" />}
        </Link></li>;
      })}</ul>
      <div className="sh-plan" id="tunniplaan">
        <h3><CalendarDays size={18} aria-hidden="true" /> Tunniplaan</h3>
        <div className="sh-lesson">
          <span>{lessonAhead
            ? <>Järgmine tund: <strong>{lessonAhead.occurrenceDate === today ? 'täna' : dateLabel(lessonAhead.occurrenceDate)} {lessonAhead.time}</strong>{subjects.length > 1 ? ` · ${itemSubject(lessonAhead, studentOf(lessonAhead))}` : ''}</>
            : 'Tunde ei ole plaanis'}</span>
          {lessonAhead && !preview ? (nextRequest?.status === 'pending' ? <p className="form-hint" role="status">{isAbsenceOnly(nextRequest) ? 'Teade, et sa ei tule, on õpetajale saadetud.' : 'Palve tund üle viia on saadetud. Tund jääb oma kohale, kuni õpetaja vastab.'} <button type="button" className="link-button" onClick={cancelRequest}>Võta palve tagasi</button></p>
            : nextRequest?.status === 'accepted' && isAbsenceOnly(nextRequest) ? <p className="form-hint" role="status">Õpetaja märkis, et sa sellesse tundi ei tule.</p>
            : nextRequest?.status === 'declined' ? <p className="form-hint" role="status">Õpetaja ei saanud tundi üle viia{nextRequest.teacherNote ? `: ${nextRequest.teacherNote}` : ''}. Tund jääb samale ajale. <button type="button" className="link-button" onClick={() => setRescheduling(true)}>Küsi uuesti</button></p>
              : <button type="button" className="link-button" onClick={() => setRescheduling(true)}>Ei saa tulla?</button>) : null}
        </div>
        {upcoming.length > 1 ? <details className="sh-plan__more">
          <summary>Järgmised tunnid ({upcoming.length})</summary>
          <ul>{upcoming.map((item) => <li key={`${item.id}-${item.occurrenceDate}-${item.time}`}>
            <b>{item.occurrenceDate === today ? 'täna' : dateLabel(item.occurrenceDate)} {item.time}</b>
            <span>{[subjects.length > 1 ? itemSubject(item, studentOf(item)) : '', item.teacher].filter(Boolean).join(' · ')}</span>
          </li>)}</ul>
        </details> : null}
      </div>
    </section>
    {rescheduling && lessonAhead ? <RescheduleDialog lesson={lessonAhead} student={studentMap.get(lessonAhead.studentId) || students[0]} user={user} role="student"
      busy={occurrences.slice(0, 6).map((item) => ({ date: item.occurrenceDate, time: item.time, duration: item.duration }))} requests={changeRequests}
      onClose={() => setRescheduling(false)} onSent={() => { setRescheduling(false); state.reload(); }} /> : null}
  </div></div>;
}
