// „Pole viga” (owner 2026-11-04): the teacher marks an error the model flagged as not an error. The marks are kept on
// the lesson's first recording (`errorReview.{key}` = { said, corrected, kind, reason, byUid, byName, at, undoneAt?,
// undoneByUid?, undoneByName? }) — outside `analysis`, so a new analysis by the school Mac does not wipe them; an undo
// only adds `undoneAt`, the mark itself stays for the audit. A copy goes to `analyzerFeedback` so the Mac learns from
// it (tools/lesson-transcriber/analysis.js `dismissedPairs`).
// Everything in the CRM that counts or uses the errors reads the analysis through `withErrorReview`: the error list,
// „Pärast tundi” (homework, cards, the parent note), „Tee tööleht vigadest”, the trend, „Rääkimine” and the personal
// worksheet. Dismissed errors are left out there and the topic counts (`focus`) are counted again without them.

// a short stable id of one flagged error in its lesson (its time, what was said, the correction)
export function errorKey(error = {}) {
  const text = `${Math.round(Number(error.startMs) || 0)}|${error.said || ''}|${error.corrected || ''}`;
  let h1 = 5381; let h2 = 52711;
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 33) >>> 0;
    h2 = Math.imul(h2 ^ c, 31) >>> 0;
  }
  return `e${h1.toString(36)}${h2.toString(36)}`;
}

export const isActiveDismissal = (entry) => Boolean(entry && typeof entry === 'object' && entry.at && !entry.undoneAt);

// ── the error topics, counted the same way as the school Mac (analysis.js errorTopicKeys) ──
const plain = (s) => String(s || '').toLocaleLowerCase('et').replace(/[.,!?;:…"„“”«»()-]+/g, ' ').split(/\s+/).filter(Boolean);
function sameWord(w, x) {
  if (w === x) return true;
  if (w.length <= 2 || x.length <= 2) return false;
  return w.slice(0, 3) === x.slice(0, 3) || (Math.min(w.length, x.length) <= 4 && w.slice(0, 2) === x.slice(0, 2));
}
const CASE_END = /(sse|kku|st|lt|le|ks|ga|ni|na|ta|s|l)$/;
const VERB_END = /(ma|da|ta|n|b|d|me|te|vad|sin|sid|si|s)$/;
export function errorTopicKeys(e = {}) {
  const keys = new Set();
  const kind = String(e.kind || '');
  if (kind.includes('sõnajärg')) keys.add('order');
  if (kind.includes('sõna puudu')) keys.add('missing');
  if (kind.includes('liigne sõna')) keys.add('extra');
  if (kind.includes('sõnavara')) keys.add('vocab');
  if (kind.includes('vorm')) {
    const a = plain(e.said); const b = plain(e.corrected);
    const pairs = a.filter((w) => !b.includes(w)).flatMap((w) => b.filter((x) => !a.includes(x) && sameWord(w, x)).map((x) => [w, x]));
    for (const [, x] of pairs) keys.add(CASE_END.test(x) && x.length > 4 ? 'cases' : VERB_END.test(x) ? 'verb' : 'form');
    if (!pairs.length) keys.add('form');
  }
  return [...keys];
}

// The analysis without the dismissed errors. `dismissedErrors` lists them (with their mark) for the undo; `focus`
// keeps the Mac's topic texts and examples but counts only the errors that stay.
export function applyErrorReview(analysis, review = {}) {
  if (!analysis || !Array.isArray(analysis.errors)) return analysis || null;
  const marks = review && typeof review === 'object' ? review : {};
  const kept = [];
  const dismissed = [];
  for (const error of analysis.errors) {
    const key = errorKey(error);
    if (isActiveDismissal(marks[key])) dismissed.push({ ...error, key, review: marks[key] });
    else kept.push(error);
  }
  if (!dismissed.length) return { ...analysis, dismissedErrors: [] };
  const focus = Array.isArray(analysis.focus) ? analysis.focus.map((topic) => {
    if (!topic?.key) return topic;
    const left = kept.filter((e) => errorTopicKeys(e).includes(topic.key));
    const gone = (x) => dismissed.some((d) => d.said === x.said && d.corrected === x.corrected);
    return { ...topic, count: left.length, teacher: left.filter((e) => e.source === 'teacher').length, examples: (topic.examples || []).filter((x) => !gone(x)) };
  }).filter((topic) => !topic?.key || topic.count > 0) : analysis.focus;
  return { ...analysis, errors: kept, dismissedErrors: dismissed, ...(focus ? { focus } : {}) };
}

// a lesson (one recording or joined parts) with its analysis read through the marks; the Mac's own analysis stays
// in `analysisRaw` so the error list can show the dismissed ones and undo them
export function withErrorReview(recording) {
  if (!recording?.analysis || !Array.isArray(recording.analysis.errors)) return recording;
  if (recording.analysisRaw) return recording;
  return { ...recording, analysisRaw: recording.analysis, analysis: applyErrorReview(recording.analysis, recording.errorReview) };
}

const short = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
// the mark written on the recording and the copy for the Mac (analyzerFeedback/{recordingId}_{key})
export function dismissalEntry({ error, reason = '', user, at = new Date().toISOString() }) {
  return {
    said: short(error.said, 600), corrected: short(error.corrected, 600), kind: short(error.kind, 60),
    source: error.source === 'teacher' ? 'teacher' : 'gec', startMs: Math.round(Number(error.startMs) || 0),
    reason: short(reason, 200), byUid: user?.uid || '', byName: short(user?.displayName || user?.email || '', 160), at,
  };
}
export function feedbackEntry({ entry, recording }) {
  const { startMs: _startMs, ...rest } = entry;
  return { ...rest, lang: recording?.language === 'en' ? 'en' : 'et', recordingId: String(recording?.id || '') };
}
