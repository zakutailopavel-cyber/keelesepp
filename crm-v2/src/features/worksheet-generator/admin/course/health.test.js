import { describe, expect, it } from 'vitest';
import { healthCounts, lessonHealth, sheetBody, sheetState } from './health.js';

const doc = (text, extra = {}) => ({ schema: 'keelesepp.worksheet/2', meta: { title: 'T', ...extra }, blocks: [{ id: 'a', type: 'text', data: { text } }] });

describe('course health', () => {
  it('ignores the fields a save adds', () => {
    expect(sheetBody({ ...doc('x'), updatedAt: '2026', version: 3, status: 'published' })).toBe(sheetBody(doc('x')));
  });

  it('tells same, differs, editing, draft, missing and extra apart', () => {
    expect(sheetState(doc('x'), { publishedWorksheetDoc: doc('x'), worksheetDocStatus: 'published', worksheetDocVersion: 2, publishedWorksheetDocVersion: 2 })).toBe('same');
    expect(sheetState(doc('x'), { publishedWorksheetDoc: doc('y'), worksheetDocStatus: 'published' })).toBe('differs');
    expect(sheetState(doc('x'), { publishedWorksheetDoc: doc('x'), worksheetDocStatus: 'draft', worksheetDocVersion: 3, publishedWorksheetDocVersion: 2 })).toBe('editing');
    expect(sheetState(doc('x'), { worksheetDoc: doc('x'), worksheetDocStatus: 'draft' })).toBe('draft');
    expect(sheetState(doc('x'), null)).toBe('missing');
    expect(sheetState(null, { publishedWorksheetDoc: doc('z') })).toBe('extra');
    expect(sheetState(null, null)).toBe(null);
  });

  it('lists every sheet of a lesson from both sides and counts them', () => {
    const sheets = lessonHealth({ discover: doc('a'), practice: doc('b') }, [
      { worksheetId: 'discover', publishedWorksheetDoc: doc('a'), worksheetDocStatus: 'published' },
      { worksheetId: 'opik', publishedWorksheetDoc: doc('õ'), worksheetDocStatus: 'published' },
    ]);
    expect(sheets.map((s) => `${s.sheet}:${s.state}`)).toEqual(['discover:same', 'practice:missing', 'opik:extra']);
    expect(healthCounts([{ sheets }])).toMatchObject({ same: 1, missing: 1, extra: 1, differs: 0 });
  });
});
