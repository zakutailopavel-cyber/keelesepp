import { assembleProgramBook, assembleTextbook, bookContents, programModules, publishedPhaseDoc, sampleWords, tocPages, wordPages } from './bookProgram.js';

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

describe('Õpik as one textbook', () => {
  const lesson = (id, module, number, extra = {}) => ({ id, title: `Tund ${id}`, level: 'B1', roadmapManaged: true, roadmapModuleNumber: module, roadmapModuleTitle: `0${module}. Moodul ${module}`, roadmapModuleGoal: `Цель ${module}`, roadmapLessonNumber: number, ...extra });
  const lessons = [
    lesson('a2b1-006', 2, 6, { description: 'Цель урока: …\nЧто учить: osastav kääne\n\nХод урока' }),
    lesson('a2b1-002', 1, 2, { languageFocus: 'lihtminevik' }),
    lesson('a2b1-001', 1, 1, { languageFocus: 'olevik' }),
  ];
  const published = (phase) => ({ worksheetId: phase, publishedWorksheetDoc: blocks(phase) });
  const sheets = {
    'a2b1-001': [published('opik'), published('transfer'), published('discover'), published('practice')],
    'a2b1-002': [published('discover')],
    'a2b1-006': [published('practice')],
  };
  const words = { 'a2b1-001': [{ et: 'nimi', ru: 'имя' }, { et: 'Keel', ru: 'язык' }], 'a2b1-002': [{ et: 'keel', ru: 'язык' }, { et: 'päev', ru: 'день' }, { et: '', ru: 'пусто' }] };
  const goals = { 'a2b1-001': { canDo: 'Ma tutvustan ennast.' } };

  it('puts each module as opener → lessons (Avasta → Harjuta → Kasuta → Õpik) → Sõnad → Korda', () => {
    const { items, modules, missing } = assembleTextbook(lessons, sheets, undefined, { words, goals, course: 'Eesti keel B1' });
    expect(items.map((item) => (item.kind === 'sheet' ? item.id : `${item.kind}:${item.module.number}`))).toEqual([
      'opener:1', 'a2b1-001:discover', 'a2b1-001:practice', 'a2b1-001:transfer', 'a2b1-001:opik', 'a2b1-002:discover', 'words:1', 'review:1',
      'opener:2', 'a2b1-006:practice', 'review:2',
    ]);
    // the 4th sheet is optional: never missing
    expect(missing.some((item) => item.phase === 'opik')).toBe(false);
    expect(missing.map((item) => `${item.lessonId}:${item.phase}`)).toEqual(['a2b1-002:practice', 'a2b1-002:transfer', 'a2b1-006:discover', 'a2b1-006:transfer']);
    const [first, second] = modules;
    expect(first).toMatchObject({ number: 1, title: 'Moodul 1', goal: 'Цель 1', label: '1. moodul' });
    expect(first.lessons.map((item) => [item.number, item.canDo, item.focus])).toEqual([[1, 'Ma tutvustan ennast.', 'olevik'], [2, '', 'lihtminevik']]);
    // the module word list: lesson order, a word once (case-insensitive), empty words dropped
    expect(first.words.map((word) => word.et)).toEqual(['nimi', 'Keel', 'päev']);
    // the plan's „Что учить:” line when the lesson has no languageFocus
    expect(second.lessons[0].focus).toBe('osastav kääne');
    // lesson head only on the first sheet; running head: course · module | lesson · phase
    const lessonSheets = items.filter((item) => item.kind === 'sheet' && item.lessonId === 'a2b1-001');
    expect(lessonSheets.map((item) => Boolean(item.lesson))).toEqual([true, false, false, false]);
    expect(lessonSheets[3].running).toEqual({ head: ['Eesti keel B1 · 1. moodul · Moodul 1', 'Tund 1 · Õpik'], foot: 'Eesti keel B1' });
    expect(lessonSheets[0].lesson.sheets.map((item) => item.phaseLabel)).toEqual(['Avasta', 'Harjuta', 'Kasuta', 'Õpik']);
    const review = items.find((item) => item.kind === 'review');
    expect(review.check.map((word) => word.et)).toEqual(['nimi', 'Keel', 'päev']);
  });

  it('can leave out the module pages and the Õpik sheet', () => {
    const { items } = assembleTextbook(lessons, sheets, ['discover', 'practice', 'transfer'], { words, goals, extras: false });
    expect(items.map((item) => item.id)).toEqual(['a2b1-001:discover', 'a2b1-001:practice', 'a2b1-001:transfer', 'a2b1-002:discover', 'a2b1-006:practice']);
    expect(items.every((item) => item.lesson === null)).toBe(true);
  });

  it('takes a lesson goal from its first sheet when the course goal file has none', () => {
    const withGoal = { 'a2b1-006': [{ worksheetId: 'practice', publishedWorksheetDoc: { meta: { canDo: 'Ma kasutan osastavat.' }, blocks: [{ id: 'b' }] } }] };
    const { modules } = assembleTextbook(lessons, withGoal, undefined, { goals });
    expect(modules[1].lessons[0].canDo).toBe('Ma kasutan osastavat.');
    expect(modules[0].lessons[0].canDo).toBe('Ma tutvustan ennast.');
  });

  it('lists the contents by module with the pages of the opener, the first sheet of each lesson and the word page', () => {
    const { items, modules } = assembleTextbook(lessons, sheets, undefined, { words, goals, course: 'Eesti keel B1' });
    const pages = Object.fromEntries(items.map((item, index) => [item.id, index + 3]));
    expect(bookContents(modules, items, (id) => pages[id] ?? null).map((row) => [row.kind, row.title, row.page])).toEqual([
      ['module', '1. moodul · Moodul 1', 3], ['lesson', '1. Tund a2b1-001', 4], ['lesson', '2. Tund a2b1-002', 8], ['end', 'Sõnad ja Korda', 9],
      ['module', '2. moodul · Moodul 2', 11], ['lesson', '6. Tund a2b1-006', 12], ['end', 'Korda', 13],
    ]);
  });

  it('cuts word lists and contents into pages without measuring', () => {
    const group = (id, n) => ({ lessonId: id, words: Array.from({ length: n }, (_, i) => ({ et: `${id}${i}` })) });
    // 2 columns × 10 rows = 20; a heading takes 2 rows
    const pages = wordPages([group('a', 12), group('b', 10)], 10);
    expect(pages.map((page) => page.map((part) => `${part.lessonId}${part.cont ? '+' : ''}:${part.words.length}`))).toEqual([['a:12', 'b:4'], ['b+:6']]);
    expect(sampleWords(Array.from({ length: 10 }, (_, i) => i), 4)).toEqual([0, 2, 5, 7]);
    const rows = [{ kind: 'module' }, ...Array.from({ length: 5 }, () => ({ kind: 'lesson' })), { kind: 'module' }, { kind: 'lesson' }];
    // a module heading never ends a page
    expect(tocPages(rows, 8).map((page) => page.map((row) => row.kind[0]).join(''))).toEqual(['mlllll', 'ml']);
    expect(tocPages([], 8)).toEqual([[]]);
  });
});
