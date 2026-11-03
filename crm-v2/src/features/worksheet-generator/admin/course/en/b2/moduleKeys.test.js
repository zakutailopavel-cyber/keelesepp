import { describe, expect, it } from 'vitest';
import * as mod01 from './module01.js';
import { moduleSheets } from '../../registry.js';
import { answerKeyOf } from '../../../../../worksheet-studio/engine/answerKey.js';

// English B2 (course enb2): every sheet is English, and the teacher's key (Russian, as in English B1) explains every
// item of every task that has items; a task with only a teacher's note (speaking, role cards) needs no lines.
describe.each([['English B2 module 1', mod01]])('%s', (_, mod) => {
  const sheets = Object.values(moduleSheets(mod)).flatMap((phases) => Object.values(phases));
  const tasks = sheets.flatMap((doc) => answerKeyOf(doc));

  it('marks every sheet as an English B2 sheet', () => {
    sheets.forEach((doc) => expect(doc.meta).toMatchObject({ language: 'en', badge: expect.stringMatching(/^KeeleSepp · English B2 · moodul \d+$/) }));
  });

  it('has one teacher explanation for every item of every task', () => {
    Object.entries(mod.EXPLAIN).forEach(([id, lines]) => {
      const task = tasks.find((t) => t.id === id);
      expect(task, id).toBeTruthy();
      expect(lines.length, id).toBe(task.items.length);
      lines.forEach((line) => expect(line.trim().length, id).toBeGreaterThan(5));
    });
    expect(tasks.filter((t) => t.items.length && !mod.EXPLAIN[t.id]).map((t) => t.id)).toEqual([]);
  });

  it('prints no Estonian source or fact-box labels on the learner\'s sheets', () => {
    const text = JSON.stringify(sheets.map((doc) => doc.blocks.filter((b) => b.data?.know || b.data?.opener).map((b) => b.data.text)));
    expect(text).not.toMatch(/Allikas:|Kas teadsid|Mõtle kaasa/);
  });
});
