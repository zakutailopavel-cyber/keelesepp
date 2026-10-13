// Recorded audio of the course listening blocks (TartuNLP Neurokõne, built by tools/listening-audio/build.mjs into
// public/audio/<lessonId>/<blockId>.mp3). The manifest is keyed „lessonId:blockId”; its hash is the sha1 of the
// transcript the audio was made from (course.test.js checks that it is current).
import MANIFEST from './listeningAudio.json' with { type: 'json' };

export const LISTENING_AUDIO = MANIFEST;
export const listeningAudioFor = (lessonId, blockId) => MANIFEST[`${lessonId}:${blockId}`] || null;

// „Õpetaja loeb X kaks korda.” → „Kuula X kaks korda.” — kuulama takes the partitive, so the object changes form
const PARTITIVE = {
  teate: 'teadet', teated: 'teateid', ilmateate: 'ilmateadet', teadaande: 'teadaannet', vestluse: 'vestlust',
  sõnumi: 'sõnumit', sõnumid: 'sõnumeid', häälsõnumi: 'häälsõnumit', intervjuu: 'intervjuud', loo: 'lugu',
  lõigu: 'lõiku', kuus: 'kuut', telefonikõne: 'telefonikõnet', uudise: 'uudist', saate: 'saadet', vastused: 'vastuseid',
};
export function listenInstruction(text) {
  return String(text || '').replace(/^Õpetaja loeb ((?:[^.]*? )?)kaks korda/, (_, object) => {
    const words = object.trim().split(' ').filter(Boolean).map((w) => {
      const bare = w.replace(/,$/, '');
      return (PARTITIVE[bare] || bare) + (w.endsWith(',') ? ',' : '');
    });
    return ['Kuula', ...words, 'kaks korda'].join(' ');
  });
}

// listening blocks with recorded audio get it attached; the teacher no longer has to read the text aloud
export function withListeningAudio(blocks, lessonId) {
  return blocks.map((block) => {
    if (block.type !== 'listening' || block.data?.audio?.src) return block;
    const entry = listeningAudioFor(lessonId, block.id);
    if (!entry) return block;
    return { ...block, data: { ...block.data, audio: { src: entry.src, name: `${block.id}.mp3`, seconds: entry.seconds }, instruction: listenInstruction(block.data.instruction) } };
  });
}
