import { ArrowUpRight, BookOpenCheck, CalendarDays, CircleAlert, GraduationCap, MessageSquareText, ReceiptText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Card, EmptyState, ErrorState, LoadingState } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService, homeworkService, invoicesService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { groupCalendarEvents } from '../calendar/calendarView.js';
import { unplannedStudents } from '../calendar/unplannedStudents.js';
import { groupStudentPeople } from '../../services/firebase/students.js';
import { occurrencesForDates } from '../calendar/calendarView.js';
import { ROLES } from '../../utils/roles.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';
import { isHomeworkOpen } from '../homework/homeworkStatus.js';

const today = () => new Intl.DateTimeFormat('sv-SE').format(new Date());
const todayLabel = () => new Intl.DateTimeFormat('et-EE', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
const defaultRepositories = {
  students: studentsService,
  schedule: scheduleService,
  invoices: invoicesService,
  homework: homeworkService,
  groups: groupsService,
};

async function loadDashboardData(user, repositories) {
  const isAdmin = user.roles.includes(ROLES.ADMIN);
  const isTeacher = user.roles.includes(ROLES.TEACHER);
  const isFinance = user.roles.includes(ROLES.FINANCE);
  const teacherOnly = isTeacher && !isAdmin;
  const canViewLearning = isAdmin || isTeacher;
  const canViewFinance = isAdmin || isFinance;

  const studentsPromise = canViewLearning
    ? repositories.students.list({
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

  const groupsPromise = canViewLearning && repositories.groups?.list
    ? repositories.groups.list(teacherOnly ? { teacherUid: user.uid, teacherName: user.displayName } : {}).catch(() => [])
    : Promise.resolve([]);
  const [studentsResult, schedule, invoices, homework, groups] = await Promise.all([
    studentsPromise,
    schedulePromise,
    invoicesPromise,
    homeworkPromise,
    groupsPromise,
  ]);
  // same counting as the pages the tiles open: people (not card records) in „Õpilased”, weekly lessons expanded like
  // the calendar does, homework of the students in scope like „Kodutööd”
  const activePeople = groupStudentPeople(studentsResult.items).filter((person) => person.records?.some((record) => record.active));
  const activeStudents = studentsResult.items.filter((item) => item.active);
  const current = today();
  const nowClock = new Date().toTimeString().slice(0, 5);
  const todayLessons = occurrencesForDates([...schedule, ...groupCalendarEvents(groups)], [current]);
  const upcoming = todayLessons.filter((item) => String(item.time || '99:99') >= nowClock);
  const overdue = invoices.filter(isInvoiceOverdue);
  const studentIds = new Set(studentsResult.items.map((item) => item.id));
  const openHomework = homework.filter((item) => isHomeworkOpen(item) && (!studentIds.size || studentIds.has(item.studentId)));

  const unplanned = unplannedStudents({ students: studentsResult.items, events: [...schedule, ...groupCalendarEvents(groups)], today: current, teacherUid: teacherOnly ? user.uid : '' });

  return {
    unplanned,
    activeStudents,
    activePeople,
    todayLessons,
    upcoming,
    allTeachers: !teacherOnly,
    overdue,
    openHomework,
    balance: invoices.reduce((sum, item) => sum + invoiceBalanceCents(item), 0),
    canViewLearning,
    canViewFinance,
  };
}

export default function DashboardPage({
  repositories = defaultRepositories,
}) {
  const { user } = useAuth();
  const state = useAsyncData(() => loadDashboardData(user, repositories), [repositories, user]);

  if (state.loading) return <LoadingState label="Koostan töölauda…" />;
  if (state.error) return <ErrorState message={state.error.message} onRetry={state.reload} />;

  const data = state.data;
  const metrics = [
    ...(data.canViewLearning ? [
      { label: 'Aktiivsed õpilased', value: data.activePeople.length, meta: data.allTeachers ? 'kõik õpetajad' : 'minu õpilased', icon: GraduationCap, tone: 'green' },
      { label: 'Tunnid täna', value: data.todayLessons.length, meta: `${data.upcoming.length} veel ees · ${data.allTeachers ? 'kõik õpetajad' : 'minu'}`, icon: CalendarDays, tone: 'blue' },
      { label: 'Kodutööd pooleli', value: data.openHomework.length, meta: 'ootab tegemist', icon: CircleAlert, tone: 'purple' },
    ] : []),
    ...(data.canViewFinance ? [
      { label: 'Laekumata', value: money(data.balance), meta: `${data.overdue.length} tähtaja ületanud`, icon: ReceiptText, tone: 'amber' },
    ] : []),
  ];
  const quickActions = [
    ...(data.canViewLearning ? [
      { to: '/calendar', label: 'Tunniplaan', meta: 'Vaata päeva ja lisa tund', icon: CalendarDays },
      { to: '/students', label: 'Õpilased', meta: 'Profiilid ja õpiteekond', icon: Users },
      { to: '/library', label: 'Õppevara', meta: 'Valmista järgmine tund', icon: BookOpenCheck },
      { to: '/messages', label: 'Suhtlus', meta: 'Vestlused ühes kohas', icon: MessageSquareText },
    ] : []),
    ...(data.canViewFinance ? [
      { to: '/finance', label: 'Finantsid', meta: 'Arved, maksed ja kontroll', icon: ReceiptText },
    ] : []),
  ];

  return (
    <div className="page-content">
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">{todayLabel()}</span>
          <h1>Tere, {user.displayName?.split(' ')[0] || 'tagasi'}</h1>
          <p>Päeva olulised numbrid, tunnid ja järgmised tegevused ühes rahulikus vaates.</p>
        </div>
        {data.canViewLearning ? <Link className="dashboard-welcome__action" to="/calendar"><CalendarDays size={18} /><span><small>Järgmine samm</small><strong>Ava tänane kalender</strong></span><ArrowUpRight size={18} /></Link> : null}
      </section>
      <section className="metric-grid">
        {metrics.map(({ icon: Icon, ...item }) => (
          <Card as="article" className={`metric-card metric-card--${item.tone}`} key={item.label}>
            <div className="metric-card__top"><span>{item.label}</span><i><Icon size={19} /></i></div>
            <strong>{item.value}</strong>
            <small>{item.meta}</small>
          </Card>
        ))}
      </section>
      <section className="dashboard-quick-actions" aria-label="Kiirvalikud">
        {quickActions.map(({ to, label, meta, icon: Icon }) => (
          <Link to={to} key={to}>
            <i><Icon size={19} /></i>
            <span><strong>{label}</strong><small>{meta}</small></span>
            <ArrowUpRight size={16} />
          </Link>
        ))}
      </section>
      <section className="content-grid">
        {data.canViewLearning ? (
          <Card>
            <div className="section-heading"><div><span className="eyebrow">Kalender · {data.allTeachers ? 'kõik õpetajad' : 'minu tunnid'}</span><h2>Järgmised tunnid täna</h2></div><Link to="/calendar">Ava kalender →</Link></div>
            {data.upcoming.length ? (
              <div className="agenda-list">
                {data.upcoming.slice(0, 6).map((item) => (
                  <div className="agenda-item" key={item.occurrenceId || item.id}>
                    <time><strong>{item.time}</strong><span>{item.occurrenceDate || item.date || item.startDate}</span></time>
                    <div><strong>{item.studentName || 'Õpilane'}</strong><span>{item.teacher || 'Õpetaja'} · {item.duration} min</span></div>
                    <Badge tone="info">{item.status}</Badge>
                  </div>
                ))}
              </div>
            ) : <EmptyState title={data.todayLessons.length ? 'Tänased tunnid on läbi' : 'Täna tunde ei ole'} description={data.todayLessons.length ? `Täna oli ${data.todayLessons.length} tundi. Märgi need kalendris.` : 'Tänaseks ei ole ühtegi planeeritud tundi.'} />}
            {data.upcoming.length > 6 ? <p className="form-hint">+ veel {data.upcoming.length - 6} tundi täna</p> : null}
          </Card>
        ) : null}
        <Card>
          <div className="section-heading"><div><span className="eyebrow">Tähelepanu</span><h2>Vajab tegutsemist</h2></div></div>
          <div className="attention-list">
            {data.canViewFinance ? (
              <Link to="/finance"><span className="attention-dot attention-dot--danger" /><div><strong>{data.overdue.length} tähtaja ületanud arvet</strong><small>Kokku {money(data.overdue.reduce((sum, item) => sum + invoiceBalanceCents(item), 0))}</small></div><b>→</b></Link>
            ) : null}
            {data.canViewLearning ? (
              <>
                <Link to="/homework"><span className="attention-dot attention-dot--amber" /><div><strong>{data.openHomework.length} kodutööd pooleli</strong><small>Kontrolli tähtaegu ja esitusi</small></div><b>→</b></Link>
                {data.unplanned.length ? <Link to="/calendar?unplanned=1"><span className="attention-dot attention-dot--amber" /><div><strong>{data.unplanned.length} õpilast ilma tulevase tunnita</strong><small>Lisa neile tund või märgi paus</small></div><b>→</b></Link> : null}
                <Link to="/students"><span className="attention-dot attention-dot--green" /><div><strong>{data.activePeople.length} aktiivset õpilast</strong><small>Vaata profiile ja edenemist</small></div><b>→</b></Link>
              </>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
