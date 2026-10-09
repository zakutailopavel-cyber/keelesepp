import { curriculumSheetChoices, filterChoices, nextLessonSuggestion, prepRoomKey, studentSheetChoices } from './roomWorksheetChoices.js';

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

  it('suggests the lesson after the latest one done (journal or worksheet), else the first of the level', () => {
    const phases = { discover: { publishedVersion: 1 }, practice: { publishedVersion: 1 }, transfer: { publishedVersion: 1 } };
    const curriculum = curriculumSheetChoices([
      { id: 'a1', title: 'A2 algus', level: 'A2', roadmapModuleTitle: '1. Algus', roadmapLessonNumber: 1, worksheetPhases: phases },
      { id: 'b1', title: 'Esimene', level: 'B1', roadmapModuleTitle: '1. Algus', roadmapLessonNumber: 1, worksheetPhases: phases },
      { id: 'b2', title: 'Teine', level: 'B1', roadmapModuleTitle: '1. Algus', roadmapLessonNumber: 2, worksheetPhases: phases },
      { id: 'b3', title: 'Kolmas', level: 'B1', roadmapModuleTitle: '1. Algus', roadmapLessonNumber: 3, worksheetPhases: phases },
    ]);
    expect(nextLessonSuggestion({ curriculum, studentLevel: 'b1' })).toMatchObject({ lessonId: 'b1', lessonTitle: 'Esimene' });
    expect(nextLessonSuggestion({ curriculum }).lessonId).toBe('a1');
    const journal = [{ topicLessonId: 'b1', date: '2026-10-01', status: 'Toimunud' }, { topicLessonId: 'b3', date: '2026-10-02', status: 'Puudus_eta' }];
    const next = nextLessonSuggestion({ curriculum, lessonRecords: journal });
    expect(next.lessonId).toBe('b2');
    expect(next.choices.map((choice) => choice.phaseLabel)).toEqual(['Avasta', 'Harjuta', 'Kasuta']);
    // a worksheet of b2 done later than the journal entry moves on to b3
    expect(nextLessonSuggestion({ curriculum, lessonRecords: journal, assignments: [{ lessonId: 'b2', assignedAt: '2026-10-05T10:00:00Z' }] }).lessonId).toBe('b3');
    // the last lesson of a level has no next one; sheets already on this board are left out
    expect(nextLessonSuggestion({ curriculum, lessonRecords: [{ topicLessonId: 'b3', date: '2026-10-03' }] })).toBeNull();
    const onBoard = nextLessonSuggestion({ curriculum, lessonRecords: journal, roomKey: 'r1', assignments: [{ lessonId: 'b2', liveRoomKey: 'r1', title: curriculum.find((c) => c.key === 'phase:b2:discover').title, assignedAt: '2026-09-01' }] });
    expect(onBoard.lessonId).toBe('b2');
    expect(onBoard.choices.map((choice) => choice.phase)).toEqual(['practice', 'transfer']);
    expect(nextLessonSuggestion({ curriculum: [] })).toBeNull();
  });
});
