import { CalendarClock, CalendarDays, Check, ChevronRight, Flame, Megaphone, MessageSquareText, PawPrint, WalletCards } from 'lucide-react';
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
import { feedbackSeenAt, homeNotes, newFeedback, nextStep } from './nextStep.js';
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
  const daySteps = todayPath({ words, homework, submissions, assignments, mistakesDoneToday: reviewedToday, today }).steps.filter((item) => !item.idle).slice(0, 3);
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

    <div className="sh-hero">
      {pet?.kind && !pet.optedOut ? <PetLoop user={user} studentId={students[0].id} pet={pet} readOnly={Boolean(preview)} lessons={state.data.lessons} submissions={submissions} homework={state.data.homework} assignments={sheets} words={words} subject={chosen || students[0].subject || ''}
        repository={petRepository} {...(wordsService ? { wordsService } : {})} /> : null}
      {offerPet ? <Link className="sh-pet" to="/student/lemmik"><i style={{ display: 'grid', placeItems: 'center' }}><PawPrint size={40} aria-hidden="true" /></i><span><strong>Vali endale sõber</strong><small>Õppesõber kasvab koos sinuga</small></span></Link> : null}
      <div className="sh-main">
        <section className={`sh-step ${step.key === 'done' ? 'is-done' : ''}`} aria-label="Järgmine samm">
          <small>Järgmine samm</small>
          <strong>{step.title}</strong>
          <span>{step.detail}</span>
          <Link to={step.to}>{step.button} <ChevronRight size={17} aria-hidden="true" /></Link>
        </section>
        <div className="sh-lesson">
          <span><CalendarDays size={17} aria-hidden="true" /> {lessonAhead
            ? <>Järgmine tund: <strong>{lessonAhead.occurrenceDate === today ? 'täna' : dateLabel(lessonAhead.occurrenceDate)} {lessonAhead.time}</strong>{subjects.length > 1 ? ` · ${itemSubject(lessonAhead, studentOf(lessonAhead))}` : ''}</>
            : 'Tunde ei ole plaanis'}</span>
          {lessonAhead && !preview ? (nextRequest?.status === 'pending' ? <p className="form-hint" role="status">{isAbsenceOnly(nextRequest) ? 'Teade, et sa ei tule, on õpetajale saadetud.' : 'Palve tund üle viia on saadetud. Tund jääb oma kohale, kuni õpetaja vastab.'} <button type="button" className="link-button" onClick={cancelRequest}>Võta palve tagasi</button></p>
            : nextRequest?.status === 'accepted' && isAbsenceOnly(nextRequest) ? <p className="form-hint" role="status">Õpetaja märkis, et sa sellesse tundi ei tule.</p>
            : nextRequest?.status === 'declined' ? <p className="form-hint" role="status">Õpetaja ei saanud tundi üle viia{nextRequest.teacherNote ? `: ${nextRequest.teacherNote}` : ''}. Tund jääb samale ajale. <button type="button" className="link-button" onClick={() => setRescheduling(true)}>Küsi uuesti</button></p>
              : <button type="button" className="link-button" onClick={() => setRescheduling(true)}>Ei saa tulla?</button>) : null}
        </div>
      </div>
    </div>
    {rescheduling && lessonAhead ? <RescheduleDialog lesson={lessonAhead} student={studentMap.get(lessonAhead.studentId) || students[0]} user={user} role="student"
      busy={occurrences.slice(0, 6).map((item) => ({ date: item.occurrenceDate, time: item.time, duration: item.duration }))} requests={changeRequests}
      onClose={() => setRescheduling(false)} onSent={() => { setRescheduling(false); state.reload(); }} /> : null}

    {daySteps.length ? <section className="sh-today" aria-label="Täna">
      <header className="sh-today__head">
        <h2>Täna {daySteps.filter((item) => item.done).length}/{daySteps.length}</h2>
        {streak ? <span className="sh-streak" title="Õppimise päevi järjest"><Flame size={15} aria-hidden="true" /> {streak} {streak === 1 ? 'päev' : 'päeva'} järjest</span> : null}
      </header>
      <ul>{daySteps.map((item) => (
        <li key={item.key} className={item.done ? 'is-done' : ''}><Link to={item.to}>
          <i>{item.done ? <Check size={14} aria-hidden="true" /> : null}</i>
          <b>{item.label}</b><small>{item.detail}</small>
        </Link></li>
      ))}</ul>
    </section> : null}

    {notes.length ? <ul className="sh-notes" aria-label="Sulle on uudiseid">{notes.map((note) => {
      if (note.key === 'invoice') return <InvoiceNote key={note.key} note={note} invoices={unpaid} readOnly={Boolean(preview)} {...(paymentsApi ? { api: paymentsApi } : {})} />;
      const Icon = NOTE_ICON[note.key];
      return <li key={note.key}><Link to={note.to}><Icon size={17} aria-hidden="true" /> {note.text} <ChevronRight size={15} aria-hidden="true" /></Link></li>;
    })}</ul> : null}

    <div><Link className="sh-link" to="/student/areng">Minu areng <ChevronRight size={15} aria-hidden="true" /></Link></div>
  </div></div>;
}
