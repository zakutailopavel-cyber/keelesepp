import { useMemo, useState } from 'react';
import UPlotComparisonChart from '../../components/charts/UPlotComparisonChart.jsx';
import MetricCard, { DeltaChip, MoneyValue } from '../../components/charts/MetricCard.jsx';
import { formatCount, formatMoney, formatMoneyShort } from '../../components/charts/format.js';
import { financeOverview, previousName } from './financeOverview.js';
import './financeOverview.css';

const TREND_NAME = { month: 'viimased 8 kuud', quarter: 'viimased 8 kvartalit', year: 'viimased 8 aastat' };
const plural = (count, one, many) => `${formatCount(count)} ${count === 1 ? one : many}`;

// x-axis labels: the first day of each month in a quarter, three days in a month, every other month in a year
function tickIndexes(points, unit) {
  if (!points.length) return [];
  if (unit === 'quarter') return points.map((point, index) => (point.key.endsWith('-01') ? index : -1)).filter((index) => index >= 0).concat(points.length - 1);
  if (unit === 'year') return points.map((_, index) => index).filter((index) => index % 2 === 0 || index === points.length - 1);
  return [0, Math.round((points.length - 1) / 2), points.length - 1];
}

// The overview at the top of Finantsid (Stripe „Your overview” + Mercury): one large headline figure with its chart,
// then a grid of metric cards. Figures: financeOverview.js. `onView(view, status)` opens the list under the cards.
export default function FinanceOverview({ invoices = [], unit = 'month', anchor, today: todayProp, creditCents = 0, creditCount = 0, onView }) {
  const [firstRender] = useState(() => new Date());
  const today = todayProp || firstRender;
  const model = useMemo(() => financeOverview({ invoices, unit, anchor, today }), [invoices, unit, anchor, today]);
  const { received, metrics, deltas, trends, overdue } = model;
  const against = `${previousName(unit)}${model.toDate ? ' samal ajal' : ''}`;
  const trendName = TREND_NAME[unit] || TREND_NAME.month;
  const ticks = useMemo(() => tickIndexes(received.points, unit), [received.points, unit]);
  const compareName = received.running ? `${model.beforeLabel} samal ajal` : model.beforeLabel;
  const ageTotal = overdue.ages.reduce((sum, bucket) => sum + bucket.cents, 0);

  return <section className="fo" aria-label={`Ülevaade · ${model.label}`}>
    <article className="fo-hero">
      <header className="fo-hero__head">
        <div className="fo-hero__figure">
          <h2>Laekunud</h2>
          <p className="fo-hero__value">{received.future ? <span className="fo-hero__empty">—</span> : <MoneyValue cents={received.totalCents} />}</p>
          <p className="fo-hero__compare">
            {received.future ? <span>Periood pole veel alanud</span> : <>
              <DeltaChip percent={received.delta} good="up" against={against} />
              <span>{compareName}: <b><MoneyValue cents={received.compareCents} /></b></span>
            </>}
          </p>
        </div>
        <ul className="fo-hero__legend" aria-label="Joonise selgitus">
          <li><i className="ac-key ac-key--value" aria-hidden="true" />{model.label}</li>
          <li><i className="ac-key ac-key--compare" aria-hidden="true" />{model.beforeLabel}</li>
        </ul>
      </header>
      <UPlotComparisonChart points={received.points} currentUntil={received.currentUntil} tickIndexes={ticks}
        ariaLabel={`Laekunud raha kogusumma ${model.label}, võrdluseks ${model.beforeLabel}`} caption={`Laekunud · ${model.label}`}
        valueLabel={model.label} compareLabel={model.beforeLabel} formatValue={formatMoney} formatAxis={formatMoneyShort} />
      <p className="fo-hero__note">Laekumised maksekuupäeva järgi (kogusumma perioodi algusest). Ainult ettevõtte arved; FIE arved ei ole siin.</p>
    </article>

    <div className="fo-grid">
      <MetricCard title="Arveldatud" cents={metrics.invoicedCents} delta={deltas.invoiced} deltaAgainst={against}
        caption={`${plural(metrics.billableCount, 'arve', 'arvet')} · ${model.label}`} trend={trends.invoiced} trendLabel={`Arveldatud, ${trendName}`} trendFormat={formatMoney}
        onView={() => onView?.('invoices')} viewHint="Vaata perioodi arveid" />
      <MetricCard title="Tasumata" cents={metrics.openCents} delta={deltas.open} deltaGood="down" deltaAgainst={against}
        caption={metrics.invoicedCents ? `${Math.round((metrics.openCents / metrics.invoicedCents) * 100)} % arveldatust · ${plural(metrics.byStatus.unpaid + metrics.byStatus.partial + metrics.byStatus.overdue + metrics.byStatus['email-failed'] + metrics.byStatus['no-show'], 'arve', 'arvet')}` : 'perioodi arvetelt'}
        trend={trends.open} trendLabel={`Tasumata, ${trendName}`} trendFormat={formatMoney}
        onView={() => onView?.('unpaid')} viewHint="Vaata tasumata arveid" />
      <MetricCard title="Üle tähtaja · täna" cents={overdue.cents} className={overdue.cents ? 'fo-card--alert' : ''}
        caption={overdue.count ? `${plural(overdue.families, 'pere', 'peret')} · ${plural(overdue.count, 'arve', 'arvet')}` : 'Tähtaja ületanud arveid ei ole'}
        onView={() => onView?.('unpaid', 'overdue')} viewHint="Vaata üle tähtaja arveid">
        {overdue.count ? <div className="fo-age">
          <div className="fo-age__bar" role="img" aria-label={`Võlgade vanus: ${overdue.ages.map((bucket) => `${bucket.label} ${formatMoney(bucket.cents)}`).join(', ')}`}>
            {overdue.ages.map((bucket) => (bucket.cents ? <span key={bucket.id} className={`fo-age__part fo-age__part--${bucket.id}`} style={{ flexGrow: bucket.cents / Math.max(1, ageTotal) }} /> : null))}
          </div>
          <ul className="fo-age__legend">{overdue.ages.map((bucket) => <li key={bucket.id}><i className={`fo-age__key fo-age__part--${bucket.id}`} aria-hidden="true" />{bucket.label}<b>{formatMoney(bucket.cents, { decimals: 0 })}</b></li>)}</ul>
        </div> : null}
      </MetricCard>
      <MetricCard title="Keskmine arve" cents={metrics.averageCents} delta={deltas.average} deltaGood={null} deltaAgainst={against}
        caption={metrics.billableCount ? `${formatMoney(metrics.invoicedCents)} / ${plural(metrics.billableCount, 'arve', 'arvet')}` : 'perioodil arveid ei ole'}
        trend={trends.average} trendLabel={`Keskmine arve, ${trendName}`} trendFormat={formatMoney}
        onView={() => onView?.('invoices')} viewHint="Vaata perioodi arveid" />
      <MetricCard title="Õpilasi arveldatud" count={metrics.students} delta={deltas.students} deltaAgainst={against}
        caption={`${model.beforeLabel}${model.toDate ? ' samal ajal' : ''}: ${formatCount(model.previous.students)}`}
        trend={trends.students} trendLabel={`Õpilasi arveldatud, ${trendName}`} trendFormat={formatCount}
        onView={() => onView?.('invoices')} viewHint="Vaata perioodi arveid" />
      <MetricCard title="Ette makstud" cents={creditCents}
        caption={creditCount ? `${plural(creditCount, 'avatud ettemaks', 'avatud ettemaksu')} · kantakse järgmisele arvele` : 'avatud ettemakse ei ole'}
        onView={() => onView?.('credits')} viewHint="Vaata ettemakseid" />
    </div>
  </section>;
}
