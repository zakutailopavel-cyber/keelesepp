// Õpik by the curriculum: level → module → lesson → Avasta / Harjuta / Kasuta, published versions only.
// The lesson sheets stay the single source; the book is assembled from them on demand.

export const BOOK_PHASES = Object.freeze([
  { id: 'discover', label: 'Avasta' },
  { id: 'practice', label: 'Harjuta' },
  { id: 'transfer', label: 'Kasuta' },
]);

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
        sheets.push({ id: `${lesson.id}:${phase.id}`, lessonId: lesson.id, phase: phase.id, section, title: `${lessonTitle} · ${phase.label}`, level: lesson.level || '', doc });
        found += 1;
      } else {
        missing.push({ lessonId: lesson.id, phase: phase.id, title: `${lessonTitle} · ${phase.label}` });
      }
    }
    if (!found && !records.size) {
      const doc = legacyLessonDoc(lesson);
      if (doc) {
        sheets.push({ id: `${lesson.id}:lesson`, lessonId: lesson.id, phase: 'lesson', section, title: lessonTitle, level: lesson.level || '', doc });
        for (let index = missing.length - 1; index >= 0; index -= 1) if (missing[index].lessonId === lesson.id) missing.splice(index, 1);
      }
    }
  }
  return { sheets, missing };
}
