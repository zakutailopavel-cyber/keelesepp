import { describe, expect, it } from 'vitest';
import {
  calculateVisualWorksheetResult,
  mergeWorksheetResults,
  visualAnswerKey,
  visualWorksheetPages,
  visualWorksheetProgress,
} from './worksheetPlayer.js';

const files = [{
  name: 'page-1.png',
  url: 'https://example.invalid/page-1.png',
  type: 'image/png',
  interactiveOverlay: { version: 1, elements: [
    { id: 'short', type: 'input', x: .1, y: .2, w: .3, h: .04, correctAnswer: 'Tere' },
    { id: 'essay', type: 'textarea', x: .1, y: .3, w: .5, h: .12, correctAnswer: '' },
    { id: 'choice', type: 'choice', x: .1, y: .5, w: .3, h: .05, options: ['A', 'B'], correctAnswer: 'B' },
    { id: 'check', type: 'checkbox', x: .6, y: .5, w: .05, h: .05, correctAnswer: 'true' },
    { id: 'word', type: 'word', x: .2, y: .7, w: .1, h: .03, translation: 'слово' },
  ] },
}];

describe('visual worksheet student contract', () => {
  it('keeps image pages and counts only answerable overlays', () => {
    expect(visualWorksheetPages(files)).toHaveLength(1);
    const answers = {
      [visualAnswerKey(0, files[0].interactiveOverlay.elements[0])]: 'Tere',
      [visualAnswerKey(0, files[0].interactiveOverlay.elements[1])]: 'Minu vastus',
      [visualAnswerKey(0, files[0].interactiveOverlay.elements[2])]: 'B',
      [visualAnswerKey(0, files[0].interactiveOverlay.elements[3])]: true,
    };
    expect(visualWorksheetProgress(files, answers)).toEqual({ answered: 4, total: 4, complete: true });
  });

  it('scores only fields with an explicit answer key and keeps open writing unscored', () => {
    const elements = files[0].interactiveOverlay.elements;
    const answers = {
      [visualAnswerKey(0, elements[0])]: 'tere',
      [visualAnswerKey(0, elements[1])]: 'Vaba vastus',
      [visualAnswerKey(0, elements[2])]: 'A',
      [visualAnswerKey(0, elements[3])]: true,
    };
    const result = calculateVisualWorksheetResult(files, answers);
    expect(result.score).toEqual({ correct: 2, total: 3, pct: 67 });
    expect(result.errorLog).toHaveLength(1);
  });

  it('merges structured and visual auto-score totals', () => {
    expect(mergeWorksheetResults(
      { score: { correct: 2, total: 2, pct: 100 }, errorLog: [] },
      { score: { correct: 1, total: 2, pct: 50 }, errorLog: [{ type: 'visual_choice' }] },
    )).toEqual({ score: { correct: 3, total: 4, pct: 75 }, errorLog: [{ type: 'visual_choice' }] });
  });
});
