// „Koosta kodutöö vigadest” (owner 2026-11-04): a short personal homework sheet made from ONE lesson's errors.
//   (a) „Paranda lause” — 4–6 of the learner's own sentences from the lesson (said → corrected by the school Mac),
//       ASR noise left out: short lines, corrections that rewrite most of the line, the teacher's own lines,
//       errors marked „Pole viga”, the same sentence twice.
//   (b) 4–6 controlled items on the lesson's top error topic, made by the network-free generator (lexicon forms of
//       real words, worksheet-generator/patterns): cases, word forms (koos + -ga, palju + osastav, osastav), verb
//       forms, verb-second word order. A topic the generator cannot cover gets more of the learner's own sentences.
// Nothing is sent from here: the teacher sees the rows, edits or removes them, and only „Saada õpilasele” assigns it.
import { createBlock } from '../worksheet-studio/engine/registry.js';
import { newDocument } from '../worksheet-studio/engine/schema.js';
import { generatePatternSentences } from '../worksheet-generator/patterns/engine.js';
import { inflect, lexeme, lexemesWithTags, placeForms } from '../worksheet-generator/lexicon/index.js';
import { errorTopicKeys } from './errorReview.js';

export const OWN_MIN = 4;
export const OWN_MAX = 6;
export const GENERATED_MIN = 4;
export const GENERATED_MAX = 6;
export const TOTAL_MAX = 10;

// the topic keys of the school Mac (analysis.js TOPICS), in plain Estonian for the teacher and the sheet
export const TOPIC_LABEL = {
  order: 'Sõnajärg: tegusõna on teisel kohal',
  cases: 'Kohakäänded: kus? kuhu? kust?',
  form: 'Sõnavormid: kääne ja arv',
  verb: 'Tegusõna vormid',
  missing: 'Puuduvad sõnad',
  extra: 'Liigsed sõnad',
  vocab: 'Sõnavalik',
};

const words = (s) => String(s || '').toLocaleLowerCase('et').replace(/[.,!?;:…"„“”«»()]+/g, ' ').split(/\s+/).filter(Boolean);
const pairKey = (said, corrected) => `${words(said).join(' ')}→${words(corrected).join(' ')}`;

// word-level edit distance (insert, delete, replace = 1; two neighbouring words swapped = 1, so a word-order fix
// „ma teen” → „teen ma” is one edit, not two)
export function wordDistance(a = [], b = []) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

// An error is a usable „Paranda lause” row only when it looks like a real learner sentence with a small, sure fix.
// Reasons are returned so the tests (and a curious teacher) can see why a line was left out.
export function rowProblem(error = {}) {
  if (!error?.said || !error?.corrected) return 'empty';
  if (error.source === 'teacher') return 'teacher';
  if (error.unsure === true || (Array.isArray(error.unsure) && error.unsure.length)) return 'unsure';
  const a = words(error.said);
  const b = words(error.corrected);
  if (a.length < 3 || b.length < 3) return 'short';
  if (a.length > 22) return 'long';
  const d = wordDistance(a, b);
  if (d === 0) return 'same';
  // a correction that changes more than a third of the line is more likely a misheard line than one error
  if (d > Math.max(2, Math.round(Math.max(a.length, b.length) * 0.34))) return 'rewrite';
  return '';
}

const id = (prefix, i) => `${prefix}${i}`;
const sentence = (s) => { const t = String(s || '').trim().replace(/\s+/g, ' '); return t ? t[0].toLocaleUpperCase('et') + t.slice(1) : t; };

// the learner's own rows: filtered, dismissed and duplicates out, the top topic first, then in lesson order
export function ownRows({ errors = [], dismissed = [], topicKey = '', max = OWN_MAX } = {}) {
  const gone = new Set(dismissed.filter((d) => d?.said && d?.corrected).map((d) => pairKey(d.said, d.corrected)));
  const seen = new Set();
  const kept = [];
  for (const error of errors) {
    if (rowProblem(error)) continue;
    const key = pairKey(error.said, error.corrected);
    const said = words(error.said).join(' ');
    const right = words(error.corrected).join(' ');
    if (gone.has(key) || seen.has(said) || seen.has(right)) continue;
    seen.add(said); seen.add(right);
    kept.push(error);
  }
  const onTopic = (e) => (topicKey && errorTopicKeys(e).includes(topicKey) ? 0 : 1);
  return kept
    .map((e, i) => ({ e, i }))
    .sort((x, y) => onTopic(x.e) - onTopic(y.e) || x.i - y.i)
    .slice(0, max)
    .sort((x, y) => (Number(x.e.startMs) || 0) - (Number(y.e.startMs) || 0))
    .map(({ e }, i) => ({ id: id('own', i), kind: 'fix', wrong: sentence(e.said), answer: sentence(e.corrected), startMs: Number(e.startMs) || 0 }));
}

// the lesson's top error topic: the Mac's `focus` (already counted again without „Pole viga”), else counted here
export function topTopic(analysis = {}) {
  const focus = (Array.isArray(analysis?.focus) ? analysis.focus : []).filter((t) => t?.key && (t.count ?? 1) > 0);
  if (focus.length) return focus[0].key;
  const counts = {};
  for (const e of analysis?.errors || []) for (const key of errorTopicKeys(e)) counts[key] = (counts[key] || 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

// ── controlled items from the lexicon (no AI, no network) ──
function seeded(seed) {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}
const shuffle = (list, random) => { const out = [...list]; for (let i = out.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; };
const uniqueWrong = (answer, options) => [...new Set(options.filter((o) => o && o.toLocaleLowerCase('et') !== String(answer).toLocaleLowerCase('et')))].slice(0, 3);

// one choice item: a sentence with a gap and the right form among other forms of the same word
const gapItem = (gapped, answer, wrong, hint = '') => {
  const options = uniqueWrong(answer, wrong);
  if (!answer || options.length < 2) return null;
  return { kind: 'choice', q: gapped.replace(/\[[^\]]+\]/, hint ? `___ (${hint})` : '___'), answer, wrong: options };
};

function fromPatterns(grammar, count, seed) {
  // a few spare sentences: one with too few wrong options or a repeated answer is dropped
  return generatePatternSentences({ grammar, count: count + 2, seed }).map((s) => gapItem(s.gapped, s.answer, s.distractors, s.lemma)).filter(Boolean).slice(0, count);
}

const KOOS_FRAMES = ['Täna lähen ma poodi koos [x].', 'Õhtul jalutan ma pargis koos [x].', 'Laupäeval sõidan ma Tartusse koos [x].', 'Pühapäeval söön ma lõunat koos [x].'];
function koosItems(count, random) {
  const people = shuffle(lexemesWithTags('family').filter((e) => !['perekond', 'pere'].includes(e.lemma)).map((e) => e.lemma), random);
  return people.slice(0, count).map((lemma, i) => gapItem(KOOS_FRAMES[i % KOOS_FRAMES.length].replace('x', inflect(lemma, 'sg kom')), inflect(lemma, 'sg kom'),
    [inflect(lemma, 'sg n'), inflect(lemma, 'sg g'), inflect(lemma, 'sg p')], lemma)).filter(Boolean);
}

const PALJU = [['Mul on palju [x].', ['sõber', 'raamat', 'pilt']], ['Tal on kodus palju [x].', ['raamat', 'pilt']], ['Meie linnas on palju [x].', ['maja', 'auto']], ['Peres on palju [x].', ['laps']]];
function paljuItems(count, random) {
  const all = PALJU.flatMap(([frame, lemmas]) => lemmas.filter((l) => lexeme(l) && inflect(l, 'pl p')).map((lemma) => ({ frame, lemma })));
  const seen = new Set();
  return shuffle(all, random).filter(({ lemma }) => !seen.has(lemma) && seen.add(lemma)).slice(0, count)
    .map(({ frame, lemma }) => gapItem(frame.replace('x', inflect(lemma, 'pl p')), inflect(lemma, 'pl p'), [inflect(lemma, 'sg n'), inflect(lemma, 'pl n'), inflect(lemma, 'sg p')], lemma)).filter(Boolean);
}

// verb second: „Homme lähen ma kooli.” against „Homme ma lähen kooli.” and „Homme ma kooli lähen.”
const PERSONS = [['ma', 'n'], ['sa', 'd'], ['ta', 'b'], ['me', 'me'], ['te', 'te'], ['nad', 'vad']];
const TIMES = ['Homme', 'Täna', 'Õhtul', 'Hommikul', 'Laupäeval', 'Pärast tööd'];
function orderItems(count, random) {
  const places = shuffle(lexemesWithTags('place').filter((e) => e.locative && placeForms(e.lemma)?.whereTo).map((e) => e.lemma), random);
  const times = shuffle(TIMES, random);
  const persons = shuffle(PERSONS, random);
  const out = [];
  for (let i = 0; i < places.length && out.length < count; i += 1) {
    const [pronoun, code] = persons[i % persons.length];
    const go = i % 2 === 0;
    const verb = inflect(go ? 'minema' : 'olema', code, 'verb');
    const place = go ? placeForms(places[i]).whereTo : placeForms(places[i]).where;
    if (!verb || !place) continue;
    const time = times[i % times.length];
    const right = `${time} ${verb} ${pronoun} ${place}.`;
    out.push({ kind: 'choice', q: 'Mis lause on õige?', answer: right, wrong: [`${time} ${pronoun} ${verb} ${place}.`, `${time} ${pronoun} ${place} ${verb}.`] });
  }
  return out;
}

// items for one topic; [] when the generator has nothing for it (missing / extra / vocab)
export function generatedItems({ topicKey = '', errors = [], count = GENERATED_MAX, seed = 'lesson' } = {}) {
  const random = seeded(`${seed}:${topicKey}`);
  const text = errors.map((e) => words(`${e.said} ${e.corrected}`).join(' ')).join(' ');
  let items = [];
  if (topicKey === 'cases') items = fromPatterns('local-cases', count, seed);
  else if (topicKey === 'order') items = orderItems(count, random);
  else if (topicKey === 'verb') items = [...fromPatterns('olema-present', Math.ceil(count / 2), seed), ...fromPatterns('past-simple', Math.floor(count / 2), seed)];
  else if (topicKey === 'form') {
    // the constructions the learner really missed come first: koos + kaasaütlev, palju + osastav
    const koos = /\bkoos\b/.test(text);
    const palju = /\b(palju|vähe|mitu)\b/.test(text);
    if (koos && palju) items = [...koosItems(Math.ceil(count / 2), random), ...paljuItems(Math.floor(count / 2), random)];
    else if (koos) items = koosItems(count, random);
    else if (palju) items = paljuItems(count, random);
    if (items.length < GENERATED_MIN) items = [...items, ...fromPatterns('partitive-object', count - items.length, seed)];
  }
  const answers = new Set();
  return items.filter((item) => !answers.has(item.answer) && answers.add(item.answer)).slice(0, count)
    .map((item, i) => ({ ...item, id: id('gen', i), topic: topicKey }));
}

// The draft: rows the teacher previews. Own rows 4–6 plus 4–6 generated; without generated items more own rows.
export function buildErrorHomework({ analysis = {}, seed = 'lesson' } = {}) {
  const errors = Array.isArray(analysis?.errors) ? analysis.errors : [];
  const dismissed = Array.isArray(analysis?.dismissedErrors) ? analysis.dismissedErrors : [];
  const topicKey = topTopic(analysis);
  const usable = errors.filter((e) => !rowProblem(e));
  let generated = generatedItems({ topicKey, errors: usable, seed });
  if (generated.length < GENERATED_MIN) generated = [];
  const own = ownRows({ errors, dismissed, topicKey, max: generated.length ? OWN_MAX : TOTAL_MAX });
  if (!own.length && !generated.length) return null;
  return { topicKey, topic: TOPIC_LABEL[topicKey] || '', rows: [...own, ...generated] };
}

const rowsOf = (rows, kind) => rows.filter((r) => r.kind === kind);
const choiceOptions = (row) => [`*${row.answer}`, ...row.wrong].join('\n');
// a row the teacher left empty after editing is dropped, never sent half-written
export const rowReady = (row) => (row.kind === 'fix' ? Boolean(String(row.wrong).trim() && String(row.answer).trim())
  : Boolean(String(row.q).trim() && String(row.answer).trim() && (row.wrong || []).filter((w) => String(w).trim()).length));

// The worksheet the student gets: „Paranda lause” (errorfix) + „Vali õige …” (choice), both scored by the engine.
export function errorHomeworkDocument({ rows = [], topicKey = '', studentName = '', date = '', level = '' } = {}) {
  const ready = rows.filter(rowReady);
  if (!ready.length) return null;
  const doc = newDocument();
  const goals = {};
  const blocks = [];
  const fixes = rowsOf(ready, 'fix');
  if (fixes.length) {
    const fix = createBlock('errorfix');
    fix.data = { ...fix.data, title: 'Paranda lause.', instruction: 'Need laused ütlesid sa tunnis. Kirjuta need õigesti.', rows: fixes.map((r) => ({ wrong: String(r.wrong).trim(), answer: String(r.answer).trim() })) };
    fix.goal = 'g_errors';
    goals.g_errors = 'Parandan oma vead tunnist';
    blocks.push(fix);
  }
  const choices = rowsOf(ready, 'choice');
  if (choices.length) {
    const block = createBlock('choice');
    block.data = { ...block.data, title: topicKey === 'order' ? 'Vali õige sõnajärg.' : 'Vali õige vorm.', instruction: TOPIC_LABEL[topicKey] || '',
      questions: choices.map((r) => ({ q: String(r.q).trim(), options: choiceOptions({ ...r, wrong: r.wrong.map((w) => String(w).trim()).filter(Boolean) }) })) };
    block.goal = 'g_topic';
    goals.g_topic = TOPIC_LABEL[topicKey] || 'Harjutan tunni teemat';
    blocks.push(block);
  }
  doc.meta = { ...doc.meta, title: `Kodutöö tunnist${date ? ` ${date}` : ''}`, subtitle: [studentName, TOPIC_LABEL[topicKey]].filter(Boolean).join(' · ') || 'Sinu vead tunnist', ...(level ? { level } : {}), goals };
  doc.blocks = blocks;
  return doc;
}

const SUBJECT = { en: 'Inglise keel', et: 'Eesti keel' };

// „Saada õpilasele” — the only place that writes. The same two records as any personal sheet given from a lesson:
//   1. the student's personal sheet + its assignment (studentWorksheets.save, status 'published', source
//      'student_private_worksheet') — scoring, the teacher's review and the student's „Töölehed” work unchanged;
//      the assignment keeps `origin: 'lesson-errors'`, `sourceRecordingId`, `sourceInvitationId`;
//   2. a homework task pointing at it (homework.createFromLesson, source 'lesson-errors', `recordingId`), which also
//      gives the assignment its due date and is marked done when the sheet is submitted.
export async function sendErrorHomework({ rows, topicKey = '', recording, student = null, user, due = '', date = '', services }) {
  if (!recording?.studentId) throw new Error('Õpilane puudub.');
  if (!user?.uid) throw new Error('Logi uuesti sisse.');
  const learner = { id: recording.studentId, name: student?.name || recording.studentName || '', subject: student?.subject || SUBJECT[recording.language] || SUBJECT.et, level: student?.level || '' };
  const document = errorHomeworkDocument({ rows, topicKey, studentName: learner.name, date, level: learner.level });
  if (!document) throw new Error('Lisa vähemalt üks täidetud rida.');
  document.meta.subject = learner.subject;
  const saved = await services.worksheets.forStudent(learner).save({
    document, user, status: 'published', origin: { kind: 'lesson-errors', recordingId: recording.id || '', invitationId: recording.invitationId || '' },
  });
  const title = saved.title || document.meta.title;
  const task = await services.homework.createFromLesson({
    invitation: { id: recording.invitationId || '', studentId: learner.id, studentName: learner.name },
    user, task: `Tee tööleht „${title}”`, due, worksheet: { id: saved.id, title }, source: 'lesson-errors', recordingId: recording.id || '',
  });
  return { assignmentId: saved.id, homeworkId: task?.id || '', title, due, document };
}
