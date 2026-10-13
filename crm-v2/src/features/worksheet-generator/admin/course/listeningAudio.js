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
  uudised: 'uudiseid', loengu: 'loengut', arutelu: 'arutelu', raadiosaate: 'raadiosaadet',
  teadaanded: 'teadaandeid', tekstid: 'tekste', teadaanne: 'teadaannet', dialoogi: 'dialoogi', aruande: 'aruannet', kõne: 'kõnet',
};
export function listenInstruction(text) {
  // at the start of any sentence of the instruction („Loe küsimused läbi. Õpetaja loeb …”)
  return String(text || '').replace(/(^|[.!?]\s+)Õpetaja loeb ((?:[^.]*? )?)(kaks korda|üks kord|ühe korra|veel kord|teist korda)/g, (_, lead, object, times) => {
    const words = object.trim().split(' ').filter(Boolean).map((w) => {
      const bare = w.replace(/,$/, '');
      return (PARTITIVE[bare] || bare) + (w.endsWith(',') ? ',' : '');
    });
    return lead + ['Kuula', ...words, times === 'ühe korra' ? 'üks kord' : times].join(' ');
  });
}

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
  return withAudio.map((block) => (block.type !== 'listening' && /(^|[.!?]\s+)Õpetaja loeb /.test(block.data?.instruction || '')
    ? { ...block, data: { ...block.data, instruction: listenInstruction(block.data.instruction) } }
    : block));
}
