import { describe, expect, it } from 'vitest';
import { buildCourseSheet, moduleSheets } from '../registry.js';
import { KIDS_MODULES, KIDS_PROGRAMS } from './sheets.js';
import { keysProblems } from '../../../../worksheet-studio/didactics/gates.js';
import { validateWorksheetDoc } from '../../../../../services/firebase/worksheetDocs.js';
import { BLOCKS, scoreDocument } from '../../../../worksheet-studio/engine/registry.js';
import { COLORING_PICTURES } from '../../../../worksheet-studio/engine/blocks/kidsPictures.js';
import { coloringKey } from '../../../../worksheet-studio/engine/blocks/kids.jsx';
import fs from 'node:fs';

describe('children’s courses 5–6, 6–7, 8–9', () => {
  it('three courses of 12 lessons, each with three sheets', () => {
    expect(KIDS_PROGRAMS.map((p) => p.lessons.length)).toEqual([12, 12, 12]);
    KIDS_MODULES.forEach((mod) => {
      expect(Object.keys(mod.LESSONS)).toHaveLength(12);
      Object.values(mod.LESSONS).forEach((lesson) => ['discover', 'practice', 'transfer'].forEach((p) => expect(lesson[p].length, `${lesson.title} ${p}`).toBeGreaterThanOrEqual(3)));
    });
  });

  it('every sheet is a valid constructor document with working answer keys', () => {
    KIDS_MODULES.forEach((mod) => Object.entries(moduleSheets(mod)).forEach(([lessonId, phases]) => Object.entries(phases).forEach(([phase, doc]) => {
      expect(() => validateWorksheetDoc(doc), `${lessonId} ${phase}`).not.toThrow();
      expect(doc.blocks.every((b) => BLOCKS[b.type]), `${lessonId} ${phase} block types`).toBe(true);
      expect(keysProblems(doc).filter((p) => p.level === 'error').map((p) => `${lessonId} ${phase}: ${p.text}`)).toEqual([]);
      expect(doc.meta.level).toMatch(/a$/);
      expect(() => scoreDocument(doc, {})).not.toThrow();
    })));
  });

  it('8–9: every sheet is full (owner 2026-11-06)', () => {
    const mod = KIDS_MODULES.find((m) => m.MODULE.id === 'k89-module-01');
    const sheets = moduleSheets(mod);
    const tasks = (doc) => doc.blocks.filter((b) => BLOCKS[b.type]?.task);
    const words = (text) => String(text).split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;
    Object.entries(sheets).forEach(([lessonId, { discover, practice, transfer }], i) => {
      expect(discover.meta.displayLabel).toBe('1 Loeme');
      expect(practice.meta.displayLabel).toBe('2 Harjutame keelt');
      expect(transfer.meta.displayLabel).toBe('3 Kirjutame ja räägime');
      const types = (doc) => doc.blocks.map((b) => b.type);
      expect(types(discover), lessonId).toEqual(expect.arrayContaining(['vocab', 'picmatch', 'reading', 'truefalse', 'choice', 'notice']));
      expect(discover.blocks.length, lessonId).toBeGreaterThanOrEqual(8);
      const reading = discover.blocks.find((b) => b.type === 'reading');
      const length = words(reading.data.passage);
      // ~85 words in lesson 1, growing toward ~150 by lesson 10 (the course goal)
      expect(length, `${lessonId} text ${length} words`).toBeGreaterThanOrEqual(i < 3 ? 80 : i < 9 ? 90 : 130);
      expect(reading.data.questions.split('\n').length, lessonId).toBeGreaterThanOrEqual(5);
      const drills = tasks(practice);
      expect(drills.length, `${lessonId} practice tasks`).toBeGreaterThanOrEqual(6);
      expect(drills.length, `${lessonId} practice tasks`).toBeLessThanOrEqual(8);
      expect(new Set(drills.map((b) => b.type)).size, `${lessonId} varied practice`).toBeGreaterThanOrEqual(5);
      expect(types(transfer), lessonId).toEqual(expect.arrayContaining(['text', 'planning', 'writing', 'speaking', 'selfcheck']));
      expect(transfer.blocks.find((b) => b.type === 'writing').data.maxSent, lessonId).toBe(7);
    });
  });

  it('8–9: the answer key scores as right (written tasks)', () => {
    const mod = KIDS_MODULES.find((m) => m.MODULE.id === 'k89-module-01');
    const first = (v) => String(v || '').split('|')[0].trim();
    Object.entries(moduleSheets(mod)).forEach(([lessonId, phases]) => Object.values(phases).forEach((doc) => doc.blocks.forEach((b) => {
      const def = BLOCKS[b.type];
      let key = null;
      // word forms list their variants with commas, sentences with |
      if (b.type === 'wordforms') key = Object.fromEntries(b.data.rows.map((r, i) => [String(i), String(r.answer).split(',')[0].trim()]));
      else if (['transformation', 'errorfix'].includes(b.type)) key = Object.fromEntries(b.data.rows.map((r, i) => [String(i), first(r.answer)]));
      else if (['gaps', 'wordorder', 'reading'].includes(b.type)) key = Object.fromEntries(def.answers(b.data).map(({ key: k, accept }) => [k, accept[0]]));
      if (!key) return;
      const wrong = def.score(b.data, (k) => key[k]).filter((r) => !r.ok);
      expect(wrong.map((r) => r.key), `${lessonId} ${b.id}`).toEqual([]);
    })));
  });

  it('pictures exist; colouring keys fit their pictures; block ids are unique', () => {
    const ids = new Set();
    KIDS_MODULES.forEach((mod) => Object.keys(mod.LESSONS).forEach((lessonId) => ['discover', 'practice', 'transfer'].forEach((phase) => {
      buildCourseSheet(mod, lessonId, phase).blocks.forEach((b) => {
        expect(ids.has(b.id), b.id).toBe(false);
        ids.add(b.id);
        if (b.type === 'coloring') {
          expect(COLORING_PICTURES[b.data.picture], b.id).toBeDefined();
          if (b.data.mode === 'key') expect(b.data.colors.split('\n').length, `${b.id} colours`).toBe(COLORING_PICTURES[b.data.picture].regions.length);
          if (b.data.mode === 'key') expect(coloringKey(b.data).filter(Boolean).length, b.id).toBeGreaterThan(0);
        }
        const images = [b.data.img, ...(Array.isArray(b.data.items) ? b.data.items : []).map((i) => i.img)].filter((img) => img?.src);
        images.forEach((img) => expect(fs.existsSync(`public${img.src}`), img.src).toBe(true));
      });
    })));
  });
});
