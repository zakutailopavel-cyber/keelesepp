import { CalendarClock, CalendarDays, ChevronRight, Megaphone, MessageSquareText, PawPrint, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Card, EmptyState, ErrorState, Skeleton, SkeletonRow, SkeletonScreen } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { lessonChangeRequestsService } from '../../services/firebase/lessonChangeRequests.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { petsService } from '../../services/firebase/pets.js';
import { scheduleService } from '../../services/firebase/schedule.js';
import { studentsService } from '../../services/firebase/students.js';
import { studentMonologuesService } from '../../services/firebase/studentMonologues.js';
import { announcementsService } from '../../services/firebase/announcements.js';
import { isAbsenceOnly, requestFor } from '../calendar/rescheduleModel.js';
import RescheduleDialog from './RescheduleDialog.jsx';
import PetLoop from '../pet/PetLoop.jsx';
import { petProgress } from '../pet/petModel.js';
import { langOf } from '../pet/petLoop.js';
import { nextLesson as firstLessonAhead } from '../pet/petLife.js';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { invoiceBalanceCents } from './studentFinance.js';
import OpenInvoicesCard from '../payments/OpenInvoicesCard.jsx';
import { linkpayApi } from '../../services/firebase/linkpayApi.js';
import { parentCardIds } from '../parents/parentModel.js';
import RecordingConsentPrompt from '../lesson-recording/RecordingConsentPrompt.jsx';
import { useStudentWords } from '../vocabulary/useStudentWords.js';
import { monologueLevel, monologueTask } from '../monologue/monologueModel.js';
import { COURSE_LOADERS } from '../worksheet-generator/admin/course/courseLoaders.js';
import { loadStudentPractice, sentencesAvailable } from '../practice/studentPractice.js';
import { usePracticeProgress } from '../practice/usePracticeProgress.js';
import { hasWordAudio, loadWordAudio } from '../vocabulary/wordAudio.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { fullSentence } from '../practice/engine/items.js';
import SubjectSwitcher from './SubjectSwitcher.jsx';
import { itemSubject, onlySubject, subjectsOf } from './subjects.js';
import { feedbackSeenAt, homeNotes, newFeedback, todaySteps } from './nextStep.js';
import TodayPanel from './TodayPanel.jsx';
import LessonSoonPrefetch from '../live-classroom/LessonSoonPrefetch.jsx';
import './studentHome.css';
import './today.css';

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

// while the first data loads: the greeting, the „Täna” card beside the pet
function StudentHomeSkeleton() {
  return <SkeletonScreen className="page-content sh-page" label="Laen sinu tänast päeva…">
    <Skeleton lines={1} className="skeleton--heading" />
    <SkeletonRow kind="split">
      <Skeleton variant="card" className="skeleton--tall" />
      <Skeleton variant="card" className="skeleton--tall" />
    </SkeletonRow>
  </SkeletonScreen>;
}

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

/**
 * The student's home „Täna” (owner 2026-11-09): one big „Alusta tänast” that runs the day's steps in order
 * (nextStep.js todaySteps → TodayPanel), below it today's lesson time and the pet card. Nothing else on the first screen;
 * the quiet lines (teacher feedback, announcements, an unpaid invoice) come after, only when there is one.
 */
export default function StudentDashboardPage({
  studentRepository = studentsService,
  homeworkRepository = homeworkService,
  scheduleRepository = scheduleService,
  invoiceRepository = invoicesService,
  lessonRepository = lessonsService,
  petRepository = petsService,
  monologueRepository = studentMonologuesService,
  changeRequests = lessonChangeRequestsService,
  announcementService = announcementsService,
  practiceService,
  courseLoaders = COURSE_LOADERS,
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
    // „Kuu monoloog” (bug fixed 2026-11-09: home never passed it to the decider): the card with an Estonian A2–C1 track
    const monologueCard = students.find((student) => monologueLevel(student)) || null;
    const [pet, sheets, homework, submissions, scheduleLists, invoiceLists, lessonLists, monologues] = await Promise.all([
      // staff in a preview see the same pet read-only, if the rules let them read it
      Promise.resolve().then(() => petRepository.get?.(user.uid)).catch(() => null),
      Promise.resolve().then(() => homeworkRepository.listWorksheetAssignmentsByStudentIds?.(studentIds) || []).catch(() => []),
      homeworkRepository.listByStudentIds(studentIds),
      homeworkRepository.listSubmissionsByStudentIds(studentIds),
      Promise.all(studentIds.map((studentId) => scheduleRepository.listByStudent(studentId))),
      Promise.all(ownInvoiceCards.map((studentId) => invoiceRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => lessonRepository.listByStudent(studentId))),
      monologueCard && !preview ? Promise.resolve().then(() => monologueRepository?.listByStudent?.(monologueCard.id)).catch(() => null) : null,
    ]);
    const requests = await Promise.resolve().then(() => changeRequests?.listForStudents?.(studentIds) || []).catch(() => []);
    const monologue = monologueCard && Array.isArray(monologues) ? monologueTask({ student: monologueCard, monologues }) : null;
    return {
      pet: pet || null, sheets, students, homework, submissions, schedule: unique(scheduleLists.flat()), invoices: unique(invoiceLists.flat()), lessons: unique(lessonLists.flat()), requests,
      tasks: monologue ? [{ ...monologue, to: '/student/monoloog' }] : [],
    };
  }, [homeworkRepository, invoiceRepository, lessonRepository, preview?.studentId, scheduleRepository, studentRepository, user.uid]);

  // the school's open announcements, after the page is drawn: a line appears if there is one (the gate shows them first)
  const [pendingNotes, setPendingNotes] = useState([]);
  useEffect(() => {
    if (preview || !announcementService?.mine) return undefined;
    let live = true;
    Promise.resolve().then(() => announcementService.mine()).then((result) => { if (live) setPendingNotes(Array.isArray(result?.pending) ? result.pending : []); }).catch(() => {});
    return () => { live = false; };
  }, [announcementService, preview, user.uid]);

  const words = useStudentWords((state.data?.students || []).map((student) => student.id), ...(wordsService ? [wordsService] : []));
  const progress = usePracticeProgress(user, { readOnly: Boolean(preview), ...(practiceService ? { service: practiceService } : {}) });
  const [reaction, setReaction] = useState('');
  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 28 }, (_, index) => shiftDate(today, index)), [today]);
  if (state.loading) return <StudentHomeSkeleton />;
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

  // the student whose course and language the practice follows: the chosen subject's card, else the first one
  const main = (chosen && students.find((student) => subjectsOf([student]).includes(chosen))) || students.find((student) => !student.isSelfStudent) || students[0];
  // the first screen counts his own sentences from the word cards; the recorded lessons' sentences load with the step
  const sentences = sentencesAvailable({ student: main, words });
  const plan = todaySteps({
    occurrences, homework, assignments, submissions, tasks: state.data.tasks, words, sentences,
    selfStudent: students.some((student) => student.isSelfStudent), done: progress.today.done, today,
  });
  const lang = langOf(main?.subject || '');
  // when the step starts: his recorded lessons' corrected sentences (the second source of „my mistakes”) and the audio
  // manifest (listening items only for sentences with a stored recording); either may fail and is then left out
  const loadPractice = async () => {
    const [stats] = await Promise.all([
      Promise.resolve().then(() => (preview?.studentId ? petRepository.lessonStatsForStudents?.([preview.studentId]) : petRepository.lessonStats?.(user.uid))).catch(() => []),
      Promise.resolve().then(() => loadWordAudio()).catch(() => null),
    ]);
    return loadStudentPractice({
      student: main, lessons: state.data.lessons, words, stats: stats || [], loaders: courseLoaders, seed: `${user.uid}|${today}`,
      canListen: (item) => hasWordAudio(fullSentence(item)),
    });
  };
  const upcoming = occurrences.filter((item) => item.status !== 'Tühistatud').slice(0, 5);
  const petStage = petProgress({ lessons: state.data.lessons, submissions, homework: state.data.homework, words, practiceXp: progress.xp }).stage;
  const offerPet = !preview && !pet?.optedOut && !pet?.kind;
  const unpaid = invoices.filter((invoice) => invoice.status !== 'Tühistatud' && invoiceBalanceCents(invoice) > 0);
  const unpaidCents = unpaid.reduce((sum, invoice) => sum + invoiceBalanceCents(invoice), 0);
  const notes = homeNotes({ feedback: newFeedback(submissions, feedbackSeenAt(user.uid)), announcements: preview ? [] : pendingNotes, unpaidCents, money });

  return <div className="page-content sh-page"><div className="sh">
    {hello}
    {!preview?.studentId ? <RecordingConsentPrompt students={students} user={user} role="student" {...(consentService ? { service: consentService } : {})} /> : null}
    <SubjectSwitcher subjects={subjects} value={subject} onChange={setSubject} label="Minu õppeained" />

    {/* the first screen (owner 2026-11-09): „Täna” with one button, then the lesson time and the pet — nothing else */}
    <div className="sh-today">
      <TodayPanel plan={plan} today={progress.today} streak={progress.streak} pet={pet} petStage={petStage} lang={lang} language={main?.preferredLanguage || ''}
        words={words} wordsService={wordsService || studentWordsService} readOnly={Boolean(preview)} loadPractice={loadPractice}
        onTick={(key) => progress.save({ done: [key] })} onReact={setReaction} />
      <div className="sh-side">
        <section className="sh-time" id="tunniplaan" aria-label="Tunniplaan">
          {lessonAhead && !preview ? <LessonSoonPrefetch lesson={lessonAhead} /> : null}
          <h3><CalendarDays size={18} aria-hidden="true" /> {lessonAhead ? <>Järgmine tund: <strong>{lessonAhead.occurrenceDate === today ? 'täna' : dateLabel(lessonAhead.occurrenceDate)} {lessonAhead.time}</strong></> : 'Tunde ei ole plaanis'}</h3>
          <div className="sh-lesson">
            <span>{lessonAhead ? [subjects.length > 1 ? itemSubject(lessonAhead, studentOf(lessonAhead)) : '', lessonAhead.teacher].filter(Boolean).join(' · ') : ''}</span>
            {lessonAhead && !preview ? (nextRequest?.status === 'pending' ? <p className="form-hint" role="status">{isAbsenceOnly(nextRequest) ? 'Teade, et sa ei tule, on õpetajale saadetud.' : 'Palve tund üle viia on saadetud. Tund jääb oma kohale, kuni õpetaja vastab.'} <button type="button" className="link-button" onClick={cancelRequest}>Võta palve tagasi</button></p>
              : nextRequest?.status === 'accepted' && isAbsenceOnly(nextRequest) ? <p className="form-hint" role="status">Õpetaja märkis, et sa sellesse tundi ei tule.</p>
                : nextRequest?.status === 'declined' ? <p className="form-hint" role="status">Õpetaja ei saanud tundi üle viia{nextRequest.teacherNote ? `: ${nextRequest.teacherNote}` : ''}. Tund jääb samale ajale. <button type="button" className="link-button" onClick={() => setRescheduling(true)}>Küsi uuesti</button></p>
                  : <button type="button" className="link-button" onClick={() => setRescheduling(true)}>Ei saa tulla?</button>) : null}
            {lessonAhead && !preview ? <Link className="link-button" to="/kontroll">Kontrolli seadet <span lang="ru">· камера и звук</span></Link> : null}
          </div>
          {upcoming.length > 1 ? <details className="sh-plan__more">
            <summary>Järgmised tunnid ({upcoming.length})</summary>
            <ul>{upcoming.map((item) => <li key={`${item.id}-${item.occurrenceDate}-${item.time}`}>
              <b>{item.occurrenceDate === today ? 'täna' : dateLabel(item.occurrenceDate)} {item.time}</b>
              <span>{[subjects.length > 1 ? itemSubject(item, studentOf(item)) : '', item.teacher].filter(Boolean).join(' · ')}</span>
            </li>)}</ul>
          </details> : null}
        </section>
        {pet?.kind && !pet.optedOut ? <PetLoop user={user} studentId={students[0].id} pet={pet} readOnly={Boolean(preview)} lessons={state.data.lessons} submissions={submissions} homework={state.data.homework} assignments={sheets} words={words}
          subject={chosen || students[0].subject || ''} practiceXp={progress.xp} streak={progress.streak} reaction={reaction} ready={plan.todo.length > 0}
          repository={petRepository} /> : null}
        {offerPet ? <Link className="sh-pet" to="/student/lemmik"><i style={{ display: 'grid', placeItems: 'center' }}><PawPrint size={40} aria-hidden="true" /></i><span><strong>Vali endale sõber</strong><small>Õppesõber kasvab koos sinuga</small></span></Link> : null}
      </div>
    </div>

    {notes.length ? <ul className="sh-notes" aria-label="Sulle on uudiseid">{notes.map((note) => {
      if (note.key === 'invoice') return <InvoiceNote key={note.key} note={note} invoices={unpaid} readOnly={Boolean(preview)} {...(paymentsApi ? { api: paymentsApi } : {})} />;
      const Icon = NOTE_ICON[note.key];
      return <li key={note.key}><Link to={note.to}><Icon size={17} aria-hidden="true" /> {note.text} <ChevronRight size={15} aria-hidden="true" /></Link></li>;
    })}</ul> : null}
    {rescheduling && lessonAhead ? <RescheduleDialog lesson={lessonAhead} student={studentMap.get(lessonAhead.studentId) || students[0]} user={user} role="student"
      busy={occurrences.slice(0, 6).map((item) => ({ date: item.occurrenceDate, time: item.time, duration: item.duration }))} requests={changeRequests}
      onClose={() => setRescheduling(false)} onSent={() => { setRescheduling(false); state.reload(); }} /> : null}
  </div></div>;
}
