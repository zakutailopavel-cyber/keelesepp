// The student's Live Classroom lessons for the teacher's view of the student card: one row per recording, plus board
// lesson pages of days without a recording. Each row offers the lesson analysis (transcript) and the board.

const pad = (n) => String(n).padStart(2, '0');
export function dayKey(value) {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value || '');
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function lessonTimeline(recordings = [], pages = []) {
  const pageByDay = new Map();
  for (const page of pages) {
    const key = dayKey(page.createdAt);
    if (key && !pageByDay.has(key)) pageByDay.set(key, page);
  }
  const rows = recordings.map((recording) => {
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
