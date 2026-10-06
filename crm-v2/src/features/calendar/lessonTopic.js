// Lesson topic from Õppevara: level → theme (module) → lesson, with the student's next lesson pre-selected.
// Stored on the done-lesson record so the student and the parent see what was done.
import { buildLibraryItems, levelFacets, sectionsByModule, searchLibrary, sortLibrary } from '../library/libraryModel.js';

export const INDIVIDUAL_TOPIC = 'Individuaalne tund';

// { levels: [{ key, label, modules: [{ key, label, lessons: [{ id, title, number }] }] }], byId }
export function buildTopicCatalog(curriculumLessons = []) {
  const items = buildLibraryItems(curriculumLessons, []).filter((item) => item.kind === 'curriculum' && item.type !== 'test');
  const byId = new Map();
  const levels = levelFacets(items).map((facet) => {
    const sections = sectionsByModule(sortLibrary(searchLibrary(items, { level: facet.key }), 'toc'));
    return {
      key: facet.key,
      label: facet.label,
      modules: sections.map((section) => ({
        key: section.key,
        label: section.label,
        lessons: section.results.map(({ item }) => {
          const lesson = { id: item.sourceId, title: item.title, number: item.lessonNumber || 0, level: facet.key, moduleKey: section.key, moduleTitle: section.label };
          byId.set(lesson.id, lesson);
          return lesson;
        }),
      })),
    };
  });
  return { levels, byId };
}

function flatten(catalog, level) {
  return (catalog.levels.find((entry) => entry.key === level)?.modules || []).flatMap((module) => module.lessons);
}

// Next lesson after the student's last lesson with a catalogue topic; otherwise the first lesson of their level.
export function suggestTopic(catalog, { studentLevel = '', history = [] } = {}) {
  const last = history.find((lesson) => lesson.topicLessonId && catalog.byId.has(lesson.topicLessonId));
  if (last) {
    const current = catalog.byId.get(last.topicLessonId);
    const list = flatten(catalog, current.level);
    const index = list.findIndex((lesson) => lesson.id === current.id);
    return list[index + 1] || current;
  }
  const level = catalog.levels.find((entry) => entry.key === studentLevel) ? studentLevel : catalog.levels[0]?.key;
  return flatten(catalog, level)[0] || null;
}

// Fields written on the done-lesson record.
export function topicFields(lesson, note = '') {
  const cleanNote = String(note || '').trim().slice(0, 1000);
  if (!lesson) return { topic: INDIVIDUAL_TOPIC, topicLevel: '', topicModule: '', topicLessonId: '', notes: cleanNote };
  return { topic: lesson.title, topicLevel: lesson.level, topicModule: lesson.moduleTitle, topicLessonId: lesson.id, notes: cleanNote };
}

// What the teacher picked (level → module → lesson) as record fields; a module without a lesson is a valid topic too.
export function topicFromPick(catalog, pick = {}, note = '') {
  const lesson = pick.lessonId ? catalog?.byId.get(pick.lessonId) || null : null;
  if (lesson) return topicFields(lesson, note);
  const module = pick.module ? catalog?.levels.find((entry) => entry.key === pick.level)?.modules.find((entry) => entry.key === pick.module) : null;
  if (!module) return topicFields(null, note);
  return { topic: module.label, topicLevel: pick.level, topicModule: module.label, topicLessonId: '', notes: String(note || '').trim().slice(0, 1000) };
}

// The picker value for a stored record (so its topic can be changed later)
export function pickFromRecord(catalog, record = {}) {
  if (record.topicLessonId && catalog?.byId.has(record.topicLessonId)) {
    const lesson = catalog.byId.get(record.topicLessonId);
    return { level: lesson.level, module: lesson.moduleKey, lessonId: lesson.id };
  }
  const level = catalog?.levels.find((entry) => entry.key === record.topicLevel);
  const module = level?.modules.find((entry) => entry.label === record.topicModule);
  return { level: level?.key || '', module: module?.key || '', lessonId: '' };
}

export function topicLine(record = {}) {
  if (!record.topic) return '';
  // a module-only topic has the module as its topic: show it once
  return [record.topicLevel, record.topicModule, record.topic === record.topicModule ? '' : record.topic].filter(Boolean).join(' · ');
}
