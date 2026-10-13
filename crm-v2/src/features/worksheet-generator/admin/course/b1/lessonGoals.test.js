import { describe, expect, it } from 'vitest';
import { B1_LESSON_GOALS } from './lessonGoals.js';
import { buildCourseSheet, COURSE_MODULES } from '../registry.js';

const ASSESSMENTS = new Set([5, 10, 20, 25, 35, 40, 45, 50, 89, 90]);
const GENERIC = ['mooduli põhivara', 'kasutab sihtkeelt', 'tuttava igapäevateksti', 'mõistab teksti põhiideed ja detaile', 'märkab ja selgitab tunni keelemustrit', 'kasutab õpitut suulises ja kirjalikus suhtluses', 'kasutab mooduli põhisõnavara uutes lausetes'];

describe('B1 lesson goals (lesson quality contract A1–A3)', () => {
  it('every lesson 1–90 has an Estonian learner goal and four specific sub-goals', () => {
    for (let n = 1; n <= 90; n += 1) {
      const id = `a2b1-${String(n).padStart(3, '0')}`;
      const entry = B1_LESSON_GOALS[id];
      expect(entry, id).toBeTruthy();
      expect(entry.canDo, id).not.toMatch(/[А-Яа-я]/);
      // checks and mock exams test the module without new vocabulary: form, reading, use (contract D)
      expect(Object.keys(entry.goals).sort(), id).toEqual(ASSESSMENTS.has(n) ? ['g_notice', 'g_read', 'g_use'] : ['g_notice', 'g_read', 'g_use', 'g_vocab']);
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
