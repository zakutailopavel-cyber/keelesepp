import { CalendarDays, CircleAlert, GraduationCap, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext.jsx';
import { Badge, Card, EmptyState, ErrorState, LoadingState, PageHeader } from '../../components/ui/index.js';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { homeworkService, invoicesService, scheduleService, studentsService } from '../../services/firebase/index.js';
import { ROLES } from '../../utils/roles.js';
import { invoiceBalanceCents, isInvoiceOverdue } from '../students/studentFinance.js';

const today = () => new Date().toISOString().slice(0, 10);
const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR' }).format(cents / 100);
const defaultRepositories = {
  students: studentsService,
  schedule: scheduleService,
  invoices: invoicesService,
  homework: homeworkService,
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

  const [studentsResult, schedule, invoices, homework] = await Promise.all([
    studentsPromise,
    schedulePromise,
    invoicesPromise,
    homeworkPromise,
  ]);
  const activeStudents = studentsResult.items.filter((item) => item.active);
  const current = today();
  const upcoming = schedule
    .filter((item) => item.status !== 'Tühistatud' && (item.date || item.startDate) >= current)
    .slice(0, 6);
  const overdue = invoices.filter(isInvoiceOverdue);
  const openHomework = homework.filter((item) => item.status !== 'Tehtud');

  return {
    activeStudents,
    upcoming,
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
      { label: 'Aktiivsed õpilased', value: data.activeStudents.length, meta: 'õppetöös', icon: GraduationCap, tone: 'green' },
      { label: 'Järgmised tunnid', value: data.upcoming.length, meta: 'graafikus', icon: CalendarDays, tone: 'blue' },
      { label: 'Kodutööd', value: data.openHomework.length, meta: 'ootab lõpetamist', icon: CircleAlert, tone: 'purple' },
    ] : []),
    ...(data.canViewFinance ? [
      { label: 'Laekumata', value: money(data.balance), meta: `${data.overdue.length} tähtaja ületanud`, icon: ReceiptText, tone: 'amber' },
    ] : []),
  ];

  return (
    <div className="page-content">
      <PageHeader eyebrow="Ülevaade" title={`Tere, ${user.displayName?.split(' ')[0] || 'tagasi'}`} description="Päeva olulised numbrid ja järgmised tegevused reaalajas." />
      <section className="metric-grid">
        {metrics.map(({ icon: Icon, ...item }) => (
          <Card as="article" className={`metric-card metric-card--${item.tone}`} key={item.label}>
            <div className="metric-card__top"><span>{item.label}</span><i><Icon size={19} /></i></div>
            <strong>{item.value}</strong>
            <small>{item.meta}</small>
          </Card>
        ))}
      </section>
      <section className="content-grid">
        {data.canViewLearning ? (
          <Card>
            <div className="section-heading"><div><span className="eyebrow">Kalender</span><h2>Järgmised tunnid</h2></div><Link to="/calendar">Ava kalender →</Link></div>
            {data.upcoming.length ? (
              <div className="agenda-list">
                {data.upcoming.map((item) => (
                  <div className="agenda-item" key={item.id}>
                    <time><strong>{item.time}</strong><span>{item.date || item.startDate}</span></time>
                    <div><strong>{item.studentName || 'Õpilane'}</strong><span>{item.teacher || 'Õpetaja'} · {item.duration} min</span></div>
                    <Badge tone="info">{item.status}</Badge>
                  </div>
                ))}
              </div>
            ) : <EmptyState title="Järgmisi tunde ei ole" description="Lisa uus tund kalendri vaates." />}
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
                <Link to="/homework"><span className="attention-dot attention-dot--amber" /><div><strong>{data.openHomework.length} aktiivset kodutööd</strong><small>Kontrolli tähtaegu ja esitusi</small></div><b>→</b></Link>
                <Link to="/students"><span className="attention-dot attention-dot--green" /><div><strong>{data.activeStudents.length} aktiivset õpilast</strong><small>Vaata profiile ja edenemist</small></div><b>→</b></Link>
              </>
            ) : null}
          </div>
        </Card>
      </section>
    </div>
  );
}
