import './peopleOverview.css';

export default function PeopleOverview({ eyebrow, title, description, metrics, label }) {
  return <section className="people-overview" aria-label={label}>
    <div className="people-overview__intro">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    <div className="people-overview__metrics">
      {metrics.map(({ icon: Icon, label: metricLabel, value, hint }) => <div key={metricLabel}>
        <i><Icon size={18} /></i>
        <span><small>{metricLabel}</small><strong>{value}</strong>{hint ? <em>{hint}</em> : null}</span>
      </div>)}
    </div>
  </section>;
}
