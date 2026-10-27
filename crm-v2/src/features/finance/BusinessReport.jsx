import { Activity } from 'lucide-react';

const money = (cents) => new Intl.NumberFormat('et-EE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(Number(cents || 0) / 100));
const delta = (value, label = 'eelmise perioodiga') => (value === null || value === undefined ? null : <em className={value >= 0 ? 'is-up' : 'is-down'}>{value > 0 ? '+' : ''}{value}% {label}</em>);
const names = (list, max = 8) => (list.length > max ? `${list.slice(0, max).join(', ')} ja veel ${list.length - max}` : list.join(', '));

function Breakdown({ title, rows, pay = false }) {
  if (!rows.length) return null;
  return <div className="br-table-wrap"><table className="br-table">
    <caption>{title}</caption>
    <thead><tr><th scope="col">{pay ? 'Õpetaja' : 'Aine'}</th><th scope="col">Toimunud</th><th scope="col">Puudumised</th><th scope="col">Kohalolek</th><th scope="col">Õpilasi</th><th scope="col">Tulu</th>
      {pay ? <><th scope="col">Tunde (h)</th><th scope="col">Tunnitasu</th><th scope="col">Õpetaja tasu</th><th scope="col">Koolile jääb</th></> : null}<th scope="col">Kalendris</th></tr></thead>
    <tbody>{rows.map((row) => <tr key={row.name}><th scope="row">{row.name}</th><td>{row.tookPlace}</td><td>{row.missed}</td><td>{row.attendance === null ? '—' : `${row.attendance}%`}</td><td>{row.students}</td><td>{money(row.earnedCents)}</td>
      {pay ? <><td>{String(row.hours).replace('.', ',')}</td><td>{row.rateCents ? `${money(row.rateCents)}/h` : <span className="br-muted">määramata</span>}</td><td>{row.payCents === null ? '—' : money(row.payCents)}</td><td><b>{money(row.schoolCents)}</b>{row.earnedCents > 0 && row.payCents !== null ? <small className="br-muted"> {Math.round((row.schoolCents / row.earnedCents) * 100)}%</small> : null}</td></> : null}
      <td>{row.planned ? `${row.planned} · ${money(row.plannedCents)}` : '—'}</td></tr>)}</tbody>
  </table></div>;
}

/**
 * „Ärinäitajad” under the revenue chart (owner 2026-10-27: „больше информации по кол-ву проведённых уроков и
 * отчётности, которая может следить за состоянием бизнеса в целом”): the lessons of the chosen period by what happened
 * to them, attendance, students (new, lost), the average per lesson and per student, by teacher and by subject.
 */
export default function BusinessReport({ report }) {
  if (!report) return null;
  const { now, before, change } = report;
  return <div className="br" role="region" aria-label="Ärinäitajad">
    <h3><Activity size={18} aria-hidden="true" /> Ärinäitajad</h3>
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
    <ul className="br-states" aria-label="Tundide jaotus">
      <li><b>{now.held}</b> märgitud toimunuks</li>
      <li className={now.unmarked ? 'is-warn' : ''}><b>{now.unmarked}</b> märkimata (loetud toimunuks)</li>
      <li><b>{now.absentCharged}</b> tasuline puudumine</li>
      <li><b>{now.absentNotified}</b> ette teatatud puudumine</li>
      {now.absentFree ? <li><b>{now.absentFree}</b> puudumine ilma tasuta</li> : null}
      <li><b>{now.cancelled}</b> ära jäetud</li>
      {now.covered ? <li><b>{now.covered}</b> kooli kulul</li> : null}
    </ul>
    <div className="br-people">
      <p><b>Uued õpilased ({report.newStudents.length}):</b> {report.newStudents.length ? names(report.newStudents) : 'pole'}</p>
      <p className={report.lostStudents.length ? 'is-warn' : ''}><b>Lahkunud ({report.lostStudents.length}):</b> {report.lostStudents.length ? `${names(report.lostStudents)} — eelmisel perioodil käisid, nüüd tunde pole ega ole kalendris` : 'pole'}</p>
      {report.unpriced.length ? <p className="is-warn"><b>Ilma hinnata ({report.unpriced.length}):</b> {names(report.unpriced)} — nende tunnid ei lähe tulusse</p> : null}
    </div>
    <Breakdown title="Õpetajad" rows={report.byTeacher} pay />
    <p className="form-hint">Õpetaja tasu = antud tunnid (ka tasuline puudumine; grupitund üks kord) × tunnitasu „Palk ja kulud” lehelt. Koolile jääb = tulu − õpetaja tasu.{report.pay.unrated.length ? ` Tunnitasu määramata: ${report.pay.unrated.join(', ')}.` : ''}</p>
    {report.bySubject.length > 1 ? <Breakdown title="Ained" rows={report.bySubject} /> : null}
  </div>;
}
