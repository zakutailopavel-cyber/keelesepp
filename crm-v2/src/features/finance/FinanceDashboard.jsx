import { ChevronDown, ChevronUp, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { businessSettingsService, groupsService, scheduleService, studentsService, teachersService } from '../../services/firebase/index.js';
import { PERIODS, lessonRevenue, monthRange, niceMax, periodSummary, smoothPath } from './financeDashboard.js';
import { currentMonth, shiftMonth } from './monthlyBilling.js';
import BusinessReport from './BusinessReport.jsx';
import { businessReport } from './businessReport.js';
import './financeDashboard.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(Number(cents || 0) / 100));
const short = (cents) => { const euros = Math.round(Number(cents || 0) / 100); return euros >= 1000 ? `${(euros / 1000).toFixed(euros >= 10000 ? 0 : 1).replace('.', ',')}k` : `${euros}`; };
const monthName = (month, style = 'short') => new Intl.DateTimeFormat('et-EE', { month: style, ...(style === 'long' ? { year: 'numeric' } : {}) }).format(new Date(`${month}-15T12:00:00`));
// every card (archived ones too: their past lessons are part of the past months)
const api = { students: () => studentsService.list({ pageSize: 500, exhaustive: true }).then((result) => result.items || []), schedule: () => scheduleService.list(), groups: () => groupsService.list().catch(() => []), teachers: () => teachersService.list(), settings: () => businessSettingsService.get(), saveSettings: (values, user) => businessSettingsService.save(values, user) };
const STORE = 'keelesepp.financeDashboard.hidden';
const hiddenAtStart = () => { try { return globalThis.localStorage?.getItem(STORE) === '1'; } catch { return false; } };
const PERIOD_STORE = 'keelesepp.financeDashboard.period';
const periodAtStart = () => { try { const value = Number(globalThis.localStorage?.getItem(PERIOD_STORE)); return PERIODS.some((item) => item.months === value) ? value : 1; } catch { return 1; } };
const periodName = (months) => ({ 1: 'kuu', 3: '3 kuud', 6: '6 kuud', 12: 'aasta' })[months];

// Chart: smooth curves of invoiced (dark green, filled) and received (light green) money, the forecast as a gold dashed
// curve going on from this month; a guide line and a card with the numbers follow the pointer or the chosen month.
function RevenueChart({ columns, selected, onSelect }) {
  const width = 760; const height = 270; const left = 48; const right = 16; const bottom = 30; const top = 16;
  const max = niceMax(Math.max(...columns.map((column) => (column.heldCents || 0) + (column.plannedCents || 0)), 1));
  const plotH = height - bottom - top;
  const step = columns.length > 1 ? (width - left - right) / (columns.length - 1) : 0;
  const x = (index) => left + index * step;
  const y = (cents) => top + plotH - (cents / max) * plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max);
  const past = columns.map((column, index) => ({ column, index })).filter(({ column }) => !column.future);
  const nowIndex = columns.findIndex((column) => column.current);
  const held = past.map(({ column, index }) => [x(index), y(column.heldCents)]);
  // the gold line: this month in full (held + still planned), then the planned months
  const forecast = [...(nowIndex >= 0 ? [[x(nowIndex), y(columns[nowIndex].heldCents + columns[nowIndex].plannedCents)]] : []), ...columns.map((column, index) => ({ column, index })).filter(({ column }) => column.future).map(({ column, index }) => [x(index), y(column.plannedCents)])];
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
    <svg className="fd-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tundide tulu kuude kaupa: toimunud ja kalendris"
      onPointerMove={pick} onPointerLeave={() => setHover(null)} onClick={() => { if (hover !== null) onSelect(columns[hover].month); }}>
      <defs>
        <linearGradient id="fd-fill-held" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#176553" stopOpacity=".28" /><stop offset="100%" stopColor="#176553" stopOpacity="0" /></linearGradient>
        <linearGradient id="fd-fill-forecast" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#e3a857" stopOpacity=".25" /><stop offset="100%" stopColor="#e3a857" stopOpacity="0" /></linearGradient>
      </defs>
      {ticks.map((tick) => <g key={tick}><line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="fd-grid" /><text x={left - 8} y={y(tick) + 4} className="fd-axis" textAnchor="end">{short(tick)}</text></g>)}
      {nowIndex >= 0 && forecast.length > 1 ? <rect x={x(nowIndex)} y={top} width={width - right - x(nowIndex)} height={plotH} className="fd-future-zone" /> : null}
      <path d={area(forecast)} fill="url(#fd-fill-forecast)" />
      <path d={area(held)} fill="url(#fd-fill-held)" />
      <path d={smoothPath(held)} className="fd-line fd-line--invoiced" pathLength="1" />
      <path d={smoothPath(forecast)} className="fd-line fd-line--forecast" />
      {shown >= 0 ? <line x1={x(shown)} x2={x(shown)} y1={top} y2={base} className="fd-guide" /> : null}
      {past.map(({ column, index }) => <circle key={column.month} cx={x(index)} cy={y(column.heldCents)} r={index === shown ? 5.5 : 3.5} className="fd-dot fd-dot--invoiced" />)}
      {nowIndex >= 0 && columns[nowIndex].plannedCents ? <circle cx={x(nowIndex)} cy={y(columns[nowIndex].heldCents + columns[nowIndex].plannedCents)} r="4.5" className="fd-dot fd-dot--calendar" /> : null}
      {columns.map((column, index) => column.future ? <circle key={column.month} cx={x(index)} cy={y(column.plannedCents)} r={index === shown ? 5.5 : 4} className="fd-dot fd-dot--forecast" /> : null)}
      {columns.map((column, index) => <text key={column.month} x={x(index)} y={height - 9} textAnchor="middle" className={`fd-axis ${column.current ? 'is-current' : ''} ${column.future ? 'is-future' : ''}`}>{monthName(column.month)}</text>)}
    </svg>
    {card ? <div className={`fd-tip ${hover > columns.length / 2 ? 'is-left' : ''}`} style={{ left: `${(x(hover) / width) * 100}%` }} aria-hidden="true">
      <b>{monthName(card.month, 'long')}</b>
      {card.future ? <span className="is-forecast">Kalendris <strong>{money(card.plannedCents)}</strong></span> : <>
        <span className="is-invoiced">Toimunud <strong>{money(card.heldCents)}</strong></span>
        {card.plannedCents ? <span className="is-calendar">Kalendris veel <strong>{money(card.plannedCents)}</strong></span> : null}
      </>}
      <small>{card.future ? card.plannedLessons : card.heldLessons + card.plannedLessons} tundi</small>
    </div> : null}
    <div className="fd-months" role="group" aria-label="Vali kuu">{columns.map((column) => <button key={column.month} type="button" aria-pressed={column.month === selected}
      aria-label={`${monthName(column.month, 'long')}: ${column.future ? `kalendris ${money(column.plannedCents)}` : `toimunud ${money(column.heldCents)}`}`}
      onClick={() => onSelect(column.month)} />)}</div>
  </div></div>;
}

export default function FinanceDashboard({ plans = [], lessons = [], repository = api, today = new Date(), user = null }) {
  const [savedSettings, setSavedSettings] = useState(null);
  const [hidden, setHidden] = useState(hiddenAtStart);
  const current = currentMonth(today);
  const todayIso = new Intl.DateTimeFormat('sv-SE').format(today);
  const [selected, setSelected] = useState(current);
  const [period, setPeriod] = useState(periodAtStart);
  const choosePeriod = (months) => { setPeriod(months); try { globalThis.localStorage?.setItem(PERIOD_STORE, String(months)); } catch { /* private mode */ } };
  const state = useAsyncData(async () => {
    const settle = (load) => Promise.resolve().then(load).catch(() => []);
    const [students, schedule, groups, teachers] = await Promise.all([settle(repository.students), settle(repository.schedule), settle(repository.groups), settle(repository.teachers || (() => []))]);
    const settings = await Promise.resolve().then(repository.settings || (() => ({}))).catch(() => ({}));
    return { students, schedule, groups, teachers, settings };
  }, [repository]);

  const model = useMemo(() => {
    if (!state.data) return null;
    // the period and the one before it (for the change), and as many months ahead; the chart shows at least half a year back
    const back = Math.max(period * 2, 12);
    const ahead = Math.max(period, 3);
    const months = [...monthRange(current, back), ...Array.from({ length: ahead }, (_, index) => shiftMonth(current, index + 1))];
    const rows = lessonRevenue({ months, today: todayIso, students: state.data.students, plans, schedule: state.data.schedule, groups: state.data.groups, lessons });
    const shownBack = Math.max(period, 6);
    const window = rows.slice(back - shownBack);
    // the chart starts at the first month with lessons (a young school has no empty year on it)
    const first = window.findIndex((row) => row.heldCents || row.plannedCents);
    const shown = window.slice(first < 0 ? shownBack - 1 : Math.min(first, shownBack - 6));
    const columns = shown.map((row) => ({ ...row, current: row.month === current, future: row.month > current }));
    const report = businessReport({ current, months: period, today: todayIso, students: state.data.students, plans, schedule: state.data.schedule, groups: state.data.groups, lessons, teachers: state.data.teachers, settings: savedSettings || state.data.settings });
    return { columns, summary: periodSummary({ rows, current, months: period }), report };
  }, [state.data, plans, lessons, current, todayIso, period, savedSettings]);

  const toggle = () => { const next = !hidden; setHidden(next); try { globalThis.localStorage?.setItem(STORE, next ? '1' : '0'); } catch { /* private mode */ } };
  const column = model?.columns.find((item) => item.month === selected);
  const s = model?.summary;

  return <section className="fd" aria-label="Tundide tulu ja prognoos">
    <header className="fd-head">
      <div><span className="eyebrow">Ülevaade · kalendri tundide järgi</span><h2><LineChart size={20} aria-hidden="true" /> Tulu ja prognoos</h2></div>
      <button type="button" className="fd-toggle" aria-expanded={!hidden} onClick={toggle}>{hidden ? <><ChevronDown size={16} /> Näita</> : <><ChevronUp size={16} /> Peida</>}</button>
    </header>
    {hidden ? null : !model ? <p className="form-hint">Arvutan…</p> : <>
      <div className="fd-periods" role="group" aria-label="Periood">{PERIODS.map((item) => <button key={item.months} type="button" aria-pressed={period === item.months} className={period === item.months ? 'is-active' : ''} onClick={() => choosePeriod(item.months)}>{item.label}</button>)}</div>
      <div className="fd-kpis">
        <div className="fd-kpi"><span>Toimunud · {period === 1 ? monthName(current, 'long') : (s.from.slice(0, 4) === current.slice(0, 4) ? `${monthName(s.from)} – ${monthName(current)}` : `${monthName(s.from)} ${s.from.slice(0, 4)} – ${monthName(current)} ${current.slice(0, 4)}`)}</span><strong>{money(s.heldCents)}</strong><small>{s.heldLessons} tundi</small></div>
        <div className="fd-kpi fd-kpi--forecast"><span>Kalendris veel sel kuul</span><strong>{money(s.plannedCents)}</strong><small>{s.plannedLessons} tundi</small></div>
        <div className="fd-kpi"><span>{period === 1 ? 'Kuu kokku' : `Kokku · ${periodName(period)}`}</span><strong>{money(s.totalCents)}</strong>
          {s.changePercent !== null ? <small className={s.changePercent >= 0 ? 'is-up' : 'is-down'}>{s.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {s.changePercent > 0 ? '+' : ''}{s.changePercent}% {period === 1 ? 'eelmise kuuga' : 'eelmise perioodiga'}</small> : <small>{period === 1 ? 'eelmise kuuga' : 'eelmise perioodiga'} võrrelda pole</small>}</div>
        <div className="fd-kpi fd-kpi--forecast"><span>Prognoos · järgmised {period === 1 ? 'kuu' : `${s.aheadMonths} kuud`}</span><strong>{money(s.aheadCents)}</strong><small>{s.aheadLessons} tundi kalendris</small></div>
        <div className="fd-kpi"><span>Keskmiselt kuus</span><strong>{money(s.averageMonthCents)}</strong><small>{s.unmarkedLessons ? `${s.unmarkedLessons} märkimata tundi loetud toimunuks` : 'kõik tunnid märgitud'}</small></div>
      </div>
      <div className="fd-chart-card">
        <div className="fd-legend" aria-hidden="true"><span className="is-invoiced">Toimunud tunnid</span><span className="is-forecast">Kalendris (prognoos)</span><span className="is-calendar">Kuu kokku</span></div>
        <RevenueChart columns={model.columns} selected={selected} onSelect={setSelected} />
        {column ? <p className="fd-detail" aria-live="polite" data-testid="fd-detail"><b>{monthName(column.month, 'long')}</b>{column.future
          ? ` · kalendris ${money(column.plannedCents)} · ${column.plannedLessons} tundi`
          : ` · toimunud ${money(column.heldCents)} (${column.heldLessons} tundi${column.unmarkedLessons ? `, neist ${column.unmarkedLessons} märkimata` : ''})${column.plannedCents ? ` · kalendris veel ${money(column.plannedCents)} (${column.plannedLessons} tundi)` : ''}`}{column.noPrice ? ` · ${column.noPrice} tundi ilma hinnata` : ''}</p> : null}
        <p className="form-hint">Arvestus käib kalendri tundide järgi, mitte arvete järgi (raamatupidamine on eraldi): toimunud = märgitud „Toimunud” või tasuline puudumine, ka märkimata möödunud tund; ära jäetud ja ette teatatud puudumised ei lähe arvesse. Hind = õpilase tunnihind tunni pikkuse järgi.</p>
      </div>
      <BusinessReport report={model.report} settings={savedSettings || state.data.settings} teachers={state.data.teachers} onSaveSettings={repository.saveSettings && user ? async (values) => setSavedSettings(await repository.saveSettings(values, user)) : null} />
    </>}
  </section>;
}
