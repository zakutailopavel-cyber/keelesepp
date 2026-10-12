import { describe, expect, it } from 'vitest';
import { normalizeWorksheetAssignment } from './homework.js';

describe('assignment title', () => {
  it('names the phase of a course sheet so three sheets of one lesson are told apart', () => {
    expect(normalizeWorksheetAssignment('a', { lessonTitle: 'Tee küsimine', worksheetDoc: { meta: { phase: 'practice' } } }).title).toBe('Tee küsimine · Harjuta');
    expect(normalizeWorksheetAssignment('b', { lessonTitle: 'Tee küsimine', phase: 'discover' }).title).toBe('Tee küsimine · Avasta');
    expect(normalizeWorksheetAssignment('c', { lessonTitle: 'Mitmuse osastav' }).title).toBe('Mitmuse osastav');
  });
});
