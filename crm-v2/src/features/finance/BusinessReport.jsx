import { Activity, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(Number(cents || 0) / 100));
const signed = (cents) => (cents < 0 ? `−${money(-cents)}` : money(cents));
const delta = (value, label = 'eelmise perioodiga') => (value === null || value === undefined ? null : <em className={value >= 0 ? 'is-up' : 'is-down'}>{value > 0 ? '+' : ''}{value}% {label}</em>);
const names = (list, max = 8) => (list.length > max ? `${list.slice(0, max).join(', ')} ja veel ${list.length - max}` : list.join(', '));
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
      {pay ? <><td>{hours(row.hours)}</td><td>{row.rateCents ? `${money(row.rateCents)}/h` : <span className="br-muted">määramata</span>}</td><td>{row.payCents === null ? '—' : money(row.payCents)}</td><td><b>{money(row.schoolCents)}</b>{row.earnedCents > 0 && row.payCents !== null ? <small className="br-muted"> {Math.round((row.schoolCents / row.earnedCents) * 100)}%</small> : null}</td></> : null}
      <td>{row.planned ? `${row.planned} · ${money(row.plannedCents)}` : '—'}</td></tr>)}</tbody>
  </table></div>;
}

// the school's profit and loss for the period, with the owner's own lessons and the break-even point
function ProfitAndLoss({ report }) {
  const { pnl, monthly, forecast } = report;
  const current = monthly[monthly.length - 1];
  const noCosts = !pnl.fixedMonthCents;
  return <div className="br-pnl" role="region" aria-label="Kasum">
    <h4>Kasum ja kahjum · {monthly.length === 1 ? monthName(monthly[0].month) : `${monthName(monthly[0].month, 'short')} – ${monthName(current.month, 'short')}`}</h4>
    <dl className="br-lines">
      <div><dt>Tulu (toimunud ja tasulised tunnid)</dt><dd>{money(pnl.revenueCents)}</dd></div>
      <div><dt>− Õpetajate tasu ({hours(pnl.hours)} h antud tunde)</dt><dd>−{money(pnl.teacherPayCents)}</dd></div>
      <div><dt>− Püsikulud{monthly.length > 1 ? ` (${monthly.length} kuud × ${money(pnl.fixedMonthCents)})` : ''}{pnl.fixedCosts.length ? <small> · {pnl.fixedCosts.map((item) => `${item.label} ${money(item.cents)}`).join(', ')} kuus</small> : null}</dt><dd>−{money(pnl.fixedCents)}</dd></div>
      <div className="br-total"><dt>= Kasum</dt><dd className={tone(pnl.profitCents)}>{signed(pnl.profitCents)}{pnl.marginPercent !== null ? <small> · {pnl.marginPercent}% tulust</small> : null}</dd></div>
    </dl>
    {noCosts ? <p className="br-note is-warn">Püsikulud on lisamata — kasum on liiga suur. Lisa need allpool „Püsikulud ja omanik”.</p> : null}
    {current.expectedCents !== undefined ? <p className="br-note">Kuu lõpuks kalendri järgi ({monthName(current.month)}): tulu <b>{money(current.expectedCents)}</b>, kasum <b className={tone(current.expectedProfitCents)}>{signed(current.expectedProfitCents)}</b>.</p> : null}
    {pnl.owner ? <p className="br-note">
      <b>{pnl.owner.name} (omanik) tunnid:</b> {money(pnl.owner.earnedCents)} ({pnl.owner.share ?? 0}% tulust), {hours(pnl.owner.hours)} h. Ilma nende tundideta jääks koolile <b className={tone(pnl.owner.withoutOwnerCents)}>{signed(pnl.owner.withoutOwnerCents)}</b>.
      {pnl.owner.profitAfterOwnerPayCents !== null ? <> Kui maksta omanikule {money(pnl.owner.rateCents)}/h ({money(pnl.owner.payAtRateCents)}), on kasum <b className={tone(pnl.owner.profitAfterOwnerPayCents)}>{signed(pnl.owner.profitAfterOwnerPayCents)}</b>.</> : null}
    </p> : null}
    {pnl.breakEven ? <p className="br-note">
      <b>Tasuvuspunkt:</b> palgaliste õpetajate tund jätab koolile keskmiselt {money(pnl.breakEven.marginPerHourCents)}. Püsikulude ({money(pnl.fixedMonthCents)} kuus) katmiseks on vaja <b>{pnl.breakEven.hoursNeededPerMonth} h</b> nende tunde kuus; praegu antakse <b className={pnl.breakEven.hoursPerMonthNow >= pnl.breakEven.hoursNeededPerMonth ? 'is-up' : 'is-down'}>{hours(pnl.breakEven.hoursPerMonthNow)} h</b> kuus.
    </p> : null}
    <p className="br-note"><b>Keskmiselt:</b> tulu {money(pnl.revenuePerHourCents)} tunnis (kõik õpetajad).</p>
    <p className="br-note br-forecast"><b>Järgmine kuu ({monthName(forecast.month)}) kalendri järgi:</b> {forecast.lessons} tundi, tulu {money(forecast.revenueCents)}, õpetajad −{money(forecast.teacherPayCents)}, püsikulud −{money(forecast.fixedCents)} → kasum <b className={tone(forecast.profitCents)}>{signed(forecast.profitCents)}</b>. <span className="br-muted">Kalender ei pruugi olla veel täis.</span></p>
  </div>;
}

function Monthly({ rows }) {
  if (rows.length < 2) return null;
  return <div className="br-table-wrap"><table className="br-table">
    <caption>Kuude kaupa</caption>
    <thead><tr><th scope="col">Kuu</th><th scope="col">Toimunud</th><th scope="col">Õpilasi</th><th scope="col">Kohalolek</th><th scope="col">Tulu</th><th scope="col">Õpetajad</th><th scope="col">Püsikulud</th><th scope="col">Kasum</th></tr></thead>
    <tbody>{rows.map((row) => <tr key={row.month}><th scope="row">{monthName(row.month, 'short')}</th><td>{row.tookPlace}</td><td>{row.students}</td><td>{row.attendance === null ? '—' : `${row.attendance}%`}</td><td>{money(row.earnedCents)}</td><td>−{money(row.payCents)}</td><td>−{money(row.fixedCents)}</td><td className={tone(row.profitCents)}><b>{signed(row.profitCents)}</b></td></tr>)}</tbody>
  </table></div>;
}

function Students({ report }) {
  const rows = report.studentRows;
  if (!rows.length) return null;
  return <details className="br-details">
    <summary>Õpilased ({rows.length}){report.topTenShare !== null ? ` · 10 suurimat annavad ${report.topTenShare}% tulust` : ''}</summary>
    <div className="br-table-wrap"><table className="br-table">
      <thead><tr><th scope="col">Õpilane</th><th scope="col">Õpetaja</th><th scope="col">Aine</th><th scope="col">Toimunud</th><th scope="col">Puudumised</th><th scope="col">Kohalolek</th><th scope="col">Tulu</th><th scope="col">Tunni hind</th><th scope="col">Viimane tund</th><th scope="col">Edasi kalendris</th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}><th scope="row"><a href={`/students/${encodeURIComponent(row.id)}`} data-student-id={row.id}>{row.name}</a></th><td>{row.teachers}</td><td>{row.subjects}</td><td>{row.tookPlace}</td><td>{row.missed}</td><td>{row.attendance === null ? '—' : `${row.attendance}%`}</td><td>{money(row.earnedCents)}</td><td>{row.perLessonCents ? money(row.perLessonCents) : '—'}</td><td>{date(row.lastLesson)}</td><td>{row.planned ? 'jah' : <span className="br-warn-text">ei</span>}</td></tr>)}</tbody>
    </table></div>
  </details>;
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
  return <details className="br-details">
    <summary>Püsikulud ja omanik</summary>
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
  </details>;
}

/**
 * „Ärinäitajad” under the revenue chart (owner 2026-10-27: „больше информации по кол-ву проведённых уроков и
 * отчётности, которая может следить за состоянием бизнеса в целом”; then: „максимально подробная информация о доходах
 * и всему прочему, чтобы я понимал состояние дел школы”): profit and loss with the fixed costs, the owner's own
 * lessons and the break-even point, month by month, lessons by outcome, students, teachers, subjects, the next month.
 */
export default function BusinessReport({ report, settings = null, teachers = [], onSaveSettings = null }) {
  if (!report) return null;
  const { now, before, change } = report;
  return <div className="br" role="region" aria-label="Ärinäitajad">
    <h3><Activity size={18} aria-hidden="true" /> Ärinäitajad</h3>
    {report.pnl ? <ProfitAndLoss report={report} /> : null}
    <div className="br-grid">
      <div className="br-card"><span>Toimunud tunde</span><strong>{now.tookPlace}</strong><small>{delta(change.tookPlace) || `eelmisel perioodil ${before.tookPlace}`}</small></div>
      <div className="br-card"><span>Kohalolek</span><strong>{now.attendance === null ? '—' : `${now.attendance}%`}</strong><small>{before.attendance === null ? 'tundidest, mis pidid toimuma' : `eelmisel perioodil ${before.attendance}%`}</small></div>
      <div className="br-card"><span>Aktiivseid õpilasi</span><strong>{now.students}</strong><small>{delta(change.students) || `eelmisel perioodil ${before.students}`}</small></div>
      <div className="br-card"><span>Keskmine tunnihind</span><strong>{money(now.perLessonCents)}</strong><small>tulu tasulise tunni kohta</small></div>
      <div className="br-card"><span>Tulu õpilase kohta</span><strong>{money(now.perStudentCents)}</strong><small>{before.perStudentCents ? `eelmisel perioodil ${money(before.perStudentCents)}` : 'perioodi kohta'}</small></div>
      <div className="br-card"><span>Õpetajate tasu</span><strong>{money(report.pay.payCents)}</strong><small>tunnitasu järgi</small></div>
      <div className="br-card"><span>Koolile jääb</span><strong>{money(report.pay.schoolCents)}</strong><small>tulu − õpetajate tasu</small></div>
      <div className="br-card br-card--forecast"><span>Kalendris veel</span><strong>{now.planned}</strong><small>tundi · {money(now.plannedCents)}</small></div>
    </div>
    {report.monthly ? <Monthly rows={report.monthly} /> : null}
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
    <div className="br-people">
      <p><b>Uued õpilased ({report.newStudents.length}):</b> {report.newStudents.length ? names(report.newStudents) : 'pole'}</p>
      <p className={report.lostStudents.length ? 'is-warn' : ''}><b>Lahkunud ({report.lostStudents.length}):</b> {report.lostStudents.length ? `${names(report.lostStudents)} — eelmisel perioodil käisid, nüüd tunde pole ega ole kalendris` : 'pole'}</p>
      {report.nothingAhead?.length ? <p className="is-warn"><b>Kalendris edasi tunde pole ({report.nothingAhead.length}):</b> {names(report.nothingAhead, 12)} — selle ja järgmise kuu kalendris pole ühtegi tundi</p> : null}
      {report.unpriced.length ? <p className="is-warn"><b>Ilma hinnata ({report.unpriced.length}):</b> {names(report.unpriced)} — nende tunnid ei lähe tulusse</p> : null}
    </div>
    <Breakdown title="Õpetajad" rows={report.byTeacher} pay />
    <p className="form-hint">Õpetaja tasu = antud tunnid (ka tasuline puudumine; grupitund üks kord) × tunnitasu „Palk ja kulud” lehelt. Koolile jääb = tulu − õpetaja tasu.{report.pay.unrated.length ? ` Tunnitasu määramata: ${report.pay.unrated.join(', ')}.` : ''}</p>
    {report.bySubject.length > 1 ? <Breakdown title="Ained" rows={report.bySubject} /> : null}
    <Students report={report} />
    <SettingsEditor key={JSON.stringify(settings || {})} settings={settings} teachers={teachers.filter((teacher) => teacher.role === 'teacher' || teacher.roles?.includes?.('teacher'))} onSave={onSaveSettings} />
  </div>;
}
