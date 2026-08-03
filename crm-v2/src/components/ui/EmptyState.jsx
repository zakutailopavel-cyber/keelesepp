export default function EmptyState({ title = 'Andmeid ei leitud', description, action }) {
  return <div className="state-view"><strong>{title}</strong>{description ? <p>{description}</p> : null}{action}</div>;
}
