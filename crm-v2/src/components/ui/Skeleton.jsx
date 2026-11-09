import './loadingState.css';

// Placeholder shapes while data loads — keeps the layout from jumping when the real content arrives.
// <Skeleton lines={3} /> grey text lines; <Skeleton variant="card" /> a card-sized block. Hidden from screen readers:
// pair it with a LoadingState label (or aria-busy on the region) when the wait must be announced.
export default function Skeleton({ lines = 3, variant = 'lines', className = '' }) {
  const cls = ['skeleton', `skeleton--${variant}`, className].filter(Boolean).join(' ');
  if (variant === 'card') {
    return <div className={cls} aria-hidden="true" data-testid="skeleton"><span className="skeleton__bar skeleton__bar--title" /><span className="skeleton__bar" /><span className="skeleton__bar skeleton__bar--short" /></div>;
  }
  const count = Math.max(1, Number(lines) || 1);
  return (
    <div className={cls} aria-hidden="true" data-testid="skeleton">
      {Array.from({ length: count }, (_, index) => <span key={index} className={`skeleton__bar${index === count - 1 && count > 1 ? ' skeleton__bar--short' : ''}`} />)}
    </div>
  );
}
