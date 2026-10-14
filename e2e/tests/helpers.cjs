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

async function login(page, who) {
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
  await page.getByLabel('E-post').fill(person.email);
  await page.getByLabel('Parool').fill(PASSWORD);
  await page.getByRole('button', { name: 'Logi sisse' }).click();
  await expect(page).not.toHaveURL(/\/login/);
  // the app settles (home redirect, profile, first data) before the scenario goes on
  await expect(page.getByRole('navigation').first()).toBeVisible();
  await page.waitForLoadState('networkidle').catch(() => {});
  return person;
}

module.exports = { guard, login, expect };
