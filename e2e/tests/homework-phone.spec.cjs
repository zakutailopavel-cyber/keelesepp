// The student on a phone (docs/WORKSHEET_PHONE_VIEW.md): the real assignment in Firestore with the real rules. She fills the
// column, the answers are autosaved, a reload brings them back, she hands in; the score is the one the desktop gets.
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect } = require('./helpers.cjs');
const { PROJECT, CARDS } = require('../fixtures.cjs');

function db() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin.firestore(); }

test('student on a phone: autosave, reload, hand in', async ({ browser }) => {
  const teacher = await (await browser.newContext()).newPage();
  const student = await (await browser.newContext({ hasTouch: true, viewport: { width: 1280, height: 800 } })).newPage();
  const problems = [...await guard(teacher), ...await guard(student)];
  const col = () => db().collection('worksheetAssignments').where('studentId', '==', CARDS.anna.id).get();
  const before = (await col()).size;

  await login(teacher, 'teacher');
  await teacher.goto('/library/lessons/e2e-001/worksheets/discover');
  await teacher.getByRole('link', { name: 'Määra õpilastele' }).click();
  const dialog = teacher.getByRole('dialog');
  await dialog.getByLabel('Otsi õpilast määramiseks').fill('Anna');
  await dialog.locator('label', { hasText: 'Anna Õpilane' }).locator('input[type="checkbox"]').check();
  await dialog.getByRole('button', { name: /Määra 1 õpilasele/ }).click();
  await expect.poll(async () => (await col()).size).toBe(before + 1);

  // the seeded card lacks the data the school now asks for at the door: fill it, then go on as usual
  await login(student, 'student', { fillMissingData: true });
  const saved = (await db().doc(`students/${CARDS.anna.id}`).get()).data();
  expect(saved.preferredLanguage).toBe('et');
  expect((await db().doc(`studentAvailability/${CARDS.anna.id}`).get()).data()?.slots?.length).toBeGreaterThan(0);
  await student.setViewportSize({ width: 375, height: 812 });
  await student.goto('/homework');
  // „Ülesanded”: the sheet is a card in „Tee nüüd” with one action, „Alusta” (after autosaved answers „Jätka”)
  const sheetCard = student.getByRole('region', { name: /Tee nüüd/ }).getByRole('article').filter({ hasText: 'Minu päev' });
  await sheetCard.getByRole('button', { name: /Alusta|Jätka/ }).click();
  await expect(student.locator('.ws-root.is-flow .ws-page')).toBeVisible();
  const overflow = await student.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  const answers = ['ärkan', 'joob', 'läheme', 'söövad', 'loed'];
  const gaps = student.locator('.ws-page [data-block="e2e_gaps"] input');
  await expect(gaps).toHaveCount(5);
  await gaps.nth(0).fill(answers[0]);
  await expect(student.locator('.ws-flow-save')).toHaveText(/Salvestatud/, { timeout: 15000 });
  await expect.poll(async () => Object.values((await col()).docs.map((d) => d.data()).find((a) => a.status !== 'done')?.answers || {})).toContain(answers[0]);

  await student.reload();
  await sheetCard.getByRole('button', { name: /Jätka/ }).click();
  await expect(gaps.nth(0)).toHaveValue(answers[0]);

  for (let i = 1; i < answers.length; i += 1) await gaps.nth(i).fill(answers[i]);
  const choice = student.locator('.ws-page [data-block="e2e_choice"]');
  for (const option of ['kell seitse', 'kohvi', 'tööle', 'hommikul', 'Anna']) await choice.getByRole('button', { name: option, exact: true }).tap();
  student.on('dialog', (d) => d.accept());
  await student.getByRole('button', { name: /Esita tööleht/ }).tap();
  await expect.poll(async () => (await col()).docs.some((d) => d.data().status === 'done'), { timeout: 20000 }).toBe(true);
  const done = (await col()).docs.map((d) => d.data()).find((a) => a.status === 'done');
  expect(done.score?.pct ?? done.score).toBeGreaterThanOrEqual(90);
  expect(problems).toEqual([]);
});
