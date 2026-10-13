import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { COURSE_MODULES, buildCourseSheet, PHASES } from './registry.js';
import { LISTENING_AUDIO, listenInstruction } from './listeningAudio.js';

// every listening block of the course, read from the module files (run from crm-v2)
const blocks = COURSE_MODULES.flatMap((mod) => Object.entries(mod.LESSONS).flatMap(([lessonId, lesson]) => Object.keys(PHASES)
  .flatMap((phase) => (lesson[phase] || []).filter((b) => b.type === 'listening').map((block) => ({ mod, lessonId, phase, block })))));

describe('listening audio of the course (tools/listening-audio/build.mjs)', () => {
  it('has a current recording for every listening block', () => {
    expect(blocks.length).toBeGreaterThan(100);
    const problems = blocks.flatMap(({ lessonId, block }) => {
      const key = `${lessonId}:${block.id}`;
      const entry = LISTENING_AUDIO[key];
      if (!entry) return [`${key}: heli puudub — käivita node tools/listening-audio/build.mjs`];
      const hash = createHash('sha1').update(block.data.transcript).digest('hex');
      const out = [];
      if (entry.hash !== hash) out.push(`${key}: transkriptsioon on muutunud — käivita node tools/listening-audio/build.mjs`);
      if (entry.src !== `/audio/${lessonId}/${block.id}.mp3`) out.push(`${key}: vale tee ${entry.src}`);
      const file = `public${entry.src}`;
      if (!fs.existsSync(file) || fs.statSync(file).size < 10000) out.push(`${key}: faili ${file} pole`);
      if (!(entry.seconds > 5)) out.push(`${key}: kestus ${entry.seconds} s`);
      return out;
    });
    expect(problems).toEqual([]);
  });

  it('has no recordings of blocks that no longer exist', () => {
    const keys = new Set(blocks.map(({ lessonId, block }) => `${lessonId}:${block.id}`));
    expect(Object.keys(LISTENING_AUDIO).filter((k) => !keys.has(k))).toEqual([]);
  });

  it('buildCourseSheet attaches the audio and asks the student to listen', () => {
    for (const { mod, lessonId, phase, block } of blocks) {
      const built = buildCourseSheet(mod, lessonId, phase).blocks.find((b) => b.id === block.id);
      expect(built.data.audio).toMatchObject({ src: `/audio/${lessonId}/${block.id}.mp3`, name: `${block.id}.mp3` });
      expect(built.data.instruction).not.toMatch(/Õpetaja loeb/);
      expect(block.data.audio).toBeNull(); // the module file itself stays untouched
    }
  });

  it('turns „Õpetaja loeb … kaks korda” into „Kuula …” with the partitive object', () => {
    expect(listenInstruction('Õpetaja loeb teate kaks korda. Kirjuta lünka 1–2 sõna.')).toBe('Kuula teadet kaks korda. Kirjuta lünka 1–2 sõna.');
    expect(listenInstruction('Õpetaja loeb kuus lühikest teadet, igaüht kaks korda. Kirjuta.')).toBe('Kuula kuut lühikest teadet, igaüht kaks korda. Kirjuta.');
    expect(listenInstruction('Õpetaja loeb kaks korda. Märgi.')).toBe('Kuula kaks korda. Märgi.');
    expect(listenInstruction('Õpetaja loeb teksti kaks korda.')).toBe('Kuula teksti kaks korda.');
    expect(listenInstruction('Kuula dialoogi kaks korda.')).toBe('Kuula dialoogi kaks korda.');
  });
});
