import { Card, EmptyState, PageHeader } from '../../components/ui/index.js';
import { dashboardFallback } from './dashboardFallback.js';

export default function DashboardPage() {
  const { metrics, lessons, alerts } = dashboardFallback;
  return (
    <div className="page-content">
      <PageHeader eyebrow="Ülevaade" title="Tere tulemast tagasi" description="CRM v2 dashboardi pärisandmed ühendatakse pärast esimese Students mooduli stabiliseerimist." />
      <div className="data-notice">Dashboard ei esita demodata pärisandmetena. Õpilaste moodul on esimene Firebase’iga ühendatud töövoog.</div>
      <section className="metric-grid">{metrics.map((item) => <Card as="article" className="metric-card" key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.meta}</small></Card>)}</section>
      <section className="content-grid">
        <Card><h2>Järgmised tunnid</h2>{lessons.length ? null : <EmptyState title="Kalender ei ole veel ühendatud" />}</Card>
        <Card><h2>Vajab tegutsemist</h2>{alerts.length ? null : <EmptyState title="Teavitused ei ole veel ühendatud" />}</Card>
      </section>
    </div>
  );
}
