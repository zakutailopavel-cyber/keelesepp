import { render, screen } from '@testing-library/react';
import { diagram } from './diagram.jsx';
import { diagramLayout, diagramNodes } from './diagramModel.js';

const ctx = (values = {}) => ({ interactive: true, get: (k) => values[k] || '', set: vi.fn(), state: () => undefined });

describe('Skeem block', () => {
  it('reads boxes and gaps from lines, at most 12', () => {
    expect(diagramNodes({ nodes: 'hommikul\n[päeval|lõunal]\n\nõhtul' })).toEqual([{ text: 'hommikul' }, { gap: ['päeval', 'lõunal'] }, { text: 'õhtul' }]);
    expect(diagramNodes({ nodes: Array.from({ length: 20 }, (_, i) => `k${i}`).join('\n') })).toHaveLength(12);
  });

  it('lays out a mind map around the centre, a chain as a snake in rows of four, a tree under its top box', () => {
    const mind = diagramLayout('mind', 4);
    expect(mind.center).toEqual({ x: 50, y: 20 });
    expect(mind.points[0].x).toBeCloseTo(50);
    expect(mind.points[0].y).toBeLessThan(mind.center.y);
    const flow = diagramLayout('flow', 6);
    expect(flow.center).toBeNull();
    expect(flow.links).toHaveLength(5);
    expect(flow.points[4].y).toBeGreaterThan(flow.points[3].y);
    expect(flow.points[4].x).toBe(flow.points[3].x); // a snake: the step to the next row goes straight down
    expect(flow.points[5].x).toBeLessThan(flow.points[4].x);
    expect(diagramLayout('tree', 3).links).toEqual([['c', 0], ['c', 1], ['c', 2]]);
  });

  it('scores the gap boxes (centre too) like gap tasks', () => {
    const data = { kind: 'mind', center: '[päev]', nodes: 'hommikul\n[õhtul]' };
    expect(diagram.answers(data).map((a) => a.key)).toEqual(['c', 'n1']);
    const values = { c: 'Päev', n1: 'öösel' };
    expect(diagram.score(data, (k) => values[k])).toEqual([{ key: 'c', ok: true }, { key: 'n1', ok: false }]);
    expect(diagram.answers({ kind: 'flow', center: '[x]', nodes: 'a' })).toEqual([]);
  });

  it('renders boxes and an input for each gap', () => {
    render(<diagram.View data={{ kind: 'mind', center: 'Minu päev', nodes: 'hommikul\n[päeval]' }} ctx={ctx()} id="b1" />);
    expect(screen.getByText('Minu päev')).toBeInTheDocument();
    expect(screen.getByText('hommikul')).toBeInTheDocument();
    expect(screen.getByLabelText('Skeemi lünk 2')).toBeInTheDocument();
  });
});
