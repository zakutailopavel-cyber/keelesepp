#!/usr/bin/env node
// One-off production install of the mini-course „Käänded lauses” (docs/MINICOURSE_KAANDED.md „How it reaches the site”):
//   1) seed    — create-only curriculumLessons/kaanded-001…006 from kaandedCurriculumRecords(MODULES)
//   2) publish — for each lesson, exactly what „Kursuse tootmine” → „Avalda tund” does (CourseProductionPage.publishLesson
//                → lessonWorksheetsService.publish → persist(status 'published')): per phase, in one transaction,
//                curriculumLessons/<id>/worksheets/<phase> (record v1 with worksheetDoc + publishedWorksheetDoc),
//                worksheetVersions/<id>_<phase>_studio_v1 and the lesson's worksheetPhases.<phase> summary (merge).
// Safety: nothing is overwritten or deleted. A lesson, sheet or version document that already exists stops the run
// (Firestore create() / an existence check inside the transaction). Publishing writes only to the new lessons.
// The sheets are built and validated with the app's own code (vite SSR: courseSheet.js, worksheetDocs.validateWorksheetDoc,
// lessonWorksheets.phaseSummary), so they are byte for byte what the admin page would publish.
//
// Run from a clean origin/main worktree (crm-v2 with node_modules), with the owner's yes:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/service-account.json \
//   FIREBASE_ADMIN=/path/to/node_modules/firebase-admin \
//   node tools/kaanded-publish/publish.mjs --build-only         # no Firestore: build + validate the sheets
//   node tools/kaanded-publish/publish.mjs --dry-run            # reads production, writes nothing
//   node tools/kaanded-publish/publish.mjs --write              # seed + publish
//   node tools/kaanded-publish/publish.mjs --verify             # read-only check of the 6 × 3 published sheets
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CRM = path.resolve(HERE, '../../crm-v2');
const MODE = process.argv.includes('--write') ? 'write' : process.argv.includes('--verify') ? 'verify' : process.argv.includes('--build-only') ? 'build-only' : 'dry-run';
const USER = { uid: '2ai5mVQCmjSGjsy7t53JrqKgZdX2', displayName: 'Pavel Zakutailo' };
const IDS = ['kaanded-001', 'kaanded-002', 'kaanded-003', 'kaanded-004', 'kaanded-005', 'kaanded-006'];

if (MODE !== 'build-only' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set');
const require = createRequire(import.meta.url);
const admin = MODE === 'build-only' ? null : require(process.env.FIREBASE_ADMIN || 'firebase-admin');

// ---------- the app's own code through vite SSR ----------
const { createServer } = await import(path.join(CRM, 'node_modules/vite/dist/node/index.js'));
const vite = await createServer({ root: CRM, configFile: false, logLevel: 'error', server: { middlewareMode: true, hmr: false }, appType: 'custom', optimizeDeps: { noDiscovery: true, include: [] } });
const load = (file) => vite.ssrLoadModule(path.join(CRM, file));
const { PHASES, moduleSheets } = await load('src/features/worksheet-generator/admin/course/courseSheet.js');
const { MODULES } = await load('src/features/worksheet-generator/admin/course/courseModules.kaanded.js');
const { kaandedCurriculumRecords } = await load('src/features/curriculum/kaandedCurriculum.js');
const { validateWorksheetDoc } = await load('src/services/firebase/worksheetDocs.js');
const { phaseSummary, LESSON_WORKSHEET_SCHEMA } = await load('src/services/firebase/lessonWorksheets.js');
await vite.close();

const records = kaandedCurriculumRecords(MODULES);
const sheets = moduleSheets(MODULES[0]);
if (JSON.stringify(records.map((r) => r.id)) !== JSON.stringify(IDS)) throw new Error(`unexpected lesson ids ${records.map((r) => r.id)}`);
const clean = (value) => JSON.parse(JSON.stringify(value));
// CourseProductionPage sheetLabel: the course's own sheet name or the phase's default
const sheetLabel = (doc, phase) => doc?.meta?.phaseLabel || PHASES[phase]?.label || 'Õpik';
for (const id of IDS) for (const doc of Object.values(sheets[id])) validateWorksheetDoc(doc);
// --build-only: build and validate the 18 sheets with the app's code, no Firestore at all
if (MODE === 'build-only') {
  for (const id of IDS) console.log(id, Object.entries(sheets[id]).map(([phase, doc]) => `${phase} ${doc.blocks.length} blocks`).join(' · '));
  console.log(`${records.length} records, sheets valid`);
  process.exit();
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();
console.log(`project ${admin.app().options.projectId || process.env.GCLOUD_PROJECT || '(from credentials)'} · mode ${MODE}`);

// persist() of lessonWorksheets.js for a sheet that does not exist yet (current = null), status 'published'
function sheetWrite(lessonId, phase, worksheetDoc, now) {
  const version = 1;
  const storedDoc = clean({ ...worksheetDoc, updatedAt: now, updatedBy: USER.uid, version, status: 'published' });
  const record = {
    schema: LESSON_WORKSHEET_SCHEMA,
    lessonId,
    worksheetId: phase,
    role: phase,
    slot: PHASES[phase].slot,
    displayLabel: String(sheetLabel(worksheetDoc, phase) || storedDoc.meta?.title || '').trim(),
    title: String(storedDoc.meta?.title || '').trim(),
    source: 'manual',
    worksheetDoc: storedDoc,
    worksheetDocStatus: 'published',
    worksheetDocVersion: version,
    worksheetDocUpdatedAt: now,
    createdAt: now,
    createdBy: USER.uid,
    updatedAt: now,
    updatedBy: USER.uid,
    publishedWorksheetDoc: storedDoc,
    publishedWorksheetDocVersion: version,
    publishedWorksheetDocUpdatedAt: now,
  };
  const versionDoc = {
    lessonId, worksheetId: phase, role: phase, version, status: 'published', worksheetDoc: storedDoc, title: record.title,
    createdAt: now, createdBy: USER.uid, createdByName: USER.displayName, source: 'lesson-worksheet-v1',
  };
  return { record, versionId: `${lessonId}_${phase}_studio_v${version}`, versionDoc };
}

async function preflight() {
  const problems = [];
  for (const id of IDS) {
    if ((await db.doc(`curriculumLessons/${id}`).get()).exists) problems.push(`curriculumLessons/${id} exists`);
    for (const phase of Object.keys(sheets[id])) {
      if ((await db.doc(`curriculumLessons/${id}/worksheets/${phase}`).get()).exists) problems.push(`curriculumLessons/${id}/worksheets/${phase} exists`);
      if ((await db.doc(`worksheetVersions/${id}_${phase}_studio_v1`).get()).exists) problems.push(`worksheetVersions/${id}_${phase}_studio_v1 exists`);
    }
  }
  return problems;
}

async function verify() {
  let ok = true;
  for (const id of IDS) {
    const lesson = await db.doc(`curriculumLessons/${id}`).get();
    const phases = lesson.data()?.worksheetPhases || {};
    const line = [`${id} ${lesson.exists ? 'lesson ok' : 'LESSON MISSING'} level=${lesson.data()?.level}`];
    for (const [phase, doc] of Object.entries(sheets[id])) {
      const snap = await db.doc(`curriculumLessons/${id}/worksheets/${phase}`).get();
      const data = snap.data() || {};
      const blocks = data.publishedWorksheetDoc?.blocks?.length || 0;
      const want = doc.blocks.length;
      const good = snap.exists && data.worksheetDocStatus === 'published' && blocks === want && phases[phase]?.status === 'published';
      ok = ok && good;
      line.push(`${phase} ${good ? 'ok' : 'BAD'} v${data.publishedWorksheetDocVersion || 0} blocks ${blocks}/${want}`);
    }
    console.log(line.join(' · '));
  }
  console.log(ok ? 'VERIFY OK: 6 lessons × 3 published sheets' : 'VERIFY FAILED');
  if (!ok) process.exitCode = 1;
}

if (MODE === 'verify') { await verify(); process.exit(); }

const problems = await preflight();
console.log('\nSEED (create-only):');
for (const r of records) console.log(`  curriculumLessons/${r.id} · ${r.title} · level „${r.level}” · ${r.roadmapKind} · fields: ${Object.keys(r).length + 3}`);
console.log('\nPUBLISH (as „Avalda tund”):');
for (const id of IDS) for (const [phase, doc] of Object.entries(sheets[id])) {
  const bytes = Buffer.byteLength(JSON.stringify(doc));
  console.log(`  curriculumLessons/${id}/worksheets/${phase} „${sheetLabel(doc, phase)}” slot ${PHASES[phase].slot} · ${doc.blocks.length} blocks · ${Math.round(bytes / 1024)} kB · + worksheetVersions/${id}_${phase}_studio_v1 · + worksheetPhases.${phase}`);
}
console.log(`\nby ${USER.displayName} (${USER.uid})`);
if (problems.length) { console.log('\nSTOP — already in production (nothing is written):'); problems.forEach((p) => console.log(`  ${p}`)); process.exit(1); }
console.log('\npreflight: none of these documents exists yet.');
if (MODE !== 'write') { console.log('dry run: nothing written.'); process.exit(); }

// ---------- 1) seed ----------
const seededAt = new Date().toISOString();
for (const r of records) {
  await db.doc(`curriculumLessons/${r.id}`).create(clean({ ...r, createdAt: seededAt, createdBy: USER.uid, updatedAt: seededAt }));
  console.log(`created curriculumLessons/${r.id}`);
}
// ---------- 2) publish, lesson by lesson, phase by phase (as the page does) ----------
for (const id of IDS) {
  for (const [phase, doc] of Object.entries(sheets[id])) {
    const now = new Date().toISOString();
    const lessonRef = db.doc(`curriculumLessons/${id}`);
    const sheetRef = db.doc(`curriculumLessons/${id}/worksheets/${phase}`);
    const { record, versionId, versionDoc } = sheetWrite(id, phase, doc, now);
    const versionRef = db.doc(`worksheetVersions/${versionId}`);
    await db.runTransaction(async (tx) => {
      const [lesson, sheet] = await Promise.all([tx.get(lessonRef), tx.get(sheetRef)]);
      if (!lesson.exists) throw new Error(`${id}: Õppetundi ei leitud.`);
      if (sheet.exists) throw new Error(`${id}/${phase} exists — not overwritten`);
      tx.create(sheetRef, record);
      tx.create(versionRef, versionDoc);
      tx.set(lessonRef, { worksheetPhases: { [phase]: phaseSummary(record) } }, { merge: true });
    });
    console.log(`published ${id}/${phase} v1 (${doc.blocks.length} blocks)`);
  }
}
await verify();
process.exit();
