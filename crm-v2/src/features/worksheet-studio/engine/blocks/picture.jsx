import { Fragment } from 'react';
import { Photo, Line, Md } from '../ui.jsx';
import { norm, splitList } from '../schema.js';
import { Text, Area, Select, ImagePick, Rows } from '../../editor/fields.jsx';
import { seededShuffle } from './tasks.jsx';

// Picture tasks (owner 2026-10-12, Pinterest references: „нет возможности вот такие листы делать”): words matched to a
// lettered picture grid, labels on one big picture, character cards, and picture + situation rows. Pictures come from
// the textbook art (docs/TEXTBOOK_ART_BIBLE.md, /textbook-art/…) or are uploaded in the constructor.

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const accepts = (answer) => splitList(String(answer || '').replace(/\|/g, ',')).map(norm);
const lines = (value) => String(value || '').split('\n').map((l) => l.trim()).filter(Boolean);
const COLUMNS = [['2', '2'], ['3', '3'], ['4', '4'], ['5', '5'], ['6', '6']];
const ASPECT_OPTIONS = [['1:1', '1:1'], ['4:3', '4:3'], ['3:2', '3:2'], ['3:4', '3:4']];

// ---------- words ↔ lettered pictures ----------
// the pictures are mixed (seeded by the block id, the same on screen and paper); the answer of word i is the letter
// under its picture
export function picmatchOrder(items, id, keepOrder = false) {
  const order = items.map((_, i) => i);
  return keepOrder ? order : seededShuffle(order, `${id}:pics`);
}
export const picmatch = {
  type: 'picmatch', label: 'Sõnad ja pildid (A–L)', group: 'Pildid', icon: 'LayoutGrid', task: true, width: 'full', tone: 'cream',
  create: () => ({
    title: 'Ühenda sõna ja pilt.', instruction: 'Kirjuta sõna kõrvale pildi täht.', columns: '4', aspect: '4:3',
    items: [{ img: null, word: 'köök' }, { img: null, word: 'magamistuba' }, { img: null, word: 'vannituba' }, { img: null, word: 'elutuba' }],
  }),
  View: ({ data, ctx, id }) => {
    const items = data.items || [];
    const order = picmatchOrder(items, id, ctx.keepOrder);
    return (
      <div className="ws-picmatch">
        <ol className="ws-picmatch-words">
          {items.map((it, i) => (
            <li key={i}>
              <span>{it.word}</span>
              <input className={`ws-letterbox ${ctx.state(`${i}`) ? 'is-' + ctx.state(`${i}`) : ''}`} maxLength={1} readOnly={!ctx.interactive} tabIndex={ctx.interactive ? 0 : -1}
                value={ctx.get(`${i}`) || ''} onChange={(e) => ctx.set(`${i}`, e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} aria-label={`Täht: ${it.word}`} />
            </li>
          ))}
        </ol>
        <div className="ws-pics" style={{ gridTemplateColumns: `repeat(${Number(data.columns) || 4}, 1fr)` }}>
          {order.map((src, k) => (
            <div className="ws-pic" key={k}>
              <Photo img={items[src]?.img} aspect={data.aspect} alt=""><span className="ws-pic-letter">{LETTERS[k]}</span></Photo>
            </div>
          ))}
        </div>
      </div>
    );
  },
  answers: (data, block = {}) => {
    const items = data.items || [];
    const order = picmatchOrder(items, block.id, Boolean(block.opts?.keepOrder));
    return items.map((_, i) => ({ key: `${i}`, accept: [LETTERS[order.indexOf(i)]] }));
  },
  // the right letter of word i: where its picture landed after mixing (the block is scoreDocument's third argument)
  score: (data, get, block = {}) => {
    const items = data.items || [];
    const order = picmatchOrder(items, block.id, Boolean(block.opts?.keepOrder));
    return items.map((_, i) => ({ key: `${i}`, ok: norm(get(`${i}`)) === norm(LETTERS[order.indexOf(i)]) }));
  },
  Editor: ({ data, set }) => (
    <>
      <div className="ed-row">
        <Select label="Veerge" value={data.columns} onChange={(v) => set({ columns: v })} options={COLUMNS} />
        <Select label="Kuvasuhe" value={data.aspect} onChange={(v) => set({ aspect: v })} options={ASPECT_OPTIONS} />
      </div>
      <Rows label="Sõnad ja pildid" rows={data.items || []} onChange={(items) => set({ items })} make={() => ({ img: null, word: '' })} addLabel="Lisa sõna ja pilt" max={16}
        render={(row, patch) => (
          <>
            <ImagePick label="" value={row.img} aspect={data.aspect} onChange={(img) => patch({ img })} allowAspect={false} />
            <input className="ed-input" placeholder="Sõna" value={row.word} onChange={(e) => patch({ word: e.target.value })} />
          </>
        )} />
      <span className="ed-hint">Pildid segatakse ja saavad tähed A, B, C…; õige täht arvutatakse ise.</span>
    </>
  ),
};

// ---------- numbered labels on one picture ----------
export const scenelabel = {
  type: 'scenelabel', label: 'Märgi pildile (numbrid)', group: 'Pildid', icon: 'MapPin', task: true, width: 'full', tone: 'sky',
  create: () => ({
    title: 'Kirjuta pildile sõnad.', instruction: 'Vali sõna kastist ja kirjuta numbri juurde.', img: null, aspect: '3:2', bank: 'köök, vannituba, garaaž, pööning', showBank: 'yes', columns: '2',
    pins: [{ x: 30, y: 30, answer: 'pööning' }, { x: 70, y: 45, answer: 'vannituba' }, { x: 30, y: 65, answer: 'köök' }, { x: 70, y: 85, answer: 'garaaž' }],
  }),
  View: ({ data, ctx }) => {
    const pins = data.pins || [];
    const bank = splitList(data.bank);
    return (
      <div className="ws-scenelabel">
        <Photo img={data.img} aspect={data.aspect} alt="">
          {pins.map((p, i) => <span key={i} className="ws-pin" style={{ left: `${Number(p.x) || 0}%`, top: `${Number(p.y) || 0}%` }}>{i + 1}</span>)}
        </Photo>
        <div className="ws-scenelabel-side">
          {data.showBank !== 'no' && bank.length > 0 && <div className="ws-bank">{bank.map((w, i) => <span key={i} className="ws-bank-w">{w}</span>)}</div>}
          <ol className="ws-scenelabel-answers" style={{ columns: Number(data.columns) || 1 }}>
            {pins.map((_, i) => (
              <li key={i}><Line interactive={ctx.interactive} value={ctx.get(`${i}`)} onChange={(v) => ctx.set(`${i}`, v)} state={ctx.state(`${i}`)} width="100%" label={`Silt ${i + 1}`} /></li>
            ))}
          </ol>
        </div>
      </div>
    );
  },
  answers: (data) => (data.pins || []).map((p, i) => ({ key: `${i}`, accept: splitList(String(p.answer || '').replace(/\|/g, ',')) })),
  score: (data, get) => (data.pins || []).map((p, i) => ({ key: `${i}`, ok: accepts(p.answer).includes(norm(get(`${i}`))) })),
  Editor: ({ data, set }) => (
    <>
      <ImagePick label="Pilt" value={data.img} aspect={data.aspect} onChange={(img) => set({ img })} onAspect={(aspect) => set({ aspect })} />
      <Text label="Sõnakast (komaga; lisa 1–2 segajat)" value={data.bank} onChange={(bank) => set({ bank })} />
      <div className="ed-row">
        <Select label="Sõnakast" value={data.showBank} onChange={(v) => set({ showBank: v })} options={[['yes', 'Näita'], ['no', 'Peida']]} />
        <Select label="Vastuste veerud" value={data.columns} onChange={(v) => set({ columns: v })} options={[['1', '1'], ['2', '2'], ['3', '3']]} />
      </div>
      <Rows label="Numbrid pildil (asukoht % vasakult ja ülevalt)" rows={data.pins || []} onChange={(pins) => set({ pins })} make={() => ({ x: 50, y: 50, answer: '' })} addLabel="Lisa number" max={16}
        render={(row, patch) => (
          <>
            <div className="ed-row">
              <input className="ed-input" type="number" min={0} max={100} aria-label="Vasakult %" value={row.x} onChange={(e) => patch({ x: Number(e.target.value) })} />
              <input className="ed-input" type="number" min={0} max={100} aria-label="Ülevalt %" value={row.y} onChange={(e) => patch({ y: Number(e.target.value) })} />
            </div>
            <input className="ed-input" placeholder="Õige sõna (mitu: a|b)" value={row.answer} onChange={(e) => patch({ answer: e.target.value })} />
          </>
        )} />
    </>
  ),
};

// ---------- character cards: portrait, facts, sentences with gaps ----------
const GAP = /\[([^\]]*)\]/g;
const gapParts = (s) => String(s || '').split(/(\[[^\]]*\])/g).map((p) => (p.startsWith('[') ? { gap: p.slice(1, -1) } : { text: p }));
export const profiles = {
  type: 'profiles', label: 'Tegelaskaardid', group: 'Pildid', icon: 'Contact', task: true, width: 'full', tone: 'peach',
  create: () => ({
    title: 'Vaata kaarte ja täienda laused.', instruction: 'Kasuta kaardil olevaid andmeid.', columns: '3',
    people: [
      { img: null, name: 'Anna', facts: '28 aastat vana\npikad tumedad juuksed\nprillid', sentences: 'Anna [on] 28 aastat vana.\nTal [on] pikad juuksed.' },
      { img: null, name: 'Markus', facts: '34 aastat vana\nlühikesed juuksed\nhabe', sentences: 'Markus [on] 34 aastat vana.\nTal [on] habe.' },
      { img: null, name: 'Viktor', facts: '63 aastat vana\nkübar\nvuntsid', sentences: 'Viktor [on] 63 aastat vana.\nTal [on] kübar.' },
    ],
  }),
  View: ({ data, ctx }) => (
    <div className="ws-profiles" style={{ gridTemplateColumns: `repeat(${Number(data.columns) || 3}, 1fr)` }}>
      {(data.people || []).map((p, pi) => (
        <div className="ws-profile" key={pi}>
          <Photo img={p.img} aspect="1:1" alt={p.name} />
          <b className="ws-profile-name">{p.name}</b>
          {lines(p.facts).length ? <ul className="ws-profile-facts">{lines(p.facts).map((f, i) => <li key={i}>{f}</li>)}</ul> : null}
          {lines(p.sentences).length ? (
            <ol className="ws-profile-sentences">
              {lines(p.sentences).map((s, si) => {
                let gi = -1;
                return (
                  <li key={si}>{gapParts(s).map((part, k) => {
                    if (!('gap' in part)) return <Fragment key={k}><Md text={part.text} /></Fragment>;
                    gi += 1;
                    const key = `${pi}.${si}.${gi}`;
                    return <Line key={k} interactive={ctx.interactive} value={ctx.get(key)} onChange={(v) => ctx.set(key, v)} state={ctx.state(key)} width="18mm" label={`${p.name}: lünk`} className="ws-gapline" />;
                  })}</li>
                );
              })}
            </ol>
          ) : null}
        </div>
      ))}
    </div>
  ),
  answers: (data) => (data.people || []).flatMap((p, pi) => lines(p.sentences).flatMap((s, si) => [...s.matchAll(GAP)].map((m, gi) => ({ key: `${pi}.${si}.${gi}`, accept: splitList(m[1].replace(/\|/g, ',')) })))),
  score: (data, get) => (data.people || []).flatMap((p, pi) => lines(p.sentences).flatMap((s, si) => [...s.matchAll(GAP)].map((m, gi) => ({ key: `${pi}.${si}.${gi}`, ok: accepts(m[1]).includes(norm(get(`${pi}.${si}.${gi}`))) })))),
  Editor: ({ data, set }) => (
    <>
      <Select label="Kaarte reas" value={data.columns} onChange={(v) => set({ columns: v })} options={COLUMNS} />
      <Rows label="Tegelased" rows={data.people || []} onChange={(people) => set({ people })} make={() => ({ img: null, name: '', facts: '', sentences: '' })} addLabel="Lisa tegelane" max={8}
        render={(row, patch) => (
          <>
            <ImagePick label="" value={row.img} aspect="1:1" onChange={(img) => patch({ img })} allowAspect={false} />
            <input className="ed-input" placeholder="Nimi" value={row.name} onChange={(e) => patch({ name: e.target.value })} />
            <Area label="Faktid (iga rida eraldi)" rows={3} value={row.facts} onChange={(facts) => patch({ facts })} />
            <Area label="Laused (vastus nurksulgudes)" rows={3} value={row.sentences} onChange={(sentences) => patch({ sentences })} />
          </>
        )} />
    </>
  ),
};

// ---------- picture + situation + question with lines ----------
export const picrows = {
  type: 'picrows', label: 'Pilt ja olukord', group: 'Pildid', icon: 'GalleryHorizontal', task: true, width: 'full', tone: 'white',
  create: () => ({
    title: 'Miks see juhtus?', instruction: 'Vaata pilti, loe olukorda ja kirjuta oma arvamus.', lines: '2',
    rows: [
      { img: null, text: 'Anna ostis poest kümme vihmavarju.', question: 'Miks ta seda tegi?' },
      { img: null, text: 'Markus seisab vihma käes bussipeatuses, käes roos.', question: 'Keda ta ootab?' },
    ],
  }),
  View: ({ data, ctx }) => (
    <ol className="ws-picrows">
      {(data.rows || []).map((r, i) => (
        <li className="ws-picrow" key={i}>
          <Photo img={r.img} aspect="4:3" alt="" />
          <div className="ws-picrow-text"><Md text={r.text} /></div>
          <div className="ws-picrow-answer">
            {r.question ? <b>{r.question}</b> : null}
            <Line interactive={ctx.interactive} value={ctx.get(`${i}`)} onChange={(v) => ctx.set(`${i}`, v)} width="100%" label={`Vastus ${i + 1}`} />
            {Array.from({ length: Math.max(0, (Number(data.lines) || 1) - 1) }, (_, k) => <span key={k} className="ws-ruleline" aria-hidden="true" />)}
          </div>
        </li>
      ))}
    </ol>
  ),
  answerKeys: (data) => (data.rows || []).map((_, i) => String(i)),
  Editor: ({ data, set }) => (
    <>
      <Select label="Ridu vastuseks" value={data.lines} onChange={(v) => set({ lines: v })} options={[['1', '1'], ['2', '2'], ['3', '3']]} />
      <Rows label="Olukorrad" rows={data.rows || []} onChange={(rows) => set({ rows })} make={() => ({ img: null, text: '', question: '' })} addLabel="Lisa olukord" max={8}
        render={(row, patch) => (
          <>
            <ImagePick label="" value={row.img} aspect="4:3" onChange={(img) => patch({ img })} allowAspect={false} />
            <input className="ed-input" placeholder="Olukord" value={row.text} onChange={(e) => patch({ text: e.target.value })} />
            <input className="ed-input" placeholder="Küsimus" value={row.question} onChange={(e) => patch({ question: e.target.value })} />
          </>
        )} />
    </>
  ),
};

export const pictureBlocks = { picmatch, scenelabel, profiles, picrows };
