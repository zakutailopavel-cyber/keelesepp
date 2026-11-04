import { Camera, CheckCircle2, Mic, MonitorUp, Volume2, Wifi, XCircle, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../app/AuthContext.jsx';
import { Button, Select } from '../../components/ui/index.js';
import { liveTurnService } from '../../services/firebase/liveTurn.js';
import { deviceCheckService } from '../../services/firebase/deviceCheck.js';
import { deviceCheckRecord, evaluateDeviceCheck, HEARD_RMS, recordKey, mediaErrorKind, meterPercent, readCapabilities, rmsFromBytes, STATUS_TEXT } from './deviceCheckModel.js';
import { gatherIce, pingFunctions, pingHosting, playTone, recordClip } from './deviceProbes.js';
import './deviceCheck.css';

// „Seadme kontroll” (/kontroll, no login needed): browser support, camera, microphone, speakers, network and screen
// sharing before the first lesson. Everything stays in this browser: no picture or sound is uploaded or stored, and
// every camera / microphone track is stopped when the page is left. For a signed-in student only the summary
// (status, issue codes, browser label) is saved on his own account (users/{uid}.deviceCheck) for the teacher's warning.

const DEVICES_KEY = 'keelesepp.liveDevices'; // the live room's remembered camera / microphone (useLiveCall.js)
const SILENT_AFTER_MS = 10000;
const CLIP_MS = 5000;

function rememberDevice(kind, id) {
  try {
    const value = JSON.parse(globalThis.localStorage?.getItem(DEVICES_KEY) || '{}') || {};
    globalThis.localStorage?.setItem(DEVICES_KEY, JSON.stringify({ ...value, [kind === 'audio' ? 'audioId' : 'videoId']: id }));
  } catch { /* private mode: the room just uses the default device */ }
}

const stopStream = (stream) => { stream?.getTracks?.().forEach((track) => { try { track.stop(); } catch { /* ended */ } }); };

const Ru = ({ children }) => <span className="dc-ru" lang="ru">{children}</span>;

function Row({ ok, warn, label, children }) {
  const Icon = ok === true ? CheckCircle2 : ok === false ? (warn ? AlertTriangle : XCircle) : Info;
  const tone = ok === true ? 'ok' : ok === false ? (warn ? 'warn' : 'bad') : 'info';
  return <li className={`dc-row dc-row--${tone}`}><Icon size={17} aria-hidden="true" /><span><b>{label}</b>{children ? <small>{children}</small> : null}</span></li>;
}

const MEDIA_TEXT = { ok: 'Töötab', denied: 'Keelatud', busy: 'Kasutusel teise rakenduse poolt', notfound: 'Ei leitud', error: 'Ei käivitunud', untested: 'Kontrollimata' };

export default function DeviceCheckPage({
  env = globalThis,
  mediaDevices = globalThis.navigator?.mediaDevices,
  turnService = liveTurnService,
  peerFactory,
  fetchImpl,
  role: roleProp,
  saveService = deviceCheckService,
}) {
  const auth = useContext(AuthContext);
  const user = auth?.user || null;
  // the result is saved for a signed-in student on his own account (not a guest from a lesson link, not a preview)
  const saveUid = !auth?.preview && user?.uid && user.roles?.includes('student') && !user.guest && user.profile && Object.keys(user.profile).length
    && (user.approvalStatus || 'approved') === 'approved' ? user.uid : '';
  const role = roleProp || (user?.roles?.some((item) => item === 'teacher' || item === 'admin') ? 'teacher' : 'student');
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('tund') || '';
  const [caps] = useState(() => readCapabilities(env));

  const [phase, setPhase] = useState('idle'); // idle | starting | ready
  const [camera, setCamera] = useState('untested');
  const [mic, setMic] = useState('untested');
  const [devices, setDevices] = useState({ video: [], audio: [] });
  const [chosen, setChosen] = useState({ videoId: '', audioId: '' });
  const [videoStream, setVideoStream] = useState(null);
  const [level, setLevel] = useState(0);
  const [micHeard, setMicHeard] = useState(null);
  const [clip, setClip] = useState({ state: 'idle', left: 0, url: '', error: '' });
  const [speakers, setSpeakers] = useState({ playing: false, played: false, heard: null });
  const [network, setNetwork] = useState(null);
  const [netBusy, setNetBusy] = useState(false);
  const [screenTest, setScreenTest] = useState('');

  const videoRef = useRef(null);
  const streams = useRef({ video: null, audio: null, screen: null });
  const audio = useRef({ ctx: null, source: null, analyser: null, raf: 0, listenFrom: 0, heard: false, lastPaint: 0 });
  const clipUrl = useRef('');
  const clipTimer = useRef(0);
  const alive = useRef(true);

  const stopMeter = () => {
    const a = audio.current;
    if (a.raf) globalThis.cancelAnimationFrame?.(a.raf);
    a.raf = 0;
    try { a.source?.disconnect(); } catch { /* gone */ }
    a.source = null;
    a.analyser = null;
  };
  const stopAll = () => {
    stopMeter();
    stopStream(streams.current.video);
    stopStream(streams.current.audio);
    stopStream(streams.current.screen);
    streams.current = { video: null, audio: null, screen: null };
    globalThis.clearInterval(clipTimer.current);
    try { audio.current.ctx?.close?.(); } catch { /* closed */ }
    audio.current.ctx = null;
    if (clipUrl.current) { try { globalThis.URL?.revokeObjectURL?.(clipUrl.current); } catch { /* fine */ } clipUrl.current = ''; }
  };

  // leaving the page (route change, tab closed, back to the lesson) releases the camera and the microphone
  useEffect(() => {
    alive.current = true;
    const onHide = () => stopAll();
    globalThis.addEventListener?.('pagehide', onHide);
    return () => { alive.current = false; globalThis.removeEventListener?.('pagehide', onHide); stopAll(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    try { element.srcObject = videoStream; } catch { /* old browser */ }
    if (videoStream) element.play?.()?.catch?.(() => {});
  }, [videoStream]);

  const context = () => {
    const a = audio.current;
    if (a.ctx) return a.ctx;
    const AudioCtx = env.AudioContext || env.webkitAudioContext;
    if (typeof AudioCtx !== 'function') return null;
    try { a.ctx = new AudioCtx(); } catch { a.ctx = null; }
    return a.ctx;
  };

  const listen = (stream) => {
    stopMeter();
    const ctx = context();
    const a = audio.current;
    a.heard = false;
    a.listenFrom = Date.now();
    setMicHeard(null);
    setLevel(0);
    if (!ctx || !stream?.getAudioTracks?.().length) return;
    try {
      ctx.resume?.()?.catch?.(() => {});
      a.source = ctx.createMediaStreamSource(stream);
      a.analyser = ctx.createAnalyser();
      a.analyser.fftSize = 1024;
      a.source.connect(a.analyser); // never to the destination: no echo
    } catch { return; }
    const buffer = new Uint8Array(a.analyser.fftSize);
    const tick = () => {
      if (!alive.current || !a.analyser) return;
      a.analyser.getByteTimeDomainData(buffer);
      const rms = rmsFromBytes(buffer);
      const time = Date.now();
      if (rms >= HEARD_RMS && !a.heard) { a.heard = true; setMicHeard(true); }
      if (!a.heard && time - a.listenFrom > SILENT_AFTER_MS && a.listenFrom) { a.listenFrom = 0; setMicHeard(false); }
      if (time - a.lastPaint > 90) { a.lastPaint = time; setLevel(meterPercent(rms)); }
      a.raf = globalThis.requestAnimationFrame ? globalThis.requestAnimationFrame(tick) : 0;
    };
    a.raf = globalThis.requestAnimationFrame ? globalThis.requestAnimationFrame(tick) : 0;
  };

  const refreshDevices = async () => {
    if (!mediaDevices?.enumerateDevices) return;
    try {
      const list = await mediaDevices.enumerateDevices();
      if (!alive.current) return;
      const named = (kind, word) => list.filter((item) => item.kind === kind).map((item, index) => ({ id: item.deviceId, label: item.label || `${word} ${index + 1}` }));
      setDevices({ video: named('videoinput', 'Kaamera'), audio: named('audioinput', 'Mikrofon') });
    } catch { /* the pickers just stay empty */ }
  };

  const open = async (constraints) => {
    try { return { stream: await mediaDevices.getUserMedia(constraints), kind: 'ok' }; } catch (error) { return { stream: null, kind: mediaErrorKind(error) }; }
  };

  const videoConstraints = (id) => ({ width: { ideal: 1280 }, height: { ideal: 720 }, ...(id ? { deviceId: { exact: id } } : { facingMode: 'user' }) });
  const audioConstraints = (id) => (id ? { deviceId: { exact: id } } : true);

  const applyStreams = (videoTracks, audioTracks) => {
    if (videoTracks) { stopStream(streams.current.video); streams.current.video = videoTracks.length ? new globalThis.MediaStream(videoTracks) : null; setVideoStream(streams.current.video); }
    if (audioTracks) { stopStream(streams.current.audio); streams.current.audio = audioTracks.length ? new globalThis.MediaStream(audioTracks) : null; listen(streams.current.audio); }
    const id = (stream) => stream?.getTracks?.()[0]?.getSettings?.().deviceId || '';
    setChosen((current) => ({ videoId: id(streams.current.video) || current.videoId, audioId: id(streams.current.audio) || current.audioId }));
  };

  const runNetwork = async () => {
    setNetBusy(true);
    const turn = lessonId && turnService?.iceServers ? turnService.iceServers(lessonId).catch(() => ({ iceServers: [] })) : Promise.resolve({ iceServers: [] });
    const [hosting, functions, ice] = await Promise.all([
      pingHosting(fetchImpl ? { fetchImpl } : {}),
      pingFunctions(turnService),
      caps.webrtc ? turn.then((result) => gatherIce({ turnServers: result?.iceServers || [], ...(peerFactory ? { peerFactory } : {}) })) : Promise.resolve({ stun: null, relay: 'untested', counts: null }),
    ]);
    if (!alive.current) return;
    setNetwork({ hostingOk: hosting.ok, hostingMs: hosting.ms, functionsOk: functions.ok, functionsMs: functions.ms, stun: ice.stun, relay: ice.relay, counts: ice.counts });
    setNetBusy(false);
  };

  const start = async () => {
    setPhase('starting');
    context(); // created inside the click: Safari allows sound only after a user gesture
    const netDone = runNetwork();
    if (mediaDevices?.getUserMedia) {
      const both = await open({ audio: audioConstraints(chosen.audioId), video: videoConstraints(chosen.videoId) });
      if (!alive.current) return;
      if (both.stream) {
        setCamera(both.stream.getVideoTracks().length ? 'ok' : 'notfound');
        setMic(both.stream.getAudioTracks().length ? 'ok' : 'notfound');
        applyStreams(both.stream.getVideoTracks(), both.stream.getAudioTracks());
      } else if (both.kind === 'denied') {
        setCamera('denied'); setMic('denied');
      } else {
        // find out which one fails: microphone alone, then camera alone
        const micOnly = await open({ audio: audioConstraints(chosen.audioId), video: false });
        const camOnly = await open({ audio: false, video: videoConstraints(chosen.videoId) });
        if (!alive.current) { stopStream(micOnly.stream); stopStream(camOnly.stream); return; }
        setMic(micOnly.kind); setCamera(camOnly.kind);
        applyStreams(camOnly.stream?.getVideoTracks() || [], micOnly.stream?.getAudioTracks() || []);
      }
      await refreshDevices();
    }
    if (!alive.current) return;
    setPhase('ready');
    await netDone;
  };

  const changeDevice = async (kind, id) => {
    setChosen((current) => ({ ...current, [kind === 'audio' ? 'audioId' : 'videoId']: id }));
    rememberDevice(kind, id);
    if (kind === 'audio') {
      stopStream(streams.current.audio);
      const result = await open({ audio: audioConstraints(id), video: false });
      if (!alive.current) { stopStream(result.stream); return; }
      setMic(result.kind);
      applyStreams(null, result.stream?.getAudioTracks() || []);
    } else {
      stopStream(streams.current.video);
      const result = await open({ audio: false, video: videoConstraints(id) });
      if (!alive.current) { stopStream(result.stream); return; }
      setCamera(result.kind);
      applyStreams(result.stream?.getVideoTracks() || [], null);
    }
  };

  const recordTest = async () => {
    const stream = streams.current.audio;
    if (!stream) return;
    if (clipUrl.current) { try { globalThis.URL?.revokeObjectURL?.(clipUrl.current); } catch { /* fine */ } clipUrl.current = ''; }
    const startedAt = Date.now();
    setClip({ state: 'recording', left: CLIP_MS / 1000, url: '', error: '' });
    globalThis.clearInterval(clipTimer.current);
    clipTimer.current = globalThis.setInterval(() => setClip((current) => (current.state === 'recording' ? { ...current, left: Math.max(0, Math.ceil((CLIP_MS - (Date.now() - startedAt)) / 1000)) } : current)), 250);
    try {
      const { blob } = await recordClip(stream, { ms: CLIP_MS, MediaRecorderImpl: env.MediaRecorder, mimeType: caps.recorderMime });
      globalThis.clearInterval(clipTimer.current);
      if (!alive.current) return;
      if (!blob.size) { setClip({ state: 'idle', left: 0, url: '', error: 'Salvestus jäi tühjaks. Proovi uuesti.' }); return; }
      clipUrl.current = globalThis.URL.createObjectURL(blob);
      setClip({ state: 'done', left: 0, url: clipUrl.current, error: '' });
    } catch {
      globalThis.clearInterval(clipTimer.current);
      if (alive.current) setClip({ state: 'idle', left: 0, url: '', error: 'Selles brauseris ei saa häält salvestada.' });
    }
  };

  const testSpeakers = async () => {
    const ctx = context();
    if (!ctx) { setSpeakers({ playing: false, played: true, heard: null }); return; }
    setSpeakers((current) => ({ ...current, playing: true }));
    try { await ctx.resume?.(); await playTone(ctx); } catch { /* the question below still decides */ }
    if (alive.current) setSpeakers((current) => ({ ...current, playing: false, played: true }));
  };

  const testScreen = async () => {
    try {
      const stream = await mediaDevices.getDisplayMedia({ video: true, audio: false });
      stopStream(stream); // only the permission and the picker are tested; nothing is shown or sent
      setScreenTest('ok');
    } catch (error) {
      setScreenTest(error?.name === 'NotAllowedError' ? 'cancelled' : 'error');
    }
  };

  const again = () => {
    stopAll();
    setVideoStream(null);
    setCamera('untested'); setMic('untested'); setMicHeard(null); setLevel(0);
    setClip({ state: 'idle', left: 0, url: '', error: '' });
    setSpeakers({ playing: false, played: false, heard: null });
    setNetwork(null); setScreenTest('');
    start();
  };

  const result = useMemo(() => evaluateDeviceCheck({ ...caps, camera, mic, micHeard, speakersHeard: speakers.heard, network, role }),
    [caps, camera, mic, micHeard, speakers.heard, network, role]);
  const { browser } = caps;
  const started = phase !== 'idle';
  // save the latest result once the check is complete (or already failed), and again only when it changes
  const [saved, setSaved] = useState('');
  const savedKey = useRef('');
  const record = useMemo(() => (saveUid && phase === 'ready' && network && (result.complete || result.status === 'red') ? deviceCheckRecord(result, caps.browser) : null),
    [saveUid, phase, network, result, caps.browser]);
  useEffect(() => {
    const key = recordKey(record);
    if (!record || key === savedKey.current) return;
    savedKey.current = key;
    Promise.resolve().then(() => saveService.save(saveUid, record))
      .then(() => { if (alive.current) setSaved('ok'); })
      .catch(() => { savedKey.current = ''; if (alive.current) setSaved('error'); });
  }, [record, saveService, saveUid]);

  const statusText = phase === 'starting' ? { title: 'Kontrollin…', ru: 'Проверяю…' }
    : result.status === 'green' && !result.complete ? { title: 'Seni on kõik korras', ru: 'Пока всё в порядке' }
      : STATUS_TEXT[result.status];

  return <div className="dc-page">
    <header className="dc-head">
      <span className="eyebrow">KeeleSepp</span>
      <h1>Seadme kontroll</h1>
      <p>Kontrolli enne tundi kaamerat, mikrofoni, heli ja internetti. Pilti ega heli ei salvestata ega saadeta kuhugi.<Ru>Проверка камеры, микрофона, звука и интернета перед уроком. Изображение и звук не записываются и никуда не отправляются.</Ru></p>
    </header>

    <section className={`dc-card dc-summary dc-summary--${started ? result.status : 'idle'}`} aria-label="Tulemus" aria-live="polite">
      {started ? <>
        <h2>{result.status === 'green' ? <CheckCircle2 size={22} aria-hidden="true" /> : result.status === 'yellow' ? <AlertTriangle size={22} aria-hidden="true" /> : <XCircle size={22} aria-hidden="true" />} {statusText.title}<Ru>{statusText.ru}</Ru></h2>
        {phase === 'ready' && !result.complete && result.status !== 'red' ? <p className="dc-muted">Kontroll pole veel lõpuni tehtud: ütle midagi mikrofoni ja vasta, kas kuulsid heli.<Ru>Скажите что-нибудь в микрофон и ответьте, слышали ли вы звук.</Ru></p> : null}
        {result.issues.length ? <ul className="dc-issues">{result.issues.map((item) => <li key={item.key} className={`dc-issue dc-issue--${item.level}`}>
          <b>{item.title}</b> <span>{item.fix}</span><Ru>{item.ru}</Ru>
        </li>)}</ul> : null}
        {saved === 'ok' ? <p className="dc-muted" role="status">Tulemus salvestati: õpetaja näeb enne tundi, kas seade on korras.<Ru>Результат сохранён: учитель увидит его перед уроком.</Ru></p>
          : saved === 'error' ? <p className="dc-muted" role="status">Tulemust ei saanud salvestada.<Ru>Не удалось сохранить результат.</Ru></p> : null}
        <div className="dc-actions">
          <Button variant="secondary" onClick={again} disabled={phase === 'starting'}><RotateCcw size={16} aria-hidden="true" /> Kontrolli uuesti</Button>
          {user ? <Link className="button button--secondary" to="/">Tagasi</Link> : null}
        </div>
      </> : <>
        <h2>Alusta kontrolli</h2>
        <p>Brauser küsib luba kaamera ja mikrofoni jaoks — vajuta „Luba”.<Ru>Браузер спросит разрешение на камеру и микрофон — нажмите «Разрешить».</Ru></p>
        <Button onClick={start}>Alusta kontrolli</Button>
      </>}
    </section>

    <section className="dc-card" aria-labelledby="dc-browser">
      <h2 id="dc-browser">Brauser</h2>
      <ul className="dc-list">
        <Row ok={!browser.inApp && caps.webrtc && caps.getUserMedia} label={`${browser.label}${browser.version ? ` ${browser.version}` : ''}${browser.ipad ? ' · iPad' : browser.ios ? ' · iPhone' : browser.android ? ' · Android' : ''}`}>
          {browser.inApp ? 'Rakenduse sisene brauser: kaamera ja mikrofon ei tööta.' : caps.webrtc && caps.getUserMedia ? 'Videotund töötab selles brauseris.' : 'Videotund ei tööta selles brauseris.'}
        </Row>
        <Row ok={caps.webrtc} label="Videokõne (WebRTC)" />
        <Row ok={caps.getUserMedia} label="Kaamera ja mikrofon (getUserMedia)" />
        <Row ok={caps.audioContext} warn label="Heli mõõtmine (AudioContext)" />
        <Row ok={Boolean(caps.mediaRecorder && caps.recorderMime)} warn label="Hääle salvestamine (MediaRecorder)">{caps.recorderMime ? caps.recorderMime : 'pole toetatud'}</Row>
        <Row ok={caps.displayMedia ? true : role === 'teacher' ? false : null} warn label="Ekraani jagamine">
          {caps.displayMedia ? 'Toetatud.' : browser.ios ? 'iPadis ja iPhone’is ei saa ekraani jagada (Apple’i piirang). Õpilasele see tunnis ei sega.' : 'Selles brauseris ei saa ekraani jagada.'}
        </Row>
      </ul>
    </section>

    <section className="dc-card" aria-labelledby="dc-camera">
      <h2 id="dc-camera"><Camera size={18} aria-hidden="true" /> Kaamera</h2>
      <div className="dc-video">
        <video ref={videoRef} autoPlay playsInline muted aria-label="Kaamera eelvaade" />
        {!videoStream ? <span className="dc-video__empty">{started ? MEDIA_TEXT[camera] : 'Eelvaade ilmub pärast „Alusta kontrolli”'}</span> : null}
      </div>
      {devices.video.length > 1 ? <Select label="Vali kaamera" value={chosen.videoId} onChange={(event) => changeDevice('video', event.target.value)}>
        {devices.video.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </Select> : null}
      {started ? <p className="dc-muted">Olek: {MEDIA_TEXT[camera]}</p> : null}
    </section>

    <section className="dc-card" aria-labelledby="dc-mic">
      <h2 id="dc-mic"><Mic size={18} aria-hidden="true" /> Mikrofon</h2>
      <p>Ütle midagi — riba peab liikuma.<Ru>Скажите что-нибудь — полоска должна двигаться.</Ru></p>
      <div className="dc-meter" role="meter" aria-label="Mikrofoni tase" aria-valuemin={0} aria-valuemax={100} aria-valuenow={level}><i style={{ width: `${level}%` }} /></div>
      <p className="dc-muted" role="status">{!started ? 'Kontrollimata' : mic !== 'ok' ? MEDIA_TEXT[mic] : micHeard === true ? 'Mikrofon kuuleb sind.' : micHeard === false ? 'Mikrofon ei kuule sind.' : 'Kuulan…'}</p>
      {devices.audio.length > 1 ? <Select label="Vali mikrofon" value={chosen.audioId} onChange={(event) => changeDevice('audio', event.target.value)}>
        {devices.audio.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </Select> : null}
      {mic === 'ok' && caps.mediaRecorder ? <div className="dc-clip">
        <Button variant="secondary" onClick={recordTest} disabled={clip.state === 'recording'}>{clip.state === 'recording' ? `Salvestan… ${clip.left} s` : clip.url ? 'Salvesta uuesti (5 s)' : 'Salvesta 5 s ja kuula'}</Button>
        {clip.url ? <audio controls src={clip.url} aria-label="Sinu salvestus" /> : null}
        <small className="dc-muted">Salvestus jääb ainult sellesse brauserisse.<Ru>Запись остаётся только в этом браузере.</Ru></small>
        {clip.error ? <p className="action-error" role="alert">{clip.error}</p> : null}
      </div> : null}
    </section>

    <section className="dc-card" aria-labelledby="dc-speakers">
      <h2 id="dc-speakers"><Volume2 size={18} aria-hidden="true" /> Kõlarid / kõrvaklapid</h2>
      <Button variant="secondary" onClick={testSpeakers} disabled={speakers.playing}>{speakers.playing ? 'Mängin…' : 'Mängi heli'}</Button>
      {speakers.played ? <div className="dc-ask">
        <span>Kas kuulsid heli?<Ru>Вы слышали звук?</Ru></span>
        <Button variant={speakers.heard === true ? 'primary' : 'secondary'} aria-pressed={speakers.heard === true} onClick={() => setSpeakers((current) => ({ ...current, heard: true }))}>Jah</Button>
        <Button variant={speakers.heard === false ? 'primary' : 'secondary'} aria-pressed={speakers.heard === false} onClick={() => setSpeakers((current) => ({ ...current, heard: false }))}>Ei</Button>
      </div> : null}
    </section>

    <section className="dc-card" aria-labelledby="dc-net">
      <h2 id="dc-net"><Wifi size={18} aria-hidden="true" /> Internet</h2>
      <ul className="dc-list">
        <Row ok={caps.online} label={caps.online ? 'Internet on olemas' : 'Internet puudub'}>
          {caps.connection ? [caps.connection.type, caps.connection.effectiveType && `kiirus ~${caps.connection.effectiveType.toUpperCase()}`, caps.connection.downlink ? `${caps.connection.downlink} Mbit/s` : ''].filter(Boolean).join(' · ') : null}
        </Row>
        <Row ok={network ? network.hostingOk : null} label="KeeleSepa server">{netBusy && !network ? 'Kontrollin…' : network?.hostingMs != null ? `vastas ${Math.round(network.hostingMs)} ms` : network ? 'ei vastanud' : 'kontrollimata'}</Row>
        <Row ok={network ? network.functionsOk : null} warn label="Tunni abiserver">{network?.functionsMs != null ? `vastas ${Math.round(network.functionsMs)} ms${network.functionsMs > 3000 ? ' (ärkas unest)' : ''}` : network?.functionsOk === false ? 'ei vastanud' : netBusy ? 'Kontrollin…' : 'kontrollimata'}</Row>
        <Row ok={network?.stun ?? null} warn label="Otseühendus (STUN)">{network ? (network.stun ? 'võimalik' : 'ei ole selles võrgus võimalik') : netBusy ? 'Kontrollin…' : 'kontrollimata'}</Row>
        <Row ok={network?.relay === 'ok' ? true : network?.relay === 'none' ? false : null} warn label="Vahendusserver (TURN)">
          {network?.relay === 'ok' ? 'kättesaadav' : network?.relay === 'none' ? 'ei vastanud' : network ? 'kontrollitakse tunni lingiga (avatud tunniruumist „Kontrolli seadet”)' : netBusy ? 'Kontrollin…' : 'kontrollimata'}
        </Row>
      </ul>
    </section>

    <section className="dc-card" aria-labelledby="dc-screen">
      <h2 id="dc-screen"><MonitorUp size={18} aria-hidden="true" /> Ekraani jagamine</h2>
      {caps.displayMedia ? <>
        <p>Õpetaja või õpilane saab tunnis oma ekraani näidata.<Ru>На уроке можно показать свой экран.</Ru></p>
        <Button variant="secondary" onClick={testScreen}>Proovi ekraani jagamist</Button>
        {screenTest ? <p className="dc-muted" role="status">{screenTest === 'ok' ? 'Töötab. Jagamine lõpetati kohe, midagi ei saadetud.' : screenTest === 'cancelled' ? 'Katkestasid või keelasid jagamise. Macis: Süsteemiseaded → Privaatsus → Ekraani salvestamine → luba brauser.' : 'Ekraani jagamine ei käivitunud.'}</p> : null}
      </> : <p>{browser.ios ? 'iPadis ja iPhone’is ei saa ekraani jagada — see on Apple’i piirang. Tunnis see õpilasele ei sega: õpetaja näitab materjale tahvlil.' : 'Selles brauseris ei saa ekraani jagada. Kasuta arvutis Chrome’i, Edge’i, Firefoxi või Safarit.'}<Ru>{browser.ios ? 'На iPad и iPhone нельзя показать экран — это ограничение Apple. На уроке это не мешает.' : 'В этом браузере нельзя показать экран.'}</Ru></p>}
    </section>
  </div>;
}
