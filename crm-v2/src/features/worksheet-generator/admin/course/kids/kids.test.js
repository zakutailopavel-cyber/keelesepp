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
        const images = [b.data.img, ...(b.data.items || []).map((i) => i.img)].filter((img) => img?.src);
        images.forEach((img) => expect(fs.existsSync(`public${img.src}`), img.src).toBe(true));
      });
    })));
  });
});
