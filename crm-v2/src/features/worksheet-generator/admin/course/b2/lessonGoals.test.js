import { describe, expect, it } from 'vitest';
import { B2_LESSON_GOALS } from './lessonGoals.js';
import { buildCourseSheet, COURSE_MODULES, PHASES } from '../registry.js';

const GENERIC = ['mooduli põhivara', 'kasutab sihtkeelt', 'tuttava igapäevateksti', 'mõistab teksti põhiideed ja detaile', 'märkab ja selgitab tunni keelemustrit', 'kasutab õpitut suulises ja kirjalikus suhtluses', 'kasutab mooduli põhisõnavara uutes lausetes'];
const NOT_TASKS = new Set(['text', 'tip', 'notice', 'vocab', 'image', 'heading', 'selfcheck', 'rubric']);
const ids = Array.from({ length: 90 }, (_, i) => `b1b2-${String(i + 1).padStart(3, '0')}`);
const moduleOf = (id) => COURSE_MODULES.find((m) => m.LESSONS?.[id]);

describe('B1 → B2 lesson goals (lesson quality contract A2–A3)', () => {
  it('every lesson has 3–4 specific Estonian sub-goals', () => {
    for (const id of ids) {
      const goals = B2_LESSON_GOALS[id]?.goals;
      expect(goals, id).toBeTruthy();
      expect(Object.keys(goals).length, id).toBeGreaterThanOrEqual(3);
      for (const [key, text] of Object.entries(goals)) {
        expect(['g_vocab', 'g_read', 'g_notice', 'g_use'], id).toContain(key);
        expect(text, `${id} ${key}`).not.toMatch(/[А-Яа-я]/);
        expect(GENERIC.some((g) => text.includes(g)), `${id}: ${text}`).toBe(false);
      }
    }
  });

  it('every sub-goal is trained by at least two tasks and every task trains one of them', () => {
    for (const id of ids) {
      const goals = B2_LESSON_GOALS[id].goals;
      const used = {};
      for (const phase of Object.keys(PHASES)) {
        for (const block of buildCourseSheet(moduleOf(id), id, phase).blocks) {
          if (NOT_TASKS.has(block.type)) continue;
          expect(goals[block.goal], `${id} ${phase} ${block.id} → ${block.goal}`).toBeTruthy();
          used[block.goal] = (used[block.goal] || 0) + 1;
        }
      }
      for (const key of Object.keys(goals)) expect(used[key] || 0, `${id} ${key}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('course sheets carry the lesson goals instead of the generic defaults', () => {
    const doc = buildCourseSheet(moduleOf('b1b2-062'), 'b1b2-062', 'practice');
    expect(doc.meta.goals).toEqual(B2_LESSON_GOALS['b1b2-062'].goals);
  });
});
