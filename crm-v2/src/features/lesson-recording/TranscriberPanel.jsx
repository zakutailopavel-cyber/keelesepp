/* global setInterval, clearInterval */
import { useEffect, useState } from 'react';
import { lessonRecordingsService } from '../../services/firebase/lessonRecordings.js';
import { analysisStatus, nextWindowLabel, transcriptionQueue, useTranscriberStatus, useTranscriptionQueue } from './transcriberStatus.js';

// „Tundide tekst” (owner 2026-11-24): the lessons are transcribed on the owner's Mac at night; here he sees on the
// site whether the Mac is on, what it is doing now and how far it is, what waits in the queue and what failed.

const failReason = (r) => (/ECONNRESET|timeout|timed out|network|socket|storage\.googleapis|deadline/i.test(String(r?.error || '')) ? 'ühendus katkes' : String(r?.error || 'viga').slice(0, 80));
const firstName = (r) => String(r?.studentName || '').trim().split(/\s+/)[0] || 'Õpilane';
const time = (iso) => (iso ? new Intl.DateTimeFormat('et-EE', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Tallinn' }).format(new Date(iso)) : '');
function waited(iso, now) {
  const ms = now - (Date.parse(iso || '') || now);
  const h = Math.floor(ms / 3600000);
  if (h >= 24) return `${Math.floor(h / 24)} p ${h % 24} h`;
  return h ? `${h} h` : `${Math.max(1, Math.round(ms / 60000))} min`;
}

export default function TranscriberPanel({ service = lessonRecordingsService, state: given, queueState, now: givenNow }) {
  const live = useTranscriberStatus({ service, enabled: !given });
  const fetched = useTranscriptionQueue({ service, enabled: !queueState });
  const state = given || live;
  const { list, error } = queueState || fetched;
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setTick(Date.now()), 60 * 1000); return () => clearInterval(t); }, []);
  const now = givenNow ?? tick;
  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!list) return <p className="form-hint">Laen…</p>;
  const queue = transcriptionQueue(list, { now });
  const byId = new Map(list.map((r) => [r.id, r]));
  const cur = state.current;
  const curRec = cur ? byId.get(cur.recordingId) || list.find((r) => (cur.recordingIds || []).includes(r.id)) : null;
  const pct = cur?.progress?.total ? Math.round((cur.progress.done / cur.progress.total) * 100) : null;
  const windowLine = state.hours
    ? (state.windowOpen ? `Töötab öösel ${state.hours.replace('-', '–')} · praegu töös` : `Töötab öösel ${state.hours.replace('-', '–')} · järgmine kord ${nextWindowLabel(state.hours, new Date(now))}`)
    : (state.online ? 'Töötab kogu aeg' : '');
  return (
    <div className="tr-panel">
      <div className="tr-panel__status">
        <span className={`tr-dot ${state.online ? 'is-on' : 'is-off'}`} aria-hidden="true" />
        <strong>{!state.known ? 'Mac: andmed puuduvad' : state.online ? `Mac on sees (${state.host})` : `Mac on väljas${state.lastSeenAt ? ` · viimati ${time(state.lastSeenAt)}` : ''}`}</strong>
        {windowLine ? <small>{windowLine}</small> : null}
      </div>
      {cur ? <div className="tr-panel__now" role="status">
        <span>{cur.state === 'analyzing' ? 'Analüüsin' : 'Teen teksti'}: <b>{firstName(curRec)}</b>{curRec?.startedAt ? ` · tund ${time(curRec.startedAt)}` : ''}{cur.detail ? ` · ${cur.detail}` : ''}{pct != null ? ` · ${cur.progress.done}/${cur.progress.total} osa` : ''}</span>
        {pct != null ? <progress max="100" value={pct} aria-label="Teksti valmimine">{pct} %</progress> : null}
      </div> : null}
      <div className="tr-panel__nums">
        <div><strong>{queue.waiting.length + queue.working.length}</strong><small>ootab teksti</small></div>
        <div><strong>{queue.analysis.length}</strong><small>ootab analüüsi</small></div>
        <div><strong>{queue.doneToday.length}</strong><small>valmis (24 h)</small></div>
        <div className={queue.failed.length ? 'is-bad' : ''}><strong>{queue.failed.length}</strong><small>ebaõnnestus</small></div>
      </div>
      {queue.waiting.length || queue.analysis.length ? <ul className="tr-panel__list" aria-label="Järjekord">
        {queue.waiting.map((r) => <li key={r.id}><b>{firstName(r)}</b> · tund {time(r.startedAt)} <small>ootab {waited(r.endedAt || r.startedAt, now)}</small></li>)}
        {queue.analysis.map((r) => <li key={r.id}><b>{firstName(r)}</b> · tund {time(r.startedAt)} <small>{analysisStatus(r, state)?.label || 'Ootab analüüsi'}</small></li>)}
      </ul> : <p className="form-hint">Järjekord on tühi.</p>}
      {queue.failed.length ? <ul className="tr-panel__list tr-panel__list--bad" aria-label="Ebaõnnestunud">
        {queue.failed.slice(0, 10).map((r) => <li key={r.id}><b>{firstName(r)}</b> · tund {time(r.startedAt)} <small>{failReason(r)}</small></li>)}
      </ul> : null}
    </div>
  );
}
