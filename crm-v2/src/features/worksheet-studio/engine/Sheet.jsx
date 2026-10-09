/* global ResizeObserver */
import { Suspense, lazy, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { dragId, dropId } from './dragIds.js';
import { BLOCKS, exampleAnswers, numberTasks } from './registry.js';
import { TONES } from './schema.js';
import { Md, Target } from './ui.jsx';
import { COLUMNS, rowsOf, snapSpan, spanOf } from './layout.js';
import { addItemLabel } from './addItem.js';
import { editSource, findEditable } from './inlineEdit.js';
import { openFloatingEditor } from './floatingEditor.js';
import MarksLayer from './Marks.jsx';
// Tiptap is loaded only when a teacher opens a text for formatting (students never download it)
const RichInlineEditor = lazy(() => import('./RichInlineEditor.jsx'));
import { themedTone } from './look.js';

// texts that may carry formatting (bold, colour, highlight) — they are rendered with <Md>
const RICH_FIELDS = new Set(['instruction', 'text', 'passage']);
import { BookOpen, CheckCircle2, Clock3, Headphones, Lightbulb, MessageCircle, PenLine, Star } from 'lucide-react';

// Renders a worksheet document as real A4 pages (270 mm design canvas, zoomed to A4 when printed).
// The same component serves the editor (mode "edit"), the student (mode "interactive") and print ("print").

const PAGE_H_MM = 381.86;
const PAD_TOP = 11, PAD_BOTTOM = 9, FOOTER = 12, GAP = 4, RUNHEAD = 12;

function Header({ meta }) {
  return (
    <>
      <div className="ws-hdr">
        <div className="ws-brand"><div className="ws-logo">KeeleSepp<small>by EP Koolitus</small></div>{meta.slogan && <div className="ws-slogan">{meta.slogan}</div>}</div>
        <div className="ws-hbox"><b>{meta.level} – {meta.title}</b>{meta.module && <div className="ws-mod">{meta.module}</div>}{meta.canDo && <div className="ws-cando"><Target /><span>{meta.canDo}</span></div>}</div>
        <div className="ws-lvl"><div className="ws-big">{meta.level}</div><div className="ws-t">{meta.badge}</div></div>
      </div>
      <div className="ws-title"><h2>{meta.title}</h2>{meta.subtitle && <p>{meta.subtitle}</p>}</div>
    </>
  );
}

// In a book (startPage set) pages carry the book page number; a single sheet shows "page/pages".
const Footer = ({ meta, page, pages, bookPage }) => (
  <div className="ws-ftr"><div className="ws-fl">KeeleSepp <small>by EP Koolitus</small></div><em>{meta.footer?.tagline}</em><div className="ws-url">{meta.footer?.url}{bookPage ? ` · ${bookPage}` : pages > 1 ? ` · ${page}/${pages}` : ''}</div></div>
);

const LOOK_ICON = { speak: MessageCircle, listen: Headphones, read: BookOpen, write: PenLine, idea: Lightbulb, star: Star, time: Clock3, check: CheckCircle2 };

function Card({ block, num, mode, ctx, theme = '', selected, hovered = false, onHover, dropHint = '', onSelect, dndRef = null, dndListeners = null, dragging = false, focused, onPick, onResize, onAddItem, onMarks, note = null, extraClass = '', toolbar = null, onInsertAfter, joinedBefore = false, joinedAbove = false, joinedAfter = false }) {
  const def = BLOCKS[block.type];
  if (!def) return null;
  const tone = themedTone(theme, block.tone || 'white', TONES[block.tone] || TONES.white);
  const look = block.look || {};
  const accent = look.accent ? themedTone(theme, look.accent, TONES[look.accent] || tone).badge : null;
  const LookIcon = LOOK_ICON[look.icon] || null;
  const plain = !def.task && block.tone === 'white' && !look.frame;
  const d = block.data;
  const opts = block.opts || {};
  const example = exampleAnswers(block);
  const hasExample = Object.keys(example).length > 0;
  const base = ctx(block.id);
  const addLabel = mode === 'edit' && selected && onAddItem ? addItemLabel(block) : null;
  // the tools show on hover as well as on the selected block
  const active = mode === 'edit' && (selected || hovered);
  // the solved example is read-only and shown in every mode (edit, print, student)
  const blockCtx = hasExample || opts.shuffle ? {
    ...base,
    shuffle: Boolean(opts.shuffle),
    get: (k) => (k in example ? example[k] : base.get(k)),
    set: (k, v) => { if (!(k in example)) base.set(k, v); },
    state: (k) => (k in example ? undefined : base.state(k)),
  } : base;
  return (
    <section
      className={`ws-card ${plain ? 'plain' : ''} ${block.width === 'full' ? 'full' : ''} ${selected ? 'selected' : ''} ${focused ? 'focused' : ''} ${onPick ? 'pickable' : ''} ${hasExample ? 'has-example' : ''} ${block.minHeightMm ? 'is-tall' : ''} ${look.frame ? `frame-${look.frame}` : ''} ${joinedBefore ? 'joined-before' : ''} ${joinedAbove ? 'joined-above' : ''} ${joinedAfter ? 'joined-after' : ''} ${hovered && !selected ? 'hovered' : ''} ${dropHint ? `drop-${dropHint}` : ''} ${dragging ? 'is-dragging' : ''} ${look.head ? `head-${look.head}` : ''} ${look.num ? `num-${look.num}` : ''} ${extraClass}`}
      data-cols={opts.cols > 1 ? opts.cols : undefined}
      data-size={opts.size || undefined}
      style={{ ...(plain ? {} : { background: tone.card }), gridColumn: `span ${spanOf(block)}`, ...(block.minHeightMm ? { minHeight: `${block.minHeightMm}mm` } : {}), ...(accent ? { '--ws-accent': accent } : {}), '--ws-badge': accent || tone.badge }}
      data-block={block.id}
      onClick={mode === 'edit' ? (e) => { e.stopPropagation(); onSelect?.(block.id); } : onPick ? () => onPick(block.id) : undefined}
      ref={dndRef}
      {...(dndListeners || {})}
      onMouseEnter={mode === 'edit' && onHover ? () => onHover(block.id) : undefined}
      onMouseLeave={mode === 'edit' && onHover ? () => onHover(null) : undefined}
    >
      {!def.task && LookIcon ? <LookIcon className="ws-look-icon is-corner" aria-hidden="true" /> : null}
      {def.task && (
        <div className="ws-ch">
          <div className="ws-num" style={{ background: accent || tone.badge }}>{num}</div>
          <div>
            <h3>{LookIcon ? <LookIcon className="ws-look-icon" aria-hidden="true" /> : null}{d.title}{d.titleMore ? <span> {d.titleMore}</span> : null}</h3>
            {d.instruction && <p><Md text={d.instruction} /></p>}
          </div>
        </div>
      )}
      {/* body fills the rest of a block made taller than its content (see .is-tall in sheet.css) */}
      <div className="ws-body"><def.View data={d} ctx={blockCtx} id={block.id} /></div>
      {note ? <div className="ws-card-note">{note}</div> : null}
      <MarksLayer block={block} editable={mode === 'edit' && Boolean(onMarks)} onChange={(next) => onMarks?.(block.id, next.marks)} />
      {addLabel ? <button type="button" className="ws-add" onClick={(e) => { e.stopPropagation(); onAddItem(block.id); }}>+ {addLabel}</button> : null}
      {active && onResize ? <ResizeHandles block={block} onResize={onResize} /> : null}
      {active && toolbar ? <div className="ws-toolbar" role="toolbar" aria-label="Ploki tööriistad" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>{toolbar}</div> : null}
      {mode === 'edit' && onInsertAfter ? <button type="button" className="ws-insert" title="Lisa plokk selle järele" aria-label="Lisa plokk selle järele" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onInsertAfter(block.id); }}>+</button> : null}
    </section>
  );
}


// Edit mode on a page: the card can be dragged (dnd-kit, the context is in WorksheetStudioPage) and blocks can be
// dropped on it. The hidden measuring layer uses the plain Card, so ids are never registered twice.
function DndCard(props) {
  const { block } = props;
  const drag = useDraggable({ id: dragId(block.id), data: { kind: 'block', id: block.id } });
  const drop = useDroppable({ id: dropId(block.id), data: { kind: 'block', id: block.id, full: spanOf(block) >= COLUMNS } });
  const setRef = (node) => { drag.setNodeRef(node); drop.setNodeRef(node); };
  return <Card {...props} dndRef={setRef} dndListeners={drag.listeners} dragging={drag.isDragging} />;
}
function EmptyDrop() {
  const { setNodeRef, isOver } = useDroppable({ id: 'drop:__end', data: { kind: 'end' } });
  return <div ref={setNodeRef} className={`ws-empty ${isOver ? 'is-over' : ''}`}>Lisa vasakult esimene plokk või lohista see siia.</div>;
}

// Edit mode: drag the right edge to change the width (snaps to ¼ ⅓ ½ ⅔ ¾ full), the bottom edge to change the height.
function ResizeHandles({ block, onResize }) {
  const start = (event, axis) => {
    event.preventDefault();
    event.stopPropagation();
    const card = event.currentTarget.closest('.ws-card');
    const row = card?.parentElement;
    const page = card?.closest('.ws-page');
    if (!card || !row || !page) return;
    const rowRect = row.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const pxPerMm = page.getBoundingClientRect().width / 270;
    const colWidth = rowRect.width / COLUMNS;
    const startCol = Math.round((cardRect.left - rowRect.left) / colWidth);
    const FRACTION = { 3: '¼', 4: '⅓', 6: '½', 8: '⅔', 9: '¾', 12: 'täislaius' };
    const move = (e) => {
      if (axis === 'x' || axis === 'xy') {
        const raw = (e.clientX - rowRect.left) / colWidth - startCol;
        const span = Math.min(COLUMNS - startCol, snapSpan(Math.max(1, raw)));
        card.dataset.previewSpan = String(span);
        card.style.gridColumn = `span ${span}`;
      }
      if (axis === 'y' || axis === 'xy') {
        const mm = Math.max(20, (e.clientY - cardRect.top) / pxPerMm);
        card.dataset.previewHeight = String(Math.round(mm));
        card.style.minHeight = `${Math.round(mm)}mm`;
      }
      // the size is shown while dragging (CSS ::after of the card)
      card.dataset.sizeLabel = [card.dataset.previewSpan ? FRACTION[card.dataset.previewSpan] || `${card.dataset.previewSpan}/12` : '', card.dataset.previewHeight ? `${card.dataset.previewHeight} mm` : ''].filter(Boolean).join(' · ');
    };
    const up = () => {
      globalThis.removeEventListener('pointermove', move);
      globalThis.removeEventListener('pointerup', up);
      // the click that ends a resize must not deselect the block
      const swallow = (e) => e.stopPropagation();
      globalThis.addEventListener('click', swallow, { capture: true, once: true });
      globalThis.setTimeout(() => globalThis.removeEventListener('click', swallow, { capture: true }), 0);
      const patch = {
        ...(card.dataset.previewSpan ? { span: Number(card.dataset.previewSpan) } : {}),
        ...(card.dataset.previewHeight ? { minHeightMm: Number(card.dataset.previewHeight) } : {}),
      };
      if (Object.keys(patch).length) onResize(block.id, patch);
      delete card.dataset.previewSpan;
      delete card.dataset.previewHeight;
      delete card.dataset.sizeLabel;
    };
    globalThis.addEventListener('pointermove', move);
    globalThis.addEventListener('pointerup', up);
  };
  return (
    <>
      <span className="ws-resize ws-resize-x" role="separator" aria-orientation="vertical" aria-label="Muuda laiust" title="Lohista, et muuta laiust" onPointerDown={(e) => start(e, 'x')} onClick={(e) => e.stopPropagation()} />
      <span className="ws-resize ws-resize-y" role="separator" aria-orientation="horizontal" aria-label="Muuda kõrgust" title="Lohista, et muuta kõrgust" onPointerDown={(e) => start(e, 'y')} onClick={(e) => e.stopPropagation()} />
      <span className="ws-resize ws-resize-xy" role="separator" aria-label="Muuda suurust" title="Lohista nurgast, et muuta laiust ja kõrgust" onPointerDown={(e) => start(e, 'xy')} onClick={(e) => e.stopPropagation()} />
    </>
  );
}

export default function Sheet({ doc, mode = 'interactive', answers = {}, setAnswer, results = {}, selectedId, onSelect, dropHint = null, dnd = false, onResize, onAddItem, onMarks, onEditText, renderToolbar, onInsertAfter, startPage, onPageCount, focusId, onPick, blockNotes = null, blockClasses = null }) {
  // bumped after an inline edit so React redraws the text the browser changed in place
  const [rev, setRev] = useState(0);
  const nums = useMemo(() => numberTasks(doc.blocks), [doc.blocks]);
  const [focus, setFocusState] = useState({});
  const interactive = mode === 'interactive';
  const showAnswers = mode === 'interactive' || mode === 'review';
  const ctx = (id) => ({
    interactive,
    review: mode === 'review',
    // answers are only shown to the learner (and in teacher review); print and edit stay blank
    get: (k) => (showAnswers ? answers[`${id}:${k}`] : undefined),
    set: (k, v) => setAnswer?.(`${id}:${k}`, v),
    state: (k) => (showAnswers ? results[`${id}:${k}`] : undefined),
    focus,
    setFocus: (bid, v) => setFocusState((f) => ({ ...f, [bid]: v })),
  });

  const [hoverId, setHoverId] = useState(null);
  // the formatted text being edited on the sheet (Tiptap over the text)
  const [rich, setRich] = useState(null);

  // after a block moved, every card slides from where it was to its new place (FLIP; positions relative to the
  // sheet, so scrolling between two renders does not count as movement)
  const rootRef = useRef(null);
  const flip = useRef({ key: '', rects: new Map() });
  const orderKey = doc.blocks.map((b) => b.id).join(',');
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || mode !== 'edit') return;
    const base = root.getBoundingClientRect();
    const rects = new Map();
    root.querySelectorAll('.ws-page .ws-card[data-block]').forEach((card) => {
      const r = card.getBoundingClientRect();
      rects.set(card.dataset.block, { x: r.left - base.left, y: r.top - base.top, card });
    });
    const before = flip.current;
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (before.key && before.key !== orderKey && !reduce) {
      rects.forEach(({ x, y, card }, id) => {
        const old = before.rects.get(id);
        if (!old || typeof card.animate !== 'function') return;
        const dx = old.x - x;
        const dy = old.y - y;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        card.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2,.8,.2,1)' });
      });
    }
    flip.current = { key: orderKey, rects };
  });

  // --- pagination: measure rows in a hidden layer, then pack them into A4 pages ---
  const rows = useMemo(() => rowsOf(doc.blocks), [doc.blocks]);
  const measureRef = useRef(null);
  const [pages, setPages] = useState([rows.map((_, i) => i)]);
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const run = () => {
      const mm = el.offsetWidth / 270;
      // cannot measure (hidden tab, test DOM): show everything on one page instead of dropping rows
      if (!mm) { setPages([rows.map((_, i) => i)]); return; }
      const headH = el.querySelector('.ws-measure-head').offsetHeight / mm;
      const rowEls = [...el.querySelectorAll('.ws-measure-row')];
      const hs = rowEls.map((r) => r.offsetHeight / mm);
      const firstCap = PAGE_H_MM - PAD_TOP - PAD_BOTTOM - FOOTER - headH - GAP;
      const nextCap = PAGE_H_MM - PAD_TOP - PAD_BOTTOM - FOOTER - RUNHEAD;
      const out = [[]];
      let used = 0;
      hs.forEach((h, i) => {
        if (rows[i]?.[0]?.pageBreakBefore && out[out.length - 1].length) { out.push([]); used = 0; }
        const cap = out.length === 1 ? firstCap : nextCap;
        if (out[out.length - 1].length && used + h > cap) { out.push([]); used = 0; }
        out[out.length - 1].push(i);
        used += h + GAP;
      });
      setPages(out);
    };
    run();
    document.fonts?.ready.then(run);
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows, doc.meta]);

  useLayoutEffect(() => { onPageCount?.(pages.length); }, [pages.length, onPageCount]);

  // Edit mode: double-click a text on the sheet to change it in place (Enter or click away saves, Esc cancels).
  const editInline = (event) => {
    if (mode !== 'edit' || !onEditText) return;
    const card = event.target.closest?.('[data-block]');
    const head = card ? null : event.target.closest?.('.ws-hdr, .ws-title');
    const block = card ? doc.blocks.find((b) => b.id === card.dataset.block) : null;
    if (!block && !head) return;
    // a marked source line (a sentence with gaps, a scheme box…): edit its stored text in a field over it
    const tagged = block ? event.target.closest?.('[data-edit]') : null;
    if (tagged && card.contains(tagged)) {
      const source = editSource(block.data, tagged.dataset.edit);
      if (source) {
        event.preventDefault();
        event.stopPropagation();
        openFloatingEditor({ anchor: tagged, value: source.value, label: 'Muuda rida (lünk nurksulgudes)', onCommit: (next) => { const change = source.write(next); if (change) onEditText(block.id, change.path, change.value); } });
        return;
      }
    }
    const hit = findEditable(event.target, card || head.parentElement, block ? block.data : doc.meta);
    if (!hit) return;
    event.preventDefault();
    event.stopPropagation();
    const { el, path, text } = hit;
    // a formatted text (instruction, text, reading passage): Tiptap right over it, with the formatting bar
    if (block && RICH_FIELDS.has(path[path.length - 1])) {
      const stored = path.reduce((value, key) => (value == null ? value : value[key]), block.data);
      if (typeof stored === 'string') {
        const r = el.getBoundingClientRect();
        const css = globalThis.getComputedStyle?.(el);
        const zoom = el.offsetHeight ? r.height / el.offsetHeight : 1;
        el.classList.add('ws-rich-hidden');
        setRich({
          el, blockId: block.id, path, value: stored, multiline: path[path.length - 1] !== 'instruction',
          rect: { left: r.left + (globalThis.scrollX || 0), top: r.top + (globalThis.scrollY || 0), width: r.width, height: r.height },
          textStyle: css ? { fontFamily: css.fontFamily, fontSize: `${parseFloat(css.fontSize) * (zoom || 1)}px`, lineHeight: css.lineHeight === 'normal' ? 1.4 : `${parseFloat(css.lineHeight) * (zoom || 1)}px`, color: css.color } : {},
        });
        return;
      }
    }
    const draggable = el.closest('[draggable="true"]');
    if (draggable) draggable.draggable = false;
    el.setAttribute('contenteditable', 'plaintext-only');
    el.classList.add('ws-inline-editing');
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = globalThis.getSelection?.();
    selection?.removeAllRanges();
    selection?.addRange(range);
    let cancelled = false;
    const onKey = (e) => {
      e.stopPropagation();
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { cancelled = true; el.blur(); }
    };
    const finish = () => {
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('blur', finish);
      el.removeAttribute('contenteditable');
      el.classList.remove('ws-inline-editing');
      if (draggable) draggable.draggable = true;
      const next = el.textContent.replace(/\s+/g, ' ').trim();
      setRev((value) => value + 1);
      if (!cancelled && next && next !== text) onEditText(block ? block.id : null, path, next);
    };
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', finish);
  };

  const rowView = (row, key, measuring = false) => (
    <div className="ws-row" key={key}>
      {row.map((b, i) => { const C = dnd && mode === 'edit' && !measuring ? DndCard : Card; return <C key={`${b.id}:${rev}`} block={b} num={nums[b.id]} mode={mode} ctx={ctx} theme={doc.meta.theme || ''} selected={!measuring && selectedId === b.id} hovered={!measuring && hoverId === b.id} onHover={mode === 'edit' && !measuring ? setHoverId : undefined} dropHint={dropHint?.id === b.id ? dropHint.side : ''} onSelect={onSelect} focused={focusId === b.id} onPick={onPick} onResize={onResize} onAddItem={onAddItem} onMarks={onMarks} note={blockNotes?.[b.id] || null} extraClass={blockClasses?.[b.id] || ''} toolbar={!measuring && (selectedId === b.id || hoverId === b.id) && renderToolbar ? renderToolbar(b) : null} onInsertAfter={onInsertAfter} joinedBefore={i > 0 && Boolean(b.joined)} joinedAbove={i === 0 && Boolean(b.joined)} joinedAfter={Boolean(row[i + 1]?.joined)} />; })}
    </div>
  );

  return (
    <div ref={rootRef} className={`ws-root mode-${mode} ${doc.meta.theme ? `theme-${doc.meta.theme}` : ''}`} onClick={mode === 'edit' ? () => onSelect?.(null) : undefined} onDoubleClick={mode === 'edit' ? editInline : undefined}>
      {/* hidden measuring layer, same width and styles as a page */}
      <div className="ws-measure" ref={measureRef} aria-hidden="true">
        <div className="ws-measure-head"><Header meta={doc.meta} /></div>
        {rows.map((row, i) => <div className="ws-measure-row" key={i}>{rowView(row, i, true)}</div>)}
      </div>
      {pages.map((idxs, p) => (
        <div className="ws-page" key={p}>
          {p === 0 ? <Header key={`head:${rev}`} meta={doc.meta} /> : <div className="ws-runhead"><span>{doc.meta.title}</span><span>{doc.meta.level}</span></div>}
          <div className="ws-flow">{idxs.map((i) => rows[i] && rowView(rows[i], i))}</div>
          {mode === 'edit' && idxs.length === 0 && (dnd ? <EmptyDrop /> : <div className="ws-empty">Lisa vasakult esimene plokk.</div>)}
          <Footer meta={doc.meta} page={p + 1} pages={pages.length} bookPage={startPage ? startPage + p : undefined} />
        </div>
      ))}
      {rich ? <Suspense fallback={null}><RichInlineEditor key={`${rich.blockId}:${rich.path.join('.')}`} rect={rich.rect} value={rich.value} multiline={rich.multiline} textStyle={rich.textStyle}
        onCommit={(next) => { rich.el.classList.remove('ws-rich-hidden'); setRich(null); onEditText?.(rich.blockId, rich.path, next); }}
        onCancel={() => { rich.el.classList.remove('ws-rich-hidden'); setRich(null); }} /></Suspense> : null}
    </div>
  );
}
