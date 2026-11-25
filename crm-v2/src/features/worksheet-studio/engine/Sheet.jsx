/* global ResizeObserver */
import { IN_LESSON_LABEL, isInLesson } from './inLesson.js';
import FreeLayer, { FreeFlow } from './FreeLayer.jsx';
import { flowItems, freeItemsOf, itemsOnPage } from './freeLayer.js';
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { lazyComponent } from '../../../app/lazyComponent.js';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { dragId, dropId, lastBlockOf } from './dragIds.js';
import { BLOCKS, exampleAnswers, numberTasks } from './registry.js';
import { isExamSheet, keepsWithNext, onScreenContinuous } from './examMode.js';
import { TONES } from './schema.js';
import { Md, Target } from './ui.jsx';
import { COLUMNS, rowsOf, snapSpan, spanOf } from './layout.js';
import { addItemLabel } from './addItem.js';
import { editSource, findEditable } from './inlineEdit.js';
import { openFloatingEditor } from './floatingEditor.js';
import MarksLayer from './Marks.jsx';
import FloatingNote from './FloatingNote.jsx';
import { courseBadge } from '../../curriculum/courseNames.js';
// Tiptap is loaded only when a teacher opens a text for formatting (students never download it)
const RichInlineEditor = lazyComponent(() => import('./RichInlineEditor.jsx'));
import { themeClass, themedTone } from './look.js';
import { SPLITTABLE, canShrink, canSplit, canStack, itemCount, minItemsOf, packPages, shiftKey, sliceBlock, stackedBlock } from './pageSplit.js';
import { focusNextField } from '../sheetFlow.js';
import { answerFontClass, useAnswerFont } from '../answerFont.js';
import { TranscriptContext, hasCheck, hasTranscript } from './transcript.js';

// texts that may carry formatting (bold, colour, highlight) — they are rendered with <Md>
const RICH_FIELDS = new Set(['instruction', 'text', 'passage']);
import { BookOpen, CheckCircle2, Clock3, Headphones, Lightbulb, MessageCircle, PenLine, Star } from 'lucide-react';

// Renders a worksheet document as real A4 pages (270 mm design canvas, zoomed to A4 when printed).
// The same component serves the editor (mode "edit"), the student (mode "interactive") and print ("print").
// `flow` (the student's phone or tablet, ../sheetFlow.js): the same blocks and answers in one column, without pages.

const PAGE_H_MM = 381.86;
const PAD_TOP = 11, PAD_BOTTOM = 9, FOOTER = 12, GAP = 4, RUNHEAD = 12;
// a compact sheet (meta.density) has 3 mm between rows (sheet.css .density-compact)
const gapOf = (meta) => (meta?.density === 'compact' ? 3 : GAP);
const densityClass = (meta) => (meta?.density === 'compact' ? 'density-compact' : '');

function Header({ meta }) {
  return (
    <>
      <div className="ws-hdr">
        <div className="ws-brand"><div className="ws-logo">KeeleSepp<small>by EP Koolitus</small></div>{meta.slogan && <div className="ws-slogan">{meta.slogan}</div>}</div>
        <div className="ws-hbox"><b>{meta.level} · {meta.title}</b>{meta.module && <div className="ws-mod">{meta.module}</div>}{meta.canDo && <div className="ws-cando"><Target /><span>{meta.canDo}</span></div>}</div>
        <div className="ws-lvl"><div className="ws-big">{meta.level}</div><div className="ws-t">{courseBadge(meta.badge, meta.level)}</div></div>
      </div>
      <div className="ws-title"><h2>{meta.title}</h2>{meta.subtitle && <p>{meta.subtitle}</p>}</div>
    </>
  );
}

// In a book (startPage set) pages carry the book page number; a single sheet shows "page/pages".
// `running` (Õpik): the book's own running head and footer line instead of the sheet's
const Footer = ({ meta, page, pages, bookPage, running = null }) => (
  <div className="ws-ftr"><div className="ws-fl">KeeleSepp <small>by EP Koolitus</small></div><em>{meta.footer?.tagline}</em><div className="ws-url">{running?.foot ?? meta.footer?.url}{bookPage ? ` · ${bookPage}` : pages > 1 ? ` · ${page}/${pages}` : ''}</div></div>
);
const RunHead = ({ meta, running }) => (
  <div className={`ws-runhead${running ? ' is-book' : ''}`}><span>{running ? running.head?.[0] : meta.title}</span><span>{running ? running.head?.[1] : meta.level}</span></div>
);

const LOOK_ICON = { speak: MessageCircle, listen: Headphones, read: BookOpen, write: PenLine, idea: Lightbulb, star: Star, time: Clock3, check: CheckCircle2 };

function Card({ block, num, mode, ctx, theme = '', selected, hovered = false, onHover, dropHint = '', onSelect, dndRef = null, dndListeners = null, dragging = false, focused, onPick, onResize, onAddItem, onMarks, note = null, pop = null, badge = null, extraClass = '', toolbar = null, barSide = 'right', onInsertAfter, joinedBefore = false, joinedAbove = false, joinedAfter = false, part = null, flow = false, entity = true }) {
  // the card itself: a floating note (FloatingNote) is placed next to it
  const cardRef = useRef(null);
  const setCardRef = useCallback((node) => {
    cardRef.current = node;
    if (typeof dndRef === 'function') dndRef(node);
  }, [dndRef]);
  const def = BLOCKS[block.type];
  if (!def) return null;
  const tone = themedTone(theme, block.tone || 'white', TONES[block.tone] || TONES.white);
  const look = block.look || {};
  const accent = look.accent ? themedTone(theme, look.accent, TONES[look.accent] || tone).badge : null;
  const LookIcon = LOOK_ICON[look.icon] || null;
  const plain = !def.task && block.tone === 'white' && !look.frame;
  // a part of a task split over pages (pageSplit.js): only its items, answer keys shifted to the items' place
  const sliced = part ? sliceBlock(block, part.from, part.to) : null;
  const from = sliced?.start || 0;
  const continued = Boolean(part?.from);
  const d = sliced ? sliced.block.data : block.data;
  const opts = block.opts || {};
  const example = continued ? {} : exampleAnswers(block);
  const hasExample = Object.keys(example).length > 0;
  const whole = ctx(block.id);
  const base = from ? { ...whole, start: from, get: (k) => whole.get(shiftKey(k, from)), set: (k, v) => whole.set(shiftKey(k, from), v), state: (k) => whole.state(shiftKey(k, from)) } : whole;
  const addLabel = mode === 'edit' && selected && onAddItem ? addItemLabel(block) : null;
  // the tools show on hover as well as on the selected block
  const active = mode === 'edit' && (selected || hovered);
  // the solved example is read-only and shown in every mode (edit, print, student); on an exam sheet (meta.exam) it is
  // item 0 and the items count from 1 after it, as in the e-exam (engine/examMode.js)
  const blockCtx = hasExample || opts.shuffle || opts.keepOrder ? {
    ...base,
    shuffle: Boolean(opts.shuffle),
    keepOrder: Boolean(opts.keepOrder),
    get: (k) => (k in example ? example[k] : base.get(k)),
    set: (k, v) => { if (!(k in example)) base.set(k, v); },
    state: (k) => (k in example ? undefined : base.state(k)),
    isExample: (k) => k in example,
    ...(hasExample && whole.exam ? { numFrom: 0 } : {}),
  } : base;
  // data-entity / data-block-id: the marks other tools attach to (the book's right-click menu); not on the hidden
  // measuring copy, so a lookup by block id finds the drawn card
  return (
    <section
      className={`ws-card ${plain ? 'plain' : ''} ${block.width === 'full' ? 'full' : ''} ${selected ? 'selected' : ''} ${focused ? 'focused' : ''} ${onPick ? 'pickable' : ''} ${hasExample ? 'has-example' : ''} ${block.minHeightMm && !flow ? 'is-tall' : ''} ${look.frame ? `frame-${look.frame}` : ''} ${joinedBefore && !flow ? 'joined-before' : ''} ${joinedAbove && !flow ? 'joined-above' : ''} ${joinedAfter && !flow ? 'joined-after' : ''} ${hovered && !selected ? 'hovered' : ''} ${dropHint ? `drop-${dropHint}` : ''} ${dragging ? 'is-dragging' : ''} ${part ? (continued ? 'is-part-cont' : 'is-part-first') : ''} ${part && SPLITTABLE[block.type]?.stacked ? 'is-part-stack' : ''} ${look.head ? `head-${look.head}` : ''} ${look.num ? `num-${look.num}` : ''} ${extraClass}`}
      data-cols={opts.cols > 1 && !flow ? opts.cols : undefined}
      data-size={flow ? undefined : opts.size || undefined}
      style={{ ...(plain ? {} : { background: tone.card }), ...(flow ? {} : { gridColumn: `span ${spanOf(block)}` }), ...(block.minHeightMm && !flow ? { minHeight: `${block.minHeightMm}mm` } : {}), ...(accent ? { '--ws-accent': accent } : {}), '--ws-badge': accent || tone.badge }}
      data-block={block.id}
      data-type={block.type}
      data-entity={entity ? 'block' : undefined}
      data-block-id={entity ? block.id : undefined}
      onClick={mode === 'edit' ? (e) => { e.stopPropagation(); onSelect?.(block.id); } : onPick ? () => onPick(block.id) : undefined}
      ref={setCardRef}
      {...(dndListeners || {})}
      onMouseEnter={mode === 'edit' && onHover ? () => onHover(block.id) : undefined}
      onMouseLeave={mode === 'edit' && onHover ? () => onHover(null) : undefined}
    >
      {!def.task && LookIcon ? <LookIcon className="ws-look-icon is-corner" aria-hidden="true" /> : null}
      {def.task && (
        <div className="ws-ch">
          <div className="ws-num" style={{ background: accent || tone.badge }}>{num}</div>
          <div>
            <h3>{LookIcon ? <LookIcon className="ws-look-icon" aria-hidden="true" /> : null}{/* a title stays plain text (edited in place on the sheet) unless it holds a formula */}{String(d.title || '').includes('$') ? <Md text={d.title} /> : d.title}{d.titleMore ? <span> {d.titleMore}</span> : null}{continued ? <span className="ws-cont"> (järg)</span> : null}</h3>
            {d.instruction && !continued && <p><Md text={d.instruction} /></p>}
            {isInLesson(block) && !continued ? <p className="ws-inlesson">👥 {IN_LESSON_LABEL}</p> : null}
          </div>
        </div>
      )}
      {/* body fills the rest of a block made taller than its content (see .is-tall in sheet.css) */}
      <div className="ws-body"><def.View data={d} ctx={blockCtx} id={block.id} /></div>
      {note ? <div className="ws-card-note">{note}</div> : null}
      {/* a label over the card's edge, out of the flow: the card keeps its size */}
      {badge && !continued ? <div className="ws-card-badge">{badge}</div> : null}
      {pop && !continued && entity ? <FloatingNote anchorRef={cardRef} blockId={block.id} {...pop} /> : null}
      <MarksLayer block={block} flow={flow} editable={mode === 'edit' && Boolean(onMarks)} onChange={(next) => onMarks?.(block.id, next.marks)} />
      {addLabel ? <button type="button" className="ws-add" onClick={(e) => { e.stopPropagation(); onAddItem(block.id); }}>+ {addLabel}</button> : null}
      {active && onResize ? <ResizeHandles block={block} onResize={onResize} /> : null}
      {active && toolbar ? <div className={`ws-toolbar is-${barSide}`} role="toolbar" aria-label="Ploki tööriistad" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>{toolbar}</div> : null}
      {mode === 'edit' && onInsertAfter ? <button type="button" className="ws-insert" title="Lisa plokk selle järele" aria-label="Lisa plokk selle järele" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onInsertAfter(block.id); }}>+</button> : null}
    </section>
  );
}

// a single card (a part of a split task is drawn through it) — exported for the block tests
export { Card as SheetCard };

// A small picture of a block for the palette: the real card drawn in print mode, scaled down, never interactive.
const NO_ANSWERS = () => ({ interactive: false, review: false, get: () => undefined, set: () => {}, state: () => undefined, focus: {}, setFocus: () => {} });
export function BlockPreview({ block, theme = '' }) {
  return (
    <div className={`ws-root ws-thumb mode-print ${themeClass(theme)}`} aria-hidden="true" inert>
      <div className="ws-thumb-page"><div className="ws-row"><Card block={{ ...block, span: COLUMNS, width: 'full' }} num={1} mode="print" ctx={NO_ANSWERS} theme={theme} entity={false} /></div></div>
    </div>
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
// the free space under the last block of a page (owner 2026-10-13: a block dragged into the empty bottom of page 1
// did nothing): it lights up and a dropped block goes after the page's last block — it stays on this page if it fits
function PageTailDrop({ page, lastId }) {
  const { setNodeRef, isOver, active } = useDroppable({ id: `drop:__page:${page}`, data: { kind: 'pageEnd', id: lastId } });
  return <div ref={setNodeRef} className={`ws-page-tail ${active ? 'is-dragging' : ''} ${isOver ? 'is-over' : ''}`} aria-hidden="true">{isOver ? <span>Pane siia</span> : null}</div>;
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

export default function Sheet({ doc, mode = 'interactive', answers = {}, setAnswer, results = {}, selectedId, onSelect, dropHint = null, dnd = false, onResize, onAddItem, onMarks, onEditText, renderToolbar, onInsertAfter, startPage, onPageCount, focusId, onPick, blockNotes = null, blockPopovers = null, blockBadges = null, blockClasses = null, flow = false, running = null, lead = null, transcripts = null, onPatch = null, freeEdit = null }) {
  // bumped after an inline edit so React redraws the text the browser changed in place
  const [rev, setRev] = useState(0);
  // „Kiri”: the viewer's own font for typed answers (answerFont.js); plain by default
  const [answerFont] = useAnswerFont();
  const fontClass = answerFontClass(answerFont);
  const nums = useMemo(() => numberTasks(doc.blocks), [doc.blocks]);
  // „Vaba kiht” (freeLayer.js): pictures, shapes and text boxes placed freely on the pages
  const freeItems = useMemo(() => freeItemsOf(doc), [doc]);
  const [focus, setFocusState] = useState({});
  const interactive = mode === 'interactive';
  const showAnswers = mode === 'interactive' || mode === 'review';
  const examSheet = isExamSheet(doc);
  const ctx = (id) => ({
    interactive,
    flow,
    exam: examSheet,
    review: mode === 'review',
    // a teacher or admin looks (the player's role, the studio): the points of an exam rubric are theirs to give
    staff: transcripts?.role === 'staff',
    // answers are only shown to the learner (and in teacher review); print and edit stay blank
    get: (k) => (showAnswers ? answers[`${id}:${k}`] : undefined),
    set: (k, v) => setAnswer?.(`${id}:${k}`, v),
    state: (k) => (showAnswers ? results[`${id}:${k}`] : undefined),
    focus,
    setFocus: (bid, v) => setFocusState((f) => ({ ...f, [bid]: v })),
    // the constructor: a block changes its own data from the sheet (a picture in a text dragged or resized), undoable
    patch: mode === 'edit' && onPatch ? (dataPatch) => onPatch(id, dataPatch) : null,
  });

  const [hoverId, setHoverId] = useState(null);

  // The text of the listening tasks (transcript.js, ListenTranscript.jsx). `transcripts` = { role: 'staff' | 'student',
  // submitted, revealed: [blockId] (the teacher shows it in the live lesson), answersShown: [blockId], onLive, busy };
  // without it the tasks show only the player. Open / closed and „played to the end” live here, so the measuring copy
  // and the drawn card agree (the pages are packed again when a text opens).
  const [scriptOpen, setScriptOpen] = useState({});
  const [scriptEnded, setScriptEnded] = useState({});
  const revealedKey = (transcripts?.revealed || []).join(',');
  // a text the teacher shows (or hides) opens (or closes) on both screens: the viewer's own earlier choice gives way
  const [seenRevealed, setSeenRevealed] = useState(revealedKey);
  if (seenRevealed !== revealedKey) {
    const before = new Set(seenRevealed ? seenRevealed.split(',') : []);
    const now = new Set(revealedKey ? revealedKey.split(',') : []);
    setSeenRevealed(revealedKey);
    const changed = Object.keys(scriptOpen).filter((id) => before.has(id) !== now.has(id));
    if (changed.length) setScriptOpen((open) => Object.fromEntries(Object.entries(open).filter(([id]) => !changed.includes(id))));
  }
  const scriptBlocks = useMemo(() => doc.blocks.filter((b) => hasTranscript(b.type, b.data)), [doc.blocks]);
  const role = transcripts?.role || '';
  const answersShownKey = (transcripts?.answersShown || []).join(',');
  const transcriptValue = useMemo(() => {
    if (!role || !scriptBlocks.length || mode === 'edit') return null;
    const revealed = new Set(transcripts.revealed || []);
    return {
      role,
      submitted: Boolean(transcripts.submitted),
      revealed,
      answersShown: new Set(transcripts.answersShown || []),
      checks: new Set(scriptBlocks.filter((b) => hasCheck(BLOCKS[b.type], b.data)).map((b) => b.id)),
      onLive: role === 'staff' ? transcripts.onLive || null : null,
      busy: Boolean(transcripts.busy),
      isOpen: (id) => (id in scriptOpen ? scriptOpen[id] : revealed.has(id)),
      setOpen: (id, open) => setScriptOpen((all) => ({ ...all, [id]: open })),
      ended: (id) => Boolean(scriptEnded[id]),
      markEnded: (id) => setScriptEnded((all) => (all[id] ? all : { ...all, [id]: true })),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the fields of `transcripts` are listed one by one
  }, [role, scriptBlocks, mode, revealedKey, transcripts?.submitted, answersShownKey, transcripts?.onLive, transcripts?.busy, scriptOpen, scriptEnded]);

  // Notes that open on a task (the teacher's answer key, the right answers shown to the learner) float next to it
  // (FloatingNote), one at a time: the one the user opened, else the task being typed in, else the task the teacher
  // points at, else the task nearest the screen's middle; the others wait as a button. A note without its own onClose
  // is closed here (and opens again from its button).
  const popGroup = useMemo(() => new Map(), []);
  const popIds = useMemo(() => Object.keys(blockPopovers || {}), [blockPopovers]);
  const [closedPops, setClosedPops] = useState(() => new Set());
  const [chosenPop, setChosenPop] = useState('');
  const [typingIn, setTypingIn] = useState('');
  const popKey = popIds.join(',');
  // a note that went away and comes back (the teacher hides and shows the answers again) opens again: adjusted while
  // rendering when the set of notes changes (no effect, so no extra render pass)
  const [seenPopKey, setSeenPopKey] = useState(popKey);
  if (seenPopKey !== popKey) {
    setSeenPopKey(popKey);
    const kept = [...closedPops].filter((id) => popIds.includes(id));
    if (kept.length !== closedPops.size) setClosedPops(new Set(kept));
  }
  const popFor = (id) => {
    const item = blockPopovers?.[id];
    if (!item || mode === 'edit') return null;
    const close = item.onClose || (() => { setClosedPops((closed) => new Set(closed).add(id)); setChosenPop((current) => (current === id ? '' : current)); });
    return {
      label: item.label || 'Märkus', chip: item.chip || '', ownClose: Boolean(item.ownClose), onClose: close, children: item.content,
      group: popGroup, closed: closedPops.has(id), rank: chosenPop === id ? 0 : typingIn === id ? 1 : focusId === id ? 2 : 3,
      onOpen: () => { setClosedPops((closed) => { if (!closed.has(id)) return closed; const next = new Set(closed); next.delete(id); return next; }); setChosenPop(id); },
    };
  };
  const trackTyping = (event) => {
    const id = event.target?.closest?.('[data-block]')?.dataset?.block || '';
    if (id && id !== typingIn) { setTypingIn(id); setChosenPop(''); }
  };
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

  // An exam sheet on screen is one continuous A4-wide page (examMode.js onScreenContinuous): no page breaks and page
  // footers between the tasks. Printing redraws it as A4 pages first (beforeprint), so paper keeps its pagination.
  const [printing, setPrinting] = useState(false);
  const continuous = onScreenContinuous(doc, mode) && !printing;
  const continuousCapable = onScreenContinuous(doc, mode);
  useEffect(() => {
    if (!continuousCapable) return undefined;
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    globalThis.addEventListener?.('beforeprint', before);
    globalThis.addEventListener?.('afterprint', after);
    return () => {
      globalThis.removeEventListener?.('beforeprint', before);
      globalThis.removeEventListener?.('afterprint', after);
    };
  }, [continuousCapable]);

  // --- pagination: measure rows in a hidden layer, then pack them into A4 pages ---
  const rows = useMemo(() => rowsOf(doc.blocks), [doc.blocks]);
  const measureRef = useRef(null);
  const [pages, setPages] = useState([rows.map((_, i) => i)]);
  // pages whose content is taller than A4 (one very long reading): they grow instead of clipping the text
  const [tallPages, setTallPages] = useState([]);
  useLayoutEffect(() => {
    // a continuous page needs no measuring (shownPages below)
    if (continuous) return undefined;
    const el = measureRef.current;
    if (!el) return undefined;
    const run = () => {
      const mm = el.offsetWidth / 270;
      // cannot measure (hidden tab, test DOM): show everything on one page instead of dropping rows
      if (!mm) { setPages([rows.map((_, i) => i)]); setTallPages([]); return; }
      const headH = el.querySelector('.ws-measure-head').offsetHeight / mm;
      const rowEls = [...el.querySelectorAll('.ws-measure-row')];
      const gap = gapOf(doc.meta);
      const firstCap = PAGE_H_MM - PAD_TOP - PAD_BOTTOM - FOOTER - headH - gap;
      const nextCap = PAGE_H_MM - PAD_TOP - PAD_BOTTOM - FOOTER - RUNHEAD;
      // a list task alone in its row may continue on the next page (pageSplit.js); not while editing, where a text is
      // edited by its line number in the whole block
      const splitOf = (block, holder) => {
        const spec = SPLITTABLE[block.type];
        if (!holder) return null;
        const box = holder.getBoundingClientRect();
        const scale = holder.offsetHeight ? box.height / holder.offsetHeight : 1;
        const at = (y) => (y - box.top) / (scale || 1) / mm;
        const card = holder.querySelector('.ws-card');
        const raw = typeof spec.items === 'function' ? spec.items(card, block) : [...holder.querySelectorAll(spec.items)].map((it) => it.getBoundingClientRect());
        const items = raw.map((b) => ({ top: at(b.top), bottom: at(b.bottom) }));
        if (!items.length || items.length !== itemCount(block)) return null;
        return { head: items[0].top, tail: holder.offsetHeight / mm - items[items.length - 1].bottom, items, min: minItemsOf(block) };
      };
      const measured = rowEls.map((r, i) => {
        const h = r.offsetHeight / mm;
        const row = { h, breakBefore: Boolean(rows[i]?.[0]?.pageBreakBefore), keepWithNext: keepsWithNext({ meta: doc.meta }, rows[i], rows[i + 1]) };
        // side by side tasks: each also measured alone over the whole width, to be placed one under the other when
        // their row does not fit (pageSplit.js canStack)
        if (canStack(rows[i], mode)) {
          const stack = rows[i].map((b, k) => {
            const m = el.querySelector(`.ws-measure-member[data-row="${i}"][data-member="${k}"]`);
            if (!m) return null;
            const wide = stackedBlock(b);
            const split = canSplit(wide, mode) && !SPLITTABLE[b.type].stacked ? splitOf(wide, m) : null;
            return { h: m.offsetHeight / mm, ...(split ? { split } : {}) };
          });
          return stack.every(Boolean) ? { ...row, stack } : row;
        }
        // a row with a picture: the picture's height and the natural height of the blocks beside it (a card is
        // stretched to its row, so its content is measured)
        if (canShrink(rows[i], mode)) {
          const cards = [...r.querySelectorAll(':scope > .ws-row > .ws-card')];
          const photo = r.querySelector(':scope > .ws-row > .ws-card[data-type="image"] .ws-photo');
          const natural = (card) => {
            const top = card.getBoundingClientRect().top;
            const bottom = Math.max(top, ...[...card.children].map((c) => c.getBoundingClientRect().bottom));
            const css = globalThis.getComputedStyle?.(card);
            const pad = css ? (parseFloat(css.paddingBottom) || 0) + (parseFloat(css.borderBottomWidth) || 0) : 0;
            const scale = card.offsetHeight ? card.getBoundingClientRect().height / card.offsetHeight : 1;
            return ((bottom - top) / (scale || 1) + pad) / mm;
          };
          const others = cards.filter((c) => c.dataset.type !== 'image').map(natural);
          if (photo) return { ...row, shrink: { photo: photo.offsetHeight / mm, others: Math.max(0, ...others) } };
          return row;
        }
        const block = rows[i]?.length === 1 ? rows[i][0] : null;
        if (!block || !canSplit(block, mode)) return row;
        // a reading is split in its one-column form, drawn once more for measuring
        const split = splitOf(block, SPLITTABLE[block.type].stacked ? el.querySelector(`.ws-measure-stack[data-row="${i}"]`) : r);
        return split ? { ...row, split } : row;
      });
      const { pages: out, tall } = packPages(measured, { firstCap, nextCap, gap });
      setPages(out);
      setTallPages(tall);
    };
    run();
    document.fonts?.ready.then(run);
    const ro = new ResizeObserver(run);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rows, doc.meta, mode, flow, fontClass, continuous]);

  // the continuous screen page: every row on one page that grows with its tasks
  const shownPages = useMemo(() => (continuous ? [rows.map((_, i) => i)] : pages), [continuous, rows, pages]);
  const shownTall = continuous ? [true] : tallPages;
  useLayoutEffect(() => { onPageCount?.(shownPages.length); }, [shownPages.length, onPageCount]);

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

  // Touch (owner 2026-11-11: „editing the Õpik on a tablet is awkward”): a double tap zooms the page on a tablet, so a
  // finger edits with two single taps — the first selects the block (its bar and settings), a second tap on a text of
  // the selected block (or on the sheet's title) opens the same in-place editor a double click opens with a mouse.
  const pointerKind = useRef('mouse');
  const notePointer = (event) => { pointerKind.current = event.pointerType || 'mouse'; };
  const tapToEdit = (event) => {
    if (mode !== 'edit' || !onEditText || pointerKind.current === 'mouse') return;
    if (event.target.closest?.('button, input, select, textarea, a, [role="toolbar"], .ws-resize, [contenteditable]')) return;
    const card = event.target.closest?.('[data-block]');
    if (card ? card.dataset.block !== selectedId : !event.target.closest?.('.ws-hdr, .ws-title')) return;
    // the on-screen keyboard takes the lower ~40 %: a text below the middle first moves up, then the editor opens on it
    const view = globalThis.visualViewport?.height || globalThis.innerHeight || 0;
    const box = event.target.getBoundingClientRect?.();
    if (view && box && box.bottom > view * 0.55) event.target.scrollIntoView?.({ block: 'start' });
    editInline(event);
  };
  const editProps = mode === 'edit' ? { onPointerDownCapture: notePointer, onClickCapture: tapToEdit, onDoubleClick: editInline } : {};

  // scale: a row drawn with its picture smaller to fit the page (pageSplit.js canShrink)
  const rowView = (row, key, measuring = false, part = null, scale = 0) => (
    <div className={`ws-row${scale ? ' is-pic-fit' : ''}`} key={key} style={scale ? { '--ws-pic-scale': scale } : undefined}>
      {row.map((b, i) => { const C = dnd && mode === 'edit' && !measuring ? DndCard : Card; return <C key={`${b.id}:${rev}`} block={b} num={nums[b.id]} mode={mode} ctx={ctx} theme={doc.meta.theme || ''} selected={!measuring && selectedId === b.id} hovered={!measuring && hoverId === b.id} onHover={mode === 'edit' && !measuring ? setHoverId : undefined} dropHint={dropHint?.id === b.id ? dropHint.side : ''} onSelect={onSelect} focused={focusId === b.id} onPick={onPick} onResize={onResize} onAddItem={onAddItem} onMarks={onMarks} note={blockNotes?.[b.id] || null} pop={measuring ? null : popFor(b.id)} badge={blockBadges?.[b.id] || null} extraClass={blockClasses?.[b.id] || ''} toolbar={!measuring && (selectedId === b.id || hoverId === b.id) && renderToolbar ? renderToolbar(b) : null} barSide={i === 0 ? 'left' : 'right'} onInsertAfter={onInsertAfter} flow={flow} joinedBefore={i > 0 && Boolean(b.joined)} joinedAbove={i === 0 && Boolean(b.joined)} joinedAfter={Boolean(row[i + 1]?.joined)} part={part} entity={!measuring} />; })}
    </div>
  );

  // a page entry (pageSplit.js packPages): a row, a part of a split row, or one block of a stacked row (whole or a part)
  const entryView = (e) => {
    if (typeof e === 'number') return rows[e] && rowView(rows[e], e);
    const row = rows[e.row];
    if (!row) return null;
    if (e.scale) return rowView(row, e.row, false, null, e.scale);
    if (e.member === undefined) return rowView(row, `${e.row}:${e.from}`, false, e);
    const block = row[e.member];
    return block && rowView([stackedBlock(block)], `${e.row}.${e.member}:${e.from ?? ''}`, false, e.from === undefined ? null : e);
  };

  const richEditor = rich ? <Suspense fallback={null}><RichInlineEditor key={`${rich.blockId}:${rich.path.join('.')}`} rect={rich.rect} value={rich.value} multiline={rich.multiline} textStyle={rich.textStyle}
    onCommit={(next) => { rich.el.classList.remove('ws-rich-hidden'); setRich(null); onEditText?.(rich.blockId, rich.path, next); }}
    onCancel={() => { rich.el.classList.remove('ws-rich-hidden'); setRich(null); }} /></Suspense> : null;

  // the column: every block in its order on one long page; nothing to measure, nothing to split
  if (flow) {
    return (
      <TranscriptContext.Provider value={transcriptValue}>
      <div ref={rootRef} className={`ws-root is-flow mode-${mode} ${themeClass(doc.meta.theme)} ${densityClass(doc.meta)} ${fontClass}`} onKeyDown={mode === 'interactive' ? focusNextField : undefined} onFocus={popIds.length ? trackTyping : undefined} onClick={mode === 'edit' ? () => onSelect?.(null) : undefined} {...editProps}>
        <div className="ws-page">
          {lead}
          <Header meta={doc.meta} />
          <div className="ws-flow">{rows.map((row, i) => rowView(row, i))}</div>
          <FreeFlow items={flowItems(freeItems)} />
        </div>
        {richEditor}
      </div>
      </TranscriptContext.Provider>
    );
  }

  return (
    <TranscriptContext.Provider value={transcriptValue}>
    <div ref={rootRef} className={`ws-root mode-${mode} ${themeClass(doc.meta.theme)} ${densityClass(doc.meta)} ${fontClass}`} onFocus={popIds.length ? trackTyping : undefined} onClick={mode === 'edit' ? () => onSelect?.(null) : undefined} {...editProps}>
      {/* hidden measuring layer: a page of its own (same width, padding, font and theme as the real pages), grown to
          its content, so a row is measured exactly as it will be drawn */}
      {continuous ? null : <div className="ws-measure" ref={measureRef} aria-hidden="true"><div className="ws-page-measure">
        <div className="ws-measure-head">{running ? <RunHead meta={doc.meta} running={running} /> : null}{lead}<Header meta={doc.meta} /></div>
        {rows.map((row, i) => <div className="ws-measure-row" key={i}>{rowView(row, i, true)}</div>)}
        {rows.map((row, i) => (row.length === 1 && SPLITTABLE[row[0].type]?.stacked && canSplit(row[0], mode)
          ? <div className="ws-measure-stack" data-row={i} key={`s${i}`}>{rowView(row, `s${i}`, true, { from: 0, to: itemCount(row[0]) })}</div> : null))}
        {rows.map((row, i) => (canStack(row, mode) ? row.map((b, k) => <div className="ws-measure-member" data-row={i} data-member={k} key={`m${i}:${k}`}>{rowView([stackedBlock(b)], `m${i}:${k}`, true)}</div>) : null))}
      </div></div>}
      {shownPages.map((idxs, p) => (
        <div className={`ws-page${shownTall[p] ? ' is-tall' : ''}${continuous ? ' is-continuous' : ''}`} key={p}>
          {p === 0
            ? <>{running ? <RunHead meta={doc.meta} running={running} /> : null}{lead}<Header key={`head:${rev}`} meta={doc.meta} /></>
            : <RunHead meta={doc.meta} running={running} />}
          <div className="ws-flow">{idxs.map(entryView)}</div>
          {mode === 'edit' && idxs.length === 0 && (dnd ? <EmptyDrop /> : <div className="ws-empty">Lisa vasakult esimene plokk.</div>)}
          {dnd && mode === 'edit' && idxs.length > 0 ? <PageTailDrop page={p} lastId={lastBlockOf(rows, idxs)} /> : null}
          <Footer meta={doc.meta} page={p + 1} pages={shownPages.length} bookPage={startPage ? startPage + p : undefined} running={running} />
          <FreeLayer items={itemsOnPage(freeItems, p, shownPages.length)} edit={mode === 'edit' ? freeEdit : null} />
        </div>
      ))}
      {/* fallback={null}: the inline text editor floats over the text being edited, which stays on screen meanwhile */}
      {richEditor}
    </div>
    </TranscriptContext.Provider>
  );
}
