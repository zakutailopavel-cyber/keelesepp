import { lessonWorksheetsService, levelVocabularyService } from '../../../services/firebase/index.js';
import { generatorProfileForLesson } from '../profiles/index.js';
import { CORE_SHEETS, generateCoreSheets } from './lessonGeneration.js';
import { withArtLayout, withLessonArt } from '../art/textbookArt.js';
import { analyzeWorksheet } from '../../worksheet-studio/quality.js';

const CORE_IDS = CORE_SHEETS.map((meta) => meta.id);

// Õppevara „Loo mustandid”: the missing Avasta / Harjuta / Kasuta drafts for every lesson of a module that has a
// generator profile. Existing sheets (drafts or published, also hand-made ones) are never touched; nothing is
// published. created = all three made, completed = only the missing ones added.
export async function generateModuleDrafts({ lessons = [], user, repository = lessonWorksheetsService, vocabularyRepository = levelVocabularyService, onProgress = () => {} }) {
  const result = { created: [], completed: [], existing: [], noProfile: [], failed: [] };
  const levelVocabulary = await vocabularyRepository.load().catch(() => ({ lexicon: [], source: '', wordCount: 0 }));
  for (const [index, lesson] of lessons.entries()) {
    onProgress(index, lessons.length, lesson);
    if (CORE_IDS.every((id) => lesson.worksheetPhases?.[id])) { result.existing.push(lesson.id); continue; }
    const profile = generatorProfileForLesson(lesson.id, lesson);
    if (!profile) { result.noProfile.push(lesson.id); continue; }
    try {
      const sheets = await repository.list(lesson.id);
      const have = CORE_IDS.filter((id) => sheets.some((sheet) => (sheet.worksheetId || sheet.id) === id));
      if (have.length === CORE_IDS.length) { result.existing.push(lesson.id); continue; }
      await generateCoreSheets({ repository, lessonId: lesson.id, lesson, profile, sheets, levelVocabulary, difficulty: 'core', user, onlyMissing: true });
      (have.length ? result.completed : result.created).push(lesson.id);
    } catch (error) {
      result.failed.push({ id: lesson.id, message: error?.message || 'Viga' });
    }
  }
  onProgress(lessons.length, lessons.length, null);
  return result;
}

// „Valmista moodul ette”: missing drafts, then every core sheet gets its textbook picture (⅔ row + „Vaata pilti”)
// and is published when the quality check has no errors. A published sheet is re-published only when a picture was
// added. Sheets with quality errors stay drafts and are listed.
export async function prepareModule({ lessons = [], user, repository = lessonWorksheetsService, vocabularyRepository = levelVocabularyService, onProgress = () => {} }) {
  const drafts = await generateModuleDrafts({ lessons, user, repository, vocabularyRepository, onProgress: (done, total) => onProgress('drafts', done, total) });
  const result = { drafts, published: [], pictured: [], notReady: [], failed: [] };
  for (const [index, lesson] of lessons.entries()) {
    onProgress('publish', index, lessons.length);
    let sheets;
    try { sheets = await repository.list(lesson.id); } catch (error) { result.failed.push({ id: lesson.id, message: error?.message || 'Viga' }); continue; }
    for (const sheet of sheets.filter((item) => CORE_IDS.includes(item.worksheetId || item.id))) {
      const phase = sheet.worksheetId || sheet.id;
      const key = `${lesson.id}:${phase}`;
      const isDraft = sheet.worksheetDocStatus !== 'published';
      const doc = withArtLayout(withLessonArt(sheet.worksheetDoc, lesson.id, phase));
      const changed = doc !== sheet.worksheetDoc;
      if (!isDraft && !changed) continue;
      if (!analyzeWorksheet(doc).ready) { result.notReady.push(key); continue; }
      try {
        await repository.publish({ lessonId: lesson.id, worksheetId: phase, worksheetDoc: doc, user, baseUpdatedAt: sheet.worksheetDocUpdatedAt || '' });
        (isDraft ? result.published : result.pictured).push(key);
      } catch (error) {
        result.failed.push({ id: key, message: error?.message || 'Viga' });
      }
    }
  }
  onProgress('publish', lessons.length, lessons.length);
  return result;
}
