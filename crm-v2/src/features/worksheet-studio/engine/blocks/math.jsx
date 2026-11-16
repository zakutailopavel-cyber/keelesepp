/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { useId } from 'react';
import { Line, Md } from '../ui.jsx';
import { Area, Num, Rows, Select, Text } from '../../editor/fields.jsx';
import { compileExpr, sameMathAnswer } from '../mathExpr.js';

// Mathematics (course 10.–12. klass and the riigieksam, owner 2026-11-16). Formulas are written as $…$ in any text
// (engine/math.jsx). Two blocks:
//  · „Matemaatika ülesanne” (mathtask) — a riigieksam-style task: a situation, parts a) b) c) with points, room for the
//    full solution (squared paper or lines, as in the exam booklet) and a „Vastus:” line. The final answer is checked as
//    mathematics (mathExpr.sameMathAnswer); the worked solution goes to the teacher's key only.
//  · „Koordinaattasand” (graph) — a coordinate plane drawn from formulas: graphs, points, segments, a shaded area under
//    a curve (integral tasks); or an empty grid where the learner draws.

const letter = (i) => `${'abcdefghij'[i] || i + 1})`;
const pointsLabel = (n) => (Number(n) > 0 ? `(${n} p)` : '');

const partsOf = (d) => (Array.isArray(d.parts) ? d.parts : []).filter((p) => String(p.text || '').trim() || String(p.answer || '').trim());
const totalPoints = (d) => partsOf(d).reduce((n, p) => n + (Number(p.points) || 0), 0);

function SolutionSpace({ part }) {
  const rows = Math.max(0, Math.min(30, Number(part.rows) || 0));
  if (!rows || part.space === 'none') return null;
  return <div className={`ws-math-space ws-math-space--${part.space === 'lines' ? 'lines' : 'grid'}`} style={{ height: `${rows * 7.5}mm` }} aria-hidden="true" />;
}

export const mathtask = {
  type: 'mathtask', label: 'Matemaatika ülesanne (osad, punktid, lahenduskoht)', group: 'Matemaatika', icon: 'Sigma', task: true, width: 'full', tone: 'white',
  create: () => ({
    title: 'Lahenda.',
    instruction: 'Kirjuta lahenduskäik ja vastus.',
    context: 'Antud on funktsioon $f(x)=x^2-4x+3$.',
    parts: [
      { text: 'Leia funktsiooni nullkohad.', points: 2, space: 'grid', rows: 4, answer: 'x=1; x=3', solution: '$x^2-4x+3=0$, $x=\\frac{4\\pm\\sqrt{16-12}}{2}$, $x_1=1$, $x_2=3$.' },
      { text: 'Leia haripunkti koordinaadid.', points: 2, space: 'grid', rows: 4, answer: '(2; -1)', solution: '$x_0=-\\frac{b}{2a}=2$, $f(2)=4-8+3=-1$, haripunkt $(2;-1)$.' },
    ],
    answerLine: true,
  }),
  View: ({ data, ctx }) => {
    const parts = partsOf(data);
    const total = totalPoints(data);
    return (
      <div className="ws-mathtask">
        {total ? <div className="ws-math-total">{total} p</div> : null}
        {String(data.context || '').split('\n').map((l) => l.trim()).filter(Boolean).map((l, i) => <p key={i} className="ws-math-context"><Md text={l} /></p>)}
        <ol className="ws-math-parts">
          {parts.map((part, i) => (
            <li key={i} className="ws-math-part">
              <div className="ws-math-q">
                {parts.length > 1 ? <b className="ws-math-letter">{letter(i)}</b> : null}
                <span className="ws-math-text"><Md text={part.text} /></span>
                {pointsLabel(part.points) ? <span className="ws-math-pts">{pointsLabel(part.points)}</span> : null}
              </div>
              <SolutionSpace part={part} />
              {data.answerLine !== false && String(part.answer || '').trim() ? (
                <div className="ws-math-answer">
                  <span>Vastus:</span>
                  <Line interactive={ctx.interactive} value={ctx.get(`p${i}`)} onChange={(v) => ctx.set(`p${i}`, v)} state={ctx.state(`p${i}`)} width="60%" label={`Vastus ${letter(i)}`} />
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    );
  },
  // only a part with a final answer is scored; the full solution is judged by the teacher
  score: (data, get) => partsOf(data).map((part, i) => ({ part, i })).filter(({ part }) => String(part.answer || '').trim())
    .map(({ part, i }) => ({ key: `p${i}`, ok: String(part.answer).split('|').some((a) => sameMathAnswer(get(`p${i}`), a)) })),
  answers: (data) => partsOf(data).map((part, i) => ({ part, i })).filter(({ part }) => String(part.answer || '').trim())
    .map(({ part, i }) => ({ key: `p${i}`, accept: [part.answer] })),
  answerKeys: (data) => partsOf(data).map((part, i) => ({ part, i })).filter(({ part }) => String(part.answer || '').trim()).map(({ i }) => `p${i}`),
  // the teacher's key: prompt, answer and the worked solution of every part (engine/answerKey.js)
  keyItems: (data) => partsOf(data).map((part, i) => ({
    prompt: `${partsOf(data).length > 1 ? `${letter(i)} ` : ''}${part.text || ''}${Number(part.points) ? ` ${pointsLabel(part.points)}` : ''}`,
    answer: String(part.answer || '').split('|').join(' / '),
    why: part.solution || '',
  })),
  Editor: ({ data, set }) => (
    <>
      <Area label="Lähteandmed (valemid $…$ vahel)" rows={3} value={data.context} onChange={(v) => set({ context: v })} />
      <Rows
        label="Osad"
        rows={Array.isArray(data.parts) ? data.parts : []}
        onChange={(parts) => set({ parts })}
        make={() => ({ text: '', points: 2, space: 'grid', rows: 4, answer: '', solution: '' })}
        addLabel="Lisa osa"
        render={(part, patch) => (
          <>
            <Area label="Küsimus" rows={2} value={part.text} onChange={(v) => patch({ text: v })} />
            <div className="ed-row">
              <Num label="Punktid" min={0} max={20} value={part.points} onChange={(v) => patch({ points: v })} />
              <Select label="Lahenduskoht" value={part.space || 'grid'} onChange={(v) => patch({ space: v })} options={[['grid', 'Ruuduline'], ['lines', 'Jooned'], ['none', 'Puudub']]} />
              <Num label="Ridu" min={0} max={30} value={part.rows} onChange={(v) => patch({ rows: v })} />
            </div>
            <Text label="Õige vastus (variandid | märgiga; mitu vastust ; märgiga)" value={part.answer} onChange={(v) => patch({ answer: v })} />
            <Area label="Lahenduskäik (ainult õpetaja võtmes)" rows={3} value={part.solution} onChange={(v) => patch({ solution: v })} />
          </>
        )}
      />
    </>
  ),
};

// ---------- Koordinaattasand ----------

const W = 360;
const num = (v, fallback) => (Number.isFinite(Number(String(v ?? '').replace(',', '.'))) && String(v ?? '').trim() !== '' ? Number(String(v).replace(',', '.')) : fallback);
const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const COLOURS = ['#0b2a4f', '#267743', '#b42318', '#6941c6'];

// "A(1; 2)" or "A(1;2)" → { name, x, y }
export function parsePoints(text) {
  return lines(text).map((l) => /^([A-Za-zÕÄÖÜõäöü]?\w*)\s*\(\s*(-?[\d.,]+)\s*;\s*(-?[\d.,]+)\s*\)$/.exec(l)).filter(Boolean)
    .map((m) => ({ name: m[1], x: num(m[2], 0), y: num(m[3], 0) }));
}

export function graphBox(d) {
  const xmin = num(d.xmin, -5);
  const xmax = num(d.xmax, 5);
  const ymin = num(d.ymin, -5);
  const ymax = num(d.ymax, 5);
  return xmax > xmin && ymax > ymin ? { xmin, xmax, ymin, ymax } : { xmin: -5, xmax: 5, ymin: -5, ymax: 5 };
}

// a curve as SVG path pieces; a jump (tan, 1/x) or a value off the plane breaks the line
export function curvePaths(f, box, sx, sy, steps = 400) {
  const out = [];
  let cur = '';
  const pad = (box.ymax - box.ymin) * 2;
  for (let k = 0; k <= steps; k += 1) {
    const x = box.xmin + ((box.xmax - box.xmin) * k) / steps;
    const y = f(x);
    if (!Number.isFinite(y) || y > box.ymax + pad || y < box.ymin - pad) { if (cur) out.push(cur); cur = ''; continue; }
    cur += `${cur ? 'L' : 'M'}${sx(x).toFixed(2)},${sy(y).toFixed(2)}`;
  }
  if (cur) out.push(cur);
  return out;
}

function GraphSvg({ data }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const box = graphBox(data);
  // a step of 0 or less (an empty field saved as 0, course files with stepY: 0) means „the default”, never a line every
  // 0.01 — that drew a grey band over published sheets (hotfix 2026-11-16)
  const positive = (v, fallback) => { const n = num(v, fallback); return n > 0 ? Math.max(0.01, n) : fallback; };
  const step = positive(data.step, 1);
  const stepY = positive(data.stepY, step);
  // equal units on both axes (a circle stays round) unless that makes the plane too flat or too tall (degrees on x)
  const H = Math.round((W * (box.ymax - box.ymin) * (step / stepY)) / (box.xmax - box.xmin));
  const height = Math.min(Math.max(H, 140), 520);
  const sx = (x) => ((x - box.xmin) / (box.xmax - box.xmin)) * W;
  const sy = (y) => height - ((y - box.ymin) / (box.ymax - box.ymin)) * height;
  const deg = data.angle === 'deg';
  const labelEvery = Math.max(1, num(data.labelEvery, 1));
  const grid = [];
  const first = Math.ceil(box.xmin / step) * step;
  for (let x = first, k = 0; x <= box.xmax + 1e-9 && k < 400; x += step, k += 1) grid.push(['v', Math.round(x * 1e6) / 1e6]);
  const firstY = Math.ceil(box.ymin / stepY) * stepY;
  for (let y = firstY, k = 0; y <= box.ymax + 1e-9 && k < 400; y += stepY, k += 1) grid.push(['h', Math.round(y * 1e6) / 1e6]);
  const fns = data.blank ? [] : lines(data.fns).map((src, i) => ({ src, i, ...compileExpr(src, deg) }));
  const pts = data.blank ? [] : parsePoints(data.points);
  const byName = Object.fromEntries(pts.map((p) => [p.name, p]));
  const segs = data.blank ? [] : lines(data.segments).map((s) => s.split(/[-–]/).map((n) => byName[n.trim()])).filter((ab) => ab.length >= 2 && ab.every(Boolean));
  const shades = data.blank ? [] : lines(data.shade).map((l) => {
    const [fpart, a, b] = l.split(';').map((x) => x.trim());
    const [top, bottom] = String(fpart || '').split('|').map((x) => compileExpr(x.trim(), deg));
    return top?.f ? { top: top.f, bottom: bottom?.f || (() => 0), a: num(a, box.xmin), b: num(b, box.xmax) } : null;
  }).filter(Boolean);
  const x0 = box.xmin <= 0 && box.xmax >= 0 ? sx(0) : null;
  const y0 = box.ymin <= 0 && box.ymax >= 0 ? sy(0) : null;
  const tickLabel = (v) => String(v).replace('.', ',');
  const errors = fns.filter((f) => f.error);
  return (
    <>
      <svg className="ws-graph-svg" viewBox={`-28 -10 ${W + 42} ${height + 24}`} role="img" aria-label={`Koordinaattasand${fns.length ? `: ${fns.map((f) => f.src).join(', ')}` : ''}`}>
        {grid.map(([kind, v]) => (kind === 'v'
          ? <line key={`v${v}`} x1={sx(v)} x2={sx(v)} y1={0} y2={height} stroke="#d5dce3" strokeWidth="0.6" />
          : <line key={`h${v}`} x1={0} x2={W} y1={sy(v)} y2={sy(v)} stroke="#d5dce3" strokeWidth="0.6" />))}
        {shades.map((s, k) => {
          const n = 120;
          const xs = Array.from({ length: n + 1 }, (_, j) => s.a + ((s.b - s.a) * j) / n);
          const topPts = xs.map((x) => `${sx(x).toFixed(2)},${sy(s.top(x)).toFixed(2)}`);
          const botPts = xs.reverse().map((x) => `${sx(x).toFixed(2)},${sy(s.bottom(x)).toFixed(2)}`);
          return <polygon key={`s${k}`} points={[...topPts, ...botPts].join(' ')} fill="#9cc31d" fillOpacity="0.35" stroke="none" />;
        })}
        {y0 !== null ? <line x1={0} x2={W} y1={y0} y2={y0} stroke="#0b2a4f" strokeWidth="1.2" markerEnd={`url(#ws-arrow-${uid})`} /> : null}
        {x0 !== null ? <line x1={x0} x2={x0} y1={height} y2={0} stroke="#0b2a4f" strokeWidth="1.2" markerEnd={`url(#ws-arrow-${uid})`} /> : null}
        <defs><marker id={`ws-arrow-${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#0b2a4f" /></marker></defs>
        {y0 !== null ? <text x={W + 4} y={y0 - 5} className="ws-graph-axis">x</text> : null}
        {x0 !== null ? <text x={x0 + 6} y={6} className="ws-graph-axis">y</text> : null}
        {grid.filter(([kind, v]) => v !== 0 && (kind === 'h' || Math.abs(Math.round(v / step)) % labelEvery === 0)).map(([kind, v]) => (kind === 'v'
          ? (y0 !== null ? <text key={`tv${v}`} x={sx(v)} y={y0 + 11} textAnchor="middle" className="ws-graph-tick">{tickLabel(v)}</text> : null)
          : (x0 !== null ? <text key={`th${v}`} x={x0 - 4} y={sy(v) + 3.5} textAnchor="end" className="ws-graph-tick">{tickLabel(v)}</text> : null)))}
        {x0 !== null && y0 !== null ? <text x={x0 - 4} y={y0 + 11} textAnchor="end" className="ws-graph-tick">0</text> : null}
        <clipPath id={`ws-graph-clip-${uid}`}><rect x="0" y="0" width={W} height={height} /></clipPath>
        <g clipPath={`url(#ws-graph-clip-${uid})`}>
          {fns.filter((f) => f.f).map((f) => curvePaths(f.f, box, sx, sy).map((d, k) => <path key={`${f.i}-${k}`} d={d} fill="none" stroke={COLOURS[f.i % COLOURS.length]} strokeWidth="2" />))}
        </g>
        {segs.map(([a, b], k) => <line key={`g${k}`} x1={sx(a.x)} y1={sy(a.y)} x2={sx(b.x)} y2={sy(b.y)} stroke="#267743" strokeWidth="1.8" />)}
        {pts.map((p) => (
          <g key={`p${p.name}${p.x}${p.y}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r="3.2" fill="#0b2a4f" />
            {p.name ? <text x={sx(p.x) + 5} y={sy(p.y) - 5} className="ws-graph-label">{p.name}</text> : null}
          </g>
        ))}
      </svg>
      {errors.length ? <div className="ws-hint">Valemit ei saa joonistada: {errors.map((f) => `${f.src} (${f.error})`).join('; ')}</div> : null}
    </>
  );
}

export const graph = {
  type: 'graph', label: 'Koordinaattasand (graafik)', group: 'Matemaatika', icon: 'ChartSpline', task: false, width: 'half', tone: 'white',
  create: () => ({ caption: '', fns: 'y = x^2 - 4x + 3', points: 'A(1; 0)\nB(3; 0)', segments: '', shade: '', xmin: -2, xmax: 6, ymin: -2, ymax: 6, step: 1, labelEvery: 1, angle: 'rad', blank: false }),
  View: ({ data }) => (
    <figure className="ws-graph">
      <GraphSvg data={data} />
      {data.caption ? <figcaption><Md text={data.caption} /></figcaption> : null}
    </figure>
  ),
  score: null,
  Editor: ({ data, set }) => (
    <>
      <Area label="Graafikud (üks valem reale, nt y = x^2 - 4x + 3)" rows={3} value={data.fns} onChange={(v) => set({ fns: v })} />
      <Area label="Punktid (A(1; 2), üks reale)" rows={3} value={data.points} onChange={(v) => set({ points: v })} />
      <Text label="Lõigud (A-B, üks reale)" value={data.segments} onChange={(v) => set({ segments: v })} />
      <Text label="Varjutatud ala (valem; a; b või f | g; a; b)" value={data.shade} onChange={(v) => set({ shade: v })} />
      <div className="ed-row">
        <Text label="x min" value={String(data.xmin ?? '')} onChange={(v) => set({ xmin: v })} />
        <Text label="x max" value={String(data.xmax ?? '')} onChange={(v) => set({ xmax: v })} />
        <Text label="y min" value={String(data.ymin ?? '')} onChange={(v) => set({ ymin: v })} />
        <Text label="y max" value={String(data.ymax ?? '')} onChange={(v) => set({ ymax: v })} />
      </div>
      <div className="ed-row">
        <Text label="Samm x-teljel" value={String(data.step ?? '')} onChange={(v) => set({ step: v })} />
        <Text label="Samm y-teljel" value={String(data.stepY ?? '')} onChange={(v) => set({ stepY: v })} />
        <Select label="Nurgad" value={data.angle || 'rad'} onChange={(v) => set({ angle: v })} options={[['rad', 'Radiaanid'], ['deg', 'Kraadid']]} />
        <Select label="Sisu" value={data.blank ? 'blank' : 'drawn'} onChange={(v) => set({ blank: v === 'blank' })} options={[['drawn', 'Joonistatud'], ['blank', 'Tühi ruudustik']]} />
      </div>
      <Text label="Allkiri" value={data.caption} onChange={(v) => set({ caption: v })} />
    </>
  ),
};

export const mathBlocks = { mathtask, graph };
