// „Areng tundide kaupa” (owner 2026-11-04): the learner's numbers per analysed lesson, oldest first, for the staff
// view of the student card. Everything is counted in the browser from what is already stored on the recordings
// (transcript + the school Mac's `analysis`); nothing new is written. The lessons come from groupRecordings, so the
// teacher's „Pole viga” marks are already applied (errorReview.js).
import { lessonAnalysis } from './lessonTimeline.js';

const CYRILLIC = /[а-яё]/i;
const round1 = (n) => Math.round(n * 10) / 10;
const wordCount = (text) => String(text || '').split(/\s+/).filter(Boolean).length;
// the learner's words in the lesson language (lines without `lang` count when they have no Cyrillic)
const lessonWords = (line, lang) => (line.lang ? line.lang === lang : !CYRILLIC.test(String(line.text || '')))
  ? String(line.text || '').toLocaleLowerCase('et').split(/\s+/).map((w) => w.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')).filter((w) => w.length >= 2 && /^\p{L}+$/u.test(w))
  : [];

// the error kinds of the Mac (sõnajärg, vorm, sõna puudu, liigne sõna, sõnavara), most frequent first
export function topErrorKinds(errors = [], limit = 3) {
  const counts = new Map();
  for (const e of errors) for (const kind of String(e?.kind || '').split(',').map((k) => k.trim()).filter(Boolean)) counts.set(kind, (counts.get(kind) || 0) + 1);
  return [...counts].map(([kind, count]) => ({ kind, count })).sort((a, b) => b.count - a.count || a.kind.localeCompare(b.kind, 'et')).slice(0, limit);
}

export function lessonTrend(lessons = []) {
  const done = lessons.filter((r) => r?.status === 'done' && Array.isArray(r.transcript) && r.transcript.length)
    .sort((a, b) => String(a.startedAt || '').localeCompare(String(b.startedAt || '')));
  const seen = new Set();
  return done.map((r, index) => {
    const lang = r.language === 'en' ? 'en' : 'et';
    const a = lessonAnalysis(r.transcript);
    const lines = r.transcript.filter((l) => l.speaker === 'student' && wordCount(l.text));
    const analysed = Boolean(r.analysis && !r.analysis.error && Array.isArray(r.analysis.errors));
    const errors = analysed ? r.analysis.errors : [];
    // errors are judged only in the lesson language: per 100 of those words (the Mac's count, else the transcript's)
    const vocabulary = new Set(lines.flatMap((l) => lessonWords(l, lang)));
    const langWords = Number(r.analysis?.speech?.langWords) || lines.reduce((n, l) => n + lessonWords(l, lang).length, 0);
    const fresh = [...vocabulary].filter((w) => !seen.has(w)).length;
    vocabulary.forEach((w) => seen.add(w));
    return {
      id: r.id, date: r.startedAt || '', title: r.title || 'Tund',
      share: a.studentShare,
      words: a.student.words,
      utterance: lines.length ? round1(a.student.words / lines.length) : 0,
      errors: analysed ? errors.length : null,
      per100: analysed && langWords ? round1((errors.length / langWords) * 100) : null,
      kinds: analysed ? topErrorKinds(errors) : [],
      dismissed: Array.isArray(r.analysis?.dismissedErrors) ? r.analysis.dismissedErrors.length : 0,
      distinct: vocabulary.size,
      // the first lesson has nothing to compare with
      newWords: index ? fresh : null,
    };
  });
}
