'use strict';
// Rooms (Oleksiy 2026-10-15) against the real Firestore rules: the admin keeps classrooms, staff read them and the
// room bookings, nobody writes bookings from a client (the server trigger does), students and parents read nothing.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const admin = require('firebase-admin');

const PROJECT = 'demo-keelesepp-finance';
const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const dbHost = process.env.FIRESTORE_EMULATOR_HOST;

function safe() {
  assert.equal(process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT, PROJECT);
  for (const h of [authHost, dbHost]) assert.match(h || '', /^(127\.0\.0\.1|localhost):\d+$/);
}

async function account(role) {
  const r = await fetch(`http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `rm-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`, password: 'emulator-only-password', returnSecureToken: true }),
  });
  const b = await r.json();
  assert.ok(b.idToken);
  const uid = JSON.parse(Buffer.from(b.idToken.split('.')[1], 'base64url')).sub;
  await admin.firestore().doc(`users/${uid}`).set({ role });
  return { token: b.idToken, uid };
}

function enc(v) {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
const base = () => `http://${dbHost}/v1/projects/${PROJECT}/databases/(default)/documents`;
const fields = (data) => JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, enc(v)])) });
const headers = (who) => ({ Authorization: `Bearer ${who.token}`, 'Content-Type': 'application/json' });
const write = async (who, path, data) => (await fetch(`${base()}/${path}`, { method: 'PATCH', headers: headers(who), body: fields(data) })).status;
const read = async (who, path) => (await fetch(`${base()}/${path}`, { headers: headers(who) })).status;

test('rooms: the admin keeps the list, staff read rooms and bookings, clients never write bookings', async () => {
  safe();
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const boss = await account('admin');
  const teacher = await account('teacher');
  const student = await account('student');
  const id = `room_${Date.now()}`;
  const room = { name: 'Kabinet 1', active: true, order: 1, updatedAt: new Date().toISOString(), updatedBy: boss.uid };
  assert.equal(await write(teacher, `classrooms/${id}`, room), 403, 'a teacher does not edit rooms');
  assert.equal(await write(boss, `classrooms/${id}`, { ...room, extra: 1 }), 403, 'only the known fields');
  assert.equal(await write(boss, `classrooms/${id}`, room), 200, 'the admin adds a room');
  assert.equal(await read(teacher, `classrooms/${id}`), 200, 'a teacher reads the rooms');
  assert.equal(await read(student, `classrooms/${id}`), 403, 'a student does not');
  await admin.firestore().doc(`roomBookings/${id}`).set({ scheduleId: id, roomId: id, time: '10:00' });
  assert.equal(await read(teacher, `roomBookings/${id}`), 200, 'a teacher reads the bookings');
  assert.equal(await read(student, `roomBookings/${id}`), 403, 'a student does not');
  assert.equal(await write(boss, `roomBookings/${id}`, { scheduleId: id, roomId: 'x' }), 403, 'no client writes a booking');
});
