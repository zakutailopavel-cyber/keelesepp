import { CalendarClock, Copy, Search, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/index.js';
import { candidateTimes, hasTimes, timesLine, usualDuration, usualOnline } from './studentTimesModel.js';
import { perWeekText } from '../availability-poll/pollModel.js';
import { subjectsOf } from '../students/subjects.js';

const dayLabel = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'numeric' });

// „Sobivad ajad” over the calendar (owner 2026-10-24): pick students → their suitable half hours are shaded on the grid
// next to the teacher's windows and lessons; for one student and a teacher the free lesson times of the shown week are
// listed, a click opens the usual „Uus tund” form prefilled (nothing is saved here).
export default function StudentTimesPanel({ students = [], availabilityById = new Map(), loading = false, unplanned = [], selected = [], onSelect, teacher = null, teachers = null, onTeacher, teacherAvailability = null, events = [], dates = [], rooms = [], bookings = [], onPick, onClose, now }) {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState({});
  const picked = selected.map((id) => students.find((student) => student.id === id)).filter(Boolean);
  const single = picked.length === 1 ? picked[0] : null;
  const timesOf = (id) => availabilityById.get(id) || null;
  // how often the learner wants lessons (team 2026-10-29): „2× nädalas” next to the name
  const perWeekOf = (student) => { const text = perWeekText(timesOf(student.id)?.perWeek, subjectsOf(student)); return text ? <em className="cal2-fit__per-week"> · {text}</em> : null; };
  const normalized = query.trim().toLocaleLowerCase('et');
  const matches = normalized ? students.filter((student) => !selected.includes(student.id) && String(student.name || '').toLocaleLowerCase('et').includes(normalized)).slice(0, 8) : [];
  const add = (student) => { onSelect([...selected, student.id], student); setQuery(''); setOptions({}); };
  const remove = (id) => { onSelect(selected.filter((item) => item !== id)); setOptions({}); };

  const duration = Number(options.duration) || (single ? usualDuration(events, single.id, teacher?.uid || '') : 60);
  const online = options.online ?? (single ? Boolean(usualOnline(events, single.id)) : false);
  const recurring = options.recurring ?? true;
  const candidates = single && teacher ? candidateTimes({
    studentId: single.id, studentAvailability: timesOf(single.id), teacherUid: teacher.uid, teacherName: teacher.name, teacherAvailability,
    events, dates, duration, online, recurring, rooms, bookings, now,
  }) : [];
  const byDay = dates.map((date) => ({ date, items: candidates.filter((item) => item.date === date).sort((a, b) => a.time.localeCompare(b.time)) })).filter((day) => day.items.length);
  const copyLink = async () => {
    const link = `${globalThis.location?.origin || ''}/ajad`;
    try { await globalThis.navigator?.clipboard?.writeText(link); setOptions((current) => ({ ...current, copied: true })); } catch { globalThis.prompt?.('Kopeeri link', link); }
  };
  const missing = (student) => (
    <span className="cal2-fit__missing">Sobivad ajad puuduvad · <Link to={`/students/${student.id}#sobivad-ajad`}>ava kaart</Link> · <button type="button" className="link-button" onClick={copyLink}><Copy size={12} /> {options.copied ? 'link kopeeritud' : 'kopeeri /ajad link'}</button></span>
  );

  return (
    <section className="cal2-fit" role="region" aria-label="Sobivad ajad">
      <div className="cal2-fit__head">
        <strong><CalendarClock size={16} /> Sobivad ajad</strong>
        <label className="cal2-fit__search"><Search size={15} /><input aria-label="Lisa õpilane" placeholder="Lisa õpilane…" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && matches[0]) { event.preventDefault(); add(matches[0]); } }} /></label>
        {teachers && onTeacher ? <select className="cal2-select" aria-label="Õpetaja, kelle aegu näidata" value={teacher?.uid || ''} onChange={(event) => onTeacher(event.target.value)}><option value="">Vali õpetaja…</option>{teachers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select> : null}
        <Button variant="secondary" onClick={onClose}>Sulge</Button>
      </div>
      {matches.length ? <ul className="cal2-fit__matches" aria-label="Leitud õpilased">{matches.map((student) => <li key={student.id}><button type="button" onClick={() => add(student)}><strong>{student.name}</strong><small>{hasTimes(timesOf(student.id)) ? timesLine(timesOf(student.id)) : 'sobivad ajad puuduvad'}</small></button></li>)}</ul> : null}

      {picked.length ? <ul className="cal2-fit__picked" aria-label="Valitud õpilased">{picked.map((student) => (
        <li key={student.id}>
          <span><strong>{student.name}</strong>{perWeekOf(student)}{hasTimes(timesOf(student.id)) ? <small>{timesLine(timesOf(student.id))}</small> : loading ? <small>Laen…</small> : missing(student)}</span>
          <button type="button" aria-label={`Eemalda ${student.name}`} onClick={() => remove(student.id)}><X size={14} /></button>
        </li>
      ))}</ul> : <p className="form-hint">Vali õpilane (või mitu, nt grupi jaoks): tema sobivad ajad värvitakse kalendris. Õpetaja ajad ja tunnid on näha samal ajal.</p>}

      <p className="cal2-legend cal2-fit__legend"><i className="cal2-dot is-fit-best" /> ★ sobib kõige paremini <i className="cal2-dot is-fit-ok" /> sobib{picked.length > 1 ? <> <i className="cal2-dot is-fit-some" /> sobib osadele</> : null} <i className="cal2-dot is-fit-taken" /> õpilasel teine tund · õpetaja: <i className="cal2-dot is-free" /> vaba <i className="cal2-dot is-online" /> ainult veeb <i className="cal2-dot is-busy" /> hõivatud</p>

      {single && hasTimes(timesOf(single.id)) ? (teacher ? <div className="cal2-fit__candidates">
        <div className="cal2-fit__options">
          <strong>Vabad tunniajad: {single.name} + {teacher.name}</strong>
          <label>Kestus <select aria-label="Tunni kestus" value={duration} onChange={(event) => setOptions({ ...options, duration: Number(event.target.value) })}>{[...new Set([30, 45, 60, 75, 90, duration])].sort((a, b) => a - b).map((value) => <option key={value} value={value}>{value} min</option>)}</select></label>
          <label><input type="checkbox" checked={online} onChange={(event) => setOptions({ ...options, online: event.target.checked })} /> Veebitund</label>
          <label><input type="checkbox" checked={recurring} onChange={(event) => setOptions({ ...options, recurring: event.target.checked })} /> Kordub igal nädalal</label>
        </div>
        {byDay.length ? <ul aria-label="Vabad tunniajad">{byDay.map((day) => (
          <li key={day.date}><b>{dayLabel(day.date)}</b>{day.items.map((item) => (
            <button type="button" key={item.time} className={`cal2-fit__slot is-${item.student} is-teacher-${item.teacher}`} title={`${item.time}–${item.end}${item.student === 'best' ? ' · õpilasele sobib kõige paremini' : ''}${item.teacher === 'free' ? ' · õpetaja vaba aeg' : item.teacher === 'online' ? ' · õpetajal ainult veebitunnid' : ''}`} onClick={() => onPick({ date: item.date, time: item.time, duration, online, recurring, studentId: single.id, teacherUid: teacher.uid })}>
              {item.student === 'best' ? '★ ' : ''}{item.time}
            </button>
          ))}</li>
        ))}</ul> : <p className="form-hint">Sel nädalal ühist vaba aega ei leitud. Vaata järgmist nädalat, muuda kestust või vali teine õpetaja.</p>}
        <p className="form-hint">Arvestatud: õpilase sobivad ajad, õpetaja punased ja kollased ajad, õpetaja ja õpilase teised tunnid (ka grupid){recurring ? ' järgmisel 4 nädalal' : ''}{online ? '' : ', vaba kabinet'}. Klõps avab „Uus tund” vormi — salvestad ise.</p>
      </div> : <p className="form-hint">Vali õpetaja, et näha vabu tunniaegu.</p>) : null}

      {unplanned.length ? <details className="cal2-fit__unplanned" open={!picked.length}>
        <summary>Planeerimata õpilased ({unplanned.length})</summary>
        <ul>{unplanned.map(({ student }) => (
          <li key={student.id}>
            <button type="button" disabled={selected.includes(student.id)} onClick={() => add(student)}><strong>{student.name}</strong>{perWeekOf(student)}</button>
            {hasTimes(timesOf(student.id)) ? <small>{timesLine(timesOf(student.id))}</small> : loading ? <small>Laen…</small> : missing(student)}
          </li>
        ))}</ul>
      </details> : null}
    </section>
  );
}
