import { CalendarDays, CheckCircle2, ChevronRight, ClipboardList, MessageSquareText, Receipt } from 'lucide-react';
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
import ProficiencyCard from '../progress-points/ProficiencyCard.jsx';
import { targetLevelOf } from '../progress-points/levelCurve.js';
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
import NowLearningCard from './NowLearningCard.jsx';
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

// the child's side cards: next lessons, homework, the teacher's words, money, contact. Short, one tap to the details.
function ChildCards({ child, summary, upcoming, subjects, onlyOneSubject, lessonRequest, onReschedule, readOnly, due, dueNames, onInvoices, invoicesCount }) {
  const { todo, late, total, feedback } = summary;
  const today = toIsoDate();
  const childKey = childKeyOf(child);
  const next = upcoming.slice(0, 3);
  return <div className="pd-side">
    <section className="pd-card" aria-label="Järgmised tunnid">
      <div className="pd-row">
        <small><CalendarDays size={14} aria-hidden="true" /> Järgmised tunnid<Ru>следующие уроки</Ru></small>
        {next.length ? <ul className="pd-next">{next.map((lesson) => {
          const request = lessonRequest(lesson);
          return <li key={lesson.occurrenceId}>
            <span><strong>{day(lesson.occurrenceDate)} kell {lesson.time}</strong><small>{[subjects > 1 && !onlyOneSubject ? itemSubject(lesson, child) : '', lesson.teacher].filter(Boolean).join(' · ')}</small></span>
            {request?.status === 'pending' ? <em role="status">{isAbsenceOnly(request) ? 'Teade saadetud' : 'Palve saadetud'}<Ru>отправлено</Ru></em>
              : request?.status === 'accepted' && isAbsenceOnly(request) ? <em role="status">Õpetaja teab, et laps ei tule.<Ru>учитель знает</Ru></em>
                : readOnly ? null : <button type="button" className="pd-linkbtn" onClick={() => onReschedule(lesson)}>Ei saa tulla?<Ru>не сможет прийти?</Ru></button>}
          </li>;
        })}</ul> : <p className="pd-muted">Tunde ei ole plaanis.<Ru>уроков пока нет</Ru></p>}
      </div>
    </section>

    <section className="pd-card" aria-label="Kodutööd">
      <div className="pd-row">
        <small><ClipboardList size={14} aria-hidden="true" /> Kodutööd<Ru>домашние задания</Ru></small>
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
    </section>

    {/* money: what is due, never how many paid lessons are left (owner 2026-11-02: admin and accountant only) */}
    <section className={`pd-card ${due.cents > 0 ? 'pd-card--due' : ''}`} aria-label="Arved">
      <div className="pd-row">
        <small><Receipt size={14} aria-hidden="true" /> Arved<Ru>счета</Ru></small>
        {due.cents > 0 ? <div role="status">
          <strong>Tasumata {money(due.cents)}{due.overdue ? <span className="pd-late"> · tähtaeg möödas</span> : null}</strong>
          <p className="pd-muted">{dueNames.length ? `${dueNames.join(', ')} · ` : ''}<span lang="ru">{due.overdue ? 'к оплате, срок прошёл' : 'к оплате'}</span></p>
        </div> : <p className="pd-muted">{invoicesCount ? 'Kõik arved on tasutud.' : 'Arveid ei ole.'}<Ru>{invoicesCount ? 'всё оплачено' : 'счетов нет'}</Ru></p>}
        <button type="button" className="pd-linkbtn" data-preview-allowed onClick={onInvoices}>Vaata arveid<Ru>счета</Ru></button>
      </div>
    </section>

    <Link className="pd-link-row" to="/messages"><span><strong><MessageSquareText size={16} aria-hidden="true" style={{ verticalAlign: '-3px' }} /> Kirjuta õpetajale<Ru>написать учителю</Ru></strong><small>{child.teacher ? `${child.teacher} · ` : ''}Sõnumid kooliga · сообщения</small></span><ChevronRight size={18} aria-hidden="true" /></Link>
  </div>;
}

export default function ParentDashboardPage({ studentRepository = studentsService, homeworkRepository = homeworkService, scheduleRepository = scheduleService, invoiceRepository = invoicesService, lessonRepository = lessonsService, changeRequests = lessonChangeRequestsService, consentService, wordsService, summaryService, announcementService, boardCopiesService, pointsService, goalsLoader }) {
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
  // the chip: name + level (+ what is still to do), so a parent of two sees both at a glance
  const switchMarks = Object.fromEntries(students.map((person) => { const { todo, total } = summaryOf(person); const only = person.enrollments?.length === 1 ? person.enrollments[0] : null; const level = only?.level && only?.targetLevel ? `${only.level} → ${only.targetLevel}` : person.level; return [childKeyOf(person), [level, todo.length ? `${todo.length} vaja teha` : total ? 'kõik tehtud' : ''].filter(Boolean).join(' · ')]; }));

  const studentOf = (item) => studentRecords.find((record) => record.id === item.studentId) || null;
  const childOnly = (items) => onlySubject(ofPerson(child, items), chosen, studentOf);
  const upcoming = childOnly(occurrences).slice(0, 6);
  const childLessons = childOnly(lessons);
  const childAssignments = childOnly(assignments);
  const doneLessons = childLessons
    .filter((lesson) => !lesson.status || LESSON_MARK[lesson.status])
    .sort((a, b) => `${b.date} ${b.time || ''}`.localeCompare(`${a.date} ${a.time || ''}`)).slice(0, 6);
  const subjectTag = (item) => (subjects.length > 1 && !chosen ? itemSubject(item, studentOf(item)) : '');
  const familyInvoices = invoices.filter(isRealInvoice).sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 6);
  const due = moneyDue(invoices);
  // the family's money under one child's card: say whose it is
  const dueNames = students.length > 1 ? [...new Set(invoices.filter((invoice) => isRealInvoice(invoice) && invoiceBalanceCents(invoice) > 0).map((invoice) => (studentOf(invoice)?.name || invoice.studentName || '').trim().split(/\s+/)[0]).filter(Boolean))] : [];
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

    <article className="pd-child" aria-label={child.name}>
      <header className="pd-child__head">
        <h2>{child.name}</h2>
        {(child.enrollments || []).filter((item) => !chosen || itemSubject({ subject: item.subject }) === chosen).map((item) => <p key={item.id || `${item.subject}-${item.teacher}`}>{[item.subject, item.level ? `${item.level}${item.targetLevel ? ` → ${item.targetLevel}` : ''}` : '', item.teacher].filter(Boolean).join(' · ')}</p>)}
      </header>
      <div className="pd-layout">
        <div className="pd-main">
          {/* „Areng” (owner 2026-11-04): one curve of measured proficiency toward the level, mock exams marked */}
          <ProficiencyCard key={`areng-${childKeyOf(child)}`} studentIds={childRecordIds} assignments={ofPerson(child, assignments)} targetLevel={targetLevelOf(child)} {...(pointsService ? { service: pointsService } : {})} {...(goalsLoader ? { loadGoals: goalsLoader } : {})} />
          <NowLearningCard lessons={childLessons} assignments={childAssignments} today={today} />
        </div>
        <ChildCards child={child} summary={summary} upcoming={upcoming} subjects={subjects.length} onlyOneSubject={chosen} lessonRequest={lessonRequest} onReschedule={setRescheduling} readOnly={Boolean(preview)}
          due={due} dueNames={dueNames} onInvoices={openInvoices} invoicesCount={familyInvoices.length} />
      </div>
    </article>

    <div className="pd-sections">
      <Section id="tunnid" title="Tunnid" ru="уроки" summary={[upcoming.length ? `${upcoming.length} ${upcoming.length === 1 ? 'tund' : 'tundi'} plaanis` : 'Tunde ei ole plaanis', 'läbitud tunnid ja puudumised'].join(' · ')} open={openSection === 'tunnid'} onToggle={() => toggle('tunnid')}>
        <Card><div className="section-heading"><div><h2>Järgmised tunnid<Ru>следующие уроки</Ru></h2></div></div>{upcoming.length ? <div className="simple-list parent-home-lessons">{upcoming.map((lesson) => <div key={lesson.occurrenceId}><div><strong>{day(lesson.occurrenceDate)} · {lesson.time}</strong><span>{[subjectTag(lesson), lesson.teacher || 'Õpetaja'].filter(Boolean).join(' · ')}</span></div>{(() => { const request = lessonRequest(lesson); return request?.status === 'pending' ? <Badge tone="warning">{isAbsenceOnly(request) ? 'Teade saadetud' : 'Palve saadetud'}</Badge> : request?.status === 'accepted' && isAbsenceOnly(request) ? <Badge tone="neutral">Ei tule · märgitud</Badge> : preview ? null : <Button variant="secondary" onClick={() => setRescheduling(lesson)}>Ei saa tulla?</Button>; })()}</div>)}</div> : <EmptyState title="Lähimaid tunde ei ole" description="Kui õpetaja lisab tunni, näete seda siin. · Когда учитель добавит урок, он появится здесь." />}</Card>
        {/* no lesson balance here: how many paid lessons are left is for the administrator and the accountant (owner 2026-11-02) */}
        <Card><div className="section-heading"><div><h2>Viimased tunnid<Ru>прошедшие уроки</Ru></h2></div></div>{doneLessons.length ? <div className="simple-list parent-home-done">{doneLessons.map((lesson) => <div key={lesson.id}><div><strong>{lesson.topic || (lesson.status && lesson.status !== 'Toimunud' ? 'Tund jäi vahele' : INDIVIDUAL_TOPIC)}</strong><span>{[day(lesson.date, SHORT_DAY), subjectTag(lesson), [lesson.topicLevel, lesson.topicModule].filter(Boolean).join(' · ')].filter(Boolean).join(' · ')}</span>{lesson.billingStatus === 'school_covered' ? <Badge tone="success">Tasuta (kooli kulul)</Badge> : null}{lesson.notes ? <small className="parent-home-note">{lesson.notes}</small> : null}</div><Badge tone={(LESSON_MARK[lesson.status] || LESSON_MARK.Toimunud)[1]}>{(LESSON_MARK[lesson.status] || LESSON_MARK.Toimunud)[0]}</Badge></div>)}</div> : <EmptyState title="Läbitud tunde veel ei ole" />}</Card>
      </Section>

      {/* „Tunni tahvlid”: the lesson boards as they were at the end of each lesson, read-only */}
      <Section id="tahvlid" title="Tunni tahvlid" ru="доски с уроков" summary="Mis tunnis tahvlile jäi" open={openSection === 'tahvlid'} onToggle={() => toggle('tahvlid')}>
        <LessonBoardsCard studentIds={childRecordIds} {...(boardCopiesService ? { service: boardCopiesService } : {})} />
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

      <Section id="areng" title="Sõnad ja tundide kokkuvõtted" ru="слова и итоги уроков" summary="Õpitud sõnad, parandatud vead, mida tunnis tehti" open={openSection === 'areng'} onToggle={() => toggle('areng')}>
        <ChildrenWordGrowth students={childRecords} {...(wordsService ? { service: wordsService } : {})} />
        <LessonSummariesCard studentIds={childRecordIds} {...(summaryService ? { summaryService } : {})} {...(wordsService ? { wordsService } : {})} homeworkService={homeworkRepository} />
        <MyWordsCard studentIds={childRecordIds} readOnly {...(wordsService ? { service: wordsService } : {})} />
      </Section>

      <Section id="teated" title="Teated ja sobivad ajad" ru="объявления и удобное время" summary="Kooli teated ja millal tund sobib" open={openSection === 'teated'} onToggle={() => toggle('teated')}>
        {/* „Teated”: the school's announcements already answered, to read again (owner 2026-10-24) */}
        <LearnerAnnouncementsCard user={user} {...(announcementService ? { service: announcementService } : {})} />
        {/* „Millal sobib tund?” for the child (owner 2026-10-21) */}
        <AvailabilityCard key={`ajad-${child.id}`} studentId={child.id} studentName={child.name} user={user} mode="own" compact subjects={subjects} />
      </Section>
    </div>

    {rescheduling ? <RescheduleDialog lesson={rescheduling} student={studentFor(rescheduling)} user={user} role="parent"
      busy={upcoming.map((item) => ({ date: item.occurrenceDate, time: item.time, duration: item.duration }))} requests={changeRequests}
      onClose={() => setRescheduling(null)} onSent={() => { setRescheduling(null); state.reload(); }} /> : null}
  </div>;
}
