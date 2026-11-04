'use strict';
// Didactic analysis of a finished lesson, made on the school Mac with local models (Ollama), nothing leaves the Mac:
//   errors  — every Estonian sentence of the learner is corrected by TartuNLP's Estonian GEC model
//             (tartuNLP/Llammas-base-p1-llama-errors-p2-GEC); a sentence that changed is a likely error
//   summary — a general local model (gemma3) reads the whole lesson and writes for the teacher: what the learner
//             liked, what was hard, what to do next
// Both are guesses of a model and only the teacher (and admins) see them (Firestore rules: a finished recording is
// not readable by the student). Pure helpers here; the Ollama calls are in index.js.

// 2: the summary is written in Russian (gemma3's Estonian had many errors; the teachers read Russian)
// 3: one analysis per lesson — the parts of one invitation on one day (a reload starts a new recording) together
// 4: only real Estonian phrases are checked (owner 2026-10-10: half of the „errors” were recognition noise in English
//    or Portuguese, lists of one word's forms were „corrected” into wrong forms, the summary gave the teacher's words
//    to the learner): lines with unsure words, foreign fragments and form lists are left out; `speech` counts the
//    learner's words and Estonian words the same way, `checked` how many sentences were checked
// 5: the summary retells in its own words (no copied lines) and „meeldis” holds only what went well
// 6: cleaner errors (owner 2026-10-11, Monika's lesson): invented subtitle lines and English noise are left out of
//    old transcripts too; a learner's sentence that repeats the teacher's line (echo, reading after the teacher) or
//    that the learner corrects himself within a few seconds is not judged; a „correction” that rewrites more than
//    half of the sentence is the model's guess and is dropped; every error gets a kind (sõnajärg, vorm, sõna puudu,
//    liigne sõna, sõnavara)
// 7: the teacher's recasts are errors too, and the most reliable ones (the teacher repeats the learner's sentence or
//    word correctly within a few seconds: „Ma lähen raamatukogu.” — „Raamatukokku.”); the summary gets the error
//    topics counted from the errors (word order, cases after a verb, verb forms…) and „raske” starts with them, so
//    the advice is about this learner's real errors, not general words (owner 2026-10-11)
const ANALYSIS_VERSION = 7;
const MAX_SENTENCES = 60;
const MAX_TRANSCRIPT_CHARS = 60000;

const CYRILLIC = /[а-яё]/i;
const words = (s) => String(s || '').split(/\s+/).filter(Boolean);
const clock = (ms) => { const s = Math.floor((ms || 0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// words that are not Estonian: recognition noise of the transcriber in a mixed lesson comes out as English or
// Portuguese fragments tagged as Estonian („The bovli out of the book”, „Minera é sra do pojo”)
const FOREIGN_WORDS = new Set(['the', 'you', 'i', "i'm", 'im', 'it', "it's", 'is', 'are', 'and', 'to', 'of', 'out', 'way', 'get', 'got', 'be', 'able', 'want', "don't", 'dont', 'know', 'yeah', 'guys', 'my', 'what', 'this', 'that', 'with', 'for', 'right', 'down', 'from', 'were', 'was', 'will', "i'll", 'still', 'dear', 'okay', 'ok', 'oh', 'so', 'yes', 'here', 'there', 'they', 'we', 'he', 'she', 'not', 'but', 'have', 'has', 'can', 'do', 'é', 'de', 'que', 'em', 'um', 'uma', 'por', 'para', 'com', 'sra', 'eu']);
const NOT_ESTONIAN_LETTERS = /[éèêëçãâàáíóúñwxyqc]|'/i;
const letterWords = (s) => String(s || '').toLocaleLowerCase('et').split(/\s+/).map((w) => w.replace(/^[^\p{L}']+|[^\p{L}']+$/gu, '')).filter(Boolean);
function looksEstonian(text) {
  const list = letterWords(text);
  if (!list.length || NOT_ESTONIAN_LETTERS.test(text)) return false;
  const foreign = list.filter((w) => FOREIGN_WORDS.has(w)).length;
  return foreign === 0 || foreign / list.length < 0.34;
}
// a list of one word's forms read from a table („käsi, käe, kätt”, „Jõgi jõe jõge”): not a sentence to correct
function isFormList(text) {
  const pieces = String(text).split(',').map((x) => x.trim()).filter(Boolean);
  if (pieces.length >= 2 && pieces.every((x) => words(x).length <= 1)) return true;
  const list = letterWords(text);
  return list.length >= 2 && list.length <= 4 && list.every((w) => w.slice(0, 2) === list[0].slice(0, 2));
}

// the learner's sentences in the lesson language (older lines have no `lang`: those without Cyrillic count),
// at least two words, at most MAX_SENTENCES; `unsure` when the line had words the transcriber was unsure of
// with the EKI level vocabularies (`forms`): misheard Estonian has several words that do not exist („Ja tolge need
// pisud”); a learner's real error usually has one („Olulik näitaja”), so at most one unknown word is allowed
function knownEnough(text, forms) {
  if (!forms) return true;
  const list = letterWords(text).filter((w) => w.length > 1);
  if (!list.length) return false;
  const unknown = list.filter((w) => !wordLevel(w, forms)).length;
  return unknown <= 1 && unknown / list.length <= 0.5;
}

// word overlap of two sentences (0…1, of the shorter one), for echoes and self-corrections
const bag = (s) => plain(s).split(' ').filter(Boolean);
// the same word, maybe in another form (raamatukogu ~ raamatukokku, pood ~ poe, sõbrad ~ sõpru); short words exactly
function sameWord(w, x) {
  if (w === x) return true;
  if (w.length <= 2 || x.length <= 2) return false;
  return w.slice(0, 3) === x.slice(0, 3) || (Math.min(w.length, x.length) <= 4 && w.slice(0, 2) === x.slice(0, 2));
}
// `b` repairs `a`: a word of `a` comes back in another form, or the same words come in another order
// („Ma lähen poodi. Ma lähen kooli.” are two sentences, „Esimene ma valin pood. Esimeseks ma valin poe.” a repair)
function repairs(a, b) {
  const A = bag(a); const B = bag(b);
  if (A.some((w) => !B.includes(w) && B.some((x) => x !== w && sameWord(w, x)))) return true;
  return A.length === B.length && [...A].sort().join(' ') === [...B].sort().join(' ');
}
// how many words of `a` are in `b` (in some form)
const matched = (a, b) => { const B = bag(b); return bag(a).filter((w) => B.some((x) => sameWord(w, x))).length; };
const ECHO_MS = 20000; // the learner repeats the teacher's line within this time
const SELF_FIX_MS = 30000; // the learner says the sentence again, corrected, within this time (the teacher may help between)

function learnerSentences(transcript = [], lang = 'et', forms = null) {
  const all = rawLearnerSentences(transcript, lang, forms);
  const teacher = transcript.filter((l) => l.speaker === 'teacher');
  return all.filter((s, i) => {
    // an echo: the teacher said (almost) the same just before — repeating or reading after the teacher
    const n = bag(s.text).length;
    if (n >= 3 && teacher.some((t) => t.startMs <= s.startMs && s.startMs - t.startMs <= ECHO_MS && plain(t.text).length && matched(s.text, t.text) / n >= 0.8 && bag(t.text).length >= n - 1)) return false;
    // a self-correction: the learner's next sentence soon after is the same sentence said differently
    const next = all[i + 1];
    const m = next ? bag(next.text).length : 0;
    if (next && n >= 2 && m >= 2 && next.startMs - s.startMs <= SELF_FIX_MS && plain(next.text) !== plain(s.text) && matched(s.text, next.text) / Math.max(n, m) >= 0.6 && repairs(s.text, next.text)) return false;
    return true;
  }).slice(0, MAX_SENTENCES);
}

function rawLearnerSentences(transcript = [], lang = 'et', forms = null) {
  const out = [];
  for (const line of transcript) {
    if (line.speaker !== 'student') continue;
    if (line.lang ? line.lang !== lang : CYRILLIC.test(line.text)) continue;
    // the transcriber was unsure of a word: the line may be misheard, so it is not judged
    if (line.unsure?.length) continue;
    for (const sentence of String(line.text).split(/(?<=[.!?…])\s+/)) {
      const text = sentence.trim();
      if (words(text).length < 2 || CYRILLIC.test(text) || !/\p{L}/u.test(text)) continue;
      if (lang === 'et' && (!looksEstonian(text) || isFormList(text) || !knownEnough(text, forms))) continue;
      out.push({ startMs: line.startMs, text, unsure: false });
      if (out.length >= MAX_SENTENCES * 2) return out;
    }
  }
  return out;
}

// a correction counts only when words changed, not just punctuation or capitals
const plain = (s) => words(String(s || '').toLocaleLowerCase('et').replace(/[.,!?;:…"„“”«»()-]+/g, ' ')).join(' ');
function isCorrection(said, corrected) {
  const a = plain(said);
  const b = plain(corrected);
  return Boolean(a && b) && a !== b;
}

// The GEC model's answer as an error: null when nothing changed or when the „correction” rewrote more than half of
// the words (then it guessed a different sentence: „Esimene ma saan pood” → „Esimene, kust ma saan poe”), else the
// kind of change
function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i += 1) for (let j = 1; j <= b.length; j += 1) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
}
function errorKind(said, corrected) {
  const a = bag(said); const b = bag(corrected);
  const kinds = [];
  const gone = a.filter((w) => !b.includes(w)); const added = b.filter((w) => !a.includes(w));
  const formOf = gone.filter((w) => added.some((x) => sameWord(w, x)));
  const otherGone = gone.filter((w) => !formOf.includes(w));
  const otherAdded = added.filter((x) => !formOf.some((w) => sameWord(w, x)));
  // the order of the words both sentences have (in some form) changed
  const keyOf = (list) => list.map((w) => w.slice(0, 3));
  const common = a.filter((w) => b.some((x) => sameWord(w, x)));
  const inB = b.filter((x) => a.some((w) => sameWord(w, x)));
  if (common.length > 1 && lcs(keyOf(common), keyOf(inB)) < Math.min(common.length, inB.length)) kinds.push('sõnajärg');
  if (formOf.length) kinds.push('vorm');
  if (otherGone.length && otherAdded.length) kinds.push('sõnavara');
  else if (otherAdded.length) kinds.push('sõna puudu');
  else if (otherGone.length) kinds.push('liigne sõna');
  return kinds.join(', ') || 'vorm';
}
function judgeCorrection(said, corrected) {
  if (!isCorrection(said, corrected)) return null;
  const n = bag(said).length;
  if (n >= 3 && matched(said, corrected) / n < 0.5) return null;
  return { kind: errorKind(said, corrected) };
}

// ── the teacher's recasts ──
const RECAST_MS = 20000;
const sentencesIn = (text) => String(text || '').split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter(Boolean);
function replaceWord(text, from, to) {
  const re = new RegExp(`(^|[^\\p{L}])${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^\\p{L}])`, 'iu');
  return re.test(text) ? text.replace(re, (m, pre) => `${pre}${to}`) : '';
}
function teacherRecasts(transcript = [], lang = 'et', forms = null) {
  const learner = rawLearnerSentences(transcript, lang, null);
  const teacher = transcript.filter((l) => l.speaker === 'teacher' && (l.lang ? l.lang === lang : !CYRILLIC.test(l.text)));
  const out = [];
  for (const s of learner) {
    const n = bag(s.text).length;
    if (n < 2) continue;
    let corrected = '';
    for (const line of teacher.filter((l) => l.startMs > s.startMs && l.startMs - s.startMs <= RECAST_MS)) {
      for (const t of sentencesIn(line.text)) {
        const m = bag(t).length;
        // a question is not a recast; misheard teacher speech („Eesmärkide tell”) has words that do not exist
        if (!m || plain(t) === plain(s.text) || CYRILLIC.test(t) || /\?/.test(t) || !knownEnough(t, forms)) continue;
        // the whole sentence again, corrected
        if (m >= 2 && m <= n + 4 && matched(s.text, t) / n >= 0.5 && matched(t, s.text) / m >= 0.5 && judgeCorrection(s.text, t)) { corrected = t; break; }
        // only the corrected word, one word alone („Raamatukokku.”, „Järgmiseks.”)
        if (m === 1) {
          const pair = bag(s.text).flatMap((w) => bag(t).filter((x) => x !== w && sameWord(w, x) && x.length >= 3).map((x) => [w, x]))[0];
          const fixed = pair ? replaceWord(s.text, pair[0], pair[1]) : '';
          if (fixed && plain(fixed) !== plain(s.text)) { corrected = fixed; break; }
        }
      }
      if (corrected) break;
    }
    if (corrected) out.push({ startMs: s.startMs, said: s.text, corrected, kind: errorKind(s.text, corrected), source: 'teacher' });
  }
  return out;
}

// ── error topics for the teacher (counted, with examples) ──
const CASE_END = /(sse|kku|st|lt|le|ks|ga|ni|na|ta|s|l)$/;
const VERB_END = /(ma|da|ta|n|b|d|me|te|vad|sin|sid|si|s)$/;
const TOPICS = {
  order: 'Порядок слов: глагол на втором месте (Õhtuti teen ma…, Kuna…, ei tulnud ma)',
  cases: 'Падеж после глагола и места: kuhu? kus? kust? kellega? (lähen raamatukokku, ostan poest)',
  verb: 'Формы глагола: время, лицо, ma-/da-инфинитив',
  form: 'Формы слов: падеж и число (palju sõpru, valin poe)',
  missing: 'Пропущенные слова (on, et, see, oma)',
  extra: 'Лишние слова',
  vocab: 'Выбор слова',
};
function errorTopicKeys(e) {
  const keys = new Set();
  const kind = String(e.kind || '');
  if (kind.includes('sõnajärg')) keys.add('order');
  if (kind.includes('sõna puudu')) keys.add('missing');
  if (kind.includes('liigne sõna')) keys.add('extra');
  if (kind.includes('sõnavara')) keys.add('vocab');
  if (kind.includes('vorm')) {
    const a = bag(e.said); const b = bag(e.corrected);
    const pairs = a.filter((w) => !b.includes(w)).flatMap((w) => b.filter((x) => !a.includes(x) && sameWord(w, x)).map((x) => [w, x]));
    for (const [, x] of pairs) keys.add(CASE_END.test(x) && x.length > 4 ? 'cases' : VERB_END.test(x) ? 'verb' : 'form');
    if (!pairs.length) keys.add('form');
  }
  return [...keys];
}
function errorTopics(errors = [], limit = 4) {
  const map = new Map();
  for (const e of errors) for (const key of errorTopicKeys(e)) {
    const item = map.get(key) || { key, topic: TOPICS[key], count: 0, teacher: 0, examples: [] };
    item.count += 1;
    if (e.source === 'teacher') item.teacher += 1;
    if (item.examples.length < 2 || (e.source === 'teacher' && !item.examples.some((x) => x.source === 'teacher'))) {
      item.examples = [...item.examples, { said: e.said, corrected: e.corrected, source: e.source || 'gec' }].sort((x, y) => (y.source === 'teacher') - (x.source === 'teacher')).slice(0, 2);
    }
    map.set(key, item);
  }
  return [...map.values()].sort((a, b) => b.teacher - a.teacher || b.count - a.count).slice(0, limit);
}
const focusLine = (t) => `${t.topic} — ${t.count} раз: ${t.examples.map((x) => `«${x.said}» → «${x.corrected}»`).join('; ')}`.slice(0, 300);
// the summary's „raske” starts with the counted topics (at most 3), the model's own points follow
function withFocus(summary, topics = []) {
  const lines = topics.filter((t) => t.count >= 2).slice(0, 3).map(focusLine);
  if (!lines.length) return summary;
  const base = summary || { kokkuvote: '', meeldis: [], raske: [], jargmiseks: [] };
  return { ...base, raske: [...lines, ...(base.raske || [])].slice(0, 5) };
}

// ── teachers' „Pole viga” (owner 2026-11-04) ──
// A teacher marks a flagged error as not an error on the student card; the CRM stores a copy in `analyzerFeedback`
// (said, corrected, recordingId…). The same correction (said → corrected, compared without capitals and punctuation)
// dismissed in at least FEEDBACK_MIN different lessons is the model's habit, not the learner's error: it is skipped.
const FEEDBACK_MIN = 2;
const feedbackPair = (said, corrected) => `${plain(said)}→${plain(corrected)}`;
function dismissedPairs(items = [], min = FEEDBACK_MIN) {
  const lessons = new Map();
  for (const x of items) {
    if (!x?.said || !x?.corrected) continue;
    const key = feedbackPair(x.said, x.corrected);
    if (!lessons.has(key)) lessons.set(key, new Set());
    lessons.get(key).add(x.recordingId || `${lessons.get(key).size}`);
  }
  return new Set([...lessons].filter(([, ids]) => ids.size >= min).map(([key]) => key));
}
const isDismissed = (pairs, said, corrected) => Boolean(pairs?.size) && pairs.has(feedbackPair(said, corrected));

const GEC_PROMPT = (sentence) => `### Instruction:\nReply with a corrected version of the input sentence in Estonian with all grammatical and spelling errors fixed. If there are no errors, reply with a copy of the original sentence.\n\n### Input:\n${sentence}\n\n### Response:\n`;

function summaryPrompt(transcript = [], topics = []) {
  let text = transcript.map((l) => `[${clock(l.startMs)}] ${l.speaker === 'student' ? 'Õpilane' : 'Õpetaja'}: ${l.text}`).join('\n');
  if (text.length > MAX_TRANSCRIPT_CHARS) text = `${text.slice(0, MAX_TRANSCRIPT_CHARS)}\n[…]`;
  return `Ты опытный методист, преподаватель эстонского языка как второго. Ниже расшифровка урока эстонского языка (автоматическое распознавание речи, возможны ошибки распознавания). «Õpilane» — ученик, «Õpetaja» — учитель. Родной язык ученика обычно русский.

Напиши учителю короткий разбор урока на русском языке в виде JSON, только JSON, без другого текста:
{"kokkuvote": "2-3 предложения о том, что было на уроке", "meeldis": ["что ученику понравилось или где он был активен — с доказательством из текста"], "raske": ["что было трудно: где ученик запинался, переходил на русский, отвечал односложно"], "jargmiseks": ["2-3 конкретных совета на следующий урок"]}
Пиши своими словами, коротко (одно предложение на пункт), не копируй реплики целиком. В «meeldis» — только то, что у ученика получилось или где он был активен (не трудности). В «raske» — конкретные языковые трудности (какие формы, слова, темы). В «jargmiseks» — что делать на следующем уроке, без цитат. Опирайся только на реплики с пометкой «Õpilane»; слова учителя («Õpetaja») никогда не приписывай ученику. Списки форм одного слова («käsi, käe, kätt») — это чтение таблицы, а не ошибки речи. Обрывки на английском или другом языке — скорее всего ошибки распознавания, не делай по ним выводов. В каждом пункте не больше двух отметок времени вида 12:34. Не придумывай того, чего нет в тексте. Технические проблемы со связью не анализируй. Если доказательств нет, оставь список пустым.

${topics.length ? `Проверенные факты об ошибках ученика (посчитаны по уроку, на них опирай «raske» и «jargmiseks»; советы — конкретно по этим темам, с примером исправления):
${topics.map((t) => `- ${focusLine(t)}`).join('\n')}

` : ''}Расшифровка:
${text}`;
}

// the model's JSON → a small, safe shape (strings only, short, a few items)
function parseSummary(raw) {
  let data;
  try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
  if (!data || typeof data !== 'object') return null;
  const str = (v, max = 600) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const list = (v) => (Array.isArray(v) ? v.map((x) => str(x, 300)).filter(Boolean).slice(0, 5) : []);
  const summary = { kokkuvote: str(data.kokkuvote), meeldis: list(data.meeldis), raske: list(data.raske), jargmiseks: list(data.jargmiseks) };
  return summary.kokkuvote || summary.meeldis.length || summary.raske.length || summary.jargmiseks.length ? summary : null;
}

// The parts of one lesson: recordings of the same invitation started on the same (local) day, in time order. Their
// lines are joined with each part's times moved by its start (the CRM joins them the same way: lessonTimeline.js).
const localDay = (iso) => { const d = new Date(iso || ''); return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function lessonParts(rec, all = []) {
  const day = localDay(rec.startedAt);
  return all.filter((r) => r.id === rec.id || (rec.invitationId && r.invitationId === rec.invitationId && localDay(r.startedAt) === day))
    .sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)));
}
function joinedTranscript(parts = []) {
  const t0 = Date.parse(parts[0]?.startedAt || '') || 0;
  return parts.flatMap((part) => {
    const shift = Math.max(0, (Date.parse(part.startedAt || '') || t0) - t0);
    return (part.transcript || []).map((l) => ({ ...l, startMs: (l.startMs || 0) + shift, endMs: (l.endMs || 0) + shift }));
  }).filter((l) => cleanText(l.text) && !isEnglishNoise(l.text, l.lang || 'et'));
}
// a lesson is analysed once all its parts are finished (done or failed)
const partsFinished = (parts) => parts.every((p) => p.status === 'done' || p.status === 'failed');

// ── level filter for what the models write (didactics/levels.js + the EKI level vocabularies, docs/DIDACTIC_ENGINE.md)
// The CRM's ES modules are loaded once (dynamic import); in the installed copy they sit in ./didactics, in the
// repository in crm-v2/src/features/worksheet-studio/didactics.
const fs = require('node:fs');
const { cleanText, isEnglishNoise } = require('./lib');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const DIDACTICS_DIRS = [process.env.DIDACTICS_DIR, path.join(__dirname, 'didactics'), path.join(__dirname, '../../crm-v2/src/features/worksheet-studio/didactics')].filter(Boolean);
let didactics = null;
async function loadDidactics() {
  if (didactics) return didactics;
  const dir = DIDACTICS_DIRS.find((d) => fs.existsSync(path.join(d, 'levels.js')));
  if (!dir) return null;
  const levels = await import(pathToFileURL(path.join(dir, 'levels.js')).href);
  // one file per level (levelForms.A1.json … levelForms.C1.json)
  const forms = {};
  for (const level of FORM_LEVELS) {
    try { forms[level] = new Set(String(JSON.parse(fs.readFileSync(path.join(dir, `levelForms.${level}.json`), 'utf8')).forms || '').split('\n')); } catch { /* level missing */ }
  }
  // EKI's grammar profile (grammarProfile.json): per level the topics with their „oskab” statement
  let grammarProfile = null;
  try { grammarProfile = JSON.parse(fs.readFileSync(path.join(dir, 'grammarProfile.json'), 'utf8')).levels || null; } catch { grammarProfile = null; }
  didactics = { ...levels, forms: Object.keys(forms).length ? forms : null, grammarProfile };
  return didactics;
}
const FORM_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const ALLOWED_FORMS = { A1: ['A1'], A2: ['A1', 'A2'], 'A2+': ['A1', 'A2'], 'B1-': ['A1', 'A2', 'B1'], B1: ['A1', 'A2', 'B1'], B2: ['A1', 'A2', 'B1', 'B2'], C1: FORM_LEVELS };
function wordLevel(word, forms) {
  const w = String(word || '').toLocaleLowerCase('et');
  if (!forms || !w) return null;
  const direct = FORM_LEVELS.find((l) => forms[l]?.has(w));
  if (direct) return direct;
  // a -mine noun in any form counts as its verb („raiskamisest” → raiskama), as in the CRM (levelVocabulary.js)
  const mine = /^(.{2,})mi(ne|se|st|sel|sele|selt|ses|sesse|sest|seks|seni|sena|seta|sega|sed|ste|si|sid|sile|sil|silt|sis|sisse|sist|siks)$/.exec(w);
  if (mine) { const verb = FORM_LEVELS.find((l) => forms[l]?.has(`${mine[1]}ma`)); if (verb) return verb; }
  for (let i = 3; i <= w.length - 3; i += 1) {
    const a = FORM_LEVELS.findIndex((l) => forms[l]?.has(w.slice(0, i)));
    const b = FORM_LEVELS.findIndex((l) => forms[l]?.has(w.slice(i)));
    if (a >= 0 && b >= 0) return FORM_LEVELS[Math.max(a, b)];
  }
  return null;
}
// the words of a text above the level (names, numbers and short words skipped); [] when the level is not checked
function hardWords(text, key, forms) {
  const allowed = ALLOWED_FORMS[key];
  if (!allowed || !forms) return [];
  return [...new Set(String(text).split(/(?<=[.!?…])\s+/).flatMap((sentence) => sentence.split(/\s+/).map((raw, i) => ({ w: raw.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''), i })))
    .filter(({ w, i }) => w.length > 2 && !/\d/.test(w) && !(i > 0 && /^\p{Lu}/u.test(w)) && !w.includes('-'))
    .filter(({ w }) => { const lv = wordLevel(w, forms); return !lv || !allowed.includes(lv); })
    .map(({ w }) => w.toLocaleLowerCase('et')))];
}
const wordsOf = (text) => String(text || '').split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

// ── „Paku laused” (constructor): gemma3 writes gap sentences, TartuNLP's GEC checks each one ──
function sentencesPrompt({ topic = '', level = 'A2', grammar = '', count = 8, norm = null, grammarList = [] } = {}) {
  const limits = norm ? ` Iga lause on lühike: keskmiselt umbes ${norm.sentence.avg} sõna, mitte üle ${norm.sentence.max} sõna. Kasuta ainult tasemele ${norm.label} sobivat lihtsat ja sagedast sõnavara.` : '';
  const known = grammarList.length ? ` Õpilane oskab juba: ${grammarList.slice(-8).join('; ')}.` : '';
  return `Sa koostad eesti keele töölehte tasemele ${level || 'A2'}${topic ? ` teemal "${topic}"` : ''}.
Kirjuta ${count} lihtsat, loomulikku ja mõttekat eestikeelset lauset, mis sobivad sellele tasemele. Igas lauses on täpselt üks sõna või vorm nurksulgudes: see on lünk, mille õpilane täidab, nt "Minu [ema] on õpetaja."${grammar ? ` Lünk harjutab: ${grammar} (lünka pane just see vorm).` : ''}${limits}${known}
Laused peavad olema grammatiliselt õiged ja tähenduselt loogilised (ei mingeid absurdseid lauseid). Ära korda sama lauset.
Vasta ainult JSON-ina: {"laused": ["...", "..."]}`;
}
// the model's JSON → sentences with exactly one [gap], cleaned, unique, at most `count`
function parseSentences(raw, count = 12) {
  let data;
  try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return []; }
  const list = Array.isArray(data?.laused) ? data.laused : Array.isArray(data) ? data : [];
  const seen = new Set();
  return list.map((x) => String(x || '').replace(/\s+/g, ' ').trim())
    .filter((x) => x.length <= 200 && (x.match(/\[[^\]]+\]/g) || []).length === 1)
    .filter((x) => { const k = x.toLocaleLowerCase('et'); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, count);
}
const withoutGap = (sentence) => String(sentence).replace(/\[([^\]]+)\]/, '$1');

// ── the learner's pet (student-readable `petLessonStats/{lessonId}`) ──
// Only simple, checked numbers and the learner's own sentences with their corrections: never the model's summary
// (that is for the teacher). Numbers come from the transcript, so the pet cannot be „farmed”.
const PET_PRACTICE = 5;
// the learner's words and the words in the lesson language (foreign noise tagged as the lesson language left out)
function learnerSpeech(transcript = [], lang = 'et') {
  const said = transcript.filter((l) => l.speaker === 'student');
  const count = (lines) => lines.reduce((n, l) => n + words(l.text).length, 0);
  const inLang = said.filter((l) => (l.lang ? l.lang === lang : !CYRILLIC.test(l.text)) && (lang !== 'et' || looksEstonian(l.text)));
  return { words: count(said), langWords: count(inLang) };
}

function petLessonStats({ parts = [], transcript = [], errors = [], lang = 'et' }) {
  const first = parts[0] || {};
  if (!first.studentUid || !first.studentId) return null;
  const { words: all, langWords } = learnerSpeech(transcript, lang);
  const longest = learnerSentences(transcript, lang).reduce((max, s) => Math.max(max, words(s.text).length), 0);
  const ends = parts.map((p) => Date.parse(p.endedAt || p.updatedAt || p.startedAt || '') || 0);
  const minutes = Math.max(0, Math.round((Math.max(...ends) - (Date.parse(first.startedAt || '') || 0)) / 60000));
  return {
    studentId: first.studentId, studentUid: first.studentUid, date: first.startedAt || '', minutes,
    studentWords: all, estonianWords: langWords, share: all ? Math.round((langWords / all) * 100) : 0, longest,
    practice: errors.filter((e) => !e.unsure && e.said && e.corrected).slice(0, PET_PRACTICE).map((e) => ({ said: e.said, corrected: e.corrected })),
    lang,
  };
}

// ── „Paku tekst” (constructor, reading block): a short text with questions under the level's norms ──
function readingPrompt({ topic = '', level = 'A2', norm = null, words = 0, grammar = '' } = {}) {
  const [lo, hi] = norm?.reading?.words || [80, 200];
  const target = Math.max(lo, Math.min(hi, Number(words) || Math.round((lo + hi) / 2)));
  const qn = norm?.reading?.questions?.[0] || 4;
  return `Kirjuta eesti keele õppijale tasemel ${norm?.label || level} lugemistekst${topic ? ` teemal "${topic}"` : ''}.
Tekstis on umbes ${target} sõna. Laused on keskmiselt umbes ${norm?.sentence?.avg || 9} sõna, mitte üle ${norm?.sentence?.max || 14} sõna. Kasuta tasemele sobivat sagedast sõnavara; tekst on loomulik, sidus ja huvitav, mitte sõnade loend.${grammar ? ` Tekstis on mitu näidet vormist: ${grammar}.` : ''}
Lisa ${qn + 1} küsimust teksti kohta, igaühele lühike õige vastus (1–4 sõna) tekstist.${norm?.reading?.inference ? ' Vähemalt üks küsimus algab sõnaga "Miks" või "Kuidas".' : ''}
Vasta ainult JSON-ina: {"pealkiri": "...", "tekst": "...", "kysimused": [{"kysimus": "...", "vastus": "..."}]}`;
}
function parseReading(raw) {
  let data;
  try { data = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return null; }
  const passage = String(data?.tekst || '').replace(/[ \t]+/g, ' ').trim();
  if (wordsOf(passage) < 20) return null;
  const questions = (Array.isArray(data?.kysimused) ? data.kysimused : [])
    .map((q) => ({ q: String(q?.kysimus || '').replace(/\s+/g, ' ').trim().slice(0, 200), a: String(q?.vastus || '').replace(/[[\]|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) }))
    .filter((q) => q.q && q.a).slice(0, 10);
  return { title: String(data?.pealkiri || '').replace(/\s+/g, ' ').trim().slice(0, 80), passage: passage.slice(0, 6000), questions };
}
function simplifyPrompt(text, hard, level) {
  return `Lihtsusta see eestikeelne tekst tasemele ${level}: asenda need sõnad lihtsamate ja sagedasematega või selgita neid lihtsalt: ${hard.slice(0, 20).join(', ')}. Hoia sisu, pikkus ja lausete arv samad. Vasta ainult JSON-ina: {"tekst": "..."}

Tekst:
${text}`;
}

// ── EKI text evaluation (etLex „Õppeteksti hindamine”): EKI answers only Estonian addresses, so the Mac asks it ──
const ETLEX_EVALUATION = 'https://etlex.eki.ee/etLex/api/v1.0/projects/etLex/evaluation';
const ETLEX_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
async function ekiEvaluate(text) {
  const res = await fetch(ETLEX_EVALUATION, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: String(text).replace(/\s+/g, ' ').trim().slice(0, 8000) }), signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`EKI ${res.status}`);
  return res.json();
}
// the same summary as functions/language-core.js summarizeEvaluation, plus the forms used per level (for a learner's text)
function summarizeEvaluation(data, level = 'A2') {
  const cap = ETLEX_LEVELS.indexOf(String(level || '').toUpperCase().slice(0, 2));
  const limit = cap >= 0 ? cap : 1;
  const words = (data?.evaluatedText || []).filter((t) => t.pos !== 'Z');
  const forms = (data?.evaluatedGrammarText || []).filter((t) => ETLEX_LEVELS.includes(t.level));
  const count = (list) => Object.fromEntries(ETLEX_LEVELS.map((l) => [l, list.filter((t) => t.level === l).length]));
  const unique = (list, pick, test) => { const seen = new Set(); return list.filter(test).map(pick).filter((x) => { const k = `${x.text}|${x.level}`; if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 40); };
  const above = (list, pick) => unique(list, pick, (t) => ETLEX_LEVELS.indexOf(t.level) > limit);
  // the highest-level grammatical forms the text uses (what the learner can already produce)
  const top = [...forms].sort((a, b) => ETLEX_LEVELS.indexOf(b.level) - ETLEX_LEVELS.indexOf(a.level));
  return {
    words: words.length, wordLevels: count(words), unknownWords: words.filter((t) => !ETLEX_LEVELS.includes(t.level)).length, formLevels: count(forms),
    aboveWords: above(words, (t) => ({ text: t.text, lemma: t.lemma, level: t.level })),
    aboveForms: above(forms, (t) => ({ text: t.text, lemma: t.lemma, level: t.level, form: t.formXinfo || t.form || '' })),
    topForms: unique(top, (t) => ({ text: t.text, level: t.level, form: t.formXinfo || t.form || '' }), () => true).slice(0, 8),
    lix: data?.textStat?.LixIndex ?? null,
  };
}
const sentencesOf = (text) => String(text || '').replace(/\s+/g, ' ').split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter((x) => wordsOf(x) >= 2);

// a finished recording with a transcript still waiting for (this version of) the analysis
const PASSING = /Ollama 5\d\d|timeout|aborted|fetch failed|DEADLINE/i;
function needsAnalysis(rec = {}) {
  if (!(rec.status === 'done' && Array.isArray(rec.transcript) && rec.transcript.length > 0)) return false;
  const a = rec.analysis;
  if (!(a && a.version >= ANALYSIS_VERSION)) return true;
  // a passing failure of this version is tried again (three attempts in all)
  return Boolean(a.error) && a.version === ANALYSIS_VERSION && PASSING.test(a.error) && (Number(a.attempts) || 1) < 3;
}

// the EKI grammar of a profile key: topics new on the level (targets) and those before (known)
const GRAMMAR_LEVEL = { A1: 'A1', A2: 'A2', 'A2+': 'A2', 'B1-': 'B1', B1: 'B1', B2: 'B2', C1: 'C1' };
function ekiGrammar(profile, key) {
  const order = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const level = GRAMMAR_LEVEL[key] || 'A2';
  const topics = (l) => (profile?.[l] || []).map((t) => t.topic);
  return { level, targets: topics(level), known: order.slice(0, order.indexOf(level)).flatMap(topics) };
}

module.exports = {
  FEEDBACK_MIN, feedbackPair, dismissedPairs, isDismissed,
  looksEstonian, isFormList, learnerSpeech, ekiEvaluate, summarizeEvaluation, sentencesOf, ekiGrammar, loadDidactics, wordLevel, hardWords, wordsOf, readingPrompt, parseReading, simplifyPrompt, petLessonStats, sentencesPrompt, parseSentences, withoutGap, lessonParts, joinedTranscript, partsFinished, ANALYSIS_VERSION, learnerSentences, isCorrection, judgeCorrection, errorKind, teacherRecasts, errorTopics, withFocus, GEC_PROMPT, summaryPrompt, parseSummary, needsAnalysis };
