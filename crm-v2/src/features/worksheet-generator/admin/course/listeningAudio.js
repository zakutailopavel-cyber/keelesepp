// Recorded audio of the course listening blocks (TartuNLP Neurokõne, built by tools/listening-audio/build.mjs into
// public/audio/<lessonId>/<blockId>.mp3). The manifest is keyed „lessonId:blockId”; its hash is the sha1 of the
// transcript the audio was made from (course.test.js checks that it is current).
import MANIFEST from './listeningAudio.json' with { type: 'json' };

export const LISTENING_AUDIO = MANIFEST;
export const listeningAudioFor = (lessonId, blockId) => MANIFEST[`${lessonId}:${blockId}`] || null;

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
export function withListeningAudio(blocks, lessonId) {
  let heard = false;
  const withAudio = blocks.map((block) => {
    if (block.type !== 'listening') return block;
    if (block.data?.audio?.src) { heard = true; return block; }
    const entry = listeningAudioFor(lessonId, block.id);
    if (!entry) return block;
    heard = true;
    return { ...block, data: { ...block.data, audio: { src: entry.src, name: `${block.id}.mp3`, seconds: entry.seconds }, instruction: listenInstruction(block.data.instruction) } };
  });
  if (!heard) return withAudio;
  // the instruction of other tasks and the sheet's notes („Kuulamistekstid loeb õpetaja kaks korda”) too
  return withAudio.map((block) => {
    if (block.type === 'listening' || block.type === 'dictation') return block;
    const data = { ...block.data };
    let changed = false;
    for (const key of ['instruction', 'text']) {
      if (typeof data[key] === 'string' && TEACHER_READS.test(data[key])) { data[key] = listenInstruction(data[key]); changed = true; }
    }
    return changed ? { ...block, data } : block;
  });
}
