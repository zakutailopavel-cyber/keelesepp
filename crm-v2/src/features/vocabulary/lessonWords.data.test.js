/* global process */
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import a2 from './lessonWords/a2.json';
import a2b1 from './lessonWords/a2b1.json';
import b1b2 from './lessonWords/b1b2.json';
import c1 from './lessonWords/c1.json';

// every lesson of the four course roadmaps (data/*.json) has its vocabulary
const roadmapIds = () => {
  // vitest runs from crm-v2/; the roadmaps live in the repository's data/
  const root = resolve(process.cwd(), '../data');
  const ids = [];
  for (const file of readdirSync(root).filter((f) => /-\d\d\.json$/.test(f))) {
    const data = JSON.parse(readFileSync(join(root, file), 'utf8'));
    for (const module of data.modules || [data.module]) {
      for (const lesson of module.lessons || []) ids.push(lesson.id || `est-c1-${String((module.number - 1) * 10 + lesson.number).padStart(3, '0')}`);
    }
  }
  return ids;
};

describe('course lesson vocabulary', () => {
  const all = { ...a2, ...a2b1, ...b1b2, ...c1 };
  it('covers every roadmap lesson A2 → C1', () => {
    const ids = roadmapIds();
    expect(ids.length).toBe(380);
    expect(ids.filter((id) => !all[id])).toEqual([]);
  });

  it('gives 8–15 clean words with a Russian meaning and an Estonian example per lesson', () => {
    for (const [id, words] of Object.entries(all)) {
      expect(words.length, id).toBeGreaterThanOrEqual(8);
      expect(words.length, id).toBeLessThanOrEqual(15);
      const seen = new Set();
      for (const w of words) {
        expect(w.et && w.ru && w.ex, `${id} ${w.et}`).toBeTruthy();
        expect(/[Ѐ-ӿ]/.test(w.et + w.ex), `${id} ${w.et}`).toBe(false);
        expect(/[Ѐ-ӿ]/.test(w.ru), `${id} ${w.ru}`).toBe(true);
        expect(seen.has(w.et.toLowerCase()), `${id} duplicate ${w.et}`).toBe(false);
        seen.add(w.et.toLowerCase());
        expect(w.et.length <= 120 && w.ru.length <= 200 && w.ex.length <= 400).toBe(true);
      }
    }
  });
});
