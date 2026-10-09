'use strict';
// Pure helpers of the lesson transcriber (tested with node:test).

// Lines whisper tends to invent on silence or music; dropped before they reach the teacher.
const JUNK = [
  /^\s*[[(].*[\])]\s*$/, // [MUSIC], (inaudible)
  /subtitles? (by|made)/i, /субтитры/i, /redaktor subtiitrite/i, /tõlkis/i,
  /^\s*(thank you|thanks for watching)\.?\s*$/i, /продолжение следует/i,
  /^[^\p{L}\p{N}]*$/u, // only punctuation („.”, „…”)
];

// Whisper sometimes loops („ja, ja, ja, …”, „to be able to be able …”): a word or a group of up to 6 words repeated
// three or more times in a row is kept once.
function collapseRepeats(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const norm = (w) => w.toLocaleLowerCase().replace(/[.,!?;:…"„“”]+/g, '');
  const out = [];
  let i = 0;
  while (i < words.length) {
    let skipped = false;
    for (let n = 6; n >= 1 && !skipped; n -= 1) {
      if (i + n * 3 > words.length) continue;
      const unit = words.slice(i, i + n).map(norm).join(' ');
      if (!unit) continue;
      let times = 1;
      while (i + n * (times + 1) <= words.length && words.slice(i + n * times, i + n * (times + 1)).map(norm).join(' ') === unit) times += 1;
      if (times >= 3) { out.push(...words.slice(i, i + n)); i += n * times; skipped = true; }
    }
    if (!skipped) { out.push(words[i]); i += 1; }
  }
  return out.join(' ');
}

function cleanText(text) {
  const t = collapseRepeats(String(text || '').replace(/\s+/g, ' ').trim());
  if (!t || JUNK.some((re) => re.test(t))) return '';
  return t;
}

// ── languages per phrase ────────────────────────────────────────
// A lesson mixes languages (Estonian practice, Russian explanations): each phrase is transcribed in its own language.
// whisper-vad-speech-segments output („Speech segment 3: start = 1322.00, end = 1373.00”, centiseconds) → ms
function parseVadSegments(output) {
  return [...String(output || '').matchAll(/start\s*=\s*([\d.]+),\s*end\s*=\s*([\d.]+)/g)]
    .map((m) => ({ startMs: Math.round(Number(m[1]) * 10), endMs: Math.round(Number(m[2]) * 10) }))
    .filter((s) => s.endMs > s.startMs);
}
// speech close together becomes one chunk (one phrase or a few), at most `maxMs` long
function groupChunks(segments, { maxGapMs = 1200, maxMs = 25000, padMs = 200, totalMs = Infinity } = {}) {
  const chunks = [];
  for (const s of segments) {
    const last = chunks[chunks.length - 1];
    if (last && s.startMs - last.endMs <= maxGapMs && s.endMs - last.startMs <= maxMs) last.endMs = s.endMs;
    else chunks.push({ ...s });
  }
  return chunks.map((c) => ({ startMs: Math.max(0, c.startMs - padMs), endMs: Math.min(totalMs, c.endMs + padMs) }));
}
// „auto-detected language: ru (p = 0.97)” → { lang, p }
function parseDetectedLanguage(output) {
  const m = /auto-detected language:\s*([a-z]{2,3})\s*\(p\s*=\s*([\d.]+)\)/i.exec(String(output || ''));
  return m ? { lang: m[1].toLowerCase(), p: Number(m[2]) } : null;
}
// A lesson speaks its own language (Estonian, or English in an English lesson) and Russian for explanations. Short
// answers of a learner are often guessed as English (or Finnish, Polish…) and whisper then invents an English sentence
// („My eyes” for „Majas”), so only these two are allowed; an unsure or other guess is the lesson's language.
function chooseLanguage(detected, lessonLang = 'et') {
  const allowed = [lessonLang, 'ru'];
  return detected && allowed.includes(detected.lang) && detected.p >= 0.5 ? detected.lang : lessonLang;
}

// whisper-cli -oj output → lines with absolute time in the lesson
function parseWhisperJson(json, { speaker, offsetMs = 0 }) {
  const items = Array.isArray(json?.transcription) ? json.transcription : [];
  return items.map((it) => ({
    speaker,
    startMs: offsetMs + Number(it?.offsets?.from || 0),
    endMs: offsetMs + Number(it?.offsets?.to || 0),
    text: cleanText(it?.text),
  })).filter((l) => l.text);
}

// both speakers in time order; consecutive lines of one speaker close together become one line
function mergeDialogue(lines, { joinGapMs = 1500 } = {}) {
  const sorted = [...lines].sort((a, b) => a.startMs - b.startMs || (a.speaker === 'teacher' ? -1 : 1));
  const out = [];
  for (const l of sorted) {
    const last = out[out.length - 1];
    if (last && last.speaker === l.speaker && l.startMs - last.endMs <= joinGapMs) {
      last.text = `${last.text} ${l.text}`;
      last.endMs = Math.max(last.endMs, l.endMs);
    } else out.push({ ...l });
  }
  // repeated identical lines are a whisper loop, keep one
  return out.filter((l, i) => !(i > 0 && out[i - 1].speaker === l.speaker && out[i - 1].text === l.text))
    .map(({ speaker, startMs, endMs, text }) => ({ speaker, startMs: Math.round(startMs), endMs: Math.round(endMs), text }));
}

const DAY = 24 * 60 * 60 * 1000;
function isAudioExpired(recording, now = Date.now(), days = 60) {
  const end = Date.parse(recording?.endedAt || recording?.startedAt || '');
  return Boolean(end) && !recording?.audioDeletedAt && now - end > days * DAY;
}

// Recording starts by itself with the call, so a page reload or a closed tab leaves a recording in "recording" and a
// new one begins. A live recording adds a segment every 5 min (updatedAt), so 15 min without one means it was left:
// hand it over for transcription then (was 3 h, owner 2026-10-09: the text of an interrupted lesson came hours late).
function isAbandoned(recording, now = Date.now(), minutes = 15) {
  const t = Date.parse(recording?.updatedAt || recording?.startedAt || '');
  return recording?.status === 'recording' && Boolean(t) && now - t > minutes * 60 * 1000;
}

// A lesson left in „transcribing” by a transcriber that died (this Mac restarted since it claimed it, or the claim is
// older than `hours`) goes back to the queue.
function isStaleTranscribing(recording, { host = '', startedAt = '', now = Date.now(), hours = 3 } = {}) {
  if (recording?.status !== 'transcribing') return false;
  const claimed = Date.parse(recording.transcribeStartedAt || '');
  if (!claimed) return true;
  if (host && recording.transcriber === host && startedAt && claimed < Date.parse(startedAt)) return true;
  return now - claimed > hours * 60 * 60 * 1000;
}

// Estonian lessons use TalTech's Estonian verbatim Whisper (far fewer errors on Estonian); other languages the
// general model. Falls back to the general model if the Estonian file is missing.
function pickModel(lang, { et, general }, exists = () => true) {
  return lang === 'et' && et && exists(et) ? et : general;
}

// Heartbeat doc `transcriberStatus/{workerId(host)}`: the CRM shows in the lesson room whether the Mac is working.
function workerId(host) {
  return String(host || 'mac').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'mac';
}
function heartbeat({ host, state = 'idle', recordingId = '', startedAt, now = new Date() }) {
  return { host: String(host || '').slice(0, 100), state, recordingId, startedAt, lastSeenAt: now.toISOString() };
}

module.exports = {
  collapseRepeats, parseVadSegments, groupChunks, parseDetectedLanguage, chooseLanguage, isStaleTranscribing, pickModel, cleanText, parseWhisperJson, mergeDialogue, isAudioExpired, isAbandoned, workerId, heartbeat };
