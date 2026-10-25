/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
/* global clearInterval, setInterval */
import { useEffect, useRef, useState } from 'react';
import { AudioBar, Line, Md, Photo } from '../ui.jsx';
import { Area, ImagePick, Num, Rows, Select, Text } from '../../editor/fields.jsx';
import { choice, match, truefalse } from './tasks.jsx';
import { AudioPick } from './extra.jsx';
import { Recorder } from './productive.jsx';

// Harno B1 exam formats that the older blocks could not show (docs/COURSE_FINAL_SHAPE_B1.md §2.2, §9 item 4).
// Each renders in every host from the one registry: the student's player (interactive), the teacher's check (review),
// the studio (edit) and paper (print). Closed formats carry their answer key; open ones carry their task card.
//   adsmatch      R1  situations ↔ ads / notices (one ad may fit several situations), scored
//   examlisten    L1, L2, L4  a recording + 3-option choice, true / false or matching, scored (L3 = `listening`)
//   examwriting   W1a, W1b, W2a, W2b  the task card (situation, content points, word target) and the answer
//   speakcard     S1b, S2  the idea card of an agreement („kokkulepe”) or the phone role play's question / answer card
//   examrubric    the exam-scale rubric (W1 /8, W2 /12, speaking /20, §2.4), points per criterion
//   exampart      the header of an exam part: minutes, tasks, points and the 80 % target, with a timer on screen

const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const LETTERS = 'ABCDEFGHIJKLMN';
const accepted = (answer) => String(answer || '').split(/[|,/]/).map((x) => x.trim().toUpperCase()).filter(Boolean);
const wordCount = (text) => (String(text || '').trim() ? String(text).trim().split(/\s+/).length : 0);

// ---------- R1: situations ↔ ads ----------
export const adsmatch = {
  type: 'adsmatch', label: 'Olukorrad ja kuulutused (eksam)', group: 'Tekst ja heli', icon: 'Newspaper', task: true, width: 'full', tone: 'cream',
  create: () => ({
    title: 'Leia igale olukorrale sobiv kuulutus.', instruction: 'Kirjuta olukorra kõrvale kuulutuse täht. Üks kuulutus võib sobida mitmele olukorrale.',
    ads: [
      { title: 'Ujula', text: 'Avatud iga päev kell 7–21. Laste ujumistunnid laupäeviti.' },
      { title: 'Raamatukogu', text: 'Uued raamatud ja ajakirjad. Esmaspäeval suletud.' },
      { title: 'Rattarent', text: 'Jalgrattad päevaks või nädalaks. Kiivrid tasuta.' },
    ],
    situations: [
      { text: 'Su poeg tahab ujuma õppida.', answer: 'A' },
      { text: 'Sa tahad nädalavahetusel linnas sõita.', answer: 'C' },
      { text: 'Sa otsid uut ajakirja.', answer: 'B' },
    ],
  }),
  View: ({ data, ctx }) => {
    const ads = data.ads || [];
    const letters = ads.map((_, k) => LETTERS[k]);
    return (
      <div className="ws-ads">
        <div className="ws-ads-grid">
          {ads.map((ad, k) => (
            <article key={k} className="ws-ad">
              <b className="ws-ad-letter">{LETTERS[k]}</b>
              {ad.title ? <h4>{ad.title}</h4> : null}
              <p><Md text={ad.text} /></p>
            </article>
          ))}
        </div>
        <ol className="ws-ads-sit" start={(ctx.start || 0) + 1}>
          {(data.situations || []).map((s, i) => {
            const key = `${i}`;
            const state = ctx.state(key);
            return (
              <li key={i}>
                <span className="ws-ads-text"><Md text={s.text} /></span>
                {ctx.interactive ? (
                  <select className={`ws-sel ${state ? 'is-' + state : ''}`} value={ctx.get(key) ?? ''} onChange={(e) => ctx.set(key, e.target.value)} aria-label={`Olukord ${i + 1}`}>
                    <option value="">–</option>{letters.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                ) : <span className={`ws-letterbox ${state ? 'is-' + state : ''}`}>{ctx.get(key) || ''}</span>}
              </li>
            );
          })}
        </ol>
      </div>
    );
  },
  answers: (data) => (data.situations || []).map((s, i) => ({ key: `${i}`, accept: accepted(s.answer) })),
  score: (data, get) => (data.situations || []).map((s, i) => ({ key: `${i}`, ok: accepted(s.answer).includes(String(get(`${i}`) || '').trim().toUpperCase()) })),
  example: (data) => (data.situations?.[0] ? { 0: accepted(data.situations[0].answer)[0] } : {}),
  Editor: ({ data, set }) => (
    <>
      <Rows label="Kuulutused (tähed A, B, C … järjekorras)" rows={data.ads || []} onChange={(ads) => set({ ads })} make={() => ({ title: '', text: '' })} addLabel="Lisa kuulutus" max={10}
        render={(row, patch) => <><Text label="Pealkiri" value={row.title} onChange={(title) => patch({ title })} /><Area label="Tekst" value={row.text} onChange={(text) => patch({ text })} /></>} />
      <Rows label="Olukorrad ja õige täht" rows={data.situations || []} onChange={(situations) => set({ situations })} make={() => ({ text: '', answer: '' })} addLabel="Lisa olukord" max={14}
        render={(row, patch) => (
          <div className="ed-row">
            <input className="ed-input" placeholder="Olukord" value={row.text} onChange={(e) => patch({ text: e.target.value })} />
            <input className="ed-input small" placeholder="A" value={row.answer} onChange={(e) => patch({ answer: e.target.value })} />
          </div>
        )} />
    </>
  ),
};

// ---------- L1, L2, L4: a recording + choice / true-false / matching ----------
// The items use the shape of the matching task block (questions / statements / pairs) and its answer keys, so the
// player, the teacher's check and the answer key treat them the same way.
export const LISTEN_MODES = { choice, truefalse, match };
const listenInner = (data) => LISTEN_MODES[data?.mode] || choice;
export const examlisten = {
  type: 'examlisten', label: 'Kuulamine (eksam): valik, õige/vale, seosta', group: 'Tekst ja heli', icon: 'Headphones', task: true, width: 'full', tone: 'sky',
  create: () => ({
    title: 'Kuula raadiouudist.', instruction: 'Kuulad teksti kaks korda. Vali õige vastus.', mode: 'choice', plays: 2, audio: null,
    transcript: 'Tartus avatakse laupäeval uus linnaraamatukogu. Raamatukogu on avatud iga päev kella kümnest kuueni.',
    questions: [
      { q: 'Mis avatakse laupäeval?', options: '*raamatukogu\nmuuseum\nujula' },
      { q: 'Mis kellani on raamatukogu avatud?', options: '*kuueni\nkümneni\nkaheksani' },
    ],
    statements: [], pairs: [],
  }),
  View: ({ data, ctx, id }) => {
    const Inner = listenInner(data).View;
    const plays = Number(data.plays) || 2;
    return (
      <div className="ws-examlisten">
        {data.audio?.src ? <AudioBar audio={data.audio} interactive={ctx.interactive || ctx.review} label="Kuula" />
          : <div className="ws-hint ws-listen-note">Kuulad teksti {plays === 1 ? 'üks kord' : `${plays} korda`}{ctx.interactive ? ' — õpetaja mängib salvestuse või loeb teksti ette.' : '.'}</div>}
        <Inner data={data} ctx={ctx} id={id} />
      </div>
    );
  },
  answers: (data) => listenInner(data).answers(data),
  score: (data, get, block) => listenInner(data).score(data, get, block),
  example: (data) => listenInner(data).example?.(data) || {},
  Editor: ({ data, set }) => {
    const Inner = listenInner(data).Editor;
    return (
      <>
        <Select label="Ülesande vorm" value={data.mode || 'choice'} onChange={(mode) => set({ mode })} options={[['choice', 'Valikvastused (Harno kuulamine 1–2)'], ['truefalse', 'Õige / vale (kuulamine 4)'], ['match', 'Seosta (kõneleja ↔ väide)']]} />
        <Num label="Mitu korda kuulatakse" value={data.plays} max={3} onChange={(plays) => set({ plays })} />
        <AudioPick value={data.audio} onChange={(audio) => set({ audio })} />
        <Area label="Transkriptsioon õpetajale (õpilane ei näe)" rows={4} value={data.transcript} onChange={(transcript) => set({ transcript })} />
        <Inner data={data} set={set} />
      </>
    );
  },
};

// ---------- W1, W2: the Harno writing task card ----------
export const WRITING_GENRES = {
  kusimustik: 'Küsimustik', teade: 'Teade / sõnum', kutse: 'Kutse või kaart', kiri: 'Isiklik kiri', jutt: 'Jutt etteantud pealkirjaga', vastus: 'Vastus kirjale',
};
const target = (data) => `${data.minWords}–${data.maxWords} sõna`;
export const examwriting = {
  type: 'examwriting', label: 'Kirjutamisülesanne (eksam)', group: 'Kõne ja kirjutamine', icon: 'FilePenLine', task: true, width: 'full', tone: 'cream',
  create: () => ({
    title: 'Kirjuta teade.', instruction: 'Kirjuta umbes 50 sõna. Kirjuta kõigist neljast punktist.', genre: 'teade',
    situation: 'Sa ei saa homme töökaaslasega kokku leppitud ajal kohtuda.',
    points: 'miks sa ei saa tulla\nmillal sa saad\nkus te võiksite kohtuda\nmida sa kaasa võtad',
    questions: '', opening: 'Tere, Kati!', closing: '', minWords: 40, maxWords: 60, lines: 8,
  }),
  View: ({ data, ctx }) => {
    const questions = lines(data.questions);
    const points = lines(data.points);
    const text = ctx.get('text') || '';
    const n = wordCount(text);
    const inRange = n >= Number(data.minWords || 0) && n <= Number(data.maxWords || Infinity);
    return (
      <div className="ws-examwrite">
        <div className="ws-taskcard">
          <span className="ws-taskcard-kind">{WRITING_GENRES[data.genre] || 'Kirjutamine'}{questions.length ? '' : ` · ${target(data)}`}</span>
          {data.situation ? <p><Md text={data.situation} /></p> : null}
          {points.length ? <ul className="ws-bullets">{points.map((p, i) => <li key={i}><Md text={p} /></li>)}</ul> : null}
        </div>
        {questions.length ? (
          <ol className="ws-rq ws-questionnaire" start={(ctx.start || 0) + 1}>
            {questions.map((q, i) => (
              <li key={i}><div className="ws-q"><Md text={q} /></div>
                <Line interactive={ctx.interactive} value={ctx.get(`q${i}`)} onChange={(v) => ctx.set(`q${i}`, v)} state={ctx.state(`q${i}`)} width="100%" label={`Vastus ${i + 1}`} />
              </li>
            ))}
          </ol>
        ) : (
          <div className="ws-guidedletter">
            {data.opening ? <p>{data.opening}</p> : null}
            <textarea className="ws-ruled" readOnly={!ctx.interactive} tabIndex={ctx.interactive ? 0 : -1} rows={Number(data.lines) || 10} value={text} onChange={(e) => ctx.set('text', e.target.value)} aria-label="Sinu tekst" />
            {data.closing ? <p>{data.closing}</p> : null}
            {ctx.interactive || ctx.review ? <span className={`ws-pill ${inRange ? 'ok' : 'warn'}`}>{n} sõna · eesmärk {target(data)}</span> : <small>Sõnu: ______ (eesmärk {target(data)})</small>}
          </div>
        )}
      </div>
    );
  },
  answerKeys: (data) => (lines(data.questions).length ? lines(data.questions).map((_, i) => `q${i}`) : ['text']),
  Editor: ({ data, set }) => (
    <>
      <Select label="Žanr" value={data.genre} onChange={(genre) => set({ genre })} options={Object.entries(WRITING_GENRES)} />
      <Area label="Olukord" value={data.situation} onChange={(situation) => set({ situation })} />
      <Area label="Sisupunktid (iga rida eraldi)" rows={5} value={data.points} onChange={(points) => set({ points })} />
      <Area label="Küsimustiku küsimused (ainult küsimustikul)" rows={5} value={data.questions} onChange={(questions) => set({ questions })} />
      <Text label="Algus" value={data.opening} onChange={(opening) => set({ opening })} />
      <Text label="Lõpetus" value={data.closing} onChange={(closing) => set({ closing })} />
      <div className="ed-row"><Num label="Min sõnu" value={data.minWords} max={400} onChange={(minWords) => set({ minWords })} /><Num label="Max sõnu" value={data.maxWords} max={400} onChange={(maxWords) => set({ maxWords })} /></div>
      <Num label="Kirjutamisridu" value={data.lines} max={30} onChange={(value) => set({ lines: value })} />
    </>
  ),
};

// ---------- S1b, S2: idea card and the phone role play's cards ----------
export const speakcard = {
  type: 'speakcard', label: 'Rääkimiskaart (eksam): kokkulepe, telefonikõne', group: 'Kõne ja kirjutamine', icon: 'Phone', task: true, width: 'full', tone: 'green',
  create: () => ({
    title: 'Leppige kokku.', instruction: 'Arutage paarilisega ja leppige kokku üks lahendus.', mode: 'agreement',
    situation: 'Teie sõber kolib uude korterisse. Te tahate talle koos kingituse osta.',
    ideas: [{ text: 'taim', img: null }, { text: 'raamat', img: null }, { text: 'kinkekaart', img: null }, { text: 'lamp', img: null }],
    outcome: 'Mida te ostate ja miks?',
    cardA: { label: 'Küsimuste kaart', role: 'Sa helistad spordiklubisse.', items: 'Kas on vaba aega?\nKui palju maksab?\nKus see asub?' },
    cardB: { label: 'Vastuste kaart', role: 'Sa töötad spordiklubis.', items: 'Vabad ajad: E ja K kell 18\nHind: 10 eurot kord\nAadress: Pikk 5' },
    minSec: 180, maxSec: 300,
  }),
  View: ({ data, ctx }) => (
    <div className={`ws-speakcard is-${data.mode === 'phone' ? 'phone' : 'agreement'}`}>
      {data.situation ? <p className="ws-speakcard-sit"><Md text={data.situation} /></p> : null}
      {data.mode === 'phone' ? (
        <div className="ws-rolecards">
          {[data.cardA, data.cardB].map((card, k) => (
            <section key={k}><b>{card?.label || (k ? 'Vastuste kaart' : 'Küsimuste kaart')}</b><p><Md text={card?.role} /></p>
              <ol>{lines(card?.items).map((x, i) => <li key={i}><Md text={x} /></li>)}</ol>
            </section>
          ))}
        </div>
      ) : (
        <>
          <div className="ws-ideas">{(data.ideas || []).map((idea, i) => (
            <figure key={i} className="ws-idea">{idea.img?.src ? <Photo img={idea.img} aspect="4:3" alt={idea.text} /> : null}<figcaption><Md text={idea.text} /></figcaption></figure>
          ))}</div>
          {data.outcome ? <p className="ws-speakcard-goal"><b>Kokkulepe:</b> <Md text={data.outcome} /></p> : null}
        </>
      )}
      {ctx.interactive ? <Recorder ctx={ctx} target={[Number(data.minSec) || 180, Number(data.maxSec) || 300]} /> : null}
      {ctx.review ? (ctx.get('audioUrl') ? <div className="ws-rec"><audio controls src={ctx.get('audioUrl')} /><span className="ws-pill">{ctx.get('seconds') || 0} s</span></div> : <div className="ws-hint">Salvestus puudub.</div>) : null}
    </div>
  ),
  evidence: (data, get) => ({ recorded: !!get('audioUrl'), seconds: get('seconds') || 0 }),
  Editor: ({ data, set }) => (
    <>
      <Select label="Kaart" value={data.mode} onChange={(mode) => set({ mode })} options={[['agreement', 'Kokkulepe ideekaardiga (rääkimine 1)'], ['phone', 'Telefonikõne: küsimuste ja vastuste kaart (rääkimine 2)']]} />
      <Area label="Olukord" value={data.situation} onChange={(situation) => set({ situation })} />
      {data.mode === 'phone' ? (
        <>
          <Text label="Kaart A: roll" value={data.cardA?.role} onChange={(role) => set({ cardA: { ...data.cardA, role } })} />
          <Area label="Kaart A: mida küsida (iga rida eraldi)" value={data.cardA?.items} onChange={(items) => set({ cardA: { ...data.cardA, items } })} />
          <Text label="Kaart B: roll" value={data.cardB?.role} onChange={(role) => set({ cardB: { ...data.cardB, role } })} />
          <Area label="Kaart B: info vastamiseks (iga rida eraldi)" value={data.cardB?.items} onChange={(items) => set({ cardB: { ...data.cardB, items } })} />
        </>
      ) : (
        <>
          <Rows label="Ideed (pilt valikuline)" rows={data.ideas || []} onChange={(ideas) => set({ ideas })} make={() => ({ text: '', img: null })} addLabel="Lisa idee" max={8}
            render={(row, patch) => <><Text label="Idee" value={row.text} onChange={(text) => patch({ text })} /><ImagePick label="" value={row.img} aspect="4:3" onChange={(img) => patch({ img })} allowAspect={false} /></>} />
          <Text label="Milles kokku leppida" value={data.outcome} onChange={(outcome) => set({ outcome })} />
        </>
      )}
      <div className="ed-row"><Num label="Min sekundit" value={data.minSec} max={900} onChange={(minSec) => set({ minSec })} /><Num label="Max sekundit" value={data.maxSec} max={900} onChange={(maxSec) => set({ maxSec })} /></div>
    </>
  ),
};

// ---------- the exam-scale rubrics (§2.4): W1 /8, W2 /12, speaking /20 ----------
// Harno does not publish its internal per-criterion split for B1; these criteria are our inference (documented in
// COURSE_FINAL_SHAPE_B1.md §2.4) and keep a module exam on the same raw scale as the real exam.
export const PASS_SHARE = 0.8; // owner 2026-10-26: the course certificate needs ≥ 80 % in every exam part
export const RUBRIC_SCALES = {
  W1: { label: 'Kirjutamine, 1. ülesanne', criteria: [
    { name: 'Sisupunkt 1 on kirjas', max: 1 }, { name: 'Sisupunkt 2 on kirjas', max: 1 }, { name: 'Sisupunkt 3 on kirjas', max: 1 }, { name: 'Sisupunkt 4 on kirjas', max: 1 },
    { name: 'Keel ja vorm', max: 4, hint: 'pöördumine ja lõpetus sobivad adressaadile; vead ei sega mõistmist; pikkus ±20 %' },
  ] },
  W2: { label: 'Kirjutamine, 2. ülesanne', criteria: [
    { name: 'Ülesande täitmine ja sisu', max: 3, hint: 'kõik punktid, teemas, sõnum on arusaadav' },
    { name: 'Ülesehitus ja sidusus', max: 3, hint: 'algus ja lõpp, lõigud, sidesõnad (sest, kuna, et, siis, pärast seda)' },
    { name: 'Sõnavara', max: 3, hint: 'piisav ja täpne, vähe kordusi' },
    { name: 'Grammatika ja õigekiri', max: 3, hint: 'vead ei sega mõistmist' },
  ] },
  S: { label: 'Rääkimine', criteria: [
    { name: 'Ülesande täitmine ja suhtlus', max: 5, hint: 'vastused on arendatud, kokkulepe on tehtud, kaardi info on küsitud ja antud' },
    { name: 'Sujuvus ja sidusus', max: 5, hint: 'räägib pausideta, mõtted on seotud' },
    { name: 'Sõnavara', max: 5, hint: 'sõnad sobivad teemaga ja olukorraga' },
    { name: 'Grammatika ja hääldus', max: 5, hint: 'vead ei sega mõistmist, hääldus on arusaadav' },
  ] },
};
export const rubricTotal = (criteria = []) => criteria.reduce((n, c) => n + (Number(c.max) || 0), 0);
export const examrubric = {
  type: 'examrubric', label: 'Hindamisjuhend (eksami skaala)', group: 'Kõne ja kirjutamine', icon: 'ClipboardCheck', task: true, width: 'full', tone: 'white',
  create: () => ({ title: 'Hindamine.', instruction: 'Märgi iga kriteeriumi punktid.', scale: 'W2', criteria: RUBRIC_SCALES.W2.criteria }),
  View: ({ data, ctx }) => {
    const criteria = data.criteria || [];
    const total = rubricTotal(criteria);
    const got = criteria.reduce((n, _, i) => n + (Number(ctx.get(`${i}`)) || 0), 0);
    const anyGiven = criteria.some((_, i) => ctx.get(`${i}`) !== undefined && ctx.get(`${i}`) !== '');
    return (
      <div className="ws-examrubric">
        <table>
          <tbody>
            {criteria.map((c, i) => (
              <tr key={i}>
                <th scope="row"><b>{c.name}</b>{c.hint ? <small>{c.hint}</small> : null}</th>
                <td>{Array.from({ length: (Number(c.max) || 0) + 1 }, (_, p) => {
                  const on = ctx.get(`${i}`) === p;
                  return ctx.interactive
                    ? <button type="button" key={p} className={`ws-pt ${on ? 'on' : ''}`} aria-label={`${c.name}: ${p} punkti`} aria-pressed={on} onClick={() => ctx.set(`${i}`, p)}>{p}</button>
                    : <span key={p} className={`ws-pt ${on ? 'on' : ''}`}>{p}</span>;
                })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="ws-examrubric-total">Kokku: <b>{anyGiven ? got : '___'}</b> / {total} punkti · eesmärk vähemalt {Math.ceil(total * PASS_SHARE)} ({Math.round(PASS_SHARE * 100)} %)</p>
      </div>
    );
  },
  answerKeys: (data) => (data.criteria || []).map((_, i) => `${i}`),
  Editor: ({ data, set }) => (
    <>
      <Select label="Skaala" value={data.scale} onChange={(scale) => set({ scale, ...(RUBRIC_SCALES[scale] ? { criteria: RUBRIC_SCALES[scale].criteria } : {}) })} options={[['W1', 'Kirjutamine 1 (8 p)'], ['W2', 'Kirjutamine 2 (12 p)'], ['S', 'Rääkimine (20 p)'], ['custom', 'Oma kriteeriumid']]} />
      <Rows label="Kriteeriumid" rows={data.criteria || []} onChange={(criteria) => set({ criteria, scale: 'custom' })} make={() => ({ name: '', max: 3, hint: '' })} addLabel="Lisa kriteerium" max={8}
        render={(row, patch) => <><Text label="Kriteerium" value={row.name} onChange={(name) => patch({ name })} /><Text label="Selgitus" value={row.hint} onChange={(hint) => patch({ hint })} /><Num label="Max punkte" value={row.max} max={10} onChange={(max) => patch({ max })} /></>} />
    </>
  ),
};

// ---------- the header of an exam part: time, tasks, points, the 80 % target ----------
export const EXAM_PARTS = {
  W: { part: 'Kirjutamine', minutes: 35, points: 20, tasks: 2 },
  L: { part: 'Kuulamine', minutes: 35, points: 30, tasks: 4 },
  R: { part: 'Lugemine', minutes: 50, points: 33, tasks: 4 },
  S: { part: 'Rääkimine', minutes: 15, points: 20, tasks: 3 },
};
function PartTimer({ minutes }) {
  const [left, setLeft] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const start = () => {
    const end = Date.now() + minutes * 60000;
    clearInterval(timer.current);
    setLeft(minutes * 60);
    timer.current = setInterval(() => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(s);
      if (!s) clearInterval(timer.current);
    }, 500);
  };
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  return left === null
    ? <button type="button" className="ws-recbtn" onClick={start}>Alusta aega</button>
    : <span className={`ws-pill ${left ? '' : 'warn'}`} role="timer">{left ? `Aega jäänud ${fmt(left)}` : 'Aeg on läbi'}</span>;
}
export const exampart = {
  type: 'exampart', label: 'Eksami osa (aeg ja punktid)', group: 'Kujundus', icon: 'Timer', task: false, width: 'full', tone: 'sky',
  create: () => ({ skill: 'R', ...EXAM_PARTS.R, target: 80, note: 'Loe kõik ülesanded läbi ja vasta igale küsimusele.' }),
  View: ({ data, ctx }) => {
    const points = Number(data.points) || 0;
    const target = Number(data.target) || 0;
    return (
      <div className="ws-exampart">
        <h4>{data.part}</h4>
        <div className="ws-exampart-facts">
          <span><b>{data.minutes}</b> min</span>
          {data.tasks ? <span><b>{data.tasks}</b> ülesannet</span> : null}
          {points ? <span><b>{points}</b> punkti</span> : null}
          {points && target ? <span>eesmärk vähemalt <b>{Math.ceil((points * target) / 100)}</b> p ({target} %)</span> : null}
        </div>
        {data.note ? <p><Md text={data.note} /></p> : null}
        {ctx.interactive ? <PartTimer minutes={Number(data.minutes) || 0} /> : <p className="ws-exampart-time">Algus: ______ Lõpp: ______</p>}
      </div>
    );
  },
  Editor: ({ data, set }) => (
    <>
      <Select label="Osa" value={data.skill} onChange={(skill) => set({ skill, ...EXAM_PARTS[skill] })} options={Object.entries(EXAM_PARTS).map(([k, v]) => [k, v.part])} />
      <div className="ed-row"><Num label="Minutid" value={data.minutes} max={120} onChange={(minutes) => set({ minutes })} /><Num label="Ülesandeid" value={data.tasks} max={10} onChange={(tasks) => set({ tasks })} /><Num label="Punkte" value={data.points} max={100} onChange={(points) => set({ points })} /></div>
      <Num label="Eesmärk %" value={data.target} min={0} max={100} onChange={(value) => set({ target: value })} />
      <Area label="Märkus" value={data.note} onChange={(note) => set({ note })} />
    </>
  ),
};

export const harnoBlocks = { adsmatch, examlisten, examwriting, speakcard, examrubric, exampart };
