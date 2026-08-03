export default function LoadingState({ label = 'Laen andmeid…' }) {
  return <div className="state-view" role="status"><span className="state-spinner" /><strong>{label}</strong></div>;
}
