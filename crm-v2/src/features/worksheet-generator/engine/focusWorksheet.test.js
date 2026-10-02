import { describe, expect, it } from 'vitest';
import { FOCUS_PHASES, focusPhaseLabel, focusWorksheetId } from './focusWorksheet.js';

describe('focus worksheet identity', () => {
  it('creates stable safe child worksheet IDs independent of focus order', () => {
    expect(focusWorksheetId({ phase: 'practice', focusIds: ['before-after'] })).toBe('focus-practice-before-after');
    expect(focusWorksheetId({ phase: 'full', focusIds: ['sequence', 'before-after'] }))
      .toBe(focusWorksheetId({ phase: 'full', focusIds: ['before-after', 'sequence'] }));
    expect(focusWorksheetId({ phase: 'unknown', focusIds: [] })).toBe('focus-full-selection');
  });

  it('keeps IDs within the child worksheet storage limit', () => {
    const id = focusWorksheetId({ phase: 'full', focusIds: [`very-${'long-'.repeat(40)}focus`] });
    expect(id.length).toBeLessThanOrEqual(120);
    expect(id).toMatch(/^focus-full-[a-z0-9_-]+$/);
  });

  it('exposes the supported phase labels', () => {
    expect(FOCUS_PHASES.map((item) => item.id)).toEqual(['discover', 'practice', 'transfer', 'full']);
    expect(focusPhaseLabel('transfer')).toBe('Kasuta');
  });
});
