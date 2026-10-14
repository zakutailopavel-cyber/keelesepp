// Playwright global setup: a clean emulator with the scenario people, cards and one published course sheet.
const path = require('path');
const admin = require(path.join(__dirname, '../functions/node_modules/firebase-admin'));
const { PASSWORD, PEOPLE, CARDS, PROJECT } = require('./fixtures.cjs');

async function clear() {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  if (!host || !authHost) throw new Error('Run the scenarios through `npm run emulated` (emulators are not running).');
  await fetch(`http://${host}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://${authHost}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}

const sheet = {
  schema: 'keelesepp.worksheet/2', id: 'ws_e2e-001_discover', status: 'published', version: 1,
  meta: { title: 'Minu päev', subtitle: 'Avasta', level: 'A2', module: 'Igapäevaelu', canDo: 'Ma räägin oma päevast.', phase: 'discover', displayLabel: '1 Avasta',
    goals: { g_vocab: 'Õpilane kasutab päeva sõnu.', g_read: 'Õpilane leiab tekstist kellaajad.', g_notice: 'Õpilane moodustab olevikuvorme.', g_use: 'Õpilane räägib oma päevast.' } },
  blocks: [
    { id: 'e2e_text', type: 'text', width: 'full', span: 12, tone: 'white', goal: '', data: { heading: 'Hommik', text: 'Anna ärkab kell seitse ja joob kohvi. Siis läheb ta tööle.' } },
    { id: 'e2e_gaps', type: 'gaps', width: 'full', span: 12, tone: 'blue', goal: 'g_notice', data: { title: 'Kirjuta õige vorm.', instruction: 'Kirjuta sulgudes olev sõna õiges vormis.', sentences: 'Ma [ärkan] (ärkama) kell seitse.\nTa [joob] (jooma) kohvi.\nMe [läheme] (minema) tööle.\nNad [söövad] (sööma) lõunat.\nSa [loed] (lugema) raamatut.', bank: '', showBank: 'no' } },
    { id: 'e2e_choice', type: 'choice', width: 'full', span: 12, tone: 'sky', goal: 'g_read', data: { title: 'Vali õige vastus.', instruction: 'Loe tekst ja vali.', questions: [
      { q: 'Mis kell Anna ärkab?', options: '*kell seitse\nkell kaheksa\nkell üheksa' },
      { q: 'Mida ta joob?', options: '*kohvi\nteed\nmahla' },
      { q: 'Kuhu ta läheb?', options: '*tööle\nkooli\npoodi' },
      { q: 'Millal ta ärkab?', options: '*hommikul\nõhtul\nöösel' },
      { q: 'Kes ärkab kell seitse?', options: '*Anna\nMari\nLiis' } ] } },
  ],
};

module.exports = async function seed() {
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  await clear();
  const db = admin.firestore();
  const now = new Date().toISOString();
  for (const person of Object.values(PEOPLE)) {
    await admin.auth().createUser({ uid: person.uid, email: person.email, password: PASSWORD, displayName: person.name, emailVerified: true });
    if (person.claims) await admin.auth().setCustomUserClaims(person.uid, person.claims);
    await db.doc(`users/${person.uid}`).set({ uid: person.uid, email: person.email, displayName: person.name, name: person.name, role: person.role, roles: person.claims?.roles || [person.role], approvalStatus: 'approved', acceptedTermsAt: now, createdAt: now });
  }
  for (const card of Object.values(CARDS)) {
    const { id, ...data } = card;
    await db.doc(`students/${id}`).set({ ...data, createdAt: now.slice(0, 10), updatedAt: now });
  }
  await db.doc('securityConfig/teacherDirectoryV1').set({ teachers: { pavel: PEOPLE.teacher.uid } });
  await db.doc('curriculumLessons/e2e-001').set({ type: 'lesson', title: 'Minu päev', level: 'A2', subject: 'Eesti keel', roadmapManaged: true, roadmapModuleNumber: 1, roadmapModuleTitle: 'Igapäevaelu', roadmapLessonNumber: 1, worksheetPhases: { discover: { title: 'Minu päev', status: 'published', version: 1, publishedVersion: 1, updatedAt: now } }, createdAt: now });
  await db.doc('curriculumLessons/e2e-001/worksheets/discover').set({ schema: 'keelesepp.lesson-worksheet/1', lessonId: 'e2e-001', worksheetId: 'discover', role: 'discover', slot: 1, displayLabel: '1 Avasta', title: 'Minu päev', source: 'manual',
    worksheetDoc: sheet, worksheetDocStatus: 'published', worksheetDocVersion: 1, worksheetDocUpdatedAt: now, publishedWorksheetDoc: sheet, publishedWorksheetDocVersion: 1, publishedWorksheetDocUpdatedAt: now, createdAt: now, createdBy: PEOPLE.admin.uid, updatedAt: now, updatedBy: PEOPLE.admin.uid });
};
