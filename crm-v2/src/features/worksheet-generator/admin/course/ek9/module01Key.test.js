import { describe, expect, it } from 'vitest';
import * as mod from './module01.js';
import { moduleSheets } from '../registry.js';
import { answerKeyOf } from '../../../../worksheet-studio/engine/answerKey.js';

// every explanation belongs to a task of the module and has exactly one line per item of the teacher's key
describe('9. klass emakeel module 1: teacher key explanations', () => {
  const tasks = Object.values(moduleSheets(mod)).flatMap((phases) => Object.values(phases)).flatMap((doc) => answerKeyOf(doc));
  it('match the items of their task', () => {
    Object.entries(mod.EXPLAIN).forEach(([id, lines]) => {
      const task = tasks.find((t) => t.id === id);
      expect(task, id).toBeTruthy();
      expect(lines.length, id).toBe(task.items.length);
      lines.forEach((line) => expect(line.trim().length, id).toBeGreaterThan(10));
    });
  });
  it('cover every task of the module', () => {
    expect(tasks.filter((t) => !mod.EXPLAIN[t.id]).map((t) => t.id)).toEqual([]);
  });
});
