import { ChevronDown, ChevronUp, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { groupsService, paymentsService, scheduleService } from '../../services/firebase/index.js';
import { dashboardSummary, FORECAST_MONTHS, HISTORY_MONTHS, monthRange, niceMax, revenueForecast, revenueHistory, smoothPath } from './financeDashboard.js';
import { currentMonth, shiftMonth } from './monthlyBilling.js';
import './financeDashboard.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(Number(cents || 0) / 100));
const short = (cents) => { const euros = Math.round(Number(cents || 0) / 100); return euros >= 1000 ? `${(euros / 1000).toFixed(euros >= 10000 ? 0 : 1).replace('.', ',')}k` : `${euros}`; };
const monthName = (month, style = 'short') => new Intl.DateTimeFormat('et-EE', { month: style, ...(style === 'long' ? { year: 'numeric' } : {}) }).format(new Date(`${month}-15T12:00:00`));
const api = { payments: () => paymentsService.listAll(), schedule: () => scheduleService.list(), groups: () => groupsService.list().catch(() => []) };
const STORE = 'keelesepp.financeDashboard.hidden';
const hiddenAtStart = () => { try { return globalThis.localStorage?.getItem(STORE) === '1'; } catch { return false; } };

// Chart: smooth curves of invoiced (dark green, filled) and received (light green) money, the forecast as a gold dashed
// curve going on from this month; a guide line and a card with the numbers follow the pointer or the chosen month.
function RevenueChart({ columns, selected, onSelect }) {
  const width = 760; const height = 270; const left = 48; const right = 16; const bottom = 30; const top = 16;
  const max = niceMax(Math.max(...columns.map((column) => Math.max(column.invoicedCents || 0, column.receivedCents || 0, column.forecastCents || 0, column.calendarCents || 0)), 1));
  const plotH = height - bottom - top;
  const step = columns.length > 1 ? (width - left - right) / (columns.length - 1) : 0;
  const x = (index) => left + index * step;
  const y = (cents) => top + plotH - (cents / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max);
  const past = columns.map((column, index) => ({ column, index })).filter(({ column }) => !column.future);
  const nowIndex = columns.findIndex((column) => column.current);
  const invoiced = past.map(({ column, index }) => [x(index), y(column.invoicedCents)]);
  const received = past.map(({ column, index }) => [x(index), y(column.receivedCents)]);
  // the forecast starts from this month's calendar amount (or what is invoiced) so the curve goes on without a jump
  const startCents = nowIndex >= 0 ? (columns[nowIndex].calendarCents || columns[nowIndex].invoicedCents) : 0;
  const forecast = [...(nowIndex >= 0 ? [[x(nowIndex), y(startCents)]] : []), ...columns.map((column, index) => ({ column, index })).filter(({ column }) => column.future).map(({ column, index }) => [x(index), y(column.forecastCents)])];
  const base = top + plotH;
  const area = (points) => (points.length ? `${smoothPath(points)} L${points[points.length - 1][0]},${base} L${points[0][0]},${base} Z` : '');
  const [hover, setHover] = useState(null);
  // a narrow screen scrolls the chart: it opens at the right end (this month and the forecast)
  const scroller = useRef(null);
  useEffect(() => { const node = scroller.current; if (node && node.scrollWidth > node.clientWidth) node.scrollLeft = node.scrollWidth; }, [columns.length]);
  const shown = hover ?? columns.findIndex((column) => column.month === selected);
  const pick = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * width;
    setHover(Math.max(0, Math.min(columns.length - 1, Math.round((px - left) / (step || 1)))));
  };
  // the card follows the pointer only; the chosen month is described under the chart
  const card = hover !== null ? columns[hover] : null;
  return <div className="fd-chart-scroll" ref={scroller}><div className="fd-chart-wrap">
    <svg className="fd-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tulu kuude kaupa: arveldatud, laekunud ja prognoos"
      onPointerMove={pick} onPointerLeave={() => setHover(null)} onClick={() => { if (hover !== null) onSelect(columns[hover].month); }}>
      <defs>
        <linearGradient id="fd-fill-invoiced" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#176553" stopOpacity=".28" /><stop offset="100%" stopColor="#176553" stopOpacity="0" /></linearGradient>
        <linearGradient id="fd-fill-received" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7cc4a6" stopOpacity=".3" /><stop offset="100%" stopColor="#7cc4a6" stopOpacity="0" /></linearGradient>
        <linearGradient id="fd-fill-forecast" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#e3a857" stopOpacity=".25" /><stop offset="100%" stopColor="#e3a857" stopOpacity="0" /></linearGradient>
      </defs>
      {ticks.map((tick) => <g key={tick}><line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="fd-grid" /><text x={left - 8} y={y(tick) + 4} className="fd-axis" textAnchor="end">{short(tick)}</text></g>)}
      {nowIndex >= 0 && forecast.length > 1 ? <rect x={x(nowIndex)} y={top} width={width - right - x(nowIndex)} height={plotH} className="fd-future-zone" /> : null}
      <path d={area(forecast)} fill="url(#fd-fill-forecast)" />
      <path d={area(received)} fill="url(#fd-fill-received)" />
      <path d={area(invoiced)} fill="url(#fd-fill-invoiced)" />
      <path d={smoothPath(received)} className="fd-line fd-line--received" pathLength="1" />
      <path d={smoothPath(invoiced)} className="fd-line fd-line--invoiced" pathLength="1" />
      <path d={smoothPath(forecast)} className="fd-line fd-line--forecast" />
      {shown >= 0 ? <line x1={x(shown)} x2={x(shown)} y1={top} y2={base} className="fd-guide" /> : null}
      {past.map(({ column, index }) => <g key={column.month}>
        <circle cx={x(index)} cy={y(column.invoicedCents)} r={index === shown ? 5.5 : 3.5} className="fd-dot fd-dot--invoiced" />
        <circle cx={x(index)} cy={y(column.receivedCents)} r={index === shown ? 5 : 3} className="fd-dot fd-dot--received" />
      </g>)}
      {nowIndex >= 0 && columns[nowIndex].calendarCents ? <circle cx={x(nowIndex)} cy={y(columns[nowIndex].calendarCents)} r="4.5" className="fd-dot fd-dot--calendar" /> : null}
      {columns.map((column, index) => column.future ? <circle key={column.month} cx={x(index)} cy={y(column.forecastCents)} r={index === shown ? 5.5 : 4} className="fd-dot fd-dot--forecast" /> : null)}
      {columns.map((column, index) => <text key={column.month} x={x(index)} y={height - 9} textAnchor="middle" className={`fd-axis ${column.current ? 'is-current' : ''} ${column.future ? 'is-future' : ''}`}>{monthName(column.month)}</text>)}
    </svg>
    {card ? <div className={`fd-tip ${hover > columns.length / 2 ? 'is-left' : ''}`} style={{ left: `${(x(hover) / width) * 100}%` }} aria-hidden="true">
      <b>{monthName(card.month, 'long')}</b>
      {card.future ? <span className="is-forecast">Prognoos <strong>{money(card.forecastCents)}</strong></span> : <>
        <span className="is-invoiced">Arveldatud <strong>{money(card.invoicedCents)}</strong></span>
        <span className="is-received">Laekunud <strong>{money(card.receivedCents)}</strong></span>
        {card.calendarCents ? <span className="is-calendar">Kalendri järgi <strong>{money(card.calendarCents)}</strong></span> : null}
      </>}
    </div> : null}
    <div className="fd-months" role="group" aria-label="Vali kuu">{columns.map((column) => <button key={column.month} type="button" aria-pressed={column.month === selected}
      aria-label={`${monthName(column.month, 'long')}: ${column.future ? `prognoos ${money(column.forecastCents)}` : `arveldatud ${money(column.invoicedCents)}, laekunud ${money(column.receivedCents)}`}`}
      onClick={() => onSelect(column.month)} />)}</div>
  </div></div>;
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
