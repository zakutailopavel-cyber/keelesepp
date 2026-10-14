// Scenario: the administrator changes a parent's name and e-mail (docs/E2E_SCENARIOS.md): the login e-mail changes
// (the password stays), the child's card follows (new invoices), the parent logs in with the new e-mail.
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect } = require('./helpers.cjs');
const { PROJECT, PEOPLE, CARDS } = require('../fixtures.cjs');

function adminSdk() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin; }

// the other scenarios log in as this parent: put the seeded account back
test.afterAll(async () => {
  await adminSdk().auth().updateUser(PEOPLE.parent.uid, { email: PEOPLE.parent.email, displayName: PEOPLE.parent.name });
  await adminSdk().firestore().doc(`users/${PEOPLE.parent.uid}`).set({ displayName: PEOPLE.parent.name, email: PEOPLE.parent.email }, { merge: true });
  await adminSdk().firestore().doc(`students/${CARDS.kaarel.id}`).set({ parentName: PEOPLE.parent.name, parentEmail: PEOPLE.parent.email }, { merge: true });
});

test('the admin edits a parent; the account, the child card and the next login follow', async ({ browser }) => {
  const adminPage = await (await browser.newContext()).newPage();
  const parentPage = await (await browser.newContext()).newPage();
  const problems = [...await guard(adminPage), ...await guard(parentPage)];
  const db = adminSdk().firestore();
  await db.doc(`students/${CARDS.kaarel.id}`).set({ parentName: PEOPLE.parent.name, parentEmail: PEOPLE.parent.email }, { merge: true });

  await login(adminPage, 'admin');
  await adminPage.goto('/parents');
  const card = adminPage.locator('.parent-card', { hasText: PEOPLE.parent.name });
  await card.getByRole('button', { name: /Muuda/ }).click();
  const dialog = adminPage.getByRole('dialog', { name: `Muuda: ${PEOPLE.parent.name}` });
  await dialog.getByLabel('Nimi').fill('Liis Tamm');
  await dialog.getByLabel('E-post (ka sisselogimiseks)').fill('liis.tamm@e2e.test');
  await dialog.getByLabel('Telefon').fill('+372 5555 1234');
  await dialog.getByRole('button', { name: 'Salvesta' }).click();
  await expect(adminPage.getByRole('status').filter({ hasText: 'Sisselogimise e-post on nüüd liis.tamm@e2e.test' })).toBeVisible();

  const user = await adminSdk().auth().getUser(PEOPLE.parent.uid);
  expect(user.email).toBe('liis.tamm@e2e.test');
  expect(user.displayName).toBe('Liis Tamm');
  expect((await db.doc(`users/${PEOPLE.parent.uid}`).get()).data()).toMatchObject({ displayName: 'Liis Tamm', email: 'liis.tamm@e2e.test', phone: '+372 5555 1234' });
  expect((await db.doc(`students/${CARDS.kaarel.id}`).get()).data()).toMatchObject({ parentName: 'Liis Tamm', parentEmail: 'liis.tamm@e2e.test' });

  await login(parentPage, { email: 'liis.tamm@e2e.test' });
  await expect(parentPage.getByText('Kaarel Laps').first()).toBeVisible();
  expect(problems).toEqual([]);
});
