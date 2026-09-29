'use strict';
// Pure helpers of the lesson transcriber (tested with node:test).

// Lines whisper tends to invent on silence or music; dropped before they reach the teacher.
const JUNK = [
  /^\s*[[(].*[\])]\s*$/, // [MUSIC], (inaudible)
  /subtitles? (by|made)/i, /субтитры/i, /redaktor subtiitrite/i, /tõlkis/i,
  /^\s*(thank you|thanks for watching)\.?\s*$/i, /продолжение следует/i,
];

function cleanText(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t || JUNK.some((re) => re.test(t))) return '';
  return t;
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

// a teacher who closed the tab without "Lõpeta salvestamine" leaves status "recording"; hand it over after 3 h
function isAbandoned(recording, now = Date.now(), hours = 3) {
  const t = Date.parse(recording?.updatedAt || recording?.startedAt || '');
  return recording?.status === 'recording' && Boolean(t) && now - t > hours * 60 * 60 * 1000;
}

// Estonian lessons use TalTech's Estonian verbatim Whisper (far fewer errors on Estonian); other languages the
// general model. Falls back to the general model if the Estonian file is missing.
function pickModel(lang, { et, general }, exists = () => true) {
  return lang === 'et' && et && exists(et) ? et : general;
}

module.exports = {
  pickModel, cleanText, parseWhisperJson, mergeDialogue, isAudioExpired, isAbandoned };
