// Scenario: „Lisa lapsevanem” (docs/E2E_SCENARIOS.md). The admin creates a parent's login on the Lapsevanemad page and
// links it to the child's card; the parent sets the password from the e-mail link and sees the child.
const path = require('path');
const { test } = require('@playwright/test');
const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
const { guard, login, expect } = require('./helpers.cjs');
const { PROJECT, PASSWORD, PEOPLE } = require('../fixtures.cjs');

function adminSdk() { if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT }); return admin; }
const EMAIL = 'tiina.vanem@e2e.test';
const CARD = { id: 'e2e-card-toomas', name: 'Toomas Laps', grade: '4. klass', parentName: 'Tiina Vanem', parentEmail: EMAIL, teacher: 'Pavel Õpetaja', teacherUid: PEOPLE.teacher.uid, teacherUids: [PEOPLE.teacher.uid], subject: 'Eesti keel', level: 'A1', active: true };

test('the admin creates a parent login for a child; the parent sets a password and sees the child', async ({ browser }) => {
  const db = adminSdk().firestore();
  const { id, ...card } = CARD;
  await db.doc(`students/${id}`).set(card);
  const adminPage = await (await browser.newContext()).newPage();
  const parentPage = await (await browser.newContext()).newPage();
  const problems = [...await guard(adminPage), ...await guard(parentPage)];
  try {
    await login(adminPage, 'admin');
    await adminPage.goto('/parents');
    await adminPage.getByRole('button', { name: /Lisa lapsevanem/ }).click();
    const dialog = adminPage.getByRole('dialog');
    await dialog.getByLabel('Otsi last').fill('Toomas');
    await dialog.getByRole('button', { name: /\+ Toomas Laps/ }).click();
    await expect(dialog.getByLabel('Lapsevanema nimi')).toHaveValue('Tiina Vanem');
    await expect(dialog.getByLabel('E-post (kasutajanimi)')).toHaveValue(EMAIL);
    // a staff login is never made a parent
    await dialog.getByLabel('E-post (kasutajanimi)').fill(PEOPLE.teacher.email);
    await dialog.getByRole('button', { name: /Loo ja saada kutse/ }).click();
    await expect(dialog.getByRole('alert')).toContainText('töötaja konto');
    await dialog.getByLabel('E-post (kasutajanimi)').fill(EMAIL);
    await dialog.getByRole('button', { name: /Loo ja saada kutse/ }).click();
    await expect(dialog.getByRole('status')).toContainText(`Konto loodud: ${EMAIL}`);
    await dialog.getByRole('button', { name: 'Valmis' }).click();
    await expect(adminPage.getByRole('heading', { name: 'Tiina Vanem' })).toBeVisible();

    const user = await adminSdk().auth().getUserByEmail(EMAIL);
    expect((await db.doc(`students/${id}`).get()).data()).toMatchObject({ parentUid: user.uid, linkedParentIds: [user.uid] });
    expect((await db.doc(`users/${user.uid}`).get()).data()).toMatchObject({ role: 'parent', approvalStatus: 'approved', linkedStudentIds: [id] });

    const mail = (await db.collection('emailQueue').where('to', '==', EMAIL).get()).docs[0].data();
    expect(mail.text).toContain('Lapsed: Toomas Laps');
    const oobCode = new URL(mail.text.match(/https?:\/\/\S*oobCode=[^\s&]+\S*/)[0]).searchParams.get('oobCode');
    const reset = await fetch('http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=demo-key', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oobCode, newPassword: PASSWORD }),
    });
    expect(reset.ok).toBe(true);
    await login(parentPage, { email: EMAIL });
    await expect(parentPage.getByText('Toomas Laps').first()).toBeVisible();
    expect(problems).toEqual([]);
  } finally {
    const user = await adminSdk().auth().getUserByEmail(EMAIL).catch(() => null);
    if (user) { await adminSdk().auth().deleteUser(user.uid); await db.doc(`users/${user.uid}`).delete(); }
    await db.doc(`students/${id}`).delete();
  }
});
