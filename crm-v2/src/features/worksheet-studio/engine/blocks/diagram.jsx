import { Fragment } from 'react';
import { Line, Md } from '../ui.jsx';
import { norm } from '../schema.js';
import { Area, Select, Text } from '../../editor/fields.jsx';
import { MAX_NODES, diagramLayout, diagramNodes, node } from './diagramModel.js';

// „Skeem”: a mind map, a chain of steps or a tree (owner, 2026-10-04: schemes in the constructor). Any box written
// as [answer] (or [answer|other]) is a gap the learner fills in; it is scored like the gap task.

// a box of the scheme (a plain render helper: block files export only block definitions)
const box = ({ item, at, h, ctx, keyName, label, main = false }) => (
  <div className={`ws-dg-node ${main ? 'is-main' : ''} ${item.gap ? 'is-gap' : ''}`} style={{ left: `${at.x}%`, top: `${(at.y / h) * 100}%` }}>
    {item.gap ? <Line interactive={ctx.interactive} value={ctx.get(keyName)} onChange={(v) => ctx.set(keyName, v)} state={ctx.state(keyName)} width="24mm" label={label} className="ws-gapline" /> : <Md text={item.text} />}
  </div>
);

export const diagram = {
  type: 'diagram', label: 'Skeem / diagramm', group: 'Kujundus', icon: 'Network', task: true, width: 'full', tone: 'white',
  create: () => ({ title: 'Täida skeem.', instruction: 'Kirjuta puuduvad sõnad.', kind: 'mind', center: 'Minu päev', nodes: 'hommikul\n[päeval]\nõhtul\n[öösel]' }),
  View: ({ data, ctx }) => {
    const items = diagramNodes(data);
    const kind = data.kind || 'mind';
    const layout = diagramLayout(kind, items.length);
    const center = layout.center && data.center ? node(data.center) : null;
    const pos = (ref) => (ref === 'c' ? layout.center : layout.points[ref]);
    return (
      <div className={`ws-diagram is-${kind}`} style={{ aspectRatio: `100 / ${layout.h}` }}>
        <svg className="ws-dg-lines" viewBox={`0 0 100 ${layout.h}`} preserveAspectRatio="none" aria-hidden="true">
          {layout.links.filter(([a]) => a !== 'c' || center).map(([a, b]) => {
            const from = pos(a);
            const to = pos(b);
            return from && to ? <line key={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} vectorEffect="non-scaling-stroke" /> : null;
          })}
        </svg>
        {kind === 'flow' ? layout.links.map(([a, b]) => {
          const from = pos(a);
          const to = pos(b);
          const angle = Math.abs(to.y - from.y) > 0.5 ? (to.y > from.y ? 90 : -90) : (to.x > from.x ? 0 : 180);
          return <span key={`arrow-${a}`} className="ws-dg-arrow" aria-hidden="true" style={{ left: `${(from.x + to.x) / 2}%`, top: `${(((from.y + to.y) / 2) / layout.h) * 100}%`, transform: `translate(-50%, -50%) rotate(${angle}deg)` }}>➜</span>;
        }) : null}
        {center ? box({ item: center, at: layout.center, h: layout.h, ctx, keyName: 'c', label: 'Skeemi keskmine lünk', main: true }) : null}
        {items.map((item, i) => <Fragment key={i}>{box({ item, at: layout.points[i], h: layout.h, ctx, keyName: `n${i}`, label: `Skeemi lünk ${i + 1}` })}</Fragment>)}
      </div>
    );
  },
  answers: (data) => {
    const list = diagramNodes(data).map((item, i) => ({ key: `n${i}`, accept: item.gap })).filter((item) => item.accept);
    const center = data.kind !== 'flow' && data.center ? node(data.center) : null;
    return center?.gap ? [{ key: 'c', accept: center.gap }, ...list] : list;
  },
  score: (data, get) => diagram.answers(data).map(({ key, accept }) => ({ key, ok: accept.map(norm).includes(norm(get(key))) })),
  Editor: ({ data, set }) => (
    <>
      <Select label="Skeemi kuju" value={data.kind || 'mind'} onChange={(v) => set({ kind: v })} options={[['mind', 'Mõttekaart (keskel teema)'], ['flow', 'Järjestus nooltega'], ['tree', 'Puu (üks üleval, teised all)']]} />
      {data.kind !== 'flow' ? <Text label="Keskmine / ülemine kast" value={data.center} onChange={(v) => set({ center: v })} placeholder="Minu päev  või  [lünk]" /> : null}
      <Area label={`Kastid (iga rida üks kast, kuni ${MAX_NODES})`} rows={7} value={data.nodes} onChange={(v) => set({ nodes: v })} hint="Lünk nurksulgudes: [päeval] või [päeval|lõunal] — mitu õiget vastust eralda |" />
    </>
  ),
};
