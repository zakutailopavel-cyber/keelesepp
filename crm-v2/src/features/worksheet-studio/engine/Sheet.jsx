/* global ResizeObserver */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BLOCKS, exampleAnswers, numberTasks } from './registry.js';
import { TONES } from './schema.js';
import { Md, Target } from './ui.jsx';
import { COLUMNS, rowsOf, snapSpan, spanOf } from './layout.js';
import { addItemLabel } from './addItem.js';
import { findEditable } from './inlineEdit.js';
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

function Card({ block, num, mode, ctx, selected, onSelect, drag, focused, onPick, onResize, onAddItem, toolbar = null, onInsertAfter, joinedBefore = false, joinedAbove = false, joinedAfter = false }) {
  const def = BLOCKS[block.type];
  if (!def) return null;
  const tone = TONES[block.tone] || TONES.white;
  const look = block.look || {};
  const accent = look.accent ? (TONES[look.accent] || tone).badge : null;
  const LookIcon = LOOK_ICON[look.icon] || null;
  const plain = !def.task && block.tone === 'white' && !look.frame;
  const d = block.data;
  const opts = block.opts || {};
  const example = exampleAnswers(block);
  const hasExample = Object.keys(example).length > 0;
  const base = ctx(block.id);
  const addLabel = mode === 'edit' && selected && onAddItem ? addItemLabel(block) : null;
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
      className={`ws-card ${plain ? 'plain' : ''} ${block.width === 'full' ? 'full' : ''} ${selected ? 'selected' : ''} ${focused ? 'focused' : ''} ${onPick ? 'pickable' : ''} ${hasExample ? 'has-example' : ''} ${block.minHeightMm ? 'is-tall' : ''} ${look.frame ? `frame-${look.frame}` : ''} ${joinedBefore ? 'joined-before' : ''} ${joinedAbove ? 'joined-above' : ''} ${joinedAfter ? 'joined-after' : ''}`}
      data-cols={opts.cols > 1 ? opts.cols : undefined}
      data-size={opts.size || undefined}
      style={{ ...(plain ? {} : { background: tone.card }), gridColumn: `span ${spanOf(block)}`, ...(block.minHeightMm ? { minHeight: `${block.minHeightMm}mm` } : {}), ...(accent ? { '--ws-accent': accent } : {}) }}
      data-block={block.id}
      onClick={mode === 'edit' ? (e) => { e.stopPropagation(); onSelect?.(block.id); } : onPick ? () => onPick(block.id) : undefined}
      draggable={mode === 'edit'}
      onDragStart={mode === 'edit' ? (e) => drag.start(e, block.id) : undefined}
      onDragOver={mode === 'edit' ? (e) => drag.over(e, block.id) : undefined}
      onDrop={mode === 'edit' ? (e) => drag.drop(e, block.id) : undefined}
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
      {addLabel ? <button type="button" className="ws-add" onClick={(e) => { e.stopPropagation(); onAddItem(block.id); }}>+ {addLabel}</button> : null}
      {mode === 'edit' && selected && onResize ? <ResizeHandles block={block} onResize={onResize} /> : null}
      {mode === 'edit' && selected && toolbar ? <div className="ws-toolbar" role="toolbar" aria-label="Ploki tööriistad" onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>{toolbar}</div> : null}
      {mode === 'edit' && onInsertAfter ? <button type="button" className="ws-insert" title="Lisa plokk selle järele" aria-label="Lisa plokk selle järele" onClick={(e) => { e.stopPropagation(); onInsertAfter(block.id); }}>+</button> : null}
    </section>
  );
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
    const move = (e) => {
      if (axis === 'x') {
        const raw = (e.clientX - rowRect.left) / colWidth - startCol;
        card.dataset.previewSpan = String(snapSpan(Math.max(1, raw)));
        card.style.gridColumn = `span ${Math.min(COLUMNS - startCol, snapSpan(Math.max(1, raw)))}`;
      } else {
        const mm = Math.max(20, (e.clientY - cardRect.top) / pxPerMm);
        card.dataset.previewHeight = String(Math.round(mm));
        card.style.minHeight = `${Math.round(mm)}mm`;
      }
    };
    const up = () => {
      globalThis.removeEventListener('pointermove', move);
      globalThis.removeEventListener('pointerup', up);
      // the click that ends a resize must not deselect the block
      const swallow = (e) => e.stopPropagation();
      globalThis.addEventListener('click', swallow, { capture: true, once: true });
      globalThis.setTimeout(() => globalThis.removeEventListener('click', swallow, { capture: true }), 0);
      if (axis === 'x' && card.dataset.previewSpan) onResize(block.id, { span: Number(card.dataset.previewSpan) });
      if (axis === 'y' && card.dataset.previewHeight) onResize(block.id, { minHeightMm: Number(card.dataset.previewHeight) });
      delete card.dataset.previewSpan;
      delete card.dataset.previewHeight;
    };
    globalThis.addEventListener('pointermove', move);
    globalThis.addEventListener('pointerup', up);
  };
  return (
    <>
      <span className="ws-resize ws-resize-x" role="separator" aria-orientation="vertical" aria-label="Muuda laiust" title="Lohista, et muuta laiust" onPointerDown={(e) => start(e, 'x')} onClick={(e) => e.stopPropagation()} />
      <span className="ws-resize ws-resize-y" role="separator" aria-orientation="horizontal" aria-label="Muuda kõrgust" title="Lohista, et muuta kõrgust" onPointerDown={(e) => start(e, 'y')} onClick={(e) => e.stopPropagation()} />
    </>
  );
}

export default function Sheet({ doc, mode = 'interactive', answers = {}, setAnswer, results = {}, selectedId, onSelect, onMove, onResize, onAddItem, onEditText, renderToolbar, onInsertAfter, startPage, onPageCount, focusId, onPick }) {
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

  // drag & drop reorder (edit mode)
  const dragId = useRef(null);
  const drag = {
    start: (e, id) => { dragId.current = id; e.dataTransfer.effectAllowed = 'move'; },
    over: (e) => { e.preventDefault(); },
    drop: (e, id) => { e.preventDefault(); if (dragId.current && dragId.current !== id) onMove?.(dragId.current, id); dragId.current = null; },
  };

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
    const hit = findEditable(event.target, card || head.parentElement, block ? block.data : doc.meta);
    if (!hit) return;
    event.preventDefault();
    event.stopPropagation();
    const { el, path, text } = hit;
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

  const rowView = (row, key) => (
    <div className="ws-row" key={key}>
      {row.map((b, i) => <Card key={`${b.id}:${rev}`} block={b} num={nums[b.id]} mode={mode} ctx={ctx} selected={selectedId === b.id} onSelect={onSelect} drag={drag} focused={focusId === b.id} onPick={onPick} onResize={onResize} onAddItem={onAddItem} toolbar={selectedId === b.id && renderToolbar ? renderToolbar(b) : null} onInsertAfter={onInsertAfter} joinedBefore={i > 0 && Boolean(b.joined)} joinedAbove={i === 0 && Boolean(b.joined)} joinedAfter={Boolean(row[i + 1]?.joined)} />)}
    </div>
  );

  return (
    <div className={`ws-root mode-${mode}`} onClick={mode === 'edit' ? () => onSelect?.(null) : undefined} onDoubleClick={mode === 'edit' ? editInline : undefined}>
      {/* hidden measuring layer, same width and styles as a page */}
      <div className="ws-measure" ref={measureRef} aria-hidden="true">
        <div className="ws-measure-head"><Header meta={doc.meta} /></div>
        {rows.map((row, i) => <div className="ws-measure-row" key={i}>{rowView(row, i)}</div>)}
      </div>
      {pages.map((idxs, p) => (
        <div className="ws-page" key={p}>
          {p === 0 ? <Header key={`head:${rev}`} meta={doc.meta} /> : <div className="ws-runhead"><span>{doc.meta.title}</span><span>{doc.meta.level}</span></div>}
          <div className="ws-flow">{idxs.map((i) => rows[i] && rowView(rows[i], i))}</div>
          {mode === 'edit' && idxs.length === 0 && <div className="ws-empty">Lisa vasakult esimene plokk.</div>}
          <Footer meta={doc.meta} page={p + 1} pages={pages.length} bookPage={startPage ? startPage + p : undefined} />
        </div>
      ))}
    </div>
  );
}
