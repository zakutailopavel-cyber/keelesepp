import { curriculumSheetChoices, filterChoices, prepRoomKey, studentSheetChoices } from './roomWorksheetChoices.js';

const doc = { blocks: [{ id: 'b', type: 'text' }], meta: { title: 'Vana leht' } };

describe('worksheets for the lesson board', () => {
  it('lists published phases in curriculum order, falls back to the old lesson sheet, and filters', () => {
    const choices = curriculumSheetChoices([
      { id: 'b2', title: 'Teine', level: 'B1', roadmapModuleTitle: '1. Algus', roadmapLessonNumber: 2, worksheetPhases: { transfer: { title: 'Kasuta 2', publishedVersion: 1 }, discover: { title: 'Avasta 2', publishedVersion: 2 } } },
      { id: 'b1', title: 'Esimene', level: 'B1', roadmapModuleTitle: '1. Algus', roadmapLessonNumber: 1, worksheetPhases: { discover: { title: 'Mustand', version: 1, publishedVersion: 0 } } },
      { id: 'a1', title: 'Vana', level: 'A2', worksheetDoc: doc },
    ]);
    expect(choices.map((choice) => choice.key)).toEqual(['lesson:a1', 'phase:b2:discover', 'phase:b2:transfer']);
    expect(filterChoices(choices, { level: 'B1', query: 'kasuta' }).map((choice) => choice.title)).toEqual(['Kasuta 2']);
  });

  it('offers the student\'s unfinished sheets that are not in this room yet', () => {
    const own = studentSheetChoices([
      { id: 'x', title: 'Kodutöö', status: 'new', worksheetDoc: doc, dueDate: '2026-10-12' },
      { id: 'y', title: 'Valmis', status: 'done', worksheetDoc: doc },
      { id: 'z', title: 'Juba tunnis', status: 'new', worksheetDoc: doc, liveRoomKey: 'room-1' },
    ], 'room-1');
    expect(own.map((choice) => [choice.assignmentId, choice.detail])).toEqual([['x', 'Kodutöö · tähtaeg 2026-10-12']]);
    expect(prepRoomKey('s1')).toBe('prep_s1');
  });
});
