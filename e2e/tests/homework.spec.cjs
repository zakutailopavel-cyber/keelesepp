// Scenario 3: the teacher gives a published course sheet, the student does it and hands it in, the teacher sees the
// result (docs/E2E_SCENARIOS.md)
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect, completeCardData } = require('./helpers.cjs');
const { PROJECT, CARDS } = require('../fixtures.cjs');

function db() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin.firestore(); }

test('teacher assigns a sheet → student answers and hands in → teacher sees the score', async ({ browser }) => {
  const teacher = await (await browser.newContext()).newPage();
  const student = await (await browser.newContext()).newPage();
  const problems = [...await guard(teacher), ...await guard(student)];
  // Anna is an existing learner with a complete card: no „Puuduvad andmed” form (that is homework-phone.spec.cjs)
  await completeCardData(CARDS.anna);
  // the scenario starts without sheets for Anna (an earlier spec in the same run may have assigned one)
  const assigned = () => db().collection('worksheetAssignments').where('studentId', '==', CARDS.anna.id).get();
  for (const doc of (await assigned()).docs) await doc.ref.delete();

  await login(teacher, 'teacher');
  await teacher.goto('/library/lessons/e2e-001/worksheets/discover');
  // staff see the „what's new” notice once after signing in: read it and close it, as a teacher would
  const notice = teacher.getByRole('dialog').filter({ has: teacher.getByRole('button', { name: 'Selge' }) });
  await expect(notice).toBeVisible();
  await notice.getByRole('button', { name: 'Selge' }).click();
  await expect(notice).toHaveCount(0);
  await teacher.getByRole('link', { name: 'Määra õpilastele' }).click();
  const dialog = teacher.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Otsi õpilast määramiseks').fill('Anna');
  await dialog.locator('label', { hasText: 'Anna Õpilane' }).locator('input[type="checkbox"]').check();
  await dialog.getByRole('button', { name: /Määra 1 õpilasele/ }).click();
  await expect(teacher.getByText(/määrati 1 õpilasele/)).toBeVisible();
  await expect.poll(async () => (await assigned()).size).toBe(1);

  await login(student, 'student');
  await student.getByRole('navigation').first().getByRole('link', { name: 'Ülesanded' }).click();
  await expect(student).toHaveURL(/\/homework/);
  await student.getByRole('article').filter({ hasText: 'Minu päev' }).getByRole('button', { name: 'Alusta' }).click();
  await expect(student.locator('.ws-page').first()).toBeVisible();
  const answers = ['ärkan', 'joob', 'läheme', 'söövad', 'loed'];
  const gaps = student.locator('.ws-page [data-block="e2e_gaps"] input');
  await expect(gaps).toHaveCount(5);
  for (let i = 0; i < answers.length; i += 1) await gaps.nth(i).fill(answers[i]);
  const choice = student.locator('.ws-page [data-block="e2e_choice"]');
  for (const option of ['kell seitse', 'kohvi', 'tööle', 'hommikul', 'Anna']) await choice.getByRole('button', { name: option, exact: true }).click();
  student.on('dialog', (d) => d.accept());
  await student.getByRole('button', { name: /Esita tööleht/ }).click();
  await expect(student.getByText('Esitatud').first()).toBeVisible();

  const saved = async () => (await assigned()).docs[0].data();
  await expect.poll(async () => (await saved()).status, { timeout: 20000 }).toBe('done');
  const done = await saved();
  expect(done.score?.pct ?? done.score).toBeGreaterThanOrEqual(90);

  await teacher.goto('/homework');
  await expect(teacher.getByText('Anna Õpilane').first()).toBeVisible();
  await expect(teacher.getByText(/Minu päev/).first()).toBeVisible();
  expect(problems).toEqual([]);
});
