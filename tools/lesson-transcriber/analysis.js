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
const ANALYSIS_VERSION = 3;
const MAX_SENTENCES = 60;
const MAX_TRANSCRIPT_CHARS = 60000;

const CYRILLIC = /[а-яё]/i;
const words = (s) => String(s || '').split(/\s+/).filter(Boolean);
const clock = (ms) => { const s = Math.floor((ms || 0) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

// the learner's sentences in the lesson language (older lines have no `lang`: those without Cyrillic count),
// at least two words, at most MAX_SENTENCES; `unsure` when the line had words the transcriber was unsure of
function learnerSentences(transcript = [], lang = 'et') {
  const out = [];
  for (const line of transcript) {
    if (line.speaker !== 'student') continue;
    if (line.lang ? line.lang !== lang : CYRILLIC.test(line.text)) continue;
    for (const sentence of String(line.text).split(/(?<=[.!?…])\s+/)) {
      const text = sentence.trim();
      if (words(text).length < 2 || CYRILLIC.test(text) || !/\p{L}/u.test(text)) continue;
      out.push({ startMs: line.startMs, text, unsure: Boolean(line.unsure?.length) });
      if (out.length >= MAX_SENTENCES) return out;
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

const GEC_PROMPT = (sentence) => `### Instruction:\nReply with a corrected version of the input sentence in Estonian with all grammatical and spelling errors fixed. If there are no errors, reply with a copy of the original sentence.\n\n### Input:\n${sentence}\n\n### Response:\n`;

function summaryPrompt(transcript = []) {
  let text = transcript.map((l) => `[${clock(l.startMs)}] ${l.speaker === 'student' ? 'Õpilane' : 'Õpetaja'}: ${l.text}`).join('\n');
  if (text.length > MAX_TRANSCRIPT_CHARS) text = `${text.slice(0, MAX_TRANSCRIPT_CHARS)}\n[…]`;
  return `Ты опытный методист, преподаватель эстонского языка как второго. Ниже расшифровка урока эстонского языка (автоматическое распознавание речи, возможны ошибки распознавания). «Õpilane» — ученик, «Õpetaja» — учитель. Родной язык ученика обычно русский.

Напиши учителю короткий разбор урока на русском языке в виде JSON, только JSON, без другого текста:
{"kokkuvote": "2-3 предложения о том, что было на уроке", "meeldis": ["что ученику понравилось или где он был активен — с доказательством из текста"], "raske": ["что было трудно: где ученик запинался, переходил на русский, отвечал односложно"], "jargmiseks": ["2-3 конкретных совета на следующий урок"]}
В каждом пункте не больше двух отметок времени вида 12:34. Не придумывай того, чего нет в тексте. Технические проблемы со связью не анализируй. Если доказательств нет, оставь список пустым.

Расшифровка:
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
  });
}
// a lesson is analysed once all its parts are finished (done or failed)
const partsFinished = (parts) => parts.every((p) => p.status === 'done' || p.status === 'failed');

// ── „Paku laused” (constructor): gemma3 writes gap sentences, TartuNLP's GEC checks each one ──
function sentencesPrompt({ topic = '', level = 'A2', grammar = '', count = 8 } = {}) {
  return `Sa koostad eesti keele töölehte tasemele ${level || 'A2'}${topic ? ` teemal "${topic}"` : ''}.
Kirjuta ${count} lihtsat, loomulikku ja mõttekat eestikeelset lauset, mis sobivad sellele tasemele. Igas lauses on täpselt üks sõna või vorm nurksulgudes: see on lünk, mille õpilane täidab, nt "Minu [ema] on õpetaja."${grammar ? ` Lünk harjutab: ${grammar} (lünka pane just see vorm).` : ''}
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

// a finished recording with a transcript still waiting for (this version of) the analysis
function needsAnalysis(rec = {}) {
  return rec.status === 'done' && Array.isArray(rec.transcript) && rec.transcript.length > 0
    && !(rec.analysis && rec.analysis.version >= ANALYSIS_VERSION);
}

module.exports = { sentencesPrompt, parseSentences, withoutGap, lessonParts, joinedTranscript, partsFinished, ANALYSIS_VERSION, learnerSentences, isCorrection, GEC_PROMPT, summaryPrompt, parseSummary, needsAnalysis };
