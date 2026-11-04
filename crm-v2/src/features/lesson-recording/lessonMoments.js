// „Hetk” (owner 2026-11-04): during a live lesson the teacher marks a moment with one click (or the key B): the
// time from the start of the recording, an optional short label and who marked it. Without a recording the moment
// keeps only the wall-clock time, so it still shows in the lesson's summary. Staff only; the student never sees it.
// Stored in `lessonMoments/{auto id}` (services/firebase/lessonMoments.js, rules in firestore.rules).
import { dayKey } from './lessonTimeline.js';

export const MOMENT_LABEL_MAX = 80;
// a click jumps the player a few seconds earlier, so the teacher hears what led to the moment
export const MOMENT_LEAD_MS = 3000;
// keyboard shortcut in the room (M is the board's marker tool)
export const MOMENT_KEY = 'b';

export const cleanMomentLabel = (label = '') => String(label || '').replace(/\s+/g, ' ').trim().slice(0, MOMENT_LABEL_MAX);

const msOf = (value) => { const t = Date.parse(value || ''); return Number.isNaN(t) ? null : t; };

// the document of a new moment; `recording` = { id, t0 } of the running recording (t0 = the recorder's start in ms)
export function momentRecord({ invitation, recording = null, user, label = '', now = Date.now() }) {
  if (!invitation?.id || !invitation.studentId) throw new Error('Tund puudub.');
  if (!user?.uid) throw new Error('Pole sisse logitud.');
  const at = new Date(now).toISOString();
  const recorded = Boolean(recording?.id && Number.isFinite(recording.t0) && recording.t0 > 0);
  return {
    invitationId: invitation.id,
    recordingId: recorded ? recording.id : '',
    teacherUid: invitation.teacherUid || user.uid,
    studentId: invitation.studentId,
    atMs: recorded ? Math.max(0, Math.round(now - recording.t0)) : null,
    at,
    label: cleanMomentLabel(label),
    byUid: user.uid,
    byName: String(user.displayName || user.email || '').slice(0, 160),
    createdAt: at,
  };
}

// a moment can be keyboard-triggered only outside text fields and without modifier keys
export function isMomentKey(event) {
  if (!event || event.repeat || event.ctrlKey || event.metaKey || event.altKey) return false;
  if (String(event.key || '').toLowerCase() !== MOMENT_KEY) return false;
  const target = event.target;
  return !(target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName || '')));
}

export const clockLabel = (ms) => { const s = Math.floor(Math.max(0, ms || 0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
export const wallLabel = (iso) => { const t = msOf(iso); return t === null ? '' : new Date(t).toLocaleTimeString('et-EE', { hour: '2-digit', minute: '2-digit' }); };

// The moments of one lesson (a joined recording, lessonTimeline.js) with their place in the recording: a moment saved
// with this recording (or one of its parts) keeps its exact offset, moved by the part's start like the transcript;
// any other moment of the same lesson day is placed by its wall-clock time. `offsetMs` is null when the moment is
// outside the recording (before it started or after it ended): it is still listed with its clock time.
export function momentsForLesson(recording, moments = []) {
  if (!recording) return [];
  const t0 = msOf(recording.startedAt);
  const day = dayKey(recording.startedAt);
  const ends = msOf(recording.endedAt);
  const partStarts = recording.partStarts || { [recording.id]: recording.startedAt };
  return moments
    .filter((m) => m.invitationId === recording.invitationId && dayKey(m.at) === day)
    .map((m) => {
      let offsetMs = null;
      const partStart = m.recordingId ? msOf(partStarts[m.recordingId]) : null;
      if (partStart !== null && t0 !== null && Number.isFinite(m.atMs)) offsetMs = m.atMs + Math.max(0, partStart - t0);
      else if (t0 !== null && msOf(m.at) !== null) {
        const wall = msOf(m.at) - t0;
        offsetMs = wall >= 0 && (ends === null || msOf(m.at) <= ends + 60000) ? wall : null;
      }
      return { ...m, offsetMs };
    })
    .sort((a, b) => String(a.at).localeCompare(String(b.at)));
}

// where the player starts for a moment or an error at `ms` of the lesson
export const playFrom = (ms) => Math.max(0, Math.round((ms || 0) - MOMENT_LEAD_MS));

// The audio file of one track (`student` / `teacher`) that holds the time `ms`, and the time inside that file.
// Between two files (a reconnect) it takes the next file from its start.
export function segmentAt(segments = [], ms = 0, track = 'student') {
  const list = segments.filter((s) => s?.track === track && s.path).sort((a, b) => (a.startMs || 0) - (b.startMs || 0));
  if (!list.length) return null;
  const inside = list.find((s) => ms >= (s.startMs || 0) && ms < (s.startMs || 0) + (s.durationMs || 0));
  if (inside) return { segment: inside, offsetMs: ms - (inside.startMs || 0) };
  const next = list.find((s) => (s.startMs || 0) > ms);
  if (next) return { segment: next, offsetMs: 0 };
  const last = list[list.length - 1];
  return { segment: last, offsetMs: Math.max(0, Math.min(ms - (last.startMs || 0), (last.durationMs || 0))) };
}

// how long the lesson's timeline is: the end of the last audio file, line or mark
export function lessonLengthMs({ segments = [], transcript = [], errors = [], moments = [] } = {}) {
  return Math.max(0,
    ...segments.map((s) => (s.startMs || 0) + (s.durationMs || 0)),
    ...transcript.map((l) => l.endMs || l.startMs || 0),
    ...errors.map((e) => e.startMs || 0),
    ...moments.map((m) => (Number.isFinite(m.offsetMs) ? m.offsetMs : 0)));
}
