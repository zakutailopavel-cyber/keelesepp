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

// A whole first screen of placeholders (a dashboard while its first data loads). The shapes are hidden from screen
// readers; the region is busy and says `label` once (the same words the spinner said). Lay the shapes out with
// <SkeletonRow kind="kpis | split | halves | tiles"> so they sit roughly where the real cards will appear.
export function SkeletonScreen({ label, className = '', children }) {
  return <div className={['skeleton-screen', className].filter(Boolean).join(' ')} role="status" aria-live="polite" aria-busy="true">
    <span className="sr-only">{label}</span>
    {children}
  </div>;
}

export function SkeletonRow({ kind = 'kpis', children }) {
  return <div className={`skeleton-row skeleton-row--${kind}`} aria-hidden="true">{children}</div>;
}
