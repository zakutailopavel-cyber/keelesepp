import { Md } from '../ui.jsx';
import { Area, ImagePick, Rows, Text } from '../../editor/fields.jsx';
import { plainText } from './tasks.jsx';

// „Kõnelejad ja väited” — the 9th-grade e-exam's listening task 1.1 (docs/EXAM_9KL_E_EKSAM.md §3): opinions of different
// people on one topic. Each speaker is a row (a photo or an initial, „1. kõneleja”, the name) with a dropdown of letters;
// the statements A–I stand once, as a table beside the rows. There are more statements than speakers (extras), and a
// letter is used once: a letter taken by another speaker is shown but cannot be chosen again. Item 0 may be the solved
// example (block.opts.example). Scored per speaker. A form of `examlisten` (data.mode 'speakers').
//   data.topic     the question over the rows („Mida arvavad inimesed lugemisest?”)
//   data.claims    ['Ta loeb bussis.', …]  lettered A, B, C … in this order
//   data.speakers  [{ name, img, answer: 'D' }, …]
export const LETTERS = 'ABCDEFGHIJKLMNOP';
const claimsOf = (data) => (data.claims || []).map((text) => String(text || '').trim());
const letterOf = (value) => String(value ?? '').trim().toUpperCase();
const initials = (name) => String(name || '').trim().split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
const withClaim = (data, letter) => {
  const text = claimsOf(data)[LETTERS.indexOf(letter)];
  return letter && text ? `${letter} — ${text}` : letter;
};

export const speakers = {
  View: ({ data, ctx }) => {
    const claims = claimsOf(data);
    const rows = data.speakers || [];
    const letters = claims.map((_, k) => LETTERS[k]);
    const first = ctx.numFrom ?? 1;
    const isExample = (i) => Boolean(ctx.isExample?.(`${i}`));
    const takenBy = (letter, i) => rows.some((_, j) => j !== i && letterOf(ctx.get(`${j}`)) === letter);
    return (
      <div className="ws-speakers">
        {data.topic ? <p className="ws-speakers-topic"><b><Md text={data.topic} /></b></p> : null}
        <div className="ws-speakers-grid">
          <ol className="ws-speakers-rows">
            {rows.map((s, i) => {
              const key = `${i}`;
              const value = letterOf(ctx.get(key));
              const state = ctx.state(key);
              const example = isExample(i);
              const n = (ctx.start || 0) + i + first;
              const label = example && n === 0 ? 'Näidis' : `${n}. kõneleja`;
              return (
                <li key={i} className={`ws-speaker ${example ? 'is-example' : ''}`}>
                  <span className="ws-speaker-label"><span>{n === 0 ? <><b>0.</b> näidis</> : <><b>{n}.</b> kõneleja</>}</span>{s.name ? <small>{s.name}</small> : null}</span>
                  <span className="ws-speaker-face" aria-hidden="true">{s.img?.src ? <img src={s.img.src} alt="" /> : <i>{initials(s.name) || n}</i>}</span>
                  {ctx.interactive && !example ? (
                    <select className={`ws-sel ws-speaker-sel ${state ? 'is-' + state : ''}`} value={value} onChange={(e) => ctx.set(key, e.target.value)} aria-label={`${label}${s.name ? ` (${plainText(s.name)})` : ''}: vali väide`}>
                      <option value="">–</option>
                      {letters.map((l, k) => <option key={l} value={l} disabled={takenBy(l, i)} label={ctx.flow ? `${l}. ${plainText(claims[k])}` : undefined}>{l}</option>)}
                    </select>
                  ) : <span className={`ws-letterbox ${state && !example ? 'is-' + state : ''}`}>{value}</span>}
                </li>
              );
            })}
          </ol>
          <table className="ws-speakers-claims">
            <tbody>
              {claims.map((text, k) => {
                const used = rows.some((_, i) => isExample(i) && letterOf(ctx.get(`${i}`)) === LETTERS[k]);
                return <tr key={k} className={used ? 'is-example' : ''}><th scope="row">{LETTERS[k]}</th><td><Md text={text} /></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
  answers: (data) => (data.speakers || []).map((s, i) => ({ key: `${i}`, accept: [withClaim(data, letterOf(s.answer))] })),
  answerText: (data, key, value) => withClaim(data, letterOf(value)),
  expectedText: (data, key) => withClaim(data, letterOf(data.speakers?.[Number(key)]?.answer)),
  score: (data, get) => (data.speakers || []).map((s, i) => ({ key: `${i}`, ok: Boolean(letterOf(s.answer)) && letterOf(get(`${i}`)) === letterOf(s.answer) })),
  example: (data) => (data.speakers?.[0] ? { 0: letterOf(data.speakers[0].answer) } : {}),
  // the teacher's key: one item per speaker (answerKey.js)
  keyItems: (data) => (data.speakers || []).map((s, i) => ({ prompt: `${i + 1}. kõneleja${s.name ? ` (${s.name})` : ''}`, answer: withClaim(data, letterOf(s.answer)) })),
  Editor: ({ data, set }) => (
    <>
      <Text label="Küsimus ridade kohal" value={data.topic} onChange={(topic) => set({ topic })} />
      <Area label="Väited (iga rida eraldi, tähed A, B, C … järjekorras)" rows={6} value={(data.claims || []).join('\n')} onChange={(v) => set({ claims: v.split('\n') })} />
      <Rows label="Kõnelejad ja õige täht" rows={data.speakers || []} onChange={(rows) => set({ speakers: rows })} make={() => ({ name: '', img: null, answer: '' })} addLabel="Lisa kõneleja" max={12}
        render={(row, patch) => (
          <>
            <div className="ed-row">
              <input className="ed-input" placeholder="Nimi (valikuline)" value={row.name || ''} onChange={(e) => patch({ name: e.target.value })} />
              <input className="ed-input small" placeholder="A" value={row.answer || ''} onChange={(e) => patch({ answer: e.target.value.toUpperCase() })} />
            </div>
            <ImagePick label="" value={row.img} aspect="1:1" onChange={(img) => patch({ img })} allowAspect={false} />
          </>
        )} />
    </>
  ),
};
