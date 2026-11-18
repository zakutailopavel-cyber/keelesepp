import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Md } from '../ui.jsx';
import { chatTurns, gapParagraphs } from './bankDropModel.js';

// Drag from a bank into a running text (the 9th-grade e-exam's reading tasks 2.2 and 2.4) and into the empty replies of a
// conversation (2.1), docs/EXAM_9KL_E_EKSAM.md §3–4. Layouts of `insertion` (data.layout 'chips' | 'chat'); the answers
// and the scoring stay the insertion's: gap n ↔ the option's number (the taken-out parts first, then data.extra).
//   mouse / pen  drag a chip onto a gap (or a placed one to another gap, or back onto the bank)
//   touch        tap a chip, then tap the gap; tap a filled gap to send its chip back to the bank
//   keyboard     every chip and gap is a button: Enter on a chip, then Enter on a gap; Delete on a gap empties it
// Each chip is used once: a chip placed in a gap leaves the bank; placed again elsewhere it moves.

const filled = (v) => v !== undefined && v !== null && v !== '';
const DRAG_START_PX = 5;

function usePlacement(ctx, keys) {
  const valueOf = (key) => (filled(ctx.get(key)) ? Number(ctx.get(key)) : null);
  const placedIn = (oi) => keys.find((key) => valueOf(key) === oi) ?? null;
  const fixed = (key) => Boolean(ctx.isExample?.(key));
  const place = (key, oi) => {
    if (!ctx.interactive || fixed(key)) return;
    const from = placedIn(oi);
    if (from !== null && fixed(from)) return;
    if (from !== null && from !== key) ctx.set(from, '');
    ctx.set(key, oi);
  };
  const clear = (key) => { if (ctx.interactive && !fixed(key)) ctx.set(key, ''); };
  return { valueOf, placedIn, place, clear, fixed };
}

// the shared bank + gaps behaviour: `render({ gap, bank })` lays them out
export function DropTask({ ctx, keys, options, className = '', render, label = (n) => `Lünk ${n}` }) {
  const placement = usePlacement(ctx, keys);
  const [picked, setPicked] = useState(null);
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  const [say, setSay] = useState('');
  const root = useRef(null);
  const swallow = useRef(false);
  const textOf = (oi) => options.find((o) => o.oi === oi)?.text || '';
  const first = ctx.numFrom ?? 1;

  // mouse drag: follow the pointer, light the gap under it, drop on pointer up
  useEffect(() => {
    if (!drag) return undefined;
    const targetAt = (x, y) => {
      const el = document.elementFromPoint?.(x, y);
      if (!el || !root.current?.contains(el)) return null;
      const gap = el.closest('[data-drop-gap]');
      if (gap) return { gap: gap.dataset.dropGap };
      return el.closest('[data-drop-bank]') ? { bank: true } : null;
    };
    const move = (e) => {
      if (!drag.moving && Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < DRAG_START_PX) return;
      setDrag((d) => (d ? { ...d, moving: true, x: e.clientX, y: e.clientY } : d));
      setOver(targetAt(e.clientX, e.clientY));
    };
    const up = (e) => {
      if (drag.moving) {
        swallow.current = true;
        const target = targetAt(e.clientX, e.clientY);
        if (target?.gap !== undefined) placement.place(target.gap, drag.oi);
        else if (target?.bank && drag.from !== null) placement.clear(drag.from);
        setPicked(null);
      }
      setDrag(null);
      setOver(null);
    };
    globalThis.addEventListener('pointermove', move);
    globalThis.addEventListener('pointerup', up);
    globalThis.addEventListener('pointercancel', up);
    return () => {
      globalThis.removeEventListener('pointermove', move);
      globalThis.removeEventListener('pointerup', up);
      globalThis.removeEventListener('pointercancel', up);
    };
  });
  const startDrag = (oi, from) => (e) => {
    if (!ctx.interactive || e.pointerType === 'touch' || e.button !== 0) return;
    if (from !== null && placement.fixed(from)) return;
    swallow.current = false;
    setDrag({ oi, from, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, moving: false });
  };
  const once = (fn) => (e) => { if (swallow.current) { swallow.current = false; e.preventDefault(); return; } fn(e); };

  const chipClick = (oi) => once(() => {
    if (!ctx.interactive) return;
    const next = picked === oi ? null : oi;
    setPicked(next);
    setSay(next === null ? '' : `Valitud „${textOf(oi)}”. Vali lünk.`);
  });
  const gapClick = (key) => once(() => {
    if (!ctx.interactive || placement.fixed(key)) return;
    if (picked !== null) { placement.place(key, picked); setSay(`„${textOf(picked)}” pandi lünka ${Number(key) + first}.`); setPicked(null); return; }
    if (placement.valueOf(key) !== null) { setSay(`„${textOf(placement.valueOf(key))}” läks tagasi panka.`); placement.clear(key); }
  });
  const gapKey = (key) => (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && placement.valueOf(key) !== null) { e.preventDefault(); placement.clear(key); setSay('Lünk on tühi.'); }
  };

  const gap = (key, n, { wide = false } = {}) => {
    const oi = placement.valueOf(key);
    const state = ctx.state(key);
    const example = placement.fixed(key);
    const text = oi === null ? '' : textOf(oi);
    const cls = `ws-dropgap ${oi === null ? 'is-empty' : 'is-filled'} ${wide ? 'is-wide' : ''} ${example ? 'is-example' : ''} ${state && !example ? `is-${state}` : ''} ${over?.gap === key ? 'is-over' : ''} ${picked !== null && oi === null ? 'is-ready' : ''}`;
    if (!ctx.interactive) return <span className={cls} data-drop-gap={key}><b className="ws-dropgap-n">{n}</b>{text ? <Md text={text} /> : null}</span>;
    return (
      <button type="button" className={cls} data-drop-gap={key} disabled={example} aria-label={`${label(n)}: ${text || 'tühi'}`}
        onPointerDown={oi === null ? undefined : startDrag(oi, key)} onClick={gapClick(key)} onKeyDown={gapKey(key)}>
        <b className="ws-dropgap-n" aria-hidden="true">{n}</b>{text ? <Md text={text} /> : <span className="ws-dropgap-dots" aria-hidden="true">…</span>}
      </button>
    );
  };
  const bank = (list = options, { title = 'Vastuste pank' } = {}) => (
    <div className={`ws-dropbank ${over?.bank ? 'is-over' : ''}`} data-drop-bank="" role={ctx.interactive ? 'group' : undefined} aria-label={title}>
      <b className="ws-dropbank-title">{title}</b>
      <div className="ws-dropbank-chips">
        {list.map((o) => {
          const at = placement.placedIn(o.oi);
          const used = at !== null;
          if (!ctx.interactive) return <span key={o.oi} className={`ws-dropchip ${used ? 'is-used' : ''}`}><Md text={o.text} /></span>;
          return (
            <button key={o.oi} type="button" className={`ws-dropchip ${used ? 'is-used' : ''} ${picked === o.oi ? 'is-picked' : ''} ${drag?.moving && drag.oi === o.oi ? 'is-dragging' : ''}`}
              disabled={used} aria-pressed={picked === o.oi} onPointerDown={startDrag(o.oi, null)} onClick={chipClick(o.oi)}>
              <Md text={o.text} />
            </button>
          );
        })}
      </div>
    </div>
  );
  return (
    <div ref={root} className={`ws-drop ${className} ${drag?.moving ? 'is-dragging' : ''}`}>
      {render({ gap, bank })}
      {ctx.interactive ? <span className="ws-sr-only" role="status" aria-live="polite">{say}</span> : null}
      {drag?.moving ? createPortal(<div className="ws-dropghost" style={{ left: drag.x, top: drag.y }} aria-hidden="true">{textOf(drag.oi)}</div>, document.body) : null}
    </div>
  );
}

// 2.2 / 2.4: the running text with inline drop targets, the bank of chips under it
export function ChipsText({ data, ctx, options, keys }) {
  const first = ctx.numFrom ?? 1;
  const paras = gapParagraphs(data.passage);
  return (
    <DropTask ctx={ctx} keys={keys} options={options} className="is-chips" render={({ gap, bank }) => (
      <>
        <div className="ws-passage ws-drop-text">
          {data.passageTitle ? <h4>{data.passageTitle}</h4> : null}
          {paras.map((para, pi) => <p key={pi}>{para.map((piece, k) => ('gap' in piece ? <Fragment key={k}>{gap(`${piece.gap}`, (ctx.start || 0) + piece.gap + first, { wide: options.some((o) => o.text.length > 24) })}</Fragment> : <Fragment key={k}><Md text={piece.text} /></Fragment>))}</p>)}
        </div>
        {bank()}
      </>
    )} />
  );
}

// 2.1: the conversation — „**Name:** text” a paragraph each; a reply taken out is „**Name:** [[reply]]”. The first
// speaker stands on the left, the other on the right with the empty reply slots; the bank of replies beside.
export function ChatSlots({ data, ctx, options, keys }) {
  const first = ctx.numFrom ?? 1;
  const turns = chatTurns(data.passage);
  return (
    <DropTask ctx={ctx} keys={keys} options={options} className="is-chat" label={(n) => `Repliik ${n}`} render={({ gap, bank }) => (
      <div className="ws-chat-grid">
        <div className="ws-chat">
          {data.passageTitle ? <h4>{data.passageTitle}</h4> : null}
          {turns.map((t, i) => (
            <div key={i} className={`ws-chat-turn is-${t.side} ${t.gap !== null ? 'is-slot' : ''}`}>
              {t.who ? <b className="ws-chat-who">{t.who}:</b> : null}
              {t.gap !== null ? gap(`${t.gap}`, (ctx.start || 0) + t.gap + first, { wide: true }) : <span className="ws-chat-text"><Md text={t.text} /></span>}
            </div>
          ))}
        </div>
        {bank(options, { title: 'Repliigid' })}
      </div>
    )} />
  );
}
