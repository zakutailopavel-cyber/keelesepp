import { describe, expect, it } from 'vitest';
import { B1_LESSON_GOALS } from './lessonGoals.js';
import { buildCourseSheet, COURSE_MODULES, moduleSheets } from '../registry.js';

// the lessons as built: is it a check / mock exam, and does any sheet practise vocabulary (a g_vocab block)? The list of
// exams was hard-coded before and missed 055, 060 … (owner 2026-10-29: „править”); now it comes from the course itself
const BUILT = new Map(COURSE_MODULES.filter((m) => m.MODULE.course === 'b1').flatMap((m) => Object.entries(moduleSheets(m)).map(([id, sheets]) => {
  const docs = Object.values(sheets);
  return [id, { assessment: Boolean(docs[0]?.meta?.assessment), vocab: docs.some((d) => d.blocks.some((b) => b.goal === 'g_vocab')) }];
})));
const GENERIC = ['mooduli põhivara', 'kasutab sihtkeelt', 'tuttava igapäevateksti', 'mõistab teksti põhiideed ja detaile', 'märkab ja selgitab tunni keelemustrit', 'kasutab õpitut suulises ja kirjalikus suhtluses', 'kasutab mooduli põhisõnavara uutes lausetes'];

describe('B1 lesson goals (lesson quality contract A1–A3)', () => {
  it('every lesson 1–90 has an Estonian learner goal and four specific sub-goals', () => {
    for (let n = 1; n <= 90; n += 1) {
      const id = `a2b1-${String(n).padStart(3, '0')}`;
      const entry = B1_LESSON_GOALS[id];
      expect(entry, id).toBeTruthy();
      expect(entry.canDo, id).not.toMatch(/[А-Яа-я]/);
      // checks and mock exams test the module without new vocabulary: form, reading, use (contract D) — a vocabulary
      // goal only when the exam lesson's review sheet (Korda) really practises the module words
      const built = BUILT.get(id);
      expect(built, id).toBeTruthy();
      const vocab = !built.assessment || built.vocab;
      expect(Object.keys(entry.goals).sort(), id).toEqual(vocab ? ['g_notice', 'g_read', 'g_use', 'g_vocab'] : ['g_notice', 'g_read', 'g_use']);
      for (const text of Object.values(entry.goals)) expect(GENERIC.some((g) => text.includes(g)), `${id}: ${text}`).toBe(false);
    }
  });

  it('course sheets carry the lesson goals instead of the generic defaults', () => {
    const mod = COURSE_MODULES.find((m) => m.LESSONS?.['a2b1-062']);
    const doc = buildCourseSheet(mod, 'a2b1-062', 'practice');
    expect(doc.meta.goals).toEqual(B1_LESSON_GOALS['a2b1-062'].goals);
    expect(doc.meta.canDo).toBe(B1_LESSON_GOALS['a2b1-062'].canDo);
  });
});
