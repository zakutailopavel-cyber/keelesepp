import { ChevronLeft, ChevronRight, Eraser } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { Button, Modal } from '../../components/ui/index.js';
import { shiftDate } from './calendarView.js';
import { HALVES, WEEK_DAYS, cellKey, cellsFromSlots, changedDays, clashOf, clock, datedSlots, lessonCells, outsideGrid, slotsFromCells, studentCells } from './teacherWeekModel.js';

const DAY_SHORT = { Mon: 'E', Tue: 'T', Wed: 'K', Thu: 'N', Fri: 'R', Sat: 'L', Sun: 'P' };
const DAY_NAMES = { Mon: 'Esmaspäev', Tue: 'Teisipäev', Wed: 'Kolmapäev', Thu: 'Neljapäev', Fri: 'Reede', Sat: 'Laupäev', Sun: 'Pühapäev' };
const KIND_LABELS = { free: 'Saadaval', online: 'Ainult veebis', busy: 'Ei saa' };
const BRUSHES = [['free', 'Saadaval', 'tunde võib panna'], ['online', 'Ainult veebis', 'ainult veebitunnid'], ['busy', 'Ei saa', 'tunde ei panda'], ['', 'Kustuta', 'märkimata']];
const dateText = (date) => new Date(`${date}T12:00:00`).toLocaleDateString('et-EE', { weekday: 'short', day: 'numeric', month: 'short' });

/**
 * „Minu ajad” (Oleksiy 2026-10-24): the teacher's usual week as the students' poll grid — Mon–Sun × half hours
 * 08–22, tap or drag to paint „Saadaval” / „Ainult veebis” / „Ei saa”. Saves the weekly windows of
 * teacherAvailability (teacherWeekModel.slotsFromCells); date windows are listed and can be removed, never changed by
 * the grid. The week's lessons lie on top (a lesson in a red cell, or on site in a yellow one, is marked), and one of
 * the teacher's students can be laid over the grid to compare with their „Sobivad ajad”.
 */
export default function TeacherWeekEditor({ teacher, availability = null, events = [], weekStart, students = [], studentTimes = new Map(), today = '', saving = false, own = false, onSave, onClose, onDates }) {
  const slots = useMemo(() => availability?.slots || [], [availability]);
  const initial = useMemo(() => cellsFromSlots(slots), [slots]);
  const [cells, setCells] = useState(initial);
  const [brush, setBrush] = useState('free');
  const [removed, setRemoved] = useState([]);
  const [week, setWeek] = useState(weekStart);
  const [showLessons, setShowLessons] = useState(true);
  const [compareId, setCompareId] = useState('');
  const [error, setError] = useState('');
  const paint = useRef(null);

  const dates = WEEK_DAYS.map((_, index) => shiftDate(week, index));
  const lessons = useMemo(() => (showLessons ? lessonCells(events, WEEK_DAYS.map((_, index) => shiftDate(week, index)), { teacherUid: teacher.uid, teacherName: teacher.name }) : {}),
    [events, week, showLessons, teacher.uid, teacher.name]);
  const compare = compareId ? studentCells(studentTimes.get(compareId)) : {};
  const comparable = students.filter((student) => studentTimes.get(student.id)?.slots?.length);
  const dated = datedSlots(slots, today).filter((slot) => !removed.includes(slot.id));
  const outside = outsideGrid(slots);
  const touched = changedDays(initial, cells);
  const dirty = touched.length > 0 || removed.length > 0;
  // the lessons of the shown week that sit (partly) in a red cell, or on site in a yellow one
  const clashes = new Set(Object.entries(lessons).flatMap(([key, list]) => list.filter((lesson) => clashOf(cells[key], [lesson])).map((lesson) => lesson.id))).size;

  const paintCells = (keys, value) => setCells((current) => {
    const next = { ...current };
    keys.forEach((key) => { if (value) next[key] = value; else delete next[key]; });
    return next;
  });
  const start = (key, event) => {
    event.preventDefault();
    const value = brush && cells[key] === brush ? '' : brush;
    paint.current = { value, last: key };
    paintCells([key], value);
  };
  const over = (event) => {
    if (!paint.current) return;
    const key = globalThis.document.elementFromPoint?.(event.clientX, event.clientY)?.closest?.('[data-cell]')?.getAttribute('data-cell');
    if (!key || key === paint.current.last) return;
    // a fast finger skips cells: every half hour between the last cell and this one (in one day) gets the mark too
    const [lastDay, lastTime] = paint.current.last.split('-');
    const [day, time] = key.split('-');
    const keys = day === lastDay
      ? HALVES.filter((at) => clock(at) >= (lastTime < time ? lastTime : time) && clock(at) <= (lastTime < time ? time : lastTime)).map((at) => cellKey(day, at))
      : [key];
    paint.current.last = key;
    paintCells(keys, paint.current.value);
  };
  const end = () => { paint.current = null; };
  const fillDay = (day) => {
    const keys = HALVES.map((at) => cellKey(day, at));
    paintCells(keys, brush && keys.every((key) => cells[key] === brush) ? '' : brush);
  };
  const save = async () => {
    setError('');
    let next;
    try { next = slotsFromCells(slots.filter((slot) => !removed.includes(slot.id)), cells, touched); } catch (caught) { setError(caught.message); return; }
    if (await onSave(next) === false) setError('Aegu ei saanud salvestada. Proovi uuesti.');
  };

  return <Modal open className="modal--teacher-week" title={own ? 'Minu ajad' : `${teacher.name} — ajad`} onClose={() => { if (!saving) onClose(); }} footer={<>
    {error ? <span className="form-error" role="alert">{error}</span> : null}
    <span className="modal__footer-spacer" />
    <Button variant="secondary" disabled={saving} onClick={onClose}>Loobu</Button>
    <Button loading={saving} disabled={!dirty} onClick={save}>Salvesta ajad</Button>
  </>}>
    <div className="tw">
      <p className="tw-intro">{own ? 'Märgi oma tavaline nädal' : `Märgi ${teacher.name} tavaline nädal`}: vali värv ja puuduta või lohista üle aja. Kehtib iga nädal; ühe päeva erandid on all.</p>
      <div className="tw-brushes" role="group" aria-label="Märgi kui">
        {BRUSHES.map(([kind, label, hint]) => <button key={kind || 'clear'} type="button" aria-pressed={brush === kind} className={`tw-brush ${brush === kind ? 'is-on' : ''}`} onClick={() => setBrush(kind)}>
          {kind ? <i className={`tw-swatch is-${kind}`} /> : <Eraser size={15} aria-hidden="true" />}<span><b>{label}</b><small>{hint}</small></span>
        </button>)}
      </div>
      <div className="tw-tools">
        <label className="checkbox-field"><input type="checkbox" checked={showLessons} onChange={(event) => setShowLessons(event.target.checked)} /> <span>Näita tunde</span></label>
        {showLessons ? <span className="tw-week">
          <button type="button" aria-label="Eelmine nädal" onClick={() => setWeek(shiftDate(week, -7))}><ChevronLeft size={15} /></button>
          <span>{dateText(dates[0])} – {dateText(dates[6])}</span>
          <button type="button" aria-label="Järgmine nädal" onClick={() => setWeek(shiftDate(week, 7))}><ChevronRight size={15} /></button>
        </span> : null}
        {comparable.length ? <label className="tw-compare"><span>Võrdle õpilasega</span><select className="cal2-select" value={compareId} onChange={(event) => setCompareId(event.target.value)}>
          <option value="">—</option>{comparable.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
        </select></label> : null}
      </div>
      {clashes ? <p className="tw-clash-note" role="status">{clashes === 1 ? '1 tund on' : `${clashes} tundi on`} sel nädalal punasel ajal (või kohapeal kollasel ajal) — märgitud punase raamiga.</p> : null}

      <div className="tw-grid" role="grid" aria-label={own ? 'Minu nädala ajad' : `${teacher.name}: nädala ajad`} onPointerMove={over} onPointerUp={end} onPointerCancel={end} onPointerLeave={end}>
        <div className="tw-grid__corner" />
        {WEEK_DAYS.map((day, index) => <button type="button" key={day} className="tw-grid__day" aria-label={`${DAY_NAMES[day]}: kogu päev`} title={`${DAY_NAMES[day]}: kogu päev`} onClick={() => fillDay(day)}>{DAY_SHORT[day]}{showLessons ? <small>{Number(dates[index].slice(8))}.</small> : null}</button>)}
        {HALVES.map((at) => <Fragment key={at}>
          <div className={`tw-grid__time ${at % 60 ? 'is-half' : ''}`}>{at % 60 ? '' : clock(at)}</div>
          {WEEK_DAYS.map((day) => {
            const key = cellKey(day, at);
            const kind = cells[key] || '';
            const list = lessons[key] || [];
            const first = list.find((lesson) => lesson.first);
            const student = compare[key];
            const label = `${DAY_NAMES[day]} ${clock(at)}: ${kind ? KIND_LABELS[kind] : 'märkimata'}${list.length ? ` · tund ${list.map((lesson) => lesson.label).join(', ')}` : ''}${student ? ` · õpilasele ${student === 'best' ? 'sobib kõige paremini' : 'sobib'}` : ''}`;
            return <button type="button" key={key} data-cell={key} aria-label={label} title={label} aria-pressed={Boolean(kind)}
              className={`tw-grid__cell ${kind ? `is-${kind}` : ''} ${list.length ? 'has-lesson' : ''} ${clashOf(kind, list) ? 'is-clash' : ''} ${student ? `is-student-${student}` : ''}`}
              onPointerDown={(event) => start(key, event)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); paintCells([key], brush && kind === brush ? '' : brush); } }}>
              {first ? <span className="tw-grid__lesson">{first.label}</span> : null}
            </button>;
          })}
        </Fragment>)}
      </div>
      <p className="tw-legend"><i className="tw-swatch is-free" /> Saadaval <i className="tw-swatch is-online" /> Ainult veebis <i className="tw-swatch is-busy" /> Ei saa {showLessons ? <><i className="tw-swatch is-lesson" /> tund</> : null}{compareId ? <><i className="tw-swatch is-student" /> õpilasele sobib</> : null}</p>

      <section className="tw-dated" aria-label="Ühe päeva erandid">
        <h3>Ühe päeva erandid</h3>
        {dated.length ? <ul>{dated.map((slot) => <li key={slot.id}>
          <i className={`tw-swatch is-${slot.kind === 'open' ? 'none' : slot.kind}`} />
          <span>{dateText(slot.date)} {slot.start}–{slot.end} · {slot.kind === 'open' ? 'märkimata (iganädalane aeg ei kehti)' : KIND_LABELS[slot.kind] || slot.kind}</span>
          <button type="button" className="link-button" onClick={() => setRemoved((current) => [...current, slot.id])}>Eemalda</button>
        </li>)}</ul> : <p className="form-hint">Erandeid ei ole.</p>}
        <p className="form-hint">Ühe kuupäeva erand: klõpsa kalendris lahtril ja vali „ainult see päev”{onDates ? <> või <button type="button" className="link-button" onClick={onDates}>märgi kalendris lohistades</button></> : null}.</p>
        {outside.length ? <p className="form-hint">Väljaspool 8–22 märgitud ajad jäävad alles: {outside.map((slot) => `${DAY_SHORT[slot.day]} ${slot.start}–${slot.end} ${KIND_LABELS[slot.kind] || ''}`.trim()).join(', ')}.</p> : null}
      </section>
    </div>
  </Modal>;
}
