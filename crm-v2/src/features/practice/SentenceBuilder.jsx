import { useEffect, useMemo, useRef, useState } from 'react';
import {
  closestCenter, DndContext, DragOverlay, KeyboardSensor, MouseSensor, pointerWithin, TouchSensor, useDraggable, useDroppable, useSensor, useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { BANK, bankId, dropResult, dropsAfter, indexOf, isLineTile, LINE, lineId } from './tileDrop.js';

// Word tiles. Tap: a tile in the bank goes to the end of the sentence, a tile in the sentence goes back. Drag (mouse,
// or touch after a short press so the page still scrolls): from the bank to a place in the sentence, within the
// sentence to another place, from the sentence back to the bank. Keyboard: every tile is a button (Tab, Enter); in the
// sentence Space picks a tile up, arrows move it, Space / Enter puts it down, Escape cancels; Backspace takes the last
// tile back. `value` is the list of chosen tile indexes, in sentence order.


// Space starts a keyboard drag; Enter stays the tap (take the tile back).
const KEYBOARD_CODES = { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter', 'Tab'] };

function useReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const list = window.matchMedia(query);
    const onChange = () => setReduced(list.matches);
    list.addEventListener?.('change', onChange);
    return () => list.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

// The pointer picks what it is over (a sentence tile before the zones); between tiles of the sentence the nearest tile
// counts. The keyboard only moves within the sentence.
function collision(args) {
  const lineTiles = args.droppableContainers.filter((c) => isLineTile(c.id));
  if (!args.pointerCoordinates) return closestCenter({ ...args, droppableContainers: lineTiles });
  const hits = pointerWithin(args);
  const tile = hits.find((h) => isLineTile(h.id));
  if (tile) return [tile];
  if (hits.some((h) => h.id === LINE) && lineTiles.length) {
    const nearest = closestCenter({ ...args, droppableContainers: lineTiles });
    if (nearest.length) return nearest.slice(0, 1);
  }
  return hits.filter((h) => h.id === LINE || h.id === BANK).slice(0, 1);
}

const quoted = (word) => `„${word}”`;

function announcementsFor(tiles, value) {
  const word = (id) => quoted(tiles[indexOf(id)] ?? '');
  const place = (id) => {
    const pos = value.indexOf(indexOf(id));
    return pos < 0 ? '' : `kohal ${pos + 1} / ${value.length}`;
  };
  const where = (over) => {
    if (!over) return 'mitte kuskil kohal';
    if (over.id === BANK) return 'sõnade kasti kohal';
    if (over.id === LINE) return 'lause lõpus';
    return `sõna ${word(over.id)} kohal`;
  };
  return {
    onDragStart: ({ active }) => (isLineTile(active.id)
      ? `Võtsid sõna ${word(active.id)}, see on ${place(active.id)}. Liiguta nooleklahvidega, tühik paneb maha, Escape katkestab.`
      : `Võtsid sõna ${word(active.id)} sõnade kastist.`),
    onDragOver: ({ active, over }) => (over?.id === active.id ? undefined : `Sõna ${word(active.id)} on ${where(over)}.`),
    onDragEnd: ({ active, over }) => {
      if (!over) return `Sõna ${word(active.id)} jäi oma kohale.`;
      if (over.id === BANK) return isLineTile(active.id) ? `Sõna ${word(active.id)} läks tagasi sõnade kasti.` : `Sõna ${word(active.id)} jäi kasti.`;
      return `Sõna ${word(active.id)} pandi lausesse.`;
    },
    onDragCancel: ({ active }) => `Lohistamine katkestati. Sõna ${word(active.id)} jäi oma kohale.`,
  };
}

const INSTRUCTIONS = {
  draggable: 'Sõna liigutamiseks vajuta tühikut, liiguta nooleklahvidega ja vajuta uuesti tühikut. Escape katkestab. Enter võtab sõna lausest tagasi.',
};

function LineTile({ tile, index, position, disabled, reduced, marker, onTap }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: lineId(index),
    disabled,
    transition: reduced ? null : undefined,
    animateLayoutChanges: reduced ? () => false : undefined,
  });
  const style = {
    transform: transform ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)` : undefined,
    transition: reduced ? undefined : transition,
  };
  return (
    <button
      ref={(node) => { setNodeRef(node); setActivatorNodeRef(node); }}
      type="button"
      className={`pr-tile pr-tile--placed${isDragging ? ' is-dragging' : ''}${marker ? ` is-drop-${marker}` : ''}`}
      style={style}
      onClick={() => onTap(position)}
      disabled={disabled}
      aria-label={`${tile} — võta tagasi`}
      aria-describedby={attributes['aria-describedby']}
      aria-roledescription="lohistatav sõna"
      {...listeners}
    >
      {tile}
    </button>
  );
}

function BankTile({ tile, index, used, disabled, onTap }) {
  const { listeners, setNodeRef, isDragging } = useDraggable({ id: bankId(index), disabled: disabled || used });
  // the keyboard places a bank tile with Enter / Space (tap); only the pointer drags it
  const pointerListeners = listeners ? { onMouseDown: listeners.onMouseDown, onTouchStart: listeners.onTouchStart } : {};
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={`pr-tile${used ? ' pr-tile--used' : ''}${isDragging ? ' is-dragging' : ''}`}
      onClick={() => onTap(index)}
      disabled={disabled || used}
      aria-hidden={used || undefined}
      tabIndex={used ? -1 : 0}
      {...pointerListeners}
    >
      {tile}
    </button>
  );
}

function Zone({ id, className, label, empty, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`${className}${isOver ? ' is-over' : ''}`} role="group" aria-label={label} data-empty={empty ? 'true' : undefined}>
      {children}
    </div>
  );
}

export default function SentenceBuilder({ tiles, value, onChange, disabled = false, label = 'Sinu lause' }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(null);
  const [overTarget, setOverTarget] = useState(null); // { id, after } while a bank tile is over a sentence tile
  const dropped = useRef({ tile: -1, at: 0 });
  const chosen = new Set(value);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, keyboardCodes: KEYBOARD_CODES }),
  );

  // a click on the tile just dropped (Space keyup, mouseup) is not a tap
  const justDropped = (tile) => dropped.current.tile === tile && Date.now() - dropped.current.at < 250;
  const put = (i) => { if (!disabled && !chosen.has(i) && !justDropped(i)) onChange([...value, i]); };
  const takeBack = (pos) => { if (!disabled && !justDropped(value[pos])) onChange(value.filter((_, k) => k !== pos)); };
  const onKeyDown = (event) => {
    if (active) return;
    if (event.key === 'Backspace' && value.length && !disabled && event.target.tagName !== 'INPUT') {
      event.preventDefault();
      onChange(value.slice(0, -1));
    }
  };

  const afterOf = (event) => dropsAfter(event.active.rect.current.translated, event.over?.rect);
  const finish = (event) => { setActive(null); setOverTarget(null); dropped.current = { tile: indexOf(event.active.id), at: Date.now() }; };
  const onDragStart = ({ active: a }) => setActive(a.id);
  const onDragOver = (event) => {
    const { active: a, over } = event;
    setOverTarget(!isLineTile(a.id) && over && isLineTile(over.id) ? { id: over.id, after: afterOf(event) } : null);
  };
  const onDragMove = (event) => { if (!isLineTile(event.active.id) && event.over && isLineTile(event.over.id)) onDragOver(event); };
  const onDragEnd = (event) => {
    const next = disabled ? null : dropResult(value, event.active.id, event.over?.id ?? null, event.over ? afterOf(event) : true);
    finish(event);
    if (next) onChange(next);
  };

  const accessibility = useMemo(() => ({ announcements: announcementsFor(tiles, value), screenReaderInstructions: INSTRUCTIONS }), [tiles, value]);
  const activeWord = active == null ? '' : tiles[indexOf(active)];
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={finish}
      accessibility={accessibility}
    >
      <div className={`pr-builder${active ? ' is-dragging' : ''}`} onKeyDown={onKeyDown}>
        <SortableContext items={value.map(lineId)} strategy={rectSortingStrategy}>
          <Zone id={LINE} className="pr-builder__line" label={label} empty={!value.length}>
            {value.length ? value.map((i, pos) => (
              <LineTile
                key={i}
                tile={tiles[i]}
                index={i}
                position={pos}
                disabled={disabled}
                reduced={reduced}
                marker={overTarget?.id === lineId(i) ? (overTarget.after ? 'after' : 'before') : ''}
                onTap={takeBack}
              />
            )) : <span className="pr-builder__hint">Puuduta või lohista sõnad õiges järjekorras</span>}
          </Zone>
        </SortableContext>
        <Zone id={BANK} className="pr-builder__bank" label="Sõnad">
          {tiles.map((t, i) => <BankTile key={i} tile={t} index={i} used={chosen.has(i)} disabled={disabled} onTap={put} />)}
        </Zone>
      </div>
      <DragOverlay dropAnimation={reduced ? null : undefined}>
        {active != null ? <span className="pr-tile pr-tile--overlay" aria-hidden="true">{activeWord}</span> : null}
      </DragOverlay>
    </DndContext>
  );
}
