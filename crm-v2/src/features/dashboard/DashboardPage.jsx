import { ArrowUpRight, BookOpenCheck, CalendarCheck, CalendarDays, CheckCircle2, CircleAlert, GraduationCap, MessageSquareText, ReceiptText, Users, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { useEntityChanged } from '../../components/entityDrawer/useEntityChanged.js';
import { Card, ErrorState } from '../../components/ui/index.js';
import DashboardSkeleton from './DashboardSkeleton.jsx';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService } from '../../services/firebase/groups.js';
import { homeworkService } from '../../services/firebase/homework.js';
import { invoicesService } from '../../services/firebase/invoices.js';
import { lessonsService } from '../../services/firebase/lessons.js';
import { presenceService } from '../../services/firebase/presence.js';
import { scheduleService } from '../../services/firebase/schedule.js';
import { studentWordsService } from '../../services/firebase/studentWords.js';
import { studentsService } from '../../services/firebase/students.js';
import { groupCalendarEvents } from '../calendar/calendarView.js';
import { unplannedStudents } from '../calendar/unplannedStudents.js';
import { groupStudentPeople } from '../../services/firebase/students.js';
import { occurrencesForDates } from '../calendar/calendarView.js';
import { ROLES } from '../../utils/roles.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import { isHomeworkOpen } from '../homework/homeworkStatus.js';
import RetentionCard from '../retention/RetentionCard.jsx';
import { recentlyScheduled } from '../retention/retentionRisk.js';
import UnmarkedLessonsCard from '../calendar/UnmarkedLessonsCard.jsx';
import { unmarkedReminder } from '../calendar/unmarkedLessons.js';
import UnmarkedNudge from './UnmarkedNudge.jsx';
import CashOnHandLine from '../cash/CashOnHandLine.jsx';
import { BalancePanel, CallsPanel, HomeworkPanel, LeadsPanel, TodayTimeline } from './today/TodayPanel.jsx';
import { todayApi, useTodaySignals } from './today/useTodaySignals.js';
import { tallinnDay } from './today/todayModel.js';
import { attentionItems, lateReviews, lessonsSoon } from './calmModel.js';
import './calm.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
const defaultRepositories = {
  students: studentsService,
  schedule: scheduleService,
  invoices: invoicesService,
  homework: homeworkService,
  groups: groupsService,
};

async function loadDashboardData(user, repositories, now) {
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isTeacher = user.roles.includes(ROLES.TEACHER);
  const isFinance = user.roles.includes(ROLES.FINANCE);
  const teacherOnly = isTeacher && !isAdmin;
  const canViewLearning = isAdmin || isTeacher;
  const canViewFinance = isAdmin || isFinance;

  const studentsPromise = canViewLearning
    ? repositories.students.list({
      status: 'active', // like „Kodutööd”: an archived student's open homework is not work to chase
      pageSize: 500,
      exhaustive: true,
      ...(teacherOnly ? { scopeTeacherUid: user.uid } : {}),
    })
    : Promise.resolve({ items: [] });
  const schedulePromise = canViewLearning
    ? repositories.schedule.list(teacherOnly ? { teacherUid: user.uid } : {})
    : Promise.resolve([]);
  const invoicesPromise = canViewFinance ? repositories.invoices.list() : Promise.resolve([]);
  const homeworkPromise = canViewLearning
    ? (teacherOnly
      ? studentsPromise.then(({ items }) => repositories.homework.listByStudentIds(items.map((item) => item.id)))
      : repositories.homework.list())
    : Promise.resolve([]);

  // a failed groups read must not take the home page down — but then group-only students would all look „without a
  // future lesson”, so that list is left out instead of raising false alarms (audit 2026-11-09)
  let groupsFailed = false;
  const groupsPromise = canViewLearning && repositories.groups?.list
    ? repositories.groups.list(teacherOnly ? { teacherUid: user.uid, teacherName: user.displayName } : {}).catch(() => { groupsFailed = true; return []; })
    : Promise.resolve([]);
  // „Ootab kontrolli”, counted like the Kodutööd page; a failed read must not take the home page down
  const submissionsPromise = canViewLearning && repositories.homework.listSubmissionsByStudentIds
    ? studentsPromise.then(({ items }) => repositories.homework.listSubmissionsByStudentIds(items.map((item) => item.id))).catch(() => [])
    : Promise.resolve([]);
  const [studentsResult, schedule, invoices, homework, groups, submissions] = await Promise.all([
    studentsPromise,
    schedulePromise,
    invoicesPromise,
    homeworkPromise,
    groupsPromise,
    submissionsPromise,
  ]);
  // same counting as the pages the numbers open: people (not card records) in „Õpilased”, weekly lessons expanded like
  // the calendar does, homework of the students in scope like „Kodutööd”
  const activePeople = groupStudentPeople(studentsResult.items).filter((person) => person.records?.some((record) => record.active));
  const activeStudents = studentsResult.items.filter((item) => item.active);
  const current = tallinnDay(now());
  const events = [...schedule, ...groupCalendarEvents(groups)];
  const todayCount = occurrencesForDates(events, [current]).filter((item) => item.status !== 'Tühistatud').length;
  const overdue = invoices.filter(isInvoiceOverdue);
  const studentIds = new Set(studentsResult.items.map((item) => item.id));
  const openHomework = homework.filter((item) => isHomeworkOpen(item) && (!studentIds.size || studentIds.has(item.studentId)));
  const unplanned = groupsFailed ? [] : unplannedStudents({ students: studentsResult.items, events, today: current, teacherUid: teacherOnly ? user.uid : '' });

  return {
    isAdmin,
    events,
    homework,
    submissions,
    invoices,
    unplanned,
    schedule,
    current,
    activeStudents,
    activePeople,
    todayCount,
    allTeachers: !teacherOnly,
    overdue,
    openHomework,
    pendingReviews: submissions.filter((item) => item.reviewStatus !== 'reviewed').length,
    balance: invoices.reduce((sum, item) => sum + invoiceBalanceCents(item), 0),
    canViewLearning,
    canViewFinance,
    teacherUid: teacherOnly ? user.uid : '',
    scheduledIds: [...recentlyScheduled(events, current)],
  };
}

// Home page (calm layout, owner 2026-11-06): a one-line greeting, the four numbers and the quick links at the top
// (as on the old page), ONE short „Vajab tähelepanu” list (≤ 5 lines, the most urgent first, only what has a count),
// today's next lessons, and „Ülevaated” tiles that open the details (calls, packages, homework, enquiries, unmarked
// lessons, risk) only when asked. Nothing was removed: every
// list of the old page is one tile or link away. Roles as before: the admin sees everything, a teacher own students
// and lessons, the accountant only invoices and the paid lessons running out.
export default function DashboardPage({
  repositories = defaultRepositories,
  now = () => new Date(),
}) {
  const { user } = useAuth();
  const state = useAsyncData(() => loadDashboardData(user, repositories, now), [repositories, user]);

  if (state.loading) return <DashboardSkeleton roles={user?.roles} />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;
  return <CalmDashboard data={state.data} user={user} repositories={repositories} now={now} />;
}

function AttentionCard({ attention, loading, onOpen }) {
  return <Card className="calm-card calm-attention" as="section" aria-label="Vajab tähelepanu">
    <div className="calm-card__head"><h2><CircleAlert size={17} aria-hidden="true" /> Vajab tähelepanu</h2></div>
    {attention.items.length ? <ul className="calm-attention__list">
      {attention.items.map((item) => {
        const body = <><b className={`calm-count is-${item.tone}`}>{item.count}</b><span><strong>{item.text}</strong>{item.detail ? <small>{item.detail}</small> : null}</span></>;
        return <li key={item.key} data-key={item.key}>
          {item.panel
            ? <button type="button" className="calm-attention__main" onClick={() => onOpen(item.panel)}>{body}</button>
            : <Link className="calm-attention__main" to={item.to}>{body}</Link>}
          {item.action ? <Link className="today-start" to={item.action.to}>{item.action.label}</Link>
            : <span className="calm-attention__go" aria-hidden="true">{item.linkLabel ? `${item.linkLabel} →` : '→'}</span>}
        </li>;
      })}
    </ul> : loading ? <p className="calm-empty">Kontrollin…</p> : <p className="calm-empty calm-ok"><CheckCircle2 size={18} aria-hidden="true" /> Kõik on korras ✓</p>}
    {attention.rest ? <p className="calm-more">+ veel {attention.rest} teemat — vaata „Ülevaated”</p> : null}
  </Card>;
}

function CalmDashboard({ data, user, repositories, now }) {
  const { preview } = useAuth();
  const isAdmin = data.isAdmin;
  const canViewBalance = isAdmin || data.canViewFinance;
  const signals = useTodaySignals({
    user,
    isAdmin,
    canViewLearning: data.canViewLearning,
    canViewBalance,
    teacherUid: data.teacherUid,
    students: data.activeStudents,
    schedule: data.schedule,
    events: data.events,
    homework: data.homework,
    submissions: data.submissions,
    invoices: data.invoices,
    today: data.current,
    repository: repositories.today || todayApi,
    ...(repositories.clientErrors ? { errorsService: repositories.clientErrors } : {}),
    now,
  });
  // a lesson marked or fixed in the side drawer (right-click → „Ava tund (siinsamas)” or a student's card): the journal
  // is read again in place — „Vajab tähelepanu”, the tiles and the open panel stay, only their numbers change
  useEntityChanged('lesson', () => { signals.reload(); });
  const [panel, setPanel] = useState('');
  const panelRef = useRef(null);
  useEffect(() => { if (panel) panelRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }); }, [panel]);

  const journal = signals.data?.lessons;
  // the panels reuse the journal already read for the counts; only „Riskis õpilased” adds the words
  const unmarkedRepository = useMemo(() => ({
    lessons: async () => journal || [],
    markHeld: repositories.unmarked?.markHeld || ((item, actor) => lessonsService.completeFromSchedule(item, actor, { status: 'Toimunud' })),
  }), [journal, repositories.unmarked]);
  // a teacher's daily „Märkimata tunnid” nudge (owner 2026-11-09): the „Märkimata tunnid” page's logic on the journal
  // and the calendar already read here, so it costs no extra read
  const { teacherUid: ownUid, current: today } = data;
  const reminder = useMemo(() => (ownUid && signals.unmarked ? unmarkedReminder(signals.unmarked, today) : null), [ownUid, today, signals.unmarked]);
  const seen = signals.data?.seen;
  const retentionRepository = useMemo(() => ({
    lessons: async () => journal || [],
    words: repositories.retention?.words || ((ids) => studentWordsService.listForStudentIds(ids)),
    seen: isAdmin && seen ? async () => seen : (repositories.retention?.seen || ((students) => presenceService.forStudents(students))),
  }), [journal, seen, isAdmin, repositories.retention]);

  const attention = attentionItems({
    soon: data.canViewLearning ? lessonsSoon(signals.lessonsToday, signals.clock) : [],
    showTeacher: data.allTeachers,
    unmarked: signals.unmarked ? signals.unmarked.length : null,
    reviewsLate: data.canViewLearning ? lateReviews(data.submissions, now().getTime()) : null,
    overdueInvoices: data.canViewFinance ? data.overdue.length : null,
    overdueCents: data.overdue.reduce((sum, item) => sum + invoiceBalanceCents(item), 0),
    leads: signals.leads ? signals.leads.length : null,
    calls: signals.calls ? signals.calls.list.length : null,
    runningOut: signals.runningOut ? signals.runningOut.length : null,
    errors: signals.errors ? signals.errors.length : null,
    // the admin's „Vajab kõnet” already covers students without a lesson ahead
    unplanned: data.canViewLearning && !isAdmin ? data.unplanned.length : null,
  });

  const metrics = [
    ...(data.canViewLearning ? [
      { label: 'Aktiivsed õpilased', value: data.activePeople.length, meta: data.allTeachers ? 'kõik õpetajad' : 'minu õpilased', icon: GraduationCap, tone: 'green' },
      { label: 'Tunnid täna', value: data.todayCount, meta: `${signals.lessonsToday.filter((item) => item.phase === 'now' || item.phase === 'later').length} veel ees · ${data.allTeachers ? 'kõik õpetajad' : 'minu'}`, icon: CalendarDays, tone: 'blue' },
      { label: 'Kodutööd pooleli', value: data.openHomework.length, meta: `ootab tegemist · ${data.pendingReviews} ootab kontrolli`, icon: CircleAlert, tone: 'purple' },
    ] : []),
    ...(data.canViewFinance ? [
      { label: 'Laekumata', value: money(data.balance), meta: `kõik kuud · ${data.overdue.length} tähtaja ületanud`, icon: ReceiptText, tone: 'amber' },
    ] : []),
  ];
  const count = (value) => (value == null ? '…' : String(value));
  const tiles = [
    ...(isAdmin ? [{ key: 'calls', title: 'Vajab kõnet', meta: `${count(signals.calls?.list.length)} õpilast`, render: () => <CallsPanel calls={signals.calls} user={user} onCalled={signals.addCall} save={(input, actor) => (repositories.today || todayApi).addFollowup(input, actor)} /> }] : []),
    ...(canViewBalance ? [{ key: 'balance', title: 'Makstud tunnid lõppevad', meta: `${count(signals.runningOut?.length)} õpilast`, render: () => <BalancePanel runningOut={signals.runningOut} isAdmin={isAdmin} journalMissing={Boolean(signals.data && !signals.data.lessons)} /> }] : []),
    ...(isAdmin ? [{ key: 'homework', title: 'Kodutööd', meta: `${data.pendingReviews} ootab kontrolli`, render: () => <HomeworkPanel queue={signals.queue} /> }]
      : data.canViewLearning ? [{ key: 'homework', title: 'Kodutööd', meta: `${data.openHomework.length} pooleli · ${data.pendingReviews} kontrolli`, to: '/homework' }] : []),
    ...(isAdmin ? [{ key: 'leads', title: 'Veebipäringud', meta: `${count(signals.leads?.length)} uut`, render: () => <LeadsPanel leads={signals.leads} failed={Boolean(signals.data && !signals.data.leads)} /> }] : []),
    ...(data.canViewLearning ? [
      { key: 'unmarked', title: 'Märkimata tunnid', meta: `${count(signals.unmarked?.length)} tundi`, ownHeading: Boolean(signals.unmarked?.length),
        render: () => (signals.unmarked && !signals.unmarked.length ? <p className="form-hint">Kõik tunnid on märgitud. <Link to="/calendar/markimata">Märkimata tunnid koos Live-tundidega →</Link></p>
          : <UnmarkedLessonsCard schedule={data.schedule} today={data.current} teacherUid={data.teacherUid} user={user} repository={unmarkedRepository} context={signals.data?.context || {}} />) },
      { key: 'risk', title: 'Riskis õpilased', meta: 'Kes võib õppimise lõpetada', ownHeading: true,
        render: () => <RetentionCard students={data.activeStudents} unplanned={data.unplanned} scheduledIds={data.scheduledIds} overdueInvoices={data.overdue} teacherUid={data.teacherUid} showRenewals={false} repository={retentionRepository} /> },
      { key: 'unplanned', title: 'Ilma tulevase tunnita', meta: `${data.unplanned.length} õpilast`, to: '/calendar?unplanned=1' },
    ] : []),
    ...(isAdmin ? [
      { key: 'load', title: 'Õpetajate koormus', meta: 'Tunnid, vabad ajad, töötasu', to: '/teachers/koormus' },
      { key: 'errors', title: 'Vead saidil', meta: `${count(signals.errors?.length)} uut (24 h)`, to: '/vead' },
    ] : []),
    ...(data.canViewFinance ? [{ key: 'invoices', title: 'Arved', meta: `${data.overdue.length} tähtaja ületanud`, to: '/finance?status=overdue' }] : []),
  ];
  const quickLinks = [
    ...(data.canViewLearning ? [
      { to: '/calendar', label: 'Tunniplaan', meta: 'Vaata päeva ja lisa tund', icon: CalendarDays },
      { to: '/students', label: 'Õpilased', meta: 'Profiilid ja õpiteekond', icon: Users },
      { to: '/library', label: 'Õppevara', meta: 'Valmista järgmine tund', icon: BookOpenCheck },
      { to: '/messages', label: 'Suhtlus', meta: 'Vestlused ühes kohas', icon: MessageSquareText },
    ] : []),
    ...(data.canViewFinance ? [{ to: '/finance', label: 'Finantsid', meta: 'Arved, maksed ja kontroll', icon: ReceiptText }] : []),
  ];
  const openTile = tiles.find((tile) => tile.key === panel && tile.render);
  const dayLabel = new Intl.DateTimeFormat('et-EE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Tallinn' }).format(now());

  return (
    <div className="page-content dashboard-page calm-dashboard">
      <header className="calm-head">
        <h1>Tere, {user.displayName?.split(' ')[0] || 'tagasi'}</h1>
        <span>· {dayLabel}</span>
      </header>
      {data.teacherUid ? <UnmarkedNudge reminder={reminder} uid={data.teacherUid} today={data.current} disabled={Boolean(preview)} /> : null}
      {/* „Minu kassa” (owner 2026-11-11): the teacher's own cash on hand, one line, only when there is some */}
      {data.teacherUid ? <CashOnHandLine uid={data.teacherUid} service={repositories.cashBox} /> : null}
      {/* a teacher's direct way in on a phone (owner 2026-11-09): one big button, shown by CSS only on narrow screens */}
      {data.teacherUid && signals.unmarked?.length ? <Link className="button button--primary calm-mark-cta" to="/calendar/markimata"><CalendarCheck size={18} aria-hidden="true" /> Märgi tunnid ({signals.unmarked.length})</Link> : null}
      {/* owner 2026-11-06: the numbers and the quick links stay at the top, as on the old home page */}
      {metrics.length ? <section className={`metric-grid calm-kpis calm-kpis--${metrics.length}`} aria-label="Numbrid">
        {metrics.map(({ icon: Icon, ...item }) => <Card as="article" className={`metric-card metric-card--${item.tone}`} key={item.label}>
          <div className="metric-card__top"><span>{item.label}</span><i><Icon size={17} aria-hidden="true" /></i></div>
          <strong>{item.value}</strong><small>{item.meta}</small>
        </Card>)}
      </section> : null}
      {quickLinks.length ? <nav className="dashboard-quick-actions calm-quick" aria-label="Kiirvalikud">
        {quickLinks.map(({ to, label, meta, icon: Icon }) => <Link key={to} to={to}>
          <i><Icon size={18} aria-hidden="true" /></i>
          <span><strong>{label}</strong><small>{meta}</small></span>
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>)}
      </nav> : null}
      <div className={`calm-top${data.canViewLearning ? '' : ' calm-top--single'}`}>
        <AttentionCard attention={attention} loading={signals.loading} onOpen={setPanel} />
        {data.canViewLearning ? <TodayTimeline lessons={signals.lessonsToday} allTeachers={data.allTeachers} /> : null}
      </div>
      <section className="calm-overviews" aria-label="Ülevaated">
        <h2 className="calm-overviews__title">Ülevaated</h2>
        <div className="calm-tiles">
          {tiles.map((tile) => (tile.to
            ? <Link key={tile.key} className="calm-tile" to={tile.to}><strong>{tile.title}</strong><small>{tile.meta}</small><ArrowUpRight size={15} aria-hidden="true" /></Link>
            : <button key={tile.key} type="button" className={`calm-tile${panel === tile.key ? ' is-open' : ''}`} aria-expanded={panel === tile.key} onClick={() => setPanel((current) => (current === tile.key ? '' : tile.key))}>
              <strong>{tile.title}</strong><small>{tile.meta}</small></button>))}
        </div>
        {openTile ? <Card className="calm-panel" as="section" aria-label={openTile.title} ref={panelRef}>
          <div className={`calm-card__head${openTile.ownHeading ? ' calm-card__head--float' : ''}`}>{openTile.ownHeading ? null : <h2>{openTile.title}</h2>}<button type="button" className="calm-close" aria-label="Sulge" onClick={() => setPanel('')}><X size={16} /></button></div>
          {openTile.render()}
        </Card> : null}
      </section>
    </div>
  );
}
