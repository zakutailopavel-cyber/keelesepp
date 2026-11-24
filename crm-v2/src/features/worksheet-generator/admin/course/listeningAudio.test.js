import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { COURSE_MODULES, buildCourseSheet, PHASES } from './registry.js';
import { AUDIO_TYPES, LISTENING_AUDIO, TEACHER_READS, clipKey, clipScripts, clipSrc, listenInstruction, withListeningAudio } from './listeningAudio.js';

// every listening block of the course, read from the module files (run from crm-v2)
// the TTS is Estonian (TartuNLP): an English module's transcripts are read by the teacher until it has its own voices
// a module with MODULE.audio 'pending' (a new course before its recordings are built, e.g. „B1 noorkeele õppija”) keeps
// „Õpetaja loeb …” and has no audio yet; it leaves the list when `node tools/listening-audio/build.mjs` has recorded it
const blocks = COURSE_MODULES.filter((mod) => (mod.MODULE.language || 'et') === 'et' && mod.MODULE.audio !== 'pending').flatMap((mod) => Object.entries(mod.LESSONS).flatMap(([lessonId, lesson]) => Object.keys(PHASES)
  .flatMap((phase) => (lesson[phase] || []).filter((b) => AUDIO_TYPES.has(b.type)).map((block) => ({ mod, lessonId, phase, block })))));

// the recordings a block needs: one per clip when its questions carry `script` (e-exam 1.3), else one for the block
const recordingsOf = ({ lessonId, block }) => {
  const clips = clipScripts(block);
  if (clips.length) return clips.map(({ i, script }) => ({ key: clipKey(lessonId, block.id, i), src: clipSrc(lessonId, block.id, i), text: script }));
  return [{ key: `${lessonId}:${block.id}`, src: `/audio/${lessonId}/${block.id}.mp3`, text: block.data.transcript }];
};

describe('listening audio of the course (tools/listening-audio/build.mjs)', () => {
  it('has a current recording for every listening block', () => {
    expect(blocks.length).toBeGreaterThan(100);
    const problems = blocks.flatMap(recordingsOf).flatMap(({ key, src, text }) => {
      const entry = LISTENING_AUDIO[key];
      if (!entry) return [`${key}: heli puudub — käivita node tools/listening-audio/build.mjs`];
      const hash = createHash('sha1').update(text).digest('hex');
      const out = [];
      if (entry.hash !== hash) out.push(`${key}: transkriptsioon on muutunud — käivita node tools/listening-audio/build.mjs`);
      if (entry.src !== src) out.push(`${key}: vale tee ${entry.src}`);
      const file = `public${entry.src}`;
      if (!fs.existsSync(file) || fs.statSync(file).size < 10000) out.push(`${key}: faili ${file} pole`);
      if (!(entry.seconds > 5)) out.push(`${key}: kestus ${entry.seconds} s`);
      return out;
    });
    expect(problems).toEqual([]);
  });

  it('has no recordings of blocks that no longer exist', () => {
    const keys = new Set(blocks.flatMap(recordingsOf).map((r) => r.key));
    expect(Object.keys(LISTENING_AUDIO).filter((k) => !keys.has(k))).toEqual([]);
  });

  it('buildCourseSheet attaches the audio and asks the student to listen', () => {
    for (const { mod, lessonId, phase, block } of blocks) {
      if (block.hidden) continue; // a hidden block (blocks.js hide()) is on no sheet; its recording stays for old assignments
      const built = buildCourseSheet(mod, lessonId, phase).blocks.find((b) => b.id === block.id);
      const clips = clipScripts(block);
      if (clips.length) {
        clips.forEach(({ i }) => expect(built.data.questions[i].audio).toMatchObject({ src: clipSrc(lessonId, block.id, i), name: `${block.id}_${i}.mp3` }));
        expect(built.data.audio || null).toBeNull();
        continue;
      }
      expect(built.data.audio).toMatchObject({ src: `/audio/${lessonId}/${block.id}.mp3`, name: `${block.id}.mp3` });
      expect(built.data.instruction).not.toMatch(/Õpetaja loeb/);
      expect(block.data.audio).toBeNull(); // the module file itself stays untouched
    }
  });

  it('gives a block of short clips (questions[i].script) one recording per clip and no player of the whole block', () => {
    const block = { id: 'l13', type: 'examlisten', data: { mode: 'choice', audio: null, instruction: 'Õpetaja loeb iga klipi ainult ühe korra.', transcript: 'Diktor: Üks.\nDiktor: Kaks.', questions: [
      { q: 'Mis?', options: '*a\nb\nc', situation: 'Kuuled uudist.', script: 'Diktor: Üks.' },
      { q: 'Kus?', options: '*a\nb\nc', situation: 'Kuuled teadet.', script: 'Diktor: Kaks.' },
      { q: 'Kes?', options: '*a\nb\nc', situation: 'Kuuled reklaami.' },
    ] } };
    expect(clipScripts(block).map((c) => c.i)).toEqual([0, 1]);
    expect(clipScripts({ ...block, data: { ...block.data, mode: 'truefalse' } })).toEqual([]);
    expect(clipScripts({ id: 'x', type: 'listening', data: { questions: [{ script: 'a' }] } })).toEqual([]);
    const manifest = { [clipKey('m-1', 'l13', 0)]: { src: clipSrc('m-1', 'l13', 0), seconds: 9.1 }, [clipKey('m-1', 'l13', 1)]: { src: clipSrc('m-1', 'l13', 1), seconds: 7 }, 'm-1:l13': { src: '/audio/m-1/l13.mp3', seconds: 60 } };
    const [out] = withListeningAudio([block], 'm-1', (l, b) => manifest[`${l}:${b}`] || null, (l, b, i) => manifest[clipKey(l, b, i)] || null);
    expect(out.data.audio).toBeNull();
    expect(out.data.questions.map((q) => q.audio?.src || null)).toEqual(['/audio/m-1/l13_0.mp3', '/audio/m-1/l13_1.mp3', null]);
    expect(out.data.questions[0].audio).toEqual({ src: '/audio/m-1/l13_0.mp3', name: 'l13_0.mp3', seconds: 9.1 });
    expect(out.data.instruction).toBe('Kuula iga klippi ainult üks kord.');
    // no clip recorded yet: the block is left as it is (the teacher reads, the transcript stays)
    const [none] = withListeningAudio([block], 'm-2', () => null, () => null);
    expect(none).toBe(block);
  });

  it('turns „Õpetaja loeb … kaks korda” into „Kuula …” with the partitive object', () => {
    expect(listenInstruction('Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.')).toBe('Kuula teadet kaks korda. Kirjuta lünka 1–2 sõna.');
    expect(listenInstruction('Õpetaja loeb kuus lühikest teadet, igaüht kaks korda. Kirjuta.')).toBe('Kuula kuut lühikest teadet, igaüht kaks korda. Kirjuta.');
    expect(listenInstruction('Õpetaja loeb kaks korda. Märgi.')).toBe('Kuula kaks korda. Märgi.');
    expect(listenInstruction('Õpetaja loeb teksti kaks korda.')).toBe('Kuula teksti kaks korda.');
    expect(listenInstruction('Kuula dialoogi kaks korda.')).toBe('Kuula dialoogi kaks korda.');
  });

  it('rewrites the sheet notes too: „Kuulamistekstid loeb õpetaja …”, „…: õpetaja loeb …”, „… ette”', () => {
    expect(listenInstruction('Tee kõik ilma abita. Kuulamistekstid loeb õpetaja kaks korda.')).toBe('Tee kõik ilma abita. Kuulamistekste kuulad kaks korda.');
    expect(listenInstruction('Osa 1 klippe loeb õpetaja ainult ühe korra, osi 2–4 kaks korda.')).toBe('Osa 1 klippe kuulad ainult üks kord, osi 2–4 kaks korda.');
    expect(listenInstruction('Küsimuste 6–10 ajal loeb õpetaja intervjuu teist korda.')).toBe('Küsimuste 6–10 ajal kuulad intervjuud teist korda.');
    expect(listenInstruction('Kuulamine (umbes 25 minutit): õpetaja loeb loengu üks kord, sina teed märkmeid.')).toBe('Kuulamine (umbes 25 minutit): kuulad loengut üks kord, sina teed märkmeid.');
    expect(listenInstruction('Õpetaja loeb tekstid ette. Enne iga osa loe ülesanded läbi.')).toBe('Kuula tekste. Enne iga osa loe ülesanded läbi.');
    expect(listenInstruction('Õpetaja loeb raadiosaate teksti kaks korda.')).toBe('Kuula raadiosaate teksti kaks korda.');
    expect(listenInstruction('Õpetaja loeb iga klipi ainult ühe korra.')).toBe('Kuula iga klippi ainult üks kord.');
  });

  it('no sheet with recorded audio still says the teacher reads aloud', () => {
    const left = COURSE_MODULES.flatMap((mod) => Object.keys(mod.LESSONS).flatMap((lessonId) => Object.keys(PHASES)
      .filter((phase) => mod.LESSONS[lessonId][phase])
      .flatMap((phase) => {
        const sheet = buildCourseSheet(mod, lessonId, phase).blocks;
        if (!sheet.some((b) => b.data?.audio?.src)) return [];
        return sheet.filter((b) => b.type !== 'dictation' && ['instruction', 'text'].some((k) => TEACHER_READS.test(b.data?.[k] || '')))
          .map((b) => `${lessonId}/${phase}/${b.id}`);
      })));
    expect(left).toEqual([]);
  });
});
