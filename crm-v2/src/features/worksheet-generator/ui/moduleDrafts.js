import { lessonWorksheetsService, levelVocabularyService } from '../../../services/firebase/index.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { CORE_SHEETS, generateCoreSheets } from './lessonGeneration.js';

const CORE_IDS = CORE_SHEETS.map((meta) => meta.id);

// Õppevara „Loo mustandid”: Avasta / Harjuta / Kasuta drafts for every lesson of a module that has a generator
// profile and no core sheet yet. Existing sheets (drafts or published, also hand-made ones) are never touched;
// nothing is published.
export async function generateModuleDrafts({ lessons = [], user, repository = lessonWorksheetsService, vocabularyRepository = levelVocabularyService, onProgress = () => {} }) {
  const result = { created: [], existing: [], noProfile: [], failed: [] };
  const levelVocabulary = await vocabularyRepository.load().catch(() => ({ lexicon: [], source: '', wordCount: 0 }));
  for (const [index, lesson] of lessons.entries()) {
    onProgress(index, lessons.length, lesson);
    if (CORE_IDS.some((id) => lesson.worksheetPhases?.[id])) { result.existing.push(lesson.id); continue; }
    const profile = generatorProfileForLesson(lesson.id, lesson);
    if (!profile) { result.noProfile.push(lesson.id); continue; }
    try {
      const sheets = await repository.list(lesson.id);
      if (sheets.some((sheet) => CORE_IDS.includes(sheet.worksheetId || sheet.id))) { result.existing.push(lesson.id); continue; }
      await generateCoreSheets({ repository, lessonId: lesson.id, lesson, profile, sheets, levelVocabulary, difficulty: 'core', user });
      result.created.push(lesson.id);
    } catch (error) {
      result.failed.push({ id: lesson.id, message: error?.message || 'Viga' });
    }
  }
  onProgress(lessons.length, lessons.length, null);
  return result;
}
