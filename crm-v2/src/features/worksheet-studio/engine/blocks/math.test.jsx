import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { compileExpr, sameMathAnswer } from '../mathExpr.js';
import { mathtask, graph, parsePoints } from './math.jsx';
import { answerKeyOf } from '../answerKey.js';
import { checkDocument } from '../registry.js';

const ctx = { interactive: false, get: () => '', set: () => {}, state: () => '' };

describe('formula reader', () => {
  it('reads school notation', () => {
    expect(compileExpr('y = x^2 - 4x + 3').f(1)).toBe(0);
    expect(compileExpr('2(x+1)').f(2)).toBe(6);
    expect(compileExpr('x(x-1)').f(3)).toBe(6);
    expect(compileExpr('-x²').f(3)).toBe(-9);
    expect(compileExpr('2^-1').f(0)).toBe(0.5);
    expect(compileExpr('sqrt(x) + ln(e)').f(4)).toBe(3);
    expect(compileExpr('0,5x').f(4)).toBe(2);
    expect(compileExpr('sin(x)', true).f(90)).toBeCloseTo(1);
    expect(compileExpr('2sin(x)').f(Math.PI / 2)).toBeCloseTo(2);
  });
  it('reports a broken formula instead of throwing', () => {
    expect(compileExpr('x +* (').error).toBeTruthy();
    expect(compileExpr('alert(1)').error).toBeTruthy();
  });
});

describe('math answers', () => {
  it('compares as mathematics', () => {
    expect(sameMathAnswer('x = 2,5', '2.5')).toBe(true);
    expect(sameMathAnswer('5/2', '2,5')).toBe(true);
    expect(sameMathAnswer('x=3; x=1', 'x=1; x=3')).toBe(true);
    expect(sameMathAnswer('x=3', 'x=1; x=3')).toBe(false);
    expect(sameMathAnswer('(2; -1)', '(2;-1)')).toBe(true);
    expect(sameMathAnswer('3,14', '3.142')).toBe(true);
    expect(sameMathAnswer('', '1')).toBe(false);
  });
});

describe('math task block', () => {
  const data = mathtask.create();
  it('shows parts, points and answer lines', () => {
    const html = renderToStaticMarkup(<mathtask.View data={data} ctx={ctx} />);
    expect(html).toContain('4 p');
    expect(html).toContain('a)');
    expect(html).toContain('(2 p)');
    expect(html).toContain('ws-math-space--grid');
    expect(html).toContain('Vastus:');
    expect(html).toContain('katex');
  });
  it('scores the final answers and puts the solution into the teacher key', () => {
    const doc = { blocks: [{ id: 'm1', type: 'mathtask', data }] };
    const { score } = checkDocument(doc, { 'm1:p0': 'x=3; x=1', 'm1:p1': '(2; 1)' });
    expect(score.correct).toBe(1);
    expect(score.total).toBe(2);
    const [task] = answerKeyOf(doc);
    expect(task.items[0].answer).toBe('x=1; x=3');
    expect(task.items[0].why).toContain('x_1=1');
  });
});

describe('coordinate plane', () => {
  it('draws graphs, points and a shaded area', () => {
    const html = renderToStaticMarkup(<graph.View data={{ ...graph.create(), shade: 'x^2-4x+3; 1; 3' }} />);
    expect(html).toContain('<path');
    expect(html).toContain('<polygon');
    expect(html).toContain('>A<');
  });
  it('draws an empty grid when blank', () => {
    const html = renderToStaticMarkup(<graph.View data={{ ...graph.create(), blank: true }} />);
    expect(html).not.toContain('stroke-width="2"');
    expect(html).not.toContain('>A<');
  });
  it('reads points with a semicolon', () => {
    expect(parsePoints('A(1; 2)\nB(-0,5;3)')).toEqual([{ name: 'A', x: 1, y: 2 }, { name: 'B', x: -0.5, y: 3 }]);
  });
  it('a step of 0 draws the default grid, not a line every 0.01 (hotfix 2026-11-16)', () => {
    const html = renderToStaticMarkup(<graph.View data={{ ...graph.create(), xmin: -2, xmax: 7, ymin: -1, ymax: 10, step: 1, stepY: 0, blank: true }} />);
    expect((html.match(/<line/g) || []).length).toBeLessThan(40);
  });
});
