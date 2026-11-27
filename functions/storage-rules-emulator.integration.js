'use strict';
// Student files against the real storage.rules (audit 2026-11-28): a teacher opens and writes only the files of the
// students on whose card they are a teacher (teacherUid / teacherUids); the administrator opens all; the student's
// own account keeps its access; shared teaching material stays with every teacher.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const BUCKET = `${PROJECT}.appspot.com`;
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;
const storageHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST;

function safe() {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  // no storage emulator is a failure, not a skip: the rules must not go untested
  for (const h of [authHost, dbHost, storageHost]) assert.match(h || '', /^(127\.0\.0\.1|localhost):\d+$/);
}

async function account(role) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `st-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  assert.ok(b.idToken);
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}

const auth = (who) => ({ Authorization: `Firebase ${who.token}` });
// a multipart upload, as the web SDK sends it: the metadata part carries the content type the rules look at
const upload = async (who, path, type = 'image/png') => {
  const boundary = 'emulatorboundary';
  const body = [`--${boundary}`, 'Content-Type: application/json; charset=utf-8', '', JSON.stringify({ name: path, contentType: type }), `--${boundary}`, `Content-Type: ${type}`, '', 'emulator file', `--${boundary}--`, ''].join('\r\n');
  const response = await fetch(`http://${storageHost}/v0/b/${BUCKET}/o?name=${encodeURIComponent(path)}`, { method: 'POST', headers: { ...auth(who), 'Content-Type': `multipart/related; boundary=${boundary}`, 'X-Goog-Upload-Protocol': 'multipart' }, body });
  return response.status;
};
const read = async (who, path) => (await fetch(`http://${storageHost}/v0/b/${BUCKET}/o/${encodeURIComponent(path)}`, { headers: auth(who) })).status;

test('student files: only the student\'s own teachers, the administrator and the student\'s account', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const own = await account('teacher');
  const second = await account('teacher');
  const other = await account('teacher');
  const learner = await account('student');
  const stranger = await account('student');
  const studentId = `st_${Date.now()}`;
  await admin.firestore().doc(`students/${studentId}`).set({ name: 'Storage Student', teacherUid: own.uid, teacherUids: [own.uid, second.uid], linkedUserId: learner.uid, studentUid: learner.uid });
  await admin.firestore().doc(`users/${learner.uid}`).set({ role: 'student', linkedStudentIds: [studentId] });

  // the ground first: the role lookup works (shared material), then the administrator on a student's folder
  assert.equal(await upload(boss, 'eesti_soned.json', 'application/json'), 200, 'the role lookup works: the administrator writes the word list (no content check)');
  assert.equal(await upload(boss, 'curriculum/base-admin.png'), 200, 'the administrator adds course material');
  assert.equal(await upload(own, 'curriculum/base-teacher.png'), 200, 'a teacher adds course material');
  assert.equal(await upload(boss, `homework/${studentId}/by-admin.png`), 200, 'the administrator writes into a student folder');

  for (const folder of [`homework/${studentId}`, `lessons/${studentId}`, `student-worksheets/${studentId}`, `whiteboards/${studentId}/materials`]) {
    const path = `${folder}/file.png`;
    assert.equal(await upload(other, path), 403, `${folder}: another teacher does not write`);
    assert.equal(await upload(own, path), 200, `${folder}: the student's teacher writes`);
    assert.equal(await read(own, path), 200, `${folder}: the student's teacher reads`);
    assert.equal(await read(second, path), 200, `${folder}: a second teacher of the card reads`);
    assert.equal(await read(boss, path), 200, `${folder}: the administrator reads`);
    assert.equal(await read(other, path), 403, `${folder}: another teacher does not read`);
    assert.equal(await read(learner, path), 200, `${folder}: the student's own account reads`);
    assert.equal(await read(stranger, path), 403, `${folder}: another student does not read`);
  }

  // the student's own uploads: homework files, a photo on the board, a recorded answer, the monthly monologue
  assert.equal(await upload(learner, `homework/${studentId}/own.png`), 200, 'the student uploads homework');
  assert.equal(await upload(learner, `whiteboards/${studentId}/student/photo.png`), 200, 'the student adds a photo to the board');
  assert.equal(await read(other, `whiteboards/${studentId}/student/photo.png`), 403, 'another teacher does not see it');
  assert.equal(await read(own, `whiteboards/${studentId}/student/photo.png`), 200, 'the teacher does');
  const answer = `worksheet-submissions/${studentId}/a1/answer.webm`;
  assert.equal(await upload(other, answer, 'audio/webm'), 403, 'another teacher does not add an answer');
  assert.equal(await upload(learner, answer, 'audio/webm'), 200, 'the student records an answer');
  assert.equal(await read(other, answer), 403, 'another teacher does not hear it');
  assert.equal(await read(second, answer), 200, 'a teacher of the card does');
  const monologue = `homework/${studentId}/monologues/2026-11.webm`;
  assert.equal(await upload(own, monologue, 'audio/webm'), 403, 'a teacher never records the monologue');
  assert.equal(await upload(learner, monologue, 'audio/webm'), 200, 'the student records the monologue');
  assert.equal(await read(own, monologue), 200, 'the teacher listens');
  assert.equal(await read(other, monologue), 403, 'another teacher does not');
  assert.equal(await read(boss, monologue), 200, 'the administrator listens');

  // a card that does not exist gives a teacher nothing; shared teaching material stays with every teacher
  assert.equal(await upload(own, 'homework/no-such-student/file.png'), 403, 'no card, no access');
  assert.equal(await upload(other, 'curriculum/shared.png'), 200, 'any teacher adds course material');
  assert.equal(await read(learner, 'curriculum/shared.png'), 200, 'a linked student reads course material');
});
