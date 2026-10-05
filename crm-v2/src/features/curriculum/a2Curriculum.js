import roadmap from './a2Roadmap.json';
import { LESSON_PLAN_SOURCE, roadmapLessonPlan } from './lessonPlans.js';

export const A2_CURRICULUM_ID = 'est-a2-curriculum-v1';
export const A2_LESSON_COUNT = 100;
export const A2_MODULE_COUNT = 20;

const ALLOWED_KINDS = new Set(['grammar', 'vocabulary', 'communication', 'reading', 'listening', 'writing', 'integrated', 'assessment']);

function text(value) {
  return String(value || '').trim();
}

function worksheetPrompt(module, lesson) {
  const kind = text(lesson.kind);
  const method = kind === 'assessment'
    ? 'Kontrolli oskuse ülekannet uude olukorda: lisa päris suhtlusülesanne ja lühike enesehindamine.'
    : kind === 'grammar'
      ? 'Alusta kontekstist ja mustri märkamisest, liigu kontrollitud harjutamisest õppija enda lausete ja suhtluseni.'
      : kind === 'listening'
        ? 'Anna enne kuulamist selge eesmärk, kasuta kahte kuulamist eri ülesannetega ja lõpeta lühikese reaktsiooniga.'
        : kind === 'reading'
          ? 'Kasuta praktilist A2 teksti: esmalt teksti eesmärk, siis võtmeinfo ja lõpuks lühike suuline või kirjalik reaktsioon.'
          : kind === 'writing'
            ? 'Määra adressaat ja eesmärk, anna lühike plaan ning kasulikud fraasid ja lõpeta enesekontrolliga.'
            : 'Kasuta tähenduslikku A2 konteksti, juhitud harjutamist ja iseseisvat kasutamist.';

  return [
    'KeeleSepp A2 individuaaltund.',
    `Teema: ${lesson.title}.`,
    `Moodul: ${module.title}.`,
    `Eesmärk: ${lesson.goal}`,
    `Fookus: ${lesson.focus}`,
    `Praktika: ${lesson.practice}`,
    `Edukriteerium: ${lesson.success}`,
    `Metoodiline juhis: ${method}`,
  ].join(' ');
}

export function validateA2Roadmap(input = roadmap) {
  const diagnostics = [];
  const modules = Array.isArray(input?.modules) ? input.modules : [];
  const lessons = modules.flatMap((module) => Array.isArray(module?.lessons) ? module.lessons : []);

  if (input?.id !== A2_CURRICULUM_ID) diagnostics.push('Õppekava ID ei vasta A2 lepingule.');
  if (input?.level !== 'A2') diagnostics.push('Õppekava tase peab olema A2.');
  if (modules.length !== A2_MODULE_COUNT) diagnostics.push(`Mooduleid peab olema ${A2_MODULE_COUNT}, leiti ${modules.length}.`);
  if (lessons.length !== A2_LESSON_COUNT) diagnostics.push(`Tunde peab olema ${A2_LESSON_COUNT}, leiti ${lessons.length}.`);

  const ids = new Set();
  const sourceKeys = new Set();
  modules.forEach((module, moduleIndex) => {
    const expectedModuleNumber = moduleIndex + 1;
    if (Number(module?.number) !== expectedModuleNumber) diagnostics.push(`Mooduli järjekord on vigane: ${module?.id || expectedModuleNumber}.`);
    if (!text(module?.title) || !text(module?.goal) || !text(module?.attention)) diagnostics.push(`Mooduli metaandmed on puudulikud: ${module?.id || expectedModuleNumber}.`);

    (module?.lessons || []).forEach((lesson) => {
      const number = Number(lesson?.number);
      if (!lesson?.id || ids.has(lesson.id)) diagnostics.push(`Tunni ID puudub või kordub: ${lesson?.id || number}.`);
      if (!lesson?.sourceKey || sourceKeys.has(lesson.sourceKey)) diagnostics.push(`Tunni sourceKey puudub või kordub: ${lesson?.sourceKey || number}.`);
      ids.add(lesson?.id);
      sourceKeys.add(lesson?.sourceKey);
      if (lesson?.levelStage !== 'A2') diagnostics.push(`${lesson?.id}: levelStage peab olema A2.`);
      if (!ALLOWED_KINDS.has(lesson?.kind)) diagnostics.push(`${lesson?.id}: tund on tundmatu liigiga.`);
      for (const field of ['title', 'goal', 'focus', 'practice', 'success']) {
        if (!text(lesson?.[field])) diagnostics.push(`${lesson?.id}: väli ${field} puudub.`);
      }
      if (number % 5 === 0 && lesson?.kind !== 'assessment') diagnostics.push(`${lesson?.id}: iga viies tund peab olema kontrollpunkt.`);
    });
  });

  for (let number = 1; number <= A2_LESSON_COUNT; number += 1) {
    const lesson = lessons[number - 1];
    const expectedId = `a2-${String(number).padStart(3, '0')}`;
    if (lesson?.id !== expectedId || Number(lesson?.number) !== number) diagnostics.push(`Tunni ${number} identiteet või järjekord on vigane.`);
  }

  return {
    ready: diagnostics.length === 0,
    diagnostics,
    modules,
    lessons,
  };
}

export function a2CurriculumRecords(input = roadmap) {
  const validation = validateA2Roadmap(input);
  if (!validation.ready) throw new Error(validation.diagnostics.join(' '));

  return validation.modules.flatMap((module) => module.lessons.map((lesson) => ({
    id: lesson.id,
    type: 'lesson',
    title: lesson.title,
    description: roadmapLessonPlan(module, lesson),
    descriptionSource: LESSON_PLAN_SOURCE,
    subject: 'Eesti keel',
    level: 'A2',
    topic: `${String(module.number).padStart(2, '0')}. ${module.title}`,
    order: lesson.number,
    curriculumId: input.id,
    curriculumTitle: input.title,
    sourceKey: lesson.sourceKey,
    roadmapLessonId: lesson.id,
    roadmapLessonNumber: lesson.number,
    roadmapModuleId: module.id,
    roadmapModuleNumber: module.number,
    roadmapModuleTitle: module.title,
    roadmapModuleGoal: module.goal,
    roadmapModuleAttention: module.attention,
    roadmapTag: lesson.tag,
    roadmapKind: lesson.kind,
    levelStage: lesson.levelStage,
    goal: lesson.goal,
    languageFocus: lesson.focus,
    practice: lesson.practice,
    successCriteria: lesson.success,
    skills: Array.isArray(lesson.skills) ? lesson.skills : [],
    worksheetPrompt: worksheetPrompt(module, lesson),
    contactMinutes: Number(input.lessonMinutes) || 60,
    roadmapVersion: input.version,
    roadmapManaged: true,
  })));
}

export function a2InstalledCount(curriculumLessons = []) {
  return (curriculumLessons || []).filter((lesson) => (
    lesson?.curriculumId === A2_CURRICULUM_ID
    && lesson?.roadmapManaged === true
    && /^a2-\d{3}$/.test(String(lesson?.id || ''))
  )).length;
}

export function a2NeedsInstall(curriculumLessons = []) {
  return a2InstalledCount(curriculumLessons) < A2_LESSON_COUNT;
}

export function getA2Roadmap() {
  return roadmap;
}
