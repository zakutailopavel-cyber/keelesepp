// „Õpik” sheets (owner 2026-10-21): the rule and exercises of a licensed textbook, copied 1:1 into the lesson of our
// course that teaches the same grammar. One sheet per lesson (worksheetId „opik”, slot 4) next to Avasta / Harjuta /
// Kasuta; the course's own three sheets stay unchanged. No author or source line on the sheet (owner 2026-10-21). Published from „Kursuse tootmine” like the course sheets.
import minuEesti from './minuEesti.json';
import grammatika from './grammatika.json';
// our own material written from grammar facts (no book pages): `pages: ''` → subtitle just „Õpik” (docs/TEXTBOOKS.md)
import sihitis from './sihitis.json';

export const TEXTBOOK_SHEET_ID = 'opik';
const BOOKS = [minuEesti, grammatika, sihitis];

// every textbook sheet: { lessonId, book, pages, doc }
export const TEXTBOOK_SHEETS = BOOKS.flatMap(({ book, sheets }) => sheets.map((sheet) => ({
  lessonId: sheet.lessonId,
  book,
  pages: sheet.pages,
  doc: {
    schema: 'keelesepp.worksheet/2',
    // ws_<lesson>_<sheet>: a course sheet the generator never replaces (ui/lessonGeneration.js isCourseSheet)
    id: `ws_${sheet.lessonId}_${TEXTBOOK_SHEET_ID}`,
    meta: {
      title: sheet.title,
      subtitle: sheet.pages ? `Õpik, lk ${sheet.pages}` : 'Õpik',
      level: sheet.level,
      module: 'Õpik',
      canDo: sheet.canDo,
      phase: TEXTBOOK_SHEET_ID,
      displayLabel: 'Õpik',
      badge: 'Õpik',
    },
    blocks: sheet.blocks,
  },
})));
