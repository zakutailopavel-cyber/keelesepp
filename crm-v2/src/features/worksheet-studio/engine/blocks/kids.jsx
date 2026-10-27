/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { useRef, useState } from 'react';
import { Line } from '../ui.jsx';
import { norm } from '../schema.js';
import { Text, Select, Rows } from '../../editor/fields.jsx';
import { COLORING_PICTURES, COLORS, COLOR_NAMES, PICTURE_OPTIONS } from './kidsPictures.js';

// Blocks for the children's groups 5–9 (owner 2026-10-28: „раскраски, … если не хватает блоков в конструкторе — то
// добавляем, надо прописи — то делаем”): colour a picture by numbers, trace letters on school lines (with a finger or
// a pen on screen, a pencil on paper), count and write the number, find and circle a letter. Every block works on
// screen, in the Live Classroom and on paper (print shows the empty task).

const lines = (value) => String(value || '').split('\n').map((l) => l.trim()).filter(Boolean);

// ---------- colouring ----------
const shapeEl = (shape, key, fill) => {
  const [kind, ...v] = shape;
  if (kind === 'c') return <circle key={key} cx={v[0]} cy={v[1]} r={v[2]} fill={fill} />;
  if (kind === 'e') return <ellipse key={key} cx={v[0]} cy={v[1]} rx={v[2]} ry={v[3]} fill={fill} />;
  if (kind === 'r') return <rect key={key} x={v[0]} y={v[1]} width={v[2]} height={v[3]} rx={v[4] || 0} fill={fill} />;
  return <path key={key} d={v[0]} fill={fill} />;
};

// the key: one colour per region (empty = the child chooses)
export const coloringKey = (data) => {
  const picture = COLORING_PICTURES[data.picture] || COLORING_PICTURES.apple;
  const colors = lines(data.colors);
  return picture.regions.map((_, i) => (COLORS[colors[i]] ? colors[i] : ''));
};

function ColoringView({ data, ctx }) {
  const picture = COLORING_PICTURES[data.picture] || COLORING_PICTURES.apple;
  const key = coloringKey(data);
  const byNumber = data.mode !== 'free';
  const [brush, setBrush] = useState('');
  const used = [...new Set(key.filter(Boolean))];
  const palette = ctx.interactive ? COLOR_NAMES.filter((c) => c !== 'valge') : used;
  return (
    <div className={`ws-coloring${!ctx.interactive && !(byNumber && used.length) ? ' is-solo' : ''}`}>
      <svg viewBox="0 0 300 300" className="ws-coloring-pic" role="img" aria-label={`Värvimispilt: ${picture.label}`}>
        {picture.regions.map((region, i) => {
          const color = ctx.get(`r${i}`);
          const state = ctx.state(`r${i}`);
          return (
            <g key={i} className={`ws-coloring-region${state ? ` is-${state}` : ''}`} role={ctx.interactive ? 'button' : undefined} aria-label={`Ala ${i + 1}`}
              tabIndex={ctx.interactive ? 0 : undefined} data-color={color || ''}
              onClick={() => { if (ctx.interactive && brush) ctx.set(`r${i}`, brush === 'kustuta' ? '' : brush); }}
              onKeyDown={(e) => { if (ctx.interactive && brush && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); ctx.set(`r${i}`, brush === 'kustuta' ? '' : brush); } }}>
              {region.shapes.map((shape, k) => shapeEl(shape, k, COLORS[color] || '#fff'))}
            </g>
          );
        })}
        {picture.lines.map((d, i) => <path key={`l${i}`} d={d} className="ws-coloring-line" />)}
        {byNumber ? picture.regions.map((region, i) => (key[i] ? <text key={`n${i}`} x={region.at[0]} y={region.at[1]} className="ws-coloring-num">{i + 1}</text> : null)) : null}
      </svg>
      <div className="ws-coloring-side">
        {byNumber && used.length ? (
          <ul className="ws-coloring-key" aria-label="Värvid numbrite järgi">
            {key.map((color, i) => (color ? <li key={i}><b>{i + 1}</b><span className="ws-swatch" style={{ background: COLORS[color] }} />{color}</li> : null))}
          </ul>
        ) : null}
        {ctx.interactive ? (
          <div className="ws-coloring-palette" role="group" aria-label="Vali värv">
            {palette.map((color) => (
              <button type="button" key={color} className={`ws-brush${brush === color ? ' on' : ''}`} aria-label={`Värv: ${color}`} aria-pressed={brush === color} onClick={() => setBrush(color)}>
                <span className="ws-swatch" style={{ background: COLORS[color] }} />{color}
              </button>
            ))}
            <button type="button" className={`ws-brush${brush === 'kustuta' ? ' on' : ''}`} aria-label="Kustuta värv" aria-pressed={brush === 'kustuta'} onClick={() => setBrush('kustuta')}>⌫ kustuta</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const coloring = {
  type: 'coloring', label: 'Värvi pilt (numbrite järgi)', group: 'Lastele', icon: 'Palette', task: true, width: 'full', tone: 'white',
  create: () => ({ title: 'Värvi pilt.', instruction: 'Värvi iga number õige värviga.', picture: 'apple', mode: 'key', colors: 'punane\nroheline\npruun' }),
  View: ColoringView,
  answers: (data) => coloringKey(data).map((color, i) => (color && data.mode !== 'free' ? { key: `r${i}`, accept: [color] } : null)).filter(Boolean),
  score: (data, get) => (data.mode === 'free' ? [] : coloringKey(data).map((color, i) => (color ? { key: `r${i}`, ok: norm(get(`r${i}`)) === norm(color) } : null)).filter(Boolean)),
  Editor: ({ data, set }) => {
    const picture = COLORING_PICTURES[data.picture] || COLORING_PICTURES.apple;
    const key = coloringKey(data);
    const setColor = (i, color) => set({ colors: picture.regions.map((_, k) => (k === i ? color : key[k])).join('\n') });
    return (
      <>
        <div className="ed-row">
          <Select label="Pilt" value={data.picture} onChange={(v) => set({ picture: v, colors: '' })} options={PICTURE_OPTIONS} />
          <Select label="Kuidas värvida" value={data.mode || 'key'} onChange={(v) => set({ mode: v })} options={[['key', 'Numbrite järgi (kontrollitakse)'], ['free', 'Vabalt (ei kontrollita)']]} />
        </div>
        {data.mode !== 'free' ? picture.regions.map((region, i) => (
          <Select key={i} label={`${i + 1}. ${region.name}`} value={key[i]} onChange={(v) => setColor(i, v)} options={[['', '— vabalt —'], ...COLOR_NAMES.map((c) => [c, c])]} />
        )) : null}
        <span className="ed-hint">Sõnad pildi juurde: {picture.words.join(', ')}.</span>
      </>
    );
  },
};

// ---------- tracing on school lines ----------
const INK_MAX = 15000;
const parseInk = (value) => String(value || '').split('|').filter(Boolean).map((stroke) => stroke.split(' ').map((p) => p.split(',').map(Number)).filter((p) => p.length === 2 && p.every(Number.isFinite)));
const inkPath = (stroke) => stroke.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');

function TraceRow({ row, index, ctx }) {
  const text = String(row.text || '').trim() || 'A';
  const repeat = Math.max(1, Math.min(12, Number(row.repeat) || 4));
  const size = 92;
  const step = Math.max(text.length * size * 0.68 + 34, 86);
  const copies = Math.max(1, Math.min(repeat, Math.floor((1000 - 20) / step)));
  const [live, setLive] = useState(null);
  const svg = useRef(null);
  const key = `ink${index}`;
  const ink = parseInk(ctx.get(key));
  const point = (e) => {
    const box = svg.current.getBoundingClientRect();
    return [Math.round(((e.clientX - box.left) / box.width) * 1000), Math.round(((e.clientY - box.top) / box.height) * 120)];
  };
  const down = (e) => { if (!ctx.interactive) return; e.preventDefault(); e.currentTarget.setPointerCapture?.(e.pointerId); setLive([point(e)]); };
  const move = (e) => { if (live) setLive((l) => [...l, point(e)]); };
  const up = () => {
    if (!live) return;
    const stroke = live.map((p) => p.join(',')).join(' ');
    const next = [ctx.get(key), stroke].filter(Boolean).join('|');
    if (live.length > 1 && next.length <= INK_MAX) ctx.set(key, next);
    setLive(null);
  };
  return (
    <div className="ws-trace-row">
      <svg ref={svg} viewBox="0 0 1000 120" className={`ws-trace${ctx.interactive ? ' is-live' : ''}`} role="img" aria-label={`Kirjuta järele: ${text}`}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
        <line x1="0" x2="1000" y1="22" y2="22" className="ws-trace-guide" />
        <line x1="0" x2="1000" y1="52" y2="52" className="ws-trace-guide ws-trace-guide--mid" />
        <line x1="0" x2="1000" y1="88" y2="88" className="ws-trace-guide ws-trace-guide--base" />
        <line x1="0" x2="1000" y1="112" y2="112" className="ws-trace-guide" />
        {Array.from({ length: copies }, (_, k) => (
          <text key={k} x={14 + k * step} y="88" fontSize={size} className={k === 0 ? 'ws-trace-model' : 'ws-trace-dots'}>{text}</text>
        ))}
        {ink.map((stroke, k) => <path key={k} d={inkPath(stroke)} className="ws-trace-ink" />)}
        {live ? <path d={inkPath(live)} className="ws-trace-ink" /> : null}
      </svg>
      {ctx.interactive && ink.length ? <button type="button" className="ws-trace-clear" onClick={() => ctx.set(key, '')}>Kustuta rida {index + 1}</button> : null}
    </div>
  );
}

export const tracing = {
  type: 'tracing', label: 'Kirjuta järele (joonestik)', group: 'Lastele', icon: 'PenLine', task: true, width: 'full', tone: 'white',
  create: () => ({ title: 'Kirjuta järele.', instruction: 'Vaata esimest tähte. Kirjuta punktiirjoonel järele ja siis ise.', rows: [{ text: 'A', repeat: 8 }, { text: 'a', repeat: 8 }, { text: 'ema', repeat: 4 }] }),
  View: ({ data, ctx }) => <div className="ws-tracing">{(data.rows || []).map((row, i) => <TraceRow key={i} row={row} index={i} ctx={ctx} />)}</div>,
  Editor: ({ data, set }) => (
    <Rows label="Read" rows={data.rows || []} onChange={(rows) => set({ rows })} make={() => ({ text: '', repeat: 6 })} addLabel="Lisa rida" max={10}
      render={(row, patch) => (
        <>
          <input className="ed-input" placeholder="Täht või sõna" value={row.text} onChange={(e) => patch({ text: e.target.value })} />
          <input className="ed-input ed-input--num" type="number" min="1" max="12" aria-label="Mitu korda" value={row.repeat} onChange={(e) => patch({ repeat: Number(e.target.value) || 1 })} />
        </>
      )} />
  ),
};

// ---------- count and write ----------
const NUMBER_WORDS = ['null', 'üks', 'kaks', 'kolm', 'neli', 'viis', 'kuus', 'seitse', 'kaheksa', 'üheksa', 'kümme', 'üksteist', 'kaksteist', 'kolmteist', 'neliteist', 'viisteist', 'kuusteist', 'seitseteist', 'kaheksateist', 'üheksateist', 'kakskümmend'];
export const numberAccepts = (count) => [String(count), NUMBER_WORDS[count]].filter(Boolean);
const countOf = (item) => Math.max(0, Math.min(20, Math.round(Number(item?.count) || 0)));

export const counting = {
  type: 'counting', label: 'Loenda ja kirjuta', group: 'Lastele', icon: 'Hash', task: true, width: 'full', tone: 'cream',
  create: () => ({ title: 'Loenda ja kirjuta.', instruction: 'Mitu on? Kirjuta number või sõna.', items: [{ icon: '🍎', count: 3 }, { icon: '🐟', count: 5 }, { icon: '🎈', count: 2 }, { icon: '⭐', count: 4 }] }),
  View: ({ data, ctx }) => (
    <div className="ws-counting">
      {(data.items || []).map((item, i) => (
        <div className="ws-count" key={i}>
          <div className="ws-count-icons" aria-label={`Pilt ${i + 1}`}>{Array.from({ length: countOf(item) }, (_, k) => <span key={k}>{item.icon || '●'}</span>)}</div>
          <Line value={ctx.get(`${i}`)} onChange={(v) => ctx.set(`${i}`, v)} interactive={ctx.interactive} state={ctx.state(`${i}`)} width="5em" label={`Mitu: pilt ${i + 1}`} />
        </div>
      ))}
    </div>
  ),
  answers: (data) => (data.items || []).map((item, i) => ({ key: `${i}`, accept: numberAccepts(countOf(item)) })),
  score: (data, get) => (data.items || []).map((item, i) => ({ key: `${i}`, ok: numberAccepts(countOf(item)).some((a) => norm(a) === norm(get(`${i}`))) })),
  Editor: ({ data, set }) => (
    <Rows label="Pildid" rows={data.items || []} onChange={(items) => set({ items })} make={() => ({ icon: '🍎', count: 3 })} addLabel="Lisa pilt" max={12}
      render={(row, patch) => (
        <>
          <input className="ed-input ed-input--num" placeholder="🍎" aria-label="Pilt (emoji)" value={row.icon} onChange={(e) => patch({ icon: e.target.value })} />
          <input className="ed-input ed-input--num" type="number" min="0" max="20" aria-label="Mitu" value={row.count} onChange={(e) => patch({ count: Number(e.target.value) || 0 })} />
        </>
      )} />
  ),
};

// ---------- find and circle the letter ----------
export const huntGrid = (data) => lines(data.grid).map((row) => row.split(/\s+/).filter(Boolean));
const isTarget = (data, cell) => {
  const target = String(data.target || '').trim();
  return Boolean(target) && (data.caseSensitive === 'yes' ? cell === target : cell.toLowerCase() === target.toLowerCase());
};
const targets = (data) => huntGrid(data).flatMap((row, r) => row.map((cell, c) => (isTarget(data, cell) ? `${r}.${c}` : null))).filter(Boolean);

export const letterhunt = {
  type: 'letterhunt', label: 'Leia ja märgi täht', group: 'Lastele', icon: 'ScanSearch', task: true, width: 'half', tone: 'sky',
  create: () => ({ title: 'Leia täht A.', instruction: 'Tee ring ümber iga tähe A ja a.', target: 'A', caseSensitive: 'no', grid: 'A M a S O\nK L A T a\nE A N U I\nO a M A L' }),
  View: ({ data, ctx }) => (
    <div className="ws-hunt" role="grid" aria-label={`Leia täht ${data.target || ''}`}>
      {huntGrid(data).map((row, r) => (
        <div className="ws-hunt-row" role="row" key={r}>
          {row.map((cell, c) => {
            const k = `${r}.${c}`;
            const marked = ctx.get(k) === 'x';
            const state = ctx.state(k) || (marked && !isTarget(data, cell) && ctx.review ? 'bad' : '');
            return (
              <button type="button" role="gridcell" key={c} className={`ws-hunt-cell${marked ? ' circled' : ''}${state ? ` is-${state}` : ''}`}
                aria-label={`Täht ${cell}, rida ${r + 1}, veerg ${c + 1}`} aria-pressed={marked} tabIndex={ctx.interactive ? 0 : -1}
                onClick={() => { if (ctx.interactive) ctx.set(k, marked ? '' : 'x'); }}>{cell}</button>
            );
          })}
        </div>
      ))}
    </div>
  ),
  answers: (data) => targets(data).map((key) => ({ key, accept: ['x'] })),
  score: (data, get) => targets(data).map((key) => ({ key, ok: get(key) === 'x' })),
  Editor: ({ data, set }) => (
    <>
      <div className="ed-row">
        <Text label="Täht või silp" value={data.target} onChange={(v) => set({ target: v })} />
        <Select label="Suur ja väike täht" value={data.caseSensitive || 'no'} onChange={(v) => set({ caseSensitive: v })} options={[['no', 'Mõlemad loevad'], ['yes', 'Ainult täpselt see']]} />
      </div>
      <label className="ed-field"><span className="ed-label">Tähed (tühik vahel, iga rida eraldi)</span>
        <textarea className="ed-input" rows={5} value={data.grid} onChange={(e) => set({ grid: e.target.value })} />
      </label>
      <span className="ed-hint">Õiged kohad: {targets(data).length}.</span>
    </>
  ),
};

export const kidsBlocks = { coloring, tracing, counting, letterhunt };
