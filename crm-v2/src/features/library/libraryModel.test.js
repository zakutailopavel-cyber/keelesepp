import {
  buildLibraryItems,
  curriculumType,
  filterLibraryItems,
  groupLibraryItems,
  itemsInLibraryPath,
  pathDimension,
} from './libraryModel.js';

const curriculumLessons = [
  { id: 'lesson-1', title: 'Pere tunnikava', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere' },
  { id: 'worksheet-1', title: 'Pere tööleht', subject: 'Eesti keel', level: 'A1', topic: 'Minu pere', worksheetData: { blocks: [{ type: 'fill' }] } },
];
const exercises = [
  { id: 'exercise-1', title: 'Family match', subject: 'Inglise keel', level: 'A1', topic: 'My family', type: 'match' },
];

describe('CRM v2 learning library model', () => {
  it('preserves the legacy curriculum classification', () => {
    expect(curriculumType(curriculumLessons[0])).toBe('lesson');
    expect(curriculumType(curriculumLessons[1])).toBe('worksheet');
    expect(curriculumType({ type: 'test', worksheetData: { blocks: [{ type: 'choice' }] } })).toBe('test');
  });

  it('builds one searchable list from both existing collections', () => {
    const items = buildLibraryItems(curriculumLessons, exercises);
    expect(items).toHaveLength(3);
    expect(filterLibraryItems(items, { query: 'pere', type: 'worksheet' }).map((item) => item.sourceId)).toEqual(['worksheet-1']);
    expect(filterLibraryItems(items, { query: 'family' }).map((item) => item.sourceId)).toEqual(['exercise-1']);
  });

  it('navigates subject, stage and topic folders without losing records', () => {
    const items = buildLibraryItems(curriculumLessons, exercises);
    expect(groupLibraryItems(items, 'subject').map((folder) => [folder.label, folder.count])).toEqual([
      ['Eesti keel', 2],
      ['Inglise keel', 1],
    ]);
    const estonianA1 = itemsInLibraryPath(items, { subject: 'Eesti keel', stage: 'A1' });
    expect(groupLibraryItems(estonianA1, 'topic')[0]).toMatchObject({ label: 'Minu pere', count: 2 });
    expect(pathDimension({ subject: 'Eesti keel', stage: 'A1', topic: 'Minu pere' })).toBeNull();
  });

  it('keeps legacy exam topic keys in a readable folder', () => {
    const items = buildLibraryItems([], [{
      id: 'exam-1',
      title: 'Kirjutamine',
      subject: 'Eesti keel',
      level: 'B1',
      topic: '__exam__kirjutamine',
    }]);
    expect(groupLibraryItems(items, 'topic')[0]).toMatchObject({ key: '__exam__:kirjutamine', label: 'Eksam: Kirjutamine' });
  });
});
