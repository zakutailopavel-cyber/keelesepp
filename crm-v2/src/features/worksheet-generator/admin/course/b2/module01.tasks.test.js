// Task-based design v4 (docs/COURSE_DESIGN_STATIONS.md §7, owner 2026-11-17: „слишком скучные, однообразные и все
// завязаны на какой-то истории”), checked on its sample module B1→B2 module 1:
//   - every lesson names its format from the menu, and no two neighbouring lessons share one;
//   - the course's recurring cast is colour only: few mentions per lesson and per module (learner-facing text);
//   - every final task speaks to the learner about his own life (sinu / oma …), not to a character;
//   - every scored item has its „why” (engine/mistakes.js shows it to the learner after hand-in).
import { describe, expect, it } from 'vitest';
import * as mod from './module01.js';
import { buildCourseSheet } from '../registry.js';
import { castNames } from '../academicValue.js';
import { answerKeyOf, explainedShare } from '../../../../worksheet-studio/engine/answerKey.js';

const TASK_FORMATS = ['case', 'debate', 'quest', 'facts', 'infogap', 'project', 'game', 'exam'];
// the B1 / B2 cast beyond academicValue.js castNames (docs/COURSE_CAST.md), with case endings
const MORE_CAST = /(?<!\p{L})(?:Eha|Maret|Laura|Gert|Hendrik|Jelena|Kristjan|Krista|Ülle)(?:i|a|e)?(?:t|le|ga|l|lt|s|st|sse|ni|na|ks|ta)?(?!\p{L})/gu;
const CAP = { lesson: 3, module: 6 };

const PHASES = ['discover', 'practice', 'transfer'];
const ids = Object.keys(mod.LESSONS);
const sheets = Object.fromEntries(ids.map((id) => [id, PHASES.map((phase) => buildCourseSheet(mod, id, phase))]));
// what the learner reads: block data without the teacher's notes, keys' explanations and audio scripts
const HIDDEN = new Set(['teacher', 'explain', 'transcript', 'audio']);
const learnerText = (doc) => JSON.stringify((doc.blocks || []).map((b) => Object.fromEntries(Object.entries(b.data || {}).filter(([k]) => !HIDDEN.has(k)))));
const castIn = (text) => [...castNames(text), ...(text.match(MORE_CAST) || [])];

describe('B1→B2 module 1: task-based (v4)', () => {
  it('every lesson has a format from the menu; no two neighbours alike; teaching lessons all differ', () => {
    const formats = ids.map((id) => mod.LESSONS[id].format);
    formats.forEach((f, i) => expect(TASK_FORMATS, ids[i]).toContain(f));
    formats.slice(1).forEach((f, i) => expect(f, `${ids[i]} → ${ids[i + 1]}`).not.toBe(formats[i]));
    const teaching = ids.filter((id) => !mod.LESSONS[id].assessment).map((id) => mod.LESSONS[id].format);
    expect(new Set(teaching).size).toBe(teaching.length);
  });

  it('the cast is colour only: at most 3 mentions a lesson and 6 a module (learner-facing text)', () => {
    const counts = Object.fromEntries(ids.map((id) => [id, sheets[id].flatMap((doc) => castIn(learnerText(doc)))]));
    for (const id of ids) expect(counts[id].length, `${id}: ${counts[id].join(', ')}`).toBeLessThanOrEqual(CAP.lesson);
    expect(Object.values(counts).flat().length).toBeLessThanOrEqual(CAP.module);
  });

  it('every final task addresses the learner about his own life', () => {
    for (const id of ids.filter((i) => !mod.LESSONS[i].assessment)) {
      const transfer = sheets[id][2];
      const main = transfer.blocks.filter((b) => b.data?.purpose && /sinu|oma |sul |sa /iu.test(`${b.data.purpose} ${b.data.instruction || ''}`));
      expect(main.length, id).toBeGreaterThan(0);
    }
  });

  it('every scored item has an explanation (shown after hand-in)', () => {
    for (const id of ids) {
      for (const doc of sheets[id]) {
        for (const task of answerKeyOf(doc)) {
          if (!task.items.some((it) => it.answer)) continue;
          expect(explainedShare(task), `${id} ${task.id}`).toBe(1);
        }
      }
    }
  });

  it('EXPLAIN has exactly one line per key item', () => {
    const items = {};
    for (const id of ids) for (const doc of sheets[id]) for (const task of answerKeyOf(doc)) items[task.id] = task.items.length;
    for (const [blockId, lines] of Object.entries(mod.EXPLAIN)) expect(lines.length, blockId).toBe(items[blockId]);
  });
});
