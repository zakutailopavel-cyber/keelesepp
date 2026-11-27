import { Activity, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '../../components/ui/index.js';
import { atStakeCents, studentLinks } from './dashboardView.js';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(Number(cents || 0) / 100));
const signed = (cents) => (cents < 0 ? `−${money(-cents)}` : money(cents));
const delta = (value, label = 'eelmise perioodiga') => (value === null || value === undefined ? null : <em className={value >= 0 ? 'is-up' : 'is-down'}>{value > 0 ? '+' : ''}{value}% {label}</em>);
const share = (part, whole) => Math.max(0, Math.min(100, whole > 0 ? (part / whole) * 100 : 0));
const hours = (value) => String(value).replace('.', ',');
const monthName = (month, style = 'long') => new Intl.DateTimeFormat('et-EE', { month: style, year: 'numeric' }).format(new Date(`${month}-15T12:00:00`));
const date = (iso) => (iso ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}` : '—');
const tone = (cents) => (cents < 0 ? 'is-down' : 'is-up');

function Breakdown({ title, rows, pay = false }) {
  if (!rows.length) return null;
  return <div className="br-table-wrap"><table className="br-table">
    <caption>{title}</caption>
    <thead><tr><th scope="col">{pay ? 'Õpetaja' : 'Aine'}</th><th scope="col">Toimunud</th><th scope="col">Puudumised</th><th scope="col">Kohalolek</th><th scope="col">Õpilasi</th><th scope="col">Tulu</th>
      {pay ? <><th scope="col">Tunde (h)</th><th scope="col">Tunnitasu</th><th scope="col">Õpetaja tasu</th><th scope="col">Koolile jääb</th></> : null}<th scope="col">Kalendris</th></tr></thead>
    <tbody>{rows.map((row) => <tr key={row.name}><th scope="row">{row.name}</th><td>{row.tookPlace}</td><td>{row.missed}</td><td>{row.attendance === null ? '—' : `${row.attendance}%`}</td><td>{row.students}</td><td>{money(row.earnedCents)}</td>
      {pay ? <><td>{hours(row.hours)}</td><td>{row.rateCents ? `${money(row.rateCents)}/h` : <span className="br-muted">määramata</span>}</td><td>{row.payCents === null ? '—' : money(row.payCents)}</td><td className="br-keep"><b>{money(row.schoolCents)}</b>{row.earnedCents > 0 && row.payCents !== null ? <small className="br-muted"> {Math.round((row.schoolCents / row.earnedCents) * 100)}%</small> : null}</td></> : null}
      <td>{row.planned ? `${row.planned} · ${money(row.plannedCents)}` : '—'}</td></tr>)}</tbody>
  </table></div>;
}

// „Kuhu raha läheb”: the period's revenue, what the teachers and the fixed costs take, what stays
function ProfitAndLoss({ report }) {
  const { pnl, monthly } = report;
  const current = monthly[monthly.length - 1];
  const revenue = pnl.revenueCents;
  const pay = share(pnl.teacherPayCents, revenue);
  const fixed = share(pnl.fixedCents, revenue);
  const profit = share(Math.abs(pnl.profitCents), revenue);
  return <div className="fd-panel br-pnl" role="region" aria-label="Kasum">
    <h3>Kuhu raha läheb <small>{monthly.length === 1 ? monthName(monthly[0].month) : `${monthName(monthly[0].month, 'short')} – ${monthName(current.month, 'short')}`}</small></h3>
    <dl className="br-lines">
      <div><dt>Tulu <small>toimunud ja tasulised tunnid</small></dt><dd className="br-bar"><i className="is-revenue" style={{ left: 0, width: revenue > 0 ? '100%' : 0 }} /></dd><dd>{money(revenue)}</dd></div>
      <div><dt>− Õpetajate tasu <small>{hours(pnl.hours)} h antud tunde</small></dt><dd className="br-bar"><i className="is-pay" style={{ left: `${100 - pay}%`, width: `${pay}%` }} /></dd><dd>−{money(pnl.teacherPayCents)}</dd></div>
      <div><dt>− Püsikulud{monthly.length > 1 ? <small> {monthly.length} kuud × {money(pnl.fixedMonthCents)}</small> : null}</dt><dd className="br-bar"><i className="is-fixed" style={{ left: `${Math.max(0, 100 - pay - fixed)}%`, width: `${Math.min(fixed, 100)}%` }} /></dd><dd>−{money(pnl.fixedCents)}</dd></div>
      <div className="br-total"><dt>= Kasum</dt><dd className="br-bar"><i className={pnl.profitCents < 0 ? 'is-loss' : 'is-profit'} style={{ left: 0, width: `${profit}%` }} /></dd><dd className={tone(pnl.profitCents)}>{signed(pnl.profitCents)}{pnl.marginPercent !== null ? <small> · {pnl.marginPercent}% tulust</small> : null}</dd></div>
    </dl>
    {pnl.fixedCosts.length ? <p className="form-hint">Püsikulud kuus: {pnl.fixedCosts.map((item) => `${item.label} ${money(item.cents)}`).join(', ')}.</p> : <p className="br-note is-warn">Püsikulud on lisamata — kasum on liiga suur. Lisa need allpool vahelehel „Püsikulud ja omanik”.</p>}
    {current.expectedCents !== undefined ? <p className="br-note">Kuu lõpuks kalendri järgi ({monthName(current.month)}): tulu <b>{money(current.expectedCents)}</b>, kasum <b className={tone(current.expectedProfitCents)}>{signed(current.expectedProfitCents)}</b>.</p> : null}
  </div>;
}

// „Kust raha tuleb”: by teacher (what stays with the school in each one's revenue), by subject, by lesson kind
function Sources({ report }) {
  const [view, setView] = useState('teachers');
  const views = [['teachers', 'Õpetajad'], ...(report.bySubject.length > 1 ? [['subjects', 'Ained']] : []), ...(report.kinds ? [['kinds', 'Tunni tüüp']] : [])];
  const total = report.now.earnedCents;
  const rows = view === 'teachers' ? report.byTeacher.filter((row) => row.earnedCents > 0).map((row) => ({ name: row.name, cents: row.earnedCents, keep: row.payCents === null ? null : row.schoolCents, note: row.name === report.pnl?.owner?.name ? ' omanik' : row.rateCents ? '' : ' tunnitasu määramata' }))
    : view === 'subjects' ? report.bySubject.filter((row) => row.earnedCents > 0).map((row) => ({ name: row.name, cents: row.earnedCents, lessons: row.tookPlace }))
      : [{ name: 'Individuaaltunnid', cents: report.kinds.individual.earnedCents, lessons: report.kinds.individual.lessons }, { name: 'Grupitunnid', cents: report.kinds.group.earnedCents, lessons: report.kinds.group.lessons }];
  const max = Math.max(...rows.map((row) => row.cents), 1);
  return <div className="fd-panel" role="region" aria-label="Kust raha tuleb">
    <h3>Kust raha tuleb <span className="br-switch" role="group" aria-label="Jaotus">{views.map(([id, label]) => <button key={id} type="button" aria-pressed={view === id} className={view === id ? 'is-active' : ''} onClick={() => setView(id)}>{label}</button>)}</span></h3>
    {view === 'teachers' ? <div className="fd-legend" aria-hidden="true"><span className="is-profit">Koolile jääb</span><span className="is-pay">Õpetaja tasu</span></div> : null}
    {rows.length ? rows.map((row) => <div className="br-source" key={row.name}>
      <span>{row.name}</span>
      <div className="br-source__bar" style={{ width: `${share(row.cents, max)}%` }}><i style={{ width: `${row.keep === undefined || row.keep === null ? 100 : share(row.keep, row.cents)}%` }} /></div>
      {view === 'teachers'
        ? <span className="br-source__sum"><b>{money(row.keep ?? row.cents)}</b><small>{row.keep === null ? row.note : ` ${Math.round(share(row.keep, row.cents))}%`} · tulu {money(row.cents)}</small></span>
        : <span className="br-source__sum"><b>{money(row.cents)}</b><small> {Math.round(share(row.cents, total))}% · {row.lessons} tundi</small></span>}
    </div>) : <p className="form-hint">Perioodis pole veel tulu.</p>}
  </div>;
}

// names with a link to the student's card; a long list opens with „Näita kõiki”
function Names({ list, linkOf, max = 8 }) {
  const [all, setAll] = useState(false);
  const shown = all ? list : list.slice(0, max);
  return <>{shown.map((name, index) => { const id = linkOf(name); return <span key={`${name}-${index}`}>{index ? ', ' : ''}{id ? <a href={`/students/${encodeURIComponent(id)}`} data-student-id={id}>{name}</a> : name}</span>; })}
    {list.length > max ? <> <button type="button" className="br-more" onClick={() => setAll(!all)}>{all ? 'Näita vähem' : `Näita kõiki (${list.length})`}</button></> : null}</>;
}

// „Vajab tegutsemist”: whom to call and what to fix — a work list, not errors (owner 2026-11-27)
function Attention({ report }) {
  const linkOf = studentLinks(report);
  const stake = atStakeCents(report);
  const { now } = report;
  // the owner has no hourly rate on purpose
  const unrated = report.pay.unrated.filter((name) => name !== report.pnl?.owner?.name);
  const items = [
    report.nothingAhead?.length ? { key: 'ahead', count: report.nothingAhead.length, title: 'Kalendris edasi tunde pole', names: report.nothingAhead, text: 'selle ja järgmise kuu kalendris pole ühtegi tundi', badge: stake ? `perioodis tõid ${money(stake)}` : '' } : null,
    report.quietStudents?.length ? { key: 'quiet', count: report.quietStudents.length, title: 'Ilma tulevase tunnita', names: report.quietStudents, text: 'kaart on aktiivne, eelmisel perioodil käisid, nüüd tunde pole ega ole kalendris' } : null,
    report.unpriced.length ? { key: 'unpriced', count: report.unpriced.length, title: 'Ilma hinnata', names: report.unpriced, text: 'nende tunnid ei lähe tulusse' } : null,
    now.unmarked ? { key: 'unmarked', count: now.unmarked, title: 'Märkimata tunnid', text: 'möödunud tunnid ilma märketa on loetud toimunuks' } : null,
    unrated.length ? { key: 'unrated', count: unrated.length, title: 'Tunnitasu määramata', text: `${unrated.join(', ')} — õpetaja tasu ei ole arvesse võetud („Palk ja kulud”)` } : null,
  ].filter(Boolean);
  const calm = [
    { key: 'new', count: report.newStudents.length, title: 'Uued õpilased', names: report.newStudents, tone: 'ok' },
    { key: 'lost', count: report.lostStudents.length, title: 'Lahkunud', names: report.lostStudents, text: 'kaart arhiveeritud, eelmisel perioodil käisid', tone: 'mute' },
  ];
  return <div className="fd-panel" role="region" aria-label="Vajab tegutsemist">
    <h3>Vajab tegutsemist <small>{items.length ? 'tähtsamad ees' : 'praegu pole midagi'}</small></h3>
    <ul className="br-todo">{[...items, ...calm].map((item) => <li key={item.key} data-testid={`br-todo-${item.key}`}>
      <span className={`br-todo__count ${item.tone ? `is-${item.tone}` : ''}`}>{item.count}</span>
      <div><b>{item.title}</b><p>{item.names?.length ? <><Names list={item.names} linkOf={linkOf} />{item.text ? ` — ${item.text}` : ''}</> : item.names ? 'pole' : item.text}</p></div>
      {item.badge ? <Badge tone="neutral">{item.badge}</Badge> : null}
    </li>)}</ul>
  </div>;
}

function Monthly({ rows }) {
  return <div className="br-table-wrap"><table className="br-table">
    <caption>Kuude kaupa</caption>
    <thead><tr><th scope="col">Kuu</th><th scope="col">Toimunud</th><th scope="col">Õpilasi</th><th scope="col">Kohalolek</th><th scope="col">Tulu</th><th scope="col">Õpetajad</th><th scope="col">Püsikulud</th><th scope="col">Kasum</th></tr></thead>
    <tbody>{rows.map((row) => <tr key={row.month}><th scope="row">{monthName(row.month, 'short')}</th><td>{row.tookPlace}</td><td>{row.students}</td><td>{row.attendance === null ? '—' : `${row.attendance}%`}</td><td>{money(row.earnedCents)}</td><td>−{money(row.payCents)}</td><td>−{money(row.fixedCents)}</td><td className={tone(row.profitCents)}><b>{signed(row.profitCents)}</b></td></tr>)}</tbody>
  </table></div>;
}

function Students({ report }) {
  const rows = report.studentRows;
  if (!rows.length) return <p className="form-hint">Perioodis pole õpilasi.</p>;
  return <>{report.topTenShare !== null ? <p className="form-hint">10 suurimat annavad {report.topTenShare}% tulust.</p> : null}
    <div className="br-table-wrap"><table className="br-table">
      <thead><tr><th scope="col">Õpilane</th><th scope="col">Õpetaja</th><th scope="col">Aine</th><th scope="col">Toimunud</th><th scope="col">Puudumised</th><th scope="col">Kohalolek</th><th scope="col">Tulu</th><th scope="col">Tunni hind</th><th scope="col">Viimane tund</th><th scope="col">Edasi kalendris</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}><th scope="row"><a href={`/students/${encodeURIComponent(row.id)}`} data-student-id={row.id}>{row.name}</a></th><td>{row.teachers}</td><td>{row.subjects}</td><td>{row.tookPlace}</td><td>{row.missed}</td><td>{row.attendance === null ? '—' : `${row.attendance}%`}</td><td>{money(row.earnedCents)}</td><td>{row.perLessonCents ? money(row.perLessonCents) : '—'}</td><td>{date(row.lastLesson)}</td><td>{row.planned ? 'jah' : <span className="br-warn-text">ei</span>}</td></tr>)}</tbody>
    </table></div></>;
}

function SettingsEditor({ settings, teachers, onSave }) {
  const [costs, setCosts] = useState(() => (settings?.fixedCosts?.length ? settings.fixedCosts : [{ label: '', cents: 0 }]).map((item) => ({ label: item.label, euros: item.cents ? String(item.cents / 100) : '' })));
  const [owner, setOwner] = useState(settings?.ownerTeacher || '');
  const [rate, setRate] = useState(settings?.ownerRateCents ? String(settings.ownerRateCents / 100) : '');
  const [state, setState] = useState('');
  const cents = (value) => Math.round(Number(String(value || '').replace(',', '.')) * 100) || 0;
  const save = async (event) => {
    event.preventDefault();
    setState('saving');
    try {
      await onSave({ fixedCosts: costs.map((item) => ({ label: item.label, cents: cents(item.euros) })), ownerTeacher: owner, ownerRateCents: cents(rate) });
      setState('Salvestatud.');
    } catch (error) { setState(error.message || 'Ei saanud salvestada.'); }
  };
  const set = (index, patch) => setCosts((list) => list.map((item, at) => (at === index ? { ...item, ...patch } : item)));
  return <div>
    {onSave ? <form className="br-settings" onSubmit={save}>
      <p className="form-hint">Kooli igakuised püsikulud (ruum, administraator, programmid …) ja kelle tunnid on omaniku omad. Ainult administraator näeb ja muudab.</p>
      {costs.map((item, index) => <div className="br-cost" key={index}>
        <input className="field__input" aria-label={`Kulu ${index + 1} nimetus`} placeholder="Nt Ruum" value={item.label} onChange={(event) => set(index, { label: event.target.value })} />
        <input className="field__input" aria-label={`Kulu ${index + 1} summa eurodes`} placeholder="€ kuus" inputMode="decimal" value={item.euros} onChange={(event) => set(index, { euros: event.target.value })} />
        <button type="button" className="br-icon" aria-label={`Eemalda kulu ${index + 1}`} onClick={() => setCosts((list) => list.filter((_, at) => at !== index))}><Trash2 size={15} /></button>
      </div>)}
      <button type="button" className="br-add" onClick={() => setCosts((list) => [...list, { label: '', euros: '' }])}><Plus size={15} /> Lisa kulu</button>
      <label className="br-field"><span>Omaniku tunnid (õpetaja)</span>
        <select className="field__input" value={owner} onChange={(event) => setOwner(event.target.value)}><option value="">— pole —</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.name}>{teacher.name}</option>)}</select>
      </label>
      <label className="br-field"><span>Omaniku võrdlustunnitasu (€/h, valikuline)</span><input className="field__input" inputMode="decimal" value={rate} onChange={(event) => setRate(event.target.value)} /></label>
      <button type="submit" className="br-save" disabled={state === 'saving'}>Salvesta</button>
      {state && state !== 'saving' ? <span role="status" className="br-muted"> {state}</span> : null}
    </form> : <p className="form-hint">Muuta saab administraator.</p>}
  </div>;
}

// the lessons of the period by outcome and the per-lesson, per-student numbers
function Numbers({ report, tiles }) {
  const { now, before, change } = report;
  return <>
    <div className="br-grid">
      <div className="br-card"><span>Toimunud tunde</span><strong>{now.tookPlace}</strong><small>{delta(change.tookPlace) || `eelmisel perioodil ${before.tookPlace}`}</small></div>
      <div className="br-card"><span>Kohalolek</span><strong>{now.attendance === null ? '—' : `${now.attendance}%`}</strong><small>{before.attendance === null ? 'tundidest, mis pidid toimuma' : `eelmisel perioodil ${before.attendance}%`}</small></div>
      <div className="br-card"><span>Aktiivseid õpilasi</span><strong>{now.students}</strong><small>{delta(change.students) || `${report.plannedStudents ? `+ ${report.plannedStudents} kalendris · ` : ''}eelmisel perioodil ${before.students}`}</small></div>
      <div className="br-card"><span>Keskmine tunnihind</span><strong>{money(now.perLessonCents)}</strong><small>tulu tasulise tunni kohta</small></div>
      <div className="br-card"><span>Tulu õpilase kohta</span><strong>{money(now.perStudentCents)}</strong><small>{before.perStudentCents ? `eelmisel perioodil ${money(before.perStudentCents)}` : 'perioodi kohta'}</small></div>
      {report.pnl ? <div className="br-card"><span>Tulu tunnis</span><strong>{money(report.pnl.revenuePerHourCents)}</strong><small>kõik õpetajad</small></div> : null}
      <div className="br-card"><span>Õpetajate tasu</span><strong>{money(report.pay.payCents)}</strong><small>tunnitasu järgi</small></div>
      <div className="br-card"><span>Tulu − õpetajate tasu</span><strong>{money(report.pay.schoolCents)}</strong><small>enne püsikulusid</small></div>
      <div className="br-card br-card--forecast"><span>Kalendris veel</span><strong>{now.planned}</strong><small>tundi · {money(now.plannedCents)}</small></div>
      {tiles.map((tile) => <div className={`br-card ${tile.forecast ? 'br-card--forecast' : ''}`} key={tile.label}><span>{tile.label}</span><strong>{tile.value}</strong><small>{tile.hint}</small></div>)}
    </div>
    <ul className="br-states" aria-label="Tundide jaotus">
      <li><b>{now.held}</b> märgitud toimunuks</li>
      <li className={now.unmarked ? 'is-warn' : ''}><b>{now.unmarked}</b> märkimata (loetud toimunuks)</li>
      <li><b>{now.absentCharged}</b> tasuline puudumine</li>
      <li><b>{now.absentNotified}</b> ette teatatud puudumine</li>
      {now.absentFree ? <li><b>{now.absentFree}</b> puudumine ilma tasuta</li> : null}
      <li><b>{now.cancelled}</b> ära jäetud</li>
      {now.covered ? <li><b>{now.covered}</b> kooli kulul</li> : null}
      {report.kinds ? <><li><b>{report.kinds.individual.lessons}</b> individuaaltundi · {money(report.kinds.individual.earnedCents)}</li><li><b>{report.kinds.group.lessons}</b> grupitundi · {money(report.kinds.group.earnedCents)}</li></> : null}
    </ul>
  </>;
}

/**
 * „Ärinäitajad” under the revenue chart (owner 2026-10-27: „максимально подробная информация о доходах и всему
 * прочему, чтобы я понимал состояние дел школы”; 2026-11-27: „выглядит вообще не понятно” → the same numbers in a
 * clearer order): where the money goes, where it comes from, the work list, and every table one click away in tabs.
 * `tiles`: more numbers of the card above for the „Tunnid ja arvud” tab ({ label, value, hint, forecast }).
 */
export default function BusinessReport({ report, settings = null, teachers = [], onSaveSettings = null, tiles = [] }) {
  const [tab, setTab] = useState('teachers');
  if (!report) return null;
  const tabs = [
    ['teachers', 'Õpetajad'],
    ...(report.bySubject.length > 1 ? [['subjects', 'Ained']] : []),
    ['students', `Õpilased (${report.studentRows?.length || 0})`],
    ...(report.monthly?.length > 1 ? [['monthly', 'Kuude kaupa']] : []),
    ['numbers', 'Tunnid ja arvud'],
    ['settings', 'Püsikulud ja omanik'],
    ['rules', 'Kuidas arvestatakse'],
  ];
  const open = tabs.some(([key]) => key === tab) ? tab : 'teachers';
  return <div className="br" role="region" aria-label="Ärinäitajad">
    <h3 className="br-title"><Activity size={18} aria-hidden="true" /> Ärinäitajad</h3>
    <div className="fd-split fd-split--even">
      {report.pnl ? <ProfitAndLoss report={report} /> : null}
      <Sources report={report} />
    </div>
    <Attention report={report} />
    <div className="fd-panel">
      {/* a button group, not ARIA tabs: the page above has its own tab list (Arved / Makstud …) */}
      <div className="br-tabs" role="group" aria-label="Üksikasjad">{tabs.map(([key, label]) => <button key={key} type="button" aria-pressed={open === key} className={open === key ? 'is-active' : ''} onClick={() => setTab(key)}>{label}</button>)}</div>
      <div className="br-tabpanel">
        {open === 'teachers' ? <><Breakdown title="Õpetajad" rows={report.byTeacher} pay />
          <p className="form-hint">Õpetaja tasu = antud tunnid (ka tasuline puudumine; grupitund üks kord) × tunnitasu „Palk ja kulud” lehelt. Koolile jääb = tulu − õpetaja tasu.{report.pay.unrated.length ? ` Tunnitasu määramata: ${report.pay.unrated.join(', ')}.` : ''}</p></> : null}
        {open === 'subjects' ? <Breakdown title="Ained" rows={report.bySubject} /> : null}
        {open === 'students' ? <Students report={report} /> : null}
        {open === 'monthly' ? <Monthly rows={report.monthly} /> : null}
        {open === 'numbers' ? <Numbers report={report} tiles={tiles} /> : null}
        {open === 'settings' ? <SettingsEditor key={JSON.stringify(settings || {})} settings={settings} teachers={teachers.filter((teacher) => teacher.role === 'teacher' || teacher.roles?.includes?.('teacher'))} onSave={onSaveSettings} /> : null}
        {open === 'rules' ? <p className="form-hint">Arvestus käib kalendri tundide järgi, mitte arvete järgi (raamatupidamine on eraldi): toimunud = märgitud „Toimunud” või tasuline puudumine, ka märkimata möödunud tund; ära jäetud ja ette teatatud puudumised ei lähe arvesse. Hind = õpilase tunnihind tunni pikkuse järgi. Kasum = tulu − õpetajate tasu − püsikulud. Tulu võrdlus eelmise kuuga loeb jooksva kuu koos kalendris olevate tundidega.</p> : null}
      </div>
    </div>
  </div>;
}
