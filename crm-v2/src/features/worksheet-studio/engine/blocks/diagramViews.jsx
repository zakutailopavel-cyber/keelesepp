import { Fragment } from 'react';
import { Line, Md } from '../ui.jsx';
import { MAX_NODES, cellParts, diagramKind, mindTree, pairLines, zoneItems } from './diagramModel.js';

// The drawings of the „Skeem” block, one per kind (diagram.jsx holds the block definition).

// the branch colours of a scheme (fixed, from the house palette)
const BRANCH = ['#173a63', '#2f7d4c', '#7f582a', '#1f6fa8', '#8a3b5c', '#4b5f1e'];
const gapWidth = (accept) => `${Math.min(40, Math.max(12, Math.max(...accept.map((a) => a.length), 4) * 2.6))}mm`;

// text with inline gaps (a plain render helper: block files export only block definitions)
function Cell({ raw, keyName, ctx, label, wide = false }) {
  const parts = cellParts(raw, keyName);
  return parts.map((p, i) => (p.gap
    ? <Line key={i} interactive={ctx.interactive} value={ctx.get(p.key)} onChange={(v) => ctx.set(p.key, v)} state={ctx.state(p.key)} width={wide && parts.length === 1 ? '45mm' : gapWidth(p.gap)} label={label} className="ws-gapline" />
    : <Md key={i} text={p.text} />));
}

const rawNodes = (data) => String(data.nodes || '').split('\n').map((l) => l.trim()).filter(Boolean).slice(0, MAX_NODES);
const gapOnly = (raw, key) => { const parts = cellParts(raw, key); return parts.length === 1 && Boolean(parts[0].gap); };
// optional names of the rows under every branch („kus?, kuhu?, kust?”): a blank line always says what goes in it
const rowLabels = (data) => String(data.labels || '').split(',').map((x) => x.trim()).filter(Boolean);

// The schemes are drawn as rows and cards across the whole width (owner 2026-10-13: the curved maps with loose blank
// lines were „не понятны от слова совсем”): every blank stands next to the word, question or step it belongs to.
// Answer keys are the old ones (c, n0, n1 …, t0 …), so saved answers stay where they were.

// topic → branches (→ rows): a table when every branch has one blank (forms, family), else a card per branch
function Cards({ data, ctx, branches, kind }) {
  const labels = rowLabels(data);
  const center = data.center ? <div className="ws-dg2-topic" data-edit="center"><Cell raw={data.center} keyName="c" ctx={ctx} label="Skeemi keskmine lünk" /></div> : null;
  const oneBlank = branches.length > 1 && branches.every((b) => b.children.length === 1 && gapOnly(b.children[0].raw, b.children[0].key));
  if (oneBlank) {
    return (
      <div className={`ws-diagram ws-dg2 is-${kind}`}>
        {center}
        <div className="ws-dg2-pairs" style={{ gridTemplateRows: `repeat(${Math.ceil(branches.length / 2)}, auto)` }}>
          {branches.map((b, i) => (
            <div key={b.key} className="ws-dg2-pair" style={{ '--dg-c': BRANCH[i % BRANCH.length] }}>
              <span className="ws-dg2-cue" data-edit={`nodes#${b.key.slice(1)}`}><Cell raw={b.raw} keyName={b.key} ctx={ctx} label={`Skeemi haru ${i + 1}`} /></span>
              <span className="ws-dg2-to" aria-hidden="true">→</span>
              <span className="ws-dg2-fill" data-edit={`nodes#${b.children[0].key.slice(1)}`}><Cell raw={b.children[0].raw} keyName={b.children[0].key} ctx={ctx} label={`${b.raw}: lünk`} wide /></span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={`ws-diagram ws-dg2 is-${kind}`}>
      {center}
      <div className="ws-dg2-cards">
        {branches.map((b, i) => (
          <section key={b.key} className="ws-dg2-card" style={{ '--dg-c': BRANCH[i % BRANCH.length] }}>
            <header data-edit={`nodes#${b.key.slice(1)}`}><Cell raw={b.raw} keyName={b.key} ctx={ctx} label={`Skeemi haru ${i + 1}`} wide /></header>
            {b.children.length ? (
              <ul>{b.children.map((c, j) => (
                <li key={c.key} data-edit={`nodes#${c.key.slice(1)}`}>
                  {labels[j] && gapOnly(c.raw, c.key) ? <span className="ws-dg2-row-label">{labels[j]}</span> : null}
                  <Cell raw={c.raw} keyName={c.key} ctx={ctx} label={`${b.raw}: ${labels[j] || `lünk ${j + 1}`}`} wide={gapOnly(c.raw, c.key)} />
                </li>
              ))}</ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}

// a chain of steps or a cycle: numbered rows top-down, an arrow between them (a cycle returns to step 1)
function Steps({ data, ctx, kind }) {
  const raws = rawNodes(data);
  return (
    <div className={`ws-diagram ws-dg2 is-${kind}`}>
      {kind === 'cycle' && data.center ? <div className="ws-dg2-topic" data-edit="center"><Cell raw={data.center} keyName="c" ctx={ctx} label="Ringi nimi" /></div> : null}
      <ol className="ws-dg2-steps">
        {raws.map((raw, i) => (
          <li key={i} data-edit={`nodes#${i}`}>
            <span className="ws-dg2-num" aria-hidden="true">{i + 1}</span>
            <span className="ws-dg2-text"><Cell raw={raw} keyName={`n${i}`} ctx={ctx} label={`Samm ${i + 1}`} wide={gapOnly(raw, `n${i}`)} /></span>
          </li>
        ))}
      </ol>
      {kind === 'cycle' && raws.length ? <p className="ws-dg2-again" aria-hidden="true">↻ ja jälle algusest: 1</p> : null}
    </div>
  );
}

function Timeline({ data, ctx }) {
  const rows = pairLines(data.nodes);
  return (
    <div className="ws-diagram ws-dg2 is-timeline">
      <ol className="ws-dg2-time">
        {rows.map((row, i) => (
          <li key={i} data-edit={`nodes#${i}`}>
            <span className="ws-dg2-when"><Cell raw={row.label} keyName={`t${i}`} ctx={ctx} label={`Ajajoone aeg ${i + 1}`} /></span>
            <span className="ws-dg2-dot" aria-hidden="true" />
            <span className="ws-dg2-text"><Cell raw={row.text} keyName={`n${i}`} ctx={ctx} label={`Ajajoone lünk ${i + 1}`} /></span>
          </li>
        ))}
      </ol>
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
  if (kind === 'mind') return <Cards data={data} ctx={ctx} branches={mindTree(data.nodes)} kind="mind" />;
  if (kind === 'tree') return <Cards data={data} ctx={ctx} branches={rawNodes(data).map((raw, i) => ({ key: `n${i}`, raw, children: [] }))} kind="tree" />;
  if (kind === 'flow' || kind === 'cycle') return <Steps data={data} ctx={ctx} kind={kind} />;
  const View = VIEWS[kind];
  return View ? <View data={data} ctx={ctx} /> : <Steps data={data} ctx={ctx} kind="flow" />;
}
