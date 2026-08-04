import { describe, expect, it } from 'vitest';
import { createTextAnnotation, splitAnnotatedText, submissionWritingFields, validAnnotationsForText } from './annotations.js';

describe('homework text annotations', () => {
  it('extracts writing answers from worksheets and writing exercises', () => {
    expect(submissionWritingFields({
      submissionKind: 'worksheet',
      answers: { writing: 'Minu pere on suur.', fill: 'ema' },
      source: { worksheetData: { blocks: [{ id: 'writing', type: 'writing', instruction: 'Kirjelda oma peret' }, { id: 'fill', type: 'fill' }] } },
    })).toEqual([
      { blockId: 'writing', label: 'Kirjelda oma peret', text: 'Minu pere on suur.' },
      { blockId: 'fill', label: 'Kirjalik vastus 2', text: 'ema' },
    ]);
    expect(submissionWritingFields({ submissionKind: 'exercise', answers: { answers: { text: 'Ma elan Tallinnas.' }, wordCount: 3 } })).toEqual([
      { blockId: 'exercise-writing', label: 'Kirjalik vastus', text: 'Ma elan Tallinnas.' },
    ]);
  });

  it('splits text around valid annotations and ignores overlaps or broken ranges', () => {
    const annotations = [
      { id: 'a', blockId: 'writing', start: 5, end: 9, selectedText: 'pere' },
      { id: 'overlap', blockId: 'writing', start: 7, end: 12, selectedText: 're on' },
      { id: 'outside', blockId: 'writing', start: 50, end: 60, selectedText: 'x' },
      { id: 'dismissed', blockId: 'writing', start: 10, end: 12, dismissed: true },
    ];
    expect(validAnnotationsForText('Minu pere on suur.', annotations, 'writing').map((item) => item.id)).toEqual(['a']);
    expect(splitAnnotatedText('Minu pere on suur.', annotations, 'writing')).toEqual([
      { type: 'text', text: 'Minu ' },
      { type: 'annotation', text: 'pere', annotation: expect.objectContaining({ id: 'a' }) },
      { type: 'text', text: ' on suur.' },
    ]);
  });

  it('creates a legacy-compatible annotation and requires useful feedback', () => {
    expect(createTextAnnotation({ blockId: 'writing', start: 5, end: 9, selectedText: 'pere', parandus: 'perekond', selgitus: 'Täpsusta sõna.' })).toMatchObject({
      blockId: 'writing', start: 5, end: 9, selectedText: 'pere', parandus: 'perekond', selgitus: 'Täpsusta sõna.', dismissed: false,
    });
    expect(() => createTextAnnotation({ blockId: 'writing', start: 0, end: 4, selectedText: 'Minu' })).toThrow('Lisa parandus või selgitus');
  });
});
