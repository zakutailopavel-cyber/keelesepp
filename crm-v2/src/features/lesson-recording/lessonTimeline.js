// The student's Live Classroom lessons for the teacher's view of the student card: one row per lesson, plus board
// lesson pages of days without a recording. Each row offers the lesson analysis (transcript) and the board.

const pad = (n) => String(n).padStart(2, '0');
export function dayKey(value) {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value || '');
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// A page reload or a reconnect starts a new recording, so one lesson can be stored in several parts. Parts of one
// invitation on one day are one lesson (owner, 2026-10-10: „одна дата — один урок”): their text is joined in time
// order (each part's times are moved by its start), the status is the least finished one, and the analysis is the
// one the school Mac made for the whole lesson (`analysis.parts`), or the parts' errors together.
const STATUS_ORDER = ['recording', 'uploaded', 'transcribing', 'failed', 'done'];
const msOf = (value) => { const t = Date.parse(value || ''); return Number.isNaN(t) ? 0 : t; };
export function joinRecordingParts(parts = []) {
  if (parts.length <= 1) return parts[0] || null;
  const sorted = [...parts].sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)));
  const first = sorted[0];
  const t0 = msOf(first.startedAt);
  const shift = (part) => Math.max(0, msOf(part.startedAt) - t0);
  const transcript = sorted.flatMap((part) => (part.transcript || []).map((line) => ({ ...line, startMs: (line.startMs || 0) + shift(part), endMs: (line.endMs || 0) + shift(part) })));
  const statuses = sorted.map((part) => part.status || 'recording');
  const open = statuses.filter((st) => st !== 'done' && st !== 'failed');
  const status = open.length ? STATUS_ORDER.find((st) => open.includes(st)) : statuses.includes('done') ? 'done' : 'failed';
  const ids = sorted.map((part) => part.id);
  const whole = sorted.map((part) => part.analysis).find((a) => Array.isArray(a?.parts) && ids.every((id) => a.parts.includes(id)));
  const partErrors = sorted.flatMap((part) => (Array.isArray(part.analysis?.errors) ? part.analysis.errors.map((e) => ({ ...e, startMs: (e.startMs || 0) + shift(part) })) : []));
  const longest = [...sorted].sort((a, b) => (b.transcript?.length || 0) - (a.transcript?.length || 0))[0];
  const analysis = whole || (sorted.some((part) => part.analysis && !part.analysis.error)
    ? { errors: partErrors, ...(longest.analysis?.summary ? { summary: longest.analysis.summary } : {}) } : null);
  return {
    ...first, parts: ids, status, transcript, analysis,
    endedAt: sorted[sorted.length - 1].endedAt || first.endedAt,
    segments: sorted.flatMap((part) => part.segments || []),
  };
}
export function groupRecordings(recordings = []) {
  const groups = new Map();
  for (const rec of recordings) {
    const key = `${rec.invitationId || rec.id}|${dayKey(rec.startedAt)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(rec);
  }
  return [...groups.values()].map(joinRecordingParts);
}

export function lessonTimeline(recordings = [], pages = []) {
  const pageByDay = new Map();
  for (const page of pages) {
    const key = dayKey(page.createdAt);
    if (key && !pageByDay.has(key)) pageByDay.set(key, page);
  }
  const rows = groupRecordings(recordings).map((recording) => {
    const day = dayKey(recording.startedAt);
    const page = pageByDay.get(day) || null;
    return { key: `rec-${recording.id}`, day, at: recording.startedAt, title: recording.title || 'Tund', recording, pageId: page?.id || '', pageTitle: page?.title || '' };
  });
  const recordedDays = new Set(rows.map((row) => row.day));
  for (const [day, page] of pageByDay) {
    if (!recordedDays.has(day)) rows.push({ key: `page-${page.id}`, day, at: page.createdAt?.toDate ? page.createdAt.toDate().toISOString() : page.createdAt, title: page.title || 'Tund', recording: null, pageId: page.id, pageTitle: page.title || '' });
  }
  return rows.sort((a, b) => String(b.day).localeCompare(String(a.day)) || String(b.at || '').localeCompare(String(a.at || '')));
}

const words = (text) => String(text || '').split(/\s+/).filter(Boolean).length;

// Simple, honest numbers from the transcript (no AI): who talked how much, how often the student spoke,
// the longest thing the student said and the student's own questions.
export function lessonAnalysis(transcript = []) {
  const totals = { teacher: { words: 0, ms: 0, turns: 0 }, student: { words: 0, ms: 0, turns: 0 } };
  let previous = '';
  let longest = '';
  const questions = [];
  for (const line of transcript) {
    const who = line.speaker === 'teacher' ? 'teacher' : 'student';
    const count = words(line.text);
    totals[who].words += count;
    totals[who].ms += Math.max(0, Number(line.endMs || 0) - Number(line.startMs || 0));
    if (who !== previous) totals[who].turns += 1;
    previous = who;
    if (who === 'student') {
      if (count > words(longest)) longest = line.text;
      if (/\?\s*$/.test(String(line.text || ''))) questions.push(line.text);
    }
  }
  const allMs = totals.teacher.ms + totals.student.ms;
  const allWords = totals.teacher.words + totals.student.words;
  const studentShare = allMs ? Math.round((totals.student.ms / allMs) * 100) : allWords ? Math.round((totals.student.words / allWords) * 100) : 0;
  return { ...totals, studentShare, longestStudentLine: longest, studentQuestions: questions };
}

// Word changes between what the learner said and the corrected sentence (longest common subsequence of words):
// [{ type: 'same' | 'del' | 'ins', text }] — „del” was said but is wrong, „ins” is the right form.
export function wordDiff(said = '', corrected = '') {
  const a = String(said).split(/\s+/).filter(Boolean);
  const b = String(corrected).split(/\s+/).filter(Boolean);
  const key = (w) => w.toLocaleLowerCase('et').replace(/[.,!?;:…"„“”]+/g, '');
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i -= 1) for (let j = b.length - 1; j >= 0; j -= 1) {
    dp[i][j] = key(a[i]) === key(b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
  const out = [];
  let i = 0; let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && key(a[i]) === key(b[j])) { out.push({ type: 'same', text: b[j] }); i += 1; j += 1; } else if (j < b.length && (i >= a.length || dp[i][j + 1] >= dp[i + 1][j])) { out.push({ type: 'ins', text: b[j] }); j += 1; } else { out.push({ type: 'del', text: a[i] }); i += 1; }
  }
  return out;
}
