// Scenario: „Kontroll” on Finantsid (owner 2026-10-15: „сверять счета по оплатам”). An old invoice marked paid without
// a payment record gets one; a payment entered twice is voided; an LHV statement row is matched to an open invoice by
// its number and recorded — all through the real financeApi on the emulator. Cleans up after itself.
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect } = require('./helpers.cjs');
const { PROJECT, CARDS } = require('../fixtures.cjs');

function adminSdk() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin; }
const IDS = ['e2e-check-legacy', 'e2e-check-dup', 'e2e-check-open'];

test.afterAll(async () => {
  const db = adminSdk().firestore();
  for (const id of IDS) {
    await db.doc(`invoices/${id}`).delete();
    const payments = await db.collection('payments').where('invoiceId', '==', id).get();
    await Promise.all(payments.docs.map((doc) => doc.ref.delete()));
  }
  const bank = await db.collection('bankTransactions').where('payerName', '==', 'SMIRNOVA JEKATERINA').get();
  await Promise.all(bank.docs.map((doc) => doc.ref.delete()));
});

test('the admin checks invoices against payments: adds a missing record, voids a double one, imports an LHV row', async ({ page }) => {
  const problems = await guard(page);
  const db = adminSdk().firestore();
  const student = { studentId: CARDS.kaarel.id, studentName: 'Kaarel Laps' };
  await db.doc('invoices/e2e-check-legacy').set({ ...student, num: 'KS-2026-901', amount: 63, date: '2026-06-19', due: '2026-06-24', paymentReference: 'KS-2026-901', status: 'Makstud', paidAt: '2026-06-19', parentPaymentMethod: 'bank' });
  await db.doc('invoices/e2e-check-dup').set({ ...student, num: 'KS-2026-902', amount: 180, amountCents: 18000, paidAmountCents: 36000, balanceDueCents: 0, date: '2026-09-01', due: '2026-09-10', paymentReference: 'KS-2026-902', status: 'Makstud', paymentStatus: 'overpaid', paidAt: '2026-09-01' });
  for (const [id, at] of [['e2e-check-pay-a', '2026-09-01T09:57:28.010Z'], ['e2e-check-pay-b', '2026-09-01T09:57:30.470Z']]) {
    await db.doc(`payments/${id}`).set({ invoiceId: 'e2e-check-dup', invoiceNum: 'KS-2026-902', ...student, amountCents: 18000, amount: 180, paidAt: '2026-09-01', method: 'bank', status: 'active', createdAt: at, requestId: id });
  }
  await db.doc('invoices/e2e-check-open').set({ ...student, num: 'KS-2026-903', amount: 105, amountCents: 10500, balanceDueCents: 10500, date: '2026-10-01', due: '2026-10-10', paymentReference: 'KS-2026-903', status: 'Ootel', payerName: 'Jekaterina Smirnova' });

  await login(page, 'admin');
  await page.goto('/finance?view=check');
  const duplicate = page.getByRole('region', { name: /kaks korda/ });
  await expect(duplicate).toContainText('KS-2026-902');
  page.once('dialog', (dialog) => dialog.accept());
  await duplicate.getByRole('button', { name: 'Tühista korduv' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Korduv makse arvelt KS-2026-902 tühistati' })).toBeVisible();
  expect((await db.doc('payments/e2e-check-pay-b').get()).data().status).toBe('voided');
  expect((await db.doc('payments/e2e-check-pay-a').get()).data().status).toBe('active');
  expect((await db.doc('invoices/e2e-check-dup').get()).data()).toMatchObject({ status: 'Makstud', paidAmountCents: 18000 });

  const missing = page.getByRole('region', { name: /makse kirje puudub/ });
  await expect(missing).toContainText('KS-2026-901');
  await missing.locator('.payment-check__row', { hasText: 'KS-2026-901' }).getByRole('button', { name: 'Lisa makse kirje' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Arvele KS-2026-901 lisati makse kirje' })).toBeVisible();
  const legacyPayments = (await db.collection('payments').where('invoiceId', '==', 'e2e-check-legacy').get()).docs.map((doc) => doc.data());
  expect(legacyPayments).toEqual([expect.objectContaining({ amountCents: 6300, paidAt: '2026-06-19', status: 'active' })]);
  expect((await db.doc('invoices/e2e-check-legacy').get()).data()).toMatchObject({ status: 'Makstud', paidAmountCents: 6300 });
  await expect(page.locator('.payment-check__row', { hasText: 'KS-2026-901' })).toHaveCount(0);

  // LHV statement: the explanation names the invoice; the system picks it and the admin confirms
  await page.getByRole('button', { name: /Impordi LHV väljavõte/ }).click();
  const csv = '"Kliendi konto","Dokumendi number","Kuupäev","Saaja/maksja konto","Saaja/maksja nimi","Saaja panga kood","Tühi","Deebet/Kreedit (D/C)","Summa","Viitenumber","Arhiveerimistunnus","Selgitus","Teenustasu","Valuuta"\n'
    + '"EE127700771001234567","1","2026-10-03","EE382200221020145685","SMIRNOVA JEKATERINA","","","C","105.00","","2026100300099901","KS-2026-903 Kaarel","0.00","EUR"\n'
    + '"EE127700771001234567","2","2026-10-04","EE382200221020145685","Elektrilevi","","","D","-25.00","","2026100400099902","arve","0.00","EUR"\n';
  await page.locator('input[type=file]').setInputFiles({ name: 'lhv.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('SMIRNOVA JEKATERINA');
  await expect(dialog).not.toContainText('Elektrilevi');
  await dialog.getByRole('button', { name: /Seo valitud maksed/ }).click();
  await expect.poll(async () => (await db.doc('invoices/e2e-check-open').get()).data().status).toBe('Makstud');
  expect(problems).toEqual([]);
});
