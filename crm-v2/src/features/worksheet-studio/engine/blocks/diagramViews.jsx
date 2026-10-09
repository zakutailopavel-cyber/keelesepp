import { Fragment, useId } from 'react';
import { Line, Md } from '../ui.jsx';
import { MAX_NODES, cellParts, curve, cycleArcs, diagramKind, diagramLayout, mindMapLayout, mindTree, pairLines, zoneItems } from './diagramModel.js';

// The drawings of the „Skeem” block, one per kind (diagram.jsx holds the block definition).

// the branch colours of a scheme (fixed, from the house palette)
const BRANCH = ['#173a63', '#2f7d4c', '#7f582a', '#1f6fa8', '#8a3b5c', '#4b5f1e'];
const gapWidth = (accept) => `${Math.min(40, Math.max(12, Math.max(...accept.map((a) => a.length), 4) * 2.6))}mm`;

// text with inline gaps (a plain render helper: block files export only block definitions)
function Cell({ raw, keyName, ctx, label }) {
  const parts = cellParts(raw, keyName);
  return parts.map((p, i) => (p.gap
    ? <Line key={i} interactive={ctx.interactive} value={ctx.get(p.key)} onChange={(v) => ctx.set(p.key, v)} state={ctx.state(p.key)} width={gapWidth(p.gap)} label={label} className="ws-gapline" />
    : <Md key={i} text={p.text} />));
}

const box = ({ raw, at, h, ctx, keyName, label, main = false, color, step = 0, branch = false, leaf = '', edit = '' }) => {
  const whole = cellParts(raw, keyName);
  const gap = whole.length === 1 && whole[0].gap;
  return (
    <div className={`ws-dg-node ${main ? 'is-main' : ''} ${gap ? 'is-gap' : ''} ${branch ? 'is-branch' : ''} ${leaf ? `is-leaf is-${leaf}` : ''}`} style={{ left: `${at.x}%`, top: `${(at.y / h) * 100}%`, ...(color ? { '--dg-c': color } : {}) }} data-edit={edit || undefined}>
      {step ? <span className="ws-dg-step" aria-hidden="true">{step}</span> : null}
      <Cell raw={raw} keyName={keyName} ctx={ctx} label={label} />
    </div>
  );
};

const rawNodes = (data) => String(data.nodes || '').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, MAX_NODES);

function Positioned({ data, ctx, kind }) {
  // the sheet is drawn twice (a hidden copy measures the pages): every arrowhead needs its own id
  const head = `ws-dg-head-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const raws = rawNodes(data);
  const layout = diagramLayout(kind, raws.length);
  const center = layout.center && data.center ? data.center : '';
  const pos = (ref) => (ref === 'c' ? layout.center : layout.points[ref]);
  const colored = kind === 'mind' || kind === 'tree';
  return (
    <div className={`ws-diagram is-${kind}`} style={{ aspectRatio: `100 / ${layout.h}` }}>
      <svg className="ws-dg-lines" viewBox={`0 0 100 ${layout.h}`} preserveAspectRatio="none" aria-hidden="true">
        <defs><marker id={head} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="1.7" markerHeight="1.7" markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" /></marker></defs>
        {kind === 'cycle' ? cycleArcs(layout).map((d, i) => <path key={i} d={d} className="ws-dg-arc" markerEnd={`url(#${head})`} vectorEffect="non-scaling-stroke" />) : null}
        {kind === 'tree' ? layout.links.filter(() => center).map(([, b]) => {
          const to = pos(b);
          const mid = (layout.center.y + to.y) / 2;
          return <path key={b} d={`M${layout.center.x},${layout.center.y} V${mid} H${to.x} V${to.y}`} fill="none" style={{ stroke: BRANCH[b % BRANCH.length] }} vectorEffect="non-scaling-stroke" />;
        }) : null}
        {kind === 'mind' ? layout.links.filter(() => center).map(([, b]) => {
          const to = pos(b);
          const c = layout.center;
          return <path key={b} d={`M${c.x},${c.y} Q${(c.x + to.x) / 2},${c.y} ${to.x},${to.y}`} fill="none" style={{ stroke: BRANCH[b % BRANCH.length] }} vectorEffect="non-scaling-stroke" />;
        }) : null}
        {kind === 'flow' ? layout.links.map(([a, b]) => {
          const from = pos(a);
          const to = pos(b);
          return <line key={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect="non-scaling-stroke" />;
        }) : null}
      </svg>
      {kind === 'flow' ? layout.links.map(([a, b]) => {
        const from = pos(a);
        const to = pos(b);
        const angle = Math.abs(to.y - from.y) > 0.5 ? (to.y > from.y ? 90 : -90) : (to.x > from.x ? 0 : 180);
        return <span key={`arrow-${a}`} className="ws-dg-arrow" aria-hidden="true" style={{ left: `${(from.x + to.x) / 2}%`, top: `${(((from.y + to.y) / 2) / layout.h) * 100}%`, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}>➜</span>;
      }) : null}
      {center ? box({ raw: center, at: layout.center, h: layout.h, ctx, keyName: 'c', label: 'Skeemi keskmine lünk', main: true, edit: 'center' }) : null}
      {raws.map((raw, i) => <Fragment key={i}>{box({ raw, at: layout.points[i], h: layout.h, ctx, keyName: `n${i}`, label: `Skeemi lünk ${i + 1}`, color: colored ? BRANCH[i % BRANCH.length] : null, step: kind === 'flow' ? i + 1 : 0, edit: `nodes#${i}` })}</Fragment>)}
    </div>
  );
}

// a mind map with sub-branches: topic in the middle, branches right and left, sub-branches outside, one colour per branch
function MindMap({ data, ctx, branches }) {
  const layout = mindMapLayout(branches);
  const { h, center } = layout;
  return (
    <div className="ws-diagram is-mind is-map" style={{ aspectRatio: `100 / ${h}` }}>
      <svg className="ws-dg-lines" viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" aria-hidden="true">
        {layout.branches.map((b) => {
          const color = BRANCH[b.index % BRANCH.length];
          return (
            <g key={b.key} style={{ stroke: color }}>
              {data.center ? <path d={curve(center, b.at)} className="is-trunk" fill="none" vectorEffect="non-scaling-stroke" /> : null}
              {b.children.map((c) => <path key={c.key} d={curve(b.at, c.at)} fill="none" vectorEffect="non-scaling-stroke" />)}
            </g>
          );
        })}
      </svg>
      {data.center ? box({ raw: data.center, at: center, h, ctx, keyName: 'c', label: 'Skeemi keskmine lünk', main: true, edit: 'center' }) : null}
      {layout.branches.map((b, i) => {
        const color = BRANCH[b.index % BRANCH.length];
        return (
          <Fragment key={b.key}>
            {box({ raw: b.raw, at: b.at, h, ctx, keyName: b.key, label: `Skeemi haru ${i + 1}`, color, branch: true, edit: `nodes#${b.key.slice(1)}` })}
            {b.children.map((c, j) => <Fragment key={c.key}>{box({ raw: c.raw, at: c.at, h, ctx, keyName: c.key, label: `Haru ${i + 1} lünk ${j + 1}`, color, leaf: b.side, edit: `nodes#${c.key.slice(1)}` })}</Fragment>)}
          </Fragment>
        );
      })}
    </div>
  );
}

function Timeline({ data, ctx }) {
  const rows = pairLines(data.nodes);
  return (
    <div className="ws-diagram ws-dg-timeline" style={{ '--dg-n': Math.min(Math.max(rows.length, 1), 6) }}>
      {rows.map((row, i) => (
        <div key={i} className={`ws-dg-tl-item ${i === rows.length - 1 ? 'is-last' : ''}`} data-edit={`nodes#${i}`}>
          <div className="ws-dg-tl-when"><Cell raw={row.label} keyName={`t${i}`} ctx={ctx} label={`Ajajoone aeg ${i + 1}`} /></div>
          <div className="ws-dg-tl-axis" aria-hidden="true"><span /></div>
          <div className="ws-dg-tl-what"><Cell raw={row.text} keyName={`n${i}`} ctx={ctx} label={`Ajajoone lünk ${i + 1}`} /></div>
        </div>
      ))}
    </div>
  );
}

function Formula({ data, ctx }) {
  const rows = pairLines(data.nodes);
  return (
    <div className="ws-diagram ws-dg-formula">
      <div className="ws-dg-fx">
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i ? <span className="ws-dg-plus" aria-hidden="true">+</span> : null}
            <div className="ws-dg-slot" style={{ '--dg-c': BRANCH[i % BRANCH.length] }} data-edit={`nodes#${i}`}>
              <div className="ws-dg-q"><Cell raw={row.label} keyName={`q${i}`} ctx={ctx} label={`Valemi küsimus ${i + 1}`} /></div>
              <div className="ws-dg-w"><Cell raw={row.text} keyName={`n${i}`} ctx={ctx} label={`Valemi lünk ${i + 1}`} /></div>
            </div>
          </Fragment>
        ))}
      </div>
      {data.note ? <p className="ws-dg-note"><b>Näide:</b> <Md text={data.note} /></p> : null}
    </div>
  );
}

const ZONE_FIELD = { l: 'leftItems', m: 'both', r: 'rightItems' };
const ZoneList = ({ items, prefix, ctx, label }) => (
  <ul className="ws-dg-list">{items.map((raw, i) => <li key={i} data-edit={`${ZONE_FIELD[prefix]}#${i}`}><Cell raw={raw} keyName={`${prefix}${i}`} ctx={ctx} label={`${label} ${i + 1}`} /></li>)}</ul>
);

function Venn({ data, ctx }) {
  return (
    <div className="ws-diagram ws-dg-venn">
      <svg className="ws-dg-lines" viewBox="0 0 100 40" aria-hidden="true">
        <circle cx="38" cy="20" r="19" className="is-a" />
        <circle cx="62" cy="20" r="19" className="is-b" />
      </svg>
      <div className="ws-dg-vt is-a" data-edit="left"><Cell raw={data.left} keyName="L" ctx={ctx} label="Vasaku ringi nimi" /></div>
      <div className="ws-dg-vt is-b" data-edit="right"><Cell raw={data.right} keyName="R" ctx={ctx} label="Parema ringi nimi" /></div>
      <div className="ws-dg-vz is-a"><ZoneList items={zoneItems(data.leftItems)} prefix="l" ctx={ctx} label="Vasak lünk" /></div>
      <div className="ws-dg-vz is-m"><ZoneList items={zoneItems(data.both)} prefix="m" ctx={ctx} label="Ühine lünk" /></div>
      <div className="ws-dg-vz is-b"><ZoneList items={zoneItems(data.rightItems)} prefix="r" ctx={ctx} label="Parem lünk" /></div>
    </div>
  );
}

function Compare({ data, ctx }) {
  return (
    <div className="ws-diagram ws-dg-compare">
      <div className="ws-dg-col is-a"><div className="ws-dg-ch" data-edit="left"><Cell raw={data.left} keyName="L" ctx={ctx} label="Vasaku veeru pealkiri" /></div><ZoneList items={zoneItems(data.leftItems)} prefix="l" ctx={ctx} label="Vasak lünk" /></div>
      <div className="ws-dg-col is-b"><div className="ws-dg-ch" data-edit="right"><Cell raw={data.right} keyName="R" ctx={ctx} label="Parema veeru pealkiri" /></div><ZoneList items={zoneItems(data.rightItems)} prefix="r" ctx={ctx} label="Parem lünk" /></div>
    </div>
  );
}

const VIEWS = { timeline: Timeline, formula: Formula, venn: Venn, compare: Compare };

export function DiagramView({ data, ctx }) {
  const kind = diagramKind(data);
  if (kind === 'mind') {
    const branches = mindTree(data.nodes);
    if (branches.some((b) => b.children.length)) return <MindMap data={data} ctx={ctx} branches={branches} />;
  }
  const View = VIEWS[kind];
  return View ? <View data={data} ctx={ctx} /> : <Positioned data={data} ctx={ctx} kind={kind} />;
}
