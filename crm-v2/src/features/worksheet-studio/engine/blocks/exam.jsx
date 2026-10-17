/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { Fragment } from 'react';
import { Line, Md } from '../ui.jsx';
import { gapWidth } from '../gapWidth.js';
import { norm } from '../schema.js';
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

// review: the option the learner chose (its index may be 0), with its mark; print: an empty line
const chosenOption = (options, value) => (value === undefined || value === null || value === '' ? null : options.find((o) => o.oi === Number(value)) || null);
const ClozeGap = ({ n, chosen, state }) => <span className={`ws-cloze-gap ${chosen && state ? 'is-' + state : ''}`}>({n}) {chosen ? <b>{chosen.text}</b> : '________'}</span>;

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
              ) : <ClozeGap key={k} n={gi + 1} chosen={chosenOption(gaps[gi], ctx.get(key))} state={state} />;
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
  answers: (data) => clozeGaps(data.passage).map((opts, gi) => ({ key: `${gi}`, accept: opts.filter((o) => o.correct).map((o) => o.text) })),
  score: (data, get) => clozeGaps(data.passage).map((opts, gi) => ({ key: `${gi}`, ok: get(`${gi}`) !== undefined && get(`${gi}`) !== '' && opts.find((o) => o.oi === Number(get(`${gi}`)))?.correct === true })),
  Editor: ({ data, set }) => (
    <>
      <Text label="Teksti pealkiri" value={data.passageTitle} onChange={(passageTitle) => set({ passageTitle })} />
      <Area label="Tekst lünkadega: {*õige|vale|vale}" rows={10} value={data.passage} onChange={(passage) => set({ passage })} />
      <span className="ed-hint">Iga lünk loogelistes sulgudes, valikud „|” vahel, õige tärniga. Harno B1: 3 valikut, B2: 4.</span>
    </>
  ),
};

// „Pane sõnad õigesse vormi” on a whole text (lesson template v3, owner 2026-10-18: „как на экзамене”): the learner
// writes each word in the form the text needs. Written as „Eile [käisin|käisime] (käima) poes.” — the accepted forms in
// brackets, the base form after them; the base form is printed, the answer is a line.
const FORM_GAP = /\[([^\]]*)\]\s*\(([^)]*)\)/g;
export function formGaps(passage) {
  return [...String(passage || '').matchAll(FORM_GAP)].map((m) => ({ accept: m[1].split('|').map((x) => x.trim()).filter(Boolean), base: m[2].trim() }));
}
function formParts(passage) {
  let n = -1;
  return paragraphs(passage).map((p) => p.split(/(\[[^\]]*\]\s*\([^)]*\))/g).map((piece) => {
    const m = /^\[([^\]]*)\]\s*\(([^)]*)\)$/.exec(piece);
    return m ? { gap: (n += 1), accept: m[1].split('|').map((x) => x.trim()), base: m[2].trim() } : { text: piece };
  }));
}

export const formtext = {
  type: 'formtext', label: 'Pane sõnad õigesse vormi (tekst)', group: 'Grammatika ja sõnavara', icon: 'TextCursorInput', task: true, width: 'full', tone: 'blue',
  create: () => ({
    title: 'Pane sõnad õigesse vormi.', instruction: 'Kirjuta sulgudes olev sõna lünka sellises vormis, nagu tekst nõuab.', passageTitle: 'Kolimine',
    passage: 'Eelmisel kuul [kolisime] (kolima) uude korterisse. Kõige raskem oli [raamatute] (raamat) pakkimine.\n\nNüüd elame [kesklinnas] (kesklinn) ja käime tööl jala.',
  }),
  View: ({ data, ctx }) => (
    <div className="ws-cloze ws-formtext">
      <div className="ws-passage">
        {data.passageTitle ? <h4>{data.passageTitle}</h4> : null}
        {formParts(data.passage).map((para, pi) => (
          <p key={pi}>{para.map((piece, k) => {
            if (!('gap' in piece)) return <Fragment key={k}><Md text={piece.text} /></Fragment>;
            const key = `${piece.gap}`;
            return <span key={k} className="ws-formtext-gap"><sup>{piece.gap + 1}</sup><Line interactive={ctx.interactive} value={ctx.get(key)} onChange={(v) => ctx.set(key, v)} state={ctx.state(key)} width={gapWidth(piece.accept, '26mm')} label={`Lünk ${piece.gap + 1}`} className="ws-gapline" /> ({piece.base})</span>;
          })}</p>
        ))}
      </div>
    </div>
  ),
  answers: (data) => formGaps(data.passage).map((g, gi) => ({ key: `${gi}`, accept: g.accept })),
  score: (data, get) => formGaps(data.passage).map((g, gi) => ({ key: `${gi}`, ok: g.accept.map(norm).includes(norm(get(`${gi}`))) })),
  Editor: ({ data, set }) => (
    <>
      <Text label="Teksti pealkiri" value={data.passageTitle} onChange={(passageTitle) => set({ passageTitle })} />
      <Area label="Tekst: [õige vorm|teine õige] (algvorm)" rows={10} value={data.passage} onChange={(passage) => set({ passage })} />
      <span className="ed-hint">Näide: Eile [käisin] (käima) poes. Lõigud tühja reaga.</span>
    </>
  ),
};

// „Lünka sobiv lause” (Harno B2 reading task 4): sentences are taken out of a text and listed under it, mixed, with one
// or two extra sentences. Written as the whole text with each taken-out sentence in [[double brackets]]; „extra” holds
// the sentences that do not belong.
const SENTENCE_GAP = /\[\[([^\]]*)\]\]/g;
const sentenceList = (data) => {
  const gapsList = [...String(data.passage || '').matchAll(SENTENCE_GAP)].map((m) => m[1].trim());
  const extra = String(data.extra || '').split('\n').map((x) => x.trim()).filter(Boolean);
  return { gapsList, options: [...gapsList, ...extra].map((text, oi) => ({ text, oi })) };
};
const LETTERS_UP = 'ABCDEFGHIJKLMN';

export const insertion = {
  type: 'insertion', label: 'Lünka sobiv lause (eksam)', group: 'Tekst ja heli', icon: 'ListChecks', task: true, width: 'full', tone: 'cream',
  create: () => ({
    title: 'Vali lünka sobiv lause.', instruction: 'Kirjuta lünka lause täht. Üks lause jääb üle.', passageTitle: 'Uus raamatukogu',
    passage: 'Linna uus raamatukogu avati eelmisel nädalal. [[Esimesel päeval käis seal üle tuhande inimese.]] Hoones on lugemissaal, kohvik ja laste mängutuba.\n\nRaamatukogu on avatud ka pühapäeviti. [[Nii saavad ka töötavad inimesed seal rahulikult aega veeta.]]',
    extra: 'Raamatukogu ehitamine maksis kaks korda vähem, kui plaaniti.',
  }),
  View: ({ data, ctx, id }) => {
    const { options } = sentenceList(data);
    const shown = seededShuffle(options, id);
    const letter = (oi) => LETTERS_UP[shown.findIndex((o) => o.oi === oi)] || '';
    let n = -1;
    return (
      <div className="ws-cloze ws-insertion">
        <div className="ws-passage">
          {data.passageTitle ? <h4>{data.passageTitle}</h4> : null}
          {paragraphs(data.passage).map((para, pi) => (
            <p key={pi}>{para.split(/(\[\[[^\]]*\]\])/g).map((piece, k) => {
              if (!piece.startsWith('[[')) return <Fragment key={k}><Md text={piece} /></Fragment>;
              n += 1;
              const key = `${n}`;
              const state = ctx.state(key);
              const value = ctx.get(key);
              return ctx.interactive ? (
                <select key={k} className={`ws-cloze-sel ${state ? 'is-' + state : ''}`} value={value ?? ''} onChange={(e) => ctx.set(key, e.target.value === '' ? '' : Number(e.target.value))} aria-label={`Lünk ${n + 1}`}>
                  <option value="">({n + 1})</option>
                  {shown.map((o, li) => <option key={o.oi} value={o.oi}>{LETTERS_UP[li]}</option>)}
                </select>
              ) : <span key={k} className={`ws-cloze-gap ${value !== undefined && value !== '' && state ? 'is-' + state : ''}`}>({n + 1}) {value !== undefined && value !== '' ? <b>{letter(Number(value))}</b> : '____'}</span>;
            })}</p>
          ))}
        </div>
        <ol className="ws-insertion-options" type="A">
          {shown.map((o) => <li key={o.oi}>{o.text}</li>)}
        </ol>
      </div>
    );
  },
  answers: (data) => sentenceList(data).gapsList.map((text, gi) => ({ key: `${gi}`, accept: [text] })),
  score: (data, get) => sentenceList(data).gapsList.map((_, gi) => ({ key: `${gi}`, ok: get(`${gi}`) !== undefined && get(`${gi}`) !== '' && Number(get(`${gi}`)) === gi })),
  Editor: ({ data, set }) => (
    <>
      <Text label="Teksti pealkiri" value={data.passageTitle} onChange={(passageTitle) => set({ passageTitle })} />
      <Area label="Terve tekst, välja võetud laused [[topeltsulgudes]]" rows={10} value={data.passage} onChange={(passage) => set({ passage })} />
      <Area label="Üleliigsed laused (igaüks eraldi real)" rows={3} value={data.extra} onChange={(extra) => set({ extra })} />
    </>
  ),
};

export const examBlocks = { cloze, formtext, insertion };
