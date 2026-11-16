// „Geomeetriline joonis” (geofigure): pure geometry. Every kind is turned into one plain scene in model units (y up):
// lines, polylines, tinted polygons, dots, right-angle marks, angle arcs and labels. blocks/geofigure.jsx fits the scene
// into a 360-wide SVG and draws it the same way for every kind, so the look (black lines, one green accent) is one place.
//
// Data (block.data) for course files. A label field: '' / false = hidden, true = drawn without text, 'text' = drawn with it.
//  · common: kind: 'triangle' | 'circle' | 'solid' | 'polygon', caption ($…$ allowed)
//  · triangle: names 'A B C'; shape numbers a (=BC), b (=CA), c (=AB), alpha, beta, gamma (degrees) — three sides, two
//    sides + an angle, or a side + two angles; right: 'A'|'B'|'C' (mark, and 90° if that angle is empty);
//    sideA / sideB / sideC: side labels ('a = 5', '?'); angleA / angleB / angleC: arc + label ('γ = 60°');
//    height: 'A'|'B'|'C' + heightLabel ('h_c'); median: 'A'|'B'|'C' + medianLabel ('m_c')
//  · circle: names 'O A B'; central: angle AOB in degrees (default 100); radius, diameter, chord, angle: labels;
//    sector: true tints sector AOB
//  · solid: solid 'cuboid' | 'prism' | 'pyramid' | 'cylinder' | 'cone' | 'sphere'; base: 3 | 4 (prism);
//    proportions aLen, bLen (cuboid), hLen, rLen; labels a, b, H, r, s (cone generator / pyramid lateral edge),
//    k (pyramid apothem), d (space diagonal / axial-section diagonal / sphere diameter, pyramid base diagonal),
//    dBase (the base leg of the highlighted triangle); triangle: 'k' | 's' | 'd' | true (the right triangle used for
//    H or s, tinted green); names: vertex letters, base counter-clockwise from the front left, then top (pyramid: S, O)
//  · polygon: points 'A(0;0) B(4;0) C(4;3)'; axes (default true), coords, lengths, rightAngles (default true), tint

const RAD = Math.PI / 180;
const S = (v) => String(v ?? '').trim();

// a positive number from „5”, „5,2”, 5; anything else → null
export function posNum(v) {
  const s = S(v).replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// a label field: false / '' / undefined → hidden; true → drawn without text; text → drawn with that text
export const shown = (v) => v === true || (typeof v === 'string' && v.trim() !== '') || (typeof v === 'number' && Number.isFinite(v));
export const labelText = (v) => (v === true || v === false || v === undefined || v === null ? '' : S(v));

// ---------- triangle ----------

const DEFAULT_SIDES = [6, 5, 7];
const lawOfCos = (x, y, angle) => Math.sqrt(x * x + y * y - 2 * x * y * Math.cos(angle * RAD));
const angleFromSides = (opp, x, y) => Math.acos(Math.max(-1, Math.min(1, (x * x + y * y - opp * opp) / (2 * x * y)))) / RAD;
const anglesOf = ([a, b, c]) => [angleFromSides(a, b, c), angleFromSides(b, c, a), angleFromSides(c, a, b)];
const validSides = ([a, b, c]) => a + b > c * 1.0001 && b + c > a * 1.0001 && a + c > b * 1.0001;
const VERTS = ['A', 'B', 'C'];

// sides a = BC, b = CA, c = AB (side i is opposite vertex i); angles in degrees. Given: any of a, b, c, alpha, beta,
// gamma and `right` ('A' | 'B' | 'C'). Three sides, two sides + any angle, or one side + two angles fix the shape;
// fewer data → a nice default with what was given; contradicting data → the default triangle and `inconsistent`.
export function solveTriangle(d = {}) {
  const side = [posNum(d.a), posNum(d.b), posNum(d.c)];
  const ang = [posNum(d.alpha), posNum(d.beta), posNum(d.gamma)].map((x) => (x !== null && x < 180 ? x : null));
  const r = VERTS.indexOf(S(d.right).toUpperCase());
  if (r >= 0 && ang[r] === null) ang[r] = 90;
  const fail = { sides: DEFAULT_SIDES, angles: anglesOf(DEFAULT_SIDES), inconsistent: true };
  const done = (sides) => {
    if (!sides.every((x) => Number.isFinite(x) && x > 0) || !validSides(sides)) return fail;
    const angles = anglesOf(sides);
    // the given data must agree with the shape (a drawing „to scale” must not lie)
    const sideOk = side.every((x, i) => x === null || Math.abs(x - sides[i]) / sides[i] < 0.02);
    const angOk = ang.every((x, i) => x === null || Math.abs(x - angles[i]) < 1);
    return sideOk && angOk ? { sides, angles, inconsistent: false } : fail;
  };
  const knownAngles = ang.filter((x) => x !== null).length;
  const knownSides = side.filter((x) => x !== null).length;
  if (knownAngles >= 2) {
    const [i, j] = [0, 1, 2].filter((k) => ang[k] !== null);
    const k = 3 - i - j;
    const third = 180 - ang[i] - ang[j];
    if (third <= 0 || (ang[k] !== null && Math.abs(ang[k] - third) > 1)) return fail;
    const all = ang.map((x, n) => (n === k ? third : x));
    const ref = side.findIndex((x) => x !== null);
    const ratio = ref >= 0 ? side[ref] / Math.sin(all[ref] * RAD) : 7 / Math.sin(all[2] * RAD);
    return done(all.map((x) => ratio * Math.sin(x * RAD)));
  }
  if (knownSides === 3) return done(side);
  if (knownSides === 2 && knownAngles === 1) {
    const k = ang.findIndex((x) => x !== null);
    const missing = side.findIndex((x) => x === null);
    if (missing === k) { // the angle lies between the two given sides
      const out = [...side];
      out[k] = lawOfCos(side[(k + 1) % 3], side[(k + 2) % 3], ang[k]);
      return done(out);
    }
    if (side[k] === null) return fail;
    // the angle lies opposite a given side (SSA): the acute solution of the law of sines
    const other = 3 - k - missing;
    const sin = (side[other] * Math.sin(ang[k] * RAD)) / side[k];
    if (sin > 1 + 1e-9) return fail;
    const angOther = Math.asin(Math.min(1, sin)) / RAD;
    const angMissing = 180 - ang[k] - angOther;
    if (angMissing <= 0) return fail;
    const out = [...side];
    out[missing] = (side[k] * Math.sin(angMissing * RAD)) / Math.sin(ang[k] * RAD);
    return done(out);
  }
  if (knownAngles === 1) { // one angle: fill the sides around it
    const k = ang.findIndex((x) => x !== null);
    const [p, q] = [(k + 1) % 3, (k + 2) % 3];
    const sp = side[p] ?? (side[q] ? side[q] * 1.2 : 5);
    const sq = side[q] ?? sp * 1.2;
    if (side[k] !== null) { // side opposite the angle known too: solve with a default for one neighbour
      const out = [...side];
      const sin = (sp * Math.sin(ang[k] * RAD)) / side[k];
      if (sin < 1) {
        out[p] = sp;
        const angP = Math.asin(sin) / RAD;
        const angQ = 180 - ang[k] - angP;
        if (angQ > 0) { out[q] = (side[k] * Math.sin(angQ * RAD)) / Math.sin(ang[k] * RAD); return done(out); }
      }
      const scaled = [...side];
      scaled[p] = side[k] * 0.8; scaled[q] = null;
      return solveTriangle({ ...d, a: scaled[0] ?? '', b: scaled[1] ?? '', c: scaled[2] ?? '' });
    }
    const out = [...side];
    out[p] = sp; out[q] = sq;
    out[k] = lawOfCos(sp, sq, ang[k]);
    return done(out);
  }
  if (knownSides === 2) { // two sides, no angle: 70° between them
    const missing = side.findIndex((x) => x === null);
    const out = [...side];
    out[missing] = lawOfCos(side[(missing + 1) % 3], side[(missing + 2) % 3], 70);
    return done(out);
  }
  if (knownSides === 1) { // one side: the default shape scaled to it
    const k = side.findIndex((x) => x !== null);
    return done(DEFAULT_SIDES.map((x) => (x * side[k]) / DEFAULT_SIDES[k]));
  }
  return { sides: DEFAULT_SIDES, angles: anglesOf(DEFAULT_SIDES), inconsistent: false };
}

// A at the origin, B on the x axis, C above: model coordinates of the solved triangle
export function triangleVertices(sol) {
  const [, b, c] = sol.sides;
  const alpha = sol.angles[0] * RAD;
  return [[0, 0], [c, 0], [b * Math.cos(alpha), b * Math.sin(alpha)]];
}

const names3 = (v, fallback) => {
  const parts = S(v).split(/[\s,;]+/).filter(Boolean);
  return fallback.map((f, i) => parts[i] || f);
};
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const mul = (p, k) => [p[0] * k, p[1] * k];
const dot = (p, q) => p[0] * q[0] + p[1] * q[1];
const centroid = (pts) => mul(pts.reduce(add, [0, 0]), 1 / Math.max(1, pts.length));
const emptyScene = () => ({ lines: [], paths: [], polys: [], dots: [], rights: [], arcs: [], labels: [], ticks: [], warnings: [] });

function triangleScene(d) {
  const sc = emptyScene();
  const sol = solveTriangle(d);
  if (sol.inconsistent) sc.warnings.push('Antud küljed ja nurgad ei sobi kolmnurgaks: joonisel on näidiskolmnurk.');
  const V = triangleVertices(sol);
  const names = names3(d.names, VERTS);
  sc.center = centroid(V);
  sc.paths.push({ pts: [...V, V[0]], width: 1.9 });
  V.forEach((p, i) => sc.labels.push({ at: p, text: names[i], away: true, gap: 13, kind: 'vertex' }));
  // side i joins the other two vertices
  ['sideA', 'sideB', 'sideC'].forEach((key, i) => {
    if (shown(d[key])) sc.labels.push({ p: V[(i + 1) % 3], q: V[(i + 2) % 3], text: labelText(d[key]) });
  });
  const rightAt = VERTS.indexOf(S(d.right).toUpperCase());
  ['angleA', 'angleB', 'angleC'].forEach((key, i) => {
    const p = V[(i + 1) % 3];
    const q = V[(i + 2) % 3];
    if (i === rightAt) sc.rights.push({ at: V[i], u: p, v: q });
    else if (shown(d[key])) sc.arcs.push({ at: V[i], u: p, v: q, accent: true, double: false });
    if (shown(d[key]) && labelText(d[key])) sc.labels.push({ at: V[i], bisect: [p, q], text: labelText(d[key]), angle: sol.angles[i], right: i === rightAt, vertex: i });
  });
  const cevian = (key, labelKey, fallback, foot) => {
    const i = VERTS.indexOf(S(d[key]).toUpperCase());
    if (i < 0) return;
    const P = V[(i + 1) % 3];
    const Q = V[(i + 2) % 3];
    const F = foot(V[i], P, Q);
    sc.lines.push({ p: V[i], q: F, accent: true, width: 1.6 });
    const PQ = sub(Q, P);
    const t = dot(sub(F, P), PQ) / dot(PQ, PQ);
    // inside: the label goes into the wider part; a foot on the extension: the label stays outside the triangle
    const far = dot(sub(F, P), sub(F, P)) > dot(sub(F, Q), sub(F, Q)) ? P : Q;
    const toward = t >= 0 && t <= 1 ? far : add(F, sub(F, t < 0 ? Q : P));
    sc.labels.push({ p: V[i], q: F, text: d[labelKey] === undefined ? fallback : labelText(d[labelKey]), toward, accent: true });
    return { i, P, Q, F };
  };
  const h = cevian('height', 'heightLabel', 'h', (A, P, Q) => {
    const PQ = sub(Q, P);
    const t = dot(sub(A, P), PQ) / dot(PQ, PQ);
    return add(P, mul(PQ, t));
  });
  if (h) {
    const PQ = sub(h.Q, h.P);
    const t = dot(sub(h.F, h.P), PQ) / dot(PQ, PQ);
    if (t < -0.001 || t > 1.001) sc.lines.push({ p: t < 0 ? h.P : h.Q, q: h.F, dashed: true, width: 1.2 }); // the foot lies on the extension
    if (dot(sub(h.F, V[h.i]), sub(h.F, V[h.i])) > 1e-9) sc.rights.push({ at: h.F, u: V[h.i], v: t < 0.5 ? h.Q : h.P, accent: true });
  }
  const m = cevian('median', 'medianLabel', 'm', (A, P, Q) => mid(P, Q));
  if (m) [[m.P, m.F], [m.F, m.Q]].forEach(([p, q]) => sc.ticks.push({ p, q, accent: true }));
  // an angle label must not sit on a height or median from its vertex: it moves into the wider half of the angle
  sc.labels.forEach((l) => {
    const c = [h, m].find((x) => x && x.i === l.vertex);
    if (c) l.avoid = c.F;
  });
  return sc;
}

// ---------- circle ----------

function circleScene(d) {
  const sc = emptyScene();
  const O = [0, 0];
  sc.center = O;
  const n = 120;
  sc.paths.push({ pts: Array.from({ length: n + 1 }, (_, k) => [Math.cos((2 * Math.PI * k) / n), Math.sin((2 * Math.PI * k) / n)]), width: 1.9 });
  sc.dots.push({ at: O });
  const [nO, nA, nB] = names3(d.names, ['O', 'A', 'B']);
  sc.labels.push({ at: O, text: nO, offset: [-9, -9], kind: 'vertex' });
  const phi = Math.max(10, Math.min(350, posNum(d.central) ?? 100));
  const tA = (270 - phi / 2) * RAD;
  const tB = (270 + phi / 2) * RAD;
  const A = [Math.cos(tA), Math.sin(tA)];
  const B = [Math.cos(tB), Math.sin(tB)];
  const useAB = shown(d.chord) || d.sector || shown(d.angle);
  if (d.sector) {
    const pts = [O, ...Array.from({ length: 61 }, (_, k) => { const t = tA + ((tB - tA) * k) / 60; return [Math.cos(t), Math.sin(t)]; }), O];
    sc.polys.push({ pts });
  }
  if (useAB) {
    sc.lines.push({ p: O, q: A, width: 1.5 });
    sc.lines.push({ p: O, q: B, width: 1.5 });
    sc.dots.push({ at: A }, { at: B });
    sc.labels.push({ at: A, text: nA, away: true, kind: 'vertex' }, { at: B, text: nB, away: true, kind: 'vertex' });
  }
  if (shown(d.chord)) {
    sc.lines.push({ p: A, q: B, width: 1.8, accent: true });
    if (labelText(d.chord)) sc.labels.push({ p: A, q: B, text: labelText(d.chord), toward: [0, -2], accent: true });
  }
  if (shown(d.angle)) {
    sc.arcs.push({ at: O, u: A, v: B, accent: true, reflex: phi > 180 });
    if (labelText(d.angle)) sc.labels.push({ at: O, bisect: [A, B], text: labelText(d.angle), angle: phi, reflex: phi > 180 });
  }
  if (shown(d.diameter)) {
    const L = [-1, 0];
    const R = [1, 0];
    sc.lines.push({ p: L, q: R, width: 1.5 });
    sc.dots.push({ at: L }, { at: R });
    if (labelText(d.diameter)) sc.labels.push({ p: L, q: [0, 0], text: labelText(d.diameter), toward: [-0.5, 1] });
  }
  if (shown(d.radius)) {
    if (useAB) {
      if (labelText(d.radius)) sc.labels.push({ p: O, q: B, text: labelText(d.radius), toward: [2, 0] });
    } else {
      const t = 40 * RAD;
      const P = [Math.cos(t), Math.sin(t)];
      sc.lines.push({ p: O, q: P, width: 1.5 });
      sc.dots.push({ at: P });
      if (labelText(d.radius)) sc.labels.push({ p: O, q: P, text: labelText(d.radius), toward: [-1, 2] });
    }
  }
  return sc;
}

// ---------- polygon from coordinates ----------

// „A(0;0) B(4;0) C(4;3)” (spaces, commas or new lines between points; decimal comma allowed)
export function parsePolygon(text) {
  const out = [];
  const re = /([A-Za-zÕÄÖÜõäöü][\w']*)\s*\(\s*(-?\d+(?:[.,]\d+)?)\s*;\s*(-?\d+(?:[.,]\d+)?)\s*\)/g;
  for (let m = re.exec(S(text)); m; m = re.exec(S(text))) out.push({ name: m[1], x: Number(m[2].replace(',', '.')), y: Number(m[3].replace(',', '.')) });
  return out;
}

const fmt = (x) => String(Math.round(x * 100) / 100).replace('.', ',');

function polygonScene(d) {
  const sc = emptyScene();
  const pts = parsePolygon(d.points);
  if (pts.length < 3) {
    const fallback = triangleScene({});
    fallback.warnings.push('Kirjuta vähemalt kolm punkti kujul A(0;0) B(4;0) C(4;3).');
    return fallback;
  }
  const P = pts.map((p) => [p.x, p.y]);
  sc.center = centroid(P);
  if (d.axes !== false) {
    const xs = P.map((p) => p[0]);
    const ys = P.map((p) => p[1]);
    const box = { x0: Math.floor(Math.min(0, ...xs)) - 1, x1: Math.ceil(Math.max(0, ...xs)) + 1, y0: Math.floor(Math.min(0, ...ys)) - 1, y1: Math.ceil(Math.max(0, ...ys)) + 1 };
    if (box.x1 - box.x0 <= 40 && box.y1 - box.y0 <= 40) {
      for (let x = box.x0; x <= box.x1; x += 1) sc.lines.push({ p: [x, box.y0], q: [x, box.y1], grid: true });
      for (let y = box.y0; y <= box.y1; y += 1) sc.lines.push({ p: [box.x0, y], q: [box.x1, y], grid: true });
    }
    sc.lines.push({ p: [box.x0, 0], q: [box.x1, 0], axis: true }, { p: [0, box.y0], q: [0, box.y1], axis: true });
    sc.labels.push({ at: [box.x1, 0], text: 'x', offset: [-4, -8], kind: 'axis' }, { at: [0, box.y1], text: 'y', offset: [9, 6], kind: 'axis' });
    const every = Math.max(1, Math.ceil((box.x1 - box.x0) / 12));
    const taken = (x, y) => P.some((p) => Math.abs(p[0] - x) < 0.6 && Math.abs(p[1] - y) < 0.6); // a vertex label is there
    for (let x = box.x0 + 1; x < box.x1; x += 1) if (x !== 0 && x % every === 0 && !taken(x, 0)) sc.labels.push({ at: [x, 0], text: String(x), offset: [0, 13], kind: 'tick' });
    for (let y = box.y0 + 1; y < box.y1; y += 1) if (y !== 0 && y % every === 0 && !taken(0, y)) sc.labels.push({ at: [0, y], text: String(y), offset: [-9, 0], kind: 'tick' });
    if (!taken(0, 0)) sc.labels.push({ at: [0, 0], text: '0', offset: [-8, 12], kind: 'tick' });
  }
  sc.paths.push({ pts: [...P, P[0]], width: 1.9, tint: Boolean(d.tint) });
  P.forEach((p) => sc.dots.push({ at: p }));
  pts.forEach((p, i) => sc.labels.push({ at: P[i], text: d.coords ? `${p.name}(${fmt(p.x)}; ${fmt(p.y)})` : p.name, away: true, gap: 13, kind: 'vertex' }));
  P.forEach((p, i) => {
    const prev = P[(i - 1 + P.length) % P.length];
    const next = P[(i + 1) % P.length];
    const u = sub(prev, p);
    const v = sub(next, p);
    const cos = dot(u, v) / Math.sqrt(dot(u, u) * dot(v, v) || 1);
    if (d.rightAngles !== false && Math.abs(cos) < 0.009) sc.rights.push({ at: p, u: prev, v: next });
    if (d.lengths) sc.labels.push({ p, q: next, text: fmt(Math.hypot(next[0] - p[0], next[1] - p[1])), toward: d.axes !== false ? sc.center : undefined });
  });
  return sc;
}

// ---------- solids ----------

const K = 0.5 * Math.SQRT1_2; // cabinet projection: depth at 45°, shortened by half
const proj = ([x, y, z]) => [x + K * y, z + K * y];
const VIEW = [K, -1, K]; // towards the viewer (front = −y, top = +z, right = +x)
const v3 = {
  sub: (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]],
  add: (p, q) => [p[0] + q[0], p[1] + q[1], p[2] + q[2]],
  mul: (p, k) => [p[0] * k, p[1] * k, p[2] * k],
  dot: (p, q) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2],
  cross: (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]],
  mid: (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2],
};

// convex polyhedron: an edge is hidden (dashed) when every face it belongs to faces away from the viewer
export function polyEdges(verts, faces) {
  const c = v3.mul(verts.reduce(v3.add, [0, 0, 0]), 1 / verts.length);
  const edges = new Map();
  faces.forEach((f) => {
    const fc = v3.mul(f.map((i) => verts[i]).reduce(v3.add, [0, 0, 0]), 1 / f.length);
    let n = v3.cross(v3.sub(verts[f[1]], verts[f[0]]), v3.sub(verts[f[2]], verts[f[0]]));
    if (v3.dot(n, v3.sub(fc, c)) < 0) n = v3.mul(n, -1);
    const visible = v3.dot(n, VIEW) > 1e-9;
    f.forEach((i, k) => {
      const j = f[(k + 1) % f.length];
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      const e = edges.get(key) || { i: Math.min(i, j), j: Math.max(i, j), visible: false };
      e.visible = e.visible || visible;
      edges.set(key, e);
    });
  });
  return [...edges.values()];
}

const SOLIDS = ['cuboid', 'prism', 'pyramid', 'cylinder', 'cone', 'sphere'];
export const solidKind = (v) => (SOLIDS.includes(S(v)) ? S(v) : 'cuboid');

function polyhedron(d, kind) {
  const a = posNum(d.aLen) ?? (kind === 'cuboid' ? 6 : 4);
  const b = kind === 'cuboid' ? posNum(d.bLen) ?? 3.5 : a;
  const H = posNum(d.hLen) ?? (kind === 'pyramid' ? 5 : 4.5);
  const n = kind === 'prism' && String(d.base) === '3' ? 3 : 4;
  let verts;
  let faces;
  if (kind === 'pyramid') {
    verts = [[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0], [a / 2, a / 2, H]];
    faces = [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
  } else if (n === 3) {
    const base = [[0, 0, 0], [a, 0, 0], [a / 2, (a * Math.sqrt(3)) / 2, 0]];
    verts = [...base, ...base.map(([x, y]) => [x, y, H])];
    faces = [[0, 1, 2], [3, 4, 5], [0, 1, 4, 3], [1, 2, 5, 4], [2, 0, 3, 5]];
  } else {
    const base = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0]];
    verts = [...base, ...base.map(([x, y]) => [x, y, H])];
    faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  }
  return { verts, faces, a, b, H, n };
}

function solidScene(d) {
  const sc = emptyScene();
  const kind = solidKind(d.solid);
  const tri = d.triangle === true ? { pyramid: 'k', cone: 's', cylinder: 'd', cuboid: 'd', prism: 'd' }[kind] || '' : S(d.triangle);
  const seg3 = (p, q, opts = {}) => sc.lines.push({ p: proj(p), q: proj(q), ...opts });
  const label3 = (p, q, key, opts = {}) => { if (labelText(d[key])) sc.labels.push({ p: proj(p), q: proj(q), text: labelText(d[key]), ...opts }); };
  const right3 = (at, u, v, accent) => sc.rights.push({ at: proj(at), u: proj(u), v: proj(v), accent });
  const tint3 = (pts) => sc.polys.push({ pts: pts.map(proj) });
  if (kind === 'cuboid' || kind === 'prism' || kind === 'pyramid') {
    const { verts, faces, a, b, H, n } = polyhedron(d, kind);
    const P = verts.map(proj);
    sc.center = centroid(P);
    polyEdges(verts, faces).forEach((e) => sc.lines.push({ p: P[e.i], q: P[e.j], dashed: !e.visible, width: e.visible ? 1.8 : 1.2 }));
    const names = S(d.names).split(/[\s,;]+/).filter(Boolean);
    names.slice(0, verts.length).forEach((name, i) => sc.labels.push({ at: P[i], text: name, away: true, gap: 12, kind: 'vertex' }));
    if (shown(d.a)) label3(verts[0], verts[1], 'a', { toward: [0, -5] });
    if (kind === 'pyramid') {
      const O = [a / 2, a / 2, 0];
      const S3 = verts[4];
      const M = v3.mid(verts[1], verts[2]); // the apothem lies on the right (visible) face: a wide, readable triangle
      if (names[5]) sc.labels.push({ at: proj(O), text: names[5], offset: [-10, 10], kind: 'vertex' });
      if (shown(d.H) || tri) { seg3(S3, O, { dashed: true, accent: Boolean(tri), width: 1.4 }); sc.dots.push({ at: proj(O) }); }
      if (shown(d.H)) label3(S3, O, 'H', { toward: proj([-1, 0, H / 2]) });
      if (shown(d.k) || tri === 'k') { seg3(S3, M, { accent: tri === 'k', width: 1.6 }); label3(S3, M, 'k', { toward: proj([a * 3, a / 2, H]) }); }
      if (shown(d.s)) label3(S3, verts[1], 's', { toward: proj([a * 3, 0, H / 2]) });
      if (tri === 'k') { seg3(O, M, { dashed: true, accent: true, width: 1.4 }); tint3([S3, O, M]); right3(O, S3, M, true); }
      if (tri === 's') { seg3(O, verts[1], { dashed: true, accent: true, width: 1.4 }); seg3(S3, verts[1], { accent: true, width: 1.8 }); tint3([S3, O, verts[1]]); right3(O, S3, verts[1], true); }
      if (shown(d.d)) { seg3(verts[0], verts[2], { dashed: true, width: 1.2 }); label3(verts[0], verts[2], 'd', { toward: proj([a, 0, 0]) }); }
    } else {
      if (n === 4 && shown(d.b)) label3(verts[1], verts[2], 'b', { toward: [a * 3, -b] });
      const diag = n === 4 && (shown(d.d) || tri === 'd');
      // with the space diagonal the height goes to the back right edge, so the right triangle is whole
      const hEdge = diag ? [verts[2], verts[6]] : [verts[0], verts[n]];
      if (shown(d.H)) label3(hEdge[0], hEdge[1], 'H', { toward: diag ? [a * 3, H / 2] : [-a, H / 2] });
      if (diag) {
        seg3(verts[0], verts[6], { dashed: true, accent: tri === 'd', width: 1.5 });
        label3(verts[0], verts[6], 'd', { toward: [-a, H * 2] });
        if (tri === 'd') {
          seg3(verts[0], verts[2], { dashed: true, accent: true, width: 1.4 });
          seg3(verts[2], verts[6], { accent: true, width: 1.8, dashed: false });
          tint3([verts[0], verts[2], verts[6]]);
          right3(verts[2], verts[0], verts[6], true);
          if (shown(d.dBase)) label3(verts[0], verts[2], 'dBase', { toward: [a, -b * 3] });
        }
      }
    }
    return sc;
  }
  // round solids: front view with elliptical bases (as in the exam booklet), not the cabinet projection
  const R = posNum(d.rLen) ?? 2.5;
  const H = posNum(d.hLen) ?? (kind === 'sphere' ? 0 : 5);
  const e = 0.3 * R;
  const ellipse = (cy, from, to) => Array.from({ length: 49 }, (_, k) => { const t = from + ((to - from) * k) / 48; return [R * Math.cos(t), cy + e * Math.sin(t)]; });
  const front = (cy, opts = {}) => sc.paths.push({ pts: ellipse(cy, Math.PI, 2 * Math.PI), width: 1.8, ...opts });
  const back = (cy, opts = {}) => sc.paths.push({ pts: ellipse(cy, 0, Math.PI), dashed: true, width: 1.2, ...opts });
  const O = [0, 0];
  const Rp = [R, 0];
  const labelAt = (p, q, key, toward) => { if (labelText(d[key])) sc.labels.push({ p, q, text: labelText(d[key]), toward }); };
  const names = S(d.names).split(/[\s,;]+/).filter(Boolean);
  if (kind === 'sphere') {
    sc.center = O;
    sc.paths.push({ pts: Array.from({ length: 121 }, (_, k) => [R * Math.cos((2 * Math.PI * k) / 120), R * Math.sin((2 * Math.PI * k) / 120)]), width: 1.9 });
    front(0, { width: 1.4 });
    back(0);
    sc.dots.push({ at: O });
    sc.labels.push({ at: O, text: names[0] || 'O', offset: [-10, 12], kind: 'vertex' });
    if (shown(d.r)) {
      const P = [R * Math.cos(35 * RAD), R * Math.sin(35 * RAD)];
      sc.lines.push({ p: O, q: P, width: 1.6, accent: Boolean(tri) });
      sc.dots.push({ at: P });
      labelAt(O, P, 'r', [-R, R * 2]);
    }
    if (shown(d.d)) { sc.lines.push({ p: [-R, 0], q: Rp, width: 1.4 }); labelAt([-R, 0], O, 'd', [-R / 2, -R]); }
    return sc;
  }
  sc.center = [0, H / 2];
  const top = [0, H];
  if (kind === 'cylinder') {
    front(0);
    back(0);
    sc.paths.push({ pts: ellipse(H, 0, 2 * Math.PI), width: 1.8 });
    sc.lines.push({ p: [-R, 0], q: [-R, H], width: 1.8 }, { p: Rp, q: [R, H], width: 1.8 });
    if (shown(d.r)) { sc.lines.push({ p: top, q: [R, H], width: 1.5 }); sc.dots.push({ at: top }); labelAt(top, [R, H], 'r', [0, H + R]); }
    if (shown(d.H)) labelAt(Rp, [R, H], 'H', [R * 3, H / 2]);
    const diag = shown(d.d) || tri === 'd';
    if (diag) {
      sc.lines.push({ p: [-R, 0], q: [R, H], dashed: true, accent: tri === 'd', width: 1.5 });
      labelAt([-R, 0], [R, H], 'd', [-R, H * 2]);
    }
    if (tri === 'd') {
      sc.lines.push({ p: [-R, 0], q: Rp, dashed: true, accent: true, width: 1.4 }, { p: Rp, q: [R, H], accent: true, width: 1.9 });
      sc.polys.push({ pts: [[-R, 0], Rp, [R, H]] });
      sc.rights.push({ at: Rp, u: [-R, 0], v: [R, H], accent: true });
    }
    if (shown(d.dBase) && tri === 'd') labelAt([-R, 0], Rp, 'dBase', [0, -R]);
    return sc;
  }
  // cone
  front(0);
  back(0);
  sc.lines.push({ p: [-R, 0], q: top, width: 1.8 }, { p: Rp, q: top, width: 1.8, accent: tri === 's' });
  if (names[0]) sc.labels.push({ at: top, text: names[0], offset: [0, -10], kind: 'vertex' });
  if (shown(d.H) || tri) { sc.lines.push({ p: O, q: top, dashed: true, accent: Boolean(tri), width: 1.4 }); sc.dots.push({ at: O }); }
  if (shown(d.H)) labelAt(O, top, 'H', [-R, H / 2]);
  if (shown(d.r) || tri) sc.lines.push({ p: O, q: Rp, dashed: true, accent: Boolean(tri), width: 1.4 });
  if (shown(d.r)) labelAt(O, Rp, 'r', [R / 2, R]);
  if (shown(d.s)) labelAt(Rp, top, 's', [R * 3, H]);
  if (tri) { sc.polys.push({ pts: [O, Rp, top] }); sc.rights.push({ at: O, u: Rp, v: top, accent: true }); }
  return sc;
}

export const KINDS = ['triangle', 'circle', 'solid', 'polygon'];
export const figureKind = (v) => (KINDS.includes(S(v)) ? S(v) : 'triangle');

// any data → a scene; never throws (a broken figure must not break the sheet)
export function buildScene(d = {}) {
  const data = d && typeof d === 'object' ? d : {};
  try {
    const kind = figureKind(data.kind);
    if (kind === 'circle') return circleScene(data);
    if (kind === 'solid') return solidScene(data);
    if (kind === 'polygon') return polygonScene(data);
    return triangleScene(data);
  } catch {
    const sc = triangleScene({});
    sc.warnings.push('Joonist ei saanud nendest andmetest teha: näidatud on näidiskolmnurk.');
    return sc;
  }
}
