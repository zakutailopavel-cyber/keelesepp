/* eslint-disable react-refresh/only-export-components -- block definitions are plain objects that carry View/Editor components */
import { useRef, useState } from 'react';
import { PlayCircle } from 'lucide-react';
import { Line, Md } from '../ui.jsx';
import { useAssets } from '../assets.jsx';
import { Text, Area } from '../../editor/fields.jsx';
import { reading } from './extra.jsx';
import { MAX_VIDEO_BYTES, clipLabel, embedUrl, fileUrl, videoSource, watchUrl } from '../video.js';
import { qrMatrix, qrPath } from '../qr.js';

// „Video”: a YouTube / Vimeo link or an uploaded video file, an optional part (start–end), a caption and optional
// questions under it (the reading block's format: „Küsimus? [vastus|vastus]”, scored the same way). On screen
// (student, live lesson) the player; in the builder and on paper a QR code of the link with the caption — a printed
// sheet cannot play a video.

const PROVIDER = { youtube: 'YouTube', vimeo: 'Vimeo', file: 'Videofail' };
const questionLines = (data) => String(data.questions || '').split('\n').filter((q) => q.trim());

export function VideoPlayer({ source, title = 'Video' }) {
  if (!source) return null;
  if (source.kind === 'file') {
    return <video className="ws-video-frame" controls preload="metadata" playsInline src={fileUrl(source)} aria-label={title} />;
  }
  // the site sends no referrer to other hosts (Referrer-Policy: same-origin); YouTube refuses an embed without one
  return (
    <iframe className="ws-video-frame" src={embedUrl(source)} title={title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin"
      allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
  );
}

export function QrCode({ text, size = '24mm', label = 'QR-kood' }) {
  let matrix = null;
  try { matrix = text ? qrMatrix(text) : null; } catch { matrix = null; }
  if (!matrix) return null;
  const n = matrix.length + 4;
  return (
    <svg className="ws-qr" viewBox={`0 0 ${n} ${n}`} style={{ width: size, height: size }} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={n} height={n} fill="#fff" />
      <path d={qrPath(matrix)} fill="#000" />
    </svg>
  );
}

// what paper shows: QR + where to watch + which part
function VideoPaper({ source, data, className = '' }) {
  const link = watchUrl(source);
  const clip = clipLabel(source);
  return (
    <div className={`ws-video-paper ${className}`}>
      {source ? <QrCode text={link} label="Video QR-kood" /> : <span className="ws-video-empty"><PlayCircle aria-hidden="true" /></span>}
      <div>
        <b><PlayCircle aria-hidden="true" /> {source ? `Vaata videot${clip ? ` (${clip})` : ''}` : 'Video puudub'}</b>
        {data.caption ? <span className="ws-video-caption"><Md text={data.caption} /></span> : null}
        {source && source.kind !== 'file' ? <small className="ws-video-link">{link.replace(/^https:\/\//, '')}</small> : null}
        {source?.kind === 'file' ? <small className="ws-video-link">Skaneeri QR-kood või vaata videot e-töölehel.</small> : null}
      </div>
    </div>
  );
}

export const video = {
  type: 'video', label: 'Video', group: 'Tekst ja heli', icon: 'Video', task: true, width: 'full', tone: 'sky',
  create: () => ({ title: 'Vaata videot.', instruction: 'Vaata videot ja vasta küsimustele.', url: '', file: null, start: '', end: '', caption: '', questions: '' }),
  View: ({ data, ctx }) => {
    const source = videoSource(data);
    const screen = ctx.interactive || ctx.review;
    const questions = questionLines(data);
    return (
      <div className="ws-video">
        {screen && source ? (
          <figure className="ws-video-screen">
            <div className="ws-video-box"><VideoPlayer source={source} title={data.caption || data.title || 'Video'} /></div>
            {data.caption || clipLabel(source) ? <figcaption>{data.caption ? <Md text={data.caption} /> : null}{clipLabel(source) ? <span className="ws-video-clip"> · {clipLabel(source)}</span> : null}</figcaption> : null}
          </figure>
        ) : null}
        <VideoPaper source={source} data={data} className={screen && source ? 'is-print-only' : ''} />
        {questions.length ? (
          <ol className="ws-rq" start={(ctx.start || 0) + 1}>
            {questions.map((q, i) => {
              const m = q.match(/^(.*?)\s*\[([^\]]*)\]\s*$/);
              return (
                <li key={i}><div className="ws-q" data-edit={`questions#${i}`}><Md text={m ? m[1] : q} /></div>
                  <Line interactive={ctx.interactive} value={ctx.get(`${i}`)} onChange={(v) => ctx.set(`${i}`, v)} state={ctx.state(`${i}`)} width="100%" label={`Vastus ${i + 1}`} />
                </li>
              );
            })}
          </ol>
        ) : null}
      </div>
    );
  },
  // the questions work exactly like the reading block's (same format, same lenient scoring)
  answers: (data) => reading.answers(data),
  score: (data, get) => reading.score(data, get),
  Editor: ({ data, set }) => <VideoEditor data={data} set={set} />,
};

function VideoEditor({ data, set }) {
  const source = videoSource(data);
  const linkOk = !data.url || source?.kind === 'youtube' || source?.kind === 'vimeo' || data.file?.src;
  return (
    <>
      <Text label="Video link (YouTube või Vimeo)" value={data.url} onChange={(v) => set({ url: v.trim() })} placeholder="https://youtu.be/…" />
      {!linkOk ? <span className="ed-hint ed-err" role="alert">Seda linki ei tunne. Kopeeri link YouTube'i või Vimeo aadressiribalt.</span> : null}
      <VideoFilePick value={data.file} onChange={(file) => set({ file })} />
      <div className="ed-row">
        <Text label="Algus (nt 1:30)" value={data.start} onChange={(v) => set({ start: v })} placeholder="0:00" />
        <Text label="Lõpp (valikuline)" value={data.end} onChange={(v) => set({ end: v })} placeholder="2:15" />
      </div>
      {source ? <div className="ed-video-preview"><span className="ed-hint">{PROVIDER[source.kind]}{clipLabel(source) ? ` · ${clipLabel(source)}` : ''}</span><VideoPlayer source={source} title="Eelvaade" /></div> : null}
      <Text label="Allkiri (valikuline)" value={data.caption} onChange={(v) => set({ caption: v })} placeholder="Intervjuu Tallinna turul" />
      <Area label="Küsimused video kohta (valikuline, iga rida eraldi)" rows={4} value={data.questions} onChange={(v) => set({ questions: v })} hint="Õige vastus rea lõpus nurksulgudes: Kus nad on? [turul]. Ilma sulgudeta küsimust hindab õpetaja." />
      <span className="ed-hint">Paberil on video asemel QR-kood ja link. YouTube'i video mängib privaatsusrežiimis (youtube-nocookie.com).</span>
    </>
  );
}

function VideoFilePick({ value, onChange }) {
  const input = useRef(null);
  const assets = useAssets();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (file) => {
    if (!file) return;
    setErr('');
    if (!String(file.type || '').startsWith('video/')) { setErr('Vali videofail (mp4, webm, mov).'); return; }
    if (file.size > MAX_VIDEO_BYTES) { setErr('Videofail on liiga suur (kuni 19 MB). Lae pikem video YouTube\'i ja lisa link.'); return; }
    if (typeof assets.video !== 'function') { setErr('Siin ei saa videot üles laadida. Lisa link.'); return; }
    setBusy(true);
    try {
      onChange(await assets.video(file));
    } catch (error) {
      setErr(error?.message || 'Video üleslaadimine ebaõnnestus.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="ed-field">
      <span className="ed-label">…või videofail (kuni 19 MB)</span>
      {value?.src ? <span className="ed-hint">{value.name || 'Videofail'}</span> : null}
      <div className="ed-row">
        <button type="button" className="ed-btn" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Laadin…' : value?.src ? 'Vaheta videofail' : 'Lisa videofail'}</button>
        {value?.src ? <button type="button" className="ed-btn ghost" onClick={() => onChange(null)}>Eemalda</button> : null}
      </div>
      {err ? <span className="ed-hint ed-err" role="alert">{err}</span> : null}
      <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime,video/*" hidden aria-label="Videofail" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
    </div>
  );
}
