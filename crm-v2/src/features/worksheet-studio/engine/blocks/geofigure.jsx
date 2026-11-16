/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { useId } from 'react';
import { Md } from '../ui.jsx';
import { Field, Select, Text } from '../../editor/fields.jsx';
import { buildScene, figureKind, labelText, shown, solidKind } from './geofigureModel.js';

// „Geomeetriline joonis” (geofigure, math course 10.–12. klass, owner 2026-11-16): a clean exam-style figure drawn as
// SVG — a triangle from its sides and angles, a circle with a chord and sector, a solid in cabinet projection with dashed
// hidden edges, or a polygon from coordinates. Black lines, one green accent (#267743) for what the solution uses, a
// light tint only. The geometry is in geofigureModel.js; this file fits the scene into the box and draws it.

const W = 360;
const PAD = 34;
const INK = '#1a1a1a';
const ACCENT = '#267743';

const len = (p) => Math.hypot(p[0], p[1]);
const unit = (p) => { const l = len(p); return l > 1e-9 ? [p[0] / l, p[1] / l] : [0, -1]; };
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const fx = (n) => Number(n.toFixed(2));

// model (y up) → screen: the whole figure fitted into a 360-wide box, height from its own shape (140…360)
export function fitScene(sc, padX = PAD) {
  const pts = [
    ...sc.lines.flatMap((l) => [l.p, l.q]), ...sc.paths.flatMap((p) => p.pts), ...sc.polys.flatMap((p) => p.pts),
    ...sc.dots.map((d) => d.at), ...sc.labels.flatMap((l) => (l.p ? [l.p, l.q] : [l.at])),
  ].filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]));
  if (!pts.length) pts.push([0, 0], [1, 1]);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  let bw = Math.max(...xs) - minX;
  let bh = Math.max(...ys) - minY;
  bw = Math.max(bw, bh * 0.25, 1e-6);
  bh = Math.max(bh, bw * 0.25, 1e-6);
  let s = (W - 2 * padX) / bw;
  let H = bh * s + 2 * PAD;
  if (H > W) { s = (W - 2 * PAD) / bh; H = W; }
  H = Math.max(H, 140);
  const ox = (W - bw * s) / 2;
  const oy = (H - bh * s) / 2;
  return { height: Math.round(H), tf: ([x, y]) => [ox + (x - minX) * s, H - oy - (y - minY) * s] };
}

// „a = 5”, „h_a”, „γ = 60°”: one-letter names and Greek letters in italics, units upright, „_x” as an index
function Label({ x, y, anchor = 'middle', text, kind, accent }) {
  const tokens = String(text).split(/(_\{[^}]*\}|_[A-Za-z0-9]|[A-Za-zÕÄÖÜõäöüα-ωΑ-Ω]+)/).filter(Boolean);
  const isSub = (t) => Boolean(t) && t.startsWith('_');
  const spans = tokens.map((t, i) => {
    const after = isSub(tokens[i - 1]);
    if (isSub(t)) return <tspan key={i} dy={after ? undefined : 4} fontSize="0.72em" fontStyle="italic">{t.replace(/^_\{?|\}$/g, '')}</tspan>;
    const italic = kind !== 'tick' && /^[A-Za-zÕÄÖÜõäöü]$|^[α-ωΑ-Ω]+$/.test(t);
    return <tspan key={i} dy={after ? -4 : undefined} fontStyle={italic ? 'italic' : undefined}>{t}</tspan>;
  });
  return (
    <text x={fx(x)} y={fx(y)} textAnchor={anchor} className={`ws-geo-label ws-geo-label--${kind || 'measure'}`} fill={accent ? ACCENT : undefined}
      stroke="#fff" strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">{spans}</text>
  );
}

function placeLabel(l, tf, center) {
  let pos;
  let n;
  if (l.p && l.q) {
    const p = tf(l.p);
    const q = tf(l.q);
    const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    n = unit([-(q[1] - p[1]), q[0] - p[0]]);
    const ref = l.toward ? sub(tf(l.toward), m) : sub(m, center);
    if (n[0] * ref[0] + n[1] * ref[1] < 0) n = [-n[0], -n[1]];
    const gap = l.gap ?? 9;
    pos = [m[0] + n[0] * gap, m[1] + n[1] * gap];
  } else if (l.bisect) {
    const at = tf(l.at);
    const e1 = unit(sub(tf(l.bisect[0]), at));
    const e2 = unit(sub(tf(l.bisect[1]), at));
    let b = [e1[0] + e2[0], e1[1] + e2[1]];
    b = len(b) < 1e-6 ? [-e1[1], e1[0]] : unit(b);
    if (l.reflex) b = [-b[0], -b[1]];
    const between = (p, q) => Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1])));
    let wedge = l.reflex ? 2 * Math.PI - between(e1, e2) : between(e1, e2);
    if (l.avoid) { // a height or median leaves this vertex: the label goes into the wider of the two halves
      const c = unit(sub(tf(l.avoid), at));
      const wide = between(e1, c) > between(e2, c) ? e1 : e2;
      wedge = between(wide, c);
      b = unit([wide[0] + c[0], wide[1] + c[1]]);
    }
    const r = arcRadius(l.at, l.bisect[0], l.bisect[1], tf);
    // far enough along the bisector that the text fits between the two rays
    const half = Math.min(wedge / 2, Math.PI / 2 - 0.05);
    const fitDist = (String(l.text).length * 3.6 + 4) / Math.max(0.15, Math.tan(half));
    const dist = l.right ? 26 : Math.min(72, Math.max(r + 12, fitDist));
    pos = [at[0] + b[0] * dist, at[1] + b[1] * dist + 4.5];
    return { x: pos[0], y: pos[1], anchor: 'middle' };
  } else {
    const at = tf(l.at);
    if (l.offset) return { x: at[0] + l.offset[0], y: at[1] + l.offset[1] + 4.5, anchor: 'middle' };
    n = unit(sub(at, center));
    const gap = l.gap ?? 12;
    pos = [at[0] + n[0] * gap, at[1] + n[1] * gap];
  }
  const anchor = n[0] > 0.38 ? 'start' : n[0] < -0.38 ? 'end' : 'middle';
  const dy = n[1] > 0.38 ? 9 : n[1] < -0.38 ? -1 : 4.5;
  return { x: pos[0], y: pos[1] + dy, anchor };
}

// a label's left edge and width, the width estimated from the length of the text
const textBox = (at, text) => {
  const w = String(text).replace(/_/g, '').length * 7.2;
  return { w, left: at.anchor === 'start' ? at.x : at.anchor === 'end' ? at.x - w : at.x - w / 2 };
};

// keep a label inside the box
function clampLabel(at, text, height) {
  const { w, left } = textBox(at, text);
  const shift = left < 2 ? 2 - left : left + w > W - 2 ? W - 2 - (left + w) : 0;
  return { ...at, x: at.x + shift, y: Math.max(13, Math.min(height - 4, at.y)) };
}

function arcRadius(at, u, v, tf) {
  const A = tf(at);
  const shortest = Math.min(len(sub(tf(u), A)), len(sub(tf(v), A)));
  return Math.max(9, Math.min(22, shortest * 0.32));
}

function arcPath(a, tf) {
  const A = tf(a.at);
  const r = arcRadius(a.at, a.u, a.v, tf);
  const e1 = unit(sub(tf(a.u), A));
  const e2 = unit(sub(tf(a.v), A));
  const cross = e1[0] * e2[1] - e1[1] * e2[0];
  const sweep = (cross > 0) !== Boolean(a.reflex) ? 1 : 0;
  const s = [A[0] + e1[0] * r, A[1] + e1[1] * r];
  const e = [A[0] + e2[0] * r, A[1] + e2[1] * r];
  return `M${fx(s[0])},${fx(s[1])} A${fx(r)},${fx(r)} 0 ${a.reflex ? 1 : 0} ${sweep} ${fx(e[0])},${fx(e[1])}`;
}

function rightPath(m, tf) {
  const A = tf(m.at);
  const U = tf(m.u);
  const V = tf(m.v);
  const size = Math.max(5, Math.min(10, 0.3 * Math.min(len(sub(U, A)), len(sub(V, A)))));
  const e1 = unit(sub(U, A));
  const e2 = unit(sub(V, A));
  const p1 = [A[0] + e1[0] * size, A[1] + e1[1] * size];
  const p2 = [p1[0] + e2[0] * size, p1[1] + e2[1] * size];
  const p3 = [A[0] + e2[0] * size, A[1] + e2[1] * size];
  return `M${fx(p1[0])},${fx(p1[1])} L${fx(p2[0])},${fx(p2[1])} L${fx(p3[0])},${fx(p3[1])}`;
}

const poly = (pts, tf) => pts.map((p) => tf(p).map(fx).join(',')).join(' ');

export function GeoSvg({ data }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const sc = buildScene(data);
  const shownLabels = sc.labels.filter((l) => labelText(l.text));
  // a label that would stick out of the box narrows the figure instead (two tries are enough)
  let fit = fitScene(sc);
  for (let k = 0, pad = PAD; k < 2; k += 1) {
    const c = fit.tf(sc.center || [0, 0]);
    const out = Math.max(0, ...shownLabels.map((l) => { const b = textBox(placeLabel(l, fit.tf, c), l.text); return Math.max(2 - b.left, b.left + b.w - (W - 2)); }));
    if (out <= 0.5) break;
    pad = Math.min(W / 2 - 40, pad + out);
    fit = fitScene(sc, pad);
  }
  const { tf, height } = fit;
  const center = tf(sc.center || [0, 0]);
  const stroke = (o) => (o.accent ? ACCENT : INK);
  const kind = figureKind(data?.kind);
  const title = kind === 'solid' ? `Ruumiline kujund: ${solidKind(data?.solid)}` : { triangle: 'Kolmnurk', circle: 'Ring', polygon: 'Hulknurk' }[kind];
  return (
    <>
      <svg className="ws-geo-svg" viewBox={`0 0 ${W} ${height}`} role="img" aria-labelledby={`ws-geo-t-${uid}`}>
        <title id={`ws-geo-t-${uid}`}>{`${title}${data?.caption ? `. ${data.caption}` : ''}`}</title>
        {sc.lines.filter((l) => l.grid).map((l, i) => <line key={`g${i}`} x1={fx(tf(l.p)[0])} y1={fx(tf(l.p)[1])} x2={fx(tf(l.q)[0])} y2={fx(tf(l.q)[1])} stroke="#d5dce3" strokeWidth="0.6" />)}
        {sc.lines.filter((l) => l.axis).map((l, i) => <line key={`x${i}`} x1={fx(tf(l.p)[0])} y1={fx(tf(l.p)[1])} x2={fx(tf(l.q)[0])} y2={fx(tf(l.q)[1])} stroke="#5b6b7b" strokeWidth="1" />)}
        {sc.polys.map((p, i) => <polygon key={`t${i}`} points={poly(p.pts, tf)} fill={ACCENT} fillOpacity="0.13" stroke="none" />)}
        {sc.paths.filter((p) => p.tint).map((p, i) => <polygon key={`pt${i}`} points={poly(p.pts, tf)} fill={ACCENT} fillOpacity="0.1" stroke="none" />)}
        {sc.paths.map((p, i) => <polyline key={`p${i}`} points={poly(p.pts, tf)} fill="none" stroke={stroke(p)} strokeWidth={p.width || 1.6} strokeDasharray={p.dashed ? '5 4' : undefined} strokeLinejoin="round" strokeLinecap="round" />)}
        {sc.lines.filter((l) => !l.grid && !l.axis).map((l, i) => {
          const [x1, y1] = tf(l.p);
          const [x2, y2] = tf(l.q);
          return <line key={`l${i}`} x1={fx(x1)} y1={fx(y1)} x2={fx(x2)} y2={fx(y2)} stroke={stroke(l)} strokeWidth={l.width || 1.6} strokeDasharray={l.dashed ? '5 4' : undefined} strokeLinecap="round" />;
        })}
        {sc.rights.map((m, i) => <path key={`r${i}`} d={rightPath(m, tf)} fill="none" stroke={stroke(m)} strokeWidth="1.2" />)}
        {sc.arcs.map((a, i) => <path key={`a${i}`} d={arcPath(a, tf)} fill="none" stroke={stroke(a)} strokeWidth="1.4" />)}
        {sc.ticks.map((t, i) => {
          const p = tf(t.p);
          const q = tf(t.q);
          const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
          const n = unit([-(q[1] - p[1]), q[0] - p[0]]);
          return <line key={`k${i}`} x1={fx(m[0] - n[0] * 4.5)} y1={fx(m[1] - n[1] * 4.5)} x2={fx(m[0] + n[0] * 4.5)} y2={fx(m[1] + n[1] * 4.5)} stroke={stroke(t)} strokeWidth="1.4" />;
        })}
        {sc.dots.map((d, i) => { const [x, y] = tf(d.at); return <circle key={`d${i}`} cx={fx(x)} cy={fx(y)} r="2.4" fill={INK} />; })}
        {shownLabels.map((l, i) => {
          const at = clampLabel(placeLabel(l, tf, center), l.text, height);
          return <Label key={`b${i}`} x={at.x} y={at.y} anchor={at.anchor} text={l.text} kind={l.kind} accent={l.accent} />;
        })}
      </svg>
      {sc.warnings.length ? <div className="ws-hint">{sc.warnings.join(' ')}</div> : null}
    </>
  );
}

// ---------- editor ----------

// a measure toggle: off → '' (hidden); on → its label text ('H = 8'), or true when drawn without text
function Measure({ label, value, onChange, placeholder }) {
  const on = shown(value);
  return (
    <div className="ed-geo-measure">
      <label className="ed-check"><input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked ? placeholder : '')} /> {label}</label>
      {on ? <input className="ed-input" aria-label={`${label}: silt`} value={labelText(value)} onChange={(e) => onChange(e.target.value === '' ? true : e.target.value)} /> : null}
    </div>
  );
}

const VERTEX = [['', '—'], ['A', 'A'], ['B', 'B'], ['C', 'C']];

function TriangleFields({ data, set }) {
  return (
    <>
      <Text label="Tippude nimed" value={data.names ?? 'A B C'} onChange={(v) => set({ names: v })} />
      <Field label="Kuju (arvud; tühjad arvutatakse, piisab kolmest küljest või kahest küljest ja nurgast)">
        <div className="ed-row">
          {[['a', 'a = BC'], ['b', 'b = CA'], ['c', 'c = AB'], ['alpha', 'α°'], ['beta', 'β°'], ['gamma', 'γ°']].map(([k, l]) => (
            <input key={k} className="ed-input" aria-label={l} placeholder={l} value={String(data[k] ?? '')} onChange={(e) => set({ [k]: e.target.value })} />
          ))}
        </div>
      </Field>
      <div className="ed-row">
        <Text label="Külg a silt" value={labelText(data.sideA)} onChange={(v) => set({ sideA: v })} />
        <Text label="Külg b silt" value={labelText(data.sideB)} onChange={(v) => set({ sideB: v })} />
        <Text label="Külg c silt" value={labelText(data.sideC)} onChange={(v) => set({ sideC: v })} />
      </div>
      <div className="ed-row">
        <Measure label="Nurk A" value={data.angleA} onChange={(v) => set({ angleA: v })} placeholder="α" />
        <Measure label="Nurk B" value={data.angleB} onChange={(v) => set({ angleB: v })} placeholder="β" />
        <Measure label="Nurk C" value={data.angleC} onChange={(v) => set({ angleC: v })} placeholder="γ" />
      </div>
      <div className="ed-row">
        <Select label="Täisnurk tipus" value={data.right || ''} onChange={(v) => set({ right: v })} options={VERTEX} />
        <Select label="Kõrgus tipust" value={data.height || ''} onChange={(v) => set({ height: v })} options={VERTEX} />
        <Text label="Kõrguse silt" value={data.heightLabel ?? 'h'} onChange={(v) => set({ heightLabel: v })} />
        <Select label="Mediaan tipust" value={data.median || ''} onChange={(v) => set({ median: v })} options={VERTEX} />
        <Text label="Mediaani silt" value={data.medianLabel ?? 'm'} onChange={(v) => set({ medianLabel: v })} />
      </div>
    </>
  );
}

function CircleFields({ data, set }) {
  return (
    <>
      <div className="ed-row">
        <Text label="Nimed (keskpunkt, kõõlu otsad)" value={data.names ?? 'O A B'} onChange={(v) => set({ names: v })} />
        <Text label="Kesknurk AOB (kraadides)" value={String(data.central ?? '')} onChange={(v) => set({ central: v })} />
      </div>
      <div className="ed-row">
        <Measure label="Raadius" value={data.radius} onChange={(v) => set({ radius: v })} placeholder="r" />
        <Measure label="Diameeter" value={data.diameter} onChange={(v) => set({ diameter: v })} placeholder="d" />
        <Measure label="Kõõl" value={data.chord} onChange={(v) => set({ chord: v })} placeholder="AB" />
        <Measure label="Kesknurk" value={data.angle} onChange={(v) => set({ angle: v })} placeholder="α" />
      </div>
      <label className="ed-check"><input type="checkbox" checked={Boolean(data.sector)} onChange={(e) => set({ sector: e.target.checked })} /> Sektor toonitud</label>
    </>
  );
}

const SOLID_MEASURES = {
  cuboid: [['a', 'Serv a', 'a'], ['b', 'Serv b', 'b'], ['H', 'Kõrgus H', 'H'], ['d', 'Ruumidiagonaal', 'd'], ['dBase', 'Põhja diagonaal (kolmnurgas)', 'd₁']],
  prism: [['a', 'Põhiserv a', 'a'], ['b', 'Serv b (4-nurkne)', 'a'], ['H', 'Kõrgus H', 'H'], ['d', 'Ruumidiagonaal (4-nurkne)', 'd'], ['dBase', 'Põhja diagonaal (kolmnurgas)', 'd₁']],
  pyramid: [['a', 'Põhiserv a', 'a'], ['H', 'Kõrgus H', 'H'], ['k', 'Apoteem k', 'k'], ['s', 'Külgserv s', 's'], ['d', 'Põhja diagonaal', 'd']],
  cylinder: [['r', 'Raadius r', 'r'], ['H', 'Kõrgus H', 'H'], ['d', 'Telglõike diagonaal', 'd'], ['dBase', 'Diameeter (kolmnurgas)', '2r']],
  cone: [['r', 'Raadius r', 'r'], ['H', 'Kõrgus H', 'H'], ['s', 'Moodustaja s', 's']],
  sphere: [['r', 'Raadius r', 'r'], ['d', 'Diameeter d', 'd']],
};
const TRIANGLES = {
  cuboid: [['', 'Puudub'], ['d', 'Ruumidiagonaali kolmnurk']],
  prism: [['', 'Puudub'], ['d', 'Ruumidiagonaali kolmnurk (4-nurkne)']],
  pyramid: [['', 'Puudub'], ['k', 'H, apoteem k, a/2'], ['s', 'H, külgserv s, pool diagonaali']],
  cylinder: [['', 'Puudub'], ['d', 'H, 2r, telglõike diagonaal']],
  cone: [['', 'Puudub'], ['s', 'H, r, moodustaja s']],
  sphere: [['', 'Puudub']],
};

function SolidFields({ data, set }) {
  const kind = solidKind(data.solid);
  const round = ['cylinder', 'cone', 'sphere'].includes(kind);
  return (
    <>
      <div className="ed-row">
        <Select label="Keha" value={kind} onChange={(v) => set({ solid: v })} options={[['cuboid', 'Risttahukas'], ['prism', 'Korrapärane prisma'], ['pyramid', 'Korrapärane nelinurkne püramiid'], ['cylinder', 'Silinder'], ['cone', 'Koonus'], ['sphere', 'Kera']]} />
        {kind === 'prism' ? <Select label="Põhi" value={String(data.base || '4')} onChange={(v) => set({ base: v })} options={[['3', 'Kolmnurk'], ['4', 'Ruut']]} /> : null}
        <Select label="Esiletõstetud täisnurkne kolmnurk" value={data.triangle === true ? (TRIANGLES[kind][1]?.[0] || '') : String(data.triangle || '')} onChange={(v) => set({ triangle: v })} options={TRIANGLES[kind]} />
      </div>
      <Field label="Proportsioonid (arvud, võib jätta tühjaks)">
        <div className="ed-row">
          {(round ? [['rLen', 'r'], ...(kind === 'sphere' ? [] : [['hLen', 'H']])] : [['aLen', 'a'], ...(kind === 'cuboid' ? [['bLen', 'b']] : []), ['hLen', 'H']]).map(([k, l]) => (
            <input key={k} className="ed-input" aria-label={l} placeholder={l} value={String(data[k] ?? '')} onChange={(e) => set({ [k]: e.target.value })} />
          ))}
        </div>
      </Field>
      <div className="ed-row">
        {SOLID_MEASURES[kind].map(([k, l, ph]) => <Measure key={k} label={l} value={data[k]} onChange={(v) => set({ [k]: v })} placeholder={ph} />)}
      </div>
      {!round ? <Text label="Tippude nimed (põhi vastupäeva eest vasakult, siis ülemine põhi / tipp; püramiidil 6. on O)" value={data.names || ''} onChange={(v) => set({ names: v })} /> : null}
    </>
  );
}

function PolygonFields({ data, set }) {
  const check = (key, label, def) => <label className="ed-check"><input type="checkbox" checked={data[key] === undefined ? def : Boolean(data[key])} onChange={(e) => set({ [key]: e.target.checked })} /> {label}</label>;
  return (
    <>
      <Text label="Punktid (nt A(0;0) B(4;0) C(4;3))" value={data.points || ''} onChange={(v) => set({ points: v })} />
      <div className="ed-row">
        {check('axes', 'Teljed ja ruudustik', true)}
        {check('coords', 'Koordinaadid siltides', false)}
        {check('lengths', 'Külgede pikkused', false)}
        {check('rightAngles', 'Täisnurga märgid', true)}
        {check('tint', 'Toonitud sisu', false)}
      </div>
    </>
  );
}

const DEFAULTS = {
  triangle: { names: 'A B C', a: '', b: '6', c: '7', alpha: '40', beta: '', gamma: '', right: '', sideA: '?', sideB: 'b = 6', sideC: 'c = 7', angleA: 'α = 40°', angleB: '', angleC: '', height: '', heightLabel: 'h', median: '', medianLabel: 'm' },
  circle: { names: 'O A B', central: 100, radius: 'r = 5', diameter: '', chord: 'AB', angle: 'α = 100°', sector: false },
  solid: { solid: 'pyramid', base: '4', aLen: '', bLen: '', hLen: '', rLen: '', names: '', a: 'a = 6', H: 'H', k: 'k', s: '', d: '', r: '', b: '', dBase: '', triangle: 'k' },
  polygon: { points: 'A(0;0) B(4;0) C(4;3)', axes: true, coords: false, lengths: true, rightAngles: true, tint: false },
};

export const geofigure = {
  type: 'geofigure', label: 'Geomeetriline joonis (kolmnurk, ring, keha)', group: 'Matemaatika', icon: 'Triangle', task: false, width: 'half', tone: 'white',
  create: () => ({ kind: 'triangle', caption: '', ...DEFAULTS.triangle }),
  View: ({ data }) => (
    <figure className="ws-geo">
      <GeoSvg data={data || {}} />
      {data?.caption ? <figcaption><Md text={data.caption} /></figcaption> : null}
    </figure>
  ),
  score: null,
  Editor: ({ data, set }) => {
    const kind = figureKind(data.kind);
    return (
      <>
        <Select label="Joonis" value={kind} onChange={(v) => set({ ...DEFAULTS[v], kind: v })} options={[['triangle', 'Kolmnurk'], ['circle', 'Ring'], ['solid', 'Ruumiline keha'], ['polygon', 'Hulknurk koordinaatidega']]} />
        {kind === 'triangle' ? <TriangleFields data={data} set={set} /> : null}
        {kind === 'circle' ? <CircleFields data={data} set={set} /> : null}
        {kind === 'solid' ? <SolidFields data={data} set={set} /> : null}
        {kind === 'polygon' ? <PolygonFields data={data} set={set} /> : null}
        <Text label="Allkiri (valemid $…$ vahel)" value={data.caption || ''} onChange={(v) => set({ caption: v })} />
      </>
    );
  },
};
