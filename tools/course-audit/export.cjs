// Read-only export of the published course for tools/course-audit/audit.py (owner's service account, never committed):
//   GOOGLE_APPLICATION_CREDENTIALS=… node tools/course-audit/export.cjs > course-audit-raw.json && python3 tools/course-audit/audit.py
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
(async () => {
  const lessons = await db.collection('curriculumLessons').get();
  const out = [];
  for (const entry of lessons.docs) {
    const x = entry.data();
    if (x.type !== 'lesson') continue;
    const row = { id: entry.id, level: x.level, mod: x.roadmapModuleNumber || null, modTitle: x.roadmapModuleTitle || x.topic || '', num: x.roadmapLessonNumber || null, title: x.title, kind: x.roadmapKind || '', goal: x.goal || '', lf: x.languageFocus || '', sc: x.successCriteria || '', phases: {} };
    for (const phase of ['discover', 'practice', 'transfer']) {
      const sheet = await db.doc(`curriculumLessons/${entry.id}/worksheets/${phase}`).get();
      if (!sheet.exists) { row.phases[phase] = null; continue; }
      const y = sheet.data();
      const doc = y.publishedWorksheetDoc || (y.worksheetDocStatus === 'published' ? y.worksheetDoc : null);
      row.phases[phase] = doc ? { status: 'published', canDo: doc.meta?.canDo || '', goals: doc.meta?.goals || {}, blocks: (doc.blocks || []).map((b) => ({ t: b.type, g: b.goal || '', d: b.data })) } : { status: y.worksheetDocStatus || 'draft' };
    }
    out.push(row);
  }
  process.stdout.write(JSON.stringify(out));
})();
