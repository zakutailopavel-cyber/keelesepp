import { describe, expect, it } from 'vitest';
import * as mod1 from './module01.js';
import * as mod2 from './module02.js';
import * as modB1 from '../b1/module01.js';
import * as modB2 from '../b1/module02.js';
import * as modB3 from '../b1/module03.js';
import * as modB4 from '../b1/module04.js';
import * as modB1_05 from '../b1/module05.js';
import * as modB1_06 from '../b1/module06.js';
import * as modB1_07 from '../b1/module07.js';
import * as modB1_08 from '../b1/module08.js';
import * as modB1_09 from '../b1/module09.js';
import * as modB1_10 from '../b1/module10.js';
import { moduleSheets } from '../../registry.js';
import { answerKeyOf } from '../../../../../worksheet-studio/engine/answerKey.js';
import { norm } from '../../../../../worksheet-studio/engine/schema.js';

describe.each([['A2 1', mod1], ['A2 2', mod2], ['B1 1', modB1], ['B1 2', modB2], ['B1 3', modB3], ['B1 4', modB4], ['B1 5', modB1_05], ['B1 6', modB1_06], ['B1 7', modB1_07], ['B1 8', modB1_08], ['B1 9', modB1_09], ['B1 10', modB1_10]])('English %s', (_, mod) => {
  const sheets = Object.values(moduleSheets(mod)).flatMap((phases) => Object.values(phases));
  const tasks = sheets.flatMap((doc) => answerKeyOf(doc));

  it('marks every sheet as an English sheet (no Estonian word-list check)', () => {
    sheets.forEach((doc) => expect(doc.meta.language).toBe('en'));
  });

  it('has one teacher explanation for every item of every task', () => {
    Object.entries(mod.EXPLAIN).forEach(([id, lines]) => {
      const task = tasks.find((t) => t.id === id);
      expect(task, id).toBeTruthy();
      expect(lines.length, id).toBe(task.items.length);
      lines.forEach((line) => expect(line.trim().length, id).toBeGreaterThan(5));
    });
    expect(tasks.filter((t) => !mod.EXPLAIN[t.id]).map((t) => t.id)).toEqual([]);
  });

  it('accepts phone apostrophes and full forms of contractions', () => {
    expect(norm('She doesn’t live in Tartu.')).toBe(norm("She doesn't live in Tartu"));
    expect(norm('She does not live in Tartu')).toBe(norm("She doesn't live in Tartu."));
    expect(norm("I'm eating")).toBe(norm('I am eating'));
    expect(norm("They're playing")).toBe(norm('They are playing'));
    expect(norm("I can't swim")).toBe(norm('I cannot swim'));
    expect(norm('Mia’s dog')).toBe(norm("Mia's dog"));
  });
});
