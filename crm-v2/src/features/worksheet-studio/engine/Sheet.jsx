/* global ResizeObserver */
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { BLOCKS, numberTasks } from './registry.js';
import { TONES } from './schema.js';
import { Md, Target } from './ui.jsx';

// Renders a worksheet document as real A4 pages (270 mm design canvas, zoomed to A4 when printed).
// The same component serves the editor (mode "edit"), the student (mode "interactive") and print ("print").

const PAGE_H_MM = 381.86;
const PAD_TOP = 11, PAD_BOTTOM = 9, FOOTER = 12, GAP = 4, RUNHEAD = 12;

function rowsOf(blocks) {
  // full-width blocks take a row; consecutive half-width blocks pair up
  const rows = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const n = blocks[i + 1];
    if (b.width === 'half' && n && n.width === 'half') { rows.push([b, n]); i++; } else rows.push([b]);
  }
  return rows;
}

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

const Footer = ({ meta, page, pages }) => (
  <div className="ws-ftr"><div className="ws-fl">KeeleSepp <small>by EP Koolitus</small></div><em>{meta.footer?.tagline}</em><div className="ws-url">{meta.footer?.url}{pages > 1 ? ` · ${page}/${pages}` : ''}</div></div>
);

function Card({ block, num, mode, ctx, selected, onSelect, drag }) {
  const def = BLOCKS[block.type];
  if (!def) return null;
  const tone = TONES[block.tone] || TONES.white;
  const plain = !def.task && block.tone === 'white';
  const d = block.data;
  return (
    <section
      className={`ws-card ${plain ? 'plain' : ''} ${block.width === 'full' ? 'full' : ''} ${selected ? 'selected' : ''}`}
      style={plain ? undefined : { background: tone.card }}
      data-block={block.id}
      onClick={mode === 'edit' ? (e) => { e.stopPropagation(); onSelect?.(block.id); } : undefined}
      draggable={mode === 'edit'}
      onDragStart={mode === 'edit' ? (e) => drag.start(e, block.id) : undefined}
      onDragOver={mode === 'edit' ? (e) => drag.over(e, block.id) : undefined}
      onDrop={mode === 'edit' ? (e) => drag.drop(e, block.id) : undefined}
    >
      {def.task && (
        <div className="ws-ch">
          <div className="ws-num" style={{ background: tone.badge }}>{num}</div>
          <div>
            <h3>{d.title}{d.titleMore ? <span> {d.titleMore}</span> : null}</h3>
            {d.instruction && <p><Md text={d.instruction} /></p>}
          </div>
        </div>
      )}
      <def.View data={d} ctx={ctx(block.id)} id={block.id} />
    </section>
  );
}

export default function Sheet({ doc, mode = 'interactive', answers = {}, setAnswer, results = {}, selectedId, onSelect, onMove }) {
  const nums = useMemo(() => numberTasks(doc.blocks), [doc.blocks]);
  const [focus, setFocusState] = useState({});
  const interactive = mode === 'interactive';
  const showAnswers = mode === 'interactive' || mode === 'review';
  const ctx = (id) => ({
    interactive,
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

  const rowView = (row, key) => (
    <div className={`ws-row ${row.length === 1 && row[0].width === 'half' ? 'single-half' : ''}`} key={key}>
      {row.map((b) => <Card key={b.id} block={b} num={nums[b.id]} mode={mode} ctx={ctx} selected={selectedId === b.id} onSelect={onSelect} drag={drag} />)}
    </div>
  );

  return (
    <div className={`ws-root mode-${mode}`} onClick={mode === 'edit' ? () => onSelect?.(null) : undefined}>
      {/* hidden measuring layer, same width and styles as a page */}
      <div className="ws-measure" ref={measureRef} aria-hidden="true">
        <div className="ws-measure-head"><Header meta={doc.meta} /></div>
        {rows.map((row, i) => <div className="ws-measure-row" key={i}>{rowView(row, i)}</div>)}
      </div>
      {pages.map((idxs, p) => (
        <div className="ws-page" key={p}>
          {p === 0 ? <Header meta={doc.meta} /> : <div className="ws-runhead"><span>{doc.meta.title}</span><span>{doc.meta.level}</span></div>}
          <div className="ws-flow">{idxs.map((i) => rows[i] && rowView(rows[i], i))}</div>
          {mode === 'edit' && idxs.length === 0 && <div className="ws-empty">Lisa vasakult esimene plokk.</div>}
          <Footer meta={doc.meta} page={p + 1} pages={pages.length} />
        </div>
      ))}
    </div>
  );
}
