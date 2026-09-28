/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { Fragment } from 'react';
import { Photo, Line, Md, Clock } from '../ui.jsx';
import { norm, splitList } from '../schema.js';
import { Text, Area, Select, ImagePick, Rows } from '../../editor/fields.jsx';

// Task blocks: numbered cards with a title + instruction (drawn by the page), an answer area and scoring.
// ctx = { interactive, get(key), set(key, value), state(key) -> 'ok' | 'bad' | undefined }

// ---------- gaps: "Ma ärkan [tavaliselt|hommikul] kell 7." ----------
const GAP = /\[([^\]]*)\]/g;
const gapParts = (s) => String(s || '').split(/(\[[^\]]*\])/g).map((p) => (p.startsWith('[') ? { gap: p.slice(1, -1).split('|').map((x) => x.trim()) } : { text: p }));

export const gaps = {
  type: 'gaps', label: 'Lüngad (+ sõnapank)', group: 'Grammatika ja sõnavara', icon: 'TextCursorInput', task: true, width: 'half', tone: 'blue',
  create: () => ({ title: 'Täienda laused.', instruction: 'Kasuta sobivat sõna.', bank: 'hommikul, päeval, õhtul', showBank: 'yes', sentences: 'Ma ärkan [hommikul] kell 7.\nMa söön lõunat [päeval].' }),
  View: ({ data, ctx, id }) => {
    const lines = String(data.sentences || '').split('\n').filter((l) => l.trim());
    const bank = splitList(data.bank);
    const put = (w) => {
      if (!ctx.interactive) return;
      const keys = lines.flatMap((l, li) => gapParts(l).filter((p) => p.gap).map((_, gi) => `${li}.${gi}`));
      const target = keys.find((k) => k === ctx.focus?.[id]) || keys.find((k) => !ctx.get(k));
      if (target) ctx.set(target, w);
    };
    return (
      <>
        {data.showBank !== 'no' && bank.length > 0 && (
          <div className="ws-bank">{bank.map((w, i) => <span key={i} className="ws-bank-w" role={ctx.interactive ? 'button' : undefined} tabIndex={ctx.interactive ? 0 : -1} onClick={() => put(w)} onKeyDown={(e) => e.key === 'Enter' && put(w)}>{w}</span>)}</div>
        )}
        <ol className="ws-gaps">
          {lines.map((l, li) => {
            let gi = -1;
            return (
              <li key={li}>
                {gapParts(l).map((p, pi) => {
                  if (!p.gap) return <Fragment key={pi}><Md text={p.text} /></Fragment>;
                  gi += 1;
                  const key = `${li}.${gi}`;
                  return <Line key={pi} interactive={ctx.interactive} value={ctx.get(key)} onChange={(v) => ctx.set(key, v)} state={ctx.state(key)} width="26mm" label={`Lünk ${li + 1}`} className="ws-gapline" />;
                })}
              </li>
            );
          })}
        </ol>
      </>
    );
  },
  answers: (data) => String(data.sentences || '').split('\n').filter((l) => l.trim()).flatMap((l, li) => gapParts(l).filter((p) => p.gap).map((p, gi) => ({ key: `${li}.${gi}`, accept: p.gap }))),
  score: (data, get) => gaps.answers(data).map(({ key, accept }) => ({ key, ok: accept.map(norm).includes(norm(get(key))) })),
  Editor: ({ data, set }) => (
    <>
      <Area label="Laused (lünk nurksulgudes)" rows={7} value={data.sentences} onChange={(v) => set({ sentences: v })} hint="Näide: Ma ärkan [tavaliselt|hommikul] kell 7. — mitu õiget vastust eralda |" />
      <Area label="Sõnapank" rows={2} value={data.bank} onChange={(v) => set({ bank: v })} hint="Sõnad komaga. Jäta tühjaks, kui panka pole vaja." />
      <Select label="Näita sõnapanka" value={data.showBank} onChange={(v) => set({ showBank: v })} options={[['yes', 'Jah'], ['no', 'Ei']]} />
    </>
  ),
};

// ---------- choice: options per question, correct marked with * ----------
const opts = (s) => String(s || '').split('\n').map((o) => o.trim()).filter(Boolean).map((o) => ({ text: o.replace(/^\*/, '').trim(), correct: o.startsWith('*') }));

export const choice = {
  type: 'choice', label: 'Valikvastused', group: 'Grammatika ja sõnavara', icon: 'ListChecks', task: true, width: 'half', tone: 'sky',
  create: () => ({ title: 'Vali õige vastus.', instruction: '', questions: [{ q: 'Mis kell sa ärkad?', options: '*Ma ärkan kell 7.\nMa ärkan kell 23.\nMa ärkan õhtul.' }] }),
  View: ({ data, ctx }) => (
    <ol className="ws-choice">
      {(data.questions || []).map((q, qi) => {
        const o = opts(q.options);
        const multi = o.filter((x) => x.correct).length > 1;
        return (
          <li key={qi}>
            <div className="ws-q"><Md text={q.q} /></div>
            <div className="ws-opts">
              {o.map((opt, oi) => {
                const key = `${qi}`;
                const cur = ctx.get(key) || (multi ? [] : '');
                const on = multi ? cur.includes(oi) : cur === oi;
                const toggle = () => ctx.set(key, multi ? (on ? cur.filter((x) => x !== oi) : [...cur, oi]) : oi);
                return (
                  <button type="button" key={oi} className={`ws-opt ${on ? 'on' : ''} ${ctx.state(key) && on ? 'is-' + ctx.state(key) : ''}`} disabled={!ctx.interactive} onClick={toggle}>
                    <span className={multi ? 'ws-box' : 'ws-dot'} />{opt.text}
                  </button>
                );
              })}
            </div>
          </li>
        );
      })}
    </ol>
  ),
  score: (data, get) => (data.questions || []).map((q, qi) => {
    const o = opts(q.options);
    const correct = o.map((x, i) => (x.correct ? i : -1)).filter((i) => i >= 0);
    const v = get(`${qi}`);
    const given = Array.isArray(v) ? [...v].sort() : v === undefined || v === '' ? [] : [v];
    return { key: `${qi}`, ok: given.length === correct.length && given.every((g, i) => g === correct[i]) };
  }),
  Editor: ({ data, set }) => (
    <Rows label="Küsimused" rows={data.questions || []} onChange={(questions) => set({ questions })} make={() => ({ q: '', options: '*\n' })} addLabel="Lisa küsimus"
      render={(row, patch) => (
        <>
          <input className="ed-input" placeholder="Küsimus" value={row.q} onChange={(e) => patch({ q: e.target.value })} />
          <textarea className="ed-input" rows={3} placeholder={'*õige vastus\nvale vastus'} value={row.options} onChange={(e) => patch({ options: e.target.value })} />
        </>
      )} />
  ),
};

// ---------- true / false ----------
export const truefalse = {
  type: 'truefalse', label: 'Õige / vale', group: 'Grammatika ja sõnavara', icon: 'CircleCheck', task: true, width: 'half', tone: 'green',
  create: () => ({ title: 'Õige või vale?', instruction: 'Märgi Õ või V.', statements: [{ text: 'Päeval on pime.', answer: 'false' }, { text: 'Hommikul ma ärkan.', answer: 'true' }] }),
  View: ({ data, ctx }) => (
    <div className="ws-tf">
      <div className="ws-tf-head"><span /><b>Õ</b><b>V</b></div>
      {(data.statements || []).map((s, i) => (
        <div className="ws-tf-row" key={i}>
          <span>{i + 1}. <Md text={s.text} /></span>
          {['true', 'false'].map((v) => (
            <button type="button" key={v} disabled={!ctx.interactive} className={`ws-tfbox ${ctx.get(`${i}`) === v ? 'on' : ''} ${ctx.get(`${i}`) === v && ctx.state(`${i}`) ? 'is-' + ctx.state(`${i}`) : ''}`} onClick={() => ctx.set(`${i}`, v)} aria-label={v === 'true' ? 'Õige' : 'Vale'} />
          ))}
        </div>
      ))}
    </div>
  ),
  score: (data, get) => (data.statements || []).map((s, i) => ({ key: `${i}`, ok: get(`${i}`) === s.answer })),
  Editor: ({ data, set }) => (
    <Rows label="Väited" rows={data.statements || []} onChange={(statements) => set({ statements })} make={() => ({ text: '', answer: 'true' })} addLabel="Lisa väide"
      render={(row, patch) => (
        <div className="ed-row">
          <input className="ed-input" value={row.text} placeholder="Väide" onChange={(e) => patch({ text: e.target.value })} />
          <select className="ed-input small" value={row.answer} onChange={(e) => patch({ answer: e.target.value })}><option value="true">Õ</option><option value="false">V</option></select>
        </div>
      )} />
  ),
};

// ---------- match pairs (one-to-one) ----------
const rotate = (arr) => (arr.length > 2 ? [...arr.slice(2), ...arr.slice(0, 2)] : [...arr].reverse());
export const match = {
  type: 'match', label: 'Ühenda paarid', group: 'Grammatika ja sõnavara', icon: 'Link', task: true, width: 'half', tone: 'peach',
  create: () => ({ title: 'Ühenda.', instruction: 'Leia paar.', pairs: [{ left: 'hommikul', right: 'morning' }, { left: 'õhtul', right: 'evening' }, { left: 'öösel', right: 'night' }] }),
  View: ({ data, ctx }) => {
    const pairs = data.pairs || [];
    const right = rotate(pairs.map((p, i) => ({ text: p.right, i })));
    const letter = (k) => String.fromCharCode(65 + k);
    return (
      <div className="ws-match">
        <ol>{pairs.map((p, i) => (
          <li key={i}><span><Md text={p.left} /></span>
            {ctx.interactive ? (
              <select className={`ws-sel ${ctx.state(`${i}`) ? 'is-' + ctx.state(`${i}`) : ''}`} value={ctx.get(`${i}`) ?? ''} onChange={(e) => ctx.set(`${i}`, e.target.value)} aria-label={`Paar ${i + 1}`}>
                <option value="">–</option>{right.map((_, k) => <option key={k} value={letter(k)}>{letter(k)}</option>)}
              </select>
            ) : <span className={`ws-letterbox ${ctx.state(`${i}`) ? 'is-' + ctx.state(`${i}`) : ''}`}>{ctx.get(`${i}`) || ''}</span>}
          </li>
        ))}</ol>
        <ul>{right.map((r, k) => <li key={k}><b>{letter(k)}.</b> <Md text={r.text} /></li>)}</ul>
      </div>
    );
  },
  score: (data, get) => {
    const pairs = data.pairs || [];
    const right = rotate(pairs.map((p, i) => ({ i })));
    return pairs.map((_, i) => ({ key: `${i}`, ok: get(`${i}`) === String.fromCharCode(65 + right.findIndex((r) => r.i === i)) }));
  },
  Editor: ({ data, set }) => (
    <Rows label="Paarid (paremad segatakse automaatselt)" rows={data.pairs || []} onChange={(pairs) => set({ pairs })} make={() => ({ left: '', right: '' })} addLabel="Lisa paar"
      render={(row, patch) => (
        <div className="ed-row">
          <input className="ed-input" placeholder="Vasak" value={row.left} onChange={(e) => patch({ left: e.target.value })} />
          <input className="ed-input" placeholder="Parem" value={row.right} onChange={(e) => patch({ right: e.target.value })} />
        </div>
      )} />
  ),
};

// ---------- many-to-many (open, teacher reviews) ----------
export const manymatch = {
  type: 'manymatch', label: 'Seosta (mitu vastust)', group: 'Grammatika ja sõnavara', icon: 'Shuffle', task: true, width: 'half', tone: 'green',
  create: () => ({ title: 'Millal sa teed neid tegevusi?', instruction: 'Ühenda tegevus sobiva ajaga. Mõned tegevused võivad sobida mitmesse aega.', left: 'ärkan\nsöön lõunat\nlähen magama', right: 'hommikul\npäeval\nõhtul' }),
  View: ({ data, ctx, id }) => {
    const L = String(data.left || '').split('\n').filter(Boolean);
    const R = String(data.right || '').split('\n').filter(Boolean);
    const active = ctx.focus?.[id];
    return (
      <div className="ws-many">
        {ctx.interactive && <div className="ws-hint">Klõpsa tegevusel, siis sobival ajal.</div>}
        <ol>{L.map((l, i) => (
          <li key={i} className={`${ctx.interactive ? 'pick' : ''} ${active === `${i}` ? 'sel' : ''}`} onClick={() => ctx.interactive && ctx.setFocus(id, `${i}`)}>
            {l}{(ctx.get(`${i}`) || []).length > 0 && <span className="ws-tags">{ctx.get(`${i}`).join(', ')}</span>}
          </li>
        ))}</ol>
        <ul>{R.map((r, k) => (
          <li key={k} className={ctx.interactive ? 'pick' : ''} onClick={() => {
            if (!ctx.interactive || active === undefined) return;
            const cur = ctx.get(active) || [];
            ctx.set(active, cur.includes(r) ? cur.filter((x) => x !== r) : [...cur, r]);
          }}>{r}</li>
        ))}</ul>
      </div>
    );
  },
  score: null, // several answers are acceptable: reviewed by the teacher
  Editor: ({ data, set }) => (
    <>
      <Area label="Vasak veerg (iga rida eraldi)" rows={6} value={data.left} onChange={(v) => set({ left: v })} />
      <Area label="Parem veerg (iga rida eraldi)" rows={6} value={data.right} onChange={(v) => set({ right: v })} />
    </>
  ),
};

// ---------- pictures: order / label / show ----------
export const pictures = {
  type: 'pictures', label: 'Pildid (järjekord / sildid)', group: 'Pildid', icon: 'LayoutGrid', task: true, width: 'half', tone: 'peach',
  create: () => ({ title: 'Pane pildid õigesse järjekorda.', instruction: 'Kirjuta numbrid piltide alla.', mode: 'order', columns: '4', aspect: '4:3', items: [{ img: null, caption: 'Ärkan.', answer: '1' }, { img: null, caption: 'Söön hommikusööki.', answer: '2' }] }),
  View: ({ data, ctx }) => (
    <div className="ws-pics" style={{ gridTemplateColumns: `repeat(${Number(data.columns) || 4}, 1fr)` }}>
      {(data.items || []).map((it, i) => (
        <div className="ws-pic" key={i}>
          <Photo img={it.img} aspect={data.aspect} alt={it.caption}>
            {data.mode === 'order' && (
              <input className={`ws-circ ${ctx.state(`${i}`) ? 'is-' + ctx.state(`${i}`) : ''}`} inputMode="numeric" maxLength={2} readOnly={!ctx.interactive} tabIndex={ctx.interactive ? 0 : -1}
                value={ctx.get(`${i}`) || ''} onChange={(e) => ctx.set(`${i}`, e.target.value.replace(/\D/g, ''))} aria-label={`Number: ${it.caption}`} />
            )}
          </Photo>
          {data.mode === 'label'
            ? <Line interactive={ctx.interactive} value={ctx.get(`${i}`)} onChange={(v) => ctx.set(`${i}`, v)} state={ctx.state(`${i}`)} width="100%" label={`Silt ${i + 1}`} />
            : it.caption && <div className="ws-cap">{it.caption}</div>}
        </div>
      ))}
    </div>
  ),
  score: (data, get) => (data.items || []).map((it, i) => (it.answer ? { key: `${i}`, ok: splitList(String(it.answer).replace(/\|/g, ',')).map(norm).includes(norm(get(`${i}`))) } : null)).filter(Boolean),
  Editor: ({ data, set }) => (
    <>
      <Select label="Ülesande tüüp" value={data.mode} onChange={(v) => set({ mode: v })} options={[['order', 'Järjekord (numbrid pildil)'], ['label', 'Kirjuta sõna pildi alla'], ['show', 'Ainult pildid']]} />
      <div className="ed-row">
        <Select label="Veerge" value={data.columns} onChange={(v) => set({ columns: v })} options={[['2', '2'], ['3', '3'], ['4', '4']]} />
        <Select label="Kuvasuhe" value={data.aspect} onChange={(v) => set({ aspect: v })} options={[['4:3', '4:3'], ['1:1', '1:1'], ['3:2', '3:2'], ['3:4', '3:4']]} />
      </div>
      <Rows label="Pildid" rows={data.items || []} onChange={(items) => set({ items })} make={() => ({ img: null, caption: '', answer: '' })} addLabel="Lisa pilt" max={12}
        render={(row, patch) => (
          <>
            <ImagePick label="" value={row.img} aspect={data.aspect} onChange={(img) => patch({ img })} allowAspect={false} />
            <input className="ed-input" placeholder="Allkiri" value={row.caption} onChange={(e) => patch({ caption: e.target.value })} />
            <input className="ed-input" placeholder={data.mode === 'order' ? 'Õige number' : 'Õige sõna (mitu: a|b)'} value={row.answer} onChange={(e) => patch({ answer: e.target.value })} />
          </>
        )} />
    </>
  ),
};

// ---------- clock ----------
const EST = ['kaksteist', 'üks', 'kaks', 'kolm', 'neli', 'viis', 'kuus', 'seitse', 'kaheksa', 'üheksa', 'kümme', 'üksteist', 'kaksteist'];
export function clockAccept(t, extra = '') {
  const [h, m] = t.split(':').map(Number);
  const h12 = h % 12 || 12;
  const base = [t, `${h}:${String(m).padStart(2, '0')}`, `${h}.${String(m).padStart(2, '0')}`, `${h12}.${String(m).padStart(2, '0')}`, `${h12 + 12 === 24 ? 12 : h12 + 12}.${String(m).padStart(2, '0')}`];
  if (m === 0) base.push(String(h12), EST[h12], `kell on ${EST[h12]}`, `kell ${EST[h12]}`);
  if (m === 30) base.push(`pool ${EST[(h12 % 12) + 1]}`, `kell on pool ${EST[(h12 % 12) + 1]}`);
  return [...base, ...splitList(String(extra).replace(/\|/g, ','))];
}
export const clock = {
  type: 'clock', label: 'Kell (mis kell on?)', group: 'Teemad', icon: 'Clock', task: true, width: 'half', tone: 'blue',
  create: () => ({ title: 'Mis kell on?', instruction: 'Kirjuta, mis kell on. Kasuta fraasi *Kell on …*', columns: '3', items: [{ time: '07:00', extra: '' }, { time: '08:30', extra: '' }, { time: '12:00', extra: '' }] }),
  View: ({ data, ctx }) => (
    <div className="ws-clocks" style={{ gridTemplateColumns: `repeat(${Number(data.columns) || 3}, 1fr)` }}>
      {(data.items || []).map((it, i) => (
        <div className="ws-clockitem" key={i}>
          <Clock time={it.time} />
          <div className="ws-clockrow"><b>{i + 1}.</b><Line interactive={ctx.interactive} value={ctx.get(`${i}`)} onChange={(v) => ctx.set(`${i}`, v)} state={ctx.state(`${i}`)} width="100%" label={`Kell ${i + 1}`} /></div>
        </div>
      ))}
    </div>
  ),
  score: (data, get) => (data.items || []).map((it, i) => {
    const acc = clockAccept(it.time, it.extra).map(norm);
    const v = norm(get(`${i}`));
    return { key: `${i}`, ok: !!v && (acc.includes(v) || acc.includes(v.replace(/^kell on /, '')) || acc.includes(v.replace(/^kell /, ''))) };
  }),
  Editor: ({ data, set }) => (
    <>
      <Select label="Veerge" value={data.columns} onChange={(v) => set({ columns: v })} options={[['2', '2'], ['3', '3'], ['4', '4'], ['6', '6']]} />
      <Rows label="Kellad" rows={data.items || []} onChange={(items) => set({ items })} make={() => ({ time: '09:00', extra: '' })} addLabel="Lisa kell" max={12}
        render={(row, patch) => (
          <div className="ed-row">
            <input className="ed-input small" type="time" value={row.time} onChange={(e) => patch({ time: e.target.value })} />
            <input className="ed-input" placeholder="Lisavastused (a|b)" value={row.extra} onChange={(e) => patch({ extra: e.target.value })} />
          </div>
        )} />
    </>
  ),
};

export const taskBlocks = { gaps, choice, truefalse, match, manymatch, pictures, clock };
export { GAP };
