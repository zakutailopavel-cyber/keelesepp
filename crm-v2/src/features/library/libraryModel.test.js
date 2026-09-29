import {
  buildLibraryItems,
  levelFacets,
  moduleFacets,
  searchLibrary,
  sectionsByModule,
  sortLibrary,
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
    expect(curriculumType({ type: 'material', worksheetDoc: { blocks: [{ type: 'gaps' }] } })).toBe('worksheet');
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

describe('library search and table of contents', () => {
  const lessons = [
    { id: 'b1-2', title: 'Partitiiv toidu juures', level: 'B1', roadmapModuleTitle: 'Toit ja teenindus', roadmapModuleNumber: 6, roadmapLessonNumber: 2, updatedAt: '2026-09-01T10:00:00Z' },
    { id: 'b1-1', title: 'Menüü lugemine', level: 'B1', roadmapModuleTitle: 'Toit ja teenindus', roadmapModuleNumber: 6, roadmapLessonNumber: 1, languageFocus: 'Kogus, partitiiv', updatedAt: '2026-09-20T10:00:00Z' },
    { id: 'b1-0', title: 'Minu päev', level: 'B1', roadmapModuleTitle: 'Igapäevaelu', roadmapModuleNumber: 1, roadmapLessonNumber: 1, updatedAt: '2026-08-01T10:00:00Z' },
    { id: 'a2', title: 'Tööleht kellast', level: 'A2', topic: 'Aeg', worksheetDoc: { meta: { title: 'Tööleht kellast' }, blocks: [{ type: 'gaps', data: { instruction: 'Kirjuta, mis kell on.' } }] } },
  ];
  const items = buildLibraryItems(lessons, []);

  it('orders like a textbook: level, module number, lesson number', () => {
    const order = sortLibrary(searchLibrary(items), 'toc').map((r) => r.item.sourceId);
    expect(order).toEqual(['a2', 'b1-0', 'b1-1', 'b1-2']);
    const sections = sectionsByModule(sortLibrary(searchLibrary(items, { level: 'B1' }), 'toc'));
    expect(sections.map((s) => [s.label, s.results.length])).toEqual([['Igapäevaelu', 1], ['Toit ja teenindus', 2]]);
  });

  it('needs every word, ranks title matches first and explains content matches', () => {
    const results = sortLibrary(searchLibrary(items, { query: 'partitiiv' }), 'relevance');
    expect(results.map((r) => r.item.sourceId)).toEqual(['b1-2', 'b1-1']);
    expect(results[1].snippet).toEqual({ label: 'Keelefookus', text: 'Kogus, partitiiv' });
    expect(searchLibrary(items, { query: 'partitiiv menüü' }).map((r) => r.item.sourceId)).toEqual(['b1-1']);
    expect(searchLibrary(items, { query: 'mis kell' })[0].snippet.label).toBe('Tööleht');
  });

  it('facets count what is left after the other filters and sorts by last change', () => {
    expect(levelFacets(items).map((f) => [f.key, f.count])).toEqual([['A2', 1], ['B1', 3]]);
    expect(moduleFacets(searchLibrary(items, { level: 'B1' }).map((r) => r.item)).map((f) => f.label)).toEqual(['Igapäevaelu', 'Toit ja teenindus']);
    expect(sortLibrary(searchLibrary(items, { level: 'B1' }), 'recent')[0].item.sourceId).toBe('b1-1');
  });
});
