// Scenario: lesson tokens (docs/LESSON_TOKENS.md). The admin invoices Kaarel's parent for 9 lessons, registers the
// payment, adds the lessons; a held lesson takes one (server trigger); the student card and the parent see 8 left.
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect, completeCardData } = require('./helpers.cjs');
const { PROJECT, CARDS, PEOPLE } = require('../fixtures.cjs');

function adminSdk() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin; }
const KAAREL = CARDS.kaarel.id;

test.afterAll(async () => {
  const db = adminSdk().firestore();
  const drop = async (collection, field) => Promise.all((await db.collection(collection).where(field, '==', KAAREL).get()).docs.map((doc) => doc.ref.delete()));
  await Promise.all([drop('invoices', 'studentId'), drop('studentPackages', 'studentId'), drop('packageLedger', 'studentId'), drop('lessons', 'studentId'), drop('payments', 'studentId'), db.doc(`studentRevenuePlans/${KAAREL}`).delete()]);
});

test('a package invoice → payment → „Lisa tunnid” → a held lesson takes one → the card shows the balance, the parent does not', async ({ browser }) => {
  test.setTimeout(150_000);
  const adminPage = await (await browser.newContext()).newPage();
  const parentPage = await (await browser.newContext()).newPage();
  const problems = [...await guard(adminPage), ...await guard(parentPage)];
  const db = adminSdk().firestore();
  // Kaarel's card is complete: his parent reaches the family page, not „Puuduvad andmed”
  await completeCardData(CARDS.kaarel);
  await db.doc(`studentRevenuePlans/${KAAREL}`).set({ studentId: KAAREL, studentName: 'Kaarel Laps', lessonPriceCents: 2000, lessonMinutes: 60, weeklyLessons: 2, billingMode: 'package', currency: 'EUR', active: true, updatedAt: new Date().toISOString(), updatedByUid: 'seed' });

  await login(adminPage, 'admin');
  await adminPage.goto('/finance');
  await adminPage.getByRole('button', { name: /Tunnipakett/ }).click();
  const dialog = adminPage.getByRole('dialog', { name: /Tunnipakett/ });
  await dialog.getByLabel('Õpilane', { exact: true }).selectOption(KAAREL);
  // the package is for one course (#1051): Kaarel has only Estonian, which the dialog already chooses
  await expect(dialog.getByLabel('Aine (kursus)')).toHaveValue('Eesti keel');
  await expect(dialog.getByText(PEOPLE.parent.name, { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: '9' }).click();
  await expect(dialog.getByRole('status')).toContainText('180,00');
  await dialog.getByRole('button', { name: 'Loo arve' }).click();
  await expect(adminPage.getByText(/Tunnipaketi arve .* loodi/)).toBeVisible();

  const row = adminPage.getByRole('row').filter({ hasText: 'Kaarel Laps' }).filter({ hasText: 'Tunnipakett · 9 tundi' });
  await row.getByRole('button', { name: 'Makse' }).click();
  const pay = adminPage.getByRole('dialog', { name: /Registreeri makse/ });
  await pay.getByLabel('Summa (€)').fill('180');
  await pay.getByRole('button', { name: 'Registreeri' }).click();
  await expect(adminPage.getByText('Makse registreeriti.')).toBeVisible();
  await row.getByRole('button', { name: 'Lisa tunnid (9)' }).click();
  await expect(adminPage.getByText('Kaarel Laps: lisati 9 tundi.')).toBeVisible();
  // the row now reads the package: bought / held / left
  await expect(row).toContainText(/alles 9|lisatud õpilasele/);

  const balance = async () => (await db.collection('studentPackages').where('studentId', '==', KAAREL).get()).docs[0]?.data().balanceCredits;
  expect(await balance()).toBe(9);
  // the teacher marks a lesson held (as the calendar writes it); the server trigger takes one lesson
  await db.doc('lessons/e2e-token-lesson').set({ studentId: KAAREL, studentName: 'Kaarel Laps', date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Tallinn' }).format(new Date()), status: 'Toimunud', teacherUid: PEOPLE.teacher.uid, teacher: PEOPLE.teacher.name, accountingSource: 'crm_v2' });
  await expect.poll(balance, { timeout: 20000 }).toBe(8);

  await adminPage.goto(`/students/${KAAREL}?tab=finance`);
  await expect(adminPage.getByText('8 tundi alles')).toBeVisible();
  await expect(adminPage.getByText(/arve KS-/)).toBeVisible();

  await login(parentPage, 'parent');
  await parentPage.goto('/parent');
  // the balance is for the administrator and the accountant only (owner 2026-11-02): the parent's „Tunnid” has no package
  await parentPage.locator('#tunnid').getByRole('button', { name: /Tunnid/ }).click();
  await expect(parentPage.getByText(/Järgmised tunnid/)).toBeVisible();
  await expect(parentPage.getByText(/Tunnipakett/)).toHaveCount(0);
  await expect(parentPage.getByText(/tundi alles|Paketist alles/)).toHaveCount(0);
  expect(problems).toEqual([]);
});
