import { ChevronDown, ChevronUp, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService, paymentsService, scheduleService } from '../../services/firebase/index.js';
import { dashboardSummary, FORECAST_MONTHS, HISTORY_MONTHS, monthRange, niceMax, revenueForecast, revenueHistory } from './financeDashboard.js';
import { currentMonth, shiftMonth } from './monthlyBilling.js';
import './financeDashboard.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(Number(cents || 0) / 100));
const short = (cents) => { const euros = Math.round(Number(cents || 0) / 100); return euros >= 1000 ? `${(euros / 1000).toFixed(euros >= 10000 ? 0 : 1).replace('.', ',')}k` : `${euros}`; };
const monthName = (month, style = 'short') => new Intl.DateTimeFormat('et-EE', { month: style, ...(style === 'long' ? { year: 'numeric' } : {}) }).format(new Date(`${month}-15T12:00:00`));
const api = { payments: () => paymentsService.listAll(), schedule: () => scheduleService.list(), groups: () => groupsService.list().catch(() => []) };
const STORE = 'keelesepp.financeDashboard.hidden';
const hiddenAtStart = () => { try { return globalThis.localStorage?.getItem(STORE) === '1'; } catch { return false; } };

// Chart: 12 months of invoiced (dark green) and received (light green) money and 3 months of forecast (gold, dashed).
function RevenueChart({ columns, selected, onSelect }) {
  const width = 760; const height = 250; const left = 46; const bottom = 28; const top = 12;
  const max = niceMax(Math.max(...columns.map((column) => Math.max(column.invoicedCents || 0, column.receivedCents || 0, column.forecastCents || 0, column.calendarCents || 0)), 1));
  const plotH = height - bottom - top;
  const slot = (width - left - 8) / columns.length;
  const bar = Math.min(18, slot / 3);
  const y = (cents) => top + plotH - (cents / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max);
  return <svg className="fd-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tulu kuude kaupa: arveldatud, laekunud ja prognoos">
    {ticks.map((tick) => <g key={tick}><line x1={left} x2={width - 8} y1={y(tick)} y2={y(tick)} className="fd-grid" /><text x={left - 6} y={y(tick) + 4} className="fd-axis" textAnchor="end">{short(tick)}</text></g>)}
    {columns.map((column, index) => {
      const x = left + index * slot + slot / 2;
      const active = selected === column.month;
      return <g key={column.month} className={`fd-col ${active ? 'is-active' : ''} ${column.future ? 'is-future' : ''}`} tabIndex={0} role="button"
        aria-label={`${monthName(column.month, 'long')}: ${column.future ? `prognoos ${money(column.forecastCents)}` : `arveldatud ${money(column.invoicedCents)}, laekunud ${money(column.receivedCents)}`}`}
        onClick={() => onSelect(column.month)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(column.month); } }}>
        <rect x={x - slot / 2} y={top} width={slot} height={plotH} className="fd-hit" />
        {column.future
          ? <rect x={x - bar / 2} y={y(column.forecastCents)} width={bar} height={Math.max(0, top + plotH - y(column.forecastCents))} rx="4" className="fd-bar fd-bar--forecast" />
          : <>
            <rect x={x - bar - 1} y={y(column.invoicedCents)} width={bar} height={Math.max(0, top + plotH - y(column.invoicedCents))} rx="4" className="fd-bar fd-bar--invoiced" />
            <rect x={x + 1} y={y(column.receivedCents)} width={bar} height={Math.max(0, top + plotH - y(column.receivedCents))} rx="4" className="fd-bar fd-bar--received" />
          </>}
        {/* the current month: what the calendar owes (gold dashed) above what is invoiced */}
        {column.calendarCents ? <line x1={x - slot / 2 + 6} x2={x + slot / 2 - 6} y1={y(column.calendarCents)} y2={y(column.calendarCents)} className="fd-calendar" /> : null}
        <text x={x} y={height - 9} textAnchor="middle" className={`fd-axis ${column.current ? 'is-current' : ''}`}>{monthName(column.month)}</text>
      </g>;
    })}
  </svg>;
}

export default function FinanceDashboard({ invoices = [], students = [], plans = [], lessons = [], repository = api, today = new Date() }) {
  const [hidden, setHidden] = useState(hiddenAtStart);
  const current = currentMonth(today);
  const [selected, setSelected] = useState(current);
  const state = useAsyncData(async () => {
    const settle = (load) => Promise.resolve().then(load).catch(() => []);
    const [payments, schedule, groups] = await Promise.all([settle(repository.payments), settle(repository.schedule), settle(repository.groups)]);
    return { payments, schedule, groups };
  }, [repository]);

  const model = useMemo(() => {
    if (!state.data) return null;
    const pastMonths = monthRange(current, HISTORY_MONTHS);
    const futureMonths = Array.from({ length: FORECAST_MONTHS }, (_, index) => shiftMonth(current, index + 1));
    const history = revenueHistory({ invoices, payments: state.data.payments, months: pastMonths });
    const [thisMonth, ...forecast] = revenueForecast({ months: [current, ...futureMonths], students, plans, schedule: state.data.schedule, groups: state.data.groups, lessons, invoices });
    // the chart starts at the first month with any money (a young school has no empty year on it)
    const first = history.findIndex((item) => item.invoicedCents || item.receivedCents);
    const shown = history.slice(first < 0 ? HISTORY_MONTHS - 1 : Math.min(first, HISTORY_MONTHS - 6));
    const columns = [...shown.map((item) => ({ ...item, current: item.month === current, ...(item.month === current ? { calendarCents: thisMonth.forecastCents } : {}) })), ...forecast.map((item) => ({ ...item, future: true }))];
    return { history, forecast, columns, summary: dashboardSummary({ history, forecast, invoices, current, thisMonth }) };
  }, [state.data, invoices, students, plans, lessons, current]);

  const toggle = () => { const next = !hidden; setHidden(next); try { globalThis.localStorage?.setItem(STORE, next ? '1' : '0'); } catch { /* private mode */ } };
  const column = model?.columns.find((item) => item.month === selected);
  const s = model?.summary;

  return <section className="fd" aria-label="Finantsülevaade">
    <header className="fd-head">
      <div><span className="eyebrow">Ülevaade</span><h2><LineChart size={20} aria-hidden="true" /> Tulu ja prognoos</h2></div>
      <button type="button" className="fd-toggle" aria-expanded={!hidden} onClick={toggle}>{hidden ? <><ChevronDown size={16} /> Näita</> : <><ChevronUp size={16} /> Peida</>}</button>
    </header>
    {hidden ? null : !model ? <p className="form-hint">Arvutan…</p> : <>
      <div className="fd-kpis">
        <div className="fd-kpi"><span>Arveldatud {monthName(current, 'long')}</span><strong>{money(s.invoicedCents)}</strong>
          {s.changePercent !== null ? <small className={s.changePercent >= 0 ? 'is-up' : 'is-down'}>{s.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {s.changePercent > 0 ? '+' : ''}{s.changePercent}% eelmise kuuga</small> : <small>eelmise kuuga võrrelda pole</small>}</div>
        <div className={`fd-kpi ${s.notInvoicedCents ? 'fd-kpi--alert' : ''}`}><span>Kalendri järgi {monthName(current, 'long')}</span><strong>{money(s.calendarCents)}</strong><small className={s.notInvoicedCents ? 'is-down' : ''}>{s.notInvoicedCents ? `${money(s.notInvoicedCents)} arveldamata · ${s.notInvoicedStudents} õpilast` : 'kõik arveldatud'}</small></div>
        <div className="fd-kpi"><span>Laekunud sel kuul</span><strong>{money(s.receivedCents)}</strong><small>12 kuud {money(s.received12Cents)} · keskm. {money(s.averageMonthCents)}/kuu</small></div>
        <div className="fd-kpi"><span>Laekumata kokku</span><strong>{money(s.outstandingCents)}</strong><small className={s.overdueCents ? 'is-down' : ''}>{money(s.overdueCents)} üle tähtaja</small></div>
        <div className="fd-kpi fd-kpi--forecast"><span>Prognoos {s.nextMonth ? monthName(s.nextMonth.month, 'long') : ''}</span><strong>{money(s.nextMonth?.forecastCents)}</strong><small>{s.nextMonth?.students || 0} õpilast · {s.nextMonth?.lessons || 0} tundi kalendris</small></div>
        <div className="fd-kpi fd-kpi--forecast"><span>Järgmise {FORECAST_MONTHS} kuu prognoos</span><strong>{money(s.forecastTotalCents)}</strong><small>kalendri ja hindade järgi</small></div>
      </div>
      <div className="fd-chart-card">
        <div className="fd-legend" aria-hidden="true"><span className="is-invoiced">Arveldatud</span><span className="is-received">Laekunud</span><span className="is-forecast">Prognoos</span><span className="is-calendar">Kalendri järgi (sel kuul)</span></div>
        <RevenueChart columns={model.columns} selected={selected} onSelect={setSelected} />
        {column ? <p className="fd-detail" aria-live="polite" data-testid="fd-detail"><b>{monthName(column.month, 'long')}</b>{column.future
          ? ` · prognoos ${money(column.forecastCents)} · ${column.students} õpilast, ${column.lessons} tundi${column.packageStudents ? ` · ${column.packageStudents} tunnipaketiga (pole arvestatud)` : ''}${column.noPrice ? ` · ${column.noPrice} ilma hinnata` : ''}`
          : ` · arveldatud ${money(column.invoicedCents)} (${column.invoiceCount} arvet) · laekunud ${money(column.receivedCents)}${column.calendarCents ? ` · kalendri järgi ${money(column.calendarCents)}` : ''}`}</p> : null}
        <p className="form-hint">Prognoos = kalendris olevad tunnid × iga õpilase hind (nagu „Koosta arved”). Tunnipaketid ja hinnata kaardid pole sees; ära jäävad tunnid vähendavad tulu.</p>
      </div>
    </>}
  </section>;
}
