// Scenario: the administrator watches a lesson going on now (docs/E2E_SCENARIOS.md). Real WebRTC in three browsers
// with fake cameras: teacher ↔ student call, the admin receives both, sends nothing; both sides see the badge.
const { test } = require('@playwright/test');
const { guard, login, expect } = require('./helpers.cjs');

const playing = (page, nth) => page.locator('.lo-tile video').nth(nth)
  .evaluate((video) => new Promise((resolve) => {
    const ok = () => video.videoWidth > 0 && video.srcObject?.getAudioTracks().length > 0;
    if (ok()) return resolve(true);
    const timer = setInterval(() => { if (ok()) { clearInterval(timer); resolve(true); } }, 200);
    setTimeout(() => { clearInterval(timer); resolve(false); }, 20000);
  }));

test('the admin opens a lesson going on now, sees and hears both, and both see that the admin is watching', async ({ browser }) => {
  test.setTimeout(180_000);
  const teacher = await (await browser.newContext()).newPage();
  const student = await (await browser.newContext()).newPage();
  const admin = await (await browser.newContext()).newPage();
  const problems = [...await guard(teacher), ...await guard(student), ...await guard(admin)];

  await login(teacher, 'teacher');
  await login(student, 'student');
  await teacher.goto('/live-classroom');
  await teacher.getByRole('combobox', { name: 'Õpilane' }).click();
  await teacher.getByRole('option', { name: /Anna Õpilane/ }).click();
  await teacher.getByRole('button', { name: /Kutsu õpilane tundi/ }).click();
  await student.getByRole('button', { name: 'Liitu tunniga' }).click();
  await teacher.getByRole('button', { name: /Alusta kõnet/ }).click();
  await expect(student.getByRole('button', { name: 'Lõpeta kõne' })).toBeVisible({ timeout: 30000 });

  // count camera / microphone requests on the admin's page: watching must never open them
  await admin.addInitScript(() => {
    window.__media = 0;
    const md = navigator.mediaDevices;
    if (md?.getUserMedia) { const original = md.getUserMedia.bind(md); md.getUserMedia = (...args) => { window.__media += 1; return original(...args); }; }
  });
  await login(admin, 'admin');
  await admin.goto('/live-classroom');
  await admin.getByRole('button', { name: /Käimasolevad tunnid \(1\)/ }).click();
  await admin.getByRole('link', { name: /Vaata tundi/ }).click();
  await expect(admin.getByText(/Vaatan tundi: Pavel Õpetaja · Anna Õpilane/)).toBeVisible();
  expect(await playing(admin, 0)).toBe(true);
  expect(await playing(admin, 1)).toBe(true);
  await expect(teacher.getByRole('img', { name: 'Administraator vaatab tundi' })).toBeVisible();
  await expect(student.getByRole('status').filter({ hasText: 'Administraator vaatab tundi' })).toBeVisible();
  await expect(student.getByRole('img', { name: 'Administraator vaatab tundi' })).toBeVisible();
  expect(await admin.evaluate(() => window.__media)).toBe(0);
  await admin.screenshot({ path: 'test-results/observer-admin.png' });
  await teacher.screenshot({ path: 'test-results/observer-teacher.png' });

  await admin.getByRole('button', { name: 'Lõpeta vaatlemine' }).click();
  await expect(teacher.getByRole('img', { name: 'Administraator vaatab tundi' })).toHaveCount(0, { timeout: 20000 });
  await expect(student.getByRole('img', { name: 'Administraator vaatab tundi' })).toHaveCount(0);
  // the 1:1 call goes on
  await expect(student.getByRole('button', { name: 'Lõpeta kõne' })).toBeVisible();
  expect(problems).toEqual([]);
});
