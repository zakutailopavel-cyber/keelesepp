import { Check, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { PX_PER_MIN, SNAP, canMove, gridRange, layoutColumn, snapMinutes, teacherTone, toClock, toMinutes } from './calendarGrid.js';


function statusOf(item) {
  if (item.lessonRecordId || item.status === 'Toimunud') return 'done';
  if (item.status === 'Puudus_eta' || item.status === 'Puudus_p') return 'absent';
  return 'planned';
}

const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

/**
 * Time grid for the week (columns = days) and day (columns = teachers) views.
 * columns: [{ key, title, subtitle, date, isToday, items }]
 * Drag a block to move it (other column allowed only if allowColumnChange), drag its bottom edge to resize.
 */
// In the week view (several narrow columns) three or more lessons side by side become unreadable slivers.
const CROWDED = 3;
function crowdedIds(laid, columnCount) {
  if (columnCount < 2) return new Set();
  return new Set(laid.filter((entry) => !entry.outside && entry.lanes >= CROWDED).map((entry) => entry.cluster));
}
function crowdedClusters(laid, columnCount) {
  const ids = crowdedIds(laid, columnCount);
  return [...ids].map((id) => {
    const items = laid.filter((entry) => entry.cluster === id && !entry.outside).sort((a, b) => a.top - b.top || String(a.item.studentName).localeCompare(String(b.item.studentName), 'et'));
    const top = Math.min(...items.map((entry) => entry.top));
    const bottom = Math.max(...items.map((entry) => entry.top + entry.height));
    return { id, items, top, height: bottom - top };
  });
}

// bands(column) → [{ id, kind: 'free' | 'busy', start, end }] in minutes: a teacher's green/red windows behind the lessons.
// paint: { kind } turns on painting windows: drag in a column → onPaint(column, startMinutes, endMinutes); a click on a
// window → onBandClick(column, band).
export default function TimeGrid({ columns, allowColumnChange = true, canDrag = canMove, onSlot, onOpen, onQuickDone, onMove, showTeacher = true, bands = null, paint = null, onPaint, onBandClick }) {
  const bodyRef = useRef(null);
  const columnRefs = useRef(new Map());
  const [drag, setDrag] = useState(null);
  const [painting, setPainting] = useState(null);
  const [now, setNow] = useState(nowMinutes);
  const { start: GRID_START, end: GRID_END } = gridRange(columns.flatMap((column) => column.items));
  const HOURS = Array.from({ length: (GRID_END - GRID_START) / 60 + 1 }, (_, index) => GRID_START / 60 + index);
  const firstRange = useRef({ start: GRID_START, end: GRID_END });

  useLayoutEffect(() => {
    const { start, end } = firstRange.current;
    const target = Math.max(0, (Math.min(Math.max(nowMinutes(), start + 60), end) - start - 90) * PX_PER_MIN);
    if (bodyRef.current) bodyRef.current.scrollTop = target;
  }, []);
  useEffect(() => {
    const timer = globalThis.setInterval(() => setNow(nowMinutes()), 60000);
    return () => globalThis.clearInterval(timer);
  }, []);

  const columnAt = (clientX) => {
    for (const [key, element] of columnRefs.current) {
      const rect = element.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) return key;
    }
    return null;
  };

  const startDrag = (event, item, column, mode) => {
    if (event.button !== 0 || !canDrag(item)) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const start = toMinutes(item.time);
    setDrag({ item, mode, fromColumn: column.key, column: column.key, x: event.clientX, y: event.clientY, start, duration: Number(item.duration) || 60, origStart: start, origDuration: Number(item.duration) || 60, moved: false });
  };

  const moveDrag = (event) => {
    if (!drag) return;
    const delta = snapMinutes((event.clientY - drag.y) / PX_PER_MIN);
    const moved = drag.moved || Math.abs(event.clientY - drag.y) > 4 || Math.abs(event.clientX - drag.x) > 4;
    if (drag.mode === 'resize') {
      setDrag({ ...drag, moved, duration: Math.max(SNAP, Math.min(GRID_END - drag.origStart, drag.origDuration + delta)) });
      return;
    }
    const start = Math.max(GRID_START, Math.min(GRID_END - drag.duration, drag.origStart + delta));
    const column = allowColumnChange ? (columnAt(event.clientX) || drag.column) : drag.column;
    setDrag({ ...drag, moved, start, column });
  };

  const endDrag = () => {
    if (!drag) return;
    const current = drag;
    setDrag(null);
    if (!current.moved) { onOpen(current.item); return; }
    const changed = current.start !== current.origStart || current.duration !== current.origDuration || current.column !== current.fromColumn;
    if (changed) {
      const column = columns.find((entry) => entry.key === current.column);
      Promise.resolve().then(() => onMove({ item: current.item, column, time: toClock(current.start), duration: current.duration }));
    }
  };

  useEffect(() => {
    if (!drag) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setDrag(null); };
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [drag]);

  const minutesAt = (element, clientY) => {
    const rect = element.getBoundingClientRect();
    return Math.max(GRID_START, Math.min(GRID_END, GRID_START + snapMinutes((clientY - rect.top) / PX_PER_MIN, 30)));
  };
  const startPaint = (event, column) => {
    if (!paint || event.button !== 0) return;
    const element = columnRefs.current.get(column.key);
    if (!element) return;
    event.preventDefault();
    const at = minutesAt(element, event.clientY);
    const band = event.target.closest?.('.tg-band');
    setPainting({ column, from: at, to: Math.min(GRID_END, at + 30), y: event.clientY, moved: false, bandId: band?.dataset.band || '' });
  };
  const movePaint = (event) => {
    if (!painting) return;
    const element = columnRefs.current.get(painting.column.key);
    const at = minutesAt(element, event.clientY);
    const moved = painting.moved || Math.abs(event.clientY - painting.y) > 6;
    setPainting({ ...painting, moved, to: at === painting.from ? Math.min(GRID_END, at + 30) : at });
  };
  const endPaint = () => {
    if (!painting) return;
    const current = painting;
    setPainting(null);
    if (!current.moved && current.bandId) {
      const band = (bands?.(current.column) || []).find((entry) => String(entry.id) === current.bandId);
      if (band) { onBandClick?.(current.column, band); return; }
    }
    const start = Math.min(current.from, current.to);
    const end = Math.max(current.from, current.to);
    if (end > start) onPaint?.(current.column, start, end);
  };

  const slotClick = (event, column) => {
    if (paint || drag || event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const minutes = GRID_START + snapMinutes((event.clientY - rect.top) / PX_PER_MIN, 30);
    onSlot(column, toClock(Math.min(minutes, GRID_END - 30)));
  };

  const height = (GRID_END - GRID_START) * PX_PER_MIN;
  return (
    <div className={`tg ${paint ? `is-painting paint-${paint.kind}` : ''}`} style={{ '--tg-cols': columns.length }}>
      <div className="tg-head" aria-hidden="false">
        <div className="tg-gutter" />
        {columns.map((column) => (
          <div className={`tg-colhead ${column.isToday ? 'is-today' : ''}`} key={column.key}>
            <span>{column.subtitle}</span><strong>{column.title}</strong>
          </div>
        ))}
      </div>
      <div className="tg-body" ref={bodyRef} onPointerMove={(event) => { moveDrag(event); movePaint(event); }} onPointerUp={() => { endDrag(); endPaint(); }} onPointerCancel={() => { setDrag(null); setPainting(null); }}>
        <div className="tg-inner" style={{ height }}>
          <div className="tg-hours" aria-hidden="true">
            {HOURS.map((hour) => <span key={hour} style={{ top: (hour * 60 - GRID_START) * PX_PER_MIN }}>{String(hour).padStart(2, '0')}:00</span>)}
          </div>
          {columns.map((column) => {
            const laid = layoutColumn(column.items, { start: GRID_START, end: GRID_END });
            const ghost = drag && drag.moved && drag.column === column.key ? drag : null;
            return (
              <div
                className={`tg-col ${column.isToday ? 'is-today' : ''}`}
                key={column.key}
                ref={(element) => { if (element) columnRefs.current.set(column.key, element); else columnRefs.current.delete(column.key); }}
                onClick={(event) => slotClick(event, column)}
                onPointerDown={(event) => startPaint(event, column)}
                role="group"
                aria-label={`${column.subtitle} ${column.title}`}
              >
                {(bands?.(column) || []).filter((band) => band.end > GRID_START && band.start < GRID_END).map((band) => {
                  const top = Math.max(band.start, GRID_START) - GRID_START;
                  const bottom = Math.min(band.end, GRID_END) - GRID_START;
                  return <div key={band.id} data-band={band.id} className={`tg-band is-${band.kind}${band.date ? ' is-dated' : ''}`} style={{ top: top * PX_PER_MIN, height: (bottom - top) * PX_PER_MIN }} title={`${band.kind === 'busy' ? 'Hõivatud' : 'Vaba'} ${toClock(band.start)}–${toClock(band.end)}${band.date ? ' (ainult see päev)' : ' (iga nädal)'}`} />;
                })}
                {painting && painting.column.key === column.key ? <div className={`tg-band is-${paint.kind} is-preview`} style={{ top: (Math.min(painting.from, painting.to) - GRID_START) * PX_PER_MIN, height: Math.abs(painting.to - painting.from) * PX_PER_MIN }} /> : null}
                {HOURS.slice(1).map((hour) => <i className="tg-line" key={hour} style={{ top: (hour * 60 - GRID_START) * PX_PER_MIN }} />)}
                {column.isToday && now >= GRID_START && now <= GRID_END ? <i className="tg-now" style={{ top: (now - GRID_START) * PX_PER_MIN }} aria-label="Praegu" /> : null}
                {crowdedClusters(laid, columns.length).map((group) => (
                  // three or more lessons at once in a narrow week column: one card listing them, each opens its lesson
                  <div key={`cluster-${group.id}`} className="tg-cluster" style={{ top: group.top * PX_PER_MIN, height: Math.max(44, group.height * PX_PER_MIN - 2) }} role="list" aria-label={`${group.items.length} tundi korraga`}>
                    {group.items.map(({ item }) => {
                      const status = statusOf(item);
                      return (
                        <button key={item.occurrenceId} type="button" role="listitem" className={`tg-cluster-item tone-${teacherTone(item.teacherUid || item.teacher)} is-${status}`} title={`${item.time} · ${item.studentName || 'Õpilane'}${item.teacher ? ` · ${item.teacher}` : ''}`} onClick={(event) => { event.stopPropagation(); onOpen(item); }}>
                          <span>{item.time}</span><strong>{item.studentName || 'Õpilane'}</strong>{status === 'done' ? <Check size={11} /> : status === 'absent' ? <X size={11} /> : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
                {laid.filter((entry) => !entry.outside && !crowdedIds(laid, columns.length).has(entry.cluster)).map(({ item, top, height: blockHeight, lane, lanes }) => {
                  const status = statusOf(item);
                  const movable = canDrag(item);
                  return (
                    <div
                      key={item.occurrenceId}
                      className={`tg-block tone-${teacherTone(item.teacherUid || item.teacher)} is-${status} ${item.isGroup ? 'is-group' : ''} ${movable ? 'is-movable' : ''} ${blockHeight < 40 ? 'is-short' : ''} ${drag?.moved && drag.item.occurrenceId === item.occurrenceId ? 'is-dragging' : ''}`}
                      style={{ top: top * PX_PER_MIN, height: Math.max(22, blockHeight * PX_PER_MIN - 2), left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}
                      onPointerDown={(event) => startDrag(event, item, column, 'move')}
                      title={`${item.time} · ${item.studentName || 'Õpilane'}${item.teacher ? ` · ${item.teacher}` : ''}`}
                    >
                      <button
                        type="button"
                        className="tg-open"
                        aria-label={`${item.time} ${item.studentName || 'Tund'}${item.isGroup ? ' (grupp)' : ''}${status === 'done' ? ', toimunud' : status === 'absent' ? ', puudus' : ''}`}
                        onClick={(event) => { event.stopPropagation(); if (!movable || event.detail === 0) onOpen(item); }}
                      >
                        <span className="tg-time">{item.time}{status === 'done' ? <Check size={12} /> : status === 'absent' ? <X size={12} /> : null}</span>
                        <strong>{item.studentName || 'Õpilane'}</strong>
                        {item.recordTopic ? <small className="tg-topic">{item.recordTopic}</small> : showTeacher ? <small>{item.teacher}</small> : null}
                      </button>
                      {onQuickDone && status === 'planned' && !item.isGroup && item.occurrenceDate <= column.today ? (
                        <button type="button" className="tg-quick" aria-label={`Märgi toimunuks: ${item.studentName || 'Õpilane'}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onQuickDone(item); }}><Check size={14} /></button>
                      ) : null}
                      {movable ? <span className="tg-resize" aria-hidden="true" onPointerDown={(event) => startDrag(event, item, column, 'resize')} /> : null}
                    </div>
                  );
                })}
                {ghost ? (
                  <div className="tg-ghost" style={{ top: (ghost.start - GRID_START) * PX_PER_MIN, height: ghost.duration * PX_PER_MIN - 2 }}>
                    {toClock(ghost.start)}–{toClock(ghost.start + ghost.duration)} · {ghost.item.studentName}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
