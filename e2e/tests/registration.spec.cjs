// Scenario 2: registration → approval → linking (docs/E2E_SCENARIOS.md)
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect } = require('./helpers.cjs');
const { PROJECT, PASSWORD } = require('../fixtures.cjs');

function adminSdk() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin; }

async function register(page, { role, name, email }) {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Loo uus konto' }).click();
  await page.getByRole('radio', { name: role === 'parent' ? 'Lapsevanem' : 'Õpilane' }).click();
  await page.getByLabel('Täisnimi').fill(name);
  await page.getByLabel('E-post').fill(email);
  await page.getByLabel('Parool', { exact: true }).fill(PASSWORD);
  await page.getByLabel('Korda parooli').fill(PASSWORD);
  await page.locator('input[name="acceptedTerms"]').check();
  await page.getByRole('button', { name: 'Loo konto', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Konto ootab kinnitamist' })).toBeVisible();
}

async function approve(page, name) {
  await login(page, 'admin');
  await page.goto('/accounts');
  const row = page.locator('.account-row', { hasText: name });
  await row.getByRole('button', { name: 'Kinnita' }).click();
  await expect(page.locator('.account-row', { hasText: name })).toHaveCount(0);
}

async function logout(page) {
  await page.context().clearCookies();
  await page.evaluate(() => { indexedDB.deleteDatabase('firebaseLocalStorageDb'); localStorage.clear(); sessionStorage.clear(); });
}

test('a new student registers, the admin approves, the student gets her own card on first login', async ({ browser }) => {
  const studentPage = await (await browser.newContext()).newPage();
  const adminPage = await (await browser.newContext()).newPage();
  const problems = [...await guard(studentPage), ...await guard(adminPage)];
  await register(studentPage, { role: 'student', name: 'Uus Õpilane', email: 'uus.opilane@e2e.test' });
  await approve(adminPage, 'Uus Õpilane');
  await login(studentPage, { email: 'uus.opilane@e2e.test' });
  await expect(studentPage.getByRole('navigation').first().getByRole('link', { name: 'Minu vead' })).toBeVisible();
  const user = await adminSdk().auth().getUserByEmail('uus.opilane@e2e.test');
  await expect.poll(async () => (await adminSdk().firestore().doc(`students/self_${user.uid}`).get()).data()?.name).toBe('Uus Õpilane');
  expect(problems).toEqual([]);
});

test('a mother whose e-mail is on her child\'s card is not linked as the child: the admin links her as the parent', async ({ browser }) => {
  const motherPage = await (await browser.newContext()).newPage();
  const adminPage = await (await browser.newContext()).newPage();
  const problems = [...await guard(motherPage), ...await guard(adminPage)];
  await register(motherPage, { role: 'student', name: 'Mari Ema', email: 'mari.ema@e2e.test' });
  // as with a Google account: the e-mail is verified
  const mother = await adminSdk().auth().getUserByEmail('mari.ema@e2e.test');
  await adminSdk().auth().updateUser(mother.uid, { emailVerified: true });
  await approve(adminPage, 'Mari Ema');
  await login(motherPage, { email: 'mari.ema@e2e.test' });
  const kristi = (await adminSdk().firestore().doc('students/e2e-card-kristi').get()).data();
  expect(kristi.studentUid || '').toBe('');
  await adminPage.goto('/accounts');
  const review = adminPage.getByRole('article', { name: 'Otsus: Mari Ema' });
  await expect(review).toContainText('lapse kaardil');
  await review.getByRole('button', { name: /Seo lapsevanemana/ }).click();
  await expect(adminPage.getByText(/on nüüd „Kristi Laps” lapsevanem/)).toBeVisible();
  const linked = (await adminSdk().firestore().doc('students/e2e-card-kristi').get()).data();
  expect(linked.parentUid).toBe(mother.uid);
  expect(linked.studentUid || '').toBe('');
  expect(problems).toEqual([]);
});
