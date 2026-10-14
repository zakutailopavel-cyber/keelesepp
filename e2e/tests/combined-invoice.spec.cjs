// Scenario: one invoice for all subjects of one student (owner / Oleksiy 2026-10-14). Anna learns Estonian and
// English (two cards, one per subject); „Kuuarved” makes ONE invoice with a line per subject, through the real
// manualInvoiceApi on the emulator; a second run never bills a card twice.
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect } = require('./helpers.cjs');
const { PROJECT, PEOPLE, CARDS } = require('../fixtures.cjs');

function adminSdk() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin; }

// the other scenarios pick „Anna Õpilane” by name: remove her second card and what this scenario wrote
test.afterAll(async () => {
  const db = adminSdk().firestore();
  const invoices = await db.collection('invoices').where('studentIds', 'array-contains', CARDS.anna.id).get();
  await Promise.all([
    ...invoices.docs.map((doc) => doc.ref.delete()),
    db.doc('students/e2e-card-anna-en').delete(),
    db.doc('studentRevenuePlans/e2e-card-anna-en').delete(),
    db.doc(`studentRevenuePlans/${CARDS.anna.id}`).delete(),
    db.doc('schedule/e2e-anna-et').delete(),
    db.doc('schedule/e2e-anna-en').delete(),
    db.doc(`students/${CARDS.anna.id}`).update({ parentEmail: admin.firestore.FieldValue.delete() }),
  ]);
});

test('two subjects of one student → one monthly invoice with two lines, never billed twice', async ({ page }) => {
  const problems = await guard(page);
  const db = adminSdk().firestore();
  const now = new Date().toISOString();
  const en = { ...CARDS.anna, id: 'e2e-card-anna-en', subject: 'Inglise keel' };
  delete en.id;
  await db.doc('students/e2e-card-anna-en').set({ ...en, recordingConsent: false, recordingConsentAt: now, createdAt: now.slice(0, 10), updatedAt: now });
  await db.doc(`students/${CARDS.anna.id}`).set({ parentEmail: 'anna.ema@e2e.test' }, { merge: true });
  await db.doc('students/e2e-card-anna-en').set({ parentEmail: 'anna.ema@e2e.test' }, { merge: true });
  for (const [id, cents] of [[CARDS.anna.id, 2000], ['e2e-card-anna-en', 2500]]) {
    await db.doc(`studentRevenuePlans/${id}`).set({ studentId: id, lessonPriceCents: cents, lessonMinutes: 60, billingMode: 'current', updatedAt: now });
  }
  await db.doc('schedule/e2e-anna-et').set({ studentId: CARDS.anna.id, studentName: 'Anna Õpilane', teacher: 'Pavel Õpetaja', teacherUid: PEOPLE.teacher.uid, recurring: true, day: 'Wed', time: '10:00', duration: 60, startDate: '2026-01-07', status: 'Planeeritud' });
  await db.doc('schedule/e2e-anna-en').set({ studentId: 'e2e-card-anna-en', studentName: 'Anna Õpilane', teacher: 'Pavel Õpetaja', teacherUid: PEOPLE.teacher.uid, recurring: true, day: 'Fri', time: '10:00', duration: 60, startDate: '2026-01-09', status: 'Planeeritud' });

  await login(page, 'admin');
  await page.goto('/finance?view=prepare');
  const panel = page.locator('#kuuarved');
  await panel.getByLabel('Otsi õpilast või maksjat').fill('Anna');
  await expect(panel.getByText(/Valitud 2 \/ 2 rida → 1 arvet/)).toBeVisible({ timeout: 20000 });
  await panel.getByRole('button', { name: /Koosta kõik/ }).click();
  // the page reloads its data after creating: both rows now point at the one combined invoice, each with its part
  await expect(panel.getByText(/\(ühisarve\)/)).toHaveCount(2, { timeout: 20000 });
  await expect(panel.getByText('80,00 €')).toBeVisible();
  await expect(panel.getByText('100,00 €')).toBeVisible();

  const invoices = (await db.collection('invoices').where('studentIds', 'array-contains', CARDS.anna.id).get()).docs.map((d) => d.data());
  expect(invoices).toHaveLength(1);
  const [invoice] = invoices;
  expect(invoice.combined).toBe(true);
  expect(invoice.studentIds.sort()).toEqual([CARDS.anna.id, 'e2e-card-anna-en'].sort());
  expect(invoice.lines.map((line) => line.subject).sort()).toEqual(['Eesti keel', 'Inglise keel']);
  const expected = invoice.cardParts.reduce((sum, part) => sum + part.amountCents, 0);
  expect(invoice.amountCents).toBe(expected);
  expect(invoice.cardParts.find((part) => part.studentId === CARDS.anna.id).priceCents).toBe(2000);
  expect(invoice.payerEmail).toBe('anna.ema@e2e.test');

  // both rows now show the combined invoice; nothing is ready to bill again
  await page.reload();
  await panel.getByLabel('Otsi õpilast või maksjat').fill('Anna');
  await expect(panel.getByText(/\(ühisarve\)/)).toHaveCount(2);
  expect((await db.collection('invoices').where('planMonth', '==', invoice.planMonth).get()).docs.filter((d) => (d.data().studentIds || [d.data().studentId]).includes(CARDS.anna.id))).toHaveLength(1);
  expect(problems).toEqual([]);
});
