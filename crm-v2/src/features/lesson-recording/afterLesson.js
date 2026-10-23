// „Pärast tundi” (owner 2026-10-12): from the lesson analysis to the next steps in two clicks — homework on the
// learner's error topics and word cards from the corrected sentences (the learner writes his own sentence right).
const DAY = 24 * 60 * 60 * 1000;
const short = (value, max) => String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);

// the analysis' counted topics (transcriber v7 `focus`); older analyses have none
export function focusTopics(analysis) {
  return (Array.isArray(analysis?.focus) ? analysis.focus : []).filter((t) => t?.topic && t.count > 0).slice(0, 4);
}

const topicName = (topic) => short(String(topic).split('(')[0].split(':')[0], 80);

export function homeworkFromAnalysis({ analysis, recording, now = Date.now() }) {
  const topics = focusTopics(analysis);
  const errors = (analysis?.errors || []).filter((e) => !e.unsure && e.said && e.corrected).slice(0, 6);
  if (!topics.length && !errors.length) return null;
  const task = topics.length ? `Korda tunni teemasid: ${topics.slice(0, 2).map((t) => topicName(t.topic)).join('; ')}` : 'Paranda oma laused tunnist';
  const note = [
    'Kirjuta laused õigesti ja loe need valjusti:',
    ...errors.map((e) => `• ${short(e.said, 160)} → ?`),
    '',
    'Seejärel korda sõnakaarte (Sõnavara → tunni sõnad).',
  ].join('\n');
  return {
    studentId: recording?.studentId || '', studentName: recording?.studentName || '',
    task: short(task, 500), note: short(note, 2000),
    due: new Date(now + 3 * DAY).toISOString().slice(0, 10),
    invitationId: recording?.invitationId || '', source: 'lesson-analysis',
  };
}

// one card per corrected sentence: front = the right sentence, back = what the learner said (asked the other way, he
// writes his own sentence correctly); at most 10, no duplicates, within the word-card limits
export function cardsFromErrors(errors = []) {
  const seen = new Set();
  return (Array.isArray(errors) ? errors : [])
    .filter((e) => !e?.unsure && e?.said && e?.corrected)
    .map((e) => ({ word: short(e.corrected, 120), translation: short(`Sinu lause: ${e.said}`, 200) }))
    .filter((card) => card.word && !seen.has(card.word) && seen.add(card.word))
    .slice(0, 10);
}

// „Kokkuvõte vanemale” (owner 2026-10-23): the lesson's error topics in a few plain lines for the family, in Estonian and
// Russian (most families speak Russian). Only topics and a count — never the transcript, which stays with the teacher
// (firestore.rules, lessonRecordings). The teacher reads and edits it before it goes into the lesson summary.
export function parentNoteFromAnalysis({ analysis }) {
  const topics = focusTopics(analysis).map((t) => topicName(t.topic)).filter(Boolean);
  const fixed = (analysis?.errors || []).filter((e) => !e.unsure && e.said && e.corrected).length;
  if (!topics.length && !fixed) return '';
  const et = [
    fixed ? `Tunnis rääkisime palju ja parandasime ${fixed} lauset.` : 'Tunnis rääkisime palju.',
    topics.length ? `Tähelepanu vajab: ${topics.slice(0, 3).join('; ')}.` : '',
    'Kodus: iga päev „Päeva 5 minutit” (Sõnavara) ja kodutöö.',
  ].filter(Boolean);
  const ru = [
    fixed ? `На уроке много говорили и исправили ${fixed} фраз.` : 'На уроке много говорили.',
    topics.length ? `Над чем поработать: ${topics.slice(0, 3).join('; ')}.` : '',
    'Дома: каждый день «Päeva 5 minutit» (Sõnavara) и домашнее задание.',
  ].filter(Boolean);
  return [...et, '', ...ru].join('\n');
}
