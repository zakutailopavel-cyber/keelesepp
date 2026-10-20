import { useRef } from 'react';
import { DAYS, HOURS, NEXT, cellKey } from './pollModel.js';

// the week as a table; with `onChange` a tap cycles a cell and a drag paints the cells it passes with the same mark
export default function PollGrid({ cells, onChange, dayNames, label = 'Nädala ajad' }) {
  const paint = useRef(null);
  const readOnly = !onChange;
  const set = (key, value) => onChange({ ...cells, [key]: value });
  const start = (key, event) => {
    if (readOnly) return;
    event.preventDefault();
    const value = NEXT[cells[key] || ''];
    paint.current = { value, last: key };
    set(key, value);
  };
  const over = (event) => {
    if (readOnly || paint.current === null) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest?.('[data-cell]');
    const key = target?.getAttribute('data-cell');
    if (!key || key === paint.current.last) return;
    // a fast finger skips cells: every hour between the last cell and this one (in one day) gets the mark too
    const [lastDay, lastHour] = paint.current.last.split('-');
    const [day, hour] = key.split('-');
    const keys = day === lastDay
      ? HOURS.filter((h) => h >= Math.min(Number(lastHour), Number(hour)) && h <= Math.max(Number(lastHour), Number(hour))).map((h) => cellKey(day, h))
      : [key];
    paint.current.last = key;
    onChange({ ...cells, ...Object.fromEntries(keys.map((item) => [item, paint.current.value])) });
  };
  const end = () => { paint.current = null; };
  const toggleDay = (day) => {
    if (readOnly) return;
    const keys = HOURS.map((hour) => cellKey(day, hour));
    const anyEmpty = keys.some((key) => !cells[key]);
    onChange({ ...cells, ...Object.fromEntries(keys.map((key) => [key, anyEmpty ? (cells[key] || 'ok') : ''])) });
  };
  return (
    <div className={`poll-grid ${readOnly ? 'is-readonly' : ''}`} role="grid" aria-label={label} onPointerMove={over} onPointerUp={end} onPointerCancel={end} onPointerLeave={end}>
      <div className="poll-grid__corner" />
      {DAYS.map((day) => <button type="button" key={day} className="poll-grid__day" disabled={readOnly} onClick={() => toggleDay(day)}>{dayNames[day]}</button>)}
      {HOURS.map((hour) => [
        <div key={`h${hour}`} className="poll-grid__hour">{hour}:00</div>,
        ...DAYS.map((day) => {
          const key = cellKey(day, hour);
          const value = cells[key] || '';
          return <button type="button" key={key} data-cell={key} className={`poll-grid__cell ${value ? `is-${value}` : ''}`} aria-label={`${dayNames[day]} ${hour}:00`} aria-pressed={Boolean(value)} disabled={readOnly}
            onPointerDown={(event) => start(key, event)} onKeyDown={(event) => { if (!readOnly && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); set(key, NEXT[value]); } }}>{value === 'best' ? '★' : ''}</button>;
        }),
      ])}
    </div>
  );
}
