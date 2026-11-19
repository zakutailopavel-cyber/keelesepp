// Recorded audio of the course listening blocks (TartuNLP Neurokõne, built by tools/listening-audio/build.mjs into
// public/audio/<lessonId>/<blockId>.mp3). The manifest is keyed „lessonId:blockId”; its hash is the sha1 of the
// transcript the audio was made from (course.test.js checks that it is current).
import MANIFEST from './listeningAudio.json' with { type: 'json' };

export const LISTENING_AUDIO = MANIFEST;
export const listeningAudioFor = (lessonId, blockId) => MANIFEST[`${lessonId}:${blockId}`] || null;

// Short clips (the e-exam's task 1.3, docs/EXAM_9KL_E_EKSAM.md §3): an `examlisten` choice block whose questions carry
// their own spoken text `questions[i].script` gets one recording per clip instead of one for the block —
// public/audio/<lessonId>/<blockId>_<i>.mp3, manifest key „lessonId:blockId#i”, hash = sha1 of that script. The block's
// `transcript` stays the whole text the teacher reads (all clips); the player shows a play button per clip.
export const clipScripts = (block) => (block?.type === 'examlisten' && (block.data?.mode || 'choice') === 'choice'
  ? (block.data?.questions || []).map((q, i) => ({ i, script: String(q?.script || '').trim() })).filter((c) => c.script)
  : []);
export const clipKey = (lessonId, blockId, i) => `${lessonId}:${blockId}#${i}`;
export const clipSrc = (lessonId, blockId, i) => `/audio/${lessonId}/${blockId}_${i}.mp3`;
export const listeningClipFor = (lessonId, blockId, i) => MANIFEST[clipKey(lessonId, blockId, i)] || null;

// The voice of each sheet language (tools/listening-audio plans only the languages that have one). English has none
// (owner 2026-11-03, docs/COURSE_FINAL_SHAPE_EN_B2.md §9 item 10): the teacher reads the English transcripts, so an English
// listening block keeps its „read by the teacher” note and no audio is attached; no paid service is used. The hook for a
// later English voice: name it here, teach tools/listening-audio/plan.mjs the language (it now skips every module whose
// MODULE.language is not 'et') and add the recordings to listeningAudio.json under the same „lessonId:blockId” keys.
export const LISTENING_VOICES = Object.freeze({ et: 'TartuNLP Neurokõne', en: null });
export const hasListeningVoice = (language = 'et') => Boolean(LISTENING_VOICES[language || 'et']);

// „Õpetaja loeb X kaks korda / üks kord.” → „Kuula X kaks korda / üks kord.” — kuulama takes the partitive, so the
// object changes form
const PARTITIVE = {
  teate: 'teadet', teated: 'teateid', ilmateate: 'ilmateadet', teadaande: 'teadaannet', vestluse: 'vestlust',
  sõnumi: 'sõnumit', sõnumid: 'sõnumeid', häälsõnumi: 'häälsõnumit', intervjuu: 'intervjuud', loo: 'lugu',
  lõigu: 'lõiku', kuus: 'kuut', telefonikõne: 'telefonikõnet', uudise: 'uudist', saate: 'saadet', vastused: 'vastuseid',
  uudised: 'uudiseid', loengu: 'loengut', arutelu: 'arutelu', raadiosaate: 'raadiosaadet', kuulamistekstid: 'kuulamistekste', klipid: 'klippe', klipi: 'klippi',
  katkendi: 'katkendit', lühikese: 'lühikest',
  teadaanded: 'teadaandeid', tekstid: 'tekste', teadaanne: 'teadaannet', dialoogi: 'dialoogi', aruande: 'aruannet', kõne: 'kõnet',
};
const TIMES = '(kaks korda|üks kord|ühe korra|veel kord|teist korda)';
const partitive = (w) => {
  const bare = w.replace(/,$/, '');
  const low = bare.toLowerCase();
  const form = PARTITIVE[low] ? (bare === low ? PARTITIVE[low] : PARTITIVE[low][0].toUpperCase() + PARTITIVE[low].slice(1)) : bare;
  return form + (w.endsWith(',') ? ',' : '');
};
// only the head of the object changes form („raadiosaate teksti” → „raadiosaate teksti”, „iga klipi” → „iga klippi”);
// a numeral or adjective before it agrees („kuus lühikest teadet” → „kuut lühikest teadet”)
const AGREE = new Set(['kuus', 'lühikese']);
const objectWords = (object) => {
  const words = object.trim().split(' ').filter(Boolean);
  const head = words.map((w) => w !== 'ainult').lastIndexOf(true);
  return words.map((w, i) => (i === head || w.endsWith(',') || AGREE.has(w) ? partitive(w) : w));
};
const once = (times) => (times === 'ühe korra' ? 'üks kord' : times);

export function listenInstruction(text) {
  return String(text || '')
    // „Õpetaja loeb tekstid ette.” → „Kuula tekste.”
    .replace(/(^|[.!?]\s+)Õpetaja loeb ([^.]*?) ette\b/g, (_, lead, object) => lead + ['Kuula', ...objectWords(object)].join(' '))
    // „Õpetaja loeb X kaks korda.” at the start of a sentence → „Kuula X kaks korda.”
    .replace(new RegExp(`(^|[.!?]\\s+)Õpetaja loeb ((?:[^.]*? )?)${TIMES}`, 'g'),
      (_, lead, object, times) => lead + ['Kuula', ...objectWords(object), once(times)].join(' '))
    // „Kuulamine (20 min): õpetaja loeb loengu üks kord, …” / „mida õpetaja loeb ainult üks kord” → „kuulad …”
    .replace(new RegExp(`([:;,] |mida )õpetaja loeb ((?:[^.;]*? )?)${TIMES}`, 'g'),
      (_, lead, object, times) => lead + ['kuulad', ...objectWords(object), once(times)].join(' '))
    // „Kuulamistekstid loeb õpetaja kaks korda” / „Küsimuste 6–10 ajal loeb õpetaja intervjuu teist korda”
    .replace(new RegExp(`([\\p{L}\\d–-]+) loeb õpetaja ((?:[^.]*? )?)${TIMES}([^.]*)`, 'gu'),
      (_, before, object, times, rest) => [partitive(before), 'kuulad', ...objectWords(object), once(times)].join(' ') + rest.replace(/ühe korra/g, 'üks kord'));
}

export const TEACHER_READS = /õpetaja loeb|loeb õpetaja/i;

// listening blocks with recorded audio get it attached; the teacher no longer has to read the text aloud — the
// instructions of the sheet's other tasks on that recording („Õpetaja loeb intervjuu veel kord”) say „Kuula …” too
// the blocks that carry a recording: the gap-sentence listening and the exam listening (Harno L1, L2, L4)
export const AUDIO_TYPES = new Set(['listening', 'examlisten']);
// `lookup` / `clipLookup`: the manifest readers (tests pass their own)
export function withListeningAudio(blocks, lessonId, lookup = listeningAudioFor, clipLookup = listeningClipFor) {
  let heard = false;
  const withAudio = blocks.map((block) => {
    if (!AUDIO_TYPES.has(block.type)) return block;
    if (block.data?.audio?.src) { heard = true; return block; }
    // one recording per clip: each question gets its own player, the block none
    const clips = clipScripts(block);
    if (clips.length) {
      let found = false;
      const questions = block.data.questions.map((q, i) => {
        const entry = q?.audio?.src ? null : clipLookup(lessonId, block.id, i);
        if (q?.audio?.src) found = true;
        if (!entry) return q;
        found = true;
        return { ...q, audio: { src: entry.src, name: `${block.id}_${i}.mp3`, seconds: entry.seconds } };
      });
      if (!found) return block;
      heard = true;
      return { ...block, data: { ...block.data, questions, instruction: listenInstruction(block.data.instruction) } };
    }
    const entry = lookup(lessonId, block.id);
    if (!entry) return block;
    heard = true;
    return { ...block, data: { ...block.data, audio: { src: entry.src, name: `${block.id}.mp3`, seconds: entry.seconds }, instruction: listenInstruction(block.data.instruction) } };
  });
  if (!heard) return withAudio;
  // the instruction of other tasks and the sheet's notes („Kuulamistekstid loeb õpetaja kaks korda”) too
  return withAudio.map((block) => {
    if (AUDIO_TYPES.has(block.type) || block.type === 'dictation') return block;
    const data = { ...block.data };
    let changed = false;
    for (const key of ['instruction', 'text']) {
      if (typeof data[key] === 'string' && TEACHER_READS.test(data[key])) { data[key] = listenInstruction(data[key]); changed = true; }
    }
    return changed ? { ...block, data } : block;
  });
}
