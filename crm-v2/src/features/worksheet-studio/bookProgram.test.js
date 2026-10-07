import { assembleProgramBook, programModules, publishedPhaseDoc } from './bookProgram.js';

const blocks = (title) => ({ meta: { title }, blocks: [{ id: 'b', type: 'text' }] });

describe('Õpik by the curriculum', () => {
  it('uses only published versions and falls back to the old lesson sheet when a lesson has no phase sheets', () => {
    expect(publishedPhaseDoc({ worksheetDocStatus: 'draft', worksheetDoc: blocks('mustand') })).toBeNull();
    expect(publishedPhaseDoc({ worksheetDocStatus: 'draft', worksheetDoc: blocks('uus'), publishedWorksheetDoc: blocks('avaldatud') }).meta.title).toBe('avaldatud');
    const lessons = [
      { id: 'l2', title: 'Teine', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: 'M', roadmapLessonNumber: 2, worksheetDoc: blocks('vana leht') },
      { id: 'l1', title: 'Esimene', level: 'A2', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: 'M', roadmapLessonNumber: 1 },
    ];
    const { sheets, missing } = assembleProgramBook(lessons, { l1: [{ worksheetId: 'discover', publishedWorksheetDoc: blocks('Avasta') }] }, ['discover']);
    expect(sheets.map((sheet) => sheet.id)).toEqual(['l1:discover', 'l2:lesson']);
    expect(missing).toEqual([]);
    expect(programModules(lessons, 'A2').map((item) => item.lessons.map((lesson) => lesson.id))).toEqual([['l1', 'l2']]);
  });
});
