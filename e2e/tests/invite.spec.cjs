// Scenario: „Saada kutse” on the student card (docs/E2E_SCENARIOS.md). Kaarel logs in with his parent's account;
// the admin gives him his own login, he sets the password from the link and sees his own studies.
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect } = require('./helpers.cjs');
const { PROJECT, PASSWORD, CARDS, PEOPLE } = require('../fixtures.cjs');

function adminSdk() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin; }
const EMAIL = 'kaarel@e2e.test';

test('the admin invites a child who used the parent login; he sets a password and logs in to his own studies', async ({ browser }) => {
  const adminPage = await (await browser.newContext()).newPage();
  const kaarelPage = await (await browser.newContext()).newPage();
  const problems = [...await guard(adminPage), ...await guard(kaarelPage)];

  await login(adminPage, 'admin');
  await adminPage.goto(`/students/${CARDS.kaarel.id}`);
  const card = adminPage.locator('.student-account-card');
  await expect(card).toContainText('lapsevanema kontoga');
  await card.getByRole('button', { name: /Saada kutse/ }).click();
  // the parent's e-mail is never offered as the child's login
  await expect(card.getByLabel('Õpilase e-post')).toHaveValue('');
  await card.getByLabel('Õpilase e-post').fill(PEOPLE.parent.email);
  await card.getByRole('button', { name: /^Saada$/ }).click();
  await expect(card.getByRole('alert')).toContainText('lapsevanema konto');
  await card.getByLabel('Õpilase e-post').fill(EMAIL);
  await card.getByRole('button', { name: /^Saada$/ }).click();
  await expect(card.getByRole('status')).toContainText(`Konto loodud: ${EMAIL}`);
  await expect(card).toContainText('Õpilasel on oma konto');

  const db = adminSdk().firestore();
  const user = await adminSdk().auth().getUserByEmail(EMAIL);
  const kaarel = (await db.doc(`students/${CARDS.kaarel.id}`).get()).data();
  expect(kaarel.studentUid).toBe(user.uid);
  expect(kaarel.parentUid).toBe(PEOPLE.parent.uid);
  expect((await db.doc(`users/${user.uid}`).get()).data()).toMatchObject({ role: 'student', approvalStatus: 'approved' });

  // the e-mail (queued: the emulators have no mail server) carries the password link
  const mail = (await db.collection('emailQueue').where('to', '==', EMAIL).get()).docs[0].data();
  const link = mail.text.match(/https?:\/\/\S*oobCode=[^\s&]+\S*/)[0];
  const oobCode = new URL(link).searchParams.get('oobCode');
  const reset = await fetch(`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=demo-key`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oobCode, newPassword: PASSWORD }),
  });
  expect(reset.ok).toBe(true);

  await login(kaarelPage, { email: EMAIL });
  await expect(kaarelPage.getByRole('navigation').first().getByRole('link', { name: 'Minu vead' })).toBeVisible();
  await expect(kaarelPage.getByText(/Tere, Kaarel/)).toBeVisible();

  // a second click on the linked card sends a new password link, never a second account
  await adminPage.reload();
  await adminPage.locator('.student-account-card').getByRole('button', { name: /Saada parooli link/ }).click();
  await expect(adminPage.locator('.student-account-card').getByRole('status')).toContainText(`Parooli link: ${EMAIL}`);
  expect((await adminSdk().auth().listUsers()).users.filter((u) => u.email === EMAIL)).toHaveLength(1);
  expect(problems).toEqual([]);
});
