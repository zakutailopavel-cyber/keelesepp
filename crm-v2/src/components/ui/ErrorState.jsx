export default function ErrorState({ title = 'Andmete laadimine ebaõnnestus', message, onRetry }) {
  return (
    <div className="state-view state-view--error" role="alert">
      <strong>{title}</strong><p>{message || 'Proovi mõne hetke pärast uuesti.'}</p>
      {onRetry ? <button className="button button--secondary" onClick={onRetry}>Proovi uuesti</button> : null}
    </div>
  );
}
