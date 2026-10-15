// Scenario: rooms („Kabinet”, Oleksiy 2026-10-15). The admin adds one room; a lesson on site takes it; a second lesson
// at the same time cannot be saved on site (the room is taken) and is saved as an online lesson. The server trigger
// keeps roomBookings. Cleans up after itself.
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect } = require('./helpers.cjs');
const { PROJECT, CARDS } = require('../fixtures.cjs');

function adminSdk() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin; }
const created = [];

test.afterAll(async () => {
  const db = adminSdk().firestore();
  for (const id of created) { await db.doc('schedule/' + id).delete().catch(() => {}); await db.doc('roomBookings/' + id).delete().catch(() => {}); }
  const rooms = await db.collection('classrooms').get();
  await Promise.all(rooms.docs.map((doc) => doc.ref.delete()));
});

async function newLesson(page, studentName, time) {
  await page.getByRole('button', { name: /^Lisa tund$/ }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Uus tund' });
  await dialog.getByRole('combobox', { name: /Õpilane/ }).fill(studentName.split(' ')[0]);
  await dialog.getByRole('option', { name: new RegExp(studentName) }).first().click();
  await dialog.getByLabel('Kellaaeg').fill(time);
  return dialog;
}

test('a lesson on site takes a free room; when all rooms are taken it can only be an online lesson', async ({ page }) => {
  const problems = await guard(page);
  const db = adminSdk().firestore();
  await page.setViewportSize({ width: 1440, height: 950 });
  await login(page, 'admin');
  await page.goto('/calendar');
  await page.getByRole('button', { name: /Kabinetid/ }).click();
  const rooms = page.getByRole('dialog', { name: 'Kabinetid' });
  await rooms.getByLabel('Uus kabinet').fill('Kabinet 1');
  await rooms.getByRole('button', { name: 'Lisa' }).click();
  await expect(rooms.getByText('Kabinet 1')).toBeVisible();
  await rooms.getByRole('button', { name: 'Valmis' }).click();
  await expect(page.getByRole('button', { name: /Kabinetid \(1\)/ })).toBeVisible();

  let dialog = await newLesson(page, CARDS.kaarel.name, '10:00');
  await expect(dialog.getByLabel('Kabinet')).toHaveValue('');
  await page.getByRole('button', { name: 'Salvesta tund' }).click();
  await expect(dialog).toHaveCount(0);
  const first = (await db.collection('schedule').where('studentId', '==', CARDS.kaarel.id).where('roomName', '==', 'Kabinet 1').get()).docs[0];
  created.push(first.id);
  await expect.poll(async () => (await db.doc('roomBookings/' + first.id).get()).exists, { timeout: 15000 }).toBe(true);
  await page.reload();

  dialog = await newLesson(page, CARDS.mia.name, '10:30');
  await expect(dialog.getByText(/Kõik kabinetid on sel ajal hõivatud/)).toBeVisible();
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-pavel-keelesepp-release/fefdcb5c-ec33-4d5f-a042-a41caf0552f8/scratchpad/rooms-form.png' });
  await page.getByRole('button', { name: 'Salvesta tund' }).click();
  await expect(dialog.getByText(/Kõik kabinetid on 10:30 ajal hõivatud/)).toBeVisible();
  await dialog.getByLabel('Veebitund (online)').check();
  await page.getByRole('button', { name: 'Salvesta tund' }).click();
  await expect(dialog).toHaveCount(0);
  const second = (await db.collection('schedule').where('studentId', '==', CARDS.mia.id).where('time', '==', '10:30').get()).docs[0];
  created.push(second.id);
  expect(second.data()).toMatchObject({ online: true, roomId: '' });
  expect((await db.doc('roomBookings/' + second.id).get()).exists).toBe(false);
  await page.screenshot({ path: '/private/tmp/claude-501/-Users-pavel-keelesepp-release/fefdcb5c-ec33-4d5f-a042-a41caf0552f8/scratchpad/rooms-grid.png' });
  expect(problems).toEqual([]);
});
