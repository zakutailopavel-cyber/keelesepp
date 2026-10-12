import { Fragment } from 'react';
import { Md } from '../ui.jsx';
import { Area, Text } from '../../editor/fields.jsx';
import { seededShuffle } from './tasks.jsx';

// Exam-format tasks (owner 2026-10-12: B1 course after Harno). „Valiklünktekst”: a text with numbered gaps, each with
// 3–4 options — Harno B1 reading task 3 (10 gaps, 3 options), B2 (4 options). Written as
// „Ma {*käin|käisin|käima} iga päev tööl.” — the right option starts with *; the options are mixed per gap (seeded by
// the block id, the same on screen and paper). On paper the options are listed under the text, as in the exam.

const LETTERS = 'abcdefgh';
const GAP = /\{([^}]*)\}/g;
const paragraphs = (text) => String(text || '').split(/\n{2,}/).filter((p) => p.trim());
export function clozeGaps(passage) {
  return [...String(passage || '').matchAll(GAP)].map((m) => m[1].split('|').map((o) => o.trim()).filter(Boolean)
    .map((o, oi) => ({ text: o.replace(/^\*/, ''), correct: o.startsWith('*'), oi })));
}
// the gaps of one paragraph keep their running number over the whole text
function parts(passage) {
  let n = -1;
  return paragraphs(passage).map((p) => p.split(/(\{[^}]*\})/g).map((piece) => (piece.startsWith('{') ? { gap: (n += 1) } : { text: piece })));
}

export const cloze = {
  type: 'cloze', label: 'Valiklünktekst (eksam)', group: 'Grammatika ja sõnavara', icon: 'TextSelect', task: true, width: 'full', tone: 'cream',
  create: () => ({
    title: 'Vali lünka sobiv sõna.', instruction: 'Igas lüngas on üks õige vastus.', passageTitle: 'Uus töökoht',
    passage: 'Eelmisel nädalal {*alustasin|alustan|alustama} uues töökohas. Esimesel päeval {*tutvustas|tutvustab|tutvustada} juhataja mulle kolleege.\n\nMulle {*meeldib|meeldin|meeldima} see töö väga.',
  }),
  View: ({ data, ctx, id }) => {
    const gaps = clozeGaps(data.passage);
    const shown = gaps.map((opts, gi) => (ctx.keepOrder ? opts : seededShuffle(opts, `${id}:${gi}`)));
    return (
      <div className="ws-cloze">
        <div className="ws-passage">
          {data.passageTitle ? <h4>{data.passageTitle}</h4> : null}
          {parts(data.passage).map((para, pi) => (
            <p key={pi}>{para.map((piece, k) => {
              if (!('gap' in piece)) return <Fragment key={k}><Md text={piece.text} /></Fragment>;
              const gi = piece.gap;
              const key = `${gi}`;
              const state = ctx.state(key);
              return ctx.interactive ? (
                <select key={k} className={`ws-cloze-sel ${state ? 'is-' + state : ''}`} value={ctx.get(key) ?? ''} onChange={(e) => ctx.set(key, e.target.value === '' ? '' : Number(e.target.value))} aria-label={`Lünk ${gi + 1}`}>
                  <option value="">({gi + 1})</option>
                  {shown[gi].map((o) => <option key={o.oi} value={o.oi}>{o.text}</option>)}
                </select>
              ) : <span key={k} className="ws-cloze-gap">({gi + 1}) ________</span>;
            })}</p>
          ))}
        </div>
        {!ctx.interactive ? (
          <ol className="ws-cloze-options">
            {shown.map((opts, gi) => <li key={gi}>{opts.map((o, k) => <span key={o.oi}><i className="ws-dot" /> {LETTERS[k]}) {o.text}</span>)}</li>)}
          </ol>
        ) : null}
      </div>
    );
  },
  score: (data, get) => clozeGaps(data.passage).map((opts, gi) => ({ key: `${gi}`, ok: get(`${gi}`) !== undefined && get(`${gi}`) !== '' && opts.find((o) => o.oi === Number(get(`${gi}`)))?.correct === true })),
  Editor: ({ data, set }) => (
    <>
      <Text label="Teksti pealkiri" value={data.passageTitle} onChange={(passageTitle) => set({ passageTitle })} />
      <Area label="Tekst lünkadega: {*õige|vale|vale}" rows={10} value={data.passage} onChange={(passage) => set({ passage })} />
      <span className="ed-hint">Iga lünk loogelistes sulgudes, valikud „|” vahel, õige tärniga. Harno B1: 3 valikut, B2: 4.</span>
    </>
  ),
};

export const examBlocks = { cloze };
