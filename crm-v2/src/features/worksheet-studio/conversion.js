// Conversion queue: which Õppevara materials still exist only as generated worksheet images (or PDFs),
// which are v1 structured worksheets (open converted automatically) and which already have a v2 document.
// Pure functions; the page and the studio use them to plan the gradual v1 → v2 migration.

const IMAGE_RE = /image\/|\.(png|jpe?g|gif|webp)(\?|$)/;
const PDF_RE = /application\/pdf|\.pdf(\?|$)/;

export function fileKind(file) {
  const value = `${file?.contentType || file?.type || ''} ${file?.name || ''} ${file?.url || ''}`.toLocaleLowerCase('et');
  if (IMAGE_RE.test(value)) return 'image';
  if (PDF_RE.test(value)) return 'pdf';
  return 'other';
}

export function originalFiles(lesson) {
  const phaseFiles = Object.values(lesson?.phaseData || {}).flatMap((phase) => phase?.files || []);
  const seen = new Set();
  return [...(lesson?.files || []), ...phaseFiles]
    .map((file) => ({ ...file, url: file?.url || file?.downloadUrl || '' }))
    .filter((file) => {
      if (!/^https?:\/\//.test(file.url) || seen.has(file.url)) return false;
      seen.add(file.url);
      return fileKind(file) !== 'other';
    });
}

export const CONVERSION_STATUS = Object.freeze({
  done: { label: 'Uues vormingus', tone: 'success' },
  structured: { label: 'Vana struktuur (avaneb teisendatult)', tone: 'info' },
  image: { label: 'Ainult pilt / PDF', tone: 'warning' },
});

export function conversionStatus(lesson) {
  if (lesson?.worksheetDoc?.blocks?.length) return 'done';
  if (lesson?.worksheetData?.blocks?.length) return 'structured';
  if (originalFiles(lesson).some((f) => fileKind(f) === 'image' || fileKind(f) === 'pdf')) return 'image';
  return null; // lesson plans and other materials are not worksheets
}

export function conversionQueue(lessons = []) {
  const rows = lessons
    .filter((lesson) => lesson && !lesson.__placeholder && !lesson.examPart && lesson.type !== 'test')
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title || 'Pealkirjata',
      level: lesson.level || '',
      topic: lesson.topic || '',
      subject: lesson.subject || '',
      status: conversionStatus(lesson),
      files: originalFiles(lesson),
      updatedAt: lesson.worksheetDocUpdatedAt || lesson.updatedAt || '',
    }))
    .filter((row) => row.status);
  const order = { image: 0, structured: 1, done: 2 };
  rows.sort((a, b) => order[a.status] - order[b.status]
    || a.level.localeCompare(b.level, 'et') || a.topic.localeCompare(b.topic, 'et') || a.title.localeCompare(b.title, 'et'));
  const counts = { image: 0, structured: 0, done: 0 };
  rows.forEach((row) => { counts[row.status] += 1; });
  const total = rows.length;
  return { rows, counts, total, pct: total ? Math.round((counts.done / total) * 100) : 0 };
}
