import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAsyncData } from '../../hooks/useAsyncData.js';
import { businessSettingsService } from '../../services/firebase/businessSettings.js';
import { groupsService } from '../../services/firebase/groups.js';
import { scheduleService } from '../../services/firebase/schedule.js';
import { studentsService } from '../../services/firebase/students.js';
import { teachersService } from '../../services/firebase/teachers.js';
import { PERIODS, lessonRevenue, monthRange, niceMax, periodSummary } from './financeDashboard.js';
import { currentMonth, shiftMonth } from './monthlyBilling.js';
import BusinessReport from './BusinessReport.jsx';
import { businessReport } from './businessReport.js';
import { barParts, endOfPeriodProfit, profitChange, sparkPoints, trendSeries, verdict } from './dashboardView.js';
import './financeDashboard.css';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(Number(cents || 0) / 100));
const signed = (cents) => (cents < 0 ? `−${money(-cents)}` : money(cents));
const hours = (value) => String(value).replace('.', ',');
const short = (cents) => { const euros = Math.round(Number(cents || 0) / 100); return euros >= 1000 ? `${(euros / 1000).toFixed(euros >= 10000 ? 0 : 1).replace('.', ',')}k` : `${euros}`; };
const monthName = (month, style = 'short') => new Intl.DateTimeFormat('et-EE', { month: style, ...(style === 'long' ? { year: 'numeric' } : {}) }).format(new Date(`${month}-15T12:00:00`));
// every card (archived ones too: their past lessons are part of the past months)
const api = { students: () => studentsService.list({ pageSize: 500, exhaustive: true }).then((result) => result.items || []), schedule: () => scheduleService.list(), groups: () => groupsService.list().catch(() => []), teachers: () => teachersService.list(), settings: () => businessSettingsService.get(), saveSettings: (values, user) => businessSettingsService.save(values, user) };
const STORE = 'keelesepp.financeDashboard.hidden';
const hiddenAtStart = () => { try { return globalThis.localStorage?.getItem(STORE) === '1'; } catch { return false; } };
const PERIOD_STORE = 'keelesepp.financeDashboard.period';
const periodAtStart = () => { try { const value = Number(globalThis.localStorage?.getItem(PERIOD_STORE)); return PERIODS.some((item) => item.months === value) ? value : 1; } catch { return 1; } };
const monthsBetween = (from, to) => (Number(to.slice(0, 4)) - Number(from.slice(0, 4))) * 12 + Number(to.slice(5, 7)) - Number(from.slice(5, 7));

// Chart: one bar per month. A past month's bar is its revenue split into fixed costs, teacher pay and profit (the
// months businessReport covers; older ones are one plain bar); the running month has the calendar's rest on top; the
// coming months are dashed bars of what the calendar holds. A card with the numbers follows the pointer.
function RevenueChart({ columns, parts, forecast, selected, onSelect }) {
  const width = 760; const height = 270; const left = 44; const right = 12; const bottom = 30; const top = 24;
  const max = niceMax(Math.max(...columns.map((column) => (column.heldCents || 0) + (column.plannedCents || 0)), 1));
  const plotH = height - bottom - top;
  const band = (width - left - right) / Math.max(columns.length, 1);
  const barW = Math.min(46, band * 0.62);
  const x = (index) => left + band * (index + 0.5);
  const y = (cents) => top + plotH - (cents / max) * plotH;
  const base = top + plotH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max);
  const [hover, setHover] = useState(null);
  // a narrow screen scrolls the chart: it opens at the right end (this month and the forecast)
  const scroller = useRef(null);
  useEffect(() => { const node = scroller.current; if (node && node.scrollWidth > node.clientWidth) node.scrollLeft = node.scrollWidth; }, [columns.length]);
  const shown = hover ?? columns.findIndex((column) => column.month === selected);
  const pick = (event) => {
    const box = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * width;
    setHover(Math.max(0, Math.min(columns.length - 1, Math.floor((px - left) / band))));
  };
  const card = hover !== null ? columns[hover] : null;
  const cardParts = card ? parts(card) : null;
  return <div className="fd-chart-scroll" ref={scroller}><div className="fd-chart-wrap">
    <svg className="fd-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Tundide tulu kuude kaupa: toimunud ja kalendris"
      onPointerMove={pick} onPointerLeave={() => setHover(null)} onClick={() => { if (hover !== null) onSelect(columns[hover].month); }}>
      {ticks.map((tick) => <g key={tick}><line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} className="fd-grid" /><text x={left - 8} y={y(tick) + 4} className="fd-axis" textAnchor="end">{short(tick)}</text></g>)}
      {shown >= 0 ? <rect x={x(shown) - band / 2 + 3} y={top - 14} width={band - 6} height={plotH + 14} rx="10" className="fd-band" /> : null}
      {columns.map((column, index) => {
        const total = (column.heldCents || 0) + (column.plannedCents || 0);
        const barX = x(index) - barW / 2;
        const split = column.future ? null : parts(column);
        const clip = `fd-clip-${column.month}`;
        const profitLine = column.future && forecast?.month === column.month && forecast.profitCents > 0 && forecast.profitCents < column.plannedCents ? y(forecast.profitCents) : null;
        return <g key={column.month}>
          {total > 0 ? <clipPath id={clip}><rect x={barX} y={y(total)} width={barW} height={base - y(total)} rx="7" /></clipPath> : null}
          {column.future ? (total > 0 ? <rect x={barX} y={y(total)} width={barW} height={base - y(total)} rx="7" className="fd-bar--forecast" /> : null) : <g clipPath={`url(#${clip})`}>
            {split ? <>
              <rect x={barX} y={y(split.fixed)} width={barW} height={base - y(split.fixed)} className="fd-seg--fixed" />
              <rect x={barX} y={y(split.fixed + split.pay)} width={barW} height={y(split.fixed) - y(split.fixed + split.pay)} className="fd-seg--pay" />
              <rect x={barX} y={y(column.heldCents)} width={barW} height={y(split.fixed + split.pay) - y(column.heldCents)} className="fd-seg--profit" />
            </> : <rect x={barX} y={y(column.heldCents || 0)} width={barW} height={base - y(column.heldCents || 0)} className="fd-seg--plain" />}
            {column.plannedCents ? <rect x={barX} y={y(total)} width={barW} height={y(column.heldCents || 0) - y(total)} className="fd-seg--calendar" /> : null}
          </g>}
          {profitLine !== null ? <line x1={barX + 3} x2={barX + barW - 3} y1={profitLine} y2={profitLine} className="fd-profit-line" /> : null}
          {total > 0 ? <text x={x(index)} y={y(total) - 7} textAnchor="middle" className="fd-value">{short(total)}</text> : null}
          <text x={x(index)} y={height - 9} textAnchor="middle" className={`fd-axis ${column.current ? 'is-current' : ''} ${column.future ? 'is-future' : ''}`}>{monthName(column.month)}</text>
        </g>;
      })}
    </svg>
    {card ? <div className={`fd-tip ${hover > columns.length / 2 ? 'is-left' : ''}`} style={{ left: `${(x(hover) / width) * 100}%` }} aria-hidden="true">
      <b>{monthName(card.month, 'long')}</b>
      {card.future ? <span className="is-forecast">Kalendris <strong>{money(card.plannedCents)}</strong></span> : <>
        <span className="is-invoiced">Toimunud <strong>{money(card.heldCents)}</strong></span>
        {cardParts ? <span className="is-profit">Kasum <strong>{signed(cardParts.profitCents)}</strong></span> : null}
        {card.plannedCents ? <span className="is-calendar">Kalendris veel <strong>{money(card.plannedCents)}</strong></span> : null}
      </>}
      <small>{card.future ? card.plannedLessons : card.heldLessons + card.plannedLessons} tundi</small>
    </div> : null}
    <div className="fd-months" role="group" aria-label="Vali kuu">{columns.map((column) => <button key={column.month} type="button" aria-pressed={column.month === selected}
      aria-label={`${monthName(column.month, 'long')}: ${column.future ? `kalendris ${money(column.plannedCents)}` : `toimunud ${money(column.heldCents)}`}`}
      onClick={() => onSelect(column.month)} />)}</div>
  </div></div>;
}

function Spark({ values }) {
  const points = sparkPoints(values);
  if (!points.length) return null;
  const last = points[points.length - 1];
  return <svg className="fd-spark" viewBox="0 0 96 34" aria-hidden="true"><polyline points={points.map((point) => point.join(',')).join(' ')} /><circle cx={last[0]} cy={last[1]} r="3.5" /></svg>;
}

const Change = ({ value, label }) => (value === null || value === undefined ? null : <span className={`fd-tag ${value >= 0 ? 'is-up' : 'is-down'}`}>{value >= 0 ? <TrendingUp size={13} aria-hidden="true" /> : <TrendingDown size={13} aria-hidden="true" />}{value > 0 ? '+' : ''}{value}%{label ? ` ${label}` : ''}</span>);

// the block in one sentence (dashboardView.verdict): better or worse, what the period ends with, the next month
function Verdict({ view, past, period }) {
  const unit = period === 1 ? 'kuu' : 'perioodi';
  const head = view.change === null ? `Eelmise ${unit}ga ei saa veel võrrelda.` : view.change >= 3 ? `Tulu on eelmisest ${period === 1 ? 'kuust' : 'perioodist'} ${view.change}% suurem.` : view.change <= -3 ? `Tulu on eelmisest ${period === 1 ? 'kuust' : 'perioodist'} ${-view.change}% väiksem.` : `Tulu on eelmise ${unit}ga samal tasemel.`;
  return <div className={`fd-verdict is-${view.tone}`} data-testid="fd-verdict">
    <span className="fd-verdict__light" aria-hidden="true" />
    <p><b>{head}</b> {past ? <>Tulu oli <b>{money(view.endRevenueCents)}</b> ja koolile jäi <b className={view.endProfitCents < 0 ? 'is-down' : ''}>{signed(view.endProfitCents)}</b>.</> : <>{period === 1 ? 'Kuu' : 'Perioodi'} lõpuks tuleb tulu <b>{money(view.endRevenueCents)}</b> ja koolile jääb <b className={view.endProfitCents < 0 ? 'is-down' : ''}>{signed(view.endProfitCents)}</b>.</>}
      {view.nextCents !== null ? <> Järgmise kuu kalendris on juba <b>{money(view.nextCents)}</b>.</> : null}
      {view.withoutOwnerCents !== null ? <> Ilma omaniku tundideta oleks kool <b className="is-down">{money(-view.withoutOwnerCents)} miinuses</b>.</> : null}
      {view.noCosts ? <> Püsikulud on lisamata — kasum on tegelikust suurem.</> : null}</p>
    <span className="fd-verdict__label">{view.label}</span>
  </div>;
}

function Meter({ label, value, share, mark = null, tone = '', children }) {
  return <div className="fd-meter"><div className="fd-meter__top"><span>{label}</span><b>{value}</b></div>
    <div className="fd-track"><i className={tone} style={{ width: `${Math.max(0, Math.min(100, share))}%` }} />{mark === null ? null : <u style={{ left: `${Math.max(0, Math.min(100, mark))}%` }} />}</div>
    <small>{children}</small></div>;
}

// „Kus me praegu oleme”: the next month, how much of the month is in, the break-even point, the owner's share, the top ten
function Position({ report, summary, past, period, today }) {
  const { pnl, forecast } = report;
  const days = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthShare = Math.round((today.getDate() / days) * 100);
  const inShare = summary.totalCents ? Math.round((summary.heldCents / summary.totalCents) * 100) : 0;
  const even = pnl?.breakEven;
  const owner = pnl?.owner;
  return <div className="fd-panel" role="region" aria-label="Kus me praegu oleme">
    <h3>Kus me praegu oleme</h3>
    {forecast ? <div className="fd-next"><span>Järgmine kuu · {monthName(forecast.month, 'long')}</span>
      <strong>{money(forecast.revenueCents)} <em>→ kasum {signed(forecast.profitCents)}</em></strong>
      <small>{forecast.lessons} tundi kalendris · õpetajad −{money(forecast.teacherPayCents)} · püsikulud −{money(forecast.fixedCents)}. Kalender ei pruugi olla veel täis.</small></div> : null}
    {!past && period === 1 && summary.totalCents ? <Meter label="Kuu tulu on koos" value={`${inShare}%`} share={inShare} mark={monthShare}>kuust on möödas {monthShare}% · kalendris veel {money(summary.plannedCents)}</Meter> : null}
    {even ? <Meter label="Tasuvuspunkt (palgaliste õpetajate tunnid)" value={`${hours(even.hoursPerMonthNow)} / ${even.hoursNeededPerMonth} h`} share={(even.hoursPerMonthNow / even.hoursNeededPerMonth) * 100} tone={even.hoursPerMonthNow >= even.hoursNeededPerMonth ? '' : 'is-amber'}>
      nende tund jätab koolile keskmiselt {money(even.marginPerHourCents)}; püsikulude ({money(pnl.fixedMonthCents)} kuus) katmiseks {even.hoursPerMonthNow >= even.hoursNeededPerMonth ? 'on tunde piisavalt' : `on puudu ${hours(Math.round((even.hoursNeededPerMonth - even.hoursPerMonthNow) * 10) / 10)} h kuus`}</Meter> : null}
    {owner ? <Meter label={`Omaniku tunnid · ${owner.name}`} value={`${owner.share ?? 0}% tulust`} share={owner.share ?? 0} tone="is-amber">
      {money(owner.earnedCents)}, {hours(owner.hours)} h. Ilma nendeta jääks koolile <b className={owner.withoutOwnerCents < 0 ? 'is-down' : 'is-up'}>{signed(owner.withoutOwnerCents)}</b>{owner.profitAfterOwnerPayCents !== null ? <>; kui maksta omanikule {money(owner.rateCents)}/h ({money(owner.payAtRateCents)}), on kasum <b className={owner.profitAfterOwnerPayCents < 0 ? 'is-down' : 'is-up'}>{signed(owner.profitAfterOwnerPayCents)}</b></> : null}.</Meter> : null}
    {report.topTenShare !== null && report.studentRows.length > 10 ? <Meter label="10 suurimat õpilast" value={`${report.topTenShare}% tulust`} share={report.topTenShare}>õpilasi perioodis {report.studentRows.length}</Meter> : null}
    {!forecast && !even && !owner ? <p className="form-hint">Lisa püsikulud ja omanik („Püsikulud ja omanik”), siis näed siin tasuvuspunkti ja omaniku tundide osa.</p> : null}
  </div>;
}

export default function FinanceDashboard({ plans = [], lessons = [], repository = api, today = new Date(), user = null }) {
  const [savedSettings, setSavedSettings] = useState(null);
  const [hidden, setHidden] = useState(hiddenAtStart);
  const current = currentMonth(today);
  const todayIso = new Intl.DateTimeFormat('sv-SE').format(today);
  const [selected, setSelected] = useState(current);
  const [period, setPeriod] = useState(periodAtStart);
  // the month the numbers are about (owner 2026-10-28: „выбрать определенный месяц”): this month or a past one
  const [anchor, setAnchor] = useState(current);
  const lag = Math.max(0, monthsBetween(anchor, current));
  const past = anchor < current;
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
    const back = Math.max(period * 2 + lag, 24);
    const ahead = Math.max(period, 3);
    const months = [...monthRange(current, back), ...Array.from({ length: ahead }, (_, index) => shiftMonth(current, index + 1))];
    const rows = lessonRevenue({ months, today: todayIso, students: state.data.students, plans, schedule: state.data.schedule, groups: state.data.groups, lessons });
    const shownBack = Math.max(period + lag, 6);
    const window = rows.slice(back - shownBack);
    // the chart starts at the first month with lessons (a young school has no empty year on it)
    const first = window.findIndex((row) => row.heldCents || row.plannedCents);
    const shown = window.slice(first < 0 ? shownBack - 1 : Math.min(first, shownBack - 6));
    const columns = shown.map((row) => ({ ...row, current: row.month === current, future: row.month > current }));
    // the months that can be chosen: from the first month with lessons up to this one
    const firstAny = rows.findIndex((row) => row.heldCents || row.plannedCents);
    const choices = rows.slice(firstAny < 0 ? back - 1 : firstAny, back).map((row) => row.month);
    const report = businessReport({ current: anchor, months: period, today: todayIso, students: state.data.students, plans, schedule: state.data.schedule, groups: state.data.groups, lessons, teachers: state.data.teachers, settings: savedSettings || state.data.settings });
    return { columns, choices, summary: periodSummary({ rows, current: anchor, months: period }), report };
  }, [state.data, plans, lessons, current, todayIso, period, savedSettings, anchor, lag]);
  // a year month by month for the bars' split and the small trend lines (the same report, a longer period)
  const trend = useMemo(() => (state.data ? businessReport({ current, months: 12, today: todayIso, students: state.data.students, plans, schedule: state.data.schedule, groups: state.data.groups, lessons, teachers: state.data.teachers, settings: savedSettings || state.data.settings }) : null),
    [state.data, plans, lessons, current, todayIso, savedSettings]);
  // a click on a past month of the chart chooses it for the numbers too
  const chooseMonth = (month) => { setSelected(month); if (month <= current) setAnchor(month); };
  const stepMonth = (by) => { const list = model?.choices || []; const next = list[list.indexOf(anchor) + by]; if (next) chooseMonth(next); };

  const toggle = () => { const next = !hidden; setHidden(next); try { globalThis.localStorage?.setItem(STORE, next ? '1' : '0'); } catch { /* private mode */ } };
  const column = model?.columns.find((item) => item.month === selected);
  const s = model?.summary;
  const pnl = model?.report.pnl;
  const now = model?.report.now;
  const endProfit = model ? endOfPeriodProfit(model.report) : 0;
  const profitDelta = model && period === 1 ? profitChange(trend, anchor) : null;
  const series = trendSeries(trend, anchor);
  const trendByMonth = new Map((trend?.monthly || []).map((row) => [row.month, row]));
  const partsOf = (item) => barParts(item.heldCents, trendByMonth.get(item.month));
  const rangeLabel = !s ? '' : period === 1 ? monthName(anchor, 'long') : (s.from.slice(0, 4) === anchor.slice(0, 4) ? `${monthName(s.from)} – ${monthName(anchor)}` : `${monthName(s.from)} ${s.from.slice(0, 4)} – ${monthName(anchor)} ${anchor.slice(0, 4)}`);

  return <section className="fd" aria-label="Tundide tulu ja prognoos">
    <header className="fd-head">
      <div><span className="eyebrow">Ülevaade · kalendri tundide järgi</span><h2><LineChart size={20} aria-hidden="true" /> Tulu ja prognoos</h2></div>
      <button type="button" className="fd-toggle" aria-expanded={!hidden} onClick={toggle}>{hidden ? <><ChevronDown size={16} /> Näita</> : <><ChevronUp size={16} /> Peida</>}</button>
    </header>
    {hidden ? null : !model ? <p className="form-hint">Arvutan…</p> : <>
      <div className="fd-controls">
        <div className="fd-periods" role="group" aria-label="Periood">{PERIODS.map((item) => <button key={item.months} type="button" aria-pressed={period === item.months} className={period === item.months ? 'is-active' : ''} onClick={() => choosePeriod(item.months)}>{item.label}</button>)}</div>
        <div className="fd-month" role="group" aria-label="Kuu">
          <button type="button" aria-label="Eelmine kuu" disabled={model.choices.indexOf(anchor) <= 0} onClick={() => stepMonth(-1)}><ChevronLeft size={16} /></button>
          <select aria-label="Aruande kuu" value={anchor} onChange={(event) => chooseMonth(event.target.value)}>{model.choices.slice().reverse().map((month) => <option key={month} value={month}>{monthName(month, 'long')}{month === current ? ' (praegu)' : ''}</option>)}</select>
          <button type="button" aria-label="Järgmine kuu" disabled={anchor >= current} onClick={() => stepMonth(1)}><ChevronRight size={16} /></button>
          {past ? <button type="button" className="fd-month-now" onClick={() => chooseMonth(current)}>Praegune kuu</button> : null}
        </div>
      </div>
      <Verdict view={verdict({ summary: s, report: model.report, period })} past={past} period={period} />
      <div className="fd-kpis">
        <div className="fd-kpi fd-kpi--main"><span>Kasum · koolile jääb</span><div className="fd-kpi__row"><strong className={pnl.profitCents < 0 ? 'is-loss' : ''}>{signed(pnl.profitCents)}</strong><Spark values={series.profit} /></div>
          <small>{past ? null : <>{period === 1 ? 'kuu' : 'perioodi'} lõpuks {signed(endProfit)} · </>}{period === 1 && profitDelta !== null ? <><b>{profitDelta > 0 ? '+' : ''}{profitDelta}%</b> eelmisest kuust · </> : null}{pnl.marginPercent !== null ? `${pnl.marginPercent}% tulust` : 'pärast õpetajate tasu ja püsikulusid'}</small></div>
        <div className="fd-kpi"><span>Tulu · {rangeLabel}</span><div className="fd-kpi__row"><strong>{money(s.heldCents)}</strong><Spark values={series.revenue} /></div>
          <small>{past ? null : <>{period === 1 ? 'kuu' : 'perioodi'} lõpuks {money(s.totalCents)} </>}{s.changePercent !== null ? <Change value={s.changePercent} label={period === 1 ? 'eelmisest kuust' : 'eelmisest perioodist'} /> : s.beforeComplete ? null : 'võrrelda pole'}</small></div>
        <div className="fd-kpi"><span>Tunnid</span><div className="fd-kpi__row"><strong>{now.tookPlace}</strong><Spark values={series.lessons} /></div>
          <small>{past ? null : `kalendris veel ${now.planned} · `}kohalolek {now.attendance === null ? '—' : `${now.attendance}%`}{now.unmarked ? ` · ${now.unmarked} märkimata` : ''}</small></div>
        <div className="fd-kpi"><span>Õpilased</span><div className="fd-kpi__row"><strong>{now.students}</strong><Spark values={series.students} /></div>
          <small>{model.report.newStudents.length ? <span className="fd-tag is-up">+{model.report.newStudents.length} uut</span> : null}{model.report.lostStudents.length ? <span className="fd-tag">−{model.report.lostStudents.length} lahkus</span> : null} {money(now.perStudentCents)} õpilase kohta</small></div>
      </div>
      <div className="fd-split">
        <div className="fd-panel fd-chart-card">
          <h3>Tulu kuude kaupa ja kuhu see läks <small>klõps kuul valib selle</small></h3>
          <div className="fd-legend" aria-hidden="true"><span className="is-profit">Kasum</span><span className="is-pay">Õpetajate tasu</span><span className="is-fixed">Püsikulud</span><span className="is-forecast">Kalendris (prognoos)</span></div>
          <RevenueChart columns={model.columns} parts={partsOf} forecast={model.report.forecast} selected={selected} onSelect={chooseMonth} />
          {column ? <p className="fd-detail" aria-live="polite" data-testid="fd-detail"><b>{monthName(column.month, 'long')}</b>{column.future
            ? ` · kalendris ${money(column.plannedCents)} · ${column.plannedLessons} tundi`
            : ` · toimunud ${money(column.heldCents)} (${column.heldLessons} tundi${column.unmarkedLessons ? `, neist ${column.unmarkedLessons} märkimata` : ''})${column.plannedCents ? ` · kalendris veel ${money(column.plannedCents)} (${column.plannedLessons} tundi)` : ''}`}{column.noPrice ? ` · ${column.noPrice} tundi ilma hinnata` : ''}{column.groupNoPrice ? ` · ${column.groupNoPrice} grupitundi individuaalse hinnaga (grupi hind puudub)` : ''}</p> : null}
        </div>
        <Position report={model.report} summary={s} past={past} period={period} today={today} />
      </div>
      <BusinessReport report={model.report} settings={savedSettings || state.data.settings} teachers={state.data.teachers} onSaveSettings={repository.saveSettings && user ? async (values) => setSavedSettings(await repository.saveSettings(values, user)) : null}
        tiles={[
          { label: period === 1 ? 'Eelmine kuu' : 'Eelmine periood', value: s.beforeComplete ? money(s.beforeCents) : '—', hint: period === 1 ? monthName(shiftMonth(s.from, -1), 'long') : `${monthName(shiftMonth(s.from, -period))} – ${monthName(shiftMonth(s.from, -1))}` },
          period === 1 ? { label: 'Keskmine tund', value: money(s.averageLessonCents), hint: 'tulu ühe õpilase tunni kohta, kalendriga' } : { label: 'Keskmiselt kuus', value: money(s.averageMonthCents), hint: `periood kokku ${money(s.totalCents)}` },
          ...(past ? [] : [{ label: `Prognoos · ${period === 1 ? 'järgmine kuu' : `järgmised ${s.aheadMonths} kuud`}`, value: money(s.aheadCents), hint: `${s.aheadLessons} tundi kalendris`, forecast: true }]),
        ]} />
    </>}
  </section>;
}
