const { expect } = require('@playwright/test');
const { PASSWORD, PEOPLE } = require('../fixtures.cjs');

// every scenario fails if the page tries to reach production or prints a crash
async function guard(page) {
  const problems = [];
  // by host: the emulators' own URLs carry „identitytoolkit.googleapis.com” in their path
  const PRODUCTION = /(^|\.)(cloudfunctions\.net|googleapis\.com|firebaseio\.com|firebasestorage\.app)$/;
  await page.route((url) => PRODUCTION.test(url.hostname) && !/^fonts\./.test(url.hostname), (route) => {
    problems.push(`production request blocked: ${route.request().url().replace(/\?.*$/, '')}`);
    return route.abort();
  });
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`));
  return problems;
}

const STAFF = ['admin', 'teacher'];
const whatsNewKey = (uid) => `keelesepp.whatsNew.seen.${uid}`;

// Staff see the „what's new” notice once per browser after signing in (WhatsNewDialog); it covers the page until
// „Selge”, so a staff login reads it and closes it, as a person would.
async function closeWhatsNew(page) {
  const notice = page.getByRole('dialog').filter({ has: page.getByRole('button', { name: 'Selge' }) });
  await expect(notice).toBeVisible();
  await notice.getByRole('button', { name: 'Selge' }).click();
  await expect(notice).toHaveCount(0);
}

// A student or parent whose card lacks what the school asks for meets „Puuduvad andmed” instead of the CRM. Fill it
// as a learner would: the first class option (or „Täiskasvanu”), Estonian, weekday evenings.
async function fillMissingData(page) {
  const gate = page.getByRole('dialog', { name: /puuduvad andmed/ });
  await expect(gate).toBeVisible();
  const grade = gate.getByRole('combobox');
  if (await grade.count()) await grade.first().selectOption({ index: 1 });
  for (const radio of await gate.getByRole('radio', { name: 'Eesti keel' }).all()) await radio.check();
  for (const button of await gate.getByRole('button', { name: /Tööpäeva õhtud/ }).all()) await button.click();
  await gate.getByRole('button', { name: /Salvesta/ }).first().click();
  await expect(gate).toHaveCount(0);
}

// options.fillMissingData: the person is new and fills „Puuduvad andmed” at the door; otherwise that form means the
// scenario forgot completeCardData() for its cards, and the login fails saying so.
async function login(page, who, options = {}) {
  const person = typeof who === 'string' ? PEOPLE[who] : who;
  await page.goto('/login');
  // the saved session is restored asynchronously: wait until the page settles on the login form or the app
  const form = page.getByLabel('E-post');
  const signOut = page.getByRole('button', { name: 'Logi välja' }).first();
  await expect(form.or(signOut)).toBeVisible();
  await page.waitForTimeout(800);
  if (await signOut.isVisible().catch(() => false)) {
    // sign out by dropping the saved session (a first-login dialog may cover the button)
    await page.evaluate(() => new Promise((resolve) => { const r = indexedDB.deleteDatabase('firebaseLocalStorageDb'); r.onsuccess = r.onerror = r.onblocked = () => resolve(); }));
    await page.context().clearCookies();
    await page.goto('/login');
    await expect(form).toBeVisible();
  }
  // the notice is due when this browser has not closed it for this staff member yet
  const noticeDue = STAFF.includes(person.role) && !(await page.evaluate((key) => { try { return localStorage.getItem(key); } catch { return null; } }, whatsNewKey(person.uid)));
  await page.getByLabel('E-post').fill(person.email);
  await page.getByLabel('Parool').fill(PASSWORD);
  await page.getByRole('button', { name: 'Logi sisse' }).click();
  await expect(page).not.toHaveURL(/\/login/);
  // the app settles (home redirect, profile, first data) before the scenario goes on
  const nav = page.getByRole('navigation').first();
  const gate = page.getByRole('dialog', { name: /puuduvad andmed/ });
  await expect(nav.or(gate)).toBeVisible();
  if (await gate.isVisible().catch(() => false)) {
    if (!options.fillMissingData) throw new Error(`${person.email} met „Puuduvad andmed”: call completeCardData() for the cards, or log in with { fillMissingData: true }`);
    await fillMissingData(page);
  }
  await expect(nav).toBeVisible();
  if (noticeDue) await closeWhatsNew(page);
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  return person;
}

// The cards of a scenario that is not about „Puuduvad andmed” get what the school asks for at the door (class or
// adult, language, suitable times), so after login the person reaches the CRM as an existing learner with a complete
// card would. The gate itself is exercised in homework-phone.spec.cjs, which fills it for the seeded Anna card.
async function completeCardData(...cards) {
  const path = require('path');
  const admin = require(path.join(__dirname, '../../functions/node_modules/firebase-admin'));
  const { PROJECT } = require('../fixtures.cjs');
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT });
  const db = admin.firestore();
  const now = new Date().toISOString();
  for (const card of cards) {
    const adult = !card.grade;
    await db.doc(`students/${card.id}`).set({ preferredLanguage: 'et', ...(adult ? { grade: 'Täiskasvanu' } : {}), updatedAt: now }, { merge: true });
    await db.doc(`studentAvailability/${card.id}`).set({ studentId: card.id, slots: ['Mon-17:00', 'Mon-17:30'], preferred: [], changedAt: now }, { merge: true });
  }
}

module.exports = { guard, login, expect, completeCardData, closeWhatsNew, fillMissingData };
