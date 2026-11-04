import { CheckCircle2, ChevronRight, MessageSquareText } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, lessonChangeRequestsService, lessonsService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { groupStudentPeople } from '../../services/firebase/students.js';
import LearnerAnnouncementsCard from '../announcements/LearnerAnnouncementsCard.jsx';
import AvailabilityCard from '../availability-poll/AvailabilityCard.jsx';
import { occurrencesForDates, shiftDate, toIsoDate } from '../calendar/calendarView.js';
import { INDIVIDUAL_TOPIC } from '../calendar/lessonTopic.js';
import { isAbsenceOnly, requestFor } from '../calendar/rescheduleModel.js';
import { taskCount, taskDueText } from '../homework/taskList.js';
import { ChildrenMonthSteps } from '../learner/MonthStepsCard.jsx';
import RecordingConsentPrompt from '../lesson-recording/RecordingConsentPrompt.jsx';
import OpenInvoicesCard from '../payments/OpenInvoicesCard.jsx';
import RescheduleDialog from '../students/RescheduleDialog.jsx';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import SubjectSwitcher from '../students/SubjectSwitcher.jsx';
import { itemSubject, onlySubject, subjectsOf } from '../students/subjects.js';
import LessonSummariesCard from '../vocabulary/LessonSummariesCard.jsx';
import LessonBoardsCard from '../board/LessonBoardsCard.jsx';
import MyWordsCard from '../vocabulary/MyWordsCard.jsx';
import { ChildrenWordGrowth } from '../vocabulary/WordGrowthCard.jsx';
import ChildSwitch, { childKeyOf } from './ChildSwitch.jsx';
import { childSummary, isRealInvoice, moneyDue } from './parentHome.js';
import './parentHome.css';

function unique(items) {
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

// the same meanings as in the calendar (LessonPanel): Puudus_eta = did not tell, Puudus_p = told in advance
const LESSON_MARK = {
  Toimunud: ['Toimus', 'success'],
  Puudus_p: ['Puudus (teatas ette)', 'neutral'],
  Puudus_eta: ['Puudus (ei teatanud)', 'danger'],
};

const money = (cents) => (Number(cents || 0) / 100).toLocaleString('et-EE', { style: 'currency', currency: 'EUR' });
const day = (iso, options = { weekday: 'short', day: 'numeric', month: 'short' }) => new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString('et-EE', options);
const SHORT_DAY = { day: 'numeric', month: 'short' };

function Ru({ children }) {
  return <span className="pd-ru" lang="ru"> · {children}</span>;
}

// One of the quiet areas under the answer. It reads its data when first opened, so the first screen stays light.
function Section({ id, title, ru, summary, open, onToggle, children }) {
  return <section className="pd-section" id={id}>
    <button type="button" className="pd-section__head" data-preview-allowed aria-expanded={open} aria-controls={`${id}-body`} onClick={onToggle}>
      <span><strong>{title}<Ru>{ru}</Ru></strong>{summary ? <small>{summary}</small> : null}</span>
      <ChevronRight size={18} aria-hidden="true" />
    </button>
    {open ? <div className="pd-section__body" id={`${id}-body`}>{children}</div> : null}
  </section>;
}

function ChildCard({ child, summary, subjects, onlyOneSubject, lessonRequest, onReschedule, readOnly }) {
  const { next, todo, late, total, feedback } = summary;
  const today = toIsoDate();
  const childKey = childKeyOf(child);
  return <article className="pd-card" aria-label={child.name}>
    <header className="pd-card__head">
      <h2>{child.name}</h2>
      {(child.enrollments || []).filter((item) => !onlyOneSubject || itemSubject({ subject: item.subject }) === onlyOneSubject).map((item) => <p key={item.id}>{[item.subject, item.level ? `${item.level}${item.targetLevel ? ` → ${item.targetLevel}` : ''}` : '', item.teacher].filter(Boolean).join(' · ')}</p>)}
    </header>

    <div className="pd-row">
      <small>Järgmine tund<Ru>следующий урок</Ru></small>
      {next ? <>
        <strong>{day(next.occurrenceDate)} kell {next.time}</strong>
        <p className="pd-muted">{[subjects > 1 ? itemSubject(next, child) : '', next.teacher].filter(Boolean).join(' · ')}</p>
        {lessonRequest?.status === 'pending' ? <p className="pd-muted" role="status">{isAbsenceOnly(lessonRequest) ? 'Teade on õpetajale saadetud.' : 'Palve on õpetajale saadetud.'}<Ru>сообщение отправлено учителю</Ru></p>
          : lessonRequest?.status === 'accepted' && isAbsenceOnly(lessonRequest) ? <p className="pd-muted" role="status">Õpetaja teab, et laps ei tule.<Ru>учитель знает, что ребёнок не придёт</Ru></p>
            : readOnly ? null : <button type="button" className="pd-linkbtn" onClick={() => onReschedule(next)}>Ei saa tulla?<Ru>не сможет прийти?</Ru></button>}
      </> : <p className="pd-muted">Tunde ei ole plaanis.<Ru>уроков пока нет</Ru></p>}
    </div>

    <div className="pd-row">
      <small>Mida teha<Ru>что нужно сделать</Ru></small>
      {todo.length ? <>
        <strong>{taskCount(todo.length)} vaja teha{late ? <span className="pd-late"> · {late} hilineb</span> : null}</strong>
        <ul className="pd-tasks">{todo.slice(0, 2).map((task) => <li key={task.key}><span>{task.title}</span>{task.due ? <small>{taskDueText(task.due, today)}</small> : null}</li>)}</ul>
        <Link className="pd-action" to="/homework" state={{ child: childKey }}>Vaata ülesandeid <ChevronRight size={17} aria-hidden="true" /></Link>
      </> : total ? <>
        <strong className="pd-ok"><CheckCircle2 size={17} aria-hidden="true" /> Kõik on tehtud<Ru>всё сделано</Ru></strong>
        <Link className="pd-linkbtn" to="/homework" state={{ child: childKey }}>Vaata ülesandeid</Link>
      </> : <p className="pd-muted">Praegu ülesandeid ei ole.<Ru>заданий пока нет</Ru></p>}
    </div>

    <div className="pd-row">
      <small>Õpetaja viimane tagasiside<Ru>последний отзыв учителя</Ru></small>
      {feedback ? <>
        {feedback.text ? <p className="pd-quote">{feedback.text}</p> : null}
        <p className="pd-muted">{[feedback.grade ? `Hinne ${feedback.grade}` : '', feedback.about, feedback.date ? day(feedback.date, SHORT_DAY) : ''].filter(Boolean).join(' · ')}</p>
      </> : <p className="pd-muted">Tagasisidet veel ei ole.<Ru>отзыва пока нет</Ru></p>}
    </div>
  </article>;
}

export default function ParentDashboardPage({ studentRepository = studentsService, homeworkRepository = homeworkService, scheduleRepository = scheduleService, invoiceRepository = invoicesService, lessonRepository = lessonsService, changeRequests = lessonChangeRequestsService, consentService, wordsService, summaryService, announcementService, boardCopiesService }) {
  const { user, preview } = useAuth();
  const location = useLocation();
  const [rescheduling, setRescheduling] = useState(null);
  const [childKey, setChildKey] = useState('');
  // one child with several subjects (owner 2026-10-20): the lessons and homework of one subject, or all
  const [subject, setSubject] = useState('');
  const [openSection, setOpenSection] = useState(location.hash.slice(1));
  const state = useAsyncData(async () => {
    const studentRecords = await studentRepository.listOwned(user.uid);
    const studentIds = studentRecords.map((student) => student.id);
    const [homework, assignments, submissions, scheduleLists, invoiceLists, lessonLists] = await Promise.all([
      homeworkRepository.listByStudentIds(studentIds),
      Promise.resolve().then(() => homeworkRepository.listWorksheetAssignmentsByStudentIds?.(studentIds) || []).catch(() => []),
      Promise.resolve().then(() => homeworkRepository.listSubmissionsByStudentIds?.(studentIds) || []).catch(() => []),
      Promise.all(studentIds.map((studentId) => scheduleRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => invoiceRepository.listByStudent(studentId))),
      Promise.all(studentIds.map((studentId) => (lessonRepository?.listByStudent ? lessonRepository.listByStudent(studentId).catch(() => []) : []))),
    ]);
    const requests = await Promise.resolve().then(() => changeRequests?.listForStudents?.(studentIds) || []).catch(() => []);
    return { students: groupStudentPeople(studentRecords), studentRecords, homework, assignments, submissions, schedule: unique(scheduleLists.flat()), invoices: unique(invoiceLists.flat()), lessons: unique(lessonLists.flat()), requests };
  }, [homeworkRepository, invoiceRepository, lessonRepository, scheduleRepository, studentRepository, user.uid]);

  const today = toIsoDate();
  const nextDates = useMemo(() => Array.from({ length: 28 }, (_, index) => shiftDate(today, index)), [today]);
  const occurrences = useMemo(() => (state.data ? occurrencesForDates(state.data.schedule, nextDates) : []), [nextDates, state.data]);

  if (state.loading) return <LoadingState label="Laen pere ülevaadet…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  const { students, studentRecords, invoices, lessons, homework, assignments, submissions } = state.data;
  const hello = <><h1 className="pd-hello">Tere, {user.displayName || 'lapsevanem'}!</h1><p className="pd-sub">{students.length > 1 ? 'Kuidas lastel läheb?' : 'Kuidas lapsel läheb?'}<Ru>{students.length > 1 ? 'как дела у детей?' : 'как дела у ребёнка?'}</Ru></p></>;
  const consent = !preview ? <RecordingConsentPrompt students={studentRecords} user={user} role="parent" {...(consentService ? { service: consentService } : {})} /> : null;
  if (!students.length) return <div className="page-content pd-page">{hello}{consent}<Card><EmptyState title="Õpilase kaarti ei ole kontoga seotud" description="Palu administraatoril siduda lapse olemasolev õpilase kaart sinu kontoga. · Попросите администратора привязать карточку ребёнка к вашему аккаунту." /></Card></div>;

  const child = students.find((person) => childKeyOf(person) === childKey) || students[0];
  const recordIds = (person) => person.recordIds || [person.id];
  const ofPerson = (person, items) => { const ids = new Set(recordIds(person)); return items.filter((item) => ids.has(item.studentId)); };
  const summaryOf = (person, chosen = '') => {
    const student = (item) => (person.records || [person]).find((record) => record.id === item.studentId) || person;
    const only = (items) => onlySubject(ofPerson(person, items), chosen, student);
    return childSummary({ homework: only(homework), assignments: only(assignments), submissions: ofPerson(person, submissions), lessons: only(lessons), occurrences: only(occurrences), today });
  };
  const subjects = subjectsOf(child);
  const chosen = subjects.length > 1 ? subject : '';
  const summary = summaryOf(child, chosen);
  const switchMarks = Object.fromEntries(students.map((person) => { const { todo, total } = summaryOf(person); return [childKeyOf(person), todo.length ? `${todo.length} vaja teha` : total ? 'kõik tehtud' : '']; }));

  const studentOf = (item) => studentRecords.find((record) => record.id === item.studentId) || null;
  const upcoming = onlySubject(ofPerson(child, occurrences), chosen, studentOf).slice(0, 6);
  const doneLessons = onlySubject(ofPerson(child, lessons), chosen, studentOf)
    .filter((lesson) => !lesson.status || LESSON_MARK[lesson.status])
    .sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`)).slice(0, 6);
  const subjectTag = (item) => (subjects.length > 1 && !chosen ? itemSubject(item, studentOf(item)) : '');
  const familyInvoices = invoices.filter(isRealInvoice).sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 6);
  const due = moneyDue(invoices);
  // the family's money under one child's card: say whose it is
  const dueNames = [...new Set(invoices.filter((invoice) => isRealInvoice(invoice) && invoiceBalanceCents(invoice) > 0).map((invoice) => (studentOf(invoice)?.name || invoice.studentName || '').trim().split(/\s+/)[0]).filter(Boolean))];
  const childRecords = child.records || [child];
  const childRecordIds = recordIds(child);
  const toggle = (id) => setOpenSection((current) => (current === id ? '' : id));
  const openInvoices = () => {
    setOpenSection('arved');
    globalThis.setTimeout?.(() => { try { document.getElementById('arved')?.scrollIntoView?.({ block: 'start', behavior: 'smooth' }); } catch { /* no scrolling here */ } }, 50);
  };
  const studentFor = (lesson) => studentOf(lesson) || { id: lesson.studentId, name: lesson.studentName };
  const lessonRequest = (lesson) => requestFor(state.data.requests, lesson);

  return <div className="page-content pd-page">
    {hello}
    {/* the parent's own question: an administrator's preview cannot answer it (as in the student's view) */}
    {consent}
    <ChildSwitch people={students} value={childKeyOf(child)} onChange={(key) => { setChildKey(key); setSubject(''); }} marks={switchMarks} />
    <SubjectSwitcher subjects={subjects} value={subject} onChange={setSubject} label="Näita õppeainet" />

    <ChildCard child={child} summary={summary} subjects={subjects.length} onlyOneSubject={chosen} lessonRequest={lessonRequest(summary.next)} onReschedule={setRescheduling} readOnly={Boolean(preview)} />

    {/* money only when something is due */}
    {due.cents > 0 ? <div className="pd-money" role="status">
      <span><strong>Tasumata {money(due.cents)}{due.overdue ? <span className="pd-late"> · tähtaeg möödas</span> : null}</strong><small>{students.length > 1 && dueNames.length ? `${dueNames.join(', ')} · ` : ''}<span lang="ru">{due.overdue ? 'к оплате, срок прошёл' : 'к оплате'}</span></small></span>
      <button type="button" className="pd-linkbtn" data-preview-allowed onClick={openInvoices}>Vaata arveid<Ru>счета</Ru></button>
    </div> : null}

    <div className="pd-sections">
      <Section id="tunnid" title="Tunnid" ru="уроки" summary={[upcoming.length ? `${upcoming.length} ${upcoming.length === 1 ? 'tund' : 'tundi'} plaanis` : 'Tunde ei ole plaanis', 'läbitud tunnid ja puudumised'].join(' · ')} open={openSection === 'tunnid'} onToggle={() => toggle('tunnid')}>
        <Card><div className="section-heading"><div><h2>Järgmised tunnid<Ru>следующие уроки</Ru></h2></div></div>{upcoming.length ? <div className="simple-list parent-home-lessons">{upcoming.map((lesson) => <div key={lesson.occurrenceId}><div><strong>{day(lesson.occurrenceDate)} · {lesson.time}</strong><span>{[subjectTag(lesson), lesson.teacher || 'Õpetaja'].filter(Boolean).join(' · ')}</span></div>{(() => { const request = lessonRequest(lesson); return request?.status === 'pending' ? <Badge tone="warning">{isAbsenceOnly(request) ? 'Teade saadetud' : 'Palve saadetud'}</Badge> : request?.status === 'accepted' && isAbsenceOnly(request) ? <Badge tone="neutral">Ei tule · märgitud</Badge> : <Button variant="secondary" onClick={() => setRescheduling(lesson)}>Ei saa tulla?</Button>; })()}</div>)}</div> : <EmptyState title="Lähimaid tunde ei ole" description="Kui õpetaja lisab tunni, näete seda siin. · Когда учитель добавит урок, он появится здесь." />}</Card>
        {/* no lesson balance here: how many paid lessons are left is for the administrator and the accountant (owner 2026-11-02) */}
        <Card><div className="section-heading"><div><h2>Viimased tunnid<Ru>прошедшие уроки</Ru></h2></div></div>{doneLessons.length ? <div className="simple-list parent-home-done">{doneLessons.map((lesson) => <div key={lesson.id}><div><strong>{lesson.topic || (lesson.status && lesson.status !== 'Toimunud' ? 'Tund jäi vahele' : INDIVIDUAL_TOPIC)}</strong><span>{[day(lesson.date, SHORT_DAY), subjectTag(lesson), [lesson.topicLevel, lesson.topicModule].filter(Boolean).join(' · ')].filter(Boolean).join(' · ')}</span>{lesson.billingStatus === 'school_covered' ? <Badge tone="success">Tasuta (kooli kulul)</Badge> : null}{lesson.notes ? <small className="parent-home-note">{lesson.notes}</small> : null}</div><Badge tone={(LESSON_MARK[lesson.status] || LESSON_MARK.Toimunud)[1]}>{(LESSON_MARK[lesson.status] || LESSON_MARK.Toimunud)[0]}</Badge></div>)}</div> : <EmptyState title="Läbitud tunde veel ei ole" />}</Card>
      </Section>

      {/* the whole family's invoices; „Tasumata arved” appears only with card payments and pays them */}
      <Section id="arved" title="Arved" ru="счета" summary={due.cents > 0 ? `Tasumata ${money(due.cents)}` : familyInvoices.length ? 'Kõik arved on tasutud' : 'Arveid ei ole'} open={openSection === 'arved'} onToggle={() => toggle('arved')}>
        <OpenInvoicesCard invoices={invoices} readOnly={Boolean(preview)} />
        <Card><div className="section-heading"><div><h2>Viimased arved<Ru>последние счета</Ru></h2></div></div>{familyInvoices.length ? <div className="simple-list parent-home-invoices">{familyInvoices.map((invoice) => {
          const open = invoiceBalanceCents(invoice);
          const overdue = isInvoiceOverdue(invoice);
          return <div key={invoice.id}><div><strong>{invoice.num ? `Arve ${invoice.num}` : 'Arve'} · {money(invoice.amountCents ?? Math.round(Number(invoice.amount || 0) * 100))}</strong><span>{[studentOf(invoice)?.name || invoice.studentName, invoice.desc, invoice.due ? `maksetähtaeg ${day(invoice.due, { day: 'numeric', month: 'short', year: 'numeric' })}` : ''].filter(Boolean).join(' · ')}</span>{open ? <small className="parent-home-note">Tasumata {money(open)}</small> : null}</div><Badge tone={!open ? 'success' : overdue ? 'danger' : 'info'}>{!open ? 'Tasutud' : overdue ? 'Tähtaeg möödas' : 'Tasumata'}</Badge></div>;
        })}</div> : <EmptyState title="Arveid ei ole" />}</Card>
      </Section>

      <Section id="areng" title="Areng" ru="успехи" summary="Sõnad, kuu sammud, tundide kokkuvõtted ja tahvlid" open={openSection === 'areng'} onToggle={() => toggle('areng')}>
        <ChildrenWordGrowth students={childRecords} {...(wordsService ? { service: wordsService } : {})} />
        <ChildrenMonthSteps students={childRecords} repository={homeworkRepository} />
        <LessonSummariesCard studentIds={childRecordIds} {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} homeworkService={homeworkRepository} />
        {/* „Tunni tahvlid”: the lesson boards as they were at the end of each lesson, read-only */}
        <LessonBoardsCard studentIds={childRecordIds} {...(boardCopiesService ? { service: boardCopiesService } : {})} />
        <MyWordsCard studentIds={childRecordIds} readOnly {...(wordsService ? { service: wordsService } : {})} />
      </Section>

      <Section id="teated" title="Teated ja sobivad ajad" ru="объявления и удобное время" summary="Kooli teated ja millal tund sobib" open={openSection === 'teated'} onToggle={() => toggle('teated')}>
        {/* „Teated”: the school's announcements already answered, to read again (owner 2026-10-24) */}
        <LearnerAnnouncementsCard user={user} {...(announcementService ? { service: announcementService } : {})} />
        {/* „Millal sobib tund?” for the child (owner 2026-10-21) */}
        <AvailabilityCard key={`ajad-${child.id}`} studentId={child.id} studentName={child.name} user={user} mode="own" compact subjects={subjects} />
      </Section>

      <Link className="pd-link-row" to="/messages"><span><strong><MessageSquareText size={16} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> Sõnumid<Ru>сообщения</Ru></strong><small>Kirjuta õpetajale · написать учителю</small></span><ChevronRight size={18} aria-hidden="true" /></Link>
    </div>

    {rescheduling ? <RescheduleDialog lesson={rescheduling} student={studentFor(rescheduling)} user={user} role="parent"
      busy={upcoming.map((item) => ({ date: item.occurrenceDate, time: item.time, duration: item.duration }))} requests={changeRequests}
      onClose={() => setRescheduling(null)} onSent={() => { setRescheduling(null); state.reload(); }} /> : null}
  </div>;
}
