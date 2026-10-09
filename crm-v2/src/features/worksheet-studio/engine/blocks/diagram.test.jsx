import { render, screen } from '@testing-library/react';
import { diagram } from './diagram.jsx';
import { KIND_SAMPLES, cellParts, cycleArcs, diagramLayout, diagramNodes, mindMapLayout, mindTree, pairLines, switchKind } from './diagramModel.js';
import { createBlock, isPaletteKey, paletteEntries } from '../registry.js';

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

describe('Skeem kinds (2026-10-09)', () => {
  it('reads gaps inside a sentence; the first gap keeps the cell key', () => {
    expect(cellParts('[Pesen] hambaid ja [kammin|harjan] juukseid', 'n1')).toEqual([
      { gap: ['Pesen'], key: 'n1' }, { text: ' hambaid ja ' }, { gap: ['kammin', 'harjan'], key: 'n1.1' }, { text: ' juukseid' },
    ]);
  });

  it('splits timeline and formula lines on the bar outside a gap', () => {
    expect(pairLines('eile | [käisin|olin] kinos\nlihtsalt tekst')).toEqual([{ label: 'eile', text: '[käisin|olin] kinos' }, { label: '', text: 'lihtsalt tekst' }]);
  });

  it('scores every kind from its own fields', () => {
    const venn = { kind: 'venn', left: 'Linn', right: '[Maa]', leftItems: '[pood]', both: 'kodu\n[sõbrad]', rightItems: 'mets' };
    expect(diagram.answers(venn).map((a) => a.key)).toEqual(['R', 'l0', 'm1']);
    const timeline = { kind: 'timeline', nodes: '[eile] | [käisin] kinos\ntäna | olen kodus' };
    expect(diagram.answers(timeline).map((a) => a.key)).toEqual(['t0', 'n0']);
    const values = { t0: 'Eile', n0: 'läksin' };
    expect(diagram.score(timeline, (k) => values[k])).toEqual([{ key: 't0', ok: true }, { key: 'n0', ok: false }]);
    expect(diagram.answers({ kind: 'formula', nodes: 'Kus? | [Tallinnas]' })).toEqual([{ key: 'n0', accept: ['Tallinnas'] }]);
    expect(diagram.answers({ kind: 'compare', left: 'A', right: 'B', leftItems: 'x', rightItems: '[y]', both: '[ignored]' }).map((a) => a.key)).toEqual(['r0']);
  });

  it('a new block of a kind starts with its example; switching keeps what the teacher wrote', () => {
    expect(diagram.create('venn')).toMatchObject({ kind: 'venn', left: 'Linn', right: 'Maa' });
    const fresh = diagram.create('mind');
    expect(switchKind(fresh, 'timeline')).toMatchObject({ kind: 'timeline', nodes: KIND_SAMPLES.timeline.nodes, center: '' });
    expect(switchKind({ ...fresh, nodes: 'minu oma' }, 'cycle')).toEqual({ kind: 'cycle' });
  });

  it('cycle arrows run between neighbours outside the boxes', () => {
    const layout = diagramLayout('cycle', 4);
    expect(layout.links).toEqual([[0, 1], [1, 2], [2, 3], [3, 0]]);
    expect(cycleArcs(layout)).toHaveLength(4);
    expect(cycleArcs(diagramLayout('cycle', 1))).toEqual([]);
  });

  it('renders the timeline, formula, Venn and T-chart with inputs for the gaps', () => {
    const { unmount } = render(<diagram.View data={{ kind: 'timeline', nodes: 'eile | [käisin] kinos' }} ctx={ctx()} id="b" />);
    expect(screen.getByText('eile')).toBeInTheDocument();
    expect(screen.getByLabelText('Ajajoone lünk 1')).toBeInTheDocument();
    unmount();
    render(<diagram.View data={{ ...KIND_SAMPLES.venn, kind: 'venn' }} ctx={ctx()} id="b" />);
    expect(screen.getByText('Linn')).toBeInTheDocument();
    expect(screen.getByText('kodu')).toBeInTheDocument();
    expect(screen.getByLabelText('Parem lünk 2')).toBeInTheDocument();
  });

  it('the palette offers each kind and creates it filled in', () => {
    const entries = paletteEntries().filter((e) => e.group === 'Skeemid');
    expect(entries.map((e) => e.key)).toContain('diagram:venn');
    expect(isPaletteKey('diagram:venn')).toBe(true);
    expect(isPaletteKey('diagram:nope')).toBe(false);
    expect(createBlock('diagram:formula').data.kind).toBe('formula');
    expect(createBlock('diagram').data.kind).toBe('mind');
  });
});

describe('Mind map with sub-branches', () => {
  it('a line starting with a dash or spaces is a sub-branch; keys follow the line order', () => {
    const tree = mindTree('hommikul\n- ärkan\n  [pesen] hambaid\npäeval\nõhtul\n* loen');
    expect(tree.map((b) => [b.key, b.raw, b.children.map((c) => `${c.key}:${c.raw}`)])).toEqual([
      ['n0', 'hommikul', ['n1:ärkan', 'n2:[pesen] hambaid']], ['n3', 'päeval', []], ['n4', 'õhtul', ['n5:loen']],
    ]);
    expect(mindTree('- esimene\n- teine').map((b) => b.children.length)).toEqual([1]);
  });

  it('balances branches right and left and keeps sub-branches inside the box', () => {
    const layout = mindMapLayout(mindTree('a\n- 1\n- 2\n- 3\nb\n- 4\nc\n- 5\n- 6'));
    expect(layout.branches.map((b) => b.side)).toEqual(['right', 'left', 'left']);
    layout.branches.flatMap((b) => [b, ...b.children]).forEach(({ at }) => {
      expect(at.x).toBeGreaterThan(0);
      expect(at.x).toBeLessThan(100);
      expect(at.y).toBeGreaterThan(0);
      expect(at.y).toBeLessThan(layout.h);
    });
  });

  it('scores gaps in branches and sub-branches; a map without sub-branches keeps the old keys', () => {
    const data = { kind: 'mind', center: 'Päev', nodes: 'hommikul\n- [pesen] hambaid\n[päeval]' };
    expect(diagram.answers(data).map((a) => a.key)).toEqual(['n1', 'n2']);
    expect(diagram.answers({ kind: 'mind', center: '[päev]', nodes: 'a\n[b]' }).map((a) => a.key)).toEqual(['c', 'n1']);
    render(<diagram.View data={data} ctx={ctx()} id="b" />);
    expect(screen.getByLabelText('Haru 1 lünk 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Skeemi haru 2')).toBeInTheDocument();
  });
});
