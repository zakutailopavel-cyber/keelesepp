// „Kõneaeg”: who talks how long in a lesson (1:1, and per student in a group room), from the sound level only (not the language, not the words).
// Pure logic, no Web Audio here: `useTalkMeter.js` feeds levels (RMS 0…1) about 10 times a second.

export const VAD_DEFAULTS = Object.freeze({
  minLevel: 0.012, // RMS below this is never speech (quiet room, muted microphone)
  floorRatio: 2.5, // speech = smoothed level above max(minLevel, noise floor × floorRatio)
  smoothing: 0.5, // weight of the newest sample in the smoothed level
  floorRise: 0.002, // how fast the noise floor creeps up per sample in silence (it falls at once)
  floorRiseSpeaking: 0.0002, // much slower during speech, so a long answer does not become „noise”
  hangoverMs: 400, // a pause up to this long inside speech still counts as speech
  minSpeechMs: 250, // a sound shorter than this (cough, click, door) is not counted
  maxStepMs: 500, // a late timer tick never adds more than this
});

export const TALK_TARGET = 0.6; // the student should talk at least 60 % of the talk time
export const TALK_LOW = 0.4; // below this in the last 10 minutes the meter turns amber
export const RECENT_MS = 10 * 60_000;
const BUCKET_MS = 10_000;
const MIN_RECENT_MS = 2 * 60_000; // the last 10 minutes need at least 2 min of talk before a colour hint

/** Root mean square of time-domain samples (floats −1…1). */
export function rms(samples) {
  if (!samples?.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

/** Root mean square of byte time-domain samples (128 = silence), for browsers without float data. */
export function rmsBytes(samples) {
  if (!samples?.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i += 1) { const v = (samples[i] - 128) / 128; sum += v * v; }
  return Math.sqrt(sum / samples.length);
}

/**
 * Voice activity for one side: smoothed level against an adaptive noise floor (the first level and every quieter one
 * set it; it creeps up slowly), onset needs `minSpeechMs` of sound,
 * pauses up to `hangoverMs` inside speech count, a longer pause is dropped. `step(level, dtMs)` returns the ms of
 * speech to add for this step (the onset is added once it is confirmed, a bridged pause when speech resumes).
 */
export function createVad(options = {}) {
  const o = { ...VAD_DEFAULTS, ...options };
  let smooth = 0;
  let floor = null;
  let speaking = false;
  let onsetMs = 0;
  let gapMs = 0;
  return {
    step(level, dtMs) {
      const dt = Math.max(0, Math.min(o.maxStepMs, Number(dtMs) || 0));
      const value = Number.isFinite(level) && level > 0 ? level : 0;
      smooth += o.smoothing * (value - smooth);
      if (floor === null || smooth < floor) floor = smooth;
      else floor += (smooth - floor) * (speaking ? o.floorRiseSpeaking : o.floorRise);
      const threshold = Math.max(o.minLevel, floor * o.floorRatio);
      // the raw level must also be up: smoothing alone would stretch a single click into a „word”
      const active = smooth > threshold && value > threshold / 2;
      if (!speaking) {
        if (!active) { onsetMs = 0; return 0; }
        onsetMs += dt;
        if (onsetMs < o.minSpeechMs) return 0;
        speaking = true;
        const credit = onsetMs;
        onsetMs = 0;
        return credit;
      }
      if (active) { const credit = gapMs + dt; gapMs = 0; return credit; }
      gapMs += dt;
      if (gapMs > o.hangoverMs) { speaking = false; gapMs = 0; }
      return 0;
    },
    get speaking() { return speaking; },
    reset() { smooth = 0; floor = null; speaking = false; onsetMs = 0; gapMs = 0; },
  };
}

const share = (teacherMs, studentMs) => (teacherMs + studentMs > 0 ? studentMs / (teacherMs + studentMs) : null);

/**
 * Talk time of both sides of the lesson. `sample({ teacher, student }, nowMs, dtMs)`: the levels of this step (a
 * missing side counts as silence); `snapshot(nowMs)`: totals and the last 10 minutes (10-second buckets).
 */
export function createTalkTracker({ vad = {}, recentMs = RECENT_MS } = {}) {
  const sides = { teacher: createVad(vad), student: createVad(vad) };
  const total = { teacher: 0, student: 0 };
  const buckets = new Map();
  const prune = (nowMs) => {
    const oldest = Math.floor((nowMs - recentMs) / BUCKET_MS);
    for (const key of buckets.keys()) if (key <= oldest) buckets.delete(key);
  };
  return {
    sample(levels = {}, nowMs = Date.now(), dtMs = 100) {
      const key = Math.floor(nowMs / BUCKET_MS);
      for (const side of ['teacher', 'student']) {
        const credit = sides[side].step(levels[side] ?? 0, dtMs);
        if (!credit) continue;
        total[side] += credit;
        const bucket = buckets.get(key) || { teacher: 0, student: 0 };
        bucket[side] += credit;
        buckets.set(key, bucket);
      }
      prune(nowMs);
    },
    snapshot(nowMs = Date.now()) {
      prune(nowMs);
      let teacher = 0;
      let student = 0;
      for (const bucket of buckets.values()) { teacher += bucket.teacher; student += bucket.student; }
      return {
        teacherSec: Math.round(total.teacher / 1000),
        studentSec: Math.round(total.student / 1000),
        share: share(total.teacher, total.student),
        recent: { teacherSec: Math.round(teacher / 1000), studentSec: Math.round(student / 1000), share: share(teacher, student) },
        speaking: { teacher: sides.teacher.speaking, student: sides.student.speaking },
      };
    },
  };
}

/**
 * Group room „Kõneaeg”: the same VAD for any number of sides — `teacher` plus one side per student (the uid of the
 * remote track). `snapshot(nowMs)` has the shape of the 1:1 snapshot for all students together (`studentSec`,
 * `share`, `recent`, so `talkHint` works on it) and `people[id] = { sec, recentSec }` for every side seen so far.
 */
export function createGroupTalkTracker({ vad = {}, recentMs = RECENT_MS } = {}) {
  const sides = new Map();
  const total = new Map();
  const buckets = new Map();
  const prune = (nowMs) => {
    const oldest = Math.floor((nowMs - recentMs) / BUCKET_MS);
    for (const key of buckets.keys()) if (key <= oldest) buckets.delete(key);
  };
  return {
    sample(levels = {}, nowMs = Date.now(), dtMs = 100) {
      const key = Math.floor(nowMs / BUCKET_MS);
      for (const [side, level] of Object.entries(levels)) {
        if (!sides.has(side)) { sides.set(side, createVad(vad)); total.set(side, 0); }
        const credit = sides.get(side).step(level ?? 0, dtMs);
        if (!credit) continue;
        total.set(side, total.get(side) + credit);
        const bucket = buckets.get(key) || {};
        bucket[side] = (bucket[side] || 0) + credit;
        buckets.set(key, bucket);
      }
      prune(nowMs);
    },
    snapshot(nowMs = Date.now()) {
      prune(nowMs);
      const recent = {};
      for (const bucket of buckets.values()) for (const [side, ms] of Object.entries(bucket)) recent[side] = (recent[side] || 0) + ms;
      const people = {};
      let teacher = 0; let students = 0; let recentTeacher = 0; let recentStudents = 0;
      for (const [side, ms] of total.entries()) {
        people[side] = { sec: Math.round(ms / 1000), recentSec: Math.round((recent[side] || 0) / 1000), speaking: sides.get(side).speaking };
        if (side === 'teacher') { teacher += ms; recentTeacher += recent[side] || 0; } else { students += ms; recentStudents += recent[side] || 0; }
      }
      return {
        teacherSec: Math.round(teacher / 1000),
        studentSec: Math.round(students / 1000),
        share: share(teacher, students),
        recent: { teacherSec: Math.round(recentTeacher / 1000), studentSec: Math.round(recentStudents / 1000), share: share(recentTeacher, recentStudents) },
        people,
      };
    },
  };
}

/**
 * Rows for the group meter: one per student in the call (`members` = [{ id, name }]) with talk time, share of all
 * talk and the last 10 minutes, and who talks least. `quietestId` is set once the last 10 minutes hold enough talk
 * (2 min) and there are at least two students; `quietLow` when that student had under half of a fair share of the
 * students' talk in those minutes.
 */
export function groupTalkRows(snapshot, members = []) {
  const people = snapshot?.people || {};
  const all = (snapshot?.teacherSec || 0) + (snapshot?.studentSec || 0);
  const rows = members.map((member) => {
    const person = people[member.id] || { sec: 0, recentSec: 0, speaking: false };
    return { id: member.id, name: member.name, sec: person.sec, recentSec: person.recentSec, speaking: Boolean(person.speaking), share: all > 0 ? person.sec / all : null };
  });
  const recent = snapshot?.recent || {};
  const recentMs = ((recent.teacherSec || 0) + (recent.studentSec || 0)) * 1000;
  let quietestId = null;
  let quietLow = false;
  if (rows.length >= 2 && recentMs >= MIN_RECENT_MS) {
    const quietest = rows.reduce((least, row) => (row.recentSec < least.recentSec ? row : least), rows[0]);
    quietestId = quietest.id;
    const fair = (recent.studentSec || 0) / rows.length;
    quietLow = fair > 0 && quietest.recentSec < fair / 2;
  }
  return { rows, quietestId, quietLow };
}

export const EMPTY_TALK = Object.freeze({
  teacherSec: 0, studentSec: 0, share: null, recent: { teacherSec: 0, studentSec: 0, share: null }, speaking: { teacher: false, student: false },
});

/** 'none' (too little talk yet) | 'low' (last 10 min below 40 %) | 'ok' | 'good' (overall at or above the target). */
export function talkHint(snapshot, { target = TALK_TARGET, low = TALK_LOW } = {}) {
  if (!snapshot || snapshot.share === null) return 'none';
  const recent = snapshot.recent || {};
  const recentMs = ((recent.teacherSec || 0) + (recent.studentSec || 0)) * 1000;
  if (recent.share !== null && recent.share !== undefined && recentMs >= MIN_RECENT_MS && recent.share < low) return 'low';
  return snapshot.share >= target ? 'good' : 'ok';
}

export const percent = (value) => (value === null || value === undefined ? '—' : `${Math.round(value * 100)} %`);

export function minutes(sec) {
  const s = Math.max(0, Math.round(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
