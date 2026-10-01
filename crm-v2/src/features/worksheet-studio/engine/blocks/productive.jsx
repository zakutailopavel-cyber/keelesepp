/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
/* global clearInterval, setInterval, MediaRecorder, Blob */
import { useEffect, useRef, useState } from 'react';
import { Photo, Speech, Check, Md } from '../ui.jsx';
import { norm, splitList } from '../schema.js';
import { Text, Area, Num, ImagePick } from '../../editor/fields.jsx';

// Speaking, writing and self-assessment: open tasks. The system measures what it can (duration,
// sentence count, required words) and leaves the judgement to the teacher.

function Recorder({ ctx, target }) {
  const [rec, setRec] = useState(null);
  const [secs, setSecs] = useState(0);
  const timer = useRef(null);
  const url = ctx.get('audioUrl');
  useEffect(() => () => clearInterval(timer.current), []);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const chunks = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timer.current);
        ctx.set('audioUrl', URL.createObjectURL(new Blob(chunks, { type: r.mimeType })));
        ctx.set('seconds', Math.round((Date.now() - r.startedAt) / 1000));
        setRec(null);
      };
      r.startedAt = Date.now();
      r.start();
      setRec(r);
      setSecs(0);
      timer.current = setInterval(() => setSecs(Math.round((Date.now() - r.startedAt) / 1000)), 250);
    } catch {
      ctx.set('error', 'Mikrofon pole lubatud');
    }
  };
  const shown = rec ? secs : ctx.get('seconds') || 0;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const inRange = shown >= target[0] && shown <= target[1];
  return (
    <div className="ws-rec">
      <button type="button" className={`ws-recbtn ${rec ? 'on' : ''}`} onClick={() => (rec ? rec.stop() : start())}>{rec ? '■ Lõpeta' : url ? '● Salvesta uuesti' : '● Salvesta'}</button>
      <span className={`ws-pill ${inRange ? 'ok' : ''}`}>{fmt(shown)} / eesmärk {fmt(target[0])}–{fmt(target[1])}</span>
      {url && !rec && <audio controls src={url} />}
      {ctx.get('error') && <span className="ws-pill warn">{ctx.get('error')}</span>}
    </div>
  );
}

export const speaking = {
  type: 'speaking', label: 'Räägi (häälsalvestus)', group: 'Kõne ja kirjutamine', icon: 'Mic', task: true, width: 'half', tone: 'green',
  create: () => ({ title: 'Räägi.', instruction: 'Vasta küsimustele. Räägi 1–2 minutit.', questions: 'Mis kell sa ärkad?\nMida sa teed hommikul?', img: null, aspect: '4:3', bubble: '', tipTitle: '', tipText: '', minSec: 60, maxSec: 120 }),
  View: ({ data, ctx }) => (
    <div className={`ws-speak ${data.img?.src ? 'has-img' : ''}`}>
      <div>
        <ul className="ws-bullets">{String(data.questions || '').split('\n').filter(Boolean).map((q, i) => <li key={i}><Md text={q} /></li>)}</ul>
        {data.tipTitle && <div className="ws-tip"><Speech /><div><b>{data.tipTitle}</b><br />{data.tipText}</div></div>}
        {ctx.interactive && <Recorder ctx={ctx} target={[Number(data.minSec) || 60, Number(data.maxSec) || 120]} />}
        {ctx.review && (ctx.get('audioUrl') ? <div className="ws-rec"><audio controls src={ctx.get('audioUrl')} /><span className="ws-pill">{ctx.get('seconds') || 0} s</span></div> : <div className="ws-hint">Salvestus puudub.</div>)}
      </div>
      {data.img?.src && <Photo img={data.img} aspect={data.aspect} alt="">{data.bubble && <div className="ws-bubble">{data.bubble}</div>}</Photo>}
    </div>
  ),
  score: null,
  evidence: (data, get) => ({ recorded: !!get('audioUrl'), seconds: get('seconds') || 0 }),
  Editor: ({ data, set }) => (
    <>
      <Area label="Küsimused (iga rida eraldi)" rows={6} value={data.questions} onChange={(v) => set({ questions: v })} />
      <ImagePick value={data.img} aspect={data.aspect} onChange={(img) => set({ img })} onAspect={(aspect) => set({ aspect })} />
      <Text label="Jutumull pildil" value={data.bubble} onChange={(v) => set({ bubble: v })} />
      <Text label="Vihje pealkiri" value={data.tipTitle} onChange={(v) => set({ tipTitle: v })} />
      <Text label="Vihje tekst" value={data.tipText} onChange={(v) => set({ tipText: v })} />
      <div className="ed-row"><Num label="Min sekundit" value={data.minSec} max={600} onChange={(v) => set({ minSec: v })} /><Num label="Max sekundit" value={data.maxSec} max={900} onChange={(v) => set({ maxSec: v })} /></div>
    </>
  ),
};

const countWriting = (text, data) => {
  const sentences = String(text || '').split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 2).length;
  const low = ` ${norm(text)} `;
  const words = splitList(data.keywords);
  const used = words.filter((w) => low.includes(` ${norm(w)} `));
  return { sentences, used };
};

export const writing = {
  type: 'writing', label: 'Kirjuta (tekst)', group: 'Kõne ja kirjutamine', icon: 'PenLine', task: true, width: 'half', tone: 'cream',
  answerKeys: () => ['text'],
  create: () => ({ title: 'Kirjuta.', instruction: 'Kirjuta lühike tekst (6–8 lauset).', lines: 7, minSent: 6, maxSent: 8, keywords: 'hommikul, päeval, õhtul, tavaliselt, enne, pärast', minKeywords: 5, img: null }),
  View: ({ data, ctx }) => {
    const text = ctx.get('text') || '';
    const c = countWriting(text, data);
    const lines = Number(data.lines) || 7;
    return (
      <div className="ws-write">
        <textarea className="ws-ruled" style={{ minHeight: `calc(7.4mm * ${lines})` }} readOnly={!ctx.interactive} tabIndex={ctx.interactive ? 0 : -1} value={text}
          onChange={(e) => ctx.set('text', e.target.value)} aria-label="Kirjutamise väli" spellCheck={false} />
        {data.img?.src && <img className="ws-note-img" src={data.img.src} alt="" />}
        {(ctx.interactive || ctx.review) && (
          <div className="ws-counters">
            <span className={`ws-pill ${c.sentences >= data.minSent && c.sentences <= data.maxSent ? 'ok' : 'warn'}`}>Lauseid: {c.sentences} / {data.minSent}–{data.maxSent}</span>
            {splitList(data.keywords).length > 0 && <span className={`ws-pill ${c.used.length >= data.minKeywords ? 'ok' : 'warn'}`}>Märksõnu: {c.used.length} / {data.minKeywords}{c.used.length ? ` (${c.used.join(', ')})` : ''}</span>}
          </div>
        )}
      </div>
    );
  },
  score: (data, get) => {
    const c = countWriting(get('text'), data);
    return [
      { key: 'sentences', ok: c.sentences >= data.minSent && c.sentences <= data.maxSent },
      ...(splitList(data.keywords).length ? [{ key: 'keywords', ok: c.used.length >= data.minKeywords }] : []),
    ];
  },
  Editor: ({ data, set }) => (
    <>
      <Num label="Ridu lehel" value={data.lines} max={20} onChange={(v) => set({ lines: v })} />
      <div className="ed-row"><Num label="Min lauseid" value={data.minSent} max={40} onChange={(v) => set({ minSent: v })} /><Num label="Max lauseid" value={data.maxSent} max={60} onChange={(v) => set({ maxSent: v })} /></div>
      <Area label="Märksõnad, mida kasutada" value={data.keywords} onChange={(v) => set({ keywords: v })} hint="Komaga. Õpilane näeb, mitu ta kasutas." />
      <Num label="Min märksõnu" value={data.minKeywords} min={0} max={20} onChange={(v) => set({ minKeywords: v })} />
      <ImagePick label="Kaunistav pilt (valikuline)" value={data.img} aspect="4:3" onChange={(img) => set({ img })} allowAspect={false} />
    </>
  ),
};

export const selfcheck = {
  type: 'selfcheck', label: 'Kontrolli end', group: 'Kõne ja kirjutamine', icon: 'SquareCheckBig', task: true, width: 'full', tone: 'sky',
  create: () => ({ title: 'Kontrolli end.', titleMore: 'Kas ma oskan?', instruction: '', items: 'Ma oskan küsida ja öelda kellaaega.\nMa oskan rääkida oma päevast.', stamp: 'Ma teen edusamme!' }),
  View: ({ data, ctx }) => (
    <div className="ws-self">
      <div className="ws-self-items">
        {String(data.items || '').split('\n').filter(Boolean).map((it, i) => (
          <label key={i}><input type="checkbox" disabled={!ctx.interactive} checked={!!ctx.get(`${i}`)} onChange={(e) => ctx.set(`${i}`, e.target.checked)} /><span><Md text={it} /></span></label>
        ))}
      </div>
      {data.stamp && <div className="ws-stamp"><Check /><span>{data.stamp}</span></div>}
    </div>
  ),
  score: null,
  Editor: ({ data, set }) => (
    <>
      <Area label="Väited (iga rida eraldi)" rows={5} value={data.items} onChange={(v) => set({ items: v })} />
      <Text label="Tempel" value={data.stamp} onChange={(v) => set({ stamp: v })} />
    </>
  ),
};

export const productiveBlocks = { speaking, writing, selfcheck };
