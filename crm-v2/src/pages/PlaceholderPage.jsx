export default function PlaceholderPage({ eyebrow, title, description }) {
  return (
    <div className="page-content">
      <section className="page-heading compact-heading">
        <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      </section>
      <section className="panel empty-state">
        <strong>Moodul valmib migratsiooni järgmises etapis.</strong>
        <p>Uus marsruut ja rakenduse raamistik on juba olemas. Järgmine samm on ühendada päris andmed ning tuua üle töövood vanast CRM-ist.</p>
      </section>
    </div>
  );
}
