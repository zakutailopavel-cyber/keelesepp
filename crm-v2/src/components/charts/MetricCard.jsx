import { ArrowRight } from 'lucide-react';
import { formatCount, formatPercent, moneyParts } from './format.js';
import Sparkline from './Sparkline.jsx';
import './charts.css';

// a money figure with the euro sign lighter and smaller than the number: „1 234,56 €”
export function MoneyValue({ cents, decimals = 2, className = '' }) {
  const parts = moneyParts(cents, { decimals });
  return <span className={`money-value ${className}`}><span className="money-value__number">{parts.sign}{parts.number}</span><span className="money-value__symbol">{' '}{parts.symbol}</span></span>;
}

// ▲ 12 % / ▼ 4 % against the period before. `good`: which direction is good news ('up' | 'down' | null = neutral);
// colour shows meaning only, the arrow and the words carry it without colour.
export function DeltaChip({ percent, good = 'up', against = 'eelmise perioodiga' }) {
  if (percent === null || percent === undefined || !Number.isFinite(percent)) return null;
  const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat';
  const tone = direction === 'flat' || !good ? 'neutral' : direction === good ? 'good' : 'bad';
  const words = direction === 'flat' ? 'muutuseta' : direction === 'up' ? 'kasv' : 'langus';
  return <span className={`delta-chip delta-chip--${tone}`} title={`${words} ${formatPercent(percent)} võrreldes ${against}`}>
    <span aria-hidden="true">{direction === 'up' ? '▲' : direction === 'down' ? '▼' : '•'}</span>
    <span className="sr-only">{words} </span>{formatPercent(percent)}
  </span>;
}

// One card of the overview grid (Stripe „Your overview”): gray title, big tabular value, a delta chip, a sparkline or
// any small picture (children), and a „Vaata” link to the detail view. `compact` = the student card's smaller version.
export default function MetricCard({
  title, cents, count, value, decimals = 2, delta = null, deltaGood = 'up', deltaAgainst, caption, trend, trendLabel, trendFormat,
  onView, viewLabel = 'Vaata', viewHint, compact = false, children, className = '',
}) {
  const figure = cents !== undefined && cents !== null ? <MoneyValue cents={cents} decimals={decimals} />
    : count !== undefined && count !== null ? <span className="money-value__number">{formatCount(count)}</span>
      : <span className="money-value__number">{value ?? '—'}</span>;
  return <article className={`metric-tile ${compact ? 'metric-tile--compact' : ''} ${className}`}>
    <header className="metric-tile__head">
      <h3>{title}</h3>
      {onView ? <button type="button" className="metric-tile__view" onClick={onView} aria-label={viewHint || `${viewLabel}: ${title}`}>{viewLabel}<ArrowRight size={14} aria-hidden="true" /></button> : null}
    </header>
    <div className="metric-tile__value"><strong>{figure}</strong><DeltaChip percent={delta} good={deltaGood} against={deltaAgainst} /></div>
    {caption ? <p className="metric-tile__caption">{caption}</p> : null}
    {trend && trend.length > 1 ? <Sparkline values={trend} label={trendLabel || title} formatValue={trendFormat} /> : null}
    {children}
  </article>;
}
