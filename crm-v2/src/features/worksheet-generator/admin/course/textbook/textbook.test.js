import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Sheet from '../../../../worksheet-studio/engine/Sheet.jsx';
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
    expect(JSON.stringify(entry.doc)).not.toContain('©');
  });
  // a textbook copied 1:1 uses bold, italic, struck-out and highlighted words: none of the markup may show as text
  it.each(TEXTBOOK_SHEETS.map((entry) => [entry.lessonId, entry]))('%s shows no stray markup', (_lessonId, entry) => {
    const visible = renderToStaticMarkup(createElement(Sheet, { doc: entry.doc, mode: 'print' })).replace(/<[^>]+>/g, ' ');
    expect(visible.match(/.{0,30}(\*|~~|==|\{red\}).{0,30}/g)).toBeNull();
  });
  it('gives each lesson one Õpik sheet', () => {
    const ids = TEXTBOOK_SHEETS.map((entry) => entry.lessonId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
