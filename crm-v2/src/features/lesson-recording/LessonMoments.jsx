import { useEffect, useMemo, useRef, useState } from 'react';
import { Flag, Play } from 'lucide-react';
import { clockLabel, lessonLengthMs, momentsForLesson, playFrom, segmentAt, wallLabel } from './lessonMoments.js';

const TRACKS = [['student', 'Õpilane'], ['teacher', 'Õpetaja']];
const percent = (ms, length) => `${Math.min(100, Math.max(0, (ms / length) * 100)).toFixed(2)}%`;

// „Hetked” of one lesson in its analysis (teacher and admins only): the teacher's marks from the room with time and
// label, and the lesson's audio. A click on a mark (or on an error on the time line) plays the recording from a few
// seconds before it. Audio files are deleted after 60 days; the marks and the text stay.
// `recording` = the joined lesson (lessonTimeline.js) or null when the lesson was not recorded (marks by clock time).
export default function LessonMoments({ recording = null, moments = [], errors = [], service = null }) {
  const list = useMemo(() => (recording ? momentsForLesson(recording, moments)
    : [...moments].sort((a, b) => String(a.at).localeCompare(String(b.at))).map((m) => ({ ...m, offsetMs: null }))), [moments, recording]);
  const segments = useMemo(() => (recording?.segments || []).filter((s) => s?.path), [recording?.segments]);
  const canPlay = Boolean(segments.length && service?.audioUrl);
  const [track, setTrack] = useState('student');
  const [source, setSource] = useState(null);
  const [failure, setFailure] = useState('');
  const urls = useRef({});
  const audioRef = useRef(null);

  // a new place to play: load the file if it is another one, then seek and play
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !source) return undefined;
    const seek = () => {
      try { audio.currentTime = source.offset; } catch { /* not loaded yet */ }
      try { audio.play?.()?.catch?.(() => {}); } catch { /* autoplay blocked: the controls stay */ }
    };
    if (audio.getAttribute('src') !== source.url) {
      audio.setAttribute('src', source.url);
      audio.addEventListener('loadedmetadata', seek, { once: true });
      try { audio.load?.(); } catch { /* jsdom */ }
      return () => audio.removeEventListener('loadedmetadata', seek);
    }
    seek();
    return undefined;
  }, [source]);

  if (!list.length && !canPlay) return null;
  const timed = errors.filter((e) => Number.isFinite(e?.startMs));
  const length = canPlay ? lessonLengthMs({ segments, transcript: recording?.transcript || [], errors: timed, moments: list }) : 0;

  const jump = async (ms, onTrack = track) => {
    const from = playFrom(ms);
    const found = segmentAt(segments, from, onTrack) || segmentAt(segments, from, onTrack === 'student' ? 'teacher' : 'student');
    if (!found) { setFailure('Selle koha heli ei ole.'); return; }
    setFailure('');
    try {
      const { path } = found.segment;
      if (!urls.current[path]) urls.current[path] = await service.audioUrl(path);
      setSource({ url: urls.current[path], offset: found.offsetMs / 1000, at: from });
    } catch {
      setFailure('Heli ei saanud avada. Salvestiste heli kustutatakse 60 päeva pärast; tekst ja hetked jäävad alles.');
    }
  };

  return <section className="lesson-moments" aria-label="Hetked">
    <header><Flag size={15} aria-hidden="true" /><b>Hetked ({list.length})</b><small>õpetaja märgid tunnist · õpilane neid ei näe</small></header>
    {list.length ? <ol className="lesson-moments__list">{list.map((m) => {
      const time = Number.isFinite(m.offsetMs) ? clockLabel(m.offsetMs) : wallLabel(m.at);
      const text = m.label || 'ilma märksõnata';
      return <li key={m.id}>
        {canPlay && Number.isFinite(m.offsetMs)
          ? <button type="button" className="lesson-moments__jump" onClick={() => jump(m.offsetMs)} aria-label={`Kuula hetke ${time}: ${text}`}><Play size={13} aria-hidden="true" /><time>{time}</time></button>
          : <time title={Number.isFinite(m.offsetMs) ? undefined : 'kellaaeg (salvestuse ajast väljas)'}>{time}</time>}
        <span className={m.label ? '' : 'is-empty'}>{text}</span>
        {m.byName ? <small>{m.byName}</small> : null}
      </li>;
    })}</ol> : <p className="form-hint">Hetki ei märgitud. Tunnis märgib õpetaja hetke nupuga „Hetk” või klahviga B.</p>}
    {canPlay ? <div className="lesson-moments__player">
      <div className="transcript__who" role="group" aria-label="Kelle heli">
        {TRACKS.map(([key, label]) => <button type="button" key={key} aria-pressed={track === key} onClick={() => { setTrack(key); if (source) jump(source.at + 3000, key); }}>{label}</button>)}
      </div>
      {length > 0 ? <div className="lesson-moments__line" aria-label="Tunni ajatelg">
        {timed.map((e, i) => <button type="button" key={`e-${i}`} className="lesson-moments__mark is-error" style={{ left: percent(e.startMs, length) }} title={`${clockLabel(e.startMs)} · viga: ${e.said || ''}`} aria-label={`Kuula viga ${clockLabel(e.startMs)}`} onClick={() => jump(e.startMs, 'student')} />)}
        {list.filter((m) => Number.isFinite(m.offsetMs)).map((m) => <button type="button" key={`m-${m.id}`} className="lesson-moments__mark is-moment" style={{ left: percent(m.offsetMs, length) }} title={`${clockLabel(m.offsetMs)} · ${m.label || 'hetk'}`} aria-label={`Kuula hetke ${clockLabel(m.offsetMs)} ajateljel`} onClick={() => jump(m.offsetMs)} />)}
      </div> : null}
      {length > 0 ? <span className="lesson-moments__legend"><i className="is-moment" /> hetk <i className="is-error" /> viga · 0:00–{clockLabel(length)}</span> : null}
      <audio ref={audioRef} controls preload="none" aria-label="Tunni salvestis" />
    </div> : null}
    {failure ? <p className="form-error" role="alert">{failure}</p> : null}
  </section>;
}
