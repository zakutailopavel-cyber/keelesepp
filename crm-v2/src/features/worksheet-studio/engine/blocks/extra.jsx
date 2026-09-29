/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { useRef, useState } from 'react';
import { Line, Md } from '../ui.jsx';
import { norm, splitList } from '../schema.js';
import { useAssets } from '../assets.jsx';
import { Text, Area, Rows } from '../../editor/fields.jsx';

// Second wave: dialogue, reading, listening, table and sorting into groups.

// Shared gap syntax: "Ma [elan|olen] Tallinnas."
const parts = (s) => String(s || '').split(/(\[[^\]]*\])/g).map((p) => (p.startsWith('[') ? { gap: p.slice(1, -1).split('|').map((x) => x.trim()) } : { text: p }));
function GapText({ text, ctx, prefix, width = '24mm' }) {
  let gi = -1;
  return parts(text).map((p, i) => {
    if (!p.gap) return <Md key={i} text={p.text} />;
    gi += 1;
    const key = `${prefix}.${gi}`;
    return <Line key={i} interactive={ctx.interactive} value={ctx.get(key)} onChange={(v) => ctx.set(key, v)} state={ctx.state(key)} width={width} label="Lünk" className="ws-gapline" />;
  });
}
const gapKeys = (text, prefix) => parts(text).filter((p) => p.gap).map((p, gi) => ({ key: `${prefix}.${gi}`, accept: p.gap }));
const scoreGaps = (items, get) => items.map(({ key, accept }) => ({ key, ok: accept.map(norm).includes(norm(get(key))) }));

// ---------- dialogue ----------
export const dialogue = {
  type: 'dialogue', label: 'Dialoog (jutumullid)', group: 'Teemad', icon: 'MessagesSquare', task: true, width: 'half', tone: 'green',
  create: () => ({ title: 'Täida dialoog.', instruction: 'Kirjuta puuduvad sõnad.', speakerA: 'Mari', speakerB: 'Jaan', lines: [{ who: 'A', text: 'Tere! Mis kell sa [ärkad]?' }, { who: 'B', text: 'Ma ärkan [tavaliselt] kell seitse.' }] }),
  View: ({ data, ctx }) => (
    <div className="ws-dialog">
      {(data.lines || []).map((l, i) => (
        <div key={i} className={`ws-say ${l.who === 'B' ? 'b' : 'a'}`}>
          <span className="ws-who">{l.who === 'B' ? data.speakerB : data.speakerA}</span>
          <div className="ws-sayb"><GapText text={l.text} ctx={ctx} prefix={`${i}`} /></div>
        </div>
      ))}
    </div>
  ),
  score: (data, get) => scoreGaps((data.lines || []).flatMap((l, i) => gapKeys(l.text, `${i}`)), get),
  example: (data) => Object.fromEntries(gapKeys(data.lines?.[0]?.text, '0').map(({ key, accept }) => [key, accept[0]])),
  Editor: ({ data, set }) => (
    <>
      <div className="ed-row"><Text label="Kõneleja A" value={data.speakerA} onChange={(v) => set({ speakerA: v })} /><Text label="Kõneleja B" value={data.speakerB} onChange={(v) => set({ speakerB: v })} /></div>
      <Rows label="Repliigid (lünk nurksulgudes)" rows={data.lines || []} onChange={(lines) => set({ lines })} make={() => ({ who: 'A', text: '' })} addLabel="Lisa repliik"
        render={(row, patch) => (
          <div className="ed-row">
            <select className="ed-input small" value={row.who} onChange={(e) => patch({ who: e.target.value })}><option value="A">{data.speakerA || 'A'}</option><option value="B">{data.speakerB || 'B'}</option></select>
            <input className="ed-input" value={row.text} placeholder="Tere! Kuidas [läheb]?" onChange={(e) => patch({ text: e.target.value })} />
          </div>
        )} />
    </>
  ),
};

// ---------- reading ----------
export const reading = {
  type: 'reading', label: 'Lugemine + küsimused', group: 'Tekst ja heli', icon: 'BookOpenText', task: true, width: 'full', tone: 'cream',
  create: () => ({ title: 'Loe teksti.', instruction: 'Vasta küsimustele.', passageTitle: 'Mari päev', passage: 'Mari ärkab tavaliselt kell seitse. Hommikul ta joob kohvi ja läheb tööle.', questions: 'Mis kell Mari ärkab? [kell seitse|seitse|7]\nMida Mari hommikul joob? [kohvi]', lineWidth: 'wide' }),
  View: ({ data, ctx }) => (
    <div className="ws-reading">
      <div className="ws-passage">{data.passageTitle && <h4>{data.passageTitle}</h4>}{String(data.passage || '').split(/\n{2,}/).map((p, i) => <p key={i}><Md text={p} /></p>)}</div>
      <ol className="ws-rq">
        {String(data.questions || '').split('\n').filter((q) => q.trim()).map((q, i) => {
          const m = q.match(/^(.*?)\s*\[([^\]]*)\]\s*$/);
          const question = m ? m[1] : q;
          return (
            <li key={i}><div className="ws-q"><Md text={question} /></div>
              <Line interactive={ctx.interactive} value={ctx.get(`${i}`)} onChange={(v) => ctx.set(`${i}`, v)} state={ctx.state(`${i}`)} width="100%" label={`Vastus ${i + 1}`} />
            </li>
          );
        })}
      </ol>
    </div>
  ),
  score: (data, get) => String(data.questions || '').split('\n').filter((q) => q.trim()).map((q, i) => {
    const m = q.match(/\[([^\]]*)\]\s*$/);
    if (!m) return null; // open question: teacher reviews
    const acc = m[1].split('|').map(norm);
    const v = norm(get(`${i}`));
    return { key: `${i}`, ok: !!v && acc.some((a) => v === a || v.includes(a)) };
  }).filter(Boolean),
  Editor: ({ data, set }) => (
    <>
      <Text label="Teksti pealkiri" value={data.passageTitle} onChange={(v) => set({ passageTitle: v })} />
      <Area label="Tekst" rows={8} value={data.passage} onChange={(v) => set({ passage: v })} hint="Tühi rida = uus lõik." />
      <Area label="Küsimused (iga rida eraldi)" rows={5} value={data.questions} onChange={(v) => set({ questions: v })} hint="Õige vastus rea lõpus nurksulgudes: Mis kell? [seitse|7]. Ilma sulgudeta küsimust hindab õpetaja." />
    </>
  ),
};

// ---------- listening ----------
function AudioPick({ value, onChange }) {
  const input = useRef(null);
  const assets = useAssets();
  const [busy, setBusy] = useState(false);
  return (
    <div className="ed-field">
      <span className="ed-label">Helifail</span>
      {value?.src ? <audio controls src={value.src} /> : <span className="ed-hint">Heli puudub.</span>}
      <div className="ed-row">
        <button type="button" className="ed-btn" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Laadin…' : value?.src ? 'Vaheta heli' : 'Lisa heli'}</button>
        {value?.src && <button type="button" className="ed-btn ghost" onClick={() => onChange(null)}>Eemalda</button>}
      </div>
      <input ref={input} type="file" accept="audio/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; setBusy(true); try { onChange(await assets.audio(f)); } finally { setBusy(false); } }} />
    </div>
  );
}
export const listening = {
  type: 'listening', label: 'Kuulamine + küsimused', group: 'Tekst ja heli', icon: 'Headphones', task: true, width: 'half', tone: 'sky',
  create: () => ({ title: 'Kuula.', instruction: 'Kuula ja täida laused.', audio: null, sentences: 'Mari ärkab kell [seitse|7].\nTa joob [kohvi].', transcript: '' }),
  View: ({ data, ctx }) => (
    <div className="ws-listen">
      {data.audio?.src ? (ctx.interactive ? <audio controls src={data.audio.src} /> : <div className="ws-qr">🎧 Heli: kuula õpetaja juures või veebis</div>) : <div className="ws-hint">Helifail puudub.</div>}
      <ol className="ws-gaps">{String(data.sentences || '').split('\n').filter((l) => l.trim()).map((l, i) => <li key={i}><GapText text={l} ctx={ctx} prefix={`${i}`} /></li>)}</ol>
    </div>
  ),
  score: (data, get) => scoreGaps(String(data.sentences || '').split('\n').filter((l) => l.trim()).flatMap((l, i) => gapKeys(l, `${i}`)), get),
  example: (data) => Object.fromEntries(gapKeys(String(data.sentences || '').split('\n').find((l) => l.trim()), '0').map(({ key, accept }) => [key, accept[0]])),
  Editor: ({ data, set }) => (
    <>
      <AudioPick value={data.audio} onChange={(audio) => set({ audio })} />
      <Area label="Laused (lünk nurksulgudes)" rows={5} value={data.sentences} onChange={(v) => set({ sentences: v })} />
      <Area label="Transkriptsioon õpetajale (õpilane ei näe)" rows={3} value={data.transcript} onChange={(v) => set({ transcript: v })} />
    </>
  ),
};

// ---------- table ----------
export const table = {
  type: 'table', label: 'Tabel', group: 'Grammatika ja sõnavara', icon: 'Table', task: true, width: 'full', tone: 'blue',
  create: () => ({ title: 'Täida tabel.', instruction: '', headers: 'Nimetav, Omastav, Osastav', rows: 'maja | [maja] | [maja]\nkool | [kooli] | [kooli]', }),
  View: ({ data, ctx }) => {
    const heads = splitList(data.headers);
    const rows = String(data.rows || '').split('\n').filter((r) => r.trim()).map((r) => r.split('|').map((c) => c.trim()));
    return (
      <table className="ws-table">
        <thead><tr>{heads.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, ri) => (
          <tr key={ri}>{heads.map((_, ci) => {
            const c = r[ci] || '';
            const m = c.match(/^\[(.*)\]$/);
            const key = `${ri}.${ci}`;
            return <td key={ci}>{m || c === '' ? <Line interactive={ctx.interactive} value={ctx.get(key)} onChange={(v) => ctx.set(key, v)} state={ctx.state(key)} width="100%" label="Lahter" /> : <Md text={c} />}</td>;
          })}</tr>
        ))}</tbody>
      </table>
    );
  },
  score: (data, get) => String(data.rows || '').split('\n').filter((r) => r.trim()).flatMap((r, ri) => r.split('|').map((c, ci) => {
    const m = c.trim().match(/^\[(.*)\]$/);
    return m ? { key: `${ri}.${ci}`, ok: m[1].split('/').map(norm).includes(norm(get(`${ri}.${ci}`))) } : null;
  }).filter(Boolean)),
  Editor: ({ data, set }) => (
    <>
      <Text label="Veergude pealkirjad (komaga)" value={data.headers} onChange={(v) => set({ headers: v })} />
      <Area label="Read (lahtrid | märgiga)" rows={6} value={data.rows} onChange={(v) => set({ rows: v })} hint="Täidetav lahter: [õige vastus] (mitu: [a/b]). Tühi lahter on vaba vastus." />
    </>
  ),
};

// ---------- sort into groups ----------
export const categorize = {
  type: 'categorize', label: 'Sorteeri gruppidesse', group: 'Grammatika ja sõnavara', icon: 'Columns3', task: true, width: 'half', tone: 'peach',
  create: () => ({ title: 'Sorteeri sõnad.', instruction: 'Kirjuta iga sõna õigesse gruppi.', groups: [{ name: 'Hommikul', words: 'ärkan, söön hommikusööki' }, { name: 'Õhtul', words: 'vaatan filmi, lähen magama' }] }),
  View: ({ data, ctx, id }) => {
    const groups = data.groups || [];
    // words shown in a stable mixed order (alphabetical), learner assigns each to a group
    const all = groups.flatMap((g) => splitList(g.words)).sort((a, b) => a.localeCompare(b, 'et'));
    const pick = ctx.focus?.[id];
    return (
      <div className="ws-cat">
        <div className="ws-bank">{all.map((w, i) => {
          const placed = ctx.get(`w${i}`);
          return (
            <span key={i} className={`ws-bank-w ${pick === `w${i}` ? 'sel' : ''} ${placed ? 'placed' : ''}`} role={ctx.interactive ? 'button' : undefined} tabIndex={ctx.interactive ? 0 : -1}
              onClick={() => ctx.interactive && ctx.setFocus(id, `w${i}`)}>{w}</span>
          );
        })}</div>
        {ctx.interactive && <div className="ws-hint">Klõpsa sõnal, siis grupil.</div>}
        <div className="ws-cat-groups" style={{ gridTemplateColumns: `repeat(${Math.min(groups.length, 4)}, 1fr)` }}>
          {groups.map((g, gi) => (
            <div key={gi} className="ws-cat-g" onClick={() => { if (ctx.interactive && pick) { ctx.set(pick, String(gi)); ctx.setFocus(id, undefined); } }}>
              <b>{g.name}</b>
              <div className="ws-cat-list">
                {all.map((w, i) => (ctx.get(`w${i}`) === String(gi) ? <span key={i} className={`ws-cat-item ${ctx.state(`w${i}`) ? 'is-' + ctx.state(`w${i}`) : ''}`}>{w}</span> : null))}
                {!ctx.interactive && Array.from({ length: Math.max(3, splitList(g.words).length) }).map((_, k) => <div key={k} className="ws-cat-line" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  },
  score: (data, get) => {
    const groups = data.groups || [];
    const all = groups.flatMap((g, gi) => splitList(g.words).map((w) => ({ w, gi }))).sort((a, b) => a.w.localeCompare(b.w, 'et'));
    return all.map((x, i) => ({ key: `w${i}`, ok: get(`w${i}`) === String(x.gi) }));
  },
  Editor: ({ data, set }) => (
    <Rows label="Grupid" rows={data.groups || []} onChange={(groups) => set({ groups })} make={() => ({ name: '', words: '' })} addLabel="Lisa grupp" max={4}
      render={(row, patch) => (
        <>
          <input className="ed-input" placeholder="Grupi nimi" value={row.name} onChange={(e) => patch({ name: e.target.value })} />
          <textarea className="ed-input" rows={2} placeholder="sõnad komaga" value={row.words} onChange={(e) => patch({ words: e.target.value })} />
        </>
      )} />
  ),
};

// ---------- word order ----------
const scramble = (sentence) => {
  const w = String(sentence || '').replace(/[.!?]$/, '').split(/\s+/).filter(Boolean);
  // deterministic shuffle so print and screen match: rotate by half, then reverse pairs
  const r = [...w.slice(Math.ceil(w.length / 2)), ...w.slice(0, Math.ceil(w.length / 2))];
  return r.length > 1 && r.join(' ') === w.join(' ') ? r.reverse() : r;
};
export const wordorder = {
  type: 'wordorder', label: 'Sõnajärg (moodusta lause)', group: 'Grammatika ja sõnavara', icon: 'ArrowDownUp', task: true, width: 'half', tone: 'sky',
  create: () => ({ title: 'Moodusta lause.', instruction: 'Pane sõnad õigesse järjekorda.', sentences: 'Ma ärkan tavaliselt kell seitse.\nÕhtul ma vaatan filmi.' }),
  View: ({ data, ctx }) => (
    <ol className="ws-order">
      {String(data.sentences || '').split('\n').filter((l) => l.trim()).map((s, i) => (
        <li key={i}>
          <div className="ws-chips">{scramble(s).map((w, k) => <span key={k} className="ws-chip">{w}</span>)}</div>
          <Line interactive={ctx.interactive} value={ctx.get(`${i}`)} onChange={(v) => ctx.set(`${i}`, v)} state={ctx.state(`${i}`)} width="100%" label={`Lause ${i + 1}`} />
        </li>
      ))}
    </ol>
  ),
  score: (data, get) => String(data.sentences || '').split('\n').filter((l) => l.trim()).map((s, i) => ({ key: `${i}`, ok: norm(get(`${i}`)) === norm(s) })),
  example: (data) => { const first = String(data.sentences || '').split('\n').find((l) => l.trim()); return first ? { 0: first.trim() } : {}; },
  Editor: ({ data, set }) => (
    <Area label="Õiged laused (iga rida eraldi)" rows={6} value={data.sentences} onChange={(v) => set({ sentences: v })} hint="Sõnad segatakse lehel automaatselt." />
  ),
};

export const extraBlocks = { dialogue, reading, listening, table, categorize, wordorder };
