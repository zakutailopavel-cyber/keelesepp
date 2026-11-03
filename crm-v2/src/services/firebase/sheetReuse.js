import { collection, getDocs } from 'firebase/firestore';
import { requireFirebaseClient } from './client.js';
import { lessonWorksheetsService } from './lessonWorksheets.js';
import { copyBlocksToPhase } from '../../features/worksheet-studio/sheetReuse.js';

// Constructor reuse (Kogu „Salvestatud lehed”, „Kopeeri / Teisalda…”): reads what the staff member can read under the
// existing rules — curriculumLessons and their worksheets subcollection (courseReader). Nothing is read until the
// tab or dialog is opened. The lesson list is read once and kept for 5 minutes; the phase sheets of a lesson are read
// once per lesson and kept for the session (forgotten after this browser writes to that lesson).
const LESSONS_TTL = 5 * 60 * 1000;
let lessonsCache = null;
const phaseCache = new Map();

export const sheetReuseService = {
  async listLessons({ fresh = false } = {}) {
    if (!fresh && lessonsCache && Date.now() - lessonsCache.at < LESSONS_TTL) return lessonsCache.promise;
    const { db } = requireFirebaseClient();
    const promise = getDocs(collection(db, 'curriculumLessons')).then((snapshot) => snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
    lessonsCache = { at: Date.now(), promise };
    promise.catch(() => { if (lessonsCache?.promise === promise) lessonsCache = null; });
    return promise;
  },

  loadLessonSheets(lessonId) {
    if (!phaseCache.has(lessonId)) {
      const promise = lessonWorksheetsService.list(lessonId);
      phaseCache.set(lessonId, promise);
      promise.catch(() => phaseCache.delete(lessonId));
    }
    return phaseCache.get(lessonId);
  },

  forget(lessonId) {
    phaseCache.delete(lessonId);
    lessonsCache = null;
  },

  async copyBlocks(input) {
    const result = await copyBlocksToPhase({ repository: lessonWorksheetsService, ...input });
    this.forget(input.lessonId);
    return result;
  },
};
