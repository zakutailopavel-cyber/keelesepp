import { describe, expect, it } from 'vitest';
import { BLOCKS, exampleAnswers } from '../../../../worksheet-studio/engine/registry.js';
import { moduleSheets } from '../registry.js';
import * as mock1 from './eeksam.js';
import { E_EXAM_PRACTICE } from './eeksamHarjutus.js';

// the scored items of a block, as the player and the learner's mistake list count them (engine/mistakes.js)
const scored = (block) => BLOCKS[block.type].score?.(block.data, () => '', block) || [];
const sheetsOf = (mod) => Object.entries(moduleSheets(mod)).flatMap(([lessonId, phases]) => Object.values(phases).map((doc) => [lessonId, doc]));

describe('B1 mock 1 in the e-exam format (eeksam.js, docs/EXAM_9KL_E_EKSAM.md)', () => {
  const sheets = Object.fromEntries(sheetsOf(mock1));
  const items = (lessonId) => sheets[lessonId].blocks.filter((b) => BLOCKS[b.type]?.score && !['rubric', 'selfcheck', 'planning', 'examrubric', 'examwriting'].includes(b.type))
    .reduce((n, b) => n + scored(b).length - Object.keys(exampleAnswers(b)).length, 0);

  it('has the e-exam item counts: listening 5 tasks / 35 items, reading and structure 7 tasks / 65 items, item 0 solved in every task', () => {
    for (const id of ['a2b1-ee1-l', 'a2b1-ee1-r']) {
      expect(sheets[id].meta.exam, id).toBe('E9');
      sheets[id].blocks.filter((b) => BLOCKS[b.type]?.score).forEach((b) => expect(b.opts?.example, b.id).toBe(true));
    }
    expect(items('a2b1-ee1-l')).toBe(35);
    expect(items('a2b1-ee1-r')).toBe(65);
    expect(sheets['a2b1-ee1-w'].blocks.filter((b) => b.type === 'examwriting').map((b) => [b.data.minWords, b.data.maxWords])).toEqual([[80, 120], [130, 190]]);
  });

  it('every listening task has a transcript and is heard twice', () => {
    const listening = sheets['a2b1-ee1-l'].blocks.filter((b) => ['examlisten', 'listening'].includes(b.type));
    expect(listening).toHaveLength(5);
    listening.forEach((b) => expect(String(b.data.transcript).length, b.id).toBeGreaterThan(200));
    listening.forEach((b) => expect([b.data.plays, b.data.lockPlays], b.id).toEqual([2, true]));
  });

  it('marks the oral part as done with the teacher, with a teacher note on every speaking task', () => {
    const oral = sheets['a2b1-ee1-s'];
    expect(oral.meta.oral).toBe(true);
    oral.blocks.filter((b) => ['speaking', 'speakcard'].includes(b.type)).forEach((b) => expect(b.data.teacher, b.id).toMatch(/Õpetaja kaart/));
  });
});

// „why” for every auto-checked item: the learner sees it after hand-in (owner 2026-11-18)
describe.each([['mock 1', mock1], ...E_EXAM_PRACTICE.map((mod) => [mod.MODULE.id, mod])])('„Miks?” lines of %s', (_name, mod) => {
  it('one explanation per scored item of every auto-checked task', () => {
    for (const [lessonId, doc] of sheetsOf(mod)) {
      for (const b of doc.blocks.filter((x) => BLOCKS[x.type]?.score && !['rubric', 'selfcheck', 'planning', 'examrubric', 'examwriting', 'writing'].includes(x.type))) {
        const lines = String(b.data.explain || '').split('\n').filter((l) => l.trim());
        expect(lines.length, `${lessonId} ${b.id}`).toBe(scored(b).length);
      }
    }
  });
});
