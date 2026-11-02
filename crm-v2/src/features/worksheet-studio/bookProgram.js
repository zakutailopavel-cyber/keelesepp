// Õpik by the curriculum: course (level) → module → lesson → Avasta / Harjuta / Kasuta / Õpik, published versions only.
// The lesson sheets stay the single source; the book is assembled from them on demand. Around them the book adds its
// own pages built only from existing data (owner 2026-11-02: „one textbook, not a pile of sheets”): a module opener,
// the module's word list „Sõnad” and a review page „Korda” (docs/TEXTBOOK_A2_C1_MASTER_PLAN.md §2).

// `optional`: the 4th sheet „Õpik” (a licensed textbook's pages, only a few lessons have one) is never listed missing
export const BOOK_PHASES = Object.freeze([
  { id: 'discover', label: 'Avasta' },
  { id: 'practice', label: 'Harjuta' },
  { id: 'transfer', label: 'Kasuta' },
  { id: 'opik', label: 'Õpik', optional: true },
]);
const PHASE_LABEL = Object.fromEntries(BOOK_PHASES.map((phase) => [phase.id, phase.label]));

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const levelRank = (level) => { const index = LEVEL_ORDER.indexOf(String(level || '').toUpperCase()); return index < 0 ? 99 : index; };

export const programLessons = (lessons = []) => lessons
  .filter((lesson) => lesson && lesson.roadmapManaged === true && !lesson.__placeholder)
  .sort((a, b) => levelRank(a.level) - levelRank(b.level)
    || (Number(a.roadmapModuleNumber) || 999) - (Number(b.roadmapModuleNumber) || 999)
    || (Number(a.roadmapLessonNumber) || Number(a.order) || 999) - (Number(b.roadmapLessonNumber) || Number(b.order) || 999)
    || String(a.id).localeCompare(String(b.id), 'et', { numeric: true }));

export function programLevels(lessons = []) {
  return [...new Set(programLessons(lessons).map((lesson) => lesson.level).filter(Boolean))];
}

export const moduleKey = (lesson) => `${Number(lesson.roadmapModuleNumber) || 0}|${lesson.roadmapModuleTitle || lesson.topic || ''}`;
export const moduleLabel = (lesson) => `${lesson.roadmapModuleNumber ? `${Number(lesson.roadmapModuleNumber)}. ` : ''}${String(lesson.roadmapModuleTitle || lesson.topic || 'Moodul').replace(/^\s*\d{1,3}[.)]\s*/, '')}`;

export function programModules(lessons = [], level = '') {
  const modules = new Map();
  for (const lesson of programLessons(lessons).filter((item) => !level || item.level === level)) {
    const key = moduleKey(lesson);
    if (!modules.has(key)) modules.set(key, { key, label: moduleLabel(lesson), lessons: [] });
    modules.get(key).lessons.push(lesson);
  }
  return [...modules.values()];
}

const published = (summary) => Number(summary?.publishedVersion) > 0;

// readiness from the summary on the lesson (no sheet reads): „Avasta 17/90 · Harjuta 0/90 · Kasuta 0/90”
export function programProgress(lessons = []) {
  return BOOK_PHASES.map(({ id, label }) => ({ id, label, done: lessons.filter((lesson) => published(lesson.worksheetPhases?.[id])).length, total: lessons.length }));
}

// the published document of a phase sheet record, or null
export function publishedPhaseDoc(record) {
  if (record?.publishedWorksheetDoc?.blocks?.length) return record.publishedWorksheetDoc;
  if (record?.worksheetDocStatus === 'published' && record.worksheetDoc?.blocks?.length) return record.worksheetDoc;
  return null;
}

// the old single worksheet on the lesson itself, published version only
function legacyLessonDoc(lesson) {
  if (lesson?.publishedWorksheetDoc?.blocks?.length) return lesson.publishedWorksheetDoc;
  if (lesson?.worksheetDocStatus !== 'draft' && lesson?.worksheetDoc?.blocks?.length) return lesson.worksheetDoc;
  return null;
}

// sheets of the chosen lessons in curriculum order; sheetsByLesson: { [lessonId]: worksheet records }
export function assembleProgramBook(lessons = [], sheetsByLesson = {}, phases = BOOK_PHASES.map((phase) => phase.id)) {
  const sheets = [];
  const missing = [];
  for (const lesson of programLessons(lessons)) {
    const records = new Map((sheetsByLesson[lesson.id] || []).map((record) => [record.worksheetId || record.id, record]));
    const section = moduleLabel(lesson);
    const lessonTitle = `${lesson.roadmapLessonNumber ? `${Number(lesson.roadmapLessonNumber)}. ` : ''}${lesson.title || lesson.id}`;
    let found = 0;
    for (const phase of BOOK_PHASES.filter((item) => phases.includes(item.id))) {
      const doc = publishedPhaseDoc(records.get(phase.id));
      if (doc) {
        sheets.push({ id: `${lesson.id}:${phase.id}`, lessonId: lesson.id, phase: phase.id, phaseLabel: phase.label, section, title: `${lessonTitle} · ${phase.label}`, level: lesson.level || '', doc });
        found += 1;
      } else {
        if (!phase.optional) missing.push({ lessonId: lesson.id, phase: phase.id, title: `${lessonTitle} · ${phase.label}` });
      }
    }
    if (!found && !records.size) {
      const doc = legacyLessonDoc(lesson);
      if (doc) {
        sheets.push({ id: `${lesson.id}:lesson`, lessonId: lesson.id, phase: 'lesson', phaseLabel: 'Tööleht', section, title: lessonTitle, level: lesson.level || '', doc });
        for (let index = missing.length - 1; index >= 0; index -= 1) if (missing[index].lessonId === lesson.id) missing.splice(index, 1);
      }
    }
  }
  return { sheets, missing };
}

// where a book sheet is edited: a phase sheet in the lesson constructor, an old single lesson sheet in the studio
export const sheetEditorPath = (item) => (item.phase && item.phase !== 'lesson'
  ? `/library/lessons/${encodeURIComponent(item.lessonId)}/worksheets/${item.phase}?tagasi=opik`
  : `/library/worksheets/${encodeURIComponent(item.lessonId || item.id)}`);

// ── the textbook around the sheets ──

const clean = (text) => String(text || '').replace(/\s+/g, ' ').trim();
const moduleTitle = (lesson) => clean(String(lesson.roadmapModuleTitle || lesson.topic || '').replace(/^\s*\d{1,3}[.)]\s*/, '')) || 'Moodul';
const lessonNumber = (lesson) => Number(lesson.roadmapLessonNumber) || Number(lesson.order) || 0;
// „Что учить: …” of the lesson plan, when the lesson has no languageFocus field
const focusOf = (lesson) => clean(lesson.languageFocus) || clean(/Что учить:\s*([^\n]+)/.exec(String(lesson.description || ''))?.[1]);

export const OPENER_WORDS = 16;
// the word page is laid out without measuring: two columns of WORD_ROWS rows; a lesson heading takes two rows
export const WORD_ROWS = 30;
const HEAD_ROWS = 2;
// a word list of the module (first occurrence of a word wins), in lesson order
function moduleWords(lessons) {
  const seen = new Set();
  const out = [];
  for (const lesson of lessons) {
    for (const word of lesson.words) {
      const key = clean(word.et).toLocaleLowerCase('et');
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ ...word, lessonId: lesson.id });
    }
  }
  return out;
}

// the word groups (one per lesson) cut into pages of two columns; a group cut by a page continues with „(järg)”
export function wordPages(groups, rows = WORD_ROWS) {
  const capacity = rows * 2;
  const pages = [];
  let page = [];
  let used = 0;
  for (const group of groups) {
    let rest = group.words;
    let cont = false;
    while (rest.length) {
      if (capacity - used < HEAD_ROWS + 1) { pages.push(page); page = []; used = 0; }
      const fit = Math.min(rest.length, capacity - used - HEAD_ROWS);
      page.push({ ...group, words: rest.slice(0, fit), cont });
      used += HEAD_ROWS + fit;
      rest = rest.slice(fit);
      cont = true;
    }
  }
  if (page.length) pages.push(page);
  return pages;
}

// a few words of the module spread over its lessons for the self-check (every n-th, deterministic)
export function sampleWords(words, count) {
  if (words.length <= count) return words;
  const step = words.length / count;
  return Array.from({ length: count }, (_, index) => words[Math.floor(index * step)]);
}

// The whole book of one course: modules in curriculum order, each one
//   opener → (lesson: its sheets Avasta → Harjuta → Kasuta → Õpik) … → Sõnad → Korda.
// words: { lessonId: [{ et, ru, ex, pos }] }, goals: { lessonId: { canDo } } — both optional, pages without them stay
// shorter (never invented). Returns { modules, items, sheets, missing }; every item has `pages` except sheets, which
// report their page count when drawn.
export function assembleTextbook(lessons = [], sheetsByLesson = {}, phases = BOOK_PHASES.map((phase) => phase.id), { words = {}, goals = {}, course = '', extras = true } = {}) {
  const { sheets, missing } = assembleProgramBook(lessons, sheetsByLesson, phases);
  const sheetsOf = new Map();
  for (const sheet of sheets) {
    if (!sheetsOf.has(sheet.lessonId)) sheetsOf.set(sheet.lessonId, []);
    sheetsOf.get(sheet.lessonId).push(sheet);
  }
  const modules = [];
  for (const lesson of programLessons(lessons)) {
    const key = moduleKey(lesson);
    let module = modules[modules.length - 1];
    if (!module || module.key !== key) {
      module = { key, number: Number(lesson.roadmapModuleNumber) || 0, title: moduleTitle(lesson), goal: clean(lesson.roadmapModuleGoal), lessons: [] };
      modules.push(module);
    }
    module.lessons.push({
      id: lesson.id,
      number: lessonNumber(lesson),
      title: clean(lesson.title) || lesson.id,
      // the course goal file first, else the goal written on the lesson's first sheet in the book
      canDo: clean(goals[lesson.id]?.canDo) || clean((sheetsOf.get(lesson.id) || []).map((sheet) => sheet.doc?.meta?.canDo).find((text) => clean(text))),
      focus: focusOf(lesson),
      words: Array.isArray(words[lesson.id]) ? words[lesson.id].filter((word) => clean(word?.et)) : [],
      sheets: sheetsOf.get(lesson.id) || [],
    });
  }
  const items = [];
  modules.forEach((module) => {
    const label = module.number ? `${module.number}. moodul` : 'Moodul';
    module.label = label;
    module.words = moduleWords(module.lessons);
    const head = [course, `${label} · ${module.title}`].filter(Boolean).join(' · ');
    if (extras) items.push({ kind: 'opener', id: `${module.key}:opener`, module, pages: 1 });
    for (const lesson of module.lessons) {
      lesson.sheets.forEach((sheet, index) => {
        const where = [lesson.number ? `Tund ${lesson.number}` : '', PHASE_LABEL[sheet.phase] || ''].filter(Boolean).join(' · ');
        items.push({
          ...sheet,
          kind: 'sheet',
          module,
          lesson: index === 0 && extras ? lesson : null,
          running: { head: [head, where], foot: course },
        });
      });
    }
    if (!extras) return;
    const groups = module.lessons.filter((lesson) => lesson.words.length).map((lesson) => ({ lessonId: lesson.id, number: lesson.number, title: lesson.title, words: lesson.words }));
    if (groups.length) { const chunks = wordPages(groups); items.push({ kind: 'words', id: `${module.key}:words`, module, chunks, pages: chunks.length }); }
    items.push({ kind: 'review', id: `${module.key}:review`, module, check: sampleWords(module.words, module.lessons.length > 6 ? 8 : 12), pages: 1 });
  });
  return { modules, items, sheets, missing };
}

// Contents rows: a module heading (its opener's page), its lessons (first sheet's page) and the word/review pages.
// pageOf(itemId) → page number. A lesson with no sheet in the book is listed without a page.
export function bookContents(modules, items, pageOf) {
  const rows = [];
  const firstSheet = new Map();
  const extra = new Map();
  for (const item of items) {
    if (item.kind === 'sheet' && !firstSheet.has(item.lessonId)) firstSheet.set(item.lessonId, item.id);
    if (item.kind === 'words' || item.kind === 'review' || item.kind === 'opener') extra.set(`${item.module.key}:${item.kind}`, item.id);
  }
  for (const module of modules) {
    const opener = extra.get(`${module.key}:opener`);
    const firstLesson = module.lessons.map((lesson) => firstSheet.get(lesson.id)).find(Boolean);
    rows.push({ id: `${module.key}:toc`, kind: 'module', title: `${module.label} · ${module.title}`, page: pageOf(opener || firstLesson) });
    for (const lesson of module.lessons) {
      const sheet = firstSheet.get(lesson.id);
      rows.push({ id: `${lesson.id}:toc`, kind: 'lesson', title: `${lesson.number ? `${lesson.number}. ` : ''}${lesson.title}`, page: sheet ? pageOf(sheet) : null });
    }
    const words = extra.get(`${module.key}:words`);
    const review = extra.get(`${module.key}:review`);
    if (words || review) rows.push({ id: `${module.key}:end`, kind: 'end', title: [words ? 'Sõnad' : '', review ? 'Korda' : ''].filter(Boolean).join(' ja '), page: pageOf(words || review) });
  }
  return rows;
}

// contents rows per page (a module heading takes the room of two rows), without measuring
export const TOC_ROWS = 34;
export function tocPages(rows, perPage = TOC_ROWS) {
  const pages = [];
  let page = [];
  let used = 0;
  rows.forEach((row) => {
    const size = row.kind === 'module' ? 2 : 1;
    // a module heading never ends a page
    const need = row.kind === 'module' ? size + 1 : size;
    if (page.length && used + need > perPage) { pages.push(page); page = []; used = 0; }
    page.push(row);
    used += size;
  });
  if (page.length || !pages.length) pages.push(page);
  return pages;
}
