import { describe, expect, it } from 'vitest';
import { C1_LESSON_GOALS } from './lessonGoals.js';
import { buildCourseSheet, COURSE_MODULES, PHASES } from '../registry.js';

const GENERIC = ['mooduli põhivara', 'kasutab sihtkeelt', 'tuttava igapäevateksti', 'mõistab teksti põhiideed ja detaile', 'märkab ja selgitab tunni keelemustrit', 'kasutab õpitut suulises ja kirjalikus suhtluses', 'kasutab mooduli põhisõnavara uutes lausetes'];
const NOT_TASKS = new Set(['text', 'tip', 'notice', 'vocab', 'image', 'heading', 'selfcheck', 'rubric']);
const ids = Array.from({ length: 100 }, (_, i) => `est-c1-${String(i + 1).padStart(3, '0')}`);
const moduleOf = (id) => COURSE_MODULES.find((m) => m.LESSONS?.[id]);

describe('B2 → C1 lesson goals (lesson quality contract A2–A3)', () => {
  it('every lesson has 3–4 specific Estonian sub-goals', () => {
    for (const id of ids) {
      const goals = C1_LESSON_GOALS[id]?.goals;
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
      const goals = C1_LESSON_GOALS[id].goals;
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
    const doc = buildCourseSheet(moduleOf('est-c1-021'), 'est-c1-021', 'practice');
    expect(doc.meta.goals).toEqual(C1_LESSON_GOALS['est-c1-021'].goals);
  });
});

describe('C1 teacher notes and sheet text', () => {
  it('every lesson has a measurable success criterion', () => {
    for (const id of ids) expect(C1_LESSON_GOALS[id].success?.length, id).toBeGreaterThan(40);
  });

  it('no sheet shows unfilled template code', () => {
    for (const id of ids) for (const phase of Object.keys(PHASES)) expect(JSON.stringify(buildCourseSheet(moduleOf(id), id, phase)), `${id} ${phase}`).not.toContain('${');
  });
});
