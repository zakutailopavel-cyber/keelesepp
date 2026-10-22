// „Kursuste tervis” (owner 2026-10-22: course integrity): every sheet a course has in code compared with what lies in
// Õppevara (curriculumLessons/{lesson}/worksheets/{sheet}). Pure; the page reads the records and shows the result.

// the content of a sheet without the fields a save adds (time, author, version, status)
const VOLATILE = new Set(['updatedAt', 'updatedBy', 'version', 'status']);
export const sheetBody = (doc) => JSON.stringify({ meta: { ...(doc?.meta || {}) }, blocks: doc?.blocks || [] }, (key, value) => (VOLATILE.has(key) ? undefined : value));

export const HEALTH_STATE = Object.freeze({
  same: { label: 'Avaldatud, sama mis koodis', tone: 'ok' },
  differs: { label: 'Avaldatud, erineb koodist', tone: 'warn' },
  editing: { label: 'Avaldatud, uuem mustand pooleli', tone: 'warn' },
  draft: { label: 'Ainult mustand', tone: 'warn' },
  missing: { label: 'Puudub Õppevaras', tone: 'bad' },
  extra: { label: 'Ainult Õppevaras (koodis pole)', tone: 'info' },
});

// one sheet: the code document (or null) and the Õppevara record (or null) → a state key of HEALTH_STATE
export function sheetState(codeDoc, record) {
  if (!record) return codeDoc ? 'missing' : null;
  const published = record.publishedWorksheetDoc || (record.worksheetDocStatus === 'published' ? record.worksheetDoc : null);
  if (!published) return 'draft';
  if (!codeDoc) return 'extra';
  if (sheetBody(published) !== sheetBody(codeDoc)) return 'differs';
  if (record.worksheetDocStatus !== 'published' && Number(record.worksheetDocVersion) > Number(record.publishedWorksheetDocVersion || 0)) return 'editing';
  return 'same';
}

// a lesson: { [sheetId]: codeDoc } and its Õppevara records → [{ sheet, state, record }] for every sheet seen on either side
export function lessonHealth(codeSheets = {}, records = []) {
  const byId = new Map(records.map((record) => [record.worksheetId || record.id, record]));
  const ids = [...new Set([...Object.keys(codeSheets), ...byId.keys()])];
  return ids.map((sheet) => ({ sheet, state: sheetState(codeSheets[sheet] || null, byId.get(sheet) || null), record: byId.get(sheet) || null }))
    .filter((entry) => entry.state);
}

// counts of states over many lessons: { same: n, differs: n, … }
export function healthCounts(lessons = []) {
  const counts = Object.fromEntries(Object.keys(HEALTH_STATE).map((key) => [key, 0]));
  lessons.forEach((lesson) => lesson.sheets.forEach((entry) => { counts[entry.state] += 1; }));
  return counts;
}
