import { useEffect, useRef, useState } from 'react';
import { Flag } from 'lucide-react';
import { lessonMomentsService } from '../../services/firebase/lessonMoments.js';
import { MOMENT_LABEL_MAX, clockLabel, isMomentKey, momentRecord, wallLabel } from '../lesson-recording/lessonMoments.js';

// how long the small „Hetk salvestatud” box stays when nothing is typed into it
const HIDE_MS = 6000;

// „Hetk” in the teacher's top bar (owner 2026-11-04): one click or the key B saves the moment at once (no label);
// a small box then offers a short label, which can be ignored. The student never sees it. Moments are shown in the
// lesson analysis on the student card (TranscriptView.jsx).
// Group room: `targets` = [{ invitation, recording }] of the students in the lesson and `groupRoomId`; one press saves
// one moment per student (each on the student's own invitation / recording), the label and „Kustuta” apply to all.
export default function MomentButton({ invitation, user, recording = null, targets = null, groupRoomId = '', service = lessonMomentsService }) {
  const [last, setLast] = useState(null);
  const [label, setLabel] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [typing, setTyping] = useState(false);

  const add = async () => {
    setError('');
    try {
      const list = targets || [{ invitation, recording }];
      if (!list.length) throw new Error('Tunnis pole veel ühtegi õpilast.');
      const now = Date.now();
      const records = list.map((item) => momentRecord({ invitation: item.invitation, recording: item.recording || null, user, now, groupRoomId }));
      const saved = records.length > 1 && service.addMany ? await service.addMany(records) : await Promise.all(records.map((record) => service.add(record)));
      const record = records.find((item) => Number.isFinite(item.atMs)) || records[0];
      setLast({ ids: saved.map((item) => item.id), time: Number.isFinite(record.atMs) ? clockLabel(record.atMs) : wallLabel(record.at) });
      setLabel('');
      setTyping(false);
    } catch (failure) {
      setError(failure?.message || 'Hetke ei saanud salvestada.');
    }
  };
  // the keyboard handler always calls the latest `add` (recording may start or stop during the lesson)
  const addRef = useRef(add);
  useEffect(() => { addRef.current = add; });
  useEffect(() => {
    const down = (event) => {
      if (!isMomentKey(event)) return;
      event.preventDefault();
      addRef.current();
    };
    globalThis.addEventListener?.('keydown', down);
    return () => globalThis.removeEventListener?.('keydown', down);
  }, []);

  // the box closes by itself unless the teacher is writing a label
  useEffect(() => {
    if (!last || typing) return undefined;
    const timer = globalThis.setTimeout(() => setLast(null), HIDE_MS);
    return () => globalThis.clearTimeout(timer);
  }, [last, typing]);
  useEffect(() => {
    if (!error) return undefined;
    const timer = globalThis.setTimeout(() => setError(''), HIDE_MS);
    return () => globalThis.clearTimeout(timer);
  }, [error]);

  const saveLabel = async () => {
    const text = label.trim();
    if (!last || !text) { setLast(null); return; }
    setBusy(true);
    try {
      await Promise.all(last.ids.map((id) => service.setLabel(id, text)));
      setLast(null);
    } catch (failure) {
      setError(failure?.message || 'Märksõna ei saanud salvestada.');
    } finally { setBusy(false); }
  };
  const undo = async () => {
    if (!last) return;
    setBusy(true);
    try { await Promise.all(last.ids.map((id) => service.remove(id))); setLast(null); } catch (failure) { setError(failure?.message || 'Hetke ei saanud kustutada.'); } finally { setBusy(false); }
  };

  return (
    <span className="lr-moment">
      <button type="button" className="lr-pill lr-moment__btn" onClick={add}
        aria-label="Hetk: märgi see koht tunnis (klahv B)" title="Märgi see koht tunnis (klahv B). Õpilane seda ei näe.">
        <Flag size={15} aria-hidden="true" /><span className="lr-label">Hetk</span>
      </button>
      {last ? <span className="lr-moment__box" role="status">
        <b>Hetk {last.time} salvestatud</b>
        <input type="text" aria-label="Hetke märksõna (valikuline)" placeholder="märksõna (valikuline)" maxLength={MOMENT_LABEL_MAX} value={label}
          onFocus={() => setTyping(true)}
          onChange={(event) => { setLabel(event.target.value); setTyping(true); }}
          onBlur={() => { if (!label.trim()) setTyping(false); }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') { event.preventDefault(); saveLabel(); }
            if (event.key === 'Escape') { event.preventDefault(); setLast(null); }
          }} />
        <span className="lr-moment__actions">
          <button type="button" disabled={busy || !label.trim()} onClick={saveLabel}>Salvesta</button>
          <button type="button" disabled={busy} onClick={undo}>Kustuta hetk</button>
        </span>
      </span> : null}
      {error ? <span className="lr-moment__box is-error" role="alert">{error}</span> : null}
    </span>
  );
}
