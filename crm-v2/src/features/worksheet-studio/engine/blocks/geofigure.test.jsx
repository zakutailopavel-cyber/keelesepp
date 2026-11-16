import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { geofigure } from './geofigure.jsx';
import { buildScene, parsePolygon, polyEdges, solveTriangle, triangleVertices } from './geofigureModel.js';
import { BLOCKS, paletteEntries } from '../registry.js';
import { NOT_TASKS } from '../../../worksheet-generator/admin/course/stationBlocks.js';

const html = (data) => renderToStaticMarkup(<geofigure.View data={data} ctx={{}} />);
// the svg text without its tspans: „H = 9” is written as <tspan>H</tspan><tspan> = 9</tspan>
const textOf = (markup) => markup.replace(/<\/?tspan[^>]*>/g, '');
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

describe('triangle geometry', () => {
  it('builds the triangle from three sides, to scale', () => {
    const sol = solveTriangle({ a: '3', b: '4', c: '5' });
    expect(sol.inconsistent).toBe(false);
    expect(sol.angles[2]).toBeCloseTo(90, 6);
    const [A, B, C] = triangleVertices(sol);
    expect(dist(B, C)).toBeCloseTo(3, 6);
    expect(dist(C, A)).toBeCloseTo(4, 6);
    expect(dist(A, B)).toBeCloseTo(5, 6);
  });
  it('builds it from two sides and the angle between them, or opposite one of them', () => {
    const sas = solveTriangle({ a: 5, b: 7, gamma: 60 });
    expect(sas.sides[2]).toBeCloseTo(Math.sqrt(39), 6);
    const ssa = solveTriangle({ a: '5', c: '10', gamma: '90' });
    expect(ssa.angles[0]).toBeCloseTo(30, 6);
    expect(ssa.sides[1]).toBeCloseTo(Math.sqrt(75), 6);
    const right = solveTriangle({ a: '3', b: '4', right: 'C' });
    expect(right.sides[2]).toBeCloseTo(5, 6);
    expect(solveTriangle({ alpha: 30, beta: 60, c: '2,5' }).sides[0]).toBeCloseTo(1.25, 6);
  });
  it('falls back to the default triangle on contradicting data and says so', () => {
    expect(solveTriangle({ a: 1, b: 2, c: 5 }).inconsistent).toBe(true);
    expect(solveTriangle({ a: 3, b: 4, c: 5, gamma: 60 }).inconsistent).toBe(true);
    expect(solveTriangle({ alpha: 100, beta: 100 }).inconsistent).toBe(true);
    expect(html({ kind: 'triangle', a: 1, b: 2, c: 5 })).toContain('ws-hint');
  });
  it('fills a shape from too few data without a warning', () => {
    for (const d of [{}, { a: 4 }, { gamma: 50 }, { a: 3, b: 4 }, { a: 2, alpha: 40 }]) {
      const sol = solveTriangle(d);
      expect(sol.inconsistent, JSON.stringify(d)).toBe(false);
      expect(sol.angles.reduce((x, y) => x + y)).toBeCloseTo(180, 6);
    }
  });
});

describe('geometry figure block', () => {
  it('is a math figure, not a task', () => {
    expect(BLOCKS.geofigure).toBe(geofigure);
    expect(geofigure.task).toBe(false);
    expect(geofigure.score).toBeNull();
    expect(NOT_TASKS.has('geofigure')).toBe(true);
    expect(paletteEntries().find((e) => e.key === 'geofigure').group).toBe('Matemaatika');
  });
  it('draws a triangle with labels, an angle arc, a right-angle mark and a height', () => {
    const out = html({ kind: 'triangle', a: 5, b: 7, gamma: 60, sideA: 'a = 5', sideC: '?', angleC: 'γ = 60°', height: 'C', heightLabel: 'h_c', caption: 'Leia $c$.' });
    expect(out).toContain('<svg');
    expect(out).toContain('γ');
    expect(out).toContain('60°');
    expect(out).toContain('#267743');
    expect(out).toContain('katex');
    expect(out).not.toContain('ws-hint');
    const right = html({ kind: 'triangle', a: 3, b: 4, right: 'C', median: 'C' });
    expect(right.match(/<path /g).length).toBeGreaterThanOrEqual(1);
  });
  it('draws a circle with radius, chord, central angle and sector', () => {
    const out = html({ kind: 'circle', radius: 'r = 6', chord: 'AB', angle: 'α = 110°', sector: true, diameter: 'd' });
    expect(out).toContain('110°');
    expect(out).toContain('<polygon');
    expect(out).toContain('>O<');
  });
  it('draws every solid, hidden edges dashed and the highlighted right triangle tinted', () => {
    for (const solid of ['cuboid', 'prism', 'pyramid', 'cylinder', 'cone', 'sphere']) {
      const out = html({ kind: 'solid', solid, a: 'a', H: 'H', r: 'r', s: 's', k: 'k', d: 'd', triangle: true });
      expect(out, solid).toContain('stroke-dasharray');
      if (solid !== 'sphere') expect(out, solid).toContain('fill-opacity="0.13"');
    }
    const tri = html({ kind: 'solid', solid: 'prism', base: '3', a: 'a = 4', H: 'H = 9' });
    expect(textOf(tri)).toContain('H = 9');
    // the height label sits beside the front left edge, not in the middle of the prism
    const x = Number(/x="([\d.]+)"[^>]*>[^<]*H = 9/.exec(textOf(tri))[1]);
    expect(x).toBeLessThan(100);
  });
  it('hides exactly the edges at the back corner of a cuboid', () => {
    const verts = [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]];
    const faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
    const hidden = polyEdges(verts, faces).filter((e) => !e.visible).map((e) => `${e.i}-${e.j}`).sort();
    expect(hidden).toEqual(['0-3', '2-3', '3-7']);
  });
  it('draws a polygon from coordinates with lengths and right angles', () => {
    expect(parsePolygon('A(0;0) B(4;0)\nC(4,5;3)')).toEqual([{ name: 'A', x: 0, y: 0 }, { name: 'B', x: 4, y: 0 }, { name: 'C', x: 4.5, y: 3 }]);
    const sc = buildScene({ kind: 'polygon', points: 'A(0;0) B(4;0) C(4;3)', lengths: true });
    expect(sc.rights).toHaveLength(1);
    expect(sc.labels.map((l) => l.text)).toEqual(expect.arrayContaining(['4', '3', '5']));
    expect(html({ kind: 'polygon', points: 'A(0;0)' })).toContain('ws-hint');
  });
  it('does not crash on bad data', () => {
    const bad = [undefined, null, {}, { kind: 'hexagon' }, { kind: 'triangle', a: 'x', b: -3, alpha: 'abc', right: 'Q', height: 'Z' }, { kind: 'circle', central: 'NaN' }, { kind: 'solid', solid: 'torus', aLen: -1, hLen: 0 }, { kind: 'polygon', points: 42 }, { kind: 'solid', solid: 'cone', triangle: 'zzz', rLen: '1e400' }];
    for (const d of bad) {
      const out = renderToStaticMarkup(<geofigure.View data={d} ctx={{}} />);
      expect(out).toContain('<svg');
      expect(out).not.toMatch(/NaN|Infinity/);
    }
  });
  it('the default block renders without a hint', () => {
    expect(html(geofigure.create())).not.toContain('ws-hint');
  });
});
