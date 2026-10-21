import { describe, expect, it } from 'vitest';
import { COURSE_MODULES } from '../registry.js';
import { keysProblems } from '../../../../worksheet-studio/didactics/gates.js';
import { validateWorksheetDoc } from '../../../../../services/firebase/worksheetDocs.js';
import { TEXTBOOK_SHEETS } from './index.js';

const lessonIds = new Set(COURSE_MODULES.flatMap((mod) => Object.keys(mod.LESSONS)));

describe('Õpik sheets', () => {
  it.each(TEXTBOOK_SHEETS.map((entry) => [entry.lessonId, entry]))('%s belongs to a course lesson and has a sound key', (lessonId, entry) => {
    expect(lessonIds.has(lessonId)).toBe(true);
    expect(() => validateWorksheetDoc(entry.doc)).not.toThrow();
    expect(keysProblems(entry.doc).filter((p) => p.level === 'error')).toEqual([]);
    expect(entry.doc.id).toBe(`ws_${lessonId}_opik`);
    expect(entry.doc.blocks.at(-1).data.text).toContain(entry.book.authors);
  });
  it('gives each lesson one Õpik sheet', () => {
    const ids = TEXTBOOK_SHEETS.map((entry) => entry.lessonId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
